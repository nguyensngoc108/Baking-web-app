import axios from 'axios';

// Development: use REACT_APP_SERVER_URL (localhost:5000)
// Production: use relative /api (production domain)
const baseURL = process.env.NODE_ENV === 'development' && process.env.REACT_APP_SERVER_URL
    ? `${process.env.REACT_APP_SERVER_URL}/api`
    : '/api';

const api = axios.create({
    baseURL,
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
