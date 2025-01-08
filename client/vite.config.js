import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration with proxy to the backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3061, // Frontend running on port 3061
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8061", // Proxy API requests to backend
        changeOrigin: true,
      },
    },
  },
});
