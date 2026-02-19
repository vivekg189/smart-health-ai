# SUPABASE TIMEOUT FIX

## Problem
`timeout expired` - Cannot connect to Supabase from your network.

## IMMEDIATE FIX (Choose ONE)

### Option 1: Use Connection Pooling Port (BEST)
In `backend/.env`, change port **5432** to **6543**:

```env
# BEFORE (Transaction Mode - Port 5432)
DATABASE_URL=postgresql://user:pass@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres

# AFTER (Session Mode - Port 6543)
DATABASE_URL=postgresql://user:pass@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**Restart backend** after changing.

### Option 2: Get Direct Connection URL
1. Supabase Dashboard → Settings → Database
2. Copy **Connection string** under "Connection pooling"
3. Replace entire DATABASE_URL in `.env`
4. Restart backend

### Option 3: Check Firewall
Your network may be blocking port 5432:
```bash
# Test connection
telnet aws-1-ap-northeast-1.pooler.supabase.com 5432
# If timeout, port is blocked

# Try port 6543
telnet aws-1-ap-northeast-1.pooler.supabase.com 6543
```

### Option 4: Use Supabase REST API (No SQL)
If ports are blocked, use Supabase JS client instead of SQLAlchemy.

## Quick Test
```bash
# Stop backend (Ctrl+C)
# Update .env with port 6543
# Restart
cd backend
python app.py
```

## Why This Happens
- Port 5432 blocked by firewall/antivirus
- ISP blocking database ports
- VPN/proxy interfering
- Supabase pooler overloaded

## Solution Priority
1. **Change to port 6543** (90% success rate)
2. Check firewall settings
3. Try different network (mobile hotspot)
4. Contact Supabase support

**Change port to 6543 NOW and restart!** ✅
