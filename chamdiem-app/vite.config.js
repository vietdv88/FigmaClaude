import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

/* Mã phiên bản của bản build → app so với /version.json để báo “có bản mới, tải lại” (AppUpdateNotice) */
const BUILD = new Date().toISOString()
const versionFile = { name: 'version-json', apply: 'build', generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: BUILD }) }) } }

export default defineConfig({
  plugins: [vue(), versionFile],
  define: { __APP_BUILD__: JSON.stringify(BUILD) },
  server: {
    port: 3010,
    host: true,
    fs: {
      allow: [path.resolve(__dirname, '..')]
    },
    // `npm run dev:api` (chạy kèm máy chủ `npm run server`) → /api chuyển sang cổng 8080.
    // `npm run dev` một mình → không chuyển tiếp, app tự chạy chế độ demo (dữ liệu trong trình duyệt).
    proxy: process.env.API ? { '/api': { target: 'http://localhost:8080' } } : undefined,
  },
  // Icon Tabler được import từng file (TIcon) → không cho Vite đóng gói lại, tránh việc Vite
  // tự "re-optimize" giữa chừng khi gặp icon mới (gây trang trắng tới khi tải lại).
  optimizeDeps: { exclude: ['@tabler/icons-vue'] },
  resolve: {
    alias: {
      '@mds': path.resolve(__dirname, '../mds-ui/src'),
      '@tabler/icons-vue': path.resolve(__dirname, 'node_modules/@tabler/icons-vue'),
    }
  }
})
