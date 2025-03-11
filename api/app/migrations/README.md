# Database Migrations

This directory contains SQL migration files for the Digest AI database.

## How to Apply Migrations

1. Connect to your Supabase instance using the SQL Editor.
2. Copy and paste the contents of each migration file in the SQL Editor and run them in ascending order by creation date.
3. Check the results to ensure the migrations applied successfully.

## Migration Files

- `run_history_tables.sql` - Creates the initial tables for storing run history and GIFs.
- `user_profiles_table.sql` - Adds user profile functionality.
- `add_live_view_url_column.sql` - Adds the live_view_url column to the run_history table to support live browser sessions.

## Latest Migration

The latest migration, `add_live_view_url_column.sql`, adds support for storing live view URLs from Anchor Browser sessions. This allows users to view browser sessions in real-time.

After applying this migration, restart the API service:

```bash
docker-compose restart web
``` 