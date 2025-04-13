import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiService } from './services/api';
import { ThemeProvider } from './services/Theme';

import './styles/App.css';
import Layout from './components/Layout';
import Home from './components/Home';
import Artists from "./components/Artists";
import Login from './components/Login';
import Minigames from './components/Minigames';
import Settings from './components/Settings';

function App() {
    const [apiStatus, setApiStatus] = useState({
        available: false,
        loading: true
    });

    useEffect(() => {
        const checkApiAvailability = async () => {
            try {
                await apiService.checkStatus();
                setApiStatus({
                    available: true,
                    loading: false
                });
            } catch (error) {
                console.error('API check failed:', error);
                setApiStatus({
                    available: false,
                    loading: false
                });
            }
        };

        checkApiAvailability();
    }, []);

    if (apiStatus.loading) {
        return (
            <div className="LoadingScreen">
                <h2>Loading...</h2>
            </div>
        );
    }

    if (!apiStatus.available) {
        return (
            <div className="LoadingScreen">
                <h2>Connection Error</h2>
                <p>Could not connect to the server. Please make sure the backend service is running at {process.env.REACT_APP_BACKEND_URL}</p>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/callback" element={<Login />} />

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

                    <Route path="/artists" element={
                        <Layout>
                            <Artists />
                        </Layout>
                    } />

                <Route path="/settings" element={
                    <Layout>
                        <Settings />
                    </Layout>
                } />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;