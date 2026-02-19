import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Offcanvas, Badge, Dropdown, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Activity,
  HeartPulse,
  Brain,
  Hospital,
  UserRound,
  FileText,
  Menu,
  User,
  Settings,
  LogOut,
  Bell,
  Stethoscope,
  ClipboardCheck
} from 'lucide-react';

const PatientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Appointment Reminder', message: 'Your appointment with Dr. Smith is tomorrow at 10 AM', time: '2 hours ago', read: false },
    { id: 2, title: 'Test Results Ready', message: 'Your blood test results are now available', time: '5 hours ago', read: false },
    { id: 3, title: 'Prescription Refill', message: 'Time to refill your prescription', time: '1 day ago', read: false }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const features = [
    { name: 'Diagnostic Models', path: '/models', icon: HeartPulse, desc: 'Multi-disease AI predictions', color: '#00695C' },
    { name: 'NutriMind', path: '/assistant', icon: Brain, desc: 'AI-powered nutrition guidance', color: '#00695C' },
    { name: 'Hospital Finder', path: '/hospital-finder', icon: Hospital, desc: 'Locate nearby hospitals', color: '#00695C' },
    { name: 'Nearby Doctors', path: '/meet-doctor', icon: UserRound, desc: 'Connect with specialists', color: '#00695C' },
    { name: 'Report Analyzer', path: '/report-analyzer', icon: FileText, desc: 'Scan & summarize reports', color: '#00695C' }
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
      <Navbar bg="secondary" variant="dark" fixed="top" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #00695C 0%, #00897B 100%)' }}>
        <Container fluid>
          <Button variant="dark" onClick={() => setShowMenu(true)} className="me-3">
            <Menu size={24} />
          </Button>
          <Navbar.Brand className="fw-bold" onClick={() => navigate('/patient-dashboard')} style={{ cursor: 'pointer' }}>
            HEALTH AI
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Dropdown align="end" className="me-3">
              <Dropdown.Toggle 
                as={Button}
                variant="link" 
                className="text-white position-relative p-0 border-0"
                style={{ textDecoration: 'none', background: 'transparent' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <Badge 
                    bg="danger" 
                    pill 
                    style={{ 
                      position: 'absolute', 
                      top: '-5px', 
                      right: '-5px',
                      fontSize: '0.65rem'
                    }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}>
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                  <h6 className="mb-0">Notifications</h6>
                  {notifications.length > 0 && (
                    <Button variant="link" size="sm" onClick={clearAll} className="p-0 text-danger">
                      Clear All
                    </Button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <Bell size={40} className="mb-2" style={{ opacity: 0.3 }} />
                    <p className="mb-0">No notifications</p>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {notifications.map((notif) => (
                      <ListGroup.Item 
                        key={notif.id}
                        action
                        onClick={() => markAsRead(notif.id)}
                        style={{ 
                          backgroundColor: notif.read ? 'white' : '#f0f9ff',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{ flex: 1 }}>
                            <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                              {notif.title}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {notif.message}
                            </div>
                            <small className="text-muted">{notif.time}</small>
                          </div>
                          {!notif.read && (
                            <Badge bg="primary" pill style={{ fontSize: '0.6rem' }}>New</Badge>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link 
              className="text-white d-flex align-items-center gap-2" 
              onClick={() => navigate('/settings')}
              style={{ cursor: 'pointer' }}
            >
              <User size={20} /> {user?.name}
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
            background: 'linear-gradient(135deg, #00695C 0%, #00897B 100%)',
            color: 'white',
            borderBottom: '1px solid rgba(255,255,255,0.25)'
          }}
        >
          <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
            <Stethoscope size={20} />
            <span>Patient Menu</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body
          className="p-0"
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #f4fbf9 0%, #ffffff 40%, #edf4ff 100%)'
          }}
        >
          <div
            onClick={() => handleNavigate('/patient-dashboard')}
            style={{
              padding: '20px 22px',
              borderBottom: '1px solid #e0e7ff',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 60%, #eff6ff 100%)',
              boxShadow: '0 8px 18px rgba(15,23,42,0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="d-flex align-items-center">
              <div
                style={{
                  marginRight: '16px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 18px rgba(15,118,110,0.35)'
                }}
              >
                <Home size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>Dashboard</div>
                <small style={{ fontSize: '0.78rem', color: '#475569' }}>Live health overview</small>
              </div>
            </div>
            <svg
              viewBox="0 0 280 40"
              style={{
                position: 'absolute',
                bottom: 4,
                left: 18,
                right: 18,
                height: '28px',
                opacity: 0.45,
                filter: 'drop-shadow(0 0 8px rgba(45,212,191,0.45))'
              }}
            >
              <polyline
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,22 20,22 30,22 40,10 45,32 50,22 60,22 90,22 110,22 120,10 125,32 130,22 150,22 180,22 200,22 210,10 215,32 220,22 240,22 260,22 280,22"
              >
                <animate attributeName="stroke-dasharray" from="0,560" to="560,0" dur="2s" repeatCount="indefinite" />
              </polyline>
            </svg>
          </div>
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(feature.path)}
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #edf2ff',
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
                    <feature.icon size={22} color={feature.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#0f172a' }}>{feature.name}</div>
                    <small style={{ fontSize: '0.76rem', color: '#64748b' }}>{feature.desc}</small>
                  </div>
                </div>
                {index === 0 && (
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#0f766e',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: 'rgba(34,197,94,0.10)',
                      border: '1px solid rgba(34,197,94,0.35)'
                    }}
                  >
                    Live
                  </div>
                )}
              </div>
            </div>
          ))}
          <div
            onClick={() => handleNavigate('/settings')}
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
                <Settings size={32} color="#000000" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1976d2' }}>Settings</div>
                <small style={{ fontSize: '0.75rem' }} className="text-muted">Manage your account</small>
              </div>
            </div>
          </div>
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

export default PatientLayout;
