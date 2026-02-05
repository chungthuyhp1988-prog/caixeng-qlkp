import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { authAPI } from '../lib/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    profile: any | null; // Expand type if needed
    loading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    login: async () => { },
    logout: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial load - MOCK MODE BYPASS
    useEffect(() => {
        // Simulate Auth Check delay
        setTimeout(() => {
            console.log("MOCK AUTH: Auto-login as Admin");
            setUser({ id: 'mock-user-id', email: 'admin@khophe.com' } as any);
            setProfile({ role: 'ADMIN', full_name: 'Admin Mock' });
            setLoading(false);
        }, 500);
    }, []);

    const login = async (email: string, password: string) => {
        return authAPI.login(email, password);
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setProfile(null);
            localStorage.removeItem('sb-rawkygzlklltfsilhwsz-auth-token'); // Clear Supabase local storage if possible
        }
    };

    const isAdmin = profile?.role === 'ADMIN';

    const refreshProfile = async () => {
        try {
            const current = await authAPI.getCurrentUser();
            setProfile(current?.profile);
        } catch (e) {
            console.error("Error refreshing profile:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
