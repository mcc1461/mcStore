// src/services/apiClient.js

import axios from "axios";

// Pull your base URL from an environment variable (e.g. VITE_APP_API_URL)
// Example: VITE_APP_API_URL="http://127.0.0.1:8061"
const BASE_URL = import.meta.env.VITE_APP_API_URL || "http://127.0.0.1:8061";

// Create an Axios instance, pointing to /api under your BASE_URL
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
// Automatically attach Authorization: Bearer <token> if token is in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response Interceptor
// If we get 401 (Unauthorized), we log out / remove tokens
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized! Please log in again.");
      // Optionally remove or refresh the token
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      // You could also redirect to /login or dispatch a logout action
    }
    return Promise.reject(error);
  }
);

export default apiClient;
