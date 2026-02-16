import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def init_db(app):
    database_url = os.getenv('DATABASE_URL')
    
    # Make database optional - only initialize if DATABASE_URL is provided
    if not database_url:
        print("⚠️  No DATABASE_URL found - running WITHOUT database")
        print("   App will work normally, but data won't be saved")
        print("   To enable database: Add DATABASE_URL to backend/.env")
        return
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    db.init_app(app)
    
    try:
        with app.app_context():
            db.create_all()
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("   App will continue WITHOUT database")
