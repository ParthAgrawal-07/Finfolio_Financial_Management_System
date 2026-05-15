import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      // Forward /api/* calls to Node.js backend
      "/api": {
        target: process.env.VITE_API_URL ?? "http://backend:3001",
        changeOrigin: true,
      },
      // Forward /analytics/* calls to FastAPI microservice
      "/analytics": {
        target: process.env.VITE_ANALYTICS_URL ?? "http://analytics:8000",
        changeOrigin: true,
      },
    },
  },
});
