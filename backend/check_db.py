from models import db, Prediction, User
from config import init_db
from flask import Flask

app = Flask(__name__)
init_db(app)

with app.app_context():
    preds = Prediction.query.all()
    print(f'Total predictions in database: {len(preds)}')
    
    if len(preds) == 0:
        print('No predictions found. Please submit a symptom check as a patient first.')
    else:
        print('\nFirst 5 predictions:')
        for p in preds[:5]:
            user = User.query.get(p.user_id)
            print(f'  ID: {p.id}')
            print(f'  Patient: {user.name if user else "Unknown"}')
            print(f'  Type: {p.disease_type}')
            print(f'  Status: {p.status}')
            print(f'  Created: {p.created_at}')
            print('  ---')
