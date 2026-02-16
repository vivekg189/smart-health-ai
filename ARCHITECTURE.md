# System Architecture Diagram

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                      http://localhost:3000                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth.js    │  │ AuthContext  │  │ ProtectedRoute│          │
│  │  (Login/     │  │  (Session    │  │  (Role-based │          │
│  │   Signup)    │  │   Manager)   │  │   Routing)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│  ┌──────▼─────────────────▼──────────────────▼───────┐          │
│  │              utils/api.js                          │          │
│  │  (savePrediction, getPredictions, etc.)           │          │
│  └────────────────────────┬───────────────────────────┘          │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │ (credentials: 'include')
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                      BACKEND (Flask)                              │
│                   http://localhost:5000                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      app.py                               │   │
│  │  - CORS Configuration                                     │   │
│  │  - Session Management                                     │   │
│  │  - Blueprint Registration                                 │   │
│  └──────┬───────────────────────────────────────────────────┘   │
│         │                                                         │
│  ┌──────▼──────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   auth.py       │  │data_routes.py│  │  config.py   │       │
│  │  /api/auth/*    │  │ /api/data/*  │  │  (Database   │       │
│  │  - signup       │  │ - predictions│  │   Config)    │       │
│  │  - login        │  │ - consults   │  │              │       │
│  │  - logout       │  │ - notes      │  │              │       │
│  └──────┬──────────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                    │                  │                │
│  ┌──────▼────────────────────▼──────────────────▼───────┐       │
│  │                    models.py                          │       │
│  │  - User                                               │       │
│  │  - Prediction                                         │       │
│  │  - DoctorAvailability                                 │       │
│  │  - Consultation                                       │       │
│  │  - MedicalNote                                        │       │
│  └───────────────────────────┬───────────────────────────┘       │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                               │ SQLAlchemy ORM
                               │ (psycopg2)
                               │
┌──────────────────────────────▼────────────────────────────────────┐
│                  SUPABASE POSTGRESQL                              │
│                  (Cloud Database)                                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   users     │  │ predictions │  │doctor_avail │             │
│  │             │  │             │  │             │             │
│  │ - id        │  │ - id        │  │ - id        │             │
│  │ - name      │  │ - user_id   │  │ - doctor_id │             │
│  │ - email     │  │ - disease   │  │ - available │             │
│  │ - password  │  │ - result    │  │ - fee       │             │
│  │ - role      │  │ - risk      │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │consultations│  │medical_notes│                               │
│  │             │  │             │                               │
│  │ - id        │  │ - id        │                               │
│  │ - patient_id│  │ - consult_id│                               │
│  │ - doctor_id │  │ - note_text │                               │
│  │ - status    │  │ - created_by│                               │
│  └─────────────┘  └─────────────┘                               │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────┐                                                    ┌──────────┐
│ Browser │                                                    │ Database │
└────┬────┘                                                    └────┬─────┘
     │                                                              │
     │  1. POST /api/auth/signup                                   │
     │     {email, password, role}                                 │
     ├──────────────────────────────────────────────────────────►  │
     │                                                              │
     │                        2. Hash password (bcrypt)             │
     │                        3. INSERT INTO users                  │
     │                           ◄──────────────────────────────────┤
     │                                                              │
     │  4. Create session (user_id)                                │
     │  5. Set HTTP-only cookie                                    │
     │  ◄──────────────────────────────────────────────────────────┤
     │                                                              │
     │  6. Redirect to dashboard                                   │
     │     (patient or doctor)                                     │
     │                                                              │
     │  7. POST /api/data/predictions                              │
     │     Cookie: session_id                                      │
     ├──────────────────────────────────────────────────────────►  │
     │                                                              │
     │                        8. Verify session                     │
     │                        9. Get user_id from session           │
     │                        10. INSERT INTO predictions           │
     │                            ◄─────────────────────────────────┤
     │                                                              │
     │  11. Success response                                       │
     │  ◄──────────────────────────────────────────────────────────┤
     │                                                              │
```

## Role-Based Access Control

```
┌──────────────────────────────────────────────────────────────┐
│                      User Login                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Check Role    │
              └────────┬───────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  role='patient' │         │  role='doctor'  │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ Patient Routes  │         │  Doctor Routes  │
├─────────────────┤         ├─────────────────┤
│ ✓ /models       │         │ ✓ /consultations│
│ ✓ /predictions  │         │ ✓ /patients     │
│ ✓ /hospitals    │         │ ✓ /availability │
│ ✓ /meet-doctor  │         │ ✓ /add-notes    │
│ ✗ /doctor-dash  │         │ ✗ /patient-dash │
└─────────────────┘         └─────────────────┘
```

## Data Flow: Prediction Saving

```
┌──────────────┐
│ DiabetesForm │
│  (Frontend)  │
└──────┬───────┘
       │
       │ 1. User submits form
       │
       ▼
┌──────────────────────┐
│ POST /api/predict/   │
│      diabetes        │
└──────┬───────────────┘
       │
       │ 2. ML Model predicts
       │
       ▼
┌──────────────────────┐
│ Result returned      │
│ {risk, probability}  │
└──────┬───────────────┘
       │
       │ 3. Call savePrediction()
       │
       ▼
┌──────────────────────┐
│ POST /api/data/      │
│      predictions     │
└──────┬───────────────┘
       │
       │ 4. Verify session
       │
       ▼
┌──────────────────────┐
│ Create Prediction    │
│ object with user_id  │
└──────┬───────────────┘
       │
       │ 5. db.session.add()
       │    db.session.commit()
       │
       ▼
┌──────────────────────┐
│ Saved to Supabase    │
│ PostgreSQL           │
└──────────────────────┘
```

## Database Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                          users                              │
│  - id (PK)                                                  │
│  - name, email, password_hash, role, specialization        │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ One-to-Many
       │
       ├──────────────────────────────────────────────────────┐
       │                                                       │
       ▼                                                       ▼
┌──────────────────┐                              ┌──────────────────┐
│   predictions    │                              │doctor_availability│
│  - id (PK)       │                              │  - id (PK)        │
│  - user_id (FK)  │                              │  - doctor_id (FK) │
│  - disease_type  │                              │  - is_available   │
│  - result        │                              │  - fee            │
└──────────────────┘                              └──────────────────┘
       │
       │ One-to-Many
       │
       ▼
┌──────────────────┐
│  consultations   │
│  - id (PK)       │
│  - patient_id(FK)│──┐
│  - doctor_id (FK)│  │ Many-to-One
│  - status        │  │
└──────┬───────────┘  │
       │              │
       │ One-to-Many  │
       │              │
       ▼              │
┌──────────────────┐  │
│  medical_notes   │  │
│  - id (PK)       │  │
│  - consult_id(FK)│  │
│  - note_text     │  │
│  - created_by(FK)│──┘
└──────────────────┘
```

## Session Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Session Lifecycle                        │
└─────────────────────────────────────────────────────────────┘

Login
  │
  ├─► Create session object: {user_id: 123}
  │
  ├─► Store in filesystem (Flask-Session)
  │
  ├─► Generate session_id
  │
  ├─► Set cookie: session=abc123xyz
  │   - HttpOnly: true (XSS protection)
  │   - SameSite: Lax (CSRF protection)
  │
  └─► Return user data to frontend

Protected Request
  │
  ├─► Browser sends cookie automatically
  │
  ├─► Flask-Session reads session_id
  │
  ├─► Load session data from filesystem
  │
  ├─► Check if user_id exists
  │   │
  │   ├─► Yes: Allow request
  │   │
  │   └─► No: Return 401 Unauthorized
  │
  └─► Process request with user_id

Logout
  │
  ├─► Clear session data
  │
  ├─► Delete session file
  │
  └─► Browser removes cookie
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: CORS Protection                                  │
│  ├─ Allowed origins: localhost:3000                        │
│  └─ Credentials: true                                      │
│                                                             │
│  Layer 2: Session Authentication                           │
│  ├─ HTTP-only cookies                                      │
│  ├─ SameSite: Lax                                          │
│  └─ Server-side session storage                            │
│                                                             │
│  Layer 3: Password Security                                │
│  ├─ Bcrypt hashing                                         │
│  ├─ Salt rounds: 12                                        │
│  └─ Never store plain text                                 │
│                                                             │
│  Layer 4: SQL Injection Prevention                         │
│  ├─ SQLAlchemy ORM                                         │
│  ├─ Parameterized queries                                  │
│  └─ Input validation                                       │
│                                                             │
│  Layer 5: Role-Based Access Control                        │
│  ├─ Check user role on protected routes                   │
│  ├─ Frontend route guards                                  │
│  └─ Backend authorization checks                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
