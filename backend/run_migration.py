from app import app
from config import db
import os

def run_migration():
    try:
        with app.app_context():
            # Read SQL file
            sql_file = os.path.join(os.path.dirname(__file__), 'migrations', 'add_settings_tables.sql')
            with open(sql_file, 'r') as f:
                sql = f.read()
            
            # Execute SQL statements
            for statement in sql.split(';'):
                if statement.strip():
                    db.session.execute(db.text(statement))
            
            db.session.commit()
            
            print("✓ Migration completed successfully!")
            print("\nAdded columns to users table:")
            print("  - phone")
            print("  - date_of_birth")
            print("  - profile_picture")
            print("  - last_login")
            print("\nCreated new tables:")
            print("  - health_data")
            print("  - notification_settings")
            print("  - privacy_settings")
            
    except Exception as e:
        print(f"✗ Migration failed: {str(e)}")
        db.session.rollback()
        raise

if __name__ == '__main__':
    run_migration()
