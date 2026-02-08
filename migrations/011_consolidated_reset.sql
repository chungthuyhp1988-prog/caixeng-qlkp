-- =====================================================
-- QA.QLKP CONSOLIDATED DATABASE SCHEMA
-- File: 011_consolidated_reset.sql
-- Description: Drop all and recreate from scratch
-- SAFE TO RE-RUN: Uses IF EXISTS / IF NOT EXISTS
-- =====================================================

-- =====================================================
-- 0. CLEANUP - Drop everything in correct order
-- =====================================================

-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS trg_materials_updated_at ON materials;
DROP TRIGGER IF EXISTS trg_partners_updated_at ON materials;
DROP TRIGGER IF EXISTS trg_partners_updated_at ON partners;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_update_stock ON transactions;
DROP TRIGGER IF EXISTS trg_update_partner_stats ON transactions;
DROP TRIGGER IF EXISTS trg_rollback_stock ON transactions;
DROP TRIGGER IF EXISTS trg_rollback_partner_stats ON transactions;
DROP TRIGGER IF EXISTS trg_transactions_created_by ON transactions;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_material_stock() CASCADE;
DROP FUNCTION IF EXISTS update_partner_stats() CASCADE;
DROP FUNCTION IF EXISTS rollback_material_stock() CASCADE;
DROP FUNCTION IF EXISTS rollback_partner_stats() CASCADE;
DROP FUNCTION IF EXISTS set_transaction_created_by() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_transaction_import CASCADE;
DROP FUNCTION IF EXISTS create_transaction_export CASCADE;
DROP FUNCTION IF EXISTS create_transaction_production CASCADE;
DROP FUNCTION IF EXISTS delete_transaction CASCADE;
DROP FUNCTION IF EXISTS reset_and_seed_personnel() CASCADE;
DROP FUNCTION IF EXISTS create_user_if_not_exists CASCADE;

-- Drop tables (cascade handles FK dependencies)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop ENUMs
DROP TYPE IF EXISTS material_type CASCADE;
DROP TYPE IF EXISTS partner_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS expense_category CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;

-- =====================================================
-- 1. CREATE CUSTOM TYPES (ENUMs)
-- =====================================================

CREATE TYPE material_type AS ENUM ('SCRAP', 'POWDER');
CREATE TYPE partner_type AS ENUM ('SUPPLIER', 'CUSTOMER');
CREATE TYPE transaction_type AS ENUM ('IMPORT', 'EXPORT', 'EXPENSE', 'PRODUCTION');
CREATE TYPE expense_category AS ENUM ('MATERIAL', 'LABOR', 'MACHINERY', 'OTHER');
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- ───── MATERIALS ─────
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type material_type NOT NULL,
  stock NUMERIC(12, 2) DEFAULT 0 CHECK (stock >= 0),
  unit VARCHAR(20) DEFAULT 'kg',
  price_per_kg NUMERIC(12, 2) NOT NULL CHECK (price_per_kg >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE materials IS 'Quản lý nguyên vật liệu (Nhựa phế và Bột nhựa)';

-- ───── PARTNERS ─────
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type partner_type NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  total_volume NUMERIC(12, 2) DEFAULT 0,
  total_value NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE partners IS 'Quản lý đối tác (Nhà cung cấp và Khách hàng)';

-- ───── USERS (Profile linked to auth.users) ─────
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role user_role DEFAULT 'STAFF',
  phone VARCHAR(20),
  salary_base NUMERIC(15, 2) DEFAULT 0 CHECK (salary_base >= 0),
  status user_status DEFAULT 'ACTIVE',
  joined_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Thông tin nhân sự (tích hợp với Supabase Auth)';

-- ───── TRANSACTIONS ─────
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type transaction_type NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  weight NUMERIC(12, 2) CHECK (weight >= 0),
  total_value NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (total_value >= 0),
  category expense_category,
  note TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE transactions IS 'Lịch sử giao dịch (Nhập/Xuất/Chi phí/Sản xuất)';

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_name ON partners(name);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_material ON transactions(material_id);
CREATE INDEX idx_transactions_partner ON transactions(partner_id);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_users_email ON public.users(email);

-- =====================================================
-- 4. CREATE TRIGGER FUNCTIONS
-- =====================================================

-- 4.1 Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Update material stock on INSERT
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'IMPORT' AND NEW.material_id IS NOT NULL AND NEW.weight IS NOT NULL THEN
    UPDATE materials SET stock = stock + NEW.weight, updated_at = NOW() WHERE id = NEW.material_id;
  ELSIF NEW.type = 'EXPORT' AND NEW.material_id IS NOT NULL AND NEW.weight IS NOT NULL THEN
    UPDATE materials SET stock = GREATEST(0, stock - NEW.weight), updated_at = NOW() WHERE id = NEW.material_id;
  ELSIF NEW.type = 'PRODUCTION' AND NEW.weight IS NOT NULL THEN
    UPDATE materials SET stock = GREATEST(0, stock - NEW.weight), updated_at = NOW() WHERE type = 'SCRAP';
    UPDATE materials SET stock = stock + (NEW.weight * 0.95), updated_at = NOW() WHERE type = 'POWDER';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.3 Rollback material stock on DELETE
CREATE OR REPLACE FUNCTION rollback_material_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.type = 'IMPORT' AND OLD.material_id IS NOT NULL AND OLD.weight IS NOT NULL THEN
    UPDATE materials SET stock = GREATEST(0, stock - OLD.weight), updated_at = NOW() WHERE id = OLD.material_id;
  ELSIF OLD.type = 'EXPORT' AND OLD.material_id IS NOT NULL AND OLD.weight IS NOT NULL THEN
    UPDATE materials SET stock = stock + OLD.weight, updated_at = NOW() WHERE id = OLD.material_id;
  ELSIF OLD.type = 'PRODUCTION' AND OLD.weight IS NOT NULL THEN
    UPDATE materials SET stock = stock + OLD.weight, updated_at = NOW() WHERE type = 'SCRAP';
    UPDATE materials SET stock = GREATEST(0, stock - (OLD.weight * 0.95)), updated_at = NOW() WHERE type = 'POWDER';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4.4 Update partner stats on INSERT
CREATE OR REPLACE FUNCTION update_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.partner_id IS NOT NULL THEN
    UPDATE partners
    SET total_volume = total_volume + COALESCE(NEW.weight, 0),
        total_value = total_value + COALESCE(NEW.total_value, 0),
        updated_at = NOW()
    WHERE id = NEW.partner_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.5 Rollback partner stats on DELETE
CREATE OR REPLACE FUNCTION rollback_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.partner_id IS NOT NULL THEN
    UPDATE partners
    SET total_volume = GREATEST(0, total_volume - COALESCE(OLD.weight, 0)),
        total_value = GREATEST(0, total_value - COALESCE(OLD.total_value, 0)),
        updated_at = NOW()
    WHERE id = OLD.partner_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4.6 Auto-set created_by from auth.uid()
CREATE OR REPLACE FUNCTION set_transaction_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.7 Auto-create public.users profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STAFF')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- updated_at triggers
CREATE TRIGGER trg_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Stock triggers
CREATE TRIGGER trg_update_stock AFTER INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION update_material_stock();
CREATE TRIGGER trg_rollback_stock BEFORE DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION rollback_material_stock();

-- Partner stats triggers
CREATE TRIGGER trg_update_partner_stats AFTER INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION update_partner_stats();
CREATE TRIGGER trg_rollback_partner_stats BEFORE DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION rollback_partner_stats();

-- Transaction created_by
CREATE TRIGGER trg_transactions_created_by BEFORE INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION set_transaction_created_by();

-- Auth user creation
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 6. RPC FUNCTIONS (ATOMIC OPERATIONS)
-- =====================================================

-- 6.1 Create Import Transaction
CREATE OR REPLACE FUNCTION create_transaction_import(
    p_material_id UUID,
    p_partner_id UUID,
    p_weight NUMERIC,
    p_total_value NUMERIC,
    p_date TIMESTAMPTZ DEFAULT NOW(),
    p_note TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_new_id UUID;
BEGIN
    INSERT INTO transactions (type, material_id, partner_id, weight, total_value, transaction_date, note, created_by)
    VALUES ('IMPORT', p_material_id, p_partner_id, p_weight, p_total_value, p_date, p_note, COALESCE(p_created_by, auth.uid()))
    RETURNING id INTO v_new_id;
    RETURN jsonb_build_object('id', v_new_id, 'status', 'success');
END;
$$;

-- 6.2 Create Export Transaction
CREATE OR REPLACE FUNCTION create_transaction_export(
    p_material_id UUID,
    p_partner_id UUID,
    p_weight NUMERIC,
    p_total_value NUMERIC,
    p_date TIMESTAMPTZ DEFAULT NOW(),
    p_note TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_new_id UUID; v_current_stock NUMERIC;
BEGIN
    SELECT stock INTO v_current_stock FROM materials WHERE id = p_material_id;
    IF v_current_stock < p_weight THEN
        RAISE EXCEPTION 'Không đủ tồn kho! Hiện còn % kg', v_current_stock;
    END IF;
    INSERT INTO transactions (type, material_id, partner_id, weight, total_value, transaction_date, note, created_by)
    VALUES ('EXPORT', p_material_id, p_partner_id, p_weight, p_total_value, p_date, p_note, COALESCE(p_created_by, auth.uid()))
    RETURNING id INTO v_new_id;
    RETURN jsonb_build_object('id', v_new_id, 'status', 'success');
END;
$$;

-- 6.3 Create Production Transaction
CREATE OR REPLACE FUNCTION create_transaction_production(
    p_weight_scrap NUMERIC,
    p_date TIMESTAMPTZ DEFAULT NOW(),
    p_note TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_new_id UUID; v_scrap_stock NUMERIC;
BEGIN
    SELECT stock INTO v_scrap_stock FROM materials WHERE type = 'SCRAP' LIMIT 1;
    IF v_scrap_stock < p_weight_scrap THEN
        RAISE EXCEPTION 'Không đủ nhựa phế! Hiện còn % kg', v_scrap_stock;
    END IF;
    INSERT INTO transactions (type, weight, total_value, transaction_date, note, created_by)
    VALUES ('PRODUCTION', p_weight_scrap, 0, p_date, p_note, COALESCE(p_created_by, auth.uid()))
    RETURNING id INTO v_new_id;
    RETURN jsonb_build_object('id', v_new_id, 'status', 'success');
END;
$$;

-- 6.4 Safe Delete Transaction
CREATE OR REPLACE FUNCTION delete_transaction(p_transaction_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    DELETE FROM transactions WHERE id = p_transaction_id;
    RETURN jsonb_build_object('status', 'success', 'deleted_id', p_transaction_id);
END;
$$;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Internal tool: all authenticated users get full access
CREATE POLICY "Enable all for authenticated users" ON materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON partners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anon to read users for join purposes (e.g. transaction list showing creator name)
CREATE POLICY "Allow anon read users" ON public.users FOR SELECT TO anon USING (true);

-- =====================================================
-- MIGRATION COMPLETED
-- Next: Run 012_seed_data.sql
-- =====================================================

NOTIFY pgrst, 'reload schema';
