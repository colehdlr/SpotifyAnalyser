import React from 'react';
import {Link} from "react-router-dom";

function Navbar() {
    return (
        <div className="Navbar">
            <ul>
                <li><Link to={"/home"}>Spotfiy Analyzer</Link></li>
                <li><Link to={"/minigames"}>Minigames</Link></li>
                <li><Link to={"/settings"}>Settings</Link></li>
            </ul>
        </div>
    );
}

export default Navbar;