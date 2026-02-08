import React from 'react';
import { Match, Team, MatchStatus } from '../types';
import { Shield, Trophy, Crown, Plus, Minus, CheckCircle } from 'lucide-react';

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

    // Update without finishing
    onUpdate(match.id, newScoreA, newScoreB, undefined, false);
  };

  const handleFinish = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || isCompleted || isBye) return;
    if (match.scoreA === match.scoreB) {
      alert("Cannot finish match with a tie!");
      return;
    }
    const winnerId = match.scoreA > match.scoreB ? match.teamA!.id : match.teamB!.id;
    const winnerName = match.scoreA > match.scoreB ? match.teamA!.name : match.teamB!.name;

    if (confirm(`End match? Winner: ${winnerName}`)) {
      onUpdate(match.id, match.scoreA, match.scoreB, winnerId, true);
    }
  };

  const TeamRow = ({ team, score, isWinner, teamKey }: { team?: Team | null; score: number; isWinner?: boolean; teamKey: 'A' | 'B' }) => {
    if (!team) {
      return (
        <div className="px-3 py-2 text-xs text-slate-600 italic bg-slate-800/50 h-8 flex items-center">
          TBD
        </div>
      );
    }
    return (
      <div className={`
          flex items-center justify-between px-3 py-2 transition-colors h-10
          ${isWinner ? 'bg-violet-500/10' : ''}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden w-full">
          {team.seed && <span className="text-[10px] text-slate-500 font-mono w-4 text-center bg-slate-800 rounded">{team.seed}</span>}
          <span className={`text-xs font-medium truncate ${isWinner ? 'text-white' : 'text-slate-400'}`}>
            {team.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && isAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleScoreChange(teamKey, -1); }}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white"
              >
                <Minus size={10} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleScoreChange(teamKey, 1); }}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white"
              >
                <Plus size={10} />
              </button>
            </div>
          )}
          <span className={`font-mono text-sm font-bold w-6 text-center ${isWinner ? 'text-cyan-400' : 'text-slate-200'}`}>
            {score}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`
      bg-slate-800 border rounded-lg overflow-hidden relative transition-all duration-300 shadow-lg group
      ${isFinal ? 'w-72 border-amber-500/50 shadow-amber-900/20 scale-110 z-10' : 'w-60 border-slate-700'}
      ${isCompleted ? 'border-violet-500/30' : ''}
      ${isBye ? 'opacity-60 border-dashed' : ''}
    `}>
      <div className="flex flex-col divide-y divide-slate-700/50">
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={handleFinish}
            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"
          >
            <CheckCircle size={12} /> End Match
          </button>
        </div>
      )}

      {isBye && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">BYE</span>
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
}

// Helper for Column Layout
const BracketColumn: React.FC<BracketColumnProps> = ({ matches, onUpdate, isAdmin, side }) => {
  return (
    <div className="flex flex-col justify-around gap-6">
      {matches.map(m => (
        <div key={m.id} className="relative flex items-center">
          {/* Connectors for Left Side */}
          {side === 'left' && (
            <>
              {/* Line extending right towards center */}
              <div className="absolute -right-4 top-1/2 w-4 h-0.5 bg-slate-700" />
              {/* Vertical connector would normally be here, simplified for CSS grid */}
            </>
          )}

          <MatchCard match={m} onUpdate={onUpdate} isAdmin={isAdmin} />

          {/* Connectors for Right Side */}
          {side === 'right' && (
            <div className="absolute -left-4 top-1/2 w-4 h-0.5 bg-slate-700" />
          )}
        </div>
      ))}
    </div>
  )
}

const Bracket: React.FC<BracketProps> = ({ matches, onMatchUpdate, isAdmin }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-16 text-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/30">
        <Shield className="w-16 h-16 text-slate-600 mx-auto mb-6 opacity-50" />
        <h3 className="text-xl font-bold text-slate-300">Bracket Pending</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
          The tournament bracket will be generated automatically once the organizer starts the tournament.
        </p>
      </div>
    );
  }

  // --- Layout Logic ---
  // We want: [ Left Bracket ] [ Finals ] [ Right Bracket ]
  // Left Bracket: Contains the first half of matches for Rounds 0 to N-2
  // Right Bracket: Contains the second half of matches for Rounds 0 to N-2
  // Final: The single match in Round N-1

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
    <div className="overflow-x-auto pb-12 pt-8 flex justify-center min-w-full">
      <div className="flex items-center gap-8 px-4">

        {/* LEFT SIDE (Qualifiers) */}
        <div className="flex flex-row-reverse gap-8">
          {leftSideRounds.map((roundMatches, rIdx) => (
            <BracketColumn
              key={`left-round-${rIdx}`}
              matches={roundMatches}
              onUpdate={onMatchUpdate}
              isAdmin={isAdmin}
              side="left"
            />
          ))}
        </div>

        {/* CENTER (Finals) */}
        <div className="flex flex-col items-center justify-center relative px-8">
          <Trophy className="text-yellow-400 w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse" />
          <MatchCard
            match={finalMatch}
            onUpdate={onMatchUpdate}
            isAdmin={isAdmin}
            isFinal={true}
          />
          {finalMatch.status === MatchStatus.COMPLETED && finalMatch.winnerId && (
            <div className="absolute -bottom-16 text-center w-64 animate-in zoom-in slide-in-from-bottom-4">
              <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-2 rounded-full font-bold flex items-center justify-center gap-2">
                <Crown size={16} fill="currentColor" />
                CHAMPION: {finalMatch.scoreA > finalMatch.scoreB ? finalMatch.teamA?.name : finalMatch.teamB?.name}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE (Qualifiers) */}
        <div className="flex flex-row gap-8">
          {rightSideRounds.map((roundMatches, rIdx) => (
            <BracketColumn
              key={`right-round-${rIdx}`}
              matches={roundMatches}
              onUpdate={onMatchUpdate}
              isAdmin={isAdmin}
              side="right"
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Bracket;