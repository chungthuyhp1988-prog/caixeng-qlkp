-- =====================================================
-- QA.QLKP Database Schema Migration
-- File: 001_initial_schema.sql
-- Description: Initial database setup for warehouse management system
-- =====================================================

-- =====================================================
-- 1. CREATE CUSTOM TYPES (ENUMs)
-- =====================================================

CREATE TYPE material_type AS ENUM ('SCRAP', 'POWDER');
CREATE TYPE partner_type AS ENUM ('SUPPLIER', 'CUSTOMER');
CREATE TYPE transaction_type AS ENUM ('IMPORT', 'EXPORT', 'EXPENSE', 'PRODUCTION');
CREATE TYPE expense_category AS ENUM ('MATERIAL', 'LABOR', 'MACHINERY', 'OTHER');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Table: materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type material_type NOT NULL,
  stock NUMERIC(12, 2) DEFAULT 0 CHECK (stock >= 0),
  unit VARCHAR(20) DEFAULT 'kg',
  price_per_kg NUMERIC(12, 2) NOT NULL CHECK (price_per_kg >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE materials IS 'Quản lý nguyên vật liệu (Nhựa phế và Bột nhựa)';
COMMENT ON COLUMN materials.stock IS 'Tồn kho hiện tại (kg)';
COMMENT ON COLUMN materials.price_per_kg IS 'Giá mua/bán trung bình (VNĐ/kg)';

-- Table: partners
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type partner_type NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  total_volume NUMERIC(12, 2) DEFAULT 0,
  total_value NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE partners IS 'Quản lý đối tác (Nhà cung cấp và Khách hàng)';
COMMENT ON COLUMN partners.total_volume IS 'Tổng khối lượng giao dịch tích lũy (kg)';
COMMENT ON COLUMN partners.total_value IS 'Tổng giá trị giao dịch tích lũy (VNĐ)';

-- Table: transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  type transaction_type NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  weight NUMERIC(12, 2) CHECK (weight >= 0),
  total_value NUMERIC(15, 2) NOT NULL CHECK (total_value >= 0),
  category expense_category,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE transactions IS 'Lịch sử giao dịch (Nhập/Xuất/Chi phí/Sản xuất)';
COMMENT ON COLUMN transactions.weight IS 'Khối lượng giao dịch (kg) - NULL cho chi phí';
COMMENT ON COLUMN transactions.category IS 'Danh mục chi phí - chỉ dùng cho type=EXPENSE';

-- Table: users (Optional - for future authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Thông tin người dùng (tích hợp với Supabase Auth)';

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Materials indexes
CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_code ON materials(code);

-- Partners indexes
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_name ON partners(name);

-- Transactions indexes
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_material ON transactions(material_id);
CREATE INDEX idx_transactions_partner ON transactions(partner_id);

-- =====================================================
-- 4. CREATE FUNCTIONS
-- =====================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Tự động cập nhật updated_at khi record thay đổi';

-- Function: Update material stock on transaction
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- IMPORT: Tăng stock (Scrap)
  IF NEW.type = 'IMPORT' AND NEW.material_id IS NOT NULL THEN
    UPDATE materials 
    SET stock = stock + NEW.weight,
        updated_at = NOW()
    WHERE id = NEW.material_id;
  
  -- EXPORT: Giảm stock (Powder)
  ELSIF NEW.type = 'EXPORT' AND NEW.material_id IS NOT NULL THEN
    UPDATE materials 
    SET stock = stock - NEW.weight,
        updated_at = NOW()
    WHERE id = NEW.material_id;
  
  -- PRODUCTION: Giảm Scrap, Tăng Powder (95% conversion)
  ELSIF NEW.type = 'PRODUCTION' AND NEW.weight IS NOT NULL THEN
    -- Giảm nhựa phế
    UPDATE materials 
    SET stock = stock - NEW.weight,
        updated_at = NOW()
    WHERE type = 'SCRAP';
    
    -- Tăng bột nhựa (95% conversion rate)
    UPDATE materials 
    SET stock = stock + (NEW.weight * 0.95),
        updated_at = NOW()
    WHERE type = 'POWDER';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_material_stock() IS 'Tự động cập nhật tồn kho khi có giao dịch mới';

-- Function: Update partner statistics
CREATE OR REPLACE FUNCTION update_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.partner_id IS NOT NULL THEN
    UPDATE partners
    SET 
      total_volume = total_volume + COALESCE(NEW.weight, 0),
      total_value = total_value + NEW.total_value,
      updated_at = NOW()
    WHERE id = NEW.partner_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_partner_stats() IS 'Tự động cập nhật thống kê đối tác khi có giao dịch mới';

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Trigger: Auto-update updated_at for materials
CREATE TRIGGER trg_materials_updated_at
BEFORE UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger: Auto-update updated_at for partners
CREATE TRIGGER trg_partners_updated_at
BEFORE UPDATE ON partners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger: Update material stock after transaction
CREATE TRIGGER trg_update_stock
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_material_stock();

-- Trigger: Update partner stats after transaction
CREATE TRIGGER trg_update_partner_stats
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_partner_stats();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Development/Testing: Allow all operations (PUBLIC ACCESS)
-- ⚠️ WARNING: Chỉ dùng cho development. Production nên dùng authenticated policies bên dưới.

CREATE POLICY "Allow all for development" ON materials FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON partners FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON users FOR ALL USING (true);

-- Production RLS Policies (Uncomment khi deploy production)
/*
-- Materials: Authenticated users can read, only admins can modify
DROP POLICY IF EXISTS "Allow all for development" ON materials;

CREATE POLICY "Authenticated users can read materials" 
  ON materials FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update materials" 
  ON materials FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Partners: Full access for authenticated users
DROP POLICY IF EXISTS "Allow all for development" ON partners;

CREATE POLICY "Authenticated users full access partners" 
  ON partners FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Transactions: Full access for authenticated users
DROP POLICY IF EXISTS "Allow all for development" ON transactions;

CREATE POLICY "Authenticated users full access transactions" 
  ON transactions FOR ALL 
  USING (auth.uid() IS NOT NULL);
*/

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Uncomment to verify schema after running migration:
/*
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- List all enums
SELECT t.typname as enum_name, e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('material_type', 'partner_type', 'transaction_type', 'expense_category')
ORDER BY t.typname, e.enumsortorder;

-- List all triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
*/

-- =====================================================
-- MIGRATION COMPLETED
-- Next: Run 002_seed_data.sql to populate initial data
-- =====================================================
