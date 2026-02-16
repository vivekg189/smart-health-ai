import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { FaAmbulance } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/animations.css';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Models', path: '/models' },
  { name: 'NutriMind', path: '/assistant' },
  { name: 'Hospital Finder', path: '/hospital-finder' },
  { name: 'Meet a Doctor', path: '/meet-doctor' },
  { name: 'Report Analyzer', path: '/report-analyzer' },
  { name: 'Contact', path: '/contact' }
];

const Navbar = ({ onlyModels }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const modelsPage = { name: 'Models', path: '/models' };
  const navPages = onlyModels ? [modelsPage] : pages;

  const navbarStyle = {
    background: '#6c757d',
    boxShadow: scrolled 
      ? '0 8px 32px rgba(0,0,0,0.2)' 
      : '0 4px 20px rgba(0,0,0,0.1)',
    backdropFilter: scrolled ? 'blur(10px)' : 'none',
    transition: 'all 0.3s ease'
  };

  const brandStyle = {
    background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 70%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    transition: 'all 0.3s ease'
  };

  return (
    <BootstrapNavbar 
      expand="lg" 
      fixed="top" 
      style={navbarStyle}
      variant="dark"
      className={`shadow-lg navbar-animated animate-slideInLeft`}
    >
      <Container>
        <BootstrapNavbar.Brand 
          as={RouterLink} 
          to="/" 
          style={brandStyle}
          className="text-decoration-none animate-pulse"
        >
          HEALTH AI
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            {navPages.map((page) => (
              <Nav.Link
                key={page.name}
                as={RouterLink}
                to={page.path}
                className="text-white mx-2 px-3 py-2 rounded btn-animated hover-glow stagger-item"
                style={{
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {page.name}
              </Nav.Link>
            ))}
          </Nav>
          
          <Nav className="ms-auto">
            <Nav.Link
              as={RouterLink}
              to="/emergency"
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                boxShadow: '0 0 20px rgba(241, 108, 108, 0.6), 0 0 40px rgba(255, 68, 68, 0.4)',
                transition: 'all 0.3s ease',
                animation: 'pulse 2s infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 68, 68, 0.8), 0 0 60px rgba(255, 68, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.6), 0 0 40px rgba(255, 68, 68, 0.4)';
              }}
              title="Emergency Mode - Quick Access"
            >
              <FaAmbulance style={{ color: 'white', fontSize: '1.5rem' }} />
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;