import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const TIMEOUT_MS = 5000;

export const userMangerService = {
    createUser: async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users`, {
                username: username,
                password: password
            }, {
                timeout: TIMEOUT_MS,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('User created:', response.data);
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error('Request timed out after', TIMEOUT_MS, 'ms');
            } else {
                console.error('Error creating user:', error);
            }
            throw error;
        }
    }
};