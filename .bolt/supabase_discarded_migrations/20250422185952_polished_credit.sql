/*
  # Add Rich Text Description Support for Pages

  1. Changes
    - Add `description_content` column to store rich text content
    - Add `description_content_native` column to store native language rich text content
    - Keep existing description columns for backwards compatibility
*/

ALTER TABLE pages
ADD COLUMN description_content jsonb DEFAULT '{}',
ADD COLUMN description_content_native jsonb DEFAULT '{}';