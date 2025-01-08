import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_API_URL; // Replace with your API base URL

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header if token exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global error scenarios
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized! Please log in again.");
      // Handle optional token refresh or redirection
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
