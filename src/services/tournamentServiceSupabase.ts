import { supabase } from '../lib/supabase';
import { Tournament, Team, Match, TournamentFormat, MatchStatus, TeamSize } from '../types';
import { discordService } from './discordService';
import { playerService } from './playerService';

// --- Helpers for Type Conversion ---
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

const mapMatch = (m: any, teams: Team[]): Match => ({
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
    nextMatchPosition: m.next_match_position,
    loserMatchId: m.loser_match_id,
    loserMatchPosition: m.loser_match_position
});

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

        return tournaments.map(t => ({
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
            teams: [],
            matches: [],
            pendingPlayers: []
        }));
    },

    getById: async (id: string): Promise<Tournament | null> => {
        const { data: t, error: tErr } = await supabase.from('tournaments').select('*').eq('id', id).single();
        if (tErr || !t) return null;

        const { data: teamsData } = await supabase.from('teams').select(`*, team_members(*)`).eq('tournament_id', id);
        const teams = (teamsData || []).map(mapTeam);

        const { data: matchesData } = await supabase
            .from('matches')
            .select('*')
            .eq('tournament_id', id)
            .order('round_index', { ascending: true })
            .order('match_index', { ascending: true });

        const matchesFlat = (matchesData || []).map(m => mapMatch(m, teams));

        const rounds: Match[][] = [];
        if (matchesFlat.length > 0) {
            const maxRound = Math.max(...matchesFlat.map(m => m.roundIndex));
            for (let i = 0; i <= maxRound; i++) {
                rounds.push(matchesFlat.filter(m => m.roundIndex === i));
            }
        }

        const { data: pendingData } = await supabase.from('pending_players').select('*').eq('tournament_id', id);

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

        if (t) discordService.notifyTournamentCreated(t as any);

        return mapTournament(t, [], [], []);
    },

    delete: async (id: string): Promise<void> => {
        await supabase.from('tournaments').delete().eq('id', id);
    },

    registerPlayer: async (tournamentId: string, username: string, rivalsLevel: number): Promise<{ success: boolean, message: string }> => {
        const t = await tournamentServiceSupabase.getById(tournamentId);
        if (!t || t.status !== 'Open') return { success: false, message: 'Registration closed' };

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

    startTournament: async (id: string): Promise<{ success: boolean, message: string }> => {
        const t = await tournamentServiceSupabase.getById(id);
        if (!t) return { success: false, message: 'Not found' };
        if (t.status !== 'Open') return { success: false, message: 'Already started' };

        // 1. Team Balancing & Registration Conversion
        if (t.pendingPlayers && t.pendingPlayers.length > 0) {
            const players = [...t.pendingPlayers].sort((a, b) => b.rivalsLevel - a.rivalsLevel);
            const teamSize = t.teamSize === TeamSize.SQUAD ? 5 : t.teamSize === TeamSize.DUO ? 2 : 1;

            const newTeamsData = [];
            while (players.length >= teamSize) {
                const chunk = players.splice(0, teamSize);
                const avgSkill = Math.round(chunk.reduce((s, p) => s + p.rivalsLevel, 0) / teamSize);
                newTeamsData.push({
                    name: teamSize === 1 ? chunk[0].username : `Team ${chunk[0].username}`,
                    skill_level: avgSkill,
                    members: chunk.map(p => p.username)
                });
            }

            for (const teamData of newTeamsData) {
                const { data: teamRow } = await supabase.from('teams').insert({
                    tournament_id: id,
                    name: teamData.name,
                    skill_level: teamData.skill_level
                }).select().single();

                if (teamRow) {
                    await supabase.from('team_members').insert(teamData.members.map(uname => ({
                        team_id: teamRow.id,
                        player_username: uname
                    })));
                }
            }
            await supabase.from('pending_players').delete().eq('tournament_id', id);
        }

        const tUpdated = await tournamentServiceSupabase.getById(id);
        if (!tUpdated || tUpdated.teams.length < 2) return { success: false, message: 'At least 2 teams required' };

        if (tUpdated.format === TournamentFormat.DOUBLE_ELIMINATION) {
            return tournamentServiceSupabase.startDoubleElimination(id, tUpdated.teams);
        }

        // 2. Bracket Generation (Single Elimination)
        const teams = [...tUpdated.teams];
        const teamCount = teams.length;
        const roundsCount = Math.ceil(Math.log2(teamCount));
        const totalMatchesCount = Math.pow(2, roundsCount) - 1;

        // Pre-create match rows to get IDs for linking
        const matchPromises = [];
        for (let r = 0; r < roundsCount; r++) {
            const matchesInRound = Math.pow(2, roundsCount - r - 1);
            for (let m = 0; m < matchesInRound; m++) {
                matchPromises.push(supabase.from('matches').insert({
                    tournament_id: id,
                    round_index: r,
                    match_index: m,
                    status: 'PENDING'
                }).select().single());
            }
        }

        const results = await Promise.all(matchPromises);
        const matchRows = results.map(r => r.data).filter(Boolean);

        // 3. Linking & Initial Seeding
        for (let r = 0; r < roundsCount; r++) {
            const matchesInRound = Math.pow(2, roundsCount - r - 1);
            for (let m = 0; m < matchesInRound; m++) {
                const currentMatch = matchRows.find(row => row.round_index === r && row.match_index === m);
                if (!currentMatch) continue;

                // Link to next round
                if (r < roundsCount - 1) {
                    const nextMatchIndex = Math.floor(m / 2);
                    const nextMatch = matchRows.find(row => row.round_index === r + 1 && row.match_index === nextMatchIndex);
                    if (nextMatch) {
                        await supabase.from('matches').update({
                            next_match_id: nextMatch.id,
                            next_match_position: m % 2 === 0 ? 'A' : 'B'
                        }).eq('id', currentMatch.id);
                    }
                }

                // Initial Seeding for Round 0
                if (r === 0) {
                    const teamA = teams[m * 2];
                    const teamB = teams[m * 2 + 1];

                    const updates: any = {
                        team_a_id: teamA?.id || null,
                        team_b_id: teamB?.id || null,
                    };

                    if (!teamB) {
                        updates.status = 'BYE';
                        updates.winner_id = teamA.id;
                    } else if (teamA && teamB) {
                        updates.status = 'READY';
                    }

                    await supabase.from('matches').update(updates).eq('id', currentMatch.id);

                    // If BYE, propagate to next match immediately
                    if (updates.status === 'BYE' && currentMatch.id) {
                        const nextMatchIndex = Math.floor(m / 2);
                        const nextMatch = matchRows.find(row => row.round_index === 1 && row.match_index === nextMatchIndex);
                        if (nextMatch) {
                            const pos = m % 2 === 0 ? 'team_a_id' : 'team_b_id';
                            const { data: updatedNext } = await supabase.from('matches').update({ [pos]: teamA.id }).eq('id', nextMatch.id).select().single();
                            if (updatedNext && updatedNext.team_a_id && updatedNext.team_b_id) {
                                await supabase.from('matches').update({ status: 'READY' }).eq('id', updatedNext.id);
                            }
                        }
                    }
                }
            }
        }

        await supabase.from('tournaments').update({ status: 'Active' }).eq('id', id);
        return { success: true, message: 'Tournament started. Brackets generated.' };
    },

    startDoubleElimination: async (id: string, teams: Team[]): Promise<{ success: boolean, message: string }> => {
        const teamCount = teams.length;
        const winnersRounds = Math.ceil(Math.log2(teamCount));
        const matchPromises = [];

        // 1. Winners Bracket Matches
        for (let r = 0; r < winnersRounds; r++) {
            const matchesInRound = Math.pow(2, winnersRounds - r - 1);
            for (let m = 0; m < matchesInRound; m++) {
                matchPromises.push(supabase.from('matches').insert({
                    tournament_id: id,
                    round_index: r,
                    match_index: m,
                    status: 'PENDING'
                }).select().single());
            }
        }

        // 2. Losers Bracket Matches (Rounds 100+)
        const losersRounds = (winnersRounds - 1) * 2;
        for (let r = 0; r < losersRounds; r++) {
            const matchesInRound = Math.pow(2, winnersRounds - 2 - Math.floor(r / 2));
            if (matchesInRound < 1) continue;
            for (let m = 0; m < matchesInRound; m++) {
                matchPromises.push(supabase.from('matches').insert({
                    tournament_id: id,
                    round_index: 100 + r,
                    match_index: m,
                    status: 'PENDING'
                }).select().single());
            }
        }

        // 3. Grand Final Match (Round 200)
        matchPromises.push(supabase.from('matches').insert({
            tournament_id: id,
            round_index: 200,
            match_index: 0,
            status: 'PENDING'
        }).select().single());

        const results = await Promise.all(matchPromises);
        const matchRows = results.map(r => r.data).filter(Boolean);

        // 4. Linking Logic
        for (let r = 0; r < winnersRounds; r++) {
            const matchesInRound = Math.pow(2, winnersRounds - r - 1);
            for (let m = 0; m < matchesInRound; m++) {
                const current = matchRows.find(row => row.round_index === r && row.match_index === m);
                if (!current) continue;

                // Advanced Winner
                if (r < winnersRounds - 1) {
                    const next = matchRows.find(row => row.round_index === r + 1 && row.match_index === Math.floor(m / 2));
                    if (next) await supabase.from('matches').update({ next_match_id: next.id, next_match_position: m % 2 === 0 ? 'A' : 'B' }).eq('id', current.id);
                } else {
                    const gf = matchRows.find(row => row.round_index === 200);
                    if (gf) await supabase.from('matches').update({ next_match_id: gf.id, next_match_position: 'A' }).eq('id', current.id);
                }

                // Drop Loser
                const loserRound = r === 0 ? 100 : 100 + (r * 2 - 1);
                const loserMatch = matchRows.find(row => row.round_index === loserRound && row.match_index === m);
                if (loserMatch) {
                    await supabase.from('matches').update({
                        loser_match_id: loserMatch.id,
                        loser_match_position: r === 0 ? (m % 2 === 0 ? 'A' : 'B') : 'B'
                    }).eq('id', current.id);
                }
            }
        }

        // Initial Seeding for Double Elim
        const r0Matches = matchRows.filter(row => row.round_index === 0).sort((a, b) => a.match_index - b.match_index);
        for (let m = 0; m < r0Matches.length; m++) {
            const teamA = teams[m * 2];
            const teamB = teams[m * 2 + 1];
            const updates: any = { team_a_id: teamA?.id || null, team_b_id: teamB?.id || null };

            if (!teamB) {
                updates.status = 'BYE';
                updates.winner_id = teamA.id;
            }
            else if (teamA && teamB) {
                updates.status = 'READY';
            }

            await supabase.from('matches').update(updates).eq('id', r0Matches[m].id);

            // Handle BYE advancement propagation
            if (updates.status === 'BYE') {
                const current = r0Matches[m];
                // Advance to winner bracket
                if (current.next_match_id) {
                    const pos = current.next_match_position === 'A' ? 'team_a_id' : 'team_b_id';
                    const { data: updatedNext } = await supabase.from('matches').update({ [pos]: teamA.id }).eq('id', current.next_match_id).select().single();
                    if (updatedNext && updatedNext.team_a_id && updatedNext.team_b_id) {
                        await supabase.from('matches').update({ status: 'READY' }).eq('id', updatedNext.id);
                    }
                }
                // (Losers don't drop on a BYE win)
            }
        }

        await supabase.from('tournaments').update({ status: 'Active' }).eq('id', id);
        return { success: true, message: 'Double Elimination started.' };
    },

    updateMatch: async (tournamentId: string, matchId: string, scoreA: number, scoreB: number, winnerId?: string, isComplete: boolean = false): Promise<Tournament | null> => {
        const { data: currentMatch } = await supabase.from('matches').select('*').eq('id', matchId).single();
        if (!currentMatch) return null;

        const updates: any = { score_a: scoreA, score_b: scoreB };

        if (isComplete && winnerId) {
            updates.winner_id = winnerId;
            updates.status = 'COMPLETED';
            const loserId = winnerId === currentMatch.team_a_id ? currentMatch.team_b_id : currentMatch.team_a_id;

            // --- Real Elo Integration ---
            // Calculate base rating change (e.g., +25 for win, -15 for loss)
            // Ideally should be calculated based on opponent rating, but this is a solid baseline for v1
            const winChange = 25;
            const lossChange = -15;

            // Get all players for both teams
            const { data: teamMembers } = await supabase
                .from('team_members')
                .select('player_username')
                .in('team_id', [currentMatch.team_a_id, currentMatch.team_b_id].filter(Boolean));

            if (teamMembers) {
                for (const member of teamMembers) {
                    // We need the profile ID. Fetch by username.
                    const profile = await playerService.getByName(member.player_username);
                    if (profile) {
                        const isWinner = (winnerId === currentMatch.team_a_id && currentMatch.team_a_id === profile.id) || // Need to check if player's team won
                            (winnerId === currentMatch.team_b_id && currentMatch.team_b_id === profile.id);

                        // BUT wait, member.team_id isn't in my selection. Let's fix.
                    }
                }
            }

            // Refactored Elo update loop
            const { data: memberDetails } = await supabase
                .from('team_members')
                .select('team_id, player_username')
                .in('team_id', [currentMatch.team_a_id, currentMatch.team_b_id].filter(Boolean));

            if (memberDetails) {
                for (const member of memberDetails) {
                    const isWinnerTeam = member.team_id === winnerId;
                    const profile = await playerService.getByName(member.player_username);
                    if (profile) {
                        await playerService.updateStats(profile.id, isWinnerTeam, isWinnerTeam ? winChange : lossChange);
                    }
                }
            }

            // --- Advancement Logic ---
            if (currentMatch.next_match_id) {
                const pos = currentMatch.next_match_position === 'A' ? 'team_a_id' : 'team_b_id';
                const { data: nextMatch } = await supabase.from('matches').update({ [pos]: winnerId }).eq('id', currentMatch.next_match_id).select().single();

                // Only set READY if both teams are present
                if (nextMatch && nextMatch.team_a_id && nextMatch.team_b_id) {
                    await supabase.from('matches').update({ status: 'READY' }).eq('id', nextMatch.id);
                }
            } else {
                await supabase.from('tournaments').update({ status: 'Completed', winner_team_id: winnerId }).eq('id', tournamentId);
            }

            // Loser Drop (Double Elimination)
            if (currentMatch.loser_match_id && loserId) {
                const lPos = currentMatch.loser_match_position === 'A' ? 'team_a_id' : 'team_b_id';
                const { data: lMatch } = await supabase.from('matches').update({ [lPos]: loserId }).eq('id', currentMatch.loser_match_id).select().single();

                if (lMatch && lMatch.team_a_id && lMatch.team_b_id) {
                    await supabase.from('matches').update({ status: 'READY' }).eq('id', lMatch.id);
                }
            }
        }

        await supabase.from('matches').update(updates).eq('id', matchId);
        return tournamentServiceSupabase.getById(tournamentId);
    },

    removeTeam: async (tournamentId: string, teamId: string): Promise<void> => {
        await supabase.from('teams').delete().eq('id', teamId);
    }
};
