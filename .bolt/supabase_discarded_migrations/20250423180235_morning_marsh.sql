/*
  # Add Portfolio Content Table

  1. New Tables
    - `portfolio_content`
      - `id` (uuid, primary key)
      - `image_url` (text, profile image)
      - `name` (text)
      - `name_native` (text)
      - `title` (text)
      - `title_native` (text)
      - `bio` (text)
      - `bio_native` (text)
      - `github_url` (text)
      - `linkedin_url` (text)
      - `twitter_url` (text)
      - `email` (text)
      - `years_of_experience` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for public read and admin write access
*/

CREATE TABLE IF NOT EXISTS portfolio_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text,
  name text NOT NULL,
  name_native text,
  title text NOT NULL,
  title_native text,
  bio text NOT NULL,
  bio_native text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  email text,
  years_of_experience integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE portfolio_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON portfolio_content
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access" ON portfolio_content
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update trigger
CREATE TRIGGER update_portfolio_content_updated_at
  BEFORE UPDATE ON portfolio_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();