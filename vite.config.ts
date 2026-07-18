import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split large, independently-cacheable vendors into their own chunks
        // so a change in app code doesn't bust the whole vendor bundle.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('framer-motion') || id.includes('/motion-dom/') || id.includes('/motion-utils/')) return 'motion';
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('/victory-')) return 'charts';
          if (id.includes('/ogl/')) return 'gl';
          if (id.includes('react-bootstrap') || id.includes('/bootstrap/') || id.includes('@restart/')) return 'bootstrap';
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/') || id.includes('/scheduler/')) return 'react';
        },
      },
    },
  },
})
