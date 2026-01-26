-- =====================================================
-- QA.QLKP Database Schema Migration
-- File: 003_auth_and_staff.sql
-- Description: Update users table for personnel management and RLS
-- =====================================================

-- 1. Create User Roles ENUM
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');

-- 2. Update users table structure
-- Note: users table already exists from 001_initial_schema.sql linking to auth.users
-- We are adding profile fields
ALTER TABLE users 
ADD COLUMN role user_role DEFAULT 'STAFF',
ADD COLUMN phone VARCHAR(20),
ADD COLUMN salary_base NUMERIC(15, 2) DEFAULT 0 CHECK (salary_base >= 0),
ADD COLUMN status user_status DEFAULT 'ACTIVE',
ADD COLUMN joined_at DATE DEFAULT CURRENT_DATE,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

COMMENT ON COLUMN users.salary_base IS 'Lương cơ bản (VNĐ/tháng)';
COMMENT ON COLUMN users.role IS 'Phân quyền: ADMIN (full access), STAFF (view only/limited)';

-- 3. Trigger to update updated_at
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- 4. Function: Handle New User (Auto-create profile on signup)
-- This generic trigger function will create a public.users entry when a new auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STAFF')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users (Requires permissions, usually set via Dashboard, but here for reference)
-- Note: In Supabase SQL Editor, you can run this.
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Update RLS Policies for Production (Stricter security)

-- Enable RLS on users if not already
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- Allow Admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Allow Admins to update profiles (salary, role, etc)
CREATE POLICY "Admins can update profiles" 
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Allow Admins to delete profiles (Soft delete preferred via status, but support hard delete)
CREATE POLICY "Admins can delete profiles" 
ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
  )
);
