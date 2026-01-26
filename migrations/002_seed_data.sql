-- =====================================================
-- QA.QLKP Seed Data
-- File: 002_seed_data.sql
-- Description: Populate initial data for development/testing
-- =====================================================

-- =====================================================
-- 1. INSERT MATERIALS
-- =====================================================

INSERT INTO materials (code, name, type, stock, unit, price_per_kg) VALUES
('PHE-LIEU', 'Nhựa Phế Liệu', 'SCRAP', 5400, 'kg', 8000),
('BOT-NHUA', 'Bột Nhựa Thành Phẩm', 'POWDER', 12500, 'kg', 22000);

-- =====================================================
-- 2. INSERT PARTNERS
-- =====================================================

INSERT INTO partners (name, type, phone, address, total_volume, total_value) VALUES
-- Nhà cung cấp (Hà Tĩnh & Nghệ An)
('Kho Nhựa Hưng Thịnh', 'SUPPLIER', '0239 3856 123', 'Khu CN Vũng Áng, Kỳ Anh, Hà Tĩnh', 2500, 20000000),
('Kho Phế Liệu Minh Đức', 'SUPPLIER', '0239 3724 456', 'Thạch Hà, Hà Tĩnh', 1800, 14400000),
('Công ty Nhựa Phế Liệu Nghệ An', 'SUPPLIER', '0238 3845 789', 'KCN VSIP Nghệ An, TP Vinh', 3200, 25600000),
('Kho Thu Mua Nhựa Cửa Lò', 'SUPPLIER', '0238 3925 234', 'Thị xã Cửa Lò, Nghệ An', 1500, 12000000),
-- Khách hàng
('Nhà Máy Sản Xuất Nhựa XS Plus', 'CUSTOMER', '0239 3950 888', 'KCN Formosa, Kỳ Anh, Hà Tĩnh', 8500, 187000000);

-- =====================================================
-- 3. GET MATERIAL & PARTNER IDs FOR TRANSACTIONS
-- =====================================================

-- Store IDs in variables (for PostgreSQL)
DO $$
DECLARE
  scrap_id UUID;
  powder_id UUID;
  partner1_id UUID;
  partner2_id UUID;
  partner3_id UUID;
  partner4_id UUID;
  customer_id UUID;
BEGIN
  -- Get material IDs
  SELECT id INTO scrap_id FROM materials WHERE code = 'PHE-LIEU';
  SELECT id INTO powder_id FROM materials WHERE code = 'BOT-NHUA';
  
  -- Get partner IDs
  SELECT id INTO partner1_id FROM partners WHERE name = 'Kho Nhựa Hưng Thịnh';
  SELECT id INTO partner2_id FROM partners WHERE name = 'Kho Phế Liệu Minh Đức';
  SELECT id INTO partner3_id FROM partners WHERE name = 'Công ty Nhựa Phế Liệu Nghệ An';
  SELECT id INTO partner4_id FROM partners WHERE name = 'Kho Thu Mua Nhựa Cửa Lò';
  SELECT id INTO customer_id FROM partners WHERE name = 'Nhà Máy Sản Xuất Nhựa XS Plus';

  -- =====================================================
  -- 4. INSERT TRANSACTIONS
  -- =====================================================
  
  -- Transaction 1: Import from Kho Nhựa Hưng Thịnh
  INSERT INTO transactions (transaction_date, type, material_id, partner_id, weight, total_value, category)
  VALUES ('2024-01-22 09:30:00+07', 'IMPORT', scrap_id, partner1_id, 2500, 20000000, 'MATERIAL');
  
  -- Transaction 2: Export to XS Plus
  INSERT INTO transactions (transaction_date, type, material_id, partner_id, weight, total_value)
  VALUES ('2024-01-23 14:15:00+07', 'EXPORT', powder_id, customer_id, 8500, 187000000);
  
  -- Transaction 3: Import from Công ty Nhựa Phế Liệu Nghệ An
  INSERT INTO transactions (transaction_date, type, material_id, partner_id, weight, total_value, category)
  VALUES ('2024-01-20 10:00:00+07', 'IMPORT', scrap_id, partner3_id, 3200, 25600000, 'MATERIAL');
  
  -- Transaction 4: Import from Kho Phế Liệu Minh Đức
  INSERT INTO transactions (transaction_date, type, material_id, partner_id, weight, total_value, category)
  VALUES ('2024-01-21 08:30:00+07', 'IMPORT', scrap_id, partner2_id, 1800, 14400000, 'MATERIAL');
  
  -- Transaction 5: Import from Kho Thu Mua Nhựa Cửa Lò
  INSERT INTO transactions (transaction_date, type, material_id, partner_id, weight, total_value, category)
  VALUES ('2024-01-19 15:45:00+07', 'IMPORT', scrap_id, partner4_id, 1500, 12000000, 'MATERIAL');
  
  -- Transaction 6: Expense - Labor
  INSERT INTO transactions (transaction_date, type, total_value, category, note)
  VALUES ('2024-01-24 08:00:00+07', 'EXPENSE', 5500000, 'LABOR', 'Lương tuần 4 tháng 1/2024');
  
  -- Transaction 7: Expense - Machinery
  INSERT INTO transactions (transaction_date, type, total_value, category, note)
  VALUES ('2024-01-18 11:30:00+07', 'EXPENSE', 2000000, 'MACHINERY', 'Bảo trì máy xay số 2');

END $$;

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Check materials
SELECT * FROM materials ORDER BY type;

-- Check partners
SELECT * FROM partners ORDER BY type, name;

-- Check transactions
SELECT 
  t.transaction_date,
  t.type,
  m.name as material_name,
  p.name as partner_name,
  t.weight,
  t.total_value,
  t.category,
  t.note
FROM transactions t
LEFT JOIN materials m ON t.material_id = m.id
LEFT JOIN partners p ON t.partner_id = p.id
ORDER BY t.transaction_date DESC;

-- =====================================================
-- SEED DATA COMPLETED
-- Total: 2 materials, 5 partners, 7 transactions
-- =====================================================
