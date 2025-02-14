from datetime import datetime
import base64
from config.supabase import supabase, HISTORY_TABLE, GIF_TABLE
from typing import Optional, List, Dict
import json

async def save_run_history(
    task: str,
    result: Optional[str],
    progress: List[Dict],
    gif_path: Optional[str] = None,
    error: Optional[str] = None
) -> str:
    """Save a run history entry and return its ID."""
    
    # Create the history entry
    history_data = {
        "task": task,
        "result": result,
        "progress": json.dumps(progress),
        "error": error,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    # Insert history
    result = supabase.table(HISTORY_TABLE).insert(history_data).execute()
    history_id = result.data[0]["id"]
    
    # If there's a GIF, save it
    if gif_path:
        try:
            with open(gif_path, "rb") as gif_file:
                gif_content = gif_file.read()
                gif_base64 = base64.b64encode(gif_content).decode()
                
                gif_data = {
                    "history_id": history_id,
                    "gif_content": gif_base64,
                    "created_at": datetime.utcnow().isoformat(),
                }
                supabase.table(GIF_TABLE).insert(gif_data).execute()
        except Exception as e:
            print(f"Error saving GIF: {e}")
    
    return history_id

async def get_run_history(limit: int = 10, offset: int = 0):
    """Get run history with optional pagination."""
    result = (
        supabase.table(HISTORY_TABLE)
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .offset(offset)
        .execute()
    )
    return result.data

async def get_run_details(history_id: str):
    """Get detailed run information including the GIF if available."""
    # Get history entry
    history = (
        supabase.table(HISTORY_TABLE)
        .select("*")
        .eq("id", history_id)
        .single()
        .execute()
    )
    
    if not history.data:
        return None
    
    # Get associated GIF if exists
    gif = (
        supabase.table(GIF_TABLE)
        .select("gif_content")
        .eq("history_id", history_id)
        .single()
        .execute()
    )
    
    result = history.data
    if gif.data:
        result["gif"] = gif.data["gif_content"]
    
    return result 