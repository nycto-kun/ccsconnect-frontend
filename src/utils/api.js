import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // DO NOT add trailing slashes to these endpoints
    const skipTrailingSlash = [
      '/auth/login', '/auth/me', '/auth/register', '/auth/forgot-password',
      '/auth/change-password', '/admin/stats', '/ai/recommendations',
      '/upload/resume', '/upload/profile-image', '/chat/conversations',
      '/ai/student-embedding', '/ai/job-embedding'
    ];
    
    const shouldSkip = skipTrailingSlash.some(endpoint => config.url?.startsWith(endpoint));
    
    if (!shouldSkip && config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
      config.url = `${config.url}/`;
    } else if (!shouldSkip && config.url && config.url.includes('?') && !config.url.split('?')[0].endsWith('/')) {
      const [path, query] = config.url.split('?');
      config.url = `${path}/?${query}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);
      
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;