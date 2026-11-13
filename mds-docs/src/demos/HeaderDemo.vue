<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Nền header:</span>
      <div class="seg" role="group" aria-label="Nền header">
        <button v-for="m in MODES" :key="m.id" type="button" class="seg__item" :class="{ 'seg__item--active': mode === m.id }" :aria-pressed="mode === m.id" @click="mode = m.id">{{ m.label }}</button>
      </div>
      <span class="demo-hd-sp" />
      <button type="button" class="btn btn--sm btn--text-neutral" @click="full = true"><TIcon name="maximize" />Xem toàn màn hình</button>
    </div>
    <!-- Dải màu nền header = 10 màu chủ đề (Figma 🎨 Themes) — chỉ đổi trong khung ví dụ -->
    <div v-if="mode === 'color'" class="demo-row">
      <span class="demo-muted">Màu nền:</span>
      <div class="demo-hd-colors" role="radiogroup" aria-label="Màu nền header">
        <button v-for="c in COLORS" :key="c.id" type="button" class="demo-hd-color" :class="{ 'demo-hd-color--on': color === c.id }"
          role="radio" :aria-checked="color === c.id" :aria-label="c.label" v-tip="c.label" :style="{ background: c.main }" @click="color = c.id">
          <TIcon v-if="color === c.id" name="check" />
        </button>
      </div>
      <span class="demo-muted">{{ COLORS.find(c => c.id === color).label }} · {{ COLORS.find(c => c.id === color).main.toUpperCase() }}</span>
    </div>
    <span class="demo-muted">Header thật của mds-ui (ControlHeader) với logo MISA Design System (dùng thống nhất cho mọi màn hình mẫu) — nền màu dùng logo trắng, nền sáng dùng logo màu. Rê chuột vào từng nút để xem tooltip; bấm chuông (Thông báo), dấu ? (Trợ giúp), ⋯ (Thêm) và avatar (Tài khoản) để mở các popover theo Figma Global Header. <b>Ô Tìm kiếm</b> (góc phải) gõ thử tên người: <b>Bình</b> · <b>Nguyễn</b> · <b>nv0012</b> (dữ liệu mẫu phần mềm Nhân sự — kết quả xổ ra theo từng phân hệ). Header giữ bề rộng màn hình desktop — khung hẹp thì kéo ngang hoặc bấm <b>Xem toàn màn hình</b> để thấy hết.</span>
    <!-- Header thiết kế cho màn hình desktop → khung ví dụ giữ bề rộng tối thiểu 1024px, màn hẹp thì cuộn ngang -->
    <!-- Toàn màn hình: header đúng bề rộng màn hình thật, vùng nội dung lấp phần còn lại · Esc / nút thu nhỏ để về -->
    <div class="demo-header" :class="{ 'demo-header--full': full }">
      <div class="demo-header__inner" :style="mode === 'color' ? { '--bg-brand': COLORS.find(c => c.id === color).main } : null">
        <ControlHeader app-name="MISA Design System" :mode="mode" no-meta hide-trial-banner home-href="#" :apps="DEMO_APPS" current-app="ds" @app-select="a => toast.info(`Ví dụ: chuyển sang ${a.label}`)"
          avatar-name="Nguyễn Văn An" user-email="an.nguyen@anphat.vn"
          :profile-menu="PROFILE" :profile-context="CONTEXT" :language="LANG" :settings-menu="SETTINGS" @settings-select="i => toast.info(`Ví dụ: ${i.label}`)"
          :notifications="NOTIFS" :help-menu="HELP" :more-menu="MORE"
          @notify-select="n => toast.info('Ví dụ: mở thông báo')" @notify-action="a => toast.info(`Ví dụ: ${NOTIFY_ACTIONS[a]}`)"
          @help-select="i => toast.info(`Ví dụ: ${i.label}`)" @more-select="i => toast.info(`Ví dụ: ${i.label}`)" @home="toast.info('Ví dụ: về trang chủ')"
          search-placeholder="Tìm tên, mã nhân viên…" :search-results="searchResults" :search-loading="searching"
          :search-more-items="moreItems" :search-more-total="moreTotal" :search-more-loading="moreLoading"
          @search="onSearch" @search-select="onSearchSelect" @search-more="onSearchMore" @profile-select="i => toast.info(`Ví dụ: ${i.label}`)" @logout="toast.info('Ví dụ: đăng xuất')">
          <!-- Khối cài app mobile cuối popover ⋯ (Figma Header_More) -->
          <template #more-footer>
            <div class="demo-hd-mobile">
              <p class="demo-hd-mobile__title">Cài đặt AMIS Kế toán Mobile</p>
              <p class="demo-hd-mobile__desc">Làm việc mọi lúc, mọi nơi với ứng dụng mobile trên:</p>
              <div class="demo-hd-mobile__row">
                <img :src="qr" alt="Mã QR tải ứng dụng" width="88" height="88" />
                <button type="button" class="icon-swap icon-swap--16 icon-swap--action" v-tip="'Sao chép đường dẫn tải ứng dụng'" aria-label="Sao chép đường dẫn tải ứng dụng" @click="toast.success('Ví dụ: đã sao chép đường dẫn')"><TIcon name="copy" /></button>
                <span class="demo-hd-mobile__stores"><img :src="googlePlay" alt="Tải trên Google Play" width="112" height="33" /><img :src="appStore" alt="Tải trên App Store" width="112" height="33" /></span>
              </div>
            </div>
          </template>
          <template #logo-icon><img class="demo-header__logo" :src="mode === 'light' ? logoColor : logoWhite" width="32" height="32" alt="" /></template>
        </ControlHeader>
        <div class="demo-header__body">Nội dung ứng dụng
          <button v-if="full" type="button" class="btn-icon btn-icon--outline demo-header__exit" aria-label="Thu nhỏ (Esc)" v-tip="'Thu nhỏ (Esc)'" @click="full = false"><TIcon name="minimize" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEscClose } from '@mds/utils/escStack.js'
import ControlHeader from '@mds/components/ControlHeader.vue'
import { APPS } from '../demoApp.js'
// Nút 9 chấm: menu chuyển app thật (logo + tên, app đang dùng có ✓) — trong ví dụ chỉ báo, không chuyển trang
const DEMO_APPS = APPS.map(a => ({ ...a, href: '' }))
import TIcon from '@mds/components/TIcon.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { currentMode, currentTheme, COLORS } from '@mds/theme.js'
import { toast } from '@mds/utils/toast.js'
import { searchHr, searchHrModule } from './hrSearchData.js'
import logoColor from '../assets/logo-ds-color.svg'
import logoWhite from '../assets/logo-ds-white.svg'

import qr from '../assets/header/qr.svg'
import googlePlay from '../assets/header/google-play.svg'
import appStore from '../assets/header/app-store.svg'
import notify1 from '../assets/header/notify-1.png'
import notify2 from '../assets/header/notify-2.png'
import notify3 from '../assets/header/notify-3.png'
import reaction from '../assets/header/reaction.png'
// Logo kênh hỗ trợ — lấy đúng từ Figma Header_Help (Chat trực tuyến · Chat với AVA · Cộng đồng MISA)
import helpChat from '../assets/header/help-chat.svg'
import helpAva from '../assets/header/help-ava.svg'
import helpCommunity from '../assets/header/help-community.svg'

/* Nội dung mẫu theo Figma ❖ Global Header (Header_UserProfile · Header_Notification · Header_Help · Header_More) */
const PROFILE = [
  { id: 'password', icon: 'circle-key', label: 'Đổi mật khẩu' },
  { id: 'account', icon: 'user-circle', label: 'Thiết lập tài khoản' },
  { id: 'security', icon: 'shield-check', label: 'Thiết lập bảo mật' },
  { id: 'referral', icon: 'gift', label: 'Giới thiệu nhận thưởng' },
]
// Bánh răng: menu 1 cột gọn (mục đầu “Thiết lập hiển thị” ControlHeader tự thêm) — không dùng bảng tiện ích nhiều cột
const SETTINGS = [
  { id: 'company', icon: 'building', label: 'Thông tin công ty' },
  { id: 'users', icon: 'users', label: 'Quản lý người dùng và phân quyền' },
  { id: 'connect', icon: 'plug-connected', label: 'Kết nối ứng dụng', action: 'connect-apps' },
  { id: 'options', icon: 'adjustments', label: 'Tùy chọn' },
]
const CONTEXT = [{ id: 'company', icon: 'building-skyscraper', label: 'Công ty cổ phần MISA' }, { id: 'data', icon: 'database', label: 'Dữ liệu năm 2023' }]
const FLAG_VN = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect width="30" height="20" rx="2" fill="#DA251D"/><path d="M15 4.5l1.5 4.6h4.8l-3.9 2.8 1.5 4.6-3.9-2.8-3.9 2.8 1.5-4.6-3.9-2.8h4.8z" fill="#FF0"/></svg>')
const LANG = { label: 'Tiếng Việt', flag: FLAG_VN }
const NOTIFS = [
  { id: 1, group: 'Hôm nay', unread: true, avatar: notify1, badgeImg: reaction, text: '**Nguyễn Trung Sơn** và **2** người khác đã bày tỏ cảm xúc về bình luận của bạn', time: '1 giờ trước' },
  { id: 2, group: 'Hôm nay', avatar: notify2, text: '**Lê Châu Anh** đăng bài trong **KHỐI SẢN XUẤT**', time: '3 giờ trước' },
  { id: 3, group: 'Trước đó', avatar: notify3, text: '**Nguyễn Thị Thanh Hà** đã bình luận về công việc **Thiết kế thông báo chung** do bạn tạo', time: '1 ngày trước' },
  { id: 4, group: 'Trước đó', icon: 'gift', tone: 'danger', badgeIcon: 'link', text: 'Kinh doanh cuối năm thắng lớn với **gói vay 3 tỷ từ ngân hàng Techcombank.**', time: '4 ngày trước' },
  { id: 5, group: 'Trước đó', icon: 'tool', tone: 'brand', text: 'MISA thông báo **bảo trì hệ thống** từ **00:00-03:00** ngày **chủ nhật 02/01/2022.** Anh/chị vui lòng không sử dụng phần mềm trong khoảng thời gian này', time: '10 ngày trước' },
]
const NOTIFY_ACTIONS = { 'read-all': 'đánh dấu tất cả là đã đọc', filter: 'lọc thông báo', settings: 'thiết lập thông báo' }
const HELP = [
  { title: 'Trợ giúp', items: [{ id: 'guide', icon: 'help-circle', label: 'Hướng dẫn sử dụng (F1)' }, { id: 'keys', icon: 'keyboard', label: 'Danh sách phím tắt' }, { id: 'quick', icon: 'rocket', label: 'Hướng dẫn nhanh' }] },
  { title: 'Kênh hỗ trợ', items: [{ id: 'chat', img: helpChat, label: 'Chat trực tuyến' }, { id: 'ava', img: helpAva, label: 'Chat với AVA' }, { id: 'community', img: helpCommunity, label: 'Cộng đồng MISA' }, { id: 'hotline', icon: 'headset', label: 'Tổng đài hỗ trợ' }] },
  { title: 'Đào tạo', items: [{ id: 'register', icon: 'forms', label: 'Đăng ký đào tạo sử dụng' }, { id: 'schedule', icon: 'school', label: 'Lịch đào tạo/chia sẻ online' }, { id: 'video', icon: 'video', label: 'Hướng dẫn qua video' }, { id: 'kb', icon: 'book', label: 'Kho tri thức nghiệp vụ' }] },
]
const MORE = [
  { id: 'start', icon: 'circle-caret-right', label: 'Bắt đầu sử dụng' },
  { id: 'rate', icon: 'thumb-up', label: 'Đánh giá độ hài lòng' },
  { separator: true },
  { id: 'license', icon: 'license', label: 'Giấy phép sử dụng' },
  { id: 'purchase', icon: 'file-certificate', label: 'Thỏa thuận mua hàng' },
  { id: 'terms', icon: 'certificate-2', label: 'Thỏa thuận sử dụng' },
  { id: 'terms2', icon: 'certificate-2', label: 'Thỏa thuận sử dụng' },
  { separator: true },
]
// Chuyển nền chỉ trong khung ví dụ — không đổi header thật của trang (mặc định theo thiết lập hiện tại)
const full = ref(false)
// Esc: popover header đang mở thì để popover đóng trước, lần sau mới thu nhỏ
let popWasOpen = false   // ghi nhận trước khi popover kịp đóng (bắt ở pha capture)
const onEscCapture = e => { if (e.key === 'Escape') popWasOpen = !!document.querySelector('.hdr-pop') }
window.addEventListener('keydown', onEscCapture, true)
onBeforeUnmount(() => { window.removeEventListener('keydown', onEscCapture, true); document.documentElement.style.overflow = '' })
useEscClose(() => { if (!popWasOpen) full.value = false }, () => full.value)
watch(full, v => { document.documentElement.style.overflow = v ? 'hidden' : '' })
/* Ô tìm kiếm toàn cục: dữ liệu mẫu phần mềm Nhân sự (Hồ sơ, Hợp đồng, Phúc lợi…) — tìm giả lập có độ trễ ~0,5 giây như gọi máy chủ */
const searchResults = ref(null), searching = ref(false)
let searchSeq = 0, searchTimer = 0
function onSearch(q) {
  const my = ++searchSeq; searching.value = true; clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { if (my !== searchSeq) return; searchResults.value = searchHr(q); searching.value = false }, 500)   // bỏ kết quả về trễ của lần gõ cũ
}
const onSearchSelect = (it, g) => toast.info(`Ví dụ: mở bản ghi “${it.name}” trong phân hệ ${g.title}`)
// “Xem thêm” của 1 phân hệ → nạp TOÀN BỘ kết quả của phân hệ đó cho popup (cũng chạy khi sửa từ khóa trong popup)
const moreItems = ref(null), moreTotal = ref(null), moreLoading = ref(false)
let moreSeq = 0, moreTimer = 0
function onSearchMore(g, q) {
  const my = ++moreSeq; moreLoading.value = true; moreItems.value = null; clearTimeout(moreTimer)
  moreTimer = setTimeout(() => { if (my !== moreSeq) return; const r = searchHrModule(g.key, q); moreItems.value = r.items; moreTotal.value = r.total; moreLoading.value = false }, 400)
}
onBeforeUnmount(() => { clearTimeout(searchTimer); clearTimeout(moreTimer) })
const MODES = [{ id: 'color', label: 'Nền màu' }, { id: 'light', label: 'Nền sáng' }]
const mode = ref(currentMode.value === 'light' ? 'light' : 'color')
const color = ref(currentTheme.value || 'blue')   // mặc định = màu chủ đề đang dùng
</script>

<style scoped>
.demo-hd-colors { display: flex; flex-wrap: wrap; gap: 6px; }
.demo-hd-color { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; border: 2px solid var(--stroke-white); border-radius: var(--radius-pill);
  box-shadow: 0 0 0 1px var(--stroke-neutral-light); cursor: pointer; color: var(--icon-white); }
.demo-hd-color .ti { font-size: 14px; }
.demo-hd-color--on { box-shadow: 0 0 0 2px var(--stroke-brand); }
.demo-header { border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-card); overflow-x: auto; overflow-y: hidden; }
.demo-header__inner { min-width: 1024px; }
.demo-header :deep(.global-header) { position: relative; }
.demo-header__logo { display: block; flex-shrink: 0; }
.demo-hd-mobile { display: flex; flex-direction: column; gap: 12px; }
.demo-hd-mobile__title { margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-hd-mobile__desc { margin: -4px 0 0; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.demo-hd-mobile__row { display: flex; align-items: center; justify-content: space-between; }
.demo-hd-mobile__stores { display: flex; flex-direction: column; gap: 8px; }
.demo-header__body { position: relative; display: flex; align-items: center; justify-content: center; height: 120px; background: var(--bg-page); color: var(--text-secondary); }
.demo-hd-sp { flex: 1; }
.demo-header--full { position: fixed; inset: 0; z-index: var(--z-dialog); display: flex; flex-direction: column; border: none; border-radius: 0; background: var(--bg-page); }
.demo-header--full .demo-header__inner { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.demo-header--full .demo-header__body { flex: 1; height: auto; }
.demo-header__exit { position: absolute; top: 16px; right: 16px; background: var(--bg-white); }
</style>
