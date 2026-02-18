import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  CircularProgress,
  Fade,
  TextField,
  Select,
  Button,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import { generateMedicalReport } from '../utils/reportGenerator';

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
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root:hover fieldset': {
    borderColor: '#2196f3',
  },
});

const HeartForm = () => {
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: '',
    ap_hi: '',
    ap_lo: '',
    cholesterol: '',
    gluc: '',
    smoke: '',
    alco: '',
    active: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/predict/heart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          gender: parseInt(formData.gender),
          ap_hi: parseInt(formData.ap_hi),
          ap_lo: parseInt(formData.ap_lo),
          cholesterol: parseInt(formData.cholesterol),
          gluc: parseInt(formData.gluc),
          smoke: parseInt(formData.smoke),
          alco: parseInt(formData.alco),
          active: parseInt(formData.active),
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Prediction failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={500}>
      <FormContainer>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Cardiovascular Disease Prediction
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Enter your health parameters for cardiovascular risk assessment
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Age (years)"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 1, max: 120 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                inputProps={{ min: 50, max: 250 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                inputProps={{ min: 20, max: 300 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                  <MenuItem value="1">Female</MenuItem>
                  <MenuItem value="2">Male</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Systolic BP (ap_hi)"
                name="ap_hi"
                type="number"
                value={formData.ap_hi}
                onChange={handleChange}
                helperText="Upper blood pressure reading"
                inputProps={{ min: 60, max: 250 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Diastolic BP (ap_lo)"
                name="ap_lo"
                type="number"
                value={formData.ap_lo}
                onChange={handleChange}
                helperText="Lower blood pressure reading"
                inputProps={{ min: 40, max: 150 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Cholesterol</InputLabel>
                <Select name="cholesterol" value={formData.cholesterol} onChange={handleChange} label="Cholesterol">
                  <MenuItem value="1">Normal</MenuItem>
                  <MenuItem value="2">Above Normal</MenuItem>
                  <MenuItem value="3">Well Above Normal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Glucose</InputLabel>
                <Select name="gluc" value={formData.gluc} onChange={handleChange} label="Glucose">
                  <MenuItem value="1">Normal</MenuItem>
                  <MenuItem value="2">Above Normal</MenuItem>
                  <MenuItem value="3">Well Above Normal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Smoking</InputLabel>
                <Select name="smoke" value={formData.smoke} onChange={handleChange} label="Smoking">
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Alcohol</InputLabel>
                <Select name="alco" value={formData.alco} onChange={handleChange} label="Alcohol">
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Physical Activity</InputLabel>
                <Select name="active" value={formData.active} onChange={handleChange} label="Physical Activity">
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ minWidth: 200, bgcolor: '#2196f3' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
            )}

            {result && (
              <Fade in timeout={500}>
                <Box sx={{ width: '100%' }}>
                  <Alert severity={result.prediction === 1 ? "error" : "success"} sx={{ width: '100%' }}>
                    <Typography variant="h6">{result.message}</Typography>
                    <Typography>Risk Level: {result.risk_level}</Typography>
                    <Typography>Probability: {(result.probability * 100).toFixed(2)}%</Typography>
                  </Alert>

                  {result.hospitals && result.hospitals.length > 0 && (
                    <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
                      <Typography variant="h6" gutterBottom>Recommended Hospitals Nearby:</Typography>
                      {result.hospitals.map((hospital, idx) => (
                        <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < result.hospitals.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                          <Typography variant="subtitle1" fontWeight={600}>{hospital.name}</Typography>
                          <Typography variant="body2">Distance: {hospital.distance}</Typography>
                          <Typography variant="body2">Address: {hospital.address}</Typography>
                          {hospital.phone && <Typography variant="body2">Phone: {hospital.phone}</Typography>}
                          <Typography variant="body2">Specialties: {hospital.specialties?.join(', ') || 'General'}</Typography>
                        </Box>
                      ))}
                    </Alert>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => generateMedicalReport('heart', formData, result)}
                    sx={{ mt: 2, minWidth: 200 }}
                  >
                    Download Medical Report
                  </Button>
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      </FormContainer>
    </Fade>
  );
};

export default HeartForm;
