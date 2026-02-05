export enum MaterialType {
  SCRAP = 'SCRAP',   // Nhựa phế
  POWDER = 'POWDER', // Bột nhựa
}

export enum TransactionType {
  IMPORT = 'IMPORT', // Nhập kho (Chi)
  EXPORT = 'EXPORT', // Xuất kho (Thu)
  PRODUCTION = 'PRODUCTION', // Sản xuất
  EXPENSE = 'EXPENSE' // Chi phí khác (Lương, Máy móc...)
}

export enum PartnerType {
  SUPPLIER = 'SUPPLIER', // Nhà cung cấp (Vựa)
  CUSTOMER = 'CUSTOMER', // Khách hàng (Nhà máy)
}

export enum ExpenseCategory {
  MATERIAL = 'MATERIAL', // Nguyên vật liệu (Nhập phế)
  LABOR = 'LABOR',       // Nhân công
  MACHINERY = 'MACHINERY', // Máy móc, bảo trì
  OTHER = 'OTHER'        // Khác
}

export interface Material {
  id: string;
  name: string;
  code: string;
  type: MaterialType;
  stock: number; // in kg
  unit: string;
  pricePerKg: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  materialId?: string;
  materialName?: string;
  partnerName?: string; // Supplier for import, Factory for export
  weight?: number; // kg
  totalValue: number;
  category?: ExpenseCategory; // Only for expenses
  note?: string;
  createdBy?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  phone: string;
  address?: string;
  totalVolume: number; // Tổng khối lượng giao dịch
  totalValue: number;  // Tổng giá trị giao dịch
}

export interface Stats {
  totalScrapStock: number;
  totalPowderStock: number;
  monthlyRevenue: number;
  monthlyExpense: number;
}