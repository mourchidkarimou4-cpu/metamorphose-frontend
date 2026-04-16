import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 2000,
    rolldownOptions: {
      output: {
        manualChunks: {
          vendor:   ['react','react-dom','react-router-dom'],
          zego:     ['@zegocloud/zego-uikit-prebuilt'],
          axios:    ['axios'],
        }
      }
    }
  },
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor'
          }
          if (id.includes('qrcode')) {
            return 'qrcode'
          }
        }
      }
    }
  }
})
