import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Trophy, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { Tournament } from '../types';
import { tournamentService } from '../services/tournamentService';

interface TournamentCardProps {
  tournament: Tournament;
  onDelete: (e: React.MouseEvent) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onDelete }) => {
  const statusColors = {
    'Draft': 'bg-slate-700 text-slate-300 border-slate-600',
    'Open': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Active': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Completed': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  };

  return (
    <Link to={`/tournament/${tournament.id}`} className="group block bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-300 relative">
      {/* Delete Button (Only visible on hover) */}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 z-20 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Delete Tournament"
      >
        <Trash2 size={16} />
      </button>

      <div className="h-32 bg-slate-800 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
        <img
          src={`https://picsum.photos/seed/${tournament.id}/400/200`}
          alt="Cover"
          className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border backdrop-blur-md ${statusColors[tournament.status]}`}>
            {tournament.status}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-bold text-lg mb-1 truncate group-hover:text-violet-400 transition-colors">{tournament.name}</h4>
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-mono">
          <span className="flex items-center gap-1"><Users size={12} /> {tournament.teams.length}/{tournament.maxTeams}</span>
          <span>{tournament.teamSize}</span>
          <span>{tournament.format}</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            <span className="block text-slate-600 uppercase text-[10px] font-bold">Prize Pool</span>
            {tournament.prizePool}
          </div>
          <div className="text-xs text-slate-400 text-right">
            <span className="block text-slate-600 uppercase text-[10px] font-bold">Starts</span>
            {new Date(tournament.startDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const load = async () => {
      setTournaments(await tournamentService.getAll());
    };
    load();
  }, [refresh]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation
    if (confirm('Are you sure you want to delete this tournament? This cannot be undone.')) {
      await tournamentService.delete(id);
      setRefresh(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-violet-900 to-slate-900 p-8 overflow-hidden border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full mb-4 border border-cyan-500/30 animate-pulse">
            SEASON 4 LIVE
          </span>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Prove Your Skill in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Roblox Rivals</span>
          </h2>
          <p className="text-slate-300 mb-6 text-lg leading-relaxed">
            Join the ultimate competitive hub. Create tournaments, manage brackets, and climb the global leaderboard.
          </p>
          <div className="flex gap-4">
            <Link to="/create" className="bg-white text-slate-950 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10">
              <Play size={18} fill="currentColor" />
              Create Tournament
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://picsum.photos/seed/esport/800/600')] bg-cover opacity-10 mix-blend-overlay"></div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Tournaments', val: tournaments.filter(t => t.status === 'Active').length, icon: Trophy, color: 'text-yellow-400' },
          { label: 'Registered Players', val: tournaments.reduce((acc, t) => acc + t.teams.length, 0), icon: Users, color: 'text-cyan-400' },
          { label: 'Matches Ready', val: 'Waiting', icon: Play, color: 'text-violet-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-800/80 transition-colors">
            <div className={`w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.val}</p>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tournament List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="text-violet-500" />
            Active Tournaments
          </h3>
          {tournaments.length > 0 && (
            <span className="text-sm text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {tournaments.length} found
            </span>
          )}
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
            <Trophy size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-500">No tournaments yet</h3>
            <p className="text-slate-600 mb-6">Start your first competition now!</p>
            <Link to="/create" className="text-cyan-400 hover:underline">Create one now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} onDelete={(e) => handleDelete(e, t.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;