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
from app.services.history_service import save_run_history, get_run_history, get_run_details, delete_run_history
from app.utils.auth import get_user_id, get_user_id_and_tokens, AuthTokens
import base64
import tempfile
import shutil
from pathlib import Path
from app.services.email_service import send_task_completion_email

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://ai.digestafrica.com",
    "https://ai-dashboard-zikm5.ondigitalocean.app"
    
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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Digest AI API"}


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
        logging.info(f"Browser session created: {response.json()}")
        return response.json()
    except Exception as e:
        logging.error(f"Failed to create browser session: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to create browser session")

# Initialize the browser with session management


def get_browser():
    """Get a configured browser instance with session management."""
    try:
        session_data = create_browser_session()
        session_id = session_data["id"]

        return Browser(
            config=BrowserConfig(
                cdp_url=f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}&sessionId={session_id}",
            )
        )
    except Exception as e:
        logging.error(f"Failed to initialize browser: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to initialize browser")


class BrowserTask(BaseModel):
    task: str
    model: str = "gpt-4o-mini"  # default model
    sensitive_data: Optional[Dict[str, str]] = None
    email: Optional[str] = None  # Add email field


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
    try:
        user_id, tokens = await get_user_id_and_tokens(request)
        result = await get_run_details(user_id, history_id, auth_tokens=tokens)

        if not result:
            raise HTTPException(
                status_code=404, detail="History entry not found")

        # Log GIF content details for debugging
        if result.get('gif_content'):
            logging.info(
                f"GIF content found for history ID {history_id}, length: {len(result['gif_content'])}")
        else:
            logging.warning(
                f"No GIF content found for history ID {history_id}")

        return result
    except Exception as e:
        logging.error(f"Error fetching history detail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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
                logging.info(
                    f"Successfully created GIF with size: {len(gif_content)}")
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


async def stream_agent_progress(agent: Agent, task: str, user_id: str, auth_tokens: AuthTokens, browser_task: BrowserTask):
    """Stream the agent's progress as JSON events and save history."""
    progress_events = []
    final_result = None
    error_message = None
    gif_content = None
    history_saved = False
    run_id = str(uuid.uuid4())

    try:
        # Start event
        start_event = {"type": "start", "message": f"Starting task: {task}"}
        progress_events.append(start_event)
        yield json.dumps(start_event) + "\n"

        # Send run ID event
        run_id_event = {"type": "run_id", "message": run_id}
        progress_events.append(run_id_event)
        yield json.dumps(run_id_event) + "\n"

        # Run the agent in a separate task with optimized max_steps
        agent_task = asyncio.create_task(
            agent.run(max_steps=30))

        # Track previous state to detect changes
        prev_state = {
            "urls": [],
            "actions": [],
            "thoughts": [],
            "errors": [],
            "results": [],
            "content": []
        }

        # Poll for updates while the agent is running with reduced frequency
        while not agent_task.done():
            # Batch process all updates
            updates = {
                "urls": agent.history.urls(),
                "actions": agent.history.action_names(),
                "thoughts": agent.history.model_thoughts(),
                "errors": agent.history.errors(),
                "results": agent.history.action_results(),
                "content": agent.history.extracted_content()
            }

            # Process all updates in a single pass
            for key, current_items in updates.items():
                new_items = current_items[len(prev_state[key]):]
                if new_items:
                    for item in new_items:
                        event = {
                            "type": key[:-1],  # Remove 's' from plural
                            "message": f"{key.title()}: {safe_serialize(item)}"
                        }
                        progress_events.append(event)
                        yield json.dumps(event) + "\n"
                    prev_state[key] = current_items

            # Increased sleep interval to reduce CPU usage while maintaining responsiveness
            await asyncio.sleep(0.1)  # Increased from 0.1

        # Get the agent's history after completion
        history = await agent_task

        # Create summary sections
        try:
            # URLs section
            if history.urls():
                url_section = {
                    "type": "section",
                    "title": "URLs Visited",
                    "items": [safe_serialize(url) for url in history.urls()]
                }
                progress_events.append(url_section)
                yield json.dumps(url_section) + "\n"

            # Actions section
            if history.action_names():
                action_section = {
                    "type": "section",
                    "title": "Actions Taken",
                    "items": [safe_serialize(action) for action in history.action_names()]
                }
                progress_events.append(action_section)
                yield json.dumps(action_section) + "\n"

            # Thoughts section
            if history.model_thoughts():
                thought_section = {
                    "type": "section",
                    "title": "Agent Reasoning",
                    "items": [safe_serialize(thought) for thought in history.model_thoughts()]
                }
                progress_events.append(thought_section)
                yield json.dumps(thought_section) + "\n"

            # Extracted content section
            if history.extracted_content():
                content_section = {
                    "type": "section",
                    "title": "Extracted Content",
                    "items": [safe_serialize(item) for item in history.extracted_content()]
                }
                progress_events.append(content_section)
                yield json.dumps(content_section) + "\n"

            # Results section
            if history.action_results():
                result_section = {
                    "type": "section",
                    "title": "Action Results",
                    "items": [safe_serialize(result) for result in history.action_results()]
                }
                progress_events.append(result_section)
                yield json.dumps(result_section) + "\n"

            # Create GIF from history
            gif_content = await create_gif_from_history(agent, run_id)
            if gif_content:
                gif_event = {
                    "type": "gif",
                    "message": "Task recording created"
                }
                progress_events.append(gif_event)
                yield json.dumps(gif_event) + "\n"

            # Get final result
            final_result = history.final_result()
            is_done = history.is_done()

            complete_event = {
                "type": "complete",
                "message": safe_serialize(final_result),
                "success": bool(is_done)
            }
            progress_events.append(complete_event)
            yield json.dumps(complete_event) + "\n"

            # Save the complete run history and send email notification
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

                # Send email notification if email is provided
                if browser_task.email:
                    await send_task_completion_email(
                        recipient_email=browser_task.email,
                        task=task,
                        result=final_result,
                        error=error_message
                    )

        except Exception as e:
            error_message = f"Error processing results: {str(e)}"
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
            #browser=browser,
            llm=ChatOpenAI(
                model=browser_task.model,
                temperature=0.7
            ),
            sensitive_data=browser_task.sensitive_data or {},
        )

        return StreamingResponse(
            stream_agent_progress(agent, browser_task.task,
                                  user_id, tokens, browser_task),
            media_type="text/event-stream"
        )

    except Exception as e:
        # Save failed run and send email notification
        await save_run_history(
            user_id=user_id,
            task=browser_task.task,
            progress_events=[{"type": "error", "message": str(e)}],
            error=str(e),
            auth_tokens=tokens
        )

        if browser_task.email:
            await send_task_completion_email(
                recipient_email=browser_task.email,
                task=browser_task.task,
                error=str(e)
            )

        raise HTTPException(status_code=500, detail=str(e))