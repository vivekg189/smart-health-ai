import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Table, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getPredictions } from '../../utils/api';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [healthRisks, setHealthRisks] = useState([
    { name: 'Diabetes', level: 'Low', percentage: 0, color: '#10B981', icon: '💉' },
    { name: 'Heart', level: 'Low', percentage: 0, color: '#10B981', icon: '❤️' },
    { name: 'Liver', level: 'Low', percentage: 0, color: '#10B981', icon: '🫀' },
    { name: 'Kidney', level: 'Low', percentage: 0, color: '#10B981', icon: '💊' }
  ]);

  useEffect(() => {
    loadPredictions();
  }, []);

  useEffect(() => {
    if (predictions.length > 0) {
      updateHealthRisks();
    }
  }, [predictions]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await getPredictions();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHealthRisks = () => {
    const diseaseMap = {
      'diabetes': 0,
      'heart': 1,
      'liver': 2,
      'kidney': 3
    };

    const updated = [...healthRisks];

    predictions.forEach(pred => {
      const index = diseaseMap[pred.disease_type?.toLowerCase()];
      if (index !== undefined && pred.probability) {
        const percentage = Math.round(pred.probability * 100);
        let level = 'Low';
        let color = '#10B981';

        if (percentage >= 66) {
          level = 'High';
          color = '#EF4444';
        } else if (percentage >= 33) {
          level = 'Moderate';
          color = '#F59E0B';
        }

        updated[index] = {
          ...updated[index],
          level,
          percentage,
          color
        };
      }
    });

    setHealthRisks(updated);
  };

  const getLastLogin = () => {
    const now = new Date();
    return `${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getLatestReportData = () => {
    if (predictions.length === 0) return null;
    const latest = predictions[0];
    return {
      disease: latest.disease_type,
      risk: latest.risk_level,
      date: new Date(latest.created_at).toLocaleDateString()
    };
  };

  const latestReport = getLatestReportData();

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', paddingBottom: '50px' }}>
        <Container>
          {/* SECTION 1: Welcome Banner */}
          <Card className="mb-4 border-0" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)' }}>
            <Card.Body className="p-5">
              <h1 className="display-5 fw-bold mb-2">Welcome back, {user?.name} 👋</h1>
              <p className="lead mb-3" style={{ opacity: 0.9 }}>Your health insights are ready.</p>
              <small style={{ opacity: 0.8 }}>Last login: {getLastLogin()}</small>
              <div className="mt-4">
                <Button 
                  size="lg" 
                  variant="light" 
                  className="fw-bold px-5 py-3"
                  style={{ borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                  onClick={() => navigate('/models')}
                >
                  🩺 Run New Assessment
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* SECTION 2: Health Risk Overview */}
          <h3 className="fw-bold mb-4" style={{ color: '#1f2937' }}>Health Risk Overview</h3>
          <Row className="mb-4">
            {healthRisks.map((risk, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="h-100 border-0 hover-lift" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s', cursor: 'pointer' }}>
                  <Card.Body className="text-center p-4">
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{risk.icon}</div>
                    <h5 className="fw-bold mb-3">{risk.name} Risk</h5>
                    <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 15px' }}>
                      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke={risk.color} 
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 40 * risk.percentage / 100} ${2 * Math.PI * 40}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {risk.percentage}%
                      </div>
                    </div>
                    <Badge bg="" style={{ background: risk.color, fontSize: '0.9rem', padding: '8px 16px', borderRadius: '20px' }}>
                      {risk.level} Risk
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row>
            {/* SECTION 3: Prediction History */}
            <Col md={12} className="mb-4">
              <Card className="border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>📊</div>
                      <h4 className="fw-bold mb-0">Prediction History</h4>
                    </div>
                    <Button 
                      variant={showHistory ? "secondary" : "primary"}
                      onClick={() => setShowHistory(!showHistory)}
                      style={{ borderRadius: '50px' }}
                    >
                      {showHistory ? 'Hide History' : 'View History'}
                    </Button>
                  </div>
                  
                  {showHistory && (
                    <>
                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-3 text-muted">Loading your history...</p>
                        </div>
                      ) : predictions.length === 0 ? (
                        <div className="text-center py-5">
                          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                          <p className="text-muted">No predictions yet. Run your first assessment!</p>
                          <Button 
                            variant="primary" 
                            onClick={() => navigate('/models')}
                            style={{ borderRadius: '50px' }}
                          >
                            Start Assessment
                          </Button>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <Table hover>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Disease Type</th>
                                <th>Result</th>
                                <th>Risk Level</th>
                                <th>Probability</th>
                              </tr>
                            </thead>
                            <tbody>
                              {predictions.map((pred) => (
                                <tr key={pred.id}>
                                  <td>{new Date(pred.created_at).toLocaleDateString()}</td>
                                  <td className="text-capitalize">{pred.disease_type}</td>
                                  <td>{pred.prediction_result}</td>
                                  <td>
                                    <Badge 
                                      bg={pred.risk_level?.includes('High') ? 'danger' : pred.risk_level?.includes('Moderate') ? 'warning' : 'success'}
                                    >
                                      {pred.risk_level}
                                    </Badge>
                                  </td>
                                  <td>{pred.probability ? `${(pred.probability * 100).toFixed(1)}%` : 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* SECTION 4: Nutrition Insight */}
            <Col md={6} className="mb-4">
              <Card className="h-100 border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>🥗</div>
                    <h4 className="fw-bold mb-0">Today's Nutrition Insight</h4>
                  </div>
                  <p className="text-muted mb-4">
                    Based on your health profile, we recommend increasing protein intake and reducing processed sugars. Stay hydrated with 8 glasses of water daily.
                  </p>
                  <Button 
                    variant="success" 
                    className="w-100 fw-bold py-3"
                    style={{ borderRadius: '50px' }}
                    onClick={() => navigate('/assistant')}
                  >
                    View 7-Day Meal Plan
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* SECTION 4: Nearby Healthcare */}
            <Col md={6} className="mb-4">
              <Card className="h-100 border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>🏥</div>
                    <h4 className="fw-bold mb-0">Nearby Care</h4>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Nearest Hospital:</span>
                      <span className="fw-bold">2.3 km away</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Available Doctors:</span>
                      <span className="fw-bold">12 nearby</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      className="flex-fill fw-bold py-3"
                      style={{ borderRadius: '50px' }}
                      onClick={() => navigate('/hospital-finder')}
                    >
                      Find Hospitals
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="flex-fill fw-bold py-3"
                      style={{ borderRadius: '50px' }}
                      onClick={() => navigate('/meet-doctor')}
                    >
                      Meet a Doctor
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* SECTION 5: Report Analyzer */}
            <Col md={6} className="mb-4">
              <Card className="h-100 border-0" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{ fontSize: '2.5rem', marginRight: '15px' }}>📄</div>
                    <h4 className="fw-bold mb-0">Medical Report Summary</h4>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Last analyzed parameters:</small>
                    <div className="mt-2">
                      {latestReport ? (
                        <>
                          <Badge 
                            bg={latestReport.risk?.includes('High') ? 'danger' : latestReport.risk?.includes('Moderate') ? 'warning' : 'success'}
                            className="me-2 mb-2"
                          >
                            {latestReport.disease}: {latestReport.risk}
                          </Badge>
                          <small className="text-muted d-block mt-2">Analyzed on: {latestReport.date}</small>
                        </>
                      ) : (
                        <Badge bg="secondary" className="mb-2">No reports yet</Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="warning" 
                    className="w-100 fw-bold py-3"
                    style={{ borderRadius: '50px', color: 'white' }}
                    onClick={() => navigate('/report-analyzer')}
                  >
                    📤 Upload New Report
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* SECTION 6: Emergency Quick Access */}
            <Col md={6} className="mb-4">
              <Card className="h-100 border-0" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)' }}>
                <Card.Body className="p-4 d-flex flex-column justify-content-center">
                  <div className="text-center mb-3">
                    <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🚑</div>
                    <h4 className="fw-bold mb-2">Emergency Care Access</h4>
                    <p style={{ opacity: 0.9 }}>Instant access to emergency services and nearest care centers</p>
                  </div>
                  <Button 
                    variant="light" 
                    size="lg"
                    className="w-100 fw-bold py-3"
                    style={{ borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                    onClick={() => navigate('/emergency')}
                  >
                    🆘 Activate Emergency Mode
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default PatientDashboard;
