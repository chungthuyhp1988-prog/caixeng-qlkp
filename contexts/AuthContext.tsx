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
        let mounted = true;

        // Failsafe: Force stop loading after 5 seconds to prevent infinite spinner
        // This handles cases where Supabase might just hang due to network/config issues
        const timeoutId = setTimeout(() => {
            if (mounted) {
                console.warn("Auth check timed out - forcing loading false");
                setLoading(false);
            }
        }, 5000);

        async function loadUser() {
            try {
                const current = await authAPI.getCurrentUser();
                if (mounted && current) {
                    setUser(current.user);
                    setProfile(current.profile);
                }
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(timeoutId);
                }
            }
        }
        loadUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                // Reload profile on sign in
                if (event === 'SIGNED_IN') {
                    try {
                        const current = await authAPI.getCurrentUser();
                        if (mounted) setProfile(current?.profile);
                    } catch (e) {
                        console.error("Error fetching profile on signin:", e);
                    }
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            // Ensure loading is set to false when auth state settles
            setLoading(false);
            clearTimeout(timeoutId);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
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
