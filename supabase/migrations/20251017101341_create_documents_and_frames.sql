/*
  # Create Documents and Frames Tables

  ## Overview
  This migration creates the core tables for storing tabletop accessory design documents
  and their associated frames (artboards).

  ## New Tables
  
  ### `documents`
  Stores metadata about design projects
  - `id` (uuid, primary key) - Unique document identifier
  - `name` (text) - Document name
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `revision` (integer) - Version counter for optimistic locking
  
  ### `frames`
  Stores individual artboards/frames within a document
  - `id` (uuid, primary key) - Unique frame identifier
  - `document_id` (uuid, foreign key) - Parent document reference
  - `name` (text) - Frame name
  - `width` (integer) - Frame width in pixels
  - `height` (integer) - Frame height in pixels
  - `dpi` (integer) - Dots per inch resolution
  - `base_color` (text) - Base canvas color (hex format)
  - `paper_color` (text, nullable) - Optional paper color overlay
  - `viewport_zoom` (real) - Default zoom level
  - `viewport_pan_x` (real) - Default pan X offset
  - `viewport_pan_y` (real) - Default pan Y offset
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `order_index` (integer) - Display order within document

  ## Security
  - Enable RLS on both tables
  - Public read access for MVP (no auth)
  - Public write access for MVP (no auth)
  
  ## Notes
  1. Using UUIDs for globally unique identifiers
  2. Timestamps use timezone-aware types
  3. Default values ensure data integrity
  4. Foreign key cascade ensures cleanup
  5. Indexes on foreign keys for query performance
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled Document',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  revision integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Frame',
  width integer NOT NULL DEFAULT 1920,
  height integer NOT NULL DEFAULT 1080,
  dpi integer NOT NULL DEFAULT 300,
  base_color text NOT NULL DEFAULT '#FFFFFF',
  paper_color text,
  viewport_zoom real DEFAULT 1.0,
  viewport_pan_x real DEFAULT 0.0,
  viewport_pan_y real DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  order_index integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_frames_document_id ON frames(document_id);
CREATE INDEX IF NOT EXISTS idx_frames_order ON frames(document_id, order_index);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to documents"
  ON documents FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to documents"
  ON documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to documents"
  ON documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to documents"
  ON documents FOR DELETE
  USING (true);

CREATE POLICY "Public read access to frames"
  ON frames FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to frames"
  ON frames FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to frames"
  ON frames FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to frames"
  ON frames FOR DELETE
  USING (true);
