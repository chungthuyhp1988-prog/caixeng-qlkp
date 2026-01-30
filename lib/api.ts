import { supabase } from './supabase';
import { Material, Partner, Transaction, MaterialType, PartnerType, TransactionType, ExpenseCategory } from '../types';

// =====================================================
// MATERIALS API
// =====================================================

// Helper for timeout
const withTimeout = <T>(promise: PromiseLike<T>, ms: number = 8000): Promise<T> => {
    return Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
        )
    ]);
};

export const materialsAPI = {
    /**
     * Lấy tất cả materials
     */
    getAll: async (): Promise<Material[]> => {
        console.log("API: materialsAPI.getAll called");
        try {
            const { data, error } = await withTimeout(supabase
                .from('materials')
                .select('*')
                .order('type', { ascending: true })) as any; // Cast to any to avoid strict type checks on PostgrestResponse vs Promise

            if (error) {
                console.error("API: materialsAPI.getAll error", error);
                throw error;
            }

            console.log("API: materialsAPI.getAll success", data?.length);
            // Map database fields to frontend types
            return (data || []).map((item: any) => ({
                id: item.id,
                code: item.code,
                name: item.name,
                type: item.type as MaterialType,
                stock: Number(item.stock),
                unit: item.unit,
                pricePerKg: Number(item.price_per_kg)
            }));
        } catch (err) {
            console.error("API: materialsAPI.getAll EXCEPTION", err);
            throw err;
        }
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
        console.log("API: partnersAPI.getAll called");
        try {
            const { data, error } = await withTimeout(supabase
                .from('partners')
                .select('*')
                .order('created_at', { ascending: false })) as any;

            if (error) {
                console.error("API: partnersAPI.getAll error", error);
                throw error;
            }

            console.log("API: partnersAPI.getAll success", data?.length);

            return (data || []).map((item: any) => ({
                id: item.id,
                name: item.name,
                type: item.type as PartnerType,
                phone: item.phone || '',
                address: item.address || '',
                totalVolume: Number(item.total_volume),
                totalValue: Number(item.total_value)
            }));
        } catch (err) {
            console.error("API: partnersAPI.getAll EXCEPTION", err);
            throw err;
        }
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
        console.log('API: partnersAPI.findByName called with:', name);
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .ilike('name', name)
            .maybeSingle();

        if (error || !data) {
            console.log('API: partnersAPI.findByName not found or error:', error?.message);
            return null;
        }

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
    /**
     * Lấy tất cả transactions với join materials, partners & users (người tạo)
     */
    getAll: async (): Promise<Transaction[]> => {
        console.log("API: transactionsAPI.getAll called");
        try {
            const { data, error } = await withTimeout(supabase
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
            created_by,
            materials (name),
            partners (name),
            users (full_name, email)
          `)
                .order('transaction_date', { ascending: false })) as any;

            if (error) {
                console.error("API: transactionsAPI.getAll error", error);
                throw error;
            }

            console.log("API: transactionsAPI.getAll success", data?.length);

            return (data || []).map((item: any) => ({
                id: item.id,
                date: item.transaction_date,
                type: item.type as TransactionType,
                materialId: item.material_id,
                materialName: item.materials?.name || undefined,
                partnerName: item.partners?.name || undefined,
                weight: item.weight ? Number(item.weight) : undefined,
                totalValue: Number(item.total_value),
                category: item.category as ExpenseCategory | undefined,
                note: item.note || undefined,
                createdBy: item.users?.full_name || item.users?.email || 'Hệ thống'
            }));
        } catch (err) {
            console.error("API: transactionsAPI.getAll EXCEPTION", err);
            throw err;
        }
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
        console.log('API: transactionsAPI.createImport called with:', params);
        try {
            // Get material ID
            const { data: material, error: materialError } = await supabase
                .from('materials')
                .select('id')
                .eq('code', params.materialCode)
                .single();

            if (materialError || !material) {
                console.error('API: createImport - Material not found:', materialError?.message);
                throw new Error('Không tìm thấy loại nguyên liệu');
            }
            console.log('API: createImport - Material found:', material.id);

            // Get or create partner
            let partner = await partnersAPI.findByName(params.partnerName);
            if (!partner) {
                console.log('API: createImport - Creating new partner:', params.partnerName);
                partner = await partnersAPI.create({
                    name: params.partnerName,
                    type: PartnerType.SUPPLIER
                });
            }
            console.log('API: createImport - Partner ID:', partner.id);

            // Create transaction
            const insertData = {
                type: 'IMPORT',
                material_id: material.id,
                partner_id: partner.id,
                weight: params.weight,
                total_value: params.weight * params.pricePerKg,
                category: 'MATERIAL',
                transaction_date: new Date().toISOString()
            };
            console.log('API: createImport - Insert data:', insertData);

            const { data, error } = await supabase
                .from('transactions')
                .insert([insertData])
                .select()
                .single();

            if (error) {
                console.error('API: createImport - Insert error:', error);
                throw error;
            }
            console.log('API: createImport - Success:', data.id);
            return data;
        } catch (err: any) {
            console.error('API: createImport - Exception:', err);
            throw new Error(err.message || 'Không thể thực hiện nhập kho');
        }
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
        console.log('API: transactionsAPI.createExport called with:', params);
        try {
            // Get material ID
            const { data: material, error: materialError } = await supabase
                .from('materials')
                .select('id')
                .eq('code', params.materialCode)
                .single();

            if (materialError || !material) {
                console.error('API: createExport - Material not found:', materialError?.message);
                throw new Error('Không tìm thấy loại thành phẩm');
            }
            console.log('API: createExport - Material found:', material.id);

            // Get or create partner
            let partner = await partnersAPI.findByName(params.partnerName);
            if (!partner) {
                console.log('API: createExport - Creating new partner:', params.partnerName);
                partner = await partnersAPI.create({
                    name: params.partnerName,
                    type: PartnerType.CUSTOMER
                });
            }
            console.log('API: createExport - Partner ID:', partner.id);

            // Create transaction
            const insertData = {
                type: 'EXPORT',
                material_id: material.id,
                partner_id: partner.id,
                weight: params.weight,
                total_value: params.weight * params.pricePerKg,
                transaction_date: new Date().toISOString()
            };
            console.log('API: createExport - Insert data:', insertData);

            const { data, error } = await supabase
                .from('transactions')
                .insert([insertData])
                .select()
                .single();

            if (error) {
                console.error('API: createExport - Insert error:', error);
                throw error;
            }
            console.log('API: createExport - Success:', data.id);
            return data;
        } catch (err: any) {
            console.error('API: createExport - Exception:', err);
            throw new Error(err.message || 'Không thể thực hiện xuất kho');
        }
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
// AUTH API
// =====================================================

export const authAPI = {
    /**
     * Đăng nhập
     */
    login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    loginWithPassword: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    /**
     * Đăng xuất
     */
    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Lấy user hiện tại & profile
     */
    getCurrentUser: async () => {
        // Use getSession() which properly restores session from localStorage
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const user = session.user;
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        return { user, profile };
    }
};

// =====================================================
// STAFF API
// =====================================================

export const staffAPI = {
    /**
     * Lấy danh sách nhân viên
     */
    getAll: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('joined_at', { ascending: false });

        if (error) throw error;
        return data.map(u => ({
            id: u.id,
            email: u.email,
            fullName: u.full_name,
            role: u.role,
            phone: u.phone,
            salaryBase: Number(u.salary_base),
            status: u.status,
            joinedAt: u.joined_at
        }));
    },

    /**
     * Cập nhật nhân viên
     */
    update: async (id: string, updates: any) => {
        const { error } = await supabase
            .from('users')
            .update({
                full_name: updates.fullName,
                phone: updates.phone,
                salary_base: updates.salaryBase,
                role: updates.role,
                status: updates.status
            })
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Tạo invite nhân viên (Create Auth User + Profile)
     * Note: Creating Auth User requires Admin Service Role or Invite API (if SMTP setup).
     * For now, we'll assume Admin creates 'fake' users or invites via Supabase UI.
     * This function only creates the profile if auth user exists (handled by trigger handle_new_user)
     * OR we can use supabase administrative client (not available here in key).
     * 
     * Alternative: Use Supabase Invite API if email enabled.
     */
    createInvite: async (email: string) => {
        // This is tricky without Admin key.
        // Option 1: Just return logic to tell Admin to use Dashboard
        // Option 2: Use signInWithOtp to "create" user? No.

        // For development purpose, we assume user is created in Dashboard first.
        return true;
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
