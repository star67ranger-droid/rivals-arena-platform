import { Tournament, Match } from '../types';

const WEBHOOK_KEY = 'rivals_discord_webhook';

export const discordService = {
    getWebhookUrl: (): string => {
        return localStorage.getItem(WEBHOOK_KEY) || '';
    },

    setWebhookUrl: (url: string): void => {
        localStorage.setItem(WEBHOOK_KEY, url);
    },

    sendEmbed: async (embed: any) => {
        const url = discordService.getWebhookUrl();
        if (!url) return;

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] }),
            });
        } catch (error) {
            console.error('Failed to send Discord webhook:', error);
        }
    },

    notifyTournamentCreated: async (tournament: Tournament) => {
        await discordService.sendEmbed({
            title: '🏆 New Tournament Created!',
            description: `**${tournament.name}** is now open for registration!`,
            color: 0x8b5cf6, // Violet
            fields: [
                { name: 'Format', value: tournament.format, inline: true },
                { name: 'Team Size', value: tournament.teamSize, inline: true },
                { name: 'Prize Pool', value: tournament.prizePool, inline: true },
                { name: 'Start Date', value: new Date(tournament.startDate).toLocaleDateString(), inline: true },
            ],
            footer: { text: 'Rivals Arena • Tournament OS' },
            timestamp: new Date().toISOString(),
        });
    },

    notifyMatchComplete: async (tournamentName: string, match: Match) => {
        if (!match.winnerId || !match.teamA || !match.teamB) return;

        const winnerName = match.winnerId === match.teamA.id ? match.teamA.name : match.teamB.name;
        const loserName = match.winnerId === match.teamA.id ? match.teamB.name : match.teamA.name;
        const score = `${match.scoreA} - ${match.scoreB}`;

        await discordService.sendEmbed({
            title: '⚔️ Match Finished',
            description: `**${winnerName}** defeated **${loserName}** in ${tournamentName}!`,
            color: 0x22d3ee, // Cyan
            fields: [
                { name: 'Score', value: `\`${score}\``, inline: true },
                { name: 'Round', value: `Round ${match.roundIndex + 1}`, inline: true },
            ],
            footer: { text: 'Rivals Arena • Live Updates' },
            timestamp: new Date().toISOString(),
        });
    },

    notifyTournamentChampion: async (tournament: Tournament, winnerName: string) => {
        await discordService.sendEmbed({
            title: '👑 Tournament Champion!',
            description: `Congratulations to **${winnerName}** for winning **${tournament.name}**!`,
            color: 0xfacc15, // Yellow/Gold
            thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png' }, // Generic trophy icon
            footer: { text: 'Rivals Arena • Hall of Fame' },
            timestamp: new Date().toISOString(),
        });
    }
};
