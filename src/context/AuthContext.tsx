import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { playerService } from '../services/playerService';

type UserRole = 'admin' | 'user' | 'guest';

interface User {
    id: string;
    username: string;
    role: UserRole;
    profile?: UserProfile;
}

interface AuthContextType {
    user: User | null;
    loginAsAdmin: (pin: string) => boolean;
    loginAsPlayer: (username: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check local storage for session restoration
        const savedSession = localStorage.getItem('rivals_arena_session');
        if (savedSession) {
            setUser(JSON.parse(savedSession));
        }
    }, []);

    const loginAsAdmin = (pin: string): boolean => {
        // Hardcoded PIN from previous steps
        if (pin === '9861') {
            const adminUser: User = {
                id: 'admin-001',
                username: 'Administrator',
                role: 'admin'
            };
            setUser(adminUser);
            localStorage.setItem('rivals_arena_session', JSON.stringify(adminUser));
            return true;
        }
        return false;
    };

    const loginAsPlayer = async (username: string) => {
        try {
            // Check if profile exists
            let profile = await playerService.getByName(username);

            // Auto-create profile if not exists (simplifies flow for now)
            if (!profile) {
                profile = await playerService.createOrUpdateProfile(username, {
                    rivalsLevel: 1 // Default
                });
            }

            if (profile) {
                const playerUser: User = {
                    id: profile.id,
                    username: profile.username,
                    role: 'user',
                    profile
                };

                setUser(playerUser);
                localStorage.setItem('rivals_arena_session', JSON.stringify(playerUser));
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('rivals_arena_session');
        localStorage.removeItem('rivals_admin_auth'); // Cleanup old key
    };

    return (
        <AuthContext.Provider value={{
            user,
            loginAsAdmin,
            loginAsPlayer,
            logout,
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
