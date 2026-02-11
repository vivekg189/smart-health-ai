# Medical Report Analyzer - Installation Guide

## New Feature Added: Medical Report Analyzer

A standalone NLP-based feature that analyzes medical reports and explains them in simple language.

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install pytesseract PyPDF2
```

Or install all dependencies:
```bash
pip install -r requirements.txt
```

### 2. Install Tesseract OCR

**Windows:**
1. Download Tesseract installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install it (default location: `C:\Program Files\Tesseract-OCR`)
3. Add to PATH or set in code:
   ```python
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

**Mac:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### 3. Restart Flask Server

```bash
python app.py
```

## Frontend Setup

No additional dependencies needed! The feature uses existing React and Material-UI components.

## Usage

1. Navigate to "Report Analyzer" in the navbar
2. Upload a medical report (PDF or image format)
3. Click "Analyze Report"
4. View simple explanations of your test results

## Supported Parameters

The analyzer can detect and explain:
- Blood Glucose
- Hemoglobin
- Cholesterol
- Creatinine
- Blood Pressure
- BMI
- White Blood Cells (WBC)
- Red Blood Cells (RBC)

## API Endpoint

**POST** `/api/analyze-report`

**Request:** multipart/form-data with file upload

**Response:**
```json
{
  "success": true,
  "parameters": [
    {
      "parameter": "Blood Glucose",
      "value": "95",
      "unit": "mg/dL",
      "status": "normal",
      "explanation": "Your Blood Glucose is 95 mg/dL, which is within the normal range (70-100 mg/dL)."
    }
  ],
  "total_found": 1,
  "disclaimer": "This is an AI-assisted analysis..."
}
```

## Features

✅ PDF text extraction
✅ OCR for image-based reports
✅ NLP parameter extraction
✅ Reference range comparison
✅ Plain-English explanations
✅ Color-coded status indicators
✅ No diagnosis - educational only
✅ Clear medical disclaimer

## Notes

- This feature is standalone and doesn't connect to prediction models
- It's for educational purposes only
- Always consult healthcare professionals for medical advice
