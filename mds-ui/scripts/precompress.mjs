/* Nén sẵn file build (brotli + gzip) — máy chủ gửi thẳng file .br / .gz thay vì nén lại ở MỖI lượt tải (đỡ CPU khi nhiều người cùng vào).
   Dùng: node ../mds-ui/scripts/precompress.mjs dist   (chạy sau vite build) */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const root = path.resolve(process.argv[2] || 'dist')
const EXT = new Set(['.js', '.css', '.html', '.svg', '.json', '.mjs', '.txt', '.wasm'])
let n = 0, raw = 0, br = 0
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name)
    if (f.isDirectory()) { walk(p); continue }
    if (!EXT.has(path.extname(f.name)) || f.name.endsWith('.br') || f.name.endsWith('.gz')) continue
    const buf = fs.readFileSync(p)
    if (buf.length < 1024) continue   // file nhỏ: nén không đáng
    const stat = fs.statSync(p)
    // Đã nén từ trước và file gốc không đổi → bỏ qua (build lại nhanh)
    if (fs.existsSync(p + '.br') && fs.statSync(p + '.br').mtimeMs >= stat.mtimeMs) continue
    const b = zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } })
    const g = zlib.gzipSync(buf, { level: 9 })
    fs.writeFileSync(p + '.br', b); fs.writeFileSync(p + '.gz', g)
    n++; raw += buf.length; br += b.length
  }
}
walk(root)
console.log(`✓ precompress ${path.relative(process.cwd(), root) || root}: ${n} file · ${(raw / 1024).toFixed(0)}KB → br ${(br / 1024).toFixed(0)}KB`)
