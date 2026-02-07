-- Create user_resumes table for storing resume metadata
CREATE TABLE IF NOT EXISTS user_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  resume_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_default ON user_resumes(user_id, is_default);

-- Enable RLS
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (allows re-running the script)
DROP POLICY IF EXISTS "Users can view their own resumes" ON user_resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON user_resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON user_resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON user_resumes;

-- RLS Policies
CREATE POLICY "Users can view their own resumes" 
  ON user_resumes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" 
  ON user_resumes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
  ON user_resumes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
  ON user_resumes FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS update_user_resumes_updated_at ON user_resumes;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_resumes_updated_at
    BEFORE UPDATE ON user_resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default resume per user
CREATE OR REPLACE FUNCTION ensure_single_default_resume()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_resumes 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS enforce_single_default_resume ON user_resumes;

-- Trigger to enforce single default resume
CREATE TRIGGER enforce_single_default_resume
  BEFORE INSERT OR UPDATE ON user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_resume();
