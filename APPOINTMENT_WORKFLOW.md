# Appointment System - Visual Workflow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HEALTHCARE WEB APPLICATION                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐              ┌──────────────┐                │
│  │   PATIENT    │              │    DOCTOR    │                │
│  │  Dashboard   │              │  Dashboard   │                │
│  └──────┬───────┘              └──────┬───────┘                │
│         │                              │                         │
│         ├─── Book Appointment          ├─── View Requests       │
│         ├─── Join Video Call           ├─── Accept/Reject       │
│         ├─── View Prescription         ├─── Start Video Call    │
│         └─── Chat with Doctor          └─── Submit Prescription │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      REACT COMPONENTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AppointmentFormModal  │  VideoCallRoom  │  PrescriptionFormModal│
│  PatientDashboard      │  DoctorDashboard │  MeetDoctor          │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      FLASK BACKEND API                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /api/appointments/*   │  /api/data/*    │  /api/auth/*         │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                   POSTGRESQL DATABASE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  appointments  │  prescriptions  │  chat_messages  │  users      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Patient Workflow

```
START
  │
  ├─► Browse Doctors (MeetDoctor.js)
  │     │
  │     ├─ Filter by specialization
  │     ├─ Check availability
  │     └─ View ratings
  │
  ├─► Click "Video Call" Button
  │     │
  │     └─► Open AppointmentFormModal
  │           │
  │           ├─ Enter symptoms
  │           ├─ Select date/time
  │           ├─ Mark emergency (optional)
  │           └─ Submit
  │
  ├─► POST /api/appointments/create
  │     │
  │     ├─ Generate appointment_id
  │     ├─ Generate video_room_id
  │     ├─ Status: "pending"
  │     └─ Save to database
  │
  ├─► Wait for Doctor Response
  │     │
  │     ├─ Status: "pending" → Show waiting message
  │     └─ Poll for status updates
  │
  ├─► Doctor Accepts
  │     │
  │     └─ Status: "accepted"
  │
  ├─► Join Video Call (PatientDashboard.js)
  │     │
  │     └─► Open VideoCallRoom
  │           │
  │           ├─ Initialize WebRTC
  │           ├─ Enable camera/microphone
  │           ├─ Connect to video room
  │           └─ Load chat interface
  │
  ├─► During Consultation
  │     │
  │     ├─ Video/audio communication
  │     ├─ Send chat messages
  │     └─ Receive doctor's messages
  │
  ├─► Doctor Ends Call
  │     │
  │     ├─ Status: "completed"
  │     └─ Prescription created
  │
  └─► View Prescription
        │
        ├─ Diagnosis
        ├─ Medicines with dosage
        ├─ Instructions
        ├─ Recommendations
        └─ Follow-up date
END
```

---

## Doctor Workflow

```
START
  │
  ├─► Login to Dashboard (DoctorDashboard.js)
  │     │
  │     └─ GET /api/appointments/doctor
  │
  ├─► View Consultation Requests
  │     │
  │     ├─ Pending appointments
  │     ├─ Patient symptoms
  │     ├─ Appointment date/time
  │     └─ Emergency flag
  │
  ├─► Review Request
  │     │
  │     ├─► Accept
  │     │     │
  │     │     ├─ POST /api/appointments/:id/accept
  │     │     └─ Status: "accepted"
  │     │
  │     └─► Reject
  │           │
  │           ├─ POST /api/appointments/:id/reject
  │           └─ Status: "rejected"
  │
  ├─► Start Video Call
  │     │
  │     └─► Open VideoCallRoom
  │           │
  │           ├─ Initialize WebRTC
  │           ├─ Enable camera/microphone
  │           ├─ Load patient summary
  │           │   │
  │           │   ├─ Previous predictions
  │           │   ├─ Risk scores
  │           │   └─ Consultation history
  │           │
  │           └─ Load chat interface
  │
  ├─► During Consultation
  │     │
  │     ├─ Video/audio communication
  │     ├─ Review patient history
  │     ├─ Send chat messages
  │     └─ Discuss symptoms
  │
  ├─► End Call
  │     │
  │     └─► Open PrescriptionFormModal
  │           │
  │           ├─ Enter diagnosis
  │           ├─ Add medicines
  │           │   │
  │           │   ├─ Medicine name
  │           │   ├─ Dosage
  │           │   └─ Frequency
  │           │
  │           ├─ Dosage instructions
  │           ├─ Recommendations
  │           └─ Follow-up date
  │
  ├─► Submit Prescription
  │     │
  │     ├─ POST /api/appointments/:id/prescription
  │     ├─ Status: "completed"
  │     └─ Notify patient
  │
  └─► Consultation Complete
END
```

---

## Database Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    APPOINTMENT LIFECYCLE                     │
└─────────────────────────────────────────────────────────────┘

1. CREATE APPOINTMENT
   ┌──────────────────────────────────────┐
   │ appointments                         │
   ├──────────────────────────────────────┤
   │ id: 1                                │
   │ appointment_id: "APT-ABC12345"       │
   │ doctor_id: 5                         │
   │ patient_id: 10                       │
   │ patient_name: "John Doe"             │
   │ symptoms: "Chest pain..."            │
   │ appointment_date: "2024-01-20"       │
   │ appointment_time: "10:00"            │
   │ consultation_type: "video"           │
   │ status: "pending" ◄─────────────────┐│
   │ is_emergency: false                  ││
   │ video_room_id: "room-xyz789"         ││
   │ created_at: "2024-01-15 09:30:00"    ││
   └──────────────────────────────────────┘│
                                           │
2. DOCTOR ACCEPTS                          │
   status: "pending" → "accepted" ─────────┘
                                           │
3. VIDEO CONSULTATION                      │
   ┌──────────────────────────────────────┐│
   │ chat_messages                        ││
   ├──────────────────────────────────────┤│
   │ id: 1                                ││
   │ appointment_id: 1 ◄──────────────────┘│
   │ sender_id: 10 (patient)               │
   │ message: "Hello doctor"               │
   │ created_at: "2024-01-20 10:05:00"     │
   ├──────────────────────────────────────┤
   │ id: 2                                 │
   │ appointment_id: 1                     │
   │ sender_id: 5 (doctor)                 │
   │ message: "Hello, how are you?"        │
   │ created_at: "2024-01-20 10:05:30"     │
   └──────────────────────────────────────┘
                                           │
4. PRESCRIPTION CREATED                    │
   ┌──────────────────────────────────────┐│
   │ prescriptions                        ││
   ├──────────────────────────────────────┤│
   │ id: 1                                ││
   │ appointment_id: 1 ◄──────────────────┘│
   │ diagnosis: "Mild hypertension"        │
   │ medicines: [                          │
   │   {                                   │
   │     "name": "Amlodipine",             │
   │     "dosage": "5mg",                  │
   │     "frequency": "Once daily"         │
   │   }                                   │
   │ ]                                     │
   │ dosage_instructions: "Take after..."  │
   │ recommendations: "Reduce salt..."     │
   │ follow_up_date: "2024-02-20"          │
   │ created_at: "2024-01-20 10:30:00"     │
   └──────────────────────────────────────┘
                                           │
5. APPOINTMENT COMPLETED                   │
   status: "accepted" → "completed" ───────┘
```

---

## API Request Flow

```
PATIENT BOOKS APPOINTMENT
─────────────────────────

Frontend                    Backend                     Database
   │                          │                            │
   ├─► POST /api/appointments/create                      │
   │   {                      │                            │
   │     doctor_id: 5,        │                            │
   │     patient_name: "...", │                            │
   │     symptoms: "...",     │                            │
   │     ...                  │                            │
   │   }                      │                            │
   │                          │                            │
   │                          ├─► Generate appointment_id  │
   │                          ├─► Generate video_room_id   │
   │                          │                            │
   │                          ├─► INSERT INTO appointments │
   │                          │                            ├─► ✓
   │                          │                            │
   │                          ├─► COMMIT                   │
   │                          │                            │
   │   ◄─────────────────────┤                            │
   │   {                      │                            │
   │     success: true,       │                            │
   │     appointment_id: "...",                            │
   │     video_room_id: "..." │                            │
   │   }                      │                            │
   │                          │                            │


DOCTOR ACCEPTS APPOINTMENT
──────────────────────────

Frontend                    Backend                     Database
   │                          │                            │
   ├─► POST /api/appointments/1/accept                    │
   │                          │                            │
   │                          ├─► Verify doctor_id        │
   │                          │                            │
   │                          ├─► UPDATE appointments      │
   │                          │   SET status = 'accepted'  │
   │                          │   WHERE id = 1             ├─► ✓
   │                          │                            │
   │                          ├─► COMMIT                   │
   │                          │                            │
   │   ◄─────────────────────┤                            │
   │   {                      │                            │
   │     success: true        │                            │
   │   }                      │                            │
   │                          │                            │


VIDEO CALL CHAT MESSAGE
───────────────────────

Frontend                    Backend                     Database
   │                          │                            │
   ├─► POST /api/appointments/1/messages                  │
   │   {                      │                            │
   │     message: "Hello"     │                            │
   │   }                      │                            │
   │                          │                            │
   │                          ├─► Get sender_id from session
   │                          │                            │
   │                          ├─► INSERT INTO chat_messages│
   │                          │                            ├─► ✓
   │                          │                            │
   │                          ├─► COMMIT                   │
   │                          │                            │
   │   ◄─────────────────────┤                            │
   │   {                      │                            │
   │     success: true        │                            │
   │   }                      │                            │
   │                          │                            │


SUBMIT PRESCRIPTION
───────────────────

Frontend                    Backend                     Database
   │                          │                            │
   ├─► POST /api/appointments/1/prescription              │
   │   {                      │                            │
   │     diagnosis: "...",    │                            │
   │     medicines: [...],    │                            │
   │     ...                  │                            │
   │   }                      │                            │
   │                          │                            │
   │                          ├─► Verify doctor_id        │
   │                          │                            │
   │                          ├─► INSERT INTO prescriptions│
   │                          │                            ├─► ✓
   │                          │                            │
   │                          ├─► UPDATE appointments      │
   │                          │   SET status = 'completed' │
   │                          │                            ├─► ✓
   │                          │                            │
   │                          ├─► COMMIT                   │
   │                          │                            │
   │   ◄─────────────────────┤                            │
   │   {                      │                            │
   │     success: true        │                            │
   │   }                      │                            │
   │                          │                            │
```

---

## Component Hierarchy

```
App.js
│
├─► PatientLayout
│   │
│   └─► PatientDashboard
│       │
│       ├─► AppointmentFormModal
│       │   └─► (Book new appointment)
│       │
│       ├─► VideoCallRoom
│       │   ├─► Video controls
│       │   └─► Chat interface
│       │
│       └─► Prescription Modal
│           └─► (View prescription details)
│
├─► DoctorLayout
│   │
│   └─► DoctorDashboard
│       │
│       ├─► Consultation Request Cards
│       │   ├─► Accept button
│       │   └─► Reject button
│       │
│       ├─► VideoCallRoom
│       │   ├─► Video controls
│       │   ├─► Chat interface
│       │   └─► Patient Summary Panel
│       │
│       └─► PrescriptionFormModal
│           ├─► Diagnosis input
│           ├─► Medicine list (dynamic)
│           ├─► Instructions
│           └─► Follow-up date
│
└─► MeetDoctor
    │
    ├─► Doctor Cards
    │   ├─► Doctor info
    │   ├─► Ratings
    │   └─► Video Call button
    │
    └─► AppointmentFormModal
        └─► (Triggered by Video Call button)
```

---

## Status State Machine

```
                    ┌─────────────┐
                    │   PENDING   │ ◄─── Initial state
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
         ┌──────────┐          ┌──────────┐
         │ ACCEPTED │          │ REJECTED │ ◄─── Terminal state
         └────┬─────┘          └──────────┘
              │
              │ (After video call)
              │
              ▼
        ┌───────────┐
        │ COMPLETED │ ◄─── Terminal state
        └───────────┘
```

---

## WebRTC Flow

```
Patient Browser                Doctor Browser
      │                              │
      ├─► getUserMedia()             │
      │   (camera + mic)             │
      │                              │
      ├─► Join room-xyz789           │
      │                              │
      │                              ├─► getUserMedia()
      │                              │   (camera + mic)
      │                              │
      │                              ├─► Join room-xyz789
      │                              │
      ├─────── Video Stream ────────►│
      │                              │
      │◄────── Video Stream ──────────┤
      │                              │
      ├─────── Audio Stream ────────►│
      │                              │
      │◄────── Audio Stream ──────────┤
      │                              │
      ├─────── Chat Message ────────►│
      │                              │
      │◄────── Chat Message ──────────┤
      │                              │
      │                              ├─► End Call
      │                              │
      ├─► Connection Closed          │
      │                              │
```

---

This visual workflow provides a comprehensive overview of the entire appointment and video consultation system!
