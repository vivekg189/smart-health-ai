import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.05)',
}));

const FindButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 24px',
  fontSize: '1rem',
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

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: '#e53e3e',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const HospitalCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  backgroundColor: '#fff5f5',
  borderRadius: 8,
  border: '1px solid #fed7d7',
}));

const HospitalFinder = () => {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [minRating, setMinRating] = useState(1);

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
      const response = await fetch(`http://localhost:5000/api/hospitals/nearby?lat=${latitude}&lon=${longitude}`);

      if (response.ok) {
        const data = await response.json();
        setHospitals(data.hospitals || []);
      } else {
        setError('Failed to fetch hospital data. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    }

    setLoading(false);
  };

  const getFallbackHospitals = () => [
    {
      name: "City General Hospital",
      distance: "0.8 km",
      address: "Main Road, City Center",
      type: "Government",
      specialties: ["Emergency", "General Medicine", "Surgery"],
      rating: 4.2,
      recommendation_reason: "Excellent emergency services and general care"
    },
    {
      name: "Apollo Healthcare",
      distance: "1.2 km",
      address: "Medical Complex, Sector 5",
      type: "Private",
      specialties: ["Cardiology", "Neurology", "Oncology"],
      rating: 4.8,
      recommendation_reason: "Top-rated for cardiac care and advanced treatments"
    },
    {
      name: "Max Super Speciality Hospital",
      distance: "2.1 km",
      address: "Healthcare Avenue, Block A",
      type: "Private",
      specialties: ["Orthopedics", "Pediatrics", "Gynecology"],
      rating: 4.5,
      recommendation_reason: "Specialized in bone and joint care with excellent pediatric services"
    },
    {
      name: "Government District Hospital",
      distance: "2.8 km",
      address: "Civil Lines, District Center",
      type: "Government",
      specialties: ["Emergency", "General Medicine", "Maternity"],
      rating: 3.8,
      recommendation_reason: "Reliable public healthcare with maternity services"
    }
  ];

  const specialtyOptions = [
    'All',
    'Cardiology',
    'Emergency',
    'Orthopedics',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Gynecology',
    'General Medicine',
    'Surgery',
    'Maternity'
  ];

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All' ||
      (hospital.specialties && hospital.specialties.some(spec =>
        spec.toLowerCase().includes(selectedSpecialty.toLowerCase())
      ));
    const matchesRating = hospital.rating >= minRating;
    return matchesSpecialty && matchesRating;
  }).sort((a, b) => {
    // Sort by rating (descending) then distance (ascending)
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    if (ratingB !== ratingA) return ratingB - ratingA;
    const distA = parseFloat(a.distance);
    const distB = parseFloat(b.distance);
    return distA - distB;
  });

  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <SectionTitle variant="h6">
          <HospitalIcon />
          Hospital Finder
        </SectionTitle>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Find nearby hospitals and healthcare facilities based on your current location.
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <FindButton
            onClick={getCurrentLocation}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
          >
            {loading ? 'Finding Hospitals...' : 'Find Nearby Hospitals'}
          </FindButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {location && (
          <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
            <strong>Your Location:</strong> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Alert>
        )}

        {hospitals.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#e53e3e' }}>
              Filter Options:
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Specialty</InputLabel>
                  <Select
                    value={selectedSpecialty}
                    label="Specialty"
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    {specialtyOptions.map(option => (
                      <MenuItem key={option} value={option === 'All' ? '' : option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Minimum Rating: {minRating}
                </Typography>
                <Slider
                  value={minRating}
                  onChange={(e, newValue) => setMinRating(newValue)}
                  min={1}
                  max={5}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ color: '#e53e3e' }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {filteredHospitals.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#e53e3e' }}>
              Recommended Healthcare Facilities ({filteredHospitals.length} found):
            </Typography>

            <List sx={{ p: 0 }}>
              {filteredHospitals.map((hospital, index) => (
                <HospitalCard key={index}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <HospitalIcon sx={{ color: '#e53e3e', mt: 0.5, fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2d3748' }}>
                            {hospital.name}
                          </Typography>
                          <Chip
                            label={`★ ${hospital.rating?.toFixed(1) || 'N/A'}`}
                            size="small"
                            sx={{
                              backgroundColor: '#fef5e7',
                              color: '#d69e2e',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          <LocationIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {hospital.distance} • {hospital.address}
                        </Typography>
                        <Typography variant="caption" sx={{
                          backgroundColor: hospital.type === 'Government' ? '#e6fffa' : '#f0fff4',
                          color: hospital.type === 'Government' ? '#2c7a7b' : '#2f855a',
                          px: 1, py: 0.5, borderRadius: 1, mr: 1
                        }}>
                          {hospital.type}
                        </Typography>
                        {hospital.specialties && (
                          <Box sx={{ mt: 1, mb: 1 }}>
                            {hospital.specialties.map(spec => (
                              <Chip
                                key={spec}
                                label={spec}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                        {hospital.recommendation_reason && (
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#4a5568', mt: 1 }}>
                            💡 {hospital.recommendation_reason}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </HospitalCard>
              ))}
            </List>

            <Alert severity="info" sx={{ mt: 2, fontSize: '0.85rem' }}>
              <strong>Note:</strong> This information is for reference only. Please contact hospitals directly 
              for current availability, services, and emergency situations. In case of medical emergency, 
              call emergency services immediately.
            </Alert>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default HospitalFinder;