-- =====================================================
-- QA.QLKP Database Schema Migration
-- File: 008_fix_delete_triggers.sql
-- Description: Fix stock and partner stats rollback on transaction DELETE
-- =====================================================

-- =====================================================
-- 1. ROLLBACK MATERIAL STOCK ON DELETE
-- =====================================================

CREATE OR REPLACE FUNCTION rollback_material_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- IMPORT được xóa: Giảm stock (vì đã cộng khi INSERT)
  IF OLD.type = 'IMPORT' AND OLD.material_id IS NOT NULL AND OLD.weight IS NOT NULL THEN
    UPDATE materials 
    SET stock = GREATEST(0, stock - OLD.weight),
        updated_at = NOW()
    WHERE id = OLD.material_id;
  
  -- EXPORT được xóa: Tăng stock (vì đã trừ khi INSERT)
  ELSIF OLD.type = 'EXPORT' AND OLD.material_id IS NOT NULL AND OLD.weight IS NOT NULL THEN
    UPDATE materials 
    SET stock = stock + OLD.weight,
        updated_at = NOW()
    WHERE id = OLD.material_id;
  
  -- PRODUCTION được xóa: Hoàn trả Scrap, Trừ Powder
  ELSIF OLD.type = 'PRODUCTION' AND OLD.weight IS NOT NULL THEN
    -- Trả lại nhựa phế
    UPDATE materials 
    SET stock = stock + OLD.weight,
        updated_at = NOW()
    WHERE type = 'SCRAP';
    
    -- Trừ bột nhựa (95% conversion rate)
    UPDATE materials 
    SET stock = GREATEST(0, stock - (OLD.weight * 0.95)),
        updated_at = NOW()
    WHERE type = 'POWDER';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_rollback_stock ON transactions;
CREATE TRIGGER trg_rollback_stock
BEFORE DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION rollback_material_stock();

COMMENT ON FUNCTION rollback_material_stock() IS 'Rollback stock khi xóa transaction';

-- =====================================================
-- 2. ROLLBACK PARTNER STATS ON DELETE
-- =====================================================

CREATE OR REPLACE FUNCTION rollback_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.partner_id IS NOT NULL THEN
    UPDATE partners
    SET 
      total_volume = GREATEST(0, total_volume - COALESCE(OLD.weight, 0)),
      total_value = GREATEST(0, total_value - COALESCE(OLD.total_value, 0)),
      updated_at = NOW()
    WHERE id = OLD.partner_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_rollback_partner_stats ON transactions;
CREATE TRIGGER trg_rollback_partner_stats
BEFORE DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION rollback_partner_stats();

COMMENT ON FUNCTION rollback_partner_stats() IS 'Rollback partner stats khi xóa transaction';

-- =====================================================
-- 3. FIX UPDATE TRIGGER FOR TRANSACTIONS
-- (Handle UPDATE case - not just INSERT)
-- =====================================================

CREATE OR REPLACE FUNCTION update_material_stock_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Rollback old values first
  IF OLD.type = 'IMPORT' AND OLD.material_id IS NOT NULL AND OLD.weight IS NOT NULL THEN
    UPDATE materials SET stock = GREATEST(0, stock - OLD.weight) WHERE id = OLD.material_id;
  ELSIF OLD.type = 'EXPORT' AND OLD.material_id IS NOT NULL AND OLD.weight IS NOT NULL THEN
    UPDATE materials SET stock = stock + OLD.weight WHERE id = OLD.material_id;
  END IF;
  
  -- Apply new values
  IF NEW.type = 'IMPORT' AND NEW.material_id IS NOT NULL AND NEW.weight IS NOT NULL THEN
    UPDATE materials SET stock = stock + NEW.weight WHERE id = NEW.material_id;
  ELSIF NEW.type = 'EXPORT' AND NEW.material_id IS NOT NULL AND NEW.weight IS NOT NULL THEN
    UPDATE materials SET stock = GREATEST(0, stock - NEW.weight) WHERE id = NEW.material_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create UPDATE trigger (uncomment if needed)
-- DROP TRIGGER IF EXISTS trg_update_stock_on_update ON transactions;
-- CREATE TRIGGER trg_update_stock_on_update
-- BEFORE UPDATE ON transactions
-- FOR EACH ROW
-- EXECUTE FUNCTION update_material_stock_on_update();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify triggers are created:
/*
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'transactions'
ORDER BY trigger_name;
*/

-- =====================================================
-- MIGRATION COMPLETED
-- Next: Test by deleting a transaction and checking stock
-- =====================================================
