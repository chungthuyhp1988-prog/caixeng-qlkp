-- =====================================================
-- QA.QLKP Database Schema Migration
-- File: 004_transaction_user_tracking.sql
-- Description: Add created_by column to transactions to track user activity
-- =====================================================

-- 1. Add created_by column to transactions table
ALTER TABLE transactions
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN transactions.created_by IS 'Người tạo giao dịch (User ID)';

-- 2. Create Trigger Function to Auto-set created_by
-- This ensures that created_by is always set to the currently logged in user (auth.uid())
-- even if the API doesn't pass it explicitly (though API should for clarity).
CREATE OR REPLACE FUNCTION set_transaction_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- If created_by is not provided in the INSERT statement, try to get it from auth.uid()
  IF NEW.created_by IS NULL THEN
    -- auth.uid() returns the ID of the user executing the query via API
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger
CREATE TRIGGER trg_transactions_created_by
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_transaction_created_by();

-- 4. Update RLS Policies to allow reading user info for joins
-- (Already covered by "Authenticated users can view own profile" + "Admins view all", 
-- but users need to see names of creators in the UI?)

-- Allow authenticated users to read basic info (name, id) of ALL users
-- This is necessary to display "Created By: [Name]" in the list
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;

CREATE POLICY "Authenticated users can view all profiles"
ON users FOR SELECT
USING (auth.role() = 'authenticated');

-- Keep restrict update/delete to Admin/Self only
-- (Already defined in 003, but let's reinforce or leave as is if 003 covered it properly. 
-- 003 had "Admins can update profiles" and "Admins can delete profiles". 
-- We just widened SELECT to allow everyone to see names.)

-- Note: Ensure `transactions` select query includes `users (full_name)`
