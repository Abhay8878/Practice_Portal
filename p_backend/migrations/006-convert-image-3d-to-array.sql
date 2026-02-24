-- Migration: Convert image_3d column from JSONB object to JSONB array
-- Description: Wraps existing single object in an array to support multiple images

DO $$
BEGIN
    -- Check if the column exists and is not null (has data)
    -- We want to convert {"key": "val"} to [{"key": "val"}]
    -- If it's already an array, jsonb_typeof will return 'array'
    
    UPDATE orders
    SET image_3d = jsonb_build_array(image_3d)
    WHERE image_3d IS NOT NULL 
    AND jsonb_typeof(image_3d) = 'object';

END $$;
