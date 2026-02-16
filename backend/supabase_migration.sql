-- Run this SQL script in Supabase SQL Editor to add doctor_id and gender columns
-- Go to: Supabase Dashboard > SQL Editor > New Query > Paste this script > Run

-- Add doctor_id column (unique, indexed)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(50) UNIQUE;

-- Add gender column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Create index on doctor_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_doctor_id 
ON users(doctor_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
