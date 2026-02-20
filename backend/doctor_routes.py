from flask import Blueprint, request, jsonify, session
from flask_cors import cross_origin
from models import db, User, Appointment, Prescription, PatientRecord, TreatmentHistory, Prediction
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/patients', methods=['GET'])
def get_doctor_patients():
    """Get only patients who have been consulted (accepted or completed appointments)"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        appointments = Appointment.query.filter(
            Appointment.doctor_id == session['user_id'],
            Appointment.status.in_(['accepted', 'completed'])
        ).all()
        patient_ids = list(set([apt.patient_id for apt in appointments]))
        patients = User.query.filter(User.id.in_(patient_ids)).all()
        
        return jsonify({
            'patients': [{
                'id': p.id,
                'name': p.name,
                'email': p.email,
                'phone': p.phone,
                'last_visit': max([a.appointment_date for a in appointments if a.patient_id == p.id], default=None)
            } for p in patients]
        })
    except Exception as e:
        logger.error(f"Error fetching patients: {str(e)}")
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patient/<int:patient_id>/records', methods=['GET'])
def get_patient_records(patient_id):
    """Get patient medical records"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        records = PatientRecord.query.filter_by(patient_id=patient_id).order_by(PatientRecord.created_at.desc()).all()
        return jsonify({
            'records': [{
                'id': r.id,
                'record_type': r.record_type,
                'diagnosis': r.diagnosis,
                'notes': r.notes,
                'attachments': r.attachments,
                'created_at': r.created_at.isoformat()
            } for r in records]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patient/<int:patient_id>/records', methods=['POST'])
def add_patient_record(patient_id):
    """Add new patient record"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        record = PatientRecord(
            patient_id=patient_id,
            doctor_id=session['user_id'],
            record_type=data.get('record_type', 'general'),
            diagnosis=data.get('diagnosis'),
            notes=data.get('notes'),
            attachments=data.get('attachments')
        )
        db.session.add(record)
        db.session.commit()
        return jsonify({'success': True, 'record_id': record.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/prescriptions', methods=['POST'])
def create_prescription():
    """Create digital prescription"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        prescription = Prescription(
            appointment_id=data.get('appointment_id'),
            patient_id=data.get('patient_id'),
            doctor_id=session['user_id'],
            medications=data.get('medications'),
            diagnosis=data.get('diagnosis'),
            instructions=data.get('instructions'),
            follow_up_date=data.get('follow_up_date')
        )
        db.session.add(prescription)
        db.session.commit()
        return jsonify({'success': True, 'prescription_id': prescription.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patient/<int:patient_id>/analytics', methods=['GET'])
def get_patient_analytics(patient_id):
    """Get patient health analytics"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        from models import Prediction
        predictions = Prediction.query.filter_by(user_id=patient_id).order_by(Prediction.created_at.desc()).limit(10).all()
        
        analytics = {
            'total_predictions': len(predictions),
            'risk_distribution': {},
            'disease_history': [],
            'recent_tests': []
        }
        
        for pred in predictions:
            risk = pred.risk_level or 'Unknown'
            analytics['risk_distribution'][risk] = analytics['risk_distribution'].get(risk, 0) + 1
            analytics['disease_history'].append({
                'disease': pred.disease_type,
                'risk': pred.risk_level,
                'date': pred.created_at.isoformat()
            })
        
        return jsonify(analytics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patient/<int:patient_id>/treatment-history', methods=['GET'])
def get_treatment_history(patient_id):
    """Get patient treatment history"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        treatments = TreatmentHistory.query.filter_by(patient_id=patient_id).order_by(TreatmentHistory.created_at.desc()).all()
        return jsonify({
            'treatments': [{
                'id': t.id,
                'treatment_type': t.treatment_type,
                'description': t.description,
                'medications': t.medications,
                'outcome': t.outcome,
                'created_at': t.created_at.isoformat()
            } for t in treatments]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patient/<int:patient_id>/treatment-history', methods=['POST'])
def add_treatment_history(patient_id):
    """Add treatment history entry"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        treatment = TreatmentHistory(
            patient_id=patient_id,
            doctor_id=session['user_id'],
            treatment_type=data.get('treatment_type'),
            description=data.get('description'),
            medications=data.get('medications'),
            outcome=data.get('outcome')
        )
        db.session.add(treatment)
        db.session.commit()
        return jsonify({'success': True, 'treatment_id': treatment.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/pending-approvals', methods=['GET'])
def get_pending_approvals():
    """Get all predictions pending doctor approval"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        predictions = Prediction.query.order_by(Prediction.created_at.desc()).limit(20).all()
        result = []
        for p in predictions:
            try:
                patient = User.query.get(p.user_id)
                result.append({
                    'id': p.id,
                    'patient_id': p.user_id,
                    'patient_name': patient.name if patient else 'Unknown',
                    'disease_type': p.disease_type,
                    'risk_level': p.risk_level,
                    'probability': p.probability,
                    'input_data': p.input_data or {},
                    'created_at': p.created_at.isoformat() if p.created_at else None,
                    'status': getattr(p, 'status', 'pending_review'),
                    'doctor_remarks': getattr(p, 'doctor_remarks', None),
                    'reviewed_by': getattr(p, 'reviewed_by', None),
                    'reviewed_at': p.reviewed_at.isoformat() if hasattr(p, 'reviewed_at') and p.reviewed_at else None
                })
            except Exception as e:
                logger.error(f"Error processing prediction {p.id}: {str(e)}")
                continue
        return jsonify({'predictions': result})
    except Exception as e:
        logger.error(f"Error fetching pending approvals: {str(e)}", exc_info=True)
        return jsonify({'predictions': []})

@doctor_bp.route('/approve-prediction/<prediction_id>', methods=['POST', 'OPTIONS'])
@cross_origin(origins='http://localhost:3000', supports_credentials=True)
def approve_prediction(prediction_id):
    """Approve, modify, or reject a prediction"""
    if request.method == 'OPTIONS':
        return '', 200
    
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user or user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        action = data.get('action')
        remarks = data.get('remarks')
        modified_data = data.get('modified_prediction')
        
        prediction = Prediction.query.get(prediction_id)
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        prediction.reviewed_by = session['user_id']
        prediction.reviewed_at = datetime.utcnow()
        prediction.doctor_remarks = remarks
        
        if action == 'approve':
            prediction.status = 'clinically_verified'
            prediction.approval_action = 'approved'
        elif action == 'modify':
            prediction.status = 'modified_by_doctor'
            prediction.approval_action = 'modified'
            if modified_data:
                prediction.modified_prediction = modified_data
        elif action == 'reject':
            prediction.status = 'rejected_reeval_required'
            prediction.approval_action = 'rejected'
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Prediction updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error approving prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

