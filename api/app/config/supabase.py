from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials. Please check your .env file.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Table names
HISTORY_TABLE = "run_history"
GIF_TABLE = "run_gifs" 