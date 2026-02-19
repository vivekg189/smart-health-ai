import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Tabs, Tab, TextField, Button, Switch, FormControlLabel, Select, MenuItem, Alert, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { User, Heart, Bell, Shield, Lock, Save, Download, Trash2, AlertCircle } from 'lucide-react';
import BackButton from '../components/BackButton';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    created_at: '',
    last_login: ''
  });

  // Health Data State
  const [healthData, setHealthData] = useState({
    height: '',
    weight: '',
    bmi: '',
    blood_group: '',
    known_conditions: [],
    allergies: '',
    family_history: '',
    is_smoker: false,
    alcohol_consumption: false,
    exercise_frequency: ''
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    risk_alerts: true,
    appointment_updates: true,
    prescription_alerts: true,
    emergency_alerts: true,
    meal_reminders: false,
    risk_threshold: 70
  });

  // Privacy State
  const [privacy, setPrivacy] = useState({
    data_sharing_consent: false
  });

  // Security State
  const [security, setSecurity] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (activeTab === 0) fetchProfile();
    if (activeTab === 1) fetchHealthData();
    if (activeTab === 2) fetchNotifications();
    if (activeTab === 3) fetchPrivacy();
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHealthData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/health-data', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrivacy = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/privacy', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPrivacy(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      setMessage({ type: res.ok ? 'success' : 'error', text: data.message || data.error });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
    setLoading(false);
  };

  const saveHealthData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings/health-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(healthData)
      });
      const data = await res.json();
      setMessage({ type: res.ok ? 'success' : 'error', text: data.message || data.error });
      if (res.ok) fetchHealthData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update health data' });
    }
    setLoading(false);
  };

  const saveNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(notifications)
      });
      const data = await res.json();
      setMessage({ type: res.ok ? 'success' : 'error', text: data.message || data.error });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update notifications' });
    }
    setLoading(false);
  };

  const savePrivacy = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(privacy)
      });
      const data = await res.json();
      setMessage({ type: res.ok ? 'success' : 'error', text: data.message || data.error });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update privacy settings' });
    }
    setLoading(false);
  };

  const changePassword = async () => {
    if (security.new_password !== security.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ old_password: security.old_password, new_password: security.new_password })
      });
      const data = await res.json();
      setMessage({ type: res.ok ? 'success' : 'error', text: data.message || data.error });
      if (res.ok) setSecurity({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    }
    setLoading(false);
  };

  const exportData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/export-data', { credentials: 'include' });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'health-data.json';
      a.click();
      setMessage({ type: 'success', text: 'Data exported successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/delete-account', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
    }
    setDeleteDialog(false);
  };

  const conditionsList = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid', 'Arthritis'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Settings</Typography>
      </Box>
      
      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<User size={20} />} label="Profile" />
          <Tab icon={<Heart size={20} />} label="Health Data" />
          <Tab icon={<Bell size={20} />} label="Notifications" />
          <Tab icon={<Shield size={20} />} label="Privacy" />
          <Tab icon={<Lock size={20} />} label="Security" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Profile Information</Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <TextField label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <TextField label="Phone Number" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <TextField label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={profile.date_of_birth || ''} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} />
            <Select value={profile.gender || ''} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} displayEmpty>
              <MenuItem value="">Select Gender</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">Member Since: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</Typography>
              <Typography variant="body2" color="textSecondary">Last Login: {profile.last_login ? new Date(profile.last_login).toLocaleString() : 'N/A'}</Typography>
            </Box>
            <Button variant="contained" startIcon={<Save size={18} />} onClick={saveProfile} disabled={loading} sx={{ bgcolor: '#00897B', '&:hover': { bgcolor: '#00695C' } }}>
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Health Data Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Health Information</Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Height (cm)" type="number" value={healthData.height || ''} onChange={(e) => setHealthData({ ...healthData, height: e.target.value })} />
            <TextField label="Weight (kg)" type="number" value={healthData.weight || ''} onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })} />
            {healthData.bmi && <Alert severity="info">BMI: {healthData.bmi}</Alert>}
            <Select value={healthData.blood_group || ''} onChange={(e) => setHealthData({ ...healthData, blood_group: e.target.value })} displayEmpty>
              <MenuItem value="">Select Blood Group</MenuItem>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
            </Select>
            <Box>
              <Typography variant="body2" gutterBottom>Known Conditions</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {conditionsList.map(c => (
                  <Chip
                    key={c}
                    label={c}
                    onClick={() => {
                      const conditions = healthData.known_conditions || [];
                      setHealthData({
                        ...healthData,
                        known_conditions: conditions.includes(c) ? conditions.filter(x => x !== c) : [...conditions, c]
                      });
                    }}
                    color={healthData.known_conditions?.includes(c) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>
            <TextField label="Allergies" multiline rows={2} value={healthData.allergies || ''} onChange={(e) => setHealthData({ ...healthData, allergies: e.target.value })} />
            <TextField label="Family History" multiline rows={2} value={healthData.family_history || ''} onChange={(e) => setHealthData({ ...healthData, family_history: e.target.value })} />
            <FormControlLabel control={<Switch checked={healthData.is_smoker} onChange={(e) => setHealthData({ ...healthData, is_smoker: e.target.checked })} />} label="Smoker" />
            <FormControlLabel control={<Switch checked={healthData.alcohol_consumption} onChange={(e) => setHealthData({ ...healthData, alcohol_consumption: e.target.checked })} />} label="Alcohol Consumption" />
            <Select value={healthData.exercise_frequency || ''} onChange={(e) => setHealthData({ ...healthData, exercise_frequency: e.target.value })} displayEmpty>
              <MenuItem value="">Exercise Frequency</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="3-5 times/week">3-5 times/week</MenuItem>
              <MenuItem value="1-2 times/week">1-2 times/week</MenuItem>
              <MenuItem value="Rarely">Rarely</MenuItem>
            </Select>
            <Button variant="contained" startIcon={<Save size={18} />} onClick={saveHealthData} disabled={loading} sx={{ bgcolor: '#00897B', '&:hover': { bgcolor: '#00695C' } }}>
              {loading ? <CircularProgress size={24} /> : 'Save Health Data'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Notifications Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <FormControlLabel control={<Switch checked={notifications.risk_alerts} onChange={(e) => setNotifications({ ...notifications, risk_alerts: e.target.checked })} />} label="Risk Alert Notifications" />
            <FormControlLabel control={<Switch checked={notifications.appointment_updates} onChange={(e) => setNotifications({ ...notifications, appointment_updates: e.target.checked })} />} label="Appointment Updates" />
            <FormControlLabel control={<Switch checked={notifications.prescription_alerts} onChange={(e) => setNotifications({ ...notifications, prescription_alerts: e.target.checked })} />} label="Prescription Alerts" />
            <FormControlLabel control={<Switch checked={notifications.emergency_alerts} onChange={(e) => setNotifications({ ...notifications, emergency_alerts: e.target.checked })} />} label="Emergency Alerts" />
            <FormControlLabel control={<Switch checked={notifications.meal_reminders} onChange={(e) => setNotifications({ ...notifications, meal_reminders: e.target.checked })} />} label="Meal Plan Reminders" />
            <TextField label="Notify if risk exceeds (%)" type="number" value={notifications.risk_threshold} onChange={(e) => setNotifications({ ...notifications, risk_threshold: parseInt(e.target.value) })} />
            <Button variant="contained" startIcon={<Save size={18} />} onClick={saveNotifications} disabled={loading} sx={{ bgcolor: '#00897B', '&:hover': { bgcolor: '#00695C' } }}>
              {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Privacy Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Privacy & Data</Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <FormControlLabel control={<Switch checked={privacy.data_sharing_consent} onChange={(e) => setPrivacy({ ...privacy, data_sharing_consent: e.target.checked })} />} label="Allow Data Sharing for Research" />
            <Button variant="outlined" startIcon={<Download size={18} />} onClick={exportData}>Download My Health Data</Button>
            <Alert severity="warning" icon={<AlertCircle size={20} />}>
              Deleting your account will permanently remove all your data. This action cannot be undone.
            </Alert>
            <Button variant="outlined" color="error" startIcon={<Trash2 size={18} />} onClick={() => setDeleteDialog(true)}>Delete Account</Button>
            <Button variant="contained" startIcon={<Save size={18} />} onClick={savePrivacy} disabled={loading} sx={{ bgcolor: '#00897B', '&:hover': { bgcolor: '#00695C' } }}>
              {loading ? <CircularProgress size={24} /> : 'Save Privacy Settings'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Security Tab */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>Security Settings</Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Current Password" type="password" value={security.old_password} onChange={(e) => setSecurity({ ...security, old_password: e.target.value })} />
            <TextField label="New Password" type="password" value={security.new_password} onChange={(e) => setSecurity({ ...security, new_password: e.target.value })} />
            <TextField label="Confirm New Password" type="password" value={security.confirm_password} onChange={(e) => setSecurity({ ...security, confirm_password: e.target.value })} />
            <Button variant="contained" startIcon={<Lock size={18} />} onClick={changePassword} disabled={loading} sx={{ bgcolor: '#00897B', '&:hover': { bgcolor: '#00695C' } }}>
              {loading ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </Box>
        </Box>
      )}
      </Box>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete your account? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={deleteAccount} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;
