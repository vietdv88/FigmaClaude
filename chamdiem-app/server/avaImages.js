/* ═══ ẢNH NGƯỜI DÙNG GỬI AVA — lưu để Quản trị kiểm tra AVA đọc đúng / sai ═══
   • Lưu bản đã nén ở trình duyệt (~150KB / ảnh) vào DATA_DIR/ava-images/<YYYY-MM-DD>/<mã lượt hỏi>-<n>.<đuôi>
   • TỰ XÓA: mỗi ngày xóa cả thư mục ngày cũ hơn AVA_IMAGE_KEEP_DAYS (mặc định 30) + chặn tổng dung lượng AVA_IMAGE_MAX_MB
     (mặc định 2048MB — vượt thì xóa dần ngày cũ nhất) → không bao giờ đầy ổ dù bị gửi ảnh liên tục
   • Chỉ Quản trị xem (qua /api/admin/ava-images/…) */
import fs from 'node:fs'
import path from 'node:path'
import { DB_FILE } from './store.js'
import { cleanImages } from '../src/store/aiAva.js'

export const AVA_IMAGE_KEEP_DAYS = Number(process.env.AVA_IMAGE_KEEP_DAYS ?? 30)
const MAX_BYTES = Number(process.env.AVA_IMAGE_MAX_MB ?? 2048) * 1024 * 1024
const ROOT = path.join(path.dirname(DB_FILE), 'ava-images')
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/, FILE_RE = /^[\w-]+\.(jpg|png|webp)$/

/** Lưu ảnh của 1 lượt hỏi → danh sách đường dẫn tương đối ('2026-10-23/ava_x-0.jpg'); lỗi ghi đĩa thì bỏ qua (không chặn câu trả lời) */
export function saveAvaImages(logId, images) {
  const list = cleanImages(images)
  if (!list.length || !/^[\w-]+$/.test(logId)) return []
  const day = new Date().toISOString().slice(0, 10)
  try {
    fs.mkdirSync(path.join(ROOT, day), { recursive: true })
    return list.map((img, n) => {
      const rel = `${day}/${logId}-${n}.${EXT[img.mime]}`
      fs.writeFileSync(path.join(ROOT, rel), Buffer.from(img.data, 'base64'))
      return rel
    })
  } catch (e) { console.warn('AVA: không lưu được ảnh —', e.message); return [] }
}

/** Đường dẫn file ảnh hợp lệ (chống ../) hoặc null */
export function avaImagePath(day, file) {
  if (!DAY_RE.test(day) || !FILE_RE.test(file)) return null
  const p = path.join(ROOT, day, file)
  return fs.existsSync(p) ? p : null
}

const dirSize = dir => fs.readdirSync(dir).reduce((a, f) => { try { return a + fs.statSync(path.join(dir, f)).size } catch { return a } }, 0)

/** Dọn ảnh: xóa thư mục ngày quá hạn, rồi nếu tổng dung lượng vẫn vượt trần thì xóa tiếp ngày cũ nhất */
export function purgeAvaImages() {
  if (!fs.existsSync(ROOT)) return
  const cutoff = new Date(Date.now() - AVA_IMAGE_KEEP_DAYS * 86400e3).toISOString().slice(0, 10)
  const days = fs.readdirSync(ROOT).filter(d => DAY_RE.test(d)).sort()
  let removed = 0
  const drop = d => { fs.rmSync(path.join(ROOT, d), { recursive: true, force: true }); removed++ }
  const keep = []
  for (const d of days) (d < cutoff ? drop(d) : keep.push(d))
  const sizes = keep.map(d => dirSize(path.join(ROOT, d)))
  let total = sizes.reduce((a, b) => a + b, 0)
  while (keep.length > 1 && total > MAX_BYTES) { total -= sizes.shift(); drop(keep.shift()) }   // luôn giữ ngày hôm nay
  if (removed) console.log(`🧹 Dọn ${removed} thư mục ảnh AVA (quá ${AVA_IMAGE_KEEP_DAYS} ngày hoặc vượt ${Math.round(MAX_BYTES / 1048576)}MB)`)
}
