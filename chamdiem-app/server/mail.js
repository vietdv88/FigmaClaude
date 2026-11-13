import nodemailer from 'nodemailer'

/* ═══ Email mời — gửi qua SMTP nếu đã cấu hình; chưa có thì app hiện link để Quản trị tự gửi ═══
   Người gửi mặc định: designer@software.misa.com.vn (đổi bằng SMTP_FROM). Mật khẩu chỉ đặt trong .env. */
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
const DEFAULT_SENDER = 'designer@software.misa.com.vn'
export const MAIL_FROM = process.env.SMTP_FROM || `MISA Solution Point <${SMTP_USER || DEFAULT_SENDER}>`
// Có máy chủ thư + (không cần đăng nhập hoặc đã có mật khẩu) — điền thiếu mật khẩu thì coi như chưa cấu hình
export const mailEnabled = !!SMTP_HOST && (!SMTP_USER || !!SMTP_PASS)

const port = Number(SMTP_PORT || 587)
const transport = mailEnabled
  ? nodemailer.createTransport({
      host: SMTP_HOST, port, secure: port === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      // Máy chủ thư nội bộ hay dùng chứng chỉ do công ty tự cấp → SMTP_TLS_INSECURE=1 để bỏ kiểm tra chứng chỉ
      tls: process.env.SMTP_TLS_INSECURE === '1' ? { rejectUnauthorized: false } : undefined,
    })
  : null

/** Thông tin cấu hình (không lộ mật khẩu) — hiện ở Cài đặt hệ thống */
export const mailInfo = () => ({ enabled: mailEnabled, from: MAIL_FROM, host: SMTP_HOST ? `${SMTP_HOST}:${port}` : '', user: SMTP_USER || '', missingPass: !!SMTP_HOST && !!SMTP_USER && !SMTP_PASS })

const ROLE_LABELS = { admin: 'Quản trị', PO: 'PO', PDL: 'PD Lead', BA: 'BA', PD: 'PD (UI/UX Designer)' }
const BRAND = '#0e9a62'   // màu chủ đạo theme Green
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const button = (href, label) => `<a href="${esc(href)}" style="display:inline-block;padding:10px 16px;background:${BRAND};color:#fff;border-radius:8px;text-decoration:none;font-weight:600">${esc(label)}</a>`
const wrap = body => `<div style="font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.6;color:#101828">${body}</div>`

export async function sendInvite({ to, name, inviter, role, projects, link }) {
  if (!transport) return false
  const roleText = ROLE_LABELS[role] || role || 'chưa phân bộ phận'
  await transport.sendMail({
    from: MAIL_FROM,
    to,
    subject: `${inviter} mời bạn vào ứng dụng MISA Solution Point`,
    text: `Chào ${name || to},\n\n${inviter} đã mời bạn vào ứng dụng MISA Solution Point với vai trò ${roleText}${projects ? ` (dự án: ${projects})` : ''}.\n` +
          `Mở link sau để đặt mật khẩu và vào ứng dụng (link dùng 1 lần, có hạn 7 ngày):\n${link}\n\n` +
          `Tên đăng nhập là Gmail này: ${to}. Quyền và dự án đã được phân sẵn — đặt mật khẩu xong là dùng được ngay.\n`,
    html: wrap(`
      <p>Chào ${esc(name || to)},</p>
      <p><b>${esc(inviter)}</b> đã mời bạn vào ứng dụng <b>MISA Solution Point</b> với vai trò <b>${esc(roleText)}</b>${projects ? ` — dự án: ${esc(projects)}` : ''}.</p>
      <p>${button(link, 'Đặt mật khẩu & vào ứng dụng')}</p>
      <p style="color:#717680">Tên đăng nhập là Gmail này: <b>${esc(to)}</b>. Link dùng 1 lần, có hạn 7 ngày. Quyền và dự án đã được phân sẵn — đặt mật khẩu xong là dùng được ngay.<br>Nếu nút không bấm được, mở link: ${esc(link)}</p>`),
  })
  return true
}

/** Link đặt lại mật khẩu (Quên mật khẩu / Quản trị gửi) — purpose 'reset' 1 giờ · 'invite' 7 ngày */
export async function sendPasswordLink({ to, name, link, purpose = 'reset' }) {
  if (!transport) return false
  const hours = purpose === 'invite' ? '7 ngày' : '1 giờ'
  await transport.sendMail({
    from: MAIL_FROM,
    to,
    subject: purpose === 'invite' ? 'Đặt mật khẩu MISA Solution Point' : 'Đặt lại mật khẩu MISA Solution Point',
    text: `Chào ${name || to},\n\nMở link sau để ${purpose === 'invite' ? 'đặt' : 'đặt lại'} mật khẩu MISA Solution Point (link dùng 1 lần, có hạn ${hours}):\n${link}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này — mật khẩu hiện tại vẫn giữ nguyên.\n`,
    html: wrap(`
      <p>Chào ${esc(name || to)},</p>
      <p>Bấm nút dưới để ${purpose === 'invite' ? 'đặt' : 'đặt lại'} mật khẩu <b>MISA Solution Point</b> cho tài khoản <b>${esc(to)}</b>.</p>
      <p>${button(link, purpose === 'invite' ? 'Đặt mật khẩu' : 'Đặt lại mật khẩu')}</p>
      <p style="color:#717680">Link dùng 1 lần, có hạn ${hours}. Nếu bạn không yêu cầu, hãy bỏ qua email này — mật khẩu hiện tại vẫn giữ nguyên.<br>Nếu nút không bấm được, mở link: ${esc(link)}</p>`),
  })
  return true
}

/** Gửi email thử (kiểm tra cấu hình SMTP) */
export async function sendTest(to) {
  if (!transport) throw Object.assign(new Error('Chưa cấu hình SMTP (SMTP_HOST) trong .env'), { status: 400 })
  await transport.verify()
  await transport.sendMail({
    from: MAIL_FROM, to,
    subject: 'Solution Point — email thử',
    text: 'Cấu hình gửi email của Solution Point hoạt động. Lời mời người dùng sẽ được gửi từ địa chỉ này.',
    html: wrap('<p>Cấu hình gửi email của <b>Solution Point</b> hoạt động.</p><p style="color:#717680">Lời mời người dùng sẽ được gửi từ địa chỉ này.</p>'),
  })
  return true
}
