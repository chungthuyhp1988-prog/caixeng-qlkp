-- =====================================================
-- FIX DATABASE SCRIPT
-- Run this in Supabase SQL Editor to ensure all tables exist
-- =====================================================

-- 1. Ensure public.users table exists (from Migration 003)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
  salary_base NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure RLS is enabled on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create or Replace Trigger for New User Creation (from Migration 003)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'STAFF'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to recreate it clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Ensure Policies exist (Drop and Recreate to be safe)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.users;

-- Allow everyone to read names (for transaction history info)
CREATE POLICY "Authenticated users can view all profiles"
ON public.users FOR SELECT
USING (auth.role() = 'authenticated');

-- Only Admins can update
CREATE POLICY "Admins can update profiles"
ON public.users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 5. Add created_by column to transactions (from Migration 004)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'created_by') THEN
        ALTER TABLE transactions ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Trigger for created_by
CREATE OR REPLACE FUNCTION set_transaction_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transactions_created_by ON transactions;
CREATE TRIGGER trg_transactions_created_by
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_transaction_created_by();

-- 7. Backfill public.users for existing Auth Users (Crucial for Fix)
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email), 
  'ADMIN' -- Set existing users properly, default to Admin for safety in early dev
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
