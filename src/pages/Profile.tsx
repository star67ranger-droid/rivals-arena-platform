import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserProfile } from '../types';
import { playerService, ACHIEVEMENT_MASTER_LIST, RARITY_CONFIG } from '../services/playerService';
import type { AchievementRarity } from '../services/playerService';
import {
    Trophy, Swords, Target, Share2, Twitter,
    MessageCircle, Zap, Shield, Star,
    ChevronRight, Award, History, LayoutDashboard,
    Crown, Flame
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';

type MatchRecord = {
    matchId: string;
    tournamentName: string;
    opponentName: string;
    scoreA: number;
    scoreB: number;
    won: boolean;
    date: string;
};

const ICON_MAP: Record<string, React.ComponentType<any>> = {
    Sword: Swords,
    Shield: Shield,
    Target: Target,
    Trophy: Trophy,
    Flame: Flame,
    Crown: Crown,
};

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState<number>(0);
    const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (id) {
                    const p = await playerService.getByName(id);
                    setProfile(p || null);

                    if (p) {
                        // Fetch real ranking
                        const rank = await playerService.getRanking(p.id);
                        setRanking(rank);

                        // Fetch match history
                        const history = await playerService.getMatchHistory(p.username);
                        setMatchHistory(history);
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Intel du Profil Chiffré & Copié', 'info');
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-10 animate-pulse">
                <Skeleton className="h-80 w-full rounded-[3rem]" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-80 w-full rounded-3xl" />
                    </div>
                    <Skeleton className="h-full w-full rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-32 glass rounded-[3rem] border border-dashed border-white/10 max-w-xl mx-auto mt-20">
                <Shield size={64} className="mx-auto text-slate-800 mb-6" />
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Identité Neutralisée</h3>
                <p className="text-slate-500 font-medium">Ce combattant n'existe pas dans notre base de données active.</p>
            </div>
        );
    }

    const winRate = (profile.wins / (profile.wins + profile.losses || 1) * 100);

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
            {/* Cinematic Identity Card */}
            <div className="relative rounded-[3.5rem] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl group">
                <div className="h-48 bg-gradient-to-r from-rivals-dark via-rivals-accent/20 to-rivals-neon/20 relative">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent" />
                </div>

                <div className="px-12 pb-12 flex flex-col lg:flex-row items-end -mt-20 gap-10 relative z-10">
                    <div className="relative group/avatar cursor-pointer">
                        <div className="w-44 h-44 rounded-[2.5rem] border-8 border-slate-900 bg-slate-800 overflow-hidden shadow-2xl transition-all duration-500 group-hover/avatar:scale-105 group-hover/avatar:rotate-3">
                            <img
                                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                                className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700"
                                alt="avatar"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 border-4 border-slate-900 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                            <Zap size={20} className="text-white fill-white" />
                        </div>
                    </div>

                    <div className="flex-1 mb-4 text-center lg:text-left">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
                                {profile.username}
                            </h1>
                            <span className="w-fit mx-auto lg:mx-0 px-4 py-1.5 bg-rivals-accent/20 border border-rivals-accent/30 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full backdrop-blur-xl">
                                {profile.rank}
                            </span>
                        </div>
                        <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed italic">
                            "{profile.bio || 'Le silence est mon seul allié dans l\'arène.'}"
                        </p>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={handleShare}
                            className="p-4 glass hover:bg-white/10 text-slate-400 hover:text-white rounded-[1.5rem] transition-all"
                        >
                            <Share2 size={24} />
                        </button>
                        {profile.socials?.twitter && (
                            <a href={`https://twitter.com/${profile.socials.twitter}`} target="_blank" className="p-4 glass hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 rounded-[1.5rem] transition-all">
                                <Twitter size={24} />
                            </a>
                        )}
                        <div className="px-6 py-4 glass text-rivals-neon rounded-[1.5rem] flex items-center gap-3">
                            <Star size={20} className="fill-rivals-neon" />
                            <span className="text-xl font-black">{profile.rating} ELITE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Victoires Totales', val: profile.wins, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                    { label: 'Missions Complétées', val: profile.tournamentsPlayed, icon: Swords, color: 'text-hot', bg: 'bg-hot/5' },
                    { label: 'Rang Mondial', val: ranking > 0 ? `#${ranking}` : '—', icon: Trophy, color: 'text-rivals-neon', bg: 'bg-rivals-neon/5' },
                    { label: 'Probabilité de Victoire', val: `${winRate.toFixed(0)}%`, icon: Target, color: 'text-rivals-accent', bg: 'bg-rivals-accent/5' },
                ].map((stat, i) => (
                    <div key={i} className={`glass ${stat.bg} p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 hover:border-white/20 transition-all duration-500 group`}>
                        <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Achievements module */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                            <Award className="text-rivals-accent" />
                            Honneurs & Distinctions
                        </h3>
                        <span className="text-xs text-slate-500 font-bold">{profile.achievements.length} DÉBLOQUÉS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.achievements.length === 0 ? (
                            <div className="col-span-full py-12 text-center glass border border-dashed border-white/5 rounded-3xl">
                                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs italic">Aucun honneur obtenu dans ce secteur pour le moment.</p>
                            </div>
                        ) : profile.achievements.map((achId, i) => {
                            const achData = ACHIEVEMENT_MASTER_LIST[achId];
                            if (!achData) return null;
                            const rarityStyle = RARITY_CONFIG[achData.rarity];
                            const IconComponent = ICON_MAP[achData.icon] || Trophy;
                            return (
                                <div key={i} className={`group glass p-6 rounded-3xl ${rarityStyle.border} ${rarityStyle.glow} hover:scale-[1.02] transition-all duration-500 relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <Zap size={40} className={rarityStyle.text} />
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 ${rarityStyle.bg} rounded-2xl flex items-center justify-center border ${rarityStyle.border}`}>
                                            <IconComponent size={20} className={rarityStyle.text} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${rarityStyle.text}`}>{rarityStyle.label}</span>
                                            </div>
                                            <span className="text-sm font-black text-white uppercase tracking-tight italic">{achData.name}</span>
                                            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{achData.description}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Real Match History */}
                    <div className="pt-10">
                        <div className="flex items-center justify-between mb-8 px-4">
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                <History className="text-rivals-neon" />
                                Historique de Combat
                            </h3>
                            <span className="text-xs text-slate-500 font-bold">{matchHistory.length} ENREGISTRÉS</span>
                        </div>

                        {matchHistory.length === 0 ? (
                            <div className="glass rounded-[3rem] border border-white/5 p-12 text-center">
                                <LayoutDashboard size={48} className="mx-auto text-slate-800 mb-6" />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Aucun enregistrement de combat. Rejoignez un tournoi pour commencer.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {matchHistory.map((match) => (
                                    <div key={match.matchId} className={`glass rounded-2xl p-5 flex items-center gap-4 border transition-all duration-300 hover:scale-[1.01] ${match.won ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-red-500/20 hover:border-red-500/40'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${match.won ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                                            {match.won ? 'V' : 'D'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                                                vs {match.opponentName}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{match.tournamentName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white tracking-tighter">
                                                {match.scoreA} - {match.scoreB}
                                            </p>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                                                {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-700" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="glass-heavy border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-rivals-neon/5 to-transparent pointer-events-none" />
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.4em] mb-8">Intel Système</h3>
                        <div className="space-y-6 uppercase font-black text-[10px] tracking-widest">
                            <div className="flex justify-between border-b border-white/5 pb-4">
                                <span className="text-slate-500">Statut du Grade</span>
                                <span className="text-white">{profile.rank}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-4">
                                <span className="text-slate-500">Rang Mondial</span>
                                <span className="text-rivals-neon">{ranking > 0 ? `#${ranking}` : 'Non Classé'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-4">
                                <span className="text-slate-500">Taux de Victoire</span>
                                <span className="text-white">{winRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-4">
                                <span className="text-slate-500">Niveau d'Opération</span>
                                <span className="text-rivals-neon">LVL {profile.rivalsLevel || 1}</span>
                            </div>
                        </div>

                        <div className="mt-10 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <p className="text-[10px] text-emerald-400 font-black text-center tracking-widest">IDENTITÉ VÉRIFIÉE PAR LE HAUT COMMANDEMENT</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
