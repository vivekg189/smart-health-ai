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
from migrations import run_migrations
from auth import auth_bp
from data_routes import data_bp
from appointment_routes import appointment_bp
from settings_routes import settings_bp
from health_analytics import analytics_bp
from doctor_routes import doctor_bp
from doctor_recommendation import doctor_recommendation_bp
from models import User, DoctorAvailability, db, Prediction
from cardiovascular_multimodal import predict_cardiovascular, generate_report as generate_cardio_report

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

# Suppress verbose Groq/httpcore debug logs
logging.getLogger('groq').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)
logging.getLogger('httpx').setLevel(logging.WARNING)

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
    methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization'],
    expose_headers=['Content-Type'],
    max_age=3600
)

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
Session(app)

init_db(app)

# Run auto-migrations
try:
    run_migrations(app, db)
except Exception as e:
    logger.warning(f"Auto-migration skipped: {e}")

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(data_bp, url_prefix='/api/data')
app.register_blueprint(appointment_bp, url_prefix='/api/appointments')
app.register_blueprint(settings_bp)
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(doctor_bp, url_prefix='/api/doctor')
app.register_blueprint(doctor_recommendation_bp, url_prefix='/api/recommend')

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
                if not db.engine:
                    logger.warning("Database not configured, prediction not saved")
                else:
                    # Get doctor_id from request if patient selected a doctor
                    doctor_id = data.get('doctor_id')
                    
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
                    
                    response['prediction_id'] = str(pred.id)
                    logger.info(f"✅ Prediction saved: ID={pred.id}, User={session['user_id']}, Type=diabetes")
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

@app.route('/api/transcribe-audio', methods=['POST'])
def transcribe_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        GROQ_API_KEY = os.getenv('GROQ_API_KEY')
        
        if not GROQ_API_KEY or not GROQ_AVAILABLE:
            return jsonify({'error': 'Transcription service unavailable'}), 503
        
        # Save to temp file with proper extension
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
            audio_file.save(tmp.name)
            tmp_path = tmp.name
        
        try:
            with open(tmp_path, 'rb') as f:
                client = Groq(api_key=GROQ_API_KEY)
                transcription = client.audio.transcriptions.create(
                    file=("audio.webm", f.read(), "audio/webm"),
                    model="whisper-large-v3",
                    language="en",
                    temperature=0.0
                )
            os.unlink(tmp_path)
            
            text = transcription.text if hasattr(transcription, 'text') else str(transcription)
            
            # Extract duration and severity using AI
            duration = None
            severity = None
            
            try:
                completion = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{
                        "role": "user",
                        "content": f"""Extract duration and severity from this symptom description. Respond ONLY with JSON.

Text: {text}

Duration options: "1-2 days", "3-7 days", "1-2 weeks", "More than 2 weeks"
Severity options: "Mild", "Moderate", "Severe"

JSON format: {{"duration": "value or null", "severity": "value or null"}}"""
                    }],
                    temperature=0.1,
                    max_tokens=100
                )
                
                import json, re
                response = completion.choices[0].message.content.strip()
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    duration = parsed.get('duration')
                    severity = parsed.get('severity')
            except Exception as e:
                logger.warning(f"Failed to extract duration/severity: {e}")
            
            return jsonify({
                'text': text,
                'duration': duration,
                'severity': severity
            })
        except Exception as e:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise e
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to transcribe: {str(e)}'}), 500

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

# Medical Report Analyzer with AI
_ner_pipeline = None
_summarizer_pipeline = None
_table_qa_pipeline = None

try:
    logger.info("Loading biomedical NER model...")
    _ner_pipeline = pipeline("ner", model="d4data/biomedical-ner-all", aggregation_strategy="simple", device=-1)
    logger.info("Biomedical NER model loaded successfully")
except Exception as e:
    logger.warning(f"NER model not available: {str(e)}")
    _ner_pipeline = None

try:
    logger.info("Loading clinical summarizer model...")
    _summarizer_pipeline = pipeline("text2text-generation", model="google/flan-t5-large", device=-1, max_length=512)
    logger.info("Clinical summarizer model loaded successfully")
except Exception as e:
    logger.warning(f"Summarizer model not available: {str(e)}")
    _summarizer_pipeline = None

# Try to load table extraction model for structured reports
try:
    logger.info("Loading table QA model for structured extraction...")
    from transformers import TapasTokenizer, TapasForQuestionAnswering
    _table_qa_pipeline = pipeline("table-question-answering", model="google/tapas-base-finetuned-wtq", device=-1)
    logger.info("Table QA model loaded successfully")
except Exception as e:
    logger.warning(f"Table QA model not available: {str(e)}")
    _table_qa_pipeline = None

MEDICAL_PARAMETERS = {
    'glucose': {'pattern': r'(?:blood\s+)?(?:glucose|sugar|fasting\s+blood\s+sugar|fbs|random\s+blood\s+sugar|rbs)[:\s=-]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (70, 100), 'name': 'Blood Glucose', 'borderline': (100, 125), 'aliases': ['glucose', 'sugar', 'fbs', 'rbs', 'blood sugar']},
    'hemoglobin': {'pattern': r'(?:h[ae]?moglobin|hb|haemoglobin)[:\s=-]*([0-9.]+)', 'unit': 'g/dL', 'normal': (12, 16), 'name': 'Hemoglobin', 'borderline': (11, 12), 'aliases': ['hemoglobin', 'hb', 'haemoglobin']},
    'cholesterol': {'pattern': r'(?:total\s+)?(?:cholesterol|chol)[:\s=-]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (125, 200), 'name': 'Total Cholesterol', 'borderline': (200, 240), 'aliases': ['cholesterol', 'chol', 'total cholesterol']},
    'ldl': {'pattern': r'(?:ldl|low\s+density\s+lipoprotein)(?:\s+cholesterol)?[:\s=-]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (0, 100), 'name': 'LDL Cholesterol', 'borderline': (100, 130), 'aliases': ['ldl', 'ldl cholesterol']},
    'hdl': {'pattern': r'(?:hdl|high\s+density\s+lipoprotein)(?:\s+cholesterol)?[:\s=-]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (40, 60), 'name': 'HDL Cholesterol', 'borderline': (35, 40), 'aliases': ['hdl', 'hdl cholesterol']},
    'triglycerides': {'pattern': r'(?:triglycerides?|tg)[:\s=-]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (0, 150), 'name': 'Triglycerides', 'borderline': (150, 200), 'aliases': ['triglycerides', 'tg']},
    'creatinine': {'pattern': r'(?:serum\s+)?(?:creatinine|creat)[:\s=-]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (0.6, 1.2), 'name': 'Creatinine', 'borderline': (1.2, 1.5), 'aliases': ['creatinine', 'creat', 'serum creatinine']},
    'blood_urea': {'pattern': r'(?:blood\s+)?(?:urea|bun|blood\s+urea\s+nitrogen)[:\s=-]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (7, 20), 'name': 'Blood Urea', 'borderline': (20, 25), 'aliases': ['urea', 'bun', 'blood urea']},
    'alt': {'pattern': r'(?:sgpt|alt|alanine\s+aminotransferase|alanine)[:\s=-]*([0-9.]+)', 'unit': 'IU/L', 'normal': (7, 56), 'name': 'ALT (SGPT)', 'borderline': (56, 70), 'aliases': ['alt', 'sgpt', 'alanine']},
    'ast': {'pattern': r'(?:sgot|ast|aspartate\s+aminotransferase|aspartate)[:\s=-]*([0-9.]+)', 'unit': 'IU/L', 'normal': (10, 40), 'name': 'AST (SGOT)', 'borderline': (40, 50), 'aliases': ['ast', 'sgot', 'aspartate']},
    'bilirubin_total': {'pattern': r'(?:total\s+)?(?:bilirubin|bili)[:\s=-]*([0-9.]+)', 'unit': 'mg/dL', 'normal': (0.1, 1.2), 'name': 'Total Bilirubin', 'borderline': (1.2, 1.5), 'aliases': ['bilirubin', 'bili', 'total bilirubin']},
    'albumin': {'pattern': r'(?:serum\s+)?albumin[:\s=-]*([0-9.]+)', 'unit': 'g/dL', 'normal': (3.5, 5.5), 'name': 'Albumin', 'borderline': (3.0, 3.5), 'aliases': ['albumin', 'serum albumin']},
    'blood_pressure': {'pattern': r'(?:blood\s+)?(?:pressure|bp)[:\s=-]*([0-9]+)\s*[/\\]\s*([0-9]+)', 'unit': 'mmHg', 'normal': (120, 80), 'name': 'Blood Pressure', 'aliases': ['bp', 'blood pressure']},
    'bmi': {'pattern': r'(?:bmi|body\s+mass\s+index)[:\s=-]*([0-9.]+)', 'unit': '', 'normal': (18.5, 24.9), 'name': 'BMI', 'borderline': (25, 29.9), 'aliases': ['bmi', 'body mass index']},
    'wbc': {'pattern': r'(?:wbc|white\s+blood\s+cell|leucocyte)[:\s=-]*([0-9.]+)', 'unit': 'cells/μL', 'normal': (4000, 11000), 'name': 'White Blood Cells', 'borderline': (3500, 4000), 'aliases': ['wbc', 'white blood cell', 'leucocyte']},
    'rbc': {'pattern': r'(?:rbc|red\s+blood\s+cell|erythrocyte)[:\s=-]*([0-9.]+)', 'unit': 'million cells/μL', 'normal': (4.5, 5.5), 'name': 'Red Blood Cells', 'borderline': (4.0, 4.5), 'aliases': ['rbc', 'red blood cell', 'erythrocyte']},
    'platelets': {'pattern': r'(?:platelet[s]?|plt)[:\s=-]*([0-9.]+)', 'unit': 'cells/μL', 'normal': (150000, 450000), 'name': 'Platelets', 'borderline': (130000, 150000), 'aliases': ['platelets', 'plt']},
    'hba1c': {'pattern': r'(?:hba1c|glycated\s+hemoglobin|glycosylated\s+hemoglobin)[:\s=-]*([0-9.]+)', 'unit': '%', 'normal': (4, 5.6), 'name': 'HbA1c', 'borderline': (5.7, 6.4), 'aliases': ['hba1c', 'glycated hemoglobin']},
    'tsh': {'pattern': r'(?:tsh|thyroid\s+stimulating\s+hormone)[:\s=-]*([0-9.]+)', 'unit': 'mIU/L', 'normal': (0.4, 4.0), 'name': 'TSH', 'borderline': (4.0, 5.0), 'aliases': ['tsh', 'thyroid stimulating hormone']},
    't3': {'pattern': r'(?:t3|triiodothyronine)[:\s=-]*([0-9.]+)', 'unit': 'ng/dL', 'normal': (80, 200), 'name': 'T3', 'borderline': (70, 80), 'aliases': ['t3', 'triiodothyronine']},
    't4': {'pattern': r'(?:t4|thyroxine)[:\s=-]*([0-9.]+)', 'unit': 'μg/dL', 'normal': (5, 12), 'name': 'T4', 'borderline': (4, 5), 'aliases': ['t4', 'thyroxine']},
    'sodium': {'pattern': r'(?:serum\s+)?(?:sodium|na)[:\s=-]*([0-9.]+)', 'unit': 'mEq/L', 'normal': (136, 145), 'name': 'Sodium', 'borderline': (135, 136), 'aliases': ['sodium', 'na', 'serum sodium']},
    'potassium': {'pattern': r'(?:serum\s+)?(?:potassium|k)[:\s=-]*([0-9.]+)', 'unit': 'mEq/L', 'normal': (3.5, 5.0), 'name': 'Potassium', 'borderline': (3.3, 3.5), 'aliases': ['potassium', 'k', 'serum potassium']},
}

def extract_text_from_pdf(file_bytes):
    """Enhanced PDF text extraction with layout preservation"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ''
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
        return text.strip() if text.strip() else None
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}", exc_info=True)
        return None

def preprocess_image_for_ocr(img):
    """Enhance image quality for better OCR results"""
    try:
        import cv2
        
        # Convert PIL to OpenCV format
        img_array = np.array(img)
        
        # Convert to grayscale
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array
        
        # Apply thresholding to get better contrast
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        # Increase contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised)
        
        return enhanced
    except Exception as e:
        logger.warning(f"Image preprocessing failed: {e}, using original")
        return np.array(img)

def clean_ocr_text(text):
    """Clean OCR output to remove gibberish and fix common errors"""
    if not text:
        return text
    
    # Remove non-printable characters except newlines and spaces
    text = ''.join(char for char in text if char.isprintable() or char in '\n\t')
    
    # Fix common OCR errors
    replacements = {
        'O': '0',  # Letter O to zero in numeric contexts
        'l': '1',  # Lowercase L to one in numeric contexts
        'I': '1',  # Capital I to one in numeric contexts
        'S': '5',  # S to 5 in numeric contexts
        'B': '8',  # B to 8 in numeric contexts
    }
    
    # Apply replacements only in numeric contexts
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Skip lines with too many special characters (likely gibberish)
        special_char_ratio = sum(1 for c in line if not c.isalnum() and c not in ' .-:/()') / max(len(line), 1)
        if special_char_ratio > 0.5:
            continue
        
        # Skip very short lines (likely noise)
        if len(line.strip()) < 3:
            continue
        
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def extract_text_from_image(file_bytes):
    """Enhanced OCR with preprocessing, fallback, and text cleaning"""
    try:
        if _ocr_reader is None:
            logger.error("EasyOCR reader not initialized")
            return None
        
        img = Image.open(io.BytesIO(file_bytes))
        
        # Check image size
        width, height = img.size
        logger.info(f"Image dimensions: {width}x{height}")
        
        if width < 800 or height < 600:
            logger.warning(f"Image resolution is low ({width}x{height}). Recommend >1200x1600 for best results.")
        
        # Try with preprocessing first
        text = None
        try:
            img_enhanced = preprocess_image_for_ocr(img)
            results = _ocr_reader.readtext(img_enhanced, detail=1, paragraph=False, batch_size=4)
            logger.info(f"OCR extracted {len(results)} text blocks with preprocessing")
            
            if results:
                # Sort by position and group into lines
                sorted_results = sorted(results, key=lambda x: (x[0][0][1], x[0][0][0]))
                
                lines = []
                current_line = []
                current_y = None
                y_threshold = 30
                
                for bbox, text_block, conf in sorted_results:
                    if conf < 0.2:  # Lower threshold
                        continue
                    
                    y_pos = bbox[0][1]
                    
                    if current_y is None:
                        current_y = y_pos
                        current_line.append(text_block)
                    elif abs(y_pos - current_y) < y_threshold:
                        current_line.append(text_block)
                    else:
                        if current_line:
                            lines.append(' '.join(current_line))
                        current_line = [text_block]
                        current_y = y_pos
                
                if current_line:
                    lines.append(' '.join(current_line))
                
                text = '\n'.join(lines) if lines else None
        except Exception as e:
            logger.warning(f"Preprocessing failed: {e}")
        
        # Fallback: Try Tesseract if EasyOCR fails
        if not text or len(text.strip()) < 50:
            try:
                import pytesseract
                logger.info("Trying Tesseract OCR as fallback...")
                
                # Convert to grayscale for Tesseract
                img_gray = img.convert('L')
                text_tesseract = pytesseract.image_to_string(img_gray, config='--psm 6')
                
                if text_tesseract and len(text_tesseract.strip()) > len(text.strip() if text else ''):
                    text = text_tesseract
                    logger.info(f"Tesseract extracted {len(text)} characters")
            except Exception as e:
                logger.warning(f"Tesseract fallback failed: {e}")
        
        # Clean the extracted text
        if text:
            text = clean_ocr_text(text)
            logger.info(f"OCR final text length: {len(text)} characters after cleaning")
            
            # Log preview for debugging
            if len(text) < 100:
                logger.warning(f"OCR extracted very little text: '{text}'")
        else:
            logger.error("OCR produced empty text")
        
        return text
    except Exception as e:
        logger.error(f"OCR error: {str(e)}", exc_info=True)
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

def extract_parameters_with_ai(text):
    """Enhanced AI-based parameter extraction using NER + contextual matching"""
    if not _ner_pipeline:
        return []
    
    try:
        # Run NER on text
        entities = _ner_pipeline(text[:5000])
        extracted = []
        
        for entity in entities:
            if entity['entity_group'] in ['TEST', 'MEASUREMENT', 'VALUE', 'DISEASE']:
                extracted.append({
                    'text': entity['word'],
                    'type': entity['entity_group'],
                    'score': entity['score'],
                    'start': entity.get('start', 0),
                    'end': entity.get('end', 0)
                })
        
        return extracted
    except Exception as e:
        logger.error(f"AI NER extraction error: {str(e)}")
        return []

def extract_with_ai_context(text):
    """Use AI to extract parameter-value pairs from unstructured text"""
    if not _summarizer_pipeline:
        return {}
    
    try:
        # Ask AI to extract lab values
        prompt = f"""Extract all medical lab test values from this text. Format as 'Test: Value Unit'.

Text: {text[:1500]}

Extracted values:"""
        
        result = _summarizer_pipeline(prompt, max_length=300, min_length=50, do_sample=False)
        ai_output = result[0]['generated_text'].strip()
        
        # Parse AI output to extract parameters
        extracted_params = {}
        lines = ai_output.split('\n')
        for line in lines:
            if ':' in line:
                parts = line.split(':', 1)
                if len(parts) == 2:
                    param_name = parts[0].strip().lower()
                    value_str = parts[1].strip()
                    # Extract numeric value
                    value_match = re.search(r'([0-9.]+)', value_str)
                    if value_match:
                        extracted_params[param_name] = value_match.group(1)
        
        return extracted_params
    except Exception as e:
        logger.warning(f"AI context extraction failed: {str(e)}")
        return {}

def fuzzy_match_parameter(text, param_aliases):
    """Fuzzy matching for parameter names in text"""
    text_lower = text.lower()
    for alias in param_aliases:
        if alias.lower() in text_lower:
            return True
    return False

def extract_value_near_parameter(text, param_name, window=100):
    """Extract numeric value near a parameter name"""
    text_lower = text.lower()
    param_pos = text_lower.find(param_name.lower())
    
    if param_pos == -1:
        return None
    
    # Look for number within window characters after parameter name
    search_text = text[param_pos:param_pos + window]
    value_match = re.search(r'[:\s=-]+([0-9.]+)', search_text)
    
    if value_match:
        return value_match.group(1)
    
    return None

def classify_value_status(value, normal_range, borderline_range=None):
    """Classify parameter value as HIGH, LOW, BORDERLINE, or NORMAL"""
    normal_min, normal_max = normal_range
    
    if value < normal_min:
        if borderline_range and value >= borderline_range[0]:
            return 'BORDERLINE_LOW'
        return 'LOW'
    elif value > normal_max:
        if borderline_range and value <= borderline_range[1]:
            return 'BORDERLINE_HIGH'
        return 'HIGH'
    else:
        return 'NORMAL'

def generate_clinical_summary(abnormal_params):
    """AI-powered clinical summary with Flan-T5"""
    if not abnormal_params:
        return "All parameters are within normal range. Continue maintaining a healthy lifestyle."
    
    # Enhanced AI summary with structured input
    if _summarizer_pipeline:
        try:
            # Build structured prompt for better AI reasoning
            prompt = "Analyze these lab results and provide clinical interpretation:\n\n"
            for param in abnormal_params[:8]:  # Increased from 5 to 8
                prompt += f"{param['parameter']}: {param['value']} {param['unit']} - Status: {param['status']}\n"
            prompt += "\nProvide: 1) Key findings 2) Possible health risks 3) Recommended actions (max 150 words)"
            
            result = _summarizer_pipeline(
                prompt, 
                max_length=250, 
                min_length=80, 
                do_sample=False,
                num_beams=4
            )
            summary = result[0]['generated_text'].strip()
            
            # Clean up if model repeats the prompt
            if 'Analyze these' in summary:
                summary = summary.split('Recommended actions')[-1].strip()
            
            return summary if len(summary) > 20 else generate_fallback_summary(abnormal_params)
        except Exception as e:
            logger.warning(f"AI summary failed: {str(e)}, using fallback")
    
    return generate_fallback_summary(abnormal_params)

def generate_fallback_summary(abnormal_params):
    """Structured fallback summary"""
    high_risk = [p for p in abnormal_params if p['status'] in ['HIGH', 'LOW']]
    borderline = [p for p in abnormal_params if 'BORDERLINE' in p['status']]
    
    summary = []
    
    if high_risk:
        params = ', '.join([p['parameter'] for p in high_risk[:4]])
        summary.append(f"⚠️ Critical: Abnormal levels in {params}.")
    
    if borderline:
        params = ', '.join([p['parameter'] for p in borderline[:3]])
        summary.append(f"⚡ Borderline: {params} require monitoring.")
    
    # Risk assessment
    if len(high_risk) >= 3:
        summary.append("Multiple abnormalities suggest systemic health concerns.")
    elif high_risk:
        summary.append("Targeted medical evaluation recommended.")
    
    # Action items
    if high_risk:
        summary.append("🏥 Action: Consult healthcare provider within 48-72 hours.")
    else:
        summary.append("📋 Action: Schedule follow-up testing in 4-6 weeks.")
    
    return ' '.join(summary)

def suggest_diagnostic_model(parameters):
    """Intelligent model routing with confidence scoring"""
    model_scores = {'heart': 0, 'liver': 0, 'kidney': 0, 'diabetes': 0}
    model_reasons = {'heart': [], 'liver': [], 'kidney': [], 'diabetes': []}
    
    for param in parameters:
        if param['status'] in ['HIGH', 'LOW', 'BORDERLINE_HIGH', 'BORDERLINE_LOW']:
            param_key = param.get('key', '')
            weight = 2 if param['status'] in ['HIGH', 'LOW'] else 1
            
            # Heart disease indicators
            if param_key in ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'blood_pressure']:
                model_scores['heart'] += weight
                model_reasons['heart'].append(param['parameter'])
            
            # Liver disease indicators
            if param_key in ['alt', 'ast', 'bilirubin_total', 'albumin']:
                model_scores['liver'] += weight
                model_reasons['liver'].append(param['parameter'])
            
            # Kidney disease indicators
            if param_key in ['creatinine', 'blood_urea', 'albumin', 'sodium', 'potassium']:
                model_scores['kidney'] += weight
                model_reasons['kidney'].append(param['parameter'])
            
            # Diabetes indicators
            if param_key in ['glucose', 'hba1c']:
                model_scores['diabetes'] += weight
                model_reasons['diabetes'].append(param['parameter'])
    
    # Build suggestions with confidence
    suggestions = []
    model_names = {
        'heart': 'Cardiovascular Risk Assessment',
        'liver': 'Liver Function Assessment',
        'kidney': 'Kidney Function Assessment',
        'diabetes': 'Diabetes Risk Assessment'
    }
    
    for model, score in sorted(model_scores.items(), key=lambda x: x[1], reverse=True):
        if score > 0:
            confidence = min(score * 25, 95)  # Cap at 95%
            suggestions.append({
                'model': model,
                'name': model_names[model],
                'confidence': f"{confidence}%",
                'reason': f"Abnormal: {', '.join(model_reasons[model][:3])}",
                'route': '/models',
                'priority': 'High' if score >= 3 else 'Medium'
            })
    
    return suggestions[:3]  # Top 3 suggestions

def parse_reference_range(ref_str):
    """Parse reference range string to extract min and max values"""
    if not ref_str:
        return None, None
    
    # Common formats: "13.0-17.0", "13.0 - 17.0", "<200", ">40", "13.0 to 17.0"
    ref_str = str(ref_str).strip()
    
    # Handle < or > ranges
    if ref_str.startswith('<'):
        max_val = re.search(r'([0-9.]+)', ref_str)
        return 0, float(max_val.group(1)) if max_val else None
    elif ref_str.startswith('>'):
        min_val = re.search(r'([0-9.]+)', ref_str)
        return float(min_val.group(1)) if min_val else None, float('inf')
    
    # Handle range formats
    range_match = re.search(r'([0-9.]+)\s*[-to]+\s*([0-9.]+)', ref_str, re.IGNORECASE)
    if range_match:
        return float(range_match.group(1)), float(range_match.group(2))
    
    return None, None

def detect_table_structure(lines):
    """Detect if text contains tabular data and extract structured rows"""
    table_rows = []
    
    # Common table headers
    header_keywords = ['test', 'investigation', 'parameter', 'result', 'value', 'reference', 'range', 'unit', 'normal']
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        # Check if line contains table headers
        if any(keyword in line_lower for keyword in header_keywords):
            # This might be a header row, process subsequent lines as data
            for j in range(i + 1, len(lines)):
                data_line = lines[j].strip()
                if not data_line or len(data_line) < 5:
                    continue
                
                # Try to extract structured data from line
                # Format: "Parameter  Value  Reference  Unit"
                parts = re.split(r'\s{2,}|\t', data_line)  # Split by multiple spaces or tabs
                
                if len(parts) >= 2:
                    table_rows.append({
                        'line': data_line,
                        'parts': parts,
                        'line_number': j
                    })
    
    return table_rows

def extract_from_table_row(row_data, param_info):
    """Extract parameter value from a structured table row"""
    parts = row_data['parts']
    line = row_data['line'].lower()
    
    # Check if this row contains the parameter
    param_found = False
    for alias in param_info.get('aliases', [param_info['name']]):
        if alias.lower() in line:
            param_found = True
            break
    
    if not param_found:
        return None
    
    # Extract numeric value (usually in 2nd column)
    for part in parts[1:]:
        value_match = re.search(r'^([0-9.]+)', part.strip())
        if value_match:
            value = float(value_match.group(1))
            
            # Try to extract reference range (usually in 3rd or 4th column)
            ref_range = None
            for ref_part in parts[2:]:
                if '-' in ref_part or 'to' in ref_part.lower() or '<' in ref_part or '>' in ref_part:
                    ref_range = ref_part.strip()
                    break
            
            # Try to extract unit (usually last column or after value)
            unit = param_info.get('unit', '')
            for unit_part in parts[1:]:
                if any(u in unit_part.lower() for u in ['g/dl', 'mg/dl', 'iu/l', 'mmol', 'cells', '%']):
                    unit = unit_part.strip()
                    break
            
            return {
                'value': value,
                'reference_range': ref_range,
                'unit': unit
            }
    
    return None

def analyze_parameters(text):
    """Multi-parameter extraction with table detection and line-by-line processing"""
    results = []
    
    if not text:
        return results
    
    logger.info(f"Analyzing text of length {len(text)} characters")
    
    # Split into lines for structured processing
    lines = text.split('\n')
    logger.info(f"Processing {len(lines)} lines")
    
    # Stage 1: Detect table structure
    table_rows = detect_table_structure(lines)
    logger.info(f"Detected {len(table_rows)} potential table rows")
    
    # Stage 2: Process each parameter
    for param_key, param_info in MEDICAL_PARAMETERS.items():
        value_found = False
        
        # Try table extraction first (most reliable for multi-parameter reports)
        if table_rows:
            for row in table_rows:
                extracted = extract_from_table_row(row, param_info)
                if extracted:
                    value = extracted['value']
                    ref_range = extracted.get('reference_range')
                    
                    # Parse reference range if available
                    if ref_range:
                        ref_min, ref_max = parse_reference_range(ref_range)
                        if ref_min is not None and ref_max is not None:
                            # Use extracted reference range
                            normal_range = (ref_min, ref_max)
                        else:
                            # Fallback to default
                            normal_range = param_info['normal']
                    else:
                        normal_range = param_info['normal']
                    
                    # Classify status
                    if param_key == 'blood_pressure':
                        continue  # Skip BP in table processing
                    
                    status = classify_value_status(value, normal_range, param_info.get('borderline'))
                    
                    results.append({
                        'key': param_key,
                        'parameter': param_info['name'],
                        'value': str(value),
                        'unit': extracted.get('unit', param_info['unit']),
                        'status': status,
                        'normal_range': f"{normal_range[0]}-{normal_range[1]}",
                        'recommendations': get_health_recommendations(param_key, status.lower().replace('_', ' '), value)
                    })
                    
                    logger.info(f"Table extracted {param_key}: {value}")
                    value_found = True
                    break
        
        # Stage 3: Line-by-line pattern matching (fallback)
        if not value_found:
            for line in lines:
                line_lower = line.lower()
                
                # Check if line contains parameter
                param_in_line = False
                for alias in param_info.get('aliases', [param_info['name']]):
                    if alias.lower() in line_lower:
                        param_in_line = True
                        break
                
                if not param_in_line:
                    continue
                
                # Extract value from this line
                if param_key == 'blood_pressure':
                    match = re.search(param_info['pattern'], line_lower)
                    if match and match.group(1) and match.group(2):
                        systolic = float(match.group(1))
                        diastolic = float(match.group(2))
                        value_str = f"{systolic}/{diastolic}"
                        
                        status = 'HIGH' if systolic >= 130 or diastolic >= 85 else ('BORDERLINE_HIGH' if systolic >= 120 or diastolic >= 80 else 'NORMAL')
                        
                        results.append({
                            'key': param_key,
                            'parameter': param_info['name'],
                            'value': value_str,
                            'unit': param_info['unit'],
                            'status': status,
                            'normal_range': '<120/<80',
                            'recommendations': get_health_recommendations(param_key, status.lower().replace('_', ' '), value_str)
                        })
                        logger.info(f"Line matched {param_key}: {value_str}")
                        value_found = True
                        break
                else:
                    # Extract numeric value
                    value_match = re.search(r'[:\s=-]+([0-9.]+)', line)
                    if value_match:
                        try:
                            value = float(value_match.group(1))
                            normal_min, normal_max = param_info['normal']
                            
                            # Try to extract reference range from same line
                            ref_match = re.search(r'([0-9.]+)\s*[-to]+\s*([0-9.]+)', line, re.IGNORECASE)
                            if ref_match:
                                ref_min = float(ref_match.group(1))
                                ref_max = float(ref_match.group(2))
                                # Use extracted range if it seems valid
                                if ref_min < value < ref_max * 2:  # Sanity check
                                    normal_min, normal_max = ref_min, ref_max
                            
                            status = classify_value_status(value, (normal_min, normal_max), param_info.get('borderline'))
                            
                            results.append({
                                'key': param_key,
                                'parameter': param_info['name'],
                                'value': str(value),
                                'unit': param_info['unit'],
                                'status': status,
                                'normal_range': f"{normal_min}-{normal_max}",
                                'recommendations': get_health_recommendations(param_key, status.lower().replace('_', ' '), value)
                            })
                            logger.info(f"Line matched {param_key}: {value}")
                            value_found = True
                            break
                        except ValueError:
                            continue
        
        # Stage 4: AI extraction (final fallback)
        if not value_found:
            text_lower = text.lower()
            for alias in param_info.get('aliases', []):
                extracted_value = extract_value_near_parameter(text, alias)
                if extracted_value:
                    try:
                        value = float(extracted_value)
                        normal_min, normal_max = param_info['normal']
                        status = classify_value_status(value, (normal_min, normal_max), param_info.get('borderline'))
                        
                        results.append({
                            'key': param_key,
                            'parameter': param_info['name'],
                            'value': str(value),
                            'unit': param_info['unit'],
                            'status': status,
                            'normal_range': f"{normal_min}-{normal_max}",
                            'recommendations': get_health_recommendations(param_key, status.lower().replace('_', ' '), value)
                        })
                        logger.info(f"AI matched {param_key}: {value}")
                        break
                    except ValueError:
                        continue
    
    # Remove duplicates
    seen = set()
    unique_results = []
    for r in results:
        if r['key'] not in seen:
            seen.add(r['key'])
            unique_results.append(r)
    
    logger.info(f"Final extraction: {len(unique_results)} unique parameters")
    return unique_results

@app.route('/api/analyze-report', methods=['POST'])
def analyze_medical_report():
    """Enhanced multi-parameter medical report analyzer with AI"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        ext = os.path.splitext(file.filename)[1].lower()
        file_bytes = file.read()
        text = None
        
        # Stage 1: Document Processing - Extract full text
        logger.info(f"Processing {ext} file: {file.filename}")
        if ext == '.pdf':
            text = extract_text_from_pdf(file_bytes)
        elif ext in ['.jpg', '.jpeg', '.png']:
            text = extract_text_from_image(file_bytes)
        else:
            return jsonify({'error': 'Unsupported format. Upload PDF, JPG, or PNG.'}), 400
        
        if not text or len(text.strip()) < 10:
            return jsonify({
                'error': 'Could not extract readable text from image.',
                'suggestion': 'Please ensure: 1) Image is clear and high resolution, 2) Text is not too small, 3) Good lighting/contrast, 4) Try uploading a PDF instead if available.',
                'debug_info': f'Extracted only {len(text) if text else 0} characters. OCR may have failed due to poor image quality.'
            }), 400
        
        logger.info(f"Extracted {len(text)} characters from document")
        
        # Stage 2: Multi-parameter extraction (AI + Regex)
        parameters = analyze_parameters(text)
        
        if not parameters:
            # Log extracted text for debugging
            logger.warning(f"No parameters found. Text preview: {text[:500]}")
            
            return jsonify({
                'success': True,
                'parameters': [],
                'total_found': 0,
                'status_counts': {'normal': 0, 'borderline': 0, 'abnormal': 0},
                'clinical_summary': 'No standard medical parameters detected. Document may contain specialized tests or non-standard formatting.',
                'general_recommendations': [
                    'Ensure the report contains standard lab test names (Hemoglobin, Glucose, Cholesterol, etc.)',
                    'Check if image quality is sufficient for text recognition',
                    'Try uploading a PDF version if available',
                    'Consult healthcare provider for manual interpretation'
                ],
                'suggested_models': [],
                'ai_analysis': 'Unable to perform AI analysis without detectable parameters',
                'debug_info': {
                    'text_length': len(text),
                    'text_preview': text[:200] if len(text) > 200 else text
                },
                'disclaimer': 'AI-generated analysis for preliminary screening only. Not a substitute for professional medical consultation.'
            })
        
        logger.info(f"Detected {len(parameters)} parameters")
        
        # Stage 3: Classification and status counting
        abnormal_params = [p for p in parameters if p['status'] != 'NORMAL']
        status_counts = {
            'normal': len([p for p in parameters if p['status'] == 'NORMAL']),
            'borderline': len([p for p in parameters if 'BORDERLINE' in p['status']]),
            'abnormal': len([p for p in parameters if p['status'] in ['HIGH', 'LOW']])
        }
        
        # Stage 4: AI Clinical Summary Generation
        clinical_summary = generate_clinical_summary(abnormal_params)
        
        # Stage 5: Intelligent Model Routing
        suggested_models = suggest_diagnostic_model(parameters)
        
        # Stage 6: Generate comprehensive recommendations
        general_recommendations = []
        if status_counts['abnormal'] >= 3:
            general_recommendations = [
                '🏥 Priority: Schedule comprehensive health checkup within 48-72 hours',
                '💊 Follow prescribed treatment plans and medications',
                '📊 Monitor vital signs daily and maintain health log',
                '🥗 Adopt dietary modifications as per abnormal parameters',
                '🏋️ Regular exercise with medical supervision'
            ]
        elif status_counts['abnormal'] > 0:
            general_recommendations = [
                '👨‍⚕️ Consult healthcare provider to discuss abnormal results',
                '📝 Follow up with targeted tests as recommended',
                '🍎 Maintain balanced diet and healthy lifestyle',
                '💧 Stay hydrated and get adequate sleep'
            ]
        elif status_counts['borderline'] > 0:
            general_recommendations = [
                '📊 Monitor borderline parameters regularly',
                '🍽️ Adopt preventive dietary changes',
                '🏃 Increase physical activity gradually',
                '📅 Schedule follow-up testing in 4-6 weeks'
            ]
        else:
            general_recommendations = [
                '✅ All parameters normal - maintain current lifestyle',
                '🥗 Continue balanced diet and regular exercise',
                '📊 Annual health checkups recommended',
                '💤 Ensure adequate sleep and stress management'
            ]
        
        # Build comprehensive response
        response = {
            'success': True,
            'parameters': parameters,
            'total_found': len(parameters),
            'status_counts': status_counts,
            'clinical_summary': clinical_summary,
            'general_recommendations': general_recommendations,
            'suggested_models': suggested_models,
            'ai_analysis': {
                'model_used': 'Flan-T5-Large + Biomedical-NER' if _summarizer_pipeline and _ner_pipeline else 'Rule-based analysis',
                'confidence': 'High' if len(parameters) >= 5 else 'Medium',
                'parameters_analyzed': len(parameters),
                'abnormalities_found': len(abnormal_params)
            },
            'risk_assessment': {
                'overall_risk': 'High' if status_counts['abnormal'] >= 3 else ('Moderate' if status_counts['abnormal'] > 0 else 'Low'),
                'requires_immediate_attention': status_counts['abnormal'] >= 3,
                'follow_up_recommended': status_counts['abnormal'] > 0 or status_counts['borderline'] > 0
            },
            'disclaimer': 'AI-generated analysis for preliminary screening only. Not a substitute for professional medical consultation.'
        }
        
        logger.info(f"Analysis complete: {len(parameters)} params, {len(abnormal_params)} abnormal")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Report analysis error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Failed to analyze report',
            'details': str(e),
            'suggestion': 'Try again with different file or contact support.'
        }), 500

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

@app.route('/api/cardiovascular-analysis', methods=['POST'])
def cardiovascular_analysis():
    """Cardiovascular health analysis using image OR numeric data"""
    try:
        has_image = 'image' in request.files and request.files['image'].filename != ''
        
        # Get numeric data
        numeric_data = {
            'age': request.form.get('age'),
            'sex': request.form.get('sex'),
            'cp': request.form.get('cp'),
            'trestbps': request.form.get('trestbps'),
            'chol': request.form.get('chol'),
            'fbs': request.form.get('fbs'),
            'restecg': request.form.get('restecg'),
            'thalach': request.form.get('thalach'),
            'exang': request.form.get('exang'),
            'oldpeak': request.form.get('oldpeak'),
            'slope': request.form.get('slope'),
            'ca': request.form.get('ca'),
            'thal': request.form.get('thal')
        }
        
        # Check if numeric data is provided
        has_numeric = all(v for v in numeric_data.values())
        
        if not has_image and not has_numeric:
            return jsonify({'error': 'Please provide either image or all clinical parameters'}), 400
        
        # Image-only analysis
        if has_image and not has_numeric:
            try:
                image_file = request.files['image']
                ext = os.path.splitext(image_file.filename)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png']:
                    return jsonify({'error': 'Invalid image format. Use JPG or PNG'}), 400
                
                # Simple image-based analysis (placeholder - would need proper model)
                # For now, return a basic analysis
                result = {
                    'analysis_type': 'Cardiovascular Image Analysis',
                    'model_used': 'Image-based Assessment',
                    'final_disease_probability': 0.45,  # Placeholder
                    'risk_level': 'Moderate',
                    'image_confidence_score': 0.75,
                    'recommendation': 'Image analysis suggests moderate risk. Please provide clinical parameters for comprehensive assessment.',
                    'formatted_report': 'Image Analysis Only\nRisk Level: Moderate\nNote: For accurate diagnosis, please provide clinical parameters or consult a cardiologist.'
                }
                
                return jsonify(result)
            except Exception as e:
                logger.error(f"Image analysis failed: {str(e)}")
                return jsonify({'error': 'Image analysis failed', 'details': str(e)}), 500
        
        # Multimodal analysis (image + numeric)
        if has_image and has_numeric:
            try:
                image_file = request.files['image']
                ext = os.path.splitext(image_file.filename)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png']:
                    return jsonify({'error': 'Invalid image format. Use JPG or PNG'}), 400
                
                image_bytes = image_file.read()
                result = predict_cardiovascular(image_bytes, numeric_data)
                formatted_report = generate_cardio_report(result, numeric_data)
                result['formatted_report'] = formatted_report
                
                # Save to database
                from flask import session
                if 'user_id' in session:
                    try:
                        pred = Prediction(
                            user_id=session['user_id'],
                            disease_type='cardiovascular_multimodal',
                            prediction_result=result['risk_level'],
                            probability=result['final_disease_probability'],
                            risk_level=result['risk_level'],
                            input_data=numeric_data
                        )
                        db.session.add(pred)
                        db.session.commit()
                    except Exception as e:
                        logger.error(f"Failed to save prediction: {str(e)}")
                        db.session.rollback()
                
                return jsonify(result)
            except Exception as e:
                logger.warning(f"Multimodal analysis failed: {str(e)}, falling back to numeric-only")
        
        # Numeric-only analysis
        if heart_model is None:
            return jsonify({'error': 'Heart disease model not available'}), 503
        
        features = [
            float(numeric_data.get('age', 0)),
            170, 70,
            float(numeric_data.get('sex', 0)),
            float(numeric_data.get('trestbps', 0)),
            80,
            2 if float(numeric_data.get('chol', 0)) > 240 else 1,
            1,
            1 if float(numeric_data.get('exang', 0)) == 1 else 0,
            0, 1
        ]
        
        features_array = np.array(features).reshape(1, -1)
        prediction = heart_model.predict(features_array)[0]
        probability = heart_model.predict_proba(features_array)[0][1]
        
        risk_level = "High" if probability >= 0.6 else "Moderate" if probability >= 0.4 else "Low"
        
        result = {
            'analysis_type': 'Cardiovascular Risk Assessment (Numeric Only)',
            'model_used': 'Random Forest Classifier',
            'final_disease_probability': float(probability),
            'risk_level': risk_level,
            'numeric_risk_score': float(probability),
            'recommendation': 'Consult cardiologist immediately.' if risk_level == 'High' else 'Schedule checkup within 2 weeks.' if risk_level == 'Moderate' else 'Maintain healthy lifestyle.',
            'formatted_report': f'Risk Level: {risk_level}\nProbability: {probability*100:.0f}%'
        }
        
        # Save to database
        from flask import session
        if 'user_id' in session:
            try:
                pred = Prediction(
                    user_id=session['user_id'],
                    disease_type='cardiovascular',
                    prediction_result=result['risk_level'],
                    probability=result['final_disease_probability'],
                    risk_level=result['risk_level'],
                    input_data=numeric_data
                )
                db.session.add(pred)
                db.session.commit()
            except Exception as e:
                logger.error(f"Failed to save prediction: {str(e)}")
                db.session.rollback()
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Cardiovascular analysis error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Analysis failed', 'details': str(e)}), 500

@app.route('/api/symptom-checker', methods=['POST'])
def symptom_checker():
    from flask import session
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', '').strip()
        duration = data.get('duration', '')
        severity = data.get('severity', '')

        if len(symptoms) < 10:
            return jsonify({'error': 'Please provide more detailed symptoms (at least 10 characters)'}), 400

        # Fetch past assessments if user is logged in
        past_assessments = []
        if 'user_id' in session:
            try:
                past_preds = Prediction.query.filter_by(
                    user_id=session['user_id'],
                    disease_type='symptom_check'
                ).order_by(Prediction.created_at.desc()).limit(5).all()
                
                for pred in past_preds:
                    past_assessments.append({
                        'date': pred.created_at.strftime('%Y-%m-%d'),
                        'symptoms': pred.input_data.get('symptoms', ''),
                        'condition': pred.prediction_result,
                        'risk': pred.risk_level,
                        'severity': pred.input_data.get('severity', '')
                    })
            except Exception as e:
                logger.warning(f"Could not fetch past assessments: {str(e)}")

        # Use Groq API for symptom analysis
        GROQ_API_KEY = os.getenv('GROQ_API_KEY')
        
        if not GROQ_API_KEY or not GROQ_AVAILABLE:
            return jsonify({'error': 'AI service temporarily unavailable'}), 503
        
        client = Groq(api_key=GROQ_API_KEY)
        
        # Enhanced prompt with past history comparison
        past_context = ""
        if past_assessments:
            past_context = "\n\nPAST ASSESSMENT HISTORY:\n"
            for i, past in enumerate(past_assessments[:3], 1):
                past_context += f"{i}. {past['date']}: {past['symptoms'][:100]} → {past['condition']} ({past['risk']} risk)\n"
        
        prompt = f"""You are a medical AI assistant. Analyze present symptoms and compare with past history.

PRESENT SYMPTOMS:
Symptoms: {symptoms}
Duration: {duration}
Severity: {severity}{past_context}

TASK:
1. Compare present symptoms with past symptoms (if available)
2. Calculate symptom overlap percentage
3. Determine if conditions are related (>50% overlap or medically related)
4. Analyze progression/recurrence/complication
5. Predict top 3 likely conditions

Respond ONLY with valid JSON:
{{
  "symptom_comparison": {{
    "overlap_percentage": 0,
    "relation_status": "Related" or "Not Related",
    "comparison_summary": "Brief comparison"
  }},
  "predictions": [
    {{"disease": "Name", "confidence": 85.5, "risk": "High", "explanation": "Brief reason"}}
  ],
  "severity_change": "Increased/Decreased/Stable/New Condition",
  "recommended_steps": ["Step 1", "Step 2"]
}}

Diseases: Heart Disease, Diabetes, Liver Disease, Kidney Disease, Pneumonia, Asthma, Influenza, Migraine, Hypertension, Gastritis.
Risk: High (>70%), Moderate (50-70%), Low (<50%)."""
        
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800,
            timeout=15.0
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
                    'symptom_comparison': result.get('symptom_comparison', {
                        'overlap_percentage': 0,
                        'relation_status': 'Not Related',
                        'comparison_summary': 'No past history available'
                    }),
                    'top_prediction': predictions[0],
                    'other_conditions': predictions[1:3] if len(predictions) > 1 else [],
                    'severity_change': result.get('severity_change', 'New Condition'),
                    'recommended_steps': result.get('recommended_steps', [
                        'Consult healthcare provider',
                        'Monitor symptoms closely'
                    ]),
                    'has_past_history': len(past_assessments) > 0
                }
                
                # Save to database if user is logged in
                if 'user_id' in session:
                    try:
                        pred = Prediction(
                            user_id=session['user_id'],
                            disease_type=predictions[0]['disease'],
                            prediction_result=predictions[0]['risk'],
                            probability=predictions[0]['confidence'] / 100,
                            risk_level=predictions[0]['risk'],
                            input_data={
                                'symptoms': symptoms,
                                'duration': duration,
                                'severity': severity
                            },
                            original_prediction={
                                'symptom_comparison': result.get('symptom_comparison', {}),
                                'severity_change': result.get('severity_change', 'New Condition'),
                                'chief_complaint': symptoms,
                                'top_prediction': {
                                    'disease': predictions[0]['disease'],
                                    'risk': predictions[0]['risk'],
                                    'confidence': predictions[0]['confidence'],
                                    'next_step': 'Schedule a clinical consultation and share this report with your doctor for confirmation.',
                                    'explanation': predictions[0].get('explanation', '')
                                },
                                'other_conditions': predictions[1:3] if len(predictions) > 1 else [],
                                'recommended_steps': result.get('recommended_steps', [])
                            },
                            status='pending_review'
                        )
                        db.session.add(pred)
                        db.session.commit()
                    except Exception as e:
                        logger.error(f"Failed to save symptom check: {str(e)}")
                        db.session.rollback()
                
                return jsonify(response)
        
        return jsonify({'error': 'Unable to analyze symptoms'}), 500

    except Exception as e:
        logger.error(f"Symptom checker error: {str(e)}", exc_info=True)
        
        # Fallback response when API fails
        if 'timeout' in str(e).lower() or 'timed out' in str(e).lower():
            # Provide rule-based analysis as fallback
            symptoms_lower = symptoms.lower()
            
            # Simple keyword matching for common conditions
            fallback_prediction = None
            if any(word in symptoms_lower for word in ['fever', 'cold', 'cough', 'flu']):
                fallback_prediction = {
                    'disease': 'Influenza',
                    'confidence': 70.0,
                    'risk': 'Moderate',
                    'explanation': 'Based on reported symptoms of cold, cough, and fever'
                }
            elif any(word in symptoms_lower for word in ['chest pain', 'heart', 'breathless']):
                fallback_prediction = {
                    'disease': 'Heart Disease',
                    'confidence': 65.0,
                    'risk': 'High',
                    'explanation': 'Cardiovascular symptoms detected - immediate consultation recommended'
                }
            elif any(word in symptoms_lower for word in ['sugar', 'thirst', 'urination', 'diabetes']):
                fallback_prediction = {
                    'disease': 'Diabetes',
                    'confidence': 68.0,
                    'risk': 'Moderate',
                    'explanation': 'Symptoms suggest blood sugar irregularities'
                }
            else:
                fallback_prediction = {
                    'disease': 'General Health Concern',
                    'confidence': 50.0,
                    'risk': 'Low',
                    'explanation': 'Symptoms require professional medical evaluation'
                }
            
            # Check for past history
            has_history = len(past_assessments) > 0
            comparison = {
                'overlap_percentage': 0,
                'relation_status': 'Not Related',
                'comparison_summary': 'AI service temporarily unavailable - comparison not performed'
            }
            
            if has_history:
                # Simple overlap check
                past_symptoms = ' '.join([p['symptoms'].lower() for p in past_assessments[:2]])
                common_words = set(symptoms_lower.split()) & set(past_symptoms.split())
                overlap = min(len(common_words) * 20, 80)
                
                comparison = {
                    'overlap_percentage': overlap,
                    'relation_status': 'Related' if overlap > 50 else 'Not Related',
                    'comparison_summary': f'Detected {overlap}% symptom overlap with past assessments. AI analysis unavailable due to network timeout.'
                }
            
            return jsonify({
                'symptom_comparison': comparison,
                'top_prediction': fallback_prediction,
                'other_conditions': [],
                'severity_change': 'Unable to determine',
                'recommended_steps': [
                    'Consult healthcare provider for accurate diagnosis',
                    'Monitor symptoms and seek immediate care if worsening',
                    'Keep a symptom diary for your doctor'
                ],
                'has_past_history': has_history,
                'fallback_mode': True,
                'message': 'AI service temporarily unavailable. Basic analysis provided.'
            })
        
        return jsonify({'error': 'Failed to analyze symptoms', 'details': str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    from flask import session
    if 'user_id' not in session:
        return jsonify({'notifications': [], 'unread_count': 0}), 200
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'notifications': [], 'unread_count': 0}), 200
        
        # Get recent predictions for patients
        if user.role == 'patient':
            recent_preds = Prediction.query.filter_by(user_id=user_id).filter(
                Prediction.status.in_(['clinically_verified', 'rejected_reeval_required', 'modified_by_doctor'])
            ).order_by(Prediction.updated_at.desc()).limit(10).all()
            
            notifications = [{
                'id': p.id,
                'type': 'prediction_update',
                'message': f'Your {p.disease_type} prediction has been {p.status.replace("_", " ")}',
                'status': p.status,
                'created_at': p.updated_at.isoformat() if p.updated_at else p.created_at.isoformat()
            } for p in recent_preds]
            
            unread = len([p for p in recent_preds if p.status != 'pending_review'])
        else:
            # For doctors - show pending reviews
            pending = Prediction.query.filter_by(status='pending_review').count()
            notifications = [{
                'id': 'pending',
                'type': 'pending_reviews',
                'message': f'{pending} predictions awaiting review',
                'count': pending
            }] if pending > 0 else []
            unread = pending
        
        return jsonify({'notifications': notifications, 'unread_count': unread})
    except Exception as e:
        logger.error(f"Notification error: {str(e)}")
        return jsonify({'notifications': [], 'unread_count': 0}), 200

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(debug=True)
