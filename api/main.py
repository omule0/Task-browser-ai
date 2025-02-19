from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
import asyncio
from dotenv import load_dotenv
import os
import json
import logging
import requests
import uuid
from typing import Dict, Optional, List
from services.history_service import save_run_history, get_run_history, get_run_details, delete_run_history
from utils.auth import get_user_id, get_user_id_and_tokens, AuthTokens
import base64
import tempfile
import shutil
from pathlib import Path

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

origins = [
    "http://localhost:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="."), name="static")

# Initialize browser configuration
ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")

# Add this after the app initialization
TEMP_DIR = Path("/tmp/digest_ai_gifs")  # Use absolute path in container
TEMP_DIR.mkdir(parents=True, exist_ok=True)
os.chmod(TEMP_DIR, 0o777)  # Ensure directory is writable

# Browser configuration settings
browser_configuration = {
    "adblock_config": {"active": True},
    "captcha_config": {"active": True},
    "proxy_config": {"active": True},
}

def create_browser_session():
    """Create a new browser session with Anchor Browser."""
    try:
        response = requests.post(
            "https://api.anchorbrowser.io/api/sessions",
            headers={
                "anchor-api-key": ANCHOR_API_KEY,
                "Content-Type": "application/json",
            },
            json=browser_configuration,
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logging.error(f"Failed to create browser session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create browser session")

# Initialize the browser with session management
def get_browser():
    """Get a configured browser instance with session management."""
    try:
        session_data = create_browser_session()
        session_id = session_data["id"]
        
        return Browser(
            config=BrowserConfig(
                cdp_url=f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}&sessionId={session_id}"
            )
        )
    except Exception as e:
        logging.error(f"Failed to initialize browser: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize browser")

class BrowserTask(BaseModel):
    task: str
    model: str = "gpt-4o-mini"  # default model
    sensitive_data: Optional[Dict[str, str]] = None

class HistoryResponse(BaseModel):
    id: str
    task: str
    result: Optional[str]
    error: Optional[str]
    created_at: str
    progress: List[Dict]

def safe_serialize(obj):
    """Safely serialize objects to JSON string."""
    if hasattr(obj, '__dict__'):
        return str(obj)
    return str(obj)

@app.get("/api/history")
async def get_history(request: Request, limit: int = 10, offset: int = 0):
    """Get run history with pagination."""
    user_id, tokens = await get_user_id_and_tokens(request)
    return await get_run_history(user_id, limit, offset, auth_tokens=tokens)

@app.get("/api/history/{history_id}")
async def get_history_detail(request: Request, history_id: str):
    """Get detailed run information including GIF."""
    user_id, tokens = await get_user_id_and_tokens(request)
    result = await get_run_details(user_id, history_id, auth_tokens=tokens)
    if not result:
        raise HTTPException(status_code=404, detail="History entry not found")
    return result

@app.delete("/api/history/{history_id}")
async def delete_history(request: Request, history_id: str):
    """Delete a run history entry."""
    user_id, tokens = await get_user_id_and_tokens(request)
    success = await delete_run_history(user_id, history_id, auth_tokens=tokens)
    if not success:
        raise HTTPException(status_code=404, detail="History entry not found")
    return {"status": "success"}

async def create_gif_from_history(agent: Agent, run_id: str) -> Optional[str]:
    """Create GIF from agent history with proper error handling."""
    temp_gif_path = TEMP_DIR / f"agent_history_{run_id}.gif"
    try:
        # Ensure the directory exists and is writable
        TEMP_DIR.mkdir(parents=True, exist_ok=True)
        
        logging.info(f"Creating GIF at path: {temp_gif_path}")
        agent.create_history_gif(output_path=str(temp_gif_path))
        
        if temp_gif_path.exists():
            with open(temp_gif_path, 'rb') as gif_file:
                gif_content = base64.b64encode(gif_file.read()).decode('utf-8')
                logging.info(f"Successfully created GIF with size: {len(gif_content)}")
                return gif_content
        else:
            logging.warning(f"GIF file was not created at {temp_gif_path}")
            return None
    except Exception as e:
        logging.error(f"Error creating GIF: {str(e)}")
        return None
    finally:
        try:
            if temp_gif_path.exists():
                temp_gif_path.unlink()
                logging.info(f"Cleaned up temporary GIF file: {temp_gif_path}")
        except Exception as e:
            logging.warning(f"Error cleaning up GIF file: {str(e)}")

async def stream_agent_progress(agent: Agent, task: str, user_id: str, auth_tokens: AuthTokens):
    """Stream the agent's progress as JSON events and save history."""
    progress_events = []
    final_result = None
    error_message = None
    gif_content = None
    history_saved = False
    run_id = str(uuid.uuid4())  # Generate run ID at the start

    try:
        # Start event
        start_event = {"type": "start", "message": f"Starting task: {task}"}
        progress_events.append(start_event)
        yield json.dumps(start_event) + "\n"

        # Send run ID event
        run_id_event = {"type": "run_id", "message": run_id}
        progress_events.append(run_id_event)
        yield json.dumps(run_id_event) + "\n"

        # Run the agent and get history
        history = await agent.run()

        # Create GIF after agent run completes
        gif_content = await create_gif_from_history(agent, run_id)
        if gif_content:
            progress_events.append({"type": "gif", "message": "GIF recording saved"})
            yield json.dumps({"type": "gif", "message": "GIF recording saved"}) + "\n"
        
        # Stream URLs visited
        try:
            urls = history.urls()
            if urls:
                url_event = {
                    "type": "section",
                    "title": "URLs Visited",
                    "items": [safe_serialize(url) for url in urls]
                }
                progress_events.append(url_event)
                yield json.dumps(url_event) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming URLs: {e}")

        # Stream actions taken
        try:
            actions = history.action_names()
            if actions:
                action_event = {
                    "type": "section",
                    "title": "Actions Taken",
                    "items": [safe_serialize(action) for action in actions]
                }
                progress_events.append(action_event)
                yield json.dumps(action_event) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming actions: {e}")

        # Stream model thoughts
        try:
            thoughts = history.model_thoughts()
            if thoughts:
                thought_event = {
                    "type": "section",
                    "title": "Agent Reasoning",
                    "items": [safe_serialize(thought) for thought in thoughts]
                }
                progress_events.append(thought_event)
                yield json.dumps(thought_event) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming thoughts: {e}")

        # Stream extracted content
        try:
            content = history.extracted_content()
            if content:
                content_event = {
                    "type": "section",
                    "title": "Extracted Content",
                    "items": [safe_serialize(item) for item in content]
                }
                progress_events.append(content_event)
                yield json.dumps(content_event) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming extracted content: {e}")

        # Stream action results
        try:
            results = history.action_results()
            if results:
                result_event = {
                    "type": "section",
                    "title": "Action Results",
                    "items": [safe_serialize(result) for result in results]
                }
                progress_events.append(result_event)
                yield json.dumps(result_event) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming action results: {e}")

        # Check for any errors
        try:
            if history.has_errors():
                errors = history.errors()
                error_event = {
                    "type": "section",
                    "title": "Errors",
                    "items": [safe_serialize(error) for error in errors]
                }
                progress_events.append(error_event)
                yield json.dumps(error_event) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming errors: {e}")

        # Get final result
        try:
            final_result = history.final_result()
            is_done = history.is_done()

            complete_event = {
                "type": "complete",
                "message": safe_serialize(final_result),
                "success": bool(is_done)
            }
            progress_events.append(complete_event)
            yield json.dumps(complete_event) + "\n"

            # Save the complete run history
            if not history_saved:
                history_id = await save_run_history(
                    user_id=user_id,
                    task=task,
                    progress_events=progress_events,
                    result=final_result,
                    error=error_message,
                    gif_content=gif_content,
                    auth_tokens=auth_tokens,
                    run_id=run_id
                )
                history_saved = True

        except Exception as e:
            error_message = f"Error getting final result: {str(e)}"
            error_event = {
                "type": "error",
                "message": error_message
            }
            progress_events.append(error_event)
            yield json.dumps(error_event) + "\n"

    except Exception as e:
        error_message = f"Error: {str(e)}"
        error_event = {
            "type": "error",
            "message": error_message
        }
        progress_events.append(error_event)
        yield json.dumps(error_event) + "\n"
        
        # Save failed run if not already saved
        if not history_saved:
            await save_run_history(
                user_id=user_id,
                task=task,
                progress_events=progress_events,
                error=error_message,
                auth_tokens=auth_tokens,
                run_id=run_id
            )
            history_saved = True

@app.post("/api/browse")
async def browse(request: Request, browser_task: BrowserTask):
    """Handle browser automation task with authentication."""
    user_id, tokens = await get_user_id_and_tokens(request)
    
    try:
        browser = get_browser()
        agent = Agent(
            task=browser_task.task,
            browser=browser, #only uncomment when in production
            llm=ChatOpenAI(
                model=browser_task.model,
            ),
            sensitive_data=browser_task.sensitive_data or {},
        )

        return StreamingResponse(
            stream_agent_progress(agent, browser_task.task, user_id, tokens),
            media_type="text/event-stream"
        )

    except Exception as e:
        # Save failed run
        await save_run_history(
            user_id=user_id,
            task=browser_task.task,
            progress_events=[{"type": "error", "message": str(e)}],
            error=str(e),
            auth_tokens=tokens
        )
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)