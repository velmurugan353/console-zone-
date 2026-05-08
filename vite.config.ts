import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
            lucide: ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3010,
      host: '0.0.0.0',
      watch: {
        ignored: ['**/temp_mongo_data/**'],
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:5010',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:5010',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
