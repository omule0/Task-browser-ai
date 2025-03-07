-- Create feedback table to store user feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    session_id TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_rating_idx ON feedback(rating);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy to allow administrators to view all feedback
CREATE POLICY "Administrators can view all feedback"
    ON feedback FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'authenticated' AND
        (auth.jwt() ->> 'raw_user_meta_data')::jsonb->>'is_admin' = 'true'
    );

-- Policy to allow users to view their own feedback
CREATE POLICY "Users can view their own feedback"
    ON feedback FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own feedback
CREATE POLICY "Users can insert their own feedback"
    ON feedback FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Policy to allow users to update their own feedback
CREATE POLICY "Users can update their own feedback"
    ON feedback FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own feedback
CREATE POLICY "Users can delete their own feedback"
    ON feedback FOR DELETE
    USING (auth.uid() = user_id); 