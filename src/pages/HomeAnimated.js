import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import '../styles/animations.css';

const HomeAnimated = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop',
      title: 'AI-Powered Healthcare Platform',
      subtitle: 'For Patients & Healthcare Professionals'
    },
    {
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=600&fit=crop',
      title: 'Comprehensive Disease Prediction',
      subtitle: 'Advanced ML models for early detection'
    },
    {
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=600&fit=crop',
      title: 'Connect with Doctors Online',
      subtitle: 'Video consultations and expert guidance'
    },
    {
      image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&h=600&fit=crop',
      title: 'Personalized Health Insights',
      subtitle: 'AI-driven nutrition and wellness plans'
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    
    return () => {
      clearInterval(slideInterval);
      clearInterval(featureInterval);
    };
  }, []);

  const features = [
    { icon: '👨⚕️', title: 'For Doctors', description: 'Manage consultations, track patients, and provide expert care through our platform.', color: '#667eea' },
    { icon: '🏥', title: 'For Patients', description: 'Access AI health predictions, connect with doctors, and manage your wellness.', color: '#00A86B' },
    { icon: '🎥', title: 'Video Consultations', description: 'Secure video calls connecting patients with healthcare professionals.', color: '#FF6B6B' },
    { icon: '🤖', title: 'AI Health Assistant', description: 'Instant health insights and personalized medical recommendations.', color: '#6C5CE7' },
  ];

  const services = [
    { icon: '💉', title: 'Disease Prediction', desc: 'AI-powered risk assessment', color: '#E74C3C' },
    { icon: '🥗', title: 'NutriMind AI', desc: 'Personalized meal planning', color: '#4CAF50' },
    { icon: '🏥', title: 'Hospital Finder', desc: 'Locate nearby hospitals', color: '#2196F3' },
    { icon: '👨⚕️', title: 'Doctor Connect', desc: 'Video consultations', color: '#9C27B0' },
    { icon: '📄', title: 'Report Analyzer', desc: 'Medical report analysis', color: '#FF9800' },
    { icon: '🤖', title: 'AI Assistant', desc: 'Health guidance 24/7', color: '#009688' },
  ];

  return (
    <>
      {/* Navbar */}
      <Navbar expand="lg" fixed="top" style={{ background: 'linear-gradient(135deg, #0066cc 0%, #004c99 100%)', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', padding: '10px 0' }}>
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-white" style={{ fontSize: '1.3rem' }}>🏥 HEALTH AI</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link onClick={() => navigate('/')} className="text-white" style={{ fontSize: '1rem', marginRight: '10px' }}>Home</Nav.Link>
              <Nav.Link onClick={() => navigate('/services')} className="text-white" style={{ fontSize: '1rem', marginRight: '10px' }}>Services</Nav.Link>
              <Nav.Link onClick={() => navigate('/about')} className="text-white" style={{ fontSize: '1rem', marginRight: '10px' }}>About</Nav.Link>
              <Nav.Link onClick={() => navigate('/contact')} className="text-white" style={{ fontSize: '1rem', marginRight: '10px' }}>Contact</Nav.Link>
              <Button variant="light" onClick={() => navigate('/auth')} style={{ borderRadius: '50px', marginLeft: '10px', fontWeight: 'bold', padding: '8px 20px' }}>
                Login / Signup
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Carousel Section - Full Width */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              backgroundImage: `linear-gradient(rgba(0, 102, 204, 0.5), rgba(0, 76, 153, 0.5)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Container>
              <Row>
                <Col lg={8} className="text-white">
                  <h1 className="display-2 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    {slide.title}
                  </h1>
                  <p className="lead mb-5" style={{ fontSize: '1.6rem', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    {slide.subtitle}
                  </p>
                  <div className="d-flex gap-3 flex-wrap">
                    <Button 
                      size="lg" 
                      variant="light"
                      className="px-5 py-3 fw-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/auth');
                      }}
                      style={{ borderRadius: '50px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontSize: '1.1rem', zIndex: 100, position: 'relative' }}
                    >
                      Get Started
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline-light"
                      className="px-5 py-3 fw-bold"
                      style={{ borderRadius: '50px', borderWidth: '2px', fontSize: '1.1rem', zIndex: 100, position: 'relative' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/services');
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        ))}
        
        {/* Slide Indicators */}
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 10 }}>
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '50px' : '15px',
                height: '15px',
                borderRadius: '8px',
                border: 'none',
                background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      </section>

      <div style={{ background: '#F8F9FA' }}>

      {/* Features Section */}
      <section style={{ padding: '80px 0' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#212529' }}>Complete Healthcare Ecosystem</h2>
            <p className="lead text-muted">Connecting patients and doctors through AI-powered technology</p>
          </div>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="h-100 border-0 hover-lift" style={{ borderRadius: '20px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}>
                  <Card.Body className="text-center p-4">
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{feature.icon}</div>
                    <Card.Title className="h5 fw-bold mb-3" style={{ color: feature.color }}>{feature.title}</Card.Title>
                    <Card.Text style={{ color: '#6C757D', lineHeight: '1.6' }}>{feature.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#212529' }}>Healthcare Services</h2>
            <p className="lead text-muted">Comprehensive AI-driven health management for patients and doctors</p>
          </div>
          <Row>
            {services.map((service, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="border-0 hover-lift" style={{ borderRadius: '15px', background: '#F8F9FA', transition: 'all 0.3s', cursor: 'pointer' }} onClick={() => navigate('/auth')}>
                  <Card.Body className="d-flex align-items-center p-4">
                    <div style={{ fontSize: '3rem', marginRight: '20px' }}>{service.icon}</div>
                    <div>
                      <Card.Title className="h5 fw-bold mb-1" style={{ color: service.color }}>{service.title}</Card.Title>
                      <Card.Text style={{ color: '#6C757D', fontSize: '0.9rem', marginBottom: 0 }}>{service.desc}</Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #00A86B 0%, #008C5A 100%)', color: 'white' }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="text-center text-lg-start mb-4 mb-lg-0">
              <h3 className="display-6 fw-bold mb-3">Ready to Get Started?</h3>
              <p className="lead mb-0" style={{ opacity: 0.95 }}>Join as a patient or doctor and experience the future of healthcare</p>
            </Col>
            <Col lg={4} className="text-center text-lg-end">
              <Button 
                size="lg" 
                variant="light"
                className="px-5 py-3 fw-bold"
                onClick={() => navigate('/auth')}
                style={{ borderRadius: '50px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                Join Now
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Disclaimer */}
      <section style={{ padding: '40px 0', background: '#F8F9FA' }}>
        <Container>
          <div className="text-center" style={{ fontSize: '0.85rem', color: '#6C757D' }}>
            <p className="mb-0"><strong>Medical Disclaimer:</strong> This platform provides health risk assessments for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.</p>
          </div>
        </Container>
      </section>
      </div>
    </>
  );
};

export default HomeAnimated;
