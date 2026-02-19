# 🫀 Cardiovascular Multimodal Analysis - Quick Reference

## 🚀 Quick Start

```bash
# Backend
cd backend
pip install sentencepiece
python app.py

# Frontend (already integrated)
npm start
```

## 📍 Access Points

- **Frontend Route**: `/cardiovascular-multimodal`
- **API Endpoint**: `POST /api/cardiovascular-analysis`
- **Dashboard**: Patient Dashboard → Diagnostic Models → Cardiovascular Health Analysis

## 📦 New Files

```
backend/
  └── cardiovascular_multimodal.py    # AI models & prediction logic

src/
  └── components/
      └── CardiovascularMultimodal.js # React component

docs/
  ├── CARDIOVASCULAR_MULTIMODAL_FEATURE.md
  ├── SETUP_GUIDE_CARDIOVASCULAR.md
  └── IMPLEMENTATION_SUMMARY.md
```

## 🔧 Modified Files

```
backend/
  ├── app.py                 # Added /api/cardiovascular-analysis endpoint
  └── requirements.txt       # Added sentencepiece

src/
  ├── App.js                 # Added route & import
  └── pages/
      └── ModelsAnimated.js  # Updated card to point to new feature
```

## 🧪 Test Data (High Risk)

```javascript
{
  age: 65,
  sex: 1,              // Male
  cp: 1,               // Atypical Angina
  trestbps: 160,       // High BP
  chol: 280,           // High Cholesterol
  fbs: 1,              // High Blood Sugar
  restecg: 1,          // ST-T Abnormality
  thalach: 130,        // Low Max HR
  exang: 1,            // Exercise Angina
  oldpeak: 3.5,        // High ST Depression
  slope: 1,            // Flat
  ca: 2,               // 2 Major Vessels
  thal: 2              // Reversible Defect
}
```

## 🧪 Test Data (Low Risk)

```javascript
{
  age: 35,
  sex: 0,              // Female
  cp: 3,               // Asymptomatic
  trestbps: 110,       // Normal BP
  chol: 180,           // Normal Cholesterol
  fbs: 0,              // Normal Blood Sugar
  restecg: 0,          // Normal ECG
  thalach: 180,        // High Max HR
  exang: 0,            // No Exercise Angina
  oldpeak: 0.5,        // Low ST Depression
  slope: 0,            // Upsloping
  ca: 0,               // 0 Major Vessels
  thal: 0              // Normal
}
```

## 📊 API Request Example

```bash
curl -X POST http://localhost:5000/api/cardiovascular-analysis \
  -F "image=@heart.jpg" \
  -F "age=55" -F "sex=1" -F "cp=2" \
  -F "trestbps=140" -F "chol=250" \
  -F "fbs=1" -F "restecg=1" \
  -F "thalach=150" -F "exang=1" \
  -F "oldpeak=2.5" -F "slope=1" \
  -F "ca=1" -F "thal=2"
```

## 📊 API Response Example

```json
{
  "analysis_type": "Cardiovascular Health Analysis",
  "model_used": "google/medsiglip-224",
  "image_confidence_score": 0.85,
  "numeric_risk_score": 0.72,
  "final_disease_probability": 0.81,
  "risk_level": "High",
  "recommendation": "Consult a cardiologist immediately.",
  "formatted_report": "🫀 Cardiovascular Health Analysis Report\n..."
}
```

## 🎯 Risk Levels

| Probability | Risk | Action |
|-------------|------|--------|
| < 30% | Low | Regular checkups |
| 30-60% | Moderate | Consult within 2 weeks |
| > 60% | High | Immediate consultation |

## 🏗️ Architecture

```
Image (224x224) → MedSigLIP → 512d embedding
                                    ↓
13 Parameters → NumericMLP → 128d embedding
                                    ↓
                    Fusion Model (640d → 2)
                                    ↓
                    Disease Probability
```

## 🔍 Debugging

```bash
# Check model loading
python -c "from cardiovascular_multimodal import load_models; load_models()"

# Check database
python -c "from models import Prediction; print(Prediction.query.filter_by(disease_type='cardiovascular_multimodal').all())"

# Test API
curl http://localhost:5000/api/health
```

## ⚠️ Common Errors

| Error | Solution |
|-------|----------|
| Model download fails | Check internet, disk space |
| Image upload error | Use JPG/PNG only |
| Missing sentencepiece | `pip install sentencepiece` |
| Route not found | Check App.js routing |
| CORS error | Verify Flask CORS config |

## 📚 Documentation

- **Full Docs**: `CARDIOVASCULAR_MULTIMODAL_FEATURE.md`
- **Setup Guide**: `SETUP_GUIDE_CARDIOVASCULAR.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

## 🎨 UI Components

- **Upload Box**: Drag-and-drop or click
- **13 Input Fields**: Age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
- **Results Card**: Probability, risk level, confidence scores, recommendations
- **Report**: Formatted medical report with key risk factors

## 🔐 Security

- ✅ Images in-memory only
- ✅ No permanent storage
- ✅ Encrypted data transit
- ✅ Input validation
- ✅ CORS protection

## 📦 Dependencies

```
Backend:
- transformers>=4.0.0
- torch>=2.0.0
- sentencepiece>=0.1.99
- Pillow>=10.0.0

Frontend:
- @mui/material (already installed)
- react-router-dom (already installed)
```

## ✅ Checklist

- [ ] Install sentencepiece
- [ ] Restart Flask server
- [ ] Verify model loads
- [ ] Test image upload
- [ ] Test form submission
- [ ] Verify API response
- [ ] Check database save
- [ ] Test mobile view

## 🚀 Production

```bash
# Set environment variables
export MODEL_CACHE_DIR=/path/to/cache
export ENABLE_GPU=true

# Deploy backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Build frontend
npm run build
```

---

**Quick Links**:
- Frontend: `http://localhost:3000/cardiovascular-multimodal`
- API: `http://localhost:5000/api/cardiovascular-analysis`
- Health Check: `http://localhost:5000/api/health`

**Status**: ✅ Ready for Testing
