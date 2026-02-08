import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const playerServiceSupabase = {
    getAll: async (): Promise<UserProfile[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('wins', { ascending: false });

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }

        return data.map(p => ({
            id: p.id,
            username: p.username,
            stats: {
                wins: p.wins,
                losses: p.losses,
                tournamentsPlayed: 0 // Need to join to get this in real DB
            },
            rivalsLevel: p.rivals_level,
            role: p.role as 'admin' | 'user'
        }));
    },

    getByName: async (username: string): Promise<UserProfile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', username)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            username: data.username,
            stats: {
                wins: data.wins,
                losses: data.losses,
                tournamentsPlayed: 0
            },
            rivalsLevel: data.rivals_level,
            role: data.role as 'admin' | 'user'
        };
    },

    createOrUpdateProfile: async (username: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
        // Check if exists
        const existing = await playerServiceSupabase.getByName(username);

        if (existing) {
            // Update
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    rivals_level: updates.rivalsLevel,
                    // Add other fields as needed
                })
                .eq('username', username)
                .select()
                .single();

            if (error) {
                console.error(error);
                return null;
            }
            return existing; // Return updated object (mapped)
        } else {
            // Create - Note: In real app, this happens on Auth Sign Up
            // Here we are "simulating" profile creation
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    username: username,
                    rivals_level: updates.rivalsLevel || 1,
                    role: 'user'
                })
                .select()
                .single();

            if (error) {
                console.error(error);
                return null;
            }

            return {
                id: data.id,
                username: data.username,
                stats: { wins: 0, losses: 0, tournamentsPlayed: 0 },
                rivalsLevel: data.rivals_level,
                role: 'user'
            };
        }
    }
};
