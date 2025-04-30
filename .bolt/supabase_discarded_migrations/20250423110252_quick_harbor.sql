/*
  # Fix Native Description Constraints

  1. Changes
    - Remove character length constraint from pages.description_native
    - Change description_native to jsonb type to properly store rich text content
  
  2. Notes
    - This allows storing rich text content of any length
    - JSON format ensures proper data structure for the editor
*/

ALTER TABLE pages 
DROP CONSTRAINT IF EXISTS pages_description_native_check;

ALTER TABLE pages 
ALTER COLUMN description_native TYPE jsonb USING CASE 
  WHEN description_native IS NULL THEN NULL
  WHEN description_native::text = '' THEN '{}'::jsonb
  ELSE description_native::jsonb
END;