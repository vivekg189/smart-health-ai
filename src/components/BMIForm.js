import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Fade,
  Slide,
  styled,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';

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

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: '1.1rem',
  textTransform: 'none',
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
}));

const ResultAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(2),
}));

const BMIForm = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    heightUnit: ''
  });

  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const convertHeightToMeters = (height) => {
    const heightNum = parseFloat(height);
    if (formData.heightUnit === 'inches') {
      return heightNum * 0.0254; // Convert inches to meters
    }
    return heightNum; // Already in meters
  };

  const validateForm = () => {
    const heightNum = parseFloat(formData.height);
    const weightNum = parseFloat(formData.weight);
    if (!formData.heightUnit) return 'Please select a height unit';
    if (!heightNum || heightNum <= 0) return `Please enter a valid height in ${formData.heightUnit}`;
    if (!weightNum || weightNum <= 0 || weightNum > 500) return 'Please enter a valid weight in kg (0-500)';
    return null;
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = convertHeightToMeters(height);
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal weight';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setBmi(null);
      setCategory('');
      return;
    }
    setError('');
    const heightNum = parseFloat(formData.height);
    const weightNum = parseFloat(formData.weight);
    const bmiValue = calculateBMI(weightNum, heightNum);
    setBmi(bmiValue);
    setCategory(getBMICategory(bmiValue));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text('BMI Report', 105, 20, null, null, 'center');

    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 14, 30);
    doc.text(`Height: ${formData.height} ${formData.heightUnit}`, 14, 40);
    doc.text(`Weight: ${formData.weight} kg`, 14, 50);
    if (bmi !== null) {
      doc.text(`BMI: ${bmi.toFixed(2)}`, 14, 60);
      doc.text(`Category: ${category}`, 14, 70);
    }

    doc.text('BMI Categories & Ranges:', 14, 85);
    doc.text('< 18.5: Underweight', 14, 95);
    doc.text('18.5 - 24.9: Normal weight', 14, 105);
    doc.text('25 - 29.9: Overweight', 14, 115);
    doc.text('≥ 30: Obese', 14, 125);

    doc.save('bmi_report.pdf');
  };

  return (
    <Fade in timeout={500}>
      <FormContainer>
        <FormTitle variant="h4" gutterBottom>
          BMI Calculator
        </FormTitle>
        <Typography variant="body1" color="text.secondary" paragraph>
          Enter your height (meters) and weight (kilograms) to calculate your Body Mass Index (BMI).
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth sx={{ marginBottom: theme.spacing(2) }}>
                <InputLabel>Height Unit</InputLabel>
                <Select
                  name="heightUnit"
                  value={formData.heightUnit}
                  onChange={handleChange}
                  label="Height Unit"
                  sx={{
                    borderRadius: theme.spacing(1.5),
                    background: '#f7f9fa',
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <MenuItem value="meters">Meters</MenuItem>
                  <MenuItem value="inches">Inches</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <StyledTextField
                required
                fullWidth
                label={`Height (${formData.heightUnit})`}
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                inputProps={{
                  min: 0,
                  max: formData.heightUnit === 'inches' ? 120 : 3,
                  step: formData.heightUnit === 'inches' ? "1" : "0.01"
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <StyledTextField
                required
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                inputProps={{ min: 0, max: 500, step: "0.1" }}
              />
            </Grid>
          </Grid>

          <SubmitButton
            type="submit"
            variant="contained"
            size="large"
            sx={{ minWidth: 200 }}
          >
            Calculate BMI
          </SubmitButton>

          {error && (
            <Slide direction="up" in={!!error}>
              <ResultAlert severity="error" sx={{ width: '100%' }}>
                {error}
              </ResultAlert>
            </Slide>
          )}

          {bmi !== null && !error && (
            <Slide direction="up" in={bmi !== null}>
              <Box sx={{ width: '100%' }}>
                <ResultAlert severity="info" sx={{ width: '100%', mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Your BMI is {bmi.toFixed(2)}
                  </Typography>
                  <Typography>
                    Category: {category}
                  </Typography>
                </ResultAlert>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={generatePDF}
                  sx={{
                    mt: 2,
                    padding: theme.spacing(1.5),
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: theme.spacing(2),
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                    },
                  }}
                >
                  Download Results
                </Button>

                <Box sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: theme.spacing(2),
                  padding: theme.spacing(2),
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                    BMI Categories & Ranges
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{
                        padding: theme.spacing(1),
                        borderRadius: theme.spacing(1),
                        backgroundColor: bmi < 18.5 ? '#e3f2fd' : '#f5f5f5',
                        border: bmi < 18.5 ? '2px solid #2196f3' : '1px solid #e0e0e0',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: bmi < 18.5 ? '#1976d2' : '#666' }}>
                          Underweight
                        </Typography>
                        <Typography variant="caption" sx={{ color: bmi < 18.5 ? '#1976d2' : '#666' }}>
                          {"< 18.5"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{
                        padding: theme.spacing(1),
                        borderRadius: theme.spacing(1),
                        backgroundColor: bmi >= 18.5 && bmi < 25 ? '#e8f5e8' : '#f5f5f5',
                        border: bmi >= 18.5 && bmi < 25 ? '2px solid #4caf50' : '1px solid #e0e0e0',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: bmi >= 18.5 && bmi < 25 ? '#2e7d32' : '#666' }}>
                          Normal
                        </Typography>
                        <Typography variant="caption" sx={{ color: bmi >= 18.5 && bmi < 25 ? '#2e7d32' : '#666' }}>
                          18.5 - 24.9
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{
                        padding: theme.spacing(1),
                        borderRadius: theme.spacing(1),
                        backgroundColor: bmi >= 25 && bmi < 30 ? '#fff3e0' : '#f5f5f5',
                        border: bmi >= 25 && bmi < 30 ? '2px solid #ff9800' : '1px solid #e0e0e0',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: bmi >= 25 && bmi < 30 ? '#f57c00' : '#666' }}>
                          Overweight
                        </Typography>
                        <Typography variant="caption" sx={{ color: bmi >= 25 && bmi < 30 ? '#f57c00' : '#666' }}>
                          25 - 29.9
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{
                        padding: theme.spacing(1),
                        borderRadius: theme.spacing(1),
                        backgroundColor: bmi >= 30 ? '#ffebee' : '#f5f5f5',
                        border: bmi >= 30 ? '2px solid #f44336' : '1px solid #e0e0e0',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: bmi >= 30 ? '#d32f2f' : '#666' }}>
                          Obese
                        </Typography>
                        <Typography variant="caption" sx={{ color: bmi >= 30 ? '#d32f2f' : '#666' }}>
                          ≥ 30
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Slide>
          )}
        </Box>
      </FormContainer>
    </Fade>
  );
};

export default BMIForm;