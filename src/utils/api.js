import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Add token and ngrok header to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // THIS IS CRITICAL FOR NGROK - MUST BE SENT WITH EVERY REQUEST
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// In src/utils/api.js, add this interceptor
api.interceptors.request.use((config) => {
  // Add trailing slash to URLs that don't have one and don't have query params
  if (config.url && !config.url.includes('?') && !config.url.endsWith('/')) {
    config.url = config.url + '/';
  }
  // Handle URLs with query params
  if (config.url && config.url.includes('?') && !config.url.split('?')[0].endsWith('/')) {
    const [path, query] = config.url.split('?');
    config.url = path + '/?' + query;
  }
  return config;
});

export default api;