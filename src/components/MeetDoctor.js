import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  VideoCall,
  LocationOn,
  Star,
  LocalHospital,
  CheckCircle,
  Cancel,
  Directions
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import AppointmentFormModal from './AppointmentFormModal';

const MeetDoctor = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [filters, setFilters] = useState({
    specialization: '',
    minRating: 0,
    availableOnly: false
  });

  const specializations = [
    'All',
    'Cardiologist',
    'General Physician',
    'Orthopedic',
    'Dermatologist',
    'Neurologist',
    'Pediatrician'
  ];

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, filters]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Location access required to find nearby doctors.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        lat: userLocation.lat,
        lon: userLocation.lon
      });

      const response = await fetch(`http://localhost:5000/api/doctors?${params}`);
      const data = await response.json();

      if (response.ok) {
        setDoctors(data.doctors);
        setFilteredDoctors(data.doctors);
        if (data.doctors.length === 0) {
          setError('No doctors found nearby. Try expanding your search area.');
        }
      } else {
        setError(data.error || 'Failed to fetch doctors');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...doctors];

    if (filters.specialization && filters.specialization !== 'All') {
      filtered = filtered.filter(
        (d) => d.specialization === filters.specialization
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter((d) => d.rating >= filters.minRating);
    }

    if (filters.availableOnly) {
      filtered = filtered.filter((d) => d.available);
    }

    setFilteredDoctors(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleGetDirections = (doctor) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`;
    window.open(url, '_blank');
  };

  const handleStartVideoCall = async (doctor) => {
    if (!user) {
      alert('Please login to book an appointment');
      return;
    }

    if (!doctor.available || !doctor.consultation_types.includes('video')) {
      alert('Video consultation not available for this doctor');
      return;
    }

    setSelectedDoctor(doctor);
    setShowAppointmentForm(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton />
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Nearby Doctors
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Specialization"
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
            >
              {specializations.map((spec) => (
                <MenuItem key={spec} value={spec === 'All' ? '' : spec}>
                  {spec}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Minimum Rating"
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
            >
              <MenuItem value={0}>All Ratings</MenuItem>
              <MenuItem value={4.0}>4.0+</MenuItem>
              <MenuItem value={4.5}>4.5+</MenuItem>
              <MenuItem value={4.7}>4.7+</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.availableOnly}
                  onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                />
              }
              label="Available Now"
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            {filteredDoctors.length} Doctor{filteredDoctors.length !== 1 ? 's' : ''} Found
          </Typography>
          <Grid container spacing={3}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} md={6} key={doctor.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h5" component="div">
                        {doctor.name}
                      </Typography>
                      {doctor.available ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Available"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<Cancel />}
                          label="Unavailable"
                          color="error"
                          size="small"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalHospital sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1" color="text.secondary">
                        {doctor.specialization}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: '#f44336' }} />
                      <Typography variant="body2" color="text.secondary">
                        {doctor.hospital}
                        {doctor.distance && ` • ${doctor.distance} km away`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Star sx={{ mr: 1, color: '#ffa726' }} />
                      <Typography variant="body1" fontWeight="bold">
                        {doctor.rating}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      {doctor.consultation_types.map((type) => (
                        <Chip
                          key={type}
                          label={type}
                          size="small"
                          sx={{ mr: 1, textTransform: 'capitalize' }}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Directions />}
                        onClick={() => handleGetDirections(doctor)}
                        sx={{ flex: 1 }}
                      >
                        Get Directions
                      </Button>

                      {doctor.available && doctor.consultation_types.includes('video') ? (
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<VideoCall />}
                          onClick={() => handleStartVideoCall(doctor)}
                          sx={{
                            flex: 1,
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#45a049' }
                          }}
                        >
                          Video Call
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          fullWidth
                          disabled
                          startIcon={<VideoCall />}
                          sx={{ flex: 1 }}
                        >
                          {!doctor.available ? 'Unavailable' : 'No Video'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredDoctors.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary">
                No doctors found matching your filters
              </Typography>
            </Box>
          )}
        </>
      )}

      <AppointmentFormModal
        open={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
        patientName={user?.name || ''}
      />
    </Container>
  );
};

export default MeetDoctor;
