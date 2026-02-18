import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, Users, Video, ClipboardList, TrendingUp, Bell, ToggleLeft, User, LogOut, Menu } from 'lucide-react';

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { id: 'overview', icon: Home, label: 'Dashboard', path: '/doctor-dashboard', color: '#000000' },
    { id: 'requests', icon: FileText, label: 'Consultation Requests', section: 'requests', color: '#000000' },
    { id: 'patients', icon: Users, label: 'My Patients', section: 'patients', color: '#000000' },
    { id: 'video', icon: Video, label: 'Video Consultations', section: 'video', color: '#000000' },
    { id: 'notifications', icon: Bell, label: 'Notifications', section: 'notifications', color: '#000000' },
    { id: 'availability', icon: ToggleLeft, label: 'Availability Status', section: 'availability', color: '#000000' },
    { id: 'profile', icon: User, label: 'Profile', section: 'profile', color: '#000000' },
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
      <Navbar bg="secondary" variant="dark" fixed="top" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #00695C 0%, #00897B 100%)' }}>
        <Container fluid>
          <Button variant="dark" onClick={() => setShowMenu(true)} className="me-3">
            <Menu size={24} />
          </Button>
          <Navbar.Brand className="fw-bold" onClick={() => navigate('/doctor-dashboard')} style={{ cursor: 'pointer' }}>
            HEALTH AI
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Nav.Link className="text-white d-flex align-items-center gap-2">
              <User size={20} /> Dr. {user?.name}
            </Nav.Link>
            <Button variant="outline-light" size="sm" onClick={handleLogout} style={{ borderRadius: '50px', marginLeft: '15px' }}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="start">
        <Offcanvas.Header closeButton style={{ background: 'linear-gradient(135deg, #00695C 0%, #00897B 100%)', color: 'white' }}>
          <Offcanvas.Title className="fw-bold">Doctor Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0" style={{ display: 'flex', flexDirection: 'column' }}>
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
                <div style={{ marginRight: '15px' }}>
                  <item.icon size={32} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2196f3' }}>{item.label}</div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 'auto' }}>
            <div
              onClick={() => {
                setShowMenu(false);
                handleLogout();
              }}
              style={{
                padding: '20px',
                borderTop: '2px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ffebee'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <div className="d-flex align-items-center">
                <div style={{ marginRight: '15px' }}>
                  <LogOut size={32} color="#EF5350" />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#EF5350' }}>Logout</div>
                  <small style={{ fontSize: '0.75rem' }} className="text-muted">Sign out of your account</small>
                </div>
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <div style={{ paddingTop: '80px' }}>
        <Outlet />
      </div>
    </>
  );
};

export default DoctorLayout;
