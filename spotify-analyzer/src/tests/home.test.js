import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Home from '../components/Home';
import { apiService } from '../services/api';

jest.mock('../services/api');
jest.mock('../services/Theme', () => {
    const React = require('react');
    return {
        Theme: React.createContext({ isDarkMode: false }),
    };
});

// setup API mocks
apiService.getTopArtists = jest.fn();
apiService.getTopGenre = jest.fn();
apiService.getTopTracks = jest.fn();
apiService.getRecentlyPlayed = jest.fn();
apiService.getRecommendations = jest.fn();
apiService.checkSpotifyStatus = jest.fn();
apiService.getUserArtistMinigameTimeById = jest.fn();
apiService.getUserTrackMinigameTimeById = jest.fn();
apiService.getAllUsers = jest.fn();
apiService.registerUser = jest.fn();


//rendering home component inside memory router (faking a router inside the test)
describe('Home Component', () => {
    const renderHome = async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        sessionStorage.setItem('spotify_access_token', 'mock_token');

        apiService.getTopArtists.mockResolvedValue({
            items: [
                {
                    id: 'artist1',
                    name: 'Mock Artist 1',
                    popularity: 80,
                    images: [{ url: 'https://mockurl.com/image1.jpg' }],
                },
                {
                    id: 'artist2',
                    name: 'Mock Artist 2',
                    popularity: 85,
                    images: [{ url: 'https://mockurl.com/image2.jpg' }],
                },
                {
                    id: 'artist3',
                    name: 'Mock Artist 3',
                    popularity: 78,
                    images: [{ url: 'https://mockurl.com/image3.jpg' }],
                },
                {
                    id: 'artist4',
                    name: 'Mock Artist 4',
                    popularity: 90,
                    images: [{ url: 'https://mockurl.com/image4.jpg' }],
                },
            ],
        });


        apiService.getTopTracks.mockResolvedValue({
            items: [
                {
                    id: 'track1',
                    name: 'Mock Track 1',
                    album: { images: [{ url: 'https://mockurl.com/track1.jpg' }] },
                    artists: [{ name: 'Artist 1' }],
                },
                {
                    id: 'track2',
                    name: 'Mock Track 2',
                    album: { images: [{ url: 'https://mockurl.com/track2.jpg' }] },
                    artists: [{ name: 'Artist 2' }],
                },
                {
                    id: 'track3',
                    name: 'Mock Track 3',
                    album: { images: [{ url: 'https://mockurl.com/track3.jpg' }] },
                    artists: [{ name: 'Artist 3' }],
                },
                {
                    id: 'track4',
                    name: 'Mock Track 4',
                    album: { images: [{ url: 'https://mockurl.com/track4.jpg' }] },
                    artists: [{ name: 'Artist 4' }],
                },
                {
                    id: 'track5',
                    name: 'Mock Track 5',
                    album: { images: [{ url: 'https://mockurl.com/track5.jpg' }] },
                    artists: [{ name: 'Artist 5' }],
                },
            ],
        });


        apiService.getRecentlyPlayed.mockResolvedValue({ items: [] });
        apiService.getRecommendations.mockResolvedValue([
            {
                id: 'Bat Country',
                name: 'Recommended Track 1',
                album: { images: [{ url: 'https://mockurl.com/rec1.jpg' }] },
                artists: [{ name: 'Avenged Sevenfold' }],
            },
        ]);
        apiService.getTopGenre.mockResolvedValue('indie pop');
        apiService.checkSpotifyStatus.mockResolvedValue({
            authenticated: true,
            profile: { id: 'user123', display_name: 'stacie' },
        });
        apiService.getUserArtistMinigameTimeById.mockResolvedValue({
            artistMinigameTime: 42,
        });
        apiService.getUserTrackMinigameTimeById.mockResolvedValue({
            trackMinigameTime: 99,
        });
        apiService.getAllUsers.mockResolvedValue([]);
        apiService.registerUser.mockResolvedValue({});
    });

    it('displays header and top genre correctly', async () => {
        await renderHome();

        await waitFor(() => {
            expect(screen.getByText('Overview of Your Listening Habits')).toBeInTheDocument();
            expect(screen.getByText('Your Top Genre')).toBeInTheDocument();
            expect(screen.getByText('indie pop')).toBeInTheDocument();
        });
    });

    it('displays top 4 artists', async () => {
        await renderHome();

        const artistCards = await screen.findAllByRole('img', { name: /mock artist/i });

        expect(artistCards).toHaveLength(4);
    });

    it('always displays a blurred panel when the user first logs in', async () => {
        await renderHome();

        await waitFor(() => {
            const blurredPanel = document.querySelector('.blurred-panel-container .blurred');
            expect(blurredPanel).toBeTruthy();
        });
    });

    it('displays top 5 songs', async () => {
        await renderHome();

        const songImages = await screen.findAllByAltText(/mock track/i);
        expect(songImages).toHaveLength(5);
    });

    it('displays at least one recommendation', async () => {
        await renderHome();

        const recommendations = await screen.findAllByText(/recommendation/i);

        expect(recommendations.length).toBeGreaterThan(0);
    });




    it('changes time range when selected', async () => {
        await renderHome();

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'short_term' } });

        expect(select.value).toBe('short_term');

        await waitFor(() => {
            expect(apiService.getTopArtists).toHaveBeenCalledWith('short_term', 4);
            expect(apiService.getTopTracks).toHaveBeenCalledWith('short_term', 5);
        });
    });
});