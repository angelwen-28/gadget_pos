import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          vendor: ['react', 'react-dom'],
          dexie: ['dexie', 'dexie-react-hooks'],
          charts: ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  }
});
