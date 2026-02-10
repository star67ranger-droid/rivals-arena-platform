import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { tournamentService } from '../services/tournamentService';
import { Tournament } from '../types';
import Bracket from '../components/Bracket';
import {
  Users, Trophy, Share2, Plus, PlayCircle,
  ArrowLeft, BarChart2, Loader2, Sparkles,
  ShieldCheck, Activity, Info
} from 'lucide-react';
import Skeleton from '../components/Skeleton';

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bracket' | 'teams' | 'overview'>('bracket');

  useEffect(() => {
    refreshData();

    if (!id) return;

    const channel = supabase
      .channel(`tournament-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${id}` }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams', filter: `tournament_id=eq.${id}` }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `tournament_id=eq.${id}` }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_players', filter: `tournament_id=eq.${id}` }, () => refreshData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const refreshData = async () => {
    if (!id) return;
    try {
      const t = await tournamentService.getById(id);
      if (t) {
        setTournament(t);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading live feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchUpdate = async (matchId: string, scoreA: number, scoreB: number, winnerId?: string, isComplete: boolean = false) => {
    if (!tournament) return;
    try {
      const updated = await tournamentService.updateMatch(tournament.id, matchId, scoreA, scoreB, winnerId, isComplete);
      if (updated) {
        setTournament(updated);
        showToast('Strategic outcome recorded', 'success');
      }
    } catch (err) {
      showToast('Failed to sync outcome', 'error');
    }
  };

  const handleJoin = async () => {
    if (!tournament || !user) return;
    try {
      const res = await tournamentService.registerPlayer(tournament.id, user.username, user.profile?.rivalsLevel || 1);
      if (res.success) {
        showToast('Deployment confirmed: Entered queue', 'success');
        refreshData();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Connection interrupted', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center gap-6">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-80 rounded-lg" />
            <Skeleton className="h-4 w-40 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="space-y-8 pb-32 animate-in fade-in zoom-in-95 duration-700">
      {/* War Room Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 glass-heavy p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-rivals-neon/10 border border-rivals-neon/20 rounded-full animate-glow-pulse">
            <Activity size={12} className="text-rivals-neon" />
            <span className="text-[10px] font-black text-rivals-neon tracking-widest uppercase">Live Link Active</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="p-4 glass hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all group active:scale-90"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${tournament.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  tournament.status === 'Active' ? 'bg-rivals-neon/10 text-rivals-neon border-rivals-neon/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]' :
                    'bg-slate-800 text-slate-500 border-white/5'
                }`}>
                {tournament.status}
              </span>
              <span className="text-slate-500 font-mono text-[10px] font-bold tracking-widest uppercase">ID: {tournament.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase italic">
              {tournament.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-4 glass hover:bg-white/10 text-slate-300 rounded-2xl hover:text-rivals-neon transition-all">
            <Share2 size={24} />
          </button>

          {!tournament.teams.some(t => t.players.some(p => p.username === user?.username)) && tournament.status === 'Open' && (
            <button
              onClick={handleJoin}
              className="px-8 py-4 bg-rivals-accent hover:bg-violet-500 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] flex items-center gap-3 active:scale-95"
            >
              <Plus size={24} /> DEPLOY TO ARENA
            </button>
          )}

          {isAdmin && tournament.status === 'Open' && (
            <button
              onClick={() => tournamentService.startTournament(tournament.id).then(() => refreshData())}
              className="px-8 py-4 bg-white text-rivals-darker hover:bg-slate-200 font-black rounded-2xl transition-all shadow-xl flex items-center gap-3 active:scale-95"
            >
              <PlayCircle size={24} /> COMMENCE OPERATION
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 p-2 glass rounded-2xl border border-white/5 w-fit">
        {[
          { id: 'bracket', label: 'Tactical Bracket', icon: BarChart2 },
          { id: 'teams', label: 'Combatants', icon: Users },
          { id: 'overview', label: 'Mission Brief', icon: Info },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === tab.id
                ? 'bg-rivals-accent text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {activeTab === 'bracket' ? (
            <div className="glass-heavy border border-white/5 rounded-[2.5rem] p-10 min-h-[600px] relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <Bracket
                  matches={tournament.matches}
                  onUpdateMatch={handleMatchUpdate}
                  isAdmin={isAdmin}
                />
              </div>

              {tournament.matches.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                  <Trophy size={64} className="text-slate-800 mb-6 animate-pulse" />
                  <h3 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Bracket Pending Generation</h3>
                  <p className="text-slate-600 font-medium max-w-sm">Awaiting sufficient combatant deployment to initialize tactical grid.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'teams' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournament.teams.length === 0 && (
                <div className="col-span-full py-32 text-center glass rounded-[2.5rem] border border-dashed border-white/10">
                  <Users className="mx-auto text-slate-800 mb-6" size={64} />
                  <p className="text-slate-500 font-black uppercase tracking-widest">No combatants reported for duty</p>
                </div>
              )}
              {tournament.teams.map((team, idx) => (
                <div key={team.id} className="group glass border border-white/5 p-6 rounded-3xl hover:border-rivals-neon/30 transition-all duration-500 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 glass-heavy rounded-2xl flex items-center justify-center font-black text-xl text-rivals-neon border border-white/10 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-xl text-white tracking-tight">{team.players.map(p => p.username).join(' & ')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          Combat Readiness: {Math.round(team.players.reduce((acc, p) => acc + (p.rating || 1000), 0) / team.players.length)} Elo
                        </p>
                      </div>
                    </div>
                  </div>
                  <ShieldCheck size={24} className="text-slate-800 group-hover:text-rivals-neon transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-heavy border border-white/5 rounded-[2.5rem] p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rivals-accent to-transparent" />
              <h2 className="text-3xl font-black text-white italic tracking-tighter mb-8 flex items-center gap-4">
                <Sparkles className="text-rivals-accent" /> MISSION PARAMETERS
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  {tournament.description || 'No specific mission brief provided by High Command.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pt-16 border-t border-white/5">
                <div className="flex items-center gap-6 glass p-6 rounded-3xl">
                  <div className="p-4 bg-white/5 rounded-2xl text-rivals-neon"><PlayCircle size={32} /></div>
                  <div>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[.3em] mb-1">Execution Date</p>
                    <p className="text-white font-black text-xl">{new Date(tournament.startDate).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 glass p-6 rounded-3xl">
                  <div className="p-4 bg-white/5 rounded-2xl text-rivals-accent"><Trophy size={32} /></div>
                  <div>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[.3em] mb-1">Pot Rewards</p>
                    <p className="text-white font-black text-xl">{tournament.prizePool}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Live Feed Sidebar Card */}
          <div className="glass-heavy border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-rivals-neon opacity-20" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[.3em] mb-8 flex items-center justify-between">
              Live Intel
              <Loader2 size={12} className="animate-spin text-rivals-neon" />
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <span>Grid Capacity</span>
                  <span className="text-white">{Math.round((tournament.teams.length / tournament.maxTeams) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rivals-accent to-rivals-neon transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    style={{ width: `${(tournament.teams.length / tournament.maxTeams) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                {[
                  { label: 'Deployed', val: `${tournament.teams.length} Teams` },
                  { label: 'Operation', val: tournament.format },
                  { label: 'Hot Waitlist', val: `${tournament.pendingPlayers.length} Souls`, color: 'text-rivals-neon' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center group/row cursor-default">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/row:text-slate-300 transition-colors">{row.label}</span>
                    <span className={`text-xs font-black ${row.color || 'text-white'} group-hover/row:scale-110 transition-transform`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rivals-accent/10 to-rivals-neon/5 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
            <div className="relative z-10">
              <Trophy size={32} className="text-rivals-accent mb-6" />
              <h4 className="text-lg font-black text-white italic tracking-tighter mb-4 uppercase">Dominance Notice</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Verified combat outcomes are final. Anti-cheat metrics are active for all active match links.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rivals-accent/20 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;