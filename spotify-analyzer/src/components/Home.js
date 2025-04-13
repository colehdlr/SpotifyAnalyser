import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Theme } from "../services/Theme";
import BlurPanel from "../services/BlurPanel"
import '../styles/App.css';
import '../styles/Home.css';

const Home = () => {
    const { isDarkMode } = useContext(Theme);
    const [accessToken, setAccessToken] = useState(sessionStorage.getItem('spotify_access_token'));
    const [topArtists, setTopArtists] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('medium_term');
    const navigate = useNavigate();
    const [recentTracks, setRecentTracks] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [topGenre, setTopGenre] = useState(null);
    const [topSongs, setTopSongs] = useState(null);


    const fetchRecentlyPlayed = async () => {
        try {
            const data = await apiService.getRecentlyPlayed(15);
            setRecentTracks(data);
        } catch (err) {
            console.error("Error fetching recently played:", err);
        }
    };

    const fetchReccomendations = async () => {
        try {
            const data = await apiService.getRecommendations();
            setRecommendations(data);
        }catch (err) {
            console.error("Error fetching reccommendations:", err);
        }
    };

    const fetchTopGenre = async () => {
        try {
            const genre = await apiService.getTopGenre();
            setTopGenre(genre);
        } catch (error) {
            console.error("Error loading top genre:", error);
        }
    };

    const fetchTopSongs = async () => {
        try {
            const data = await apiService.getTopTracks(timeRange, 5);
            setTopSongs(data);
        } catch (err) {
            console.error("Error fetching top artists:", err);
        }
    };

    const fetchTopArtists = async () => {
        try {
            setLoading(true);
            // this calls our backend endpoint which then calls spotify's API
            const data = await apiService.getTopArtists(timeRange, 4);

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





    // check authentication (mounting on to Home component)
    useEffect(() => {
        if (!accessToken) {
            // redirect if not authenticated
            navigate('/login');
            return;
        }
        fetchTopArtists();
        fetchRecentlyPlayed();
        fetchReccomendations();
        fetchTopGenre();
        fetchTopSongs();
    }, [accessToken, navigate]);

    // whenever the time period changes we need to refresh - this does that with timeRange as a param
    useEffect(() => {
        if (accessToken) {
            fetchTopArtists();
            fetchRecentlyPlayed();
            fetchReccomendations();
            fetchTopSongs();
        }
    }, [timeRange]);




    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
    };

    if (loading) {
        return <div className="loading-container">Loading your Spotify data...</div>;
    }




    return (
        <div className={`home-container ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="header">
                <h1>Overview of Your Listening Habits</h1>
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

            <BlurPanel>
                <div className="my-stats">
                    <div className="my-stats-artists">
                        <h3>Your Top Artists</h3>
                        {topArtists?.items?.length > 0 ? (
                            <div className="artist-grid">
                                {topArtists.items.map((artist) => (
                                    <div key={artist.id} className="artist-card">
                                        {artist.images?.[0] ? (
                                            <img
                                                src={artist.images[0].url}
                                                alt={artist.name}
                                                className="artist-image"
                                            />
                                        ) : (
                                            <div className="artist-image-placeholder">No Image</div>
                                        )}
                                        <h4 className="artist-name">{artist.name}</h4>
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
                    <div className="my-stats-recently-played">
                        <h3>Your Recently Played Tracks</h3>
                        {recentTracks && recentTracks.items ? (
                            <ul className="recent-tracks-list">
                                {recentTracks.items.slice(0, 10).map((item) => (
                                    <li key={item.played_at} className="recent-track">
                                        <img src={item.track.album.images[0]?.url} alt={item.track.name} className="recent-track-image" />
                                        <div className="recent-track-info">
                                            <div className="track-name">{item.track.name}</div>
                                            <div className="track-artist">{item.track.artists.map((a) => a.name).join(", ")}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No recent tracks found.</p>
                        )}
                    </div>
                    <div className="my-stats-reccomendation">
                        <h3>Recommendations Based on Your Recent Listen</h3>
                        {recommendations && recommendations.length > 0 ? (
                            <ul className="recent-tracks-list">
                                {recommendations.slice(0, 10).map((track) => (
                                    <li key={track.id} className="recent-track">
                                        <img
                                            src={track.album.images[0]?.url}
                                            alt={track.name}
                                            className="recent-track-image"
                                        />
                                        <div className="recent-track-info">
                                            <div className="track-name">{track.name}</div>
                                            <div className="track-artist">{track.artists.map((a) => a.name).join(", ")}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No recommendations found.</p>
                        )}
                    </div>
                    <div className="genre-and-minigame">
                        <div className="my-stats-genres">
                            <h3>Your Top Genre</h3>
                            {topGenre ? (
                                <div className="genre-card">
                                    <span className="genre-name">{topGenre}</span>
                                </div>
                            ) : (
                                <p>No Genre Found</p>
                            )}
                        </div>
                        <div className="my-stats-minigame-time">
                            <h3 style={{ marginTop: '20px' }}>Your Minigame High Score</h3>
                            <div className="minigame-card">
                                <span className="high-score">97 Seconds</span>
                            </div>
                        </div>
                        <div className="my-stats-songs">
                            <h3>Your Top Songs</h3>
                            {topSongs ? (
                                <ul className="recent-tracks-list">
                                    {topSongs.items.map((track) => (
                                        <li key={track.id} className="recent-track">
                                            <img
                                                src={track.album.images[0]?.url}
                                                alt={track.name}
                                                className="recent-track-image"
                                            />
                                            <div className="recent-track-info">
                                                <div className="track-name">{track.name}</div>
                                                <div className="track-artist">{track.artists.map((a) => a.name).join(", ")}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No top songs found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </BlurPanel>
        </div>
);
};




export default Home;