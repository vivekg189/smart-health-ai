import React, { useEffect, useRef } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const VideoConsultation = () => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'settings',
            'videoquality',
            'filmstrip',
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
    };

    loadJitsiScript();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomId, navigate]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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

      <Box
        ref={jitsiContainerRef}
        sx={{
          mt: 3,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3
        }}
      />
    </Container>
  );
};

export default VideoConsultation;
