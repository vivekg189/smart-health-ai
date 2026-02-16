import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { id: 'overview', icon: '🏠', label: 'Dashboard', path: '/doctor-dashboard' },
    { id: 'requests', icon: '📋', label: 'Consultation Requests', section: 'requests' },
    { id: 'patients', icon: '👥', label: 'My Patients', section: 'patients' },
    { id: 'video', icon: '🎥', label: 'Video Consultations', section: 'video' },
    { id: 'notes', icon: '📝', label: 'Medical Notes', section: 'notes' },
    { id: 'analytics', icon: '📈', label: 'Analytics', section: 'analytics' },
    { id: 'notifications', icon: '🔔', label: 'Notifications', section: 'notifications' },
    { id: 'availability', icon: '🟢', label: 'Availability Status', section: 'availability' },
    { id: 'profile', icon: '👤', label: 'Profile', section: 'profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (item) => {
    setShowMenu(false);
    if (item.section) {
      window.dispatchEvent(new CustomEvent('doctorSectionChange', { detail: item.section }));
    } else if (item.path) {
      window.dispatchEvent(new CustomEvent('doctorSectionChange', { detail: 'overview' }));
      navigate(item.path);
    }
  };

  return (
    <>
      <Navbar bg="secondary" variant="dark" fixed="top" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Container fluid>
          <Button variant="secondary" onClick={() => setShowMenu(true)} className="me-3" style={{ fontSize: '1.5rem' }}>
            ☰
          </Button>
          <Navbar.Brand className="fw-bold" onClick={() => navigate('/doctor-dashboard')} style={{ cursor: 'pointer' }}>
            HEALTH AI - Doctor Portal
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Nav.Link className="text-white">👨⚕️ Dr. {user?.name?.charAt(0).toUpperCase() + user?.name?.slice(1)}</Nav.Link>
            <Button variant="outline-light" size="sm" onClick={handleLogout} style={{ borderRadius: '50px', marginLeft: '15px' }}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="start">
        <Offcanvas.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Offcanvas.Title className="fw-bold">Doctor Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(item)}
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
                <div style={{ fontSize: '2rem', marginRight: '15px' }}>{item.icon}</div>
                <div>
                  <div className="fw-bold" style={{ color: '#667eea' }}>{item.label}</div>
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

export default DoctorLayout;
