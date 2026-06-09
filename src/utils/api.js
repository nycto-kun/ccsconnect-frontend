import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// This interceptor runs BEFORE every request
api.interceptors.request.use((config) => {
  // CRITICAL: This header MUST be here for ngrok
  config.headers['ngrok-skip-browser-warning'] = '69420';
  
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log to verify the header is being added
  console.log('Request:', config.method?.toUpperCase(), config.url);
  console.log('ngrok header:', config.headers['ngrok-skip-browser-warning']);
  
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

export default api;