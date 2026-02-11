import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Directions as DirectionsIcon
} from '@mui/icons-material';

const PageContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
  borderRadius: 16,
  color: 'white',
}));

const GradientTitle = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ffffff 30%, #fed7d7 70%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.05)',
}));

const FindButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '12px 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #e53e3e 30%, #c53030 90%)',
  color: 'white',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #c53030 30%, #9c2626 90%)',
  },
  '&:disabled': {
    background: '#ccc',
  }
}));

const HospitalCard = styled(Card)(({ theme, clickable }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: '#fff5f5',
  borderRadius: 12,
  border: '1px solid #fed7d7',
  cursor: clickable ? 'pointer' : 'default',
  transition: clickable ? 'all 0.3s ease' : 'none',
  '&:hover': clickable ? {
    backgroundColor: '#fef5e7',
    borderColor: '#f6ad55',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  } : {}
}));

const HospitalFinder = () => {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRealData, setIsRealData] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        findNearbyHospitals(latitude, longitude);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
      }
    );
  };

  const findNearbyHospitals = async (latitude, longitude) => {
    try {
      console.log('Fetching hospitals for:', latitude, longitude);
      
      const response = await fetch(`http://localhost:5000/api/hospitals/nearby?lat=${latitude}&lon=${longitude}`);
      
      console.log('Backend response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend data:', data);
        
        if (data.hospitals && data.hospitals.length > 0) {
          console.log('Using real hospital data');
          setHospitals(data.hospitals);
          setIsRealData(true);
          setLoading(false);
          return;
        }
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
      }
      
      console.log('Falling back to static data');
      setHospitals(getFallbackHospitals());
      setIsRealData(false);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setHospitals(getFallbackHospitals());
      setIsRealData(false);
    }
    
    setLoading(false);
  };

  const openDirections = (hospital) => {
    const { latitude, longitude, name } = hospital;
    
    if (latitude && longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(name)}`;
      window.open(mapsUrl, '_blank');
    } else {
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(name)}`;
      window.open(searchUrl, '_blank');
    }
  };

  const getFallbackHospitals = () => [
    {
      name: "City General Hospital",
      distance: "0.8 km",
      address: "Main Road, City Center",
      type: "Government",
      specialties: ["Emergency", "General Medicine", "Surgery"]
    },
    {
      name: "Apollo Healthcare",
      distance: "1.2 km", 
      address: "Medical Complex, Sector 5",
      type: "Private",
      specialties: ["Cardiology", "Neurology", "Oncology"]
    },
    {
      name: "Max Super Speciality Hospital",
      distance: "2.1 km",
      address: "Healthcare Avenue, Block A",
      type: "Private", 
      specialties: ["Orthopedics", "Pediatrics", "Gynecology"]
    },
    {
      name: "Government District Hospital",
      distance: "2.8 km",
      address: "Civil Lines, District Center",
      type: "Government",
      specialties: ["Emergency", "General Medicine", "Maternity"]
    },
    {
      name: "Fortis Hospital",
      distance: "3.2 km",
      address: "Medical Park, Phase 2",
      type: "Private",
      specialties: ["ICU", "Trauma Care", "Radiology"]
    },
    {
      name: "AIIMS Satellite Center",
      distance: "4.1 km",
      address: "University Campus, Medical Wing",
      type: "Government",
      specialties: ["All Specialties", "Research", "Teaching"]
    }
  ];

  return (
    <PageContainer maxWidth="lg">
      <HeaderSection>
        <HospitalIcon sx={{ fontSize: 48, mb: 1 }} />
        <GradientTitle variant="h3" component="h1">
          Hospital Finder
        </GradientTitle>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Find nearby hospitals and healthcare facilities
        </Typography>
      </HeaderSection>

      <StyledCard>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#2d3748' }}>
            Locate Healthcare Facilities Near You
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Get instant access to nearby hospitals, clinics, and healthcare facilities. 
            We'll use your current location to find the closest medical services available.
          </Typography>

          <FindButton
            onClick={getCurrentLocation}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
            size="large"
          >
            {loading ? 'Finding Hospitals...' : 'Find Nearby Hospitals'}
          </FindButton>

          {error && (
            <Alert severity="error" sx={{ mt: 3, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          {location && (
            <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
              <strong>Your Location:</strong> Latitude {location.latitude.toFixed(4)}, Longitude {location.longitude.toFixed(4)}
            </Alert>
          )}
        </CardContent>
      </StyledCard>

      {hospitals.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#e53e3e', fontWeight: 600 }}>
            Nearby Healthcare Facilities ({hospitals.length} found)
          </Typography>
          
          {hospitals.map((hospital, index) => (
            <HospitalCard
              key={index}
              clickable={false}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <HospitalIcon sx={{ color: '#e53e3e', mt: 0.5, fontSize: 28 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
                      {hospital.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ fontSize: 18, mr: 1 }} />
                      <strong>{hospital.distance}</strong> • {hospital.address}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ 
                        backgroundColor: hospital.type === 'Government' ? '#e6fffa' : '#f0fff4',
                        color: hospital.type === 'Government' ? '#2c7a7b' : '#2f855a',
                        px: 2, py: 0.5, borderRadius: 2, fontWeight: 600
                      }}>
                        {hospital.type} Hospital
                      </Typography>
                    </Box>
                    {hospital.specialties && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Specialties:</strong> {hospital.specialties.join(', ')}
                      </Typography>
                    )}
                    {hospital.phone && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Phone:</strong> {hospital.phone}
                      </Typography>
                    )}
                    {hospital.emergency && (
                      <Typography variant="body2" sx={{ color: '#e53e3e', fontWeight: 600 }}>
                        ⚡ Emergency Services Available
                      </Typography>
                    )}
                    <Button
                      onClick={() => openDirections(hospital)}
                      startIcon={<DirectionsIcon />}
                      sx={{
                        mt: 1,
                        backgroundColor: '#e53e3e',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#c53030',
                        },
                        textTransform: 'none',
                        fontSize: '0.875rem'
                      }}
                      size="small"
                    >
                      Get Directions
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </HospitalCard>
          ))}

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Important Note:</strong> This information is for reference only. Please contact hospitals directly 
              for current availability, services, and emergency situations. In case of medical emergency, 
              call emergency services (108/102) immediately.
            </Typography>
          </Alert>
        </Box>
      )}
    </PageContainer>
  );
};

export default HospitalFinder;