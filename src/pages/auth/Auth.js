import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Stethoscope, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState('login'); // login, signup, forgot, reset
  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [resetEmail, setResetEmail] = useState(''); // Store email for reset
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    doctorId: '',
    gender: '',
    specialization: '',
    customSpecialization: ''
  });
  
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const validate = () => {
    const newErrors = {};
    
    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (mode === 'signup' && role === 'doctor' && !formData.doctorId.trim()) {
      newErrors.doctorId = 'Doctor ID is required';
    }
    
    if (mode === 'signup' && role === 'doctor' && !formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (mode !== 'reset' && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (mode !== 'reset' && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (mode !== 'forgot' && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode !== 'forgot' && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if ((mode === 'signup' || mode === 'reset') && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (mode === 'signup' && role === 'doctor') {
      if (!formData.specialization) {
        newErrors.specialization = 'Specialization is required';
      } else if (formData.specialization === 'Other' && !formData.customSpecialization.trim()) {
        newErrors.customSpecialization = 'Please enter your specialization';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      if (mode === 'forgot') {
        // Forgot password - verify email
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });

        const data = await response.json();

        if (response.ok) {
          setResetEmail(formData.email);
          setMode('reset');
          setFormData({ ...formData, password: '', confirmPassword: '' });
        } else {
          setErrors({ submit: data.error || 'Email not found' });
        }
      } else if (mode === 'reset') {
        // Reset password
        const response = await fetch('http://localhost:5000/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail, password: formData.password })
        });

        const data = await response.json();

        if (response.ok) {
          // Update localStorage
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.email === resetEmail);
          if (userIndex !== -1) {
            users[userIndex].password = formData.password;
            localStorage.setItem('users', JSON.stringify(users));
          }
          
          setSuccess('Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            setMode('login');
            setFormData({ name: '', email: '', password: '', confirmPassword: '', doctorId: '', gender: '', specialization: '', customSpecialization: '' });
            setResetEmail('');
          }, 2000);
        } else {
          setErrors({ submit: data.error || 'Failed to reset password' });
        }
      } else {
        // Login or Signup
        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
        const payload = mode === 'login' 
          ? { email: formData.email, password: formData.password, doctorId: formData.doctorId }
          : { 
              name: formData.name, 
              email: formData.email, 
              password: formData.password, 
              role: role,
              doctorId: role === 'doctor' ? formData.doctorId : null,
              gender: role === 'doctor' ? formData.gender : null,
              specialization: role === 'doctor' ? (formData.specialization === 'Other' ? formData.customSpecialization : formData.specialization) : null
            };

        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          if (mode === 'signup' && data.error && data.error.includes('already exists')) {
            setErrors({ submit: 'Email already registered. Please login or use a different email.' });
          } else {
            setErrors({ submit: data.error || 'Authentication failed' });
          }
          return;
        }

        login(data.user);

        if (data.user.role === 'patient') {
          navigate('/patient-dashboard');
        } else {
          navigate('/doctor-dashboard');
        }
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return '#f44336';
    if (passwordStrength <= 3) return '#ff9800';
    return '#4caf50';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <>
    <style>{`
      @keyframes fadeInScale {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-50px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(50px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `}</style>
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e0e5ec 0%, #f5f7fa 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      {/* Container Box */}
      <div style={{
        display: 'flex',
        maxWidth: '1200px',
        width: '100%',
        minHeight: '700px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '40px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {(mode === 'login' || mode === 'signup') && (
          <div 
            key={mode}
            style={{
            flex: 1,
            backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            order: mode === 'login' ? 0 : 1,
            animation: mode === 'login' ? 'slideInLeft 0.8s ease-out' : 'slideInRight 0.8s ease-out'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.92), rgba(52, 73, 94, 0.92))'
            }} />
            <div style={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              color: 'white',
              padding: '50px 40px'
            }}>
              <div style={{
                width: '110px',
                height: '110px',
                margin: '0 auto 30px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
              }}>
                <img src="/logo.png" alt="HealthAI" style={{ width: '70px', height: '70px' }} />
              </div>
              <h1 style={{ 
                fontSize: '2.8rem', 
                fontWeight: 900, 
                marginBottom: '20px', 
                textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                letterSpacing: '-1px'
              }}>
                {mode === 'login' ? 'Welcome Back' : 'Join Us Today'}
              </h1>
              <div style={{
                width: '60px',
                height: '4px',
                background: 'linear-gradient(90deg, #4A90E2, #50C9C3)',
                margin: '0 auto 20px',
                borderRadius: '2px'
              }} />
              <h2 style={{ 
                fontSize: '1.6rem', 
                fontWeight: 600, 
                marginBottom: '15px',
                color: 'rgba(255, 255, 255, 0.95)'
              }}>
                {mode === 'login' 
                  ? (role === 'patient' ? 'Patient Portal' : 'Doctor Portal')
                  : (role === 'patient' ? 'Patient Registration' : 'Doctor Registration')}
              </h2>
              <p style={{ 
                fontSize: '1.05rem', 
                opacity: 0.9, 
                maxWidth: '420px', 
                margin: '0 auto', 
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.85)'
              }}>
                {mode === 'login'
                  ? (role === 'patient' 
                    ? 'Access your health records, AI predictions, and personalized care recommendations'
                    : 'Manage your patients, appointments, and provide expert medical consultations')
                  : (role === 'patient'
                    ? 'Start your journey to better health with AI-powered insights and personalized care'
                    : 'Join our network of healthcare professionals and make a difference')}
              </p>
              <div style={{
                marginTop: '35px',
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                flexWrap: 'wrap'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4A90E2' }}>24/7</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Support</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#50C9C3' }}>AI</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Powered</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4A90E2' }}>100%</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Secure</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Section - Right for Login, Left for Signup */}
        <div 
          key={`form-${mode}`}
          style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px',
          order: mode === 'login' ? 1 : 0,
          animation: mode === 'login' ? 'slideInRight 0.8s ease-out' : 'slideInLeft 0.8s ease-out'
        }}>
        <div style={{
          background: 'transparent',
          padding: '0',
          maxWidth: '450px',
          width: '100%'
        }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', animation: 'slideDown 0.6s ease-out' }}>
          <div style={{
            width: '90px',
            height: '90px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px'
          }}>
            <img src="/logo.png" alt="HealthAI" style={{ width: '60px', height: '60px' }} />
          </div>
          <h2 style={{ 
            fontWeight: 800, 
            color: '#2c3e50',
            fontSize: '1.9rem',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '0.95rem', marginTop: '8px', fontWeight: 500 }}>
            {mode === 'login' ? 'Sign in to continue to HealthAI' : mode === 'signup' ? 'Join our healthcare platform' : mode === 'forgot' ? 'Enter your email to reset password' : 'Enter your new password'}
          </p>
        </div>

        {mode !== 'forgot' && mode !== 'reset' && (
          <div style={{ 
            display: 'flex', 
            gap: '0', 
            marginBottom: '30px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '8px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideUp 0.6s ease-out 0.1s both'
          }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background: mode === 'login' ? 'linear-gradient(145deg, #4A90E2, #50C9C3)' : 'rgba(255, 255, 255, 0.05)',
                color: mode === 'login' ? 'white' : '#546e7a',
                boxShadow: mode === 'login' ? '0 4px 15px rgba(74, 144, 226, 0.3)' : 'none',
                transform: mode === 'login' ? 'scale(1.02)' : 'scale(0.98)'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background: mode === 'signup' ? 'linear-gradient(145deg, #4A90E2, #50C9C3)' : 'rgba(255, 255, 255, 0.05)',
                color: mode === 'signup' ? 'white' : '#546e7a',
                boxShadow: mode === 'signup' ? '0 4px 15px rgba(74, 144, 226, 0.3)' : 'none',
                transform: mode === 'signup' ? 'scale(1.02)' : 'scale(0.98)'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <Alert variant="success" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <CheckCircle size={20} />
            {success}
          </Alert>
        )}

        {/* Error Message */}
        {errors.submit && (
          <Alert variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <AlertCircle size={20} />
            {errors.submit}
          </Alert>
        )}

        {mode === 'signup' && (
          <div style={{ marginBottom: '25px', animation: 'slideUp 0.5s ease-out' }}>
            <label style={{ fontWeight: 700, color: '#2c3e50', marginBottom: '12px', display: 'block', fontSize: '0.9rem' }}>I am a:</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ 
                flex: 1, 
                padding: '14px', 
                background: '#e0e5ec',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600,
                color: role === 'patient' ? 'white' : '#546e7a',
                transition: 'all 0.3s ease',
                boxShadow: role === 'patient' ? 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff' : '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
                background: role === 'patient' ? 'linear-gradient(145deg, #4A90E2, #50C9C3)' : '#e0e5ec'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={role === 'patient'}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ display: 'none' }}
                />
                Patient
              </label>
              <label style={{ 
                flex: 1, 
                padding: '14px', 
                background: '#e0e5ec',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600,
                color: role === 'doctor' ? 'white' : '#546e7a',
                transition: 'all 0.3s ease',
                boxShadow: role === 'doctor' ? 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff' : '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
                background: role === 'doctor' ? 'linear-gradient(145deg, #4A90E2, #50C9C3)' : '#e0e5ec'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === 'doctor'}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ display: 'none' }}
                />
                Doctor
              </label>
            </div>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <Form.Group style={{ marginBottom: '20px', animation: 'slideUp 0.5s ease-out' }}>
              <Form.Label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Full Name *</Form.Label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#4A90E2', zIndex: 1 }} />
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                  placeholder="Enter your full name"
                  style={{
                    paddingLeft: '50px',
                    padding: '16px 16px 16px 50px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#e0e5ec',
                    boxShadow: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
                    fontSize: '1rem',
                    color: '#2c3e50',
                    fontWeight: 500
                  }}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </div>
            </Form.Group>
          )}

          {mode === 'signup' && role === 'doctor' && (
            <Form.Group style={{ marginBottom: '20px', animation: 'slideUp 0.5s ease-out' }}>
              <Form.Label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Doctor ID *</Form.Label>
              <div style={{ position: 'relative' }}>
                <Stethoscope size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#4A90E2', zIndex: 1 }} />
                <Form.Control
                  type="text"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  isInvalid={!!errors.doctorId}
                  placeholder="Enter your medical license ID"
                  style={{
                    paddingLeft: '50px',
                    padding: '16px 16px 16px 50px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#e0e5ec',
                    boxShadow: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
                    fontSize: '1rem',
                    color: '#2c3e50',
                    fontWeight: 500
                  }}
                />
                <Form.Control.Feedback type="invalid">{errors.doctorId}</Form.Control.Feedback>
              </div>
            </Form.Group>
          )}

          {mode === 'signup' && role === 'doctor' && (
            <Form.Group style={{ marginBottom: '20px', animation: 'slideUp 0.5s ease-out' }}>
              <Form.Label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Gender *</Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                isInvalid={!!errors.gender}
                style={{
                  padding: '16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: '#e0e5ec',
                  boxShadow: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
                  fontSize: '1rem',
                  color: '#2c3e50',
                  fontWeight: 500
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
            </Form.Group>
          )}

          {mode !== 'reset' && (
          <Form.Group style={{ marginBottom: '20px', animation: 'slideUp 0.5s ease-out' }}>
            <Form.Label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Email Address *</Form.Label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#4A90E2', zIndex: 1 }} />
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="Enter your email"
                style={{
                  paddingLeft: '50px',
                  padding: '16px 16px 16px 50px',
                  borderRadius: '20px',
                  border: 'none',
                  background: '#e0e5ec',
                  boxShadow: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
                  fontSize: '1rem',
                  color: '#2c3e50',
                  fontWeight: 500
                }}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </div>
          </Form.Group>
          )}

          {mode !== 'forgot' && (
            <Form.Group style={{ marginBottom: '20px', animation: 'slideUp 0.5s ease-out' }}>
              <Form.Label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Password *</Form.Label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#4A90E2', zIndex: 1 }} />
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder="Enter your password"
                  style={{
                    paddingLeft: '50px',
                    paddingRight: '50px',
                    padding: '16px 50px 16px 50px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#e0e5ec',
                    boxShadow: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
                    fontSize: '1rem',
                    color: '#2c3e50',
                    fontWeight: 500
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4A90E2',
                    zIndex: 1
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </div>
              {mode === 'signup' && formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: '4px',
                          borderRadius: '2px',
                          background: level <= passwordStrength ? getPasswordStrengthColor() : '#e0e0e0',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: getPasswordStrengthColor(), fontWeight: 600 }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
              )}
            </Form.Group>
          )}

          {(mode === 'signup' || mode === 'reset') && (
            <Form.Group style={{ marginBottom: '20px', animation: 'slideUp 0.5s ease-out' }}>
              <Form.Label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Confirm Password *</Form.Label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#4A90E2', zIndex: 1 }} />
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.confirmPassword}
                  placeholder="Confirm your password"
                  style={{
                    paddingLeft: '50px',
                    padding: '16px 16px 16px 50px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#e0e5ec',
                    boxShadow: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
                    fontSize: '1rem',
                    color: '#2c3e50',
                    fontWeight: 500
                  }}
                />
                <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
              </div>
            </Form.Group>
          )}

          {mode === 'signup' && role === 'doctor' && (
            <>
              <Form.Group style={{ marginBottom: '20px', animation: 'slideUp 0.5s ease-out' }}>
                <Form.Label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Specialization *</Form.Label>
                <Form.Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  isInvalid={!!errors.specialization}
                  style={{
                    padding: '16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#e0e5ec',
                    boxShadow: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
                    fontSize: '1rem',
                    color: '#2c3e50',
                    fontWeight: 500
                  }}
                >
                  <option value="">Select Specialization</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.specialization}</Form.Control.Feedback>
              </Form.Group>

              {formData.specialization === 'Other' && (
                <Form.Group style={{ marginBottom: '20px', animation: 'slideUp 0.5s ease-out' }}>
                  <Form.Label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Enter Specialization *</Form.Label>
                  <Form.Control
                    type="text"
                    name="customSpecialization"
                    value={formData.customSpecialization}
                    onChange={handleChange}
                    isInvalid={!!errors.customSpecialization}
                    placeholder="Enter your specialization"
                    style={{
                      padding: '16px',
                      borderRadius: '20px',
                      border: 'none',
                      background: '#e0e5ec',
                      boxShadow: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
                      fontSize: '1rem',
                      color: '#2c3e50',
                      fontWeight: 500
                    }}
                  />
                  <Form.Control.Feedback type="invalid">{errors.customSpecialization}</Form.Control.Feedback>
                </Form.Group>
              )}
            </>
          )}

          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', animation: 'slideUp 0.5s ease-out' }}>
              <Form.Check
                type="checkbox"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ color: '#2c3e50', fontWeight: 500 }}
              />
              <button
                type="button"
                onClick={() => setMode('forgot')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4A90E2',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '18px',
              borderRadius: '50px', 
              background: loading ? '#ccc' : 'linear-gradient(145deg, #4A90E2, #50C9C3)', 
              border: 'none',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 800,
              marginTop: '10px',
              boxShadow: loading ? 'none' : '8px 8px 16px #bebebe, -8px -8px 16px #ffffff',
              transition: 'all 0.3s ease',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              animation: 'slideUp 0.6s ease-out 0.2s both'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" />
                Processing...
              </>
            ) : (
              mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Verify Email' : 'Reset Password'
            )}
          </Button>

          {(mode === 'forgot' || mode === 'reset') && (
            <div style={{ textAlign: 'center', marginTop: '20px', animation: 'slideUp 0.6s ease-out 0.3s both' }}>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4A90E2',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Back to Login
              </button>
            </div>
          )}
        </Form>

        {mode === 'signup' && (
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#7f8c8d', marginTop: '20px', animation: 'slideUp 0.6s ease-out 0.4s both' }}>
            By signing up, you agree to our{' '}
            <a href="/terms" style={{ color: '#4A90E2', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: '#4A90E2', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
          </p>
        )}
        </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Auth;
