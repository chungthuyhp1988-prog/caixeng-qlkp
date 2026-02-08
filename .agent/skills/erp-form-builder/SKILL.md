---
name: erp-form-builder
description: Build forms for QA-QLKP PlastiCycle with proper validation for weights, currency, and Vietnamese labels.
---

# Form Builder Skill

## When to use
When creating or modifying forms for PlastiCycle entities (transactions, partners, materials, expenses).

## Component style
PlastiCycle uses **single-file components** with inline styles. No separate UI component library.

## Form templates

### Transaction form (Import/Export)
```tsx
const [form, setForm] = useState({
  date: new Date().toISOString().split('T')[0],
  type: TransactionType.IMPORT,
  materialId: '',
  partnerName: '',
  weight: 0,
  totalValue: 0,
  note: '',
});

<form onSubmit={handleSubmit}>
  <div className="form-group">
    <label>Ngày</label>
    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
  </div>

  <div className="form-group">
    <label>Loại giao dịch</label>
    <select value={form.type} onChange={e => setForm({...form, type: e.target.value as TransactionType})}>
      <option value={TransactionType.IMPORT}>Nhập kho</option>
      <option value={TransactionType.EXPORT}>Xuất kho</option>
      <option value={TransactionType.PRODUCTION}>Sản xuất</option>
      <option value={TransactionType.EXPENSE}>Chi phí</option>
    </select>
  </div>

  <div className="form-group">
    <label>Khối lượng (kg)</label>
    <input type="number" value={form.weight} onChange={e => setForm({...form, weight: parseFloat(e.target.value)})}
      min="0" step="0.1" />
  </div>

  <div className="form-group">
    <label>Giá trị (VNĐ)</label>
    <input type="number" value={form.totalValue} onChange={e => setForm({...form, totalValue: parseFloat(e.target.value)})}
      min="0" />
  </div>

  <div className="form-group">
    <label>Ghi chú</label>
    <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
  </div>

  <div className="form-actions">
    <button type="button" onClick={onCancel}>Hủy</button>
    <button type="submit">Lưu</button>
  </div>
</form>
```

## Validation pattern
```typescript
const validate = (form: Partial<Transaction>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!form.date) errors.date = 'Chưa chọn ngày';
  if (!form.type) errors.type = 'Chưa chọn loại giao dịch';
  if (form.weight !== undefined && form.weight < 0) errors.weight = 'Khối lượng phải >= 0';
  if (form.totalValue !== undefined && form.totalValue < 0) errors.totalValue = 'Giá trị phải >= 0';
  if (form.type !== TransactionType.EXPENSE && !form.materialId) errors.materialId = 'Chưa chọn vật liệu';
  return errors;
};
```

## Auto-calculate helpers
```typescript
// Auto-calculate total from weight × price
const autoCalcTotal = (weight: number, pricePerKg: number) => weight * pricePerKg;

// Auto-suggest price from recent transactions with same partner
const suggestPrice = async (partnerName: string, materialType: MaterialType) => {
  const { data } = await supabase.from('transactions')
    .select('total_value, weight')
    .eq('partner_name', partnerName)
    .order('date', { ascending: false })
    .limit(1);
  if (data?.[0]) return data[0].total_value / data[0].weight;
  return null;
};
```

## Form CSS
```css
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; color: #374151; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem;
}
.form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
```

## Important rules
- Weight always in kg, currency always in VND
- Auto-calculate `totalValue = weight × pricePerKg` when possible
- Show `formatCurrency()` preview for monetary values
- Support both create and edit modes
