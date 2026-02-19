-- MINIMAL FIX - Run this in Supabase SQL Editor

-- Drop old table
DROP TABLE IF EXISTS public.predictions CASCADE;

-- Create new table
CREATE TABLE public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    disease_type VARCHAR(50),
    prediction_result VARCHAR(50),
    probability FLOAT,
    risk_level VARCHAR(50),
    input_data JSONB,
    status VARCHAR(50) DEFAULT 'pending_review',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    doctor_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Allow doctors to view pending
CREATE POLICY "doctors_view_pending"
ON public.predictions FOR SELECT
USING (
    status = 'pending_review' 
    AND (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'doctor'
);

-- Allow users to view own
CREATE POLICY "users_view_own"
ON public.predictions FOR SELECT
USING (user_id = auth.uid());

-- Allow users to insert
CREATE POLICY "users_insert"
ON public.predictions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow doctors to update
CREATE POLICY "doctors_update"
ON public.predictions FOR UPDATE
USING ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'doctor');
