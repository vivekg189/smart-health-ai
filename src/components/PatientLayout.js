import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const PatientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const features = [
    { name: 'Models', path: '/models', icon: '🧬', desc: 'Disease prediction models', color: '#667eea' },
    { name: 'NutriMind', path: '/assistant', icon: '🥗', desc: 'AI nutrition assistant', color: '#4CAF50' },
    { name: 'Hospital Finder', path: '/hospital-finder', icon: '🏥', desc: 'Find nearby hospitals', color: '#2196F3' },
    { name: 'Meet a Doctor', path: '/meet-doctor', icon: '👨⚕️', desc: 'Connect with doctors', color: '#9C27B0' },
    { name: 'Report Analyzer', path: '/report-analyzer', icon: '📄', desc: 'Analyze medical reports', color: '#FF9800' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  return (
    <>
      <Navbar bg="secondary" variant="dark" fixed="top" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Container fluid>
          <Button variant="dark" onClick={() => setShowMenu(true)} className="me-3" style={{ fontSize: '1.5rem' }}>
            ☰
          </Button>
          <Navbar.Brand className="fw-bold" onClick={() => navigate('/patient-dashboard')} style={{ cursor: 'pointer' }}>
            HEALTH AI
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Nav.Link className="text-white">👤 {user?.name}</Nav.Link>
            <Button variant="outline-light" size="sm" onClick={handleLogout} style={{ borderRadius: '50px', marginLeft: '15px' }}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="start">
        <Offcanvas.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Offcanvas.Title className="fw-bold">Patient Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div
            onClick={() => handleNavigate('/patient-dashboard')}
            style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: '#f8f9fa'
            }}
          >
            <div className="d-flex align-items-center">
              <div style={{ fontSize: '2rem', marginRight: '15px' }}>🏠</div>
              <div>
                <div className="fw-bold" style={{ color: '#667eea' }}>Dashboard</div>
                <small className="text-muted">Back to home</small>
              </div>
            </div>
          </div>
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(feature.path)}
              style={{
                padding: '20px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <div className="d-flex align-items-center">
                <div style={{ fontSize: '2rem', marginRight: '15px' }}>{feature.icon}</div>
                <div>
                  <div className="fw-bold" style={{ color: feature.color }}>{feature.name}</div>
                  <small className="text-muted">{feature.desc}</small>
                </div>
              </div>
            </div>
          ))}
        </Offcanvas.Body>
      </Offcanvas>

      <div style={{ paddingTop: '80px' }}>
        <Outlet />
      </div>
    </>
  );
};

export default PatientLayout;
