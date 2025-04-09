import React, { useState, useEffect, useContext } from 'react';
import { fetchTopArtists, searchArtists, fetchTopTracks, searchTracks } from '../services/minigameHandler';
import { Theme } from '../services/Theme';
import { apiService } from '../services/api'
import '../App.css';

function Minigames() {
    const { isDarkMode } = useContext(Theme);

    const [mode, setMode] = useState("artists");
    const [artists, setArtists] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [guess, setGuess] = useState("");
    const [suggestion, setSuggestion] = useState(null);
    const [suggestionClicked, setSuggestionClicked] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [scoreMessage, setScoreMessage] = useState("");

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const status = await apiService.checkSpotifyStatus();
                if (status.authenticated && status.profile) {
                    setUserProfile(status.profile);
                }
            } catch (error) {
                console.error("error fetching user's profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setStartTime(null);
            setElapsedTime(0);
            setTimerActive(false);
            setGameComplete(false);
            setScoreMessage("");

            switch (mode) {
                case "artists":
                    const topArtists = await fetchTopArtists();
                    setArtists(topArtists.map(artist => ({ name: artist, hidden: true })));
                    break;
                case "tracks":
                    const topTracks = await fetchTopTracks();
                    setTracks(topTracks.map(track => ({ name: track, hidden: true })));
                    break;
                default:
                    break;
            }
        };

        loadData();
    }, [mode]);

    useEffect(() => {
        if (!timerActive) return;

        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [timerActive, startTime]);

    useEffect(() => {
        const items = mode === "artists" ? artists : tracks;
        const allRevealed = items.length === 10 && items.every(item => !item.hidden);

        if (allRevealed) {
            setTimerActive(false);
            setGameComplete(true);

            localStorage.setItem('gameCompleted', 'true');
            saveHighScore();
        }
    }, [artists, tracks, mode, timerActive]);

    const saveHighScore = async () => {
        if (!userProfile || !userProfile.display_name) {
            setScoreMessage("Login to save your score!");
            return;
        }

        try {
            // Since our backend now handles both new users and existing users,
            // we can directly call updateMinigameTime without checking first
            const response = await apiService.updateMinigameTime(userProfile.display_name, elapsedTime);

            // Handle the response
            if (response.isNewUser) {
                setScoreMessage(`First score recorded: ${elapsedTime}s`);
            } else if (response.user) {
                setScoreMessage(`New high score: ${elapsedTime}s!`);
            } else {
                setScoreMessage(`Your best score is still: ${response.currentBestTime}s`);
            }
        } catch (error) {
            console.error("Error saving high score:", error);
            setScoreMessage("Error saving your score. Try again later.");
        }
    };

    const handleGuess = () => {
        if (!timerActive && !startTime) {
            setStartTime(Date.now());
            setTimerActive(true);
        }

        switch(mode) {
            case "artists":
                setArtists(prev =>
                    prev.map(item =>
                        item.name.toLowerCase() === guess.toLowerCase()
                            ? { ...item, hidden: false }
                            : item
                    )
                );
                break;
            case "tracks":
                setTracks(prev =>
                    prev.map(item =>
                        item.name.toLowerCase() === guess.toLowerCase()
                            ? { ...item, hidden: false }
                            : item
                    )
                );
                break;
            default:
                break;
        }

        setGuess("");
        setSuggestion(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleGuess();
        }
    };

    const autoComplete = async () => {
        if (guess.trim() === "" || suggestionClicked) {
            setSuggestion(null);
            return;
        }

        let results;
        switch(mode) {
            case "artists":
                results = await searchArtists(guess.toLowerCase(), "3");
                setSuggestion(results);
                break;
            case "tracks":
                results = await searchTracks(guess.toLowerCase(), "3");
                setSuggestion(results);
                break;
        }
    };

    useEffect(() => {
        autoComplete();
    }, [guess]);

    const handleSuggestionClick = (item) => {
        setGuess(item);
        setSuggestionClicked(true);
        setTimeout(() => setSuggestionClicked(false), 100);
    };

    return (
        <div className={`Minigames ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="modeToggle">
                <button onClick={() => setMode("artists")} className={mode === "artists" ? "active" : ""}>
                    Artists
                </button>
                <button onClick={() => setMode("tracks")} className={mode === "tracks" ? "active" : ""}>
                    Tracks
                </button>
            </div>

            <h1>Guess {mode === "artists" ? "Artists" : "Tracks"} Rankings</h1>
            <p>Can you guess your recent top ten {mode === "artists" ? "artists" : "tracks"}?</p>

            <div className="timer">
                {startTime ? (
                    <p>Time: {elapsedTime}s</p>
                ) : (
                    <p>Guess to begin!</p>
                )}
                {gameComplete && <p className="completion-message">Congratulations! You've revealed all items!</p>}
            </div>

            <ol className="artistList">
                <div className="leftColumn">
                    {(mode === "artists" ? artists : tracks).slice(0, 5).map((item, index) => (
                        <li key={index}>
                            <span className="number">{index + 1}</span>
                            <button className={`artistPill ${item.hidden ? "hidden" : "shown"}`}>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </div>

                <div className="rightColumn">
                    {(mode === "artists" ? artists : tracks).slice(5, 10).map((item, index) => (
                        <li key={index + 5}>
                            <span className="number">{index + 6}</span>
                            <button className={`artistPill ${item.hidden ? "hidden" : "shown"}`}>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </div>
            </ol>

            <div className="guessSection">
                <input
                    type="text"
                    placeholder={`Enter ${mode === "artists" ? "artist" : "track"} name`}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="inputField"
                />
                <button onClick={handleGuess} className="guessButton">Guess</button>

                {suggestion && (
                    <ul className="suggestionsList">
                        {suggestion.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(item)}
                                className="suggestionItem"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Minigames;
