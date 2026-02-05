import { Material, MaterialType, Partner, PartnerType, Transaction, TransactionType, ExpenseCategory } from '../types';

export const mockUser = {
    id: 'mock-user-id',
    email: 'admin@khophe.com',
    full_name: 'Admin Mock',
    role: 'ADMIN'
};

export const mockMaterials: Material[] = [
    {
        id: 'mat-1',
        code: 'PHE-LIEU',
        name: 'Nhựa Phế Liệu',
        type: MaterialType.SCRAP,
        stock: 5000,
        unit: 'kg',
        pricePerKg: 8000
    },
    {
        id: 'mat-2',
        code: 'BOT-NHUA',
        name: 'Bột Nhựa Tái Chế',
        type: MaterialType.POWDER,
        stock: 1200,
        unit: 'kg',
        pricePerKg: 15000
    }
];

export const mockPartners: Partner[] = [
    {
        id: 'partner-1',
        name: 'Vựa Ve Chai Chú Bảy',
        type: PartnerType.SUPPLIER,
        phone: '0901234567',
        address: 'Hóc Môn, HCM',
        totalVolume: 10000,
        totalValue: 80000000
    },
    {
        id: 'partner-2',
        name: 'Cty Nhựa Song Long',
        type: PartnerType.CUSTOMER,
        phone: '0987654321',
        address: 'Bình Tân, HCM',
        totalVolume: 5000,
        totalValue: 75000000
    }
];

export const mockTransactions: Transaction[] = [
    {
        id: 'tx-1',
        date: new Date().toISOString(),
        type: TransactionType.IMPORT,
        materialId: 'mat-1',
        materialName: 'Nhựa Phế Liệu',
        partnerName: 'Vựa Ve Chai Chú Bảy',
        weight: 1000,
        totalValue: 8000000,
        createdBy: mockUser.id,
        note: 'Nhập hàng sáng sớm'
    },
    {
        id: 'tx-2',
        date: new Date(Date.now() - 86400000).toISOString(),
        type: TransactionType.PRODUCTION,
        weight: 500,
        totalValue: 0,
        createdBy: mockUser.id,
        note: 'Sản xuất ca chiều',
        materialName: 'Nhựa Phế Liệu' // Context implied
    }
];
