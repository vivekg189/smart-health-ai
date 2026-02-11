import React, { useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, Box, Dialog, DialogContent, Fade, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import DiabetesForm from '../components/DiabetesForm';
import LiverForm from '../components/LiverForm';
import KidneyForm from '../components/KidneyForm';
import HeartForm from '../components/HeartForm';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import VerifiedIcon from '@mui/icons-material/Verified';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
  minHeight: '100vh',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(8),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -20,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 60,
    height: 4,
    background: 'linear-gradient(90deg, #1a237e 0%, #4a148c 100%)',
    borderRadius: 2,
  }
}));

const GradientTitle = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 50%, #880e4f 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 900,
  marginBottom: theme.spacing(2),
}));

const ModelCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
    '& .MuiButton-root': {
      background: 'linear-gradient(45deg, #1a237e 30%, #4a148c 90%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(26, 35, 126, 0.3)',
    }
  }
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  transition: 'transform 0.3s ease-in-out',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
  }
}));

const ModelButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'linear-gradient(45deg, #1a237e 30%, #4a148c 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #283593 30%, #6a1b9a 90%)',
  }
}));

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  background: 'rgba(26, 35, 126, 0.05)',
}));

const Models = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showLiverForm, setShowLiverForm] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <SearchIcon sx={{ color: '#1a237e' }} />,
      title: 'Advanced AI Detection',
      description: 'State-of-the-art machine learning algorithms for accurate predictions'
    },
    {
      icon: <ScienceIcon sx={{ color: '#1a237e' }} />,
      title: 'Clinically Validated',
      description: 'Models trained on extensive medical datasets'
    },
    {
      icon: <VerifiedIcon sx={{ color: '#1a237e' }} />,
      title: 'High Accuracy',
      description: '99.8% accuracy rate in disease prediction'
    }
  ];

  const liverSymptoms = [
    'Jaundice (yellowing of skin/eyes)',
    'Fatigue',
    'Abdominal pain/swelling',
    'Nausea or vomiting',
    'Loss of appetite',
    'Dark urine',
    'Pale stool color',
    'Swelling in legs/ankles',
    'Easy bruising or bleeding',
  ];
  const liverVariables = [
    'Age',
    'Gender',
    'Total Bilirubin',
    'Direct Bilirubin',
    'Alkaline Phosphotase',
    'Alamine Aminotransferase',
    'Aspartate Aminotransferase',
    'Total Proteins',
    'Albumin',
    'Albumin and Globulin Ratio',
  ];

  const models = [
    {
      title: 'Liver Disease',
      description: 'Check your chance of getting a chronic liver disease',
      image:'https://psrihospital.com/wp-content/uploads/2023/07/fatty-liver-disease-a-silent-killer.webp',
      form: <LiverForm />,
    },
    {
      title: 'Diabetes',
      description: 'Predict diabetes risk using health metrics and lifestyle factors.',
      image: 'https://assets.telegraphindia.com/telegraph/5e5b81e5-e60f-42d9-8f3f-d2e5f1a691e1.jpg',
      form: <DiabetesForm />,
    },
    {
      title: 'Kidney Disease',
      description: 'Predict kidney disease using comprehensive health parameters and test results.',
      image: 'https://www.cdc.gov/diabetes/images/library/features/kidney-failure-diabetes.jpg',
      form: <KidneyForm />,
    },
    {
      title: 'Heart Disease',
      description: 'Predict heart disease risk using cardiac parameters and medical history.',
      image: 'https://myhealthcentre.ca/wp-content/uploads/2024/04/What-Are-the-Top-10-Rare-Heart-Diseases-in-Canada_.jpg',
      form: <HeartForm />,
    },
    {
      title: 'Brain Tumor',
      description: 'Coming soon: Predict brain tumor using MRI scan images.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      comingSoon: true,
    },
  ];

  const handleModelClick = (model) => {
    setSelectedModel(model);
    setOpenDialog(true);
    setShowLiverForm(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedModel(null);
  };

  return (
    <PageContainer maxWidth="lg">
      <HeaderSection>
        <GradientTitle variant="h2" component="h1">
          AI-Powered Disease Prediction
        </GradientTitle>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '800px', margin: '0 auto', mb: 4 }}>
          Choose from our comprehensive range of AI-powered disease prediction models
        </Typography>

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <FeatureBox>
                {feature.icon}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </FeatureBox>
            </Grid>
          ))}
        </Grid>
      </HeaderSection>

      <Grid container spacing={4}>
        {models.map((model, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Fade in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
              <ModelCard>
                <StyledCardMedia
                  component="img"
                  height="200"
                  image={model.image}
                  alt={model.title}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography 
                    gutterBottom 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 700,
                      color: '#1a237e',
                      mb: 2
                    }}
                  >
                    {model.title}
                  </Typography>
                  <Typography 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.6,
                      mb: 2
                    }}
                  >
                    {model.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 3, pt: 0 }}>
                  {model.comingSoon ? (
                    <ModelButton fullWidth disabled>
                      Coming Soon
                    </ModelButton>
                  ) : (
                    <ModelButton
                      fullWidth
                      onClick={() => {
                        if (model.title === 'Liver Disease') navigate('/liver-info');
                        else if (model.title === 'Diabetes') navigate('/diabetes-info');
                        else if (model.title === 'Kidney Disease') navigate('/kidney-info');
                        else if (model.title === 'Heart Disease') navigate('/heart-info');
                      }}
                    >
                      Click here to know more
                    </ModelButton>
                  )}
                </Box>
              </ModelCard>
            </Fade>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogContent>
          {selectedModel?.title === 'Liver Disease' && !showLiverForm ? (
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, maxWidth: 600, mx: 'auto', mt: 2 }}>
              <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, mb: 2, background: 'linear-gradient(90deg, #2196f3, #4caf50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Chronic Liver Disease
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
                Symptoms:
              </Typography>
              <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
                {liverSymptoms.map((sym, i) => (
                  <li key={i} style={{ marginBottom: 6 }}><Typography variant="body1">{sym}</Typography></li>
                ))}
              </ul>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
                Variables used for prediction:
              </Typography>
              <ul style={{ marginBottom: 24, paddingLeft: 24 }}>
                {liverVariables.map((v, i) => (
                  <li key={i} style={{ marginBottom: 4 }}><Typography variant="body2">{v}</Typography></li>
                ))}
              </ul>
              <Box textAlign="center" mt={4}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ px: 5, py: 1.5, borderRadius: 3, fontWeight: 600, fontSize: '1.1rem', background: 'linear-gradient(90deg, #2196f3, #4caf50)' }}
                  onClick={() => setShowLiverForm(true)}
                >
                  Click for Testing
                </Button>
              </Box>
            </Paper>
          ) : selectedModel?.form}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Models; 