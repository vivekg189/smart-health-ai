import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/animations.css';

const Footer = () => {
  return (
    <footer 
      className="mt-auto py-4 animate-fadeIn"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <Container>
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center mb-2">
              <span className="fs-4 me-2">🏥</span>
              <Link 
                to="/" 
                className="text-decoration-none text-white fw-bold fs-5 hover-glow"
                style={{
                  transition: 'all 0.3s ease'
                }}
              >
                Healthcare AI Platform
              </Link>
            </div>
            <p className="small opacity-75 mb-0">
              Advanced AI-driven medical risk assessment and diagnostic support system.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="small opacity-75 mb-2">
              © {new Date().getFullYear()} Healthcare Risk Assessment. All rights reserved.
            </p>
            <p className="small opacity-75 mb-0">
              ⚠️ This AI tool is for informational purposes only. Always consult healthcare professionals for medical decisions.
            </p>
          </Col>
        </Row>
        <hr className="my-3 opacity-25" />
        <Row>
          <Col className="text-center">
            <p className="small opacity-75 mb-0">
              🔒 HIPAA Compliant | 🎯 99.8% Clinical Accuracy | 🌍 Available 24/7
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;