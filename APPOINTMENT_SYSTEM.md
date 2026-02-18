# Appointment & Video Consultation System

## Overview

Complete telemedicine workflow implementation with appointment booking, video consultations, real-time chat, and prescription management.

## Features

### Patient Features
- **Book Appointments**: Request video consultations with doctors
- **Video Consultations**: Join WebRTC-based video calls
- **Real-time Chat**: Message doctors during consultations
- **View Prescriptions**: Access and download prescriptions
- **Appointment History**: Track all past and upcoming appointments

### Doctor Features
- **Consultation Requests**: View and manage appointment requests
- **Accept/Reject**: Approve or decline appointments
- **Video Consultations**: Conduct video calls with patients
- **Patient Summary**: View patient's medical history during calls
- **Prescription Management**: Create and submit prescriptions
- **Real-time Chat**: Communicate with patients during consultations

## Database Schema

### Appointments Table
```sql
- id (Primary Key)
- appointment_id (Unique identifier)
- doctor_id (Foreign Key → users.id)
- patient_id (Foreign Key → users.id)
- patient_name
- symptoms (Text)
- appointment_date (Date)
- appointment_time (Time)
- consultation_type (video/in-person)
- status (pending/accepted/completed/rejected)
- is_emergency (Boolean)
- video_room_id (Unique)
- created_at
- updated_at
```

### Prescriptions Table
```sql
- id (Primary Key)
- appointment_id (Foreign Key → appointments.id)
- diagnosis (Text)
- medicines (JSON array)
- dosage_instructions (Text)
- recommendations (Text)
- follow_up_date (Date)
- created_at
```

### Chat Messages Table
```sql
- id (Primary Key)
- appointment_id (Foreign Key → appointments.id)
- sender_id (Foreign Key → users.id)
- message (Text)
- created_at
```

## API Endpoints

### Appointment Management

#### Create Appointment
```
POST /api/appointments/create
Body: {
  doctor_id: number,
  patient_name: string,
  symptoms: string,
  appointment_date: "YYYY-MM-DD",
  appointment_time: "HH:MM",
  consultation_type: "video",
  is_emergency: boolean
}
Response: {
  success: true,
  appointment_id: string,
  video_room_id: string
}
```

#### Get Patient Appointments
```
GET /api/appointments/patient
Response: {
  appointments: [...]
}
```

#### Get Doctor Appointments
```
GET /api/appointments/doctor
Response: {
  appointments: [...]
}
```

#### Accept Appointment
```
POST /api/appointments/:id/accept
Response: { success: true }
```

#### Reject Appointment
```
POST /api/appointments/:id/reject
Response: { success: true }
```

#### Complete Appointment
```
POST /api/appointments/:id/complete
Response: { success: true }
```

### Prescription Management

#### Create Prescription
```
POST /api/appointments/:id/prescription
Body: {
  diagnosis: string,
  medicines: [
    { name: string, dosage: string, frequency: string }
  ],
  dosage_instructions: string,
  recommendations: string,
  follow_up_date: "YYYY-MM-DD"
}
Response: { success: true }
```

#### Get Prescription
```
GET /api/appointments/:id/prescription
Response: {
  diagnosis: string,
  medicines: [...],
  dosage_instructions: string,
  recommendations: string,
  follow_up_date: string
}
```

### Chat Management

#### Get Messages
```
GET /api/appointments/:id/messages
Response: {
  messages: [
    {
      sender_name: string,
      sender_role: string,
      message: string,
      created_at: string
    }
  ]
}
```

#### Send Message
```
POST /api/appointments/:id/messages
Body: { message: string }
Response: { success: true }
```

### Patient Summary

#### Get Patient Summary (Doctor Only)
```
GET /api/data/patient-summary/:appointment_id
Response: {
  predictions: [...],
  consultation_count: number
}
```

## Frontend Components

### Patient Components

#### AppointmentFormModal
- Location: `src/components/AppointmentFormModal.js`
- Purpose: Book video consultation appointments
- Props:
  - `open`: boolean
  - `onClose`: function
  - `doctor`: object
  - `patientName`: string

#### PatientDashboard
- Location: `src/pages/dashboards/PatientDashboard.js`
- Features:
  - View all appointments
  - Join video calls
  - View prescriptions
  - Track appointment status

### Doctor Components

#### DoctorDashboard
- Location: `src/pages/dashboards/DoctorDashboard.js`
- Features:
  - View consultation requests
  - Accept/reject appointments
  - Start video calls
  - Manage consultations

#### PrescriptionFormModal
- Location: `src/components/PrescriptionFormModal.js`
- Purpose: Create prescriptions after consultations
- Props:
  - `open`: boolean
  - `onClose`: function
  - `appointmentId`: number

### Shared Components

#### VideoCallRoom
- Location: `src/components/VideoCallRoom.js`
- Features:
  - WebRTC video/audio
  - Real-time chat
  - Patient summary panel (doctor view)
  - Video/audio controls
- Props:
  - `appointmentId`: number
  - `userRole`: "patient" | "doctor"
  - `onEndCall`: function

## Workflow

### Patient Workflow

1. **Browse Doctors**
   - Navigate to "Meet a Doctor"
   - Filter by specialization, rating, availability
   - View doctors with video consultation support

2. **Book Appointment**
   - Click "Video Call" button
   - Fill appointment form:
     - Symptoms/description
     - Preferred date/time
     - Emergency flag (optional)
   - Submit request

3. **Wait for Approval**
   - Status: "pending"
   - Notification when doctor accepts

4. **Join Video Call**
   - Status changes to "accepted"
   - "Join Video Call" button appears
   - Click to enter video room

5. **During Consultation**
   - Video/audio communication
   - Real-time chat with doctor
   - Doctor can view medical history

6. **Receive Prescription**
   - Doctor ends call and submits prescription
   - Status changes to "completed"
   - "View Prescription" button appears

7. **View Prescription**
   - Access diagnosis
   - View prescribed medicines
   - Read recommendations
   - Check follow-up date

### Doctor Workflow

1. **View Requests**
   - Dashboard shows pending appointments
   - Notification badge for new requests
   - View patient symptoms and details

2. **Accept/Reject**
   - Review appointment details
   - Click "Accept" or "Reject"
   - Patient receives notification

3. **Start Video Call**
   - "Start Video Call" button appears
   - Click to enter video room
   - View patient summary panel

4. **During Consultation**
   - Video/audio communication
   - Real-time chat with patient
   - Review patient's medical history
   - View previous predictions and risk scores

5. **End Call**
   - Click "End Call" button
   - Prescription form modal opens

6. **Submit Prescription**
   - Enter diagnosis summary
   - Add medicines with dosage
   - Provide instructions
   - Add recommendations
   - Set follow-up date
   - Submit prescription

7. **Completion**
   - Appointment marked as "completed"
   - Patient receives prescription
   - Consultation recorded in history

## WebRTC Implementation

### Media Access
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
```

### Video Controls
- Toggle video on/off
- Toggle audio on/off
- End call

### Future Enhancements
- Peer-to-peer connection with signaling server
- Screen sharing
- Recording capabilities
- Multiple participants

## Security Features

- **Session-based Authentication**: All endpoints require valid session
- **Role-based Access Control**: Patients and doctors have different permissions
- **Data Validation**: Input validation on both client and server
- **CORS Protection**: Configured for localhost:3000
- **Secure Video Rooms**: Unique room IDs per appointment

## Installation & Setup

### Backend Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Configure database in `.env`:
```
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key
GROQ_API_KEY=your-groq-api-key
```

3. Run migrations:
```bash
python init_db.py
```

4. Start server:
```bash
python app.py
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

## Testing

### Test Patient Flow
1. Register as patient
2. Browse doctors
3. Book appointment
4. Wait for acceptance
5. Join video call
6. View prescription

### Test Doctor Flow
1. Register as doctor
2. View consultation requests
3. Accept appointment
4. Start video call
5. End call
6. Submit prescription

## Troubleshooting

### Video Not Working
- Check browser permissions for camera/microphone
- Ensure HTTPS in production
- Verify WebRTC support in browser

### Appointments Not Showing
- Check database connection
- Verify session authentication
- Check browser console for errors

### Prescription Not Saving
- Verify all required fields filled
- Check database connection
- Review server logs

## Production Deployment

### Backend
- Use Gunicorn WSGI server
- Configure PostgreSQL database
- Set up SSL/TLS certificates
- Enable HTTPS for WebRTC

### Frontend
- Build production bundle: `npm run build`
- Serve with Nginx/Apache
- Configure API proxy
- Enable HTTPS

### WebRTC Considerations
- Deploy TURN/STUN servers for NAT traversal
- Use signaling server for peer connections
- Implement connection fallback mechanisms

## Future Enhancements

- [ ] Real-time notifications (WebSocket/Socket.io)
- [ ] Video call recording
- [ ] Screen sharing during consultations
- [ ] Multi-party video calls
- [ ] Appointment reminders (email/SMS)
- [ ] Payment integration
- [ ] Insurance verification
- [ ] Medical records upload
- [ ] E-prescription integration
- [ ] Telemedicine analytics dashboard

## Support

For issues or questions:
- Check server logs: `backend/app.py`
- Review browser console
- Verify database connectivity
- Check API endpoint responses

## License

MIT License - See LICENSE file for details
