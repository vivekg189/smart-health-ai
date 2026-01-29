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
  styled
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
    gender: '',
    age: '',
    hypertension: '',
    heart_disease: '',
    smoking_history: '',
    bmi: '',
    HbA1c_level: '',
    blood_glucose_level: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.gender) return 'Please select gender';
    if (!formData.age || formData.age < 0 || formData.age > 120) return 'Please enter a valid age (0-120)';
    if (!formData.hypertension) return 'Please select hypertension status';
    if (!formData.heart_disease) return 'Please select heart disease status';
    if (!formData.smoking_history) return 'Please select smoking history';
    if (!formData.bmi || formData.bmi < 10 || formData.bmi > 50) return 'Please enter a valid BMI (10-50)';
    if (!formData.HbA1c_level || formData.HbA1c_level < 3.5 || formData.HbA1c_level > 15) return 'Please enter a valid HbA1c level (3.5-15)';
    if (!formData.blood_glucose_level || formData.blood_glucose_level < 50 || formData.blood_glucose_level > 300) return 'Please enter a valid blood glucose level (50-300)';
    return null;
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

    try {
      const response = await fetch('http://localhost:5000/api/predict/diabetes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get prediction');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (probability) => {
    if (probability < 0.3) return 'Low';
    if (probability < 0.6) return 'Medium';
    if (probability < 0.8) return 'High';
    return 'Very High';
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
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <StyledSelect
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 0, max: 120, step: "1" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Hypertension</InputLabel>
                <StyledSelect
                  name="hypertension"
                  value={formData.hypertension}
                  onChange={handleChange}
                  label="Hypertension"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Heart Disease</InputLabel>
                <StyledSelect
                  name="heart_disease"
                  value={formData.heart_disease}
                  onChange={handleChange}
                  label="Heart Disease"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Smoking History</InputLabel>
                <StyledSelect
                  name="smoking_history"
                  value={formData.smoking_history}
                  onChange={handleChange}
                  label="Smoking History"
                >
                  <MenuItem value="never">Never</MenuItem>
                  <MenuItem value="former">Former</MenuItem>
                  <MenuItem value="current">Current</MenuItem>
                </StyledSelect>
              </FormControl>
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
                inputProps={{ min: 10, max: 50, step: "any" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="HbA1c Level"
                name="HbA1c_level"
                type="number"
                value={formData.HbA1c_level}
                onChange={handleChange}
                inputProps={{ min: 3.5, max: 15, step: "0.1" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Blood Glucose Level"
                name="blood_glucose_level"
                type="number"
                value={formData.blood_glucose_level}
                onChange={handleChange}
                inputProps={{ min: 50, max: 300, step: "1" }}
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

            {result && (
              <Fade in timeout={500}>
                <Box sx={{ width: '100%' }}>
                  <ResultAlert 
                    severity={result.prediction === 1 ? "error" : "success"}
                  >
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      {result.message}
                    </Typography>
                    <Typography sx={{ color: 'white', mb: 0.5 }}>
                      Risk Level: {getRiskLevel(result.probability)}
                    </Typography>
                    <Typography sx={{ color: 'white' }}>
                      Probability: {(result.probability * 100).toFixed(2)}%
                    </Typography>
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
                      Object.entries(formData).forEach(([key, value]) => {
                        doc.text(`${key}: ${value}`, 30, yPosition);
                        yPosition += 10;
                      });
                      
                      yPosition += 10;
                      // Add results
                      doc.text('Results:', 20, yPosition);
                      yPosition += 10;
                      doc.text(`Prediction: ${result.message}`, 30, yPosition);
                      yPosition += 10;
                      doc.text(`Risk Level: ${getRiskLevel(result.probability)}`, 30, yPosition);
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