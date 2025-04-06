import React, { useContext } from 'react';
import { Theme } from '../services/Theme';
import '../Settings.css';
import '../App.css';

function Settings() {
    const { isDarkMode, toggleTheme } = useContext(Theme);
    return (
        <div className="settings-container">
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
        </div>
    );
}

export default Settings;