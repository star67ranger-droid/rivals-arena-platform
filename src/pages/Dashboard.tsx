import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Play, Users, Trophy, Shield, Trash2, Loader2 } from 'lucide-react';
import { Tournament } from '../types';
import { tournamentService } from '../services/tournamentService';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

interface TournamentCardProps {
  tournament: Tournament;
  onDelete: (e: React.MouseEvent) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onDelete }) => {
  const statusColors = {
    'Draft': 'bg-slate-700/20 text-slate-400 border-slate-700/50',
    'Open': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 neon-border',
    'Active': 'bg-rivals-neon/10 text-rivals-neon border-rivals-neon/20 animate-glow-pulse',
    'Completed': 'bg-slate-800 text-slate-500 border-slate-700',
  };

  return (
    <Link to={`/tournament/${tournament.id}`} className="group block glass rounded-2xl border border-white/5 overflow-hidden hover:border-rivals-accent/50 hover:shadow-[0_0_50px_rgba(139,92,246,0.15)] transition-all duration-500 relative animate-in zoom-in-95 duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-rivals-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 z-30 p-2 bg-hot/10 text-hot hover:bg-hot hover:text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
        title="Terminate Tournament"
      >
        <Trash2 size={16} />
      </button>

      <div className="h-40 bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-rivals-dark to-transparent z-10" />
        <img
          src={`https://picsum.photos/seed/${tournament.name}/600/400`}
          alt="Cover"
          className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute top-4 left-4 z-20">
          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-xl ${statusColors[tournament.status]}`}>
            {tournament.status}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 z-20">
          <div className="flex items-center gap-2 text-white/50 text-[10px] font-mono tracking-widest font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rivals-neon shadow-[0_0_5px_#22d3ee]" />
            {tournament.game.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-6 relative z-20">
        <h4 className="font-black text-xl mb-2 truncate text-white group-hover:text-rivals-neon transition-colors duration-300 tracking-tight">
          {tournament.name}
        </h4>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-6 font-mono font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
            <Users size={12} className="text-rivals-accent" />
            {tournament.teams.length}/{tournament.maxTeams}
          </span>
          <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">{tournament.teamSize}</span>
          <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5 text-rivals-neon">{tournament.format}</span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div>
            <span className="block text-slate-500 uppercase text-[9px] font-black tracking-widest mb-1">Prize Pool</span>
            <span className="text-white font-black text-sm neon-text">{tournament.prizePool}</span>
          </div>
          <div className="text-right">
            <span className="block text-slate-500 uppercase text-[9px] font-black tracking-widest mb-1">Commences</span>
            <span className="text-slate-300 font-bold text-xs">{new Date(tournament.startDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const { showToast } = useToast();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        setTournaments(await tournamentService.getAll());
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) load();
  }, [refresh, authLoading]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this tournament? This cannot be undone.')) {
      try {
        await tournamentService.delete(id);
        showToast('Tournament scrubbed from database', 'success');
        setRefresh(prev => prev + 1);
      } catch (err) {
        showToast('System error: Termination failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Ultimate Hero Section */}
      <div className="relative rounded-[2.5rem] bg-slate-900 overflow-hidden border border-white/5 shadow-2xl group min-h-[450px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-rivals-accent/30 via-rivals-darker to-rivals-neon/5 z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10 mix-blend-overlay z-10" />
        <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-rivals-accent/10 blur-[150px] rounded-full animate-float pointer-events-none" />

        <div className="relative z-20 p-12 lg:p-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-8 backdrop-blur-xl animate-bounce">
            <div className="w-2 h-2 rounded-full bg-rivals-neon shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Season IV: Rebirth</span>
          </div>

          <h2 className="text-6xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            DOMINATE THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rivals-neon via-rivals-accent to-hot italic">COMPETITION</span>
          </h2>

          <p className="text-slate-400 mb-10 text-xl leading-relaxed font-medium max-w-xl">
            The world's premier destination for Roblox Rivals professionals. Manage events, orchestrate brackets, and etch your name into history.
          </p>

          <div className="flex flex-wrap gap-6">
            <Link to="/create" className="group/btn relative px-8 py-4 bg-white text-rivals-darker rounded-2xl font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-rivals-neon to-rivals-accent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2 group-hover/btn:text-white transition-colors">
                <Play size={20} fill="currentColor" />
                INITIATE TOURNAMENT
              </span>
            </Link>
            <div className="flex -space-x-3 items-center">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} className="w-10 h-10 rounded-full border-2 border-rivals-dark shadow-xl" alt="user" />
              ))}
              <div className="pl-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
                <span className="text-white">1,240+</span> Comrades Online
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Image Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-[45%] bg-gradient-to-l from-rivals-darker/80 to-transparent z-20 hidden lg:block" />
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop"
          className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 hidden lg:block"
          alt="Esports"
        />
      </div>

      {/* Stats War Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Missions', val: tournaments.filter(t => t.status === 'Active').length, icon: Trophy, color: 'text-rivals-neon', bg: 'bg-rivals-neon/5' },
          { label: 'Registered Mercenaries', val: tournaments.reduce((acc, t) => acc + t.teams.length, 0), icon: Users, color: 'text-rivals-accent', bg: 'bg-rivals-accent/5' },
          { label: 'Operation Readiness', val: '99.9%', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
        ].map((stat, i) => (
          <div key={i} className={`glass ${stat.bg} border border-white/5 p-6 rounded-[2rem] flex items-center gap-6 hover:border-white/20 transition-all duration-500 group animate-in slide-in-from-bottom-4 duration-700`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={32} />
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.val}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tactical Overview (Tournament List) */}
      <div>
        <div className="flex items-center justify-between mb-8 px-4">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <Trophy className="text-rivals-neon" />
              TACTICAL OPERATIONS
            </h3>
            <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Global engagement feed</p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-xs font-black text-slate-400 uppercase tracking-widest">
              Active: <span className="text-rivals-neon">{tournaments.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-[2rem] border border-white/5 p-6 h-[400px]">
                <Skeleton className="h-44 rounded-2xl mb-6" />
                <Skeleton className="h-8 w-3/4 mb-4 rounded-lg" variant="text" />
                <Skeleton className="h-4 w-1/2 mb-8 rounded-lg" variant="text" />
                <div className="pt-6 border-t border-white/5 flex justify-between">
                  <Skeleton className="h-6 w-24 rounded-lg" variant="text" />
                  <Skeleton className="h-6 w-24 rounded-lg" variant="text" />
                </div>
              </div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-32 glass rounded-[3rem] border border-dashed border-white/10 max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-slate-600">
              <Trophy size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">No Operations detected</h3>
            <p className="text-slate-500 mb-10 font-medium">The arena is currently quiet. Be the first to launch an event.</p>
            <Link to="/create" className="px-10 py-4 bg-rivals-accent text-white font-black rounded-2xl hover:scale-110 transition-transform inline-block shadow-2xl shadow-rivals-accent/20">
              LAUNCH FIRST MISSION
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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