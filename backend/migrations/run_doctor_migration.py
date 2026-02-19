import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Run doctor dashboard migration for PostgreSQL"""
    migration_path = os.path.join(os.path.dirname(__file__), 'doctor_dashboard_migration.sql')
    
    if not os.path.exists(migration_path):
        print(f"Migration file not found at {migration_path}")
        return
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("DATABASE_URL not found in .env file")
        return
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        with open(migration_path, 'r') as f:
            migration_sql = f.read()
        
        # Split by semicolon and execute each statement
        statements = [s.strip() for s in migration_sql.split(';') if s.strip()]
        
        for statement in statements:
            try:
                cursor.execute(statement)
                print(f"✓ Executed: {statement[:50]}...")
            except psycopg2.Error as e:
                if 'already exists' in str(e).lower() or 'duplicate' in str(e).lower():
                    print(f"⚠ Skipped (already exists): {statement[:50]}...")
                else:
                    print(f"✗ Error: {e}")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    run_migration()
