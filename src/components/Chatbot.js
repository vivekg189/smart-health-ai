import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff } from 'lucide-react';
import config from '../config';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setLoading(true);
    setError(null);
    const userInput = input;
    setInput('');
    try {
      const res = await fetch(`${config.API_BASE}/groq-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });
      const data = await res.json();
      if (res.ok && data.response) {
        setMessages(msgs => [...msgs, { from: 'bot', text: data.response }]);
      } else {
        let errorMessage = 'Sorry, there was an error getting a response.';
        if (data.error) {
          if (data.error.includes('Invalid Groq API key')) {
            errorMessage = 'API key configuration error. Please contact support.';
          } else if (data.error.includes('rate limit') || data.error.includes('quota')) {
            errorMessage = 'Service is busy. Please try again in a moment.';
          } else if (data.error.includes('Groq API error')) {
            errorMessage = 'AI service is temporarily unavailable. Please try again later.';
          } else if (data.error.includes('Network error')) {
            errorMessage = 'Connection error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${data.error}`;
          }
        }
        setMessages(msgs => [...msgs, { from: 'bot', text: errorMessage }]);
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Network error. Please check your connection.' }]);
      setError('Network error');
    }
    setLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }
      
      const recorder = new MediaRecorder(stream, options);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = async () => {
        clearInterval(recordingTimerRef.current);
        setRecordingTime(0);
        
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        if (blob.size < 1000) {
          setMessages(msgs => [...msgs, { from: 'bot', text: 'Recording too short. Please speak longer.' }]);
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        setLoading(true);
        try {
          const res = await fetch(`${config.API_BASE}/transcribe-audio`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (res.ok && data.text) {
            const transcribedText = data.text;
            setMessages(msgs => [...msgs, { from: 'user', text: transcribedText }]);
            
            // Automatically send to chatbot
            try {
              const chatRes = await fetch(`${config.API_BASE}/groq-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: transcribedText })
              });
              const chatData = await chatRes.json();
              if (chatRes.ok && chatData.response) {
                setMessages(msgs => [...msgs, { from: 'bot', text: chatData.response }]);
              } else {
                setMessages(msgs => [...msgs, { from: 'bot', text: 'Sorry, there was an error getting a response.' }]);
              }
            } catch (err) {
              setMessages(msgs => [...msgs, { from: 'bot', text: 'Network error. Please check your connection.' }]);
            }
          } else {
            setMessages(msgs => [...msgs, { from: 'bot', text: data.error || 'Failed to transcribe audio.' }]);
          }
        } catch (err) {
          setMessages(msgs => [...msgs, { from: 'bot', text: 'Transcription error. Please try again.' }]);
        }
        setLoading(false);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      
      // Start timer
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Microphone access denied. Please allow microphone access.' }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            borderRadius: '50%',
            width: 60,
            height: 60,
            background: '#61a8ef',
            color: 'white',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          aria-label="Open chatbot"
        >
          <Bot size={30} />
        </button>
      )}
      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 400,
            height: 500,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
          }}
        >
          <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 'bold', background: '#0066cc', color: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, fontSize: 18 }}>
            Healthcare Bot
            <button onClick={() => setOpen(false)} style={{ float: 'right', background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer' }}>&times;</button>
          </div>
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f9f9f9' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.from === 'user' ? 'right' : 'left',
                  margin: '10px 0'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    background: msg.from === 'user' ? '#0066cc' : '#e5e7eb',
                    color: msg.from === 'user' ? 'white' : '#111',
                    borderRadius: 12,
                    padding: '10px 14px',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    textAlign: 'left',
                    fontSize: 15,
                    lineHeight: 1.5
                  }}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i !== msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'left', margin: '10px 0', color: '#888', fontSize: 14 }}>Healthcare Bot is typing...</div>
            )}
            {error && (
              <div style={{ color: 'red', fontSize: 12 }}>{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #eee', padding: 12, background: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, gap: 10, flexDirection: 'column' }}>
            {recording && (
              <div style={{ background: '#fee', padding: '8px 14px', borderRadius: 6, textAlign: 'center', fontSize: 14, color: '#dc2626', fontWeight: 500 }}>
                🔴 Recording... {recordingTime}s
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !recording) handleSend(); }}
                placeholder="Type or speak..."
                disabled={recording}
                style={{ flex: 1, border: 'none', outline: 'none', padding: 12, borderRadius: 8, background: recording ? '#f9fafb' : '#f3f4f6', fontSize: 15 }}
              />
              <button
                onClick={recording ? stopRecording : startRecording}
                style={{ background: recording ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 48 }}
                title={recording ? 'Stop recording' : 'Start recording'}
              >
                {recording ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button
                onClick={handleSend}
                disabled={recording || !input.trim()}
                style={{ background: recording || !input.trim() ? '#94a3b8' : '#0066cc', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: recording || !input.trim() ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 500 }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 