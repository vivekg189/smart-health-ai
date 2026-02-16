# 🏥 Healthcare App - Supabase PostgreSQL Integration

## 📖 Overview

This integration adds **full database functionality** to the Healthcare Prediction System using **Supabase PostgreSQL** with **role-based authentication** for patients and doctors.

## ✨ What's New

- ✅ **Real User Authentication** - Secure signup/login with bcrypt password hashing
- ✅ **PostgreSQL Database** - 5 tables managed by SQLAlchemy ORM
- ✅ **Role-Based Access** - Separate dashboards for patients and doctors
- ✅ **Prediction History** - All predictions automatically saved
- ✅ **Consultation System** - Patients can request doctor consultations
- ✅ **Medical Notes** - Doctors can add notes to consultations
- ✅ **Session Management** - Secure HTTP-only cookies
- ✅ **Production Ready** - Scalable architecture with proper security

## 🚀 Quick Start

**Get running in 5 minutes:**

1. **Create Supabase project** at https://supabase.com
2. **Copy connection string** from Settings → Database
3. **Configure backend:**
   ```bash
   cd backend
   copy .env.example .env
   # Edit .env with your DATABASE_URL
   pip install -r requirements.txt
   python init_db.py
   ```
4. **Start servers:**
   ```bash
   python app.py          # Terminal 1
   npm start              # Terminal 2
   ```

**Full guide:** See `QUICKSTART.md`

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **QUICKSTART.md** | 5-minute setup guide |
| **INTEGRATION_README.md** | Complete overview and features |
| **SUPABASE_SETUP.md** | Detailed Supabase configuration |
| **SETUP_CHECKLIST.md** | Step-by-step checklist |
| **DATABASE_REFERENCE.md** | Developer quick reference |
| **ARCHITECTURE.md** | System architecture diagrams |
| **IMPLEMENTATION_SUMMARY.md** | What was built |
| **FILE_CHANGES.md** | All file changes explained |

## 🗄️ Database Schema

### 5 Tables Created:

1. **users** - Patient and doctor accounts
2. **predictions** - Disease prediction history
3. **doctor_availability** - Doctor online/offline status
4. **consultations** - Patient-doctor appointments
5. **medical_notes** - Doctor notes for consultations

## 🔐 Authentication

### Signup Flow:
```
User fills form → Password hashed → Saved to database → Session created → Redirect to dashboard
```

### Login Flow:
```
User enters credentials → Password verified → Session created → Redirect based on role
```

### Roles:
- **Patient** → `/patient-dashboard` → Can run predictions, view history, request consultations
- **Doctor** → `/doctor-dashboard` → Can view consultations, add notes, manage availability

## 📡 API Endpoints

### Authentication (`/api/auth/`)
- `POST /signup` - Register new user
- `POST /login` - Login with email/password
- `POST /logout` - Logout current user
- `GET /me` - Get current user info

### Data (`/api/data/`)
- `POST /predictions` - Save prediction
- `GET /predictions` - Get user's predictions
- `POST /consultations` - Create consultation
- `GET /consultations` - Get consultations
- `PUT /doctor/availability` - Update availability

## 🛡️ Security Features

- ✅ **Bcrypt password hashing** - Never store plain text passwords
- ✅ **HTTP-only cookies** - XSS protection
- ✅ **Session management** - Secure server-side sessions
- ✅ **CORS protection** - Restricted origins
- ✅ **SQL injection prevention** - ORM parameterized queries
- ✅ **Role-based access** - Protected routes

## 📁 New Files

### Backend (7 files)
```
backend/
├── config.py              # Database configuration
├── models.py              # SQLAlchemy models
├── auth.py                # Authentication routes
├── data_routes.py         # Data management routes
├── init_db.py             # Database setup script
├── .env.example           # Environment template
└── .env                   # Your credentials (create this)
```

### Frontend (1 file)
```
src/utils/
└── api.js                 # API helper functions
```

### Modified Files
- `backend/app.py` - Added DB init, sessions, blueprints
- `backend/requirements.txt` - Added 4 dependencies
- `src/pages/auth/Auth.js` - Connected to backend
- `src/context/AuthContext.js` - Updated logout
- `src/components/DiabetesForm.js` - Added prediction saving

## 🧪 Testing

### Test Accounts (created by init_db.py):
```
Patient: patient@test.com / test123
Doctor: doctor@test.com / test123
```

### Test Flow:
1. Sign up as patient
2. Run diabetes prediction
3. Check Supabase dashboard - data saved!
4. Sign up as doctor
5. Update availability
6. Create consultation request

## 🔧 Configuration

### Environment Variables (.env):
```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
```

### Generate SECRET_KEY:
```python
import secrets
print(secrets.token_hex(32))
```

## 📊 Architecture

```
Frontend (React) → Backend (Flask) → Database (Supabase PostgreSQL)
     ↓                   ↓                      ↓
  Auth.js           auth.py                  users
  api.js            data_routes.py           predictions
  Forms             models.py                consultations
```

**Detailed diagrams:** See `ARCHITECTURE.md`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check DATABASE_URL in .env |
| Tables not created | Run `python init_db.py` |
| Session not persisting | Ensure `credentials: 'include'` in fetch |
| Import errors | Run `pip install -r requirements.txt` |

**Full troubleshooting:** See `SETUP_CHECKLIST.md`

## 🚀 Production Deployment

1. Update DATABASE_URL to production Supabase
2. Generate new SECRET_KEY
3. Update CORS origins to production domain
4. Enable HTTPS/SSL
5. Configure Redis for sessions (recommended)
6. Set up monitoring and backups

## 📈 What Changed

### Before:
- ❌ No database
- ❌ Mock authentication
- ❌ No data persistence
- ❌ No user accounts

### After:
- ✅ PostgreSQL database
- ✅ Real authentication
- ✅ All data persisted
- ✅ Full user management

## 💻 Usage Examples

### Save Prediction:
```javascript
import { savePrediction } from '../utils/api';

await savePrediction({
  disease_type: 'diabetes',
  prediction_result: 'High Risk',
  probability: 0.85,
  risk_level: 'High Risk',
  input_data: formData
});
```

### Get Predictions:
```javascript
import { getPredictions } from '../utils/api';
const { predictions } = await getPredictions();
```

### Create Consultation:
```javascript
import { createConsultation } from '../utils/api';
await createConsultation({
  doctor_id: 5,
  consultation_type: 'video',
  scheduled_at: '2024-01-20T14:00:00'
});
```

## 🎯 Features

### For Patients:
- ✅ Secure account creation
- ✅ Disease risk predictions
- ✅ Prediction history
- ✅ Doctor consultations
- ✅ Hospital finder

### For Doctors:
- ✅ Professional profile
- ✅ Availability management
- ✅ Consultation requests
- ✅ Medical notes
- ✅ Patient records

## 📦 Dependencies Added

### Backend:
- `flask-sqlalchemy` - ORM
- `flask-session` - Sessions
- `psycopg2-binary` - PostgreSQL
- `python-dotenv` - Environment vars

### Frontend:
- No new dependencies (uses Fetch API)

## 🎓 Technologies

- **Backend:** Flask, SQLAlchemy, PostgreSQL
- **Frontend:** React, Fetch API
- **Database:** Supabase PostgreSQL
- **Auth:** Bcrypt, Sessions
- **Security:** CORS, HTTP-only cookies

## 📝 Notes

- All passwords are hashed (never plain text)
- Sessions expire on browser close
- Database tables auto-created on first run
- Predictions automatically saved
- Role-based routing enforced

## 🤝 Support

**Need help?**
1. Check `QUICKSTART.md` for fast setup
2. Review `SETUP_CHECKLIST.md` for troubleshooting
3. See `SUPABASE_SETUP.md` for detailed guide
4. Check Flask logs and browser console

## ✅ Success Criteria

You've successfully integrated when:
- ✅ Backend runs without errors
- ✅ Can sign up new users
- ✅ Can log in with credentials
- ✅ Predictions save to database
- ✅ Data visible in Supabase dashboard

## 🎉 Next Steps

1. Test all prediction models
2. Create test accounts
3. Explore Supabase features
4. Review security settings
5. Plan production deployment

---

**Status:** ✅ Complete and Production-Ready  
**Setup Time:** ~15-20 minutes  
**Documentation:** 8 comprehensive guides  
**Database:** Supabase PostgreSQL  
**Authentication:** Session-based with bcrypt  
**Architecture:** RESTful API with SQLAlchemy ORM

**Start here:** `QUICKSTART.md` → Get running in 5 minutes!
