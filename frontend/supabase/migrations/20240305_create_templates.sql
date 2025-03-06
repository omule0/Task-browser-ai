-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Business', 'Marketing', 'Research', 'News', 'Other')),
    subtitle TEXT NOT NULL,
    prompt TEXT,
    variables TEXT[],
    is_custom BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS templates_user_id_idx ON templates(user_id);
CREATE INDEX IF NOT EXISTS templates_category_idx ON templates(category);
CREATE INDEX IF NOT EXISTS templates_is_custom_idx ON templates(is_custom);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view all templates
CREATE POLICY "Users can view all templates"
    ON templates FOR SELECT
    USING (true);

-- Policy to allow users to insert their own templates
CREATE POLICY "Users can insert their own templates"
    ON templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own templates
CREATE POLICY "Users can update their own templates"
    ON templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own templates
CREATE POLICY "Users can delete their own templates"
    ON templates FOR DELETE
    USING (auth.uid() = user_id); 