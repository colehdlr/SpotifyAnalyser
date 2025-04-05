import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
//import '../App.css';
import '../Artists.css';

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
            setClosedArtistInfo(false);
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
        <div className="artist-page-home-container">
            <div className="header">
                <h1>Overview of Your Favourite Artists</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="artist-page-time-range-selector">
                <label>Time Range:</label>
                <select value={timeRange} onChange={handleTimeRangeChange}>
                    <option value="short_term">Last 4 Weeks</option>
                    <option value="medium_term">Last 6 Months</option>
                    <option value="long_term">All Time</option>
                </select>
            </div>

            <div className="artist-page-my-stats">
                <div className="artist-page-my-stats-artists">
                    <h3>Your Top Artists</h3>
                    {topArtists && topArtists.items && topArtists.items.length > 0 ? (
                        <div className="artist-page-artist-grid">
                            {topArtists.items.map((artist) => (
                                <div key={artist.id} className="artist-page-artist-card">
                                    {artist.images && artist.images.length > 0 ? (
                                        <img
                                            src={artist.images[0].url}
                                            alt={artist.name}
                                            className="artist-page-artist-image"
                                        />
                                    ) : (
                                        <div className="artist-page-artist-image-placeholder">
                                            No Image
                                        </div>
                                    )}
                                    <h3>{artist.name}</h3>
                                    <div className="artist-page-artist-popularity">
                                        Popularity: {artist.popularity}/100
                                    </div>
                                    <button onClick={() => getArtistInfo(artist.name)} className="artist-page-green-button">Get Artist Info</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No artists found. You might need to listen to more music on Spotify.</p>
                        </div>
                    )}
                </div>
                <div className="artist-page-my-stats-artists">
                    <h3>Search for an Artist</h3>
                    <input
                        type="text"
                        placeholder="Enter artist name"
                        className="artist-page-search-input"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                getArtistInfo(e.target.value);
                            }
                        }}
                    />
                    <button onClick={() => getArtistInfo(document.querySelector('input').value)} className="artist-page-green-button">Search</button>
                    </div>
            </div>

            {isModalOpen && (
                <div className="artist-page-modal">
                    <div className="artist-page-modal-content">
                        <span className="artist-page-close" onClick={closeModal}>&times;</span>
                        {artistInfo && (
                            <>
                                <div className="artist-page-text-content">
                                    <h2>Artist Info</h2>
                                    <p>Name: {artistInfo.name}</p>
                                    <p>Followers: {artistInfo.followers.total}</p>
                                    <p>Popularity: {artistInfo.popularity}</p>
                                    <button
                                        onClick={getArtistSummary}
                                        className="artist-page-summary-button"
                                        disabled={summaryLoading}
                                    >
                                        {summaryLoading ? (
                                            <>
                                                <span className="artist-page-button-spinner"></span>
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
                <div className="artist-page-modal summary-modal">
                    <div className="artist-page-modal-content">
                        <span className="artist-page-close" onClick={closeSummaryModal}>&times;</span>
                        <div className="artist-page-summary-content">
                            <h2>{artistInfo.name} Summary</h2>
                            <div className="artist-page-artist-summary">
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
