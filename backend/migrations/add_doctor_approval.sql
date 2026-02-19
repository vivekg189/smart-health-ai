-- Add doctor approval columns to predictions table
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending_review';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS doctor_remarks TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS original_prediction JSONB;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS modified_prediction JSONB;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS approval_action VARCHAR(20);

-- Create audit log table
CREATE TABLE IF NOT EXISTS prediction_audit_log (
  id SERIAL PRIMARY KEY,
  prediction_id INTEGER REFERENCES predictions(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id),
  action VARCHAR(20) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  remarks TEXT,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_prediction ON prediction_audit_log(prediction_id);
CREATE INDEX IF NOT EXISTS idx_audit_doctor ON prediction_audit_log(doctor_id);
