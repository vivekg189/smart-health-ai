"""
Simple setup script for Doctor Dashboard
Run this from the backend directory: python setup_doctor_dashboard.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from config import db, init_db
from flask import Flask

def setup():
    print("=" * 50)
    print("Doctor Dashboard Setup")
    print("=" * 50)
    print()
    
    # Create Flask app
    app = Flask(__name__)
    
    # Initialize database
    print("Initializing database...")
    init_db(app)
    
    # Import models after db is initialized
    from models import PatientRecord, TreatmentHistory, User, Appointment
    
    with app.app_context():
        try:
            # Create all tables
            print("Creating tables...")
            db.create_all()
            
            print()
            print("✓ Setup completed successfully!")
            print()
            print("Tables created:")
            print("  - patient_records")
            print("  - treatment_history")
            print("  - (and all other existing tables)")
            print()
            print("Next steps:")
            print("  1. Start backend: python app.py")
            print("  2. Start frontend: npm start")
            print("  3. Login as doctor to access dashboard")
            print()
            
        except Exception as e:
            print(f"✗ Error: {e}")
            print()
            print("If tables already exist, this is normal.")
            print("You can proceed to start the application.")

if __name__ == '__main__':
    setup()
