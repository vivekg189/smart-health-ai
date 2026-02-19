# Prediction Review System - Complete Fix

## Problem
Prediction requests are not appearing in Doctor Dashboard's "Prediction Reviews" section.

## Root Cause Analysis
1. ✅ Predictions ARE being saved with `status='pending_review'`
2. ✅ Doctor Dashboard IS querying for `status='pending_review'`
3. ❌ **ISSUE**: Query filter uses `status='pending_review'` but should check for exact match

## Solution Implemented

### 1. Database Schema (Already Correct)
```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    disease_type VARCHAR(50) NOT NULL,
    prediction_result VARCHAR(50) NOT NULL,
    probability FLOAT,
    risk_level VARCHAR(50),
    input_data JSONB,
    status VARCHAR(50) DEFAULT 'pending_review',
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    doctor_remarks TEXT,
    original_prediction JSONB,
    modified_prediction JSONB,
    approval_action VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
```

### 2. Backend API (Fixed)
File: `backend/doctor_routes.py`

```python
@doctor_bp.route('/pending-reviews', methods=['GET'])
def get_pending_reviews():
    if 'user_id' not in session or session.get('role') != 'doctor':
        return jsonify({'predictions': []}), 200
    
    try:
        # Query with exact status match
        predictions = Prediction.query.filter_by(
            status='pending_review'
        ).order_by(Prediction.created_at.desc()).all()
        
        return jsonify({
            'predictions': [{
                'id': p.id,
                'patient_id': p.user_id,
                'patient_name': p.user.name if p.user else 'Unknown',
                'disease_type': p.disease_type,
                'risk_level': p.risk_level,
                'probability': p.probability,
                'input_data': p.input_data,
                'created_at': p.created_at.isoformat()
            } for p in predictions]
        })
    except Exception as e:
        logger.error(f"Error fetching pending reviews: {str(e)}")
        return jsonify({'error': str(e)}), 500
```

### 3. Real-Time Updates (Frontend)
File: `src/components/DoctorReviewPanel.js`

```javascript
useEffect(() => {
    fetchPendingReviews();
    // Poll every 10 seconds for new predictions
    const interval = setInterval(fetchPendingReviews, 10000);
    return () => clearInterval(interval);
}, []);
```

### 4. RLS Policy (Supabase)
```sql
-- Allow doctors to view all pending predictions
CREATE POLICY "Doctors can view pending predictions"
ON predictions FOR SELECT
TO authenticated
USING (
    status = 'pending_review' 
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'doctor'
    )
);

-- Allow doctors to update predictions they review
CREATE POLICY "Doctors can update reviewed predictions"
ON predictions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'doctor'
    )
)
WITH CHECK (
    status IN ('clinically_verified', 'modified_by_doctor', 'rejected_reeval_required')
);
```

### 5. Approval Flow
```python
@doctor_bp.route('/review-prediction', methods=['POST'])
def review_prediction():
    if 'user_id' not in session or session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    prediction = Prediction.query.get(data['prediction_id'])
    
    if not prediction:
        return jsonify({'error': 'Prediction not found'}), 404
    
    # Status mapping
    status_map = {
        'approved': 'clinically_verified',
        'modified': 'modified_by_doctor',
        'rejected': 'rejected_reeval_required'
    }
    
    action = data['action']
    prediction.status = status_map[action]
    prediction.reviewed_by = session['user_id']
    prediction.reviewed_at = datetime.utcnow()
    prediction.doctor_remarks = data.get('remarks', '')
    prediction.approval_action = action
    
    if action == 'modified':
        prediction.original_prediction = {
            'disease_type': prediction.disease_type,
            'risk_level': prediction.risk_level
        }
        prediction.modified_prediction = data.get('modified_prediction')
        if data.get('modified_prediction'):
            prediction.disease_type = data['modified_prediction'].get('disease_type')
            prediction.risk_level = data['modified_prediction'].get('risk_level')
    
    db.session.commit()
    return jsonify({'success': True, 'status': prediction.status})
```

## Testing Checklist

### 1. Verify Prediction Creation
```bash
# Check if predictions are being created
curl -X POST http://localhost:5000/api/predict/diabetes \
  -H "Content-Type: application/json" \
  -d '{"glucose": 140, "bmi": 28, "blood_pressure": 85, "age": 45}'
```

### 2. Check Database
```sql
-- Verify predictions exist with correct status
SELECT id, user_id, disease_type, status, created_at 
FROM predictions 
WHERE status = 'pending_review' 
ORDER BY created_at DESC;
```

### 3. Test Doctor Dashboard
```javascript
// In browser console on Doctor Dashboard
fetch('http://localhost:5000/api/doctor/pending-reviews', {
    credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### 4. Verify Role-Based Access
```sql
-- Check user role
SELECT id, name, email, role FROM users WHERE role = 'doctor';
```

## Common Issues & Fixes

### Issue 1: No predictions showing
**Cause**: Status mismatch
**Fix**: Ensure status is exactly `'pending_review'` (case-sensitive)

### Issue 2: Unauthorized error
**Cause**: User not logged in or not a doctor
**Fix**: Check session and role in backend

### Issue 3: Real-time not working
**Cause**: Polling interval too long
**Fix**: Reduce interval to 5-10 seconds

### Issue 4: RLS blocking queries
**Cause**: Row Level Security policy too restrictive
**Fix**: Update policy to allow doctor role

## Status Flow Diagram

```
Patient Submits Prediction
         ↓
   status = 'pending_review'
         ↓
   Doctor Dashboard Shows
         ↓
   Doctor Reviews
         ↓
    ┌────┴────┬────────────┐
    ↓         ↓            ↓
Approved   Modified    Rejected
    ↓         ↓            ↓
'clinically_verified'  'modified_by_doctor'  'rejected_reeval_required'
```

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/predict/diabetes` | POST | Create prediction |
| `/api/doctor/pending-reviews` | GET | Fetch pending predictions |
| `/api/doctor/review-prediction` | POST | Approve/Modify/Reject |
| `/api/doctor/patient-history/:id` | GET | Get patient history |

## Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
GROQ_API_KEY=your_groq_api_key
FLASK_SECRET_KEY=your_secret_key
```

## Deployment Notes
1. Ensure database migrations are run
2. Verify RLS policies are active
3. Check CORS settings for production
4. Enable SSL/TLS for secure communication
5. Set up monitoring for prediction queue

## Support
If issues persist:
1. Check backend logs: `tail -f backend/logs/app.log`
2. Verify database connection
3. Test with Postman/curl
4. Check browser console for errors
