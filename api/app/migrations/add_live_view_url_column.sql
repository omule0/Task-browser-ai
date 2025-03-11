-- Add live_view_url column to run_history table
ALTER TABLE run_history ADD COLUMN IF NOT EXISTS live_view_url TEXT; 