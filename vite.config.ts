
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure process.env.API_KEY is safely stringified even if undefined
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Increase limit to suppress warning while manualChunks handles the actual optimization
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Splitting large libraries into separate chunks for better caching and smaller main bundle
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react')) return 'vendor-react-core';
            return 'vendor';
          }
        }
      }
    }
  }
});
