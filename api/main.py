from fastapi import FastAPI, HTTPException
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
import time

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

# Mount static files directory
app.mount("/static", StaticFiles(directory="."), name="static")

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

def safe_serialize(obj):
    """Safely serialize objects to JSON string."""
    if hasattr(obj, '__dict__'):
        return str(obj)
    return str(obj)

async def stream_agent_progress(agent: Agent):
    """Stream the agent's progress as JSON events."""
    try:
        # Start event
        yield json.dumps({"type": "start", "message": f"Starting task: {agent.task}"}) + "\n"

        # Run the agent and get history
        history = await agent.run()

        # Stream URLs visited
        try:
            urls = history.urls()
            if urls:
                yield json.dumps({
                    "type": "section",
                    "title": "URLs Visited",
                    "items": [safe_serialize(url) for url in urls]
                }) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming URLs: {e}")

        # Stream actions taken
        try:
            actions = history.action_names()
            if actions:
                yield json.dumps({
                    "type": "section",
                    "title": "Actions Taken",
                    "items": [safe_serialize(action) for action in actions]
                }) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming actions: {e}")

        # Stream model thoughts
        try:
            thoughts = history.model_thoughts()
            if thoughts:
                yield json.dumps({
                    "type": "section",
                    "title": "Agent Reasoning",
                    "items": [safe_serialize(thought) for thought in thoughts]
                }) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming thoughts: {e}")

        # Stream extracted content
        try:
            content = history.extracted_content()
            if content:
                yield json.dumps({
                    "type": "section",
                    "title": "Extracted Content",
                    "items": [safe_serialize(item) for item in content]
                }) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming extracted content: {e}")

        # Stream action results
        try:
            results = history.action_results()
            if results:
                yield json.dumps({
                    "type": "section",
                    "title": "Action Results",
                    "items": [safe_serialize(result) for result in results]
                }) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming action results: {e}")

        # Check for any errors
        try:
            if history.has_errors():
                errors = history.errors()
                yield json.dumps({
                    "type": "section",
                    "title": "Errors",
                    "items": [safe_serialize(error) for error in errors]
                }) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming errors: {e}")

        # Send GIF path if available
        try:
            # This is the default path where browser-use saves the GIF
            gif_path = "agent_history.gif"
            if os.path.exists(gif_path):
                # Add timestamp to prevent caching
                timestamp = int(time.time())
                yield json.dumps({
                    "type": "gif",
                    "message": f"/static/{gif_path}?t={timestamp}"
                }) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming GIF path: {e}")

        # Final result
        try:
            final_result = history.final_result()
            is_done = history.is_done()

            yield json.dumps({
                "type": "complete",
                "message": safe_serialize(final_result),
                "success": bool(is_done)
            }) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming final result: {e}")
            yield json.dumps({
                "type": "error",
                "message": f"Error getting final result: {str(e)}"
            }) + "\n"

    except Exception as e:
        logging.error(f"Stream error: {e}")
        yield json.dumps({"type": "error", "message": str(e)}) + "\n"

@app.post("/api/browse")
async def browse(browser_task: BrowserTask):
    try:
        # Get a new browser instance for each request
        browser = get_browser()
        
        agent = Agent(
            task=browser_task.task,
            llm=ChatOpenAI(model=browser_task.model),
            browser=browser,
        )
        return StreamingResponse(
            stream_agent_progress(agent),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
