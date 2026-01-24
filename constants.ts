import { Material, MaterialType, Transaction, TransactionType, Partner, PartnerType, ExpenseCategory } from './types';

export const MOCK_MATERIALS: Material[] = [
  {
    id: 'scrap',
    name: 'Nhựa Phế Liệu',
    code: 'PHE-LIEU',
    type: MaterialType.SCRAP,
    stock: 5400,
    unit: 'kg',
    pricePerKg: 8000
  },
  {
    id: 'powder',
    name: 'Bột Nhựa Thành Phẩm',
    code: 'BOT-NHUA',
    type: MaterialType.POWDER,
    stock: 12500,
    unit: 'kg',
    pricePerKg: 22000
  }
];

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'p1',
    name: 'Vựa Ve Chai Bình Tân',
    type: PartnerType.SUPPLIER,
    phone: '0901234567',
    address: 'Bình Tân, HCM',
    totalVolume: 1500,
    totalValue: 12000000
  },
  {
    id: 'p2',
    name: 'Công ty Môi Trường Xanh',
    type: PartnerType.SUPPLIER,
    phone: '0912345678',
    address: 'Bình Chánh, HCM',
    totalVolume: 800,
    totalValue: 6400000
  },
  {
    id: 'p3',
    name: 'Nhà máy Tấm Ốp Tường An Phát',
    type: PartnerType.CUSTOMER,
    phone: '0988776655',
    address: 'KCN Tân Tạo',
    totalVolume: 2000,
    totalValue: 44000000
  },
  {
    id: 'p4',
    name: 'Xưởng Nhựa Hưng Yên',
    type: PartnerType.CUSTOMER,
    phone: '0977665544',
    address: 'Hưng Yên',
    totalVolume: 5000,
    totalValue: 110000000
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    date: '2023-10-24T09:30:00',
    type: TransactionType.IMPORT,
    category: ExpenseCategory.MATERIAL,
    materialId: 'scrap',
    materialName: 'Nhựa Phế Liệu',
    partnerName: 'Vựa Ve Chai Bình Tân',
    weight: 1500,
    totalValue: 12000000
  },
  {
    id: 't2',
    date: '2023-10-24T14:15:00',
    type: TransactionType.EXPORT,
    materialId: 'powder',
    materialName: 'Bột Nhựa Thành Phẩm',
    partnerName: 'Nhà máy Tấm Ốp Tường An Phát',
    weight: 2000,
    totalValue: 44000000
  },
  {
    id: 't3',
    date: '2023-10-23T10:00:00',
    type: TransactionType.IMPORT,
    category: ExpenseCategory.MATERIAL,
    materialId: 'scrap',
    materialName: 'Nhựa Phế Liệu',
    partnerName: 'Công ty Môi Trường Xanh',
    weight: 800,
    totalValue: 6400000
  },
  {
    id: 't4',
    date: '2023-10-23T16:45:00',
    type: TransactionType.EXPORT,
    materialId: 'powder',
    materialName: 'Bột Nhựa Thành Phẩm',
    partnerName: 'Xưởng Nhựa Hưng Yên',
    weight: 5000,
    totalValue: 110000000
  },
  {
    id: 't5',
    date: '2023-10-25T08:00:00',
    type: TransactionType.EXPENSE,
    category: ExpenseCategory.LABOR,
    partnerName: 'Nhân viên xưởng',
    totalValue: 5000000,
    note: 'Lương tuần 4 tháng 10'
  },
  {
    id: 't6',
    date: '2023-10-22T11:30:00',
    type: TransactionType.EXPENSE,
    category: ExpenseCategory.MACHINERY,
    partnerName: 'Cơ khí Minh Hùng',
    totalValue: 1500000,
    note: 'Bảo trì máy xay số 2'
  }
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};