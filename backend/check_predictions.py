import sys
sys.stdout.reconfigure(encoding='utf-8')

from models import db, Prediction, User
from config import init_db
from flask import Flask

app = Flask(__name__)
init_db(app)

with app.app_context():
    preds = Prediction.query.all()
    print(f'Total predictions: {len(preds)}')
    
    if len(preds) == 0:
        print('DATABASE IS EMPTY - No predictions found!')
        print('Action needed: Submit a symptom check as a patient first.')
    else:
        print(f'\nFound {len(preds)} predictions:')
        for p in preds[:10]:
            user = User.query.get(p.user_id)
            print(f'\nPrediction #{p.id}:')
            print(f'  Patient: {user.name if user else "Unknown"} (ID: {p.user_id})')
            print(f'  Disease: {p.disease_type}')
            print(f'  Risk: {p.risk_level}')
            print(f'  Status: {p.status}')
            print(f'  Has original_prediction: {p.original_prediction is not None}')
