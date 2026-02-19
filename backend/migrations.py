import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)

def run_migrations(app, db):
    """Auto-run database migrations on startup"""
    try:
        with app.app_context():
            # For SQLite, just create all tables
            db.create_all()
            logger.info("✅ Database tables created/verified successfully")
                
    except Exception as e:
        logger.error(f"Migration error: {str(e)}")
        logger.info("App will continue, but some features may not work")
