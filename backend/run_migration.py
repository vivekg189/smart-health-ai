import psycopg2
import os

# Get database URL from environment or use default
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost/healthcare')

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("Adding columns to predictions table...")
    
    # Add columns
    cur.execute("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS original_prediction JSONB;")
    cur.execute("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending_review';")
    cur.execute("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);")
    cur.execute("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;")
    cur.execute("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS doctor_remarks TEXT;")
    cur.execute("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS approval_action VARCHAR(50);")
    cur.execute("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS modified_prediction JSONB;")
    
    # Update existing records
    cur.execute("UPDATE predictions SET status = 'pending_review' WHERE status IS NULL;")
    
    conn.commit()
    print("✅ Migration completed successfully!")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nPlease update DATABASE_URL environment variable or run the SQL file manually.")
