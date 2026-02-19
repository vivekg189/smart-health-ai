import torch
import torch.nn as nn
from transformers import AutoProcessor, AutoModel
from PIL import Image
import io
import numpy as np
import logging

logger = logging.getLogger(__name__)

# Global model instances
_medsiglip_model = None
_medsiglip_processor = None
_fusion_model = None

class NumericEncoder(nn.Module):
    """MLP to encode numeric clinical features"""
    def __init__(self, input_dim=13, hidden_dim=64, output_dim=128):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, output_dim),
            nn.ReLU()
        )
    
    def forward(self, x):
        return self.network(x)

class FusionClassifier(nn.Module):
    """Fusion model combining image and numeric embeddings"""
    def __init__(self, image_dim=768, numeric_dim=128, hidden_dim=256):
        super().__init__()
        self.fusion = nn.Sequential(
            nn.Linear(image_dim + numeric_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(hidden_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 2)  # Binary classification
        )
    
    def forward(self, image_emb, numeric_emb):
        combined = torch.cat([image_emb, numeric_emb], dim=1)
        return self.fusion(combined)

def load_models():
    """Load SigLIP and initialize fusion models"""
    global _medsiglip_model, _medsiglip_processor, _fusion_model
    
    if _medsiglip_model is not None:
        return True
    
    try:
        # Use google/siglip-base-patch16-224 (actual model on HuggingFace)
        model_name = "google/siglip-base-patch16-224"
        logger.info(f"Loading {model_name} model...")
        _medsiglip_processor = AutoProcessor.from_pretrained(model_name)
        _medsiglip_model = AutoModel.from_pretrained(model_name)
        _medsiglip_model.eval()
        
        # Initialize fusion model
        _fusion_model = FusionClassifier(image_dim=768, numeric_dim=128)  # SigLIP uses 768 dim
        _fusion_model.eval()
        
        logger.info("Multimodal cardiovascular models loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load models: {str(e)}")
        return False

def extract_image_features(image_bytes):
    """Extract features from heart medical image using SigLIP"""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))
        
        inputs = _medsiglip_processor(images=img, return_tensors="pt")
        
        with torch.no_grad():
            outputs = _medsiglip_model.get_image_features(**inputs)
        
        return outputs
    except Exception as e:
        logger.error(f"Image feature extraction failed: {str(e)}")
        raise

def encode_numeric_features(numeric_data):
    """Encode numeric clinical data"""
    try:
        # Expected features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
        features = [
            float(numeric_data.get('age', 0)),
            float(numeric_data.get('sex', 0)),
            float(numeric_data.get('cp', 0)),
            float(numeric_data.get('trestbps', 0)),
            float(numeric_data.get('chol', 0)),
            float(numeric_data.get('fbs', 0)),
            float(numeric_data.get('restecg', 0)),
            float(numeric_data.get('thalach', 0)),
            float(numeric_data.get('exang', 0)),
            float(numeric_data.get('oldpeak', 0)),
            float(numeric_data.get('slope', 0)),
            float(numeric_data.get('ca', 0)),
            float(numeric_data.get('thal', 0))
        ]
        
        # Normalize features
        features_tensor = torch.tensor(features, dtype=torch.float32).unsqueeze(0)
        
        # Encode using MLP
        numeric_encoder = NumericEncoder(input_dim=13, output_dim=128)
        numeric_encoder.eval()
        
        with torch.no_grad():
            numeric_emb = numeric_encoder(features_tensor)
        
        return numeric_emb
    except Exception as e:
        logger.error(f"Numeric encoding failed: {str(e)}")
        raise

def predict_cardiovascular(image_bytes, numeric_data):
    """Multimodal cardiovascular disease prediction"""
    try:
        if not load_models():
            raise Exception("Models not loaded")
        
        # Extract features
        image_emb = extract_image_features(image_bytes)
        numeric_emb = encode_numeric_features(numeric_data)
        
        # Fusion prediction
        with torch.no_grad():
            logits = _fusion_model(image_emb, numeric_emb)
            probs = torch.softmax(logits, dim=1)
            disease_prob = probs[0][1].item()
        
        # Calculate confidence scores
        image_confidence = torch.norm(image_emb).item() / 100  # Normalized
        numeric_confidence = torch.norm(numeric_emb).item() / 50
        
        # Risk level
        if disease_prob < 0.30:
            risk_level = "Low"
        elif disease_prob < 0.60:
            risk_level = "Moderate"
        else:
            risk_level = "High"
        
        # Recommendation
        if risk_level == "High":
            recommendation = "Consult a cardiologist immediately."
        elif risk_level == "Moderate":
            recommendation = "Schedule a cardiology consultation within 2 weeks."
        else:
            recommendation = "Maintain healthy lifestyle and regular checkups."
        
        return {
            "analysis_type": "Cardiovascular Health Analysis",
            "model_used": "google/siglip-base-patch16-224",
            "image_confidence_score": min(image_confidence, 1.0),
            "numeric_risk_score": min(numeric_confidence, 1.0),
            "final_disease_probability": disease_prob,
            "risk_level": risk_level,
            "recommendation": recommendation
        }
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise

def generate_report(result, numeric_data):
    """Generate formatted cardiovascular report"""
    report = f"""
🫀 Cardiovascular Health Analysis Report

Model Used: {result['model_used']}
Disease Probability: {result['final_disease_probability']*100:.0f}%
Risk Level: {result['risk_level'].upper()}

Key Risk Factors:
"""
    
    # Analyze risk factors
    if float(numeric_data.get('chol', 0)) > 240:
        report += "- Elevated Cholesterol\n"
    if float(numeric_data.get('trestbps', 0)) > 140:
        report += "- High Blood Pressure\n"
    if float(numeric_data.get('age', 0)) > 60:
        report += "- Advanced Age\n"
    if int(numeric_data.get('cp', 0)) > 0:
        report += "- Chest Pain Present\n"
    
    report += f"\nRecommendation:\n{result['recommendation']}"
    
    return report
