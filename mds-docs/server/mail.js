import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

/* ═══ Gửi thử mẫu email (/ds/email) — bê từ app Chấm điểm (chamdiem-app/server/mail.js): nodemailer + SMTP_* trong .env ═══
   Gắn chung PD Point: dùng luôn SMTP_* của PD Point → thư đi từ đúng hộp thư app Chấm điểm đang gửi lời mời.
   Chạy riêng: đặt SMTP_* trong mds-docs/.env và `npm install` ở server/. Mật khẩu chỉ nằm trong .env. */

// Thư viện: bản cài ở mds-docs/server → không có thì mượn của app chủ đang chạy (gắn chung PD Point thì mds-docs không cài thư viện riêng)
function loadNodemailer() {
  for (const from of [import.meta.url, process.argv[1]]) {
    try { return createRequire(from)('nodemailer') } catch { /* thử nơi tiếp theo */ }
  }
  return null
}

/** → { address, send(msg) } · null khi chưa cấu hình SMTP hoặc không có thư viện */
export function createMailer(env = process.env) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env
  // Có máy chủ thư + (không cần đăng nhập hoặc đã có mật khẩu) — điền thiếu mật khẩu thì coi như chưa cấu hình
  if (!SMTP_HOST || (SMTP_USER && !SMTP_PASS)) return null
  const from = String(env.SMTP_FROM || '').trim()
  const address = /<([^>]+)>/.exec(from)?.[1] || (/^\S+@\S+$/.test(from) ? from : '') || SMTP_USER
  const nodemailer = address && loadNodemailer()
  if (!nodemailer) return null
  const port = Number(SMTP_PORT || 587)
  const transport = nodemailer.createTransport({
    host: SMTP_HOST, port, secure: port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    // Máy chủ thư nội bộ hay dùng chứng chỉ do công ty tự cấp → SMTP_TLS_INSECURE=1 để bỏ kiểm tra chứng chỉ
    tls: env.SMTP_TLS_INSECURE === '1' ? { rejectUnauthorized: false } : undefined,
  })
  return { address, send: msg => transport.sendMail(msg) }
}

/** Mẫu email (HTML tĩnh) → nội dung thư gửi được.
    Ảnh `images/…` đính kèm ngay trong thư (cid): máy chủ tài liệu nằm trong mạng nội bộ, hộp thư bên ngoài không tải được ảnh qua đường dẫn.
    Link mẫu {{…}} đổi sang trang MISA để nút trong thư bấm được. */
export function emailFromTemplate(file) {
  const html = fs.readFileSync(file, 'utf8'), imgDir = path.join(path.dirname(file), 'images')
  const attachments = new Map()
  const body = html
    .replace(/((?:src|background)=["']|url\(\s*["']?)images\/([\w.-]+)/g, (all, pre, name) => {
      const p = path.join(imgDir, name)
      if (!fs.statSync(p, { throwIfNoEntry: false })?.isFile()) return all
      attachments.set(name, { filename: name, path: p, cid: `${name}@mds-docs` })
      return `${pre}cid:${name}@mds-docs`
    })
    .replace(/href="\{\{[A-Z_]+\}\}"/g, 'href="https://www.misa.vn"')
  return { title: (/<title>([^<]*)<\/title>/i.exec(html)?.[1] || '').trim(), html: body, attachments: [...attachments.values()] }
}
