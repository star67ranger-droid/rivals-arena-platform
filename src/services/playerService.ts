import { UserProfile } from '../types';

const STORAGE_KEY = 'rivals_arena_profiles';

const loadProfiles = (): UserProfile[] => {
    try {
        const existing = localStorage.getItem(STORAGE_KEY);
        return existing ? JSON.parse(existing) : [];
    } catch (e) {
        return [];
    }
};

const saveProfiles = (data: UserProfile[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const playerService = {
    getAll: (): UserProfile[] => {
        return loadProfiles();
    },

    getByName: (username: string): UserProfile | undefined => {
        return loadProfiles().find(p => p.username.toLowerCase() === username.toLowerCase());
    },

    createOrUpdateProfile: (username: string, updates: Partial<UserProfile>): UserProfile => {
        const profiles = loadProfiles();
        const idx = profiles.findIndex(p => p.username.toLowerCase() === username.toLowerCase());

        let profile: UserProfile;

        if (idx !== -1) {
            // Update existing
            profiles[idx] = { ...profiles[idx], ...updates };
            profile = profiles[idx];
        } else {
            // Create new
            profile = {
                id: `user-${Date.now()}`,
                username,
                wins: 0,
                losses: 0,
                tournamentsPlayed: 0,
                rating: 1000, // Default Elo
                rank: 'Unranked',
                achievements: [],
                rivalsLevel: 1,
                ...updates
            };
            profiles.push(profile);
        }

        saveProfiles(profiles);
        return profile;
    },

    updateStats: (username: string, won: boolean, ratingChange: number) => {
        const profiles = loadProfiles();
        const idx = profiles.findIndex(p => p.username.toLowerCase() === username.toLowerCase());
        if (idx === -1) return;

        const p = profiles[idx];
        p.tournamentsPlayed += 1;
        if (won) p.wins += 1;
        else p.losses += 1;

        p.rating = Math.max(0, (p.rating || 1000) + ratingChange);

        // Update Rank Badge based on points
        if (p.rating >= 2000) p.rank = 'Grand Champion';
        else if (p.rating >= 1800) p.rank = 'Champion';
        else if (p.rating >= 1500) p.rank = 'Diamond';
        else if (p.rating >= 1300) p.rank = 'Platinum';
        else if (p.rating >= 1100) p.rank = 'Gold';
        else if (p.rating >= 1000) p.rank = 'Silver';
        else p.rank = 'Bronze';

        profiles[idx] = p;
        saveProfiles(profiles);
    },

    deleteProfile: (username: string) => {
        const profiles = loadProfiles();
        const filtered = profiles.filter(p => p.username.toLowerCase() !== username.toLowerCase());
        saveProfiles(filtered);
    }
};
