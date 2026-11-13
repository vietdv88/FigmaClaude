/* ═══ Ảnh người hỏi gửi kèm AVA của tài liệu Design System (như app Chấm điểm) ═══
   • Lưu bản đã nén ở trình duyệt (~150KB / ảnh) vào <data>/ava-images/<YYYY-MM-DD>/<mã lượt hỏi>-<n>.<đuôi>
   • Giữ AVA_IMAGE_KEEP_DAYS ngày (mặc định 30) + trần dung lượng AVA_IMAGE_MAX_MB → tự dọn mỗi ngày
   • Chỉ Quản trị / người biên tập xem (Lịch sử hỏi AVA) */
import fs from 'node:fs'
import path from 'node:path'
import { cleanImages } from './ava.js'

export const AVA_IMAGE_KEEP_DAYS = Number(process.env.AVA_IMAGE_KEEP_DAYS ?? 30)
const MAX_BYTES = Number(process.env.AVA_IMAGE_MAX_MB ?? 1024) * 1024 * 1024
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/, FILE_RE = /^[\w-]+\.(jpg|png|webp)$/

export function createAvaImages(root) {
  /** Lưu ảnh của 1 lượt hỏi → ['2026-11-03/ava_x-0.jpg', …]; lỗi ghi đĩa thì bỏ qua (không chặn câu trả lời) */
  function save(logId, images) {
    const list = cleanImages(images)
    if (!list.length || !/^[\w-]+$/.test(logId)) return []
    const day = new Date().toISOString().slice(0, 10)
    try {
      fs.mkdirSync(path.join(root, day), { recursive: true })
      return list.map((img, n) => {
        const rel = `${day}/${logId}-${n}.${EXT[img.mime]}`
        fs.writeFileSync(path.join(root, rel), Buffer.from(img.data, 'base64'))
        return rel
      })
    } catch (e) { console.warn('[ds] AVA: không lưu được ảnh —', e.message); return [] }
  }
  /** Đường dẫn file ảnh hợp lệ (chống ../) hoặc null */
  function file(day, name) {
    if (!DAY_RE.test(day) || !FILE_RE.test(name)) return null
    const p = path.join(root, day, name)
    return fs.existsSync(p) ? p : null
  }
  const dirSize = d => fs.readdirSync(d).reduce((a, f) => { try { return a + fs.statSync(path.join(d, f)).size } catch { return a } }, 0)
  /** Xóa thư mục ngày quá hạn, rồi nếu vẫn vượt trần dung lượng thì xóa tiếp ngày cũ nhất (luôn giữ hôm nay) */
  function purge() {
    if (!fs.existsSync(root)) return
    const cutoff = new Date(Date.now() - AVA_IMAGE_KEEP_DAYS * 86400e3).toISOString().slice(0, 10)
    const keep = []
    let removed = 0
    const drop = d => { fs.rmSync(path.join(root, d), { recursive: true, force: true }); removed++ }
    for (const d of fs.readdirSync(root).filter(d => DAY_RE.test(d)).sort()) (d < cutoff ? drop(d) : keep.push(d))
    const sizes = keep.map(d => dirSize(path.join(root, d)))
    let total = sizes.reduce((a, b) => a + b, 0)
    while (keep.length > 1 && total > MAX_BYTES) { total -= sizes.shift(); drop(keep.shift()) }
    if (removed) console.log(`🧹 [ds] Dọn ${removed} thư mục ảnh AVA (quá ${AVA_IMAGE_KEEP_DAYS} ngày hoặc vượt ${Math.round(MAX_BYTES / 1048576)}MB)`)
  }
  purge()
  setInterval(purge, 86400e3).unref()
  return { save, file, keepDays: AVA_IMAGE_KEEP_DAYS }
}
