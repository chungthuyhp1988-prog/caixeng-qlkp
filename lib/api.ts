import { supabase } from './supabase';
import { Material, Partner, Transaction, MaterialType, PartnerType, TransactionType, ExpenseCategory } from '../types';

// =====================================================
// MATERIALS API
// =====================================================

export const materialsAPI = {
    /**
     * Lấy tất cả materials
     */
    getAll: async (): Promise<Material[]> => {
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('type', { ascending: true });

        if (error) throw error;

        // Map database fields to frontend types
        return data.map(item => ({
            id: item.id,
            code: item.code,
            name: item.name,
            type: item.type as MaterialType,
            stock: Number(item.stock),
            unit: item.unit,
            pricePerKg: Number(item.price_per_kg)
        }));
    },

    /**
     * Cập nhật stock (dùng cho sản xuất thủ công)
     */
    updateStock: async (id: string, newStock: number) => {
        const { error } = await supabase
            .from('materials')
            .update({ stock: newStock })
            .eq('id', id);

        if (error) throw error;
    }
};

// =====================================================
// PARTNERS API
// =====================================================

export const partnersAPI = {
    /**
     * Lấy tất cả partners
     */
    getAll: async (): Promise<Partner[]> => {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type as PartnerType,
            phone: item.phone || '',
            address: item.address || '',
            totalVolume: Number(item.total_volume),
            totalValue: Number(item.total_value)
        }));
    },

    /**
     * Tạo partner mới
     */
    create: async (partner: {
        name: string;
        type: PartnerType;
        phone?: string;
        address?: string;
    }): Promise<Partner> => {
        const { data, error } = await supabase
            .from('partners')
            .insert([{
                name: partner.name,
                type: partner.type,
                phone: partner.phone || null,
                address: partner.address || null,
                total_volume: 0,
                total_value: 0
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            type: data.type as PartnerType,
            phone: data.phone || '',
            address: data.address || '',
            totalVolume: 0,
            totalValue: 0
        };
    },

    /**
     * Tìm partner theo tên
     */
    findByName: async (name: string): Promise<Partner | null> => {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .ilike('name', name)
            .single();

        if (error) return null;

        return {
            id: data.id,
            name: data.name,
            type: data.type as PartnerType,
            phone: data.phone || '',
            address: data.address || '',
            totalVolume: Number(data.total_volume),
            totalValue: Number(data.total_value)
        };
    },

    /**
     * Cập nhật partner
     */
    update: async (id: string, updates: {
        name?: string;
        type?: PartnerType;
        phone?: string;
        address?: string;
    }): Promise<void> => {
        const { error } = await supabase
            .from('partners')
            .update({
                name: updates.name,
                type: updates.type,
                phone: updates.phone,
                address: updates.address
            })
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Xóa partner
     */
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('partners')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// =====================================================
// TRANSACTIONS API
// =====================================================

export const transactionsAPI = {
    /**
     * Lấy tất cả transactions với join materials & partners
     */
    getAll: async (): Promise<Transaction[]> => {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
        id,
        transaction_date,
        type,
        material_id,
        partner_id,
        weight,
        total_value,
        category,
        note,
        materials (name),
        partners (name)
      `)
            .order('transaction_date', { ascending: false });

        if (error) throw error;

        return data.map(item => ({
            id: item.id,
            date: item.transaction_date,
            type: item.type as TransactionType,
            materialId: item.material_id,
            materialName: item.materials?.name || undefined,
            partnerName: item.partners?.name || undefined,
            weight: item.weight ? Number(item.weight) : undefined,
            totalValue: Number(item.total_value),
            category: item.category as ExpenseCategory | undefined,
            note: item.note || undefined
        }));
    },

    /**
     * Tạo transaction mới (IMPORT)
     */
    createImport: async (params: {
        materialCode: string;
        partnerName: string;
        weight: number;
        pricePerKg: number;
    }) => {
        // Get material ID
        const { data: material } = await supabase
            .from('materials')
            .select('id')
            .eq('code', params.materialCode)
            .single();

        if (!material) throw new Error('Material not found');

        // Get or create partner
        let partner = await partnersAPI.findByName(params.partnerName);
        if (!partner) {
            partner = await partnersAPI.create({
                name: params.partnerName,
                type: PartnerType.SUPPLIER
            });
        }

        // Create transaction
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                type: 'IMPORT',
                material_id: material.id,
                partner_id: partner.id,
                weight: params.weight,
                total_value: params.weight * params.pricePerKg,
                category: 'MATERIAL'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Tạo transaction mới (EXPORT)
     */
    createExport: async (params: {
        materialCode: string;
        partnerName: string;
        weight: number;
        pricePerKg: number;
    }) => {
        // Get material ID
        const { data: material } = await supabase
            .from('materials')
            .select('id')
            .eq('code', params.materialCode)
            .single();

        if (!material) throw new Error('Material not found');

        // Get or create partner
        let partner = await partnersAPI.findByName(params.partnerName);
        if (!partner) {
            partner = await partnersAPI.create({
                name: params.partnerName,
                type: PartnerType.CUSTOMER
            });
        }

        // Create transaction
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                type: 'EXPORT',
                material_id: material.id,
                partner_id: partner.id,
                weight: params.weight,
                total_value: params.weight * params.pricePerKg
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Tạo transaction EXPENSE
     */
    createExpense: async (params: {
        category: ExpenseCategory;
        totalValue: number;
        note?: string;
        date?: string;
    }) => {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                type: 'EXPENSE',
                transaction_date: params.date || new Date().toISOString(),
                total_value: params.totalValue,
                category: params.category,
                note: params.note
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Tạo transaction PRODUCTION
     */
    createProduction: async (scrapWeight: number) => {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                type: 'PRODUCTION',
                weight: scrapWeight,
                total_value: 0, // Cost is already accounted in Import
                note: `Sản xuất ${scrapWeight}kg phế → ${scrapWeight * 0.95}kg bột`
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Xóa transaction
     */
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Cập nhật transaction (cho expense)
     */
    updateExpense: async (id: string, updates: {
        category?: ExpenseCategory;
        totalValue?: number;
        note?: string;
    }): Promise<void> => {
        const { error } = await supabase
            .from('transactions')
            .update({
                category: updates.category,
                total_value: updates.totalValue,
                note: updates.note
            })
            .eq('id', id);

        if (error) throw error;
    }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        const { error } = await supabase.from('materials').select('count').single();
        return !error;
    } catch {
        return false;
    }
};
