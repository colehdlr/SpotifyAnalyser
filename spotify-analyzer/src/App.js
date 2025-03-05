import React, {useEffect, useState} from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import './App.css';

import { apiService } from './services/api';

import Page from './components/Page';
import Layout from './components/Layout';
import Home from './components/Home';
import Minigames from './components/Minigames';
import Settings from './components/Settings';

function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkApiStatus = async () => {
            try {
                await apiService.checkStatus();
                setIsLoading(false);
            } catch (error) {
                console.error('Error checking API status:', error);
            }
        };

        checkApiStatus();
    }, []);

    if (isLoading) {
        return (
            <div className="LoadingScreen">
                <h2>Loading...</h2>
            </div>
        );
    }
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={
                        <Page 
                            element={<Navigate to="/home" />} // Root: if auth -> home, else login
                        />}/>
                    <Route path="/login" element={
                        <Page
                            element={<Navigate to="/home" />} // Login: if auth -> home, else login
                        />}/>
                    <Route path="/home" element={
                        <Page
                            element={<Home />} // Home: if auth -> home, else login
                        />}/>
                    <Route path="/minigames" element={
                        <Page
                            element={<Minigames />} // Minigames: if auth -> minigames, else login
                        />}/>
                    <Route path="/settings" element={
                        <Page
                        element={<Settings />} // Settings: if auth -> settings, else login
                    />}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
