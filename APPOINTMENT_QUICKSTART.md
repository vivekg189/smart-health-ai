# Quick Setup Guide - Appointment & Video Consultation System

## Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL database (Supabase recommended)
- Modern browser with WebRTC support

## Step-by-Step Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
EOF

# Run database migration
python migrate_appointments.py

# Start Flask server
python app.py
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# From project root
npm install

# Start React development server
npm start
```

Frontend will run on `http://localhost:3000`

### 3. Test the System

#### Create Test Accounts

**Patient Account:**
```
Email: patient@test.com
Password: password123
Role: patient
```

**Doctor Account:**
```
Email: doctor@test.com
Password: password123
Role: doctor
Name: Dr. Sarah Johnson
Specialization: Cardiologist
```

#### Test Workflow

1. **As Patient:**
   - Login with patient account
   - Navigate to "Meet a Doctor"
   - Click "Video Call" on available doctor
   - Fill appointment form
   - Submit request

2. **As Doctor:**
   - Login with doctor account
   - View consultation requests
   - Click "Accept" on pending appointment
   - Click "Start Video Call"
   - Conduct consultation
   - End call
   - Fill prescription form
   - Submit prescription

3. **As Patient (again):**
   - View appointments
   - Click "Join Video Call" (if accepted)
   - After completion, click "View Prescription"

## Database Configuration

### Supabase Setup

1. Create Supabase project at https://supabase.com
2. Get connection string from Settings → Database
3. Format: `postgresql://postgres:[password]@[host]:5432/postgres`
4. Add to backend/.env as DATABASE_URL

### Local PostgreSQL

```bash
# Create database
createdb healthcare_db

# Connection string
DATABASE_URL=postgresql://localhost:5432/healthcare_db
```

## Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check DATABASE_URL format
# Ensure PostgreSQL is running
# Verify credentials
```

**Import Error:**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**Module Not Found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS Error:**
```bash
# Ensure backend is running on port 5000
# Check CORS configuration in app.py
```

### Video Call Issues

**Camera/Microphone Not Working:**
- Grant browser permissions
- Check browser console for errors
- Ensure HTTPS in production

**Video Not Connecting:**
- Check WebRTC support: https://test.webrtc.org/
- Verify media devices available
- Review browser console logs

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=random-secret-key-min-32-chars
GROQ_API_KEY=gsk_your_groq_api_key
```

### Frontend (optional .env)
```
REACT_APP_API_URL=http://localhost:5000
```

## File Structure

```
healthcare/
├── backend/
│   ├── app.py                      # Main Flask app
│   ├── models.py                   # Database models
│   ├── appointment_routes.py       # Appointment endpoints
│   ├── migrate_appointments.py     # Migration script
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── AppointmentFormModal.js
│   │   ├── VideoCallRoom.js
│   │   ├── PrescriptionFormModal.js
│   │   └── MeetDoctor.js
│   └── pages/
│       └── dashboards/
│           ├── PatientDashboard.js
│           └── DoctorDashboard.js
└── APPOINTMENT_SYSTEM.md
```

## API Testing

### Using cURL

**Create Appointment:**
```bash
curl -X POST http://localhost:5000/api/appointments/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "doctor_id": 1,
    "patient_name": "John Doe",
    "symptoms": "Chest pain",
    "appointment_date": "2024-01-20",
    "appointment_time": "10:00",
    "consultation_type": "video"
  }'
```

**Get Appointments:**
```bash
curl http://localhost:5000/api/appointments/patient \
  -b cookies.txt
```

## Production Checklist

- [ ] Set strong SECRET_KEY
- [ ] Configure production database
- [ ] Enable HTTPS
- [ ] Set up TURN/STUN servers for WebRTC
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Add backup strategy
- [ ] Configure CDN for static assets
- [ ] Set up SSL certificates

## Next Steps

1. Test complete patient-doctor workflow
2. Customize UI/UX as needed
3. Add notification system
4. Implement payment gateway
5. Add appointment reminders
6. Deploy to production

## Support

For issues:
1. Check logs: `backend/app.py` console
2. Review browser console
3. Verify database connectivity
4. Test API endpoints individually

## Resources

- Flask Documentation: https://flask.palletsprojects.com/
- React Documentation: https://react.dev/
- WebRTC Guide: https://webrtc.org/getting-started/overview
- Supabase Docs: https://supabase.com/docs
- Material-UI: https://mui.com/

---

**Ready to go!** Start both servers and test the complete workflow.
