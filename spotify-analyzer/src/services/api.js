import axios from 'axios';

const API_BASE_URL = 'http://192.168.254.128:8080/api';
const TIMEOUT_MS = 5000;

export const apiService = {
    checkStatus: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/status`, {
                timeout: TIMEOUT_MS,
                withCredentials: true
            });
            console.log('API connection status:', response.data.status, '\nServer time:', response.data.timestamp);
            return response.data.status;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error('Request timed out after', TIMEOUT_MS, 'ms');
            } else {
                console.error('Error checking API status:', error);
            }
            throw error;
        }
    }
};
