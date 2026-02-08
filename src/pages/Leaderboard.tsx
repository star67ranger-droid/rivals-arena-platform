import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { playerService } from '../services/playerService'; // Corrected import path
import { Trophy, Medal, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Leaderboard: React.FC = () => {
    const [players, setPlayers] = useState<UserProfile[]>([]);

    useEffect(() => {
        const load = async () => {
            const allPlayers = await playerService.getAll();
            setPlayers(allPlayers);
        };
        load();
    }, []);

    const top3 = players.slice(0, 3);
    const rest = players.slice(3);

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                    Global Leaderboard
                </h2>
                <p className="text-slate-400">The best Rivals Arena players</p>
            </div>

            {/* Podium / Tree View */}
            {top3.length > 0 && (
                <div className="flex justify-center items-end gap-4 md:gap-8 min-h-[300px]">
                    {/* 2nd Place */}
                    {top3[1] && (
                        <div className="flex flex-col items-center animate-fade-in-up delay-100">
                            <Link to={`/profile/${top3[1].id}`} className="group relative">
                                <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden mb-4 shadow-[0_0_20px_rgba(203,213,225,0.3)]">
                                    <img src={top3[1].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].username}`} alt={top3[1].username} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-900 rounded-full p-1 border-2 border-slate-900">
                                    <span className="font-bold text-sm">#2</span>
                                </div>
                            </Link>
                            <div className="bg-slate-800/80 p-6 rounded-t-xl w-32 md:w-40 text-center border-t-4 border-slate-300 backdrop-blur-sm h-32 flex flex-col justify-center">
                                <p className="font-bold truncate text-slate-200">{top3[1].username}</p>
                                <p className="text-slate-400 text-sm">{top3[1].rating} pts</p>
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {top3[0] && (
                        <div className="flex flex-col items-center z-10 animate-fade-in-up">
                            <Crown className="text-yellow-400 mb-2 animate-bounce" size={32} />
                            <Link to={`/profile/${top3[0].id}`} className="group relative">
                                <div className="w-28 h-28 rounded-full border-4 border-yellow-400 overflow-hidden mb-4 shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                                    <img src={top3[0].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].username}`} alt={top3[0].username} className="w-full h-full object-cover" />
                                </div>
                            </Link>
                            <div className="bg-gradient-to-b from-yellow-500/20 to-slate-900 p-8 rounded-t-xl w-40 md:w-48 text-center border-t-4 border-yellow-400 backdrop-blur-md h-40 flex flex-col justify-center shadow-2xl">
                                <p className="font-extrabold text-xl truncate text-white">{top3[0].username}</p>
                                <p className="text-yellow-200 font-mono font-bold">{top3[0].rating} pts</p>
                                <div className="mt-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full inline-block">
                                    {top3[0].rank}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {top3[2] && (
                        <div className="flex flex-col items-center animate-fade-in-up delay-200">
                            <Link to={`/profile/${top3[2].id}`} className="group relative">
                                <div className="w-20 h-20 rounded-full border-4 border-amber-700 overflow-hidden mb-4 shadow-[0_0_20px_rgba(180,83,9,0.3)]">
                                    <img src={top3[2].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].username}`} alt={top3[2].username} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-amber-700 text-amber-100 rounded-full p-1 border-2 border-slate-900">
                                    <span className="font-bold text-sm">#3</span>
                                </div>
                            </Link>
                            <div className="bg-slate-800/80 p-6 rounded-t-xl w-32 md:w-40 text-center border-t-4 border-amber-700 backdrop-blur-sm h-24 flex flex-col justify-center">
                                <p className="font-bold truncate text-slate-200">{top3[2].username}</p>
                                <p className="text-slate-400 text-sm">{top3[2].rating} pts</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* List View */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4 w-16 text-center">#</th>
                            <th className="p-4">Player</th>
                            <th className="p-4 text-center">Rank</th>
                            <th className="p-4 text-center">W/L</th>
                            <th className="p-4 text-right">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {rest.map((player, idx) => (
                            <tr key={player.id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="p-4 text-center font-mono text-slate-500 group-hover:text-white">
                                    {idx + 4}
                                </td>
                                <td className="p-4">
                                    <Link to={`/profile/${player.id}`} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                            <img src={player.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`} alt="" />
                                        </div>
                                        <span className="font-bold text-slate-200 group-hover:text-violet-400 transition-colors">
                                            {player.username}
                                        </span>
                                    </Link>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                        {player.rank}
                                    </span>
                                </td>
                                <td className="p-4 text-center text-sm font-mono text-slate-400">
                                    <span className="text-green-400">{player.wins}</span> / <span className="text-red-400">{player.losses}</span>
                                </td>
                                <td className="p-4 text-right font-bold text-cyan-400">
                                    {player.rating}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
