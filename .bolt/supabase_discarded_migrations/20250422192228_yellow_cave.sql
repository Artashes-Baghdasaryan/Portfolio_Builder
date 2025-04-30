/*
  # Add Rich Text Description Support for Pages

  1. Changes
    - Add `description_content` column to store rich text content
    - Add `description_content_native` column to store native language rich text content
    - Keep existing description columns for backwards compatibility

  2. Implementation Details
    - Using DO block to safely add columns if they don't exist
    - Setting default values to empty JSON object
    - Using jsonb type for better performance and functionality
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pages' 
    AND column_name = 'description_content'
  ) THEN
    ALTER TABLE pages ADD COLUMN description_content jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pages' 
    AND column_name = 'description_content_native'
  ) THEN
    ALTER TABLE pages ADD COLUMN description_content_native jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;