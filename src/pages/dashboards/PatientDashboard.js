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
  Paper,
  Tabs,
  Tab,
  Stack,
  Switch,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Video,
  Calendar,
  CheckCircle,
  FileText,
  TrendingUp,
  Heart,
  Star,
  User,
  Clock,
  AlertTriangle,
  Activity,
  Brain,
  ArrowUp,
  ArrowDown,
  Minus,
  Copy,
  Shield,
  Sparkles,
  Route,
  Stethoscope,
  Siren,
  Info
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
  Tooltip as ChartTooltip,
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
  ChartTooltip,
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

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  background: 'rgba(255, 255, 255, 0.78)',
  backdropFilter: 'blur(14px)',
  border: '1px solid rgba(77, 182, 172, 0.18)',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  overflow: 'hidden',
  transition: 'transform 180ms ease, box-shadow 180ms ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)',
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
  const [activeTab, setActiveTab] = useState('overview');
  const [healthTrends, setHealthTrends] = useState(null);
  const [riskForecasts, setRiskForecasts] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [briefCopied, setBriefCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
    fetchUserProfile();
    fetchPredictions();
    fetchDoctors();
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

  // Derive AI analytics directly from recent predictions so cards stay in sync
  useEffect(() => {
    if (!predictions || predictions.length === 0) {
      setHealthTrends(null);
      setRiskForecasts([]);
      setAiInsights([]);
      return;
    }

    setAnalyticsLoading(true);

    // Sort predictions by created_at (desc)
    const sorted = [...predictions].sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });

    // ---- Health Trends (per disease over time) ----
    const trendMap = {};
    sorted.forEach((p) => {
      const disease = p.disease_type || 'General';
      const createdAt = p.created_at || new Date().toISOString();
      const risk = getRiskPercentage(p.risk_level);
      if (!trendMap[disease]) trendMap[disease] = [];
      trendMap[disease].push({ date: createdAt, risk });
    });
    setHealthTrends(trendMap);

    // ---- Future Risk Forecasting (simple delta between last two points) ----
    const forecasts = Object.entries(trendMap)
      .map(([disease, entries]) => {
        if (entries.length < 2) return null;
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const previous = sortedEntries[sortedEntries.length - 2];
        const current = sortedEntries[sortedEntries.length - 1];
        const change = current.risk - previous.risk;

        let trend = 'stable';
        if (change > 3) trend = 'increasing';
        else if (change < -3) trend = 'decreasing';

        let warning;
        if (trend === 'increasing') {
          warning = `Risk for ${disease} is trending higher. Consider scheduling a follow-up with your doctor.`;
        } else if (trend === 'decreasing') {
          warning = `Risk for ${disease} is improving. Continue your current treatment and lifestyle plan.`;
        } else {
          warning = `Risk for ${disease} is stable. Maintain regular monitoring and healthy habits.`;
        }

        return {
          disease,
          trend,
          change,
          current_risk: current.risk,
          previous_risk: previous.risk,
          warning
        };
      })
      .filter(Boolean);

    setRiskForecasts(forecasts);

    // ---- AI Health Copilot Insights ----
    const insights = sorted.slice(0, 4).map((p) => {
      const disease = p.disease_type || 'Health';
      const riskLevel = p.risk_level || 'Normal';
      const perc = getRiskPercentage(p.risk_level);
      const lower = riskLevel.toLowerCase();

      let type = 'info';
      if (lower.includes('high')) type = 'critical';
      else if (lower.includes('moderate')) type = 'warning';
      else if (lower.includes('low')) type = 'success';

      let action;
      if (type === 'critical') {
        action = 'Book an appointment within 1–2 weeks';
      } else if (type === 'warning') {
        action = 'Discuss results at your next routine visit';
      } else {
        action = 'Maintain current lifestyle and continue routine screening';
      }

      const message = `${disease}: ${riskLevel} risk (${perc}%) based on your latest assessment.`;

      return {
        disease,
        type,
        message,
        action
      };
    });

    setAiInsights(insights);
    setAnalyticsLoading(false);
  }, [predictions]);

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

  const mask = (value) => (privacyMode ? '•••' : value);

  const getNextAppointment = () => {
    const upcoming = appointments
      .filter(a => ['accepted', 'pending'].includes(a.status))
      .map(a => ({ ...a, dateTime: new Date(`${a.appointment_date}T${a.appointment_time}`) }))
      .filter(a => !Number.isNaN(a.dateTime.getTime()) && a.dateTime > new Date())
      .sort((a, b) => a.dateTime - b.dateTime);
    return upcoming[0] || null;
  };

  const getHealthScore = () => {
    if (!predictions || predictions.length === 0) return 92;
    const recent = predictions.slice(0, 6);
    const avgRisk = recent.reduce((acc, p) => acc + getRiskPercentage(p.risk_level), 0) / recent.length;
    return Math.round(Math.max(35, Math.min(99, 100 - avgRisk * 0.7)));
  };

  const buildHealthBrief = () => {
    const next = getNextAppointment();
    const topPred = predictions?.[0];
    const score = getHealthScore();
    const lines = [
      'HealthAI — Patient Brief',
      `Name: ${userName || 'Patient'}`,
      `Health Score: ${score}/100`,
      next
        ? `Next appointment: Dr. ${next.doctor_name} on ${new Date(next.appointment_date).toLocaleDateString()} at ${next.appointment_time} (${next.status})`
        : 'Next appointment: none scheduled',
      topPred
        ? `Latest assessment: ${topPred.disease_type} — ${topPred.risk_level || 'Normal'} (${getRiskPercentage(topPred.risk_level)}%)`
        : 'Latest assessment: none',
      `Generated: ${new Date().toLocaleString()}`
    ];
    return lines.join('\n');
  };

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(buildHealthBrief());
      setBriefCopied(true);
      window.setTimeout(() => setBriefCopied(false), 1400);
    } catch (e) {
      console.error('Clipboard error:', e);
    }
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
    <Box
      sx={{
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #ffffff 0%, #f3fbf9 35%, #eef7fb 100%)',
        py: { xs: 2.5, md: 4 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative blobs to match landing page */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          '&:before, &:after': {
            content: '""',
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            filter: 'blur(55px)',
            opacity: 0.22
          },
          '&:before': {
            top: -120,
            right: -140,
            background:
              'radial-gradient(circle, rgba(77,182,172,0.9) 0%, rgba(77,182,172,0) 70%)'
          },
          '&:after': {
            bottom: -160,
            left: -170,
            background:
              'radial-gradient(circle, rgba(14,165,233,0.8) 0%, rgba(14,165,233,0) 70%)'
          }
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        <GlassCard
          sx={{
            mb: 3,
            background:
              'linear-gradient(135deg, rgba(30, 41, 59, 0.92) 0%, rgba(46, 125, 111, 0.92) 45%, rgba(77, 182, 172, 0.88) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 22px 65px rgba(15, 23, 42, 0.22)'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2.5}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.8 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.14)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.18)'
                    }}
                  >
                    <Sparkles size={20} color="#E0FAF3" />
                  </Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 800, letterSpacing: 0.4 }}>
                    HealthAI Patient Space
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={900} sx={{ color: 'white', lineHeight: 1.1 }}>
                  Welcome back{userName ? `, ${userName}` : ''}.
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.82)', mt: 1, maxWidth: 760 }}>
                  A calmer, smarter dashboard: privacy-first snapshots, AI guidance, and your care journey in one place.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.3}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    px: 1.2,
                    py: 0.8,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.18)'
                  }}
                >
                  <Shield size={18} color="#E0FAF3" />
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '0.92rem' }}>
                    Privacy Lens
                  </Typography>
                  <Tooltip title={privacyMode ? 'Sensitive values are hidden' : 'Sensitive values are visible'}>
                    <Switch
                      size="small"
                      checked={privacyMode}
                      onChange={(e) => setPrivacyMode(e.target.checked)}
                      sx={{
                        ml: 0.5,
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#E0FAF3' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: 'rgba(224,250,243,0.5)'
                        }
                      }}
                    />
                  </Tooltip>
                </Stack>

                <Button
                  variant="contained"
                  onClick={() => navigate('/models')}
                  startIcon={<Activity size={18} />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.92)',
                    color: '#1e293b',
                    fontWeight: 900,
                    borderRadius: 999,
                    px: 2.2,
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  Run Assessment
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/emergency')}
                  startIcon={<Siren size={18} />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.55)',
                    color: 'white',
                    fontWeight: 900,
                    borderRadius: 999,
                    px: 2.2,
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.9)',
                      bgcolor: 'rgba(255,255,255,0.10)'
                    }
                  }}
                >
                  Emergency
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 1.3, md: 1.8 } }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                '& .MuiTabs-indicator': { height: 4, borderRadius: 99, bgcolor: '#4DB6AC' },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 44,
                  fontWeight: 900,
                  borderRadius: 99,
                  px: 2.2
                }
              }}
            >
              <Tab value="overview" label="Overview" />
              <Tab value="appointments" label="My Appointments" />
              <Tab value="doctors" label="Meet My Doctors" />
            </Tabs>
          </CardContent>
        </GlassCard>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 'overview' && (
            <Grid container spacing={3}>
              {/* Signature row: Health score, next appointment, copy brief */}
              <Grid item xs={12} md={4}>
                <GlassCard sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.6 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.2 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          bgcolor: 'rgba(77, 182, 172, 0.12)',
                          border: '1px solid rgba(77, 182, 172, 0.20)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Heart size={20} color="#2E7D6F" />
                      </Box>
                      <Box>
                        <Typography fontWeight={900}>Health Score</Typography>
                        <Typography variant="body2" color="text.secondary">
                          A privacy-first snapshot
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="baseline" sx={{ mt: 1.5 }}>
                      <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1 }}>
                        {mask(`${getHealthScore()}`)}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>/100</Typography>
                    </Stack>
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={getHealthScore()}
                        sx={{
                          height: 10,
                          borderRadius: 99,
                          bgcolor: 'rgba(15, 23, 42, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 99,
                            background: 'linear-gradient(90deg, #4DB6AC 0%, #0EA5E9 100%)'
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.2, display: 'block' }}>
                      Tip: keep Privacy Lens on in public spaces.
                    </Typography>
                  </CardContent>
                </GlassCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <GlassCard sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.6 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.2 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          bgcolor: 'rgba(14, 165, 233, 0.10)',
                          border: '1px solid rgba(14, 165, 233, 0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Calendar size={20} color="#0EA5E9" />
                      </Box>
                      <Box>
                        <Typography fontWeight={900}>Next Appointment</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your nearest consult window
                        </Typography>
                      </Box>
                    </Stack>

                    {(() => {
                      const next = getNextAppointment();
                      if (!next) {
                        return (
                          <Alert severity="info" sx={{ mt: 1.2 }}>
                            No upcoming appointments. Book a video consult with an available doctor.
                          </Alert>
                        );
                      }
                      const diffMs = next.dateTime - new Date();
                      const diffHrs = Math.max(0, Math.floor(diffMs / 3600000));
                      const days = Math.floor(diffHrs / 24);
                      const hrs = diffHrs % 24;
                      const countdown = days > 0 ? `${days}d ${hrs}h` : `${hrs}h`;

                      return (
                        <>
                          <Typography variant="h6" fontWeight={950} sx={{ mt: 1.4 }}>
                            Dr. {next.doctor_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                            {new Date(next.appointment_date).toLocaleDateString()} at {next.appointment_time} ·{' '}
                            {next.status === 'pending' ? 'Awaiting approval' : 'Confirmed'}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.4 }}>
                            <Chip
                              icon={<Clock size={16} />}
                              label={`Starts in ${countdown}`}
                              sx={{
                                fontWeight: 900,
                                bgcolor: 'rgba(77,182,172,0.12)',
                                border: '1px solid rgba(77,182,172,0.20)'
                              }}
                            />
                            {next.status === 'accepted' && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Video size={16} />}
                                onClick={() => handleVideoCall(next)}
                                sx={{
                                  ml: 'auto',
                                  borderRadius: 999,
                                  fontWeight: 950,
                                  bgcolor: '#2E7D6F',
                                  '&:hover': { bgcolor: '#25665b' }
                                }}
                              >
                                Join
                              </Button>
                            )}
                          </Stack>
                        </>
                      );
                    })()}
                  </CardContent>
                </GlassCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <GlassCard sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.6 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.2 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          bgcolor: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FileText size={20} color="#F59E0B" />
                      </Box>
                      <Box>
                        <Typography fontWeight={900}>Health Brief</Typography>
                        <Typography variant="body2" color="text.secondary">
                          One-tap summary for doctors
                        </Typography>
                      </Box>
                    </Stack>

                    <Paper
                      sx={{
                        p: 1.6,
                        bgcolor: 'rgba(15,23,42,0.04)',
                        border: '1px dashed rgba(15,23,42,0.18)',
                        borderRadius: 2,
                        minHeight: 92
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                        {privacyMode
                          ? 'Privacy Lens is ON. Copying will still include your real values.'
                          : 'Ready. Copy your brief and share it securely with your doctor.'}
                      </Typography>
                    </Paper>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.6 }}>
                      <Button
                        variant="contained"
                        onClick={copyBrief}
                        startIcon={<Copy size={18} />}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 950,
                          bgcolor: '#4DB6AC',
                          '&:hover': { bgcolor: '#3aa89f' }
                        }}
                      >
                        {briefCopied ? 'Copied' : 'Copy Brief'}
                      </Button>
                      <Tooltip title="Uses your latest assessment + next appointment (if any)">
                        <IconButton size="small" sx={{ ml: 'auto' }}>
                          <Info size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </GlassCard>
              </Grid>

              {/* Care Journey Map (unique element) */}
              <Grid item xs={12}>
                <GlassCard>
                  <CardContent sx={{ p: { xs: 2.2, md: 2.8 } }}>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: 'rgba(139, 92, 246, 0.12)',
                          border: '1px solid rgba(139, 92, 246, 0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Route size={20} color="#8B5CF6" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={950}>
                          Care Journey Map
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          A simple map of where you are today — and what to do next.
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/meet-doctor')}
                        startIcon={<Stethoscope size={16} />}
                        sx={{ borderRadius: 999, fontWeight: 900 }}
                      >
                        Find a doctor
                      </Button>
                    </Stack>

                    {(() => {
                      const hasAssessment = predictions.length > 0;
                      const next = getNextAppointment();
                      const hasConsult = !!next;
                      const completed = appointments.some(a => a.status === 'completed');
                      const step = completed ? 3 : hasConsult ? 2 : hasAssessment ? 1 : 0;
                      const steps = [
                        { title: 'Assess', desc: 'Run an AI screening', color: '#4DB6AC' },
                        { title: 'Review', desc: 'Read your AI insights', color: '#0EA5E9' },
                        { title: 'Consult', desc: 'Talk to a verified doctor', color: '#8B5CF6' },
                        { title: 'Track', desc: 'Monitor trends & plan', color: '#10B981' }
                      ];

                      return (
                        <Grid container spacing={2}>
                          {steps.map((s, idx) => (
                            <Grid item xs={12} md={3} key={s.title}>
                              <Paper
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: idx <= step ? `${s.color}12` : 'rgba(15,23,42,0.03)',
                                  border: `1px solid ${idx <= step ? `${s.color}30` : 'rgba(15,23,42,0.08)'}`,
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Typography sx={{ fontWeight: 950, color: idx <= step ? '#0f172a' : 'text.secondary' }}>
                                  {s.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
                                  {s.desc}
                                </Typography>
                                {idx === step && (
                                  <Chip
                                    size="small"
                                    label="You are here"
                                    sx={{
                                      mt: 1.2,
                                      fontWeight: 900,
                                      bgcolor: `${s.color}25`,
                                      border: `1px solid ${s.color}35`
                                    }}
                                  />
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      );
                    })()}
                  </CardContent>
                </GlassCard>
              </Grid>

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
                    <StyledCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
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
    </Box>
  );
};

export default PatientDashboard;
