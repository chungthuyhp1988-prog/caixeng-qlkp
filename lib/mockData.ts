import { Material, MaterialType, Partner, PartnerType, Transaction, TransactionType, ExpenseCategory } from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const mockUser = {
    id: 'mock-user-id',
    email: 'admin@khophe.com',
    full_name: 'Nguyễn Thanh Nam',
    role: 'ADMIN'
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MATERIALS (Nhựa Phế + Bột Nhựa)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const mockMaterials: Material[] = [
    {
        id: 'mat-1',
        code: 'PHE-LIEU',
        name: 'Nhựa Phế Liệu',
        type: MaterialType.SCRAP,
        stock: 12500,
        unit: 'kg',
        pricePerKg: 8500
    },
    {
        id: 'mat-2',
        code: 'BOT-NHUA',
        name: 'Bột Nhựa Tái Chế',
        type: MaterialType.POWDER,
        stock: 8200,
        unit: 'kg',
        pricePerKg: 16000
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARTNERS — Nhà Cung Cấp (Vựa) + Khách Hàng (Nhà máy)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const mockPartners: Partner[] = [
    // ——— NHÀ CUNG CẤP (SUPPLIER) ———
    {
        id: 'partner-s1',
        name: 'Vựa Ve Chai Chú Bảy',
        type: PartnerType.SUPPLIER,
        phone: '0901234567',
        address: 'Hóc Môn, TP.HCM',
        totalVolume: 42000,
        totalValue: 336000000
    },
    {
        id: 'partner-s2',
        name: 'Vựa Phế Liệu Thanh Tâm',
        type: PartnerType.SUPPLIER,
        phone: '0918765432',
        address: 'Bình Chánh, TP.HCM',
        totalVolume: 35000,
        totalValue: 297500000
    },
    {
        id: 'partner-s3',
        name: 'Cơ Sở Thu Mua Anh Tuấn',
        type: PartnerType.SUPPLIER,
        phone: '0977123456',
        address: 'Củ Chi, TP.HCM',
        totalVolume: 28000,
        totalValue: 224000000
    },
    {
        id: 'partner-s4',
        name: 'Vựa Nhựa Cô Hai',
        type: PartnerType.SUPPLIER,
        phone: '0933456789',
        address: 'Tân Phú, TP.HCM',
        totalVolume: 18500,
        totalValue: 157250000
    },
    {
        id: 'partner-s5',
        name: 'Đại Lý Thu Mua Phát Tài',
        type: PartnerType.SUPPLIER,
        phone: '0965789012',
        address: 'Thủ Đức, TP.HCM',
        totalVolume: 15000,
        totalValue: 127500000
    },
    {
        id: 'partner-s6',
        name: 'Vựa Ve Chai Minh Đạt',
        type: PartnerType.SUPPLIER,
        phone: '0889345678',
        address: 'Quận 12, TP.HCM',
        totalVolume: 12000,
        totalValue: 96000000
    },

    // ——— KHÁCH HÀNG (CUSTOMER) ———
    {
        id: 'partner-c1',
        name: 'Cty TNHH Nhựa Song Long',
        type: PartnerType.CUSTOMER,
        phone: '0987654321',
        address: 'KCN Tân Bình, TP.HCM',
        totalVolume: 25000,
        totalValue: 400000000
    },
    {
        id: 'partner-c2',
        name: 'Cty CP Tấm Ốp Đại Phát',
        type: PartnerType.CUSTOMER,
        phone: '0945678901',
        address: 'KCN Vĩnh Lộc, Bình Chánh',
        totalVolume: 18000,
        totalValue: 288000000
    },
    {
        id: 'partner-c3',
        name: 'Nhà Máy Nhựa Tân Hiệp',
        type: PartnerType.CUSTOMER,
        phone: '0908234567',
        address: 'KCN Tân Tạo, Bình Tân',
        totalVolume: 14500,
        totalValue: 232000000
    },
    {
        id: 'partner-c4',
        name: 'Cty Sản Xuất Nhựa Hoàng Gia',
        type: PartnerType.CUSTOMER,
        phone: '0916345678',
        address: 'Biên Hòa, Đồng Nai',
        totalVolume: 10000,
        totalValue: 160000000
    },
    {
        id: 'partner-c5',
        name: 'Cty TNHH SX Bao Bì Việt Phát',
        type: PartnerType.CUSTOMER,
        phone: '0928456789',
        address: 'Dĩ An, Bình Dương',
        totalVolume: 8500,
        totalValue: 136000000
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Generate dates for the past N months
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 60), 0, 0);
    return d.toISOString();
}

function monthDate(monthsBack: number, day: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsBack, day);
    d.setHours(Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 60), 0, 0);
    return d.toISOString();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRANSACTIONS — 6 tháng gần nhất
// Bao gồm: IMPORT, EXPORT, PRODUCTION, EXPENSE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const suppliers = ['Vựa Ve Chai Chú Bảy', 'Vựa Phế Liệu Thanh Tâm', 'Cơ Sở Thu Mua Anh Tuấn', 'Vựa Nhựa Cô Hai', 'Đại Lý Thu Mua Phát Tài', 'Vựa Ve Chai Minh Đạt'];
const customers = ['Cty TNHH Nhựa Song Long', 'Cty CP Tấm Ốp Đại Phát', 'Nhà Máy Nhựa Tân Hiệp', 'Cty Sản Xuất Nhựa Hoàng Gia', 'Cty TNHH SX Bao Bì Việt Phát'];
const staffNames = ['Nguyễn Thanh Nam', 'Trần Văn Hùng', 'Lê Thị Hoa', 'Phạm Minh Tuấn', 'Nguyễn Hoàng Dũng'];

export const mockTransactions: Transaction[] = [
    // ════════════════════════════════════
    //  THÁNG 6 (5 tháng trước)
    // ════════════════════════════════════

    // — NHẬP HÀNG —
    { id: 'tx-001', date: monthDate(5, 3), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[0], weight: 3200, totalValue: 25600000, createdBy: staffNames[0], note: 'Nhập lô đầu tháng' },
    { id: 'tx-002', date: monthDate(5, 8), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[1], weight: 2800, totalValue: 23800000, createdBy: staffNames[1], note: 'Nhập từ Bình Chánh' },
    { id: 'tx-003', date: monthDate(5, 15), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[2], weight: 1500, totalValue: 12000000, createdBy: staffNames[0] },
    { id: 'tx-004', date: monthDate(5, 22), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[3], weight: 2100, totalValue: 17850000, createdBy: staffNames[2] },
    // — SẢN XUẤT —
    { id: 'tx-005', date: monthDate(5, 10), type: TransactionType.PRODUCTION, weight: 4000, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa ca sáng', materialName: 'Nhựa Phế Liệu' },
    { id: 'tx-006', date: monthDate(5, 20), type: TransactionType.PRODUCTION, weight: 3500, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa ca chiều', materialName: 'Nhựa Phế Liệu' },
    // — XUẤT BÁN —
    { id: 'tx-007', date: monthDate(5, 12), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[0], weight: 2500, totalValue: 40000000, createdBy: staffNames[0], note: 'Xuất cho Song Long' },
    { id: 'tx-008', date: monthDate(5, 25), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[1], weight: 1800, totalValue: 28800000, createdBy: staffNames[2], note: 'Xuất cho Đại Phát' },
    // — CHI PHÍ —
    { id: 'tx-009', date: monthDate(5, 5), type: TransactionType.EXPENSE, totalValue: 24000000, category: ExpenseCategory.LABOR, partnerName: 'Chi phí vận hành', note: 'Lương nhân công tháng 9', createdBy: staffNames[0] },
    { id: 'tx-010', date: monthDate(5, 18), type: TransactionType.EXPENSE, totalValue: 5500000, category: ExpenseCategory.MACHINERY, partnerName: 'Chi phí vận hành', note: 'Bảo trì máy xay định kỳ', createdBy: staffNames[0] },

    // ════════════════════════════════════
    //  THÁNG 7 (4 tháng trước)
    // ════════════════════════════════════

    { id: 'tx-011', date: monthDate(4, 2), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[0], weight: 3500, totalValue: 29750000, createdBy: staffNames[0], note: 'Nhập hàng đầu tháng' },
    { id: 'tx-012', date: monthDate(4, 7), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[4], weight: 2200, totalValue: 18700000, createdBy: staffNames[1] },
    { id: 'tx-013', date: monthDate(4, 14), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[2], weight: 2800, totalValue: 22400000, createdBy: staffNames[2] },
    { id: 'tx-014', date: monthDate(4, 20), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[5], weight: 1800, totalValue: 15300000, createdBy: staffNames[0] },
    { id: 'tx-015', date: monthDate(4, 26), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[1], weight: 2500, totalValue: 21250000, createdBy: staffNames[1] },

    { id: 'tx-016', date: monthDate(4, 9), type: TransactionType.PRODUCTION, weight: 5000, totalValue: 0, createdBy: staffNames[1], note: 'Xay cả ngày', materialName: 'Nhựa Phế Liệu' },
    { id: 'tx-017', date: monthDate(4, 18), type: TransactionType.PRODUCTION, weight: 4200, totalValue: 0, createdBy: staffNames[1], note: 'Xay lô lớn', materialName: 'Nhựa Phế Liệu' },

    { id: 'tx-018', date: monthDate(4, 11), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[0], weight: 3000, totalValue: 48000000, createdBy: staffNames[0] },
    { id: 'tx-019', date: monthDate(4, 22), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[2], weight: 2200, totalValue: 35200000, createdBy: staffNames[2] },
    { id: 'tx-020', date: monthDate(4, 28), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[3], weight: 1500, totalValue: 24000000, createdBy: staffNames[0] },

    { id: 'tx-021', date: monthDate(4, 5), type: TransactionType.EXPENSE, totalValue: 24000000, category: ExpenseCategory.LABOR, partnerName: 'Chi phí vận hành', note: 'Lương tháng 10', createdBy: staffNames[0] },
    { id: 'tx-022', date: monthDate(4, 15), type: TransactionType.EXPENSE, totalValue: 3200000, category: ExpenseCategory.OTHER, partnerName: 'Chi phí vận hành', note: 'Tiền điện + nước nhà kho', createdBy: staffNames[0] },

    // ════════════════════════════════════
    //  THÁNG 8 (3 tháng trước)
    // ════════════════════════════════════

    { id: 'tx-023', date: monthDate(3, 3), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[0], weight: 4000, totalValue: 34000000, createdBy: staffNames[0], note: 'Nhập lô lớn' },
    { id: 'tx-024', date: monthDate(3, 9), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[3], weight: 2500, totalValue: 21250000, createdBy: staffNames[2] },
    { id: 'tx-025', date: monthDate(3, 16), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[1], weight: 3200, totalValue: 27200000, createdBy: staffNames[1] },
    { id: 'tx-026', date: monthDate(3, 23), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[4], weight: 1800, totalValue: 15300000, createdBy: staffNames[0] },

    { id: 'tx-027', date: monthDate(3, 7), type: TransactionType.PRODUCTION, weight: 5500, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa tổng - ca sáng', materialName: 'Nhựa Phế Liệu' },
    { id: 'tx-028', date: monthDate(3, 17), type: TransactionType.PRODUCTION, weight: 4800, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa - ca chiều', materialName: 'Nhựa Phế Liệu' },

    { id: 'tx-029', date: monthDate(3, 10), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[1], weight: 3500, totalValue: 56000000, createdBy: staffNames[0], note: 'Xuất cho Đại Phát - lô tháng 11' },
    { id: 'tx-030', date: monthDate(3, 19), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[0], weight: 2800, totalValue: 44800000, createdBy: staffNames[2] },
    { id: 'tx-031', date: monthDate(3, 27), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[4], weight: 2000, totalValue: 32000000, createdBy: staffNames[0] },

    { id: 'tx-032', date: monthDate(3, 5), type: TransactionType.EXPENSE, totalValue: 25000000, category: ExpenseCategory.LABOR, partnerName: 'Chi phí vận hành', note: 'Lương tháng 11', createdBy: staffNames[0] },
    { id: 'tx-033', date: monthDate(3, 12), type: TransactionType.EXPENSE, totalValue: 12000000, category: ExpenseCategory.MACHINERY, partnerName: 'Chi phí vận hành', note: 'Thay dao máy xay + sửa motor', createdBy: staffNames[0] },
    { id: 'tx-034', date: monthDate(3, 25), type: TransactionType.EXPENSE, totalValue: 3500000, category: ExpenseCategory.OTHER, partnerName: 'Chi phí vận hành', note: 'Tiền điện tháng 11', createdBy: staffNames[0] },

    // ════════════════════════════════════
    //  THÁNG 9 (2 tháng trước)
    // ════════════════════════════════════

    { id: 'tx-035', date: monthDate(2, 2), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[0], weight: 3800, totalValue: 32300000, createdBy: staffNames[0] },
    { id: 'tx-036', date: monthDate(2, 6), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[2], weight: 2600, totalValue: 22100000, createdBy: staffNames[1] },
    { id: 'tx-037', date: monthDate(2, 12), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[5], weight: 3000, totalValue: 25500000, createdBy: staffNames[2] },
    { id: 'tx-038', date: monthDate(2, 18), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[1], weight: 2200, totalValue: 18700000, createdBy: staffNames[0] },
    { id: 'tx-039', date: monthDate(2, 25), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[3], weight: 1900, totalValue: 16150000, createdBy: staffNames[1] },

    { id: 'tx-040', date: monthDate(2, 8), type: TransactionType.PRODUCTION, weight: 6000, totalValue: 0, createdBy: staffNames[1], note: 'Xay lô lớn - cả ngày', materialName: 'Nhựa Phế Liệu' },
    { id: 'tx-041', date: monthDate(2, 19), type: TransactionType.PRODUCTION, weight: 5200, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa ca sáng + chiều', materialName: 'Nhựa Phế Liệu' },

    { id: 'tx-042', date: monthDate(2, 5), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[2], weight: 3200, totalValue: 51200000, createdBy: staffNames[0] },
    { id: 'tx-043', date: monthDate(2, 14), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[0], weight: 2800, totalValue: 44800000, createdBy: staffNames[2] },
    { id: 'tx-044', date: monthDate(2, 22), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[3], weight: 2000, totalValue: 32000000, createdBy: staffNames[0] },
    { id: 'tx-045', date: monthDate(2, 28), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[4], weight: 1500, totalValue: 24000000, createdBy: staffNames[0] },

    { id: 'tx-046', date: monthDate(2, 5), type: TransactionType.EXPENSE, totalValue: 26000000, category: ExpenseCategory.LABOR, partnerName: 'Chi phí vận hành', note: 'Lương tháng 12 + thưởng', createdBy: staffNames[0] },
    { id: 'tx-047', date: monthDate(2, 20), type: TransactionType.EXPENSE, totalValue: 4500000, category: ExpenseCategory.OTHER, partnerName: 'Chi phí vận hành', note: 'Tiền điện + nước + xăng xe', createdBy: staffNames[0] },
    { id: 'tx-048', date: monthDate(2, 15), type: TransactionType.EXPENSE, totalValue: 8000000, category: ExpenseCategory.MACHINERY, partnerName: 'Chi phí vận hành', note: 'Thay lưới lọc máy xay', createdBy: staffNames[0] },

    // ════════════════════════════════════
    //  THÁNG 10 (1 tháng trước)
    // ════════════════════════════════════

    { id: 'tx-049', date: monthDate(1, 2), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[0], weight: 4200, totalValue: 35700000, createdBy: staffNames[0], note: 'Nhập hàng đầu tháng 1' },
    { id: 'tx-050', date: monthDate(1, 5), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[2], weight: 3000, totalValue: 25500000, createdBy: staffNames[1] },
    { id: 'tx-051', date: monthDate(1, 10), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[1], weight: 2800, totalValue: 23800000, createdBy: staffNames[2] },
    { id: 'tx-052', date: monthDate(1, 16), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[4], weight: 2500, totalValue: 21250000, createdBy: staffNames[0] },
    { id: 'tx-053', date: monthDate(1, 22), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[3], weight: 3500, totalValue: 29750000, createdBy: staffNames[1] },
    { id: 'tx-054', date: monthDate(1, 28), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[5], weight: 1800, totalValue: 15300000, createdBy: staffNames[0] },

    { id: 'tx-055', date: monthDate(1, 7), type: TransactionType.PRODUCTION, weight: 6500, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa - cả ngày', materialName: 'Nhựa Phế Liệu' },
    { id: 'tx-056', date: monthDate(1, 15), type: TransactionType.PRODUCTION, weight: 5800, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa lô 2', materialName: 'Nhựa Phế Liệu' },
    { id: 'tx-057', date: monthDate(1, 24), type: TransactionType.PRODUCTION, weight: 4500, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa lô 3', materialName: 'Nhựa Phế Liệu' },

    { id: 'tx-058', date: monthDate(1, 4), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[0], weight: 3500, totalValue: 56000000, createdBy: staffNames[0], note: 'Xuất cho Song Long - hợp đồng tháng' },
    { id: 'tx-059', date: monthDate(1, 12), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[1], weight: 2800, totalValue: 44800000, createdBy: staffNames[2] },
    { id: 'tx-060', date: monthDate(1, 20), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[2], weight: 2200, totalValue: 35200000, createdBy: staffNames[0] },
    { id: 'tx-061', date: monthDate(1, 27), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[4], weight: 1800, totalValue: 28800000, createdBy: staffNames[0] },

    { id: 'tx-062', date: monthDate(1, 5), type: TransactionType.EXPENSE, totalValue: 25500000, category: ExpenseCategory.LABOR, partnerName: 'Chi phí vận hành', note: 'Lương tháng 1/2026', createdBy: staffNames[0] },
    { id: 'tx-063', date: monthDate(1, 10), type: TransactionType.EXPENSE, totalValue: 6500000, category: ExpenseCategory.MACHINERY, partnerName: 'Chi phí vận hành', note: 'Bảo dưỡng máy nghiền + thay dây curoa', createdBy: staffNames[0] },
    { id: 'tx-064', date: monthDate(1, 18), type: TransactionType.EXPENSE, totalValue: 3800000, category: ExpenseCategory.OTHER, partnerName: 'Chi phí vận hành', note: 'Tiền điện nhà kho tháng 1', createdBy: staffNames[0] },
    { id: 'tx-065', date: monthDate(1, 25), type: TransactionType.EXPENSE, totalValue: 2500000, category: ExpenseCategory.OTHER, partnerName: 'Chi phí vận hành', note: 'Xăng xe vận chuyển', createdBy: staffNames[0] },

    // ════════════════════════════════════
    //  THÁNG NÀY (tháng hiện tại)
    // ════════════════════════════════════

    { id: 'tx-066', date: daysAgo(7), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[0], weight: 3800, totalValue: 32300000, createdBy: staffNames[0], note: 'Nhập đầu tháng 2' },
    { id: 'tx-067', date: daysAgo(6), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[2], weight: 2500, totalValue: 21250000, createdBy: staffNames[1] },
    { id: 'tx-068', date: daysAgo(5), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[1], weight: 3000, totalValue: 25500000, createdBy: staffNames[2], note: 'Nhập lô từ Bình Chánh' },
    { id: 'tx-069', date: daysAgo(4), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[4], weight: 1800, totalValue: 15300000, createdBy: staffNames[0] },

    { id: 'tx-070', date: daysAgo(5), type: TransactionType.PRODUCTION, weight: 5500, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa - ca sáng + chiều', materialName: 'Nhựa Phế Liệu' },
    { id: 'tx-071', date: daysAgo(2), type: TransactionType.PRODUCTION, weight: 4000, totalValue: 0, createdBy: staffNames[1], note: 'Xay nhựa lô 2 tháng 2', materialName: 'Nhựa Phế Liệu' },

    { id: 'tx-072', date: daysAgo(4), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[0], weight: 3200, totalValue: 51200000, createdBy: staffNames[0], note: 'Xuất cho Song Long - lô đầu tháng' },
    { id: 'tx-073', date: daysAgo(3), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[2], weight: 2000, totalValue: 32000000, createdBy: staffNames[2] },
    { id: 'tx-074', date: daysAgo(1), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[1], weight: 1500, totalValue: 24000000, createdBy: staffNames[0], note: 'Xuất cho Đại Phát' },

    { id: 'tx-075', date: daysAgo(6), type: TransactionType.EXPENSE, totalValue: 26000000, category: ExpenseCategory.LABOR, partnerName: 'Chi phí vận hành', note: 'Lương tháng 2/2026', createdBy: staffNames[0] },
    { id: 'tx-076', date: daysAgo(3), type: TransactionType.EXPENSE, totalValue: 4200000, category: ExpenseCategory.OTHER, partnerName: 'Chi phí vận hành', note: 'Tiền điện + nước tháng 2', createdBy: staffNames[0] },
    { id: 'tx-077', date: daysAgo(2), type: TransactionType.EXPENSE, totalValue: 2800000, category: ExpenseCategory.MACHINERY, partnerName: 'Chi phí vận hành', note: 'Mua dầu nhớt + bảo trì máy', createdBy: staffNames[0] },
    { id: 'tx-078', date: daysAgo(1), type: TransactionType.EXPENSE, totalValue: 1500000, category: ExpenseCategory.OTHER, partnerName: 'Chi phí vận hành', note: 'Xăng xe chở hàng', createdBy: staffNames[0] },

    // — Giao dịch hôm nay —
    { id: 'tx-079', date: new Date().toISOString(), type: TransactionType.IMPORT, materialId: 'mat-1', materialName: 'Nhựa Phế Liệu', partnerName: suppliers[5], weight: 2200, totalValue: 18700000, createdBy: staffNames[0], note: 'Nhập hàng sáng nay' },
    { id: 'tx-080', date: new Date().toISOString(), type: TransactionType.EXPORT, materialId: 'mat-2', materialName: 'Bột Nhựa Tái Chế', partnerName: customers[3], weight: 1800, totalValue: 28800000, createdBy: staffNames[0], note: 'Xuất cho Hoàng Gia' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STAFF — Nhân Sự
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MockStaff {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'STAFF';
    phone: string;
    salaryBase: number;
    status: 'ACTIVE' | 'INACTIVE';
    joinedAt: string;
}

export const mockStaff: MockStaff[] = [
    {
        id: 'staff-1',
        email: 'admin@khophe.com',
        fullName: 'Nguyễn Thanh Nam',
        role: 'ADMIN',
        phone: '0901234567',
        salaryBase: 15000000,
        status: 'ACTIVE',
        joinedAt: '2023-06-01T00:00:00Z'
    },
    {
        id: 'staff-2',
        email: 'hung.tran@khophe.com',
        fullName: 'Trần Văn Hùng',
        role: 'STAFF',
        phone: '0912345678',
        salaryBase: 9000000,
        status: 'ACTIVE',
        joinedAt: '2024-01-15T00:00:00Z'
    },
    {
        id: 'staff-3',
        email: 'hoa.le@khophe.com',
        fullName: 'Lê Thị Hoa',
        role: 'STAFF',
        phone: '0923456789',
        salaryBase: 8500000,
        status: 'ACTIVE',
        joinedAt: '2024-03-10T00:00:00Z'
    },
    {
        id: 'staff-4',
        email: 'tuan.pham@khophe.com',
        fullName: 'Phạm Minh Tuấn',
        role: 'STAFF',
        phone: '0934567890',
        salaryBase: 8000000,
        status: 'INACTIVE',
        joinedAt: '2024-02-20T00:00:00Z'
    },
    {
        id: 'staff-5',
        email: 'dung.nguyen@khophe.com',
        fullName: 'Nguyễn Hoàng Dũng',
        role: 'STAFF',
        phone: '0945678901',
        salaryBase: 8500000,
        status: 'ACTIVE',
        joinedAt: '2024-06-01T00:00:00Z'
    },
    {
        id: 'staff-6',
        email: 'lan.vo@khophe.com',
        fullName: 'Võ Thị Lan',
        role: 'STAFF',
        phone: '0956789012',
        salaryBase: 7500000,
        status: 'ACTIVE',
        joinedAt: '2024-09-15T00:00:00Z'
    },
    {
        id: 'staff-7',
        email: 'bao.truong@khophe.com',
        fullName: 'Trương Quốc Bảo',
        role: 'STAFF',
        phone: '0967890123',
        salaryBase: 8000000,
        status: 'ACTIVE',
        joinedAt: '2025-01-05T00:00:00Z'
    }
];
