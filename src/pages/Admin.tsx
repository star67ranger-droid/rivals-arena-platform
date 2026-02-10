import React, { useState, useEffect } from 'react';
import { tournamentService } from '../services/tournamentService';
import { playerService } from '../services/playerService';
import { Tournament, UserProfile } from '../types';
import {
    Shield, Trash2, FastForward, Save, RefreshCw,
    Trophy, Users, AlertTriangle, Loader2,
    Settings, Terminal, ChevronRight, Activity,
    Database, Cpu
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

const Admin: React.FC = () => {
    const { isAdmin, user } = useAuth();
    const { showToast } = useToast();

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit states
    const [editRating, setEditRating] = useState(0);
    const [editLevel, setEditLevel] = useState(0);

    useEffect(() => {
        if (isAdmin) {
            refreshData();
        }
    }, [isAdmin]);

    const refreshData = async () => {
        setLoading(true);
        try {
            setTournaments(await tournamentService.getAll());
            setProfiles(await playerService.getAll());
        } catch (err) {
            showToast('Logic Error: Failed to fetch central data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTournament = async (id: string) => {
        if (confirm('CRITICAL: Permanent data erasure requested. Proceed?')) {
            try {
                await tournamentService.delete(id);
                showToast('Entity Scrubbed from Database', 'success');
                await refreshData();
            } catch (err) {
                showToast('Erasure Failed: System Conflict', 'error');
            }
        }
    };

    const handleForceStart = async (id: string) => {
        try {
            const res = await tournamentService.startTournament(id);
            if (res.success) {
                showToast('Operation Forcefully Commenced', 'success');
                await refreshData();
            } else {
                showToast(res.message, 'error');
            }
        } catch (err) {
            showToast('Logic Error: Command Rejected', 'error');
        }
    };

    const handleSelectProfile = (p: UserProfile) => {
        setSelectedProfile(p);
        setEditRating(p.rating || 1000);
        setEditLevel(p.rivalsLevel || 1);
    };

    const handleSaveProfile = async () => {
        if (!selectedProfile) return;
        try {
            await playerService.createOrUpdateProfile(selectedProfile.username, {
                rating: editRating,
                rivalsLevel: editLevel
            });
            showToast('Subject Parameters Modified', 'success');
            await refreshData();
            setSelectedProfile({ ...selectedProfile, rating: editRating, rivalsLevel: editLevel });
        } catch (err) {
            showToast('Modification Failed', 'error');
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-6 animate-in fade-in duration-1000">
                <div className="glass-heavy border border-hot/30 p-12 rounded-[3rem] w-full max-w-md text-center shadow-[0_0_100px_rgba(244,63,94,0.1)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                    <AlertTriangle size={64} className="text-hot mx-auto mb-6 animate-bounce" />
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic">Access Restricted</h2>
                    <p className="text-slate-500 font-bold mb-10 text-xs tracking-widest uppercase">Unauthorized access to Central Intelligence is a severe security violation.</p>
                </div>
            </div>
        );
    }

    const filteredProfiles = profiles.filter(p => p.username.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-10 pb-32 animate-in fade-in duration-700">
            {/* Header Module */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-heavy p-8 md:p-12 rounded-[
                3.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-hot/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-hot/10 border border-hot/20 rounded-full text-hot text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                            <Terminal size={12} /> High Command Mode: {user?.username}
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                            <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">Verified Access</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tighter italic uppercase flex items-center gap-4">
                        Central <span className="text-hot">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight italic">Ultimate management console for elite operation oversight.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Neural Link Status</p>
                        <p className="text-xs font-black text-white italic">OPERATIONAL // LATEST</p>
                    </div>
                    <button
                        onClick={refreshData}
                        className="p-4 glass hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl"
                    >
                        <RefreshCw size={24} className={loading ? 'animate-spin text-hot' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Tournament Management */}
                <div className="glass-heavy border border-white/5 rounded-[3rem] p-10 relative overflow-hidden bg-slate-950/30 group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                        <Database size={150} className="text-hot" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4 italic uppercase tracking-tighter">
                        <Shield size={32} className="text-hot" /> Field Operations
                    </h2>

                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
                        {loading ? (
                            [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
                        ) : tournaments.length === 0 ? (
                            <div className="py-24 text-center border border-dashed border-white/10 rounded-[2.5rem] bg-white/5">
                                <Trophy size={48} className="mx-auto text-slate-800 mb-6" />
                                <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No active deployments detected.</p>
                            </div>
                        ) : tournaments.map(t => (
                            <div key={t.id} className="glass p-5 rounded-2xl border border-white/5 flex justify-between items-center group/card hover:border-hot/30 transition-all duration-500 hover:bg-white/5">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="font-black text-white truncate text-xl uppercase italic tracking-tight group-hover/card:text-hot transition-colors">{t.name}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                            {t.status}
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.teamSize} • {t.format}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 opacity-0 group-hover/card:opacity-100 transition-all transform translate-x-4 group-hover/card:translate-x-0">
                                    {t.status === 'Open' && (
                                        <button onClick={() => handleForceStart(t.id)} className="p-3 glass-heavy bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl hover:-translate-y-1" title="Force Start">
                                            <FastForward size={20} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteTournament(t.id)} className="p-3 glass-heavy bg-hot/10 text-hot rounded-xl hover:bg-hot hover:text-white transition-all shadow-xl hover:-translate-y-1" title="Terminate">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Player Management */}
                <div className="glass-heavy border border-white/5 rounded-[3rem] p-10 relative overflow-hidden bg-slate-950/30 group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                        <Cpu size={150} className="text-rivals-neon" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4 italic uppercase tracking-tighter">
                        <Users size={32} className="text-rivals-neon" /> Subject Modification
                    </h2>

                    <div className="relative mb-10">
                        <input
                            type="text"
                            placeholder="GENETIC OVERRIDE: SEARCH BY CALLSIGN..."
                            className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black text-xs tracking-[0.2em] focus:ring-4 focus:ring-rivals-neon/10 focus:border-rivals-neon outline-none transition-all placeholder:text-slate-800 uppercase"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 min-h-[450px]">
                        {/* List */}
                        <div className="overflow-y-auto pr-6 space-y-3 custom-scrollbar border-r border-white/5">
                            {loading ? (
                                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
                            ) : filteredProfiles.length === 0 ? (
                                <p className="text-slate-800 font-black text-center pt-20 uppercase tracking-[.4em] text-[9px]">Zero Subjects Found</p>
                            ) : filteredProfiles.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelectProfile(p)}
                                    className={`w-full text-left p-5 rounded-2xl flex justify-between items-center transition-all group overflow-hidden relative shadow-lg ${selectedProfile?.id === p.id ? 'bg-rivals-neon/10 border border-rivals-neon/30 text-white shadow-rivals-neon/10' : 'hover:bg-white/5 border border-transparent text-slate-500'}`}
                                >
                                    <div className="relative z-10">
                                        <span className="text-sm font-black uppercase tracking-widest block italic">{p.username}</span>
                                        <span className={`text-[8px] font-black uppercase mt-1 px-2 py-0.5 rounded bg-white/5 border border-white/5 inline-block ${selectedProfile?.id === p.id ? 'text-rivals-neon' : ''}`}>
                                            LVL {p.rivalsLevel} • {p.rank}
                                        </span>
                                    </div>
                                    <ChevronRight size={16} className={`relative z-10 transition-all ${selectedProfile?.id === p.id ? 'rotate-90 text-rivals-neon scale-125' : 'group-hover:translate-x-1 opacity-20 group-hover:opacity-100'}`} />
                                    {selectedProfile?.id === p.id && <div className="absolute inset-x-0 bottom-0 h-1 bg-rivals-neon shadow-[0_0_10px_#22d3ee]" />}
                                </button>
                            ))}
                        </div>

                        {/* Edit Form */}
                        <div className="pl-2">
                            {selectedProfile ? (
                                <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                                        <div className="relative">
                                            <img src={selectedProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProfile.username}`} className="w-20 h-20 rounded-[1.5rem] bg-slate-800 border-2 border-white/10" alt="" />
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-rivals-neon rounded-lg flex items-center justify-center text-rivals-darker shadow-xl">
                                                <Settings size={16} className="animate-spin-slow" />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-white font-black text-2xl italic uppercase tracking-tighter truncate">{selectedProfile.username}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">Status: Modification Ready</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em] block">Combat Experience</label>
                                                <span className="text-rivals-neon font-black text-[10px] italic">LVL {editLevel}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="500"
                                                className="w-full accent-rivals-neon appearance-none h-2 bg-white/5 rounded-full overflow-hidden border border-white/5"
                                                value={editLevel}
                                                onChange={e => setEditLevel(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em] block">Strategic Elo Multiplier</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-black text-2xl text-center focus:border-rivals-neon focus:ring-4 focus:ring-rivals-neon/10 outline-none transition-all italic tracking-tighter"
                                                    value={editRating}
                                                    onChange={e => setEditRating(Number(e.target.value))}
                                                />
                                                <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-20">
                                                    <Activity size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveProfile}
                                        className="w-full bg-rivals-neon hover:bg-cyan-300 text-rivals-darker font-black py-5 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-rivals-neon/20 active:scale-95 transform hover:-translate-y-1 uppercase tracking-widest text-xs"
                                    >
                                        <Save size={20} /> SYNC TO MATRIX
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-800 text-center px-8 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <Shield size={40} className="opacity-20" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                                        Awaiting subject selection. Select an entity from the localized transmission feed to initiate override protocols.
                                    </p>
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
