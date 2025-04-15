import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BlurredPanel.css';

const BlurPanel = ({ children }) => {
    const navigate = useNavigate();
    const [isBlurred, setIsBlurred] = useState(true);
    const [showPopup, setShowPopup] = useState(true);

    useEffect(() => {
        const gameCompleted = localStorage.getItem('gameCompleted') === 'true';

        if (gameCompleted) {
            setIsBlurred(false);
            setShowPopup(false);
        }
    }, []);

    const handlePanelClick = () => {
        if (isBlurred) {
            setShowPopup(true);
        }
    };

    const handleUnblur = () => {
        setIsBlurred(false);
        setShowPopup(false);
    };

    const handleKeepBlurred = () => {
        setShowPopup(false);
        navigate('/minigames')
    };

    return (
        <div className="blurred-panel-container">
            <div
                className={`blurred-content ${isBlurred ? 'blurred' : ''}`}
                onClick={handlePanelClick}
            >
                {children}
            </div>

            {showPopup && (
                <div className="blur-popup-overlay">
                    <div className="blur-popup">
                        <h3>Are you sure you want to unblur?</h3>
                        <p>Woah! Don't spoil the minigame - go play it now!</p>
                        <div className="blur-popup-buttons">
                            <button className="blur-btn primary" onClick={handleUnblur}>View Artists/Songs</button>
                            <button className="blur-btn secondary" onClick={handleKeepBlurred}>Play Minigame</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlurPanel;