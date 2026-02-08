---
name: supabase-rls-audit
description: Audit Row Level Security policies on all QA-QLKP PlastiCycle Supabase tables. Detect missing policies and suggest fixes.
---

# Supabase RLS Audit Skill

## When to use
- After creating new tables or migrations
- During security reviews
- Before deploying to production

## Audit workflow
```
- [ ] Step 1: List all tables in public schema
- [ ] Step 2: Check RLS enabled status
- [ ] Step 3: Review existing policies
- [ ] Step 4: Run Supabase security advisors
- [ ] Step 5: Generate fix recommendations
- [ ] Step 6: Apply fixes
```

## Audit query
Run via `execute_sql`:
```sql
SELECT
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COALESCE(
    json_agg(
      json_build_object(
        'policy', p.policyname,
        'cmd', p.cmd,
        'roles', p.roles,
        'qual', p.qual
      )
    ) FILTER (WHERE p.policyname IS NOT NULL),
    '[]'
  ) AS policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;
```

## Security advisors
Use MCP tool: `get_advisors` with type `security`

## Severity levels
| Issue | Severity | Action |
|---|---|---|
| RLS not enabled | 🔴 Critical | Enable immediately |
| No SELECT policy | 🟡 Warning | Add authenticated read policy |
| No write policies | 🟡 Warning | Add role-based write policies |
| Overly permissive | 🟢 Info | Consider restricting |

## Fix templates

### Enable RLS
```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
```

### Basic authenticated access
```sql
CREATE POLICY "<table>_authenticated" ON public.<table>
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### User-scoped access (for staff data)
```sql
CREATE POLICY "<table>_own_data" ON public.<table>
  FOR ALL TO authenticated
  USING (created_by = auth.uid());
```

## PlastiCycle sensitive tables
- `users` — staff credentials and roles
- `transactions` — financial records
- `materials` — inventory data

## Report format
```
| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Status |
|-------|-----|--------|--------|--------|--------|--------|
| transactions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ OK |
| users | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ Warning |
```
