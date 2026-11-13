import { createApp } from 'vue'
import { tableWidthStore } from './store/tableWidths.js'
import { pageSizeStore } from './store/pageSizePref.js'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
// Mỗi màn hình là 1 file riêng, chỉ tải khi vào màn đó
const ReportPage        = () => import('./pages/ReportPage.vue')
const ClosingPage       = () => import('./pages/ClosingPage.vue')
const SettingsPage      = () => import('./pages/SettingsPage.vue')
const ProjectsPage      = () => import('./pages/ProjectsPage.vue')
const ProjectDetailPage = () => import('./pages/ProjectDetailPage.vue')
const UsersPage         = () => import('./pages/UsersPage.vue')
const FormulaPage       = () => import('./pages/FormulaPage.vue')
const AvaLogsPage       = () => import('./pages/AvaLogsPage.vue')
const BaFormulaPage     = () => import('./pages/BaFormulaPage.vue')
const LoginPage         = () => import('./pages/LoginPage.vue')
const LandingPage       = () => import('./pages/LandingPage.vue')
const HomePage          = () => import('./pages/HomePage.vue')
const RegisterPage      = () => import('./pages/RegisterPage.vue')
const CertPage          = () => import('./pages/CertPage.vue')
const PendingPage       = () => import('./pages/PendingPage.vue')
const SetPasswordPage   = () => import('./pages/SetPasswordPage.vue')
const ForceChangePasswordPage = () => import('./pages/ForceChangePasswordPage.vue')
import { backend, detectBackend, DEMO_BASE, inDemoUrl } from './store/api.js'
import { startDemo } from './store/db.js'
import { enterApp } from './store/session.js'
import { setAppTitle, setPageTitle } from '@mds/utils/docTitle.js'
import { installInputBehaviors } from '@mds/utils/inputBehavior.js'
import { registerAbbreviations } from '@mds/utils/abbr.js'
import { installRouteProgress } from '@mds/utils/routeProgress.js'
import { APP_NAME } from './store/app.js'
import { isChunkError, reloadForChunk } from './store/chunkReload.js'
import { toast } from '@mds/utils/toast.js'
import '@mds/style.css'
import './app.css'
import { applySeasonalEvent } from './store/seasonalEvents.js'
import { detectClassicScrollbars } from '@mds/utils/scrollbars.js'
import { enableAutoTooltips } from '@mds/utils/tooltip.js'
enableAutoTooltips()   // mọi nút có title / nút icon có aria-label → tooltip mds-ui (thay tooltip trình duyệt)
detectClassicScrollbars()   // máy có thanh cuộn cổ điển → thanh cuộn mảnh (macOS overlay giữ nguyên)
applySeasonalEvent()   // trang trí sidebar theo sự kiện (VD 20/10)

const router = createRouter({
  history: createWebHistory(inDemoUrl ? DEMO_BASE + '/' : '/'),   // bản dùng thử chạy dưới /dung-thu/ (server/demo.js) — link trong app tự giữ tiền tố
  routes: [
    // meta.title: tiêu đề tab = [phân hệ hiện tại, cha, ông…] | MISA Solution Point
    // Trang chủ: đã đăng nhập → Tổng quan · chưa đăng nhập → trang giới thiệu (cùng địa chỉ “/”)
    { path: '/',              component: HomePage,     meta: { home: true, title: ['Tổng quan'] } },
    { path: '/tong-quan',     redirect: '/' },              // link cũ
    { path: '/chot-diem',     component: ClosingPage,  meta: { title: ['Tổng hợp điểm'] } },
    { path: '/cai-dat',       component: SettingsPage, meta: { title: ['Cài đặt hệ thống'] } },
    { path: '/bao-cao',       redirect: '/' },
    { path: '/du-an',         component: ProjectsPage, meta: { title: ['Dự án'] } },
    { path: '/du-an/:id',     component: ProjectDetailPage, meta: { title: ['Dự án'] } },   // trang tự đặt: Tên dự án | Dự án
    { path: '/nguoi-dung',    component: UsersPage,    meta: { title: ['Người dùng'] } },
    { path: '/quy-tac',       component: FormulaPage,  meta: { title: ['Quy tắc chấm điểm PD'] } },
    { path: '/quy-tac-ba',    component: BaFormulaPage, meta: { title: ['Quy tắc chấm điểm BA'] } },
    { path: '/lich-su-ava',   component: AvaLogsPage,  meta: { title: ['Lịch sử hỏi AVA'] } },
    { path: '/cau-hinh',      redirect: '/quy-tac' },
    // Trang giới thiệu công khai (không cần đăng nhập; đã đăng nhập vẫn xem được) · Đăng ký → chờ Quản trị duyệt
    { path: '/gioi-thieu',    component: LandingPage, meta: { public: true, always: true, title: ['Giới thiệu'] } },
    // Cài chứng chỉ gốc để trình duyệt tin cậy HTTPS (tên miền nội bộ .local) — công khai
    { path: '/cai-chung-chi', component: CertPage, meta: { public: true, always: true, title: ['Cài chứng chỉ HTTPS'] } },
    { path: '/dang-ky',       component: RegisterPage, meta: { public: true, title: ['Đăng ký'] } },
    { path: '/dang-nhap',     component: LoginPage,   meta: { public: true, title: ['Đăng nhập'] } },
    { path: '/cho-cap-quyen', component: PendingPage, meta: { public: true, title: ['Chờ cấp quyền'] } },
    // Link trong email mời / quên mật khẩu — mở được cả khi đang đăng nhập (máy dùng chung)
    // Mật khẩu do Quản trị đặt → bắt buộc tự đổi trước khi vào app
    { path: '/doi-mat-khau',  component: ForceChangePasswordPage, meta: { public: true, title: ['Đổi mật khẩu'] } },
    { path: '/dat-mat-khau',  component: SetPasswordPage, meta: { public: true, always: true, title: ['Đặt mật khẩu'] } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ]
})

/** Có máy chủ: bắt buộc đăng nhập Google; chưa được cấp quyền → trang chờ */
router.beforeEach(to => {
  // /gioi-thieu: khách → về trang chủ “/” (giới thiệu hiện ngay ở đó); người đã đăng nhập vẫn mở được để xem lại
  if (to.path === '/gioi-thieu' && backend.enabled && backend.user?.status !== 'active') return '/'
  if (to.meta.always) return true
  if (!backend.enabled) return to.meta.public ? '/' : true
  const u = backend.user
  // Chưa đăng nhập: vào trang chủ → trang giới thiệu; link sâu → đăng nhập rồi quay lại
  if (!u) return to.meta.public || to.meta.home ? true : { path: '/dang-nhap', query: { next: to.fullPath } }
  // Link mời cho tài khoản khác người đang đăng nhập (máy dùng chung) → vẫn mở trang đăng nhập để đổi tài khoản
  const inviteFor = String(to.query.invite || '').toLowerCase()
  if (to.path === '/dang-nhap' && inviteFor && inviteFor !== (u.email || '').toLowerCase()) return true
  if (u.status !== 'active') return to.path === '/cho-cap-quyen' ? true : '/cho-cap-quyen'
  if (u.mustChangePassword) return to.path === '/doi-mat-khau' ? true : '/doi-mat-khau'
  if (to.path === '/doi-mat-khau') return '/'
  if (to.meta.public) return '/'
  return true
})

/* Tiêu đề tab trình duyệt theo quy chuẩn: Phân hệ | Cha… | MISA Solution Point */
setAppTitle(APP_NAME)
/* Ô nhập: focus (Tab / bấm) → chọn hết nội dung — quy chuẩn tiện dụng */
installInputBehaviors()
/* Từ viết tắt dùng trong app → tooltip giải thích ở nhãn ô nhập / tiêu đề cột */
registerAbbreviations({
  PD:   'Product Designer — người thiết kế UI/UX',
  BA:   'Business Analyst — người phân tích nghiệp vụ',
  PO:   'Product Owner — người phụ trách sản phẩm / dự án',
  PBI:  'Product Backlog Item — mã yêu cầu trên TFS',
  TFS:  'Team Foundation Server — hệ thống quản lý yêu cầu, công việc',
  SMTP: 'Máy chủ gửi email',
})
router.afterEach(to => setPageTitle(to.meta.title))
/* Phần mở rộng của app tải lỗi (tab mở bản cũ / máy chủ đang khởi động lại) → tự tải lại trang 1 lần */
window.addEventListener('vite:preloadError', e => { if (reloadForChunk()) { e.preventDefault(); toast.info('Ứng dụng vừa cập nhật — đang tải lại trang…') } })
router.onError(err => { if (isChunkError(err) && reloadForChunk()) toast.info('Ứng dụng vừa cập nhật — đang tải lại trang…') })
/* Bấm sang phân hệ khác → sidebar sáng ngay, thanh tiến trình trên cùng, chờ lâu thì phủ skeleton (quy chuẩn) */
installRouteProgress(router)

async function boot() {
  // Tải dữ liệu song song với kiểm tra phiên (chưa đăng nhập → 401, bỏ qua)
  const prefetch = fetch('/api/bootstrap', { credentials: 'same-origin', headers: inDemoUrl ? { 'X-Pdp-Demo': '1' } : {} }).then(r => (r.ok ? r.json() : null)).catch(() => null)
  if (await detectBackend()) {
    if (backend.user?.status === 'active' && !backend.user.mustChangePassword) {
      const data = await prefetch
      await enterApp(data ? Promise.resolve(data) : undefined).catch(() => {})
    }
  } else {
    await startDemo()
  }
  createApp(App).use(router).provide('dtWidthStore', tableWidthStore).provide('pageSizeStore', pageSizeStore).mount('#app')   // nhớ độ rộng cột + số dòng/trang theo tài khoản
}
boot()
