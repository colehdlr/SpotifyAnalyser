import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import '../App.css';
import '../Home.css';

const Home = () => {
    const [accessToken, setAccessToken] = useState(sessionStorage.getItem('spotify_access_token'));
    const [topArtists, setTopArtists] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('medium_term');
    const navigate = useNavigate();

    // check authentication (mounting on to Home component)
    useEffect(() => {
        if (!accessToken) {
            // redirect if not authenticated
            navigate('/login');
            return;
        }
        fetchTopArtists();
    }, [accessToken, navigate]);

    // whenever the time period changes we need to refresh - this does that with timeRange as a param
    useEffect(() => {
        if (accessToken) {
            fetchTopArtists();
        }
    }, [timeRange]);

    const fetchTopArtists = async () => {
        try {
            setLoading(true);
            // this calls our backend endpoint which then calls spotify's API
            const data = await apiService.getTopArtists(timeRange, 10);

            setTopArtists(data);
            setError(null);
        } catch (err) {
            //console.error("error fetching top artists:", err);

            // handle token expiration
            if (err.message.includes("expired") || err.message.includes("401") ||
                err.message.includes("authenticated")) {
                sessionStorage.removeItem('spotify_access_token');
                setAccessToken(null);
                navigate('/login');
                return;
            }

            setError("could not load artist data, maybe our server or spotify is down");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            // call the backend logout endpoint to clear server-side session
            await apiService.logoutFromSpotify();

            // clear client-side session storage
            sessionStorage.removeItem('spotify_access_token');
            setAccessToken(null);
            navigate('/login');
        } catch (err) {
            console.error("logout error:", err);
            // even if they still are logged in in the backend then we can just clear their token from local storage
            sessionStorage.removeItem('spotify_access_token');
            navigate('/login');
        }
    };

    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
    };

    if (loading) {
        return <div className="loading-container">Loading your Spotify data...</div>;
    }

    return (
        <div className="home-container">
            <div className="header">
                <h1>Overview of Your Listening Habits</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="time-range-selector">
                <label>Time Range:</label>
                <select value={timeRange} onChange={handleTimeRangeChange}>
                    <option value="short_term">Last 4 Weeks</option>
                    <option value="medium_term">Last 6 Months</option>
                    <option value="long_term">All Time</option>
                </select>
            </div>

            <div className="my-stats">
                <div className="my-stats-artists">
                    <h3>Your Top Artists</h3>
                    {topArtists && topArtists.items && topArtists.items.length > 0 ? (
                        <div className="artists-grid">
                            {topArtists.items.map((artist) => (
                                <div key={artist.id} className="artist-card">
                                    {artist.images && artist.images.length > 0 ? (
                                        <img
                                            src={artist.images[0].url}
                                            alt={artist.name}
                                            className="artist-image"
                                        />
                                    ) : (
                                        <div className="artist-image-placeholder">
                                            No Image
                                        </div>
                                    )}
                                    <h3>{artist.name}</h3>
                                    <div className="artist-popularity">
                                        Popularity: {artist.popularity}/100
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No artists found. You might need to listen to more music on Spotify.</p>
                        </div>
                    )}
                </div>
                <div className="my-stats-busiest-hour">
                     <h3>Your Busiest Listening Hour</h3>
                </div>
                <div className="my-stats-listening-graph">
                    <h3>Songs Streamed</h3>
                </div>
                <div className="my-stats-genres">
                    <h3>Your Top Genres</h3>
                </div>
                <div className="my-stats-reccomendation">
                    <h3>Your Reccomended Songs</h3>
                </div>
            </div>
        </div>
    );
};

export default Home;