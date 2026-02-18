import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Heart, Brain, Stethoscope, Video, Shield,
  Users, Award, CheckCircle, ArrowRight, FileText,
  Microscope, Pill, Syringe, Phone, Clock, Zap,
  MonitorSmartphone, BarChart3, AlertCircle, Thermometer,
  Bone, Eye, Scan, HeartPulse, CalendarCheck, ShieldCheck
} from 'lucide-react';

// Unsplash medical images for the hero slider
const heroImages = [
  'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1920&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&q=80',
  'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1920&q=80',
  'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1920&q=80',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1920&q=80',
];

const HomeAnimated = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countersVisible, setCountersVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ users: 0, doctors: 0, consults: 0, accuracy: 0 });
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const statsRef = useRef(null);

  // Splash screen → landing page transition
  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 2000);
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => setPageLoaded(true), 100);
    }, 2800);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  // Auto-slide background images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Animated counter on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersVisible) {
          setCountersVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersVisible]);

  useEffect(() => {
    if (!countersVisible) return;
    const targets = { users: 10000, doctors: 500, consults: 50000, accuracy: 98 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats({
        users: Math.floor(targets.users * ease),
        doctors: Math.floor(targets.doctors * ease),
        consults: Math.floor(targets.consults * ease),
        accuracy: Math.floor(targets.accuracy * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [countersVisible]);

  const features = [
    { icon: <HeartPulse size={36} />, title: 'AI Diagnostics', desc: 'Multi-disease prediction models for diabetes, heart, liver, kidney & bone fracture', color: '#EF4444' },
    { icon: <Video size={36} />, title: 'Telemedicine', desc: 'Secure HD video consultations with verified specialists anytime', color: '#8B5CF6' },
    { icon: <Brain size={36} />, title: 'Smart Analytics', desc: 'AI-powered health trends, risk scores & personalized insights', color: '#0EA5E9' },
    { icon: <FileText size={36} />, title: 'Report Analysis', desc: 'Upload medical reports for instant AI-powered analysis', color: '#F59E0B' },
    { icon: <ShieldCheck size={36} />, title: 'HIPAA Secure', desc: 'End-to-end encryption with bank-grade data protection', color: '#10B981' },
    { icon: <CalendarCheck size={36} />, title: 'Smart Scheduling', desc: 'AI-optimized appointment booking with real-time availability', color: '#EC4899' },
  ];

  const dashboardCards = [
    { icon: <Activity size={28} />, label: 'Health Score', value: '92/100', trend: '+5%', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
    { icon: <HeartPulse size={28} />, label: 'Heart Rate', value: '72 BPM', trend: 'Normal', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { icon: <Thermometer size={28} />, label: 'Temperature', value: '98.6°F', trend: 'Normal', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    { icon: <BarChart3 size={28} />, label: 'AI Predictions', value: '5 Models', trend: 'Active', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  ];

  const services = [
    { icon: <Heart size={30} />, title: 'Cardiology', desc: 'Heart health monitoring', color: '#EF4444' },
    { icon: <Brain size={30} />, title: 'Neurology', desc: 'Brain & nerve care', color: '#8B5CF6' },
    { icon: <Bone size={30} />, title: 'Orthopedics', desc: 'Bone fracture detection', color: '#F59E0B' },
    { icon: <Eye size={30} />, title: 'General Medicine', desc: 'Complete health checkups', color: '#0EA5E9' },
    { icon: <Stethoscope size={30} />, title: 'Diagnostics', desc: 'AI-assisted diagnosis', color: '#10B981' },
    { icon: <Scan size={30} />, title: 'Radiology', desc: 'X-ray & scan analysis', color: '#EC4899' },
  ];

  const stats = [
    { icon: <Users size={30} />, value: `${animatedStats.users.toLocaleString()}+`, label: 'Active Users' },
    { icon: <Stethoscope size={30} />, value: `${animatedStats.doctors}+`, label: 'Expert Doctors' },
    { icon: <CheckCircle size={30} />, value: `${animatedStats.consults.toLocaleString()}+`, label: 'Consultations' },
    { icon: <Award size={30} />, value: `${animatedStats.accuracy}%`, label: 'Satisfaction' },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* ── Splash Screen ── */}
      {showSplash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(145deg, #1a2f2b 0%, #0d1f1c 40%, #142826 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: splashFading ? 0 : 1,
          transform: splashFading ? 'scale(1.15)' : 'scale(1)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}>
          {/* Background grid pattern */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'linear-gradient(rgba(77,182,172,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(77,182,172,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          {/* Orbiting medical icons */}
          {[
            { Icon: Heart, angle: 0, delay: '0s', color: '#EF4444' },
            { Icon: Brain, angle: 90, delay: '0.3s', color: '#8B5CF6' },
            { Icon: Stethoscope, angle: 180, delay: '0.6s', color: '#0EA5E9' },
            { Icon: Shield, angle: 270, delay: '0.9s', color: '#10B981' },
          ].map(({ Icon, angle, delay, color }, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '320px', height: '320px',
              animation: `orbitSpin 8s linear infinite`,
              animationDelay: delay,
              transform: `rotate(${angle}deg)`
            }}>
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%) rotate(0deg)',
                background: `${color}20`, borderRadius: '50%',
                width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${color}40`,
                animation: `fadeInOut 2s ease-in-out infinite`, animationDelay: delay
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          ))}

          {/* Pulse rings */}
          <div style={{ position: 'absolute', width: '200px', height: '200px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '1.5px solid rgba(77,182,172,0.25)',
                animation: `splashPulseRing 2.5s ease-out infinite`,
                animationDelay: `${i * 0.8}s`
              }} />
            ))}
          </div>

          {/* Logo */}
          <div style={{
            position: 'relative', zIndex: 2,
            animation: 'splashLogoIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{
              width: '110px', height: '110px', borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(77,182,172,0.15) 0%, rgba(77,182,172,0.05) 100%)',
              border: '1px solid rgba(77,182,172,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(77,182,172,0.15), 0 0 30px rgba(77,182,172,0.08)',
              animation: 'splashLogoPulse 2s ease-in-out infinite',
              backdropFilter: 'blur(12px)'
            }}>
              <img src="/logo.png" alt="HealthAI" style={{ width: '72px', height: '72px' }} />
            </div>
          </div>

          {/* Brand name */}
          <div style={{
            marginTop: '28px', textAlign: 'center', position: 'relative', zIndex: 2,
            animation: 'splashTextIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', letterSpacing: '1px' }}>HealthAI</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4DB6AC', letterSpacing: '4px', marginTop: '6px', textTransform: 'uppercase' }}>Smart Healthcare</div>
          </div>

          {/* ECG trace line across bottom */}
          <svg viewBox="0 0 600 60" style={{
            position: 'absolute', bottom: '80px', width: '80%', height: '40px', opacity: 0.35
          }}>
            <polyline fill="none" stroke="#4DB6AC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              points="0,30 60,30 80,30 90,8 95,52 100,30 120,30 180,30 200,30 210,8 215,52 220,30 240,30 300,30 360,30 380,30 390,8 395,52 400,30 420,30 480,30 540,30 560,30 570,8 575,52 580,30 600,30">
              <animate attributeName="stroke-dasharray" from="0,1200" to="1200,0" dur="2.5s" fill="freeze" />
            </polyline>
          </svg>

          {/* Loading dots */}
          <div style={{
            position: 'absolute', bottom: '40px', display: 'flex', gap: '8px',
            animation: 'splashTextIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both'
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%', background: '#4DB6AC',
                animation: 'loadingDot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 20px rgba(77,182,172,0.08)',
        zIndex: 1000, padding: '12px 0'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Health AI Logo" style={{ width: '46px', height: '46px' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2E7D6F', lineHeight: 1 }}>HealthAI</div>
              <div style={{ fontSize: '0.65rem', color: '#4DB6AC', fontWeight: 700, letterSpacing: '1.5px' }}>SMART HEALTHCARE</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            {['Features', 'Dashboard', 'Services', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                style={{ color: '#455A64', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.3s', position: 'relative' }}
                onMouseOver={e => e.target.style.color = '#4DB6AC'}
                onMouseOut={e => e.target.style.color = '#455A64'}>
                {item}
              </a>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#4DB6AC" />
                <span style={{ color: '#4DB6AC', fontWeight: 700, fontSize: '0.9rem' }}>24/7</span>
              </div>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  background: 'linear-gradient(135deg, #4DB6AC 0%, #80CBC4 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '11px 28px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(77,182,172,0.25)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(77,182,172,0.35)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(77,182,172,0.25)'; }}
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/emergency')}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '11px 24px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(239,68,68,0.4)',
                  transition: 'all 0.25s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(239,68,68,0.6)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(239,68,68,0.4)';
                }}
              >
                Emergency
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section with Sliding Background ── */}
      <section id="home" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Sliding Background Images */}
        {heroImages.map((img, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: currentSlide === i ? 0.4 : 0,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: 0
          }} />
        ))}
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(22,48,44,0.55) 0%, rgba(40,110,100,0.40) 50%, rgba(80,160,150,0.32) 100%)',
          zIndex: 1
        }} />
        {/* Slide Indicators */}
        <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 3 }}>
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{
              width: currentSlide === i ? '32px' : '10px', height: '10px',
              borderRadius: '5px', border: 'none', cursor: 'pointer',
              background: currentSlide === i ? '#ffffff' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.4s ease'
            }} />
          ))}
        </div>
        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '140px 20px 100px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', alignItems: 'center' }}>
            <div style={{
              opacity: pageLoaded ? 1 : 0,
              transform: pageLoaded ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                padding: '10px 22px', borderRadius: '50px', marginBottom: '28px',
                border: '1px solid rgba(255,255,255,0.25)',
                animation: pageLoaded ? 'pulseGlow 2s ease-in-out infinite' : 'none'
              }}>
                <HeartPulse size={20} color="#ff6b6b" style={{ animation: pageLoaded ? 'heartbeat 1.2s ease-in-out infinite' : 'none' }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                  AI-Powered Healthcare Platform
                </span>
              </div>

              <h1 style={{
                fontSize: '3.8rem',
                fontWeight: 900,
                lineHeight: 1.12,
                marginBottom: '24px',
                color: '#E2F3FF',
                textShadow: '0 6px 30px rgba(0,0,0,0.7)'
              }}>
                Your Health,{' '}
                <span style={{ color: '#7EE3D8' }}>Intelligently</span>{' '}
                Monitored
              </h1>

              <p style={{ fontSize: '1.25rem', color: '#E5E7EB', marginBottom: '40px', lineHeight: 1.7, fontWeight: 400, maxWidth: '560px' }}>
                Advanced AI diagnostics, real-time doctor consultations, and personalized health monitoring — all in one intelligent platform.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/auth')}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '16px 36px',
                    borderRadius: '50px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 10px 32px rgba(16,185,129,0.55)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 14px 44px rgba(16,185,129,0.8)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 32px rgba(16,185,129,0.55)';
                  }}
                >
                  Get Started <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('services');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      navigate('/services');
                    }
                  }}
                  style={{
                  background: 'transparent', color: 'white',
                  border: '2px solid rgba(255,255,255,0.5)', padding: '16px 36px',
                  borderRadius: '50px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.3s ease', backdropFilter: 'blur(4px)'
                }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}>
                  Explore Services
                </button>
              </div>
            </div>

            {/* Mini Dashboard Preview — Dark Glass */}
            <div style={{
              background: 'rgba(10,20,18,0.82)', backdropFilter: 'blur(24px)',
              borderRadius: '24px', padding: '32px', border: '1px solid rgba(77,182,172,0.35)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              opacity: pageLoaded ? 1 : 0,
              transform: pageLoaded ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.9)',
              transition: 'all 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <MonitorSmartphone size={22} color="#5EEBC2" />
                <span style={{ color: '#E0FAF3', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.3px' }}>Live Health Monitor</span>
                <div style={{ marginLeft: 'auto', width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 14px #4ade80, 0 0 6px #4ade80', animation: 'liveIndicator 1.5s ease-in-out infinite' }} />
              </div>
              {/* Mini ECG Line */}
              <svg viewBox="0 0 300 60" style={{ width: '100%', height: '55px', marginBottom: '20px', filter: 'drop-shadow(0 0 8px rgba(94,235,194,0.6))' }}>
                <polyline fill="none" stroke="#5EEBC2" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                  points="0,30 30,30 40,30 50,8 55,52 60,30 70,30 100,30 130,30 140,30 150,8 155,52 160,30 170,30 200,30 230,30 240,30 250,8 255,52 260,30 270,30 300,30">
                  <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="2s" repeatCount="indefinite" />
                </polyline>
                {/* Glow line underneath */}
                <polyline fill="none" stroke="rgba(94,235,194,0.25)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"
                  points="0,30 30,30 40,30 50,8 55,52 60,30 70,30 100,30 130,30 140,30 150,8 155,52 160,30 170,30 200,30 230,30 240,30 250,8 255,52 260,30 270,30 300,30">
                  <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="2s" repeatCount="indefinite" />
                </polyline>
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {dashboardCards.map((card, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px',
                    border: '1px solid rgba(77,182,172,0.2)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    opacity: pageLoaded ? 1 : 0,
                    transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.9 + i * 0.15}s`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ color: card.color, filter: `drop-shadow(0 0 6px ${card.color}60)` }}>{card.icon}</div>
                      <span style={{ color: 'rgba(224,250,243,0.75)', fontSize: '0.82rem', fontWeight: 700 }}>{card.label}</span>
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 900, textShadow: '0 0 10px rgba(94,235,194,0.15)' }}>{card.value}</div>
                    <div style={{ color: '#5EEBC2', fontSize: '0.78rem', fontWeight: 700, marginTop: '5px' }}>{card.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Overview Section ── */}
      <section id="dashboard" style={{ padding: '100px 20px', background: 'linear-gradient(180deg, #f8fffe 0%, #f0faf8 100%)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(77,182,172,0.1)', padding: '8px 20px', borderRadius: '50px', marginBottom: '16px'
            }}>
              <BarChart3 size={18} color="#4DB6AC" />
              <span style={{ color: '#2E7D6F', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Dashboard Overview</span>
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '16px', color: '#1e293b' }}>
              Your Health at a <span style={{ color: '#4DB6AC' }}>Glance</span>
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              A comprehensive health dashboard with real-time AI insights
            </p>
          </div>

          {/* Dashboard Mock Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '50px' }}>
            {[
              { icon: <HeartPulse size={24} />, label: 'AI Diagnosis', value: '5 Active Models', sub: 'Diabetes • Heart • Liver • Kidney • Bone', color: '#EF4444', bg: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)' },
              { icon: <Video size={24} />, label: 'Live Consultations', value: '24/7 Available', sub: '500+ verified doctors', color: '#8B5CF6', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' },
              { icon: <MonitorSmartphone size={24} />, label: 'Patient Monitoring', value: 'Real-Time', sub: 'Heart rate, vitals & trends', color: '#0EA5E9', bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' },
              { icon: <FileText size={24} />, label: 'Report Analysis', value: 'AI-Powered', sub: 'Upload & get instant analysis', color: '#F59E0B', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' },
            ].map((card, i) => (
              <div key={i} style={{
                background: card.bg, borderRadius: '20px', padding: '28px',
                border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.4s ease', cursor: 'pointer'
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '14px',
                  background: `${card.color}15`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: card.color, marginBottom: '16px'
                }}>
                  {card.icon}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>{card.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>{card.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Full-width dashboard illustration */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5f3 50%, #f0faf8 100%)',
            borderRadius: '24px', padding: '40px', border: '1px solid rgba(77,182,172,0.15)',
            display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
                Intelligent Health Monitoring
              </h3>
              <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '24px', fontSize: '1.05rem' }}>
                Our AI analyzes your health data in real-time, providing predictive insights for diabetes, heart disease, liver conditions, kidney health, and bone fractures — all through a single dashboard.
              </p>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { icon: <Zap size={16} />, text: 'Instant Results' },
                  { icon: <ShieldCheck size={16} />, text: 'HIPAA Compliant' },
                  { icon: <Clock size={16} />, text: '24/7 Available' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4DB6AC', fontWeight: 600, fontSize: '0.9rem' }}>
                    {item.icon} {item.text}
                  </div>
                ))}
              </div>
            </div>
            {/* Circular Progress Ring */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e8f5f3" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#4DB6AC" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 52 * 0.92} ${2 * Math.PI * 52 * 0.08}`}
                    strokeLinecap="round">
                    <animate attributeName="stroke-dasharray"
                      from={`0 ${2 * Math.PI * 52}`}
                      to={`${2 * Math.PI * 52 * 0.92} ${2 * Math.PI * 52 * 0.08}`}
                      dur="2s" fill="freeze" />
                  </circle>
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2E7D6F' }}>92%</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Health Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" style={{ padding: '100px 20px', background: '#ffffff', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(77,182,172,0.1)', padding: '8px 20px', borderRadius: '50px', marginBottom: '16px'
            }}>
              <Zap size={18} color="#4DB6AC" />
              <span style={{ color: '#2E7D6F', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Platform Features</span>
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '16px', color: '#1e293b' }}>
              Advanced <span style={{ color: '#4DB6AC' }}>Healthcare</span> Features
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Cutting-edge medical technology meets compassionate care
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
            {features.map((feature, i) => (
              <div key={i} style={{
                background: 'white', padding: '36px', borderRadius: '20px',
                border: '1px solid #f1f5f9', transition: 'all 0.4s ease', cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(77,182,172,0.12)';
                  e.currentTarget.style.borderColor = '#4DB6AC';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: `${feature.color}12`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: feature.color, marginBottom: '20px'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section ref={statsRef} style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #37474F 0%, #455A64 50%, #546E7A 100%)',
        color: 'white', position: 'relative', zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', textAlign: 'center' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
                borderRadius: '20px', padding: '36px 24px', transition: 'all 0.3s',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center', color: '#80CBC4' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '6px', color: '#B2DFDB' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.95rem', opacity: 0.8, fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section id="services" style={{ padding: '100px 20px', background: '#ffffff', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(77,182,172,0.1)', padding: '8px 20px', borderRadius: '50px', marginBottom: '16px'
            }}>
              <Stethoscope size={18} color="#4DB6AC" />
              <span style={{ color: '#2E7D6F', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Specialties</span>
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '16px', color: '#1e293b' }}>
              Medical <span style={{ color: '#4DB6AC' }}>Specialties</span>
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#64748b' }}>
              Comprehensive care from specialized medical professionals
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {services.map((service, i) => (
              <div key={i} style={{
                background: 'white', padding: '32px', borderRadius: '20px', textAlign: 'center',
                border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = service.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 15px 40px ${service.color}15`; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)'; }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: `${service.color}12`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: service.color, margin: '0 auto 16px'
                }}>
                  {service.icon}
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  {service.title}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section id="about" style={{ padding: '100px 20px', background: 'linear-gradient(180deg, #f8fffe 0%, #f0faf8 100%)', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          background: 'linear-gradient(135deg, #37474F 0%, #455A64 50%, #546E7A 100%)',
          borderRadius: '30px', padding: '70px', textAlign: 'center', color: 'white',
          boxShadow: '0 25px 60px rgba(55,71,79,0.25)', position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(77,182,172,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(77,182,172,0.1)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <HeartPulse size={48} color="#80CBC4" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '2.6rem', fontWeight: 900, marginBottom: '20px' }}>
              Begin Your Health Journey Today
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9, lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 40px' }}>
              Join thousands transforming their healthcare with AI-powered insights and expert consultations
            </p>
            <button onClick={() => navigate('/auth')} style={{
              background: 'linear-gradient(135deg, #4DB6AC 0%, #80CBC4 100%)', color: 'white',
              border: 'none', padding: '18px 48px', borderRadius: '50px', fontSize: '1.15rem',
              fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 30px rgba(77,182,172,0.4)',
              transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: '10px'
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(77,182,172,0.5)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(77,182,172,0.4)'; }}>
              Get Started Now <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#1e293b', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <HeartPulse size={22} color="#4DB6AC" />
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#B2DFDB' }}>HealthAI</span>
          </div>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '12px', maxWidth: '700px', margin: '0 auto 12px' }}>
            <strong>Medical Disclaimer:</strong> This platform provides health assessments for informational purposes only.
            Always consult qualified healthcare professionals for medical decisions.
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
            © 2024 HealthAI Platform. All rights reserved.
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
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.25); }
          56% { transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,107,0); }
          50% { box-shadow: 0 0 20px 4px rgba(255,107,107,0.15); }
        }
        @keyframes liveIndicator {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px #4ade80, 0 0 4px #4ade80; }
          50% { opacity: 0.5; box-shadow: 0 0 4px #4ade80; }
        }
        @keyframes scanLine {
          0% { top: 0; opacity: 0.6; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.6; }
        }
        @keyframes splashPulseRing {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes splashLogoIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splashLogoPulse {
          0%, 100% { box-shadow: 0 0 60px rgba(77,182,172,0.15), 0 0 30px rgba(77,182,172,0.08); }
          50% { box-shadow: 0 0 80px rgba(77,182,172,0.25), 0 0 40px rgba(77,182,172,0.12); }
        }
        @keyframes splashTextIn {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes loadingDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @media (max-width: 1024px) {
          section > div > div {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 768px) {
          section > div > div {
            grid-template-columns: 1fr !important;
          }
          nav > div > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeAnimated;
