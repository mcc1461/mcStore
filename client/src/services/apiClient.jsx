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

// ----------------------------
// Request Interceptor
// ----------------------------
// Automatically attach Authorization: Bearer <token> if token is in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// Response Interceptor
// ----------------------------
// If we get 401 (Unauthorized), we remove tokens, then show a friendly message & link to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove any stored credentials
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");

      // Show a user-friendly alert. Alternatively, you could use a toast or modal.
      alert(
        "Login is required to continue.\n\nClick OK to go to the Login page."
      );

      // Optionally redirect the user to the login page
      // If you're using React Router, you can do window.location = "/login"
      window.location.href = "/login";
    }

    // For other errors, just reject as usual
    return Promise.reject(error);
  }
);

export default apiClient;
