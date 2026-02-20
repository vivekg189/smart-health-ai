# Voice Recognition Feature Implementation

## Overview
Added microphone access with Whisper model for voice recognition in the chatbot, along with increased chatbot size for better user experience.

## Changes Made

### 1. Backend (app.py)
- **New Endpoint**: `/api/transcribe-audio` (POST)
  - Accepts audio file uploads
  - Uses Groq's Whisper-large-v3 model for transcription
  - Returns transcribed text

### 2. Frontend (Chatbot.js)
- **Increased Size**: 
  - Width: 320px → 450px
  - Height: 420px → 600px
- **Voice Recording**:
  - Added microphone button with recording state
  - Uses browser's MediaRecorder API
  - Records audio in webm format
  - Sends to backend for transcription
  - Auto-fills input field with transcribed text
- **UI Improvements**:
  - Larger input field with better padding
  - Visual feedback for recording state (red when recording)
  - Mic/MicOff icons from lucide-react

## How to Use

### For Users:
1. Click the chatbot icon to open
2. Click the microphone button (green) to start recording
3. Speak your message
4. Click the microphone button again (red) to stop
5. The transcribed text appears in the input field
6. Click Send or press Enter to submit

### For Developers:
1. Ensure GROQ_API_KEY is set in backend/.env
2. Backend automatically uses Whisper-large-v3 model
3. No additional dependencies needed (groq>=0.4.0 already in requirements.txt)

## Technical Details

### Audio Processing Flow:
1. User clicks mic → Browser requests microphone permission
2. MediaRecorder captures audio stream
3. On stop → Audio blob created (webm format)
4. FormData uploads to `/api/transcribe-audio`
5. Backend uses Groq Whisper API
6. Transcribed text returned to frontend
7. Text auto-fills input field

### Error Handling:
- Microphone access denied → User notification
- Transcription failure → Error message in chat
- Network errors → Graceful fallback

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Requires HTTPS for microphone access
- Mobile browsers: Supported with user permission

## Security Notes
- Microphone access requires user permission
- Audio data sent securely to backend
- No audio stored permanently
- HTTPS required in production

## Future Enhancements
- Real-time streaming transcription
- Multiple language support
- Voice activity detection
- Audio playback for bot responses
