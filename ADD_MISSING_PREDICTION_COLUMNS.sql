-- ADD MISSING COLUMNS TO EXISTING PREDICTIONS TABLE
-- Run this in Supabase SQL Editor

-- Add doctor_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' AND column_name = 'doctor_id'
    ) THEN
        ALTER TABLE public.predictions ADD COLUMN doctor_id INTEGER;
        CREATE INDEX idx_predictions_doctor_id ON public.predictions(doctor_id);
    END IF;
END $$;

-- Add other missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' AND column_name = 'original_prediction'
    ) THEN
        ALTER TABLE public.predictions ADD COLUMN original_prediction JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' AND column_name = 'modified_prediction'
    ) THEN
        ALTER TABLE public.predictions ADD COLUMN modified_prediction JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' AND column_name = 'approval_action'
    ) THEN
        ALTER TABLE public.predictions ADD COLUMN approval_action VARCHAR(20);
    END IF;
END $$;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'predictions' 
ORDER BY ordinal_position;
