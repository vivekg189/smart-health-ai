import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  Send,
  Person
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 'calc(100vh - 100px)',
  backgroundColor: '#000',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
}));

const VideoElement = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ControlsBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: theme.spacing(3),
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: 'calc(100vh - 100px)',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
}));

const MessagesBox = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
}));

const VideoCallRoom = ({ appointmentId, userRole, onEndCall }) => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [patientSummary, setPatientSummary] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeMedia();
    fetchMessages();
    if (userRole === 'doctor') {
      fetchPatientSummary();
    }
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/messages`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchPatientSummary = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/data/patient-summary/${appointmentId}`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setPatientSummary(data);
      }
    } catch (err) {
      console.error('Error fetching patient summary:', err);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = localVideoRef.current.srcObject.getVideoTracks();
      tracks.forEach(track => track.enabled = !videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = localVideoRef.current.srcObject.getAudioTracks();
      tracks.forEach(track => track.enabled = !audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const handleEndCall = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    onEndCall();
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ message: newMessage })
        }
      );

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', overflow: 'hidden' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={8}>
          <VideoContainer>
            <VideoElement ref={localVideoRef} autoPlay muted />
            <ControlsBar>
              <IconButton
                onClick={toggleVideo}
                sx={{ color: videoEnabled ? 'white' : 'red' }}
              >
                {videoEnabled ? <Videocam /> : <VideocamOff />}
              </IconButton>
              <IconButton
                onClick={toggleAudio}
                sx={{ color: audioEnabled ? 'white' : 'red' }}
              >
                {audioEnabled ? <Mic /> : <MicOff />}
              </IconButton>
              <IconButton
                onClick={handleEndCall}
                sx={{ color: 'white', backgroundColor: 'red' }}
              >
                <CallEnd />
              </IconButton>
            </ControlsBar>
          </VideoContainer>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ChatContainer>
            <Box sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
              <Typography variant="h6">Chat</Typography>
            </Box>
            <MessagesBox>
              {messages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: msg.sender_role === userRole ? '#e3f2fd' : 'white',
                    maxWidth: '85%',
                    ml: msg.sender_role === userRole ? 'auto' : 0
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {msg.sender_name}
                  </Typography>
                  <Typography variant="body2">{msg.message}</Typography>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </MessagesBox>
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <IconButton color="primary" onClick={sendMessage}>
                <Send />
              </IconButton>
            </Box>
          </ChatContainer>

          {userRole === 'doctor' && patientSummary && (
            <Card sx={{ mt: 2, maxHeight: '200px', overflow: 'auto' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Patient Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="textSecondary">
                  Recent Predictions
                </Typography>
                {patientSummary.predictions?.map((pred, idx) => (
                  <Box key={idx} sx={{ mt: 1 }}>
                    <Chip
                      label={`${pred.disease_type}: ${pred.risk_level}`}
                      size="small"
                      color={pred.risk_level.includes('High') ? 'error' : 'warning'}
                    />
                  </Box>
                ))}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="textSecondary">
                  Previous Consultations
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {patientSummary.consultation_count || 0} consultations
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default VideoCallRoom;
