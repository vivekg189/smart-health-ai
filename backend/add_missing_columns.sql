-- Add missing columns to predictions table
-- Run this in your PostgreSQL database

ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS original_prediction JSONB,
ADD COLUMN IF NOT EXISTS modified_prediction JSONB,
ADD COLUMN IF NOT EXISTS approval_action VARCHAR(20);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'predictions' 
ORDER BY ordinal_position;
