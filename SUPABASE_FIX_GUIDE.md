# Supabase Prediction Review Fix

## Quick Fix for Supabase

### Step 1: Run SQL Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste `backend/migrations/supabase_fix.sql`
3. Click "Run"

### Step 2: Set User Role
```sql
-- Update your doctor user's metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"doctor"'
)
WHERE email = 'your_doctor_email@example.com';
```

### Step 3: Verify Setup
```sql
-- Check predictions table
SELECT * FROM public.predictions LIMIT 5;

-- Check doctor users
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'doctor';

-- Check pending predictions
SELECT COUNT(*) FROM public.predictions WHERE status = 'pending_review';
```

### Step 4: Update Backend Code

In `backend/doctor_routes.py`, update the query to use Supabase client:

```python
from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

@doctor_bp.route('/pending-reviews', methods=['GET'])
def get_pending_reviews():
    if 'user_id' not in session or session.get('role') != 'doctor':
        return jsonify({'predictions': []}), 200
    
    try:
        # Query Supabase
        response = supabase.table('predictions')\
            .select('*, users:user_id(email, raw_user_meta_data)')\
            .eq('status', 'pending_review')\
            .order('created_at', desc=True)\
            .execute()
        
        predictions = []
        for p in response.data:
            predictions.append({
                'id': p['id'],
                'patient_id': p['user_id'],
                'patient_name': p['users']['raw_user_meta_data'].get('name', 'Unknown'),
                'disease_type': p['disease_type'],
                'risk_level': p['risk_level'],
                'probability': p['probability'],
                'input_data': p['input_data'],
                'created_at': p['created_at']
            })
        
        return jsonify({'predictions': predictions})
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
```

### Step 5: Environment Variables

Add to `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Step 6: Install Supabase Client

```bash
pip install supabase
```

## Testing

1. Create test prediction as patient
2. Login as doctor
3. Check Doctor Dashboard
4. Should see pending predictions

## Troubleshooting

### Issue: "operator does not exist: integer = uuid"
**Fix**: Already fixed in `supabase_fix.sql` - uses UUID instead of INTEGER

### Issue: No predictions showing
**Check**:
```sql
-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'predictions';

-- Check user role
SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'your_email';
```

### Issue: Unauthorized
**Fix**: Ensure user metadata has `role: 'doctor'`
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "doctor"}'::jsonb
WHERE email = 'doctor@example.com';
```

## Key Differences from PostgreSQL

| PostgreSQL | Supabase |
|------------|----------|
| `INTEGER` | `UUID` |
| `users` table | `auth.users` table |
| `users.role` | `raw_user_meta_data->>'role'` |
| `TIMESTAMP` | `TIMESTAMPTZ` |
| `SERIAL` | `gen_random_uuid()` |

## Complete Working Example

```sql
-- 1. Create table
CREATE TABLE public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    disease_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending_review',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- 3. Create policy
CREATE POLICY "Doctors view pending"
ON public.predictions FOR SELECT
TO authenticated
USING (
    status = 'pending_review' 
    AND (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'doctor'
);

-- 4. Test
INSERT INTO public.predictions (user_id, disease_type)
VALUES (auth.uid(), 'diabetes');

SELECT * FROM public.predictions WHERE status = 'pending_review';
```

Done! ✅
