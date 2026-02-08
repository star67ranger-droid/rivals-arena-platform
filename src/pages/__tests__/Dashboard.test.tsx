import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { tournamentService } from '../../services/tournamentService';

// Mock the service
vi.mock('../../services/tournamentService', () => ({
    tournamentService: {
        getAll: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('Dashboard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders empty state when no tournaments exist', () => {
        vi.mocked(tournamentService.getAll).mockReturnValue([]);

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByText(/No tournaments yet/i)).toBeInTheDocument();
    });

    it('renders tournament list when tournaments exist', () => {
        const mockTournaments: any[] = [{
            id: '1',
            name: 'Test Tournament',
            status: 'Open',
            teams: [],
            maxTeams: 16,
            startDate: new Date().toISOString(),
            prizePool: 'None',
            game: 'Roblox Rivals',
            format: 'Single Elimination',
            teamSize: 'Solo'
        }];

        vi.mocked(tournamentService.getAll).mockReturnValue(mockTournaments);

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByText('Test Tournament')).toBeInTheDocument();
    });
});
