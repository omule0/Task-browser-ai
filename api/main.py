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

hosted_browser = Browser(
    config=BrowserConfig(
        cdp_url=f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}"
    )
)


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

        # Stream agent progress events
        try:
            for url in history.urls():
                yield json.dumps({"type": "url", "message": safe_serialize(url)}) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming URLs: {e}")

        try:
            for action in history.action_names():
                yield json.dumps({"type": "action", "message": safe_serialize(action)}) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming actions: {e}")

        try:
            for thought in history.model_thoughts():
                yield json.dumps({"type": "thought", "message": safe_serialize(thought)}) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming thoughts: {e}")

        # Check for any errors
        try:
            if history.has_errors():
                for error in history.errors():
                    yield json.dumps({"type": "error", "message": safe_serialize(error)}) + "\n"
        except Exception as e:
            logging.warning(f"Error streaming errors: {e}")

        # Send GIF path if available
        try:
            # This is the default path where browser-use saves the GIF
            gif_path = "agent_history.gif"
            if os.path.exists(gif_path):
                yield json.dumps({
                    "type": "gif",
                    "message": f"/static/{gif_path}"
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
        agent = Agent(
            task=browser_task.task,
            llm=ChatOpenAI(model=browser_task.model),
            browser=hosted_browser,
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
