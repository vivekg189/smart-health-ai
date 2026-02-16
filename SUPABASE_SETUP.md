# Supabase PostgreSQL Integration Setup Guide

## Overview
This guide explains how to set up and use the Supabase PostgreSQL database integration for the Healthcare Prediction System.

## Prerequisites
- Supabase account (free tier available at https://supabase.com)
- Python 3.8+
- Node.js 16+

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: healthcare-app
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
4. Wait for project to be created (~2 minutes)

## Step 2: Get Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Configure Backend Environment

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create `.env` file:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` file and add your credentials:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
   SECRET_KEY=your-random-secret-key-here-change-this
   GROQ_API_KEY=your-groq-api-key
   ```

   **Generate SECRET_KEY** (run in Python):
   ```python
   import secrets
   print(secrets.token_hex(32))
   ```

## Step 4: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependencies added:
- `flask-sqlalchemy` - ORM for database operations
- `flask-session` - Session management
- `psycopg2-binary` - PostgreSQL adapter
- `python-dotenv` - Environment variable management

## Step 5: Initialize Database

The database tables will be created automatically when you start the Flask app for the first time.

Start the backend server:
```bash
python app.py
```

The following tables will be created:
- **users** - User accounts (patients & doctors)
- **predictions** - Disease prediction history
- **doctor_availability** - Doctor availability status
- **consultations** - Consultation requests
- **medical_notes** - Doctor's notes for consultations

## Step 6: Verify Database Setup

1. Go to Supabase Dashboard → **Table Editor**
2. You should see all 5 tables created
3. Check the schema matches the models in `backend/models.py`

## Database Schema

### Users Table
```sql
- id (integer, primary key)
- name (string, 100)
- email (string, 120, unique)
- password_hash (string, 255)
- role (string, 20) - 'patient' or 'doctor'
- specialization (string, 100) - for doctors only
- created_at (timestamp)
```

### Predictions Table
```sql
- id (integer, primary key)
- user_id (foreign key → users.id)
- disease_type (string, 50) - 'diabetes', 'heart', 'liver', 'kidney', 'bone'
- prediction_result (string, 50)
- probability (float)
- risk_level (string, 50)
- input_data (json)
- created_at (timestamp)
```

### Doctor Availability Table
```sql
- id (integer, primary key)
- doctor_id (foreign key → users.id, unique)
- is_available (boolean)
- consultation_fee (float)
- updated_at (timestamp)
```

### Consultations Table
```sql
- id (integer, primary key)
- patient_id (foreign key → users.id)
- doctor_id (foreign key → users.id)
- status (string, 20) - 'pending', 'confirmed', 'completed', 'cancelled'
- consultation_type (string, 20) - 'video', 'in-person'
- scheduled_at (timestamp)
- created_at (timestamp)
```

### Medical Notes Table
```sql
- id (integer, primary key)
- consultation_id (foreign key → consultations.id)
- note_text (text)
- created_by (foreign key → users.id)
- created_at (timestamp)
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user (patient or doctor)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "patient",
  "specialization": "Cardiologist" // only for doctors
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "specialization": null
  }
}
```

#### POST /api/auth/login
Login with email and password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "specialization": null
  }
}
```

#### POST /api/auth/logout
Logout current user

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
Get current authenticated user

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "specialization": null
  }
}
```

### Data Endpoints (Require Authentication)

#### POST /api/data/predictions
Save a prediction result

**Request Body:**
```json
{
  "disease_type": "diabetes",
  "prediction_result": "High Risk",
  "probability": 0.85,
  "risk_level": "High Risk",
  "input_data": {
    "glucose": 180,
    "bmi": 32.5,
    "blood_pressure": 140,
    "age": 55
  }
}
```

#### GET /api/data/predictions
Get all predictions for current user

**Response:**
```json
{
  "predictions": [
    {
      "id": 1,
      "disease_type": "diabetes",
      "prediction_result": "High Risk",
      "probability": 0.85,
      "risk_level": "High Risk",
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

#### POST /api/data/consultations
Create a consultation request

**Request Body:**
```json
{
  "doctor_id": 5,
  "consultation_type": "video",
  "scheduled_at": "2024-01-20T14:00:00"
}
```

#### GET /api/data/consultations
Get consultations (patient sees their requests, doctor sees their appointments)

#### PUT /api/data/doctor/availability
Update doctor availability (doctors only)

**Request Body:**
```json
{
  "is_available": true,
  "consultation_fee": 50.00
}
```

## Frontend Integration

The frontend automatically:
1. Sends credentials to backend on signup/login
2. Stores user session via cookies
3. Saves predictions to database after each prediction
4. Fetches user's prediction history

### Using API Functions

```javascript
import { savePrediction, getPredictions, createConsultation } from '../utils/api';

// Save a prediction
await savePrediction({
  disease_type: 'diabetes',
  prediction_result: 'High Risk',
  probability: 0.85,
  risk_level: 'High Risk',
  input_data: formData
});

// Get all predictions
const { predictions } = await getPredictions();

// Create consultation
await createConsultation({
  doctor_id: 5,
  consultation_type: 'video',
  scheduled_at: '2024-01-20T14:00:00'
});
```

## Security Features

1. **Password Hashing**: Uses bcrypt via werkzeug.security
2. **Session Management**: Secure HTTP-only cookies
3. **CORS Protection**: Configured for localhost:3000
4. **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
5. **Role-Based Access**: Protected routes check user roles

## Testing the Integration

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@test.com",
    "password": "test123",
    "role": "patient"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "patient@test.com",
    "password": "test123"
  }'
```

### Test Save Prediction
```bash
curl -X POST http://localhost:5000/api/data/predictions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "disease_type": "diabetes",
    "prediction_result": "Low Risk",
    "probability": 0.25,
    "risk_level": "Low Risk",
    "input_data": {"glucose": 90, "bmi": 22, "blood_pressure": 80, "age": 30}
  }'
```

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure password has no special characters that need URL encoding

### Tables Not Created
- Check Flask logs for errors
- Manually run: `flask shell` then `from config import db; db.create_all()`

### Session Not Persisting
- Ensure cookies are enabled in browser
- Check CORS credentials are set to 'include' in frontend

### Import Errors
- Run `pip install -r requirements.txt` again
- Check Python version is 3.8+

## Production Deployment

1. **Environment Variables**: Use production DATABASE_URL
2. **SECRET_KEY**: Generate new secure key for production
3. **CORS**: Update allowed origins to production domain
4. **HTTPS**: Enable SSL/TLS for secure connections
5. **Session Storage**: Consider Redis for session storage

## Monitoring

View database activity in Supabase Dashboard:
- **Database** → **Query Performance**
- **Database** → **Logs**
- **Table Editor** → View/edit data

## Backup

Supabase automatically backs up your database. To manually backup:
1. Go to **Database** → **Backups**
2. Click **Create Backup**

## Next Steps

1. Add email verification for new users
2. Implement password reset functionality
3. Add more detailed medical history tracking
4. Create admin dashboard for user management
5. Add real-time notifications for consultations

## Support

For issues:
- Check Supabase status: https://status.supabase.com
- Review Flask logs in terminal
- Check browser console for frontend errors
