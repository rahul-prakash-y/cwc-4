import axios from 'axios';

// Development mode directs to http://localhost:5000/api, production mode directs to /api
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
export const API_BASE_URL = isDev ? 'http://localhost:5000/api' : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and normalize endpoint URLs
apiClient.interceptors.request.use(
  (config) => {
    // Normalize URL if prefix '/api' is included in relative path
    if (config.url) {
      if (config.url.startsWith('/api/')) {
        config.url = config.url.replace('/api/', '/');
      } else if (config.url === '/api') {
        config.url = '';
      }
    }

    const token = localStorage.getItem('cwc_jwt_token') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors and blocked users
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const message = String(error.response.data?.message || '').toLowerCase();
      if (message.includes('blocked')) {
        localStorage.removeItem('cwc_jwt_token');
        localStorage.removeItem('cwc_user');
        localStorage.removeItem('token');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?blocked=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
