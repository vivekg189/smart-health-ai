# Supabase Connection Fix

## Problem
`server closed the connection unexpectedly` - Supabase pooler is dropping connections.

## Quick Fix

### Option 1: Update DATABASE_URL (Recommended)
Change from **pooler** to **direct** connection:

**Before:**
```
DATABASE_URL=postgresql://user:pass@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

**After:**
```
DATABASE_URL=postgresql://user:pass@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Or use **direct connection** (more stable):
```
DATABASE_URL=postgresql://user:pass@db.PROJECT_ID.supabase.co:5432/postgres
```

### Option 2: Restart Backend
```bash
# Stop backend (Ctrl+C)
cd backend
python app.py
```

### Option 3: Check Supabase Dashboard
1. Go to Supabase Dashboard → Settings → Database
2. Copy the **Connection Pooling** URL (port 6543)
3. Update `.env` with new URL
4. Restart backend

## Already Fixed in Code
The `config.py` now has:
- Connection keepalives
- Shorter pool recycle (280s)
- Smaller pool size (5)
- Connection timeout (10s)

## Verify Fix
```bash
# Test connection
python -c "from app import app, db; app.app_context().push(); db.session.execute('SELECT 1'); print('✅ Connected')"
```

## If Still Failing
Add to `.env`:
```env
SQLALCHEMY_POOL_SIZE=3
SQLALCHEMY_MAX_OVERFLOW=5
SQLALCHEMY_POOL_RECYCLE=280
```

Restart backend. Done! ✅
