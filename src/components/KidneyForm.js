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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { generateMedicalReport } from '../utils/reportGenerator';
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

const KidneyForm = () => {
  const [formData, setFormData] = useState({
    age: '',
    blood_pressure: '',
    specific_gravity: '',
    albumin: '',
    sugar: '',
    red_blood_cells: '',
    pus_cell: '',
    pus_cell_clumps: '',
    bacteria: '',
    blood_glucose_random: '',
    blood_urea: '',
    serum_creatinine: '',
    sodium: '',
    potassium: '',
    hemoglobin: '',
    packed_cell_volume: '',
    white_blood_cell_count: '',
    red_blood_cell_count: '',
    hypertension: '0',
    diabetes_mellitus: '0',
    coronary_artery_disease: '0',
    appetite: '0',
    peda_edema: '0',
    anemia: '0'
  });
  const [file, setFile] = useState(null);
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
      'age', 'blood_pressure', 'specific_gravity', 'albumin', 'sugar',
      'red_blood_cells', 'pus_cell', 'pus_cell_clumps', 'bacteria',
      'blood_glucose_random', 'blood_urea', 'serum_creatinine', 'sodium',
      'potassium', 'hemoglobin', 'packed_cell_volume', 'white_blood_cell_count',
      'red_blood_cell_count'
    ];

    const emptyFields = requiredFields.filter(field => !formData[field]);
    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Validate numeric ranges
    const age = parseFloat(formData.age);
    if (isNaN(age) || age < 0 || age > 100) {
      setError('Age must be between 0 and 100');
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
      const response = await fetch('http://localhost:5000/api/predict/kidney', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
          Kidney Disease Prediction
        </FormTitle>
        <Typography variant="body1" color="text.secondary" paragraph>
          Enter your kidney function test results below to get a prediction
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: file ? 'success.main' : 'grey.400',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: file ? 'success.50' : 'grey.50',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
                }}
                onClick={() => document.getElementById('kidney-file-input').click()}
              >
                <input
                  id="kidney-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1">
                  {file ? `✅ ${file.name}` : 'Upload Medical Report/Lab Image'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports: JPG, PNG, JPEG
                </Typography>
              </Box>
            </Grid>
            {/* Basic Information */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100 }}
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
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Urine Analysis */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Specific Gravity"
                name="specific_gravity"
                type="number"
                value={formData.specific_gravity}
                onChange={handleChange}
                inputProps={{ step: "0.001" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Albumin (g/dL)"
                name="albumin"
                type="number"
                value={formData.albumin}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Sugar (mg/dL)"
                name="sugar"
                type="number"
                value={formData.sugar}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>

            {/* Blood Cell Analysis */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Red Blood Cells</InputLabel>
                <StyledSelect
                  name="red_blood_cells"
                  value={formData.red_blood_cells}
                  onChange={handleChange}
                  label="Red Blood Cells"
                >
                  <MenuItem value="0">Normal</MenuItem>
                  <MenuItem value="1">Abnormal</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Pus Cell</InputLabel>
                <StyledSelect
                  name="pus_cell"
                  value={formData.pus_cell}
                  onChange={handleChange}
                  label="Pus Cell"
                >
                  <MenuItem value="0">Normal</MenuItem>
                  <MenuItem value="1">Abnormal</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Pus Cell Clumps</InputLabel>
                <StyledSelect
                  name="pus_cell_clumps"
                  value={formData.pus_cell_clumps}
                  onChange={handleChange}
                  label="Pus Cell Clumps"
                >
                  <MenuItem value="0">Not Present</MenuItem>
                  <MenuItem value="1">Present</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Bacteria</InputLabel>
                <StyledSelect
                  name="bacteria"
                  value={formData.bacteria}
                  onChange={handleChange}
                  label="Bacteria"
                >
                  <MenuItem value="0">Not Present</MenuItem>
                  <MenuItem value="1">Present</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>

            {/* Blood Tests */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Blood Glucose Random (mg/dL)"
                name="blood_glucose_random"
                type="number"
                value={formData.blood_glucose_random}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Blood Urea (mg/dL)"
                name="blood_urea"
                type="number"
                value={formData.blood_urea}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Serum Creatinine (mg/dL)"
                name="serum_creatinine"
                type="number"
                value={formData.serum_creatinine}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Sodium (mEq/L)"
                name="sodium"
                type="number"
                value={formData.sodium}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Potassium (mEq/L)"
                name="potassium"
                type="number"
                value={formData.potassium}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Hemoglobin (g/dL)"
                name="hemoglobin"
                type="number"
                value={formData.hemoglobin}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Packed Cell Volume (%)"
                name="packed_cell_volume"
                type="number"
                value={formData.packed_cell_volume}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="White Blood Cell Count (cells/cumm)"
                name="white_blood_cell_count"
                type="number"
                value={formData.white_blood_cell_count}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Red Blood Cell Count (millions/cmm)"
                name="red_blood_cell_count"
                type="number"
                value={formData.red_blood_cell_count}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>

            {/* Medical History */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
              <FormControl fullWidth>
                <InputLabel>Diabetes Mellitus</InputLabel>
                <StyledSelect
                  name="diabetes_mellitus"
                  value={formData.diabetes_mellitus}
                  onChange={handleChange}
                  label="Diabetes Mellitus"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Coronary Artery Disease</InputLabel>
                <StyledSelect
                  name="coronary_artery_disease"
                  value={formData.coronary_artery_disease}
                  onChange={handleChange}
                  label="Coronary Artery Disease"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Appetite</InputLabel>
                <StyledSelect
                  name="appetite"
                  value={formData.appetite}
                  onChange={handleChange}
                  label="Appetite"
                >
                  <MenuItem value="0">Good</MenuItem>
                  <MenuItem value="1">Poor</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pedal Edema</InputLabel>
                <StyledSelect
                  name="peda_edema"
                  value={formData.peda_edema}
                  onChange={handleChange}
                  label="Pedal Edema"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Anemia</InputLabel>
                <StyledSelect
                  name="anemia"
                  value={formData.anemia}
                  onChange={handleChange}
                  label="Anemia"
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
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
                    onClick={() => generateMedicalReport('kidney', formData, result)}
                    sx={{ mt: 2, minWidth: 200 }}
                  >
                    Download Medical Report
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

export default KidneyForm; 