import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Paper,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  LocationOn,
  Star,
  Work,
  LocalHospital,
  ExpandMore,
  CheckCircle,
  Navigation
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MeetDoctors = () => {
  const [location, setLocation] = useState(null);
  const [specialty, setSpecialty] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recommend/specialties');
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data.specialties);
      }
    } catch (err) {
      console.error('Error fetching specialties:', err);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLocationLoading(false);
      }
    );
  };

  const handleRecommendDoctor = async () => {
    if (!location) {
      setError('Please allow location access first');
      return;
    }

    if (!specialty) {
      setError('Please select a specialty');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const response = await fetch('http://localhost:5000/api/recommend/recommend-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_latitude: location.latitude,
          patient_longitude: location.longitude,
          selected_specialty: specialty
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendation');
      }

      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor) => {
    navigate('/meet-doctor', { state: { selectedDoctor: doctor } });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Meet Doctors
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Find the best doctor near you based on specialty, rating, and experience
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#f9f9f9' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <LocationOn color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Your Location
                    </Typography>
                  </Stack>
                  {location ? (
                    <Alert severity="success" icon={<CheckCircle />}>
                      Location captured successfully
                    </Alert>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={locationLoading ? <CircularProgress size={20} color="inherit" /> : <Navigation />}
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      fullWidth
                    >
                      {locationLoading ? 'Getting Location...' : 'Get Current Location'}
                    </Button>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#f9f9f9' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <LocalHospital color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Select Specialty
                    </Typography>
                  </Stack>
                  <FormControl fullWidth>
                    <InputLabel>Specialty</InputLabel>
                    <Select
                      value={specialty}
                      label="Specialty"
                      onChange={(e) => setSpecialty(e.target.value)}
                    >
                      {specialties.map((spec) => (
                        <MenuItem key={spec} value={spec}>
                          {spec}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={handleRecommendDoctor}
              disabled={!location || !specialty || loading}
              sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Best Doctor'}
            </Button>
          </CardContent>
        </Card>

        {recommendation && (
          <>
            <Card sx={{ mb: 3, boxShadow: 4, border: '2px solid #4caf50' }}>
              <CardContent sx={{ p: 4 }}>
                <Chip
                  label="RECOMMENDED"
                  color="success"
                  sx={{ mb: 2, fontWeight: 700 }}
                />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {recommendation.recommended_doctor.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {recommendation.recommended_doctor.hospital}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Star sx={{ color: '#ffa726' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Rating
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {recommendation.recommended_doctor.rating}/5.0
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Work color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Experience
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {recommendation.recommended_doctor.experience_years} years
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn color="error" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Distance
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {recommendation.recommended_doctor.distance_km} km
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle color="success" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {recommendation.recommended_doctor.availability}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography fontWeight={600}>Why Recommended?</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{recommendation.selection_reason}</Typography>
                  </AccordionDetails>
                </Accordion>

                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleBookAppointment(recommendation.recommended_doctor)}
                  sx={{ mt: 3 }}
                  fullWidth
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>

            {recommendation.other_options && recommendation.other_options.length > 0 && (
              <Card sx={{ boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Other Available Doctors
                  </Typography>
                  <Grid container spacing={2}>
                    {recommendation.other_options.map((doctor) => (
                      <Grid item xs={12} sm={6} md={4} key={doctor.doctor_id}>
                        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {doctor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctor.hospital}
                          </Typography>
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Chip
                              icon={<Star sx={{ fontSize: 16 }} />}
                              label={doctor.rating}
                              size="small"
                            />
                            <Chip
                              icon={<LocationOn sx={{ fontSize: 16 }} />}
                              label={`${doctor.distance_km} km`}
                              size="small"
                            />
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default MeetDoctors;
