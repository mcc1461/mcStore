import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3061,
    base: "/", // Frontend running on port 3061
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8061", // Proxy API requests to backend
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500, // Increase warning limit (default is 500)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Splits external libraries
          }
          if (id.includes("components")) {
            return "components"; // Splits custom components
          }
          if (id.includes("pages")) {
            return "pages"; // Splits page components
          }
        },
      },
    },
  },
});
