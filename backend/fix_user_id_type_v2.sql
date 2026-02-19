-- Fix user_id type mismatch in predictions table
-- Run this in your PostgreSQL database

-- Step 1: Drop the policy that depends on user_id
DROP POLICY IF EXISTS "users_view_own" ON predictions;
DROP POLICY IF EXISTS "Users can view own predictions" ON predictions;
DROP POLICY IF EXISTS "Doctors can view assigned predictions" ON predictions;

-- Step 2: Convert predictions.user_id from UUID to INTEGER
ALTER TABLE predictions 
ALTER COLUMN user_id TYPE INTEGER USING user_id::text::integer;

-- Step 3: Add missing columns
ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS original_prediction JSONB,
ADD COLUMN IF NOT EXISTS modified_prediction JSONB,
ADD COLUMN IF NOT EXISTS approval_action VARCHAR(20);

-- Step 4: Recreate the policy (if needed for RLS)
-- Uncomment if you're using Row Level Security
-- CREATE POLICY "users_view_own" ON predictions
--   FOR SELECT
--   USING (user_id = current_setting('app.user_id')::INTEGER);

-- Verify the fix
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'predictions' 
ORDER BY ordinal_position;
