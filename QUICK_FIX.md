# 🚨 QUICK FIX GUIDE

## Your Current Issues

You're experiencing **network connectivity problems** preventing:
1. ❌ Database connection to Supabase
2. ❌ Hugging Face model downloads
3. ❌ External API calls

## Immediate Solutions

### Option 1: Fix Network (Recommended) 🌐

**Windows:**
```cmd
# Open Command Prompt as Administrator
ipconfig /flushdns
ipconfig /release
ipconfig /renew
netsh winsock reset
```

Then restart your computer.

**Check if fixed:**
```cmd
ping google.com
ping huggingface.co
```

### Option 2: Run in Demo Mode (Works Now!) ✅

Your app is **already configured** to run without database:

1. **Start Backend:**
   ```cmd
   cd backend
   python app.py
   ```

2. **Start Frontend:**
   ```cmd
   npm start
   ```

3. **Login with ANY credentials:**
   - Email: `test@example.com`
   - Password: `anything`

**What works in Demo Mode:**
- ✅ All disease predictions (Diabetes, Heart, Liver, Kidney)
- ✅ Hospital Finder (mock data)
- ✅ AI Assistant (fallback responses)
- ✅ Report Analyzer
- ❌ Bone Fracture Detection (requires model download)
- ❌ Data persistence (predictions not saved)

### Option 3: Run Diagnostic 🔍

```cmd
cd backend
python diagnostic.py
```

This will show exactly what's working and what's not.

## Network Troubleshooting Steps

### Step 1: Check Internet
```cmd
ping 8.8.8.8
```
- ✅ If replies: Internet works, DNS issue
- ❌ If timeout: No internet connection

### Step 2: Fix DNS
**Change DNS to Google DNS:**
1. Open Network Settings
2. Change Adapter Options
3. Right-click your network → Properties
4. Select IPv4 → Properties
5. Use these DNS servers:
   - Preferred: `8.8.8.8`
   - Alternate: `8.8.4.4`

### Step 3: Disable Firewall (Temporarily)
1. Windows Security → Firewall
2. Turn off temporarily
3. Test if app works
4. Turn back on

### Step 4: Check Proxy
```cmd
netsh winhttp show proxy
```
If proxy is set, try:
```cmd
netsh winhttp reset proxy
```

## Database Connection Fix

If you want to fix Supabase connection:

1. **Check Supabase Dashboard:**
   - Go to https://supabase.com
   - Check if project is active
   - Get new connection string

2. **Update .env file:**
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres
   ```

3. **Test connection:**
   ```cmd
   python -c "import psycopg2; psycopg2.connect('your_connection_string'); print('OK')"
   ```

## Bone Fracture Model Fix

**Option A: Download when internet works**
```cmd
python -c "from transformers import pipeline; pipeline('image-classification', model='Hemgg/bone-fracture-detection-using-xray')"
```

**Option B: Disable feature**
Edit `backend/app.py` line 142:
```python
_bone_pipeline = None  # Disable bone fracture detection
```

## Still Not Working?

### Check Logs
Look for specific errors in terminal when running `python app.py`

### Verify Dependencies
```cmd
pip install -r requirements.txt --upgrade
```

### Try Different Network
- Use mobile hotspot
- Try different WiFi
- Use ethernet cable

### Contact Support
Provide:
- Output of `python diagnostic.py`
- Screenshot of errors
- Your OS version

## Quick Commands Reference

```cmd
# Backend
cd backend
python diagnostic.py          # Check system
python app.py                 # Start server

# Frontend  
npm install                   # Install dependencies
npm start                     # Start React app

# Database
python -c "from config import db; print('OK')"  # Test DB

# Clear cache
pip cache purge
npm cache clean --force
```

## Expected Behavior

**With Internet:**
- All features work
- Data is saved
- Models download automatically

**Without Internet (Demo Mode):**
- Predictions work (not saved)
- Mock hospital data
- Fallback AI responses
- No bone fracture detection

---

**Your app is ready to run in Demo Mode right now!** 🎉

Just start both servers and login with any credentials.
