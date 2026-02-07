-- Storage policies for the 'resumes' bucket
-- Run this AFTER creating the 'resumes' bucket in Supabase Dashboard

-- First, make sure RLS is enabled on storage.objects (should be by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (in case of re-run)
DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update resumes" ON storage.objects;

-- Allow users to upload their own resumes (INSERT)
CREATE POLICY "Users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to view their own resumes (SELECT)
CREATE POLICY "Users can view resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to update their own resumes (UPDATE)
CREATE POLICY "Users can update resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'resumes' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own resumes (DELETE)
CREATE POLICY "Users can delete resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
