import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/animations.css';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Models', path: '/models' },
  { name: 'Bone Fracture', path: '/bone' },
  { name: 'Calculators', path: '/calculators' },
  { name: 'Services', path: '/services' },
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
    background: scrolled 
      ? 'rgba(102, 126, 234, 0.95)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      className={`shadow-lg navbar-animated animate-slideInLeft ${scrolled ? 'scrolled' : ''}`}
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
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;