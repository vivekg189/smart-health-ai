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
import { generateMedicalReport } from '../utils/reportGenerator';

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
  const [userProfile, setUserProfile] = useState(null);

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          console.log('User Profile Data:', data);
          setUserProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchUserProfile();
  }, []);

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
                  {/* Structured hospital-style report */}
                  {(() => {
                    const probPercent = (result.probability * 100).toFixed(1);
                    const riskLower = (result.risk_level || '').toLowerCase();
                    const riskCategory =
                      riskLower.includes('high') ? 'high' :
                      riskLower.includes('moderate') ? 'moderate' : 'low';

                    const factorsByRisk = {
                      high: [
                        'Elevated glucose levels',
                        'Body Mass Index in overweight/obese range',
                        'Blood pressure above normal range'
                      ],
                      moderate: [
                        'Borderline glucose levels',
                        'Slightly elevated BMI',
                        'Early changes in blood pressure'
                      ],
                      low: [
                        'Glucose levels within normal range',
                        'BMI in a healthy range',
                        'Blood pressure within target range'
                      ]
                    };

                    const recommendationsByRisk = {
                      high: [
                        'Monitor blood glucose daily and maintain a log',
                        'Shift to a low-sugar, low-refined-carbohydrate diet',
                        'Engage in at least 30 minutes of moderate exercise daily',
                        'Consult an endocrinologist within the next 2–4 weeks'
                      ],
                      moderate: [
                        'Reduce intake of sugary drinks and refined carbohydrates',
                        'Increase weekly physical activity (150 minutes/week target)',
                        'Schedule a routine check-up with your primary care physician'
                      ],
                      low: [
                        'Maintain a balanced diet with complex carbohydrates and fiber',
                        'Continue regular exercise and annual health screening'
                      ]
                    };

                    const mealPlansByRisk = {
                      high: [
                        'Breakfast: Oatmeal with berries (unsweetened), boiled egg',
                        'Lunch: Grilled chicken salad, whole grain bread',
                        'Dinner: Baked fish, steamed vegetables, quinoa',
                        'Snacks: Nuts, Greek yogurt (unsweetened), fresh fruits'
                      ],
                      moderate: [
                        'Breakfast: Whole grain toast with avocado',
                        'Lunch: Vegetable soup with brown rice',
                        'Dinner: Lean protein with mixed vegetables',
                        'Snacks: Roasted chickpeas, fruit in moderation'
                      ],
                      low: [
                        'Continue balanced meals with complex carbohydrates and vegetables',
                        'Limit processed foods and sugary snacks'
                      ]
                    };

                    const factors = factorsByRisk[riskCategory] || [];
                    const recs = recommendationsByRisk[riskCategory] || [];
                    const meals = mealPlansByRisk[riskCategory] || [];

                    return (
                      <Paper
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          border: '1px solid #e5e7eb',
                          overflow: 'hidden',
                          mb: 3,
                          bgcolor: '#ffffff'
                        }}
                      >
                        {/* Header */}
                        <Box
                          sx={{
                            px: 3,
                            py: 2,
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: '#f5f5f5'
                          }}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight={800}>
                              HealthAI Smart Healthcare System
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              AI-Assisted Diabetes Risk Assessment Report
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', fontSize: '0.8rem', color: 'text.secondary' }}>
                            <Typography>Date: {new Date().toLocaleDateString()}</Typography>
                            <Typography>
                              ID: {`RPT-${Date.now().toString(36).toUpperCase()}`}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ p: 3 }}>
                          {/* Patient information */}
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, mb: 1, letterSpacing: 0.08 }}
                          >
                            PATIENT INFORMATION
                          </Typography>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2">
                                <strong>Name:</strong> {userProfile?.name || 'Not Provided'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2">
                                <strong>Age:</strong> {formData.age || 'Not Provided'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2">
                                <strong>Gender:</strong> {userProfile?.gender || 'Not Provided'}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Key clinical parameters */}
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, mb: 1, letterSpacing: 0.08 }}
                          >
                            KEY CLINICAL PARAMETERS
                          </Typography>
                          <Grid container spacing={1.2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                Glucose Level: <strong>{formData.glucose}</strong> mg/dL
                              </Typography>
                              <Typography variant="body2">
                                BMI: <strong>{formData.bmi}</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                Blood Pressure: <strong>{formData.blood_pressure}</strong> mm Hg
                              </Typography>
                              <Typography variant="body2">
                                Age: <strong>{formData.age}</strong> years
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Risk assessment band */}
                          <Box
                            sx={{
                              borderRadius: 1.5,
                              bgcolor:
                                riskCategory === 'high'
                                  ? '#b91c1c'
                                  : riskCategory === 'moderate'
                                  ? '#d97706'
                                  : '#15803d',
                              color: 'white',
                              px: 2.5,
                              py: 1.5,
                              mb: 3,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                RISK ASSESSMENT
                              </Typography>
                              <Typography variant="body2">
                                Assessment: <strong>{result.risk_level}</strong>
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              Confidence: {probPercent}%
                            </Typography>
                          </Box>

                          {/* Key contributing factors */}
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, mb: 0.5, letterSpacing: 0.08 }}
                          >
                            KEY CONTRIBUTING FACTORS
                          </Typography>
                          <Box component="ul" sx={{ mt: 0, mb: 2, pl: 3 }}>
                            {factors.map((item) => (
                              <li key={item}>
                                <Typography variant="body2">{item}</Typography>
                              </li>
                            ))}
                          </Box>

                          {/* Personalized recommendations */}
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, mb: 0.5, letterSpacing: 0.08 }}
                          >
                            PERSONALIZED RECOMMENDATIONS
                          </Typography>
                          <Box component="ul" sx={{ mt: 0, mb: 2, pl: 3 }}>
                            {recs.map((item) => (
                              <li key={item}>
                                <Typography variant="body2">{item}</Typography>
                              </li>
                            ))}
                          </Box>

                          {/* Recommended meal plan */}
                          {meals.length > 0 && (
                            <>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, mb: 0.5, letterSpacing: 0.08 }}
                              >
                                RECOMMENDED MEAL PLAN
                              </Typography>
                              <Box component="ul" sx={{ mt: 0, mb: 2, pl: 3 }}>
                                {meals.map((item) => (
                                  <li key={item}>
                                    <Typography variant="body2">{item}</Typography>
                                  </li>
                                ))}
                              </Box>
                            </>
                          )}

                          {result.disclaimer && (
                            <Typography
                              sx={{
                                mt: 2,
                                fontSize: '0.8rem',
                                fontStyle: 'italic',
                                color: 'text.secondary'
                              }}
                            >
                              {result.disclaimer}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    );
                  })()}

                  <DownloadButton
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => generateMedicalReport('diabetes', formData, result)}
                    sx={{ mt: 1.5, minWidth: 200 }}
                  >
                    Download Medical Report (PDF)
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