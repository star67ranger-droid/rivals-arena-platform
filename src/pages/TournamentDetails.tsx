import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tournamentService } from '../services/tournamentService';
import { Tournament, MatchStatus } from '../types';
import Bracket from '../components/Bracket';
import { Users, Clock, Trophy, Share2, Plus, PlayCircle, AlertTriangle, Trash2, ArrowLeft, BarChart, LogIn } from 'lucide-react';

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<'bracket' | 'teams' | 'overview'>('teams');
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Form State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerLevel, setNewPlayerLevel] = useState(5);

  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshData = async () => {
    if (!id) return;
    const t = await tournamentService.getById(id);
    if (t) {
      setTournament(t);
      // Auto-switch to bracket if active
      if (t.status === 'Active' && activeTab === 'teams' && t.matches.length > 0) {
        // Don't auto switch constantly, only initial
      }
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    refreshData();
    // Use interval to simulate real-time mostly for score updates in a multi-user context simulation
    // Ideally this would be websocket
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    // Pre-fill user data if joining
    if (user && !isAdmin) {
      setNewPlayerName(user.username);
      if (user.profile) {
        setNewPlayerLevel(user.profile.rivalsLevel || 5);
      }
    }
  }, [user, isAdmin]);

  const handleMatchUpdate = async (matchId: string, scoreA: number, scoreB: number, winnerId?: string, isComplete: boolean = false) => {
    if (!tournament) return;
    const updated = await tournamentService.updateMatch(tournament.id, matchId, scoreA, scoreB, winnerId, isComplete);
    if (updated) {
      setTournament(updated);

      // Discord Notification only on completion
      if (isComplete && winnerId) {
        // We need to find the match object to pass it details
        // Since 'updated' has the new state, we can find it there.
        let match: any;
        for (const round of updated.matches) {
          match = round.find(m => m.id === matchId);
          if (match) break;
        }

        if (match) {
          import('../services/discordService').then(({ discordService }) => {
            discordService.notifyMatchComplete(updated.name, match);

            if (updated.status === 'Completed' && updated.winnerTeamId) {
              const winnerName = updated.teams.find(t => t.id === updated.winnerTeamId)?.name;
              if (winnerName) discordService.notifyTournamentChampion(updated, winnerName);
            }
          });
        }
      }
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament || !newPlayerName.trim()) return;

    // Use registerPlayer instead of addTeam
    const result = await tournamentService.registerPlayer(tournament.id, newPlayerName.trim(), newPlayerLevel);

    if (result.success) {
      showToast('Joined successfully! You are in the pending list.', 'success');
      setJoinModalOpen(false);
      // Only reset if admin
      if (isAdmin) {
        setNewPlayerName('');
        setNewPlayerLevel(5);
      }
      refreshData();
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleStartTournament = async () => {
    if (!tournament) return;
    if (confirm('Start tournament now? Teams will be auto-balanced from pending players.')) {
      const result = await tournamentService.startTournament(tournament.id);
      if (result.success) {
        showToast('Tournament started!', 'success');
        refreshData();
        setActiveTab('bracket');
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!tournament) return;
    if (confirm('Remove this team?')) {
      await tournamentService.removeTeam(tournament.id, teamId);
      showToast('Team removed', 'success');
      refreshData();
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!tournament) return;
    if (confirm('Remove this player?')) {
      await tournamentService.removePlayer(tournament.id, playerId);
      showToast('Player removed', 'success');
      refreshData();
    }
  };

  if (!tournament) return <div className="flex h-screen items-center justify-center text-slate-500">Loading Tournament...</div>;

  const isRegistered = tournament.pendingPlayers?.some(p => p.username === user?.username) ||
    tournament.teams.some(t => t.players.some(p => p.username === user?.username));

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-2xl border flex items-center gap-2 animate-in slide-in-from-right-10 fade-in duration-300 ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
          {toast.type === 'success' ? <Trophy size={18} /> : <AlertTriangle size={18} />}
          <span className="font-bold">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/')} className="mb-4 text-slate-500 hover:text-white flex items-center gap-1 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${tournament.status === 'Active' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                tournament.status === 'Open' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  tournament.status === 'Completed' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                {tournament.status}
              </span>
              <span className="text-slate-500 text-sm font-mono">{tournament.game}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">{tournament.name}</h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
                <Users size={14} className="text-cyan-400" />
                {(tournament.teams.length * (tournament.teamSize === '2v2' ? 2 : 1)) + (tournament.pendingPlayers?.length || 0)} Players
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
                <Trophy size={14} className="text-yellow-400" />
                Pool: <span className="text-white">{tournament.prizePool}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAdmin && tournament.status === 'Open' && (
              <button
                onClick={handleStartTournament}
                disabled={(tournament.teams.length < 2 && (!tournament.pendingPlayers || tournament.pendingPlayers.length < 2))}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20"
              >
                <PlayCircle size={20} /> Start Tournament
              </button>
            )}

            {tournament.status === 'Open' && !isRegistered && (
              <button
                onClick={() => setJoinModalOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-900/20"
              >
                <Plus size={20} /> {isAdmin ? "Register Player" : "Join Tournament"}
              </button>
            )}

            {isRegistered && !isAdmin && (
              <div className="bg-slate-800 text-cyan-400 font-bold px-6 py-3 rounded-lg flex items-center gap-2 border border-slate-700">
                <Users size={20} /> Registered
              </div>
            )}

            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 border border-slate-700">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-800 flex gap-1">
          {[
            { id: 'teams', label: 'Participants', icon: Users },
            { id: 'bracket', label: 'Bracket', icon: Trophy },
            { id: 'overview', label: 'Overview', icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'border-violet-500 text-violet-400 bg-slate-900/20'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/10'
                }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'bracket' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isAdmin && (
              <div className="flex items-center justify-between mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-slate-300">Live Updates Enabled</p>
                </div>
                <p className="text-xs text-slate-500 italic">
                  * Admin Mode: Use +/- and Finish button to manage matches.
                </p>
              </div>
            )}
            <Bracket
              matches={tournament.matches}
              onMatchUpdate={handleMatchUpdate}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="animate-in fade-in">

            {/* Pending Players Section */}
            {tournament.status === 'Open' && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Pending Players ({tournament.pendingPlayers?.length || 0})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {tournament.pendingPlayers?.map(player => (
                    <div key={player.id} className="bg-slate-900/50 border border-slate-700/50 rounded p-3 flex flex-col relative group">
                      <span className="font-bold text-white truncate">{player.username}</span>
                      <span className="text-xs text-cyan-400 font-mono">Lvl {player.rivalsLevel}</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="absolute top-1 right-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!tournament.pendingPlayers || tournament.pendingPlayers.length === 0) && (
                    <div className="col-span-full text-slate-500 text-sm italic">No players registered yet.</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Formed Teams</h3>
              <span className="text-sm text-slate-500">{tournament.teams.length} / {tournament.maxTeams} slots filled</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.teams.map((team, i) => (
                <div key={team.id} className="group bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between hover:border-slate-600 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center font-bold text-slate-400 border border-slate-700 shadow-inner">
                      {team.seed ? <span className="text-xs font-mono text-cyan-400">#{team.seed}</span> : (i + 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{team.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="flex items-center gap-1"><BarChart size={10} /> Avg Lvl {team.skillLevel}</span>
                      </p>
                      <div className="flex gap-1 mt-1">
                        {team.players.map(p => (
                          <span key={p.id} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{p.username}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {isAdmin && tournament.status === 'Open' && (
                    <button
                      onClick={() => handleRemoveTeam(team.id)}
                      className="text-slate-600 hover:text-red-400 p-2 rounded hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove Team"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 animate-in fade-in">
            <h3 className="text-lg font-bold mb-4">About this Tournament</h3>
            <p className="text-slate-400 leading-relaxed max-w-2xl mb-8">
              {tournament.description || "No description provided."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Format Settings</h4>
                <ul className="space-y-3">
                  <li className="flex justify-between text-sm py-2 border-b border-slate-800">
                    <span className="text-slate-500">Game Mode</span>
                    <span className="text-white font-medium">{tournament.teamSize}</span>
                  </li>
                  <li className="flex justify-between text-sm py-2 border-b border-slate-800">
                    <span className="text-slate-500">Structure</span>
                    <span className="text-white font-medium">{tournament.format}</span>
                  </li>
                  <li className="flex justify-between text-sm py-2 border-b border-slate-800">
                    <span className="text-slate-500">Max Teams</span>
                    <span className="text-white font-medium">{tournament.maxTeams}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Prize Distribution</h4>
                <div className="bg-gradient-to-r from-violet-900/20 to-slate-900 p-4 rounded-lg border border-violet-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="text-yellow-400" size={20} />
                    <span className="text-xl font-bold text-white">{tournament.prizePool}</span>
                  </div>
                  <p className="text-xs text-slate-500">Winner takes all (Default)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Join Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setJoinModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              x
            </button>
            <h3 className="text-xl font-bold mb-1 text-white">{isAdmin ? "Register Player" : "Join Tournament"}</h3>
            <p className="text-slate-500 text-sm mb-6">{isAdmin ? "Enter details manually." : "Confirm your participation."}</p>

            <form onSubmit={handleJoin}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Roblox Username</label>
                  <input
                    autoFocus
                    type="text"
                    required
                    readOnly={!isAdmin}
                    className={`w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-700 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    placeholder="e.g. xSlayer_99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Rivals Level (1-500)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-700"
                    value={newPlayerLevel}
                    onChange={e => setNewPlayerLevel(Number(e.target.value))}
                  />
                  <p className="text-xs text-slate-600 mt-2">Used for auto-balancing teams.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlayerName.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                >
                  {isAdmin ? "Register Player" : "Confirm Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;