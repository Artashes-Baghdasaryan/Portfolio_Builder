/*
  # Add page order field

  1. Changes
    - Add `order` column to pages table with default value of 0
*/

ALTER TABLE pages
ADD COLUMN "order" integer DEFAULT 0;