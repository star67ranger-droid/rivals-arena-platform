import React from 'react';
import { Match, Team, MatchStatus } from '../types';
import { Shield, Trophy, Crown, Plus, Minus, CheckCircle, Zap } from 'lucide-react';

interface BracketProps {
  matches: Match[][];
  onMatchUpdate: (matchId: string, scoreA: number, scoreB: number, winnerId?: string, isComplete?: boolean) => void;
  isAdmin: boolean;
}

type OnMatchUpdate = (matchId: string, scoreA: number, scoreB: number, winnerId?: string, isComplete?: boolean) => void;

interface MatchCardProps {
  match: Match;
  onUpdate: OnMatchUpdate;
  isAdmin: boolean;
  isFinal?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onUpdate, isAdmin, isFinal }) => {
  const isCompleted = match.status === MatchStatus.COMPLETED;
  const isBye = match.status === MatchStatus.BYE;

  const handleScoreChange = (team: 'A' | 'B', delta: number) => {
    if (!isAdmin || isCompleted || isBye) return;
    const newScoreA = team === 'A' ? Math.max(0, match.scoreA + delta) : match.scoreA;
    const newScoreB = team === 'B' ? Math.max(0, match.scoreB + delta) : match.scoreB;
    onUpdate(match.id, newScoreA, newScoreB, undefined, false);
  };

  const handleFinish = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || isCompleted || isBye) return;
    if (match.scoreA === match.scoreB) {
      // In a real app we'd use showToast here, but for brevity we'll keep the logic simple
      return;
    }
    const winnerId = match.scoreA > match.scoreB ? match.teamA!.id : match.teamB!.id;
    if (confirm(`Confirmer le résultat tactique ?`)) {
      onUpdate(match.id, match.scoreA, match.scoreB, winnerId, true);
    }
  };

  const TeamRow = ({ team, score, isWinner, teamKey }: { team?: Team | null; score: number; isWinner?: boolean; teamKey: 'A' | 'B' }) => {
    if (!team) {
      return (
        <div className="px-4 py-3 text-[10px] text-slate-600 font-black uppercase tracking-widest bg-white/5 h-12 flex items-center italic">
          Attente de données...
        </div>
      );
    }
    return (
      <div className={`
          flex items-center justify-between px-4 py-3 transition-all duration-300 h-12
          ${isWinner ? 'bg-rivals-accent/10' : 'hover:bg-white/5'}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden w-full">
          {team.seed && <span className="text-[9px] text-rivals-neon font-black font-mono w-5 h-5 flex items-center justify-center bg-rivals-neon/10 rounded border border-rivals-neon/20">{team.seed}</span>}
          <span className={`text-[11px] font-black uppercase tracking-tight truncate ${isWinner ? 'text-white' : 'text-slate-400'}`}>
            {team.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted && isAdmin && !isBye && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleScoreChange(teamKey, -1); }}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-hot/20 text-slate-500 hover:text-hot border border-white/5 transition-colors"
              >
                <Minus size={10} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleScoreChange(teamKey, 1); }}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-rivals-neon/20 text-slate-500 hover:text-rivals-neon border border-white/5 transition-colors"
              >
                <Plus size={10} />
              </button>
            </div>
          )}
          <span className={`font-mono text-base font-black w-6 text-center ${isWinner ? 'text-rivals-neon neon-text' : 'text-slate-300'}`}>
            {score}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`
      glass border rounded-2xl overflow-hidden relative transition-all duration-500 shadow-2xl group
      ${isFinal ? 'w-80 border-rivals-accent/50 shadow-rivals-accent/10 scale-110 z-10' : 'w-64 border-white/5 hover:border-white/20'}
      ${isCompleted ? 'border-rivals-neon/20 neon-border' : ''}
      ${isBye ? 'opacity-40 border-dashed border-white/10' : ''}
    `}>
      <div className="flex flex-col divide-y divide-white/5">
        <TeamRow
          team={match.teamA}
          score={match.scoreA}
          isWinner={match.winnerId && match.teamA && match.winnerId === match.teamA.id}
          teamKey="A"
        />
        <TeamRow
          team={match.teamB}
          score={match.scoreB}
          isWinner={match.winnerId && match.teamB && match.winnerId === match.teamB.id}
          teamKey="B"
        />
      </div>

      {!isCompleted && !isBye && isAdmin && match.teamA && match.teamB && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-sm bg-rivals-darker/40">
          <button
            onClick={handleFinish}
            className="bg-white text-rivals-darker hover:bg-rivals-neon hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <CheckCircle size={14} /> Terminer l'Opération
          </button>
        </div>
      )}

      {isBye && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[1px]">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-rivals-neon/40">Passage Technique</span>
        </div>
      )}
    </div>
  );
};

interface BracketColumnProps {
  matches: Match[];
  onUpdate: OnMatchUpdate;
  isAdmin: boolean;
  side: 'left' | 'right';
  roundIndex: number;
}

const BracketColumn: React.FC<BracketColumnProps> = ({ matches, onUpdate, isAdmin, side, roundIndex }) => {
  return (
    <div className="flex flex-col justify-around gap-12 relative py-8">
      <div className="absolute top-0 left-0 w-full text-center -translate-y-8">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Tour {roundIndex + 1}</span>
      </div>
      {matches.map(m => (
        <div key={m.id} className="relative flex items-center">
          {/* Enhanced Connectors */}
          {side === 'left' && (
            <div className="absolute -right-8 top-1/2 w-8 h-px bg-white/10 group-hover:bg-rivals-neon/50 transition-colors" />
          )}
          <MatchCard match={m} onUpdate={onUpdate} isAdmin={isAdmin} />
          {side === 'right' && (
            <div className="absolute -left-8 top-1/2 w-8 h-px bg-white/10 group-hover:bg-rivals-neon/50 transition-colors" />
          )}
        </div>
      ))}
    </div>
  )
}

const Bracket: React.FC<BracketProps> = ({ matches, onMatchUpdate, isAdmin }) => {
  if (!matches || matches.length === 0) return null;

  const winnersMatches = matches.filter(round => round.length > 0 && round[0].roundIndex < 100);
  const losersMatches = matches.filter(round => round.length > 0 && round[0].roundIndex >= 100 && round[0].roundIndex < 200);
  const grandFinalMatch = matches.find(round => round.length > 0 && round[0].roundIndex === 200)?.[0];

  const isDoubleElim = losersMatches.length > 0;

  if (isDoubleElim) {
    return (
      <div className="space-y-24 py-12">
        {/* Winners Bracket */}
        <div className="space-y-8 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-2 glass border border-rivals-neon/20 rounded-full">
            <Shield size={16} className="text-rivals-neon animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Tableau des Vainqueurs</span>
          </div>
          <div className="overflow-x-auto flex justify-center min-w-full px-12">
            <div className="flex gap-16">
              {winnersMatches.map((roundMatches, rIdx) => (
                <BracketColumn
                  key={`winners-round-${rIdx}`}
                  matches={roundMatches}
                  onUpdate={onMatchUpdate}
                  isAdmin={isAdmin}
                  side="right"
                  roundIndex={winnersMatches[rIdx][0].roundIndex}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grand Final Intermediary */}
        {grandFinalMatch && (
          <div className="flex flex-col items-center justify-center relative px-12 py-12">
            <div className="absolute inset-0 bg-rivals-accent/5 blur-[100px] rounded-full" />
            <div className="relative mb-6 text-center">
              <Trophy className="text-rivals-neon w-16 h-16 mx-auto drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.5em] block mt-4">Verdict de la Grande Finale</span>
            </div>
            <MatchCard match={grandFinalMatch} onUpdate={onMatchUpdate} isAdmin={isAdmin} isFinal={true} />
          </div>
        )}

        {/* Losers Bracket */}
        <div className="space-y-8 text-center pb-20">
          <div className="inline-flex items-center gap-4 px-6 py-2 glass border border-hot/20 rounded-full">
            <Zap size={16} className="text-hot animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Tableau de Consolidation</span>
          </div>
          <div className="overflow-x-auto flex justify-center min-w-full px-12">
            <div className="flex gap-12">
              {losersMatches.map((roundMatches, rIdx) => (
                <BracketColumn
                  key={`losers-round-${rIdx}`}
                  matches={roundMatches}
                  onUpdate={onMatchUpdate}
                  isAdmin={isAdmin}
                  side="right"
                  roundIndex={losersMatches[rIdx][0].roundIndex - 100}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to Single Elimination Left/Right split (Standard logic)
  const totalRounds = matches.length;
  const finalMatch = matches[totalRounds - 1][0];
  const qualifyingRounds = matches.slice(0, totalRounds - 1);

  const leftSideRounds: Match[][] = [];
  const rightSideRounds: Match[][] = [];

  qualifyingRounds.forEach(round => {
    const midpoint = Math.ceil(round.length / 2);
    leftSideRounds.push(round.slice(0, midpoint));
    rightSideRounds.push(round.slice(midpoint));
  });

  return (
    <div className="overflow-x-auto pb-20 pt-12 flex justify-center min-w-full">
      <div className="flex items-center gap-16 px-12">
        <div className="flex flex-row-reverse gap-16">
          {leftSideRounds.map((roundMatches, rIdx) => (
            <BracketColumn
              key={`left-round-${rIdx}`}
              matches={roundMatches}
              onUpdate={onMatchUpdate}
              isAdmin={isAdmin} side="left" roundIndex={rIdx}
            />
          ))}
        </div>
        <div className="flex flex-col items-center justify-center relative px-12 py-12">
          <div className="absolute inset-0 bg-rivals-accent/5 blur-[100px] rounded-full animate-pulse" />
          <div className="relative mb-8 text-center animate-bounce">
            <Trophy className="text-rivals-neon w-20 h-20 mx-auto" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] block mt-4">Verdict Suprême</span>
          </div>
          <MatchCard match={finalMatch} onUpdate={onMatchUpdate} isAdmin={isAdmin} isFinal={true} />
        </div>
        <div className="flex flex-row gap-16">
          {rightSideRounds.map((roundMatches, rIdx) => (
            <BracketColumn
              key={`right-round-${rIdx}`}
              matches={roundMatches}
              onUpdate={onMatchUpdate}
              isAdmin={isAdmin} side="right" roundIndex={rIdx}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bracket;