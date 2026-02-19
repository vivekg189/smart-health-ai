-- Add doctor_id column to predictions table
-- Run this in Supabase SQL Editor

-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'predictions' AND column_name = 'doctor_id';

-- Add doctor_id column if it doesn't exist
ALTER TABLE public.predictions 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_predictions_doctor_id ON public.predictions(doctor_id);

-- Update RLS policy to include doctor assignment
DROP POLICY IF EXISTS "Doctors can view assigned predictions" ON public.predictions;

CREATE POLICY "Doctors can view assigned predictions"
ON public.predictions FOR SELECT
TO authenticated
USING (
    status = 'pending_review' 
    AND (
        doctor_id = auth.uid() 
        OR doctor_id IS NULL
    )
    AND (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'doctor'
);

-- Verify
SELECT id, user_id, disease_type, status, doctor_id 
FROM public.predictions 
LIMIT 5;
