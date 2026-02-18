from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_session import Session
import numpy as np
import joblib
import os
import logging
import pandas as pd
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from sklearn.preprocessing import LabelEncoder
import re
import csv
from sklearn import preprocessing
from sklearn.tree import DecisionTreeClassifier, _tree
import requests
import json
from PIL import Image
import io
from transformers import pipeline
import PyPDF2
import easyocr
import warnings
from config import init_db
from auth import auth_bp
from data_routes import data_bp
from appointment_routes import appointment_bp
from settings_routes import settings_bp
from health_analytics import analytics_bp
from models import User, DoctorAvailability, db, Prediction

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logging.warning("Groq package not installed. Run: pip install groq")

# Suppress EasyOCR warnings
warnings.filterwarnings('ignore', category=UserWarning, module='torch')

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    origins=['http://localhost:3000', 'http://localhost:3001'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization']
)

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
Session(app)

init_db(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(data_bp, url_prefix='/api/data')
app.register_blueprint(appointment_bp, url_prefix='/api/appointments')
app.register_blueprint(settings_bp)
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

# Initialize EasyOCR reader (load once at startup)
_ocr_reader = None
try:
    logger.info("Loading EasyOCR reader with GPU...")
    _ocr_reader = easyocr.Reader(['en'], gpu=True)
    logger.info("EasyOCR reader loaded successfully with GPU")
except Exception as e:
    logger.error(f"Failed to load EasyOCR with GPU: {str(e)}")
    logger.info("Falling back to CPU mode...")
    try:
        _ocr_reader = easyocr.Reader(['en'], gpu=False)
        logger.info("EasyOCR reader loaded successfully with CPU")
    except Exception as e2:
        logger.error(f"Failed to load EasyOCR: {str(e2)}")
        _ocr_reader = None

# Get the absolute path to the backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# Load each model and scaler individually so a failure doesn't block others
_diabetes_path = os.path.join(BACKEND_DIR, 'diabetes.pkl')
_d_scaler_path = os.path.join(BACKEND_DIR, 'd_scaler.pkl')
_liver_path = os.path.join(BACKEND_DIR, 'liver_model.pkl')
_k_scaler_path = os.path.join(BACKEND_DIR, 'k_scaler.pkl')
_kidney_path = os.path.join(BACKEND_DIR, 'kidney_model.pkl')
_h_scaler_path = os.path.join(BACKEND_DIR, 'h_scaler.pkl')
_heart_path = os.path.join(BACKEND_DIR, 'cardio_random_forest.pkl')

# Initialize to None by default
_diabetes_err = _liver_err = _kidney_err = _heart_err = None

diabetes_model = None
diabetes_scaler = None
liver_model = None
kidney_model = None
kidney_scaler = None
heart_model = None
heart_scaler = None

try:
    diabetes_model = joblib.load(_diabetes_path)
    diabetes_scaler = joblib.load(_d_scaler_path)
    logger.info("Diabetes model and scaler loaded successfully")
except Exception as e:
    _diabetes_err = str(e)
    logger.error(f"Failed to load diabetes model/scaler: {_diabetes_err}", exc_info=True)

try:
    import sklearn
    sklearn_version = sklearn.__version__
    liver_model = joblib.load(_liver_path)
    logger.info("Liver model loaded successfully")
except Exception as e:
    _liver_err = str(e)
    logger.warning(f"Liver model not available due to compatibility issue. Liver predictions will be disabled.")

try:
    kidney_scaler = joblib.load(_k_scaler_path)
    kidney_model = joblib.load(_kidney_path)
    logger.info("Kidney model and scaler loaded successfully")
except Exception as e:
    _kidney_err = str(e)
    logger.error(f"Failed to load kidney model/scaler: {_kidney_err}", exc_info=True)

try:
    heart_model = joblib.load(_heart_path)
    logger.info("Heart disease model loaded successfully (Random Forest - no scaler needed)")
except Exception as e:
    _heart_err = str(e)
    logger.error(f"Failed to load heart model: {_heart_err}", exc_info=True)
# Bone fracture and Hugging Face models
_bone_hf_model_id = 'Hemgg/bone-fracture-detection-using-xray'
_bone_allowed_ext = {'.jpg', '.jpeg', '.png'}
_bone_pipeline = None
_bone_model_err = None

try:
    logger.info(f"Loading bone fracture model '{_bone_hf_model_id}'...")
    _bone_pipeline = pipeline(
        task='image-classification',
        model=_bone_hf_model_id,
        device=-1
    )
    logger.info(f"Bone fracture model '{_bone_hf_model_id}' loaded successfully")
except Exception as e:
    _bone_model_err = str(e)
    logger.error(f"Failed to load bone fracture model: {_bone_model_err}", exc_info=True)

def preprocess_bone_image(image_bytes):
    try:
        logger.info(f"Starting image preprocessing, bytes length: {len(image_bytes)}")
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        logger.info(f"Original image size: {img.size}")
        
        img = img.resize((224, 224))  # Change to your model's input size if needed
        logger.info(f"Resized image size: {img.size}")
        
        img_array = np.array(img) / 255.0
        logger.info(f"Image array shape before expand_dims: {img_array.shape}")
        logger.info(f"Image array min/max values: {img_array.min()}/{img_array.max()}")
        
        img_array = np.expand_dims(img_array, axis=0)
        logger.info(f"Final image array shape: {img_array.shape}")
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing bone image: {e}", exc_info=True)
        return None

@app.route('/api/predict/diabetes', methods=['POST'])
def predict_diabetes():
    print(f"diabetes_model: {diabetes_model}, diabetes_scaler: {diabetes_scaler}")
    if diabetes_model is None or diabetes_scaler is None:
        return jsonify({'error': 'Diabetes prediction model not loaded properly'}), 503

    try:
        data = request.get_json()

        # Extract only the 4 required features
        features = [
            float(data['glucose']),  # Glucose
            float(data['bmi']),      # BMI
            float(data['blood_pressure']),  # BloodPressure
            float(data['age'])       # Age
        ]

        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)

        # Scale the features
        scaled_features = diabetes_scaler.transform(features_array)

        # Make prediction
        prediction = diabetes_model.predict(scaled_features)[0]
        probability = diabetes_model.predict_proba(scaled_features)[0][1]

        # Determine risk level
        if probability < 0.33:
            risk_level = "Low Risk"
        elif probability < 0.66:
            risk_level = "Moderate Risk"
        else:
            risk_level = "High Risk"

        # Prepare base response
        response = {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': risk_level,
            'message': f'{risk_level} of diabetes',
            'disclaimer': 'AI-assisted screening only. Not a medical diagnosis. Consult a healthcare professional.'
        }

        # Fetch nearby hospitals for Moderate and High Risk levels
        lat = data.get('latitude')
        lon = data.get('longitude')
        if risk_level in ["Moderate Risk", "High Risk"] and lat and lon:
            try:
                lat = float(lat)
                lon = float(lon)
                hospitals = get_nearby_diabetes_hospitals(lat, lon)
                response['hospitals'] = hospitals
            except Exception as e:
                logger.error(f"Error fetching hospitals: {str(e)}")
                response['hospital_error'] = 'Unable to fetch nearby hospitals'

        # Save prediction to database if user is logged in
        from flask import session
        if 'user_id' in session:
            try:
                pred = Prediction(
                    user_id=session['user_id'],
                    disease_type='diabetes',
                    prediction_result=risk_level,
                    probability=float(probability),
                    risk_level=risk_level,
                    input_data=data
                )
                db.session.add(pred)
                db.session.commit()
            except Exception as e:
                logger.error(f"Failed to save prediction: {str(e)}")
                try:
                    db.session.rollback()
                except:
                    pass

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error in diabetes prediction: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict/liver', methods=['POST'])
def predict_liver():
    if liver_model is None:
        return jsonify({'error': 'Liver prediction model not loaded properly'}), 503

    try:
        data = request.get_json()
        
        # Extract features in the correct order
        features = [
            float(data.get('Age', 0)),
            float(data.get('Gender', 0)),
            float(data.get('Total_Bilirubin', 0)),
            float(data.get('Direct_Bilirubin', 0)),
            float(data.get('Alkaline_Phosphotase', 0)),
            float(data.get('Alamine_Aminotransferase', 0)),
            float(data.get('Aspartate_Aminotransferase', 0)),
            float(data.get('Total_Proteins', 0)),
            float(data.get('Albumin', 0)),
            float(data.get('Albumin_and_Globulin_Ratio', 0))
        ]

        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = liver_model.predict(features_array)[0]
        probability = liver_model.predict_proba(features_array)[0][1]

        # Determine risk level based on probability
        if probability >= 0.8:
            risk_level = "Very High"
        elif probability >= 0.6:
            risk_level = "High"
        elif probability >= 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        response = {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': risk_level,
            'message': f'{risk_level} risk of liver disease'
        }

        # Fetch nearby hospitals for Moderate, High, and Very High risk
        lat = data.get('latitude')
        lon = data.get('longitude')
        if risk_level in ["Moderate", "High", "Very High"] and lat and lon:
            try:
                lat = float(lat)
                lon = float(lon)
                hospitals = get_nearby_specialty_hospitals(lat, lon, ['hepatology', 'gastroenterology', 'general medicine', 'internal medicine'])
                response['hospitals'] = hospitals
            except Exception as e:
                logger.error(f"Error fetching hospitals: {str(e)}")
                response['hospital_error'] = 'Unable to fetch nearby hospitals'

        # Save prediction to database if user is logged in
        from flask import session
        if 'user_id' in session:
            try:
                pred = Prediction(
                    user_id=session['user_id'],
                    disease_type='liver',
                    prediction_result=risk_level,
                    probability=float(probability),
                    risk_level=risk_level,
                    input_data=data
                )
                db.session.add(pred)
                db.session.commit()
            except Exception as e:
                logger.error(f"Failed to save prediction: {str(e)}")
                try:
                    db.session.rollback()
                except:
                    pass

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict/kidney', methods=['POST'])
def predict_kidney():
    if kidney_model is None or kidney_scaler is None:
        return jsonify({'error': 'Kidney prediction model not loaded properly'}), 503

    try:
        data = request.get_json()
        
        # Extract features in the correct order
        features = [
            float(data.get('age', 0)),
            float(data.get('blood_pressure', 0)),
            float(data.get('specific_gravity', 0)),
            float(data.get('albumin', 0)),
            float(data.get('sugar', 0)),
            float(data.get('red_blood_cells', 0)),
            float(data.get('pus_cell', 0)),
            float(data.get('pus_cell_clumps', 0)),
            float(data.get('bacteria', 0)),
            float(data.get('blood_glucose_random', 0)),
            float(data.get('blood_urea', 0)),
            float(data.get('serum_creatinine', 0)),
            float(data.get('sodium', 0)),
            float(data.get('potassium', 0)),
            float(data.get('hemoglobin', 0)),
            float(data.get('packed_cell_volume', 0)),
            float(data.get('white_blood_cell_count', 0)),
            float(data.get('red_blood_cell_count', 0)),
            float(data.get('hypertension', 0)),
            float(data.get('diabetes_mellitus', 0)),
            float(data.get('coronary_artery_disease', 0)),
            float(data.get('appetite', 0)),
            float(data.get('peda_edema', 0)),
            float(data.get('anemia', 0))
        ]

        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)
        
        # Scale the features
        scaled_features = kidney_scaler.transform(features_array)
        
        # Make prediction
        prediction = kidney_model.predict(scaled_features)[0]
        probability = kidney_model.predict_proba(scaled_features)[0][1]

        # Determine risk level based on probability
        if probability >= 0.8:
            risk_level = "Very High"
        elif probability >= 0.6:
            risk_level = "High"
        elif probability >= 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        response = {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': risk_level,
            'message': 'High risk of kidney disease' if prediction == 1 else 'Low risk of kidney disease'
        }

        # Fetch nearby hospitals for Moderate, High, and Very High risk
        lat = data.get('latitude')
        lon = data.get('longitude')
        if risk_level in ["Moderate", "High", "Very High"] and lat and lon:
            try:
                lat = float(lat)
                lon = float(lon)
                hospitals = get_nearby_specialty_hospitals(lat, lon, ['nephrology', 'urology', 'general medicine', 'internal medicine'])
                response['hospitals'] = hospitals
            except Exception as e:
                logger.error(f"Error fetching hospitals: {str(e)}")
                response['hospital_error'] = 'Unable to fetch nearby hospitals'

        # Save prediction to database if user is logged in
        from flask import session
        if 'user_id' in session:
            try:
                pred = Prediction(
                    user_id=session['user_id'],
                    disease_type='kidney',
                    prediction_result=risk_level,
                    probability=float(probability),
                    risk_level=risk_level,
                    input_data=data
                )
                db.session.add(pred)
                db.session.commit()
            except Exception as e:
                logger.error(f"Failed to save prediction: {str(e)}")
                try:
                    db.session.rollback()
                except:
                    pass

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict/heart', methods=['POST'])
def predict_heart():
    if heart_model is None:
        return jsonify({'error': 'Heart disease model not loaded properly'}), 503

    try:
        data = request.get_json()
        
        # Extract features in the correct order for cardio_random_forest.pkl
        features = [
            float(data.get('age', 0)),           # age in years
            float(data.get('height', 0)),        # height in cm
            float(data.get('weight', 0)),        # weight in kg
            float(data.get('gender', 0)),        # 1=Female, 2=Male
            float(data.get('ap_hi', 0)),         # Systolic BP
            float(data.get('ap_lo', 0)),         # Diastolic BP
            float(data.get('cholesterol', 0)),   # 1=Normal, 2=Above Normal, 3=Well Above Normal
            float(data.get('gluc', 0)),          # 1=Normal, 2=Above Normal, 3=Well Above Normal
            float(data.get('smoke', 0)),         # 0=No, 1=Yes
            float(data.get('alco', 0)),          # 0=No, 1=Yes
            float(data.get('active', 0))         # 0=No, 1=Yes
        ]

        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction (no scaling needed for Random Forest)
        prediction = heart_model.predict(features_array)[0]
        probability = heart_model.predict_proba(features_array)[0][1]

        # Determine risk level based on probability
        if probability >= 0.8:
            risk_level = "Very High"
        elif probability >= 0.6:
            risk_level = "High"
        elif probability >= 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        response = {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': risk_level,
            'message': f'{risk_level} risk of cardiovascular disease'
        }

        # Fetch nearby hospitals for Moderate, High, and Very High risk
        lat = data.get('latitude')
        lon = data.get('longitude')
        if risk_level in ["Moderate", "High", "Very High"] and lat and lon:
            try:
                lat = float(lat)
                lon = float(lon)
                hospitals = get_nearby_specialty_hospitals(lat, lon, ['cardiology', 'cardiac surgery', 'general medicine', 'internal medicine'])
                response['hospitals'] = hospitals
            except Exception as e:
                logger.error(f"Error fetching hospitals: {str(e)}")
                response['hospital_error'] = 'Unable to fetch nearby hospitals'

        # Save prediction to database if user is logged in
        from flask import session
        if 'user_id' in session:
            try:
                pred = Prediction(
                    user_id=session['user_id'],
                    disease_type='heart',
                    prediction_result=risk_level,
                    probability=float(probability),
                    risk_level=risk_level,
                    input_data=data
                )
                db.session.add(pred)
                db.session.commit()
            except Exception as e:
                logger.error(f"Failed to save prediction: {str(e)}")
                try:
                    db.session.rollback()
                except:
                    pass

        return jsonify(response)

    except Exception as e:
        logger.error(f"Heart prediction error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    try:
        return jsonify({
            'status': 'Backend server is running',
            'models_loaded': {
                'diabetes': diabetes_model is not None,
                'liver': liver_model is not None,
                'kidney': kidney_model is not None,
                'heart': heart_model is not None
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health endpoint to report which models are available and any load errors
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'models_loaded': {
            'diabetes': diabetes_model is not None,
            'liver': liver_model is not None,
            'kidney': kidney_model is not None and kidney_scaler is not None,
            'heart': heart_model is not None
        },
        'errors': {
            'diabetes': _diabetes_err,
            'liver': _liver_err,
            'kidney': _kidney_err,
            'heart': _heart_err
        }
    })

@app.route('/api/predict/bone-fracture', methods=['POST'])
def predict_bone_fracture():
    if _bone_pipeline is None:
        return jsonify({'error': 'Bone fracture model not loaded', 'details': _bone_model_err}), 503

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in _bone_allowed_ext:
        return jsonify({'error': 'Unsupported file type. Allowed: JPG, JPEG, PNG'}), 400

    try:
        # Read raw bytes and ensure Pillow compatibility
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        # Run inference using Transformers pipeline directly with PIL image
        preds = _bone_pipeline(img)
        logger.info(f"Model predictions: {preds}")
        
        if not preds:
            return jsonify({'error': 'Model returned no predictions'}), 500
        
        top_pred = preds[0]
        label = top_pred['label'].lower()
        score = float(top_pred['score'])
        
        logger.info(f"Top prediction - Label: {label}, Score: {score}")
        
        # Only classify as fracture if confidence is high (>75%) AND label indicates fracture
        is_fracture = False
        if score >= 0.75:
            if 'fracture' in label and 'not' not in label and 'no' not in label:
                is_fracture = True
        
        # If confidence is low (<60%), it's likely not an X-ray
        if score < 0.60:
            return jsonify({
                'error': 'Invalid X-ray image',
                'message': 'The uploaded image does not appear to be a valid bone X-ray. Please upload a clear X-ray image.',
                'confidence': round(score * 100, 2)
            }), 400
        
        norm_label = 'Fracture' if is_fracture else 'No Fracture'
        confidence_pct = round(score * 100.0, 2)

        severity = 'High' if norm_label == 'Fracture' and score >= 0.8 else ('Medium' if norm_label == 'Fracture' else 'Low')
        urgency = 'High' if norm_label == 'Fracture' and score >= 0.8 else ('Medium' if norm_label == 'Fracture' else 'Low')

        recommendations = [
            'Consult an orthopedic specialist for a clinical evaluation.',
            'Consider confirmatory imaging (X-ray with multiple views, CT, or MRI) as advised by a clinician.',
            'Limit weight-bearing or strenuous use of the affected area until medically cleared.'
        ] if norm_label == 'Fracture' else [
            'If symptoms persist, consult a clinician for further evaluation.',
            'Maintain proper posture and avoid high-impact activities until fully asymptomatic.'
        ]

        response = {
            'prediction': norm_label,
            'confidence': score,
            'confidence_pct': confidence_pct,
            'message': f"{norm_label} detected with {confidence_pct}% confidence" if norm_label == 'Fracture' else f"No fracture detected (confidence {confidence_pct}%)",
            'severity_level': severity,
            'urgency': urgency,
            'recommendations': recommendations,
            'disclaimer': 'AI-assisted screening only. Not a medical diagnosis. Always consult a qualified healthcare professional.',
            'pdf_report': {
                'patient_info': {
                    'test_type': 'Bone X-ray Screening',
                    'test_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'analysis_method': f"Transformers pipeline '{_bone_hf_model_id}'"
                },
                'results': {
                    'prediction': norm_label,
                    'confidence_score': f"{confidence_pct}%",
                    'severity_level': severity,
                    'urgency_level': urgency
                },
                'clinical_summary': {
                    'finding': 'Automated AI analysis of the uploaded bone X-ray to screen for potential fracture findings.',
                    'recommendations': recommendations,
                    'next_steps': [
                        'Discuss findings with a healthcare professional.',
                        'Follow up imaging or tests as advised by your clinician.',
                        'Seek urgent care if there is severe pain, deformity, or loss of function.'
                    ]
                },
                'technical_details': {
                    'model_name': _bone_hf_model_id,
                    'model_accuracy': 'N/A (pretrained open-source model)',
                    'image_processed': 'Converted to RGB via Pillow',
                    'analysis_time': 'Approx. < 2s on CPU (varies by hardware)'
                },
                'disclaimer': [
                    'This report is generated by an AI model for screening purposes only.',
                    'It is not a substitute for professional medical advice, diagnosis, or treatment.',
                    'Consult a licensed healthcare provider for clinical interpretation and decisions.'
                ]
            }
        }

        # Save prediction to database if user is logged in
        from flask import session
        if 'user_id' in session:
            try:
                pred = Prediction(
                    user_id=session['user_id'],
                    disease_type='bone_fracture',
                    prediction_result=norm_label,
                    probability=float(score),
                    risk_level=severity,
                    input_data={'confidence': confidence_pct, 'urgency': urgency}
                )
                db.session.add(pred)
                db.session.commit()
            except Exception as e:
                logger.error(f"Failed to save prediction: {str(e)}")
                try:
                    db.session.rollback()
                except:
                    pass

        return jsonify(response)
    except Exception as e:
        logger.error(f"Bone fracture prediction error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to analyze image', 'details': str(e)}), 500

@app.route('/api/groq-chat', methods=['POST'])
def groq_chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()

        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        GROQ_API_KEY = os.getenv('GROQ_API_KEY')
        
        if not GROQ_API_KEY or not GROQ_AVAILABLE:
            return jsonify({
                'response': 'AI assistant is temporarily unavailable. Please consult a healthcare professional.'
            }), 200
        
        client = Groq(api_key=GROQ_API_KEY)
        
        # Detect if this is a meal plan request
        is_meal_plan = 'meal plan' in user_message.lower() or 'days' in user_message.lower()
        
        if is_meal_plan:
            system_prompt = """You are a nutrition AI. Respond ONLY with valid JSON, no other text.
Format: {"days":[{"day":1,"breakfast":"text","lunch":"text","dinner":"text"}],"avoidFoods":["text"],"nutritionTips":["text"]}
Create exactly 7 days. Use Indian meals."""
            max_tokens = 1500
        else:
            system_prompt = """You are a healthcare information assistant.
Provide general medical information only. Do NOT diagnose or prescribe.

Format:
Symptoms Overview:
- point

What You Can Do Now:
- action

When to See a Doctor:
- escalation"""
            max_tokens = 350
        
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1,
            max_tokens=max_tokens,
            top_p=0.9
        )
        
        answer = completion.choices[0].message.content.strip()
        
        if not answer:
            return jsonify({'error': 'Empty response from Groq'}), 500

        return jsonify({'response': answer})

    except Exception as e:
        logger.error(f"Groq error: {str(e)}", exc_info=True)
        return jsonify({
            'response': 'I apologize, but I am temporarily unavailable. For medical concerns, please consult a healthcare professional directly.'
        }), 200

@app.route('/api/hospitals/nearby', methods=['GET'])
def get_nearby_hospitals():
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')

        if not lat or not lon:
            return jsonify({'error': 'Latitude and longitude are required'}), 400

        lat = float(lat)
        lon = float(lon)

        # Try Overpass API first
        try:
            overpass_query = f"""
            [out:json][timeout:10];
            (
              node["amenity"="hospital"](around:60000,{lat},{lon});
              way["amenity"="hospital"](around:60000,{lat},{lon});
            );
            out center meta;
            """

            response = requests.post(
                'https://overpass-api.de/api/interpreter',
                data=overpass_query,
                headers={'Content-Type': 'text/plain'},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                hospitals = []

                for element in data.get('elements', []):
                    tags = element.get('tags', {})
                    name = tags.get('name', 'Unnamed Hospital')

                    if element['type'] == 'node':
                        h_lat, h_lon = element['lat'], element['lon']
                    elif 'center' in element:
                        h_lat, h_lon = element['center']['lat'], element['center']['lon']
                    else:
                        continue

                    distance = calculate_distance(lat, lon, h_lat, h_lon)
                    address_parts = []
                    if 'addr:full' in tags:
                        address_parts.append(tags['addr:full'])
                    else:
                        for key in ['addr:street', 'addr:city', 'addr:state']:
                            if key in tags:
                                address_parts.append(tags[key])
                    address = ', '.join(address_parts) if address_parts else 'Address not available'

                    hospital = {
                        'name': name,
                        'distance': f"{distance:.1f} km",
                        'latitude': h_lat,
                        'longitude': h_lon,
                        'address': address,
                        'type': 'Government' if 'government' in tags.get('operator', '').lower() else 'Private',
                        'phone': tags.get('phone', ''),
                        'specialties': ['General Medicine', 'Emergency'],
                        'rating': 4.0,
                        'recommendation_reason': 'Available healthcare facility'
                    }
                    hospitals.append(hospital)

                hospitals.sort(key=lambda x: float(x['distance'].split()[0]))
                return jsonify({'hospitals': hospitals[:5]})
        except:
            pass

        # Fallback to mock data
        mock_hospitals = [
            {
                'name': 'City General Hospital',
                'distance': '2.5 km',
                'latitude': lat + 0.02,
                'longitude': lon + 0.02,
                'address': 'Main Street, City Center',
                'type': 'Government',
                'phone': '+1-234-567-8900',
                'specialties': ['General Medicine', 'Emergency', 'Cardiology'],
                'rating': 4.5,
                'recommendation_reason': 'Comprehensive healthcare services'
            },
            {
                'name': 'Metro Medical Center',
                'distance': '3.8 km',
                'latitude': lat + 0.03,
                'longitude': lon - 0.02,
                'address': 'Healthcare Avenue',
                'type': 'Private',
                'phone': '+1-234-567-8901',
                'specialties': ['General Medicine', 'Surgery', 'Pediatrics'],
                'rating': 4.3,
                'recommendation_reason': 'Modern facilities and equipment'
            },
            {
                'name': 'Community Health Hospital',
                'distance': '5.2 km',
                'latitude': lat - 0.04,
                'longitude': lon + 0.03,
                'address': 'Community Road',
                'type': 'Government',
                'phone': '+1-234-567-8902',
                'specialties': ['General Medicine', 'Emergency'],
                'rating': 4.0,
                'recommendation_reason': 'Accessible community healthcare'
            }
        ]
        return jsonify({'hospitals': mock_hospitals})

    except Exception as e:
        logger.error(f"Error fetching hospitals: {str(e)}", exc_info=True)
        return jsonify({'error': 'Unable to fetch hospitals'}), 500

def analyze_hospital_with_groq(hospital):
    """Analyze hospital using Groq API to get specialties and rating."""
    try:
        GROQ_API_KEY = os.getenv('GROQ_API_KEY')
        if not GROQ_API_KEY:
            return [], 3.0, "Analysis unavailable"
        GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

        prompt = f"""
        Analyze the following hospital based on its public information:
        Name: {hospital['name']}
        Website: {hospital.get('website', 'Not available')}
        Address: {hospital['address']}
        Type: {hospital['type']}

        Respond with ONLY a valid JSON object in this exact format. Do not include any text before or after the JSON:
        {{"specialties": ["cardiology", "emergency", "orthopedics"], "rating": 4.5, "reason": "Short explanation here"}}

        If information is limited, make reasonable assumptions based on typical hospital data.
        """

        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "model": "llama-3.1-8b-instant",
            "temperature": 0.3
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {GROQ_API_KEY}'
        }

        response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            groq_data = response.json()
            content = groq_data['choices'][0]['message']['content']
            # Try to extract JSON from the response
            import json
            import re
            try:
                # First, try direct JSON parse
                parsed = json.loads(content)
                specialties = parsed.get('specialties', [])
                rating = float(parsed.get('rating', 3.0))
                reason = parsed.get('reason', 'Based on available information')
                return specialties, rating, reason
            except json.JSONDecodeError:
                # If direct parse fails, try to extract JSON using regex
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    try:
                        parsed = json.loads(json_match.group(0))
                        specialties = parsed.get('specialties', [])
                        rating = float(parsed.get('rating', 3.0))
                        reason = parsed.get('reason', 'Based on available information')
                        return specialties, rating, reason
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse extracted JSON for {hospital['name']}: {str(e)}, content: {content}")
                else:
                    logger.error(f"No JSON found in Groq response for {hospital['name']}, content: {content}")
        else:
            logger.warning(f"Groq API error for {hospital['name']}: {response.status_code}")

        # Fallback: Provide default analysis if Groq fails
        default_specialties = ["General Medicine", "Emergency"]
        default_rating = 3.5
        default_reason = "Basic healthcare services available"
        return default_specialties, default_rating, default_reason
    except Exception as e:
        logger.error(f"Error analyzing hospital {hospital['name']} with Groq: {str(e)}")
        return [], 3.0, "Analysis unavailable"

def get_nearby_specialty_hospitals(lat, lon, specialties):
    """Fetch nearby hospitals and filter for specific specialties."""
    try:
        overpass_query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:60000,{lat},{lon});
          way["amenity"="hospital"](around:60000,{lat},{lon});
          relation["amenity"="hospital"](around:60000,{lat},{lon});
        );
        out center meta;
        """

        response = requests.post(
            'https://overpass-api.de/api/interpreter',
            data=overpass_query,
            headers={'Content-Type': 'text/plain'},
            timeout=30
        )

        if response.status_code == 504 or response.status_code != 200:
            logger.warning(f"Overpass API returned status {response.status_code}")
            return []

        data = response.json()
        hospitals = []

        for element in data.get('elements', []):
            tags = element.get('tags', {})
            name = tags.get('name', 'Unnamed Hospital')

            if element['type'] == 'node':
                h_lat, h_lon = element['lat'], element['lon']
            elif 'center' in element:
                h_lat, h_lon = element['center']['lat'], element['center']['lon']
            else:
                continue

            distance = calculate_distance(lat, lon, h_lat, h_lon)

            address_parts = []
            if 'addr:full' in tags:
                address_parts.append(tags['addr:full'])
            else:
                for key in ['addr:housenumber', 'addr:street', 'addr:city', 'addr:state', 'addr:postcode', 'addr:country']:
                    if key in tags:
                        address_parts.append(tags[key])
            address = ', '.join(address_parts) if address_parts else 'Address not available'

            hospital = {
                'name': name,
                'distance': f"{distance:.1f} km",
                'latitude': h_lat,
                'longitude': h_lon,
                'address': address,
                'type': 'Government' if 'government' in tags.get('operator', '').lower() else 'Private',
                'phone': tags.get('phone', ''),
                'website': tags.get('website', ''),
                'emergency': tags.get('emergency', '') == 'yes'
            }
            hospitals.append(hospital)

        hospitals.sort(key=lambda x: float(x['distance'].split()[0]))
        top_hospitals = hospitals[:10]

        enriched_hospitals = []
        for hospital in top_hospitals:
            specs, rating, reason = analyze_hospital_with_groq(hospital)
            hospital['specialties'] = specs
            hospital['rating'] = rating
            hospital['recommendation_reason'] = reason
            enriched_hospitals.append(hospital)

        filtered_hospitals = []
        for hospital in enriched_hospitals:
            if hospital.get('specialties'):
                has_specialty = any(
                    any(s.lower() in spec.lower() for s in specialties)
                    for spec in hospital['specialties']
                )
                if has_specialty:
                    filtered_hospitals.append(hospital)

        if not filtered_hospitals:
            filtered_hospitals = [h for h in enriched_hospitals if 'general' in ' '.join(h.get('specialties', [])).lower()]

        return filtered_hospitals[:5]

    except Exception as e:
        logger.error(f"Error fetching specialty hospitals: {str(e)}", exc_info=True)
        return []

def get_nearby_diabetes_hospitals(lat, lon):
    """Fetch nearby hospitals and filter for diabetes-related specialties."""
    try:
        # Overpass API query for hospitals within 60km radius
        overpass_query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:60000,{lat},{lon});
          way["amenity"="hospital"](around:60000,{lat},{lon});
          relation["amenity"="hospital"](around:60000,{lat},{lon});
        );
        out center meta;
        """

        response = requests.post(
            'https://overpass-api.de/api/interpreter',
            data=overpass_query,
            headers={'Content-Type': 'text/plain'},
            timeout=30
        )

        if response.status_code == 504 or response.status_code != 200:
            logger.warning(f"Overpass API returned status {response.status_code}")
            return []

        data = response.json()
        hospitals = []

        for element in data.get('elements', []):
            tags = element.get('tags', {})
            name = tags.get('name', 'Unnamed Hospital')

            # Get coordinates
            if element['type'] == 'node':
                h_lat, h_lon = element['lat'], element['lon']
            elif 'center' in element:
                h_lat, h_lon = element['center']['lat'], element['center']['lon']
            else:
                continue

            # Calculate distance
            distance = calculate_distance(lat, lon, h_lat, h_lon)

            # Build address
            address_parts = []
            if 'addr:full' in tags:
                address_parts.append(tags['addr:full'])
            else:
                if 'addr:housenumber' in tags:
                    address_parts.append(tags['addr:housenumber'])
                if 'addr:street' in tags:
                    address_parts.append(tags['addr:street'])
                if 'addr:city' in tags:
                    address_parts.append(tags['addr:city'])
                if 'addr:state' in tags:
                    address_parts.append(tags['addr:state'])
                if 'addr:postcode' in tags:
                    address_parts.append(tags['addr:postcode'])
                if 'addr:country' in tags:
                    address_parts.append(tags['addr:country'])
            address = ', '.join(address_parts) if address_parts else tags.get('addr:street', 'Address not available')

            hospital = {
                'name': name,
                'distance': f"{distance:.1f} km",
                'latitude': h_lat,
                'longitude': h_lon,
                'address': address,
                'type': 'Government' if 'government' in tags.get('operator', '').lower() else 'Private',
                'phone': tags.get('phone', ''),
                'website': tags.get('website', ''),
                'emergency': tags.get('emergency', '') == 'yes'
            }
            hospitals.append(hospital)

        # Sort by distance
        hospitals.sort(key=lambda x: float(x['distance'].split()[0]))

        # Limit to top 10 for analysis
        top_hospitals = hospitals[:10]

        # Enrich with Groq analysis
        enriched_hospitals = []
        for hospital in top_hospitals:
            specialties, rating, reason = analyze_hospital_with_groq(hospital)
            hospital['specialties'] = specialties
            hospital['rating'] = rating
            hospital['recommendation_reason'] = reason
            enriched_hospitals.append(hospital)

        # Filter for diabetes-related specialties
        diabetes_specialties = ['diabetology', 'endocrinology', 'diabetes', 'general medicine', 'internal medicine']
        filtered_hospitals = []
        for hospital in enriched_hospitals:
            if hospital.get('specialties'):
                has_diabetes_specialty = any(
                    any(ds.lower() in spec.lower() for ds in diabetes_specialties)
                    for spec in hospital['specialties']
                )
                if has_diabetes_specialty:
                    filtered_hospitals.append(hospital)

        # If no filtered hospitals, include general hospitals
        if not filtered_hospitals:
            filtered_hospitals = [h for h in enriched_hospitals if 'general' in ' '.join(h.get('specialties', [])).lower()]

        # Limit to top 5
        return filtered_hospitals[:5]

    except Exception as e:
        logger.error(f"Error fetching diabetes hospitals: {str(e)}", exc_info=True)
        return []

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    import math
    
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

# Medical Report Analyzer
MEDICAL_PARAMETERS = {
    'glucose': {'pattern': r'glucose[:\s]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (70, 100), 'name': 'Blood Glucose'},
    'hemoglobin': {'pattern': r'h[ae]moglobin[:\s]*([0-9.]+)', 'unit': 'g/dL', 'normal': (12, 16), 'name': 'Hemoglobin'},
    'cholesterol': {'pattern': r'cholesterol[:\s]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (125, 200), 'name': 'Total Cholesterol'},
    'creatinine': {'pattern': r'creatinine[:\s]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (0.6, 1.2), 'name': 'Creatinine'},
    'blood_pressure': {'pattern': r'blood\s*pressure[:\s]*([0-9]+)/([0-9]+)', 'unit': 'mmHg', 'normal': (120, 80), 'name': 'Blood Pressure'},
    'bmi': {'pattern': r'bmi[:\s]*([0-9.]+)', 'unit': '', 'normal': (18.5, 24.9), 'name': 'BMI'},
    'wbc': {'pattern': r'wbc[:\s]*([0-9.]+)', 'unit': 'cells/μL', 'normal': (4000, 11000), 'name': 'White Blood Cells'},
    'rbc': {'pattern': r'rbc[:\s]*([0-9.]+)', 'unit': 'million cells/μL', 'normal': (4.5, 5.5), 'name': 'Red Blood Cells'},
}

def extract_text_from_pdf(file_bytes):
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ''
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + ' '
        return text.strip() if text.strip() else None
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}", exc_info=True)
        return None

def extract_text_from_image(file_bytes):
    try:
        if _ocr_reader is None:
            logger.error("EasyOCR reader not initialized")
            return None
        
        img = Image.open(io.BytesIO(file_bytes))
        img_array = np.array(img)
        
        # Use EasyOCR to extract text
        results = _ocr_reader.readtext(img_array)
        
        # Combine all detected text
        text = ' '.join([result[1] for result in results])
        
        return text.strip() if text.strip() else None
    except Exception as e:
        logger.error(f"EasyOCR error: {str(e)}", exc_info=True)
        return None

def get_health_recommendations(param_key, status, value):
    """Generate personalized health recommendations based on parameter status"""
    recommendations = {
        'medications': [],
        'diet': [],
        'lifestyle': [],
        'follow_up': ''
    }
    
    if param_key == 'glucose':
        if status in ['high', 'slightly high']:
            recommendations['medications'] = ['Consult doctor for Metformin or insulin therapy if prescribed']
            recommendations['diet'] = ['Reduce sugar and refined carbs', 'Eat more fiber-rich foods', 'Include whole grains, vegetables', 'Avoid sugary drinks']
            recommendations['lifestyle'] = ['Exercise 30 minutes daily', 'Monitor blood sugar regularly', 'Maintain healthy weight']
            recommendations['follow_up'] = 'Visit endocrinologist every 3 months for monitoring'
        elif status == 'low':
            recommendations['diet'] = ['Eat small frequent meals', 'Include complex carbohydrates', 'Keep glucose tablets handy']
            recommendations['follow_up'] = 'Consult doctor within 1 week'
    
    elif param_key == 'hemoglobin':
        if status in ['low', 'very low']:
            recommendations['medications'] = ['Iron supplements (Ferrous sulfate 325mg)', 'Vitamin B12 and Folic acid supplements']
            recommendations['diet'] = ['Eat iron-rich foods: spinach, red meat, lentils', 'Include Vitamin C for better iron absorption', 'Eat eggs, fish, dairy products']
            recommendations['follow_up'] = 'Recheck hemoglobin after 1 month'
        elif status == 'high':
            recommendations['lifestyle'] = ['Stay well hydrated', 'Avoid smoking']
            recommendations['follow_up'] = 'Consult hematologist for evaluation'
    
    elif param_key == 'cholesterol':
        if status in ['high', 'slightly high']:
            recommendations['medications'] = ['Statins (Atorvastatin/Rosuvastatin) - as prescribed by doctor']
            recommendations['diet'] = ['Reduce saturated fats', 'Eat more omega-3 fatty acids (fish, walnuts)', 'Include oats, beans, and fruits', 'Avoid trans fats and fried foods']
            recommendations['lifestyle'] = ['Exercise 150 minutes per week', 'Quit smoking', 'Maintain healthy weight']
            recommendations['follow_up'] = 'Lipid profile check every 3-6 months'
    
    elif param_key == 'creatinine':
        if status in ['high', 'slightly high']:
            recommendations['medications'] = ['Consult nephrologist for appropriate medication']
            recommendations['diet'] = ['Reduce protein intake', 'Limit sodium', 'Stay hydrated', 'Avoid NSAIDs']
            recommendations['lifestyle'] = ['Control blood pressure', 'Manage diabetes if present']
            recommendations['follow_up'] = 'Visit nephrologist every 2-3 months'
        elif status == 'low':
            recommendations['diet'] = ['Increase protein intake moderately']
            recommendations['follow_up'] = 'Routine check-up in 6 months'
    
    elif param_key == 'blood_pressure':
        if status in ['high', 'slightly high']:
            recommendations['medications'] = ['ACE inhibitors or ARBs - as prescribed', 'Beta-blockers if needed']
            recommendations['diet'] = ['DASH diet - low sodium', 'Eat more potassium-rich foods', 'Limit alcohol', 'Reduce caffeine']
            recommendations['lifestyle'] = ['Exercise regularly', 'Reduce stress', 'Maintain healthy weight', 'Quit smoking']
            recommendations['follow_up'] = 'Monitor BP daily, visit cardiologist every 3 months'
    
    elif param_key == 'bmi':
        if status in ['high', 'slightly high']:
            recommendations['diet'] = ['Calorie-controlled diet', 'Portion control', 'More vegetables and lean protein', 'Avoid processed foods']
            recommendations['lifestyle'] = ['Regular exercise 5 days/week', 'Strength training', 'Track food intake']
            recommendations['follow_up'] = 'Nutritionist consultation monthly'
        elif status == 'low':
            recommendations['diet'] = ['Increase calorie intake', 'Eat nutrient-dense foods', 'Protein-rich meals']
            recommendations['follow_up'] = 'Consult nutritionist'
    
    elif param_key in ['wbc', 'rbc']:
        if status != 'normal':
            recommendations['follow_up'] = 'Consult hematologist for detailed blood work'
            recommendations['lifestyle'] = ['Adequate rest', 'Balanced nutrition', 'Avoid infections']
    
    # Default recommendations if none specific
    if not any([recommendations['medications'], recommendations['diet'], recommendations['lifestyle']]):
        recommendations['lifestyle'] = ['Maintain healthy lifestyle', 'Regular exercise', 'Balanced diet']
        recommendations['follow_up'] = 'Routine check-up annually'
    
    return recommendations

def analyze_parameters(text):
    results = []
    text_lower = text.lower()
    
    for param_key, param_info in MEDICAL_PARAMETERS.items():
        match = re.search(param_info['pattern'], text_lower, re.IGNORECASE)
        if match:
            if param_key == 'blood_pressure':
                systolic = float(match.group(1))
                diastolic = float(match.group(2))
                value_str = f"{systolic}/{diastolic}"
                
                if systolic < 120 and diastolic < 80:
                    status = 'normal'
                elif systolic < 130 and diastolic < 85:
                    status = 'slightly high'
                else:
                    status = 'high'
                    
                explanation = f"Your blood pressure is {value_str} {param_info['unit']}. "
                if status == 'normal':
                    explanation += "This is within the normal range."
                elif status == 'slightly high':
                    explanation += "This is slightly elevated. Consider lifestyle modifications."
                else:
                    explanation += "This is high. Please consult your doctor."
                    
                results.append({
                    'parameter': param_info['name'],
                    'value': value_str,
                    'unit': param_info['unit'],
                    'status': status,
                    'explanation': explanation,
                    'recommendations': get_health_recommendations(param_key, status, value_str)
                })
            else:
                value = float(match.group(1))
                normal_min, normal_max = param_info['normal']
                
                if normal_min <= value <= normal_max:
                    status = 'normal'
                    explanation = f"Your {param_info['name']} is {value} {param_info['unit']}, which is within the normal range ({normal_min}-{normal_max} {param_info['unit']})."
                elif value < normal_min:
                    status = 'low'
                    explanation = f"Your {param_info['name']} is {value} {param_info['unit']}, which is below the normal range ({normal_min}-{normal_max} {param_info['unit']}). Consider consulting your doctor."
                elif value < normal_min * 0.9:
                    status = 'very low'
                    explanation = f"Your {param_info['name']} is {value} {param_info['unit']}, which is significantly below normal. Please consult your doctor."
                elif value > normal_max:
                    diff = ((value - normal_max) / normal_max) * 100
                    if diff < 10:
                        status = 'slightly high'
                        explanation = f"Your {param_info['name']} is {value} {param_info['unit']}, slightly above the normal range ({normal_min}-{normal_max} {param_info['unit']}). Monitor and consider lifestyle changes."
                    else:
                        status = 'high'
                        explanation = f"Your {param_info['name']} is {value} {param_info['unit']}, which is above the normal range ({normal_min}-{normal_max} {param_info['unit']}). Please consult your doctor."
                else:
                    status = 'normal'
                    explanation = f"Your {param_info['name']} is {value} {param_info['unit']}, which is within acceptable limits."
                
                results.append({
                    'parameter': param_info['name'],
                    'value': str(value),
                    'unit': param_info['unit'],
                    'status': status,
                    'explanation': explanation,
                    'recommendations': get_health_recommendations(param_key, status, value)
                })
    
    return results

@app.route('/api/analyze-report', methods=['POST'])
def analyze_medical_report():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    ext = os.path.splitext(file.filename)[1].lower()
    
    try:
        file_bytes = file.read()
        text = None
        
        if ext == '.pdf':
            text = extract_text_from_pdf(file_bytes)
            if not text:
                return jsonify({'error': 'Could not extract text from PDF. The file may be scanned or image-based. Try uploading as an image instead.'}), 400
        elif ext in ['.jpg', '.jpeg', '.png']:
            text = extract_text_from_image(file_bytes)
            if not text:
                return jsonify({'error': 'Could not extract text from image. Please ensure the image contains clear, readable text.'}), 400
        else:
            return jsonify({'error': 'Unsupported file format. Please upload PDF or image files (JPG, PNG).'}), 400
        
        logger.info(f"Extracted text length: {len(text)} characters")
        
        parameters = analyze_parameters(text)
        
        if not parameters:
            return jsonify({
                'message': 'No medical parameters detected in the report. Please ensure the report contains values like glucose, hemoglobin, cholesterol, etc.',
                'parameters': [],
                'disclaimer': 'This is an AI-assisted analysis and not a medical diagnosis. Always consult a qualified healthcare professional.'
            })
        
        return jsonify({
            'success': True,
            'parameters': parameters,
            'total_found': len(parameters),
            'disclaimer': 'This is an AI-assisted analysis and not a medical diagnosis. Always consult a qualified healthcare professional for proper interpretation of your medical reports.'
        })
        
    except Exception as e:
        logger.error(f"Report analysis error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to analyze report', 'details': str(e)}), 500

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        specialization = request.args.get('specialization')
        min_rating = request.args.get('min_rating', type=float)
        available_only = request.args.get('available_only', 'false').lower() == 'true'

        if not lat or not lon:
            return jsonify({'error': 'Latitude and longitude are required'}), 400

        lat, lon = float(lat), float(lon)

        # Try Overpass API with timeout and error handling
        try:
            overpass_url = "http://overpass-api.de/api/interpreter"
            overpass_query = f"""
            [out:json][timeout:5];
            (
              node["amenity"="doctors"](around:30000,{lat},{lon});
              node["amenity"="clinic"](around:30000,{lat},{lon});
            );
            out body;
            """

            response = requests.post(overpass_url, data={'data': overpass_query}, timeout=8)
            
            if response.status_code == 429:
                logger.warning("Overpass API rate limit exceeded, using fallback data")
                raise Exception("Rate limit")
            
            if response.status_code != 200:
                raise Exception(f"API returned {response.status_code}")

            overpass_data = response.json()
        except Exception as e:
            logger.warning(f"Overpass API failed: {str(e)}, using fallback")
            overpass_data = {'elements': []}

        doctors = []
        import random

        def calculate_distance(lat1, lon1, lat2, lon2):
            from math import radians, sin, cos, sqrt, atan2
            R = 6371
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            return round(R * c, 2)

        specializations = ['Cardiologist', 'General Physician', 'Orthopedic', 'Dermatologist', 'Neurologist', 'Pediatrician']

        # Process Overpass data if available
        for idx, element in enumerate(overpass_data.get('elements', [])):
            tags = element.get('tags', {})
            name = tags.get('name', f"Dr. {random.choice(['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy'])}")
            
            doctor_lat = element.get('lat')
            doctor_lon = element.get('lon')
            
            if not doctor_lat or not doctor_lon:
                continue

            distance = calculate_distance(lat, lon, doctor_lat, doctor_lon)
            rating = round(4.0 + random.random(), 1)
            is_available = random.choice([True, True, True, False])
            
            doctor_spec = tags.get('healthcare:speciality', random.choice(specializations))
            if isinstance(doctor_spec, str) and ';' in doctor_spec:
                doctor_spec = doctor_spec.split(';')[0]
            
            doctor_data = {
                'id': f"doc_{element.get('id')}",
                'name': name,
                'specialization': doctor_spec if isinstance(doctor_spec, str) else random.choice(specializations),
                'hospital': tags.get('operator', 'Medical Center'),
                'latitude': doctor_lat,
                'longitude': doctor_lon,
                'distance': distance,
                'rating': rating,
                'available': is_available,
                'consultation_types': ['video', 'in-person'],
                'address': tags.get('addr:full', tags.get('addr:street', 'N/A')),
                'phone': tags.get('phone', 'N/A')
            }
            
            if specialization and specialization != 'All':
                if specialization.lower() not in doctor_data['specialization'].lower():
                    continue
            
            if min_rating and doctor_data['rating'] < min_rating:
                continue
            
            if available_only and not doctor_data['available']:
                continue
            
            doctors.append(doctor_data)

        # Fallback: Generate mock doctors if API failed or returned few results
        if len(doctors) < 5:
            mock_doctors = [
                {'name': 'Dr. Rajesh Kumar', 'spec': 'Cardiologist', 'hospital': 'City Heart Hospital', 'dist': 2.5},
                {'name': 'Dr. Priya Sharma', 'spec': 'General Physician', 'hospital': 'Metro Medical Center', 'dist': 3.2},
                {'name': 'Dr. Amit Patel', 'spec': 'Orthopedic', 'hospital': 'Bone Care Clinic', 'dist': 4.1},
                {'name': 'Dr. Sneha Reddy', 'spec': 'Dermatologist', 'hospital': 'Skin Wellness Center', 'dist': 3.8},
                {'name': 'Dr. Vikram Singh', 'spec': 'Neurologist', 'hospital': 'Neuro Care Hospital', 'dist': 5.5},
                {'name': 'Dr. Anjali Verma', 'spec': 'Pediatrician', 'hospital': 'Children Health Clinic', 'dist': 2.9}
            ]
            
            for idx, mock in enumerate(mock_doctors):
                if len(doctors) >= 10:
                    break
                    
                doctor_data = {
                    'id': f"mock_{idx}",
                    'name': mock['name'],
                    'specialization': mock['spec'],
                    'hospital': mock['hospital'],
                    'latitude': lat + random.uniform(-0.05, 0.05),
                    'longitude': lon + random.uniform(-0.05, 0.05),
                    'distance': mock['dist'],
                    'rating': round(4.0 + random.random(), 1),
                    'available': random.choice([True, True, False]),
                    'consultation_types': ['video', 'in-person'],
                    'address': f"{mock['hospital']}, Medical District",
                    'phone': f"+91-{random.randint(7000000000, 9999999999)}"
                }
                
                if specialization and specialization != 'All':
                    if specialization.lower() not in doctor_data['specialization'].lower():
                        continue
                
                if min_rating and doctor_data['rating'] < min_rating:
                    continue
                
                if available_only and not doctor_data['available']:
                    continue
                
                doctors.append(doctor_data)

        doctors.sort(key=lambda x: x['distance'])
        return jsonify({'doctors': doctors[:20]})

    except Exception as e:
        logger.error(f"Error fetching doctors: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to fetch doctors'}), 500

@app.route('/api/start-video-call', methods=['POST'])
def start_video_call():
    try:
        data = request.get_json()
        doctor_id = data.get('doctor_id')
        
        if not doctor_id:
            return jsonify({'error': 'Doctor ID is required'}), 400

        doctors_path = os.path.join(BACKEND_DIR, 'doctors_data.json')
        with open(doctors_path, 'r') as f:
            doctors = json.load(f)

        doctor = next((d for d in doctors if d['id'] == doctor_id), None)
        
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404

        if not doctor['available']:
            return jsonify({'error': 'Doctor is currently unavailable'}), 400

        if 'video' not in doctor['consultation_types']:
            return jsonify({'error': 'Doctor does not support video consultations'}), 400

        import uuid
        room_id = f"consultation-{doctor_id}-{uuid.uuid4().hex[:8]}"

        return jsonify({
            'success': True,
            'room_id': room_id,
            'doctor_name': doctor['name'],
            'specialization': doctor['specialization']
        })

    except Exception as e:
        logger.error(f"Error starting video call: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/symptom-checker', methods=['POST'])
def symptom_checker():
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', '').strip()
        duration = data.get('duration', '')
        severity = data.get('severity', '')

        if len(symptoms) < 10:
            return jsonify({'error': 'Please provide more detailed symptoms (at least 10 characters)'}), 400

        # Use Groq API for symptom analysis
        GROQ_API_KEY = os.getenv('GROQ_API_KEY')
        
        if not GROQ_API_KEY or not GROQ_AVAILABLE:
            return jsonify({'error': 'AI service temporarily unavailable'}), 503
        
        client = Groq(api_key=GROQ_API_KEY)
        
        prompt = f"""Analyze these symptoms and predict the top 3 most likely diseases with confidence scores.
Symptoms: {symptoms}
Duration: {duration}
Severity: {severity}

Respond ONLY with valid JSON in this format:
{{
  "predictions": [
    {{"disease": "Disease Name", "confidence": 85.5, "risk": "High", "explanation": "Brief explanation"}},
    {{"disease": "Disease Name", "confidence": 65.2, "risk": "Moderate"}},
    {{"disease": "Disease Name", "confidence": 45.8, "risk": "Low"}}
  ]
}}

Consider these diseases: Heart Disease, Diabetes, Liver Disease, Kidney Disease, Pneumonia, Asthma, Influenza, Migraine, Hypertension, Gastritis.
Risk levels: High (>70%), Moderate (50-70%), Low (<50%)."""
        
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Parse JSON response
        import json
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group(0))
            predictions = result.get('predictions', [])
            
            if predictions:
                response = {
                    'top_prediction': predictions[0],
                    'other_conditions': predictions[1:3] if len(predictions) > 1 else []
                }
                return jsonify(response)
        
        return jsonify({'error': 'Unable to analyze symptoms'}), 500

    except Exception as e:
        logger.error(f"Symptom checker error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to analyze symptoms', 'details': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(debug=True)
