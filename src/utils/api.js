import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// IMPORTANT: This interceptor runs BEFORE every request
api.interceptors.request.use((config) => {
  // ngrok header - MUST be present for every request
  config.headers['ngrok-skip-browser-warning'] = 'true';
  
  // Add auth token if present
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('Request URL:', config.url);
  console.log('Request Headers:', config.headers);
  
  return config;
});

// Response interceptor for error handling
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