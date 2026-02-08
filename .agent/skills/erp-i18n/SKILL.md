---
name: erp-i18n
description: Manage internationalization for QA-QLKP PlastiCycle. Detect hardcoded Vietnamese strings and create translation system.
---

# Internationalization (i18n) Skill

## When to use
When preparing PlastiCycle for multi-language support or standardizing string management.

## Workflow
```
- [ ] Step 1: Scan codebase for hardcoded Vietnamese strings
- [ ] Step 2: Define translation key structure
- [ ] Step 3: Create locale files (vi.json, en.json)
- [ ] Step 4: Create useTranslation hook
- [ ] Step 5: Replace hardcoded strings
- [ ] Step 6: Verify rendering
```

## Key naming convention
```
module.section.key

nav.dashboard              → "Tổng quan"
nav.inventory              → "Kho hàng"
nav.cashflow               → "Thu chi"
nav.partners               → "Đối tác"
nav.personnel              → "Nhân sự"
transaction.type.import    → "Nhập kho"
transaction.type.export    → "Xuất kho"
transaction.type.expense   → "Chi phí"
material.type.scrap        → "Nhựa phế"
material.type.powder       → "Bột nhựa"
partner.type.supplier      → "Nhà cung cấp"
partner.type.customer      → "Khách hàng"
common.save                → "Lưu"
common.cancel              → "Hủy"
common.delete              → "Xóa"
common.search              → "Tìm kiếm"
unit.kg                    → "kg"
unit.vnd                   → "VNĐ"
```

## Locale file sample
`lib/i18n/vi.json`:
```json
{
  "nav": {
    "dashboard": "Tổng quan",
    "inventory": "Kho hàng",
    "cashflow": "Thu chi",
    "partners": "Đối tác",
    "personnel": "Nhân sự"
  },
  "transaction": {
    "type": {
      "import": "Nhập kho",
      "export": "Xuất kho",
      "production": "Sản xuất",
      "expense": "Chi phí"
    }
  },
  "material": {
    "type": { "scrap": "Nhựa phế", "powder": "Bột nhựa" }
  }
}
```

## Hook
```typescript
import vi from './vi.json';
import en from './en.json';
const locales = { vi, en };

export function useTranslation(locale: 'vi' | 'en' = 'vi') {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = locales[locale];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return typeof value === 'string' ? value : key;
  };
  return { t, locale };
}
```

## Detection regex
Find Vietnamese strings in `.tsx` files:
```
[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỹỷỵđĐ]
```
