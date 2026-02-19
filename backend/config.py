import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def init_db(app):
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("⚠️  No DATABASE_URL found - running WITHOUT database")
        print("   App will work normally, but data won't be saved")
        return
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure based on database type
    if 'sqlite' in database_url:
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}
    elif 'postgresql' in database_url or 'postgres' in database_url:
        # Supabase/PostgreSQL configuration
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
            'pool_size': 10,
            'max_overflow': 20,
            'pool_timeout': 30,
            'connect_args': {
                'connect_timeout': 10,
                'options': '-c statement_timeout=30000'
            }
        }
    
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    try:
        db.init_app(app)
        with app.app_context():
            db.create_all()
        db_type = 'sqlite' if 'sqlite' in database_url else 'postgresql'
        print(f"✅ Database connected successfully ({db_type})")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("   App will continue WITHOUT database")
