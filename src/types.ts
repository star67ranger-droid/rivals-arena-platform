export enum TournamentFormat {
  SINGLE_ELIMINATION = 'Single Elimination',
  DOUBLE_ELIMINATION = 'Double Elimination',
  ROUND_ROBIN = 'Round Robin'
}

export enum TeamSize {
  SOLO = '1v1',
  DUO = '2v2',
  SQUAD = '5v5'
}

export enum MatchStatus {
  PENDING = 'Pending',      // Waiting for players
  READY = 'Ready',          // Players are set, waiting to start
  IN_PROGRESS = 'Live',     // Currently being played
  COMPLETED = 'Completed',  // Result entered
  BYE = 'Bye'               // Automatic win
}

export interface Player {
  id: string;
  username: string;
  rivalsLevel?: number; // 1-500
  robloxId?: string;
  avatarUrl?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserProfile extends Player {
  bio?: string;
  wins: number;
  losses: number;
  tournamentsPlayed: number;
  rating: number; // Elo or Points
  rank: string; // e.g. "Bronze", "Silver", "Gold", "Champion"
  achievements: string[]; // List of IDs
  socials?: {
    discord?: string;
    twitter?: string;
  };
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  seed?: number;
  skillLevel?: number; // Average of players' rivalsLevel
}

export interface Match {
  id: string;
  roundIndex: number;
  matchIndex: number;
  teamA?: Team | null; // null represents a placeholder or Bye
  teamB?: Team | null;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  status: MatchStatus;
  nextMatchId?: string; // ID of the match the winner advances to
  nextMatchPosition?: 'A' | 'B'; // Position in the next match
  loserMatchId?: string; // ID of the match the loser drops into (Double Elimination)
  loserMatchPosition?: 'A' | 'B'; // Position in the loser match
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game: 'Roblox Rivals';
  format: TournamentFormat;
  teamSize: TeamSize;
  maxTeams: number;
  status: 'Draft' | 'Open' | 'Active' | 'Completed';
  startDate: string;
  prizePool: string;
  teams: Team[];
  pendingPlayers?: Player[]; // For individual signups
  matches: Match[][];
  winnerTeamId?: string;
}