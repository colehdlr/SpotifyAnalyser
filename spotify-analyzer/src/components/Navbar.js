import React from 'react';
import {Link, useNavigate} from "react-router-dom";
import '../App.css';

function Navbar({handleLogout}) {
    const navigate = useNavigate();

    const handleUserLogout = () => {
        sessionStorage.removeItem('spotify_access_token'); // Remove token
        navigate('/login'); // Redirect to login page
    };


    return (
        <div className="Navbar">
            <ul>
                <li><Link to={"/home"}>Spotify Analyzer</Link></li>
                <li><Link to={"/minigames"}>Minigames</Link></li>
                <li><Link to={"/artists"}>Artists</Link></li>
                <li><Link to={"/settings"}>Settings</Link></li>
                <li>
                    <button onClick={handleUserLogout} className="logout-button">✖</button>
                </li>
            </ul>
        </div>
    );
}

export default Navbar;