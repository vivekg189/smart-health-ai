import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/animations.css';
import Navbar from './components/Navbar';
import HomeAnimated from './pages/HomeAnimated';
import ModelsAnimated from './pages/ModelsAnimated';
import Services from './pages/Services';
import Calculators from './pages/Calculators';
import DiabetesForm from './components/DiabetesForm';
import HeartForm from './components/HeartForm';
import LiverForm from './components/LiverForm';
import KidneyForm from './components/KidneyForm';
import BMIForm from './components/BMIForm';
import BoneForm from './components/BoneForm';
import About from './pages/About';
import ContactAnimated from './pages/ContactAnimated';
import Footer from './components/Footer';
import LiverInfo from './pages/LiverInfo';
import DiabetesInfo from './pages/DiabetesInfo';
import KidneyInfo from './pages/KidneyInfo';
import HeartInfo from './pages/HeartInfo';
import BoneInfo from './pages/BoneInfo';
import Chatbot from './components/Chatbot';

function AppContent() {
  const location = useLocation();
  const infoRoutes = ['/liver-info', '/diabetes-info', '/kidney-info', '/heart-info'];
  const showOnlyModelsButton = infoRoutes.includes(location.pathname);

  return (
    <div className="d-flex flex-column min-vh-100" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <Navbar onlyModels={showOnlyModelsButton} />
      <main className="flex-fill page-transition" style={{ paddingTop: '80px' }}>
        <Container className="py-4 animate-fadeIn">
          <Routes>
            <Route path="/" element={<HomeAnimated />} />
            <Route path="/models" element={<ModelsAnimated />} />
            <Route path="/services" element={<Services />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/diabetes" element={<DiabetesForm />} />
            <Route path="/diabetes-info" element={<DiabetesInfo />} />
            <Route path="/heart" element={<HeartForm />} />
            <Route path="/heart-info" element={<HeartInfo />} />
            <Route path="/liver" element={<LiverForm />} />
            <Route path="/liver-info" element={<LiverInfo />} />
            <Route path="/kidney" element={<KidneyForm />} />
            <Route path="/kidney-info" element={<KidneyInfo />} />
            <Route path="/bone-info" element={<BoneInfo />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactAnimated />} />
            <Route path="/bmi" element={<BMIForm />} />
            <Route path="/bone" element={<BoneForm />} />
          </Routes>
        </Container>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;