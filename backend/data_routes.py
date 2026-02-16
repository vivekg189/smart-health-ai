from flask import Blueprint, request, jsonify, session
from models import User, Prediction, Consultation, MedicalNote, DoctorAvailability
from config import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
data_bp = Blueprint('data', __name__)

def require_auth(f):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@data_bp.route('/predictions', methods=['POST'])
@require_auth
def save_prediction():
    try:
        # Check if database is available
        if not db.engine:
            return jsonify({'message': 'Prediction not saved - database not configured'}), 200
        
        data = request.get_json()
        user_id = session.get('user_id')
        
        prediction = Prediction(
            user_id=user_id,
            disease_type=data['disease_type'],
            prediction_result=data['prediction_result'],
            probability=data.get('probability'),
            risk_level=data.get('risk_level'),
            input_data=data.get('input_data')
        )
        
        db.session.add(prediction)
        db.session.commit()
        
        return jsonify({'message': 'Prediction saved', 'id': prediction.id}), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Save prediction error: {str(e)}", exc_info=True)
        return jsonify({'message': 'Prediction not saved'}), 200

@data_bp.route('/predictions', methods=['GET'])
@require_auth
def get_predictions():
    try:
        user_id = session.get('user_id')
        predictions = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
        
        return jsonify({
            'predictions': [{
                'id': p.id,
                'disease_type': p.disease_type,
                'prediction_result': p.prediction_result,
                'probability': p.probability,
                'risk_level': p.risk_level,
                'created_at': p.created_at.isoformat()
            } for p in predictions]
        }), 200
        
    except Exception as e:
        logger.error(f"Get predictions error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to fetch predictions'}), 500

@data_bp.route('/consultations', methods=['POST'])
@require_auth
def create_consultation():
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        consultation = Consultation(
            patient_id=user_id,
            doctor_id=data['doctor_id'],
            consultation_type=data.get('consultation_type', 'video'),
            scheduled_at=datetime.fromisoformat(data['scheduled_at']) if data.get('scheduled_at') else None
        )
        
        db.session.add(consultation)
        db.session.commit()
        
        return jsonify({'message': 'Consultation requested', 'id': consultation.id}), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Create consultation error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to create consultation'}), 500

@data_bp.route('/consultations', methods=['GET'])
@require_auth
def get_consultations():
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        
        if user.role == 'patient':
            consultations = Consultation.query.filter_by(patient_id=user_id).order_by(Consultation.created_at.desc()).all()
        else:
            consultations = Consultation.query.filter_by(doctor_id=user_id).order_by(Consultation.created_at.desc()).all()
        
        return jsonify({
            'consultations': [{
                'id': c.id,
                'patient_name': c.patient.name,
                'doctor_name': c.doctor.name,
                'status': c.status,
                'consultation_type': c.consultation_type,
                'scheduled_at': c.scheduled_at.isoformat() if c.scheduled_at else None,
                'created_at': c.created_at.isoformat()
            } for c in consultations]
        }), 200
        
    except Exception as e:
        logger.error(f"Get consultations error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to fetch consultations'}), 500

@data_bp.route('/consultations/<int:consultation_id>/notes', methods=['POST'])
@require_auth
def add_medical_note(consultation_id):
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        consultation = Consultation.query.get(consultation_id)
        if not consultation:
            return jsonify({'error': 'Consultation not found'}), 404
        
        if consultation.doctor_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        note = MedicalNote(
            consultation_id=consultation_id,
            note_text=data['note_text'],
            created_by=user_id
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({'message': 'Note added', 'id': note.id}), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Add note error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to add note'}), 500

@data_bp.route('/doctor/availability', methods=['PUT'])
@require_auth
def update_availability():
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        
        if user.role != 'doctor':
            return jsonify({'error': 'Only doctors can update availability'}), 403
        
        data = request.get_json()
        availability = DoctorAvailability.query.filter_by(doctor_id=user_id).first()
        
        if not availability:
            availability = DoctorAvailability(doctor_id=user_id)
            db.session.add(availability)
        
        availability.is_available = data.get('is_available', availability.is_available)
        availability.consultation_fee = data.get('consultation_fee', availability.consultation_fee)
        
        db.session.commit()
        
        return jsonify({'message': 'Availability updated'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Update availability error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to update availability'}), 500
