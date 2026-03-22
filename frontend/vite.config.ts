import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    // Proxy /api calls to backend during dev (alternative to VITE_API_URL)
    proxy: {
      '/responders': 'http://localhost:5000',
      '/alerts': 'http://localhost:5000',
    },
  },
});
