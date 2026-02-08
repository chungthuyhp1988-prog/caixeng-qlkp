---
name: erp-approval-flow
description: Design and implement approval workflows for QA-QLKP PlastiCycle (e.g., large transactions, expense approvals, stock adjustments).
---

# Approval Flow Skill

## When to use
When creating approval processes for transactions, expenses, or stock adjustments requiring manager authorization.

## PlastiCycle approval scenarios
1. **Large transactions** — Nhập/xuất trên X kg cần duyệt
2. **Expense approvals** — Chi phí trên ngưỡng cần quản lý duyệt
3. **Stock adjustments** — Điều chỉnh tồn kho bất thường
4. **New partner onboarding** — Thêm nhà cung cấp/khách hàng mới

## Workflow pattern
```
Draft → Pending → Approved / Rejected
```

## Implementation checklist
```
- [ ] Step 1: Add status field to entity (draft/pending/approved/rejected)
- [ ] Step 2: Add approver_id and approved_at fields
- [ ] Step 3: Create approval migration
- [ ] Step 4: Add approval UI (button + comment input)
- [ ] Step 5: Add role check (only managers can approve)
- [ ] Step 6: Add notification on status change
```

## Database schema
```sql
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS approver_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approval_note TEXT;
```

## Role validation
```typescript
const canApprove = (userRole: string): boolean => {
  return ['admin', 'manager'].includes(userRole);
};

const needsApproval = (transaction: Transaction): boolean => {
  return transaction.totalValue > 50000000; // > 50 triệu
};
```

## UI pattern
```tsx
{needsApproval(txn) && txn.approval_status === 'pending' && canApprove(user.role) && (
  <div className="approval-actions">
    <button onClick={() => approve(txn.id)} className="btn-approve">✓ Duyệt</button>
    <button onClick={() => reject(txn.id)} className="btn-reject">✗ Từ chối</button>
    <textarea placeholder="Ghi chú..." value={note} onChange={...} />
  </div>
)}
```

## Important rules
- Store approver ID and timestamp for audit trail
- Rejected status requires a reason/note
- Approved transactions cannot be edited (lock after approval)
