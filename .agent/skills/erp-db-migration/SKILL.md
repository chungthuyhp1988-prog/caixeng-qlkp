---
name: erp-db-migration
description: Generate and apply Supabase database migrations for QA-QLKP (PlastiCycle). Creates SQL with RLS policies, indexes, triggers, following the project's numbered naming convention.
---

# Database Migration Skill

## When to use
When adding new tables, columns, indexes, RLS policies, or RPC functions to the PlastiCycle Supabase database.

## Migration naming
Format: `NNN_description.sql` (e.g., `011_add_production_tracking.sql`)
Directory: `migrations/`
Check existing highest number before creating.

## Workflow
1. Check current highest migration number in `migrations/`
2. Generate SQL following templates below
3. Apply via Supabase MCP `apply_migration` tool
4. Verify with `list_tables` or `execute_sql`
5. Run `get_advisors` security check after DDL changes

## Templates

### New Table
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.<table_name> (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  -- columns here
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;

-- Authenticated access
CREATE POLICY "<table_name>_select" ON public.<table_name>
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "<table_name>_insert" ON public.<table_name>
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "<table_name>_update" ON public.<table_name>
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_<table_name>_created_at ON public.<table_name>(created_at);
```

### Add Column
```sql
ALTER TABLE public.<table_name>
  ADD COLUMN IF NOT EXISTS <col> <type> <default>;
```

### RPC Function
```sql
CREATE OR REPLACE FUNCTION public.<func_name>(<params>)
RETURNS <return_type>
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- logic
END;
$$;
```

## Existing tables
materials, transactions, partners, users (staff/auth)

## Important rules
- Always use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- Always enable RLS on new tables
- Use `SECURITY DEFINER` + `SET search_path = public` for RPC functions
- Run security advisors after applying
