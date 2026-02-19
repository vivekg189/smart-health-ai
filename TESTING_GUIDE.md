# Prediction Review System - Testing Guide

## Quick Test (5 minutes)

### Step 1: Verify Database
```sql
-- Check if predictions exist with pending_review status
SELECT id, user_id, disease_type, status, created_at 
FROM predictions 
WHERE status = 'pending_review' 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected**: Should return rows with `status = 'pending_review'`

### Step 2: Test Backend API
```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Test API
curl http://localhost:5000/api/doctor/pending-reviews \
  -H "Cookie: session=your_session_cookie" \
  -H "Content-Type: application/json"
```

**Expected**: JSON response with predictions array

### Step 3: Test Frontend
1. Open browser: `http://localhost:3000`
2. Login as doctor
3. Navigate to Doctor Dashboard
4. Look for "Prediction Reviews" section

**Expected**: Should see pending predictions listed

---

## Detailed Testing Procedure

### Test 1: Create Prediction (Patient Side)

1. **Login as Patient**
   - Email: `patient@test.com`
   - Password: `password123`

2. **Navigate to Diagnostic Models**
   - Click "Diagnostic Models" in menu
   - Select "Diabetes Prediction"

3. **Submit Prediction**
   - Glucose: `180`
   - BMI: `32`
   - Blood Pressure: `90`
   - Age: `55`
   - Click "Predict"

4. **Verify in Database**
   ```sql
   SELECT * FROM predictions 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   
   **Expected**: New row with `status = 'pending_review'`

### Test 2: View Prediction (Doctor Side)

1. **Login as Doctor**
   - Email: `doctor@test.com`
   - Password: `password123`

2. **Navigate to Doctor Dashboard**
   - Should see "Prediction Reviews" section
   - Should display count: "Prediction Review Requests (1)"

3. **Verify Prediction Details**
   - Patient name visible
   - Disease type: "diabetes"
   - Risk level: "High Risk"
   - Probability: "85%"
   - Timestamp visible

4. **Check Browser Console**
   ```javascript
   // Should see successful API call
   fetch('http://localhost:5000/api/doctor/pending-reviews', {credentials: 'include'})
     .then(r => r.json())
     .then(console.log);
   ```

### Test 3: Review Prediction (Doctor Actions)

1. **Click "Review" Button**
   - Modal should open
   - Shows patient details
   - Shows ML prediction
   - Shows input data

2. **Test Approve Action**
   - Add remarks: "Prediction confirmed. Recommend endocrinologist consultation."
   - Click "Approve"
   - **Expected**: 
     - Modal closes
     - Prediction removed from pending list
     - Database status = `'clinically_verified'`

3. **Test Modify Action**
   - Open another prediction
   - Change disease type or risk level
   - Add remarks
   - Click "Modify"
   - **Expected**:
     - Status = `'modified_by_doctor'`
     - Original prediction saved
     - Modified values updated

4. **Test Reject Action**
   - Open prediction
   - Add remarks: "Insufficient data. Recommend re-evaluation."
   - Click "Reject"
   - **Expected**:
     - Status = `'rejected_reeval_required'`
     - Remarks saved

### Test 4: Real-Time Updates

1. **Open Doctor Dashboard in Browser 1**
2. **Open Patient Dashboard in Browser 2**
3. **Submit prediction as patient**
4. **Wait 10 seconds**
5. **Check Doctor Dashboard**

**Expected**: New prediction appears automatically (polling every 10s)

### Test 5: Patient View (My Assessments)

1. **Login as Patient**
2. **Navigate to "My Assessments"**
3. **Verify Status Display**
   - Approved predictions show green badge
   - Rejected predictions show red badge
   - Modified predictions show orange badge
   - Pending predictions show yellow badge

---

## Troubleshooting Tests

### Issue: No predictions showing in Doctor Dashboard

**Test 1: Check Session**
```javascript
// In browser console
fetch('http://localhost:5000/api/auth/check-session', {credentials: 'include'})
  .then(r => r.json())
  .then(console.log);
```
**Expected**: `{role: 'doctor', user_id: X}`

**Test 2: Check Database Directly**
```sql
SELECT COUNT(*) FROM predictions WHERE status = 'pending_review';
```
**Expected**: Count > 0

**Test 3: Check API Response**
```bash
curl -v http://localhost:5000/api/doctor/pending-reviews \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```
**Expected**: 200 OK with predictions array

**Test 4: Check CORS**
```javascript
// In browser console
fetch('http://localhost:5000/api/doctor/pending-reviews', {
  credentials: 'include',
  mode: 'cors'
}).then(r => console.log(r.status, r.headers.get('Access-Control-Allow-Origin')));
```
**Expected**: 200, http://localhost:3000

### Issue: Unauthorized error

**Test: Verify Role**
```sql
SELECT id, email, role FROM users WHERE email = 'your_doctor_email';
```
**Expected**: `role = 'doctor'` (exact match, case-sensitive)

**Fix if wrong**:
```sql
UPDATE users SET role = 'doctor' WHERE email = 'your_doctor_email';
```

### Issue: Status not updating after review

**Test: Check Transaction**
```python
# In Python shell
from app import app, db
from models import Prediction

with app.app_context():
    pred = Prediction.query.first()
    pred.status = 'clinically_verified'
    db.session.commit()
    print(pred.status)
```

**Expected**: Status changes and persists

---

## Performance Tests

### Test 1: Load Test (Multiple Predictions)
```python
# Create 50 test predictions
from app import app, db
from models import Prediction, User

with app.app_context():
    patient = User.query.filter_by(role='patient').first()
    
    for i in range(50):
        pred = Prediction(
            user_id=patient.id,
            disease_type='diabetes',
            prediction_result='High Risk',
            probability=0.75 + (i * 0.001),
            risk_level='High Risk',
            input_data={'test': i},
            status='pending_review'
        )
        db.session.add(pred)
    
    db.session.commit()
    print("Created 50 test predictions")
```

**Test**: Doctor Dashboard should load within 2 seconds

### Test 2: Real-Time Polling
- Open Doctor Dashboard
- Monitor Network tab
- **Expected**: API call every 10 seconds
- **Expected**: No memory leaks after 5 minutes

---

## Security Tests

### Test 1: Patient Cannot Access Doctor API
```bash
# Login as patient, get session cookie
# Try to access doctor endpoint
curl http://localhost:5000/api/doctor/pending-reviews \
  -H "Cookie: patient_session_cookie"
```
**Expected**: Empty array or 401 Unauthorized

### Test 2: Cannot Modify Other Doctor's Reviews
```sql
-- Try to update prediction reviewed by another doctor
UPDATE predictions 
SET doctor_remarks = 'Hacked' 
WHERE reviewed_by != YOUR_DOCTOR_ID;
```
**Expected**: Should fail with RLS policy violation

### Test 3: SQL Injection Protection
```bash
curl -X POST http://localhost:5000/api/doctor/review-prediction \
  -H "Content-Type: application/json" \
  -d '{"prediction_id": "1; DROP TABLE predictions;--", "action": "approved"}'
```
**Expected**: Error, table not dropped

---

## Automated Test Script

```python
# test_prediction_review.py
import requests
import time

BASE_URL = 'http://localhost:5000'

def test_full_flow():
    # 1. Login as patient
    patient_session = requests.Session()
    patient_session.post(f'{BASE_URL}/api/auth/login', json={
        'email': 'patient@test.com',
        'password': 'password123'
    })
    
    # 2. Create prediction
    response = patient_session.post(f'{BASE_URL}/api/predict/diabetes', json={
        'glucose': 180,
        'bmi': 32,
        'blood_pressure': 90,
        'age': 55
    })
    assert response.status_code == 200
    print("✅ Prediction created")
    
    # 3. Login as doctor
    doctor_session = requests.Session()
    doctor_session.post(f'{BASE_URL}/api/auth/login', json={
        'email': 'doctor@test.com',
        'password': 'password123'
    })
    
    # 4. Fetch pending reviews
    response = doctor_session.get(f'{BASE_URL}/api/doctor/pending-reviews')
    assert response.status_code == 200
    predictions = response.json()['predictions']
    assert len(predictions) > 0
    print(f"✅ Found {len(predictions)} pending predictions")
    
    # 5. Review prediction
    pred_id = predictions[0]['id']
    response = doctor_session.post(f'{BASE_URL}/api/doctor/review-prediction', json={
        'prediction_id': pred_id,
        'action': 'approved',
        'remarks': 'Test approval'
    })
    assert response.status_code == 200
    print("✅ Prediction approved")
    
    # 6. Verify it's no longer pending
    response = doctor_session.get(f'{BASE_URL}/api/doctor/pending-reviews')
    new_predictions = response.json()['predictions']
    assert len(new_predictions) == len(predictions) - 1
    print("✅ Prediction removed from pending list")
    
    print("\n🎉 All tests passed!")

if __name__ == '__main__':
    test_full_flow()
```

Run with: `python test_prediction_review.py`

---

## Success Criteria

✅ **System is working correctly if:**

1. Patient can submit predictions
2. Predictions appear in database with `status='pending_review'`
3. Doctor can see predictions in dashboard
4. Doctor can approve/modify/reject predictions
5. Status updates correctly after review
6. Real-time polling works (10s interval)
7. Patient can view reviewed predictions in "My Assessments"
8. No unauthorized access (role-based security works)

---

## Common Test Failures & Fixes

| Test Failure | Cause | Fix |
|-------------|-------|-----|
| No predictions showing | Status mismatch | Check status is exactly `'pending_review'` |
| Unauthorized error | Wrong role | Update user role to `'doctor'` |
| Empty response | Session expired | Re-login |
| CORS error | Wrong origin | Check CORS settings in app.py |
| 500 error | Database connection | Check DATABASE_URL |
| Slow loading | Missing indexes | Run migration script |

---

## Final Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database connected
- [ ] At least 1 doctor user exists
- [ ] At least 1 patient user exists
- [ ] Can create prediction as patient
- [ ] Prediction appears in database
- [ ] Prediction appears in doctor dashboard
- [ ] Can approve/modify/reject as doctor
- [ ] Status updates correctly
- [ ] Real-time polling works
- [ ] No console errors
- [ ] No unauthorized access

**If all checked: System is fully functional! 🎉**
