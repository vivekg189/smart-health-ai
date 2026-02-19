-- Fix user_id type mismatch in predictions table
-- Run this in your PostgreSQL database

-- Check current types
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'predictions') 
  AND column_name IN ('id', 'user_id')
ORDER BY table_name, column_name;

-- Option 1: If users.id is INTEGER and predictions.user_id is UUID
-- Convert predictions.user_id to INTEGER
ALTER TABLE predictions 
ALTER COLUMN user_id TYPE INTEGER USING user_id::text::integer;

-- Option 2: If you need to keep UUID, convert users.id to UUID
-- (Not recommended if you have existing integer IDs)
-- ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::text::uuid;

-- Add missing columns
ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS original_prediction JSONB,
ADD COLUMN IF NOT EXISTS modified_prediction JSONB,
ADD COLUMN IF NOT EXISTS approval_action VARCHAR(20);

-- Verify the fix
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'predictions' 
ORDER BY ordinal_position;
