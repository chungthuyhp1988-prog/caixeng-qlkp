/**
 * QA.QLKP - Real Supabase API Layer
 * Replaces mock data with actual Supabase SDK calls
 */

import { supabase } from './supabase';
import { Material, MaterialType, Partner, PartnerType, Transaction, TransactionType, ExpenseCategory } from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS: DB ↔ Frontend type mapping
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DbMaterial {
    id: string;
    code: string;
    name: string;
    type: string;
    stock: number;
    unit: string;
    price_per_kg: number;
}

interface DbPartner {
    id: string;
    name: string;
    type: string;
    phone: string;
    address: string | null;
    total_volume: number;
    total_value: number;
}

interface DbTransaction {
    id: string;
    transaction_date: string;
    type: string;
    material_id: string | null;
    partner_id: string | null;
    weight: number | null;
    total_value: number;
    category: string | null;
    note: string | null;
    created_by: string | null;
    materials?: { name: string; code: string } | null;
    partners?: { name: string } | null;
    users?: { full_name: string } | null;
}

interface DbUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    phone: string | null;
    salary_base: number;
    status: string;
    joined_at: string;
}

function mapMaterial(db: DbMaterial): Material {
    return {
        id: db.id,
        code: db.code,
        name: db.name,
        type: db.type as MaterialType,
        stock: Number(db.stock),
        unit: db.unit,
        pricePerKg: Number(db.price_per_kg),
    };
}

function mapPartner(db: DbPartner): Partner {
    return {
        id: db.id,
        name: db.name,
        type: db.type as PartnerType,
        phone: db.phone || '',
        address: db.address || undefined,
        totalVolume: Number(db.total_volume),
        totalValue: Number(db.total_value),
    };
}

function mapTransaction(db: DbTransaction): Transaction {
    return {
        id: db.id,
        date: db.transaction_date,
        type: db.type as TransactionType,
        materialId: db.material_id || undefined,
        materialName: db.materials?.name || undefined,
        partnerName: db.partners?.name || undefined,
        weight: db.weight != null ? Number(db.weight) : undefined,
        totalValue: Number(db.total_value),
        category: db.category as ExpenseCategory | undefined,
        note: db.note || undefined,
        createdBy: db.users?.full_name || undefined,
    };
}

export interface Staff {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'STAFF';
    phone: string;
    salaryBase: number;
    status: 'ACTIVE' | 'INACTIVE';
    joinedAt: string;
}

function mapStaff(db: DbUser): Staff {
    return {
        id: db.id,
        email: db.email,
        fullName: db.full_name,
        role: db.role as 'ADMIN' | 'STAFF',
        phone: db.phone || '',
        salaryBase: Number(db.salary_base),
        status: db.status as 'ACTIVE' | 'INACTIVE',
        joinedAt: db.joined_at,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MATERIALS API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const materialsAPI = {
    getAll: async (): Promise<Material[]> => {
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('type', { ascending: true });
        if (error) throw new Error(`Lỗi tải vật liệu: ${error.message}`);
        return (data || []).map(mapMaterial);
    },

    create: async (material: Omit<Material, 'id'>): Promise<Material> => {
        const { data, error } = await supabase
            .from('materials')
            .insert({
                code: material.code,
                name: material.name,
                type: material.type,
                stock: material.stock,
                unit: material.unit,
                price_per_kg: material.pricePerKg,
            })
            .select()
            .single();
        if (error) throw new Error(`Lỗi tạo vật liệu: ${error.message}`);
        return mapMaterial(data);
    },

    update: async (id: string, updates: Partial<Material>): Promise<Material> => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.code !== undefined) dbUpdates.code = updates.code;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
        if (updates.pricePerKg !== undefined) dbUpdates.price_per_kg = updates.pricePerKg;

        const { data, error } = await supabase
            .from('materials')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(`Lỗi cập nhật vật liệu: ${error.message}`);
        return mapMaterial(data);
    },

    updateStock: async (id: string, newStock: number) => {
        const { error } = await supabase
            .from('materials')
            .update({ stock: newStock })
            .eq('id', id);
        if (error) throw new Error(`Lỗi cập nhật tồn kho: ${error.message}`);
    },

    delete: async (id: string): Promise<void> => {
        // Check if material has transactions first
        const { count } = await supabase
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .eq('material_id', id);

        if (count && count > 0) {
            throw new Error('Không thể xóa vật liệu đã có giao dịch. Hãy xóa các giao dịch liên quan trước.');
        }

        const { error } = await supabase
            .from('materials')
            .delete()
            .eq('id', id);
        if (error) throw new Error(`Lỗi xóa vật liệu: ${error.message}`);
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARTNERS API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const partnersAPI = {
    getAll: async (): Promise<Partner[]> => {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw new Error(`Lỗi tải đối tác: ${error.message}`);
        return (data || []).map(mapPartner);
    },

    create: async (partner: Omit<Partner, 'id' | 'totalVolume' | 'totalValue'>): Promise<Partner> => {
        const { data, error } = await supabase
            .from('partners')
            .insert({
                name: partner.name,
                type: partner.type,
                phone: partner.phone,
                address: partner.address || null,
            })
            .select()
            .single();
        if (error) throw new Error(`Lỗi tạo đối tác: ${error.message}`);
        return mapPartner(data);
    },

    update: async (id: string, updates: Partial<Partner>) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.address !== undefined) dbUpdates.address = updates.address;

        const { error } = await supabase
            .from('partners')
            .update(dbUpdates)
            .eq('id', id);
        if (error) throw new Error(`Lỗi cập nhật đối tác: ${error.message}`);
    },

    delete: async (id: string) => {
        const { error } = await supabase
            .from('partners')
            .delete()
            .eq('id', id);
        if (error) throw new Error(`Lỗi xóa đối tác: ${error.message}`);
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRANSACTIONS API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const transactionsAPI = {
    getAll: async (): Promise<Transaction[]> => {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                materials (name, code),
                partners (name),
                users:created_by (full_name)
            `)
            .order('transaction_date', { ascending: false });
        if (error) throw new Error(`Lỗi tải giao dịch: ${error.message}`);
        return (data || []).map(mapTransaction);
    },

    createImport: async (data: {
        materialCode: string;
        partnerName: string;
        weight: number;
        pricePerKg: number;
        note?: string;
    }) => {
        // Get material and partner IDs
        const { data: material } = await supabase
            .from('materials')
            .select('id')
            .eq('code', data.materialCode)
            .single();
        if (!material) throw new Error('Không tìm thấy vật liệu');

        const { data: partner } = await supabase
            .from('partners')
            .select('id')
            .eq('name', data.partnerName)
            .single();

        // Use RPC for atomic operation
        const { data: result, error } = await supabase.rpc('create_transaction_import', {
            p_material_id: material.id,
            p_partner_id: partner?.id || null,
            p_weight: data.weight,
            p_total_value: data.weight * data.pricePerKg,
            p_date: new Date().toISOString(),
            p_note: data.note || null,
            p_created_by: null, // Let trigger handle it via auth.uid()
        });
        if (error) throw new Error(`Lỗi tạo phiếu nhập: ${error.message}`);
        return result;
    },

    createExport: async (data: {
        materialCode: string;
        partnerName: string;
        weight: number;
        pricePerKg: number;
        note?: string;
    }) => {
        const { data: material } = await supabase
            .from('materials')
            .select('id')
            .eq('code', data.materialCode)
            .single();
        if (!material) throw new Error('Không tìm thấy vật liệu');

        const { data: partner } = await supabase
            .from('partners')
            .select('id')
            .eq('name', data.partnerName)
            .single();

        const { data: result, error } = await supabase.rpc('create_transaction_export', {
            p_material_id: material.id,
            p_partner_id: partner?.id || null,
            p_weight: data.weight,
            p_total_value: data.weight * data.pricePerKg,
            p_date: new Date().toISOString(),
            p_note: data.note || null,
            p_created_by: null,
        });
        if (error) throw new Error(`Lỗi tạo phiếu xuất: ${error.message}`);
        return result;
    },

    createProduction: async (scrapWeight: number) => {
        const { data: result, error } = await supabase.rpc('create_transaction_production', {
            p_weight_scrap: scrapWeight,
            p_date: new Date().toISOString(),
            p_note: `Sản xuất: ${scrapWeight}kg Nhựa Phế → ${(scrapWeight * 0.95).toFixed(0)}kg Bột Nhựa`,
            p_created_by: null,
        });
        if (error) throw new Error(`Lỗi tạo phiếu sản xuất: ${error.message}`);
        return result;
    },

    // Create expense transaction (direct insert, no RPC needed)
    createExpense: async (data: {
        totalValue: number;
        category: ExpenseCategory;
        note?: string;
    }) => {
        const { data: result, error } = await supabase
            .from('transactions')
            .insert({
                type: 'EXPENSE',
                total_value: data.totalValue,
                category: data.category,
                note: data.note || null,
                transaction_date: new Date().toISOString(),
            })
            .select()
            .single();
        if (error) throw new Error(`Lỗi tạo chi phí: ${error.message}`);
        return mapTransaction(result);
    },

    update: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.date !== undefined) dbUpdates.transaction_date = updates.date;
        if (updates.totalValue !== undefined) dbUpdates.total_value = updates.totalValue;
        if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.note !== undefined) dbUpdates.note = updates.note;

        const { data, error } = await supabase
            .from('transactions')
            .update(dbUpdates)
            .eq('id', id)
            .select(`
                *,
                materials (name, code),
                partners (name),
                users:created_by (full_name)
            `)
            .single();
        if (error) throw new Error(`Lỗi cập nhật giao dịch: ${error.message}`);
        return mapTransaction(data);
    },

    delete: async (id: string) => {
        // Use RPC for safe delete (handles stock rollback)
        const { error } = await supabase.rpc('delete_transaction', {
            p_transaction_id: id,
        });
        if (error) throw new Error(`Lỗi xóa giao dịch: ${error.message}`);
    },

    // Backward compat alias
    updateExpense: async (id: string, updates: Partial<Transaction>) => {
        return transactionsAPI.update(id, updates);
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const authAPI = {
    login: async () => {
        // For backward compat, try to get current session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Chưa đăng nhập');
        return { user };
    },

    loginWithPassword: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw new Error(`Lỗi đăng nhập: ${error.message}`);

        // Get profile from public.users
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return {
            user: {
                id: data.user.id,
                email: data.user.email || '',
                full_name: profile?.full_name || data.user.user_metadata?.full_name || data.user.email || '',
                role: profile?.role || 'STAFF',
            },
        };
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(`Lỗi đăng xuất: ${error.message}`);
    },

    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { user: null, profile: null };

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        const mappedUser = {
            id: user.id,
            email: user.email || '',
            full_name: profile?.full_name || user.user_metadata?.full_name || user.email || '',
            role: profile?.role || 'STAFF',
        };

        return { user: mappedUser, profile: mappedUser };
    },

    changePassword: async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error) throw new Error(`Lỗi đổi mật khẩu: ${error.message}`);
    },

    onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STAFF API (Users / Personnel)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const staffAPI = {
    getAll: async (): Promise<Staff[]> => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('full_name', { ascending: true });
        if (error) throw new Error(`Lỗi tải nhân sự: ${error.message}`);
        return (data || []).map(mapStaff);
    },

    create: async (staff: Omit<Staff, 'id'> & { password?: string }): Promise<Staff> => {
        // Use RPC to create auth user + public profile atomically
        const phone = staff.phone || staff.email.replace('@qlkp.com', '');
        const password = staff.password || '123456'; // Default password

        const { data, error } = await supabase.rpc('admin_create_user', {
            p_phone: phone,
            p_password: password,
            p_full_name: staff.fullName,
            p_role: staff.role,
            p_salary_base: staff.salaryBase,
        });
        if (error) throw new Error(`Lỗi tạo nhân sự: ${error.message}`);

        // Return the created staff
        return {
            id: data.id,
            email: data.email,
            fullName: staff.fullName,
            role: staff.role,
            phone: phone,
            salaryBase: staff.salaryBase,
            status: 'ACTIVE',
            joinedAt: new Date().toISOString(),
        };
    },

    update: async (id: string, updates: Partial<Staff>): Promise<Staff> => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.salaryBase !== undefined) dbUpdates.salary_base = updates.salaryBase;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.email !== undefined) dbUpdates.email = updates.email;

        const { data, error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(`Lỗi cập nhật nhân sự: ${error.message}`);
        return mapStaff(data);
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        if (error) throw new Error(`Lỗi xóa nhân sự: ${error.message}`);
    },
};
