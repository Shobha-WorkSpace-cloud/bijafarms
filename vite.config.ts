import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://bijafarms-api.onrender.com',
        changeOrigin: true,
        secure: true
      }
    },
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: 'client/main.tsx'
    },
    assetsInclude: ['**/*.js', '**/*.mjs'],
  },
  plugins: [react()],
  base: "/builder-aura-haven/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
