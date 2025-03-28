import React, { useState, useEffect } from 'react';

const Home = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const response = await fetch('/api/spotify/data/top-artists', {
                    credentials: 'include'
                });

                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>API Response:</h2>
            <pre style={{ background: '#f4f4f4', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
        </div>
    );
};

export default Home;