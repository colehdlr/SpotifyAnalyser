const BACKEND_URL = "https://spotifyanalyserbackend.onrender.com" + '/api';

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

    fetchArtistSummary: async (artistName, summary) =>
        fetchHelper(`${BACKEND_URL}/db/artists/fetchArtistSummary?artistName=${encodeURIComponent(artistName)}`, {
            method: 'PUT',
        }),

    getArtistByName: async (artistName) =>
        fetchHelper(`${BACKEND_URL}/db/artists/getArtistByName?artistName=${encodeURIComponent(artistName)}`),

    // db and registration methods:
    registerUser: async (username, spotifyId) =>
        fetchHelper(`${BACKEND_URL}/db/users/register?username=${encodeURIComponent(username)}&spotifyId=${encodeURIComponent(spotifyId)}`, {
            method: 'PUT',
        }),

    getAllUsers: async () => fetchHelper(`${BACKEND_URL}/db/users/getAllUsers`),

    getTopMinigamePlayers: async () => fetchHelper(`${BACKEND_URL}/db/users/topMinigamePlayers`),

    getUserArtistMinigameTimeById: async (spotifyId) =>
        fetchHelper(`${BACKEND_URL}/db/users/getUserArtistMinigameTimeById?spotifyId=${encodeURIComponent(spotifyId)}`),

    getUserTrackMinigameTimeById: async (spotifyId) =>
        fetchHelper(`${BACKEND_URL}/db/users/getUserTrackMinigameTimeById?spotifyId=${encodeURIComponent(spotifyId)}`),

    updateArtistMinigameTimeById: async (spotifyId, newTime) =>
        fetchHelper(`${BACKEND_URL}/db/users/updateArtistMinigameTimeById?spotifyId=${encodeURIComponent(spotifyId)}&newTime=${newTime}`, {
            method: 'PUT',
        }),

    updateTrackMinigameTimeById: async (spotifyId, newTime) =>
        fetchHelper(`${BACKEND_URL}/db/users/updateTrackMinigameTimeById?spotifyId=${encodeURIComponent(spotifyId)}&newTime=${newTime}`, {
            method: 'PUT',
        }),

    deleteBothMinigameScoresById: async (spotifyId) =>
        fetchHelper(`${BACKEND_URL}/db/users/deleteBothMinigameScoresById?spotifyId=${encodeURIComponent(spotifyId)}`, {
            method: 'DELETE',
        }),

    deleteArtistMinigameScoreById: async (spotifyId) =>
        fetchHelper(`${BACKEND_URL}/db/users/deleteArtistMinigameScoreById?spotifyId=${encodeURIComponent(spotifyId)}`, {
            method: 'DELETE',
        }),

    deleteTrackMinigameScoreById: async (spotifyId) =>
        fetchHelper(`${BACKEND_URL}/db/users/deleteTrackMinigameScoreById?spotifyId=${encodeURIComponent(spotifyId)}`, {
            method: 'DELETE',
        }),
};

export default apiService;