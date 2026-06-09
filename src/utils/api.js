import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    // Add ngrok/NPort bypass header (works for both)
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    // Add authorization token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles common errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle different error status codes
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`API Error ${status}:`, data);
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Handle forbidden errors
      if (status === 403) {
        console.error('Access forbidden:', data?.detail || 'You do not have permission');
      }
      
      // Handle not found errors
      if (status === 404) {
        console.error('Resource not found:', config.url);
      }
      
      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', data?.detail || 'Internal server error');
      }
    } else if (error.request) {
      // Network error (no response received)
      console.error('Network error:', error.message);
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle trailing slashes
const addTrailingSlash = (url) => {
  if (!url) return url;
  
  // Don't add slash to URLs with query params that already have proper structure
  if (url.includes('?')) {
    const [path, query] = url.split('?');
    const cleanPath = path.endsWith('/') ? path : `${path}/`;
    return `${cleanPath}?${query}`;
  }
  
  // Don't add slash to URLs that already end with slash or have file extensions
  if (url.endsWith('/') || url.includes('.')) {
    return url;
  }
  
  return `${url}/`;
};

// Wrapper for GET requests (automatically adds trailing slash)
api.getWithSlash = (url, config) => {
  return api.get(addTrailingSlash(url), config);
};

// Wrapper for POST requests
api.postWithSlash = (url, data, config) => {
  return api.post(addTrailingSlash(url), data, config);
};

// Wrapper for PUT requests
api.putWithSlash = (url, data, config) => {
  return api.put(addTrailingSlash(url), data, config);
};

// Wrapper for DELETE requests
api.deleteWithSlash = (url, config) => {
  return api.delete(addTrailingSlash(url), config);
};

// Wrapper for PATCH requests
api.patchWithSlash = (url, data, config) => {
  return api.patch(addTrailingSlash(url), data, config);
};

export default api;