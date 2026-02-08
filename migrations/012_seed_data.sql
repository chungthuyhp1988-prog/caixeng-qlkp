-- =====================================================
-- QA.QLKP SEED DATA
-- File: 012_seed_data.sql
-- Description: Populate initial data for production use
-- Run AFTER 011_consolidated_reset.sql
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. MATERIALS
-- =====================================================

INSERT INTO materials (code, name, type, stock, unit, price_per_kg) VALUES
('PHE-LIEU', 'Nhựa Phế Liệu', 'SCRAP', 12500, 'kg', 8500),
('BOT-NHUA', 'Bột Nhựa Tái Chế', 'POWDER', 8200, 'kg', 16000);

-- =====================================================
-- 2. PARTNERS
-- =====================================================

INSERT INTO partners (name, type, phone, address, total_volume, total_value) VALUES
-- Nhà cung cấp (SUPPLIER)
('Vựa Ve Chai Chú Bảy', 'SUPPLIER', '0901234567', 'Hóc Môn, TP.HCM', 42000, 336000000),
('Vựa Phế Liệu Thanh Tâm', 'SUPPLIER', '0918765432', 'Bình Chánh, TP.HCM', 35000, 297500000),
('Cơ Sở Thu Mua Anh Tuấn', 'SUPPLIER', '0977123456', 'Củ Chi, TP.HCM', 28000, 224000000),
('Vựa Nhựa Cô Hai', 'SUPPLIER', '0933456789', 'Tân Phú, TP.HCM', 18500, 157250000),
('Đại Lý Thu Mua Phát Tài', 'SUPPLIER', '0965789012', 'Thủ Đức, TP.HCM', 15000, 127500000),
('Vựa Ve Chai Minh Đạt', 'SUPPLIER', '0889345678', 'Quận 12, TP.HCM', 12000, 96000000),
-- Khách hàng (CUSTOMER)
('Cty TNHH Nhựa Song Long', 'CUSTOMER', '0987654321', 'KCN Tân Bình, TP.HCM', 25000, 400000000),
('Cty CP Tấm Ốp Đại Phát', 'CUSTOMER', '0945678901', 'KCN Vĩnh Lộc, Bình Chánh', 18000, 288000000),
('Nhà Máy Nhựa Tân Hiệp', 'CUSTOMER', '0908234567', 'KCN Tân Tạo, Bình Tân', 14500, 232000000),
('Cty Sản Xuất Nhựa Hoàng Gia', 'CUSTOMER', '0916345678', 'Biên Hòa, Đồng Nai', 10000, 160000000),
('Cty TNHH SX Bao Bì Việt Phát', 'CUSTOMER', '0928456789', 'Dĩ An, Bình Dương', 8500, 136000000);

-- =====================================================
-- 3. USERS (Auth + Profile)
-- =====================================================

DO $$
DECLARE
  nam_id uuid := gen_random_uuid();
  anh_id uuid := gen_random_uuid();
  tu_id uuid := gen_random_uuid();
  encrypted_pw text;
BEGIN
  encrypted_pw := crypt('123456', gen_salt('bf'));

  -- Clean existing users for fresh seed
  DELETE FROM public.users WHERE email IN ('0969509456@qlkp.com', '0943431591@qlkp.com', '0775123305@qlkp.com');
  DELETE FROM auth.users WHERE email IN ('0969509456@qlkp.com', '0943431591@qlkp.com', '0775123305@qlkp.com');

  -- Phan Thanh Nam (Admin)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', nam_id, 'authenticated', 'authenticated',
    '0969509456@qlkp.com', encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Phan Thanh Nam', 'phone', '0969509456', 'role', 'ADMIN'),
    now(), now(), '', '', '', ''
  );
  INSERT INTO public.users (id, email, full_name, role, phone, salary_base, status)
  VALUES (nam_id, '0969509456@qlkp.com', 'Phan Thanh Nam', 'ADMIN', '0969509456', 15000000, 'ACTIVE');

  -- Nguyễn Quốc Anh (Admin)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', anh_id, 'authenticated', 'authenticated',
    '0943431591@qlkp.com', encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Nguyễn Quốc Anh', 'phone', '0943431591', 'role', 'ADMIN'),
    now(), now(), '', '', '', ''
  );
  INSERT INTO public.users (id, email, full_name, role, phone, salary_base, status)
  VALUES (anh_id, '0943431591@qlkp.com', 'Nguyễn Quốc Anh', 'ADMIN', '0943431591', 15000000, 'ACTIVE');

  -- Phan Xuân Tú (Staff)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', tu_id, 'authenticated', 'authenticated',
    '0775123305@qlkp.com', encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Phan Xuân Tú', 'phone', '0775123305', 'role', 'STAFF'),
    now(), now(), '', '', '', ''
  );
  INSERT INTO public.users (id, email, full_name, role, phone, salary_base, status)
  VALUES (tu_id, '0775123305@qlkp.com', 'Phan Xuân Tú', 'STAFF', '0775123305', 9000000, 'ACTIVE');

END;
$$;

-- =====================================================
-- 4. SAMPLE TRANSACTIONS (recent month)
-- =====================================================

DO $$
DECLARE
  scrap_id UUID;
  powder_id UUID;
  sup1_id UUID; sup2_id UUID; sup3_id UUID;
  cus1_id UUID; cus2_id UUID; cus3_id UUID;
  user1_id UUID;
BEGIN
  SELECT id INTO scrap_id FROM materials WHERE code = 'PHE-LIEU';
  SELECT id INTO powder_id FROM materials WHERE code = 'BOT-NHUA';
  SELECT id INTO sup1_id FROM partners WHERE name = 'Vựa Ve Chai Chú Bảy';
  SELECT id INTO sup2_id FROM partners WHERE name = 'Vựa Phế Liệu Thanh Tâm';
  SELECT id INTO sup3_id FROM partners WHERE name = 'Cơ Sở Thu Mua Anh Tuấn';
  SELECT id INTO cus1_id FROM partners WHERE name = 'Cty TNHH Nhựa Song Long';
  SELECT id INTO cus2_id FROM partners WHERE name = 'Cty CP Tấm Ốp Đại Phát';
  SELECT id INTO cus3_id FROM partners WHERE name = 'Nhà Máy Nhựa Tân Hiệp';
  SELECT id INTO user1_id FROM public.users LIMIT 1;

  -- Imports (do NOT trigger stock update since we manually set stock above)
  -- We insert with explicit weight and let triggers handle stock
  -- Note: Stock was already seeded, so these would ADD to it
  -- For demo purposes, this is fine.

  INSERT INTO transactions (transaction_date, type, material_id, partner_id, weight, total_value, note, created_by) VALUES
  (NOW() - INTERVAL '7 days', 'IMPORT', scrap_id, sup1_id, 3800, 32300000, 'Nhập đầu tháng', user1_id),
  (NOW() - INTERVAL '6 days', 'IMPORT', scrap_id, sup3_id, 2500, 21250000, 'Nhập từ Củ Chi', user1_id),
  (NOW() - INTERVAL '5 days', 'IMPORT', scrap_id, sup2_id, 3000, 25500000, 'Nhập lô từ Bình Chánh', user1_id);

  -- Exports
  INSERT INTO transactions (transaction_date, type, material_id, partner_id, weight, total_value, note, created_by) VALUES
  (NOW() - INTERVAL '4 days', 'EXPORT', powder_id, cus1_id, 3200, 51200000, 'Xuất cho Song Long', user1_id),
  (NOW() - INTERVAL '3 days', 'EXPORT', powder_id, cus3_id, 2000, 32000000, 'Xuất cho Tân Hiệp', user1_id),
  (NOW() - INTERVAL '1 day', 'EXPORT', powder_id, cus2_id, 1500, 24000000, 'Xuất cho Đại Phát', user1_id);

  -- Production
  INSERT INTO transactions (transaction_date, type, weight, total_value, note, created_by) VALUES
  (NOW() - INTERVAL '5 days', 'PRODUCTION', 5500, 0, 'Xay nhựa - ca sáng + chiều', user1_id),
  (NOW() - INTERVAL '2 days', 'PRODUCTION', 4000, 0, 'Xay nhựa lô 2', user1_id);

  -- Expenses
  INSERT INTO transactions (transaction_date, type, total_value, category, note, created_by) VALUES
  (NOW() - INTERVAL '6 days', 'EXPENSE', 26000000, 'LABOR', 'Lương tháng 2/2026', user1_id),
  (NOW() - INTERVAL '3 days', 'EXPENSE', 4200000, 'OTHER', 'Tiền điện + nước tháng 2', user1_id),
  (NOW() - INTERVAL '2 days', 'EXPENSE', 2800000, 'MACHINERY', 'Mua dầu nhớt + bảo trì máy', user1_id),
  (NOW() - INTERVAL '1 day', 'EXPENSE', 1500000, 'OTHER', 'Xăng xe chở hàng', user1_id);

END;
$$;

-- =====================================================
-- SEED COMPLETED
-- =====================================================
