---
name: erp-report-generator
description: Generate report pages for QA-QLKP PlastiCycle with filters, data tables, charts, and Excel export for inventory and financial reports.
---

# Report Generator Skill

## When to use
When creating report pages showing aggregated inventory, financial, or operational data.

## Workflow
```
- [ ] Step 1: Define data source (Supabase query or RPC)
- [ ] Step 2: Create filter UI (date range, type, partner)
- [ ] Step 3: Build data table
- [ ] Step 4: Add summary/totals row
- [ ] Step 5: Add chart visualization
- [ ] Step 6: Implement Excel export (install xlsx if needed)
- [ ] Step 7: Add print CSS
```

## Report component template
```tsx
import { useState, useEffect } from 'react';
import { Download, Printer, Filter } from 'lucide-react';
import { formatCurrency } from '../constants';

export function <Report>Report() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', type: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    let query = supabase.from('transactions').select('*');
    if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('date', filters.dateTo);
    if (filters.type) query = query.eq('type', filters.type);
    const { data } = await query.order('date', { ascending: false });
    setData(data || []);
    setLoading(false);
  };

  return (
    <div className="report-page">
      <div className="report-filters">
        <input type="date" value={filters.dateFrom} onChange={...} />
        <input type="date" value={filters.dateTo} onChange={...} />
        <select value={filters.type} onChange={...}>
          <option value="">Tất cả</option>
          <option value="IMPORT">Nhập kho</option>
          <option value="EXPORT">Xuất kho</option>
          <option value="EXPENSE">Chi phí</option>
        </select>
        <button onClick={fetchReport}><Filter size={16} /> Lọc</button>
        <button onClick={handlePrint}><Printer size={16} /> In</button>
      </div>

      <div className="report-summary">
        <div className="summary-card">Tổng nhập: {formatCurrency(totalImport)}</div>
        <div className="summary-card">Tổng xuất: {formatCurrency(totalExport)}</div>
        <div className="summary-card">Lợi nhuận: {formatCurrency(totalExport - totalImport)}</div>
      </div>

      <table>...</table>
    </div>
  );
}
```

## PlastiCycle report types
| Report | Mô tả | Data source |
|---|---|---|
| Báo cáo tồn kho | Tồn phế + bột theo ngày | materials |
| Báo cáo Thu-Chi | Doanh thu vs chi phí theo tháng | transactions |
| Báo cáo đối tác | Volume & value theo partner | transactions group by partner |
| Báo cáo sản xuất | Tỷ lệ chuyển đổi phế → bột | transactions type=PRODUCTION |
| Báo cáo chi phí | Breakdown by category | transactions type=EXPENSE |

## Print CSS
```css
@media print {
  .report-filters, .sidebar, .header { display: none !important; }
  .report-page { padding: 0; background: white; color: black; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #333; padding: 4px 8px; font-size: 11px; }
}
```

## Number formatting
```typescript
import { formatCurrency } from '../constants';
const formatWeight = (kg: number) => kg.toLocaleString('vi-VN') + ' kg';
```
