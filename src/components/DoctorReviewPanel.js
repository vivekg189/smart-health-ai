import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';
import { CheckCircle, XCircle, Edit } from 'lucide-react';

const DoctorReviewPanel = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [modifiedDisease, setModifiedDisease] = useState('');
  const [modifiedRisk, setModifiedRisk] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingReviews();
    const interval = setInterval(fetchPendingReviews, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctor/pending-reviews', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        console.log('Pending reviews:', data.predictions);
        setPendingReviews(data.predictions || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientHistory = async (patientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/patient-history/${patientId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPatientHistory(data.predictions || []);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handleReview = async (predictionId, action, modifiedData = null) => {
    try {
      await fetch('http://localhost:5000/api/doctor/review-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prediction_id: predictionId,
          action,
          remarks,
          modified_prediction: modifiedData
        })
      });
      
      fetchPendingReviews();
      setSelectedPrediction(null);
      setRemarks('');
      setModifiedDisease('');
      setModifiedRisk('');
    } catch (err) {
      console.error('Error reviewing:', err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Prediction Review Requests ({pendingReviews.length})
      </Typography>
      
      {pendingReviews.length === 0 ? (
        <Alert severity="info">No pending reviews</Alert>
      ) : (
        <Grid container spacing={2}>
          {pendingReviews.map(pred => (
            <Grid item xs={12} md={6} key={pred.id}>
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>{pred.patient_name}</Typography>
                    <Chip label="Pending Review" color="warning" size="small" />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>ML Prediction:</strong> {pred.disease_type} - {pred.risk_level}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Probability:</strong> {(pred.probability * 100).toFixed(1)}%
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    {new Date(pred.created_at).toLocaleString()}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setSelectedPrediction(pred);
                      setModifiedDisease(pred.disease_type);
                      setModifiedRisk(pred.risk_level);
                      loadPatientHistory(pred.patient_id);
                    }}
                    sx={{ mt: 2, width: '100%' }}
                  >
                    Review
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedPrediction && (
        <Dialog open onClose={() => setSelectedPrediction(null)} maxWidth="md" fullWidth>
          <DialogTitle>Review Prediction - {selectedPrediction.patient_name}</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>ML Prediction</Typography>
              <Typography variant="body2">
                Disease: {selectedPrediction.disease_type} | Risk: {selectedPrediction.risk_level} | 
                Confidence: {(selectedPrediction.probability * 100).toFixed(1)}%
              </Typography>
            </Alert>

            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Patient Input Data:</Typography>
              {selectedPrediction.input_data && Object.entries(selectedPrediction.input_data).map(([key, value]) => (
                <Typography key={key} variant="body2">
                  <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                </Typography>
              ))}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>Patient History:</Typography>
              {patientHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No previous assessments</Typography>
              ) : (
                patientHistory.map(h => (
                  <Typography key={h.id} variant="body2" color="text.secondary">
                    {h.disease_type} - {h.risk_level} - {h.status} ({new Date(h.created_at).toLocaleDateString()})
                  </Typography>
                ))
              )}
            </Box>

            <TextField
              label="Medical Remarks"
              multiline
              rows={4}
              fullWidth
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              sx={{ my: 2 }}
              placeholder="Add your clinical assessment and recommendations..."
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Modified Disease Type"
                fullWidth
                value={modifiedDisease}
                onChange={(e) => setModifiedDisease(e.target.value)}
                placeholder={selectedPrediction.disease_type}
              />
              <TextField
                label="Modified Risk Level"
                fullWidth
                value={modifiedRisk}
                onChange={(e) => setModifiedRisk(e.target.value)}
                placeholder={selectedPrediction.risk_level}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedPrediction(null)}>Cancel</Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle size={18} />}
              onClick={() => handleReview(selectedPrediction.id, 'approved')}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<Edit size={18} />}
              onClick={() => handleReview(selectedPrediction.id, 'modified', {
                disease_type: modifiedDisease || selectedPrediction.disease_type,
                risk_level: modifiedRisk || selectedPrediction.risk_level
              })}
            >
              Modify
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<XCircle size={18} />}
              onClick={() => handleReview(selectedPrediction.id, 'rejected')}
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default DoctorReviewPanel;
