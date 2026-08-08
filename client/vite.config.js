import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev the React app runs on 5174 and proxies API + image requests to the
// Express server, so cookies stay same-origin from the browser's perspective.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: "http://localhost:5173", changeOrigin: true },
      "/images": { target: "http://localhost:5173", changeOrigin: true },
      "/healthz": { target: "http://localhost:5173", changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
