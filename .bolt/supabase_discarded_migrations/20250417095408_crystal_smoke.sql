/*
  # Add storage bucket for images

  1. New Storage
    - Create a new public storage bucket for images
    - Enable public access for the bucket
    - Set up policies for authenticated users to manage images
*/

-- Create a new storage bucket for images
CREATE BUCKET IF NOT EXISTS "images";

-- Set the bucket to public
UPDATE storage.buckets 
SET public = TRUE 
WHERE id = 'images';

-- Create policy to allow public access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Create policy to allow authenticated users to update images
CREATE POLICY "Allow authenticated users to update images"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Create policy to allow authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');