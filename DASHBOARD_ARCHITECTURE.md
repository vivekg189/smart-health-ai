# Enhanced Patient Dashboard - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │           PatientDashboard.js Component                     │   │
│  │                                                              │   │
│  │  State Management:                                          │   │
│  │  • predictions          • healthTrends                      │   │
│  │  • riskForecasts        • aiInsights                        │   │
│  │  • analyticsLoading                                         │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │ AI Copilot   │  │ Risk Forecast│  │ Trend Charts │    │   │
│  │  │  Component   │  │  Component   │  │  Component   │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │         │                  │                  │            │   │
│  └─────────┼──────────────────┼──────────────────┼────────────┘   │
│            │                  │                  │                 │
│            └──────────────────┴──────────────────┘                 │
│                               │                                     │
│                    Fetch API Calls (Promise.all)                   │
│                               │                                     │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Flask)                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    app.py (Main Server)                     │   │
│  │                                                              │   │
│  │  Blueprints:                                                │   │
│  │  • auth_bp          • data_bp                               │   │
│  │  • appointment_bp   • settings_bp                           │   │
│  │  • analytics_bp  ← NEW                                      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                               │                                     │
│                               ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │         health_analytics.py (Analytics Blueprint)           │   │
│  │                                                              │   │
│  │  Routes:                                                    │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │ GET /api/analytics/health-trends                 │     │   │
│  │  │  → Fetch all predictions                         │     │   │
│  │  │  → Group by disease type                         │     │   │
│  │  │  → Return time-series data                       │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │ GET /api/analytics/risk-forecast                 │     │   │
│  │  │  → Fetch last 30 days predictions                │     │   │
│  │  │  → Calculate risk changes                        │     │   │
│  │  │  → Detect trends (↑ ↓ −)                         │     │   │
│  │  │  → Generate warnings                             │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │ GET /api/analytics/ai-copilot-insights           │     │   │
│  │  │  → Fetch latest predictions                      │     │   │
│  │  │  → Fetch health data (BMI, lifestyle)            │     │   │
│  │  │  → Apply rule-based logic                        │     │   │
│  │  │  → Generate personalized insights                │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                               │                                     │
│                               ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                  models.py (Database Models)                │   │
│  │                                                              │   │
│  │  • User                    • Prediction                     │   │
│  │  • HealthData              • Appointment                    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                               │                                     │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                           │
│                                                                      │
│  Tables:                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   users      │  │ predictions  │  │ health_data  │            │
│  │              │  │              │  │              │            │
│  │ • id         │  │ • id         │  │ • user_id    │            │
│  │ • name       │  │ • user_id    │  │ • weight     │            │
│  │ • email      │  │ • disease    │  │ • height     │            │
│  │ • role       │  │ • risk_level │  │ • is_smoker  │            │
│  └──────────────┘  │ • probability│  └──────────────┘            │
│                     │ • created_at │                               │
│                     └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐
│   Patient   │
│   Logs In   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Dashboard Loads → fetchHealthAnalytics()               │
└─────────────────────────────────────────────────────────┘
       │
       ├─────────────────┬─────────────────┬──────────────┐
       │                 │                 │              │
       ▼                 ▼                 ▼              ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Fetch     │   │   Fetch     │   │   Fetch     │   │   Fetch     │
│ Predictions │   │   Trends    │   │  Forecasts  │   │  Insights   │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │              │
       ▼                 ▼                 ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Processing                             │
│                                                              │
│  Trends:                                                    │
│  • Query all predictions                                    │
│  • Group by disease                                         │
│  • Sort by date                                             │
│                                                              │
│  Forecasts:                                                 │
│  • Query last 30 days                                       │
│  • Calculate: change = latest - previous                   │
│  • Determine trend: if change > 5 → increasing             │
│  • Generate warning message                                 │
│                                                              │
│  Insights:                                                  │
│  • Query latest predictions                                 │
│  • Query health data                                        │
│  • Apply rules:                                             │
│    - if risk > 70 → critical                                │
│    - if BMI > 30 → obesity warning                          │
│    - if smoker → cessation advice                           │
│  • Generate actionable recommendations                      │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Rendering                             │
│                                                              │
│  1. AI Copilot Card (Purple Gradient)                       │
│     • Display insights with icons                           │
│     • Color-code by severity                                │
│     • Show action chips                                     │
│                                                              │
│  2. Risk Forecast Cards                                     │
│     • Display trend arrows (↑ ↓ −)                          │
│     • Show percentage changes                               │
│     • Render warning alerts                                 │
│                                                              │
│  3. Trend Charts (Chart.js)                                 │
│     • Create line charts                                    │
│     • Apply gradient fills                                  │
│     • Add interactive tooltips                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Algorithm Flow: Risk Forecasting

```
START
  │
  ▼
Fetch predictions from last 30 days
  │
  ▼
Group predictions by disease type
  │
  ▼
For each disease group:
  │
  ├─ Get latest prediction (most recent)
  │
  ├─ Get previous prediction (oldest in 30 days)
  │
  ├─ Calculate:
  │   • latest_risk = latest.probability × 100
  │   • prev_risk = previous.probability × 100
  │   • change = latest_risk - prev_risk
  │   • change_pct = (change / prev_risk) × 100
  │
  ├─ Determine trend:
  │   • if change > 5  → "increasing"
  │   • if change < -5 → "decreasing"
  │   • else           → "stable"
  │
  ├─ Generate warning:
  │   • if increasing AND risk > 60:
  │       "Risk increased by X%. Consult specialist."
  │   • if increasing:
  │       "Risk trending upward. Monitor closely."
  │   • if decreasing:
  │       "Good progress! Risk decreased by X%."
  │   • if stable:
  │       "Risk remains stable. Continue habits."
  │
  └─ Add to forecasts array
  │
  ▼
Return forecasts
  │
  ▼
END
```

---

## Algorithm Flow: AI Copilot Insights

```
START
  │
  ▼
Fetch latest 5 predictions
  │
  ▼
Fetch user health data
  │
  ▼
Initialize insights array
  │
  ▼
For each prediction:
  │
  ├─ Calculate risk = probability × 100
  │
  ├─ if risk > 70:
  │   │
  │   └─ Add insight:
  │       • type: "critical"
  │       • message: "High risk detected"
  │       • action: "Schedule specialist appointment"
  │
  ├─ else if risk > 50:
  │   │
  │   └─ Add insight:
  │       • type: "warning"
  │       • message: "Moderate risk"
  │       • action: "Review diet and exercise"
  │
  └─ Continue to next prediction
  │
  ▼
If health_data exists:
  │
  ├─ Calculate BMI = weight / (height/100)²
  │
  ├─ if BMI > 30:
  │   │
  │   └─ Add insight:
  │       • type: "warning"
  │       • message: "BMI indicates obesity"
  │       • action: "Consult nutritionist"
  │
  ├─ if is_smoker:
  │   │
  │   └─ Add insight:
  │       • type: "critical"
  │       • message: "Smoking increases disease risk"
  │       • action: "Seek cessation support"
  │
  └─ Continue checks
  │
  ▼
If insights array is empty:
  │
  └─ Add default insight:
      • type: "success"
      • message: "Health metrics look good"
      • action: "Continue monitoring"
  │
  ▼
Return insights
  │
  ▼
END
```

---

## Component Hierarchy

```
PatientDashboard
│
├─ Header
│  ├─ Title: "Patient Dashboard"
│  └─ Tab Navigation
│     ├─ Overview (active)
│     ├─ My Appointments
│     └─ Meet a Doctor
│
├─ Overview Tab
│  │
│  ├─ Statistics Cards (Row 1)
│  │  ├─ Health Predictions Count
│  │  ├─ Appointments Count
│  │  └─ Completed Count
│  │
│  ├─ Recent Assessments Card (Row 2)
│  │  └─ Grid of prediction cards
│  │
│  ├─ AI Health Copilot Card (Row 3) ← NEW
│  │  ├─ Brain Icon + Title
│  │  └─ Grid of insight cards
│  │     ├─ Insight 1 (with icon, message, action)
│  │     ├─ Insight 2
│  │     └─ Insight N
│  │
│  ├─ Future Risk Forecasting Card (Row 4) ← NEW
│  │  ├─ TrendingUp Icon + Title
│  │  └─ Grid of forecast cards
│  │     ├─ Forecast 1 (with arrow, %, warning)
│  │     ├─ Forecast 2
│  │     └─ Forecast N
│  │
│  ├─ Health Trend Analytics Card (Row 5) ← NEW
│  │  ├─ Activity Icon + Title
│  │  └─ Grid of charts (2×2)
│  │     ├─ Diabetes Chart (Line)
│  │     ├─ Heart Chart (Line)
│  │     ├─ Liver Chart (Line)
│  │     └─ Kidney Chart (Line)
│  │
│  ├─ Upcoming Appointments Card (Row 6)
│  │  └─ Grid of appointment cards
│  │
│  └─ Disclaimer Alert (Row 7) ← NEW
│     └─ Warning icon + disclaimer text
│
├─ Appointments Tab
│  └─ List of all appointments
│
└─ Doctors Tab
   └─ Grid of available doctors
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND STACK                        │
├─────────────────────────────────────────────────────────┤
│ • React 18.2.0          - UI Framework                  │
│ • Material-UI 5.13.0    - Component Library             │
│ • Chart.js 4.x          - Data Visualization ← NEW      │
│ • react-chartjs-2       - React wrapper for Chart.js    │
│ • lucide-react          - Icon Library                  │
│ • React Router 6.11.1   - Navigation                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    BACKEND STACK                         │
├─────────────────────────────────────────────────────────┤
│ • Flask                 - Web Framework                 │
│ • Flask-CORS            - Cross-Origin Support          │
│ • Flask-Session         - Session Management            │
│ • SQLAlchemy            - ORM                           │
│ • PostgreSQL            - Database                      │
│ • Python 3.8+           - Programming Language          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   NEW COMPONENTS                         │
├─────────────────────────────────────────────────────────┤
│ • health_analytics.py   - Analytics Blueprint           │
│ • Chart.js Integration  - Trend Visualization           │
│ • Enhanced Dashboard    - Three New Features            │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

```
healthcare/
│
├── backend/
│   ├── app.py                    (Modified - Added analytics_bp)
│   ├── health_analytics.py       (NEW - Analytics routes)
│   ├── models.py                 (Existing - Database models)
│   ├── data_routes.py            (Existing - Data endpoints)
│   └── ...
│
├── src/
│   ├── pages/
│   │   └── dashboards/
│   │       └── PatientDashboard.js  (Enhanced - Added 3 features)
│   └── ...
│
├── ENHANCED_DASHBOARD_GUIDE.md      (NEW - Documentation)
├── DASHBOARD_SETUP_CHECKLIST.md     (NEW - Setup guide)
└── DASHBOARD_ARCHITECTURE.md        (NEW - This file)
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Authentication Layer                                │
│     • Session-based authentication                      │
│     • @require_auth decorator on all routes             │
│     • User ID stored in session                         │
│                                                          │
│  2. Authorization Layer                                 │
│     • Users can only access their own data              │
│     • Query filters: filter_by(user_id=session_user_id) │
│                                                          │
│  3. Data Privacy Layer                                  │
│     • No data shared between users                      │
│     • No external API calls for analytics               │
│     • All processing done server-side                   │
│                                                          │
│  4. Input Validation Layer                              │
│     • Type checking on all inputs                       │
│     • SQL injection prevention via ORM                  │
│     • XSS prevention via React escaping                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

This architecture ensures:
✅ Scalability - Modular blueprint design
✅ Maintainability - Separated concerns
✅ Security - Multi-layer protection
✅ Performance - Parallel data fetching
✅ User Experience - Fast, responsive UI
