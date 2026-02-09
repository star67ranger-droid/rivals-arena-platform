import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserProfile } from '../types';
import { playerService } from '../services/playerService';
import { Trophy, Swords, Target, Share2, Twitter, MessageCircle, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (id) {
                    const p = await playerService.getByName(id);
                    setProfile(p || null);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Profile link copied to clipboard!', 'info');
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-48" variant="text" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 max-w-xl mx-auto mt-10">
                <Swords size={48} className="mx-auto text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-500">Player not found</h3>
                <p className="text-slate-600">This profile might be private or doesn't exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Card */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
                <div className="h-32 bg-gradient-to-r from-violet-900 to-cyan-900 opacity-50"></div>
                <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 gap-6 relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                        <img src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 mb-2">
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                            {profile.username}
                            <span className="text-xs bg-violet-500 text-white px-2 py-1 rounded-full">{profile.rank}</span>
                        </h1>
                        <p className="text-slate-400">{profile.bio || 'No bio yet.'}</p>
                    </div>
                    <div className="flex gap-2 mb-4">
                        {profile.socials?.twitter && (
                            <a href={`https://twitter.com/${profile.socials.twitter}`} target="_blank" className="p-2 bg-slate-800 rounded-lg hover:bg-sky-900 text-sky-400 transition-colors">
                                <Twitter size={20} />
                            </a>
                        )}
                        {profile.socials?.discord && (
                            <div className="p-2 bg-slate-800 rounded-lg text-indigo-400" title={profile.socials.discord}>
                                <MessageCircle size={20} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
                    <Trophy className="text-yellow-400 mb-2" size={24} />
                    <span className="text-2xl font-bold">{profile.wins}</span>
                    <span className="text-xs text-slate-500 uppercase font-bold">Wins</span>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
                    <Swords className="text-red-400 mb-2" size={24} />
                    <span className="text-2xl font-bold">{profile.tournamentsPlayed}</span>
                    <span className="text-xs text-slate-500 uppercase font-bold">Tournaments</span>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
                    <Target className="text-cyan-400 mb-2" size={24} />
                    <span className="text-2xl font-bold">{profile.rating}</span>
                    <span className="text-xs text-slate-500 uppercase font-bold">Rating</span>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
                    <div className="text-2xl font-bold text-slate-300">{(profile.wins / (profile.wins + profile.losses || 1) * 100).toFixed(0)}%</div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Win Rate</span>
                </div>
            </div>

            {/* Achievements */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy size={20} className="text-violet-500" />
                    Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.achievements.map((ach, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Trophy size={16} className="text-yellow-500" />
                            </div>
                            <span className="font-medium text-slate-200">{ach}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
