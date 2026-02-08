---
name: erp-dashboard-widget
description: Create dashboard cards, KPI widgets, and charts for QA-QLKP PlastiCycle using Recharts.
---

# Dashboard Widget Skill

## When to use
When adding new KPI cards, charts, or data visualization widgets to the PlastiCycle dashboard.

## Existing patterns
- Dashboard: `components/Dashboard.tsx`
- Chart library: `recharts` (installed)
- Icons: `lucide-react`
- Currency format: `formatCurrency()` from `constants.ts`

## Widget types

### 1. KPI Summary Card
```tsx
<div className="stat-card">
  <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
    <Package size={24} />
  </div>
  <div className="stat-info">
    <span className="stat-label">Tồn kho phế</span>
    <span className="stat-value">{stats.totalScrapStock.toLocaleString()} kg</span>
  </div>
</div>
```

### 2. Bar Chart (Doanh thu/Chi phí)
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={monthlyData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis tickFormatter={(v) => (v / 1e6) + 'tr'} />
    <Tooltip formatter={(v) => formatCurrency(v)} />
    <Legend />
    <Bar dataKey="revenue" name="Doanh thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
    <Bar dataKey="expense" name="Chi phí" fill="#ef4444" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### 3. Pie Chart (Cơ cấu chi phí)
```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];
const expenseData = [
  { name: 'Nguyên liệu', value: materialCost },
  { name: 'Nhân công', value: laborCost },
  { name: 'Máy móc', value: machineryCost },
  { name: 'Khác', value: otherCost },
];

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={expenseData} innerRadius={60} outerRadius={100} dataKey="value">
      {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
    </Pie>
    <Legend />
    <Tooltip formatter={formatCurrency} />
  </PieChart>
</ResponsiveContainer>
```

### 4. Line Chart (Xu hướng tồn kho)
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={stockTrend}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis tickFormatter={(v) => v.toLocaleString() + ' kg'} />
    <Tooltip formatter={(v) => v.toLocaleString() + ' kg'} />
    <Line type="monotone" dataKey="scrap" name="Nhựa phế" stroke="#f59e0b" strokeWidth={2} />
    <Line type="monotone" dataKey="powder" name="Bột nhựa" stroke="#6366f1" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

## PlastiCycle KPI metrics
- Tồn kho nhựa phế (kg)
- Tồn kho bột nhựa (kg)
- Doanh thu tháng (xuất bột)
- Chi phí tháng (nhập phế + lương + máy móc)
- Lợi nhuận = Doanh thu - Chi phí
- Tỷ lệ chuyển đổi: kg phế → kg bột
- Giá trung bình mua vào / bán ra

## Number formatting
```typescript
// Already available in constants.ts
import { formatCurrency } from '../constants';

// Weight formatting
const formatWeight = (kg: number) => kg.toLocaleString('vi-VN') + ' kg';
```
