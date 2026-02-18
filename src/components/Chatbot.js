import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import config from '../config';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

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
        // Show more specific error messages
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
            width: 320,
            height: 420,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
          }}
        >
          <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 'bold', background: '#0066cc', color: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            Healthcare Bot
            <button onClick={() => setOpen(false)} style={{ float: 'right', background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>&times;</button>
          </div>
          <div style={{ flex: 1, padding: 12, overflowY: 'auto', background: '#f9f9f9' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.from === 'user' ? 'right' : 'left',
                  margin: '8px 0'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    background: msg.from === 'user' ? '#0066cc' : '#e5e7eb',
                    color: msg.from === 'user' ? 'white' : '#111',
                    borderRadius: 12,
                    padding: '8px 12px',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    textAlign: 'left'
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
              <div style={{ textAlign: 'left', margin: '8px 0', color: '#888' }}>Healthcare Bot is typing...</div>
            )}
            {error && (
              <div style={{ color: 'red', fontSize: 12 }}>{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, background: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type your message..."
              style={{ flex: 1, border: 'none', outline: 'none', padding: 8, borderRadius: 8, background: '#f3f4f6' }}
            />
            <button
              onClick={handleSend}
              style={{ marginLeft: 8, background: '#0066cc', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 