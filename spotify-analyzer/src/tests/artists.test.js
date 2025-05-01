import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Artists from '../components/Artists';
import { apiService } from '../services/api';

// mock the apiService
jest.mock('../services/api', () => ({
    apiService: {
        getTopArtists: jest.fn(),
        getArtistInfo: jest.fn(),
        fetchArtistSummary: jest.fn(),
        searchArtists: jest.fn(),
    },
}));

// mock the theme context
jest.mock('../services/Theme', () => {
    const React = require('react');
    return {
        Theme: React.createContext({ isDarkMode: false }),
    };
});

//dynamically creating the 14 top artists
const mockTopArtists = Array.from({ length: 14 }, (_, index) => ({
    id: String(index + 1),
    name: `Artist ${index + 1}`,
    images: [{ url: `image${index + 1}.jpg` }],
}));


const mockArtistInfo = {
    name: 'Test Artist',
    genres: ['pop'],
    popularity: 80,
    followers: { total: 10000 },
};


const mockArtistSummary = 'This is a test summary about the artist.';


const renderArtists = async () => {
    render(
        <MemoryRouter>
            <Artists />
        </MemoryRouter>
    );
};

describe('Artists Component', () => {
    beforeEach(() => {
        sessionStorage.setItem('spotify_access_token', 'mock_token');

        apiService.getTopArtists.mockResolvedValue({items: mockTopArtists});
        apiService.getArtistInfo.mockResolvedValue(mockArtistInfo);
        apiService.fetchArtistSummary.mockResolvedValue(mockArtistSummary);
        apiService.searchArtists.mockResolvedValue({artists: {items: [mockArtistInfo]}});
    });

    it('renders header and time range selector', async () => {
        await renderArtists();
        expect(await screen.findByText(/Overview of Your Favourite Artists/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument(); // FIX: select instead of label
    });

    it('displays 14 top artists', async () => {
        await renderArtists();
        const artistImages = await screen.findAllByRole('img', {name: /artist/i});
        expect(artistImages.length).toBe(14);
    });

    it('displays a blurred panel', async () => {
        await renderArtists();
        expect(await screen.findByText(/Your Top Artists/i)).toBeInTheDocument(); // Find something inside blurred panel
    });

    it('time selector works on command', async () => {
        await renderArtists();

        // waits until the arrists have been loaded
        await screen.findAllByText(/^Artist 1$/i);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, {target: {value: 'short_term'}});
        expect(select.value).toBe('short_term');

        await waitFor(() => {
            expect(apiService.getTopArtists).toHaveBeenCalledWith('short_term', 14);
        });
    });

    it('opens artist summary modal after clicking summary button', async () => {
        await renderArtists();
        const buttons = await screen.findAllByText(/Get Artist Info/i);
        fireEvent.click(buttons[0]);

        const summaryButton = await screen.findByRole('button', {name: /Artist Summary/i});
        fireEvent.click(summaryButton);

        await waitFor(() => {
            const modal = document.querySelector('.artist-page-modal.summary-modal');
            expect(modal).toBeInTheDocument();
        });
    });

    it('searches and shows artist info after entering valid name', async () => {
        await renderArtists();

        const input = await screen.findByPlaceholderText(/Enter artist name/i);
        fireEvent.change(input, {target: {value: 'Test Artist'}});

        const searchButtons = await screen.findAllByRole('button', {name: /Search/i});
        fireEvent.click(searchButtons[0]);
        const infoButtons = await screen.findAllByText(/Get Artist Info/i);
        fireEvent.click(infoButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/Popularity/i)).toBeInTheDocument();
        });
    });
});
