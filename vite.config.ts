import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/task_news_media_holding',
  server: {
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('antd')) {
              return 'vendor_antd';
            }
            if (id.includes('react')) {
              return 'vendor_react';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
