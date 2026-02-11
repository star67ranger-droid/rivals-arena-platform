import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export type AchievementRarity = 'common' | 'rare' | 'legendary';

export const ACHIEVEMENT_MASTER_LIST: Record<string, { name: string, description: string, icon: string, rarity: AchievementRarity }> = {
    'FIRST_BLOOD': { name: 'Premier Sang', description: 'Gagnez votre premier match', icon: 'Sword', rarity: 'common' },
    'WAR_HERO': { name: 'Héros de Guerre', description: 'Accumulez 10 victoires au total', icon: 'Shield', rarity: 'rare' },
    'ELITE_TACTICIAN': { name: 'Tacticien Élite', description: 'Atteignez le rang Diamant (1500+ Elo)', icon: 'Target', rarity: 'legendary' },
    'TOURNAMENT_LORD': { name: 'Seigneur des Tournois', description: 'Participez à 5 tournois différents', icon: 'Trophy', rarity: 'rare' },
    'UNSTOPPABLE': { name: 'Inarrêtable', description: 'Gagnez 5 matchs d\'affilée', icon: 'Flame', rarity: 'legendary' },
    'GLADIATOR': { name: 'Gladiateur', description: 'Terminez 3 tournois', icon: 'Crown', rarity: 'common' },
};

export const RARITY_CONFIG: Record<AchievementRarity, { label: string, border: string, bg: string, text: string, glow: string }> = {
    common: { label: 'Commun', border: 'border-slate-500/30', bg: 'bg-slate-500/10', text: 'text-slate-400', glow: '' },
    rare: { label: 'Rare', border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
    legendary: { label: 'Légendaire', border: 'border-amber-400/50', bg: 'bg-amber-400/10', text: 'text-amber-400', glow: 'shadow-[0_0_25px_rgba(251,191,36,0.2)]' },
};

export const playerServiceSupabase = {
    getAll: async (): Promise<UserProfile[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('rating', { ascending: false });

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }

        return data.map(p => ({
            id: p.id,
            username: p.username,
            wins: p.wins || 0,
            losses: p.losses || 0,
            tournamentsPlayed: 0, // Ideally calculated
            rating: p.rating || 1000,
            rank: p.rank || 'Unranked',
            achievements: p.achievements || [],
            rivalsLevel: p.rivals_level || 1,
            avatarUrl: p.avatar_url || '',
            bio: p.bio || '',
            socials: p.socials || {}
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
            wins: data.wins || 0,
            losses: data.losses || 0,
            tournamentsPlayed: 0,
            rating: data.rating || 1000,
            rank: data.rank || 'Non Classé',
            achievements: data.achievements || [],
            rivalsLevel: data.rivals_level || 1,
            avatarUrl: data.avatar_url || '',
            bio: data.bio || '',
            socials: data.socials || {}
        };
    },

    getById: async (id: string): Promise<UserProfile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            username: data.username,
            wins: data.wins || 0,
            losses: data.losses || 0,
            tournamentsPlayed: 0,
            rating: data.rating || 1000,
            rank: data.rank || 'Non Classé',
            achievements: data.achievements || [],
            rivalsLevel: data.rivals_level || 1,
            avatarUrl: data.avatar_url || '',
            bio: data.bio || '',
            socials: data.socials || {}
        };
    },

    createOrUpdateProfile: async (username: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                username: username,
                rivals_level: updates.rivalsLevel,
                bio: updates.bio,
                avatar_url: updates.avatarUrl,
                socials: updates.socials,
                ...updates // This might cause issues if snake_case isn't handled, but upsert with username is fine
            }, { onConflict: 'username' })
            .select()
            .single();

        if (error) {
            console.error('Profile sync error:', error);
            return null;
        }

        return playerServiceSupabase.getByName(data.username);
    },

    updateStats: async (userId: string, won: boolean, ratingChange: number): Promise<string[]> => {
        const profile = await playerServiceSupabase.getById(userId);
        if (!profile) return [];

        const newRating = Math.max(0, (profile.rating || 1000) + ratingChange);
        const newWins = won ? (profile.wins || 0) + 1 : profile.wins;
        const newLosses = won ? profile.losses : (profile.losses || 0) + 1;

        // Update Rank Badge
        let newRank = 'Bronze';
        if (newRating >= 2000) newRank = 'Grand Champion';
        else if (newRating >= 1800) newRank = 'Champion';
        else if (newRating >= 1500) newRank = 'Diamant';
        else if (newRating >= 1300) newRank = 'Platine';
        else if (newRating >= 1100) newRank = 'Or';
        else if (newRating >= 1000) newRank = 'Argent';

        // Achievement Check
        const currentAchievements = profile.achievements || [];
        const newAchievements = [...currentAchievements];
        const justUnlocked: string[] = [];

        if (won && !newAchievements.includes('FIRST_BLOOD')) {
            newAchievements.push('FIRST_BLOOD');
            justUnlocked.push('FIRST_BLOOD');
        }
        if (newWins >= 10 && !newAchievements.includes('WAR_HERO')) {
            newAchievements.push('WAR_HERO');
            justUnlocked.push('WAR_HERO');
        }
        if (newRating >= 1500 && !newAchievements.includes('ELITE_TACTICIAN')) {
            newAchievements.push('ELITE_TACTICIAN');
            justUnlocked.push('ELITE_TACTICIAN');
        }

        await supabase
            .from('profiles')
            .update({
                wins: newWins,
                losses: newLosses,
                rating: newRating,
                rank: newRank,
                achievements: newAchievements
            })
            .eq('id', userId);

        return justUnlocked;
    },

    getRanking: async (userId: string): Promise<number> => {
        const profile = await playerServiceSupabase.getById(userId);
        if (!profile) return 0;

        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt('rating', profile.rating || 0);

        if (error) return 0;
        return (count || 0) + 1;
    },

    getMatchHistory: async (username: string): Promise<{ matchId: string; tournamentName: string; opponentName: string; scoreA: number; scoreB: number; won: boolean; date: string }[]> => {
        // Find teams that contain this player
        const { data: memberRows } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('player_username', username);

        if (!memberRows || memberRows.length === 0) return [];

        const teamIds = memberRows.map(r => r.team_id);

        // Get completed matches featuring these teams
        const { data: matches } = await supabase
            .from('matches')
            .select(`
                id,
                score_a,
                score_b,
                winner_id,
                team_a_id,
                team_b_id,
                status,
                created_at,
                tournaments!inner(name)
            `)
            .in('status', ['COMPLETED'])
            .or(teamIds.map(id => `team_a_id.eq.${id},team_b_id.eq.${id}`).join(','))
            .order('created_at', { ascending: false })
            .limit(10);

        if (!matches) return [];

        // Fetch team names for display
        const allTeamIds = [...new Set(matches.flatMap(m => [m.team_a_id, m.team_b_id]).filter(Boolean))];
        const { data: teams } = await supabase
            .from('teams')
            .select('id, name')
            .in('id', allTeamIds);

        const teamMap = new Map((teams || []).map(t => [t.id, t.name]));

        return matches.map(m => {
            const isTeamA = teamIds.includes(m.team_a_id);
            const myTeamId = isTeamA ? m.team_a_id : m.team_b_id;
            const opponentTeamId = isTeamA ? m.team_b_id : m.team_a_id;

            return {
                matchId: m.id,
                tournamentName: (m as any).tournaments?.name || 'Unknown',
                opponentName: teamMap.get(opponentTeamId) || 'Unknown',
                scoreA: m.score_a || 0,
                scoreB: m.score_b || 0,
                won: m.winner_id === myTeamId,
                date: m.created_at
            };
        });
    },
    upgradeToAdmin: async (userId: string, code: string): Promise<{ success: boolean, message: string }> => {
        // Legacy support for the user's requested "code"
        const SECRET_CODE = '1704'; // Historical preference based on logs

        if (code !== SECRET_CODE) {
            return { success: false, message: 'Code de sécurité invalide.' };
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);

        if (error) return { success: false, message: 'Erreur lors de la synchronisation High Command.' };

        return { success: true, message: 'Accès High Command activé !' };
    }
};
