<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Mẫu:</span>
      <div class="seg" role="group" aria-label="Mẫu email">
        <button v-for="t in TEMPLATES" :key="t.id" type="button" class="seg__item" :class="{ 'seg__item--active': tpl === t.id }" :aria-pressed="tpl === t.id" @click="tpl = t.id">{{ t.label }}</button>
      </div>
      <span class="demo-muted">Xem:</span>
      <div class="seg" role="group" aria-label="Kiểu xem">
        <button v-for="v in VIEWS" :key="v.id" type="button" class="seg__item" :class="{ 'seg__item--active': view === v.id }" :aria-pressed="view === v.id" @click="view = v.id">{{ v.label }}</button>
      </div>
      <span class="demo-muted">Thiết bị:</span>
      <div class="seg" role="group" aria-label="Thiết bị xem">
        <button v-for="d in DEVICES" :key="d.id" type="button" class="seg__item" :class="{ 'seg__item--active': device === d.id }" :aria-pressed="device === d.id" @click="device = d.id">{{ d.label }}</button>
      </div>
    </div>
    <span class="demo-muted">{{ TEMPLATES.find(t => t.id === tpl).hint }} Máy tính: thẻ trắng rộng 600px, lề nội dung 40px · Điện thoại (≤ 620px): thẻ trắng vẫn bo góc, cách mép 8px, lề nội dung <b>16px</b>.</span>
    <!-- Lưu ý riêng của mẫu (VD “Khách hàng gửi khách của họ”) -->
    <AppInlineAlert v-if="TEMPLATES.find(t => t.id === tpl).note" type="info" title="Lưu ý" stacked>
      <template v-for="(n, i) in TEMPLATES.find(t => t.id === tpl).note" :key="i"><span class="demo-email-note">{{ n }}</span></template>
    </AppInlineAlert>

    <!-- Gửi thử: gửi đúng mẫu đang chọn vào hộp thư thật (khung “Như Gmail” chỉ mô phỏng gần đúng) — chỉ hiện khi máy chủ đã cấu hình gửi email -->
    <form v-if="state.me.mailEnabled" ref="sendForm" class="demo-row" novalidate @submit.prevent="sendTest">
      <span class="demo-muted">Gửi thử:</span>
      <AppInput class="demo-email-to" :message="sendErr">
        <AppTextbox v-model="sendTo" type="email" placeholder="Email nhận thư thử" />
      </AppInput>
      <button type="submit" class="btn btn--outline btn--neutral" :disabled="sending">
        <span v-if="sending" class="spinner spinner--sm" role="status" aria-label="Đang gửi" /><TIcon v-else name="send" />Gửi thử
      </button>
      <span class="demo-muted">Gửi đúng mẫu đang chọn vào hộp thư của bạn để xem trên ứng dụng đọc thư thật.</span>
    </form>

    <!-- Xem trước: iframe đúng bề rộng thiết bị → media query của email chạy như trong ứng dụng đọc mail -->
    <div v-if="view === 'raw'" class="demo-email-stage">
      <iframe :key="tpl" ref="frame" class="demo-email-frame" :class="`demo-email-frame--${device}`" scrolling="no" :src="url" :title="`Xem trước ${TEMPLATES.find(t => t.id === tpl).label}`" @load="fit" />
    </div>

    <!-- Xem như Gmail: khung giao diện hộp thư (web / app điện thoại) + email đã qua các bước Gmail tự sửa (xem gmailize) — mô phỏng gần đúng -->
    <template v-else>
      <span class="demo-muted">Mô phỏng gần đúng cách Gmail hiển thị: Gmail <b>bỏ toàn bộ style của thẻ &lt;body&gt;</b> — nền xám vì vậy đặt ở bảng ngoài cùng (bgcolor + style) để vẫn hiện, <b>không hiện bóng đổ (box-shadow) và nền chuyển màu (gradient)</b> — dùng màu nền dự phòng. Kết quả cuối vẫn cần gửi thử vào Gmail thật.</span>
      <div class="demo-email-stage" :class="{ 'demo-email-stage--phone': device === 'mobile' }">
        <!-- Gmail web -->
        <div v-if="device === 'desktop'" class="gm-web">
          <div class="gm-web__bar">
            <span class="gm-ic"><TIcon name="arrow-left" /></span><span class="gm-ic"><TIcon name="archive" /></span><span class="gm-ic"><TIcon name="trash" /></span><span class="gm-ic"><TIcon name="mail" /></span>
            <span class="gm-web__sp" /><span class="gm-ic"><TIcon name="printer" /></span><span class="gm-ic"><TIcon name="external-link" /></span>
          </div>
          <div class="gm-web__subject">{{ subject }} <span class="gm-chip">Hộp thư đến</span></div>
          <div class="gm-sender">
            <span class="gm-avatar">{{ sender.name.trim()[0] }}</span>
            <div class="gm-sender__who"><b>{{ sender.name }}</b> <span class="gm-mute">&lt;{{ sender.email }}&gt;</span><div class="gm-mute">đến tôi ▾</div></div>
            <span class="gm-mute gm-sender__time">09:30 (0 phút trước)</span>
            <span class="gm-ic"><TIcon name="star" /></span><span class="gm-ic"><TIcon name="arrow-back-up" /></span><span class="gm-ic"><TIcon name="dots-vertical" /></span>
          </div>
          <iframe :key="tpl + device + srcdocKey" ref="frame" class="gm-web__body" scrolling="no" :srcdoc="gmailDoc" :title="`Xem như Gmail — ${subject}`" @load="fit" />
          <div class="gm-actions"><span class="gm-btn"><TIcon name="arrow-back-up" />Trả lời</span><span class="gm-btn">Chuyển tiếp</span></div>
        </div>
        <!-- App Gmail trên điện thoại -->
        <div v-else class="gm-app">
          <div class="gm-app__bar"><span class="gm-ic"><TIcon name="arrow-left" /></span><span class="gm-web__sp" /><span class="gm-ic"><TIcon name="archive" /></span><span class="gm-ic"><TIcon name="trash" /></span><span class="gm-ic"><TIcon name="mail" /></span><span class="gm-ic"><TIcon name="dots-vertical" /></span></div>
          <div class="gm-app__subject">{{ subject }} <span class="gm-chip">Hộp thư đến</span></div>
          <div class="gm-sender gm-sender--app">
            <span class="gm-avatar">{{ sender.name.trim()[0] }}</span>
            <div class="gm-sender__who"><b>{{ sender.name }}</b> <span class="gm-mute">09:30</span><div class="gm-mute">đến tôi ▾</div></div>
            <span class="gm-ic"><TIcon name="arrow-back-up" /></span><span class="gm-ic"><TIcon name="dots-vertical" /></span>
          </div>
          <iframe :key="tpl + device + srcdocKey" ref="frame" class="gm-app__body" scrolling="no" :srcdoc="gmailDoc" :title="`Xem như app Gmail — ${subject}`" @load="fit" />
        </div>
      </div>
    </template>

    <!-- Mã HTML cho dev: ảnh đổi sang đường dẫn đầy đủ để dán vào hệ thống gửi mail là chạy -->
    <div class="demo-email-code">
      <div class="demo-email-code__bar">
        <span class="demo-email-code__title">Mã HTML — {{ TEMPLATES.find(t => t.id === tpl).file }}</span>
        <button type="button" class="btn btn--outline btn--neutral btn--sm" @click="download"><TIcon name="download" />Tải file</button>
        <button type="button" class="btn btn--primary btn--sm" @click="copy"><TIcon :name="copied ? 'check' : 'copy'" />{{ copied ? 'Đã sao chép' : 'Sao chép mã' }}</button>
      </div>
      <pre class="demo-email-code__pre"><code>{{ html || 'Đang tải…' }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import { toast } from '@mds/utils/toast.js'
import { focusFirstError } from '@mds/utils/fieldError.js'
import { copyText } from '../copyText.js'
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'
import { state, api } from '../store.js'

const BASE = import.meta.env.BASE_URL + 'email/'
const TEMPLATES = [
  { id: 'misa', label: 'MISA (chung)', file: 'misa.html', hint: 'Email chung của MISA (MISA ID, MISA Store…): chỉ logo MISA.' },
  { id: 'amis', label: 'Nền tảng (AMIS)', file: 'amis.html', hint: 'Email từ 1 nền tảng: chỉ logo nền tảng.' },
  { id: 'quytrinh', label: 'Ứng dụng (AMIS Quy trình)', file: 'quytrinh.html', hint: 'Email từ 1 ứng dụng trong nền tảng: logo nền tảng bên trái, logo ứng dụng bên phải.' },
  { id: 'khachhang', label: 'Khách hàng gửi khách của họ', file: 'khachhang.html', hint: 'Email đơn vị dùng phần mềm MISA gửi cho khách của họ (hóa đơn, biên bản…): KHÔNG header logo MISA / ứng dụng — đơn vị tự cấu hình phần đầu, chưa cấu hình thì ứng dụng tự dùng banner tiêu đề; footer “Thông báo được gửi qua [Tên sản phẩm] - Một sản phẩm của MISA.”',
    note: ['Ứng dụng cho phép người dùng tự tuỳ chỉnh mẫu email của họ có 2 dạng:',
      'Dạng 1 — Cho tuỳ chỉnh TOÀN BỘ nội dung: không ốp theo template quy định.',
      'Dạng 2 — Chỉ tuỳ chỉnh NỘI DUNG gửi đi, khung cố định do ứng dụng fix: bọc nội dung trong nền trắng, footer có thông tin “Thông báo được gửi qua [Tên ứng dụng] - Một sản phẩm của MISA”, đúng như mẫu sample đang quy định ở đây.'] },
]
const DEVICES = [{ id: 'desktop', label: 'Máy tính' }, { id: 'mobile', label: 'Điện thoại (375)' }]
const VIEWS = [{ id: 'raw', label: 'Bản gốc' }, { id: 'gmail', label: 'Như Gmail' }]
const view = ref('raw')
// Người gửi hiện trên dòng tiêu đề thư (chỉ để hình dung)
const SENDERS = { misa: { name: 'MISA', email: 'no-reply@misa.vn' }, amis: { name: 'MISA AMIS', email: 'no-reply@amis.vn' }, quytrinh: { name: 'AMIS Quy trình', email: 'no-reply@amis.vn' }, khachhang: { name: 'HỘ KINH DOANH TOKI RETREAT VÂN LONG', email: 'hoadon@meinvoice.vn' } }
const tpl = ref('misa'), device = ref('desktop'), html = ref(''), copied = ref(false), frame = ref(null)
// ?v= mỗi lần mở trang: máy chủ cho trình duyệt nhớ file 1 giờ → sửa mẫu xong vẫn thấy bản cũ (VD còn luật bỏ bo góc trên mobile)
const V = Date.now()
const url = computed(() => BASE + TEMPLATES.find(t => t.id === tpl.value).file + '?v=' + V)
const raw = ref('')   // HTML gốc của mẫu (đường dẫn ảnh tương đối)
const sender = computed(() => SENDERS[tpl.value])
const subject = computed(() => (/<title>([^<]*)<\/title>/i.exec(raw.value)?.[1] || '').trim())
const srcdocKey = ref(0)

/* Mô phỏng các bước Gmail tự sửa HTML trước khi hiển thị (gần đúng — tài liệu hỗ trợ CSS của Gmail):
   · bỏ mọi thuộc tính / style của <body> (nền xám ngoài cùng mất) — nội dung nằm trong 1 <div> trên nền trắng của Gmail
   · giữ <style> trong <head> (Gmail web + app với tài khoản Gmail vẫn đọc @media)
   · bỏ box-shadow và nền gradient (linear-gradient / radial-gradient) — Gmail không hỗ trợ → còn màu nền dự phòng */
function stripCss(css) {
  return css.replace(/(^|;)\s*box-shadow\s*:[^;]*/gi, '$1')
    .replace(/background-image\s*:([^;]*?)(,\s*)?(linear|radial)-gradient\([^;]*\)/gi, (m, pre) => (pre && /url\(/.test(pre) ? 'background-image:' + pre.replace(/,\s*$/, '') : 'background-image:none'))
    .replace(/(^|;)\s*background\s*:\s*(linear|radial)-gradient\([^;]*/gi, '$1')
}
const gmailDoc = computed(() => {
  if (!raw.value) return ''
  const d = new DOMParser().parseFromString(raw.value, 'text/html')
  d.querySelectorAll('[style]').forEach(el => el.setAttribute('style', stripCss(el.getAttribute('style'))))
  const styles = [...d.head.querySelectorAll('style')].map(st => `<style>${stripCss(st.textContent)}</style>`).join('')
  d.querySelectorAll('script').forEach(el => el.remove())
  const pad = device.value === 'desktop' ? '0 16px 0 72px' : '0'   // web: thư lùi vào thẳng hàng tên người gửi · app: đủ bề ngang
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${location.origin}${BASE}">${styles}`
    + `<style>html,body{margin:0;background:#fff}body{font-family:Arial,Helvetica,sans-serif;font-size:14px}.gm-msg{padding:${pad}}@media (max-width:700px){.gm-msg{padding:0}}</style></head>`   // khung hẹp: bỏ lùi vào để thẻ 600px không bị lẹm
    + `<body><div class="gm-msg">${d.body.innerHTML}</div></body></html>`
})

// Iframe cao đúng bằng nội dung email (cùng nguồn nên đọc được chiều cao)
// đổi thiết bị → bề rộng đổi → email xuống dòng khác → theo dõi kích thước nội dung để chỉnh lại chiều cao
let ro
function fit() {
  const f = frame.value, d = f?.contentDocument; if (!d?.body) return
  // khung cao đúng bằng email → ẩn thanh cuộn trong khung (thanh cuộn chiếm chỗ, trông xấu ở chế độ điện thoại)
  d.documentElement.style.overflow = 'hidden'
  const set = () => { f.style.height = Math.max(d.body.scrollHeight, d.documentElement.scrollHeight) + 'px' }
  set(); ro?.disconnect(); ro = new ResizeObserver(set); ro.observe(d.body)
}
onBeforeUnmount(() => ro?.disconnect())

watch(url, async u => {
  html.value = ''; raw.value = ''
  const text = await (await fetch(u, { cache: 'no-cache' })).text()
  raw.value = text; srcdocKey.value++
  html.value = text.replaceAll('src="images/', `src="${location.origin}${BASE}images/`)   // ảnh → đường dẫn đầy đủ
}, { immediate: true })

async function copy() {
  if (!html.value) return
  if (!(await copyText(html.value))) return toast.error('Không sao chép được — hãy bôi đen mã rồi Ctrl+C')
  copied.value = true; toast.success('Đã sao chép mã HTML')
  setTimeout(() => (copied.value = false), 1500)
}
function download() {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([html.value], { type: 'text/html' })), download: TEMPLATES.find(t => t.id === tpl.value).file })
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

// Gửi thử mẫu đang chọn vào hộp thư thật — máy chủ gửi qua hộp thư của app Chấm điểm, có giới hạn lượt
const sendTo = ref(''), sendErr = ref(''), sending = ref(false), sendForm = ref(null)
watch(sendTo, () => { sendErr.value = '' })
async function showSendErr(msg) { sendErr.value = msg; await nextTick(); focusFirstError(sendForm.value) }
async function sendTest() {
  if (sending.value) return
  const to = sendTo.value.trim()
  if (!to) return showSendErr('Nhập email nhận thư thử')
  if (!/^\S+@\S+\.\S+$/.test(to)) return showSendErr('Email chưa đúng định dạng')
  sending.value = true
  try {
    await api('/email-test', { method: 'POST', body: { template: tpl.value, to } })
    toast.success(`Đã gửi mẫu “${TEMPLATES.find(t => t.id === tpl.value).label}” tới ${to} — kiểm tra hộp thư, kể cả mục Thư rác`)
  } catch (e) {
    if (e.status === 400) showSendErr(e.message)
    else toast.error(e.message)
  } finally { sending.value = false }
}
</script>

<style scoped>
.demo-email-note { display: block; }
.demo-email-note + .demo-email-note { margin-top: 4px; }
.demo-email-to { flex: 0 1 280px; min-width: 0; }
.demo-email-stage { display: flex; justify-content: center; padding: 16px; border-radius: var(--radius-card); background: var(--neutral-200); overflow-x: auto; }
.demo-email-frame { display: block; width: 100%; max-width: 720px; min-height: 400px; border: none; background: #ecedef; transition: width 0.2s; }
.demo-email-frame--mobile { width: 375px; max-width: 100%; }   /* không viền / bóng khung — tránh trông như email có viền xám */
/* Khung giả lập Gmail (web / app) — chỉ để hình dung, không phải giao diện mds-ui */
.gm-web { width: 100%; max-width: 900px; background: #fff; border-radius: 16px; padding: 8px 0 16px; font-family: Arial, Helvetica, sans-serif; color: #1f1f1f; }
.gm-web__bar, .gm-app__bar { display: flex; align-items: center; gap: 4px; padding: 0 12px; height: 48px; }
.gm-web__sp { flex: 1; }
.gm-ic { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; color: #444746; font-size: 20px; flex-shrink: 0; }
.gm-web__subject { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 12px 16px 12px 72px; font-size: 22px; line-height: 28px; }
.gm-chip { padding: 0 6px; border-radius: 4px; background: #ddd; color: #444746; font-size: 12px; line-height: 20px; }
.gm-sender { display: flex; align-items: flex-start; gap: 12px; padding: 8px 16px 12px; font-size: 14px; line-height: 20px; }
.gm-sender__who { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.gm-sender__time { white-space: nowrap; font-size: 12px; line-height: 40px; }
.gm-sender .gm-ic { margin-top: -10px; }
.gm-avatar { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #7b1fa2; color: #fff; font-size: 18px; flex-shrink: 0; }
.gm-mute { color: #5e5e5e; font-size: 12px; }
.gm-web__body, .gm-app__body { display: block; width: 100%; min-height: 300px; border: none; background: #fff; }
.gm-actions { display: flex; gap: 12px; padding: 24px 16px 0 72px; }
.gm-btn { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 20px; border: 1px solid #747775; border-radius: 20px; color: #444746; font-size: 14px; }
.gm-app { width: 395px; max-width: 100%; background: #fff; border: 10px solid #1f1f1f; border-radius: 36px; overflow: hidden; box-sizing: border-box;   /* viền máy tối: tách nền xám của email khỏi nền khung xem */
  font-family: Arial, Helvetica, sans-serif; color: #1f1f1f; }
.demo-email-stage--phone { background: var(--bg-white); box-shadow: inset 0 0 0 1px var(--stroke-neutral-light); }   /* khung xem trắng + máy viền tối — khác hẳn nền xám #ECEDEF của email */
.gm-app__subject { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 16px; font-size: 20px; line-height: 28px; }
.gm-sender--app { padding: 8px 8px 12px 16px; }
.demo-email-code { border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-card); overflow: hidden; }
.demo-email-code__bar { display: flex; align-items: center; gap: var(--gap-control); padding: 8px 8px 8px 16px; border-bottom: 1px solid var(--stroke-neutral-light); background: var(--bg-neutral-light); flex-wrap: wrap; }
.demo-email-code__title { flex: 1; min-width: 0; font-weight: var(--fw-semibold); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.demo-email-code__pre { margin: 0; padding: 16px; max-height: 360px; overflow: auto; background: var(--bg-white); color: var(--text-primary); font-size: var(--text-body); line-height: var(--text-body-lh); white-space: pre; }
.demo-email-code__pre code { color: inherit; background: none; padding: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }   /* không ăn màu chữ sáng của khối code nền tối */
</style>
