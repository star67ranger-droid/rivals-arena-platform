import React, { useState, useEffect } from 'react';
import { tournamentService } from '../services/tournamentService';
import { playerService } from '../services/playerService';
import { Tournament, UserProfile } from '../types';
import { Shield, Trash2, FastForward, Save, RefreshCw, Trophy, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';

const Admin: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();

    // Edit states
    const [editRating, setEditRating] = useState(0);
    const [editLevel, setEditLevel] = useState(0);

    useEffect(() => {
        const savedFilter = localStorage.getItem('rivals_admin_auth');
        if (savedFilter === 'true') {
            setIsAuthenticated(true);
            refreshData();
        }
    }, []);

    const refreshData = async () => {
        try {
            setTournaments(await tournamentService.getAll());
            setProfiles(await playerService.getAll());
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded PIN for now: 9861
        if (pin === '9861') {
            setIsAuthenticated(true);
            localStorage.setItem('rivals_admin_auth', 'true');
            await refreshData();
        } else {
            setError('Invalid PIN');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('rivals_admin_auth');
        setPin('');
    };

    const handleDeleteTournament = async (id: string) => {
        if (confirm('Are you sure you want to delete this tournament?')) {
            try {
                await tournamentService.delete(id);
                showToast('Tournament deleted', 'success');
                await refreshData();
            } catch (err) {
                showToast('Failed to delete', 'error');
            }
        }
    };

    const handleForceStart = async (id: string) => {
        try {
            const res = await tournamentService.startTournament(id);
            if (res.success) {
                showToast(res.message, 'success');
                await refreshData();
            } else {
                showToast(res.message, 'error');
            }
        } catch (err) {
            showToast('Error starting tournament', 'error');
        }
    };

    const handleSelectProfile = (p: UserProfile) => {
        setSelectedProfile(p);
        setEditRating(p.rating || 1000);
        setEditLevel(p.rivalsLevel || 1);
    };

    const handleSaveProfile = async () => {
        if (!selectedProfile) return;
        await playerService.createOrUpdateProfile(selectedProfile.username, {
            rating: editRating,
            rivalsLevel: editLevel
        });
        alert('Profile updated!');
        await refreshData();
        // Optionally update local state if needed immediately
        setSelectedProfile({ ...selectedProfile, rating: editRating, rivalsLevel: editLevel });
    };

    if (!isAuthenticated) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl w-full max-w-sm text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
                    <p className="text-slate-500 mb-6">Enter security PIN to continue.</p>

                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-center tracking-widest text-2xl mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="••••"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            maxLength={4}
                        />
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors">
                            Unlock Panel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const filteredProfiles = profiles.filter(p => p.username.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <Shield className="text-red-500" /> Admin Dashboard
                    </h1>
                    <p className="text-slate-400">Manage players, tournaments, and system settings.</p>
                </div>
                <button onClick={handleLogout} className="text-slate-500 hover:text-white px-4">Logout</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Tournament Management */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-400" /> Active Tournaments
                    </h2>
                    <div className="space-y-3">
                        {tournaments.length === 0 && <p className="text-slate-500 italic">No tournaments found.</p>}
                        {tournaments.map(t => (
                            <div key={t.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center group">
                                <div>
                                    <p className="font-bold text-white">{t.name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${t.status === 'Active' ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                                        {t.status} • {t.matches.flat().length} Matches
                                    </p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {t.status === 'Open' && (
                                        <button onClick={() => handleForceStart(t.id)} className="p-2 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50" title="Force Start">
                                            <FastForward size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteTournament(t.id)} className="p-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Player Management */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Users size={20} className="text-cyan-400" /> Player Editor
                    </h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Search username..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button onClick={refreshData} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                            <RefreshCw size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
                        {/* List */}
                        <div className="overflow-y-auto pr-2 space-y-2 border-r border-slate-800/50">
                            {filteredProfiles.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelectProfile(p)}
                                    className={`w-full text-left p-2 rounded flex justify-between items-center ${selectedProfile?.id === p.id ? 'bg-cyan-900/20 border border-cyan-500/30' : 'hover:bg-slate-800'}`}
                                >
                                    <span className="text-sm font-medium text-slate-300">{p.username}</span>
                                    <span className="text-xs text-slate-500">Lvl {p.rivalsLevel}</span>
                                </button>
                            ))}
                        </div>

                        {/* Edit Form */}
                        <div className="pl-2">
                            {selectedProfile ? (
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold border-b border-slate-800 pb-2">{selectedProfile.username}</h3>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Rivals Level</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white mt-1"
                                            value={editLevel}
                                            onChange={e => setEditLevel(Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Elo Rating</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white mt-1"
                                            value={editRating}
                                            onChange={e => setEditRating(Number(e.target.value))}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                    <AlertTriangle size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">Select a player to edit</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Admin;
