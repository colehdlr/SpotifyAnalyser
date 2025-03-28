// src/services/api.js
// Using absolute URLs for all requests
const API_BASE_URL = 'http://localhost:8080/api';
const FRONTEND_URL = 'http://localhost:3000';

export const apiService = {
    // Check API status
    checkStatus: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/status`, {
                credentials: 'include'  // Include cookies for session
            });

            if (!response.ok) {
                throw new Error('API unavailable');
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking API status:', error);
            throw new Error('Cannot connect to API. Please make sure the backend service is running');
        }
    },

    // Spotify Authentication
    getSpotifyAuthUrl: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/spotify/login`, {
                credentials: 'include'  // Include cookies for session
            });

            if (!response.ok) {
                throw new Error('Failed to get auth URL');
            }

            return response.json();
        } catch (error) {
            console.error('Error getting Spotify auth URL:', error);
            throw error;
        }
    },

    checkSpotifyStatus: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/spotify/status`, {
                credentials: 'include'  // Include cookies for session
            });

            if (!response.ok) {
                throw new Error('Failed to check auth status');
            }

            return response.json();
        } catch (error) {
            console.error('Error checking Spotify auth status:', error);
            return { authenticated: false };
        }
    },

    logoutFromSpotify: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/spotify/logout`, {
                method: 'POST',
                credentials: 'include'  // Include cookies for session
            });

            if (!response.ok) {
                throw new Error('Failed to logout');
            }

            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },

    // Spotify Data Retrieval
    getTopArtists: async (timeRange = 'medium_term', limit = 10) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/spotify/data/top-artists?time_range=${timeRange}&limit=${limit}`,
                { credentials: 'include' }  // Include cookies for session
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error fetching top artists:', errorText);
                throw new Error('Failed to fetch top artists');
            }

            return response.json();
        } catch (error) {
            console.error('Error in getTopArtists:', error);
            throw error;
        }
    }
};

export default apiService;
