-- Create run_documents table
CREATE TABLE IF NOT EXISTS run_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    history_id UUID NOT NULL REFERENCES run_history(id) ON DELETE CASCADE,
    document_content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups by history_id
CREATE INDEX IF NOT EXISTS idx_run_documents_history_id ON run_documents(history_id);

-- Add trigger to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON run_documents
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Setup Row Level Security
ALTER TABLE run_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own documents (via history_id)
CREATE POLICY "Users can view their own documents" ON run_documents
    FOR SELECT USING (
        history_id IN (
            SELECT id FROM run_history
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert their own documents (via history_id)
CREATE POLICY "Users can insert their own documents" ON run_documents
    FOR INSERT WITH CHECK (
        history_id IN (
            SELECT id FROM run_history
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update their own documents (via history_id)
CREATE POLICY "Users can update their own documents" ON run_documents
    FOR UPDATE USING (
        history_id IN (
            SELECT id FROM run_history
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own documents (via history_id)
CREATE POLICY "Users can delete their own documents" ON run_documents
    FOR DELETE USING (
        history_id IN (
            SELECT id FROM run_history
            WHERE user_id = auth.uid()
        )
    );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON run_documents TO authenticated;