import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiService } from './services/api';

import './App.css';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import Minigames from './components/Minigames';
import Settings from './components/Settings';

function App() {
    const [apiStatus, setApiStatus] = useState({
        checked: false,
        available: false,
        loading: true
    });

    useEffect(() => {
        const checkApiAvailability = async () => {
            try {
                await apiService.checkStatus();
                setApiStatus({
                    checked: true,
                    available: true,
                    loading: false
                });
            } catch (error) {
                console.error('API check failed:', error);
                setApiStatus({
                    checked: true,
                    available: false,
                    loading: false
                });
            }
        };

        checkApiAvailability();
    }, []);

    if (apiStatus.loading) {
        return (
            <div className="loading-screen">
                <h2>Loading...</h2>
            </div>
        );
    }

    if (!apiStatus.available) {
        return (
            <div className="error-screen">
                <h2>Connection Error</h2>
                <p>Could not connect to the server. Please make sure the backend service is running at http://localhost:8080</p>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/callback" element={<Navigate to="/home" />} />

                {/* Protected routes - wrapped in Layout */}
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={
                    <Layout>
                        <Home />
                    </Layout>
                } />
                <Route path="/minigames" element={
                    <Layout>
                        <Minigames />
                    </Layout>
                } />
                <Route path="/settings" element={
                    <Layout>
                        <Settings />
                    </Layout>
                } />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;