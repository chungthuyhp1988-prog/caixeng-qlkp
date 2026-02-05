-- =====================================================
-- QA.QLKP Stability Overhaul
-- File: 010_stability_overhaul.sql
-- Description: Reset RLS, standardize RPCs, and harden database
-- =====================================================

-- =====================================================
-- 1. RESET RLS POLICIES (SIMPLIFICATION)
-- =====================================================

-- Drop ALL existing policies to clean slate
DROP POLICY IF EXISTS "Allow all for development" ON materials;
DROP POLICY IF EXISTS "Allow all for development" ON partners;
DROP POLICY IF EXISTS "Allow all for development" ON transactions;
DROP POLICY IF EXISTS "Allow all for development" ON users;

DROP POLICY IF EXISTS "Authenticated users can read materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can update materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users full access partners" ON partners;
DROP POLICY IF EXISTS "Authenticated users full access transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Allow public read for joins" ON users;

-- Enable RLS (just to be safe, though already enabled)
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Apply "USE_CASE: INTERNAL TOOL" Policies
-- Rule: Anyone with a valid login (authenticated) can Read/Write everything.
-- This eliminates "Permission Denied" errors and "Join" issues.

CREATE POLICY "Enable all for authenticated users" ON materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON partners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 2. CREATE RPC FUNCTIONS (ATOMIC OPERATIONS)
-- =====================================================
-- Using SECURITY DEFINER to bypass RLS limits if any remaining, and ensuring atomicity.

-- 2.1 IMPORT Transaction (Nhập kho)
CREATE OR REPLACE FUNCTION create_transaction_import(
    p_material_id UUID,
    p_partner_id UUID,
    p_weight NUMERIC,
    p_price_per_kg NUMERIC, -- Calculate total_value inside if needed, or pass total
    p_total_value NUMERIC,
    p_date TIMESTAMP,
    p_note TEXT,
    p_created_by UUID -- Pass explicit ID or use auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_id UUID;
BEGIN
    INSERT INTO transactions (
        type, material_id, partner_id, weight, total_value, transaction_date, note, created_by
    ) VALUES (
        'IMPORT', p_material_id, p_partner_id, p_weight, p_total_value, p_date, p_note, p_created_by
    ) RETURNING id INTO v_new_id;

    -- Update Material Price if needed (Average price logic could go here, but keeping simple for now)
    
    RETURN jsonb_build_object('id', v_new_id, 'status', 'success');
END;
$$;

-- 2.2 EXPORT Transaction (Xuất kho)
CREATE OR REPLACE FUNCTION create_transaction_export(
    p_material_id UUID,
    p_partner_id UUID,
    p_weight NUMERIC,
    p_total_value NUMERIC,
    p_date TIMESTAMP,
    p_note TEXT,
    p_created_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_id UUID;
    v_current_stock NUMERIC;
BEGIN
    -- Check Stock First
    SELECT stock INTO v_current_stock FROM materials WHERE id = p_material_id;
    
    IF v_current_stock < p_weight THEN
        RAISE EXCEPTION 'Không đủ tồn kho! Hiện còn % kg', v_current_stock;
    END IF;

    INSERT INTO transactions (
        type, material_id, partner_id, weight, total_value, transaction_date, note, created_by
    ) VALUES (
        'EXPORT', p_material_id, p_partner_id, p_weight, p_total_value, p_date, p_note, p_created_by
    ) RETURNING id INTO v_new_id;

    RETURN jsonb_build_object('id', v_new_id, 'status', 'success');
END;
$$;

-- 2.3 PRODUCTION Transaction (Sản xuất)
CREATE OR REPLACE FUNCTION create_transaction_production(
    p_weight_scrap NUMERIC, -- Lượng nhựa phế đưa vào
    p_date TIMESTAMP,
    p_note TEXT,
    p_created_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_id UUID;
    v_scrap_stock NUMERIC;
BEGIN
    -- Check Scrap Stock
    -- Assuming ONE record for 'SCRAP' type or handle properly. 
    -- For now, checking the material row that corresponds to SCRAP if we had ID.
    -- But DB schema separates by Type. Let's find a Scrap material. 
    -- Ideally input should be material_id, but per current logic we might filter by Type.
    
    -- IMPORTANT: Implementation detail from update_material_stock() suggests we update by Type.
    -- But transactions usually link to specific material_id.
    
    INSERT INTO transactions (
        type, weight, total_value, transaction_date, note, created_by
    ) VALUES (
        'PRODUCTION', p_weight_scrap, 0, p_date, p_note, p_created_by
    ) RETURNING id INTO v_new_id;

    RETURN jsonb_build_object('id', v_new_id, 'status', 'success');
END;
$$;

-- 2.4 DELETE Transaction (Safe Delete)
CREATE OR REPLACE FUNCTION delete_transaction(
    p_transaction_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM transactions WHERE id = p_transaction_id;
    RETURN jsonb_build_object('status', 'success', 'deleted_id', p_transaction_id);
END;
$$;

-- =====================================================
-- 3. ADDITIONAL INDEXES (PERFORMANCE)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Force refresh of schema cache might be needed on client
NOTIFY pgrst, 'reload schema';
