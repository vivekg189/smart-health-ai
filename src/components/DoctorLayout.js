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
    { id: 'overview', icon: Home, label: 'Clinical Overview', path: '/doctor-dashboard', color: '#0F766E' },
    { id: 'requests', icon: FileText, label: 'Consultation Requests', section: 'requests', color: '#0F766E' },
    { id: 'patients', icon: Users, label: 'My Patients', section: 'patients', color: '#0F766E' },
    { id: 'video', icon: Video, label: 'Video Consultations', section: 'video', color: '#0F766E' },
    { id: 'notifications', icon: Bell, label: 'Notifications', section: 'notifications', color: '#0F766E' },
    { id: 'availability', icon: ToggleLeft, label: 'Availability Status', section: 'availability', color: '#0F766E' },
    { id: 'profile', icon: User, label: 'Profile', section: 'profile', color: '#0F766E' },
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
      <Navbar bg="secondary" variant="dark" fixed="top" style={{ boxShadow: '0 4px 18px rgba(15,23,42,0.35)', background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 45%, #14b8a6 100%)' }}>
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
        <Offcanvas.Header
          closeButton
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 45%, #14b8a6 100%)',
            color: 'white',
            borderBottom: '1px solid rgba(255,255,255,0.25)'
          }}
        >
          <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
            <ClipboardList size={20} />
            <span>Doctor Workspace</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body
          className="p-0"
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 45%, #e0f2fe 100%)'
          }}
        >
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(item)}
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: 'transparent'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      marginRight: '16px',
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'rgba(15,118,110,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <item.icon size={22} color={item.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
                    {item.id === 'overview' && (
                      <small style={{ fontSize: '0.76rem', color: '#64748b' }}>Today&apos;s clinical snapshot</small>
                    )}
                  </div>
                </div>
                {item.id === 'requests' && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#b91c1c',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: 'rgba(248,113,113,0.16)',
                      border: '1px solid rgba(248,113,113,0.5)'
                    }}
                  >
                    Queue
                  </span>
                )}
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
