import React, { useState } from 'react';
import { Typography, Box, Paper, Button, Container, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KidneyForm from '../components/KidneyForm';

const kidneySymptoms = [
  'Swelling in legs, ankles, or feet',
  'Fatigue and weakness',
  'Shortness of breath',
  'Nausea',
  'Confusion or trouble concentrating',
  'Decreased urine output',
  'Persistent itching',
  'High blood pressure',
];
const kidneyVariables = [
  'Age',
  'Blood Pressure',
  'Specific Gravity',
  'Albumin',
  'Sugar',
  'Red Blood Cells',
  'Pus Cell',
  'Pus Cell Clumps',
  'Bacteria',
  'Blood Glucose Random',
  'Blood Urea',
  'Serum Creatinine',
  'Sodium',
  'Potassium',
  'Hemoglobin',
  'Packed Cell Volume',
  'White Blood Cell Count',
  'Red Blood Cell Count',
  'Hypertension',
  'Diabetes Mellitus',
  'Coronary Artery Disease',
  'Appetite',
  'Pedal Edema',
  'Anemia',
];

const KidneyInfo = () => {
  const [open, setOpen] = useState(false);
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, maxWidth: 700, mx: 'auto', mt: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, mb: 2, background: 'linear-gradient(90deg, #2196f3, #4caf50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Kidney Disease
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
          Symptoms:
        </Typography>
        <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
          {kidneySymptoms.map((sym, i) => (
            <li key={i} style={{ marginBottom: 6 }}><Typography variant="body1">{sym}</Typography></li>
          ))}
        </ul>
        <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
          Variables used for prediction:
        </Typography>
        <ul style={{ marginBottom: 24, paddingLeft: 24 }}>
          {kidneyVariables.map((v, i) => (
            <li key={i} style={{ marginBottom: 4 }}><Typography variant="body2">{v}</Typography></li>
          ))}
        </ul>
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ px: 5, py: 1.5, borderRadius: 3, fontWeight: 600, fontSize: '1.1rem', background: 'linear-gradient(90deg, #2196f3, #4caf50)' }}
            onClick={() => setOpen(true)}
          >
            Start Prediction
          </Button>
        </Box>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ position: 'relative', p: { xs: 1, md: 4 } }}>
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
          <KidneyForm />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default KidneyInfo; 