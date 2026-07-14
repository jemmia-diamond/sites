import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Proxy API requests to backend so cookies work with SameSite=Lax
      proxy: {
        '/auth': {
          target,
          changeOrigin: true,
          secure: true,
        },
        '/product-types': {
          target,
          changeOrigin: true,
          secure: true,
        },
        '/image-generation': {
          target,
          changeOrigin: true,
          secure: true,
        },
        '/site': {
          target,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
