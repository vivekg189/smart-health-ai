# Database Integration Quick Reference

## File Structure

```
backend/
├── config.py           # Database configuration
├── models.py           # SQLAlchemy models
├── auth.py            # Authentication routes
├── data_routes.py     # Data management routes
├── app.py             # Main Flask app (updated)
├── .env               # Environment variables (create this)
└── .env.example       # Environment template

src/
├── utils/
│   └── api.js         # API helper functions
├── context/
│   └── AuthContext.js # Updated with backend integration
└── pages/auth/
    └── Auth.js        # Updated login/signup
```

## Quick Start Commands

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your Supabase credentials
python app.py
```

### Frontend (no changes needed)
```bash
npm install
npm start
```

## Environment Variables (.env)

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
SECRET_KEY=generate-with-secrets.token_hex(32)
GROQ_API_KEY=your-groq-api-key
```

## Database Models Summary

### User
- Stores patient and doctor accounts
- Password is hashed with bcrypt
- Role determines dashboard access

### Prediction
- Stores all disease prediction results
- Linked to user via user_id
- Includes input parameters as JSON

### DoctorAvailability
- One-to-one with User (doctors only)
- Tracks online/offline status
- Stores consultation fee

### Consultation
- Links patients with doctors
- Tracks appointment status
- Supports video and in-person types

### MedicalNote
- Doctors add notes to consultations
- Timestamped for audit trail

## Authentication Flow

1. User signs up → POST /api/auth/signup
2. Password hashed and stored
3. Session created with user_id
4. Frontend stores user in localStorage + session cookie
5. Protected routes check session.user_id
6. Logout clears session

## Role-Based Routing

**Patient Role:**
- Redirects to `/patient-dashboard`
- Can access: models, predictions, consultations, hospital finder

**Doctor Role:**
- Redirects to `/doctor-dashboard`
- Can access: consultations, patient records, availability settings

## Adding Prediction Save to Other Forms

```javascript
import { savePrediction } from '../utils/api';

// After getting prediction result:
try {
  await savePrediction({
    disease_type: 'heart', // or 'liver', 'kidney', 'bone'
    prediction_result: data.risk_level,
    probability: data.probability,
    risk_level: data.risk_level,
    input_data: formData
  });
} catch (error) {
  console.error('Failed to save:', error);
}
```

## Common Operations

### Check if user is authenticated
```javascript
const response = await fetch('http://localhost:5000/api/auth/me', {
  credentials: 'include'
});
```

### Get user's prediction history
```javascript
import { getPredictions } from '../utils/api';
const { predictions } = await getPredictions();
```

### Create consultation request
```javascript
import { createConsultation } from '../utils/api';
await createConsultation({
  doctor_id: 5,
  consultation_type: 'video',
  scheduled_at: '2024-01-20T14:00:00'
});
```

### Update doctor availability
```javascript
import { updateDoctorAvailability } from '../utils/api';
await updateDoctorAvailability({
  is_available: true,
  consultation_fee: 50.00
});
```

## Database Queries (Backend)

### Get user by email
```python
from models import User
user = User.query.filter_by(email='test@example.com').first()
```

### Get user's predictions
```python
from models import Prediction
predictions = Prediction.query.filter_by(user_id=user_id).all()
```

### Create new prediction
```python
from models import Prediction
from config import db

prediction = Prediction(
    user_id=user_id,
    disease_type='diabetes',
    prediction_result='High Risk',
    probability=0.85,
    risk_level='High Risk',
    input_data={'glucose': 180}
)
db.session.add(prediction)
db.session.commit()
```

## Security Notes

- All passwords are hashed (never stored plain text)
- Sessions use HTTP-only cookies
- CORS restricted to localhost:3000
- Protected routes require authentication
- Role-based access control enforced

## Testing Checklist

- [ ] Signup as patient works
- [ ] Signup as doctor works (with specialization)
- [ ] Login redirects to correct dashboard
- [ ] Predictions are saved to database
- [ ] Prediction history displays correctly
- [ ] Logout clears session
- [ ] Protected routes require login
- [ ] Role-based routing works

## Deployment Checklist

- [ ] Update DATABASE_URL to production Supabase
- [ ] Generate new SECRET_KEY for production
- [ ] Update CORS origins to production domain
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags
- [ ] Configure session storage (Redis recommended)
- [ ] Set up database backups
- [ ] Configure monitoring/logging

## Troubleshooting

**"Module not found" errors:**
```bash
pip install flask-sqlalchemy flask-session psycopg2-binary python-dotenv
```

**Database connection fails:**
- Check DATABASE_URL format
- Verify Supabase project is active
- Test connection in Supabase dashboard

**Session not persisting:**
- Ensure `credentials: 'include'` in fetch calls
- Check cookies are enabled
- Verify CORS configuration

**Tables not created:**
```python
# In Flask shell:
from config import db
db.create_all()
```
