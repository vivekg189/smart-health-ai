from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, DoctorAvailability
from config import db
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['name', 'email', 'password', 'role']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        if data['role'] not in ['patient', 'doctor']:
            return jsonify({'error': 'Invalid role'}), 400
        
        if data['role'] == 'doctor':
            if not data.get('specialization'):
                return jsonify({'error': 'Specialization required for doctors'}), 400
            if not data.get('doctorId'):
                return jsonify({'error': 'Doctor ID required for doctors'}), 400
            if not data.get('gender'):
                return jsonify({'error': 'Gender required for doctors'}), 400
            if User.query.filter_by(doctor_id=data['doctorId']).first():
                return jsonify({'error': 'Doctor ID already registered. Please use a different Doctor ID'}), 409
        
        user = User(
            name=data['name'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            role=data['role'],
            doctor_id=data.get('doctorId'),
            gender=data.get('gender'),
            specialization=data.get('specialization')
        )
        
        db.session.add(user)
        db.session.flush()
        
        if data['role'] == 'doctor':
            availability = DoctorAvailability(doctor_id=user.id, is_available=True)
            db.session.add(availability)
        
        db.session.commit()
        
        session['user_id'] = user.id
        
        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'doctorId': user.doctor_id,
                'gender': user.gender,
                'specialization': user.specialization
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Signup error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Email and password required'}), 400
        
        logger.info(f"Login attempt for email: {data['email']}")
        
        # Check if database is available
        if not db.engine:
            logger.warning("Database not available, using demo mode")
            # Demo mode - allow login with any credentials
            return jsonify({
                'message': 'Login successful (Demo Mode - Database Unavailable)',
                'user': {
                    'id': 1,
                    'name': data.get('email', 'Demo User').split('@')[0],
                    'email': data['email'],
                    'role': 'patient',
                    'doctorId': None,
                    'gender': None,
                    'specialization': None
                }
            }), 200
        
        # Try to find user by email first
        user = User.query.filter_by(email=data['email']).first()
        
        # If not found and doctorId provided, try to find by doctor_id
        if not user and data.get('doctorId'):
            user = User.query.filter_by(doctor_id=data['doctorId']).first()
        
        if not user:
            logger.warning(f"User not found for email: {data['email']}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        logger.info(f"User found: {user.email}, checking password...")
        
        if not check_password_hash(user.password_hash, data['password']):
            logger.warning(f"Password check failed for user: {user.email}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        session['user_id'] = user.id
        logger.info(f"Login successful for user: {user.email}")
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'doctorId': user.doctor_id,
                'gender': user.gender,
                'specialization': user.specialization
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'doctorId': user.doctor_id,
            'gender': user.gender,
            'specialization': user.specialization
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'doctorId': user.doctor_id,
        'gender': user.gender,
        'specialization': user.specialization
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({'error': 'Email not found'}), 404
        
        return jsonify({
            'message': 'Email verified',
            'email': user.email
        }), 200
        
    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to process request'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.password_hash = generate_password_hash(data['password'])
        db.session.commit()
        
        return jsonify({
            'message': 'Password updated successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'doctorId': user.doctor_id,
                'gender': user.gender,
                'specialization': user.specialization
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Reset password error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to reset password'}), 500
