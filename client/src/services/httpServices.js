import axios from 'axios';

// In production on Railway, REACT_APP_SERVER_URL is empty (use relative URLs)
// Nginx will proxy /api requests to the backend server
// In local dev, use REACT_APP_SERVER_URL=http://localhost:5000 or fallback to localhost
const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
const baseURL = API_URL && API_URL !== '' ? `${API_URL}/api` : '/api';

// Create axios instance
const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
