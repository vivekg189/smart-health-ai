"""
Database migration script to add settings tables
Run this after updating models.py
"""

from app import app
from config import db
from models import User, HealthData, NotificationSettings, PrivacySettings

def migrate():
    with app.app_context():
        print("Creating new tables...")
        db.create_all()
        print("Migration completed successfully!")
        print("\nNew tables created:")
        print("- health_data")
        print("- notification_settings")
        print("- privacy_settings")
        print("\nUpdated User table with new columns:")
        print("- phone")
        print("- date_of_birth")
        print("- profile_picture")
        print("- last_login")

if __name__ == '__main__':
    migrate()
