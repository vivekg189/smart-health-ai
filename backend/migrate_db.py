"""
Database migration script to add doctor_id and gender columns
Run this once to update the Supabase database schema
"""
from app import app
from config import db
from sqlalchemy import text

def migrate():
    with app.app_context():
        try:
            # Add doctor_id column
            db.session.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(50) UNIQUE;
            """))
            
            # Add gender column
            db.session.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
            """))
            
            # Create index on doctor_id
            db.session.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_users_doctor_id 
                ON users(doctor_id);
            """))
            
            db.session.commit()
            print("✅ Migration completed successfully!")
            print("   - Added doctor_id column (unique, indexed)")
            print("   - Added gender column")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    migrate()
