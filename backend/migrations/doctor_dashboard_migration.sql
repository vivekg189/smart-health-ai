-- Migration script for Doctor Dashboard features
-- Add patient_records and treatment_history tables

CREATE TABLE IF NOT EXISTS patient_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    record_type VARCHAR(50) DEFAULT 'general',
    diagnosis TEXT,
    notes TEXT,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_patient_records_patient ON patient_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_records_created ON patient_records(created_at);

CREATE TABLE IF NOT EXISTS treatment_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    treatment_type VARCHAR(100),
    description TEXT,
    medications JSONB,
    outcome TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_treatment_history_patient ON treatment_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_history_created ON treatment_history(created_at);

-- Update prescriptions table to include additional fields if not exists
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_id INTEGER;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_id INTEGER;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medications JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS follow_up_date DATE;
