import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/animations.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PatientLayout from './components/PatientLayout';
import DoctorLayout from './components/DoctorLayout';
import Navbar from './components/Navbar';
import HomeAnimated from './pages/HomeAnimated';
import Auth from './pages/auth/Auth';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import ModelsAnimated from './pages/ModelsAnimated';
import Assistant from './pages/Assistant';
import HospitalFinder from './pages/HospitalFinder';
import ReportAnalyzer from './pages/ReportAnalyzer';
import EmergencyMode from './pages/EmergencyMode';
import Services from './pages/Services';
import DiabetesForm from './components/DiabetesForm';
import HeartForm from './components/HeartForm';
import LiverForm from './components/LiverForm';
import KidneyForm from './components/KidneyForm';
import BoneForm from './components/BoneForm';
import MeetDoctor from './components/MeetDoctor';
import VideoConsultation from './pages/VideoConsultation';
import About from './pages/About';
import ContactAnimated from './pages/ContactAnimated';
import Footer from './components/Footer';
import LiverInfo from './pages/LiverInfo';
import DiabetesInfo from './pages/DiabetesInfo';
import KidneyInfo from './pages/KidneyInfo';
import HeartInfo from './pages/HeartInfo';
import BoneInfo from './pages/BoneInfo';
import Settings from './pages/Settings';
import Chatbot from './components/Chatbot';
import SymptomChecker from './components/SymptomChecker';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const infoRoutes = ['/liver-info', '/diabetes-info', '/kidney-info', '/heart-info'];
  const showOnlyModelsButton = infoRoutes.includes(location.pathname);
  const hideNavbar = ['/', '/auth', '/patient-dashboard', '/doctor-dashboard', '/emergency'].includes(location.pathname) || 
                     location.pathname.startsWith('/models') || 
                     location.pathname.startsWith('/assistant') || 
                     location.pathname.startsWith('/hospital-finder') || 
                     location.pathname.startsWith('/meet-doctor') || 
                     location.pathname.startsWith('/report-analyzer') || 
                     location.pathname.startsWith('/settings') || 
                     location.pathname.startsWith('/diabetes') || 
                     location.pathname.startsWith('/heart') || 
                     location.pathname.startsWith('/liver') || 
                     location.pathname.startsWith('/kidney') || 
                     location.pathname.startsWith('/bone') ||
                     location.pathname.startsWith('/symptom-checker');
  const hideFooter = hideNavbar || location.pathname.startsWith('/symptom-checker');
  const isSymptomChecker = location.pathname.startsWith('/symptom-checker');

  return (
    <div className="d-flex flex-column min-vh-100" style={{
      background: isSymptomChecker ? '#ffffff' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {!hideNavbar && <Navbar onlyModels={showOnlyModelsButton} />}
      <main
        className="flex-fill page-transition"
        style={{
          paddingTop: hideNavbar ? '0' : '80px',
          background: isSymptomChecker ? '#ffffff' : 'transparent'
        }}
      >
        <Routes>
          <Route path="/" element={<HomeAnimated />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout /></ProtectedRoute>}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/models" element={<Container className="py-4"><ModelsAnimated /></Container>} />
            <Route path="/assistant" element={<Container className="py-4"><Assistant /></Container>} />
            <Route path="/hospital-finder" element={<Container className="py-4"><HospitalFinder /></Container>} />
            <Route path="/report-analyzer" element={<Container className="py-4"><ReportAnalyzer /></Container>} />
            <Route path="/meet-doctor" element={<Container className="py-4"><MeetDoctor /></Container>} />
            <Route path="/diabetes" element={<Container className="py-4"><DiabetesForm /></Container>} />
            <Route path="/heart" element={<Container className="py-4"><HeartForm /></Container>} />
            <Route path="/liver" element={<Container className="py-4"><LiverForm /></Container>} />
            <Route path="/kidney" element={<Container className="py-4"><KidneyForm /></Container>} />
            <Route path="/bone" element={<Container className="py-4"><BoneForm /></Container>} />
            <Route path="/symptom-checker" element={<Container className="py-4"><SymptomChecker /></Container>} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout /></ProtectedRoute>}>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          </Route>
          
          <Route path="/emergency" element={<Container className="py-4"><EmergencyMode /></Container>} />
          <Route path="/services" element={<Container className="py-4"><Services /></Container>} />
          <Route path="/diabetes-info" element={<Container className="py-4"><DiabetesInfo /></Container>} />
          <Route path="/heart-info" element={<Container className="py-4"><HeartInfo /></Container>} />
          <Route path="/liver-info" element={<Container className="py-4"><LiverInfo /></Container>} />
          <Route path="/kidney-info" element={<Container className="py-4"><KidneyInfo /></Container>} />
          <Route path="/bone-info" element={<Container className="py-4"><BoneInfo /></Container>} />
          <Route path="/video-consultation" element={<Container className="py-4"><VideoConsultation /></Container>} />
          <Route path="/about" element={<Container className="py-4"><About /></Container>} />
          <Route path="/contact" element={<Container className="py-4"><ContactAnimated /></Container>} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
