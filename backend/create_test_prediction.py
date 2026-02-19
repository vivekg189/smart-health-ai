"""
Create test prediction data in Supabase
Run this to populate predictions table
"""
from app import app, db
from models import Prediction, User
from datetime import datetime
import uuid

with app.app_context():
    try:
        # Get first user (or create test user)
        user = User.query.first()
        
        if not user:
            print("❌ No users found. Create a user first via signup.")
            exit(1)
        
        # Create test prediction
        test_pred = Prediction(
            id=str(uuid.uuid4()),
            user_id=user.id,
            disease_type='diabetes',
            prediction_result='High Risk',
            probability=0.85,
            risk_level='High Risk',
            input_data={'glucose': 180, 'bmi': 32, 'blood_pressure': 90, 'age': 55},
            status='pending_review',
            created_at=datetime.utcnow()
        )
        
        db.session.add(test_pred)
        db.session.commit()
        
        print(f"✅ Created test prediction with ID: {test_pred.id}")
        print(f"   Patient: {user.name} ({user.email})")
        print(f"   Status: {test_pred.status}")
        print(f"   Disease: {test_pred.disease_type}")
        
        # Verify
        count = Prediction.query.filter_by(status='pending_review').count()
        print(f"\n📊 Total pending predictions: {count}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.session.rollback()
