/*
  # Add Bilingual Support

  1. Changes
    - Add native language fields to pages table:
      - `title_native` (text)
      - `description_native` (text)
    
    - Add native language fields to sections table:
      - `title_native` (text)
      - `description_native` (text)
      - `content_native` (jsonb)

  2. Notes
    - All native language fields are optional
    - Content fields use jsonb for rich text storage
*/

-- Add native language fields to pages table
ALTER TABLE pages
ADD COLUMN title_native text,
ADD COLUMN description_native text CHECK (char_length(description_native) <= 400);

-- Add native language fields to sections table
ALTER TABLE sections
ADD COLUMN title_native text,
ADD COLUMN description_native text,
ADD COLUMN content_native jsonb DEFAULT '{}';