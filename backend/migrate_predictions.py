"""
Migration script to update predictions table:
- Change user_id from String to Integer
- Remove doctor approval fields
"""
from config import init_db, db
from flask import Flask
import logging
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
init_db(app)

def migrate():
    with app.app_context():
        try:
            logger.info("Dropping old predictions table...")
            db.session.execute(db.text("DROP TABLE IF EXISTS predictions CASCADE"))
            
            logger.info("Creating new predictions table...")
            db.session.execute(db.text("""
                CREATE TABLE predictions (
                    id VARCHAR(36) PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    disease_type VARCHAR(50) NOT NULL,
                    prediction_result VARCHAR(50) NOT NULL,
                    probability FLOAT,
                    risk_level VARCHAR(50),
                    input_data JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            logger.info("Creating indexes...")
            db.session.execute(db.text("CREATE INDEX idx_predictions_user_id ON predictions(user_id)"))
            db.session.execute(db.text("CREATE INDEX idx_predictions_created_at ON predictions(created_at)"))
            
            db.session.commit()
            logger.info("Migration completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    migrate()
