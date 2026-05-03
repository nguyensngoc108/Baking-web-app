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

// Attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Detect expired / invalid sessions
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status  = error.response?.status;
        const url     = error.config?.url || '';
        const hasToken = !!localStorage.getItem('token');

        // Only fire when the user was authenticated and the token was rejected.
        // Skip auth endpoints so login failures don't trigger the modal.
        if (status === 401 && hasToken && !url.includes('/auth/')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('session:expired'));
        }

        return Promise.reject(error);
    }
);

export default api;
