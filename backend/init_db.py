"""
Database initialization script
Run this to create all tables and verify database connection
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if DATABASE_URL is set
if not os.getenv('DATABASE_URL'):
    print("❌ ERROR: DATABASE_URL not found in .env file")
    print("\nPlease create a .env file with:")
    print("DATABASE_URL=postgresql://user:password@host:port/database")
    sys.exit(1)

print("✓ Environment variables loaded")

# Import Flask app and database
try:
    from app import app
    from config import db
    from models import User, Prediction, DoctorAvailability, Consultation, MedicalNote
    print("✓ Modules imported successfully")
except ImportError as e:
    print(f"❌ ERROR: Failed to import modules: {e}")
    print("\nMake sure you've installed all dependencies:")
    print("pip install -r requirements.txt")
    sys.exit(1)

def init_database():
    """Initialize database and create all tables"""
    with app.app_context():
        try:
            # Test database connection
            db.engine.connect()
            print("✓ Database connection successful")
            
            # Create all tables
            db.create_all()
            print("✓ All tables created successfully")
            
            # Verify tables
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            print("\n📊 Created tables:")
            for table in tables:
                print(f"  - {table}")
            
            # Check expected tables
            expected_tables = ['users', 'predictions', 'doctor_availability', 'consultations', 'medical_notes']
            missing_tables = [t for t in expected_tables if t not in tables]
            
            if missing_tables:
                print(f"\n⚠️  WARNING: Missing tables: {', '.join(missing_tables)}")
            else:
                print("\n✅ All expected tables created successfully!")
            
            return True
            
        except Exception as e:
            print(f"\n❌ ERROR: Database initialization failed: {e}")
            return False

def create_test_users():
    """Create test users for development"""
    with app.app_context():
        try:
            from werkzeug.security import generate_password_hash
            
            # Check if users already exist
            if User.query.first():
                print("\n⚠️  Users already exist. Skipping test user creation.")
                return
            
            # Create test patient
            patient = User(
                name="Test Patient",
                email="patient@test.com",
                password_hash=generate_password_hash("test123"),
                role="patient"
            )
            db.session.add(patient)
            
            # Create test doctor
            doctor = User(
                name="Dr. Test",
                email="doctor@test.com",
                password_hash=generate_password_hash("test123"),
                role="doctor",
                specialization="General Physician"
            )
            db.session.add(doctor)
            db.session.flush()
            
            # Create doctor availability
            availability = DoctorAvailability(
                doctor_id=doctor.id,
                is_available=True,
                consultation_fee=50.00
            )
            db.session.add(availability)
            
            db.session.commit()
            
            print("\n✅ Test users created:")
            print("  Patient: patient@test.com / test123")
            print("  Doctor: doctor@test.com / test123")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ ERROR: Failed to create test users: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("Healthcare App - Database Initialization")
    print("=" * 50)
    print()
    
    if init_database():
        print("\n" + "=" * 50)
        response = input("\nCreate test users? (y/n): ").lower()
        if response == 'y':
            create_test_users()
        
        print("\n" + "=" * 50)
        print("✅ Database setup complete!")
        print("\nYou can now start the Flask server:")
        print("  python app.py")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("❌ Database setup failed. Please check the errors above.")
        print("=" * 50)
        sys.exit(1)
