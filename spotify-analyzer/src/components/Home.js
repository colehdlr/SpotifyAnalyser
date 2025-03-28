import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';

const Home = () => {
    const [topArtists, setTopArtists] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('medium_term');

    const navigate = useNavigate();
    const location = useLocation();

    // Check for error parameters in URL (from callback redirect)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('error')) {
            setError('Authentication failed. Please try again.');
        }

        // Clean up URL parameters to prevent issues on refresh
        if (location.search) {
            navigate('/home', { replace: true });
        }
    }, [location, navigate]);

    // Check authentication and fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Check if authenticated
                const authStatus = await apiService.checkSpotifyStatus();
                console.log('Auth status:', authStatus);

                if (!authStatus.authenticated) {
                    console.log('Not authenticated, redirecting to login');
                    navigate('/login');
                    return;
                }

                // Fetch top artists if authenticated
                const artists = await apiService.getTopArtists(timeRange);
                console.log('Top artists data:', artists);
                setTopArtists(artists);
                setError(null);
            } catch (err) {
                console.error('Error in Home component:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange, navigate]);

    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
    };

    const handleLogout = async () => {
        try {
            await apiService.logoutFromSpotify();
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
            setError('Failed to logout. Please try again.');
        }
    };

    if (loading) {
        return <div className="loading-container">Loading your Spotify data...</div>;
    }

    return (
        <div className="home-container">
            <div className="header">
                <h1>Your Spotify Top Artists</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>

            {error && (
                <div className="error-alert">{error}</div>
            )}

            <div className="time-range-selector">
                <label>Time Range:</label>
                <select value={timeRange} onChange={handleTimeRangeChange}>
                    <option value="short_term">Last 4 Weeks</option>
                    <option value="medium_term">Last 6 Months</option>
                    <option value="long_term">All Time</option>
                </select>
            </div>

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
                            <div className="artist-genres">
                                {artist.genres && artist.genres.slice(0, 3).join(', ')}
                            </div>
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

            <div className="raw-data">
                <h3>Raw API Response:</h3>
                <pre>
                    {JSON.stringify(topArtists, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default Home;