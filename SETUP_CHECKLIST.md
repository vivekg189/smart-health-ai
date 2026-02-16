# 🚀 Supabase Integration - Setup Checklist

## ✅ Pre-Setup

- [ ] Node.js 16+ installed
- [ ] Python 3.8+ installed
- [ ] pip installed
- [ ] npm installed
- [ ] Git installed (optional)

## 📝 Step 1: Supabase Account Setup

- [ ] Go to https://supabase.com
- [ ] Sign up / Log in
- [ ] Click "New Project"
- [ ] Enter project name: `healthcare-app`
- [ ] Create strong database password
- [ ] Select region (closest to you)
- [ ] Wait for project creation (~2 minutes)

## 🔗 Step 2: Get Connection String

- [ ] Open Supabase dashboard
- [ ] Go to Settings → Database
- [ ] Scroll to "Connection String" section
- [ ] Click "URI" tab
- [ ] Copy connection string
- [ ] Replace `[YOUR-PASSWORD]` with actual password
- [ ] Save connection string for next step

## ⚙️ Step 3: Backend Configuration

- [ ] Open terminal
- [ ] Navigate to project: `cd healthcare`
- [ ] Go to backend: `cd backend`
- [ ] Copy env template: `copy .env.example .env` (Windows) or `cp .env.example .env` (Mac/Linux)
- [ ] Open `.env` file in text editor
- [ ] Paste DATABASE_URL from Supabase
- [ ] Generate SECRET_KEY (see below)
- [ ] Add GROQ_API_KEY (if you have one)
- [ ] Save `.env` file

### Generate SECRET_KEY:
```python
# Run in Python terminal:
import secrets
print(secrets.token_hex(32))
# Copy output to .env file
```

## 📦 Step 4: Install Backend Dependencies

- [ ] Ensure you're in `backend` directory
- [ ] Run: `pip install -r requirements.txt`
- [ ] Wait for installation to complete
- [ ] Verify no errors

## 🗄️ Step 5: Initialize Database

- [ ] Run: `python init_db.py`
- [ ] Check for success messages
- [ ] When prompted, type `y` to create test users
- [ ] Verify tables created in Supabase dashboard

## 🎯 Step 6: Verify Supabase Tables

- [ ] Go to Supabase dashboard
- [ ] Click "Table Editor" in sidebar
- [ ] Verify these tables exist:
  - [ ] users
  - [ ] predictions
  - [ ] doctor_availability
  - [ ] consultations
  - [ ] medical_notes

## 🚀 Step 7: Start Backend Server

- [ ] In backend directory, run: `python app.py`
- [ ] Check for "Running on http://127.0.0.1:5000"
- [ ] Verify no error messages
- [ ] Leave terminal open

## 💻 Step 8: Start Frontend Server

- [ ] Open NEW terminal
- [ ] Navigate to project root: `cd healthcare`
- [ ] Run: `npm start`
- [ ] Wait for "Compiled successfully"
- [ ] Browser should open to http://localhost:3000
- [ ] Leave terminal open

## 🧪 Step 9: Test the Integration

### Test Signup:
- [ ] Click "Get Started" or "Sign Up"
- [ ] Select "Patient" role
- [ ] Enter name: Test Patient
- [ ] Enter email: patient@test.com
- [ ] Enter password: test123
- [ ] Click "Sign Up"
- [ ] Should redirect to patient dashboard

### Test Prediction:
- [ ] Click "Disease Prediction" or "Models"
- [ ] Select "Diabetes Prediction"
- [ ] Enter test values:
  - Glucose: 120
  - BMI: 25
  - Blood Pressure: 80
  - Age: 35
- [ ] Click "Predict"
- [ ] Wait for result
- [ ] Result should display

### Verify Database Save:
- [ ] Go to Supabase dashboard
- [ ] Click "Table Editor"
- [ ] Click "predictions" table
- [ ] Should see your prediction saved
- [ ] Check "users" table for your account

### Test Doctor Account:
- [ ] Logout from patient account
- [ ] Sign up as doctor
- [ ] Select "Doctor" role
- [ ] Choose specialization
- [ ] Should redirect to doctor dashboard

## ✅ Verification Checklist

### Backend:
- [ ] Flask server running on port 5000
- [ ] No error messages in terminal
- [ ] Database connection successful
- [ ] All 5 tables created in Supabase

### Frontend:
- [ ] React app running on port 3000
- [ ] No console errors in browser
- [ ] Login/signup forms working
- [ ] Redirects to correct dashboard

### Database:
- [ ] Supabase project active
- [ ] Tables visible in Table Editor
- [ ] User accounts being created
- [ ] Predictions being saved

### Authentication:
- [ ] Signup creates user in database
- [ ] Login works with correct credentials
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Protected routes require login

## 🐛 Troubleshooting

### Backend won't start:
- [ ] Check DATABASE_URL is correct
- [ ] Verify all dependencies installed
- [ ] Check .env file exists
- [ ] Try: `pip install -r requirements.txt` again

### Database connection error:
- [ ] Verify Supabase project is active
- [ ] Check password in DATABASE_URL
- [ ] Test connection in Supabase dashboard
- [ ] Ensure no firewall blocking connection

### Tables not created:
- [ ] Run `python init_db.py` again
- [ ] Check Flask terminal for errors
- [ ] Verify DATABASE_URL is correct
- [ ] Check Supabase project status

### Frontend errors:
- [ ] Check backend is running
- [ ] Verify CORS settings in app.py
- [ ] Check browser console for errors
- [ ] Try: `npm install` again

### Session not persisting:
- [ ] Check cookies enabled in browser
- [ ] Verify `credentials: 'include'` in fetch calls
- [ ] Check CORS configuration
- [ ] Clear browser cookies and try again

### Predictions not saving:
- [ ] Check user is logged in
- [ ] Verify session is active
- [ ] Check browser console for errors
- [ ] Check Flask terminal for errors

## 📚 Documentation Reference

If you need help, check these files:

- [ ] `INTEGRATION_README.md` - Main overview
- [ ] `SUPABASE_SETUP.md` - Detailed setup guide
- [ ] `DATABASE_REFERENCE.md` - Quick reference
- [ ] `ARCHITECTURE.md` - System diagrams
- [ ] `IMPLEMENTATION_SUMMARY.md` - What was built

## 🎉 Success Indicators

You've successfully completed the integration when:

✅ Backend server runs without errors
✅ Frontend loads at localhost:3000
✅ Can sign up new users
✅ Can log in with credentials
✅ Redirects to correct dashboard based on role
✅ Can run disease predictions
✅ Predictions appear in Supabase database
✅ Can log out successfully
✅ Session persists on page refresh

## 🚀 Next Steps After Setup

- [ ] Test all disease prediction models
- [ ] Create multiple test accounts
- [ ] Test doctor availability features
- [ ] Test consultation requests
- [ ] Explore Supabase dashboard features
- [ ] Review security settings
- [ ] Plan production deployment

## 📞 Getting Help

If stuck:
1. Check troubleshooting section above
2. Review error messages carefully
3. Check Flask terminal logs
4. Check browser console
5. Verify Supabase project status
6. Review documentation files

## 🔒 Security Reminders

- [ ] Never commit .env file to git
- [ ] Keep DATABASE_URL secret
- [ ] Use strong SECRET_KEY in production
- [ ] Change default test passwords
- [ ] Enable 2FA on Supabase account
- [ ] Regularly backup database

## ✨ Optional Enhancements

After basic setup works:
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add profile pictures
- [ ] Create admin dashboard
- [ ] Add real-time notifications
- [ ] Implement file uploads
- [ ] Add appointment scheduling

---

**Setup Time**: ~15-20 minutes
**Difficulty**: Beginner-Intermediate
**Support**: Check documentation files for detailed help
