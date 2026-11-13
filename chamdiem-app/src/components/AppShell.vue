<template>
  <div class="app-shell">
    <ControlHeader :app-name="APP_NAME" :no-meta="!isDemoBar" :hide-trial-banner="true"
      :settings-only="true" :settings-menu="settingsMenu" @settings-select="onSettingsSelect" home-href="/" @home="router.push('/')" :avatar-name="currentUser?.name ?? ''"
      :user-email="currentUser?.email ?? ''" :user-role="roleLabelOf(currentUser) || ''" :user-picture="avatarOf(currentUser)"
      :profile-menu="backend.enabled && !openDemo ? PROFILE_MENU : []" @profile-select="onProfileSelect"
      v-on="backend.enabled && !openDemo ? { logout: doLogout } : {}"
      :hide-tools="['search', 'ai', 'notify', 'help', 'more']" :apps="APPS" current-app="pdpoint">
      <template #logo-icon>
        <!-- Header nền màu → logo trắng (logo-white.svg) · header nền sáng → logo màu -->
        <img class="app-logo" :src="currentMode === 'light' ? '/logo.svg' : '/logo-white.svg'" width="32" height="32" alt="" />
      </template>
      <!-- Bản dùng thử / chế độ demo: tag + Trang chủ + chọn vai trò nằm sát tên app — các chức năng bên phải y như bản thật -->
      <template v-if="isDemoBar" #header-meta>
        <div class="demo-bar">
          <span v-if="openDemo" class="app-tag app-tag--warning app-tag--outline demo-tag" v-tip="'Dữ liệu mẫu — mọi thay đổi tự xóa, dữ liệu làm mới lúc 2 giờ sáng mỗi ngày'">Bản dùng thử</span>
          <a v-if="openDemo && backend.publicConfig?.homeUrl" class="demo-link" :href="backend.publicConfig.homeUrl" v-tip="'Về trang chủ'"><TIcon name="home" /><span class="demo-link__txt">Trang chủ</span></a>
          <DropdownMenu :items="userOptions.map(o => ({ id: o.value, label: o.label }))" :active-id="openDemo ? currentUser?.id : db.currentUserId" :min-width="260" @select="it => onSwitchUser(it.id)">
            <template #trigger="{ toggle, isOpen }">
              <button type="button" class="demo-role" :class="{ 'demo-role--open': isOpen }" v-tip="'Chọn người dùng để xem theo phân quyền'" @click.stop="toggle">
                <span class="demo-role__txt"><span class="demo-role__pre">{{ openDemo ? 'Xem với vai trò' : 'Demo · Đăng nhập với' }}: </span>{{ currentUser?.name ?? '—' }}</span><TIcon name="chevron-down" />
              </button>
            </template>
          </DropdownMenu>
        </div>
      </template>
      <template #header-actions>
        <!-- Đăng nhập bản thật: link ngay bên trái icon mặc định -->
        <a v-if="openDemo && backend.publicConfig?.officialUrl" class="demo-link" :href="backend.publicConfig.officialUrl"><TIcon name="login" />Đăng nhập</a>
        <!-- Ai đang dùng hệ thống (mọi người dùng; máy / IP chỉ Quản trị thấy) — ngay bên trái icon Thiết lập -->
        <!-- Đường dẫn dự phòng (IP) + nút sao chép: gửi cho người không vào được bằng tên miền pdpoint… -->
        <AccessLinkCopy v-if="backend.enabled" />
        <OnlineUsersBadge v-if="backend.enabled" class="hdr-online" />
        <!-- Trợ lý AVA: hỏi đáp quy tắc chấm điểm / cách dùng app (cần Quản trị cấu hình API key AI) -->
        <AvaPanel v-if="aiEnabled && currentUser" />
        <!-- Thông báo: người tự đăng ký chờ duyệt (Quản trị), công việc liên quan tới mình được giao / cập nhật -->
        <NotificationBell v-if="backend.enabled && currentUser" />
        <!-- Chat nội bộ 1-1 (mọi người dùng) -->
        <ChatPanel v-if="backend.enabled" />
      </template>
    </ControlHeader>

    <div class="body-row">
      <!-- “+ Thêm việc” (trên Tổng quan): chọn Dự án + Vòng lặp → form Thêm công việc — chỉ hiện khi được thêm việc ở ít nhất 1 dự án -->
      <AppSidebar :items="navItems" :active-id="activeId" :hide-quick-add="!canAddAnyTask" quick-add-label="Thêm việc" :default-expanded="true" storage-key="pdpoint-sidebar-expanded"
        @nav="onNav" @quick-add="addingTask = true" />
      <AddTaskFlow v-if="addingTask" @close="addingTask = false" />
      <main class="main-content">
        <slot />
        <!-- Đang chuyển sang phân hệ khác mà chưa xong → phủ khung xương thay vì để màn hình đứng im -->
        <PageSkeleton v-if="routeProgress.slow" :cards="skeletonCards" />
      </main>
    </div>

    <!-- Toast (quy chuẩn): giữa phía trên màn hình — thành công / lỗi đồng bộ máy chủ -->
    <AppToaster />
    <!-- Ghi chú nhanh (nút nổi kéo được) — riêng từng người, đồng bộ vào tài khoản; bản dùng thử không bật -->
    <StickyNotes v-if="backend.enabled && currentUser && !openDemo" :user="currentUser" login-url="/dang-nhap" api="/api/notes" storage-prefix="cd-sticky" />
    <!-- Vừa deploy bản mới → góc trên bên phải: yêu cầu tải lại trang -->
    <AppUpdateNotice :build="APP_BUILD" />
    <ChangePasswordDialog v-if="showPassword" @close="showPassword = false" />
    <AvatarDialog v-if="showAvatar" @close="showAvatar = false" />
    <!-- Thông tin tài khoản: dùng lại form chi tiết người dùng ở chế độ tự xem (chỉ tick được Dự án phụ trách) -->
    <UserDialog v-if="showAccount && currentUser" :user="currentUser" self @close="showAccount = false" />
  </div>
</template>

<script setup>
import { isPdRole } from '../store/scoring.js'
import { welcomePetals } from '../store/seasonalEvents.js'
import AddTaskFlow from './AddTaskFlow.vue'
import { avatarOf } from '../store/avatar.js'
import AppUpdateNotice from '@mds/components/AppUpdateNotice.vue'
/* global __APP_BUILD__ */
const APP_BUILD = typeof __APP_BUILD__ === 'string' && import.meta.env.PROD ? __APP_BUILD__ : ''   // chạy dev → không kiểm tra
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ControlHeader from '@mds/components/ControlHeader.vue'
import AppSidebar    from '@mds/components/AppSidebar.vue'
import TIcon         from '@mds/components/TIcon.vue'
import DropdownMenu  from '@mds/components/DropdownMenu.vue'
import { currentMode } from '@mds/theme.js'
import { vTip }      from '@mds/utils/tooltip.js'
import { backend, api } from '../store/api.js'
import { signOut } from '../store/session.js'
import { isDirectManager, db, currentUser, setCurrentUser, roleLabelOf, canSeeReportOf, loadFromServer, performerSet, myDeptAdmin, myProjects, canAddTask } from '../store/db.js'
import { APP_NAME, APPS } from '../store/app.js'
import ChangePasswordDialog from './ChangePasswordDialog.vue'
import AvatarDialog from './AvatarDialog.vue'
import UserDialog from './UserDialog.vue'
import OnlineUsersBadge from './OnlineUsersBadge.vue'
import AccessLinkCopy from './AccessLinkCopy.vue'
import ChatPanel from './ChatPanel.vue'
import StickyNotes from '@mds/components/StickyNotes.vue'
import NotificationBell from './NotificationBell.vue'
import AvaPanel from './AvaPanel.vue'
import { aiEnabled } from '../store/ai.js'
import AppToaster from '@mds/components/AppToaster.vue'
import PageSkeleton from '@mds/components/PageSkeleton.vue'
import { routeProgress } from '@mds/utils/routeProgress.js'
import { toast } from '@mds/utils/toast.js'

const router = useRouter()
const route  = useRoute()

const navItems = computed(() => {
  const items = [
    { id: 'tong-quan', icon: 'layout-dashboard', label: 'Tổng quan' },
    { id: 'du-an',     icon: 'briefcase',        label: 'Dự án' },
  ]
  // Chốt điểm: Quản trị, quản lý trực tiếp của PD, hoặc người làm cùng dự án với PD (chỉ xem)
  const performers = performerSet()   // người bộ phận khác có việc ở cột PD cũng được chốt điểm (cả việc chưa tải)
  const hasBaWork = db.hasBaWork || db.tasks.some(t => t.baId && ['analysis', 'both'].includes(t.stage))   // có việc phân tích → chốt điểm BA
  if (currentUser.value?.role === 'admin' || myDeptAdmin() || hasBaWork || db.users.some(u => (isPdRole(u.role) || performers.has(u.id)) && u.status !== 'disabled' && canSeeReportOf(u.id))) {
    items.push({ id: 'chot-diem', icon: 'lock', label: 'Tổng hợp điểm' })
  }
  items.push({ id: 'quy-tac', icon: 'book', label: 'Quy tắc PD' })
  items.push({ id: 'quy-tac-ba', icon: 'clipboard-list', label: 'Quy tắc BA', badge: 'Beta' })
  // Người dùng: Quản trị · quản lý trực tiếp (chỉ thấy + sửa giới hạn người mình quản lý)
  if (currentUser.value?.role === 'admin' || myDeptAdmin() || isDirectManager()) {   // + Quản trị PD / BA (người thuộc bộ phận mình)
    items.push(
      { id: 'nguoi-dung', icon: 'users', label: 'Người dùng' },
    )
  }
  return items
})

/* Cài đặt chung: icon bánh răng trên header xổ menu (quy chuẩn) — Cài đặt hệ thống chỉ Quản trị */
const settingsMenu = computed(() => (currentUser.value?.role === 'admin' ? [
  { id: 'system', icon: 'adjustments', label: 'Cài đặt hệ thống' },
  ...(backend.enabled && !openDemo.value ? [{ id: 'ava-logs', icon: 'history', label: 'Lịch sử hỏi AVA' }] : []),
] : []))
/* Menu avatar: Đổi mật khẩu (trên Đăng xuất) */
const PROFILE_MENU = [{ id: 'account', icon: 'user', label: 'Thông tin tài khoản' }, { id: 'avatar', icon: 'photo', label: 'Ảnh đại diện' }, { id: 'password', icon: 'lock', label: 'Đổi mật khẩu' },
  { separator: true }, { id: 'design-system', icon: 'palette', label: 'Tài liệu Design System' }]   // app tài liệu riêng (/ds) cùng tên miền → mở tab mới
const showPassword = ref(false), showAvatar = ref(false), showAccount = ref(false)
function onProfileSelect(item) { if (item.id === 'design-system') window.open('/ds/', '_blank', 'noopener'); if (item.id === 'account') showAccount.value = true; if (item.id === 'password') showPassword.value = true; if (item.id === 'avatar') showAvatar.value = true }
function onSettingsSelect(item) { if (item.id === 'system') router.push('/cai-dat'); if (item.id === 'ava-logs') router.push('/lich-su-ava') }

// Đang chuyển trang → sáng ngay mục được bấm (không chờ trang mới tải xong)
const activeId = computed(() => (routeProgress.target || route.path).split('/')[1] || 'tong-quan')
// Trang có dãy card KPI phía trên danh sách → skeleton cũng có card
const skeletonCards = computed(() => (['tong-quan', 'chot-diem', 'du-an'].includes(activeId.value) ? 4 : 0))

/* Đổi người dùng: chế độ demo (dữ liệu trong trình duyệt) hoặc máy chủ bật OPEN_DEMO (dữ liệu chung, không cần đăng nhập) */
const openDemo = computed(() => !!(backend.enabled && backend.publicConfig?.openDemo))
const isDemoBar = computed(() => !backend.enabled || openDemo.value)
const demoUsers = ref([])
watch(openDemo, async v => { if (v) demoUsers.value = (await api.get('/api/auth/demo-users').catch(() => ({ users: [] }))).users }, { immediate: true })
const userOptions = computed(() => (openDemo.value ? demoUsers.value : db.users.filter(u => u.status !== 'disabled'))
  .map(u => ({ value: u.id, label: `${u.name} · ${roleLabelOf(u)}` })))

function onNav(id) { router.push(id === 'tong-quan' ? '/' : '/' + id) }   // Tổng quan = trang gốc

async function doLogout() { await signOut(); router.replace('/dang-nhap') }

// Lỗi đồng bộ với máy chủ → toast lỗi
watch(() => backend.error, v => { if (v) { toast.error(v); backend.error = '' } })

async function onSwitchUser(id) {
  if (openDemo.value) {
    const r = await api.post('/api/auth/switch', { userId: id })
    backend.user = r.user
    await loadFromServer()
  } else setCurrentUser(id)
  const adminOnly = ['cai-dat', 'lich-su-ava']
  if ((adminOnly.includes(activeId.value) && currentUser.value.role !== 'admin') || (activeId.value === 'nguoi-dung' && currentUser.value.role !== 'admin' && !myDeptAdmin() && !isDirectManager())) router.push('/')
  else if (route.params.id) router.push('/du-an')
}
const addingTask = ref(false)
const canAddAnyTask = computed(() => myProjects.value.some(p => canAddTask(p.id)))
onMounted(() => setTimeout(() => welcomePetals(), 600))   // dịp 20/10: cánh hoa rơi khi mở app / vào màn mới
watch(() => route.path, (p, o) => { if (o && p !== o) welcomePetals() })   // … và mỗi lần chuyển màn (mỗi trang tự bọc AppShell → onMounted chạy lại; watch phòng khi shell giữ nguyên)
</script>

<style scoped>
.app-logo { display: block; flex-shrink: 0; }
.user-chip { display: flex; align-items: center; gap: 12px; }
.user-chip__text { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; }
.user-chip__name { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.user-chip__role { font-size: var(--text-body); color: var(--text-secondary); }
.demo-bar { display: flex; align-items: center; gap: 16px; min-width: 0; }
/* Header hẹp (mở panel AVA / chat): tên app giữ nguyên, các mục demo co lại — nút vai trò cắt "…", bỏ chữ Trang chủ */
:global(.global-header:has(.demo-bar) .header-brand) { flex-shrink: 0; }
:global(.global-header:has(.demo-bar) .header-left) { min-width: 0; overflow: hidden; container-type: inline-size; }
.demo-bar > * { flex-shrink: 0; }
.demo-bar > :last-child { display: flex; flex-shrink: 1; min-width: 0; }
@container (max-width: 720px) { .demo-link__txt, .demo-role__pre { display: none; } }
@container (max-width: 480px) { .demo-tag { display: none; } }
.demo-role { max-width: 100%; }
.demo-role__txt { overflow: hidden; text-overflow: ellipsis; line-height: var(--text-body-lh); padding-block: 2px; margin-block: -2px; }   /* cắt “…” không cụt dấu chồng chữ HOA */
/* Link (Trang chủ / Đăng nhập): header nền màu → chữ trắng · header nền sáng → chữ link */
.demo-link { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); color: rgba(255, 255, 255, 0.92); text-decoration: none; white-space: nowrap; }
.demo-link .ti { font-size: 16px; }
.demo-link:hover { color: #fff; text-decoration: underline; }
:global(.global-header--white .demo-link), :global(.global-header--white .demo-link:hover) { color: var(--text-link, var(--text-brand)); }
/* Chọn vai trò: cùng kiểu nút "đang hoạt động" (OnlineUsersBadge) */
.demo-role { display: inline-flex; align-items: center; gap: 6px; height: calc(var(--btn-height) - 4px); padding: 0 12px; border: none; border-radius: var(--radius-default); background: var(--bg-success-light, var(--bg-brand-light)); font-family: inherit; font-size: var(--text-body); color: var(--text-success, var(--text-brand)); font-weight: var(--fw-semibold); white-space: nowrap; cursor: pointer; }
.demo-role:hover { filter: brightness(0.97); }
.demo-role .ti { font-size: 14px; transition: transform 0.15s; }
.demo-role--open .ti { transform: rotate(180deg); }
:root:not([data-mode="light"]) .demo-role { background: rgba(255, 255, 255, 0.14); color: #fff; }
:root:not([data-mode="light"]) .demo-role:hover { filter: none; background: rgba(255, 255, 255, 0.22); }
</style>
