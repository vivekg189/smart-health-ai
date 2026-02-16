import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [isAvailable, setIsAvailable] = useState(true);

  // Listen for section changes from menu
  React.useEffect(() => {
    const handleSectionChange = (e) => {
      if (e.detail) setActiveSection(e.detail);
    };
    window.addEventListener('doctorSectionChange', handleSectionChange);
    return () => window.removeEventListener('doctorSectionChange', handleSectionChange);
  }, []);

  const renderSection = () => {
    switch(activeSection) {
      case 'requests':
        return (
          <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-4">Consultation Requests</h3>
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>📋</div>
                <p>No new consultation requests</p>
              </div>
            </Card.Body>
          </Card>
        );
      case 'patients':
        return (
          <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-4">My Patients</h3>
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>👥</div>
                <p>No patients assigned yet</p>
              </div>
            </Card.Body>
          </Card>
        );
      case 'video':
        return (
          <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-4">Video Consultations</h3>
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🎥</div>
                <p>No active video calls</p>
              </div>
            </Card.Body>
          </Card>
        );
      case 'notes':
        return (
          <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-4">Medical Notes</h3>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Patient Name</Form.Label>
                <Form.Control type="text" placeholder="Enter patient name" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Consultation Notes</Form.Label>
                <Form.Control as="textarea" rows={6} placeholder="Enter notes..." />
              </Form.Group>
              <Button variant="primary" style={{ borderRadius: '50px' }}>Save Notes</Button>
            </Card.Body>
          </Card>
        );
      case 'analytics':
        return (
          <Row>
            <Col md={6}>
              <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">Most Common Conditions</h5>
                  <div className="text-center text-muted py-4">
                    <div style={{ fontSize: '3rem' }}>📊</div>
                    <p>No data yet</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">Weekly Stats</h5>
                  <div className="text-center text-muted py-4">
                    <div style={{ fontSize: '3rem' }}>📈</div>
                    <p>No data yet</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );
      case 'notifications':
        return (
          <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-4">Notifications</h3>
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🔔</div>
                <p>No new notifications</p>
              </div>
            </Card.Body>
          </Card>
        );
      case 'availability':
        return (
          <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Card.Body className="p-5 text-center">
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>{isAvailable ? '🟢' : '🔴'}</div>
              <h3 className="fw-bold mb-3">You are {isAvailable ? 'Online' : 'Offline'}</h3>
              <p className="text-muted mb-4">
                {isAvailable ? 'Patients can find you' : 'Hidden from search'}
              </p>
              <div className="d-flex justify-content-center align-items-center">
                <span className="me-3 fw-bold">Offline</span>
                <Form.Check 
                  type="switch"
                  checked={isAvailable}
                  onChange={() => setIsAvailable(!isAvailable)}
                  style={{ transform: 'scale(1.5)' }}
                />
                <span className="ms-3 fw-bold">Online</span>
              </div>
            </Card.Body>
          </Card>
        );
      case 'profile':
        return (
          <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-4">Profile Settings</h3>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Name</Form.Label>
                  <Form.Control type="text" defaultValue={user?.name} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Email</Form.Label>
                  <Form.Control type="email" defaultValue={user?.email} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Specialization</Form.Label>
                  <Form.Control type="text" defaultValue={user?.specialization} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Hospital</Form.Label>
                  <Form.Control type="text" placeholder="Hospital name" />
                </Form.Group>
                <Button variant="primary" style={{ borderRadius: '50px' }}>Update Profile</Button>
              </Form>
            </Card.Body>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', paddingBottom: '50px' }}>
      <Container>
        {activeSection === 'overview' ? (
          <>
        {/* Welcome Banner */}
        <Card className="mb-4 border-0" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)' }}>
          <Card.Body className="p-5">
            <h1 className="display-5 fw-bold mb-2">Welcome, Dr. {user?.name?.charAt(0).toUpperCase() + user?.name?.slice(1)} 👨⚕️</h1>
            <p className="lead mb-3" style={{ opacity: 0.9 }}>Specialization: {user?.specialization}</p>
            <div className="d-flex align-items-center gap-3">
              <Badge bg={isAvailable ? 'success' : 'danger'} style={{ fontSize: '1rem', padding: '10px 20px' }}>
                {isAvailable ? '🟢 Online' : '🔴 Offline'}
              </Badge>
              <Form.Check 
                type="switch"
                id="status-switch"
                label="Toggle Availability"
                checked={isAvailable}
                onChange={() => setIsAvailable(!isAvailable)}
                className="text-white"
                style={{ fontSize: '1rem' }}
              />
            </div>
          </Card.Body>
        </Card>

        {/* Dashboard Stats */}
        <h3 className="fw-bold mb-4" style={{ color: '#1f2937' }}>Dashboard Overview</h3>
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</div>
                <h3 className="fw-bold">0</h3>
                <p className="text-muted mb-0">Total Patients</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
                <h3 className="fw-bold">0</h3>
                <p className="text-muted mb-0">Today's Consultations</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📞</div>
                <h3 className="fw-bold">0</h3>
                <p className="text-muted mb-0">Active Calls</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⭐</div>
                <h3 className="fw-bold">-</h3>
                <p className="text-muted mb-0">Rating</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Consultation Requests */}
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>📋</div>
                  <h4 className="fw-bold mb-0">Consultation Requests</h4>
                </div>
                <div className="text-center text-muted py-4">
                  <p>No new consultation requests</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* My Patients */}
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>👥</div>
                  <h4 className="fw-bold mb-0">My Patients</h4>
                </div>
                <div className="text-center text-muted py-4">
                  <p>No patients assigned yet</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Notifications */}
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>🔔</div>
                  <h4 className="fw-bold mb-0">Notifications</h4>
                </div>
                <div className="text-center text-muted py-4">
                  <p>No new notifications</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Analytics */}
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>📈</div>
                  <h4 className="fw-bold mb-0">Analytics</h4>
                </div>
                <div className="text-center text-muted py-4">
                  <p>No consultation data yet</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        </>
        ) : (
          <div className="mt-4">
            {renderSection()}
          </div>
        )}
      </Container>
    </div>
  );
};

export default DoctorDashboard;
