import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TournamentFormat, TeamSize } from '../types';
import { tournamentService } from '../services/tournamentService';
import {
  ChevronRight, Dna, Trophy, Calendar,
  AlertCircle, Loader2, Sparkles,
  Target, Zap, ShieldCheck
} from 'lucide-react';
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
    prizePool: '1 000 Robux',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Nomenclature de l'opération requise");
      return;
    }

    try {
      setLoading(true);
      const newTournament = await tournamentService.create(formData);
      if (newTournament) {
        showToast('Opération initialisée avec succès', 'success');
        navigate(`/tournament/${newTournament.id}`);
      } else {
        setError("Échec du système lors de l'initialisation");
      }
    } catch (e) {
      setError("La séquence d'initialisation a échoué");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in zoom-in-95 duration-700">
      <div className="mb-12 relative">
        <h2 className="text-6xl font-black text-white mb-2 tracking-tighter italic uppercase underline decoration-rivals-neon decoration-8 underline-offset-[10px]">
          Lancer <span className="text-rivals-accent">l'Événement</span>
        </h2>
        <p className="text-slate-500 text-xl font-medium tracking-tight">Configurez les paramètres globaux de votre tournoi.</p>
        <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
          <Trophy size={140} />
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 glass bg-hot/10 border border-hot/30 rounded-3xl flex items-center gap-4 text-hot animate-bounce">
          <AlertCircle size={28} />
          <span className="font-black text-sm uppercase tracking-widest">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Module 1: Core Specs */}
        <div className="glass-heavy border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles size={80} className="text-rivals-accent" />
          </div>

          <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-white italic uppercase tracking-tighter">
            <Trophy size={24} className="text-rivals-accent" /> Schéma Tactique
          </h3>

          <div className="space-y-8">
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Titre de l'Opération</label>
              <input
                type="text"
                required
                className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-lg focus:ring-4 focus:ring-rivals-accent/20 focus:border-rivals-accent outline-none transition-all placeholder:text-slate-700"
                placeholder="ex. PROJET TEMPÊTE NÉON"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Briefing de Mission / Règles</label>
              <textarea
                className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium focus:ring-4 focus:ring-rivals-accent/20 focus:border-rivals-accent outline-none transition-all h-32 placeholder:text-slate-700 resize-none"
                placeholder="Définissez les règles du tournoi et les attentes des joueurs..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Module 2: Rules of Engagement */}
        <div className="glass-heavy border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Dna size={80} className="text-rivals-neon" />
          </div>

          <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-white italic uppercase tracking-tighter">
            <Target size={24} className="text-rivals-neon" /> Paramètres du Format
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Mode d'Engagement</label>
              <select
                className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:ring-4 focus:ring-rivals-neon/20 outline-none cursor-pointer appearance-none"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value as TeamSize })}
              >
                <option value={TeamSize.SOLO}>Combat 1v1</option>
                <option value={TeamSize.DUO}>Tactique 2v2</option>
                <option value={TeamSize.SQUAD}>Raid d'Escouade 5v5</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Logique du Tournoi</label>
              <select
                className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:ring-4 focus:ring-rivals-neon/20 outline-none cursor-pointer appearance-none"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as TournamentFormat })}
              >
                <option value={TournamentFormat.SINGLE_ELIMINATION}>Élimination Directe (Soudaine)</option>
                <option value={TournamentFormat.DOUBLE_ELIMINATION}>Élimination Double (Tenace)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Capacité de Combattants</label>
              <select
                className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:ring-4 focus:ring-rivals-neon/20 outline-none cursor-pointer appearance-none"
                value={formData.maxTeams}
                onChange={(e) => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
              >
                {[4, 8, 16, 32, 64].map(size => (
                  <option key={size} value={size}>{size} Slots de Déploiement</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Récompense de Victoire</label>
              <input
                type="text"
                className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-4 text-rivals-neon font-black text-lg focus:ring-4 focus:ring-rivals-neon/20 outline-none placeholder:text-slate-700 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]"
                placeholder="ex. 100 000 Crédits"
                value={formData.prizePool}
                onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10">
          <div className="flex items-center gap-4 text-slate-500">
            <ShieldCheck size={24} className="text-emerald-500" />
            <p className="text-xs font-bold uppercase tracking-widest leading-tight">La vérification côté serveur <br /> sera active pour cette mission.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-12 py-6 bg-white text-rivals-darker hover:bg-rivals-neon hover:text-white rounded-[2rem] font-black text-lg shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-rivals-neon/30 transition-all duration-500 transform hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 group"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="group-hover:fill-current" />}
            {loading ? 'INITIALISATION...' : 'INITIALISER L\'OPÉRATION'} <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;