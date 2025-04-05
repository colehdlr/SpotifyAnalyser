import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import '../App.css';
import '../Home.css';

function Artists() {
    const [accessToken, setAccessToken] = useState(sessionStorage.getItem('spotify_access_token'));
    const [topArtists, setTopArtists] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('medium_term');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [artistInfo, setArtistInfo] = useState(null);
    const [artistSummary, setArtistSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [closedArtistInfo, setClosedArtistInfo] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!accessToken) {
            navigate('/login');
            return;
        }
        fetchTopArtists();
    }, [accessToken, navigate]);

    useEffect(() => {
        if (accessToken) {
            fetchTopArtists();
        }
    }, [timeRange]);

    const getArtistInfo = async (artistName) => {
        const artist = topArtists.items.find(artist => artist.name === artistName);
        if (artist) {
            const data = await apiService.getArtistInfo(artist.id);
            setArtistInfo(data);
            setIsModalOpen(true);
        }
    };

    const getArtistSummary = async () => {
        try {
            if (artistInfo) {
                    setSummaryLoading(true);
                    const summary = await apiService.getArtistSummary(artistInfo.id, artistInfo.name);
                    setArtistSummary(summary["artist_summary"]);
                    setIsSummaryModalOpen(true);
            }
        } catch (err) {
            setError("Failed to load artist summary");
        } finally {
            setSummaryLoading(false);
        }
    };

    const fetchTopArtists = async () => {
        try {
            setLoading(true);
            const data = await apiService.getTopArtists(timeRange, 14);
            setTopArtists(data);
            setError(null);
        } catch (err) {
            if (err.message.includes("expired") || err.message.includes("401") ||
                err.message.includes("authenticated")) {
                sessionStorage.removeItem('spotify_access_token');
                setAccessToken(null);
                navigate('/login');
                return;
            }
            setError("Could not load artist data, maybe our server or Spotify is down");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logoutFromSpotify();
            sessionStorage.removeItem('spotify_access_token');
            setAccessToken(null);
            navigate('/login');
        } catch (err) {
            sessionStorage.removeItem('spotify_access_token');
            navigate('/login');
        }
    };

    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsSummaryModalOpen(false);
        setSummaryLoading(false);
        setClosedArtistInfo(true);
    };

    const closeSummaryModal = () => {
        setIsSummaryModalOpen(false);
    };

    if (loading) {
        return <div className="loading-container">Loading your Spotify data...</div>;
    }

    return (
        <div className="home-container">
            <div className="header">
                <h1>Overview of Your Favourite Artists</h1>
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
                                    <button onClick={() => getArtistInfo(artist.name)}>Get Artist Info</button>
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
                    <h3>Your Recommended Songs</h3>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        {artistInfo && (
                            <>
                                <div className="text-content">
                                    <h2>Artist Info</h2>
                                    <p>Name: {artistInfo.name}</p>
                                    <p>Followers: {artistInfo.followers.total}</p>
                                    <p>Popularity: {artistInfo.popularity}</p>
                                    <button
                                        onClick={getArtistSummary}
                                        className="summary-button"
                                        disabled={summaryLoading}
                                    >
                                        {summaryLoading ? (
                                            <>
                                                <span className="button-spinner"></span>
                                                Generating Summary - this might take a while..
                                            </>
                                        ) : (
                                            "Artist Summary"
                                        )}
                                    </button>
                                </div>
                                {artistInfo.images && artistInfo.images.length > 0 && (
                                    <img src={artistInfo.images[0].url} alt={artistInfo.name} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {isSummaryModalOpen && !closedArtistInfo && (
                <div className="modal summary-modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeSummaryModal}>&times;</span>
                        <div className="summary-content">
                            <h2>{artistInfo.name} Summary</h2>
                            <div className="artist-summary">
                                <p>{artistSummary}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Artists;
