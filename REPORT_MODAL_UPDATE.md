# Report Modal Update Instructions

The report modal needs to display AI symptom checker data from the `original_prediction` field in the database.

## Data Structure Expected

When a prediction is saved from the symptom checker, it should include:

```javascript
{
  id: 123,
  disease_type: "Migraine",
  risk_level: "Moderate",
  probability: 0.802,
  input_data: {
    symptoms: "i have body pains and also the tired",
    duration: "3-7 days",
    severity: "Moderate"
  },
  original_prediction: {
    symptom_comparison: {
      relation_status: "Related",
      overlap_percentage: 66.67,
      comparison_summary: "Present symptoms (body pains and tired) show a moderate risk overlap with past symptoms of Migraine (leg and back pain) and Influenza (cold and cough)"
    },
    severity_change: "Stable",
    chief_complaint: "i have body pains and also the tired",
    top_prediction: {
      disease: "Migraine",
      risk: "Moderate",
      confidence: 80.2,
      next_step: "Schedule a clinical consultation and share this report with your doctor for confirmation.",
      explanation: "Symptoms of body pains and tiredness are consistent with past episodes of Migraine"
    },
    other_conditions: [
      { disease: "Influenza", confidence: 75.5, risk: "High" },
      { disease: "Gastritis", confidence: 68.9, risk: "Moderate" }
    ],
    recommended_steps: [
      "Monitor symptoms for 24 hours",
      "Consult a doctor if symptoms worsen or persist",
      "Maintain regular health monitoring",
      "Follow prescribed lifestyle modifications"
    ]
  },
  status: "pending_review",
  created_at: "2025-02-20T01:00:52Z"
}
```

## Backend Update Required

Update the symptom checker API endpoint to save the complete analysis:

```python
# In app.py - /api/symptom-checker endpoint
prediction_data = {
    'user_id': user_id,
    'disease_type': result['top_prediction']['disease'],
    'prediction_result': result['top_prediction']['risk'],
    'probability': result['top_prediction']['confidence'] / 100,
    'risk_level': result['top_prediction']['risk'],
    'input_data': {
        'symptoms': symptoms,
        'duration': duration,
        'severity': severity
    },
    'original_prediction': result,  # Save the entire result
    'status': 'pending_review'
}
```

## Frontend - Report Modal Already Updated

The report modal in PatientDashboard.js now checks for `original_prediction` data and displays:

1. **Symptom Comparison Summary** - Shows relation status, overlap percentage, and comparison text
2. **Chief Complaint** - Patient's symptom description
3. **Primary Suspected Condition** - With confidence score and explanation
4. **Other Possible Conditions** - Alternative diagnoses
5. **Recommended Next Steps** - Action items from AI

All sections gracefully fall back to default values if data is not available.
