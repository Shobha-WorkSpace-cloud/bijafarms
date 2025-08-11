import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
      allow: ["./client", "./shared", "./src"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    },
    assetsInclude: ['**/*.js', '**/*.mjs'],
  },
  plugins: [
    react(),
    {
      name: 'remove-duplicate-script',
      transformIndexHtml(html, { mode }) {
        let modifiedHtml = html.replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/, '');
        if (mode === 'production') {
          modifiedHtml = modifiedHtml.replace('</body>', '<script type="module" src="/bijafarms/src/main.tsx"></script>\n</body>');
        } else {
          modifiedHtml = modifiedHtml.replace('</body>', '<script type="module" src="/bijafarms/src/main.tsx"></script>\n</body>');
        }
        return modifiedHtml;
      }
    }
  ],
  base: mode === 'production' ? "/bijafarms/" : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
