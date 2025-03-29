import React from 'react';
import '../App.css';

//code dashboard ui here
function Home() {
    return (
        <div className="Home">
            <h1> Overview of Your Listening Habits </h1>

            <div className="my-stats">
                <div className="my-stats-artists">
                    <h3>Your Top Five Artists This Week</h3>
                </div>
                <div className="my-stats-busiest-hour">
                    <h3>Your Busiest Listening Hour</h3>
                </div>
                <div className="my-stats-listening-graph">
                    <h3>Songs Streamed</h3>
                </div>
            </div>
        </div>
    );
}

export default Home;