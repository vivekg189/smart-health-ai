import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import '../styles/animations.css';

const Calculators = () => {
  const navigate = useNavigate();

  const calculators = [
    {
      id: 'bmi',
      title: 'BMI Calculator',
      description: 'Calculate your Body Mass Index (BMI) using height and weight measurements.',
      icon: '⚖️',
      color: '#2196f3',
      features: ['Height Input', 'Weight Input', 'BMI Calculation', 'Health Category'],
      path: '/bmi'
    },
    {
      id: 'bone-fracture',
      title: 'Bone Fracture Detection',
      description: 'AI-powered analysis of X-ray images to detect bone fractures with high accuracy.',
      icon: '🦴',
      color: '#ff6b6b',
      features: ['X-ray Upload', 'AI Analysis', 'Confidence Score', 'Detailed Report', 'PDF Export'],
      path: '/bone'
    }
    // Add more calculators here in the future
  ];

  const handleCalculatorSelect = (calculator) => {
    navigate(calculator.path);
  };

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <section className="py-5 mb-4">
        <Container>
          <Row className="text-center">
            <Col>
              <h1 className="display-4 fw-bold mb-3 text-gradient animate-scaleUp">
                Health Calculators
              </h1>
              <p className="lead text-muted animate-fadeIn">
                Quick and easy health calculations to help you monitor your wellness
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Calculators Grid */}
      <section className="py-4">
        <Container>
          <Row>
            {calculators.map((calculator, index) => (
              <Col lg={6} xl={4} key={calculator.id} className="mb-4">
                <Card
                  className={`h-100 border-0 card-animated hover-lift stagger-item`}
                  style={{
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${calculator.color}15, ${calculator.color}05)`,
                    border: `2px solid ${calculator.color}20`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <Card.Body className="p-4">
                    {/* Calculator Icon and Title */}
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="me-3 animate-float"
                        style={{
                          fontSize: '2.5rem',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                        }}
                      >
                        {calculator.icon}
                      </div>
                      <div>
                        <Card.Title className="h5 fw-bold mb-1" style={{ color: calculator.color }}>
                          {calculator.title}
                        </Card.Title>
                      </div>
                    </div>

                    {/* Description */}
                    <Card.Text className="text-muted mb-3">
                      {calculator.description}
                    </Card.Text>

                    {/* Features */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2 text-dark">Features:</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {calculator.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="badge rounded-pill small"
                            style={{
                              background: `${calculator.color}15`,
                              color: calculator.color,
                              border: `1px solid ${calculator.color}30`
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-100 btn-animated hover-glow fw-bold"
                      style={{
                        background: `linear-gradient(135deg, ${calculator.color}, ${calculator.color}dd)`,
                        border: 'none',
                        borderRadius: '50px',
                        padding: '12px 0',
                        boxShadow: `0 4px 15px ${calculator.color}40`
                      }}
                      onClick={() => handleCalculatorSelect(calculator)}
                    >
                      Calculate Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Calculators;
