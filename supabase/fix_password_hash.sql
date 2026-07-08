-- Fix: Remove password_hash NOT NULL constraint from vgvina_users
-- This allows registration without storing password in vgvina_users
-- (Supabase Auth handles password storage in auth.users)

-- Option 1: Make password_hash nullable
ALTER TABLE vgvina_users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Option 2: Drop password_hash column entirely (recommended)
-- ALTER TABLE vgvina_users 
-- DROP COLUMN IF EXISTS password_hash;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'vgvina_users' 
  AND column_name = 'password_hash';
