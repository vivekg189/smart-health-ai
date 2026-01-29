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
  Slide,
  TextField,
  Select,
  Button,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import { jsPDF } from 'jspdf';

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
  fontWeight: 'bold',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ResultAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.light,
  },
}));

const HeartForm = () => {
  const [formData, setFormData] = useState({
    BMI: '',
    Smoking: '',
    AlcoholDrinking: '',
    Stroke: '',
    Sex: '',
    AgeCategory: '',
    Diabetic: '',
    PhysicalActivity: '',
    GenHealth: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'BMI', 'Smoking', 'AlcoholDrinking', 'Stroke', 'Sex', 'AgeCategory', 'Diabetic', 'PhysicalActivity', 'GenHealth'
    ];

    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Validate numeric ranges
    const BMI = parseFloat(formData.BMI);
    if (isNaN(BMI) || BMI < 10 || BMI > 50) {
      setError('BMI must be between 10 and 50');
      return false;
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
      const response = await fetch('http://localhost:5000/api/predict/heart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BMI: parseFloat(formData.BMI),
          Smoking: parseInt(formData.Smoking),
          AlcoholDrinking: parseInt(formData.AlcoholDrinking),
          Stroke: parseInt(formData.Stroke),
          Sex: parseInt(formData.Sex),
          AgeCategory: parseInt(formData.AgeCategory),
          Diabetic: parseInt(formData.Diabetic),
          PhysicalActivity: parseInt(formData.PhysicalActivity),
          GenHealth: parseInt(formData.GenHealth)
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
          Heart Disease Prediction
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
                label="BMI"
                name="BMI"
                type="text"
                value={formData.BMI}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and decimal point
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleChange(e);
                  }
                }}
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]*'
                }}
                placeholder="e.g., 19.84"
                helperText="Enter BMI between 10 and 50 (e.g., 19.84)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Smoking Status</InputLabel>
                <StyledSelect
                  name="Smoking"
                  value={formData.Smoking}
                  onChange={handleChange}
                  label="Smoking Status"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Alcohol Drinking</InputLabel>
                <StyledSelect
                  name="AlcoholDrinking"
                  value={formData.AlcoholDrinking}
                  onChange={handleChange}
                  label="Alcohol Drinking"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Stroke History</InputLabel>
                <StyledSelect
                  name="Stroke"
                  value={formData.Stroke}
                  onChange={handleChange}
                  label="Stroke History"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Sex</InputLabel>
                <StyledSelect
                  name="Sex"
                  value={formData.Sex}
                  onChange={handleChange}
                  label="Sex"
                >
                  <MenuItem value="0">Female</MenuItem>
                  <MenuItem value="1">Male</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Age Category</InputLabel>
                <StyledSelect
                  name="AgeCategory"
                  value={formData.AgeCategory}
                  onChange={handleChange}
                  label="Age Category"
                >
                  <MenuItem value="0">18-24</MenuItem>
                  <MenuItem value="1">25-29</MenuItem>
                  <MenuItem value="2">30-34</MenuItem>
                  <MenuItem value="3">35-39</MenuItem>
                  <MenuItem value="4">40-44</MenuItem>
                  <MenuItem value="5">45-49</MenuItem>
                  <MenuItem value="6">50-54</MenuItem>
                  <MenuItem value="7">55-59</MenuItem>
                  <MenuItem value="8">60-64</MenuItem>
                  <MenuItem value="9">65-69</MenuItem>
                  <MenuItem value="10">70-74</MenuItem>
                  <MenuItem value="11">75-79</MenuItem>
                  <MenuItem value="12">80 or older</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Diabetic</InputLabel>
                <StyledSelect
                  name="Diabetic"
                  value={formData.Diabetic}
                  onChange={handleChange}
                  label="Diabetic"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                  <MenuItem value="2">No, borderline diabetes</MenuItem>
                  <MenuItem value="3">Yes (during pregnancy)</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Physical Activity</InputLabel>
                <StyledSelect
                  name="PhysicalActivity"
                  value={formData.PhysicalActivity}
                  onChange={handleChange}
                  label="Physical Activity"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>General Health</InputLabel>
                <StyledSelect
                  name="GenHealth"
                  value={formData.GenHealth}
                  onChange={handleChange}
                  label="General Health"
                >
                  <MenuItem value="0">Excellent</MenuItem>
                  <MenuItem value="1">Very good</MenuItem>
                  <MenuItem value="2">Good</MenuItem>
                  <MenuItem value="3">Fair</MenuItem>
                  <MenuItem value="4">Poor</MenuItem>
                </StyledSelect>
              </FormControl>
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
                      const doc = new jsPDF();
                      
                      // Set font styles
                      doc.setFontSize(20);
                      doc.text('Heart Disease Prediction Results', 20, 20);
                      
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
                      doc.text(`BMI: ${formData.BMI}`, 20, yPosition);
                      yPosition += lineHeight;

                      doc.text(`Smoking Status: ${formData.Smoking === '0' ? 'No' : 'Yes'}`, 20, yPosition);
                      yPosition += lineHeight;

                      doc.text(`Alcohol Drinking: ${formData.AlcoholDrinking === '0' ? 'No' : 'Yes'}`, 20, yPosition);
                      yPosition += lineHeight;

                      doc.text(`Stroke History: ${formData.Stroke === '0' ? 'No' : 'Yes'}`, 20, yPosition);
                      yPosition += lineHeight;

                      doc.text(`Sex: ${formData.Sex === '0' ? 'Female' : 'Male'}`, 20, yPosition);
                      yPosition += lineHeight;

                      doc.text(`Age Category: ${
                        formData.AgeCategory === '0' ? '18-24' :
                        formData.AgeCategory === '1' ? '25-29' :
                        formData.AgeCategory === '2' ? '30-34' :
                        formData.AgeCategory === '3' ? '35-39' :
                        formData.AgeCategory === '4' ? '40-44' :
                        formData.AgeCategory === '5' ? '45-49' :
                        formData.AgeCategory === '6' ? '50-54' :
                        formData.AgeCategory === '7' ? '55-59' :
                        formData.AgeCategory === '8' ? '60-64' :
                        formData.AgeCategory === '9' ? '65-69' :
                        formData.AgeCategory === '10' ? '70-74' :
                        formData.AgeCategory === '11' ? '75-79' : '80 or older'
                      }`, 20, yPosition);
                      yPosition += lineHeight;

                      doc.text(`Diabetic: ${
                        formData.Diabetic === '0' ? 'No' :
                        formData.Diabetic === '1' ? 'Yes' :
                        formData.Diabetic === '2' ? 'No, borderline diabetes' : 'Yes (during pregnancy)'
                      }`, 20, yPosition);
                      yPosition += lineHeight;

                      doc.text(`Physical Activity: ${formData.PhysicalActivity === '0' ? 'No' : 'Yes'}`, 20, yPosition);
                      yPosition += lineHeight;

                      doc.text(`General Health: ${
                        formData.GenHealth === '0' ? 'Excellent' :
                        formData.GenHealth === '1' ? 'Very good' :
                        formData.GenHealth === '2' ? 'Good' :
                        formData.GenHealth === '3' ? 'Fair' : 'Poor'
                      }`, 20, yPosition);
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
                          "• Indicates a very high likelihood of heart disease",
                          "• Should seek immediate medical attention",
                          "• May need further diagnostic tests and treatment",
                          "• Consider immediate lifestyle changes",
                          "• Regular heart health monitoring required"
                        ];
                      } else if (result.risk_level === "High") {
                        riskDescription = [
                          "• Indicates a significant likelihood of heart disease",
                          "• Should consult a healthcare provider",
                          "• May need additional tests to confirm",
                          "• Important to monitor heart health",
                          "• Consider dietary and exercise changes"
                        ];
                      } else if (result.risk_level === "Moderate") {
                        riskDescription = [
                          "• Indicates some risk factors present",
                          "• Should monitor heart health",
                          "• Consider lifestyle changes and regular check-ups",
                          "• Focus on maintaining healthy weight",
                          "• Regular exercise recommended"
                        ];
                      } else {
                        riskDescription = [
                          "• Indicates lower likelihood of heart disease",
                          "• Still maintain healthy lifestyle",
                          "• Regular health check-ups recommended",
                          "• Continue balanced diet and exercise",
                          "• Monitor family history and risk factors"
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
                      doc.save(`heart_prediction_${new Date().toISOString().split('T')[0]}.pdf`);
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

export default HeartForm; 