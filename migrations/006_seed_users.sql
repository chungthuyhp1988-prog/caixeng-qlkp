-- =====================================================
-- QA.QLKP Database Schema Migration
-- File: 006_seed_users.sql
-- Description: Seed 5 initial users (Admin, Accountant, Staff)
-- INSTRUCTIONS: Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to create user if not exists
CREATE OR REPLACE FUNCTION create_user_if_not_exists(
    email text,
    password text,
    full_name text,
    role_name text
) RETURNS void AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = create_user_if_not_exists.email) THEN
    
    -- Generate UUID
    user_id := gen_random_uuid();
    
    -- Encrypt password (using crypt with blowfish is standard for auth.users, 
    -- but usually Supabase Auth handles this. Direct insert needs valid hash.
    -- We will use a known hash or let Supabase handle it via API if possible.
    -- However, for SQL Seeding, we must insert a valid hash.
    -- '123456' hashed with bcrypt:
    encrypted_pw := crypt(password, gen_salt('bf'));

    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      email,
      encrypted_pw,
      now(), -- confirm email immediately
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', full_name, 'role', role_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Insert into public.users (Profile)
    -- Note: The trigger handle_new_user might already do this if active.
    -- We explicitly insert here to be safe and ensure correct data if trigger is disabled or fails for direct SQL.
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        user_id, 
        email, 
        full_name, 
        role_name
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Created user: %', email;
  ELSE
    RAISE NOTICE 'User already exists: %', email;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed Users
-- Password for all is '123456'

-- 1. Admin
SELECT create_user_if_not_exists(
    'admin@thanhnam.com', 
    '123456', 
    'Nguyễn Quốc Anh', 
    'ADMIN'
);

-- 2. Accountant (Kế toán)
SELECT create_user_if_not_exists(
    'ketoan@thanhnam.com', 
    '123456', 
    'Phạm Thị Thu', 
    'STAFF'
);

-- 3. Warehouse Keeper (Thủ kho)
SELECT create_user_if_not_exists(
    'thukho@thanhnam.com', 
    '123456', 
    'Lê Văn Hùng', 
    'STAFF'
);

-- 4. Staff 1
SELECT create_user_if_not_exists(
    'nhanvien1@thanhnam.com', 
    '123456', 
    'Trần Văn Nam', 
    'STAFF'
);

-- 5. Staff 2
SELECT create_user_if_not_exists(
    'nhanvien2@thanhnam.com', 
    '123456', 
    'Hoàng Thị Lan', 
    'STAFF'
);

-- Cleanup function (optional, keep it if you want to reuse)
-- DROP FUNCTION create_user_if_not_exists;
