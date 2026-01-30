-- =====================================================
-- QA.QLKP Database Schema Migration
-- File: 007_reset_personnel.sql
-- Description: Reset all users and seed specific personnel with phone-based emails
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to clean up and re-seed
CREATE OR REPLACE FUNCTION reset_and_seed_personnel() RETURNS void AS $$
DECLARE
  nam_id uuid := gen_random_uuid();
  anh_id uuid := gen_random_uuid();
  tu_id uuid := gen_random_uuid();
  encrypted_pw text;
BEGIN
  -- 1. Encryption
  encrypted_pw := crypt('123456', gen_salt('bf'));

  -- 2. Clean up existing users (Cascade should handle related data if set up, 
  --    but we'll be safe and DELETE public.users first)
  DELETE FROM public.users;
  
  -- Attempt to clean auth.users for these specific emails to avoid conflicts
  -- Note: We can't easily delete ALL auth.users safely without affecting others if this was a shared instance
  -- But usually we want to remove the ones we are about to create if they exist.
  DELETE FROM auth.users WHERE email IN (
    '0969509456@qlkp.com', 
    '0943431591@qlkp.com', 
    '0775123305@qlkp.com'
  );

  -- 3. Create Phan Thanh Nam (Admin) - 0969509456
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    items_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', nam_id, 'authenticated', 'authenticated', 
    '0969509456@qlkp.com', encrypted_pw, now(), null, null, null,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Phan Thanh Nam', 'phone', '0969509456', 'role', 'ADMIN'),
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO public.users (id, email, full_name, role, phone, status)
  VALUES (nam_id, '0969509456@qlkp.com', 'Phan Thanh Nam', 'ADMIN', '0969509456', 'ACTIVE');

  -- 4. Create Nguyễn Quốc Anh (Admin) - 0943431591
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    items_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', anh_id, 'authenticated', 'authenticated', 
    '0943431591@qlkp.com', encrypted_pw, now(), null, null, null,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Nguyễn Quốc Anh', 'phone', '0943431591', 'role', 'ADMIN'),
    now(), now(), '', '', '', ''
  );

  INSERT INTO public.users (id, email, full_name, role, phone, status)
  VALUES (anh_id, '0943431591@qlkp.com', 'Nguyễn Quốc Anh', 'ADMIN', '0943431591', 'ACTIVE');

  -- 5. Create Phan Xuân Tú (Staff) - 0775123305
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    items_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', tu_id, 'authenticated', 'authenticated', 
    '0775123305@qlkp.com', encrypted_pw, now(), null, null, null,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Phan Xuân Tú', 'phone', '0775123305', 'role', 'STAFF'),
    now(), now(), '', '', '', ''
  );

  INSERT INTO public.users (id, email, full_name, role, phone, status)
  VALUES (tu_id, '0775123305@qlkp.com', 'Phan Xuân Tú', 'STAFF', '0775123305', 'ACTIVE');

END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT reset_and_seed_personnel();
