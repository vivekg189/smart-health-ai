# Quick Setup Guide - Doctor Dashboard

## Option 1: Automatic Setup (Recommended)

Run the setup script:
```bash
setup_doctor_dashboard.bat
```

## Option 2: Manual Setup

### Step 1: Install psycopg2 (if not installed)
```bash
cd backend
pip install psycopg2-binary
```

### Step 2: Create Database Tables
```bash
cd backend/migrations
python create_doctor_tables.py
```

### Step 3: Start Backend
```bash
cd backend
python app.py
```

### Step 4: Start Frontend
```bash
npm start
```

## Verify Setup

1. Backend should show: `✅ Database connected successfully`
2. Login as a doctor
3. You should see the enhanced dashboard with:
   - Total Patients card
   - "My Patients" button
   - Patient details view

## Troubleshooting

### If tables already exist:
- No action needed, the system will use existing tables

### If you get import errors:
```bash
pip install flask flask-cors flask-session sqlalchemy psycopg2-binary python-dotenv
```

### If DATABASE_URL is not found:
- Check `backend/.env` file exists
- Verify DATABASE_URL is set correctly

## Features Available After Setup

✅ Patient Records Access
✅ Appointment Management  
✅ Digital Prescriptions
✅ Patient Health Analytics
✅ Video Consultations
✅ Treatment History Tracking

All features are now ready to use!
