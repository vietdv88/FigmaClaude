import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

/* Tài liệu MISA Design System — chạy dưới /ds/ cùng tên miền với PD Point (máy chủ PD Point phục vụ dist/ + API /api/ds).
   Dev: `npm run dev` (cổng 3020) — /api và /ds/files chuyển sang máy chủ API (mặc định http://localhost:8080, đổi bằng API=…) */
const API = process.env.API || 'http://localhost:8080'

export default defineConfig({
  base: '/ds/',
  plugins: [vue()],
  server: {
    port: 3020,
    fs: { allow: [path.resolve(__dirname, '..')] },
    proxy: { '/api': { target: API }, '/ds/files': { target: API } },
  },
  optimizeDeps: { exclude: ['@tabler/icons-vue'] },
  resolve: {
    alias: {
      '@mds': path.resolve(__dirname, '../mds-ui/src'),
      '@tabler/icons-vue': path.resolve(__dirname, 'node_modules/@tabler/icons-vue'),
    },
  },
})
