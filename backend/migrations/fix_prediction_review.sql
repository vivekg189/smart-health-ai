-- Prediction Review System - Database Migration (Supabase Compatible)
-- Run this script to ensure proper database setup

-- 1. Ensure predictions table has correct schema
CREATE TABLE IF NOT EXISTS predictions (
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

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_reviewed_by ON predictions(reviewed_by);

-- 3. Add constraint to ensure valid status values
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS chk_prediction_status;
ALTER TABLE predictions ADD CONSTRAINT chk_prediction_status 
CHECK (status IN (
    'pending_review',
    'clinically_verified',
    'modified_by_doctor',
    'rejected_reeval_required'
));

-- 4. Row Level Security Policies (for Supabase/PostgreSQL with RLS)
-- Enable RLS on predictions table
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own predictions" ON predictions;
DROP POLICY IF EXISTS "Doctors can view pending predictions" ON predictions;
DROP POLICY IF EXISTS "Doctors can update reviewed predictions" ON predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;

-- Policy 1: Users can view their own predictions
CREATE POLICY "Users can view own predictions"
ON predictions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Doctors can view all pending predictions
CREATE POLICY "Doctors can view pending predictions"
ON predictions FOR SELECT
TO authenticated
USING (
    status = 'pending_review' 
    AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'doctor'
    )
);

-- Policy 3: Doctors can update predictions
CREATE POLICY "Doctors can update reviewed predictions"
ON predictions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'doctor'
    )
)
WITH CHECK (
    status IN ('clinically_verified', 'modified_by_doctor', 'rejected_reeval_required')
);

-- Policy 4: Users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
ON predictions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 5. Create view for doctor dashboard
CREATE OR REPLACE VIEW doctor_pending_reviews AS
SELECT 
    p.id,
    p.user_id AS patient_id,
    u.raw_user_meta_data->>'name' AS patient_name,
    u.email AS patient_email,
    p.disease_type,
    p.prediction_result,
    p.probability,
    p.risk_level,
    p.input_data,
    p.status,
    p.created_at,
    EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 AS hours_pending
FROM predictions p
JOIN auth.users u ON p.user_id = u.id
WHERE p.status = 'pending_review'
ORDER BY p.created_at DESC;

-- 6. Create function to auto-update reviewed_at timestamp
CREATE OR REPLACE FUNCTION update_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != 'pending_review' AND OLD.status = 'pending_review' THEN
        NEW.reviewed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for auto-updating reviewed_at
DROP TRIGGER IF EXISTS trg_update_reviewed_at ON predictions;
CREATE TRIGGER trg_update_reviewed_at
BEFORE UPDATE ON predictions
FOR EACH ROW
EXECUTE FUNCTION update_reviewed_at();

-- 8. Verify data integrity
-- Check for any predictions with invalid status
SELECT COUNT(*) as invalid_status_count
FROM predictions
WHERE status NOT IN (
    'pending_review',
    'clinically_verified',
    'modified_by_doctor',
    'rejected_reeval_required'
);

-- 9. Update any existing predictions with NULL status
UPDATE predictions
SET status = 'pending_review'
WHERE status IS NULL;

-- 10. Create statistics view for monitoring
CREATE OR REPLACE VIEW prediction_statistics AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(reviewed_at, NOW()) - created_at))/3600) as avg_hours_to_review
FROM predictions
GROUP BY status;

-- 11. Grant necessary permissions (adjust role names as needed)
GRANT SELECT, INSERT ON predictions TO authenticated;
GRANT UPDATE ON predictions TO authenticated;
GRANT SELECT ON doctor_pending_reviews TO authenticated;
GRANT SELECT ON prediction_statistics TO authenticated;

-- 12. Verification queries
-- Run these to verify setup

-- Check table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'predictions'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'predictions';

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'predictions'::regclass;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'predictions';

-- Sample data check
SELECT 
    status,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM predictions
GROUP BY status;

COMMIT;
