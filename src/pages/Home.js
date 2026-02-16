import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Avatar,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  styled
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 50%, #880e4f 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(18, 0, 120, 0.3) 0%, transparent 50%)',
    pointerEvents: 'none',
  }
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 70%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
  fontWeight: 900,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  borderRadius: '24px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
  }
}));

const FeatureIcon = styled(Avatar)(({ gradient }) => ({
  width: 80,
  height: 80,
  background: gradient || 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
  margin: '0 auto 16px',
}));

const StatsSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4a148c 0%, #880e4f 50%, #b71c1c 100%)',
  color: 'white',
  padding: theme.spacing(12, 0),
  position: 'relative',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 4),
  textAlign: 'center',
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  transition: 'all 0.4s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    background: 'rgba(255,255,255,0.15)',
  }
}));

const ModernButton = styled(Button)(({ variant: buttonVariant, theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(buttonVariant === 'primary' && {
    background: 'linear-gradient(45deg, #1a237e 30%, #4a148c 90%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(45deg, #283593 30%, #6a1b9a 90%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(26, 35, 126, 0.4)',
    }
  }),
  ...(buttonVariant === 'secondary' && {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: 'white',
    '&:hover': {
      background: 'rgba(255,255,255,0.2)',
      borderColor: 'rgba(255,255,255,0.5)',
      transform: 'translateY(-2px)',
    }
  })
}));

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <SpeedIcon fontSize="large" />,
      title: 'Lightning Fast',
      description: 'Get instant AI-powered health predictions with cutting-edge algorithms.',
      gradient: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)'
    },
    {
      icon: <VerifiedIcon fontSize="large" />,
      title: '99.8% Accuracy',
      description: 'Clinically validated health assessments from advanced ML models.',
      gradient: 'linear-gradient(135deg, #4a148c 0%, #880e4f 100%)'
    },
    {
      icon: <AccessibilityIcon fontSize="large" />,
      title: 'Universal Access',
      description: 'Accessible 24/7 from any device, anywhere in the world.',
      gradient: 'linear-gradient(135deg, #880e4f 0%, #b71c1c 100%)'
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: 'Bank-Level Security',
      description: 'Encrypted and protected with military-grade security protocols.',
      gradient: 'linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)'
    },
  ];

  const stats = [
    { number: '1M+', label: 'Predictions Made', icon: <TrendingUpIcon fontSize="large" /> },
    { number: '50K+', label: 'Lives Improved', icon: <FavoriteIcon fontSize="large" /> },
    { number: '99.8%', label: 'Accuracy Rate', icon: <PsychologyIcon fontSize="large" /> },
  ];

  const handleStartPrediction = () => {
    navigate('/auth');
  };

  return (
    <>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Fade in={isVisible} timeout={1000}>
              <Box>
                {/* Main Title */}
                <GradientText
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem', lg: '5.5rem' },
                    mb: 3,
                    lineHeight: 1.1
                  }}
                >
                  AI-Powered Healthcare
                </GradientText>
                {/* Subtitle */}
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.6rem', lg: '2rem' },
                    mb: 6,
                    opacity: 0.9,
                    fontWeight: 300,
                    maxWidth: '800px',
                    margin: '0 auto 48px',
                    lineHeight: 1.5,
                    color: 'white'
                  }}
                >
                  Revolutionizing healthcare with intelligent predictions that make the complex world of medicine accessible to everyone.
                </Typography>
                {/* CTA Buttons */}
                <Box sx={{
                  display: 'flex',
                  gap: 3,
                  justifyContent: 'center',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center'
                }}>
                  <ModernButton
                    variant="primary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleStartPrediction}
                  >
                    Start Free Prediction
                  </ModernButton>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Container>
      </HeroSection>
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 15 }}>
        {/* Section Header */}
        <Box textAlign="center" mb={10}>
          <Typography
            variant="h2"
            sx={{
              background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 50%, #880e4f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'bold',
              mb: 3,
              fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' }
            }}
          >
            Why Choose Our AI Platform?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: '600px',
              margin: '0 auto',
              fontSize: '1.2rem',
              lineHeight: 1.6
            }}
          >
            Experience the future of healthcare with our revolutionary AI technology.
          </Typography>
        </Box>
        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Slide
                direction="up"
                in={isVisible}
                timeout={600 + index * 200}
              >
                <FeatureCard
                  elevation={activeFeature === index ? 8 : 2}
                  sx={{
                    transform: activeFeature === index ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <FeatureIcon gradient={feature.gradient}>
                      {feature.icon}
                    </FeatureIcon>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        background: feature.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.7,
                        fontSize: '0.95rem'
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* Stats Section */}
      <StatsSection>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <StatCard elevation={0}>
                  <Box sx={{ color: 'white', mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: 'white',
                      mb: 1,
                      fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 'medium'
                    }}
                  >
                    {stat.label}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </StatsSection>
    </>
  );
};

export default Home;
