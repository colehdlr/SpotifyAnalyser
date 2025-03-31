import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import '../Home.css';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // flag to track if code has been processed - prevents double authentication basically
        let isProcessingCode = false;

        const checkAuthCode = async () => {
            console.log("Login component mounted, pathname:", location.pathname);

            // check if there's already a session
            try {
                const authStatus = await apiService.checkSpotifyStatus();
                if (authStatus.authenticated) {
                    //console.log("authenticated, redirecting to home");
                    navigate('/home');
                    return;
                }
            } catch (err) {
                //console.log("unauthenticated");
            }

            if (location.pathname === '/callback') {
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');

                // clean the url to prevent double authentication processing
                window.history.replaceState({}, document.title, '/login');

                if (code && !isProcessingCode) {
                    isProcessingCode = true;
                    //console.log("found authorisation code, exchanging for token...");

                    try {
                        setLoading(true);

                        // exchange code for token
                        const data = await apiService.exchangeCodeForToken(code);

                        if (data && data.access_token) {
                            //console.log("token exchange successful");

                            // store token in sessionStorage
                            sessionStorage.setItem('spotify_access_token', data.access_token);

                            setTimeout(async () => {
                                try {
                                    // verify backend session is authenticated
                                    const status = await apiService.checkSpotifyStatus();

                                    if (status.authenticated) {
                                        //console.log("authenticated, redirecting to home");
                                        navigate('/home');
                                    } else {
                                        // even if session check fails, try continuing with the token we have
                                        navigate('/home');
                                    }
                                } catch (statusErr) {
                                    navigate('/home');
                                }
                            }, 500);
                        } else {
                            throw new Error("no access token received");
                        }
                    } catch (err) {
                        //console.error("authentication error:", err);
                        setError("Failed to authenticate with Spotify. Please try again");
                        setLoading(false);
                        isProcessingCode = false;
                    }
                } else if (!code) {
                    //console.log("no auth code found in URL");
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        checkAuthCode();

        // handle the component unmounting
        return () => {
            isProcessingCode = false;
        };
    }, [navigate, location.pathname]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiService.getSpotifyAuthUrl();

            // redirect to Spotify authorisation page
            window.location.href = data.authUrl;
        } catch (err) {
            //console.error("login error:", err);
            setError("Failed to connect to Spotify. Please try again");
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container">
            {location.pathname === '/callback' ?
                "Processing Spotify authorisation..." :
                "Loading..."}
        </div>;
    }

    return (
        <div className="login-container">
            <h1>Spotify Analyzer</h1>
            <p>Connect with Spotify to see your top artists</p>

            {error && <div className="error-message">{error}</div>}

            <button
                className="spotify-login-btn"
                onClick={handleLogin}
                disabled={loading}
            >
                Login with Spotify
            </button>
        </div>
    );
};

export default Login;