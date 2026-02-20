-- Add new columns to predictions table for doctor approval workflow
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS original_prediction JSONB;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending_review';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS doctor_remarks TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS approval_action VARCHAR(50);
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS modified_prediction JSONB;

-- Update existing predictions to have pending_review status
UPDATE predictions SET status = 'pending_review' WHERE status IS NULL;
