/*
  # Create Layers Table

  ## Overview
  This migration creates the layers table for storing all layer types within frames,
  including the locked base canvas and transformable image layers.

  ## New Tables
  
  ### `layers`
  Stores individual layers within a frame
  - `id` (uuid, primary key) - Unique layer identifier
  - `frame_id` (uuid, foreign key) - Parent frame reference
  - `type` (text) - Layer type: 'base', 'image', 'text', 'shape'
  - `name` (text) - Layer name
  - `visible` (boolean) - Visibility state
  - `locked` (boolean) - Lock state (prevents transforms)
  - `order_index` (integer) - Z-order stacking position
  - `asset_url` (text, nullable) - URL to asset in Supabase Storage (for image layers)
  - `transform_x` (real) - X position in world space
  - `transform_y` (real) - Y position in world space
  - `transform_width` (real) - Width after scaling
  - `transform_height` (real) - Height after scaling
  - `transform_rotation` (real) - Rotation in degrees
  - `transform_scale_x` (real) - X scale factor
  - `transform_scale_y` (real) - Y scale factor
  - `opacity` (real) - Layer opacity (0.0 to 1.0)
  - `blend_mode` (text) - Blend mode ('normal', 'multiply', etc.)
  - `metadata` (jsonb) - Additional layer-specific data
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS
  - Public access for MVP (no auth)
  
  ## Notes
  1. Base canvas layer has locked=true and order_index=0
  2. Transform values stored separately for flexibility
  3. JSONB metadata for extensibility
  4. Indexes for performance on queries by frame and order
*/

CREATE TABLE IF NOT EXISTS layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_id uuid NOT NULL REFERENCES frames(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'image',
  name text NOT NULL DEFAULT 'Layer',
  visible boolean DEFAULT true,
  locked boolean DEFAULT false,
  order_index integer DEFAULT 0,
  asset_url text,
  transform_x real DEFAULT 0.0,
  transform_y real DEFAULT 0.0,
  transform_width real DEFAULT 100.0,
  transform_height real DEFAULT 100.0,
  transform_rotation real DEFAULT 0.0,
  transform_scale_x real DEFAULT 1.0,
  transform_scale_y real DEFAULT 1.0,
  opacity real DEFAULT 1.0,
  blend_mode text DEFAULT 'normal',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_opacity CHECK (opacity >= 0.0 AND opacity <= 1.0)
);

CREATE INDEX IF NOT EXISTS idx_layers_frame_id ON layers(frame_id);
CREATE INDEX IF NOT EXISTS idx_layers_order ON layers(frame_id, order_index);
CREATE INDEX IF NOT EXISTS idx_layers_type ON layers(frame_id, type);

ALTER TABLE layers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to layers"
  ON layers FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to layers"
  ON layers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to layers"
  ON layers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to layers"
  ON layers FOR DELETE
  USING (true);
