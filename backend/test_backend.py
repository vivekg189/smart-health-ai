"""
Test script to verify backend is working
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing imports...")
    from app import app
    from config import db
    from models import User, HealthData, NotificationSettings, PrivacySettings
    print("✓ All imports successful")
    
    print("\nTesting database connection...")
    with app.app_context():
        db.create_all()
        print("✓ Database tables created/verified")
        
        # Test query
        user_count = User.query.count()
        print(f"✓ Database query successful - {user_count} users in database")
    
    print("\n✓ Backend is ready!")
    print("\nTo start the server, run:")
    print("  python app.py")
    
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    print("\nPlease check:")
    print("1. All dependencies are installed (pip install -r requirements.txt)")
    print("2. Database configuration is correct")
    import traceback
    traceback.print_exc()
