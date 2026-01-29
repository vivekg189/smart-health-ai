import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
}));

const About = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          About Our Healthcare Risk Assessment Platform
        </Typography>

        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom>
            Our Mission
          </Typography>
          <Typography paragraph>
            We are dedicated to providing accessible and accurate health risk assessments using advanced machine learning technology. Our platform helps individuals understand their potential health risks and encourages proactive healthcare management.
          </Typography>
        </StyledPaper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <Typography variant="h5" gutterBottom>
                What We Offer
              </Typography>
              <Typography component="ul" sx={{ pl: 2 }}>
                <li>Heart Disease Risk Assessment</li>
                <li>Diabetes Risk Assessment</li>
                <li>Liver Disease Risk Assessment</li>
                <li>Kidney Disease Risk Assessment</li>
              </Typography>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <Typography variant="h5" gutterBottom>
                Our Technology
              </Typography>
              <Typography paragraph>
                Our risk assessment tools are powered by state-of-the-art machine learning models trained on extensive medical datasets. We continuously update our models to ensure the highest accuracy in predictions.
              </Typography>
            </StyledPaper>
          </Grid>
        </Grid>

        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom>
            Important Note
          </Typography>
          <Typography paragraph>
            While our platform provides valuable insights into potential health risks, it is not a substitute for professional medical advice. Always consult with healthcare professionals for proper diagnosis and treatment.
          </Typography>
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default About; 