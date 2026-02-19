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
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';

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
    background: 'linear-gradient(90deg, #e91e63, #f44336)',
    borderTopLeftRadius: theme.shape.borderRadius * 2,
    borderTopRightRadius: theme.shape.borderRadius * 2,
  },
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed #e91e63',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s',
  '&:hover': {
    borderColor: '#f44336',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
  },
}));

const CardiovascularMultimodal = () => {
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    cp: '',
    trestbps: '',
    chol: '',
    fbs: '',
    restecg: '',
    thalach: '',
    exang: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Please upload JPG or PNG image only');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if at least one input method is provided
    if (!imageFile && !formData.age) {
      setError('Please provide either a heart medical image OR fill in the clinical parameters');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formDataToSend = new FormData();
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:5000/api/cardiovascular-analysis', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
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
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#e91e63' }} gutterBottom>
          🫀 Cardiovascular Health Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Multimodal heart disease prediction using medical imaging and clinical data
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Image Upload Section */}
          <Card sx={{ mb: 3, bgcolor: '#fce4ec' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📸 Upload Heart Medical Image (Optional)
              </Typography>
              <input
                accept="image/jpeg,image/jpg,image/png"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <UploadBox>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#e91e63', mb: 1 }} />
                  <Typography variant="body1">
                    {imageFile ? imageFile.name : 'Click to upload heart image (JPG, PNG) - Optional'}
                  </Typography>
                </UploadBox>
              </label>
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                </Box>
              )}
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Numeric Clinical Data */}
          <Typography variant="h6" gutterBottom sx={{ color: '#e91e63' }}>
            📋 Clinical Parameters (Required if no image)
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 1, max: 120 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Sex</InputLabel>
                <Select name="sex" value={formData.sex} onChange={handleChange} label="Sex">
                  <MenuItem value="0">Female</MenuItem>
                  <MenuItem value="1">Male</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Chest Pain Type (cp)</InputLabel>
                <Select name="cp" value={formData.cp} onChange={handleChange} label="Chest Pain Type">
                  <MenuItem value="0">Typical Angina</MenuItem>
                  <MenuItem value="1">Atypical Angina</MenuItem>
                  <MenuItem value="2">Non-anginal Pain</MenuItem>
                  <MenuItem value="3">Asymptomatic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Resting BP (trestbps)"
                name="trestbps"
                type="number"
                value={formData.trestbps}
                onChange={handleChange}
                helperText="mm Hg"
                inputProps={{ min: 80, max: 200 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Cholesterol (chol)"
                name="chol"
                type="number"
                value={formData.chol}
                onChange={handleChange}
                helperText="mg/dl"
                inputProps={{ min: 100, max: 600 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Fasting Blood Sugar (fbs)</InputLabel>
                <Select name="fbs" value={formData.fbs} onChange={handleChange} label="Fasting Blood Sugar">
                  <MenuItem value="0">&lt; 120 mg/dl</MenuItem>
                  <MenuItem value="1">&gt; 120 mg/dl</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Resting ECG (restecg)</InputLabel>
                <Select name="restecg" value={formData.restecg} onChange={handleChange} label="Resting ECG">
                  <MenuItem value="0">Normal</MenuItem>
                  <MenuItem value="1">ST-T Abnormality</MenuItem>
                  <MenuItem value="2">LV Hypertrophy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Max Heart Rate (thalach)"
                name="thalach"
                type="number"
                value={formData.thalach}
                onChange={handleChange}
                helperText="bpm"
                inputProps={{ min: 60, max: 220 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Exercise Angina (exang)</InputLabel>
                <Select name="exang" value={formData.exang} onChange={handleChange} label="Exercise Angina">
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="ST Depression (oldpeak)"
                name="oldpeak"
                type="number"
                value={formData.oldpeak}
                onChange={handleChange}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Slope</InputLabel>
                <Select name="slope" value={formData.slope} onChange={handleChange} label="Slope">
                  <MenuItem value="0">Upsloping</MenuItem>
                  <MenuItem value="1">Flat</MenuItem>
                  <MenuItem value="2">Downsloping</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Major Vessels (ca)</InputLabel>
                <Select name="ca" value={formData.ca} onChange={handleChange} label="Major Vessels">
                  <MenuItem value="0">0</MenuItem>
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="3">3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Thalassemia (thal)</InputLabel>
                <Select name="thal" value={formData.thal} onChange={handleChange} label="Thalassemia">
                  <MenuItem value="0">Normal</MenuItem>
                  <MenuItem value="1">Fixed Defect</MenuItem>
                  <MenuItem value="2">Reversible Defect</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<AnalyticsIcon />}
              sx={{ minWidth: 250, bgcolor: '#e91e63', '&:hover': { bgcolor: '#c2185b' } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Heart Health'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
            )}

            {result && (
              <Fade in timeout={500}>
                <Card sx={{ width: '100%', mt: 2 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ color: '#e91e63' }}>
                      📊 Analysis Results
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Model Used:</Typography>
                        <Typography variant="body1" fontWeight={600}>{result.model_used}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Disease Probability:</Typography>
                        <Typography variant="h6" color={result.risk_level === 'High' ? 'error' : result.risk_level === 'Moderate' ? 'warning.main' : 'success.main'}>
                          {(result.final_disease_probability * 100).toFixed(1)}%
                        </Typography>
                      </Grid>
                      {result.image_confidence_score !== undefined && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Image Confidence:</Typography>
                          <Typography variant="body1">{(result.image_confidence_score * 100).toFixed(1)}%</Typography>
                        </Grid>
                      )}
                      {result.numeric_risk_score !== undefined && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Numeric Risk Score:</Typography>
                          <Typography variant="body1">{(result.numeric_risk_score * 100).toFixed(1)}%</Typography>
                        </Grid>
                      )}
                    </Grid>

                    <Alert 
                      severity={result.risk_level === 'High' ? 'error' : result.risk_level === 'Moderate' ? 'warning' : 'success'} 
                      sx={{ mt: 3 }}
                    >
                      <Typography variant="h6">Risk Level: {result.risk_level.toUpperCase()}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{result.recommendation}</Typography>
                    </Alert>

                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        {result.formatted_report}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            )}
          </Box>
        </Box>
      </FormContainer>
    </Fade>
  );
};

export default CardiovascularMultimodal;
