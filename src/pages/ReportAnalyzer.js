import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

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
    case 'NORMAL': return '#4caf50';
    case 'BORDERLINE_HIGH':
    case 'BORDERLINE_LOW': return '#ff9800';
    case 'HIGH':
    case 'LOW': return '#f44336';
    default: return '#9e9e9e';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'NORMAL': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    case 'BORDERLINE_HIGH':
    case 'BORDERLINE_LOW': return <WarningIcon sx={{ color: '#ff9800' }} />;
    case 'HIGH':
    case 'LOW': return <ErrorIcon sx={{ color: '#f44336' }} />;
    default: return null;
  }
};

const getStatusLabel = (status) => {
  const labels = {
    'NORMAL': 'Normal',
    'BORDERLINE_HIGH': 'Borderline High',
    'BORDERLINE_LOW': 'Borderline Low',
    'HIGH': 'High',
    'LOW': 'Low'
  };
  return labels[status] || status;
};

const ReportAnalyzer = () => {
  const navigate = useNavigate();
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
        throw new Error(data.error || data.details || 'Failed to analyze report');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the report');
    } finally {
      setLoading(false);
    }
  };

  const handleModelNavigation = (model) => {
    navigate('/models', { state: { selectedModel: model } });
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 160px)', py: 4, bgcolor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <BackButton />
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <DescriptionIcon sx={{ fontSize: 48, color: '#2196f3', mb: 1 }} />
          <Typography variant="h4" gutterBottom fontWeight={600}>
            AI Medical Report Analyzer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload your medical report for complete AI-based analysis with parameter extraction and clinical insights
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
                Supported: Blood tests, Liver panels, Kidney reports, Lipid profiles, CBC, Thyroid tests
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Formats: PDF, JPG, PNG
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Report with AI'}
            </Button>
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </StyledPaper>

        {result && (
          <>
            {/* Disclaimer */}
            <Alert severity="warning" sx={{ mb: 3, fontWeight: 500 }}>
              ⚠️ {result.disclaimer}
            </Alert>

            {result.parameters && result.parameters.length > 0 ? (
              <>
                {/* Summary Stats with Risk Assessment */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9', border: '2px solid #4caf50' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                          {result.status_counts?.normal || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Normal Parameters
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#fff3e0', border: '2px solid #ff9800' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ color: '#e65100', fontWeight: 600 }}>
                          {result.status_counts?.borderline || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Borderline Values
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#ffebee', border: '2px solid #f44336' }}>
                      <CardContent>
                        <Typography variant="h4" sx={{ color: '#c62828', fontWeight: 600 }}>
                          {result.status_counts?.abnormal || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Abnormal Values
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ 
                      bgcolor: result.risk_assessment?.overall_risk === 'High' ? '#ffebee' : 
                               result.risk_assessment?.overall_risk === 'Moderate' ? '#fff3e0' : '#e8f5e9',
                      border: `2px solid ${result.risk_assessment?.overall_risk === 'High' ? '#f44336' : 
                                           result.risk_assessment?.overall_risk === 'Moderate' ? '#ff9800' : '#4caf50'}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ 
                          color: result.risk_assessment?.overall_risk === 'High' ? '#c62828' : 
                                 result.risk_assessment?.overall_risk === 'Moderate' ? '#e65100' : '#2e7d32',
                          fontWeight: 600 
                        }}>
                          {result.risk_assessment?.overall_risk || 'Low'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Risk Level
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* AI Analysis Info */}
                {result.ai_analysis && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      🤖 AI Analysis: {result.ai_analysis.model_used}
                    </Typography>
                    <Typography variant="caption">
                      Confidence: {result.ai_analysis.confidence} | 
                      Parameters Analyzed: {result.ai_analysis.parameters_analyzed} | 
                      Abnormalities: {result.ai_analysis.abnormalities_found}
                    </Typography>
                  </Alert>
                )}

                {/* Section 1: Extracted Parameters Table */}
                <StyledPaper sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon /> Lab Parameters Detected ({result.total_found})
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Test Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Normal Range</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.parameters.map((param, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{param.parameter}</TableCell>
                            <TableCell>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {param.value} {param.unit}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {param.normal_range} {param.unit}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(param.status)}
                                label={getStatusLabel(param.status)}
                                sx={{
                                  bgcolor: getStatusColor(param.status) + '20',
                                  color: getStatusColor(param.status),
                                  fontWeight: 600,
                                  border: `2px solid ${getStatusColor(param.status)}`
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </StyledPaper>

                {/* Section 2: AI Clinical Summary */}
                {result.clinical_summary && (
                  <StyledPaper sx={{ mb: 3, bgcolor: '#e3f2fd', border: '2px solid #2196f3' }}>
                    <Typography variant="h5" gutterBottom sx={{ color: '#1565c0', fontWeight: 600, mb: 2 }}>
                      🤖 AI Clinical Summary
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#424242' }}>
                      {result.clinical_summary}
                    </Typography>
                  </StyledPaper>
                )}

                {/* Section 3: Recommendations */}
                {result.general_recommendations && result.general_recommendations.length > 0 && (
                  <StyledPaper sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospitalIcon /> General Recommendations
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                      {result.general_recommendations.map((rec, idx) => (
                        <Typography component="li" key={idx} variant="body1" sx={{ mb: 1, lineHeight: 1.6 }}>
                          {rec}
                        </Typography>
                      ))}
                    </Box>
                  </StyledPaper>
                )}

                {/* Section 4: Suggested Diagnostic Models */}
                {result.suggested_models && result.suggested_models.length > 0 && (
                  <StyledPaper sx={{ bgcolor: '#fff3e0', border: '2px solid #ff9800' }}>
                    <Typography variant="h5" gutterBottom sx={{ color: '#e65100', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon /> Recommended Detailed Assessments
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Based on your abnormal parameters, our AI recommends these comprehensive health assessments:
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {result.suggested_models.map((model, idx) => (
                        <Grid item xs={12} md={6} key={idx}>
                          <Card sx={{ 
                            border: `2px solid ${model.priority === 'High' ? '#f44336' : '#ff9800'}`,
                            bgcolor: model.priority === 'High' ? '#ffebee' : '#fff',
                            '&:hover': { boxShadow: 4 } 
                          }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {model.name}
                                </Typography>
                                {model.confidence && (
                                  <Chip 
                                    label={model.confidence} 
                                    size="small" 
                                    color={model.priority === 'High' ? 'error' : 'warning'}
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {model.reason}
                              </Typography>
                              {model.priority && (
                                <Chip 
                                  label={`${model.priority} Priority`} 
                                  size="small" 
                                  color={model.priority === 'High' ? 'error' : 'warning'}
                                  sx={{ mb: 2 }}
                                />
                              )}
                              <Button
                                variant="contained"
                                color={model.priority === 'High' ? 'error' : 'warning'}
                                fullWidth
                                onClick={() => handleModelNavigation(model.model)}
                              >
                                Run {model.name}
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </StyledPaper>
                )}

                {/* Detailed Parameter Cards */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Detailed Parameter Analysis
                  </Typography>
                  {result.parameters.map((param, index) => (
                    <Card key={index} sx={{ mb: 2, border: `2px solid ${getStatusColor(param.status)}` }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {param.parameter}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(param.status)}
                            label={getStatusLabel(param.status)}
                            sx={{
                              bgcolor: getStatusColor(param.status) + '20',
                              color: getStatusColor(param.status),
                              fontWeight: 600,
                              border: `2px solid ${getStatusColor(param.status)}`
                            }}
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

                        {param.recommendations && param.status !== 'NORMAL' && (
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
                </Box>
              </>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                {result.clinical_summary || 'No standard medical parameters detected in this report.'}
              </Alert>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ReportAnalyzer;
