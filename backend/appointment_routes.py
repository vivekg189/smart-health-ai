from flask import Blueprint, request, jsonify, session
from models import db, Appointment, Prescription, ChatMessage, User
from datetime import datetime, date, time
import uuid
import logging

logger = logging.getLogger(__name__)
appointment_bp = Blueprint('appointments', __name__)

@appointment_bp.route('/create', methods=['POST'])
def create_appointment():
    try:
        data = request.get_json()
        patient_id = session.get('user_id')
        
        if not patient_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Verify doctor exists in database
        doctor = User.query.get(data['doctor_id'])
        if not doctor or doctor.role != 'doctor':
            return jsonify({'error': 'Invalid doctor selected. Please select a registered doctor.'}), 400
        
        appointment_id = f"APT-{uuid.uuid4().hex[:8].upper()}"
        video_room_id = f"room-{uuid.uuid4().hex[:12]}"
        
        appointment = Appointment(
            appointment_id=appointment_id,
            doctor_id=data['doctor_id'],
            patient_id=patient_id,
            patient_name=data['patient_name'],
            symptoms=data['symptoms'],
            appointment_date=datetime.strptime(data['appointment_date'], '%Y-%m-%d').date(),
            appointment_time=datetime.strptime(data['appointment_time'], '%H:%M').time(),
            consultation_type=data.get('consultation_type', 'video'),
            is_emergency=data.get('is_emergency', False),
            video_room_id=video_room_id,
            status='pending'
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment request sent to doctor',
            'appointment_id': appointment_id,
            'video_room_id': video_room_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating appointment: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/patient', methods=['GET'])
def get_patient_appointments():
    try:
        patient_id = session.get('user_id')
        if not patient_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointments = Appointment.query.filter_by(patient_id=patient_id).order_by(Appointment.created_at.desc()).all()
        
        # Auto-update status for past appointments
        now = datetime.now()
        for apt in appointments:
            if apt.status == 'accepted':
                apt_datetime = datetime.combine(apt.appointment_date, apt.appointment_time)
                if apt_datetime < now:
                    apt.status = 'completed'
        db.session.commit()
        
        result = []
        for apt in appointments:
            doctor = User.query.get(apt.doctor_id)
            result.append({
                'id': apt.id,
                'appointment_id': apt.appointment_id,
                'doctor_name': doctor.name if doctor else 'Unknown',
                'doctor_specialization': doctor.specialization if doctor else 'N/A',
                'symptoms': apt.symptoms,
                'appointment_date': apt.appointment_date.isoformat(),
                'appointment_time': apt.appointment_time.strftime('%H:%M'),
                'consultation_type': apt.consultation_type,
                'status': apt.status,
                'is_emergency': apt.is_emergency,
                'video_room_id': apt.video_room_id,
                'created_at': apt.created_at.isoformat()
            })
        
        return jsonify({'appointments': result})
        
    except Exception as e:
        logger.error(f"Error fetching patient appointments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/doctor', methods=['GET'])
def get_doctor_appointments():
    try:
        doctor_id = session.get('user_id')
        if not doctor_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointments = Appointment.query.filter_by(doctor_id=doctor_id).order_by(Appointment.created_at.desc()).all()
        
        # Auto-update status for past appointments
        now = datetime.now()
        for apt in appointments:
            if apt.status == 'accepted':
                apt_datetime = datetime.combine(apt.appointment_date, apt.appointment_time)
                if apt_datetime < now:
                    apt.status = 'completed'
        db.session.commit()
        
        result = []
        for apt in appointments:
            patient = User.query.get(apt.patient_id)
            result.append({
                'id': apt.id,
                'appointment_id': apt.appointment_id,
                'patient_name': apt.patient_name,
                'patient_email': patient.email if patient else 'N/A',
                'symptoms': apt.symptoms,
                'appointment_date': apt.appointment_date.isoformat(),
                'appointment_time': apt.appointment_time.strftime('%H:%M'),
                'consultation_type': apt.consultation_type,
                'status': apt.status,
                'is_emergency': apt.is_emergency,
                'video_room_id': apt.video_room_id,
                'created_at': apt.created_at.isoformat()
            })
        
        return jsonify({'appointments': result})
        
    except Exception as e:
        logger.error(f"Error fetching doctor appointments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>/accept', methods=['POST'])
def accept_appointment(appointment_id):
    try:
        doctor_id = session.get('user_id')
        if not doctor_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment or appointment.doctor_id != doctor_id:
            return jsonify({'error': 'Appointment not found'}), 404
        
        appointment.status = 'accepted'
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Appointment accepted'})
        
    except Exception as e:
        logger.error(f"Error accepting appointment: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>/reject', methods=['POST'])
def reject_appointment(appointment_id):
    try:
        doctor_id = session.get('user_id')
        if not doctor_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment or appointment.doctor_id != doctor_id:
            return jsonify({'error': 'Appointment not found'}), 404
        
        appointment.status = 'rejected'
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Appointment rejected'})
        
    except Exception as e:
        logger.error(f"Error rejecting appointment: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>/complete', methods=['POST'])
def complete_appointment(appointment_id):
    try:
        doctor_id = session.get('user_id')
        if not doctor_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment or appointment.doctor_id != doctor_id:
            return jsonify({'error': 'Appointment not found'}), 404
        
        appointment.status = 'completed'
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Appointment completed'})
        
    except Exception as e:
        logger.error(f"Error completing appointment: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>/prescription', methods=['POST'])
def create_prescription(appointment_id):
    try:
        doctor_id = session.get('user_id')
        if not doctor_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment or appointment.doctor_id != doctor_id:
            return jsonify({'error': 'Appointment not found'}), 404
        
        data = request.get_json()
        
        prescription = Prescription(
            appointment_id=appointment_id,
            diagnosis=data['diagnosis'],
            medicines=data['medicines'],
            dosage_instructions=data.get('dosage_instructions', ''),
            recommendations=data.get('recommendations', ''),
            follow_up_date=datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date() if data.get('follow_up_date') else None
        )
        
        appointment.status = 'completed'
        
        db.session.add(prescription)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Prescription created successfully'})
        
    except Exception as e:
        logger.error(f"Error creating prescription: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>/prescription', methods=['GET'])
def get_prescription(appointment_id):
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment or (appointment.patient_id != user_id and appointment.doctor_id != user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        prescription = Prescription.query.filter_by(appointment_id=appointment_id).first()
        if not prescription:
            return jsonify({'error': 'Prescription not found'}), 404
        
        return jsonify({
            'diagnosis': prescription.diagnosis,
            'medicines': prescription.medicines,
            'dosage_instructions': prescription.dosage_instructions,
            'recommendations': prescription.recommendations,
            'follow_up_date': prescription.follow_up_date.isoformat() if prescription.follow_up_date else None,
            'created_at': prescription.created_at.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error fetching prescription: {str(e)}")
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>/messages', methods=['GET'])
def get_messages(appointment_id):
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment or (appointment.patient_id != user_id and appointment.doctor_id != user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        messages = ChatMessage.query.filter_by(appointment_id=appointment_id).order_by(ChatMessage.created_at).all()
        
        result = []
        for msg in messages:
            sender = User.query.get(msg.sender_id)
            result.append({
                'id': msg.id,
                'sender_name': sender.name if sender else 'Unknown',
                'sender_role': sender.role if sender else 'unknown',
                'message': msg.message,
                'created_at': msg.created_at.isoformat()
            })
        
        return jsonify({'messages': result})
        
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>/messages', methods=['POST'])
def send_message(appointment_id):
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        appointment = Appointment.query.get(appointment_id)
        if not appointment or (appointment.patient_id != user_id and appointment.doctor_id != user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        message = ChatMessage(
            appointment_id=appointment_id,
            sender_id=user_id,
            message=data['message']
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Message sent'})
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
