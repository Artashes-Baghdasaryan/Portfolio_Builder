/*
  # Documentation Website Schema

  1. New Tables
    - `pages`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, max 400 chars)
      - `slug` (text, unique)
      - `parent_id` (uuid, self-reference)
      - `created_at` (timestamp)
    
    - `sections`
      - `id` (uuid, primary key)
      - `page_id` (uuid, foreign key)
      - `title` (text, required)
      - `description` (text)
      - `slug` (text)
      - `content` (jsonb for rich text content)
      - `order` (integer for section ordering)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users (admin) and public access
*/

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text CHECK (char_length(description) <= 400),
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES pages(id),
  created_at timestamptz DEFAULT now()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  slug text NOT NULL,
  content jsonb DEFAULT '{}',
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Policies for pages
CREATE POLICY "Allow public read access" ON pages
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access" ON pages
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for sections
CREATE POLICY "Allow public read access" ON sections
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access" ON sections
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);