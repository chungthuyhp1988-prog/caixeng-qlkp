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
    name: 'Kho Nhựa Hưng Thịnh',
    type: PartnerType.SUPPLIER,
    phone: '0239 3856 123',
    address: 'Khu CN Vũng Áng, Kỳ Anh, Hà Tĩnh',
    totalVolume: 2500,
    totalValue: 20000000
  },
  {
    id: 'p2',
    name: 'Kho Phế Liệu Minh Đức',
    type: PartnerType.SUPPLIER,
    phone: '0239 3724 456',
    address: 'Thạch Hà, Hà Tĩnh',
    totalVolume: 1800,
    totalValue: 14400000
  },
  {
    id: 'p3',
    name: 'Công ty Nhựa Phế Liệu Nghệ An',
    type: PartnerType.SUPPLIER,
    phone: '0238 3845 789',
    address: 'KCN VSIP Nghệ An, TP Vinh',
    totalVolume: 3200,
    totalValue: 25600000
  },
  {
    id: 'p4',
    name: 'Kho Thu Mua Nhựa Cửa Lò',
    type: PartnerType.SUPPLIER,
    phone: '0238 3925 234',
    address: 'Thị xã Cửa Lò, Nghệ An',
    totalVolume: 1500,
    totalValue: 12000000
  },
  {
    id: 'p5',
    name: 'Nhà Máy Sản Xuất Nhựa XS Plus',
    type: PartnerType.CUSTOMER,
    phone: '0239 3950 888',
    address: 'KCN Formosa, Kỳ Anh, Hà Tĩnh',
    totalVolume: 8500,
    totalValue: 187000000
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    date: '2024-01-22T09:30:00',
    type: TransactionType.IMPORT,
    category: ExpenseCategory.MATERIAL,
    materialId: 'scrap',
    materialName: 'Nhựa Phế Liệu',
    partnerName: 'Kho Nhựa Hưng Thịnh',
    weight: 2500,
    totalValue: 20000000
  },
  {
    id: 't2',
    date: '2024-01-23T14:15:00',
    type: TransactionType.EXPORT,
    materialId: 'powder',
    materialName: 'Bột Nhựa Thành Phẩm',
    partnerName: 'Nhà Máy Sản Xuất Nhựa XS Plus',
    weight: 8500,
    totalValue: 187000000
  },
  {
    id: 't3',
    date: '2024-01-20T10:00:00',
    type: TransactionType.IMPORT,
    category: ExpenseCategory.MATERIAL,
    materialId: 'scrap',
    materialName: 'Nhựa Phế Liệu',
    partnerName: 'Công ty Nhựa Phế Liệu Nghệ An',
    weight: 3200,
    totalValue: 25600000
  },
  {
    id: 't4',
    date: '2024-01-21T08:30:00',
    type: TransactionType.IMPORT,
    category: ExpenseCategory.MATERIAL,
    materialId: 'scrap',
    materialName: 'Nhựa Phế Liệu',
    partnerName: 'Kho Phế Liệu Minh Đức',
    weight: 1800,
    totalValue: 14400000
  },
  {
    id: 't5',
    date: '2024-01-19T15:45:00',
    type: TransactionType.IMPORT,
    category: ExpenseCategory.MATERIAL,
    materialId: 'scrap',
    materialName: 'Nhựa Phế Liệu',
    partnerName: 'Kho Thu Mua Nhựa Cửa Lò',
    weight: 1500,
    totalValue: 12000000
  },
  {
    id: 't6',
    date: '2024-01-24T08:00:00',
    type: TransactionType.EXPENSE,
    category: ExpenseCategory.LABOR,
    partnerName: 'Nhân viên xưởng',
    totalValue: 5500000,
    note: 'Lương tuần 4 tháng 1/2024'
  },
  {
    id: 't7',
    date: '2024-01-18T11:30:00',
    type: TransactionType.EXPENSE,
    category: ExpenseCategory.MACHINERY,
    partnerName: 'Cơ khí Hà Tĩnh',
    totalValue: 2000000,
    note: 'Bảo trì máy xay số 2'
  }
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};