import React from 'react';
import { Container, Typography, Grid, TextField, Button, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

const ContactPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
}));

const Contact = () => {
  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        Have questions? We'd love to hear from you.
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <ContactPaper elevation={3}>
            <Typography variant="h4" gutterBottom>
              Get in Touch
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography>contact@healthai.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography>+1 (555) 123-4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography>123 Healthcare Street, Medical City, MC 12345</Typography>
              </Box>
            </Box>
          </ContactPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <ContactPaper elevation={3}>
            <Typography variant="h4" gutterBottom>
              Send us a Message
            </Typography>
            <Box component="form" sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="First Name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </ContactPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact; 