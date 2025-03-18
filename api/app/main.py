from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, SecretStr
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
import asyncio
from dotenv import load_dotenv
import os
import logging
import requests
import uuid
from typing import Dict, Optional, List, Any, Set
from app.services.history_service import save_run_history, get_run_history, get_run_details, delete_run_history, update_history_with_document
from app.utils.auth import get_user_id, get_user_id_and_tokens, AuthTokens
import base64
from pathlib import Path
import orjson  # Faster JSON serialization/deserialization
import time
import io
from concurrent.futures import ThreadPoolExecutor
from lmnr import Laminar, observe
# Import OpenAI Agents SDK
from agents import Agent as OpenAIAgent, Runner, handoff

# this line auto-instruments Browser Use and any browser you use (local or remote)
# Laminar.initialize(project_api_key=os.getenv("LMNR_PROJECT_API_KEY"))

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

# Create document directory
DOCS_DIR = Path("/tmp/digest_ai_docs")
DOCS_DIR.mkdir(parents=True, exist_ok=True)
os.chmod(DOCS_DIR, 0o777)

# Browser configuration settings
browser_configuration = {
    "adblock_config": {"active": True},
    "captcha_config": {"active": True},
    "proxy_config": {"active": True},
    "headless": False
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

# Initialize document generation agents


def create_document_agent():
    """Create an OpenAI agent for document generation"""
    return OpenAIAgent(
        name="Document Generator",
        instructions="""You're an agent that creates professional documents based on browser task results.
        Extract key information from the provided browser results and create a well-formatted document.
        Focus on organizing information clearly with proper sections and formatting.
        Include relevant details, insights, and actionable items derived from the browser task."""
    )


def create_research_agent():
    """Create an OpenAI agent specialized in research analysis"""
    return OpenAIAgent(
        name="Research Analyst",
        handoff_description="Specialist agent for analyzing research data and findings",
        instructions="""You analyze research data from browser tasks to identify trends, insights, and key findings.
        Extract meaningful patterns and organize them into coherent analysis.
        Focus on data validation, statistical significance, and relevant industry contexts."""
    )


def create_summary_agent():
    """Create an OpenAI agent specialized in concise summaries"""
    return OpenAIAgent(
        name="Summary Creator",
        handoff_description="Specialist agent for creating executive summaries",
        instructions="""You create concise, executive-level summaries from browser task results.
        Focus on distilling the most important information into brief, actionable insights.
        Ensure summaries are clear, direct, and highlight the most important findings."""
    )


def create_document_selector_agent():
    """Create an OpenAI agent that determines the most appropriate document type and delegates to specialist agents"""
    return OpenAIAgent(
        name="Document Selector",
        instructions="""You analyze browser tasks and results to determine the most appropriate document type to generate.
        
        For each task, examine:
        1. The nature and complexity of the task
        2. The volume and type of data in the results
        3. The likely intended use case based on the task description
        
        Then select the most appropriate document type:
        - Choose a comprehensive "report" for detailed research tasks with multiple data points that require thorough documentation
        - Choose "analysis" for tasks focused on trends, competitive research, or when insights and recommendations are needed
        - Choose "summary" for straightforward tasks where concise, executive-level information is sufficient
        
        IMPORTANT: Start your response with "DOCUMENT TYPE: [type]" where [type] is one of: report, analysis, or summary.
        For example: "DOCUMENT TYPE: report" 
        
        Then continue with the appropriate document content.
        After determining the appropriate document type, hand off to the specialist agent.""",
        handoff_description="Agent that determines the optimal document type and delegates to specialist agents"
    )


# Setup agent handoff configuration
document_agent = create_document_agent()
research_agent = create_research_agent()
summary_agent = create_summary_agent()
document_selector_agent = create_document_selector_agent()

# Configure handoff capabilities
document_selector_agent.handoff_config = handoff(
    document_agent, research_agent, summary_agent
)


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
        response_data = response.json()
        logging.info(
            f"Anchor Browser session created with response: {response_data}")
        return response_data
    except Exception as e:
        logging.error(f"Failed to create browser session: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to create browser session")


def get_browser():
    """Get a configured browser instance with session management and live view URL."""
    try:
        session_data = create_browser_session()
        session_id = session_data["id"]
        live_view_url = session_data.get("live_view_url")

        if live_view_url:
            logging.info(f"Live view URL found: {live_view_url}")
        else:
            # Check if the URL might be under a different key name
            all_keys = session_data.keys()
            logging.info(f"No live_view_url found. Available keys: {all_keys}")

            # Check if there's a key that contains 'url' or 'view'
            url_keys = [k for k in all_keys if 'url' in k.lower()
                        or 'view' in k.lower()]
            if url_keys:
                logging.info(f"Potential URL keys found: {url_keys}")
                for key in url_keys:
                    logging.info(f"Key {key} value: {session_data.get(key)}")

            # Construct the URL based on documentation
            host = "connect.anchorbrowser.io"
            constructed_url = f"https://live.anchorbrowser.io/inspector.html?host={host}&sessionId={session_id}"
            logging.info(f"Constructed live view URL: {constructed_url}")
            live_view_url = constructed_url

        browser = Browser(
            config=BrowserConfig(
                cdp_url=f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}&sessionId={session_id}",
            )
        )

        return browser, live_view_url
    except Exception as e:
        logging.error(f"Failed to initialize browser: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to initialize browser")


class BrowserTask(BaseModel):
    task: str
    model: str = "gpt-4o-mini"  # default model
    sensitive_data: Optional[Dict[str, str]] = None
    # Now optional, agent will determine if not provided
    document_type: Optional[str] = None


class HistoryResponse(BaseModel):
    id: str
    task: str
    result: Optional[str]
    error: Optional[str]
    created_at: str
    progress: List[Dict]
    live_view_url: Optional[str] = None
    document_url: Optional[str] = None


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
async def get_history_detail(request: Request, history_id: str, format: str = "json"):
    """Get detailed run information including GIF with caching.

    Parameters:
    - history_id: The ID of the history entry to retrieve
    - format: Response format, either "json" (default) or "chunked" for large responses
    """
    cache_key = f"history_detail_{history_id}_{format}"

    # Check cache first
    if cache_key in RESPONSE_CACHE:
        cache_entry = RESPONSE_CACHE[cache_key]
        # If cache is still valid
        if time.time() - cache_entry['timestamp'] < CACHE_TTL:
            # For chunked responses, we need to recreate the generator
            if format == "chunked" and isinstance(cache_entry['data'], dict):
                return StreamingResponse(
                    stream_chunked_response(cache_entry['data']),
                    media_type="application/json"
                )
            return cache_entry['data']

    try:
        user_id, tokens = await get_user_id_and_tokens(request)
        result = await get_run_details(user_id, history_id, auth_tokens=tokens)

        if not result:
            raise HTTPException(
                status_code=404, detail="History entry not found")

        # Check for large GIF content that might cause HTTP/2 stream issues
        gif_content_size = len(result.get("gif_content", "")) if result.get(
            "gif_content") else 0

        # If chunked format requested or GIF is very large, use streaming response
        if format == "chunked" or gif_content_size > 1_000_000:  # > 1MB
            # Update cache with the raw data
            RESPONSE_CACHE[cache_key] = {
                'data': result,
                'timestamp': time.time()
            }

            # Return as streaming response
            return StreamingResponse(
                stream_chunked_response(result),
                media_type="application/json"
            )
        else:
            # Update cache with regular response
            RESPONSE_CACHE[cache_key] = {
                'data': result,
                'timestamp': time.time()
            }

            return result
    except Exception as e:
        logging.error(
            f"Error fetching history detail: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def stream_chunked_response(data: dict):
    """Stream a large JSON response in chunks to avoid HTTP/2 stream reset issues."""
    # Helper function to break down large data into manageable chunks
    try:
        # First yield the metadata without large binary content
        metadata = {k: v for k, v in data.items() if k not in [
            "gif_content", "document_content"]}
        yield orjson.dumps(metadata).decode('utf-8') + "\n"

        # Stream GIF content in smaller chunks if present
        if "gif_content" in data and data["gif_content"]:
            gif_content = data["gif_content"]
            # Stream in chunks of ~500KB
            chunk_size = 500_000

            for i in range(0, len(gif_content), chunk_size):
                chunk = gif_content[i:i+chunk_size]
                yield orjson.dumps({"gif_content_chunk": chunk, "chunk_index": i // chunk_size}).decode('utf-8') + "\n"
                await asyncio.sleep(0.01)  # Small delay between chunks

            # Signal end of GIF content
            yield orjson.dumps({"gif_content_complete": True}).decode('utf-8') + "\n"

        # Stream document content separately if present
        if "document_content" in data and data["document_content"]:
            yield orjson.dumps({"document_content": data["document_content"]}).decode('utf-8') + "\n"

    except Exception as e:
        logging.error(
            f"Error streaming chunked response: {str(e)}", exc_info=True)
        yield orjson.dumps({"error": str(e)}).decode('utf-8') + "\n"


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


async def generate_document_from_results(browser_results, task, run_id):
    """Generate document from browser results using OpenAI Agents."""
    document_path = DOCS_DIR / f"document_{run_id}.md"

    try:
        # Format browser results for the agent
        formatted_results = f"""
        Task: {task}
        
        Browser Results:
        {browser_results}
        """

        # Define a synchronous function to run the agent
        def run_agent_sync(agent, message):
            # Create a new event loop in this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return Runner.run_sync(agent, message)
            finally:
                # Clean up to prevent memory leaks
                loop.close()

        loop = asyncio.get_event_loop()

        # Use the selector agent to determine document type
        selector_message = f"""
        {formatted_results}
        
        Based on this task and results, determine the most appropriate document type to generate.
        Consider the nature of the task, volume of data, and likely intended use case.
        """

        # Run the selector agent to determine document type and generate content
        result = await loop.run_in_executor(
            thread_pool,
            run_agent_sync,
            document_selector_agent,
            selector_message
        )

        # Extract the document type from the output
        document_content = result.final_output

        # Parse the document type from the output
        if document_content.startswith("DOCUMENT TYPE:"):
            doc_type_line = document_content.split("\n")[0]
            if "summary" in doc_type_line.lower():
                selected_doc_type = "summary"
            elif "analysis" in doc_type_line.lower():
                selected_doc_type = "analysis"
            else:
                selected_doc_type = "report"

            # Remove the document type line from the content
            document_content = "\n".join(
                document_content.split("\n")[1:]).strip()
        else:
            # Default to report if format not followed
            selected_doc_type = "report"
            logging.warning(
                "Document type not specified in output, defaulting to report")

        # Add document type header and format the content
        formatted_document = f"# {selected_doc_type.title()} Document\n\n"

        # Add task information
        formatted_document += f"**Task:** {task}\n\n"

        # Add the main document content
        formatted_document += document_content

        # Write document to file with formatting
        with open(document_path, 'w') as doc_file:
            doc_file.write(formatted_document)

        # Return base64 encoded document content with formatting
        return base64.b64encode(formatted_document.encode('utf-8')).decode('utf-8')

    except Exception as e:
        logging.error(f"Error generating document: {str(e)}")
        # Add stack trace for debugging
        import traceback
        logging.error(traceback.format_exc())
        return None


async def stream_agent_progress(agent: Agent, task: str, user_id: str, auth_tokens: AuthTokens, browser_task: BrowserTask, live_view_url: Optional[str] = None):
    """Stream the agent's progress as JSON events with optimized performance."""
    progress_events = []
    final_result = None
    error_message = None
    gif_content = None
    document_content = None
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

        # Send live view URL if available
        if live_view_url:
            live_view_event = {"type": "live_view_url", "url": live_view_url}
            progress_events.append(live_view_event)
            yield serialize_event(live_view_event)

        # Run the agent in a background task
        agent_task = asyncio.create_task(agent.run(max_steps=50))

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

        # Always generate document if there's a valid result
        if final_result and is_done:
            doc_event = {
                "type": "status",
                "message": "Generating document from browser results..."
            }
            progress_events.append(doc_event)
            yield serialize_event(doc_event)

            # Generate document asynchronously
            document_task = asyncio.create_task(
                generate_document_from_results(
                    final_result,
                    task,
                    run_id
                )
            )

            # Wait for document generation with a timeout
            try:
                document_content = await asyncio.wait_for(document_task, timeout=30.0)
                if document_content:
                    # Decode the base64 content
                    decoded_content = base64.b64decode(
                        document_content).decode('utf-8')
                    doc_event = {
                        "type": "document",
                        "message": "Document generated successfully"
                    }
                    progress_events.append(doc_event)
                    yield serialize_event(doc_event)

                    # Enhance the final result with the document
                    if final_result:
                        final_result = f"{final_result}\n\n## Generated Document\n\n{decoded_content}"
            except asyncio.TimeoutError:
                logging.warning("Document generation timed out")

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

        # Complete event with sources and references
        complete_event = {
            "type": "complete",
            "message": safe_serialize(final_result),
            "success": bool(is_done),
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
                    document_content=document_content,
                    auth_tokens=auth_tokens,
                    run_id=run_id,
                    live_view_url=live_view_url
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
@observe()
async def browse(request: Request, browser_task: BrowserTask, background_tasks: BackgroundTasks):
    """
    Handle browser automation task with optimized performance and automatic document generation.

    This endpoint:
    1. Runs the browser automation task
    2. Streams progress events in real-time
    3. Automatically generates a document based on the results
    4. Creates a GIF recording of the browser session
    5. Saves all results to the database

    The document_type parameter controls what type of document is generated:
    - "report": A detailed document with all findings (default)
    - "summary": A concise executive summary
    - "analysis": An analytical document with insights and trends
    """

    browser_local = Browser(
        config=BrowserConfig(
            # Specify the path to your Chrome executable
            chrome_instance_path='/Applications/Chromium.app/Contents/MacOS/Chromium',  # macOS path
            # For Windows, typically: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            # For Linux, typically: '/usr/bin/google-chrome'
        )
    )

    """Handle browser automation task with optimized performance."""
    try:
        user_id, tokens = await get_user_id_and_tokens(request)
        # Initialize Laminar
        Laminar.initialize(project_api_key=os.getenv("LMNR_PROJECT_API_KEY"))
        # Update metadata with actual user_id
        Laminar.set_metadata({'user_id': user_id, 'environment': 'production'})

        logging.info(f"Starting browse task for user {user_id}")

        # Initialize browser with error handling
        # try:
        #     browser, live_view_url = get_browser()
        #     logging.info("Browser initialized successfully")
        # except Exception as browser_error:
        #     logging.error(
        #         f"Failed to initialize browser: {str(browser_error)}")
        #     raise HTTPException(
        #         status_code=500,
        #         detail=f"Browser initialization failed: {str(browser_error)}"
        #     )

        planner_llm = ChatOpenAI(
            base_url='https://api.deepseek.com/v1',
            model="deepseek-reasoner",
            api_key=SecretStr(os.getenv("DEEPSEEK_API_KEY")),
        )

        # Initialize agent with error handling
        try:
            agent = Agent(
                task=browser_task.task,
                browser=browser_local,
                llm=ChatOpenAI(
                    model=browser_task.model,
                    temperature=0.0
                ),
                sensitive_data=browser_task.sensitive_data or {},
            )
            logging.info("Agent initialized successfully")
        except Exception as agent_error:
            logging.error(f"Failed to initialize agent: {str(agent_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Agent initialization failed: {str(agent_error)}"
            )

        # Use background tasks to manage cleanup operations
        background_tasks.add_task(clean_cache)

        try:
            return StreamingResponse(
                # stream_agent_progress(agent, browser_task.task,
                #                       user_id, tokens, browser_task, live_view_url),
                stream_agent_progress(agent, browser_task.task,
                                      user_id, tokens, browser_task),
                media_type="text/event-stream"
            )
        except Exception as stream_error:
            logging.error(
                f"Failed to create streaming response: {str(stream_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Streaming response failed: {str(stream_error)}"
            )

    except HTTPException as http_error:
        # Re-raise HTTP exceptions with their original status code
        raise http_error
    except Exception as e:
        # Log error in metadata before raising
        Laminar.set_metadata({'error': str(e)})
        logging.error(
            f"Unexpected error in browse endpoint: {str(e)}", exc_info=True)

        # Save failed run in background
        background_tasks.add_task(
            save_run_history,
            user_id=user_id if 'user_id' in locals() else None,
            task=browser_task.task,
            progress_events=[{"type": "error", "message": str(e)}],
            error=str(e),
            auth_tokens=tokens if 'tokens' in locals() else None
        )

        # Clear metadata before raising exception
        # Laminar.clear_metadata()
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@app.post("/api/generate-document")
async def generate_document(request: Request, background_tasks: BackgroundTasks):
    """Generate document from an existing browser task result."""
    try:
        data = await request.json()
        history_id = data.get("history_id")

        if not history_id:
            raise HTTPException(status_code=400, detail="Missing history_id")

        # Get user credentials
        user_id, tokens = await get_user_id_and_tokens(request)

        # Get history details
        history = await get_run_details(user_id, history_id, auth_tokens=tokens)
        if not history:
            raise HTTPException(status_code=404, detail="History not found")

        # Check if result exists
        if not history.get("result"):
            raise HTTPException(
                status_code=400, detail="No result found in history")

        # Generate document in background
        run_id = str(uuid.uuid4())
        background_tasks.add_task(
            generate_and_save_document,
            user_id=user_id,
            history_id=history_id,
            result=history["result"],
            task=history["task"],
            run_id=run_id,
            auth_tokens=tokens
        )

        return {"status": "success", "message": "Document generation started", "run_id": run_id}

    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Error generating document: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating document: {str(e)}")


async def generate_and_save_document(user_id, history_id, result, task, run_id, auth_tokens):
    """Generate document from result and save it to history."""
    try:
        # Create an event loop for this thread if there isn't one
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # No event loop exists in this thread, so create one
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        # Generate document - use loop.run_until_complete for async calls if we created a new loop
        if asyncio.get_event_loop_policy().get_event_loop() == loop:
            # We're in the original event loop
            document_content = await generate_document_from_results(
                result, task, run_id
            )
        else:
            # We're in a new loop we created
            document_content = loop.run_until_complete(
                generate_document_from_results(
                    result, task, run_id)
            )

        if not document_content:
            logging.error("Failed to generate document content")
            return

        # Decode document for updating history result
        decoded_content = base64.b64decode(document_content).decode('utf-8')

        # Fetch existing result to append document
        history_details = await get_run_details(user_id, history_id, auth_tokens=auth_tokens)
        existing_result = history_details.get("result", "")

        # Create combined result with original result and document
        if existing_result:
            combined_result = f"{existing_result}\n\n## Generated Document\n\n{decoded_content}"
        else:
            combined_result = decoded_content

        # Update both the result and document content
        # Update history with document - same logic for event loop
        if asyncio.get_event_loop_policy().get_event_loop() == loop:
            success = await update_history_with_document(
                user_id=user_id,
                history_id=history_id,
                document_content=document_content,
                result=combined_result,  # Update result to include document
                auth_tokens=auth_tokens
            )
        else:
            success = loop.run_until_complete(
                update_history_with_document(
                    user_id=user_id,
                    history_id=history_id,
                    document_content=document_content,
                    result=combined_result,  # Update result to include document
                    auth_tokens=auth_tokens
                )
            )

        if success:
            logging.info(
                f"Document generated and saved successfully for history {history_id}")
        else:
            logging.error(f"Failed to save document for history {history_id}")
    except Exception as e:
        logging.error(f"Error in generate_and_save_document: {str(e)}")
        # If we have to debug, include stack trace
        import traceback
        logging.error(traceback.format_exc())
