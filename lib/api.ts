import { Material, Partner, Transaction, MaterialType } from '../types';
import { mockMaterials, mockPartners, mockTransactions, mockUser } from './mockData';

// In-memory state (resets on reload)
let materials = [...mockMaterials];
let partners = [...mockPartners];
let transactions = [...mockTransactions];

const SIMULATED_DELAY = 600; // ms

// Helper to simulate network delay
const delay = () => new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));

export const materialsAPI = {
    getAll: async (): Promise<Material[]> => {
        await delay();
        return [...materials];
    },
    updateStock: async (id: string, newStock: number) => {
        await delay();
        materials = materials.map(m => m.id === id ? { ...m, stock: newStock } : m);
    }
};

export const partnersAPI = {
    getAll: async (): Promise<Partner[]> => {
        await delay();
        return [...partners];
    },
    create: async (partner: Omit<Partner, 'id' | 'totalVolume' | 'totalValue'>): Promise<Partner> => {
        await delay();
        const newPartner: Partner = {
            ...partner,
            id: `partner-${Date.now()}`,
            totalVolume: 0,
            totalValue: 0
        };
        partners.push(newPartner);
        return newPartner;
    },
    update: async (id: string, updates: Partial<Partner>) => {
        await delay();
        partners = partners.map(p => p.id === id ? { ...p, ...updates } : p);
    },
    delete: async (id: string) => {
        await delay();
        partners = partners.filter(p => p.id !== id);
    }
};

export const transactionsAPI = {
    getAll: async (): Promise<Transaction[]> => {
        await delay();
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    createImport: async (data: { materialCode: string, partnerName: string, weight: number, pricePerKg: number, note?: string }) => {
        await delay();
        const material = materials.find(m => m.code === data.materialCode);
        if (!material) throw new Error("Material not found");

        // Update Stock
        material.stock += data.weight;

        const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'IMPORT' as any,
            materialId: material.id,
            materialName: material.name,
            partnerName: data.partnerName,
            weight: data.weight,
            totalValue: data.weight * data.pricePerKg,
            note: data.note,
            createdBy: mockUser.id
        };
        transactions.unshift(newTx);
        return newTx;
    },

    createExport: async (data: { materialCode: string, partnerName: string, weight: number, pricePerKg: number, note?: string }) => {
        await delay();
        const material = materials.find(m => m.code === data.materialCode);
        if (!material) throw new Error("Material not found");

        if (material.stock < data.weight) throw new Error(`Not enough stock. Current: ${material.stock}kg`);

        // Update Stock
        material.stock -= data.weight;

        const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'EXPORT' as any,
            materialId: material.id,
            materialName: material.name,
            partnerName: data.partnerName,
            weight: data.weight,
            totalValue: data.weight * data.pricePerKg,
            note: data.note,
            createdBy: mockUser.id
        };
        transactions.unshift(newTx);
        return newTx;
    },

    createProduction: async (scrapWeight: number) => {
        await delay();
        const scrap = materials.find(m => m.type === MaterialType.SCRAP);
        const powder = materials.find(m => m.type === MaterialType.POWDER);

        if (!scrap || !powder) throw new Error("Materials setup error");
        if (scrap.stock < scrapWeight) throw new Error("Not enough scrap");

        // Logic: Consumes Scrap, Produces Powder (95% yield)
        scrap.stock -= scrapWeight;
        const powderWeight = scrapWeight * 0.95;
        powder.stock += powderWeight;

        const newTx: Transaction = {
            id: `tx-prod-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'PRODUCTION' as any,
            weight: scrapWeight,
            totalValue: 0,
            note: `Production: ${scrapWeight}kg Scrap -> ${powderWeight}kg Powder`,
            createdBy: mockUser.id
        };
        transactions.unshift(newTx);
        return newTx;
    },

    delete: async (id: string) => {
        await delay();
        transactions = transactions.filter(t => t.id !== id);
    },

    updateExpense: async (id: string, updates: any) => {
        await delay();
        transactions = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    }
};

export const authAPI = {
    login: async () => { await delay(); return { user: mockUser }; },
    logout: async () => { await delay(); },
    getCurrentUser: async () => { await delay(); return { user: mockUser, profile: mockUser }; }
};

export const staffAPI = {
    getAll: async () => { await delay(); return []; },
    update: async () => { await delay(); }
};
