"""
Database Migration Script for Appointment System
Run this to create the new tables for appointments, prescriptions, and chat messages
"""

from app import app
from config import db
from models import Appointment, Prescription, ChatMessage

def migrate_database():
    with app.app_context():
        try:
            print("Creating appointment system tables...")
            
            # Create all tables
            db.create_all()
            
            print("✅ Migration completed successfully!")
            print("\nNew tables created:")
            print("  - appointments")
            print("  - prescriptions")
            print("  - chat_messages")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    migrate_database()
