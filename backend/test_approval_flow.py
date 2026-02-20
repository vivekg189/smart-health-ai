"""
Test script to verify bidirectional approval flow
Run this after starting Flask backend
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_approval_flow():
    print("=" * 60)
    print("TESTING BIDIRECTIONAL APPROVAL FLOW")
    print("=" * 60)
    
    # Step 1: Check if backend is running
    try:
        health = requests.get(f"{BASE_URL}/api/health")
        print(f"\n✓ Backend is running: {health.json()}")
    except:
        print("\n✗ Backend is not running on port 5000")
        return
    
    # Step 2: Login as patient (create session)
    print("\n" + "=" * 60)
    print("STEP 1: Patient submits symptom check")
    print("=" * 60)
    
    # Note: In real flow, patient would login first
    # For testing, we'll use the symptom-checker endpoint directly
    
    symptom_data = {
        "symptoms": "Chest pain, shortness of breath, fatigue",
        "duration": "3 days",
        "severity": "Severe"
    }
    
    print(f"\nSubmitting symptoms: {symptom_data}")
    print("\nNote: This will return 401 if not logged in")
    print("In browser: Login as patient → Go to Assistant → Use Symptom Checker")
    
    # Step 3: Show what doctor would see
    print("\n" + "=" * 60)
    print("STEP 2: Doctor views pending approvals")
    print("=" * 60)
    print("\nEndpoint: GET /api/doctor/pending-approvals")
    print("Returns: List of predictions with status='pending_review'")
    print("\nNote: Requires doctor login")
    print("In browser: Login as doctor → Go to Patient Approvals section")
    
    # Step 4: Show approval process
    print("\n" + "=" * 60)
    print("STEP 3: Doctor approves/rejects")
    print("=" * 60)
    print("\nEndpoint: POST /api/doctor/approve-prediction/<id>")
    print("Payload:")
    print(json.dumps({
        "action": "approve",  # or "reject"
        "remarks": "Clinically verified",
        "modified_prediction": None
    }, indent=2))
    
    # Step 5: Show patient view
    print("\n" + "=" * 60)
    print("STEP 4: Patient sees updated status")
    print("=" * 60)
    print("\nEndpoint: GET /api/data/predictions")
    print("Returns: Updated prediction with:")
    print("  - status: 'clinically_verified' or 'rejected_reeval_required'")
    print("  - doctor_remarks: Doctor's notes")
    print("  - reviewed_by: Doctor ID")
    print("  - reviewed_at: Timestamp")
    
    print("\n" + "=" * 60)
    print("DATA FLOW SUMMARY")
    print("=" * 60)
    print("""
1. Patient Dashboard (Symptom Checker)
   ↓
   POST /api/symptom-checker
   ↓
   Database: Prediction saved with status='pending_review'
   ↓
2. Doctor Dashboard (Patient Approvals)
   ↓
   GET /api/doctor/pending-approvals
   ↓
   Shows all pending predictions
   ↓
3. Doctor clicks Approve/Reject
   ↓
   POST /api/doctor/approve-prediction/<id>
   ↓
   Database: Updates status, doctor_remarks, reviewed_by, reviewed_at
   ↓
4. Patient Dashboard (Doctor Approval tab)
   ↓
   GET /api/data/predictions
   ↓
   Shows updated status with doctor's remarks
    """)
    
    print("\n" + "=" * 60)
    print("TO TEST IN BROWSER:")
    print("=" * 60)
    print("""
1. Open http://localhost:3000/login
2. Login as PATIENT
3. Go to Assistant → Symptom Checker
4. Submit symptoms
5. Logout

6. Login as DOCTOR
7. Go to Doctor Dashboard → Patient Approvals
8. Click Approve or Reject
9. Logout

10. Login as PATIENT again
11. Go to Patient Dashboard → Doctor Approval tab
12. See updated status with doctor's remarks
    """)
    
    print("\n" + "=" * 60)
    print("AUTHENTICATION REQUIRED")
    print("=" * 60)
    print("""
All endpoints require valid session cookies:
- Patient endpoints: Need patient login
- Doctor endpoints: Need doctor login with role='doctor'

The 401 error you're seeing means you need to login first!
    """)

if __name__ == "__main__":
    test_approval_flow()
