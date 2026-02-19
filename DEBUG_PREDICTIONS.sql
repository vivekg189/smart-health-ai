-- DEBUG: Check predictions table
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'predictions'
);

-- 2. Count all predictions
SELECT COUNT(*) as total FROM public.predictions;

-- 3. Count by status
SELECT status, COUNT(*) as count 
FROM public.predictions 
GROUP BY status;

-- 4. Show all predictions
SELECT 
    id,
    user_id,
    disease_type,
    status,
    created_at
FROM public.predictions
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if any pending
SELECT * FROM public.predictions 
WHERE status = 'pending_review';

-- 6. If empty, insert test data
INSERT INTO public.predictions (
    user_id,
    disease_type,
    prediction_result,
    probability,
    risk_level,
    input_data,
    status
) 
SELECT 
    id,
    'diabetes',
    'High Risk',
    0.85,
    'High Risk',
    '{"glucose": 180}'::jsonb,
    'pending_review'
FROM auth.users 
LIMIT 1;

-- 7. Verify again
SELECT COUNT(*) FROM public.predictions WHERE status = 'pending_review';
