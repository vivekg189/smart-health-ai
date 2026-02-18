import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  styled,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { jsPDF } from 'jspdf';
import { generateMedicalReport } from '../utils/reportGenerator';

// Styled Components
const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1)',
    borderTopLeftRadius: theme.shape.borderRadius * 3,
    borderTopRightRadius: theme.shape.borderRadius * 3,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1))',
    borderRadius: '50%',
    zIndex: 0,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(1),
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(3),
  fontWeight: 700,
  letterSpacing: 1.2,
  textAlign: 'center',
  position: 'relative',
  zIndex: 1,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const UploadArea = styled(Box)(({ theme, isDragOver, hasFile }) => ({
  border: `3px dashed ${isDragOver ? theme.palette.primary.main : hasFile ? theme.palette.success.main : theme.palette.grey[400]}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragOver ? 'rgba(25, 118, 210, 0.05)' : hasFile ? 'rgba(76, 175, 80, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  textTransform: 'none',
  borderRadius: theme.spacing(3),
  fontWeight: 600,
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
  },
  '&:disabled': {
    background: theme.palette.grey[300],
    transform: 'none',
  },
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #26d0ce 0%, #2a7c76 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const ResultCard = styled(Card)(({ theme, severity }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: `2px solid ${severity === 'error' ? theme.palette.error.main : theme.palette.success.main}`,
  background: severity === 'error' 
    ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: severity === 'error' 
      ? 'linear-gradient(90deg, #f44336, #ff9800)'
      : 'linear-gradient(90deg, #4caf50, #8bc34a)',
  },
}));

const MetricChip = styled(Chip)(({ theme, severity }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 600,
  background: severity === 'high' 
    ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
    : severity === 'medium'
    ? 'linear-gradient(135deg, #feca57, #ff9ff3)'
    : 'linear-gradient(135deg, #48dbfb, #0abde3)',
  color: 'white',
  '& .MuiChip-label': {
    fontWeight: 600,
  },
}));

const BoneForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload an X-ray image.');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError(null);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:5000/api/predict/bone-fracture', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || data.error || 'Please upload a valid X-ray image.');
        setUploadProgress(0);
        return;
      }
      
      setTimeout(() => {
        setResult(data);
        setUploadProgress(0);
        
        // Save prediction to database
        savePrediction(data);
      }, 500);
      
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setError('Prediction failed. Please try again.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const generatePDF = () => {
    if (!result) return;
    
    // Use the professional report generator
    const formData = {
      confidence: (result.confidence * 100).toFixed(1)
    };
    
    generateMedicalReport('bone', formData, result);
  };

  const getSeverityLevel = (prediction, confidence) => {
    if (prediction === 'Fracture') {
      return confidence > 0.8 ? 'high' : 'medium';
    }
    return 'low';
  };

  const savePrediction = async (predictionData) => {
    try {
      await fetch('http://localhost:5000/api/data/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          disease_type: 'Bone Fracture',
          prediction_result: predictionData.prediction,
          probability: predictionData.confidence,
          risk_level: predictionData.severity_level,
          input_data: { file_name: file?.name }
        })
      });
    } catch (err) {
      console.error('Failed to save prediction:', err);
    }
  };

  return (
    <Fade in timeout={800}>
      <FormContainer sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <MedicalServicesIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
            <FormTitle variant={isMobile ? "h5" : "h4"}>
              Bone Fracture Detection
            </FormTitle>
          </Box>
          
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
            Upload an X-ray image for AI-powered fracture analysis
          </Typography>

          <form onSubmit={handleSubmit}>
            <UploadArea
              isDragOver={isDragOver}
              hasFile={!!file}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
              sx={{ mb: 3 }}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              
              {file ? (
                <Box>
                  <Typography variant="h6" sx={{ color: 'success.main', mb: 1 }}>
                    ✅ {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    File ready for analysis
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Drop your X-ray image here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse files
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled' }}>
                    Supports: JPG, PNG, JPEG
                  </Typography>
                </Box>
              )}
            </UploadArea>

            {loading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      borderRadius: 4,
                    }
                  }} 
                />
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                  Analyzing X-ray... {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}

            <StyledButton
              type="submit"
              variant="contained"
              disabled={loading || !file}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Analyzing...
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  Analyze X-ray
                </Box>
              )}
            </StyledButton>
          </form>

          {error && (
            <Slide direction="up" in={!!error} timeout={500}>
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            </Slide>
          )}

          {result && (
            <Fade in timeout={800}>
              <Box sx={{ mt: 3 }}>
                <ResultCard severity={result.prediction === 'Fracture' ? 'error' : 'success'}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Analysis Results
                      </Typography>
                    </Box>
                    
                    <Typography variant="h5" sx={{ 
                      mb: 2, 
                      fontWeight: 700,
                      color: result.prediction === 'Fracture' ? 'error.main' : 'success.main'
                    }}>
                      {result.message || `Prediction: ${result.prediction}`}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <MetricChip 
                        label={`Confidence: ${(result.confidence * 100).toFixed(1)}%`}
                        severity={getSeverityLevel(result.prediction, result.confidence)}
                      />
                      <MetricChip 
                        label={`Severity: ${result.severity_level}`}
                        severity={result.severity_level?.toLowerCase()}
                      />
                      <MetricChip 
                        label={`Urgency: ${result.urgency}`}
                        severity={result.urgency?.toLowerCase()}
                      />
                    </Box>

                    {result.recommendations && (
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          📋 Medical Recommendations:
                        </Typography>
                        {result.recommendations.map((rec, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 0.5, pl: 2 }}>
                            • {rec}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    <DownloadButton
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={generatePDF}
                      fullWidth
                      sx={{ mt: 3 }}
                    >
                      Download Medical Report
                    </DownloadButton>
                  </CardContent>
                </ResultCard>
              </Box>
            </Fade>
          )}
        </Box>
      </FormContainer>
    </Fade>
  );
};

export default BoneForm;