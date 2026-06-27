import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL || "http://localhost:5000";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: apiTarget.replace(/\/$/, ""),
          changeOrigin: true,
          secure: false,
          timeout: 60000,
          proxyTimeout: 60000,
        },
        "/uploads": {
          target: apiTarget.replace(/\/$/, ""),
          changeOrigin: true,
          secure: false,
          timeout: 60000,
          proxyTimeout: 60000,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Split heavy third-party libraries into long-cacheable vendor chunks so
      // the main app bundle stays small and browser caching is more effective.
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "data-vendor": ["@tanstack/react-query", "axios", "@reduxjs/toolkit", "react-redux"],
            "motion-vendor": ["framer-motion"],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    // Pre-bundle the hottest deps for faster cold dev startup.
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "framer-motion"],
    },
  };
});
