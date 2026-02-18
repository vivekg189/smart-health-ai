import React, { useEffect, useRef, useState } from 'react';
import { Container, Typography, Box, Button, Paper, TextField, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowBack, Send } from '@mui/icons-material';

const VideoConsultation = () => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const roomId = searchParams.get('room');
  const doctorName = searchParams.get('doctor');

  useEffect(() => {
    if (!roomId) {
      navigate('/meet-doctor');
      return;
    }

    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initializeJitsi();
      document.body.appendChild(script);
    };

    const initializeJitsi = () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }

      const options = {
        roomName: roomId,
        width: '100%',
        height: 600,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'settings',
            'videoquality',
            'tileview'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        },
        userInfo: {
          displayName: 'Patient'
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);

      jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
        navigate('/meet-doctor');
      });

      jitsiApiRef.current.addEventListener('incomingMessage', (event) => {
        setMessages(prev => [...prev, { text: event.message, sender: event.from, time: new Date() }]);
      });
    };

    loadJitsiScript();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('sendChatMessage', newMessage);
      setMessages(prev => [...prev, { text: newMessage, sender: 'You', time: new Date() }]);
      setNewMessage('');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/meet-doctor')}
          variant="outlined"
        >
          Back to Doctors
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom align="center">
        Video Consultation
      </Typography>

      {doctorName && (
        <Typography variant="h6" gutterBottom align="center" color="text.secondary">
          with {doctorName}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Box
          ref={jitsiContainerRef}
          sx={{
            flex: 2,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            minHeight: 600
          }}
        />

        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: 600 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Chat</Typography>
          </Box>
          
          <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.map((msg, idx) => (
              <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {msg.sender} • {msg.time.toLocaleTimeString()}
                </Typography>
                <ListItemText primary={msg.text} />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
            />
            <IconButton color="primary" onClick={handleSendMessage}>
              <Send />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VideoConsultation;
