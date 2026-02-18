import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Activity, HeartPulse, Brain, Stethoscope, Scan, Bone } from 'lucide-react';
import '../styles/animations.css';

const ModelsAnimated = () => {
  const navigate = useNavigate();

  const models = [
    {
      id: 'symptom-checker',
      title: 'AI Symptom Checker',
      description:
        'Describe your symptoms in natural language and get AI-powered differential insights using clinical NLP.',
      icon: <Scan size={30} strokeWidth={2.2} />,
      color: '#1E8E6A',
      features: ['Natural Language', 'Clinical NLP', 'Disease Prediction', 'Risk Assessment'],
      path: '/symptom-checker'
    },
    {
      id: 'diabetes',
      title: 'Diabetes Risk Assessment',
      description:
        'Advanced AI model for predicting Type 2 diabetes risk from metabolic markers and lifestyle factors.',
      icon: <Activity size={30} strokeWidth={2.2} />,
      color: '#1E8E6A',
      features: ['Glucose Analysis', 'BMI Evaluation', 'Family History', 'Lifestyle Factors'],
      path: '/diabetes'
    },
    {
      id: 'heart',
      title: 'Cardiovascular Health Analysis',
      description:
        'Comprehensive heart disease risk prediction using blood pressure, lipids, and cardiac biomarkers.',
      icon: <HeartPulse size={30} strokeWidth={2.2} />,
      color: '#D9234B',
      features: ['ECG-style Metrics', 'Blood Pressure', 'Cholesterol Levels', 'Cardiac Enzymes'],
      path: '/heart'
    },
    {
      id: 'liver',
      title: 'Liver Function Assessment',
      description: 'AI-powered liver health evaluation using enzyme panels and bilirubin ratios.',
      icon: <Stethoscope size={30} strokeWidth={2.2} />,
      color: '#8B5CF6',
      features: ['Enzyme Analysis', 'Bilirubin Levels', 'Protein Synthesis', 'Metabolic Function'],
      path: '/liver'
    },
    {
      id: 'kidney',
      title: 'Kidney Disease Prediction',
      description: 'Early detection of chronic kidney disease using renal biomarkers and eGFR estimation.',
      icon: <Activity size={30} strokeWidth={2.2} />,
      color: '#0EA5E9',
      features: ['Creatinine', 'eGFR', 'Proteinuria', 'Electrolytes'],
      path: '/kidney'
    },
    {
      id: 'bone',
      title: 'Bone Fracture Detection',
      description: 'Medical imaging analysis of bone X-rays for accurate fracture identification.',
      icon: <Bone size={30} strokeWidth={2.2} />,
      color: '#F97316',
      features: ['X-Ray Analysis', 'Fracture Classification', 'Severity Assessment', 'Triage Support'],
      path: '/bone-info'
    }
  ];

  const handleModelSelect = (model) => {
    navigate(model.path);
  };

  return (
    <div className="animate-fadeIn" style={{ 
      minHeight: '100vh',
      width: '100%',
      padding: '0',
      margin: '0',
      background: 'linear-gradient(135deg, #E6F7F5 0%, #DCEAF2 100%)'
    }}>
      {/* Header Section */}
      <section className="py-4 mb-3">
        <Row className="text-center">
          <Col>
            <h1 className="display-4 fw-bold mb-3 animate-scaleUp" style={{
              background: 'linear-gradient(135deg, #1E8E6A 0%, #2BBF9F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AI Diagnostic Models
            </h1>
            <p className="lead animate-fadeIn" style={{ color: '#2C3E50', fontSize: '1.1rem', fontWeight: '500' }}>
              Choose from our comprehensive suite of clinically validated AI models for accurate health assessments
            </p>
          </Col>
        </Row>
      </section>

      {/* Models Grid */}
      <section className="py-2" style={{ padding: '0 20px' }}>
        <Row className="g-3">
            {models.map((model, index) => (
              <Col lg={4} key={model.id} className="mb-3">
                <Card 
                  className={`h-100 border-0 card-animated hover-lift stagger-item`}
                  style={{
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    animationDelay: `${index * 0.1}s`,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '420px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.backdropFilter = 'blur(16px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.backdropFilter = 'blur(12px)';
                  }}
                >
                  <Card.Body className="p-4" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    {/* Model Icon and Title */}
                    <div className="mb-3 text-center">
                      <div
                        className="mb-3 animate-float"
                        style={{
                          width: 80,
                          height: 80,
                          margin: '0 auto',
                          borderRadius: '24px',
                          background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.9) 0, rgba(255,255,255,0) 45%), linear-gradient(135deg, ${model.color} 0%, rgba(255,255,255,0.95) 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 10px 26px rgba(15, 23, 42, 0.22)'
                        }}
                      >
                        <span style={{ color: '#ffffff' }}>{model.icon}</span>
                      </div>
                      <Card.Title className="h5 fw-bold mb-2" style={{ color: '#2C3E50' }}>
                        {model.title}
                      </Card.Title>
                    </div>

                    {/* Description */}
                    <Card.Text className="text-muted mb-3" style={{ fontSize: '0.9rem', minHeight: '60px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34495E' }}>
                      {model.description}
                    </Card.Text>

                    {/* Features */}
                    <div className="mb-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '0.95rem', textAlign: 'center', color: '#2C3E50' }}>Key Features</h6>
                      <div className="d-flex flex-wrap gap-2 justify-content-center" style={{ minHeight: '80px', alignItems: 'center' }}>
                        {model.features.map((feature, idx) => {
                          const isPrimary = idx === 0;
                          return (
                            <span
                              key={idx}
                              className="badge rounded-pill"
                              style={{
                                background: isPrimary
                                  ? `linear-gradient(135deg, ${model.color} 0%, rgba(34,197,94,0.95) 100%)`
                                  : 'rgba(226, 232, 240, 0.9)',
                                color: isPrimary ? 'white' : '#1e293b',
                                padding: isPrimary ? '8px 18px' : '6px 14px',
                                fontSize: '0.84rem',
                                fontWeight: isPrimary ? 600 : 500,
                                boxShadow: isPrimary ? '0 6px 16px rgba(15,23,42,0.28)' : 'none',
                                border: isPrimary ? 'none' : '1px solid rgba(148,163,184,0.6)'
                              }}
                            >
                              {feature}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ marginTop: 'auto' }}>
                      <Button 
                        className="w-100 fw-bold"
                        style={{
                          background: 'linear-gradient(135deg, #1E8E6A, #2BBF9F)',
                          border: 'none',
                          borderRadius: '50px',
                          padding: '14px 0',
                          boxShadow: '0 6px 20px rgba(30, 142, 106, 0.3)',
                          transition: 'all 0.3s ease',
                          color: 'white'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(30, 142, 106, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 142, 106, 0.3)';
                        }}
                        onClick={() => handleModelSelect(model)}
                      >
                        Start Assessment
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
      </section>
    </div>
  );
};

export default ModelsAnimated;
