from datetime import datetime
from config import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    doctor_id = db.Column(db.String(50), unique=True, index=True)
    gender = db.Column(db.String(20))
    specialization = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    predictions = db.relationship('Prediction', backref='user', lazy=True, cascade='all, delete-orphan')
    consultations_as_patient = db.relationship('Consultation', foreign_keys='Consultation.patient_id', backref='patient', lazy=True)
    consultations_as_doctor = db.relationship('Consultation', foreign_keys='Consultation.doctor_id', backref='doctor', lazy=True)
    availability = db.relationship('DoctorAvailability', backref='doctor', uselist=False, cascade='all, delete-orphan')

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    disease_type = db.Column(db.String(50), nullable=False)
    prediction_result = db.Column(db.String(50), nullable=False)
    probability = db.Column(db.Float)
    risk_level = db.Column(db.String(50))
    input_data = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class DoctorAvailability(db.Model):
    __tablename__ = 'doctor_availability'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    is_available = db.Column(db.Boolean, default=True)
    consultation_fee = db.Column(db.Float)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
