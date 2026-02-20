import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Badge } from 'react-bootstrap';
import { FaAmbulance, FaBell } from 'react-icons/fa';
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/notifications', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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
          style={{ ...brandStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
          className="text-decoration-none animate-pulse"
        >
          <img src="/logo.png" alt="Health AI Logo" style={{ width: '40px', height: '40px' }} />
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
              to="/patient-dashboard"
              className="d-flex align-items-center justify-content-center position-relative"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: unreadCount > 0 ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                marginRight: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Notifications"
            >
              <FaBell style={{ color: 'white', fontSize: '1.3rem' }} />
              {unreadCount > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    fontSize: '0.7rem',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Nav.Link>
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