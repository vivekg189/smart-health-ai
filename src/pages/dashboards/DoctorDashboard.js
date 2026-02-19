import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Grid, Alert, CircularProgress,
  Divider, Badge, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tabs, Tab
} from '@mui/material';
import {
  VideoCall, CheckCircle, Cancel, Notifications, People, Assignment, LocalHospital,
  TrendingUp, History, Chat, Description, Add, Visibility, Close
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import VideoCallRoom from '../../components/VideoCallRoom';
import PrescriptionFormModal from '../../components/PrescriptionFormModal';

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

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  background: 'rgba(255,255,255,0.86)',
  backdropFilter: 'blur(14px)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 18px 46px rgba(15,23,42,0.18)'
  }
}));

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [patientAnalytics, setPatientAnalytics] = useState(null);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCall, setActiveCall] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({ record_type: 'general', diagnosis: '', notes: '' });
  const [newTreatment, setNewTreatment] = useState({ treatment_type: '', description: '', medications: '', outcome: '' });
  const [profileData, setProfileData] = useState({
    fullName: '',
    profilePhoto: '',
    specialization: '',
    experience: '',
    qualifications: '',
    hospital: '',
    license: '',
    email: '',
    phone: '',
    consultationFees: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctorProfile();
    fetchPatients();
    const interval = setInterval(fetchAppointments, 30000);
    
    const handleSectionChange = (e) => {
      setActiveSection(e.detail);
    };
    
    window.addEventListener('doctorSectionChange', handleSectionChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('doctorSectionChange', handleSectionChange);
    };
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user data:', data);
        setProfileData({
          fullName: data.user?.name || data.name || '',
          profilePhoto: data.user?.profile_photo || data.profile_photo || '',
          specialization: data.user?.specialization || data.specialization || '',
          experience: data.user?.experience || data.experience || '',
          qualifications: data.user?.qualifications || data.qualifications || '',
          hospital: data.user?.hospital || data.hospital || '',
          license: data.user?.license || data.license || '',
          email: data.user?.email || data.email || '',
          phone: data.user?.phone || data.phone || '',
          consultationFees: data.user?.consultation_fees || data.consultation_fees || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments/doctor', {
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

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctor/patients', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchPatientRecords = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/patient/${patientId}/records`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPatientRecords(data.records);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  const fetchPatientAnalytics = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/patient/${patientId}/analytics`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPatientAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchTreatmentHistory = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/patient/${patientId}/treatment-history`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTreatmentHistory(data.treatments);
      }
    } catch (err) {
      console.error('Error fetching treatment history:', err);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientRecords(patient.id);
    fetchPatientAnalytics(patient.id);
    fetchTreatmentHistory(patient.id);
    setActiveSection('patient-details');
  };

  const handleAddRecord = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/patient/${selectedPatient.id}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newRecord)
      });
      if (response.ok) {
        setShowRecordDialog(false);
        setNewRecord({ record_type: 'general', diagnosis: '', notes: '' });
        fetchPatientRecords(selectedPatient.id);
      }
    } catch (err) {
      console.error('Error adding record:', err);
    }
  };

  const handleAddTreatment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/patient/${selectedPatient.id}/treatment-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTreatment)
      });
      if (response.ok) {
        setShowTreatmentDialog(false);
        setNewTreatment({ treatment_type: '', description: '', medications: '', outcome: '' });
        fetchTreatmentHistory(selectedPatient.id);
      }
    } catch (err) {
      console.error('Error adding treatment:', err);
    }
  };

  const handleAccept = async (appointmentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/accept`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (response.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error('Error accepting appointment:', err);
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/reject`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (response.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error('Error rejecting appointment:', err);
    }
  };

  const handleStartCall = (appointment) => {
    setActiveCall(appointment);
  };

  const handleEndCall = () => {
    setSelectedAppointment(activeCall);
    setActiveCall(null);
    setShowPrescriptionForm(true);
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  const nextConsultation = () => {
    const upcoming = appointments
      .filter(a => a.status === 'accepted')
      .map(a => ({
        ...a,
        dateTime: new Date(`${a.appointment_date}T${a.appointment_time}`)
      }))
      .filter(a => !Number.isNaN(a.dateTime.getTime()) && a.dateTime > new Date())
      .sort((a, b) => a.dateTime - b.dateTime);
    return upcoming[0] || null;
  };

  if (activeCall) {
    return (
      <VideoCallRoom
        appointmentId={activeCall.id}
        userRole="doctor"
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #f9fafb 0%, #eef2ff 35%, #e0f2fe 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xl">
      {activeSection === 'overview' && (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#0f172a' }}>
                Clinical Overview
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569' }}>
                A quick snapshot of today&apos;s workload and follow‑ups.
              </Typography>
            </Box>
            {pendingCount > 0 && (
              <Badge badgeContent={pendingCount} color="error">
                <Notifications fontSize="large" />
              </Badge>
            )}
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <GlassCard>
                <CardContent sx={{ p: 2.6 }}>
                  <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700 }}>
                    Today&apos;s Queue
                  </Typography>
                  <Typography variant="h3" fontWeight={900} sx={{ color: '#0f172a' }}>
                    {appointments.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Total appointments on your schedule
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <GlassCard>
                <CardContent sx={{ p: 2.6 }}>
                  <Typography variant="overline" sx={{ color: '#f97316', fontWeight: 700 }}>
                    Awaiting Review
                  </Typography>
                  <Typography variant="h3" fontWeight={900} sx={{ color: '#b91c1c' }}>
                    {pendingCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    New consultation requests pending action
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <GlassCard>
                <CardContent sx={{ p: 2.6 }}>
                  <Typography variant="overline" sx={{ color: '#10b981', fontWeight: 700 }}>
                    Completed Today
                  </Typography>
                  <Typography variant="h3" fontWeight={900} sx={{ color: '#065f46' }}>
                    {appointments.filter(a => a.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Consultations closed with patients
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <GlassCard>
                <CardContent sx={{ p: 2.6 }}>
                  <Typography variant="overline" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
                    Total Patients
                  </Typography>
                  <Typography variant="h3" fontWeight={900} sx={{ color: '#5b21b6' }}>
                    {patients.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Under your care
                  </Typography>
                </CardContent>
              </GlassCard>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <GlassCard>
                <CardContent sx={{ p: 2.6 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>
                    Next Consultation
                  </Typography>
                  {(() => {
                    const next = nextConsultation();
                    if (!next) {
                      return (
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          No upcoming accepted consultations scheduled.
                        </Typography>
                      );
                    }
                    const timeString = `${new Date(next.appointment_date).toLocaleDateString()} at ${next.appointment_time}`;
                    return (
                      <>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a' }}>
                          {next.patient_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {timeString}
                        </Typography>
                        <Chip
                          icon={<VideoCall fontSize="small" />}
                          label="Video consultation"
                          sx={{ mt: 1.2, fontWeight: 600 }}
                          color="primary"
                          variant="outlined"
                        />
                      </>
                    );
                  })()}
                </CardContent>
              </GlassCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <GlassCard>
                <CardContent sx={{ p: 2.6 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ borderRadius: 999, bgcolor: '#0f766e', '&:hover': { bgcolor: '#115e59' } }}
                      onClick={() => window.dispatchEvent(new CustomEvent('doctorSectionChange', { detail: 'requests' }))}
                    >
                      View Requests
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 999 }}
                      onClick={() => window.dispatchEvent(new CustomEvent('doctorSectionChange', { detail: 'patients' }))}
                    >
                      My Patients
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 999 }}
                      onClick={() => window.dispatchEvent(new CustomEvent('doctorSectionChange', { detail: 'profile' }))}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </CardContent>
              </GlassCard>
            </Grid>
          </Grid>
        </>
      )}

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {activeSection === 'requests' ? 'Consultation Requests' :
             activeSection === 'patients' ? 'My Patients' :
             activeSection === 'video' ? 'Video Consultations' :
             activeSection === 'notifications' ? 'Notifications' :
             activeSection === 'availability' ? 'Availability Status' :
             activeSection === 'profile' ? 'Profile' : ''}
          </Typography>
        </Box>
      </Box>

      {activeSection === 'video' && (
        <>
          {appointments.filter(a => a.status === 'completed').length === 0 ? (
            <Alert severity="info">No completed consultations yet.</Alert>
          ) : (
            <Grid container spacing={3}>
              {appointments.filter(a => a.status === 'completed').map((apt) => (
                <Grid item xs={12} md={6} key={apt.id}>
                  <StyledCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>{apt.patient_name}</Typography>
                        <StatusChip label="COMPLETED" status="completed" size="small" />
                      </Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>{apt.patient_email}</Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="textSecondary">Symptoms:</Typography>
                        <Typography variant="body2">{apt.symptoms}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">Date:</Typography>
                          <Typography variant="body2">{new Date(apt.appointment_date).toLocaleDateString()}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary">Time:</Typography>
                          <Typography variant="body2">{apt.appointment_time}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeSection === 'profile' && (
        <StyledCard>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    bgcolor: '#00897B', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '3rem',
                    color: 'white'
                  }}>
                    👨‍⚕️
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={600}>{profileData.fullName || 'Dr. Name'}</Typography>
                <Typography variant="body2" color="textSecondary">{profileData.specialization || 'Specialization'}</Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight={600} gutterBottom>Personal Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Full Name *</Typography>
                    {editMode ? (
                      <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} required />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.fullName || 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Profile Photo URL</Typography>
                    {editMode ? (
                      <input type="url" value={profileData.profilePhoto} onChange={(e) => setProfileData({...profileData, profilePhoto: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="https://example.com/photo.jpg" />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.profilePhoto || 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Specialization *</Typography>
                    {editMode ? (
                      <input type="text" value={profileData.specialization} onChange={(e) => setProfileData({...profileData, specialization: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="e.g., Cardiology" required />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.specialization || 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Years of Experience *</Typography>
                    {editMode ? (
                      <input type="number" value={profileData.experience} onChange={(e) => setProfileData({...profileData, experience: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="e.g., 10" required />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.experience ? `${profileData.experience} Years` : 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Qualifications *</Typography>
                    {editMode ? (
                      <input type="text" value={profileData.qualifications} onChange={(e) => setProfileData({...profileData, qualifications: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="e.g., MBBS, MD" required />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.qualifications || 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Hospital / Clinic Name</Typography>
                    {editMode ? (
                      <input type="text" value={profileData.hospital} onChange={(e) => setProfileData({...profileData, hospital: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="e.g., City Hospital" />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.hospital || 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">License Number *</Typography>
                    {editMode ? (
                      <input type="text" value={profileData.license} onChange={(e) => setProfileData({...profileData, license: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="e.g., MD-12345" required />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.license || 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Contact Email *</Typography>
                    {editMode ? (
                      <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="doctor@example.com" required />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.email || 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Phone Number *</Typography>
                    {editMode ? (
                      <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="+1 234 567 8900" required />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.phone || 'Not set'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Consultation Fees</Typography>
                    {editMode ? (
                      <input type="number" value={profileData.consultationFees} onChange={(e) => setProfileData({...profileData, consultationFees: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} placeholder="e.g., 500" />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>{profileData.consultationFees ? `₹${profileData.consultationFees}` : 'Not set'}</Typography>
                    )}
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  {editMode ? (
                    <>
                      <Button variant="contained" onClick={() => setEditMode(false)} sx={{ bgcolor: '#00897B', '&:hover': { bgcolor: '#00695C' } }}>
                        Save Profile
                      </Button>
                      <Button variant="outlined" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="contained" onClick={() => setEditMode(true)} sx={{ bgcolor: '#00897B', '&:hover': { bgcolor: '#00695C' } }}>
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      )}

      {activeSection === 'overview' && pendingCount > 0 && (
        <>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#0f172a' }}>
              Pending Consultation Requests
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {appointments.filter(a => a.status === 'pending').slice(0, 4).map((apt) => (
          <Grid item xs={12} md={6} key={apt.id}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {apt.patient_name}
                    </Typography>
                    <StatusChip
                      label={apt.status.toUpperCase()}
                      status={apt.status}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {apt.patient_email}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
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
                    {apt.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleAccept(apt.id)}
                          sx={{ flex: 1 }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleReject(apt.id)}
                          sx={{ flex: 1 }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {apt.status === 'accepted' && (
                      <Button
                        variant="contained"
                        startIcon={<VideoCall />}
                        onClick={() => handleStartCall(apt)}
                        fullWidth
                      >
                        Start Video Call
                      </Button>
                    )}

                    {apt.status === 'completed' && (
                      <Chip
                        label="Consultation Completed"
                        color="success"
                        sx={{ width: '100%' }}
                      />
                    )}

                    {apt.status === 'rejected' && (
                      <Chip
                        label="Request Rejected"
                        color="error"
                        sx={{ width: '100%' }}
                      />
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
            ))}
          </Grid>
          {pendingCount > 4 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setActiveSection('requests')}
                sx={{ borderRadius: 999 }}
              >
                View All {pendingCount} Pending Requests
              </Button>
            </Box>
          )}
        </>
      )}

      {activeSection === 'requests' && (
        <>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : appointments.length === 0 ? (
            <Alert severity="info">
              No consultation requests at the moment.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {appointments.map((apt) => (
            <Grid item xs={12} md={6} key={apt.id}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {apt.patient_name}
                    </Typography>
                    <StatusChip
                      label={apt.status.toUpperCase()}
                      status={apt.status}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {apt.patient_email}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
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
                    {apt.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleAccept(apt.id)}
                          sx={{ flex: 1 }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleReject(apt.id)}
                          sx={{ flex: 1 }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {apt.status === 'accepted' && (
                      <Button
                        variant="contained"
                        startIcon={<VideoCall />}
                        onClick={() => handleStartCall(apt)}
                        fullWidth
                      >
                        Start Video Call
                      </Button>
                    )}

                    {apt.status === 'completed' && (
                      <Chip
                        label="Consultation Completed"
                        color="success"
                        sx={{ width: '100%' }}
                      />
                    )}

                    {apt.status === 'rejected' && (
                      <Chip
                        label="Request Rejected"
                        color="error"
                        sx={{ width: '100%' }}
                      />
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <PrescriptionFormModal
        open={showPrescriptionForm}
        onClose={() => {
          setShowPrescriptionForm(false);
          setSelectedAppointment(null);
          fetchAppointments();
        }}
        appointmentId={selectedAppointment?.id}
      />

      {activeSection === 'patients' && (
        <>
          {patients.length === 0 ? (
            <Alert severity="info">
              No patients yet. Patients will appear here after you accept and complete consultations.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {patients.map((patient) => (
              <Grid item xs={12} md={4} key={patient.id}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600}>{patient.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{patient.email}</Typography>
                    <Typography variant="body2" color="textSecondary">{patient.phone}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="textSecondary">Last Visit:</Typography>
                    <Typography variant="body2">{patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'N/A'}</Typography>
                    <Button variant="contained" startIcon={<Visibility />} onClick={() => handlePatientSelect(patient)} fullWidth sx={{ mt: 2 }}>
                      View Details
                    </Button>
                  </CardContent>
                </StyledCard>
              </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeSection === 'patient-details' && selectedPatient && (
        <>
          <Button onClick={() => setActiveSection('patients')} sx={{ mb: 2 }}>← Back to Patients</Button>
          <Typography variant="h4" fontWeight={700} gutterBottom>{selectedPatient.name}</Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>Medical Records</Typography>
                    <IconButton color="primary" onClick={() => setShowRecordDialog(true)}><Add /></IconButton>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Diagnosis</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patientRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.record_type}</TableCell>
                            <TableCell>{record.diagnosis}</TableCell>
                            <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Health Analytics</Typography>
                  {patientAnalytics && (
                    <>
                      <Typography variant="body2">Total Predictions: {patientAnalytics.total_predictions}</Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Risk Distribution:</Typography>
                        {Object.entries(patientAnalytics.risk_distribution).map(([risk, count]) => (
                          <Chip key={risk} label={`${risk}: ${count}`} size="small" sx={{ mr: 1, mt: 1 }} />
                        ))}
                      </Box>
                    </>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>Treatment History</Typography>
                    <IconButton color="primary" onClick={() => setShowTreatmentDialog(true)}><Add /></IconButton>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Outcome</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {treatmentHistory.map((treatment) => (
                          <TableRow key={treatment.id}>
                            <TableCell>{treatment.treatment_type}</TableCell>
                            <TableCell>{treatment.description}</TableCell>
                            <TableCell>{treatment.outcome}</TableCell>
                            <TableCell>{new Date(treatment.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </>
      )}

      <Dialog open={showRecordDialog} onClose={() => setShowRecordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Medical Record</DialogTitle>
        <DialogContent>
          <TextField select label="Record Type" fullWidth value={newRecord.record_type} onChange={(e) => setNewRecord({...newRecord, record_type: e.target.value})} sx={{ mt: 2 }}>
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="lab">Lab Report</MenuItem>
            <MenuItem value="imaging">Imaging</MenuItem>
            <MenuItem value="consultation">Consultation</MenuItem>
          </TextField>
          <TextField label="Diagnosis" fullWidth multiline rows={2} value={newRecord.diagnosis} onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})} sx={{ mt: 2 }} />
          <TextField label="Notes" fullWidth multiline rows={3} value={newRecord.notes} onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRecordDialog(false)}>Cancel</Button>
          <Button onClick={handleAddRecord} variant="contained">Add Record</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showTreatmentDialog} onClose={() => setShowTreatmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Treatment History</DialogTitle>
        <DialogContent>
          <TextField label="Treatment Type" fullWidth value={newTreatment.treatment_type} onChange={(e) => setNewTreatment({...newTreatment, treatment_type: e.target.value})} sx={{ mt: 2 }} />
          <TextField label="Description" fullWidth multiline rows={2} value={newTreatment.description} onChange={(e) => setNewTreatment({...newTreatment, description: e.target.value})} sx={{ mt: 2 }} />
          <TextField label="Medications" fullWidth value={newTreatment.medications} onChange={(e) => setNewTreatment({...newTreatment, medications: e.target.value})} sx={{ mt: 2 }} />
          <TextField label="Outcome" fullWidth multiline rows={2} value={newTreatment.outcome} onChange={(e) => setNewTreatment({...newTreatment, outcome: e.target.value})} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTreatmentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTreatment} variant="contained">Add Treatment</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default DoctorDashboard;
