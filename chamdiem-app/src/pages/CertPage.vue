<template>
  <!-- Cài chứng chỉ gốc (CA nội bộ) để trình duyệt tin cậy https://pdpoint.sdcthin.local — công khai, mỗi máy làm 1 lần -->
  <div class="cp">
    <div class="cp-card">
      <router-link class="cp-brand" to="/">
        <img src="/logo.svg" width="32" height="32" alt="" /><span>{{ APP_NAME }}</span>
      </router-link>
      <h1 class="cp-title">Cài chứng chỉ để dùng HTTPS</h1>
      <p class="cp-desc">Tên miền nội bộ <strong>{{ HOST }}</strong> dùng chứng chỉ do hệ thống tự cấp. Mỗi máy cài chứng chỉ gốc <strong>một lần</strong> thì trình duyệt sẽ hiện ổ khóa an toàn, không còn cảnh báo đỏ.</p>

      <!-- Trạng thái máy này -->
      <div class="cp-status" :class="`cp-status--${status}`">
        <TIcon :name="STATUS[status].icon" :class="{ 'cp-spin': status === 'checking' }" />
        <div class="cp-status__text">
          <strong>{{ STATUS[status].title }}</strong>
          <span>{{ STATUS[status].text }}</span>
        </div>
        <a v-if="status === 'ok' && !onHttps" class="btn btn--primary" :href="httpsUrl">Mở bản HTTPS<TIcon name="arrow-right" /></a>
        <button v-else-if="status !== 'checking'" class="btn btn--outline btn--neutral" type="button" @click="check"><TIcon name="refresh" />Kiểm tra lại</button>
      </div>

      <!-- Hướng dẫn theo hệ điều hành (tự chọn theo máy đang dùng) -->
      <div class="cp-tabs" role="tablist">
        <button v-for="o in OS" :key="o.id" type="button" role="tab" class="cp-tab" :class="{ 'cp-tab--on': os === o.id }" :aria-selected="os === o.id" @click="os = o.id">{{ o.label }}</button>
      </div>
      <div class="cp-guide">
        <div v-if="current.file" class="cp-download">
          <a class="btn btn--primary btn--lg" :href="current.file" download><TIcon name="download" />{{ current.button }}</a>
          <span class="cp-hint">{{ current.hint }}</span>
        </div>
        <ol class="cp-steps"><li v-for="s in current.steps" :key="s" v-html="s" /></ol>
      </div>

      <!-- Chrome báo DNS_PROBE_FINISHED_NXDOMAIN: Chrome dùng “DNS bảo mật” hỏi thẳng Google (8.8.8.8) nên không thấy tên miền nội bộ -->
      <section class="cp-dns">
        <div class="cp-dns__head">
          <span class="cp-dns__icon"><TIcon name="world" /></span>
          <div>
            <h2>Chrome báo “This site can’t be reached”?</h2>
            <p>Kèm mã <code>DNS_PROBE_FINISHED_NXDOMAIN</code> (Safari vẫn vào được, hoặc tắt IPv6 thì hết). Do máy hỏi nhầm DNS bên ngoài — DNS bảo mật của Chrome hoặc DNS qua IPv6 — mà DNS đó không biết tên miền nội bộ của công ty.</p>
          </div>
        </div>
        <!-- Địa chỉ dự phòng: vào thẳng bằng IP server — không qua DNS nên không bị lỗi tra tên, không phải chỉnh máy -->
        <div class="cp-alias">
          <span><b>Dùng ngay, không cần chỉnh gì:</b> vào bằng địa chỉ IP</span>
          <span class="cp-copy"><a class="cp-alias__link" :href="ALIAS_URL">{{ ALIAS_URL }}</a><button type="button" class="btn btn--outline btn--sm" @click="copy(ALIAS_URL, 2)"><TIcon :name="copied === 2 ? 'check' : 'copy'" />{{ copied === 2 ? 'Đã chép' : 'Sao chép' }}</button></span>
          <span class="cp-alias__note">Chạy được trên mọi máy, Chrome / Ubuntu, IPv6 bật hay tắt (lần đầu đăng nhập lại). Muốn dùng địa chỉ tên miền thì sửa theo các bước dưới.</span>
        </div>
        <p class="cp-dns__label">Cách sửa trên máy bị lỗi (khoảng 30 giây):</p>
        <ol class="cp-dns__steps">
          <li>
            <span>Mở Chrome, dán địa chỉ này vào thanh địa chỉ rồi Enter:</span>
            <span class="cp-copy"><code>chrome://settings/security</code><button type="button" class="btn btn--outline btn--sm" @click="copy('chrome://settings/security', 0)"><TIcon :name="copied === 0 ? 'check' : 'copy'" />{{ copied === 0 ? 'Đã chép' : 'Sao chép' }}</button></span>
          </li>
          <li><span>Kéo xuống phần <b>“Sử dụng DNS bảo mật”</b> (Use secure DNS) → <b>tắt</b>.</span></li>
          <li>
            <span>Dán tiếp địa chỉ này → bấm <b>Clear host cache</b>:</span>
            <span class="cp-copy"><code>chrome://net-internals/#dns</code><button type="button" class="btn btn--outline btn--sm" @click="copy('chrome://net-internals/#dns', 1)"><TIcon :name="copied === 1 ? 'check' : 'copy'" />{{ copied === 1 ? 'Đã chép' : 'Sao chép' }}</button></span>
          </li>
          <li><span>Mở lại <b>https://{{ HOST }}</b>.</span></li>
          <li>
            <span><b>Ubuntu / Linux</b> (hoặc vẫn lỗi): thêm tên miền vào file hosts của máy rồi mở lại Chrome:</span>
            <span class="cp-copy"><code>{{ HOSTS_CMD }}</code><button type="button" class="btn btn--outline btn--sm" @click="copy(HOSTS_CMD, 3)"><TIcon :name="copied === 3 ? 'check' : 'copy'" />{{ copied === 3 ? 'Đã chép' : 'Sao chép' }}</button></span>
          </li>
        </ol>
        <p class="cp-dns__note"><TIcon name="info-circle" /><span>Hướng dẫn này mở được tại <a :href="`http://${IP}/cai-chung-chi`">http://{{ IP }}/cai-chung-chi</a>. Sửa cho cả công ty: nhờ IT bỏ DNS 8.8.8.8 khỏi mạng nội bộ hoặc tắt DNS bảo mật của Chrome qua chính sách.</span></p>
      </section>

      <details class="cp-more">
        <summary>Thông tin chứng chỉ (để đối chiếu)<TIcon name="chevron-down" /></summary>
        <dl>
          <dt>Tên</dt><dd>MISA Solution Point Root CA</dd>
          <dt>Dùng cho</dt><dd>Chỉ {{ HOST }} và 10.1.39.11 — không dùng được cho trang web khác</dd>
          <dt>SHA-256</dt><dd class="cp-mono">{{ FINGERPRINT }}</dd>
          <dt>File gốc</dt><dd><a href="/misa-solution-point-ca.crt" download>misa-solution-point-ca.crt</a></dd>
        </dl>
        <p>Nhiều máy trong công ty: nhờ IT đẩy file .crt vào kho “Trusted Root Certification Authorities” qua Group Policy là xong cho tất cả.</p>
      </details>
      <router-link class="btn btn--link cp-back" to="/"><TIcon name="arrow-left" />Về trang giới thiệu</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import { APP_NAME } from '../store/app.js'

const HOST = 'pdpoint.sdcthin.local'
const FINGERPRINT = '60:40:E8:2C:BE:57:06:EA:5B:E8:37:E5:ED:1B:D8:BC:08:44:DF:75:48:8C:1D:E2:AB:C7:45:F5:FD:F7:E0:3C'
const onHttps = location.protocol === 'https:'
const httpsUrl = `https://${HOST}/`

/* Kiểm tra: gọi thử bản https — kết nối được (không lỗi chứng chỉ) = máy đã tin cậy */
const status = ref('checking')
const STATUS = {
  checking: { icon: 'loader-2', title: 'Đang kiểm tra máy này…', text: '' },
  ok:       { icon: 'circle-check', title: 'Máy này đã tin cậy chứng chỉ', text: onHttps ? 'Bạn đang dùng kết nối an toàn.' : 'Có thể mở bản HTTPS ngay. Nếu trình duyệt vẫn báo đỏ, đóng hẳn trình duyệt rồi mở lại.' },
  no:       { icon: 'alert-triangle', title: 'Máy này chưa cài chứng chỉ', text: 'Làm theo hướng dẫn bên dưới, xong đóng hẳn trình duyệt, mở lại rồi bấm Kiểm tra lại.' },
}
async function check() {
  status.value = 'checking'
  try {
    await fetch(`https://${HOST}/api/health?t=${Date.now()}`, { mode: 'no-cors', cache: 'no-store' })
    status.value = 'ok'
  } catch { status.value = 'no' }
}
onMounted(check)

const ua = navigator.userAgent
const detected = /Firefox\//.test(ua) ? 'firefox' : /iPhone|iPad|iPod/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : /Mac OS X/.test(ua) ? 'mac' : 'win'
const os = ref(detected)
const OS = [
  { id: 'win', label: 'Windows', file: '/cai-chung-chi-windows.bat', button: 'Tải bộ cài cho Windows', hint: 'Không cần quyền quản trị máy',
    steps: ['Bấm <b>Tải bộ cài cho Windows</b>, mở file <b>cai-chung-chi-windows.bat</b> vừa tải (Windows có thể hỏi “Run anyway” → chọn chạy).',
      'Khi Windows hỏi <b>“Do you want to install this certificate?”</b> → bấm <b>Yes</b>.',
      'Đóng hẳn Chrome / Edge rồi mở lại <b>https://' + HOST + '</b>.'] },
  { id: 'mac', label: 'macOS', file: '/misa-solution-point.mobileconfig', button: 'Tải hồ sơ cho macOS', hint: 'Cần mật khẩu máy Mac 1 lần',
    steps: ['Bấm <b>Tải hồ sơ cho macOS</b>, mở file <b>misa-solution-point.mobileconfig</b> vừa tải.',
      'Mở <b>Cài đặt hệ thống → Quyền riêng tư &amp; Bảo mật → Hồ sơ</b> (hoặc tìm “Profiles”), chọn <b>MISA Solution Point</b> → <b>Cài đặt</b>, nhập mật khẩu máy.',
      'Đóng hẳn trình duyệt (⌘Q) rồi mở lại <b>https://' + HOST + '</b>.'] },
  { id: 'ios', label: 'iPhone / iPad', file: '/misa-solution-point.mobileconfig', button: 'Tải hồ sơ cho iPhone / iPad', hint: 'Mở bằng Safari',
    steps: ['Mở trang này bằng <b>Safari</b>, bấm <b>Tải hồ sơ</b> → <b>Cho phép</b>.',
      'Vào <b>Cài đặt → Đã tải về hồ sơ</b> → <b>Cài đặt</b>.',
      'Vào <b>Cài đặt → Cài đặt chung → Giới thiệu → Cài đặt tin cậy chứng nhận</b>, bật <b>MISA Solution Point Root CA</b>.'] },
  { id: 'android', label: 'Android', file: '/misa-solution-point-ca.crt', button: 'Tải chứng chỉ cho Android', hint: '',
    steps: ['Bấm <b>Tải chứng chỉ cho Android</b>.',
      'Vào <b>Cài đặt → Bảo mật → Mã hóa &amp; thông tin xác thực → Cài đặt chứng chỉ → Chứng chỉ CA</b>, chọn file vừa tải.',
      'Mở lại Chrome và vào <b>https://' + HOST + '</b>.'] },
  { id: 'firefox', label: 'Firefox', file: '/misa-solution-point-ca.crt', button: 'Tải chứng chỉ cho Firefox', hint: 'Firefox dùng kho chứng chỉ riêng',
    steps: ['Bấm <b>Tải chứng chỉ cho Firefox</b>.',
      'Mở <b>Settings → Privacy &amp; Security → Certificates → View Certificates → Authorities → Import</b>, chọn file vừa tải.',
      'Tích <b>“Trust this CA to identify websites”</b> → OK, rồi tải lại trang.'] },
]
const current = computed(() => OS.find(o => o.id === os.value))

/* Sao chép địa chỉ chrome://… (trang web không mở thẳng được) — có dự phòng cho http (không có Clipboard API) */
const IP = '10.1.39.11'
const ALIAS_URL = `http://${IP}`   // địa chỉ dự phòng: vào thẳng bằng IP — không cần tra DNS
const HOSTS_CMD = `echo "${IP} ${HOST}" | sudo tee -a /etc/hosts`   // Ubuntu / Linux: ghi tên miền vào file hosts → khỏi tra DNS
const copied = ref(-1)
let copiedTimer = null
async function copy(text, i) {
  try { await navigator.clipboard.writeText(text) }
  catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text }); ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') } catch { /* bỏ qua */ } ta.remove()
  }
  copied.value = i; clearTimeout(copiedTimer); copiedTimer = setTimeout(() => { copied.value = -1 }, 1800)
}
</script>

<style scoped>
.cp { min-height: 100vh; display: flex; justify-content: center; padding: 48px var(--card-col-gap); background: var(--bg-page); }
@media (max-width: 560px) { .cp { padding: 16px; } }
.cp-card { width: 640px; max-width: 100%; height: fit-content; display: flex; flex-direction: column; gap: 16px; padding: 32px; border-radius: var(--radius-dialog); background: var(--bg-white); box-shadow: var(--shadow-card); }
@media (max-width: 560px) { .cp-card { padding: 24px 16px; } }
.cp-brand { display: inline-flex; align-items: center; gap: 8px; font-size: var(--text-h3); font-weight: var(--fw-semibold); color: var(--text-primary); text-decoration: none; }
.cp-title { font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.cp-desc { margin-top: -8px; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.cp-desc strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.cp-status { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.cp-status > .ti { font-size: 22px; flex-shrink: 0; }
.cp-status__text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; font-size: var(--text-body); line-height: var(--text-body-lh); }
.cp-status__text strong { font-weight: var(--fw-semibold); }
.cp-status__text span { color: var(--text-secondary); }
.cp-status .btn { flex-shrink: 0; }
.cp-status--ok { background: var(--bg-success-light); } .cp-status--ok > .ti { color: var(--icon-success); }
.cp-status--no { background: var(--bg-warning-light); } .cp-status--no > .ti { color: var(--icon-warning); }
.cp-status--checking > .ti { color: var(--icon-neutral); }
@media (max-width: 560px) { .cp-status { flex-wrap: wrap; } }
.cp-spin { animation: cp-spin 1s linear infinite; }
@keyframes cp-spin { to { transform: rotate(360deg); } }
.cp-tabs { display: flex; flex-wrap: wrap; gap: 2px; padding: 2px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.cp-tab { font-weight: var(--fw-medium); flex: 1 1 auto; height: calc(var(--btn-height) - 4px); padding: 0 10px; border: none; border-radius: calc(var(--radius-default) - 2px); background: transparent; font-family: inherit; font-size: var(--text-body); color: var(--text-secondary); cursor: pointer; white-space: nowrap; }
.cp-tab--on { background: var(--bg-white); color: var(--text-primary); box-shadow: var(--shadow-sm); }
.cp-guide { display: flex; flex-direction: column; gap: 16px; }
.cp-download { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.cp-hint { font-size: var(--text-body); color: var(--text-secondary); }
.cp-steps { display: flex; flex-direction: column; gap: 10px; padding-left: 20px; font-size: var(--text-body); line-height: 1.6; color: var(--text-primary); }
.cp-steps :deep(b) { font-weight: var(--fw-semibold); }
.cp-dns { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.cp-dns__head { display: flex; gap: 12px; }
.cp-dns__icon { width: 32px; height: 32px; flex-shrink: 0; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: var(--bg-white); color: var(--icon-warning); font-size: 18px; }
.cp-dns h2 { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }
.cp-dns__head p { margin-top: 4px; font-size: var(--text-body); line-height: 1.55; color: var(--text-secondary); }
.cp-dns b { font-weight: var(--fw-semibold); color: var(--text-primary); }
.cp-dns code { padding: 1px 6px; border-radius: 4px; background: var(--bg-white); font-family: ui-monospace, Menlo, monospace; font-size: var(--text-body); color: var(--text-primary); }
.cp-dns__label { font-size: var(--text-body); font-weight: var(--fw-semibold); }
.cp-alias { display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: var(--radius-default); background: var(--bg-white); font-size: var(--text-body); }
.cp-alias__link { font-family: ui-monospace, Menlo, monospace; font-size: var(--text-body); color: var(--text-brand); overflow-wrap: anywhere; }
.cp-alias__note { font-size: var(--text-body); color: var(--text-secondary); line-height: 1.5; }
.cp-dns__steps { display: flex; flex-direction: column; gap: 10px; padding-left: 20px; font-size: var(--text-body); line-height: 1.55; }
.cp-dns__steps li > span { display: block; }
.cp-copy { display: flex !important; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.cp-copy code { padding: 4px 8px; }
.cp-dns__note { display: flex; align-items: flex-start; gap: 6px; font-size: var(--text-body); line-height: 1.55; color: var(--text-secondary); }
.cp-dns__note .ti { flex-shrink: 0; margin-top: 2px; }
.cp-dns__note a { color: var(--text-brand); }
/* Địa chỉ / link dài tự xuống dòng trên điện thoại */
.cp-dns, .cp-dns__steps, .cp-dns__steps li { min-width: 0; }
.cp-dns code, .cp-dns__note { overflow-wrap: anywhere; }
.cp-more { border-top: 1px solid var(--stroke-divider); padding-top: 12px; font-size: var(--text-body); }
.cp-more summary { display: flex; align-items: center; justify-content: space-between; list-style: none; cursor: pointer; color: var(--text-secondary); }
.cp-more summary::-webkit-details-marker { display: none; }
.cp-more[open] summary .ti { transform: rotate(180deg); }
.cp-more dl { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 6px 12px; margin-top: 12px; }
.cp-more dt { color: var(--text-secondary); }
.cp-more dd { word-break: break-all; }
.cp-more a { color: var(--text-brand); }
.cp-more p { margin-top: 12px; color: var(--text-secondary); line-height: 1.6; }
.cp-mono { font-family: ui-monospace, Menlo, monospace; font-size: var(--text-sm); }
.cp-back { align-self: center; }
</style>
