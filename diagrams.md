# Healthcare Prediction System Diagrams

## System Architecture (Block Diagram)

```mermaid
graph TD
    A[React Frontend<br/>User Interface] --> B[Flask Backend<br/>API Server]
    B --> C[ML Models<br/>Prediction Engine]

    A --> D[External Services]
    B --> D

    A --> E[User Interactions]
    E --> A

    subgraph "Frontend Components"
        F[Forms<br/>- Diabetes<br/>- Heart<br/>- Liver<br/>- Kidney<br/>- Bone]
        G[Results Display<br/>- Risk Levels<br/>- Hospital List<br/>- PDF Download]
        H[Navigation<br/>- Routing<br/>- State Management]
    end

    subgraph "Backend Services"
        I[Prediction APIs<br/>- /api/predict/*]
        J[Hospital Finder<br/>- Location Services<br/>- Overpass API]
        K[AI Chatbot<br/>- Groq Integration]
    end

    subgraph "ML Models"
        L[Diabetes Model<br/>4 features]
        M[Heart Disease Model<br/>17 features]
        N[Liver Disease Model<br/>10 features]
        O[Kidney Disease Model<br/>24 features]
        P[Bone Fracture Model<br/>Image Analysis]
    end

    subgraph "External APIs"
        Q[Groq API<br/>AI Chat]
        R[Overpass API<br/>Hospital Data]
        S[Google Maps<br/>Directions]
    end

    F --> A
    G --> A
    H --> A

    I --> B
    J --> B
    K --> B

    L --> C
    M --> C
    N --> C
    O --> C
    P --> C

    Q --> D
    R --> D
    S --> D
```

### Architecture Description
- **React Frontend**: Handles user interactions, form submissions, result display, and UI management
- **Flask Backend**: Processes API requests, manages ML model inference, and coordinates external services
- **ML Models**: Pre-trained scikit-learn models stored as pickle files for disease prediction
- **External Services**: Third-party APIs for AI chat, hospital data, and mapping functionality

## User Flow Chart

```mermaid
flowchart TD
    Start([Start]) --> Visit[User visits website]
    Visit --> Models[Navigate to Models page]
    Models --> Select{Select disease prediction}

    Select --> Diabetes[Diabetes Form]
    Select --> Heart[Heart Disease Form]
    Select --> Liver[Liver Disease Form]
    Select --> Kidney[Kidney Disease Form]
    Select --> Bone[Bone Fracture Form]

    Diabetes --> FillD[Fill form<br/>Glucose, BMI,<br/>Blood Pressure, Age]
    Heart --> FillH[Fill form<br/>17 health parameters]
    Liver --> FillL[Fill form<br/>10 liver markers]
    Kidney --> FillK[Fill form<br/>24 clinical parameters]
    Bone --> Upload[Upload X-ray image]

    FillD --> SubmitD[Submit form]
    FillH --> SubmitH[Submit form]
    FillL --> SubmitL[Submit form]
    FillK --> SubmitK[Submit form]
    Upload --> SubmitB[Submit image]

    SubmitD --> ValidateD{Form valid?}
    SubmitH --> ValidateH{Form valid?}
    SubmitL --> ValidateL{Form valid?}
    SubmitK --> ValidateK{Form valid?}
    SubmitB --> ValidateB{Image valid?}

    ValidateD -->|No| ErrorD[Show error message]
    ValidateH -->|No| ErrorH[Show error message]
    ValidateL -->|No| ErrorL[Show error message]
    ValidateK -->|No| ErrorK[Show error message]
    ValidateB -->|No| ErrorB[Show error message]

    ErrorD --> End1([End])
    ErrorH --> End2([End])
    ErrorL --> End3([End])
    ErrorK --> End4([End])
    ErrorB --> End5([End])

    ValidateD -->|Yes| RequestD[Send POST to<br/>/api/predict/diabetes]
    ValidateH -->|Yes| RequestH[Send POST to<br/>/api/predict/heart]
    ValidateL -->|Yes| RequestL[Send POST to<br/>/api/predict/liver]
    ValidateK -->|Yes| RequestK[Send POST to<br/>/api/predict/kidney]
    ValidateB -->|Yes| RequestB[Send POST to<br/>/api/predict/bone-fracture]

    RequestD --> BackendD[Backend processes<br/>request]
    RequestH --> BackendH[Backend processes<br/>request]
    RequestL --> BackendL[Backend processes<br/>request]
    RequestK --> BackendK[Backend processes<br/>request]
    RequestB --> BackendB[Backend processes<br/>request]

    BackendD --> ModelLoadD{Model loaded?}
    BackendH --> ModelLoadH{Model loaded?}
    BackendL --> ModelLoadL{Model loaded?}
    BackendK --> ModelLoadK{Model loaded?}
    BackendB --> ModelLoadB{Model loaded?}

    ModelLoadD -->|No| FailD[Return 503 error]
    ModelLoadH -->|No| FailH[Return 503 error]
    ModelLoadL -->|No| FailL[Return 503 error]
    ModelLoadK -->|No| FailK[Return 503 error]
    ModelLoadB -->|No| FailB[Return 503 error]

    FailD --> End6([End])
    FailH --> End7([End])
    FailL --> End8([End])
    FailK --> End9([End])
    FailB --> End10([End])

    ModelLoadD -->|Yes| PredictD[Scale data &<br/>make prediction]
    ModelLoadH -->|Yes| PredictH[Scale data &<br/>make prediction]
    ModelLoadL -->|Yes| PredictL[Make prediction]
    ModelLoadK -->|Yes| PredictK[Scale data &<br/>make prediction]
    ModelLoadB -->|Yes| PredictB[Process image &<br/>analyze]

    PredictD --> RiskD{Calculate risk level}
    PredictH --> RiskH{Calculate risk level}
    PredictL --> RiskL{Calculate risk level}
    PredictK --> RiskK{Calculate risk level}
    PredictB --> RiskB{Calculate severity}

    RiskD --> HighRiskD{High risk?}
    RiskH --> HighRiskH{High risk?}
    RiskL --> HighRiskL{High risk?}
    RiskK --> HighRiskK{High risk?}
    RiskB --> HighRiskB{Fracture detected?}

    HighRiskD -->|No| ResultD[Return result<br/>no hospitals]
    HighRiskH -->|No| ResultH[Return result<br/>no hospitals]
    HighRiskL -->|No| ResultL[Return result]
    HighRiskK -->|No| ResultK[Return result<br/>no hospitals]
    HighRiskB -->|Yes| HospitalB[Fetch nearby hospitals]

    HighRiskD -->|Yes| LocationD{Location available?}
    HighRiskH -->|Yes| LocationH{Location available?}
    HighRiskK -->|Yes| LocationK{Location available?}

    LocationD -->|No| ResultD
    LocationH -->|No| ResultH
    LocationK -->|No| ResultK

    LocationD -->|Yes| HospitalD[Query Overpass API<br/>for hospitals]
    LocationH -->|Yes| HospitalH[Query Overpass API<br/>for hospitals]
    LocationK -->|Yes| HospitalK[Query Overpass API<br/>for hospitals]

    HospitalD --> EnrichD[Enrich with Groq<br/>analysis]
    HospitalH --> EnrichH[Enrich with Groq<br/>analysis]
    HospitalK --> EnrichK[Enrich with Groq<br/>analysis]
    HospitalB --> EnrichB[Enrich with Groq<br/>analysis]

    EnrichD --> ResultDH[Return result<br/>with hospitals]
    EnrichH --> ResultHH[Return result<br/>with hospitals]
    EnrichK --> ResultKH[Return result<br/>with hospitals]
    EnrichB --> ResultBH[Return result<br/>with hospitals]

    ResultD --> DisplayD[Display result<br/>in frontend]
    ResultDH --> DisplayDH[Display result<br/>with hospitals]
    ResultH --> DisplayH[Display result<br/>in frontend]
    ResultHH --> DisplayHH[Display result<br/>with hospitals]
    ResultL --> DisplayL[Display result<br/>in frontend]
    ResultK --> DisplayK[Display result<br/>in frontend]
    ResultKH --> DisplayKH[Display result<br/>with hospitals]
    ResultB --> DisplayB[Display result<br/>in frontend]
    ResultBH --> DisplayBH[Display result<br/>with hospitals]

    DisplayD --> PDFD[User can download PDF]
    DisplayDH --> PDFDH[User can download PDF]
    DisplayH --> PDFH[User can download PDF]
    DisplayHH --> PDFHH[User can download PDF]
    DisplayL --> PDFL[User can download PDF]
    DisplayK --> PDFK[User can download PDF]
    DisplayKH --> PDFKH[User can download PDF]
    DisplayB --> PDFB[User can download PDF]
    DisplayBH --> PDFBH[User can download PDF]

    PDFD --> DirectionsD[User can get<br/>directions]
    PDFDH --> DirectionsDH[User can get<br/>directions]
    PDFH --> DirectionsH[User can get<br/>directions]
    PDFHH --> DirectionsHH[User can get<br/>directions]
    PDFK --> DirectionsK[User can get<br/>directions]
    PDFKH --> DirectionsKH[User can get<br/>directions]
    PDFB --> DirectionsB[User can get<br/>directions]
    PDFBH --> DirectionsBH[User can get<br/>directions]

    DirectionsD --> End11([End])
    DirectionsDH --> End12([End])
    DirectionsH --> End13([End])
    DirectionsHH --> End14([End])
    DirectionsL --> End15([End])
    DirectionsK --> End16([End])
    DirectionsKH --> End17([End])
    DirectionsB --> End18([End])
    DirectionsBH --> End19([End])
```

### Flow Chart Description
This comprehensive flow chart shows the complete user journey through the healthcare prediction system, including:
- Disease selection and form filling
- Input validation and error handling
- Backend processing and model inference
- Risk assessment and hospital recommendations
- Result display with additional features (PDF download, directions)

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph "User"
        U1[User Input]
    end

    subgraph "Frontend"
        F1[Form Component]
        F2[Input Validation]
        F3[HTTP Request]
        F4[Response Processing]
        F5[Result Display]
    end

    subgraph "Backend"
        B1[API Endpoint]
        B2[Request Parsing]
        B3[Model Loading]
        B4[Data Scaling]
        B5[Prediction Engine]
        B6[Risk Calculation]
        B7[Hospital Query]
        B8[Response Formatting]
    end

    subgraph "External Services"
        E1[Overpass API]
        E2[Groq API]
        E3[Google Maps]
    end

    subgraph "Storage"
        S1[ML Models<br/>.pkl files]
        S2[Scalers<br/>.pkl files]
    end

    U1 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> S1
    B3 --> B4
    B4 --> B5
    B5 --> B6
    B6 --> B7
    B7 --> E1
    B7 --> E2
    B8 --> F4
    F4 --> F5
    B8 --> E3
```

### Data Flow Description
- **User Input**: Health parameters entered through forms
- **Frontend Processing**: Validation, API calls, and result rendering
- **Backend Processing**: Model inference, risk calculation, and external API integration
- **External Services**: Hospital data, AI analysis, and mapping services
- **Storage**: Pre-trained ML models and data scalers

## Component Interaction Diagram

```mermaid
graph TD
    subgraph "UI Components"
        N[Navbar<br/>Navigation & Routing]
        DF[DiabetesForm<br/>Input Collection]
        HF[HeartForm<br/>Input Collection]
        LF[LiverForm<br/>Input Collection]
        KF[KidneyForm<br/>Input Collection]
        BF[BoneForm<br/>Image Upload]
        RD[ResultDisplay<br/>Risk Levels & Charts]
        HL[HospitalList<br/>Nearby Facilities]
        CB[Chatbot<br/>AI Assistant]
    end

    subgraph "Core App"
        A[App.js<br/>Route Management<br/>State Container]
        R[React Router<br/>Navigation]
    end

    subgraph "Backend APIs"
        PD[Prediction APIs<br/>/api/predict/*]
        HA[Hospital API<br/>/api/hospitals/nearby]
        CA[Chat API<br/>/api/groq-chat]
        HE[Health Check<br/>/api/health]
    end

    subgraph "ML Services"
        DM[Diabetes Model]
        HM[Heart Model]
        LM[Liver Model]
        KM[Kidney Model]
        BM[Bone Model]
    end

    subgraph "External Integrations"
        G[Groq API<br/>AI Analysis]
        O[Overpass API<br/>Hospital Data]
        GM[Google Maps<br/>Directions]
        GM2[Geolocation API<br/>User Location]
    end

    N --> A
    DF --> A
    HF --> A
    LF --> A
    KF --> A
    BF --> A
    RD --> A
    HL --> A
    CB --> A

    A --> R
    R --> A

    A --> PD
    A --> HA
    A --> CA
    A --> HE

    PD --> DM
    PD --> HM
    PD --> LM
    PD --> KM
    PD --> BM

    HA --> O
    HA --> G
    CA --> G
    HL --> GM
    DF --> GM2
    HF --> GM2
    KF --> GM2
    BF --> GM2
```

### Component Interaction Description
- **UI Components**: Individual React components for different features
- **Core App**: Main application logic and state management
- **Backend APIs**: Flask endpoints for predictions and services
- **ML Services**: Disease prediction models
- **External Integrations**: Third-party services for enhanced functionality

These Mermaid diagrams provide interactive, professional visualizations of the Healthcare Prediction System's architecture and workflows. They can be rendered in GitHub, documentation platforms, or any Mermaid-compatible viewer.
