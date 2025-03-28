import React, { useState } from 'react';
import { apiService } from '../services/api';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSpotifyLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getSpotifyAuthUrl();
            console.log('Got Spotify auth URL:', response.authUrl);
            // This should redirect to Spotify, not your home page
            window.location.href = response.authUrl;
        } catch (err) {
            console.error('Failed to get Spotify auth URL:', err);
            setError('Could not connect to Spotify. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Spotify Analyzer</h1>
                <p>Connect with Spotify to see your top artists and tracks</p>

                {error && <div className="error-message">{error}</div>}

                <button
                    className="spotify-login-btn"
                    onClick={handleSpotifyLogin}
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : 'Login with Spotify'}
                </button>
            </div>
        </div>
    );
};

export default Login;