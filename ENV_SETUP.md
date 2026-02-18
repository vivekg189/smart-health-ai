# Environment Variables Configuration Guide

This document explains how to configure environment variables for the Healthcare Prediction System.

## Overview

All API keys and sensitive configuration have been centralized into `.env` files:
- **Frontend**: Root `.env` file for React environment variables
- **Backend**: `backend/.env` file for Flask environment variables

## Backend Environment Variables

Location: `backend/.env`

```env
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key-here
```

### Variables:

1. **DATABASE_URL** (Required for database features)
   - PostgreSQL connection string
   - Format: `postgresql://username:password@host:port/database`
   - Used for: User authentication, appointments, predictions storage

2. **SECRET_KEY** (Required)
   - Flask session secret key
   - Generate: `python -c "import secrets; print(secrets.token_hex(32))"`
   - Used for: Session management, JWT tokens

3. **GROQ_API_KEY** (Required for AI features)
   - Groq API key for AI chatbot
   - Get from: https://console.groq.com/
   - Used for: AI assistant, hospital analysis, symptom checker

## Frontend Environment Variables

Location: `.env` (root directory)

```env
REACT_APP_API_URL=http://localhost:5000
```

### Variables:

1. **REACT_APP_API_URL** (Required)
   - Backend API base URL
   - Development: `http://localhost:5000`
   - Production: Your deployed backend URL (e.g., `https://api.yourdomain.com`)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your actual values
```

### 2. Frontend Setup

```bash
# From root directory
cp .env.example .env
# Edit .env if needed (default works for local development)
```

### 3. Verify Configuration

**Backend:**
```bash
cd backend
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('GROQ_API_KEY:', 'SET' if os.getenv('GROQ_API_KEY') else 'NOT SET')"
```

**Frontend:**
```bash
npm start
# Check browser console for API_URL
```

## Usage in Code

### Backend (Python/Flask)

```python
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
DATABASE_URL = os.getenv('DATABASE_URL')
SECRET_KEY = os.getenv('SECRET_KEY')
```

### Frontend (React)

```javascript
import config from './config';

// Use config.API_BASE for API calls
fetch(`${config.API_BASE}/predict/diabetes`, {...})
```

## Security Best Practices

1. **Never commit `.env` files** to version control
   - `.env` files are in `.gitignore`
   - Only commit `.env.example` templates

2. **Use different keys for development and production**
   - Development: Test keys with limited access
   - Production: Secure keys with full access

3. **Rotate keys regularly**
   - Change SECRET_KEY periodically
   - Regenerate API keys if compromised

4. **Restrict API key permissions**
   - Use read-only keys where possible
   - Limit API key scope to required services

## Production Deployment

### Environment Variables Setup

**Vercel/Netlify (Frontend):**
```
REACT_APP_API_URL=https://your-backend-url.com
```

**Heroku/Railway (Backend):**
```
DATABASE_URL=<provided-by-platform>
SECRET_KEY=<generate-new-secure-key>
GROQ_API_KEY=<your-production-key>
```

### Build Commands

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
pip install -r requirements.txt
gunicorn app:app
```

## Troubleshooting

### Issue: "GROQ_API_KEY not found"
**Solution:** Ensure `backend/.env` exists with valid GROQ_API_KEY

### Issue: "Cannot connect to database"
**Solution:** Check DATABASE_URL format and credentials

### Issue: "API calls failing in frontend"
**Solution:** 
1. Verify REACT_APP_API_URL in root `.env`
2. Restart React dev server after changing `.env`
3. Check browser console for actual API URL being used

### Issue: "Environment variables not loading"
**Solution:**
- Backend: Ensure `load_dotenv()` is called before accessing variables
- Frontend: Restart dev server (React only reads .env on startup)

## Migration from Hardcoded Values

All hardcoded API keys and URLs have been replaced with environment variables:

**Before:**
```javascript
fetch('http://localhost:5000/api/groq-chat', {...})
```

**After:**
```javascript
import config from './config';
fetch(`${config.API_BASE}/groq-chat`, {...})
```

## Files Modified

### Created:
- `.env` (root) - Frontend environment variables
- `.env.example` (root) - Frontend template
- `backend/.env.example` - Backend template
- `src/config.js` - Centralized config

### Updated:
- `src/utils/api.js` - Uses environment variables
- `src/components/Chatbot.js` - Uses config
- `backend/app.py` - Already using environment variables
- `backend/config.py` - Already using environment variables

## Next Steps

To complete the migration, update remaining files to use `config.js`:
- All component files with hardcoded `http://localhost:5000`
- Replace with `import config from '../config'` and use `config.API_BASE`

Run this command to find remaining hardcoded URLs:
```bash
findstr /s /i "localhost:5000" src\*.js
```

---

**Note:** This configuration ensures all sensitive data is stored securely in environment variables and never committed to version control.
