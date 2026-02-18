# Troubleshooting Guide

## Current Issues and Solutions

### 1. Database Connection Error ❌

**Error**: `could not translate host name "aws-1-ap-northeast-1.pooler.supabase.com" to address`

**Root Cause**: Network connectivity issue - your system cannot resolve DNS names (no internet connection or DNS issues)

**Solutions**:

#### Option A: Fix Internet Connection (Recommended)
1. Check your internet connection
2. Try accessing https://google.com in browser
3. If using VPN, try disconnecting/reconnecting
4. Restart your network adapter:
   ```cmd
   ipconfig /flushdns
   ipconfig /release
   ipconfig /renew
   ```

#### Option B: Use Demo Mode (Temporary)
The app now runs in demo mode when database is unavailable:
- Login works with any email/password
- Predictions work but aren't saved
- All features functional except data persistence

#### Option C: Fix Supabase Connection
1. Verify your Supabase project is active
2. Check if the connection string is correct
3. Update `.env` with correct DATABASE_URL from Supabase dashboard
4. Ensure you're using the correct pooler URL format

### 2. Hugging Face Model Loading Error ❌

**Error**: `Can't load image processor for 'Hemgg/bone-fracture-detection-using-xray'`

**Root Cause**: Cannot download model from Hugging Face due to network issues

**Solutions**:

#### Option A: Fix Internet and Retry
1. Fix internet connection (see above)
2. Restart Flask server
3. Model will download automatically on first run

#### Option B: Download Model Manually
```bash
cd backend
python -c "from transformers import pipeline; pipeline('image-classification', model='Hemgg/bone-fracture-detection-using-xray')"
```

#### Option C: Use Alternative Model
Update `app.py` line 142:
```python
_bone_hf_model_id = 'microsoft/resnet-50'  # Alternative model
```

#### Option D: Disable Bone Fracture Feature
Comment out bone fracture model loading in `app.py`:
```python
# _bone_pipeline = pipeline(...)
_bone_pipeline = None
```

### 3. Network Connectivity Issues 🌐

**Symptoms**:
- DNS resolution failures
- Cannot connect to external APIs
- Timeout errors

**Quick Fixes**:

1. **Check Internet Connection**:
   ```cmd
   ping google.com
   ping 8.8.8.8
   ```

2. **Flush DNS Cache**:
   ```cmd
   ipconfig /flushdns
   ```

3. **Change DNS Servers**:
   - Go to Network Settings
   - Change DNS to Google DNS: 8.8.8.8, 8.8.4.4
   - Or Cloudflare DNS: 1.1.1.1, 1.0.0.1

4. **Disable Firewall Temporarily**:
   - Test if firewall is blocking connections
   - Re-enable after testing

5. **Check Proxy Settings**:
   ```cmd
   netsh winhttp show proxy
   ```

### 4. Environment Variables Issues ⚙️

**Check if .env is loaded**:
```python
import os
from dotenv import load_dotenv
load_dotenv()
print(os.getenv('DATABASE_URL'))
print(os.getenv('GROQ_API_KEY'))
```

**Fix**:
1. Ensure `.env` file is in `backend/` directory
2. No spaces around `=` in `.env`
3. No quotes around values
4. Restart Flask server after changes

### 5. Quick Health Check 🏥

Run this to check system status:

```bash
cd backend
python -c "
import requests
import socket

# Check internet
try:
    socket.gethostbyname('google.com')
    print('✅ DNS Resolution: OK')
except:
    print('❌ DNS Resolution: FAILED')

# Check Supabase
try:
    socket.gethostbyname('aws-0-ap-northeast-1.pooler.supabase.com')
    print('✅ Supabase DNS: OK')
except:
    print('❌ Supabase DNS: FAILED')

# Check Hugging Face
try:
    requests.head('https://huggingface.co', timeout=5)
    print('✅ Hugging Face: OK')
except:
    print('❌ Hugging Face: FAILED')
"
```

## Running in Offline Mode

The application now supports offline/demo mode:

1. **Database**: Uses in-memory demo mode
2. **Predictions**: Work without saving to database
3. **Hospital Finder**: Uses mock data
4. **AI Chatbot**: Returns fallback messages

## Getting Help

If issues persist:

1. Check logs in terminal for detailed error messages
2. Verify all dependencies are installed: `pip install -r requirements.txt`
3. Try running on a different network
4. Check if antivirus/firewall is blocking connections

## Common Commands

```bash
# Restart Flask server
cd backend
python app.py

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +

# Test database connection
python -c "from config import db; print('DB OK')"
```

## Contact Support

For persistent issues, provide:
- Full error logs from terminal
- Output of health check script
- Network configuration details
- Operating system version
