// src/contexts/APIContext.js
import axios from 'axios';

// Define the base URL for your backend API
export const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
});

// This interceptor runs before every request is sent.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // If a token exists, add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// This interceptor handles global 401 Unauthorized errors.
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Session expired or token is invalid. Logging out.");
      // Clear out the invalid token and user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to the login page
      window.location.href = '/'; 
    }
    // For all other errors, just return the error
    return Promise.reject(error);
  }
);

export default api;
