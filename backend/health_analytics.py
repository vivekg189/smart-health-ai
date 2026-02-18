from flask import Blueprint, jsonify, session
from models import Prediction, HealthData
from config import db
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics', __name__)

def require_auth(f):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@analytics_bp.route('/health-trends', methods=['GET'])
@require_auth
def get_health_trends():
    try:
        user_id = session.get('user_id')
        logger.info(f"Fetching health trends for user_id: {user_id}")
        
        predictions = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.asc()).all()
        logger.info(f"Found {len(predictions)} predictions for user {user_id}")
        
        trends = {
            'diabetes': [],
            'heart': [],
            'liver': [],
            'kidney': [],
            'bone': []
        }
        
        for pred in predictions:
            disease = pred.disease_type.lower()
            data_point = {
                'date': pred.created_at.strftime('%Y-%m-%d'),
                'risk': pred.probability * 100 if pred.probability else 0,
                'risk_level': pred.risk_level
            }
            
            if 'diabetes' in disease:
                trends['diabetes'].append(data_point)
            elif 'heart' in disease or 'cardio' in disease:
                trends['heart'].append(data_point)
            elif 'liver' in disease:
                trends['liver'].append(data_point)
            elif 'kidney' in disease:
                trends['kidney'].append(data_point)
            elif 'bone' in disease or 'fracture' in disease:
                trends['bone'].append(data_point)
        
        logger.info(f"Trends data: {trends}")
        return jsonify({'trends': trends}), 200
        
    except Exception as e:
        logger.error(f"Get health trends error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to fetch health trends'}), 500

@analytics_bp.route('/risk-forecast', methods=['GET'])
@require_auth
def get_risk_forecast():
    try:
        user_id = session.get('user_id')
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_predictions = Prediction.query.filter(
            Prediction.user_id == user_id,
            Prediction.created_at >= thirty_days_ago
        ).order_by(Prediction.created_at.desc()).all()
        
        forecasts = []
        
        disease_groups = {}
        for pred in recent_predictions:
            disease = pred.disease_type
            if disease not in disease_groups:
                disease_groups[disease] = []
            disease_groups[disease].append(pred)
        
        for disease, preds in disease_groups.items():
            if len(preds) >= 2:
                latest = preds[0]
                previous = preds[-1]
                
                latest_risk = latest.probability * 100 if latest.probability else 0
                prev_risk = previous.probability * 100 if previous.probability else 0
                
                change = latest_risk - prev_risk
                change_pct = (change / prev_risk * 100) if prev_risk > 0 else 0
                
                trend = 'increasing' if change > 5 else ('decreasing' if change < -5 else 'stable')
                
                forecast = {
                    'disease': disease,
                    'current_risk': round(latest_risk, 2),
                    'previous_risk': round(prev_risk, 2),
                    'change': round(change, 2),
                    'change_percentage': round(change_pct, 2),
                    'trend': trend,
                    'warning': generate_warning(disease, trend, latest_risk, change_pct)
                }
                forecasts.append(forecast)
        
        return jsonify({'forecasts': forecasts}), 200
        
    except Exception as e:
        logger.error(f"Get risk forecast error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to fetch risk forecast'}), 500

def generate_warning(disease, trend, current_risk, change_pct):
    if trend == 'increasing' and current_risk > 60:
        return f"Your {disease} risk has increased by {abs(change_pct):.1f}% in the last 30 days. Consider consulting a specialist."
    elif trend == 'increasing':
        return f"Your {disease} risk is trending upward. Monitor your health parameters closely."
    elif trend == 'decreasing':
        return f"Good progress! Your {disease} risk has decreased by {abs(change_pct):.1f}%."
    else:
        return f"Your {disease} risk remains stable. Continue maintaining healthy habits."

@analytics_bp.route('/ai-copilot-insights', methods=['GET'])
@require_auth
def get_ai_copilot_insights():
    try:
        user_id = session.get('user_id')
        
        latest_predictions = Prediction.query.filter_by(user_id=user_id).order_by(
            Prediction.created_at.desc()
        ).limit(5).all()
        
        health_data = HealthData.query.filter_by(user_id=user_id).first()
        
        insights = []
        
        for pred in latest_predictions:
            risk = pred.probability * 100 if pred.probability else 0
            
            if risk > 70:
                insights.append({
                    'type': 'critical',
                    'disease': pred.disease_type,
                    'message': f"High {pred.disease_type} risk detected ({risk:.1f}%). Immediate medical consultation recommended.",
                    'action': 'Schedule appointment with specialist'
                })
            elif risk > 50:
                insights.append({
                    'type': 'warning',
                    'disease': pred.disease_type,
                    'message': f"Moderate {pred.disease_type} risk ({risk:.1f}%). Lifestyle modifications advised.",
                    'action': 'Review diet and exercise routine'
                })
        
        if health_data:
            bmi = calculate_bmi(health_data.weight, health_data.height)
            if bmi:
                if bmi > 30:
                    insights.append({
                        'type': 'warning',
                        'disease': 'Obesity',
                        'message': f"Your BMI is {bmi:.1f}, indicating obesity. This increases risk for multiple conditions.",
                        'action': 'Consult nutritionist for weight management plan'
                    })
                elif bmi > 25:
                    insights.append({
                        'type': 'info',
                        'disease': 'Weight Management',
                        'message': f"Your BMI is {bmi:.1f}, slightly above normal range.",
                        'action': 'Consider balanced diet and regular exercise'
                    })
            
            if health_data.is_smoker:
                insights.append({
                    'type': 'critical',
                    'disease': 'Smoking',
                    'message': "Smoking significantly increases cardiovascular and respiratory disease risk.",
                    'action': 'Seek smoking cessation support'
                })
        
        if not insights:
            insights.append({
                'type': 'success',
                'disease': 'Overall Health',
                'message': "Your health metrics look good! Keep maintaining healthy habits.",
                'action': 'Continue regular health monitoring'
            })
        
        return jsonify({'insights': insights}), 200
        
    except Exception as e:
        logger.error(f"Get AI copilot insights error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to fetch AI insights'}), 500

def calculate_bmi(weight, height):
    if weight and height and height > 0:
        return weight / ((height / 100) ** 2)
    return None
