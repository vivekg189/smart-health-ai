import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    doctorId: '',
    gender: '',
    specialization: '',
    customSpecialization: ''
  });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!isLogin && !formData.name) newErrors.name = 'Name is required';
    if (!isLogin && role === 'doctor' && !formData.doctorId) newErrors.doctorId = 'Doctor ID is required';
    if (!isLogin && role === 'doctor' && !formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!isLogin && role === 'doctor') {
      if (!formData.specialization) {
        newErrors.specialization = 'Specialization is required';
      } else if (formData.specialization === 'Other' && !formData.customSpecialization) {
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

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
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
        setErrors({ submit: data.error || 'Authentication failed' });
        return;
      }

      login(data.user);

      if (data.user.role === 'patient') {
        navigate('/patient-dashboard');
      } else {
        navigate('/doctor-dashboard');
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card style={{ borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <Card.Body className="p-5">
                <h2 className="text-center mb-4 fw-bold" style={{ color: '#333' }}>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                <Nav variant="pills" className="justify-content-center mb-4">
                  <Nav.Item>
                    <Nav.Link active={isLogin} onClick={() => setIsLogin(true)} style={{ borderRadius: '50px' }}>
                      Login
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link active={!isLogin} onClick={() => setIsLogin(false)} style={{ borderRadius: '50px' }}>
                      Signup
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                {!isLogin && (
                  <div className="mb-4">
                    <Form.Label className="fw-bold">I am a:</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        label="Patient"
                        name="role"
                        value="patient"
                        checked={role === 'patient'}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <Form.Check
                        type="radio"
                        label="Doctor"
                        name="role"
                        value="doctor"
                        checked={role === 'doctor'}
                        onChange={(e) => setRole(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                        placeholder="Enter your name"
                      />
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                  )}

                  {!isLogin && role === 'doctor' && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Doctor ID</Form.Label>
                        <Form.Control
                          type="text"
                          name="doctorId"
                          value={formData.doctorId}
                          onChange={handleChange}
                          isInvalid={!!errors.doctorId}
                          placeholder="Enter your doctor ID"
                        />
                        <Form.Control.Feedback type="invalid">{errors.doctorId}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          isInvalid={!!errors.gender}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                      </Form.Group>
                    </>
                  )}

                  {isLogin && role === 'doctor' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Doctor ID (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleChange}
                        placeholder="Enter doctor ID or leave blank to use email"
                      />
                      <Form.Text className="text-muted">You can login with either email or doctor ID</Form.Text>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      placeholder="Enter your email"
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      placeholder="Enter your password"
                    />
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </Form.Group>

                  {!isLogin && role === 'doctor' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Specialization</Form.Label>
                      <Form.Select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        isInvalid={!!errors.specialization}
                      >
                        <option value="">Select Specialization</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Endocrinologist">Endocrinologist</option>
                        <option value="Gastroenterologist">Gastroenterologist</option>
                        <option value="General Physician">General Physician</option>
                        <option value="Gynecologist">Gynecologist</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Oncologist">Oncologist</option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Psychiatrist">Psychiatrist</option>
                        <option value="Radiologist">Radiologist</option>
                        <option value="Surgeon">Surgeon</option>
                        <option value="Urologist">Urologist</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.specialization}</Form.Control.Feedback>
                    </Form.Group>
                  )}

                  {!isLogin && role === 'doctor' && formData.specialization === 'Other' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Enter Your Specialization</Form.Label>
                      <Form.Control
                        type="text"
                        name="customSpecialization"
                        value={formData.customSpecialization}
                        onChange={handleChange}
                        isInvalid={!!errors.customSpecialization}
                        placeholder="Enter your specialization"
                      />
                      <Form.Control.Feedback type="invalid">{errors.customSpecialization}</Form.Control.Feedback>
                    </Form.Group>
                  )}

                  <Button
                    type="submit"
                    className="w-100 py-3 fw-bold"
                    style={{ borderRadius: '50px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                  >
                    {isLogin ? 'Login' : 'Sign Up'}
                  </Button>

                  {errors.submit && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {errors.submit}
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auth;
