# 🏥 Patient Dashboard - Complete Feature Explanation

## Overview
The Patient Dashboard is the central hub where patients manage their health journey. It loads when a patient logs in and displays personalized health data, appointments, predictions, and AI-powered insights.

---

## 🔄 How It Works - Step by Step

### **1. INITIAL PAGE LOAD**

When the dashboard loads, it automatically fetches data from 4 different sources:

```javascript
useEffect(() => {
  fetchAppointments();      // Get all appointments
  fetchUserProfile();       // Get patient name
  fetchPredictions();       // Get health assessments
  fetchDoctors();          // Get available doctors
}, []);
```

**What happens:**
- **fetchUserProfile()**: Calls `GET /api/auth/profile` → Gets patient's name
- **fetchAppointments()**: Calls `GET /api/appointments/patient` → Gets all appointments (past & future)
- **fetchPredictions()**: Calls `GET /api/data/predictions` → Gets all disease prediction results
- **fetchDoctors()**: Calls `GET /api/data/registered-doctors` → Gets list of available doctors

---

### **2. HEALTH SCORE CALCULATION** 

**Feature**: Shows a score from 0-100 representing overall health

**How it works:**
```javascript
const getHealthScore = () => {
  if (!predictions || predictions.length === 0) return 92; // Default
  
  const recent = predictions.slice(0, 6); // Take last 6 assessments
  const avgRisk = recent.reduce((acc, p) => 
    acc + getRiskPercentage(p.risk_level), 0) / recent.length;
  
  return Math.round(Math.max(35, Math.min(99, 100 - avgRisk * 0.7)));
}
```

**Logic:**
1. Takes your last 6 health assessments
2. Converts each risk level to percentage:
   - "Very High" → 90%
   - "High" → 75%
   - "Moderate" → 50%
   - "Low" → 25%
3. Calculates average risk
4. Converts to health score: `100 - (avgRisk × 0.7)`
5. Ensures score stays between 35-99

**Example:**
- If you have 3 "Low Risk" predictions (25% each)
- Average risk = 25%
- Health Score = 100 - (25 × 0.7) = 100 - 17.5 = **82.5/100**

---

### **3. NEXT APPOINTMENT COUNTDOWN**

**Feature**: Shows your nearest upcoming appointment with countdown timer

**How it works:**
```javascript
const getNextAppointment = () => {
  const upcoming = appointments
    .filter(a => ['accepted', 'pending'].includes(a.status))
    .map(a => ({ 
      ...a, 
      dateTime: new Date(`${a.appointment_date}T${a.appointment_time}`) 
    }))
    .filter(a => a.dateTime > new Date()) // Only future appointments
    .sort((a, b) => a.dateTime - b.dateTime); // Sort by date
  
  return upcoming[0] || null; // Return nearest one
}
```

**Logic:**
1. Filters appointments that are "accepted" or "pending"
2. Converts date + time to JavaScript Date object
3. Removes past appointments
4. Sorts by date (earliest first)
5. Returns the first one (nearest appointment)

**Countdown calculation:**
```javascript
const diffMs = next.dateTime - new Date(); // Milliseconds until appointment
const diffHrs = Math.floor(diffMs / 3600000); // Convert to hours
const days = Math.floor(diffHrs / 24);
const hrs = diffHrs % 24;
const countdown = days > 0 ? `${days}d ${hrs}h` : `${hrs}h`;
```

**Example:**
- Appointment: Tomorrow at 2 PM
- Current time: Today 3 PM
- Difference: 23 hours
- Display: **"23h"**

---

### **4. HEALTH BRIEF GENERATOR**

**Feature**: One-click copy of your health summary to share with doctors

**How it works:**
```javascript
const buildHealthBrief = () => {
  const next = getNextAppointment();
  const topPred = predictions?.[0]; // Most recent prediction
  const score = getHealthScore();
  
  const lines = [
    'HealthAI — Patient Brief',
    `Name: ${userName || 'Patient'}`,
    `Health Score: ${score}/100`,
    next ? `Next appointment: Dr. ${next.doctor_name} on ${date} at ${time}` 
         : 'Next appointment: none scheduled',
    topPred ? `Latest assessment: ${topPred.disease_type} — ${topPred.risk_level}` 
            : 'Latest assessment: none',
    `Generated: ${new Date().toLocaleString()}`
  ];
  
  return lines.join('\n');
}
```

**Output example:**
```
HealthAI — Patient Brief
Name: John Doe
Health Score: 85/100
Next appointment: Dr. Sarah Smith on 12/25/2024 at 10:00 AM (accepted)
Latest assessment: diabetes — Low Risk (25%)
Generated: 12/20/2024, 3:45:00 PM
```

**Privacy Mode:**
- When ON: Displays "•••" on screen
- When copying: Always includes real values
- Purpose: Protect privacy when screen sharing

---

### **5. CARE JOURNEY MAP**

**Feature**: Visual progress tracker showing where you are in your health journey

**4 Stages:**
1. **Assess** - Run AI screening
2. **Review** - Read AI insights
3. **Consult** - Talk to doctor
4. **Track** - Monitor trends

**How it determines your stage:**
```javascript
const hasAssessment = predictions.length > 0;
const next = getNextAppointment();
const hasConsult = !!next;
const completed = appointments.some(a => a.status === 'completed');

const step = completed ? 3 :      // Stage 4: Track
             hasConsult ? 2 :      // Stage 3: Consult
             hasAssessment ? 1 :   // Stage 2: Review
             0;                    // Stage 1: Assess
```

**Logic:**
- No predictions yet → Stage 1 (Assess)
- Have predictions → Stage 2 (Review)
- Have upcoming appointment → Stage 3 (Consult)
- Have completed appointment → Stage 4 (Track)

---

### **6. AI HEALTH COPILOT**

**Feature**: AI-powered insights from your health assessments

**How it works:**
```javascript
const insights = sorted.slice(0, 4).map((p) => {
  const disease = p.disease_type;
  const riskLevel = p.risk_level;
  const perc = getRiskPercentage(p.risk_level);
  
  // Determine insight type
  let type = 'info';
  if (riskLevel.includes('high')) type = 'critical';
  else if (riskLevel.includes('moderate')) type = 'warning';
  else if (riskLevel.includes('low')) type = 'success';
  
  // Generate action recommendation
  let action;
  if (type === 'critical') {
    action = 'Book an appointment within 1–2 weeks';
  } else if (type === 'warning') {
    action = 'Discuss results at your next routine visit';
  } else {
    action = 'Maintain current lifestyle and continue routine screening';
  }
  
  return {
    disease,
    type,
    message: `${disease}: ${riskLevel} risk (${perc}%)`,
    action
  };
});
```

**Example Insights:**
- **Critical**: "Diabetes: High Risk (75%) → Book appointment within 1-2 weeks"
- **Warning**: "Heart: Moderate Risk (50%) → Discuss at next visit"
- **Success**: "Liver: Low Risk (25%) → Maintain current lifestyle"

---

### **7. FUTURE RISK FORECASTING**

**Feature**: Predicts if your health risks are increasing, decreasing, or stable

**How it works:**
```javascript
// For each disease, compare last 2 assessments
const previous = sortedEntries[sortedEntries.length - 2];
const current = sortedEntries[sortedEntries.length - 1];
const change = current.risk - previous.risk;

let trend = 'stable';
if (change > 3) trend = 'increasing';      // Risk went up by >3%
else if (change < -3) trend = 'decreasing'; // Risk went down by >3%

let warning;
if (trend === 'increasing') {
  warning = `Risk for ${disease} is trending higher. 
             Consider scheduling a follow-up with your doctor.`;
} else if (trend === 'decreasing') {
  warning = `Risk for ${disease} is improving. 
             Continue your current treatment and lifestyle plan.`;
} else {
  warning = `Risk for ${disease} is stable. 
             Maintain regular monitoring and healthy habits.`;
}
```

**Example:**
- **Previous assessment**: Diabetes 40% risk
- **Current assessment**: Diabetes 55% risk
- **Change**: +15%
- **Trend**: ⬆️ Increasing
- **Warning**: "Risk is trending higher. Schedule follow-up."

---

### **8. HEALTH TREND ANALYTICS (CHARTS)**

**Feature**: Visual graphs showing risk changes over time

**How it works:**
```javascript
// Group predictions by disease type
const trendMap = {};
sorted.forEach((p) => {
  const disease = p.disease_type;
  const risk = getRiskPercentage(p.risk_level);
  
  if (!trendMap[disease]) trendMap[disease] = [];
  trendMap[disease].push({ 
    date: p.created_at, 
    risk 
  });
});

// Create chart for each disease
const chartData = {
  labels: data.map(d => new Date(d.date).toLocaleDateString()),
  datasets: [{
    label: `${disease} Risk %`,
    data: data.map(d => d.risk),
    borderColor: '#ff9800',
    fill: true
  }]
};
```

**Chart shows:**
- X-axis: Dates of assessments
- Y-axis: Risk percentage (0-100%)
- Line: Connects all your assessments over time
- Shaded area: Visual emphasis of risk level

**Example:**
```
Diabetes Risk Trend
100% |                    
 75% |         •
 50% |    •         •
 25% | •
  0% |___________________
     Jan  Feb  Mar  Apr
```

---

### **9. PRIVACY LENS TOGGLE**

**Feature**: Hide sensitive health data on screen

**How it works:**
```javascript
const [privacyMode, setPrivacyMode] = useState(true); // Default ON

const mask = (value) => (privacyMode ? '•••' : value);

// Usage in UI
<Typography>{mask(`${getHealthScore()}`)}</Typography>
// Shows: "•••" when ON, "85" when OFF
```

**What it hides:**
- Health score numbers
- Risk percentages
- Specific medical values

**What it doesn't hide:**
- Risk levels (Low/Moderate/High)
- Disease names
- Appointment dates
- Doctor names

**Copy Brief behavior:**
- Always copies real values (not masked)
- Allows secure sharing with doctors

---

### **10. APPOINTMENT MANAGEMENT**

**Feature**: View and join video consultations

**How it works:**

**Filtering upcoming appointments:**
```javascript
const upcoming = appointments
  .filter(a => ['accepted', 'pending'].includes(a.status))
  .filter(a => {
    const aptDateTime = new Date(`${a.appointment_date}T${a.appointment_time}`);
    return aptDateTime > new Date(); // Only future
  });
```

**Joining video call:**
```javascript
const handleVideoCall = (appointment) => {
  setActiveCall(appointment); // Triggers VideoCallRoom component
};

// VideoCallRoom component takes over full screen
if (activeCall) {
  return (
    <VideoCallRoom
      appointmentId={activeCall.id}
      userRole="patient"
      onEndCall={handleEndCall}
    />
  );
}
```

**Appointment statuses:**
- **Pending**: Waiting for doctor approval → Shows "Waiting" chip
- **Accepted**: Approved → Shows "Join Video Call" button
- **Completed**: Finished → Shows "View Prescription" button
- **Rejected**: Declined → Shows status chip

---

### **11. DOCTOR BOOKING**

**Feature**: Browse and book appointments with available doctors

**How it works:**
```javascript
const handleBookDoctor = (doctor) => {
  setSelectedDoctor(doctor);
  setShowAppointmentForm(true); // Opens modal
};

// AppointmentFormModal component
<AppointmentFormModal
  open={showAppointmentForm}
  onClose={() => setShowAppointmentForm(false)}
  doctor={selectedDoctor}
  patientName={userName}
/>
```

**Booking flow:**
1. Click "Book Video Consultation" on doctor card
2. Modal opens with appointment form
3. Fill in: symptoms, preferred date/time, emergency flag
4. Submit → POST to `/api/appointments/create`
5. Appointment created with "pending" status
6. Doctor receives notification
7. Doctor accepts/rejects
8. Patient gets notification

---

### **12. PRESCRIPTION VIEWING**

**Feature**: View prescriptions from completed appointments

**How it works:**
```javascript
const viewPrescription = async (appointmentId) => {
  const response = await fetch(
    `http://localhost:5000/api/appointments/${appointmentId}/prescription`,
    { credentials: 'include' }
  );
  
  const data = await response.json();
  setPrescriptionModal(data); // Opens modal with prescription
};
```

**Prescription contains:**
- Diagnosis
- Prescribed medicines (name, dosage, frequency)
- Dosage instructions
- Recommendations
- Follow-up date

---

### **13. TAB NAVIGATION**

**Feature**: Switch between Overview, Appointments, and Doctors

**How it works:**
```javascript
const [activeTab, setActiveTab] = useState('overview');

<Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
  <Tab value="overview" label="Overview" />
  <Tab value="appointments" label="My Appointments" />
  <Tab value="doctors" label="Meet My Doctors" />
</Tabs>

// Conditional rendering
{activeTab === 'overview' && <OverviewContent />}
{activeTab === 'appointments' && <AppointmentsContent />}
{activeTab === 'doctors' && <DoctorsContent />}
```

---

## 🎯 Data Flow Summary

```
1. User logs in
   ↓
2. Dashboard loads
   ↓
3. Fetch 4 data sources in parallel:
   - User profile
   - Appointments
   - Predictions
   - Doctors
   ↓
4. Process data:
   - Calculate health score
   - Find next appointment
   - Generate AI insights
   - Create trend forecasts
   - Build health brief
   ↓
5. Display everything in organized cards
   ↓
6. User interactions:
   - Toggle privacy mode
   - Copy health brief
   - Join video calls
   - Book appointments
   - View prescriptions
   - Switch tabs
```

---

## 🔄 Real-time Updates

**When data changes:**
- Book appointment → Refreshes appointment list
- Complete assessment → Recalculates health score & insights
- End video call → Updates appointment status
- Doctor accepts → Enables "Join Call" button

**Auto-refresh triggers:**
```javascript
useEffect(() => {
  // Recalculate analytics when predictions change
  if (predictions.length > 0) {
    calculateHealthTrends();
    generateRiskForecasts();
    createAIInsights();
  }
}, [predictions]); // Runs whenever predictions update
```

---

## 🎨 Visual Features

**Glassmorphism Cards:**
- Semi-transparent background
- Blur effect
- Subtle borders
- Hover animations (lift up 4px)

**Color Coding:**
- 🔴 Red: High risk, critical, emergency
- 🟠 Orange: Moderate risk, warnings
- 🟢 Green: Low risk, success, healthy
- 🔵 Blue: Information, neutral

**Responsive Design:**
- Desktop: 3-column grid
- Tablet: 2-column grid
- Mobile: 1-column stack

---

This dashboard provides a complete, privacy-first health management experience with AI-powered insights, real-time appointment management, and comprehensive health tracking—all in one place!