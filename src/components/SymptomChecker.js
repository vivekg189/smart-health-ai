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

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, duration, severity })
      });

      if (!response.ok) throw new Error('Failed to analyze symptoms');

      const data = await response.json();
      setResult(data);
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
                <FormControl fullWidth>
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
                <FormControl fullWidth>
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
          <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🔹 Top Predicted Condition
              </Typography>

              <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {result.top_prediction.disease}
                  </Typography>
                  <Chip
                    label={result.top_prediction.risk}
                    sx={{
                      bgcolor: getRiskColor(result.top_prediction.risk),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Confidence Score
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {result.top_prediction.confidence}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={result.top_prediction.confidence}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getRiskColor(result.top_prediction.risk)
                      }
                    }}
                  />
                </Box>

                {result.top_prediction.explanation && (
                  <Alert severity="info" icon={<CheckCircle size={20} />}>
                    {result.top_prediction.explanation}
                  </Alert>
                )}

                {getModelPath(result.top_prediction.disease) && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowRight size={20} />}
                    onClick={() => navigate(getModelPath(result.top_prediction.disease))}
                    sx={{ mt: 2, bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
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
