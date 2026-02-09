import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { tournamentService } from '../services/tournamentService';
import { Tournament, MatchStatus } from '../types';
import Bracket from '../components/Bracket';
import { Users, Clock, Trophy, Share2, Plus, PlayCircle, AlertTriangle, Trash2, ArrowLeft, BarChart, LogIn, Loader2 } from 'lucide-react';
import Skeleton from '../components/Skeleton';

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bracket' | 'teams' | 'overview'>('teams');

  useEffect(() => {
    refreshData();

    // Real-time Subscription
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
      showToast('Error loading results', 'error');
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
        showToast('Match score updated!', 'success');
      }
    } catch (err) {
      showToast('Failed to update match', 'error');
    }
  };

  const handleJoin = async () => {
    if (!tournament || !user) return;
    try {
      const res = await tournamentService.registerPlayer(tournament.id, user.username, user.profile?.rivalsLevel || 1);
      if (res.success) {
        showToast('Successfully joined the queue!', 'success');
        refreshData();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Connection error during join', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" variant="text" />
            <Skeleton className="h-4 w-32" variant="text" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30">
                {tournament.status}
              </span>
              <span className="text-slate-500 text-xs">• Created by Admin</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{tournament.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors">
            <Share2 size={20} />
          </button>
          {!tournament.teams.some(t => t.players.some(p => p.username === user?.username)) && (
            <button
              onClick={handleJoin}
              disabled={tournament.status !== 'Open'}
              className="px-6 py-2.5 bg-rivals-accent hover:bg-violet-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-violet-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} /> Join Tournament
            </button>
          )}
          {isAdmin && tournament.status === 'Open' && (
            <button
              onClick={() => tournamentService.startTournament(tournament.id).then(() => refreshData())}
              className="px-6 py-2.5 bg-white text-slate-950 hover:bg-slate-200 font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
            >
              <PlayCircle size={20} /> Start Event
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {[
          { id: 'teams', label: 'Participants', icon: Users },
          { id: 'bracket', label: 'Bracket / Results', icon: BarChart },
          { id: 'overview', label: 'Rules & Info', icon: Trophy },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2">
          {activeTab === 'bracket' ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="flex items-center gap-2 text-[10px] text-cyan-400 font-black uppercase tracking-widest bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                  <Loader2 size={12} className="animate-spin" /> Live Updates Sync
                </span>
              </div>
              <Bracket
                matches={tournament.matches}
                onUpdateMatch={handleMatchUpdate}
                isAdmin={isAdmin}
              />
            </div>
          ) : activeTab === 'teams' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournament.teams.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                  <Users className="mx-auto text-slate-700 mb-3" size={40} />
                  <p className="text-slate-500">Waiting for players to join...</p>
                </div>
              )}
              {tournament.teams.map((team, idx) => (
                <div key={team.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white">{team.players.map(p => p.username).join(' & ')}</p>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        Team Rating: {Math.round(team.players.reduce((acc, p) => acc + (p.rating || 1000), 0) / team.players.length)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 prose prose-invert max-w-none">
              <h2 className="text-xl font-bold text-white mb-4">Tournament Information</h2>
              <p className="text-slate-400 leading-relaxed">{tournament.description || 'No description provided.'}</p>

              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-cyan-400"><Clock size={20} /></div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Start Time</p>
                    <p className="text-white font-medium">{new Date(tournament.startDate).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-violet-400"><Trophy size={20} /></div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prize Pool</p>
                    <p className="text-white font-medium">{tournament.prizePool}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Live Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4 py-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500">Registration</span>
                <span className="text-xs font-black text-white">{tournament.teams.length} / {tournament.maxTeams} Teams</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500">Format</span>
                <span className="text-xs font-black text-white">{tournament.format}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500">Waitlist</span>
                <span className="text-xs font-black text-cyan-400">{tournament.pendingPlayers.length} Queueing</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-900/20 to-slate-900 border border-violet-500/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={18} className="text-amber-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Admin Notice</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              Scores are verified by the server. Cheating or score manipulation will result in a permanent ban.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;