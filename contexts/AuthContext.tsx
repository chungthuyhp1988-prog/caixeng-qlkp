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

    // Initial load
    useEffect(() => {
        let mounted = true;

        // Failsafe: Force stop loading after 5 seconds
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth check timed out - forcing loading false");
                setLoading(false);
            }
        }, 5000);

        async function initAuth() {
            try {
                // 1. Get session from storage first
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                if (mounted) {
                    if (session?.user) {
                        console.log("Session restored:", session.user.email);
                        setUser(session.user);

                        // Fetch profile
                        try {
                            const current = await authAPI.getCurrentUser();
                            if (mounted && current) {
                                setProfile(current.profile);
                            }
                        } catch (profileError) {
                            console.error("Error fetching profile during init:", profileError);
                        }
                    } else {
                        console.log("No active session found.");
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(timeoutId);
                }
            }
        }

        initAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state change:", event);
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    try {
                        const current = await authAPI.getCurrentUser();
                        if (mounted) setProfile(current?.profile);
                    } catch (e) {
                        console.error("Error fetching profile on auth change:", e);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
            }

            // Ensure loading is done
            setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
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
