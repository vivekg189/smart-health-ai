import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import TimelineIcon from '@mui/icons-material/Timeline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ServicePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: 'white',
}));

const Services = () => {
  const services = [
    {
      icon: <AccessibilityIcon fontSize="large" />,
      title: 'Improved Accessibility',
      description: 'AI makes it possible to offer healthcare services to underdeveloped countries and places with low accessibility',
    },
    {
      icon: <TimelineIcon fontSize="large" />,
      title: 'Early Diagnosis',
      description: 'Helps to discover the disease in the early stages and thus increases the chances of recovery',
    },
    {
      icon: <AttachMoneyIcon fontSize="large" />,
      title: 'Reduce Cost',
      description: 'AI minimizes the work of medical personnel and avoids very expensive medical examinations and tests',
    },
    {
      icon: <VerifiedIcon fontSize="large" />,
      title: 'Accurate',
      description: 'We use the top performing machine learning algorithms and models to ensure highly accurate prediction',
    },
    {
      icon: <SpeedIcon fontSize="large" />,
      title: 'Quick Predictions',
      description: 'With our app, the patient has only to enter a few parameters/personal information and get the diagnosis in seconds',
    },
    {
      icon: <ErrorOutlineIcon fontSize="large" />,
      title: 'No Human Errors',
      description: 'The use of AI in medicine reduces the involvement of humans by automating medical procedures which eliminates the rate of human error',
    },
  ];

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Our Services
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        Discover how our AI-powered healthcare solutions can help you
      </Typography>
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {services.map((service, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <ServicePaper elevation={3}>
              <IconWrapper>
                {service.icon}
              </IconWrapper>
              <Typography variant="h5" component="h3" gutterBottom>
                {service.title}
              </Typography>
              <Typography color="text.secondary">
                {service.description}
              </Typography>
            </ServicePaper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Services; 