import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config import db, init_db
from flask import Flask
from models import PatientRecord, TreatmentHistory

def run_migration():
    """Create doctor dashboard tables using SQLAlchemy"""
    app = Flask(__name__)
    init_db(app)
    
    with app.app_context():
        try:
            # Create all tables defined in models
            db.create_all()
            print("✓ Doctor dashboard tables created successfully!")
            print("  - patient_records")
            print("  - treatment_history")
        except Exception as e:
            print(f"✗ Error creating tables: {e}")

if __name__ == '__main__':
    run_migration()
