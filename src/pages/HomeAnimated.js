import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Heart, Brain, Stethoscope, Video, Shield, 
  Users, Award, CheckCircle, ArrowRight,
  Microscope, Pill, Syringe, Phone
} from 'lucide-react';

const HomeAnimated = () => {
  const navigate = useNavigate();

  const features = [
    { 
      icon: <Activity size={40} />, 
      title: 'AI Health Predictions', 
      desc: 'Advanced ML models for early disease detection',
      color: '#0EA5E9'
    },
    { 
      icon: <Video size={40} />, 
      title: 'Video Consultations', 
      desc: 'Connect with doctors via secure video calls',
      color: '#8B5CF6'
    },
    { 
      icon: <Brain size={40} />, 
      title: 'Smart Analytics', 
      desc: 'Comprehensive health insights & tracking',
      color: '#EC4899'
    },
    { 
      icon: <Shield size={40} />, 
      title: 'Secure & Private', 
      desc: 'HIPAA compliant data protection',
      color: '#10B981'
    }
  ];

  const services = [
    { icon: <Heart size={32} />, title: 'Cardiology', color: '#EF4444' },
    { icon: <Brain size={32} />, title: 'Neurology', color: '#8B5CF6' },
    { icon: <Activity size={32} />, title: 'General Medicine', color: '#0EA5E9' },
    { icon: <Stethoscope size={32} />, title: 'Diagnostics', color: '#10B981' },
  ];

  const stats = [
    { icon: <Users size={32} />, value: '10,000+', label: 'Active Users' },
    { icon: <Stethoscope size={32} />, value: '500+', label: 'Expert Doctors' },
    { icon: <CheckCircle size={32} />, value: '50,000+', label: 'Consultations' },
    { icon: <Award size={32} />, value: '98%', label: 'Satisfaction' },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Modern Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 20px rgba(0, 137, 123, 0.1)',
        zIndex: 1000,
        padding: '15px 0'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Health AI Logo" style={{ width: '50px', height: '50px' }} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00695C', lineHeight: 1 }}>HealthAI</div>
              <div style={{ fontSize: '0.7rem', color: '#00897B', fontWeight: 600, letterSpacing: '1px' }}>SMART HEALTHCARE</div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <a href="#features" style={{ color: '#37474F', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s' }}
               onMouseOver={(e) => e.target.style.color = '#00897B'}
               onMouseOut={(e) => e.target.style.color = '#37474F'}>
              Features
            </a>
            <a href="#services" style={{ color: '#37474F', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s' }}
               onMouseOver={(e) => e.target.style.color = '#00897B'}
               onMouseOut={(e) => e.target.style.color = '#37474F'}>
              Services
            </a>
            <a href="#about" style={{ color: '#37474F', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s' }}
               onMouseOver={(e) => e.target.style.color = '#00897B'}
               onMouseOut={(e) => e.target.style.color = '#37474F'}>
              About
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={16} color="#00897B" />
              <span style={{ color: '#00897B', fontWeight: 700, fontSize: '0.95rem' }}>24/7 Support</span>
            </div>
            <button
              onClick={() => navigate('/auth')}
              style={{
                background: 'linear-gradient(135deg, #00897B 0%, #26A69A 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 137, 123, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 137, 123, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 137, 123, 0.3)';
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Medical Elements Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, opacity: 0.05 }}>
        <Heart style={{ position: 'absolute', top: '10%', left: '5%', animation: 'float 6s ease-in-out infinite' }} size={60} />
        <Stethoscope style={{ position: 'absolute', top: '20%', right: '10%', animation: 'float 7s ease-in-out infinite 1s' }} size={50} />
        <Pill style={{ position: 'absolute', bottom: '15%', left: '15%', animation: 'float 8s ease-in-out infinite 2s' }} size={45} />
        <Microscope style={{ position: 'absolute', bottom: '25%', right: '8%', animation: 'float 9s ease-in-out infinite 1.5s' }} size={55} />
        <Syringe style={{ position: 'absolute', top: '50%', left: '8%', animation: 'float 7s ease-in-out infinite 0.5s' }} size={40} />
        <Activity style={{ position: 'absolute', top: '60%', right: '15%', animation: 'float 6.5s ease-in-out infinite 2.5s' }} size={50} />
      </div>

      {/* Hero Section */}
      <section id="home" style={{
        background: 'linear-gradient(135deg, #E0F7FA 0%, #B2DFDB 50%, #80CBC4 100%)',
        padding: '140px 0 100px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '12px 24px',
                borderRadius: '50px',
                marginBottom: '28px',
                border: '2px solid rgba(0, 137, 123, 0.3)',
                boxShadow: '0 4px 15px rgba(0, 137, 123, 0.15)'
              }}>
                <Activity size={22} color="#00897B" />
                <span style={{ color: '#00695C', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                  AI-Powered Healthcare Platform
                </span>
              </div>
              
              <h1 style={{
                fontSize: '4rem',
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: '28px',
                background: 'linear-gradient(135deg, #00695C 0%, #00897B 50%, #26A69A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Empowering Health Through Intelligence
              </h1>
              
              <p style={{
                fontSize: '1.3rem',
                color: '#37474F',
                marginBottom: '45px',
                lineHeight: 1.7,
                fontWeight: 400
              }}>
                Advanced AI diagnostics, real-time doctor consultations, and personalized health monitoring—all in one intelligent platform.
              </p>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => navigate('/auth')}
                  style={{
                    background: 'linear-gradient(135deg, #00897B 0%, #26A69A 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '18px 40px',
                    borderRadius: '50px',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(0, 137, 123, 0.35)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 137, 123, 0.45)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 137, 123, 0.35)';
                  }}
                >
                  Get Started <ArrowRight size={20} />
                </button>
                
                <button
                  onClick={() => navigate('/services')}
                  style={{
                    background: 'white',
                    color: '#00897B',
                    border: '3px solid #00897B',
                    padding: '18px 40px',
                    borderRadius: '50px',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#00897B';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#00897B';
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
            
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(0, 137, 123, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'pulse 3s ease-in-out infinite'
              }} />
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '30px',
                padding: '60px',
                boxShadow: '0 30px 80px rgba(0, 137, 123, 0.2)',
                border: '3px solid rgba(0, 137, 123, 0.2)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ marginBottom: '30px' }}>
                  <img src="/logo.png" alt="Health AI" style={{ width: '150px', height: '150px', filter: 'drop-shadow(0 10px 25px rgba(0, 137, 123, 0.3))' }} />
                </div>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '16px', color: '#00695C' }}>
                  Intelligent Health Monitoring
                </h3>
                <p style={{ color: '#455A64', lineHeight: 1.7, fontSize: '1.05rem' }}>
                  Real-time diagnostics, predictive analytics, and instant access to medical experts—revolutionizing patient care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '90px 20px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F8F6 100%)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '70px' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '20px', color: '#00695C' }}>
              Advanced Healthcare Features
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#546E7A', maxWidth: '700px', margin: '0 auto' }}>
              Cutting-edge medical technology meets compassionate care
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
            {features.map((feature, i) => (
              <div key={i} style={{
                background: 'white',
                padding: '40px',
                borderRadius: '20px',
                border: '2px solid #E0F2F1',
                transition: 'all 0.4s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 137, 123, 0.2)';
                e.currentTarget.style.borderColor = '#00897B';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E0F2F1';
              }}>
                <div style={{ color: feature.color, marginBottom: '20px' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '90px 20px', 
        background: 'linear-gradient(135deg, #00695C 0%, #00897B 50%, #26A69A 100%)',
        color: 'white',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }}>
            {stats.map((stat, i) => (
              <div key={i}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '90px 20px', background: 'white', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '70px' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '20px', color: '#00695C' }}>
              Medical Specialties
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#546E7A' }}>
              Comprehensive care from specialized medical professionals
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {services.map((service, i) => (
              <div key={i} style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = service.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ color: service.color, marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  {service.icon}
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                  {service.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" style={{ padding: '90px 20px', background: 'linear-gradient(180deg, #F1F8F6 0%, #E0F2F1 100%)', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          background: 'linear-gradient(135deg, #00695C 0%, #00897B 50%, #26A69A 100%)',
          borderRadius: '30px',
          padding: '70px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 25px 60px rgba(0, 137, 123, 0.3)'
        }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '24px' }}>
            Begin Your Health Journey Today
          </h2>
          <p style={{ fontSize: '1.3rem', marginBottom: '45px', opacity: 0.95, lineHeight: 1.6 }}>
            Join thousands transforming healthcare with AI-powered insights
          </p>
          <button
            onClick={() => navigate('/auth')}
            style={{
              background: 'white',
              color: '#00695C',
              border: 'none',
              padding: '20px 50px',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25)';
            }}
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: '#1e293b', 
        color: 'white', 
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '16px' }}>
            <strong>Medical Disclaimer:</strong> This platform provides health assessments for informational purposes only. 
            Always consult qualified healthcare professionals for medical decisions.
          </p>
          <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>
            © 2024 Health AI Platform. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @media (max-width: 768px) {
          section > div > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeAnimated;
