import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    const initDone = useRef(false);

    // Load user profile from public.users
    const loadProfile = async (authUser: User): Promise<UserProfile> => {
        const fallback: UserProfile = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.email || '',
            role: 'STAFF',
        };

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) {
                console.warn('[Auth] Profile query error:', error.message);
                return fallback;
            }

            if (data) {
                return {
                    id: data.id,
                    email: data.email,
                    full_name: data.full_name || fallback.full_name,
                    role: data.role || 'STAFF',
                };
            }
            return fallback;
        } catch (err) {
            console.error('[Auth] Profile load failed:', err);
            return fallback;
        }
    };

    // Initial auth check
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user && isMounted) {
                    setUser(session.user);
                    const p = await loadProfile(session.user);
                    if (isMounted) setProfile(p);
                }
            } catch (err) {
                console.error('[Auth] Init error:', err);
            } finally {
                if (isMounted) {
                    initDone.current = true;
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Listen for auth state changes AFTER init
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                // Skip INITIAL_SESSION — already handled by initAuth
                if (event === 'INITIAL_SESSION') return;

                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user);
                    // Only load profile if initAuth is done (prevents race condition)
                    if (initDone.current) {
                        const p = await loadProfile(session.user);
                        if (isMounted) setProfile(p);
                    }
                    if (isMounted) setLoading(false);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    if (isMounted) setLoading(false);
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    setUser(session.user);
                }
            }
        );

        return () => {
            isMounted = false;
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
            const p = await loadProfile(user);
            setProfile(p);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
