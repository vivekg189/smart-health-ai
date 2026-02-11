import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  styled,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { jsPDF } from 'jspdf';

// Styled Components
const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #2196f3, #4caf50)',
    borderTopLeftRadius: theme.shape.borderRadius * 2,
    borderTopRightRadius: theme.shape.borderRadius * 2,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(3),
  fontWeight: 700,
  letterSpacing: 1,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    background: '#f7f9fa',
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  background: '#f7f9fa',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[400],
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: '1.1rem',
  textTransform: 'none',
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textTransform: 'none',
  borderRadius: theme.spacing(2),
}));

const ResultAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(2),
}));

const DiabetesForm = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    glucose: '',
    bmi: '',
    blood_pressure: '',
    age: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.glucose || formData.glucose < 50 || formData.glucose > 300) return 'Please enter a valid glucose level (50-300 mg/dL)';
    if (!formData.bmi || formData.bmi < 10 || formData.bmi > 50) return 'Please enter a valid BMI (10-50)';
    if (!formData.blood_pressure || formData.blood_pressure < 60 || formData.blood_pressure > 200) return 'Please enter a valid blood pressure (60-200 mm Hg)';
    if (!formData.age || formData.age < 0 || formData.age > 120) return 'Please enter a valid age (0-120 years)';
    return null;
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(new Error('Unable to retrieve your location. Please enable location services.'));
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setHospitals([]);
    setLocationError('');

    try {
      // Get location first
      let userLocation;
      try {
        userLocation = await getCurrentLocation();
        setLocation(userLocation);
      } catch (locError) {
        setLocationError(locError.message);
        // Continue without location - hospitals won't be fetched
      }

      const requestData = { ...formData };
      if (userLocation) {
        requestData.latitude = userLocation.latitude;
        requestData.longitude = userLocation.longitude;
      }

      const response = await fetch('http://localhost:5000/api/predict/diabetes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get prediction');
      }

      setResult(data);
      if (data.hospitals) {
        setHospitals(data.hospitals);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (probability) => {
    if (probability < 0.33) return 'Low Risk';
    if (probability < 0.66) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <Fade in timeout={500}>
      <FormContainer>
        <FormTitle variant="h4" gutterBottom>
          Diabetes Risk Assessment
        </FormTitle>
        <Typography variant="body1" color="text.secondary" paragraph>
          Enter your health parameters below to get a prediction
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Glucose (mg/dL)"
                name="glucose"
                type="number"
                value={formData.glucose}
                onChange={handleChange}
                inputProps={{ min: 50, max: 300, step: "1" }}
                helperText="Blood glucose concentration"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="BMI"
                name="bmi"
                type="number"
                value={formData.bmi}
                onChange={handleChange}
                inputProps={{ min: 10, max: 50, step: "0.1" }}
                helperText="Body Mass Index"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Blood Pressure (mm Hg)"
                name="blood_pressure"
                type="number"
                value={formData.blood_pressure}
                onChange={handleChange}
                inputProps={{ min: 60, max: 200, step: "1" }}
                helperText="Diastolic blood pressure"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Age (years)"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 0, max: 120, step: "1" }}
                helperText="Age in years"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <SubmitButton
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict'}
            </SubmitButton>

            {error && (
              <Slide direction="up" in={!!error}>
                <ResultAlert severity="error" sx={{ width: '100%' }}>
                  {error}
                </ResultAlert>
              </Slide>
            )}

            {locationError && (
              <Slide direction="up" in={!!locationError}>
                <ResultAlert severity="warning" sx={{ width: '100%', mt: 1 }}>
                  {locationError} Hospital recommendations will not be available.
                </ResultAlert>
              </Slide>
            )}

            {result && (
              <Fade in timeout={500}>
                <Box sx={{ width: '100%' }}>
                  <ResultAlert
                    severity={result.risk_level === "High Risk" ? "error" : "success"}
                    sx={{
                      backgroundColor: result.risk_level === "Low Risk" ? '#d4edda' : '#f8d7da',
                      color: '#000',
                      '& .MuiAlert-icon': {
                        color: result.risk_level === "Low Risk" ? '#155724' : '#721c24',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'black', mb: 1 }}>
                      {result.message}
                    </Typography>
                    <Typography sx={{ color: 'black', mb: 0.5 }}>
                      Risk Level: {result.risk_level}
                    </Typography>
                    <Typography sx={{ color: 'black' }}>
                      Probability: {(result.probability * 100).toFixed(2)}%
                    </Typography>
                    {result.disclaimer && (
                      <Typography sx={{ color: 'black', fontSize: '0.8rem', mt: 1, fontStyle: 'italic' }}>
                        {result.disclaimer}
                      </Typography>
                    )}
                  </ResultAlert>

                  <DownloadButton
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const doc = new jsPDF();
                      doc.setFontSize(16);
                      doc.text('Diabetes Risk Assessment Results', 20, 20);
                      
                      doc.setFontSize(12);
                      let yPosition = 40;
                      
                      // Add form data
                      doc.text('Input Parameters:', 20, yPosition);
                      yPosition += 10;
                      doc.text(`Glucose: ${formData.glucose} mg/dL`, 30, yPosition);
                      yPosition += 10;
                      doc.text(`BMI: ${formData.bmi}`, 30, yPosition);
                      yPosition += 10;
                      doc.text(`Blood Pressure: ${formData.blood_pressure} mm Hg`, 30, yPosition);
                      yPosition += 10;
                      doc.text(`Age: ${formData.age} years`, 30, yPosition);
                      yPosition += 10;

                      yPosition += 10;
                      // Add results
                      doc.text('Results:', 20, yPosition);
                      yPosition += 10;
                      doc.text(`Prediction: ${result.message}`, 30, yPosition);
                      yPosition += 10;
                      doc.text(`Risk Level: ${result.risk_level}`, 30, yPosition);
                      yPosition += 10;
                      doc.text(`Probability: ${(result.probability * 100).toFixed(2)}%`, 30, yPosition);
                      
                      yPosition += 20;
                      doc.setFontSize(10);
                      doc.text('Note: This is a prediction model, not a definitive diagnosis. Please consult healthcare professionals for proper medical advice.', 20, yPosition, { maxWidth: 170 });
                      
                      doc.save(`diabetes_prediction_${new Date().toISOString().split('T')[0]}.pdf`);
                    }}
                    sx={{ mt: 2, minWidth: 200 }}
                  >
                    Download Results
                  </DownloadButton>

                  {hospitals.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#e53e3e' }}>
                        Recommended Healthcare Facilities for Diabetes Care:
                      </Typography>
                      {hospitals.map((hospital, index) => (
                        <Card key={index} sx={{ mb: 2, border: '1px solid #fed7d7', backgroundColor: '#fff5f5' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                {hospital.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {hospital.distance} • {hospital.address}
                              </Typography>
                              <Typography variant="caption" sx={{
                                backgroundColor: hospital.type === 'Government' ? '#e6fffa' : '#f0fff4',
                                color: hospital.type === 'Government' ? '#2c7a7b' : '#2f855a',
                                px: 1, py: 0.5, borderRadius: 1, mr: 1
                              }}>
                                {hospital.type}
                              </Typography>
                              {hospital.specialties && (
                                <Box sx={{ mt: 1, mb: 1 }}>
                                  {hospital.specialties.map(spec => (
                                    <Chip
                                      key={spec}
                                      label={spec}
                                      size="small"
                                      variant="outlined"
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))}
                                </Box>
                              )}
                              {hospital.recommendation_reason && (
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#4a5568', mt: 1 }}>
                                  💡 {hospital.recommendation_reason}
                                </Typography>
                              )}
                              {location && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  component="a"
                                  href={`https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${hospital.latitude},${hospital.longitude}&travelmode=driving`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ mt: 1, fontSize: '0.75rem', minWidth: '120px', padding: '4px 8px', whiteSpace: 'nowrap' }}
                                >
                                  🗺️ Get Directions
                                </Button>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      </FormContainer>
    </Fade>
  );
};

export default DiabetesForm; 