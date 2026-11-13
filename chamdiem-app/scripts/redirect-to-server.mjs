// ═══════════════════════════════════════════════════════════════════════════
//  PD Point đã chuyển hẳn lên máy chủ http://pdpoint.sdcthin.local (13/10/2026).
//  Bản trên máy này không chạy nữa — cổng cũ (8080 = bản chính, 3010 = bản demo Vite)
//  chỉ còn chuyển hướng mọi đường dẫn sang địa chỉ mới, giữ nguyên path + query.
//  Chạy bởi LaunchAgent vn.misa.pdpoint.server (tự bật khi đăng nhập máy).
//  Dùng 302 (không phải 301) để trình duyệt không nhớ vĩnh viễn — đổi ý vẫn gỡ được.
// ═══════════════════════════════════════════════════════════════════════════
import http from 'node:http'

const TARGET = (process.env.REDIRECT_TARGET || 'http://pdpoint.sdcthin.local').replace(/\/$/, '')
const PORTS  = (process.env.REDIRECT_PORTS || '8080,3010').split(',').map(Number)

const handler = (req, res) => {
  res.writeHead(302, { Location: TARGET + (req.url || '/'), 'Cache-Control': 'no-store' })
  res.end(`PD Point đã chuyển sang ${TARGET}\n`)
}

for (const port of PORTS) {
  http.createServer(handler)
    .on('error', e => console.error(`✗ Cổng ${port}: ${e.message}`))
    .listen(port, () => console.log(`↪ :${port} → ${TARGET}`))
}
