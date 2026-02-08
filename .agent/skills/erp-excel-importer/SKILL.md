---
name: erp-excel-importer
description: Import data from Excel/CSV files into QA-QLKP PlastiCycle. Parse transaction records, partner lists, or inventory data from spreadsheets.
---

# Excel Importer Skill

## When to use
When importing transaction history, partner lists, or inventory data from Excel/CSV files.

## Note: xlsx not yet installed
Run `npm install xlsx` before using this skill. The library is not yet in package.json.

## Workflow
```
- [ ] Step 1: Install xlsx if needed (`npm install xlsx`)
- [ ] Step 2: Analyze source Excel structure
- [ ] Step 3: Create parser function in lib/
- [ ] Step 4: Create import UI component
- [ ] Step 5: Add validation logic
- [ ] Step 6: Implement upsert to Supabase
- [ ] Step 7: Test with sample file
```

## Parser template
```typescript
import * as XLSX from 'xlsx';

interface ParseResult<T> {
  data: T[];
  errors: string[];
}

export function parseTransactionsExcel(file: File): Promise<ParseResult<Transaction>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target?.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      const data: Transaction[] = [];
      const errors: string[] = [];

      rawData.forEach((row, idx) => {
        try {
          data.push({
            id: crypto.randomUUID(),
            date: parseDate(row['Ngày'] || row['Date']),
            type: mapTransactionType(row['Loại'] || row['Type']),
            materialName: row['Vật liệu'] || row['Material'],
            partnerName: row['Đối tác'] || row['Partner'],
            weight: parseFloat(row['Khối lượng (kg)'] || row['Weight'] || 0),
            totalValue: parseFloat(String(row['Giá trị'] || row['Value'] || 0).replace(/[,.]/g, '')),
            note: row['Ghi chú'] || row['Note'] || '',
          });
        } catch (err) {
          errors.push(`Dòng ${idx + 2}: ${err.message}`);
        }
      });

      resolve({ data, errors });
    };
    reader.readAsBinaryString(file);
  });
}
```

## Column mapping for PlastiCycle

| Vietnamese Header | Field | Type |
|---|---|---|
| Ngày | date | date |
| Loại | type | TransactionType enum |
| Vật liệu | materialName | string |
| Đối tác / Vựa / Nhà máy | partnerName | string |
| Khối lượng (kg) | weight | number |
| Giá trị / Thành tiền | totalValue | number |
| Ghi chú | note | string |
| Tên | name | string (partners) |
| Điện thoại | phone | string (partners) |
| Địa chỉ | address | string (partners) |

## Validation rules
- Weight must be positive number (kg)
- totalValue must be positive (VND)
- Transaction type must map to valid enum
- Date: handle DD/MM/YYYY, YYYY-MM-DD, and Excel serial formats

## Important rules
- Show preview table before importing
- Handle Vietnamese UTF-8 encoding
- Use upsert to avoid duplicates
- Support both .xlsx and .csv
