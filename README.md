# Healthcare Prediction System

A comprehensive web application for disease risk prediction using machine learning models, featuring an intuitive React frontend and a robust Flask backend. The system provides predictions for diabetes, heart disease, liver disease, kidney disease, and bone fractures, along with hospital recommendations and AI-powered assistance.

## 🚀 Features

### Disease Prediction Models
- **Diabetes Prediction**: Uses 4 key parameters (Glucose, BMI, Blood Pressure, Age)
- **Heart Disease Prediction**: Comprehensive cardiovascular risk assessment
- **Cardiovascular Multimodal Analysis**: Advanced multimodal prediction using medical imaging (google/medsiglip-224) + 13 clinical parameters
- **Liver Disease Prediction**: Liver function analysis with multiple biomarkers
- **Kidney Disease Prediction**: Chronic kidney disease risk evaluation
- **Bone Fracture Detection**: AI-powered X-ray analysis for fracture detection

### Advanced Features
- **Hospital Finder**: Location-based hospital recommendations with specialty filtering
- **AI Chatbot**: Groq-powered conversational assistant for health queries
- **PDF Report Generation**: Downloadable prediction reports
- **Real-time Location Services**: GPS-based hospital proximity search
- **Responsive Design**: Mobile-friendly interface with Material-UI components

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with React Router
- **UI Library**: Material-UI (MUI) with custom styling
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **PDF Generation**: jsPDF library
- **Animations**: CSS animations and transitions

### Backend (Flask)
- **Framework**: Flask with CORS support
- **ML Libraries**: scikit-learn, joblib for model loading
- **Image Processing**: Pillow for bone fracture analysis
- **AI Integration**: Groq API for chatbot and hospital analysis
- **External APIs**: Overpass API for hospital data, Google Maps for directions

## 📁 Project Structure

```
healthcare-prediction-system/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── diabetes.pkl          # Diabetes prediction model
│   ├── d_scaler.pkl          # Diabetes data scaler
│   ├── heart_disease_model.pkl
│   ├── h_scaler.pkl
│   ├── liver_model.pkl
│   ├── kidney_model.pkl
│   ├── k_scaler.pkl
│   └── test_models.py        # Model testing utilities
├── src/
│   ├── components/
│   │   ├── DiabetesForm.js   # Diabetes prediction form
│   │   ├── HeartForm.js      # Heart disease form
│   │   ├── LiverForm.js      # Liver disease form
│   │   ├── KidneyForm.js     # Kidney disease form
│   │   ├── BoneForm.js       # Bone fracture upload form
│   │   ├── HospitalFinder.js # Hospital search component
│   │   ├── Navbar.js         # Navigation component
│   │   ├── Footer.js         # Footer component
│   │   └── Chatbot.js        # AI chatbot component
│   ├── pages/
│   │   ├── HomeAnimated.js   # Landing page
│   │   ├── ModelsAnimated.js # Model selection page
│   │   ├── Assistant.js      # AI assistant page
│   │   ├── HospitalFinder.js # Hospital finder page
│   │   ├── Services.js       # Services overview
│   │   ├── About.js          # About page
│   │   ├── ContactAnimated.js # Contact page
│   │   └── *Info.js          # Information pages for each disease
│   ├── styles/
│   │   └── animations.css    # Custom animations
│   ├── App.js                # Main React application
│   └── index.js              # React entry point
├── public/
│   └── index.html            # HTML template
├── package.json              # Node.js dependencies
├── requirements.txt          # Root Python dependencies
└── README.md                 # Project documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Ensure ML model files are present in the backend directory:
   - diabetes.pkl, d_scaler.pkl
   - heart_disease_model.pkl, h_scaler.pkl
   - liver_model.pkl
   - kidney_model.pkl, k_scaler.pkl

4. Set up environment variables (optional):
```bash
export GROQ_API_KEY=your_groq_api_key_here
```

5. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🚀 Usage

### Disease Prediction
1. Navigate to the Models page
2. Select the desired disease prediction
3. Fill in the required parameters
4. Submit the form to get risk assessment
5. For high-risk predictions, nearby hospitals are recommended

### Hospital Finder
1. Go to the Hospital Finder page
2. Allow location access for automatic detection
3. View nearby hospitals with specialties and ratings
4. Get directions via Google Maps integration

### AI Assistant
1. Access the Assistant page
2. Ask health-related questions
3. Receive AI-powered responses from Groq

## 📊 API Endpoints

### Prediction Endpoints
- `POST /api/predict/diabetes` - Diabetes risk prediction
- `POST /api/predict/heart` - Heart disease prediction
- `POST /api/predict/liver` - Liver disease prediction
- `POST /api/predict/kidney` - Kidney disease prediction
- `POST /api/predict/bone-fracture` - Bone fracture detection

### Utility Endpoints
- `GET /api/health` - Service health check
- `GET /api/test` - Test endpoint
- `POST /api/groq-chat` - AI chatbot
- `GET /api/hospitals/nearby` - Nearby hospitals search

## 🤖 AI & ML Models

### Diabetes Model
- **Features**: Glucose, BMI, Blood Pressure, Age
- **Algorithm**: Random Forest Classifier
- **Risk Levels**: Low (<33%), Moderate (33-66%), High (>66%)

### Heart Disease Model
- **Features**: 17 health parameters including BMI, smoking, physical activity
- **Algorithm**: Gradient Boosting
- **Risk Levels**: Low, Moderate, High, Very High

### Liver Disease Model
- **Features**: 10 liver function tests
- **Algorithm**: Random Forest
- **Output**: Binary classification (Disease/No Disease)

### Kidney Disease Model
- **Features**: 24 clinical parameters
- **Algorithm**: Support Vector Machine
- **Risk Levels**: Low, Moderate, High, Very High

### Bone Fracture Model
- **Input**: X-ray images
- **Model**: Hugging Face Transformers (prithivMLmods/Bone-Fracture-Detection)
- **Output**: Fracture detection with confidence score

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme detection
- **Smooth Animations**: CSS transitions and React animations
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Progress indicators and skeleton screens
- **Error Handling**: User-friendly error messages

## 🔒 Security & Privacy

- **Data Privacy**: No personal health data stored permanently
- **Secure Communication**: HTTPS in production
- **Input Validation**: Client and server-side validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing controls

## 📈 Performance

- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Browser caching for static assets
- **Compression**: Gzip compression for responses
- **CDN**: Static assets served via CDN in production

## 🧪 Testing

### Backend Testing
```bash
cd backend
python test_models.py
```

### Frontend Testing
```bash
npm test
```

## 🚀 Deployment

### Backend Deployment
- Use Gunicorn for production WSGI server
- Configure environment variables
- Set up reverse proxy with Nginx
- Enable SSL/TLS certificates

### Frontend Deployment
- Build production bundle: `npm run build`
- Serve static files with Nginx or Apache
- Configure API proxy for backend communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Machine Learning Models**: Trained on public healthcare datasets
- **Hospital Data**: OpenStreetMap via Overpass API
- **AI Assistant**: Powered by Groq API
- **UI Components**: Material-UI design system
- **Icons**: Material Design Icons

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

## 🔄 Future Enhancements

- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] Integration with wearable devices
- [ ] Telemedicine consultation booking
- [ ] Offline prediction capabilities
- [ ] Blockchain-based health records
- [ ] Advanced AI diagnostics with multiple models

---

**Disclaimer**: This application is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.
