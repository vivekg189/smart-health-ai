# 🏥 Healthcare App - Supabase PostgreSQL Integration

## ✅ What's Been Added

### Backend (Flask)
- ✅ **SQLAlchemy ORM** - Database models and relationships
- ✅ **Role-based Authentication** - Secure signup/login with bcrypt
- ✅ **Session Management** - HTTP-only cookies for security
- ✅ **5 Database Tables** - Users, Predictions, Consultations, Availability, Notes
- ✅ **Protected API Routes** - Authentication middleware
- ✅ **Environment Configuration** - Secure credential management

### Frontend (React)
- ✅ **Updated Auth Flow** - Connects to backend API
- ✅ **API Utility Functions** - Reusable data operations
- ✅ **Automatic Prediction Saving** - Stores results in database
- ✅ **Session Persistence** - Maintains login state

## 🚀 Quick Start (5 Minutes)

### 1. Create Supabase Project
```
1. Go to https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
```

### 2. Configure Backend
```bash
cd backend
copy .env.example .env
# Edit .env and add your DATABASE_URL
pip install -r requirements.txt
python init_db.py
```

### 3. Start Servers
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
npm start
```

### 4. Test It
```
1. Go to http://localhost:3000
2. Click "Get Started" → Sign Up
3. Create patient account
4. Run a diabetes prediction
5. Check Supabase dashboard - data is saved!
```

## 📁 New Files Created

```
backend/
├── config.py              # Database configuration
├── models.py              # SQLAlchemy models (5 tables)
├── auth.py                # Authentication endpoints
├── data_routes.py         # Data management endpoints
├── init_db.py             # Database setup script
├── .env.example           # Environment template
└── .env                   # Your credentials (create this)

src/
└── utils/
    └── api.js             # API helper functions

Documentation/
├── SUPABASE_SETUP.md      # Detailed setup guide
└── DATABASE_REFERENCE.md  # Quick reference
```

## 🗄️ Database Schema

### Users
- Stores patient and doctor accounts
- Passwords hashed with bcrypt
- Role determines dashboard access

### Predictions
- All disease prediction results
- Linked to user account
- Stores input parameters as JSON

### Doctor Availability
- Doctor online/offline status
- Consultation fees

### Consultations
- Patient-doctor appointments
- Video or in-person

### Medical Notes
- Doctor notes for consultations
- Audit trail with timestamps

## 🔐 Authentication Flow

```
1. User signs up → Password hashed → Stored in database
2. User logs in → Password verified → Session created
3. Session stored in HTTP-only cookie
4. Protected routes check session
5. Frontend redirects based on role:
   - Patient → /patient-dashboard
   - Doctor → /doctor-dashboard
```

## 🛡️ Security Features

- ✅ **Password Hashing** - Bcrypt via werkzeug
- ✅ **HTTP-Only Cookies** - XSS protection
- ✅ **CORS Protection** - Restricted origins
- ✅ **SQL Injection Prevention** - ORM parameterized queries
- ✅ **Role-Based Access** - Protected routes
- ✅ **Session Management** - Secure server-side sessions

## 📡 API Endpoints

### Authentication
```
POST /api/auth/signup    - Register new user
POST /api/auth/login     - Login with credentials
POST /api/auth/logout    - Logout current user
GET  /api/auth/me        - Get current user
```

### Data (Authenticated)
```
POST /api/data/predictions              - Save prediction
GET  /api/data/predictions              - Get user's predictions
POST /api/data/consultations            - Create consultation
GET  /api/data/consultations            - Get consultations
PUT  /api/data/doctor/availability      - Update availability (doctors)
POST /api/data/consultations/:id/notes  - Add medical note (doctors)
```

## 💻 Usage Examples

### Save Prediction (Frontend)
```javascript
import { savePrediction } from '../utils/api';

await savePrediction({
  disease_type: 'diabetes',
  prediction_result: 'High Risk',
  probability: 0.85,
  risk_level: 'High Risk',
  input_data: { glucose: 180, bmi: 32, blood_pressure: 140, age: 55 }
});
```

### Get Predictions
```javascript
import { getPredictions } from '../utils/api';

const { predictions } = await getPredictions();
console.log(predictions); // Array of user's predictions
```

### Create Consultation
```javascript
import { createConsultation } from '../utils/api';

await createConsultation({
  doctor_id: 5,
  consultation_type: 'video',
  scheduled_at: '2024-01-20T14:00:00'
});
```

## 🧪 Testing

### Test Accounts (After running init_db.py)
```
Patient: patient@test.com / test123
Doctor: doctor@test.com / test123
```

### Manual API Testing
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"test123","role":"patient"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@test.com","password":"test123"}'

# Get predictions
curl http://localhost:5000/api/data/predictions -b cookies.txt
```

## 🔧 Configuration

### Environment Variables (.env)
```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
```

### Generate SECRET_KEY
```python
import secrets
print(secrets.token_hex(32))
```

## 📊 Monitoring

View database in Supabase Dashboard:
- **Table Editor** - View/edit data
- **Database** → **Query Performance**
- **Database** → **Logs**

## 🐛 Troubleshooting

### Database Connection Error
```
✓ Check DATABASE_URL format
✓ Verify Supabase project is active
✓ Test connection in Supabase dashboard
```

### Tables Not Created
```bash
cd backend
python init_db.py
```

### Session Not Persisting
```
✓ Ensure credentials: 'include' in fetch calls
✓ Check cookies enabled in browser
✓ Verify CORS configuration
```

### Import Errors
```bash
pip install -r requirements.txt
```

## 📚 Documentation

- **SUPABASE_SETUP.md** - Detailed setup guide with screenshots
- **DATABASE_REFERENCE.md** - Quick reference for developers
- **backend/models.py** - Database schema definitions
- **backend/auth.py** - Authentication logic
- **backend/data_routes.py** - Data API endpoints

## 🚀 Production Deployment

1. **Environment**
   - Use production DATABASE_URL
   - Generate new SECRET_KEY
   - Update CORS origins

2. **Security**
   - Enable HTTPS/SSL
   - Set secure cookie flags
   - Configure rate limiting

3. **Performance**
   - Use Redis for sessions
   - Enable database connection pooling
   - Set up CDN for static assets

4. **Monitoring**
   - Configure logging
   - Set up error tracking
   - Enable database backups

## 🎯 Next Steps

- [ ] Add email verification
- [ ] Implement password reset
- [ ] Create admin dashboard
- [ ] Add real-time notifications
- [ ] Implement file uploads for medical records
- [ ] Add appointment scheduling system
- [ ] Create patient medical history timeline

## 📝 Notes

- All passwords are hashed (never stored as plain text)
- Sessions expire after browser close (configurable)
- Database tables created automatically on first run
- Predictions automatically saved after each test
- Role-based routing enforced on both frontend and backend

## 🤝 Support

For issues:
1. Check troubleshooting section above
2. Review Flask logs in terminal
3. Check browser console for errors
4. Verify Supabase project status

## ✨ Features

- ✅ Secure authentication with bcrypt
- ✅ Role-based access control
- ✅ Automatic prediction history
- ✅ Doctor-patient consultations
- ✅ Medical notes system
- ✅ Doctor availability management
- ✅ Session-based authentication
- ✅ RESTful API design
- ✅ ORM-based database operations
- ✅ Production-ready architecture
