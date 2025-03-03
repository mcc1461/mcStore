import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3061,
    strictPort: true,
    host: "0.0.0.0", // Ensure Vite listens on all interfaces
    base: "/",
    proxy: {
      "/api": {
        target: "https://softrealizer.com/api",
        changeOrigin: true,
      },
    },
    allowedHosts: ["softrealizer.com"],
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
          if (id.includes("components")) return "components";
          if (id.includes("pages")) return "pages";
        },
      },
    },
  },
});
