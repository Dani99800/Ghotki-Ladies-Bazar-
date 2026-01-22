import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Safely inject the API key and provide a global process.env fallback
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env': {}
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Effective chunk splitting to separate vendor code from app logic
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('router')) {
              return 'vendor-core';
            }
            if (id.includes('lucide') || id.includes('recharts')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});