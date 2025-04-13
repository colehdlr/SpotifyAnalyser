import React, { useContext, useState, useEffect } from 'react';
import { Theme } from '../services/Theme';
import { apiService } from '../services/api';
import '../styles/Settings.css';
import '../styles/App.css';

function Settings() {
    const { isDarkMode, toggleTheme } = useContext(Theme);
    const [userProfile, setUserProfile] = useState(null);
    const [highScore, setHighScore] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const status = await apiService.checkSpotifyStatus();
                if (status.authenticated && status.profile) {
                    setUserProfile(status.profile);

                    try {
                        const userScore = await apiService.getUserMinigameTime(status.profile.display_name);
                        setHighScore(userScore.minigameBestTimeInSeconds);
                    } catch (error) {
                        console.log("No high score found for user");
                        setHighScore(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserData();
    }, []);

    const handleRemoveHighScore = async () => {
        if (!userProfile) {
            setMessage('Please log in to manage your high score');
            return;
        }

        setLoading(true);
        try {
            // First check if the user exists in the database
            try {
                // Try to get the user's high score first - this will throw an error if the user doesn't exist
                await apiService.getUserMinigameTime(userProfile.display_name);

                // If we get here, the user exists, so we can delete their score
                await apiService.deleteMinigameScore(userProfile.display_name);
                setMessage('High score deleted successfully!');
                setHighScore(null);
            } catch (error) {
                // User doesn't exist in the database yet (no high score recorded)
                if (error.message && (error.message.includes("User not found") ||
                    error.message.includes("404"))) {
                    setMessage('No high score found to delete.');
                } else {
                    // Some other error occurred
                    throw error;
                }
            }
        } catch (error) {
            console.error("Error removing high score:", error);
            setMessage('Error removing high score. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`settings-container ${isDarkMode ? 'dark' : 'light'}`}>
            <h1>Settings</h1>
            <p>Here you can log in/log out, reset minigame scores, and change the theme.</p>

            <div className="settings-section">
                <h2>Appearance</h2>

                <div className="setting-item">
                    <span>Dark Mode</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={isDarkMode}
                            onChange={toggleTheme}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h2>Minigame Settings</h2>

                {userProfile ? (
                    <div className="setting-item">
                        <div>
                            <p>Logged in as: {userProfile.display_name}</p>
                            {highScore !== null ? (
                                <p>Your best minigame time: {highScore} seconds</p>
                            ) : (
                                <p>No minigame scores recorded yet</p>
                            )}
                        </div>
                        <button
                            onClick={handleRemoveHighScore}
                            disabled={loading || highScore === null}
                            className="reset-button"
                        >
                            {loading ? 'Processing...' : 'Reset Minigame Score'}
                        </button>
                    </div>
                ) : (
                    <p>Login with Spotify to manage your minigame scores</p>
                )}

                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}

export default Settings;