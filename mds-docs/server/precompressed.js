import fs from 'node:fs'
import path from 'node:path'

/* (Bản sao giống nhau ở chamdiem-app/server và mds-docs/server — máy chủ không có thư mục mds-ui)
   Middleware Express: gửi bản nén sẵn (.br / .gz cạnh file gốc, tạo bởi mds-ui/scripts/precompress.mjs khi build) nếu trình duyệt nhận được.
   Đặt TRƯỚC express.static cùng thư mục. Không có bản nén → next() (static + compression xử lý như cũ).
   Nhớ danh sách file có bản nén trong RAM (không stat đĩa mỗi lượt). */
const TYPES = { '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.wasm': 'application/wasm' }
export function precompressed(dir, { maxAge = 31536000, immutable = true } = {}) {
  const root = path.resolve(dir), has = new Map()   // đường dẫn file → { br, gz }
  const lookup = file => {
    let v = has.get(file)
    if (!v) { v = { br: fs.existsSync(file + '.br'), gz: fs.existsSync(file + '.gz') }; if (has.size < 20000) has.set(file, v) }
    return v
  }
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    const type = TYPES[path.extname(req.path)]; if (!type) return next()
    let rel; try { rel = decodeURIComponent(req.path) } catch { return next() }
    const file = path.join(root, rel)
    if (!file.startsWith(root + path.sep)) return next()
    const ae = String(req.headers['accept-encoding'] || ''), v = lookup(file)
    const enc = v.br && /\bbr\b/.test(ae) ? 'br' : v.gz && /\bgzip\b/.test(ae) ? 'gzip' : null
    if (!enc) return next()
    res.setHeader('Content-Type', type)
    res.setHeader('Content-Encoding', enc)
    res.setHeader('Vary', 'Accept-Encoding')
    res.sendFile(file + (enc === 'br' ? '.br' : '.gz'), { maxAge: maxAge * 1000, immutable, lastModified: true, etag: true }, err => {
      if (!err || res.headersSent) return
      has.delete(file); res.removeHeader('Content-Encoding'); res.removeHeader('Content-Type'); res.removeHeader('Vary'); next()   // bản nén vừa bị xóa (deploy mới) → trả bản gốc
    })
  }
}
