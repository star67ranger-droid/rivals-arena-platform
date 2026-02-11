import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { playerService } from '../services/playerService';
import { Trophy, Medal, Crown, Star, TrendingUp, ChevronRight, Swords, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../components/Skeleton';

const Leaderboard: React.FC = () => {
    const [players, setPlayers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const allPlayers = await playerService.getAll();
                setPlayers(allPlayers.sort((a, b) => (b.rating || 0) - (a.rating || 0)));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-12 max-w-6xl mx-auto animate-pulse">
                <div className="h-20 w-80 mx-auto rounded-2xl bg-white/5" />
                <div className="flex justify-center items-end gap-16 h-80">
                    <div className="h-64 w-48 rounded-t-[3rem] bg-white/5" />
                    <div className="h-80 w-56 rounded-t-[3rem] bg-white/5" />
                    <div className="h-56 w-48 rounded-t-[3rem] bg-white/5" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 w-full rounded-2xl bg-white/5" />)}
                </div>
            </div>
        );
    }

    const top3 = players.slice(0, 3);
    const rest = players.slice(3);

    return (
        <div className="space-y-20 pb-32 max-w-6xl mx-auto animate-in fade-in duration-700">
            <div className="text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
                    <Trophy size={160} className="text-rivals-accent" />
                </div>
                <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-2">
                    Panthéon des <span className="text-transparent bg-clip-text bg-gradient-to-r from-rivals-neon via-rivals-accent to-hot">Légendes Mondiales</span>
                </h1>
                <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs">La hiérarchie élite vérifiée de Rivals Arena</p>
                <div className="w-24 h-1 bg-rivals-accent mx-auto mt-6 rounded-full shadow-[0_0_15px_#8b5cf6]" />
            </div>

            {/* Cinematic Podium View */}
            {top3.length > 0 && (
                <div className="flex flex-col md:flex-row justify-center items-end gap-0 md:gap-4 relative px-4">
                    {/* 2nd Place */}
                    {top3[1] && (
                        <div className="order-2 md:order-1 flex flex-col items-center animate-in slide-in-from-bottom-10 duration-700 delay-150">
                            <Link to={`/profile/${top3[1].username}`} className="group relative z-20 mb-[-2rem]">
                                <div className="w-32 h-32 rounded-[2.5rem] border-4 border-slate-400 overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 bg-slate-800">
                                    <img src={top3[1].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].username}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-slate-400 text-slate-900 rounded-2xl flex items-center justify-center font-black text-xl border-4 border-rivals-darker shadow-xl">2</div>
                            </Link>
                            <div className="glass-heavy w-56 p-10 pt-14 rounded-t-[3.5rem] border-t-4 border-slate-400 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-slate-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="font-black text-white truncate text-xl uppercase italic tracking-tight mb-2">{top3[1].username}</p>
                                <p className="text-slate-400 font-bold text-sm tracking-widest">{top3[1].rating} ELO</p>
                                <div className="mt-4 px-3 py-1 bg-white/5 rounded-lg inline-block text-[9px] font-black text-slate-500 uppercase tracking-widest">{top3[1].rank}</div>
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {top3[0] && (
                        <div className="order-1 md:order-2 flex flex-col items-center z-30 animate-in slide-in-from-bottom-20 duration-1000">
                            <div className="relative mb-4 animate-bounce">
                                <Crown size={64} className="text-rivals-neon drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
                            </div>
                            <Link to={`/profile/${top3[0].username}`} className="group relative z-20 mb-[-3rem]">
                                <div className="w-44 h-44 rounded-[3rem] border-4 border-rivals-neon overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.3)] transition-all duration-700 group-hover:scale-110 bg-slate-800 ring-8 ring-rivals-neon/10">
                                    <img src={top3[0].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].username}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute top-0 -right-6 w-16 h-16 bg-rivals-neon text-rivals-darker rounded-[2rem] flex items-center justify-center font-black text-3xl border-4 border-rivals-darker shadow-2xl rotate-12">1</div>
                            </Link>
                            <div className="glass-heavy w-72 p-12 pt-20 rounded-t-[4rem] border-t-4 border-rivals-neon text-center relative overflow-hidden group shadow-[0_-20px_50px_rgba(34,211,238,0.1)]">
                                <div className="absolute inset-0 bg-rivals-neon/5 animate-pulse" />
                                <div className="relative z-10">
                                    <p className="font-black text-white truncate text-3xl uppercase italic tracking-tighter mb-2">{top3[0].username}</p>
                                    <p className="text-rivals-neon font-black text-xl tracking-tighter neon-text">{top3[0].rating} ELO</p>
                                    <div className="mt-4 px-4 py-1.5 bg-rivals-neon/10 border border-rivals-neon/20 rounded-xl inline-block text-[10px] font-black text-white uppercase tracking-[.2em]">{top3[0].rank}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {top3[2] && (
                        <div className="order-3 flex flex-col items-center animate-in slide-in-from-bottom-10 duration-700 delay-300">
                            <Link to={`/profile/${top3[2].username}`} className="group relative z-20 mb-[-1.5rem]">
                                <div className="w-28 h-28 rounded-[2rem] border-4 border-hot overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 bg-slate-800">
                                    <img src={top3[2].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].username}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-hot text-white rounded-2xl flex items-center justify-center font-black text-xl border-4 border-rivals-darker shadow-xl">3</div>
                            </Link>
                            <div className="glass-heavy w-52 p-8 pt-12 rounded-t-[3rem] border-t-4 border-hot text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-hot/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="font-black text-white truncate text-lg uppercase italic tracking-tight mb-2">{top3[2].username}</p>
                                <p className="text-hot font-bold text-sm tracking-widest">{top3[2].rating} ELO</p>
                                <div className="mt-4 px-3 py-1 bg-white/5 rounded-lg inline-block text-[9px] font-black text-slate-600 uppercase tracking-widest">{top3[2].rank}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Strategic List Feed */}
            <div className="glass-heavy rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <TrendingUp className="text-rivals-accent" /> Hiérarchie Stratégique
                    </h3>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Users size={12} /> Total des Combattants : {players.length}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] font-black tracking-[.2em]">
                            <tr>
                                <th className="p-6 w-20 text-center">Rang</th>
                                <th className="p-6">Entité</th>
                                <th className="p-6 text-center">Division</th>
                                <th className="p-6 text-center">Engagement (V/D)</th>
                                <th className="p-6 text-right">Puissance de Combat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 relative">
                            {players.slice(3).map((player, idx) => (
                                <tr key={player.id} className="hover:bg-rivals-accent/5 transition-all duration-300 group">
                                    <td className="p-6 text-center font-black text-slate-600 group-hover:text-white transition-colors italic text-lg">
                                        {idx + 4}
                                    </td>
                                    <td className="p-6">
                                        <Link to={`/profile/${player.username}`} className="flex items-center gap-4 group/entity">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden border border-white/10 group-hover/entity:scale-110 transition-transform duration-500 ring-2 ring-transparent group-hover/entity:ring-rivals-accent/50 shadow-xl">
                                                <img src={player.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`} alt="" />
                                            </div>
                                            <div>
                                                <span className="font-black text-white uppercase italic tracking-tight text-lg group-hover/entity:text-rivals-neon transition-colors">
                                                    {player.username}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Lien Actif</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className="text-[9px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 font-black uppercase tracking-widest">
                                            {player.rank}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center text-[11px] font-black tracking-widest">
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">{player.wins}V</span>
                                            <span className="text-slate-600">/</span>
                                            <span className="text-hot bg-hot/10 px-2 py-1 rounded-md border border-hot/20">{player.losses}D</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xl font-black text-rivals-neon neon-text italic italic leading-none">{player.rating}</span>
                                            <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-1">ELO VÉRIFIÉ</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
