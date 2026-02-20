import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Paper
} from '@mui/material';
import { Activity, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (symptoms.trim().length < 10) {
      setError('Please describe your symptoms in at least 10 characters');
      return;
    }

    if (!duration) {
      setError('Please select duration');
      return;
    }

    if (!severity) {
      setError('Please select severity');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symptoms, duration, severity })
      });

      if (!response.ok) throw new Error('Failed to analyze symptoms');

      const data = await response.json();
      setResult(data);
      
      // Show success notification
      console.log('✅ Symptom analysis saved successfully. Your report has been sent to doctors for review.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'High') return '#f44336';
    if (risk === 'Moderate') return '#ff9800';
    return '#4caf50';
  };

  const getModelPath = (disease) => {
    const mapping = {
      'Heart Disease': '/heart',
      'Diabetes': '/diabetes',
      'Liver Disease': '/liver',
      'Kidney Disease': '/kidney'
    };
    return mapping[disease] || null;
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Activity size={32} color="#4caf50" style={{ marginRight: 12 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                AI Symptom Checker
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Describe your symptoms and get AI-powered disease insights
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Describe Your Symptoms"
              placeholder="Example: I have fever, headache and body pain for 2 days."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    label="Duration"
                  >
                    <MenuItem value="">Select Duration</MenuItem>
                    <MenuItem value="1-2 days">1-2 days</MenuItem>
                    <MenuItem value="3-7 days">3-7 days</MenuItem>
                    <MenuItem value="1-2 weeks">1-2 weeks</MenuItem>
                    <MenuItem value="More than 2 weeks">More than 2 weeks</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    label="Severity"
                  >
                    <MenuItem value="">Select Severity</MenuItem>
                    <MenuItem value="Mild">Mild</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="Severe">Severe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Analyze Symptoms'}
            </Button>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          {result.fallback_mode && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                ⚠️ AI service temporarily unavailable. Basic rule-based analysis provided. For accurate diagnosis, please consult a healthcare professional.
              </Typography>
            </Alert>
          )}

          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              ✅ Your symptom analysis has been saved and sent to doctors for review. You can track the approval status in your Patient Dashboard.
            </Typography>
          </Alert>

          {/* Symptom Comparison Card */}
          {result.has_past_history && result.symptom_comparison && (
            <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 3, border: '2px solid #0ea5e9' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Activity size={28} color="#0ea5e9" style={{ marginRight: 12 }} />
                  <Typography variant="h6" fontWeight={800}>
                    Symptom Comparison Summary
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                      <Typography variant="caption" color="textSecondary" fontWeight={600}>
                        Relation Status
                      </Typography>
                      <Chip
                        label={String(result.symptom_comparison.relation_status || 'Unknown')}
                        sx={{
                          mt: 1,
                          bgcolor: result.symptom_comparison.relation_status === 'Related' ? '#f59e0b' : '#10b981',
                          color: 'white',
                          fontWeight: 700
                        }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                      <Typography variant="caption" color="textSecondary" fontWeight={600}>
                        Symptom Overlap
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                        {typeof result.symptom_comparison.overlap_percentage === 'number' 
                          ? result.symptom_comparison.overlap_percentage 
                          : String(result.symptom_comparison.overlap_percentage || '0')}%
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {String(result.symptom_comparison.comparison_summary || 'No comparison summary available')}
                  </Typography>
                </Alert>

                {result.severity_change && result.severity_change !== 'New Condition' && (
                  <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 2, border: '1px solid #fbbf24' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#92400e">
                      Severity Change: {result.severity_change}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  borderBottom: '1px solid #e5e7eb',
                  bgcolor: '#0f766e',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    HealthAI Medical Center
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    AI DIAGNOSTIC SUMMARY
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', fontSize: '0.75rem' }}>
                  <Typography>Report ID: {result.report_id || 'AUTO-GEN'}</Typography>
                  <Typography>
                    Generated:{' '}
                    {new Date().toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Patient / meta block */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Patient Name
                    </Typography>
                    <Typography fontWeight={600}>
                      {result.patient_name || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="textSecondary">
                      Report Date
                    </Typography>
                    <Typography fontWeight={600}>
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="textSecondary">
                      Severity (self‑reported)
                    </Typography>
                    <Typography fontWeight={600}>
                      {severity || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    bgcolor: '#fafafa'
                  }}
                >
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Chief Complaint
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {symptoms}
                  </Typography>
                </Paper>

                {/* Top condition block */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    borderRadius: 2,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: 0.08 }}
                      >
                        Primary Suspected Condition
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {String(result.top_prediction.disease || 'Unknown')}
                      </Typography>
                    </Box>
                    <Chip
                      label={String(result.top_prediction.risk || 'Unknown')}
                      sx={{
                        bgcolor: getRiskColor(result.top_prediction.risk),
                        color: 'white',
                        fontWeight: 700,
                        px: 1
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        Confidence Score
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            Model estimate
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {typeof result.top_prediction.confidence === 'number' 
                              ? result.top_prediction.confidence 
                              : String(result.top_prediction.confidence || '0')}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={result.top_prediction.confidence}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getRiskColor(result.top_prediction.risk)
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        Suggested Next Step
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {result.top_prediction.next_step ||
                          'Schedule a clinical consultation and share this report with your doctor for confirmation.'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {result.top_prediction.explanation && (
                    <Alert
                      severity="info"
                      icon={<CheckCircle size={20} />}
                      sx={{ mt: 2 }}
                    >
                      {String(result.top_prediction.explanation)}
                    </Alert>
                  )}

                  {getModelPath(result.top_prediction.disease) && (
                    <Button
                      variant="contained"
                      endIcon={<ArrowRight size={20} />}
                      onClick={() =>
                        navigate(getModelPath(result.top_prediction.disease))
                      }
                      sx={{
                        mt: 2,
                        bgcolor: '#2196f3',
                        '&:hover': { bgcolor: '#1976d2' }
                      }}
                    >
                      Run Detailed {result.top_prediction.disease} Assessment
                    </Button>
                  )}
                </Paper>

                {result.other_conditions.length > 0 && (
                  <>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
                      🔹 Other Possible Conditions
                    </Typography>

                    {result.other_conditions.map((condition, idx) => (
                      <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {condition.disease}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={condition.confidence}
                                sx={{
                                  width: 200,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#e0e0e0',
                                  mr: 2
                                }}
                              />
                              <Typography variant="body2" color="textSecondary">
                                {condition.confidence}%
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={condition.risk}
                            size="small"
                            sx={{
                              bgcolor: getRiskColor(condition.risk),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Paper>
                    ))}
                  </>
                )}

                {result.recommended_steps && result.recommended_steps.length > 0 && (
                  <Paper elevation={0} sx={{ p: 2.5, mt: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', bgcolor: '#fefce8' }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#854d0e' }}>
                      🎯 Recommended Next Steps
                    </Typography>
                    {result.recommended_steps.map((step, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                        <CheckCircle size={16} color="#ca8a04" style={{ marginRight: 8, marginTop: 2 }} />
                        <Typography variant="body2">{step}</Typography>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>
            </CardContent>
          </Card>

          <Alert severity="warning" icon={<AlertTriangle size={20} />}>
            <Typography variant="body2" fontWeight={600}>
              Disclaimer: This AI symptom checker provides preliminary insights and does not replace professional medical consultation. Please consult a qualified healthcare provider for accurate diagnosis and treatment.
            </Typography>
          </Alert>
        </>
      )}
    </Box>
  );
};

export default SymptomChecker;
