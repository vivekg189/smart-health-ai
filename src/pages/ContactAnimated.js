import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import '../styles/animations.css';

const ContactAnimated = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Support',
      details: 'support@healthcareai.com',
      description: 'Get technical support and assistance'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      details: '+1 (555) 123-4567',
      description: '24/7 healthcare professional support'
    },
    {
      icon: '🏥',
      title: 'Medical Inquiries',
      details: 'medical@healthcareai.com',
      description: 'Clinical questions and partnerships'
    },
    {
      icon: '🌍',
      title: 'Global Reach',
      details: 'Available Worldwide',
      description: 'Serving patients in 50+ countries'
    }
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <section className="py-5 mb-4">
        <Container>
          <Row className="text-center">
            <Col>
              <h1 className="display-4 fw-bold mb-3 text-gradient animate-scaleUp">
                Contact Healthcare AI
              </h1>
              <p className="lead text-muted animate-fadeIn">
                Get in touch with our medical AI specialists and support team
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Info Cards */}
      <section className="py-4 mb-5">
        <Container>
          <Row>
            {contactInfo.map((info, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card 
                  className="h-100 border-0 card-animated hover-lift stagger-item text-center"
                  style={{
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #667eea15, #764ba205)',
                    border: '2px solid #667eea20',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <Card.Body className="p-4">
                    <div 
                      className="mb-3 animate-float"
                      style={{ 
                        fontSize: '2.5rem',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                      }}
                    >
                      {info.icon}
                    </div>
                    <Card.Title className="h6 fw-bold mb-2" style={{ color: '#667eea' }}>
                      {info.title}
                    </Card.Title>
                    <div className="fw-bold mb-2 text-dark">
                      {info.details}
                    </div>
                    <Card.Text className="small text-muted">
                      {info.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Contact Form */}
      <section className="py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card 
                className="border-0 card-animated hover-lift"
                style={{
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <h3 className="h4 fw-bold mb-2 text-gradient">Send Us a Message</h3>
                    <p className="text-muted">We'll get back to you within 24 hours</p>
                  </div>

                  {showAlert && (
                    <Alert variant="success" className="animate-scaleUp">
                      <strong>Message Sent!</strong> Thank you for contacting us. We'll respond within 24 hours.
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit} className="animate-slideInLeft">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3 form-floating-animated">
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            style={{ borderRadius: '15px', padding: '15px' }}
                            placeholder="Your Name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3 form-floating-animated">
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            style={{ borderRadius: '15px', padding: '15px' }}
                            placeholder="Your Email"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3 form-floating-animated">
                      <Form.Control
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: '15px', padding: '15px' }}
                        placeholder="Subject"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4 form-floating-animated">
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: '15px', padding: '15px' }}
                        placeholder="Your Message"
                      />
                    </Form.Group>

                    <div className="text-center">
                      <Button 
                        type="submit"
                        size="lg"
                        className="btn-animated hover-glow fw-bold px-5"
                        style={{
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          border: 'none',
                          borderRadius: '50px',
                          padding: '15px 40px',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                      >
                        Send Message 📤
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Emergency Notice */}
      <section className="py-4">
        <Container>
          <Row>
            <Col>
              <Card 
                className="border-0 text-center"
                style={{
                  background: 'linear-gradient(135deg, #f5576c, #f093fb)',
                  borderRadius: '20px',
                  color: 'white'
                }}
              >
                <Card.Body className="py-4">
                  <h5 className="fw-bold mb-2">🚨 Medical Emergency Notice</h5>
                  <p className="mb-0 opacity-90">
                    This AI platform is not for emergency medical situations. 
                    For urgent medical care, please call your local emergency services immediately.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ContactAnimated;
