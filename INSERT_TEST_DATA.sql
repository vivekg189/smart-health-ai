-- Create test prediction in Supabase
-- Run this in Supabase SQL Editor

-- First, check if predictions table exists
SELECT COUNT(*) FROM public.predictions;

-- Insert test prediction WITH DOCTOR REQUEST
INSERT INTO public.predictions (
    id,
    user_id,
    disease_type,
    prediction_result,
    probability,
    risk_level,
    input_data,
    status,
    doctor_id,
    created_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'patient' LIMIT 1),
    'diabetes',
    'High Risk',
    0.85,
    'High Risk',
    '{"glucose": 180, "bmi": 32, "blood_pressure": 90, "age": 55}'::jsonb,
    'pending_review',
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'doctor' LIMIT 1),
    NOW()
);

-- Verify insertion
SELECT 
    id,
    user_id,
    disease_type,
    status,
    created_at
FROM public.predictions
WHERE status = 'pending_review'
ORDER BY created_at DESC;

-- Check total count
SELECT 
    status,
    COUNT(*) as count
FROM public.predictions
GROUP BY status;
