import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    maxWidth: '700px',
  },
}));

const MedicineRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  alignItems: 'center',
}));

const PrescriptionFormModal = ({ open, onClose, appointmentId }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '' }],
    dosage_instructions: '',
    recommendations: '',
    follow_up_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index][field] = value;
    setFormData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '' }]
    }));
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const newMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, medicines: newMedicines }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/prescription`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create prescription');
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
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
        Create Prescription
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Prescription created successfully! Patient will be notified.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              fullWidth
              label="Diagnosis Summary"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              multiline
              rows={3}
              margin="normal"
              placeholder="Enter diagnosis details..."
            />
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              Prescribed Medicines
            </Typography>
            
            {formData.medicines.map((medicine, index) => (
              <MedicineRow key={index}>
                <TextField
                  label="Medicine Name"
                  value={medicine.name}
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  required
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Dosage"
                  value={medicine.dosage}
                  onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                  required
                  placeholder="e.g., 500mg"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Frequency"
                  value={medicine.frequency}
                  onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                  required
                  placeholder="e.g., 2x daily"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => removeMedicine(index)}
                  disabled={formData.medicines.length === 1}
                  color="error"
                >
                  <Remove />
                </IconButton>
              </MedicineRow>
            ))}
            
            <Button
              startIcon={<Add />}
              onClick={addMedicine}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            >
              Add Medicine
            </Button>
            
            <TextField
              fullWidth
              label="Dosage Instructions"
              name="dosage_instructions"
              value={formData.dosage_instructions}
              onChange={handleChange}
              multiline
              rows={2}
              margin="normal"
              placeholder="e.g., Take after meals, avoid alcohol..."
            />
            
            <TextField
              fullWidth
              label="Additional Recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
              placeholder="Lifestyle changes, diet recommendations, etc..."
            />
            
            <TextField
              fullWidth
              label="Follow-up Date"
              name="follow_up_date"
              type="date"
              value={formData.follow_up_date}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: today }}
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
          {loading ? 'Submitting...' : 'Submit Prescription'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PrescriptionFormModal;
