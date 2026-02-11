import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

type UserRole = 'admin' | 'user' | 'guest';

interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    profile?: UserProfile;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchAndSyncProfile(session.user);
            }
            setLoading(false);
        };

        initAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await fetchAndSyncProfile(session.user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchAndSyncProfile = async (supabaseUser: SupabaseUser) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (error || !profile) {
            console.error('Profile sync failed or missing:', error);
            // Default fallback if profile is missing for some reason
            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                username: supabaseUser.user_metadata?.username || 'Combatant',
                role: 'user'
            });
            return;
        }

        setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            username: profile.username,
            role: profile.role as UserRole,
            profile: {
                id: profile.id,
                username: profile.username,
                wins: profile.wins,
                losses: profile.losses,
                tournamentsPlayed: 0, // Calculated later
                rating: profile.rating || 1000,
                rank: profile.rank || 'Unranked',
                achievements: profile.achievements || [],
                rivalsLevel: profile.rivals_level,
                avatarUrl: profile.avatar_url
            }
        });
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, username: string) => {
        // 1. Sign up user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });

        if (error) return { error };

        // 2. Profile creation is handled by Supabase trigger potentially, 
        // but for now let's ensure it exists in the profiles table if trigger isn't setup.
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                username: username,
                role: 'user'
            });
            if (profileError) console.error('Error creating profile:', profileError);
        }

        return { error: null, data };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            signOut,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
