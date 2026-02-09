import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TournamentFormat, TeamSize } from '../types';
import { tournamentService } from '../services/tournamentService';
import { ChevronRight, Dna, Trophy, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: TournamentFormat.SINGLE_ELIMINATION,
    teamSize: TeamSize.SOLO,
    maxTeams: 8,
    prizePool: '1,000 Robux',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Tournament name is required");
      return;
    }

    try {
      setLoading(true);
      const newTournament = await tournamentService.create(formData);
      if (newTournament) {
        showToast('Tournament created successfully!', 'success');
        navigate(`/tournament/${newTournament.id}`);
      } else {
        setError("Failed to create tournament");
      }
    } catch (e) {
      setError("Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create Tournament</h2>
        <p className="text-slate-400">Setup your Rivals Arena competition settings.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-violet-400">
            <Trophy size={18} /> Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tournament Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                placeholder="e.g. Summer Showdown 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all h-24 placeholder:text-slate-700 resize-none"
                placeholder="Rules, requirements, and details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Format & Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-cyan-400">
            <Dna size={18} /> Format & Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Game Mode</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value as TeamSize })}
              >
                <option value={TeamSize.SOLO}>1v1 Duel</option>
                <option value={TeamSize.DUO}>2v2 Wingman</option>
                <option value={TeamSize.SQUAD}>5v5 Team Battle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Format</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as TournamentFormat })}
              >
                <option value={TournamentFormat.SINGLE_ELIMINATION}>Single Elimination</option>
                <option value={TournamentFormat.DOUBLE_ELIMINATION} disabled>Double Elimination (Pro Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Max Teams</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                value={formData.maxTeams}
                onChange={(e) => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
              >
                <option value={4}>4 Teams</option>
                <option value={8}>8 Teams</option>
                <option value={16}>16 Teams</option>
                <option value={32}>32 Teams</option>
                <option value={64}>64 Teams</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Prize Pool</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-700"
                placeholder="e.g. 1000 Robux"
                value={formData.prizePool}
                onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-violet-900/20 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? 'Launching...' : 'Launch Tournament'} <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;