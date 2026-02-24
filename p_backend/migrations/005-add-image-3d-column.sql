-- Migration: Add image_3d column to orders table
-- This column stores JSONB metadata for 3D images uploaded to S3

-- Add the column
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS image_3d JSONB DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN orders.image_3d IS 'JSONB metadata for 3D images stored in S3. Contains: s3_key, s3_bucket, file_name, file_size, content_type, order_id, patient_id, uploaded_at';

-- Create an index on the s3_key for faster lookups (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_orders_image_3d_s3_key ON orders ((image_3d->>'s3_key')) WHERE image_3d IS NOT NULL;
