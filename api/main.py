from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import HTTPException
from pathlib import Path
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
from services.history_service import save_run_history, get_run_history, get_run_details

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory if it doesn't exist
STATIC_DIR = Path("static")
STATIC_DIR.mkdir(exist_ok=True)

# Mount static files with proper configuration
app.mount(
    "/static",
    StaticFiles(
        directory=str(STATIC_DIR),
        check_dir=True,  # Verify directory exists
        html=False,  # Don't serve HTML files for security
    ),
    name="static"
)

# Add a custom exception handler for static files
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: HTTPException):
    if request.url.path.startswith("/static/"):
        return JSONResponse(
            status_code=404,
            content={"detail": "Static file not found"}
        )
    raise exc  # Re-raise for non-static 404s

# Helper function to safely serve static files
async def serve_static_file(filepath: str):
    file_path = STATIC_DIR / filepath
    if not file_path.is_file() or not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        path=file_path,
        headers={
            "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
            "Accept-Ranges": "bytes"
        }
    )

# Initialize browser configuration
ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")


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
async def get_history(limit: int = 10, offset: int = 0):
    """Get run history with pagination."""
    return await get_run_history(limit, offset)

@app.get("/api/history/{history_id}")
async def get_history_detail(history_id: str):
    """Get detailed run information including GIF."""
    result = await get_run_details(history_id)
    if not result:
        raise HTTPException(status_code=404, detail="History entry not found")
    return result

async def stream_agent_progress(agent: Agent, task: str):
    """Stream the agent's progress as JSON events and save history."""
    progress_events = []
    final_result = None
    error_message = None
    gif_path = None

    try:
        # Start event
        start_event = {"type": "start", "message": f"Starting task: {task}"}
        progress_events.append(start_event)
        yield json.dumps(start_event) + "\n"

        # Run the agent and get history
        history = await agent.run()

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

        # Check for GIF
        gif_path = "agent_history.gif"
        if os.path.exists(gif_path):
            # Move the GIF to static directory
            static_gif_path = STATIC_DIR / f"gifs/{str(uuid.uuid4())}.gif"
            static_gif_path.parent.mkdir(exist_ok=True)
            os.rename(gif_path, static_gif_path)
            
            gif_event = {
                "type": "gif",
                "message": f"/static/gifs/{static_gif_path.name}"
            }
            progress_events.append(gif_event)
            yield json.dumps(gif_event) + "\n"

        # Final result
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

        except Exception as e:
            error_message = f"Error getting final result: {str(e)}"
            error_event = {
                "type": "error",
                "message": error_message
            }
            progress_events.append(error_event)
            yield json.dumps(error_event) + "\n"

    except Exception as e:
        error_message = str(e)
        error_event = {"type": "error", "message": error_message}
        progress_events.append(error_event)
        yield json.dumps(error_event) + "\n"
    
    finally:
        # Save run history
        await save_run_history(
            task=task,
            result=final_result,
            progress=progress_events,
            gif_path=gif_path if os.path.exists(gif_path or "") else None,
            error=error_message
        )

@app.post("/api/browse")
async def browse(browser_task: BrowserTask):
    try:
        browser = get_browser()
        
        agent = Agent(
            task=browser_task.task,
            llm=ChatOpenAI(model=browser_task.model),
            browser=browser,
            sensitive_data=browser_task.sensitive_data or {}
        )
        
        return StreamingResponse(
            stream_agent_progress(agent, browser_task.task),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
