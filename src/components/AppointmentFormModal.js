import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const AppointmentFormModal = ({ open, onClose, doctor, patientName }) => {
  const [formData, setFormData] = useState({
    patient_name: patientName || '',
    symptoms: '',
    appointment_date: '',
    appointment_time: '',
    is_emergency: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          doctor_id: doctor.id,
          consultation_type: 'video'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create appointment');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
        Book Video Consultation
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Appointment request sent to Dr. {doctor?.name}. You will be notified once accepted.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              fullWidth
              label="Doctor"
              value={doctor?.name || ''}
              disabled
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Your Name"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              required
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Symptoms / Description"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              required
              multiline
              rows={4}
              margin="normal"
              placeholder="Describe your symptoms in detail..."
            />
            
            <TextField
              fullWidth
              label="Preferred Date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: today }}
            />
            
            <TextField
              fullWidth
              label="Preferred Time"
              name="appointment_time"
              type="time"
              value={formData.appointment_time}
              onChange={handleChange}
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="Consultation Type"
              value="Video Consultation"
              disabled
              margin="normal"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="is_emergency"
                  checked={formData.is_emergency}
                  onChange={handleChange}
                  color="error"
                />
              }
              label="Mark as Emergency"
              sx={{ mt: 1 }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || success}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default AppointmentFormModal;
