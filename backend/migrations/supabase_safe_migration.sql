-- SUPABASE SAFE MIGRATION (Preserves Data)
-- Run this if you have existing predictions data

-- Step 1: Backup existing data
CREATE TABLE IF NOT EXISTS predictions_backup AS 
SELECT * FROM public.predictions;

-- Step 2: Drop old table
DROP TABLE IF EXISTS public.predictions CASCADE;

-- Step 3: Create new table with UUID
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

-- Step 4: Create indexes
CREATE INDEX idx_predictions_status ON public.predictions(status);
CREATE INDEX idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX idx_predictions_created_at ON public.predictions(created_at DESC);

-- Step 5: Enable RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies
CREATE POLICY "Users view own"
ON public.predictions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Doctors view pending"
ON public.predictions FOR SELECT
TO authenticated
USING (
    status = 'pending_review' 
    AND (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'doctor'
);

CREATE POLICY "Doctors update"
ON public.predictions FOR UPDATE
TO authenticated
USING ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'doctor');

CREATE POLICY "Users insert own"
ON public.predictions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Done!
SELECT 'Migration complete!' as status;
