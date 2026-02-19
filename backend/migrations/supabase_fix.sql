-- SUPABASE PREDICTION REVIEW FIX
-- Copy and paste this into Supabase SQL Editor

-- 1. Drop existing table if it has wrong schema
DROP TABLE IF EXISTS public.predictions CASCADE;

-- 2. Create predictions table with correct UUID schema
CREATE TABLE public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    disease_type VARCHAR(50) NOT NULL,
    prediction_result VARCHAR(50) NOT NULL,
    probability FLOAT,
    risk_level VARCHAR(50),
    input_data JSONB,
    status VARCHAR(50) DEFAULT 'pending_review' NOT NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    doctor_remarks TEXT,
    original_prediction JSONB,
    modified_prediction JSONB,
    approval_action VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_status ON public.predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies (if any)
DROP POLICY IF EXISTS "Users can view own predictions" ON public.predictions;
DROP POLICY IF EXISTS "Doctors can view pending predictions" ON public.predictions;
DROP POLICY IF EXISTS "Doctors can update reviewed predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;

-- 6. Create RLS policies
CREATE POLICY "Users can view own predictions"
ON public.predictions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Doctors can view pending predictions"
ON public.predictions FOR SELECT
TO authenticated
USING (
    status = 'pending_review' 
    AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'doctor'
    )
);

CREATE POLICY "Doctors can update reviewed predictions"
ON public.predictions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'doctor'
    )
);

CREATE POLICY "Users can insert own predictions"
ON public.predictions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 7. Fix NULL status
UPDATE public.predictions
SET status = 'pending_review'
WHERE status IS NULL;

-- Done! Now verify:
SELECT COUNT(*) as pending_count 
FROM public.predictions 
WHERE status = 'pending_review';
