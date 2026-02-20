from datetime import datetime
from config import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    doctor_id = db.Column(db.String(50), unique=True, index=True)
    gender = db.Column(db.String(20))
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    profile_picture = db.Column(db.String(255))
    specialization = db.Column(db.String(100))
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    disease_type = db.Column(db.String(50), nullable=False)
    prediction_result = db.Column(db.String(50), nullable=False)
    probability = db.Column(db.Float)
    risk_level = db.Column(db.String(50))
    input_data = db.Column(db.JSON)
    original_prediction = db.Column(db.JSON)
    status = db.Column(db.String(50), default='pending_review')
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    reviewed_at = db.Column(db.DateTime)
    doctor_remarks = db.Column(db.Text)
    approval_action = db.Column(db.String(50))
    modified_prediction = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class DoctorAvailability(db.Model):
    __tablename__ = 'doctor_availability'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    is_available = db.Column(db.Boolean, default=True)
    consultation_fee = db.Column(db.Float)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    patient_name = db.Column(db.String(100), nullable=False)
    symptoms = db.Column(db.Text, nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    consultation_type = db.Column(db.String(20), default='video')
    status = db.Column(db.String(20), default='pending')
    is_emergency = db.Column(db.Boolean, default=False)
    video_room_id = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    prescription = db.relationship('Prescription', backref='appointment', uselist=False, cascade='all, delete-orphan')
    messages = db.relationship('ChatMessage', backref='appointment', lazy=True, cascade='all, delete-orphan')

class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False, unique=True, index=True)
    diagnosis = db.Column(db.Text, nullable=False)
    medicines = db.Column(db.JSON, nullable=False)
    dosage_instructions = db.Column(db.Text)
    recommendations = db.Column(db.Text)
    follow_up_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False, index=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class Consultation(db.Model):
    __tablename__ = 'consultations'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    status = db.Column(db.String(20), default='pending')
    consultation_type = db.Column(db.String(20))
    scheduled_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    notes = db.relationship('MedicalNote', backref='consultation', lazy=True, cascade='all, delete-orphan')

class MedicalNote(db.Model):
    __tablename__ = 'medical_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id'), nullable=False, index=True)
    note_text = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class HealthData(db.Model):
    __tablename__ = 'health_data'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    blood_group = db.Column(db.String(10))
    known_conditions = db.Column(db.JSON)
    allergies = db.Column(db.Text)
    family_history = db.Column(db.Text)
    is_smoker = db.Column(db.Boolean, default=False)
    alcohol_consumption = db.Column(db.Boolean, default=False)
    exercise_frequency = db.Column(db.String(50))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NotificationSettings(db.Model):
    __tablename__ = 'notification_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    risk_alerts = db.Column(db.Boolean, default=True)
    appointment_updates = db.Column(db.Boolean, default=True)
    prescription_alerts = db.Column(db.Boolean, default=True)
    emergency_alerts = db.Column(db.Boolean, default=True)
    meal_reminders = db.Column(db.Boolean, default=False)
    risk_threshold = db.Column(db.Integer, default=70)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PrivacySettings(db.Model):
    __tablename__ = 'privacy_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    data_sharing_consent = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PatientRecord(db.Model):
    __tablename__ = 'patient_records'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    record_type = db.Column(db.String(50), default='general')
    diagnosis = db.Column(db.Text)
    notes = db.Column(db.Text)
    attachments = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class TreatmentHistory(db.Model):
    __tablename__ = 'treatment_history'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    treatment_type = db.Column(db.String(100))
    description = db.Column(db.Text)
    medications = db.Column(db.JSON)
    outcome = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
