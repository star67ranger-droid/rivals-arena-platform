import { supabase } from '../lib/supabase';
import { Tournament, Team, Match, TournamentFormat, MatchStatus, TeamSize } from '../types';
import { discordService } from './discordService';

// --- Helpers for Type Conversion ---
// Supabase returns snake_case, our app uses camelCase

const mapTeam = (t: any): Team => ({
    id: t.id,
    name: t.name,
    seed: t.seed,
    skillLevel: t.skill_level,
    players: t.team_members ? t.team_members.map((tm: any) => ({
        id: tm.player_id,
        username: tm.player_username
    })) : []
});

const mapMatch = (m: any, teams: Team[]): Match => {
    return {
        id: m.id,
        roundIndex: m.round_index,
        matchIndex: m.match_index,
        teamA: m.team_a_id ? teams.find(t => t.id === m.team_a_id) || null : null,
        teamB: m.team_b_id ? teams.find(t => t.id === m.team_b_id) || null : null,
        scoreA: m.score_a,
        scoreB: m.score_b,
        winnerId: m.winner_id,
        status: m.status as MatchStatus,
        nextMatchId: m.next_match_id,
        nextMatchPosition: m.next_match_position
    };
};

const mapTournament = (t: any, teams: Team[], matches: Match[][], pendingPlayers: any[]): Tournament => ({
    id: t.id,
    name: t.name,
    description: t.description,
    game: t.game,
    format: t.format as TournamentFormat,
    teamSize: t.team_size as TeamSize,
    maxTeams: t.max_teams,
    status: t.status,
    startDate: t.start_date,
    prizePool: t.prize_pool,
    winnerTeamId: t.winner_team_id,
    teams: teams,
    matches: matches,
    pendingPlayers: pendingPlayers.map(p => ({
        id: p.id,
        username: p.username,
        rivalsLevel: p.rivals_level
    }))
});

export const tournamentServiceSupabase = {
    getAll: async (): Promise<Tournament[]> => {
        const { data: tournaments, error } = await supabase
            .from('tournaments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !tournaments) return [];

        // For list view, we might not need full details, but for now let's load basic info
        // To avoid N+1, ideally we'd load details only on detail page, but sticking to existing interface
        // We will return lightweight objects here and load full details in getById
        return tournaments.map(t => ({
            ...t,
            teams: [],
            matches: [],
            pendingPlayers: []
        })) as any;
    },

    getById: async (id: string): Promise<Tournament | null> => {
        // 1. Get Tournament
        const { data: t, error: tErr } = await supabase.from('tournaments').select('*').eq('id', id).single();
        if (tErr || !t) return null;

        // 2. Get Teams & Members
        const { data: teamsData } = await supabase
            .from('teams')
            .select(`*, team_members(*)`)
            .eq('tournament_id', id);

        const teams = (teamsData || []).map(mapTeam);

        // 3. Get Matches
        const { data: matchesData } = await supabase
            .from('matches')
            .select('*')
            .eq('tournament_id', id)
            .order('round_index', { ascending: true })
            .order('match_index', { ascending: true });

        const matchesFlat = (matchesData || []).map(m => mapMatch(m, teams));

        // Group matches by round
        const rounds: Match[][] = [];
        if (matchesFlat.length > 0) {
            const maxRound = Math.max(...matchesFlat.map(m => m.roundIndex));
            for (let i = 0; i <= maxRound; i++) {
                rounds.push(matchesFlat.filter(m => m.roundIndex === i));
            }
        }

        // 4. Get Pending Players
        const { data: pendingData } = await supabase
            .from('pending_players')
            .select('*')
            .eq('tournament_id', id);

        return mapTournament(t, teams, rounds, pendingData || []);
    },

    create: async (data: Partial<Tournament>): Promise<Tournament | null> => {
        const { data: t, error } = await supabase
            .from('tournaments')
            .insert({
                name: data.name,
                description: data.description,
                game: 'Roblox Rivals',
                format: data.format,
                team_size: data.teamSize,
                max_teams: data.maxTeams,
                status: 'Open',
                start_date: data.startDate,
                prize_pool: data.prizePool
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            return null;
        }

        if (t) discordService.notifyTournamentCreated(t as any); // Type cast for now

        return mapTournament(t, [], [], []);
    },

    delete: async (id: string): Promise<void> => {
        await supabase.from('tournaments').delete().eq('id', id);
    },

    registerPlayer: async (tournamentId: string, username: string, rivalsLevel: number): Promise<{ success: boolean, message: string }> => {
        // Check if Open
        const t = await tournamentServiceSupabase.getById(tournamentId);
        if (!t || t.status !== 'Open') return { success: false, message: 'Registration closed' };

        // Check duplicates
        const existing = t.pendingPlayers?.find(p => p.username.toLowerCase() === username.toLowerCase());
        if (existing) return { success: false, message: 'Already registered' };

        const { error } = await supabase.from('pending_players').insert({
            tournament_id: tournamentId,
            username,
            rivals_level: rivalsLevel
        });

        if (error) return { success: false, message: error.message };
        return { success: true, message: 'Registered successfully' };
    },

    removePlayer: async (tournamentId: string, playerId: string): Promise<void> => {
        // Note: playerId here is the UUID of the pending_player row
        await supabase.from('pending_players').delete().eq('id', playerId);
    },

    // --- Complex Logic: Auto Balance & Start ---
    // Moving the heavy lifting to client-side logic for now, then saving results to DB
    // Ideally this would be a Supabase Edge Function, but let's keep it simple.

    startTournament: async (id: string): Promise<{ success: boolean, message: string }> => {
        const t = await tournamentServiceSupabase.getById(id);
        if (!t) return { success: false, message: 'Not found' };

        // 1. Auto Balance Logic (Reuse existing logic)
        // ... (Simulate: We get the pending players, create teams in DB)

        let finalTeams = [...t.teams];

        if (t.pendingPlayers && t.pendingPlayers.length > 0) {
            // Sort
            const players = [...t.pendingPlayers].sort((a, b) => b.rivalsLevel - a.rivalsLevel);

            // Generate Teams objects locally first
            const newTeamsData = [];

            let teamSize = 1;
            if (t.teamSize === TeamSize.DUO) teamSize = 2;
            if (t.teamSize === TeamSize.SQUAD) teamSize = 5;

            // Simple balancing logic copy-paste
            if (teamSize === 2) {
                while (players.length >= 2) {
                    const high = players.shift()!;
                    const low = players.pop()!;
                    const avg = Math.round((high.rivalsLevel + low.rivalsLevel) / 2);
                    newTeamsData.push({
                        name: `${high.username} & ${low.username}`,
                        skill_level: avg,
                        members: [high.username, low.username] // We store usernames
                    });
                }
            } else {
                while (players.length >= teamSize) {
                    const chunk = players.splice(0, teamSize);
                    const avg = Math.round(chunk.reduce((sum, p) => sum + p.rivalsLevel, 0) / teamSize);
                    newTeamsData.push({
                        name: teamSize === 1 ? chunk[0].username : `Team ${chunk[0].username}`,
                        skill_level: avg,
                        members: chunk.map(p => p.username)
                    });
                }
            }

            // Save Teams to DB
            for (const teamData of newTeamsData) {
                const { data: teamRow } = await supabase.from('teams').insert({
                    tournament_id: id,
                    name: teamData.name,
                    skill_level: teamData.skill_level
                }).select().single();

                if (teamRow) {
                    // Add Members
                    const membersPayload = teamData.members.map(uname => ({
                        team_id: teamRow.id,
                        player_username: uname
                    }));
                    await supabase.from('team_members').insert(membersPayload);
                }
            }

            // Clear pending
            await supabase.from('pending_players').delete().eq('tournament_id', id);
        }

        // Refetch to get all teams with IDs
        const tUpdated = await tournamentServiceSupabase.getById(id);
        if (!tUpdated || tUpdated.teams.length < 2) return { success: false, message: 'Not enough teams' };

        // 2. Generate Bracket (Matches)
        // reusing local logic for structure, then saving to DB
        // We need the generateSingleEliminationBracket function accessible or copied.
        // For brevity, I'll assume we can use the one from tournamentService if we export it, 
        // OR re-implement simplified version here. 
        // Let's implement a simple saver.

        // ... (Bracket generation logic omitted for brevity in this step, but would involve inserting rows into 'matches')
        // We need to define the bracket structure in DB.

        // Let's postpone full bracket GEN to next step and just mark active for now to test connection
        await supabase.from('tournaments').update({ status: 'Active' }).eq('id', id);

        return { success: true, message: 'Tournament started (Bracket generation pending implementation)' };
    },

    updateMatch: async (tournamentId: string, matchId: string, scoreA: number, scoreB: number, winnerId?: string, isComplete: boolean = false): Promise<Tournament | null> => {
        // Update Match Row
        const updates: any = {
            score_a: scoreA,
            score_b: scoreB
        };

        if (isComplete && winnerId) {
            updates.winner_id = winnerId;
            updates.status = 'COMPLETED';
        }

        await supabase.from('matches').update(updates).eq('id', matchId);

        // If complete, advance logic (needs to read next_match_id and update that match)
        if (isComplete && winnerId) {
            const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();
            if (match && match.next_match_id) {
                const updateNext: any = {};
                if (match.next_match_position === 'A') updateNext.team_a_id = winnerId;
                else updateNext.team_b_id = winnerId;

                await supabase.from('matches').update(updateNext).eq('id', match.next_match_id);
            } else {
                // Finish Tournament
                await supabase.from('tournaments').update({
                    status: 'Completed',
                    winner_team_id: winnerId
                }).eq('id', tournamentId);
            }
        }

        return tournamentServiceSupabase.getById(tournamentId);
    },

    removeTeam: async (tournamentId: string, teamId: string): Promise<void> => {
        await supabase.from('teams').delete().eq('id', teamId);
    }
};
