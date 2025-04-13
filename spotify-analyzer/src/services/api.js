// src/services/api.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const fetchHelper = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            credentials: 'include',
            ...options,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error in fetchHelper for URL: ${url}`, error);
        throw error;
    }
};

export const apiService = {
    checkStatus: async () => fetchHelper(`${BACKEND_URL}/status`),

    getSpotifyAuthUrl: async () => fetchHelper(`${BACKEND_URL}/spotify/login`),

    exchangeCodeForToken: async (code) => {
        const params = new URLSearchParams();
        params.append('code', code);

        return fetchHelper(`${BACKEND_URL}/spotify/token-exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        });
    },

    checkSpotifyStatus: async () => fetchHelper(`${BACKEND_URL}/spotify/status`, {
        headers: { 'Accept': 'application/json' },
    }),

    logoutFromSpotify: async () => fetchHelper(`${BACKEND_URL}/spotify/logout`, { method: 'POST' }),

    getTopArtists: async (timeRange = 'medium_term', limit = 10) =>
        fetchHelper(`${BACKEND_URL}/spotify/data/top-artists?time_range=${timeRange}&limit=${limit}`),

    getRecentlyPlayed: async (limit = 10) =>
        fetchHelper(`${BACKEND_URL}/spotify/data/recently-played?limit=${limit}`),

    getRecommendations: async () =>
        fetchHelper(`${BACKEND_URL}/spotify/data/fake-recommendations`),

    getTopGenre: async () => {
        const data = await fetchHelper(`${BACKEND_URL}/spotify/data/top-genre`);
        return data.topGenre;
    },

    searchTracks: async (searchTerm, limit) =>
        fetchHelper(`${BACKEND_URL}/spotify/data/search?q=${searchTerm}&limit=${limit}&type=track`),

    getTopTracks: async (timeRange = 'medium_term', limit = 15) =>
        fetchHelper(`${BACKEND_URL}/spotify/data/top-tracks?time_range=${timeRange}&limit=${limit}`),

    getUserProfile: async (accessToken) =>
        fetchHelper('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        }),

    searchArtists: async (searchTerm, limit) =>
        fetchHelper(`${BACKEND_URL}/spotify/data/search?q=${searchTerm}&limit=${limit}&type=artist`),

    getArtistInfo: async (artistID) =>
        fetchHelper(`${BACKEND_URL}/spotify/data/artist-info?artist_id=${artistID}`),

    getArtistSummary: async (artistName) =>
        fetchHelper(`${BACKEND_URL}/spotify/data/artist-summary?artistName=${artistName}`),

    addArtist: async (artist) =>
        fetchHelper(`${BACKEND_URL}/db/artists/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artist),
        }),

    getAllArtists: async () => fetchHelper(`${BACKEND_URL}/db/artists/getAllArtists`),

    updateArtistSummary: async (artistName, summary) =>
        fetchHelper(`${BACKEND_URL}/db/artists/updateArtistSummary?artistName=${encodeURIComponent(artistName)}&summary=${encodeURIComponent(summary)}`, {
            method: 'PUT',
        }),

    getArtistByName: async (artistName) =>
        fetchHelper(`${BACKEND_URL}/db/artists/getArtistByName?artistName=${encodeURIComponent(artistName)}`),

    registerUser: async (user) =>
        fetchHelper(`${BACKEND_URL}/db/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        }),

    getAllUsers: async () => fetchHelper(`${BACKEND_URL}/db/users/getAllusers`),

    getTopMinigamePlayers: async () => fetchHelper(`${BACKEND_URL}/db/users/topMinigamePlayers`),

    getUserMinigameTime: async (username) =>
        fetchHelper(`${BACKEND_URL}/db/users/userMinigameTime?username=${encodeURIComponent(username)}`),

    updateMinigameTime: async (username, newTime) =>
        fetchHelper(`${BACKEND_URL}/db/users/updateMinigameTime?username=${encodeURIComponent(username)}&newTime=${newTime}`, {
            method: 'PUT',
        }),

    deleteMinigameScore: async (username) =>
        fetchHelper(`${BACKEND_URL}/db/users/deleteMinigameScore?username=${encodeURIComponent(username)}`, {
            method: 'DELETE',
        }),
};

export default apiService;