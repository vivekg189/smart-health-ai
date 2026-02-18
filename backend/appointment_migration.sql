-- Appointment System Database Migration
-- Run this SQL script to create the necessary tables

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    appointment_id VARCHAR(50) UNIQUE NOT NULL,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(100) NOT NULL,
    symptoms TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    consultation_type VARCHAR(20) DEFAULT 'video',
    status VARCHAR(20) DEFAULT 'pending',
    is_emergency BOOLEAN DEFAULT FALSE,
    video_room_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_id ON appointments(appointment_id);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    medicines JSONB NOT NULL,
    dosage_instructions TEXT,
    recommendations TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON prescriptions(appointment_id);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_appointment_id ON chat_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Update trigger for appointments updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Uncomment to insert test data

/*
-- Insert test patient
INSERT INTO users (name, email, password_hash, role, gender, created_at)
VALUES ('John Doe', 'patient@test.com', 'hashed_password', 'patient', 'male', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert test doctor
INSERT INTO users (name, email, password_hash, role, doctor_id, gender, specialization, created_at)
VALUES ('Dr. Sarah Johnson', 'doctor@test.com', 'hashed_password', 'doctor', 'DOC001', 'female', 'Cardiologist', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert test appointment
INSERT INTO appointments (
    appointment_id, doctor_id, patient_id, patient_name, symptoms,
    appointment_date, appointment_time, consultation_type, status,
    is_emergency, video_room_id
)
SELECT 
    'APT-TEST001',
    (SELECT id FROM users WHERE email = 'doctor@test.com'),
    (SELECT id FROM users WHERE email = 'patient@test.com'),
    'John Doe',
    'Chest pain and shortness of breath',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    'video',
    'pending',
    FALSE,
    'room-test-12345'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE appointment_id = 'APT-TEST001');
*/

-- Verify tables created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('appointments', 'prescriptions', 'chat_messages')
ORDER BY table_name;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Appointment system tables created successfully!';
    RAISE NOTICE 'Tables: appointments, prescriptions, chat_messages';
END $$;
