/**
 * QA.QLKP - API Layer
 * Re-exports from real Supabase API
 * 
 * Previously: Mock data (in-memory arrays)
 * Now: Real Supabase SDK calls
 */

export { materialsAPI, partnersAPI, transactionsAPI, authAPI, staffAPI } from './supabaseApi';
export type { Staff } from './supabaseApi';
