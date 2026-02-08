import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { authAPI } from '../lib/api';
import { supabase } from '../lib/supabase';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
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
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user profile from public.users
    const loadProfile = async (authUser: User) => {
        try {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (data) {
                setProfile({
                    id: data.id,
                    email: data.email,
                    full_name: data.full_name || authUser.user_metadata?.full_name || authUser.email || '',
                    role: data.role || 'STAFF',
                });
            } else {
                // Fallback to user metadata
                setProfile({
                    id: authUser.id,
                    email: authUser.email || '',
                    full_name: authUser.user_metadata?.full_name || authUser.email || '',
                    role: 'STAFF',
                });
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    };

    // Initial auth check + listen for changes
    useEffect(() => {
        // 1. Check existing session
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    await loadProfile(session.user);
                }
            } catch (err) {
                console.error('Auth init error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // 2. Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user);
                    await loadProfile(session.user);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    setUser(session.user);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        const result = await authAPI.loginWithPassword(email, password);
        return result;
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setProfile(null);
        }
    };

    const isAdmin = profile?.role === 'ADMIN';

    const refreshProfile = async () => {
        if (user) {
            await loadProfile(user);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
