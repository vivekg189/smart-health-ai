# 🏥 Medical History Correlation System

## Overview
AI-powered system that tracks medical reports over time, detects patterns, and identifies connections between historical data and current symptoms.

---

## 🎯 Your Use Case

### Scenario 1: Fever & Cough (Day 1)
```
User uploads report:
- Symptoms: Fever, Cough
- Parameters: WBC elevated, CRP high
- System saves to history
```

### Scenario 2: Blood Vomiting (Day 3)
```
User uploads new report:
- Symptoms: Blood vomiting
- Parameters: Hemoglobin low, Platelets low

System analyzes:
1. Retrieves Day 1 report (fever/cough)
2. Detects connection: Infection → Bleeding
3. AI Analysis: "Severe infection may have progressed to 
   gastrointestinal complications. Platelet drop concerning."
4. Recommendation: Immediate hospitalization
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER UPLOADS REPORT                       │
│              (With symptoms: fever, cough)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 1: REPORT ANALYSIS                             │
│  • Extract parameters                                        │
│  • Classify abnormalities                                    │
│  • Generate clinical summary                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 2: SAVE TO MEDICAL HISTORY                     │
│  • Store in database with timestamp                          │
│  • Link symptoms to parameters                               │
│  • Tag report type (CBC, LFT, etc.)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 3: HISTORICAL RETRIEVAL                        │
│  • Fetch reports from last 30 days                          │
│  • Get symptom logs                                          │
│  • Build timeline                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 4: TREND DETECTION                             │
│  • Compare parameter values over time                        │
│  • Calculate % change                                        │
│  • Identify: Increasing, Decreasing, Stable                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 5: SYMPTOM PATTERN ANALYSIS                    │
│  • Detect recurring symptoms                                 │
│  • Track severity progression                                │
│  • Identify escalation                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 6: AI CORRELATION ANALYSIS                     │
│  • Use Groq/Flan-T5 to analyze connections                  │
│  • Generate insights about progression                       │
│  • Identify causal relationships                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 7: RELATED REPORTS IDENTIFICATION              │
│  • Find reports with similar abnormalities                   │
│  • Calculate overlap percentage                              │
│  • Link related conditions                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         LAYER 8: RISK ASSESSMENT                             │
│  • Score progression risk                                    │
│  • Identify concerns                                         │
│  • Recommend actions                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         OUTPUT: COMPREHENSIVE CORRELATION REPORT             │
│  • Historical context                                        │
│  • Detected connections                                      │
│  • Progression timeline                                      │
│  • AI insights                                               │
│  • Risk assessment                                           │
│  • Recommendations                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### MedicalReport Table
```sql
CREATE TABLE medical_reports (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    upload_date DATETIME,
    report_type VARCHAR(100),  -- CBC, LFT, KFT, etc.
    file_name VARCHAR(255),
    parameters JSON,  -- All extracted parameters
    abnormal_parameters JSON,  -- Only abnormal ones
    symptoms TEXT,  -- User-reported symptoms
    clinical_summary TEXT,  -- AI-generated summary
    risk_level VARCHAR(50),
    related_reports JSON,  -- IDs of related reports
    progression_notes TEXT,  -- AI analysis
    created_at DATETIME
);
```

### SymptomLog Table
```sql
CREATE TABLE symptom_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    report_id INTEGER,
    symptom_date DATETIME,
    symptoms JSON,  -- ['fever', 'cough', 'fatigue']
    severity VARCHAR(20),  -- Mild, Moderate, Severe
    duration VARCHAR(100),
    created_at DATETIME
);
```

---

## 🔍 Correlation Logic

### 1. Parameter Trend Detection

```python
def detect_parameter_trends(historical_reports, current_data):
    # For each parameter (e.g., Hemoglobin)
    # Get historical values: [12.5, 11.8, 10.2]
    # Get current value: 9.5
    
    # Calculate change
    change_percent = ((9.5 - 12.5) / 12.5) * 100  # -24%
    
    # Classify trend
    if change_percent < -5:
        trend = 'decreasing'  # ⚠️ Concerning
    elif change_percent > 5:
        trend = 'increasing'
    else:
        trend = 'stable'
    
    # Assess concern level
    if abs(change_percent) > 20:
        concern = 'high'  # 🚨 Critical
    elif abs(change_percent) > 10:
        concern = 'moderate'
    else:
        concern = 'low'
```

**Example Output:**
```json
{
  "hemoglobin": {
    "current_value": 9.5,
    "first_value": 12.5,
    "change_percent": -24.0,
    "trend": "decreasing",
    "concern_level": "high",
    "history": [
      {"date": "2024-01-01", "value": 12.5},
      {"date": "2024-01-05", "value": 11.8},
      {"date": "2024-01-10", "value": 10.2}
    ]
  }
}
```

### 2. Symptom Pattern Detection

```python
def detect_symptom_patterns(user_id, current_data, db):
    # Get symptom logs from last 30 days
    logs = [
        {"date": "2024-01-01", "symptoms": ["fever", "cough"], "severity": "Mild"},
        {"date": "2024-01-03", "symptoms": ["fever", "cough", "fatigue"], "severity": "Moderate"},
        {"date": "2024-01-05", "symptoms": ["blood vomiting"], "severity": "Severe"}
    ]
    
    # Analyze frequency
    symptom_frequency = {
        "fever": 2,
        "cough": 2,
        "fatigue": 1,
        "blood vomiting": 1
    }
    
    # Identify recurring (appears 2+ times)
    recurring = ["fever", "cough"]
    
    # Check severity escalation
    severity_levels = {"Mild": 1, "Moderate": 2, "Severe": 3}
    is_escalating = (3 > 1)  # Severe > Mild = True ⚠️
```

**Example Output:**
```json
{
  "has_patterns": true,
  "recurring_symptoms": ["fever", "cough"],
  "is_escalating": true,
  "severity_progression": [
    {"date": "2024-01-05", "severity": "Severe"},
    {"date": "2024-01-03", "severity": "Moderate"},
    {"date": "2024-01-01", "severity": "Mild"}
  ]
}
```

### 3. AI Correlation Analysis

```python
def generate_ai_correlation_analysis(historical_context, current_data, trends, symptom_patterns, groq_client):
    # Build prompt for AI
    prompt = """
    Analyze this patient's medical history:
    
    3 days ago:
    - Symptoms: Fever, Cough
    - Abnormal: WBC 15000 (HIGH), CRP 45 (HIGH)
    - Risk: Moderate
    
    Today:
    - Symptoms: Blood vomiting
    - Abnormal: Hemoglobin 9.5 (LOW), Platelets 80000 (LOW)
    
    TRENDS:
    - Hemoglobin: decreasing (-24% change)
    - Platelets: decreasing (-35% change)
    
    SYMPTOM PATTERNS:
    - Recurring: fever, cough
    - Severity escalating: Mild → Severe
    
    Provide:
    1. CONNECTIONS: What connections exist?
    2. PROGRESSION: How is condition progressing?
    3. CONCERNS: Key concerns?
    4. RECOMMENDATIONS: What should patient do?
    """
    
    # AI Response
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
```

**Example AI Output:**
```
CONNECTIONS:
Initial infection (fever/cough with elevated WBC/CRP) has progressed 
to severe complications. Blood vomiting with dropping hemoglobin and 
platelets suggests gastrointestinal bleeding, possibly from infection-
related coagulopathy or peptic ulcer.

PROGRESSION:
Condition has rapidly deteriorated from mild respiratory infection to 
severe systemic involvement with bleeding. 24% hemoglobin drop in 3 
days is critical.

CONCERNS:
1. Active GI bleeding (blood vomiting)
2. Severe anemia (Hb 9.5)
3. Thrombocytopenia (platelets 80K)
4. Risk of hemorrhagic shock

RECOMMENDATIONS:
IMMEDIATE HOSPITALIZATION REQUIRED. Patient needs:
- Emergency endoscopy
- Blood transfusion
- IV antibiotics
- ICU monitoring
Do not delay - this is life-threatening.
```

### 4. Related Reports Identification

```python
def identify_related_reports(historical_reports, current_data):
    # Current abnormalities
    current_abnormal = {'hemoglobin', 'platelets', 'wbc'}
    
    # Historical report 1 (3 days ago)
    historical_abnormal = {'wbc', 'crp', 'neutrophils'}
    
    # Calculate overlap
    overlap = current_abnormal ∩ historical_abnormal  # {'wbc'}
    overlap_percent = (1 / 3) * 100 = 33.3%
    
    # If overlap > 30%, mark as related
    if overlap_percent > 30:
        related_reports.append({
            'report_id': 123,
            'date': '2024-01-01',
            'days_ago': 3,
            'overlap_percent': 33.3,
            'common_abnormalities': ['wbc'],
            'symptoms': 'fever, cough'
        })
```

### 5. Risk Assessment

```python
def assess_progression_risk(trends, symptom_patterns):
    risk_score = 0
    concerns = []
    
    # Check parameter trends
    worsening_params = [
        {'parameter': 'Hemoglobin', 'concern': 'high'},
        {'parameter': 'Platelets', 'concern': 'high'}
    ]
    risk_score += len(worsening_params) * 2  # +4
    concerns.append("2 parameters showing concerning trends")
    
    # Check symptom escalation
    if symptom_patterns['is_escalating']:
        risk_score += 3  # +3
        concerns.append("Symptom severity is escalating")
    
    # Check recurring symptoms
    recurring_count = len(symptom_patterns['recurring_symptoms'])  # 2
    risk_score += recurring_count  # +2
    concerns.append("2 recurring symptoms")
    
    # Total risk_score = 9
    
    # Determine risk level
    if risk_score >= 8:
        risk_level = 'High'  # ✓
        action = 'Immediate medical consultation recommended'
    elif risk_score >= 4:
        risk_level = 'Moderate'
        action = 'Schedule follow-up within 1 week'
    else:
        risk_level = 'Low'
        action = 'Continue monitoring'
```

---

## 📱 API Endpoints

### 1. Save Report to History
```http
POST /api/medical-history/save-report
Content-Type: application/json

{
  "report_type": "CBC",
  "file_name": "report_2024_01_01.pdf",
  "file_type": "pdf",
  "parameters": [...],
  "symptoms": "fever, cough",
  "clinical_summary": "...",
  "risk_assessment": {...}
}

Response:
{
  "success": true,
  "report_id": 123,
  "message": "Report saved to medical history"
}
```

### 2. Analyze with Historical Correlation
```http
POST /api/medical-history/analyze-with-history
Content-Type: application/json

{
  "parameters": [...],
  "abnormal_parameters": [...],
  "symptoms": "blood vomiting",
  "report_type": "CBC"
}

Response:
{
  "success": true,
  "correlation_analysis": {
    "has_history": true,
    "historical_reports_count": 3,
    "trends": {...},
    "symptom_patterns": {...},
    "ai_correlation": {
      "analysis": "...",
      "confidence": "high"
    },
    "related_reports": [...],
    "timeline": [...],
    "risk_assessment": {
      "risk_level": "High",
      "concerns": [...],
      "recommended_action": "..."
    }
  }
}
```

### 3. Get Medical History
```http
GET /api/medical-history/history?days=30&limit=10

Response:
{
  "success": true,
  "reports": [
    {
      "id": 123,
      "upload_date": "2024-01-01T10:00:00",
      "report_type": "CBC",
      "symptoms": "fever, cough",
      "abnormal_parameters": [...],
      "risk_level": "Moderate"
    }
  ],
  "total_count": 3
}
```

### 4. Log Symptoms
```http
POST /api/medical-history/log-symptoms
Content-Type: application/json

{
  "symptoms": ["fever", "cough", "fatigue"],
  "severity": "Moderate",
  "duration": "3 days"
}

Response:
{
  "success": true,
  "log_id": 456,
  "message": "Symptoms logged successfully"
}
```

### 5. Dashboard Summary
```http
GET /api/medical-history/dashboard-summary

Response:
{
  "success": true,
  "summary": {
    "total_reports": 5,
    "recent_reports_count": 3,
    "abnormal_parameters_count": 8,
    "top_concerns": [
      {"parameter": "hemoglobin", "frequency": 3},
      {"parameter": "wbc", "frequency": 2}
    ],
    "recent_reports": [...],
    "recent_symptoms": [...]
  }
}
```

---

## 🎨 Frontend Integration

### Patient Dashboard Component
```jsx
import React, { useState, useEffect } from 'react';

function PatientDashboard() {
  const [history, setHistory] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  
  useEffect(() => {
    // Fetch medical history
    fetch('/api/medical-history/dashboard-summary')
      .then(res => res.json())
      .then(data => setHistory(data.summary));
  }, []);
  
  const analyzeWithHistory = async (currentReport) => {
    const response = await fetch('/api/medical-history/analyze-with-history', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(currentReport)
    });
    
    const data = await response.json();
    setCorrelation(data.correlation_analysis);
  };
  
  return (
    <div>
      {/* Timeline */}
      <Timeline reports={history?.recent_reports} />
      
      {/* Correlation Analysis */}
      {correlation && (
        <CorrelationCard 
          trends={correlation.trends}
          aiAnalysis={correlation.ai_correlation}
          riskAssessment={correlation.risk_assessment}
        />
      )}
      
      {/* Top Concerns */}
      <ConcernsWidget concerns={history?.top_concerns} />
    </div>
  );
}
```

---

## 🚀 Setup Instructions

### 1. Database Migration
```bash
# Add to app.py
from medical_history_routes import medical_history_bp
app.register_blueprint(medical_history_bp, url_prefix='/api/medical-history')

# Run migration
flask db init
flask db migrate -m "Add medical history tables"
flask db upgrade
```

### 2. Update Report Analyzer
```python
# In analyze_medical_report() endpoint
# After generating analysis, save to history:

if 'user_id' in session:
    save_to_history(
        user_id=session['user_id'],
        report_data=analysis_result
    )
    
    # Get correlation analysis
    correlation = analyze_historical_correlation(
        user_id=session['user_id'],
        current_report_data=analysis_result
    )
    
    response['correlation_analysis'] = correlation
```

---

## ✅ Features

- ✅ **Automatic History Tracking**: Every report saved automatically
- ✅ **Trend Detection**: Tracks parameter changes over time
- ✅ **Symptom Patterns**: Identifies recurring symptoms
- ✅ **AI Correlation**: Uses Groq to find connections
- ✅ **Related Reports**: Links similar conditions
- ✅ **Risk Scoring**: Assesses progression severity
- ✅ **Timeline View**: Visual health progression
- ✅ **Smart Alerts**: Warns about concerning trends

---

## 📊 Example Complete Flow

**Day 1: Upload Report #1**
```
Symptoms: Fever, Cough
WBC: 15000 (HIGH)
→ Saved to history
→ No previous reports
→ Risk: Moderate
```

**Day 3: Upload Report #2**
```
Symptoms: Blood vomiting
Hemoglobin: 9.5 (LOW)
Platelets: 80000 (LOW)

→ System retrieves Day 1 report
→ Detects trends:
  - WBC was high (infection)
  - Now Hb/Platelets low (bleeding)
→ AI Analysis:
  "Infection progressed to GI bleeding.
   Critical condition. Immediate hospitalization."
→ Risk: HIGH
→ Action: Emergency care required
```

---

## 🎯 Benefits

1. **Early Detection**: Catches deteriorating conditions
2. **Pattern Recognition**: Identifies disease progression
3. **Personalized Insights**: Based on individual history
4. **Preventive Care**: Warns before critical stage
5. **Better Decisions**: Doctors see full context
6. **Patient Empowerment**: Users understand their health journey

---

## Status
✅ **Database models created**
✅ **Correlation engine implemented**
✅ **API routes ready**
✅ **AI integration complete**
📝 **Frontend integration needed**
🚀 **Ready for deployment**
