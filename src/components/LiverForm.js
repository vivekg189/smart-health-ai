import React, { useState } from 'react';
import {
  Box,
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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import { styled } from '@mui/material/styles';

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
  background: 'linear-gradient(90deg, #2196f3, #4caf50)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(2),
  fontWeight: 600,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196f3, #4caf50)',
  color: 'white',
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  border: '2px solid',
  borderImage: 'linear-gradient(90deg, #2196f3, #4caf50) 1',
  color: theme.palette.primary.main,
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    background: 'linear-gradient(90deg, rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1))',
  },
}));

const ResultAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  background: 'linear-gradient(90deg, rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1))',
  border: '1px solid',
  borderImage: 'linear-gradient(90deg, #2196f3, #4caf50) 1',
}));

const LiverForm = () => {
  const [formData, setFormData] = useState({
    Age: '',
    Gender: '0',
    Total_Bilirubin: '',
    Direct_Bilirubin: '',
    Alkaline_Phosphotase: '',
    Alamine_Aminotransferase: '',
    Aspartate_Aminotransferase: '',
    Total_Proteins: '',
    Albumin: '',
    Albumin_and_Globulin_Ratio: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string for controlled inputs
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: ''
      }));
      return;
    }
    
    // Handle numeric inputs
    if (name !== 'Gender') {
      // Allow decimal points and numbers
      if (/^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'Age',
      'Total_Bilirubin',
      'Direct_Bilirubin',
      'Alkaline_Phosphotase',
      'Alamine_Aminotransferase',
      'Aspartate_Aminotransferase',
      'Total_Proteins',
      'Albumin',
      'Albumin_and_Globulin_Ratio'
    ];
    
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Validate numeric ranges
    const age = parseFloat(formData.Age);
    if (isNaN(age) || age < 0 || age > 100) {
      setError('Age must be between 0 and 100');
      return false;
    }

    // Add more specific validations for liver test values if needed
    const numericFields = requiredFields.filter(field => field !== 'Age');
    for (const field of numericFields) {
      const value = parseFloat(formData[field]);
      if (isNaN(value) || value < 0) {
        setError(`${field.replace(/_/g, ' ')} must be a positive number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/predict/liver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          Age: parseFloat(formData.Age),
          Gender: parseInt(formData.Gender),
          Total_Bilirubin: parseFloat(formData.Total_Bilirubin),
          Direct_Bilirubin: parseFloat(formData.Direct_Bilirubin),
          Alkaline_Phosphotase: parseFloat(formData.Alkaline_Phosphotase),
          Alamine_Aminotransferase: parseFloat(formData.Alamine_Aminotransferase),
          Aspartate_Aminotransferase: parseFloat(formData.Aspartate_Aminotransferase),
          Total_Proteins: parseFloat(formData.Total_Proteins),
          Albumin: parseFloat(formData.Albumin),
          Albumin_and_Globulin_Ratio: parseFloat(formData.Albumin_and_Globulin_Ratio),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

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
        <FormTitle variant="h4" gutterBottom>
          Liver Disease Prediction
        </FormTitle>
        <Typography variant="body1" color="text.secondary" paragraph>
          Enter your liver function test results below to get a prediction
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <StyledSelect
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="0">Female</MenuItem>
                  <MenuItem value="1">Male</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Age"
                name="Age"
                type="number"
                value={formData.Age}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Total Bilirubin (mg/dL)"
                name="Total_Bilirubin"
                type="text"
                inputMode="decimal"
                value={formData.Total_Bilirubin}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Direct Bilirubin (mg/dL)"
                name="Direct_Bilirubin"
                type="text"
                inputMode="decimal"
                value={formData.Direct_Bilirubin}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Alkaline Phosphotase (U/L)"
                name="Alkaline_Phosphotase"
                type="text"
                inputMode="decimal"
                value={formData.Alkaline_Phosphotase}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Alamine Aminotransferase (U/L)"
                name="Alamine_Aminotransferase"
                type="text"
                inputMode="decimal"
                value={formData.Alamine_Aminotransferase}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Aspartate Aminotransferase (U/L)"
                name="Aspartate_Aminotransferase"
                type="text"
                inputMode="decimal"
                value={formData.Aspartate_Aminotransferase}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Total Proteins (g/dL)"
                name="Total_Proteins"
                type="text"
                inputMode="decimal"
                value={formData.Total_Proteins}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Albumin (g/dL)"
                name="Albumin"
                type="text"
                inputMode="decimal"
                value={formData.Albumin}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Albumin and Globulin Ratio"
                name="Albumin_and_Globulin_Ratio"
                type="text"
                inputMode="decimal"
                value={formData.Albumin_and_Globulin_Ratio}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
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
                    sx={{ width: '100%' }}
                  >
                    <Typography variant="h6">
                      {result.message}
                    </Typography>
                    <Typography>
                      Risk Level: {result.risk_level}
                    </Typography>
                    <Typography>
                      Probability: {(result.probability * 100).toFixed(2)}%
                    </Typography>
                  </ResultAlert>

                  <DownloadButton
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      // Create new PDF document
                      const doc = new jsPDF();
                      
                      // Set font styles
                      doc.setFontSize(20);
                      doc.text('Liver Disease Prediction Results', 20, 20);
                      
                      // Add date
                      doc.setFontSize(12);
                      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
                      
                      // Add input values section
                      doc.setFontSize(16);
                      doc.text('Input Values:', 20, 45);
                      doc.setFontSize(12);
                      
                      let yPosition = 55;
                      const lineHeight = 7;
                      
                      // Add input values with proper formatting
                      doc.text(`Age: ${formData.Age}`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Gender: ${formData.Gender === '0' ? 'Female' : 'Male'}`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Total Bilirubin: ${formData.Total_Bilirubin} mg/dL`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Direct Bilirubin: ${formData.Direct_Bilirubin} mg/dL`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Alkaline Phosphotase: ${formData.Alkaline_Phosphotase} U/L`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Alamine Aminotransferase: ${formData.Alamine_Aminotransferase} U/L`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Aspartate Aminotransferase: ${formData.Aspartate_Aminotransferase} U/L`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Total Proteins: ${formData.Total_Proteins} g/dL`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Albumin: ${formData.Albumin} g/dL`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Albumin and Globulin Ratio: ${formData.Albumin_and_Globulin_Ratio}`, 20, yPosition);
                      yPosition += lineHeight * 2;
                      
                      // Add prediction results section
                      doc.setFontSize(16);
                      doc.text('Prediction Results:', 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.setFontSize(12);
                      doc.text(`Risk Level: ${result.risk_level}`, 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.text(`Probability: ${(result.probability * 100).toFixed(2)}%`, 20, yPosition);
                      yPosition += lineHeight * 2;
                      
                      // Add risk level description section
                      doc.setFontSize(16);
                      doc.text('Risk Level Description:', 20, yPosition);
                      yPosition += lineHeight;
                      
                      doc.setFontSize(12);
                      let riskDescription = [];
                      
                      if (result.risk_level === "Very High") {
                        riskDescription = [
                          "• Indicates a very high likelihood of liver disease",
                          "• Should seek immediate medical attention",
                          "• May need further diagnostic tests and treatment"
                        ];
                      } else if (result.risk_level === "High") {
                        riskDescription = [
                          "• Indicates a significant likelihood of liver disease",
                          "• Should consult a healthcare provider",
                          "• May need additional tests to confirm"
                        ];
                      } else if (result.risk_level === "Moderate") {
                        riskDescription = [
                          "• Indicates some risk factors present",
                          "• Should monitor liver health",
                          "• Consider lifestyle changes and regular check-ups"
                        ];
                      } else {
                        riskDescription = [
                          "• Indicates lower likelihood of liver disease",
                          "• Still maintain healthy lifestyle",
                          "• Regular health check-ups recommended"
                        ];
                      }
                      
                      // Add risk description points
                      riskDescription.forEach(point => {
                        doc.text(point, 20, yPosition);
                        yPosition += lineHeight;
                      });
                      
                      yPosition += lineHeight;
                      
                      // Add disclaimer
                      doc.setFontSize(10);
                      doc.setFont(undefined, 'italic');
                      doc.text('Note: This is a prediction model, not a definitive diagnosis. Please consult healthcare professionals for proper medical advice.', 20, yPosition, { maxWidth: 170 });
                      
                      // Save the PDF
                      doc.save(`liver_prediction_${new Date().toISOString().split('T')[0]}.pdf`);
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

export default LiverForm; 