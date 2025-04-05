import React, { useState, useEffect, useContext } from 'react';
import { fetchTopArtists, searchArtists } from '../services/minigameHandler';
import { Theme } from '../services/Theme';
import '../App.css';

function Minigames() {
    const { isDarkMode } = useContext(Theme);
    const [artists, setArtists] = useState([]);
    const [guess, setGuess] = useState("");
    const [suggestion, setSuggestion] = useState(null);
    const [suggectionClicked, setSuggestionClicked] = useState(false);

    useEffect(() => {
        const loadTopArtists = async () => {
            const topArtists = await fetchTopArtists();
            setArtists(topArtists.map(artist => ({ name: artist, hidden: true })));
        };

        loadTopArtists();
    }, []);

    const handleGuess = () => {
        setArtists(prevArtists =>
            prevArtists.map(artist =>
                artist.name.toLowerCase() === guess.toLowerCase()
                    ? { ...artist, hidden: false }
                    : artist
            )
        );
        setGuess("");
        setSuggestion(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleGuess();
        }
    };

    const autoComplete = async () => {
        if (guess.trim() === "" || suggectionClicked) {
            setSuggestion(null);
            return;
        }

        const results = await searchArtists(guess.toLowerCase());
        setSuggestion(results);
    };

    useEffect(() => {
        autoComplete();
    }, [guess]);

    const handleSuggestionClick = (artist) => {
        setGuess(artist);
        setSuggestionClicked(true);

        setTimeout(() => setSuggestionClicked(false), 100);
    };

    return (
        <div className={`Minigames ${isDarkMode ? 'dark' : 'light'}`}>
            <h1>Guess Artists Rankings</h1>
            <p>Can you guess your recent top ten artists?</p>

            <ol className="artistList">
                <div className="leftColumn">
                    {artists.slice(0, 5).map((artist, index) => (
                        <li key={index}>
                            <span className="number">{index + 1}</span>
                            <button className={`artistPill ${artist.hidden ? "hidden" : "shown"}`}>
                                {artist.name}
                            </button>
                        </li>
                    ))}
                </div>

                <div className="rightColumn">
                    {artists.slice(5, 10).map((artist, index) => (
                        <li key={index + 5}>
                            <span className="number">{index + 6}</span>
                            <button className={`artistPill ${artist.hidden ? "hidden" : "shown"}`}>
                                {artist.name}
                            </button>
                        </li>
                    ))}
                </div>
            </ol>

            <div className="guessSection">
                <input
                    type="text"
                    placeholder="Enter artist name"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="inputField"
                />
                <button onClick={handleGuess} className="guessButton">Guess</button>
                
                {suggestion && (
                    <ul className="suggestionsList">
                        {suggestion.map((artist, index) => (
                            <li 
                                key={index}
                                onClick={() => handleSuggestionClick(artist)}
                                className="suggestionItem"
                            >
                                {artist}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Minigames;