import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  Video,
  Calendar,
  CheckCircle,
  X,
  FileText,
  TrendingUp,
  Heart,
  Hospital,
  Star,
  User,
  Clock,
  AlertTriangle,
  TrendingDown,
  Activity,
  Brain,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { styled } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import AppointmentFormModal from '../../components/AppointmentFormModal';
import VideoCallRoom from '../../components/VideoCallRoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 600,
  ...(status === 'pending' && { backgroundColor: '#ffa726', color: 'white' }),
  ...(status === 'accepted' && { backgroundColor: '#66bb6a', color: 'white' }),
  ...(status === 'completed' && { backgroundColor: '#42a5f5', color: 'white' }),
  ...(status === 'rejected' && { backgroundColor: '#ef5350', color: 'white' }),
}));

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [prescriptionModal, setPrescriptionModal] = useState(null);
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [healthTrends, setHealthTrends] = useState(null);
  const [riskForecasts, setRiskForecasts] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
    fetchUserProfile();
    fetchPredictions();
    fetchDoctors();
    fetchHealthAnalytics();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserName(data.name);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments/patient', {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data/predictions', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
    }
  };

  const fetchHealthAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [trendsRes, forecastRes, insightsRes] = await Promise.all([
        fetch('http://localhost:5000/api/analytics/health-trends', { credentials: 'include' }),
        fetch('http://localhost:5000/api/analytics/risk-forecast', { credentials: 'include' }),
        fetch('http://localhost:5000/api/analytics/ai-copilot-insights', { credentials: 'include' })
      ]);

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setHealthTrends(data.trends);
      }

      if (forecastRes.ok) {
        const data = await forecastRes.json();
        setRiskForecasts(data.forecasts || []);
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setAiInsights(data.insights || []);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data/registered-doctors');
      if (response.ok) {
        const data = await response.json();
        const registeredDoctors = data.doctors?.filter(d => d.available) || [];
        setDoctors(registeredDoctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleBookDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowAppointmentForm(true);
  };

  const handleVideoCall = (appointment) => {
    setActiveCall(appointment);
  };

  const handleEndCall = () => {
    setActiveCall(null);
    fetchAppointments();
  };

  const viewPrescription = async (appointmentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/prescription`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setPrescriptionModal(data);
      }
    } catch (err) {
      console.error('Error fetching prescription:', err);
    }
  };

  const getRiskColor = (level) => {
    if (!level) return '#4caf50';
    const lower = level.toLowerCase();
    if (lower.includes('high')) return '#f44336';
    if (lower.includes('moderate')) return '#ff9800';
    return '#4caf50';
  };

  const getRiskPercentage = (level) => {
    if (!level) return 20;
    const lower = level.toLowerCase();
    if (lower.includes('very high')) return 90;
    if (lower.includes('high')) return 75;
    if (lower.includes('moderate')) return 50;
    return 25;
  };

  if (activeCall) {
    return (
      <VideoCallRoom
        appointmentId={activeCall.id}
        userRole="patient"
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Patient Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant={activeTab === 'overview' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'appointments' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('appointments')}
          >
            My Appointments
          </Button>
          <Button
            variant={activeTab === 'doctors' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('doctors')}
          >
            Meet My Doctors
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 'overview' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Heart size={24} color="#f44336" style={{ marginRight: 8 }} />
                      <Typography variant="h6">Health Predictions</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={700}>
                      {predictions.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total assessments
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Calendar size={24} color="#2196f3" style={{ marginRight: 8 }} />
                      <Typography variant="h6">Appointments</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={700}>
                      {appointments.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total consultations
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle size={24} color="#4caf50" style={{ marginRight: 8 }} />
                      <Typography variant="h6">Completed</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={700}>
                      {appointments.filter(a => a.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Consultations done
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TrendingUp size={24} color="#ff9800" style={{ marginRight: 8 }} />
                      <Typography variant="h6">Recent Health Assessments</Typography>
                    </Box>
                    {predictions.length === 0 ? (
                      <Alert severity="info">No health assessments yet. Take a prediction test to see your results here.</Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {predictions.slice(0, 4).map((pred, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {pred.disease_type}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ flex: 1, mr: 2 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={getRiskPercentage(pred.risk_level)}
                                    sx={{
                                      height: 10,
                                      borderRadius: 5,
                                      bgcolor: '#e0e0e0',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: getRiskColor(pred.risk_level)
                                      }
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {getRiskPercentage(pred.risk_level)}%
                                </Typography>
                              </Box>
                              <Chip
                                label={pred.risk_level || 'Normal'}
                                size="small"
                                sx={{
                                  bgcolor: getRiskColor(pred.risk_level),
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                              <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                {new Date(pred.created_at).toLocaleDateString()}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* AI Health Copilot */}
              <Grid item xs={12}>
                <StyledCard sx={{ 
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  boxShadow: '0 8px 32px rgba(133, 167, 230, 0.3)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          borderRadius: '12px', 
                          p: 1.5,
                          mr: 2
                        }}>
                          <Brain size={32} color="white" />
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="white">
                            AI Health Copilot
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Personalized health insights powered by AI
                          </Typography>
                        </Box>
                      </Box>
                      {!analyticsLoading && aiInsights.length > 0 && (
                        <Chip 
                          label={`${aiInsights.length} Insights`} 
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </Box>
                    {analyticsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: 'white' }} />
                      </Box>
                    ) : aiInsights.length === 0 ? (
                      <Paper sx={{ 
                        p: 4, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        textAlign: 'center'
                      }}>
                        <Activity size={48} color="rgba(255,255,255,0.5)" style={{ marginBottom: 16 }} />
                        <Typography color="white" variant="h6" gutterBottom>
                          No insights available yet
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Complete health assessments to get personalized AI-powered recommendations
                        </Typography>
                      </Paper>
                    ) : (
                      <Grid container spacing={2}>
                        {aiInsights.map((insight, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <Paper sx={{ 
                              p: 2.5, 
                              bgcolor: 'white',
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                              }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                <Box sx={{ 
                                  bgcolor: insight.type === 'critical' ? '#ffebee' : 
                                           insight.type === 'warning' ? '#fff3e0' : 
                                           insight.type === 'success' ? '#e8f5e9' : '#e3f2fd',
                                  borderRadius: '8px',
                                  p: 1,
                                  mr: 1.5
                                }}>
                                  {insight.type === 'critical' && <AlertTriangle size={24} color="#f44336" />}
                                  {insight.type === 'warning' && <AlertTriangle size={24} color="#ff9800" />}
                                  {insight.type === 'info' && <Activity size={24} color="#2196f3" />}
                                  {insight.type === 'success' && <CheckCircle size={24} color="#4caf50" />}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                    {insight.disease}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    {insight.message}
                                  </Typography>
                                  <Chip
                                    label={insight.action}
                                    size="small"
                                    sx={{
                                      bgcolor: insight.type === 'critical' ? '#f44336' : 
                                               insight.type === 'warning' ? '#ff9800' : 
                                               insight.type === 'success' ? '#4caf50' : '#2196f3',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* Future Risk Forecasting */}
              <Grid item xs={12}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TrendingUp size={24} color="#ff9800" style={{ marginRight: 8 }} />
                      <Typography variant="h6">Future Risk Forecasting</Typography>
                    </Box>
                    {analyticsLoading ? (
                      <CircularProgress />
                    ) : riskForecasts.length === 0 ? (
                      <Alert severity="info">Insufficient data for trend analysis. Complete at least 2 assessments to see forecasts.</Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {riskForecasts.map((forecast, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderLeft: `4px solid ${forecast.trend === 'increasing' ? '#f44336' : forecast.trend === 'decreasing' ? '#4caf50' : '#2196f3'}` }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {forecast.disease}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {forecast.trend === 'increasing' && <ArrowUp size={20} color="#f44336" />}
                                  {forecast.trend === 'decreasing' && <ArrowDown size={20} color="#4caf50" />}
                                  {forecast.trend === 'stable' && <Minus size={20} color="#2196f3" />}
                                  <Typography variant="body2" fontWeight={600} sx={{ ml: 0.5, color: forecast.trend === 'increasing' ? '#f44336' : forecast.trend === 'decreasing' ? '#4caf50' : '#2196f3' }}>
                                    {forecast.change > 0 ? '+' : ''}{forecast.change.toFixed(1)}%
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                Current Risk: {forecast.current_risk}% | Previous: {forecast.previous_risk}%
                              </Typography>
                              <Alert severity={forecast.trend === 'increasing' ? 'warning' : forecast.trend === 'decreasing' ? 'success' : 'info'} sx={{ mt: 1 }}>
                                {forecast.warning}
                              </Alert>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* Health Trend Analytics Dashboard */}
              {healthTrends && (
                <Grid item xs={12}>
                  <StyledCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Activity size={24} color="#2196f3" style={{ marginRight: 8 }} />
                        <Typography variant="h6">Health Trend Analytics</Typography>
                      </Box>
                      <Grid container spacing={3}>
                        {Object.entries(healthTrends).map(([disease, data]) => {
                          if (data.length === 0) return null;
                          
                          const chartData = {
                            labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                            datasets: [{
                              label: `${disease.charAt(0).toUpperCase() + disease.slice(1)} Risk %`,
                              data: data.map(d => d.risk),
                              borderColor: disease === 'diabetes' ? '#ff9800' : disease === 'heart' ? '#f44336' : disease === 'liver' ? '#9c27b0' : disease === 'bone' ? '#795548' : '#2196f3',
                              backgroundColor: disease === 'diabetes' ? 'rgba(255, 152, 0, 0.1)' : disease === 'heart' ? 'rgba(244, 67, 54, 0.1)' : disease === 'liver' ? 'rgba(156, 39, 176, 0.1)' : disease === 'bone' ? 'rgba(121, 85, 72, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                              fill: true,
                              tension: 0.4
                            }]
                          };

                          const options = {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (context) => `Risk: ${context.parsed.y.toFixed(1)}%`
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: { callback: (value) => value + '%' }
                              }
                            }
                          };

                          return (
                            <Grid item xs={12} md={6} key={disease}>
                              <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                  {disease.charAt(0).toUpperCase() + disease.slice(1)} Risk Trend
                                </Typography>
                                <Box sx={{ height: 200 }}>
                                  <Line data={chartData} options={options} />
                                </Box>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </StyledCard>
                </Grid>
              )}

              <Grid item xs={12}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Upcoming Appointments
                    </Typography>
                    {appointments.filter(a => {
                      if (!['accepted', 'pending'].includes(a.status)) return false;
                      const aptDateTime = new Date(`${a.appointment_date}T${a.appointment_time}`);
                      return aptDateTime > new Date();
                    }).length === 0 ? (
                      <Alert severity="info">No upcoming appointments</Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {appointments.filter(a => {
                          if (!['accepted', 'pending'].includes(a.status)) return false;
                          const aptDateTime = new Date(`${a.appointment_date}T${a.appointment_time}`);
                          return aptDateTime > new Date();
                        }).slice(0, 3).map((apt) => (
                          <Grid item xs={12} md={4} key={apt.id}>
                            <Paper sx={{ p: 2, bgcolor: apt.status === 'pending' ? '#fff3e0' : '#e3f2fd' }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Dr. {apt.doctor_name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {new Date(apt.appointment_date).toLocaleDateString()} at {apt.appointment_time}
                              </Typography>
                              <Chip
                                label={apt.status === 'pending' ? 'Pending Approval' : 'Confirmed'}
                                size="small"
                                color={apt.status === 'pending' ? 'warning' : 'success'}
                                sx={{ mt: 1, mb: 1 }}
                              />
                              {apt.status === 'accepted' && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<Video size={18} />}
                                  onClick={() => handleVideoCall(apt)}
                                  sx={{ mt: 1 }}
                                  fullWidth
                                >
                                  Join Call
                                </Button>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* Disclaimer */}
              <Grid item xs={12}>
                <Alert severity="info" icon={<AlertTriangle size={20} />}>
                  <Typography variant="body2" fontWeight={600}>
                    Disclaimer: AI-assisted health screening only. Not a medical diagnosis. Always consult qualified healthcare professionals.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          {activeTab === 'appointments' && (
            <Grid container spacing={3}>
              {appointments.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No appointments yet. Book a consultation with a doctor to get started.
                  </Alert>
                </Grid>
              ) : (
                appointments.map((apt) => (
                  <Grid item xs={12} md={6} key={apt.id}>
                    <StyledCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600}>
                            Dr. {apt.doctor_name}
                          </Typography>
                          <StatusChip
                            label={apt.status.toUpperCase()}
                            status={apt.status}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {apt.doctor_specialization}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Symptoms:
                          </Typography>
                          <Typography variant="body2">{apt.symptoms}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Date:
                            </Typography>
                            <Typography variant="body2">
                              {new Date(apt.appointment_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Time:
                            </Typography>
                            <Typography variant="body2">{apt.appointment_time}</Typography>
                          </Box>
                        </Box>

                        {apt.is_emergency && (
                          <Chip label="EMERGENCY" color="error" size="small" sx={{ mb: 2 }} />
                        )}

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {apt.status === 'accepted' && (() => {
                            const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
                            return aptDateTime > new Date();
                          })() && (
                            <Button
                              variant="contained"
                              startIcon={<Video size={20} />}
                              onClick={() => handleVideoCall(apt)}
                              fullWidth
                            >
                              Join Video Call
                            </Button>
                          )}

                          {apt.status === 'completed' && (
                            <Button
                              variant="outlined"
                              startIcon={<FileText size={20} />}
                              onClick={() => viewPrescription(apt.id)}
                              fullWidth
                            >
                              View Prescription
                            </Button>
                          )}

                          {apt.status === 'pending' && (
                            <Chip
                              icon={<Clock size={16} />}
                              label="Waiting for doctor approval"
                              color="warning"
                              sx={{ width: '100%' }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {activeTab === 'doctors' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Meet Our Doctors
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Book an appointment with our registered doctors
                </Typography>
              </Grid>
              {doctors.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No doctors available at the moment.</Alert>
                </Grid>
              ) : (
                doctors.map((doctor) => (
                  <Grid item xs={12} md={6} key={doctor.id}>
                    <StyledCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <User size={40} color="#1976d2" style={{ marginRight: 16 }} />
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {doctor.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {doctor.specialization}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            icon={<CheckCircle size={16} />}
                            label="Available"
                            color="success"
                            size="small"
                          />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Star size={20} color="#ffa726" fill="#ffa726" style={{ marginRight: 8 }} />
                          <Typography variant="body2" fontWeight={600}>
                            {doctor.rating} Rating
                          </Typography>
                        </Box>

                        {doctor.phone && doctor.phone !== 'N/A' && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Phone: {doctor.phone}
                          </Typography>
                        )}

                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<Video size={20} />}
                          onClick={() => handleBookDoctor(doctor)}
                          sx={{
                            mt: 2,
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#45a049' }
                          }}
                        >
                          Book Video Consultation
                        </Button>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </>
      )}

      <Dialog
        open={!!prescriptionModal}
        onClose={() => setPrescriptionModal(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Prescription Details</DialogTitle>
        <DialogContent>
          {prescriptionModal && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Diagnosis
              </Typography>
              <Typography variant="body1" paragraph>
                {prescriptionModal.diagnosis}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Prescribed Medicines
              </Typography>
              {prescriptionModal.medicines.map((med, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {med.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Dosage: {med.dosage} | Frequency: {med.frequency}
                  </Typography>
                </Box>
              ))}

              {prescriptionModal.dosage_instructions && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Instructions
                  </Typography>
                  <Typography variant="body2">
                    {prescriptionModal.dosage_instructions}
                  </Typography>
                </>
              )}

              {prescriptionModal.recommendations && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <Typography variant="body2">
                    {prescriptionModal.recommendations}
                  </Typography>
                </>
              )}

              {prescriptionModal.follow_up_date && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    Follow-up Date:{' '}
                    {new Date(prescriptionModal.follow_up_date).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <AppointmentFormModal
        open={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
        patientName={userName}
      />
    </Container>
  );
};

export default PatientDashboard;
