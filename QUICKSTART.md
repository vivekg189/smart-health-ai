# ⚡ Quick Start Guide - 5 Minutes

## 🎯 Goal
Get your healthcare app running with Supabase PostgreSQL in 5 minutes.

## 📋 Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Supabase account (free)

---

## 🚀 Setup Steps

### 1️⃣ Create Supabase Project (2 min)
```
1. Go to https://supabase.com → Sign up/Login
2. Click "New Project"
3. Name: healthcare-app
4. Create password (save it!)
5. Select region → Create
6. Wait ~2 minutes
```

### 2️⃣ Get Connection String (30 sec)
```
1. Settings → Database
2. Connection String → URI tab
3. Copy the string
4. Replace [YOUR-PASSWORD] with your actual password
```

### 3️⃣ Configure Backend (1 min)
```bash
cd backend
copy .env.example .env    # Windows
# OR
cp .env.example .env      # Mac/Linux
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
SECRET_KEY=any-random-string-here-change-in-production
GROQ_API_KEY=your-groq-key-if-you-have-one
```

### 4️⃣ Install & Initialize (1 min)
```bash
pip install -r requirements.txt
python init_db.py
# Type 'y' when asked to create test users
```

### 5️⃣ Start Servers (30 sec)
```bash
# Terminal 1 - Backend
python app.py

# Terminal 2 - Frontend (new terminal)
cd ..
npm start
```

---

## ✅ Verify It Works

1. Browser opens to http://localhost:3000
2. Click "Get Started" → Sign Up
3. Create patient account
4. Go to Models → Diabetes Prediction
5. Enter test values → Click Predict
6. Check Supabase dashboard → predictions table → Your data is there! ✨

---

## 🧪 Test Accounts

After running `init_db.py`:
```
Patient: patient@test.com / test123
Doctor: doctor@test.com / test123
```

---

## 🐛 Quick Troubleshooting

**Backend won't start?**
```bash
pip install flask-sqlalchemy flask-session psycopg2-binary python-dotenv
```

**Database connection error?**
- Check DATABASE_URL in .env
- Verify password is correct
- Ensure Supabase project is active

**Tables not created?**
```bash
python init_db.py
```

**Frontend errors?**
- Ensure backend is running first
- Check http://localhost:5000/api/health

---

## 📚 Full Documentation

- `INTEGRATION_README.md` - Complete overview
- `SUPABASE_SETUP.md` - Detailed setup guide
- `SETUP_CHECKLIST.md` - Step-by-step checklist
- `DATABASE_REFERENCE.md` - Developer reference

---

## 🎉 What You Just Built

✅ Real user authentication with bcrypt
✅ PostgreSQL database with 5 tables
✅ Role-based access (patient/doctor)
✅ Automatic prediction history saving
✅ Secure session management
✅ Production-ready architecture

---

## 🚀 Next Steps

1. Test all disease prediction models
2. Create multiple user accounts
3. Explore Supabase dashboard
4. Review security settings
5. Plan production deployment

---

**Need Help?** Check `SETUP_CHECKLIST.md` for detailed troubleshooting.
