import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { authAPI } from '../lib/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    profile: any | null; // Expand type if needed
    loading: boolean;
    isAdmin: boolean;
    login: (email: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    login: async () => { },
    logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        async function loadUser() {
            try {
                const current = await authAPI.getCurrentUser();
                if (current) {
                    setUser(current.user);
                    setProfile(current.profile);
                }
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        }
        loadUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                // Reload profile on sign in
                if (event === 'SIGNED_IN') {
                    const current = await authAPI.getCurrentUser();
                    setProfile(current?.profile);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string) => {
        return authAPI.login(email);
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
        setProfile(null);
    };

    const isAdmin = profile?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
