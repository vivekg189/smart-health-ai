# Quick Setup Guide - Cardiovascular Multimodal Analysis

## 🚀 Installation Steps

### 1. Backend Setup

```bash
cd backend

# Install new dependencies
pip install transformers>=4.0.0 torch>=2.0.0 sentencepiece>=0.1.99

# Restart Flask server
python app.py
```

**Expected Output**:
```
Loading google/medsiglip-224 model...
Multimodal cardiovascular models loaded successfully
```

### 2. Frontend Setup

No additional installation needed! The component is already integrated.

```bash
# If not running, start React dev server
npm start
```

## 🧪 Testing the Feature

### Step 1: Login as Patient
1. Navigate to `http://localhost:3000`
2. Login with patient credentials
3. Go to Patient Dashboard

### Step 2: Access Feature
1. Click on **"Diagnostic Models"**
2. Select **"Cardiovascular Health Analysis"** card
3. You'll be redirected to `/cardiovascular-multimodal`

### Step 3: Upload Image
1. Click the upload box
2. Select a heart medical image (JPG/PNG)
   - Can be: X-ray, ECG printout, cardiac scan
   - For testing, any medical-looking image works
3. Preview will appear below upload box

### Step 4: Fill Clinical Data

**Example Test Data** (High Risk Patient):
```
Age: 65
Sex: Male
Chest Pain Type: Atypical Angina
Resting BP: 160
Cholesterol: 280
Fasting Blood Sugar: > 120 mg/dl
Resting ECG: ST-T Abnormality
Max Heart Rate: 130
Exercise Angina: Yes
ST Depression: 3.5
Slope: Flat
Major Vessels: 2
Thalassemia: Reversible Defect
```

**Example Test Data** (Low Risk Patient):
```
Age: 35
Sex: Female
Chest Pain Type: Asymptomatic
Resting BP: 110
Cholesterol: 180
Fasting Blood Sugar: < 120 mg/dl
Resting ECG: Normal
Max Heart Rate: 180
Exercise Angina: No
ST Depression: 0.5
Slope: Upsloping
Major Vessels: 0
Thalassemia: Normal
```

### Step 5: Analyze
1. Click **"Analyze Heart Health"** button
2. Wait 2-5 seconds for processing
3. View results:
   - Disease probability
   - Risk level (Low/Moderate/High)
   - Image confidence score
   - Numeric risk score
   - Recommendations
   - Formatted report

## 📊 Expected Results

### High Risk Example:
```json
{
  "analysis_type": "Cardiovascular Health Analysis",
  "model_used": "google/medsiglip-224",
  "image_confidence_score": 0.82,
  "numeric_risk_score": 0.75,
  "final_disease_probability": 0.78,
  "risk_level": "High",
  "recommendation": "Consult a cardiologist immediately."
}
```

### Low Risk Example:
```json
{
  "analysis_type": "Cardiovascular Health Analysis",
  "model_used": "google/medsiglip-224",
  "image_confidence_score": 0.68,
  "numeric_risk_score": 0.25,
  "final_disease_probability": 0.22,
  "risk_level": "Low",
  "recommendation": "Maintain healthy lifestyle and regular checkups."
}
```

## 🔍 Verification Checklist

- [ ] Backend starts without errors
- [ ] MedSigLIP model loads successfully
- [ ] Frontend displays upload form correctly
- [ ] Image upload works and shows preview
- [ ] All 13 clinical parameters are present
- [ ] Form validation works (required fields)
- [ ] Submit button triggers analysis
- [ ] Results display correctly
- [ ] Risk level color-coded properly
- [ ] Formatted report appears
- [ ] Prediction saved to database (if logged in)

## 🐛 Common Issues & Solutions

### Issue 1: Model Download Fails
**Error**: `Failed to load models: Connection timeout`

**Solution**:
```bash
# Pre-download model manually
python -c "from transformers import AutoModel; AutoModel.from_pretrained('google/medsiglip-224')"
```

### Issue 2: Image Upload Error
**Error**: `Invalid image format`

**Solution**: Ensure image is JPG or PNG format, not HEIC, WebP, or other formats

### Issue 3: Missing Dependencies
**Error**: `ModuleNotFoundError: No module named 'sentencepiece'`

**Solution**:
```bash
pip install sentencepiece
```

### Issue 4: Route Not Found
**Error**: 404 on `/cardiovascular-multimodal`

**Solution**: Verify `App.js` has the route and component import

### Issue 5: CORS Error
**Error**: `Access-Control-Allow-Origin`

**Solution**: Ensure Flask CORS is configured for `http://localhost:3000`

## 🧪 API Testing (Without Frontend)

### Using Postman:
1. Create new POST request
2. URL: `http://localhost:5000/api/cardiovascular-analysis`
3. Body type: `form-data`
4. Add fields:
   - `image`: File (select heart image)
   - `age`: 55
   - `sex`: 1
   - `cp`: 2
   - `trestbps`: 140
   - `chol`: 250
   - `fbs`: 1
   - `restecg`: 1
   - `thalach`: 150
   - `exang`: 1
   - `oldpeak`: 2.5
   - `slope`: 1
   - `ca`: 1
   - `thal`: 2
5. Send request

### Using Python Script:
```python
import requests

url = "http://localhost:5000/api/cardiovascular-analysis"

# Open test image
with open("test_heart_image.jpg", "rb") as img:
    files = {"image": img}
    
    data = {
        "age": 55, "sex": 1, "cp": 2, "trestbps": 140,
        "chol": 250, "fbs": 1, "restecg": 1, "thalach": 150,
        "exang": 1, "oldpeak": 2.5, "slope": 1, "ca": 1, "thal": 2
    }
    
    response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Risk Level: {result['risk_level']}")
        print(f"Probability: {result['final_disease_probability']:.2%}")
        print(f"Recommendation: {result['recommendation']}")
    else:
        print(f"Error: {response.json()}")
```

## 📝 Database Verification

Check if predictions are saved:

```python
# In Flask shell or Python script
from models import Prediction, db

# Get latest cardiovascular predictions
preds = Prediction.query.filter_by(
    disease_type='cardiovascular_multimodal'
).order_by(Prediction.created_at.desc()).limit(5).all()

for pred in preds:
    print(f"User: {pred.user_id}")
    print(f"Risk: {pred.risk_level}")
    print(f"Probability: {pred.probability}")
    print(f"Date: {pred.created_at}")
    print("---")
```

## 🎯 Feature Validation

### Functional Tests:
1. ✅ Image upload accepts JPG/PNG
2. ✅ Image upload rejects other formats
3. ✅ Form validation prevents empty submissions
4. ✅ Numeric inputs have proper ranges
5. ✅ API returns proper JSON response
6. ✅ Risk levels calculated correctly
7. ✅ Recommendations match risk levels
8. ✅ Formatted report generated
9. ✅ Predictions saved to database
10. ✅ Error handling works properly

### UI/UX Tests:
1. ✅ Component renders without errors
2. ✅ Upload box is clickable
3. ✅ Image preview displays
4. ✅ All form fields are accessible
5. ✅ Submit button shows loading state
6. ✅ Results display with proper styling
7. ✅ Risk level color-coded correctly
8. ✅ Mobile responsive design

## 🚀 Production Deployment

### Before Deploying:
1. Set proper CORS origins in `app.py`
2. Enable GPU if available for faster inference
3. Set up model caching to avoid re-downloads
4. Configure proper error logging
5. Add rate limiting to API endpoint
6. Set up monitoring for model performance

### Environment Variables:
```bash
# .env file
MODEL_CACHE_DIR=/path/to/model/cache
ENABLE_GPU=true
MAX_IMAGE_SIZE=10485760  # 10MB
```

## 📞 Support

If you encounter issues:
1. Check backend logs: `backend/app.log`
2. Check browser console for frontend errors
3. Verify all dependencies installed
4. Ensure models downloaded successfully
5. Test API endpoint directly with cURL/Postman

---

**Ready to Test!** 🎉

Start with the high-risk example data to see the full feature in action.
