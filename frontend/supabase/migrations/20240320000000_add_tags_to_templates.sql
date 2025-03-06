-- Add tags column to templates table
ALTER TABLE templates
ADD COLUMN tags text[] DEFAULT '{}';

-- Add an index for faster tag-based queries
CREATE INDEX templates_tags_idx ON templates USING GIN (tags);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own templates" ON templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON templates;

-- Recreate policies with updated permissions
CREATE POLICY "Users can view their own templates"
ON templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
ON templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON templates
FOR DELETE
USING (auth.uid() = user_id); 