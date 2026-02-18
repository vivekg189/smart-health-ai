-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Create health_data table
CREATE TABLE IF NOT EXISTS health_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    height FLOAT,
    weight FLOAT,
    blood_group VARCHAR(10),
    known_conditions JSON,
    allergies TEXT,
    family_history TEXT,
    is_smoker BOOLEAN DEFAULT FALSE,
    alcohol_consumption BOOLEAN DEFAULT FALSE,
    exercise_frequency VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    risk_alerts BOOLEAN DEFAULT TRUE,
    appointment_updates BOOLEAN DEFAULT TRUE,
    prescription_alerts BOOLEAN DEFAULT TRUE,
    emergency_alerts BOOLEAN DEFAULT TRUE,
    meal_reminders BOOLEAN DEFAULT FALSE,
    risk_threshold INTEGER DEFAULT 70,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create privacy_settings table
CREATE TABLE IF NOT EXISTS privacy_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    data_sharing_consent BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_data_user_id ON health_data(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);
