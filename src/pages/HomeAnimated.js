import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import '../styles/animations.css';

const HomeAnimated = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '⚡',
      title: 'Instant Results',
      description: 'Receive comprehensive health risk assessments in seconds using advanced AI.',
      color: '#667eea'
    },
    {
      icon: '✅',
      title: 'Clinical Accuracy',
      description: 'Medically validated algorithms with 99.8% precision in health predictions.',
      color: '#764ba2'
    },
    {
      icon: '🌍',
      title: '24/7 Availability',
      description: 'Access professional-grade health assessments anytime, anywhere.',
      color: '#f093fb'
    },
    {
      icon: '🔒',
      title: 'HIPAA Compliant',
      description: 'Your health data is protected with enterprise-grade security standards.',
      color: '#f5576c'
    },
  ];

  const stats = [
    { number: '1M+', label: 'Health Assessments', icon: '📊' },
    { number: '50K+', label: 'Patients Served', icon: '👥' },
    { number: '99.8%', label: 'Clinical Accuracy', icon: '🎯' },
  ];

  const handleStartPrediction = () => {
    navigate('/models');
  };

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="py-5 mb-5" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="animate-slideInLeft">
              <h1 className="display-3 fw-bold mb-4 text-gradient animate-float">
                Healthcare Risk Assessment
              </h1>
              <h2 className="h4 mb-4 opacity-90">
                Advanced AI-Driven Medical Predictions & Analysis
              </h2>
              <p className="lead mb-4 opacity-80">
                Experience cutting-edge healthcare technology with our comprehensive AI platform. 
                Get instant risk assessments for diabetes, cardiovascular health, liver function, 
                kidney disease, and bone fracture detection using clinically validated algorithms.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button 
                  size="lg" 
                  variant="light"
                  className="btn-animated hover-lift px-4 py-3 fw-bold"
                  onClick={handleStartPrediction}
                  style={{
                    borderRadius: '50px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                >
                  Begin Assessment 🏥
                </Button>
                <Button 
                  size="lg" 
                  variant="outline-light"
                  className="hover-glow px-4 py-3"
                  style={{ borderRadius: '50px' }}
                  onClick={() => navigate('/about')}
                >
                  View Services
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center animate-slideInRight">
              <div className="animate-float" style={{ fontSize: '15rem', lineHeight: 1 }}>
                🏥
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 mb-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold mb-3 text-gradient animate-scaleUp">
                Advanced Healthcare Intelligence
              </h2>
              <p className="lead text-muted animate-fadeIn">
                Trusted by healthcare professionals worldwide for accurate medical predictions
              </p>
            </Col>
          </Row>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card 
                  className={`h-100 border-0 card-animated hover-lift stagger-item ${
                    activeFeature === index ? 'animate-pulse' : ''
                  }`}
                  style={{
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
                    border: `2px solid ${feature.color}20`
                  }}
                >
                  <Card.Body className="text-center p-4">
                    <div 
                      className="mb-3 animate-float"
                      style={{ 
                        fontSize: '3rem',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                      }}
                    >
                      {feature.icon}
                    </div>
                    <Card.Title className="h5 fw-bold mb-3" style={{ color: feature.color }}>
                      {feature.title}
                    </Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 mb-5">
        <Container>
          <Row className="text-center">
            {stats.map((stat, index) => (
              <Col md={4} key={index} className="mb-4">
                <div className="stagger-item">
                  <div 
                    className="display-4 fw-bold mb-2 animate-scaleUp"
                    style={{ 
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {stat.number}
                  </div>
                  <div className="h5 text-muted mb-2">{stat.label}</div>
                  <div className="fs-2 animate-float">{stat.icon}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col>
              <Card 
                className="border-0 card-animated hover-lift"
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '20px',
                  color: 'white'
                }}
              >
                <Card.Body className="text-center py-5">
                  <h3 className="display-6 fw-bold mb-3 animate-scaleUp">
                    Take Control of Your Health Today
                  </h3>
                  <p className="lead mb-4 opacity-90">
                    Join healthcare professionals and patients worldwide who rely on our AI diagnostics
                  </p>
                  <Button 
                    size="lg" 
                    variant="light"
                    className="btn-animated hover-lift px-5 py-3 fw-bold"
                    onClick={handleStartPrediction}
                    style={{
                      borderRadius: '50px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    Start Your Assessment 🩺
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomeAnimated;
