import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    viteMockServe({
      mockPath: 'mock',
      localEnabled: command === 'serve',
    }),
  ],
  server: {
    proxy: {
      '/v1': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
      },
      '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api/, '')
    }
    },
  },
}))