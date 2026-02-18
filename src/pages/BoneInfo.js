import React from 'react';
import { Typography, Box, Paper, Container } from '@mui/material';
import BoneForm from '../components/BoneForm';

const boneSymptoms = [
  'Pain at the site of injury',
  'Swelling',
  'Bruising or discoloration',
  'Deformity or abnormal appearance',
  'Inability to use the limb',
  'Crepitus (grating sensation)',
  'Open wound (in case of open fracture)',
];
const boneVariables = [
  'X-ray image',
  'Patient age',
  'Location of injury',
  'History of trauma',
  'Other relevant clinical details',
];

const BoneInfo = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, maxWidth: 700, mx: 'auto', mt: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            mb: 3,
            background: 'linear-gradient(90deg, #2196f3, #4caf50)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Bone Fracture Detection
        </Typography>
        <Box mt={4}>
          <BoneForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default BoneInfo; 