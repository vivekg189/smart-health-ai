import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/animations.css';

const Footer = () => {
  return (
    <footer 
      className="mt-auto py-3 animate-fadeIn"
      style={{
        background: '#6c757d',
        color: 'white',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)'
      }}
    >
      <Container fluid className="px-5">
        <Row className="mb-2">
          <Col md={6} className="mb-2 mb-md-0">
            <div className="d-flex align-items-center mb-2">
              <span className="fs-5 me-2"></span>
              <Link 
                to="/" 
                className="text-decoration-none text-white fw-bold fs-6 hover-glow"
                style={{ transition: 'all 0.3s ease' }}
              >
                Smart Health AI
              </Link>
            </div>
            <p className="small opacity-75 mb-0">
              AI-driven healthcare insights and personalized medical guidance.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="small opacity-75 mb-1">📧 support@smarthealth.ai</p>
            <p className="small opacity-75 mb-0">📞 Emergency: 108 | 100 | 101</p>
          </Col>
        </Row>
        <hr className="my-2 opacity-25" />
        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="small opacity-75 mb-0">
              © {new Date().getFullYear()} Smart Health AI. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="small opacity-75 mb-0">
              🔒 Privacy Protected | 🎯 AI-Powered | ⚕️ Medical Grade
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;