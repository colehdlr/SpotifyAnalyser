// src/services/api.js
const BACKEND_URL = 'http://localhost:8080/api';

export const apiService = {
    // Check API status
    checkStatus: async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/status`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('API unavailable');
            }

            return await response.json();
        } catch (error) {
            //console.error('Error checking API status:', error);
            throw new Error('Cannot connect to API. Please make sure the backend service is running');
        }
    },

    // get the authorisation url
    getSpotifyAuthUrl: async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/spotify/login`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to get Spotify auth URL');
            }

            return await response.json();
        } catch (error) {
            //console.error('error getting Spotify auth URL:', error);
            throw new Error('Failed to start the login process');
        }
    },

    exchangeCodeForToken: async (code) => {
        try {
            // using URLSearchParams for proper content type
            const params = new URLSearchParams();
            params.append('code', code);

            const response = await fetch(`${BACKEND_URL}/spotify/token-exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
                credentials: 'include'  // IMPORTANT: include credentials
            });

            const responseText = await response.text();
            //console.log("token exchange response:", response.status, responseText);

            // attempt to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                //console.error("failed to parse response as JSON:", responseText);
                throw new Error("Invalid response format");
            }

            // check for error in the response
            if (!response.ok) {
                throw new Error(`Token exchange failed: ${response.status} ${response.statusText}${data.error ? ': ' + data.message : ''}`);
            }

            // verify we have the expected token data
            if (!data.access_token) {
                throw new Error("No access token in response");
            }

            return data;
        } catch (error) {
            //console.error('error exchanging code for token:', error);
            throw error;
        }
    },

    checkSpotifyStatus: async () => {
        try {
            //console.log("checking Spotify authentication status");
            const response = await fetch(`${BACKEND_URL}/spotify/status`, {
                credentials: 'include',  // IMPORTANT: Include credentials (cookies)
                headers: {
                    'Accept': 'application/json'
                }
            });

            //console.log("status check response:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                //console.error("auth status error:", errorText);
                throw new Error('Failed to check authentication status');
            }

            const data = await response.json();
            //console.log("auth status result:", data.authenticated);
            return data;
        } catch (error) {
            console.error('Error checking Spotify status:', error);
            return { authenticated: false };
        }
    },

    logoutFromSpotify: async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/spotify/logout`, {
                method: 'POST',
                credentials: 'include'
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

    // ADD MORE HERE
    getTopArtists: async (timeRange = 'medium_term', limit = 10) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/spotify/data/top-artists?time_range=${timeRange}&limit=${limit}`,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication expired. Please login again.");
                }
                throw new Error(`Failed to fetch top artists: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching top artists:', error);
            throw error;
        }
    },

    getRecentlyPlayed: async (limit = 10) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/spotify/data/recently-played?limit=${limit}`,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication expired. Please login again.");
                }
                throw new Error(`Failed to fetch recently played tracks: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching recently played tracks:', error);
            throw error;
        }
    },

    getRecommendations: async () => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/spotify/data/fake-recommendations`,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication expired. Please login again.");
                }
                throw new Error(`Failed to fetch recommendations workaround: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching recommendations workaround:', error);
            throw error;
        }
    },







    getTopTracks: async (timeRange = 'medium_term', limit = 15) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/spotify/data/top-tracks?time_range=${timeRange}&limit=${limit}`,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication expired. Please login again.");
                }
                throw new Error(`Failed to fetch top tracks: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            throw error;
        }
    },

    getUserProfile: async (accessToken) => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    searchArtists: async (searchTerm) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/spotify/data/search?q=${searchTerm}&limit=3&type=artist`,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication expired. Please login again.");
                }
                throw new Error(`Failed to fetch top tracks: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            throw error;
        }
    }
};

export default apiService;