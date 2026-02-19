-- COMPLETE FIX: Add doctor_id + Insert Test Data
-- Run this in Supabase SQL Editor

-- 1. Add doctor_id column
ALTER TABLE public.predictions 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_predictions_doctor_id ON public.predictions(doctor_id);

-- 2. Insert test prediction
INSERT INTO public.predictions (
    user_id,
    disease_type,
    prediction_result,
    probability,
    risk_level,
    input_data,
    status,
    doctor_id
) 
SELECT 
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'patient' LIMIT 1),
    'diabetes',
    'High Risk',
    0.85,
    'High Risk',
    '{"glucose": 180, "bmi": 32}'::jsonb,
    'pending_review',
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'doctor' LIMIT 1);

-- 3. Verify
SELECT 
    id,
    user_id,
    disease_type,
    status,
    doctor_id,
    created_at
FROM public.predictions
WHERE status = 'pending_review'
ORDER BY created_at DESC;
