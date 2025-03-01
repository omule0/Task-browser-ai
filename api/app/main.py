from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
import asyncio
from dotenv import load_dotenv
import os
import json
import logging
import requests
import uuid
from typing import Dict, Optional, List, Any, Set
from app.services.history_service import save_run_history, get_run_history, get_run_details, delete_run_history
from app.utils.auth import get_user_id, get_user_id_and_tokens, AuthTokens
import base64
import tempfile
import shutil
from pathlib import Path
from functools import lru_cache
import orjson  # Faster JSON serialization/deserialization
import time
import io
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

# Configure logging with more efficient settings
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Thread pool for concurrent operations
thread_pool = ThreadPoolExecutor(max_workers=4)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://ai.digestafrica.com",
    "https://ai-dashboard-zikm5.ondigitalocean.app"
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="."), name="static")

# Initialize browser configuration
ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")

# Create temporary directory with improved efficiency
TEMP_DIR = Path("/tmp/digest_ai_gifs")
TEMP_DIR.mkdir(parents=True, exist_ok=True)
os.chmod(TEMP_DIR, 0o777)

# Browser configuration settings
browser_configuration = {
    "adblock_config": {"active": True},
    "captcha_config": {"active": True},
    "proxy_config": {"active": True},
}

# Memory-efficient response cache with TTL
RESPONSE_CACHE = {}
CACHE_TTL = 300  # 5 minutes
MAX_CACHE_ITEMS = 100

# Cache invalidation function


def clean_cache():
    """Remove expired cache items"""
    if not RESPONSE_CACHE:
        return

    current_time = time.time()
    expired_keys = [k for k, v in RESPONSE_CACHE.items()
                    if current_time - v['timestamp'] > CACHE_TTL]

    for key in expired_keys:
        del RESPONSE_CACHE[key]

    # If cache is too large, remove oldest items
    if len(RESPONSE_CACHE) > MAX_CACHE_ITEMS:
        sorted_items = sorted(RESPONSE_CACHE.items(),
                              key=lambda x: x[1]['timestamp'])
        for k, _ in sorted_items[:len(RESPONSE_CACHE) - MAX_CACHE_ITEMS]:
            del RESPONSE_CACHE[k]


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
        return response.json()
    except Exception as e:
        logging.error(f"Failed to create browser session: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to create browser session")


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


class HistoryResponse(BaseModel):
    id: str
    task: str
    result: Optional[str]
    error: Optional[str]
    created_at: str
    progress: List[Dict]


def safe_serialize(obj: Any) -> str:
    """Efficiently serialize objects to string with performance optimizations."""
    if obj is None:
        return ""

    if hasattr(obj, '__dict__'):
        try:
            # Try to serialize with orjson first for better performance
            return str(obj)
        except (TypeError, OverflowError):
            return str(obj)

    return str(obj)


@app.get("/api/history")
async def get_history(request: Request, limit: int = 10, offset: int = 0):
    """Get run history with pagination and caching."""
    cache_key = f"history_{limit}_{offset}"

    # Check cache first
    if cache_key in RESPONSE_CACHE:
        cache_entry = RESPONSE_CACHE[cache_key]
        # If cache is still valid
        if time.time() - cache_entry['timestamp'] < CACHE_TTL:
            return cache_entry['data']

    # Cache miss, get data from source
    user_id, tokens = await get_user_id_and_tokens(request)
    result = await get_run_history(user_id, limit, offset, auth_tokens=tokens)

    # Update cache
    RESPONSE_CACHE[cache_key] = {
        'data': result,
        'timestamp': time.time()
    }

    # Clean cache in background
    clean_cache()

    return result


@app.get("/api/history/{history_id}")
async def get_history_detail(request: Request, history_id: str):
    """Get detailed run information including GIF with caching."""
    cache_key = f"history_detail_{history_id}"

    # Check cache first
    if cache_key in RESPONSE_CACHE:
        cache_entry = RESPONSE_CACHE[cache_key]
        # If cache is still valid
        if time.time() - cache_entry['timestamp'] < CACHE_TTL:
            return cache_entry['data']

    try:
        user_id, tokens = await get_user_id_and_tokens(request)
        result = await get_run_details(user_id, history_id, auth_tokens=tokens)

        if not result:
            raise HTTPException(
                status_code=404, detail="History entry not found")

        # Update cache
        RESPONSE_CACHE[cache_key] = {
            'data': result,
            'timestamp': time.time()
        }

        return result
    except Exception as e:
        logging.error(f"Error fetching history detail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/history/{history_id}")
async def delete_history(request: Request, history_id: str, background_tasks: BackgroundTasks):
    """Delete a run history entry and clean cache in background."""
    user_id, tokens = await get_user_id_and_tokens(request)
    success = await delete_run_history(user_id, history_id, auth_tokens=tokens)

    if not success:
        raise HTTPException(status_code=404, detail="History entry not found")

    # Clear related cache entries in background
    background_tasks.add_task(
        lambda: [RESPONSE_CACHE.pop(k) for k in list(RESPONSE_CACHE.keys())
                 if history_id in k]
    )

    return {"status": "success"}


async def create_gif_from_history(agent: Agent, run_id: str) -> Optional[str]:
    """Create GIF from agent history with optimized memory usage."""
    temp_gif_path = TEMP_DIR / f"agent_history_{run_id}.gif"

    try:
        # Create GIF using a more efficient approach
        logging.info(f"Creating GIF at path: {temp_gif_path}")

        # Use thread pool for CPU-bound GIF creation
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            thread_pool,
            lambda: agent.create_history_gif(output_path=str(temp_gif_path))
        )

        if not temp_gif_path.exists():
            logging.warning(f"GIF file was not created at {temp_gif_path}")
            return None

        # Read using memory-efficient buffered IO
        with open(temp_gif_path, 'rb') as gif_file:
            buffer = io.BytesIO(gif_file.read())
            gif_content = base64.b64encode(buffer.getvalue()).decode('utf-8')

        logging.info(f"Successfully created GIF with size: {len(gif_content)}")
        return gif_content

    except Exception as e:
        logging.error(f"Error creating GIF: {str(e)}")
        return None
    finally:
        # Clean up in a way that's more tolerant of failures
        try:
            if temp_gif_path.exists():
                os.unlink(temp_gif_path)
        except Exception as e:
            logging.warning(f"Error cleaning up GIF file: {str(e)}")


async def stream_agent_progress(agent: Agent, task: str, user_id: str, auth_tokens: AuthTokens, browser_task: BrowserTask):
    """Stream the agent's progress as JSON events with optimized performance."""
    progress_events = []
    final_result = None
    error_message = None
    gif_content = None
    history_saved = False
    run_id = str(uuid.uuid4())

    # More efficient batch size and polling interval
    BATCH_SIZE = 10
    POLLING_INTERVAL = 0.25  # 250ms instead of 100ms to reduce CPU usage

    # Use orjson for faster serialization
    def serialize_event(event):
        return orjson.dumps(event).decode('utf-8') + "\n"

    try:
        # Start event
        start_event = {"type": "start", "message": f"Starting task: {task}"}
        progress_events.append(start_event)
        yield serialize_event(start_event)

        # Send run ID event
        run_id_event = {"type": "run_id", "message": run_id}
        progress_events.append(run_id_event)
        yield serialize_event(run_id_event)

        # Run the agent in a background task
        agent_task = asyncio.create_task(agent.run(max_steps=30))

        # Track previous state more efficiently
        prev_state_lengths = {
            "urls": 0,
            "actions": 0,
            "thoughts": 0,
            "errors": 0,
            "results": 0,
            "content": 0
        }

        # Set to track already sent items for deduplication
        sent_items: Set[str] = set()

        # Optimized polling loop
        last_poll_time = time.time()
        buffered_events = []

        while not agent_task.done():
            current_time = time.time()

            # Only poll at specified interval to reduce CPU usage
            if current_time - last_poll_time < POLLING_INTERVAL:
                await asyncio.sleep(0.05)
                continue

            last_poll_time = current_time

            # Get all updates in a single pass to reduce method calls
            updates = {
                "urls": agent.history.urls(),
                "actions": agent.history.action_names(),
                "thoughts": agent.history.model_thoughts(),
                "errors": agent.history.errors(),
                "results": agent.history.action_results(),
                "content": agent.history.extracted_content()
            }

            # Process updates in batches
            for key, current_items in updates.items():
                prev_length = prev_state_lengths[key]
                new_items = current_items[prev_length:]

                if new_items:
                    for item in new_items:
                        # Deduplicate items
                        item_hash = f"{key}:{safe_serialize(item)}"
                        if item_hash in sent_items:
                            continue

                        sent_items.add(item_hash)

                        event = {
                            "type": key[:-1],  # Remove 's' from plural
                            "message": f"{key.title()}: {safe_serialize(item)}"
                        }
                        progress_events.append(event)
                        buffered_events.append(event)

                    prev_state_lengths[key] = len(current_items)

            # Send events in batches to reduce network overhead
            if buffered_events:
                if len(buffered_events) >= BATCH_SIZE:
                    for event in buffered_events:
                        yield serialize_event(event)
                    buffered_events = []

            # Adaptive sleep to reduce CPU usage
            await asyncio.sleep(0.05)

        # Send any remaining buffered events
        for event in buffered_events:
            yield serialize_event(event)

        # Get the agent's history after completion
        history = await agent_task

        # Process summary sections more efficiently
        summary_sections = [
            ("URLs Visited", history.urls()),
            ("Actions Taken", history.action_names()),
            ("Agent Reasoning", history.model_thoughts()),
            ("Extracted Content", history.extracted_content()),
            ("Action Results", history.action_results())
        ]

        for title, items in summary_sections:
            if items:
                section = {
                    "type": "section",
                    "title": title,
                    "items": [safe_serialize(item) for item in items]
                }
                progress_events.append(section)
                yield serialize_event(section)

        # Create GIF asynchronously for better performance
        gif_task = asyncio.create_task(create_gif_from_history(agent, run_id))

        # Get final result while GIF is being created
        final_result = history.final_result()
        is_done = history.is_done()

        # Wait for GIF with timeout to avoid blocking
        try:
            gif_content = await asyncio.wait_for(gif_task, timeout=10.0)
            if gif_content:
                gif_event = {
                    "type": "gif",
                    "message": "Task recording created"
                }
                progress_events.append(gif_event)
                yield serialize_event(gif_event)
        except asyncio.TimeoutError:
            logging.warning("GIF creation timed out")

        # Complete event
        complete_event = {
            "type": "complete",
            "message": safe_serialize(final_result),
            "success": bool(is_done)
        }
        progress_events.append(complete_event)
        yield serialize_event(complete_event)

        # Save history in background task to avoid blocking response
        if not history_saved:
            # Create a background task for saving history
            asyncio.create_task(
                save_run_history(
                    user_id=user_id,
                    task=task,
                    progress_events=progress_events,
                    result=final_result,
                    error=error_message,
                    gif_content=gif_content,
                    auth_tokens=auth_tokens,
                    run_id=run_id
                )
            )
            history_saved = True

    except Exception as e:
        error_message = f"Error: {str(e)}"
        error_event = {
            "type": "error",
            "message": error_message
        }
        progress_events.append(error_event)
        yield serialize_event(error_event)

        # Save failed run in background
        if not history_saved:
            asyncio.create_task(
                save_run_history(
                    user_id=user_id,
                    task=task,
                    progress_events=progress_events,
                    error=error_message,
                    auth_tokens=auth_tokens,
                    run_id=run_id
                )
            )


@app.post("/api/browse")
async def browse(request: Request, browser_task: BrowserTask, background_tasks: BackgroundTasks):
    """Handle browser automation task with optimized performance."""
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

        # Use background tasks to manage cleanup operations
        background_tasks.add_task(clean_cache)

        return StreamingResponse(
            stream_agent_progress(agent, browser_task.task,
                                  user_id, tokens, browser_task),
            media_type="text/event-stream"
        )

    except Exception as e:
        # Save failed run in background
        background_tasks.add_task(
            save_run_history,
            user_id=user_id,
            task=browser_task.task,
            progress_events=[{"type": "error", "message": str(e)}],
            error=str(e),
            auth_tokens=tokens
        )

        raise HTTPException(status_code=500, detail=str(e))
