import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Grid, Alert, CircularProgress,
  Divider, Badge, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tabs, Tab
} from '@mui/material';
import {
  VideoCall, CheckCircle, Cancel, Notifications, People, Assignment, LocalHospital,
  TrendingUp, History, Chat, Description, Add, Visibility
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import VideoCallRoom from '../../components/VideoCallRoom';
import PrescriptionFormModal from '../../components/PrescriptionFormModal';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s',
  '&:hover': { transform: 'translateY(-4px)' },
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
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 46px rgba(15,23,42,0.18)' }
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
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({ record_type: 'general', diagnosis: '', notes: '' });
  const [newTreatment, setNewTreatment] = useState({ treatment_type: '', description: '', medications: '', outcome: '' });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    const interval = setInterval(fetchAppointments, 30000);
    
    const handleSectionChange = (e) => setActiveSection(e.detail);
    window.addEventListener('doctorSectionChange', handleSectionChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('doctorSectionChange', handleSectionChange);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments/doctor', { credentials: 'include' });
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
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/accept`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) fetchAppointments();
    } catch (err) {
      console.error('Error accepting appointment:', err);
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/reject`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) fetchAppointments();
    } catch (err) {
      console.error('Error rejecting appointment:', err);
    }
  };

  const handleStartCall = (appointment) => setActiveCall(appointment);

  const handleEndCall = () => {
    setSelectedAppointment(activeCall);
    setActiveCall(null);
    setShowPrescriptionForm(true);
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  if (activeCall) {
    return <VideoCallRoom appointmentId={activeCall.id} userRole="doctor" onEndCall={handleEndCall} />;
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', background: 'linear-gradient(180deg, #f9fafb 0%, #eef2ff 35%, #e0f2fe 100%)', py: 4 }}>
      <Container maxWidth="xl">
        {activeSection === 'overview' && (
          <>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#0f172a' }}>
                  Clinical Overview
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569' }}>
                  Quick snapshot of today's workload and follow-ups
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
                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700 }}>Today's Queue</Typography>
                    <Typography variant="h3" fontWeight={900} sx={{ color: '#0f172a' }}>{appointments.length}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Total appointments</Typography>
                  </CardContent>
                </GlassCard>
              </Grid>
              <Grid item xs={12} md={3}>
                <GlassCard>
                  <CardContent sx={{ p: 2.6 }}>
                    <Typography variant="overline" sx={{ color: '#f97316', fontWeight: 700 }}>Awaiting Review</Typography>
                    <Typography variant="h3" fontWeight={900} sx={{ color: '#b91c1c' }}>{pendingCount}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Pending requests</Typography>
                  </CardContent>
                </GlassCard>
              </Grid>
              <Grid item xs={12} md={3}>
                <GlassCard>
                  <CardContent sx={{ p: 2.6 }}>
                    <Typography variant="overline" sx={{ color: '#10b981', fontWeight: 700 }}>Completed</Typography>
                    <Typography variant="h3" fontWeight={900} sx={{ color: '#065f46' }}>
                      {appointments.filter(a => a.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Consultations closed</Typography>
                  </CardContent>
                </GlassCard>
              </Grid>
              <Grid item xs={12} md={3}>
                <GlassCard>
                  <CardContent sx={{ p: 2.6 }}>
                    <Typography variant="overline" sx={{ color: '#8b5cf6', fontWeight: 700 }}>Total Patients</Typography>
                    <Typography variant="h3" fontWeight={900} sx={{ color: '#5b21b6' }}>{patients.length}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Under your care</Typography>
                  </CardContent>
                </GlassCard>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <GlassCard>
                  <CardContent sx={{ p: 2.6 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0f172a' }}>Quick Actions</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      <Button variant="contained" startIcon={<Assignment />} onClick={() => setActiveSection('appointments')} sx={{ borderRadius: 999 }}>
                        Appointments
                      </Button>
                      <Button variant="outlined" startIcon={<People />} onClick={() => setActiveSection('patients')} sx={{ borderRadius: 999 }}>
                        My Patients
                      </Button>
                      <Button variant="outlined" startIcon={<Description />} onClick={() => setActiveSection('prescriptions')} sx={{ borderRadius: 999 }}>
                        Prescriptions
                      </Button>
                    </Box>
                  </CardContent>
                </GlassCard>
              </Grid>
            </Grid>
          </>
        )}

        {activeSection === 'appointments' && (
          <>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>Appointment Management</Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
            ) : appointments.length === 0 ? (
              <Alert severity="info">No appointments at the moment.</Alert>
            ) : (
              <Grid container spacing={3}>
                {appointments.map((apt) => (
                  <Grid item xs={12} md={6} key={apt.id}>
                    <StyledCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600}>{apt.patient_name}</Typography>
                          <StatusChip label={apt.status.toUpperCase()} status={apt.status} size="small" />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>{apt.patient_email}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="textSecondary">Symptoms:</Typography>
                          <Typography variant="body2">{apt.symptoms}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="textSecondary">Date:</Typography>
                            <Typography variant="body2">{new Date(apt.appointment_date).toLocaleDateString()}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="textSecondary">Time:</Typography>
                            <Typography variant="body2">{apt.appointment_time}</Typography>
                          </Box>
                        </Box>
                        {apt.is_emergency && <Chip label="EMERGENCY" color="error" size="small" sx={{ mb: 2 }} />}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {apt.status === 'pending' && (
                            <>
                              <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleAccept(apt.id)} sx={{ flex: 1 }}>
                                Accept
                              </Button>
                              <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => handleReject(apt.id)} sx={{ flex: 1 }}>
                                Reject
                              </Button>
                            </>
                          )}
                          {apt.status === 'accepted' && (
                            <Button variant="contained" startIcon={<VideoCall />} onClick={() => handleStartCall(apt)} fullWidth>
                              Start Video Call
                            </Button>
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

        {activeSection === 'patients' && (
          <>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>My Patients</Typography>
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
          </>
        )}

        {activeSection === 'patient-details' && selectedPatient && (
          <>
            <Button onClick={() => setActiveSection('patients')} sx={{ mb: 2 }}>← Back to Patients</Button>
            <Typography variant="h4" fontWeight={700} gutterBottom>{selectedPatient.name}</Typography>
            
            <Tabs value={0} sx={{ mb: 3 }}>
              <Tab label="Records" icon={<Assignment />} />
              <Tab label="Analytics" icon={<TrendingUp />} />
              <Tab label="Treatment History" icon={<History />} />
            </Tabs>

            <Grid container spacing={3}>
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

        <PrescriptionFormModal
          open={showPrescriptionForm}
          onClose={() => {
            setShowPrescriptionForm(false);
            setSelectedAppointment(null);
            fetchAppointments();
          }}
          appointmentId={selectedAppointment?.id}
        />

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
