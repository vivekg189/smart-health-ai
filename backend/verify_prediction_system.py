"""
Prediction Review System - Verification and Fix Script
Run this to diagnose and fix prediction review issues
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import db
from models import Prediction, User
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_database_connection():
    """Verify database connection"""
    try:
        db.session.execute(text('SELECT 1'))
        logger.info("✅ Database connection successful")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {str(e)}")
        return False

def check_predictions_table():
    """Verify predictions table exists and has correct schema"""
    try:
        result = db.session.execute(text("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'predictions'
            ORDER BY ordinal_position
        """))
        
        columns = {row[0]: row[1] for row in result}
        
        required_columns = [
            'id', 'user_id', 'disease_type', 'prediction_result',
            'probability', 'risk_level', 'input_data', 'status',
            'reviewed_by', 'reviewed_at', 'doctor_remarks',
            'original_prediction', 'modified_prediction',
            'approval_action', 'created_at'
        ]
        
        missing = [col for col in required_columns if col not in columns]
        
        if missing:
            logger.error(f"❌ Missing columns: {missing}")
            return False
        else:
            logger.info("✅ Predictions table schema is correct")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error checking predictions table: {str(e)}")
        return False

def check_pending_predictions():
    """Check for pending predictions"""
    try:
        count = Prediction.query.filter_by(status='pending_review').count()
        logger.info(f"📊 Found {count} pending predictions")
        
        if count > 0:
            # Show sample
            sample = Prediction.query.filter_by(status='pending_review').first()
            logger.info(f"   Sample: ID={sample.id}, Disease={sample.disease_type}, User={sample.user_id}")
        
        return count
    except Exception as e:
        logger.error(f"❌ Error checking pending predictions: {str(e)}")
        return -1

def check_doctor_users():
    """Verify doctor users exist"""
    try:
        count = User.query.filter_by(role='doctor').count()
        logger.info(f"👨‍⚕️ Found {count} doctor users")
        
        if count == 0:
            logger.warning("⚠️  No doctor users found. Create at least one doctor account.")
        
        return count
    except Exception as e:
        logger.error(f"❌ Error checking doctor users: {str(e)}")
        return -1

def fix_null_status():
    """Fix predictions with NULL status"""
    try:
        result = db.session.execute(text("""
            UPDATE predictions
            SET status = 'pending_review'
            WHERE status IS NULL
            RETURNING id
        """))
        
        fixed_count = result.rowcount
        db.session.commit()
        
        if fixed_count > 0:
            logger.info(f"🔧 Fixed {fixed_count} predictions with NULL status")
        else:
            logger.info("✅ No NULL status predictions found")
        
        return fixed_count
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error fixing NULL status: {str(e)}")
        return -1

def check_indexes():
    """Verify indexes exist"""
    try:
        result = db.session.execute(text("""
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'predictions'
        """))
        
        indexes = [row[0] for row in result]
        
        required_indexes = [
            'idx_predictions_status',
            'idx_predictions_user_id',
            'idx_predictions_created_at'
        ]
        
        missing = [idx for idx in required_indexes if idx not in indexes]
        
        if missing:
            logger.warning(f"⚠️  Missing indexes: {missing}")
            logger.info("   Run: CREATE INDEX idx_predictions_status ON predictions(status);")
        else:
            logger.info("✅ All required indexes exist")
        
        return len(missing) == 0
    except Exception as e:
        logger.error(f"❌ Error checking indexes: {str(e)}")
        return False

def create_test_prediction(user_id=None):
    """Create a test prediction for verification"""
    try:
        if user_id is None:
            # Get first patient user
            patient = User.query.filter_by(role='patient').first()
            if not patient:
                logger.error("❌ No patient users found. Cannot create test prediction.")
                return None
            user_id = patient.id
        
        test_pred = Prediction(
            user_id=user_id,
            disease_type='diabetes',
            prediction_result='High Risk',
            probability=0.85,
            risk_level='High Risk',
            input_data={'glucose': 180, 'bmi': 32, 'blood_pressure': 90, 'age': 55},
            status='pending_review'
        )
        
        db.session.add(test_pred)
        db.session.commit()
        
        logger.info(f"✅ Created test prediction with ID: {test_pred.id}")
        return test_pred.id
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error creating test prediction: {str(e)}")
        return None

def verify_query():
    """Verify the exact query used by doctor dashboard"""
    try:
        predictions = Prediction.query.filter_by(status='pending_review').order_by(Prediction.created_at.desc()).all()
        
        logger.info(f"🔍 Query returned {len(predictions)} predictions")
        
        for pred in predictions[:3]:
            user_name = pred.user.name if pred.user else 'Unknown'
            logger.info(f"   - ID: {pred.id}, Patient: {user_name}, Disease: {pred.disease_type}, Status: {pred.status}")
        
        return len(predictions)
    except Exception as e:
        logger.error(f"❌ Error verifying query: {str(e)}")
        return -1

def check_status_distribution():
    """Show distribution of prediction statuses"""
    try:
        result = db.session.execute(text("""
            SELECT status, COUNT(*) as count
            FROM predictions
            GROUP BY status
            ORDER BY count DESC
        """))
        
        logger.info("📊 Status Distribution:")
        for row in result:
            logger.info(f"   {row[0]}: {row[1]}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Error checking status distribution: {str(e)}")
        return False

def main():
    """Run all diagnostic checks"""
    print("=" * 60)
    print("Prediction Review System - Diagnostic Tool")
    print("=" * 60)
    print()
    
    # Initialize Flask app context
    from app import app
    with app.app_context():
        # Run checks
        checks = [
            ("Database Connection", check_database_connection),
            ("Predictions Table Schema", check_predictions_table),
            ("Indexes", check_indexes),
            ("Doctor Users", check_doctor_users),
            ("Pending Predictions", check_pending_predictions),
            ("Status Distribution", check_status_distribution),
        ]
        
        results = {}
        for name, check_func in checks:
            print(f"\n{name}...")
            results[name] = check_func()
        
        # Fix issues
        print("\n" + "=" * 60)
        print("Fixing Issues...")
        print("=" * 60)
        
        fix_null_status()
        
        # Verify query
        print("\n" + "=" * 60)
        print("Verifying Doctor Dashboard Query...")
        print("=" * 60)
        verify_query()
        
        # Summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        
        pending_count = check_pending_predictions()
        doctor_count = check_doctor_users()
        
        if pending_count > 0 and doctor_count > 0:
            print("✅ System is ready!")
            print(f"   - {pending_count} predictions waiting for review")
            print(f"   - {doctor_count} doctors available")
            print("\n📋 Next Steps:")
            print("   1. Login as a doctor")
            print("   2. Navigate to Doctor Dashboard")
            print("   3. Check 'Prediction Reviews' section")
        elif pending_count == 0:
            print("⚠️  No pending predictions found")
            print("\n📋 To test:")
            print("   1. Login as a patient")
            print("   2. Go to Diagnostic Models")
            print("   3. Submit a prediction")
            print("   4. Login as doctor to see it")
            
            # Offer to create test prediction
            response = input("\nCreate a test prediction? (y/n): ")
            if response.lower() == 'y':
                create_test_prediction()
                print("\n✅ Test prediction created. Check Doctor Dashboard now.")
        elif doctor_count == 0:
            print("⚠️  No doctor users found")
            print("\n📋 Create a doctor account:")
            print("   1. Register with role='doctor'")
            print("   2. Or update existing user: UPDATE users SET role='doctor' WHERE email='doctor@example.com';")
        
        print("\n" + "=" * 60)

if __name__ == '__main__':
    main()
