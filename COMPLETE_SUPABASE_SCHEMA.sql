-- COMPLETE SUPABASE SCHEMA FOR HEALTHCARE APP
-- Run this in Supabase SQL Editor

-- 1. PREDICTIONS TABLE (stores all diagnostic results)
CREATE TABLE IF NOT EXISTS public.predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    disease_type VARCHAR(50) NOT NULL,
    prediction_result VARCHAR(50) NOT NULL,
    probability FLOAT,
    risk_level VARCHAR(50),
    input_data JSONB,
    status VARCHAR(50) DEFAULT 'pending_review' NOT NULL,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMPTZ,
    doctor_remarks TEXT,
    original_prediction JSONB,
    modified_prediction JSONB,
    approval_action VARCHAR(20),
    doctor_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON public.predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_doctor_id ON public.predictions(doctor_id);

-- 2. USERS TABLE (if not using auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50) UNIQUE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_picture VARCHAR(255),
    specialization VARCHAR(100),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id SERIAL PRIMARY KEY,
    appointment_id VARCHAR(50) UNIQUE NOT NULL,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    symptoms TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    consultation_type VARCHAR(20) DEFAULT 'video',
    status VARCHAR(20) DEFAULT 'pending',
    is_emergency BOOLEAN DEFAULT FALSE,
    video_room_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- 4. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL,
    diagnosis TEXT NOT NULL,
    medicines JSONB NOT NULL,
    dosage_instructions TEXT,
    recommendations TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. DOCTOR AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS public.doctor_availability (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER UNIQUE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    consultation_fee FLOAT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. HEALTH DATA TABLE
CREATE TABLE IF NOT EXISTS public.health_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    height FLOAT,
    weight FLOAT,
    blood_group VARCHAR(10),
    known_conditions JSONB,
    allergies TEXT,
    family_history TEXT,
    is_smoker BOOLEAN DEFAULT FALSE,
    alcohol_consumption BOOLEAN DEFAULT FALSE,
    exercise_frequency VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. NOTIFICATION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    risk_alerts BOOLEAN DEFAULT TRUE,
    appointment_updates BOOLEAN DEFAULT TRUE,
    prescription_alerts BOOLEAN DEFAULT TRUE,
    emergency_alerts BOOLEAN DEFAULT TRUE,
    meal_reminders BOOLEAN DEFAULT FALSE,
    risk_threshold INTEGER DEFAULT 70,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. PRIVACY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    data_sharing_consent BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Grant permissions (adjust as needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Verify tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
