from flask import Blueprint, request, jsonify, session, send_file
from models import User, HealthData, NotificationSettings, PrivacySettings
from config import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json
import io

settings_bp = Blueprint('settings', __name__)

def login_required(f):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@settings_bp.route('/api/settings/profile', methods=['GET'])
@login_required
def get_profile():
    user = User.query.get(session['user_id'])
    return jsonify({
        'name': user.name,
        'email': user.email,
        'phone': user.phone,
        'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
        'gender': user.gender,
        'profile_picture': user.profile_picture,
        'created_at': user.created_at.isoformat(),
        'last_login': user.last_login.isoformat() if user.last_login else None
    })

@settings_bp.route('/api/settings/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.json
    user = User.query.get(session['user_id'])
    
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        if User.query.filter(User.email == data['email'], User.id != user.id).first():
            return jsonify({'error': 'Email already exists'}), 400
        user.email = data['email']
    if 'phone' in data:
        user.phone = data['phone']
    if 'date_of_birth' in data:
        user.date_of_birth = datetime.fromisoformat(data['date_of_birth']).date() if data['date_of_birth'] else None
    if 'gender' in data:
        user.gender = data['gender']
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})

@settings_bp.route('/api/settings/health-data', methods=['GET'])
@login_required
def get_health_data():
    health_data = HealthData.query.filter_by(user_id=session['user_id']).first()
    if not health_data:
        return jsonify({})
    
    bmi = None
    if health_data.height and health_data.weight:
        height_m = health_data.height / 100
        bmi = round(health_data.weight / (height_m ** 2), 2)
    
    return jsonify({
        'height': health_data.height,
        'weight': health_data.weight,
        'bmi': bmi,
        'blood_group': health_data.blood_group,
        'known_conditions': health_data.known_conditions or [],
        'allergies': health_data.allergies,
        'family_history': health_data.family_history,
        'is_smoker': health_data.is_smoker,
        'alcohol_consumption': health_data.alcohol_consumption,
        'exercise_frequency': health_data.exercise_frequency
    })

@settings_bp.route('/api/settings/health-data', methods=['PUT'])
@login_required
def update_health_data():
    data = request.json
    health_data = HealthData.query.filter_by(user_id=session['user_id']).first()
    
    if not health_data:
        health_data = HealthData(user_id=session['user_id'])
        db.session.add(health_data)
    
    if 'height' in data:
        health_data.height = data['height']
    if 'weight' in data:
        health_data.weight = data['weight']
    if 'blood_group' in data:
        health_data.blood_group = data['blood_group']
    if 'known_conditions' in data:
        health_data.known_conditions = data['known_conditions']
    if 'allergies' in data:
        health_data.allergies = data['allergies']
    if 'family_history' in data:
        health_data.family_history = data['family_history']
    if 'is_smoker' in data:
        health_data.is_smoker = data['is_smoker']
    if 'alcohol_consumption' in data:
        health_data.alcohol_consumption = data['alcohol_consumption']
    if 'exercise_frequency' in data:
        health_data.exercise_frequency = data['exercise_frequency']
    
    db.session.commit()
    return jsonify({'message': 'Health data updated successfully'})

@settings_bp.route('/api/settings/notifications', methods=['GET'])
@login_required
def get_notifications():
    settings = NotificationSettings.query.filter_by(user_id=session['user_id']).first()
    if not settings:
        return jsonify({
            'risk_alerts': True,
            'appointment_updates': True,
            'prescription_alerts': True,
            'emergency_alerts': True,
            'meal_reminders': False,
            'risk_threshold': 70
        })
    
    return jsonify({
        'risk_alerts': settings.risk_alerts,
        'appointment_updates': settings.appointment_updates,
        'prescription_alerts': settings.prescription_alerts,
        'emergency_alerts': settings.emergency_alerts,
        'meal_reminders': settings.meal_reminders,
        'risk_threshold': settings.risk_threshold
    })

@settings_bp.route('/api/settings/notifications', methods=['PUT'])
@login_required
def update_notifications():
    data = request.json
    settings = NotificationSettings.query.filter_by(user_id=session['user_id']).first()
    
    if not settings:
        settings = NotificationSettings(user_id=session['user_id'])
        db.session.add(settings)
    
    if 'risk_alerts' in data:
        settings.risk_alerts = data['risk_alerts']
    if 'appointment_updates' in data:
        settings.appointment_updates = data['appointment_updates']
    if 'prescription_alerts' in data:
        settings.prescription_alerts = data['prescription_alerts']
    if 'emergency_alerts' in data:
        settings.emergency_alerts = data['emergency_alerts']
    if 'meal_reminders' in data:
        settings.meal_reminders = data['meal_reminders']
    if 'risk_threshold' in data:
        settings.risk_threshold = data['risk_threshold']
    
    db.session.commit()
    return jsonify({'message': 'Notification settings updated successfully'})

@settings_bp.route('/api/settings/privacy', methods=['GET'])
@login_required
def get_privacy():
    settings = PrivacySettings.query.filter_by(user_id=session['user_id']).first()
    if not settings:
        return jsonify({'data_sharing_consent': False})
    
    return jsonify({'data_sharing_consent': settings.data_sharing_consent})

@settings_bp.route('/api/settings/privacy', methods=['PUT'])
@login_required
def update_privacy():
    data = request.json
    settings = PrivacySettings.query.filter_by(user_id=session['user_id']).first()
    
    if not settings:
        settings = PrivacySettings(user_id=session['user_id'])
        db.session.add(settings)
    
    if 'data_sharing_consent' in data:
        settings.data_sharing_consent = data['data_sharing_consent']
    
    db.session.commit()
    return jsonify({'message': 'Privacy settings updated successfully'})

@settings_bp.route('/api/settings/export-data', methods=['GET'])
@login_required
def export_data():
    user = User.query.get(session['user_id'])
    health_data = HealthData.query.filter_by(user_id=user.id).first()
    
    export = {
        'profile': {
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'gender': user.gender,
            'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None
        },
        'health_data': {},
        'predictions': [{'disease_type': p.disease_type, 'result': p.prediction_result, 'date': p.created_at.isoformat()} for p in user.predictions]
    }
    
    if health_data:
        export['health_data'] = {
            'height': health_data.height,
            'weight': health_data.weight,
            'blood_group': health_data.blood_group,
            'known_conditions': health_data.known_conditions,
            'allergies': health_data.allergies
        }
    
    return jsonify(export)

@settings_bp.route('/api/settings/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.json
    user = User.query.get(session['user_id'])
    
    if not check_password_hash(user.password_hash, data['old_password']):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    user.password_hash = generate_password_hash(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'})

@settings_bp.route('/api/settings/delete-account', methods=['DELETE'])
@login_required
def delete_account():
    user = User.query.get(session['user_id'])
    db.session.delete(user)
    db.session.commit()
    session.clear()
    
    return jsonify({'message': 'Account deleted successfully'})
