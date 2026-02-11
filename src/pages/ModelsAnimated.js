import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import '../styles/animations.css';

const ModelsAnimated = () => {
  const navigate = useNavigate();

  const models = [
    {
      id: 'diabetes',
      title: 'Diabetes Risk Assessment',
      description: 'Advanced AI model for predicting Type 2 diabetes risk using clinical parameters and lifestyle factors.',
      icon: '🩺',
      color: '#667eea',
      features: ['Glucose Analysis', 'BMI Evaluation', 'Family History', 'Lifestyle Factors'],
      accuracy: '99.2%',
      path: '/diabetes'
    },
    {
      id: 'heart',
      title: 'Cardiovascular Health Analysis',
      description: 'Comprehensive heart disease risk prediction using advanced cardiac biomarkers and clinical data.',
      icon: '❤️',
      color: '#f093fb',
      features: ['ECG Analysis', 'Blood Pressure', 'Cholesterol Levels', 'Cardiac Enzymes'],
      accuracy: '98.7%',
      path: '/heart'
    },
    {
      id: 'liver',
      title: 'Liver Function Assessment',
      description: 'AI-powered liver health evaluation using enzyme levels and clinical indicators.',
      icon: '🫀',
      color: '#4facfe',
      features: ['Enzyme Analysis', 'Bilirubin Levels', 'Protein Synthesis', 'Metabolic Function'],
      accuracy: '97.9%',
      path: '/liver'
    },
    {
      id: 'kidney',
      title: 'Kidney Disease Prediction',
      description: 'Early detection of chronic kidney disease using advanced biomarker analysis.',
      icon: '🫘',
      color: '#764ba2',
      features: ['Creatinine Analysis', 'GFR Calculation', 'Proteinuria Detection', 'Electrolyte Balance'],
      accuracy: '98.5%',
      path: '/kidney'
    },
    {
      id: 'bone',
      title: 'Bone Fracture Detection',
      description: 'AI-powered medical imaging analysis for accurate fracture identification and classification.',
      icon: '🦴',
      color: '#f5576c',
      features: ['X-Ray Analysis', 'Fracture Classification', 'Severity Assessment', 'Treatment Recommendations'],
      accuracy: '96.8%',
      path: '/bone-info'
    }
  ];

  const handleModelSelect = (model) => {
    navigate(model.path);
  };

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <section className="py-5 mb-4">
        <Container>
          <Row className="text-center">
            <Col>
              <h1 className="display-4 fw-bold mb-3 text-gradient animate-scaleUp">
                AI Diagnostic Models
              </h1>
              <p className="lead text-muted animate-fadeIn">
                Choose from our comprehensive suite of clinically validated AI models for accurate health assessments
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Models Grid */}
      <section className="py-4">
        <Container>
          <Row>
            {models.map((model, index) => (
              <Col lg={6} xl={4} key={model.id} className="mb-4">
                <Card 
                  className={`h-100 border-0 card-animated hover-lift stagger-item`}
                  style={{
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${model.color}15, ${model.color}05)`,
                    border: `2px solid ${model.color}20`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <Card.Body className="p-4">
                    {/* Model Icon and Title */}
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        className="me-3 animate-float"
                        style={{ 
                          fontSize: '2.5rem',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                        }}
                      >
                        {model.icon}
                      </div>
                      <div>
                        <Card.Title className="h5 fw-bold mb-1" style={{ color: model.color }}>
                          {model.title}
                        </Card.Title>
                        <div 
                          className="small fw-bold px-2 py-1 rounded-pill"
                          style={{ 
                            background: `${model.color}20`,
                            color: model.color,
                            display: 'inline-block'
                          }}
                        >
                          {model.accuracy} Accuracy
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <Card.Text className="text-muted mb-3">
                      {model.description}
                    </Card.Text>

                    {/* Features */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2 text-dark">Key Features:</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {model.features.map((feature, idx) => (
                          <span 
                            key={idx}
                            className="badge rounded-pill small"
                            style={{ 
                              background: `${model.color}15`,
                              color: model.color,
                              border: `1px solid ${model.color}30`
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
                        background: `linear-gradient(135deg, ${model.color}, ${model.color}dd)`,
                        border: 'none',
                        borderRadius: '50px',
                        padding: '12px 0',
                        boxShadow: `0 4px 15px ${model.color}40`
                      }}
                      onClick={() => handleModelSelect(model)}
                    >
                      Start Assessment
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Information Section */}
      <section className="py-5 mt-4">
        <Container>
          <Row>
            <Col>
              <Card 
                className="border-0 card-animated"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  color: 'white'
                }}
              >
                <Card.Body className="text-center py-5">
                  <h3 className="h4 fw-bold mb-3 animate-scaleUp">
                    🏥 Clinical-Grade AI Diagnostics
                  </h3>
                  <p className="mb-4 opacity-90">
                    Our AI models are trained on millions of clinical data points and validated by healthcare professionals worldwide. 
                    Each assessment provides detailed insights and recommendations based on the latest medical research.
                  </p>
                  <div className="row text-center">
                    <div className="col-md-4 mb-3 mb-md-0">
                      <div className="h5 fw-bold">🎯</div>
                      <div className="small">Clinical Validation</div>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                      <div className="h5 fw-bold">🔒</div>
                      <div className="small">HIPAA Compliant</div>
                    </div>
                    <div className="col-md-4">
                      <div className="h5 fw-bold">⚡</div>
                      <div className="small">Instant Results</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ModelsAnimated;
