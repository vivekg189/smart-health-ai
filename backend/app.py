from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os
import logging
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import re
import csv
from sklearn import preprocessing
from sklearn.tree import DecisionTreeClassifier, _tree
import requests
# New imports for bone fracture module
from PIL import Image
import io
from transformers import pipeline

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Get the absolute path to the backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# Load each model and scaler individually so a failure doesn't block others
_diabetes_path = os.path.join(BACKEND_DIR, 'diabetes.pkl')
_liver_path = os.path.join(BACKEND_DIR, 'liver_model.pkl')
_k_scaler_path = os.path.join(BACKEND_DIR, 'k_scaler.pkl')
_kidney_path = os.path.join(BACKEND_DIR, 'kidney_model.pkl')
_h_scaler_path = os.path.join(BACKEND_DIR, 'h_scaler.pkl')
_heart_path = os.path.join(BACKEND_DIR, 'heart_disease_model.pkl')

# Initialize to None by default
_diabetes_err = _liver_err = _kidney_err = _heart_err = None

diabetes_model = None
liver_model = None
kidney_model = None
kidney_scaler = None
heart_model = None
heart_scaler = None

try:
    diabetes_model = joblib.load(_diabetes_path)
    logger.info("Diabetes model loaded successfully")
except Exception as e:
    _diabetes_err = str(e)
    logger.error(f"Failed to load diabetes model: {_diabetes_err}", exc_info=True)

try:
    liver_model = joblib.load(_liver_path)
    logger.info("Liver model loaded successfully")
except Exception as e:
    _liver_err = str(e)
    logger.error(f"Failed to load liver model: {_liver_err}", exc_info=True)

try:
    kidney_scaler = joblib.load(_k_scaler_path)
    kidney_model = joblib.load(_kidney_path)
    logger.info("Kidney model and scaler loaded successfully")
except Exception as e:
    _kidney_err = str(e)
    logger.error(f"Failed to load kidney model/scaler: {_kidney_err}", exc_info=True)

try:
    heart_scaler = joblib.load(_h_scaler_path)
    heart_model = joblib.load(_heart_path)
    logger.info("Heart disease model and scaler loaded successfully")
except Exception as e:
    _heart_err = str(e)
    logger.error(f"Failed to load heart model/scaler: {_heart_err}", exc_info=True)
# Bone fracture and Hugging Face models
_bone_hf_model_id = 'prithivMLmods/Bone-Fracture-Detection'
_bone_allowed_ext = {'.jpg', '.jpeg', '.png'}
_bone_pipeline = None
_bone_model_err = None

try:
    # Load once at startup
    _bone_pipeline = pipeline(
        task='image-classification',
        model=_bone_hf_model_id
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
    if diabetes_model is None:
        return jsonify({'error': 'Diabetes prediction model not loaded properly'}), 503

    try:
        data = request.get_json()
        
        # Create a DataFrame with the input data
        input_data = pd.DataFrame([{
            'gender': data['gender'],
            'age': float(data['age']),
            'hypertension': int(data['hypertension']),
            'heart_disease': int(data['heart_disease']),
            'smoking_history': data['smoking_history'],
            'bmi': float(data['bmi']),
            'HbA1c_level': float(data['HbA1c_level']),
            'blood_glucose_level': float(data['blood_glucose_level'])
        }])

        # Convert categorical variables to numerical using LabelEncoder
        le = LabelEncoder()
        input_data['gender'] = le.fit_transform(input_data['gender'])
        input_data['smoking_history'] = le.fit_transform(input_data['smoking_history'])

        # Create dummy variables for categorical features
        input_data = pd.get_dummies(input_data, columns=['gender', 'smoking_history'])

        # Ensure all expected columns are present with the exact 13 features
        expected_columns = [
            'age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level', 'blood_glucose_level',
            'gender_0', 'gender_1',  # gender dummy variables (2 features)
            'smoking_history_0', 'smoking_history_1', 'smoking_history_2',  # smoking history dummy variables (3 features)
            'gender_smoking_interaction',  # interaction term (1 feature)
            'age_bmi_interaction'  # age-bmi interaction term (1 feature)
        ]

        # Add any missing columns with zeros
        for col in expected_columns:
            if col not in input_data.columns:
                input_data[col] = 0

        # Add interaction terms
        input_data['gender_smoking_interaction'] = input_data['gender_0'] * input_data['smoking_history_0']
        input_data['age_bmi_interaction'] = input_data['age'] * input_data['bmi']

        # Reorder columns to match the model's expected order
        input_data = input_data[expected_columns]

        # Make prediction
        prediction = diabetes_model.predict(input_data)[0]
        probability = diabetes_model.predict_proba(input_data)[0][1]

        # Determine risk level
        if probability < 0.3:
            risk_level = "Low"
        elif probability < 0.6:
            risk_level = "Medium"
        elif probability < 0.8:
            risk_level = "High"
        else:
            risk_level = "Very High"

        # Prepare response
        response = {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': risk_level,
            'message': 'High risk of diabetes' if prediction == 1 else 'Low risk of diabetes'
        }

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

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict/heart', methods=['POST'])
def predict_heart():
    if heart_model is None or heart_scaler is None:
        return jsonify({'error': 'Model not loaded properly'}), 503

    try:
        data = request.get_json()
        
        # Extract features in the correct order
        features = [
            float(data.get('BMI', 0)),
            float(data.get('Smoking', 0)),
            float(data.get('AlcoholDrinking', 0)),
            float(data.get('Stroke', 0)),
            float(data.get('PhysicalHealth', 0)),
            float(data.get('MentalHealth', 0)),
            float(data.get('DiffWalking', 0)),
            float(data.get('Sex', 0)),
            float(data.get('AgeCategory', 0)),
            float(data.get('Race', 0)),
            float(data.get('Diabetic', 0)),
            float(data.get('PhysicalActivity', 0)),
            float(data.get('GenHealth', 0)),
            float(data.get('SleepTime', 0)),
            float(data.get('Asthma', 0)),
            float(data.get('KidneyDisease', 0)),
            float(data.get('SkinCancer', 0))
        ]

        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)
        
        # Scale the features
        scaled_features = heart_scaler.transform(features_array)
        
        # Make prediction
        prediction = heart_model.predict(scaled_features)[0]
        probability = heart_model.predict_proba(scaled_features)[0][1]

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
            'message': f'{risk_level} risk of heart disease'
        }

        return jsonify(response)

    except Exception as e:
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
            'heart': heart_model is not None and heart_scaler is not None
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
        # preds is a list of dicts like [{'label': 'Fracture', 'score': 0.95}, ...]
        top = preds[0] if preds else {'label': 'Unknown', 'score': 0.0}
        label = top.get('label', 'Unknown')
        score = float(top.get('score', 0.0))

        # Normalize label to Fracture / No Fracture
        norm_label = 'Fracture' if 'fracture' in label.lower() else 'No Fracture'
        confidence_pct = round(score * 100.0, 2)

        # Heuristic severity/urgency for UI chips
        severity = 'High' if norm_label == 'Fracture' and score >= 0.8 else ('Medium' if norm_label == 'Fracture' else 'Low')
        urgency = 'High' if norm_label == 'Fracture' and score >= 0.8 else ('Medium' if norm_label == 'Fracture' else 'Low')

        # Recommendations and PDF-friendly structure expected by frontend
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
            # Detailed report for PDF export used by frontend
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
        return jsonify(response)
    except Exception as e:
        logger.error(f"Bone fracture prediction error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to analyze image', 'details': str(e)}), 500

@app.route('/api/gemini-chat', methods=['POST'])
def gemini_chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Get Gemini API key from environment variable or use default
        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyAykTa9bjtfVanAf0uSZGX0SQLrLFFHcE4')
        
        # Try different models in order of preference
        models_to_try = ['gemini-1.5-flash', 'gemini-1.5-flash-002', 'gemini-1.5-pro', 'gemini-1.5-pro-002']
        
        for model_name in models_to_try:
            GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent?key={GEMINI_API_KEY}'

            payload = {
                "contents": [
                    {"parts": [{"text": user_message}]}
                ]
            }
            headers = {'Content-Type': 'application/json'}
            
            response = requests.post(GEMINI_API_URL, json=payload, headers=headers)
            
            if response.status_code == 200:
                gemini_data = response.json()
                
                try:
                    candidates = gemini_data.get('candidates', [])
                    if not candidates:
                        continue  
                    
                    content = candidates[0].get('content', {})
                    parts = content.get('parts', [])
                    if not parts:
                        continue  
                    
                    gemini_text = parts[0].get('text', '')
                    if not gemini_text:
                        continue  
                    
                    return jsonify({'response': gemini_text})
                    
                except (KeyError, IndexError) as e:
                    logger.error(f"Error parsing Gemini response: {str(e)}")
                    continue  
                    
            elif response.status_code == 429:
                # Rate limit hit, try next model
                logger.warning(f"Rate limit hit for model {model_name}, trying next model")
                continue
            else:
                error_details = response.text
                logger.error(f"Gemini API error for model {model_name}: Status {response.status_code}, Response: {error_details}")
                
                # If it's an authentication error, don't try other models
                if response.status_code == 401:
                    return jsonify({'error': 'Invalid Gemini API key', 'details': 'Please check your API key configuration'}), 500
                elif response.status_code == 400:
                    return jsonify({'error': 'Invalid request to Gemini API', 'details': error_details}), 500
                else:
                    continue  # Try next model
        
        # If we get here, all models failed
        # Provide a fallback response for common healthcare questions
        fallback_responses = {
            'hello': 'Hello! I\'m here to help with healthcare questions. How can I assist you today?',
            'help': 'I can help you with health information, symptom checking, and general medical advice. What would you like to know?',
            'symptoms': 'I can help you understand symptoms, but please consult a healthcare professional for proper diagnosis.',
            'emergency': 'If you\'re experiencing a medical emergency, please call emergency services immediately.',
            'doctor': 'For specific medical advice, please consult with a qualified healthcare provider.',
            'medicine': 'I can provide general information about medications, but always consult your doctor for medical advice.',
            'pain': 'If you\'re experiencing severe pain, please seek immediate medical attention.',
            'fever': 'If you have a high fever or it persists, please consult a healthcare provider.',
            'covid': 'For COVID-19 related questions, please refer to official health guidelines and consult healthcare providers.',
            'vaccine': 'Vaccination information should be obtained from healthcare providers or official health sources.'
        }
        
        # Check if the user message contains any keywords for fallback
        user_message_lower = user_message.lower()
        for keyword, response in fallback_responses.items():
            if keyword in user_message_lower:
                return jsonify({'response': response})
        
        # Generic fallback response
        return jsonify({'response': 'I\'m currently experiencing technical difficulties. For immediate health concerns, please consult a healthcare provider or call emergency services if needed.'}), 500
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error in Gemini chat: {str(e)}", exc_info=True)
        return jsonify({'error': 'Network error connecting to Gemini API', 'details': str(e)}), 500
    except Exception as e:
        logger.error(f"Error in Gemini chat: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(debug=True) 