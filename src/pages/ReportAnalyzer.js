import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  styled
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed #2196f3',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s',
  '&:hover': {
    borderColor: '#1976d2',
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
}));

const getStatusColor = (status) => {
  switch (status) {
    case 'normal': return 'success';
    case 'slightly high': return 'warning';
    case 'high': return 'error';
    case 'low': return 'warning';
    case 'very low': return 'error';
    default: return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'normal': return <CheckCircleIcon />;
    case 'slightly high': return <WarningIcon />;
    case 'high': return <ErrorIcon />;
    case 'low': return <WarningIcon />;
    case 'very low': return <ErrorIcon />;
    default: return null;
  }
};

const ReportAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
        setFile(selectedFile);
        setError('');
        setResult(null);
      } else {
        setError('Please upload a PDF or image file (JPG, PNG)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/analyze-report', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze report');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 160px)', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <DescriptionIcon sx={{ fontSize: 48, color: '#2196f3', mb: 1 }} />
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Medical Report Analyzer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your medical report (PDF or image) to get simple explanations
          </Typography>
        </Box>

        <StyledPaper sx={{ mb: 3 }}>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <label htmlFor="file-upload" style={{ width: '100%' }}>
                <UploadBox>
                  <UploadFileIcon sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {file ? file.name : 'Click to upload your medical report'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: PDF, JPG, PNG
                  </Typography>
                </UploadBox>
              </label>

              {file && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleUpload}
                  disabled={loading}
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Report'}
                </Button>
              )}

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </StyledPaper>

        {result && (
          <StyledPaper>
                <Alert severity="info" sx={{ mb: 3 }}>
                  {result.disclaimer}
                </Alert>

                {result.parameters && result.parameters.length > 0 ? (
                  <>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  Found {result.total_found} Parameter{result.total_found !== 1 ? 's' : ''}
                </Typography>

                {/* Overall Health Summary */}
                <Card sx={{ mb: 3, bgcolor: '#e3f2fd', border: '2px solid #2196f3' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565c0', mb: 2 }}>
                      📊 Overall Health Summary
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {result.parameters.filter(p => p.status === 'normal').length > 0 && (
                        <Chip 
                          label={`${result.parameters.filter(p => p.status === 'normal').length} Normal`} 
                          color="success" 
                          size="small"
                        />
                      )}
                      {result.parameters.filter(p => p.status === 'slightly high').length > 0 && (
                        <Chip 
                          label={`${result.parameters.filter(p => p.status === 'slightly high').length} Slightly High`} 
                          color="warning" 
                          size="small"
                        />
                      )}
                      {result.parameters.filter(p => p.status === 'high').length > 0 && (
                        <Chip 
                          label={`${result.parameters.filter(p => p.status === 'high').length} High`} 
                          color="error" 
                          size="small"
                        />
                      )}
                      {result.parameters.filter(p => p.status === 'low').length > 0 && (
                        <Chip 
                          label={`${result.parameters.filter(p => p.status === 'low').length} Low`} 
                          color="warning" 
                          size="small"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {result.parameters.map((param, index) => (
                  <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {param.parameter}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(param.status)}
                          label={param.status.toUpperCase()}
                          color={getStatusColor(param.status)}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Value
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {param.value} {param.unit}
                        </Typography>
                      </Box>

                      <Typography variant="body1" sx={{ color: '#424242', lineHeight: 1.6, mb: 2 }}>
                        {param.explanation}
                      </Typography>

                      {param.recommendations && param.status !== 'normal' && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                            📋 Health Recommendations
                          </Typography>

                          {param.recommendations.medications && param.recommendations.medications.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#d32f2f', mb: 1 }}>
                                💊 Medications (Consult Doctor):
                              </Typography>
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {param.recommendations.medications.map((med, i) => (
                                  <li key={i}>
                                    <Typography variant="body2">{med}</Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {param.recommendations.diet && param.recommendations.diet.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                                🥗 Diet Recommendations:
                              </Typography>
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {param.recommendations.diet.map((food, i) => (
                                  <li key={i}>
                                    <Typography variant="body2">{food}</Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {param.recommendations.lifestyle && param.recommendations.lifestyle.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ed6c02', mb: 1 }}>
                                🏃 Lifestyle Changes:
                              </Typography>
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {param.recommendations.lifestyle.map((lifestyle, i) => (
                                  <li key={i}>
                                    <Typography variant="body2">{lifestyle}</Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {param.recommendations.follow_up && (
                            <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffb74d' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 0.5 }}>
                                🏥 Follow-up:
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#424242' }}>
                                {param.recommendations.follow_up}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
                  </>
                ) : (
                  <Alert severity="warning">
                    {result.message || 'No medical parameters detected in the report'}
                  </Alert>
            )}
          </StyledPaper>
        )}
      </Container>
    </Box>
  );
};

export default ReportAnalyzer;
