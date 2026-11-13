<template>
  <!-- Quả chuông trên header: số thông báo chưa đọc · bấm mở danh sách (người chờ duyệt, việc liên quan tới mình được cập nhật…) -->
  <button ref="btnEl" type="button" class="btn-icon-white bell-btn" :class="{ 'bell-btn--open btn-icon-white--active': open, 'bell-btn--ring': ringing }"
    :aria-label="unreadCount ? `Thông báo — ${unreadCount} chưa đọc` : 'Thông báo'" v-tip="open ? '' : unreadCount ? `${unreadCount} thông báo chưa đọc` : 'Thông báo'" @click="toggle">
    <TIcon name="bell" class="bell-btn__icon" />
    <span v-if="unreadCount" :key="unreadCount" class="header-badge bell-btn__badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
  </button>

  <Teleport to="body">
    <div v-if="open" ref="popEl" class="bell-pop" role="dialog" aria-label="Thông báo">
      <div class="bell-pop__head">
        <span class="bell-pop__title">Thông báo</span>
        <div class="bell-pop__tabs" role="tablist">
          <button v-for="t in tabs" :key="t.id" type="button" role="tab" class="bell-pop__tab" :class="{ 'bell-pop__tab--on': tab === t.id }" :aria-selected="tab === t.id" @click="tab = t.id">
            {{ t.label }}<span v-if="t.count" class="bell-pop__tab-count" :class="{ 'bell-pop__tab-count--soft': t.id === 'activity' }">{{ t.count > 99 ? '99+' : t.count }}</span>
          </button>
        </div>
        <!-- Thao tác phụ trong ⋯ (luôn hiện → hàng đầu không đổi khi đổi tab): Đánh dấu đã đọc hết -->
        <DropdownMenu :items="moreItems" placement="bottom-end" :min-width="220" @select="onMore">
          <template #trigger="{ toggle, isOpen }">
            <button type="button" class="btn-icon btn-icon--sm bell-pop__more" :class="{ 'btn-icon--active': isOpen }" aria-label="Thao tác khác" v-tip="isOpen ? '' : 'Thao tác khác'" @click.stop="toggle"><TIcon name="dots" /></button>
          </template>
        </DropdownMenu>
      </div>
      <div class="bell-pop__list">
        <p v-if="!items.length" class="bell-pop__empty">
          <TIcon name="bell" /><span>{{ tab === 'unread' ? 'Không có thông báo chưa đọc' : tab === 'activity' ? 'Chưa có hoạt động nào' : 'Chưa có thông báo nào' }}</span>
        </p>
        <button v-for="x in items" :key="x.n.id" type="button" class="bell-item" :class="{ 'bell-item--unread': !x.n.readAt }" @click="openItem(x)">
          <span class="bell-item__icon" :class="`bell-item__icon--${x.v.tone}`"><TIcon :name="x.v.icon" /></span>
          <span class="bell-item__text">
            <span class="bell-item__title">{{ x.v.title }}</span>
            <span v-if="x.v.sub" class="bell-item__sub">{{ x.v.sub }}</span>
            <span class="bell-item__time">{{ ago(x.n.at) }}</span>
          </span>
          <span v-if="!x.n.readAt" class="bell-item__dot" aria-label="Chưa đọc" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useEscClose } from '@mds/utils/escStack.js'
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { openPeer, ANN, blinkTitle, bellUnread } from '../store/chat.js'
import { notes, unreadCount, unreadActivity, isActivity, notificationView, markRead, markAllRead, loadNotifications } from '../store/notifications.js'

const router = useRouter()
const open = ref(false), tab = ref('all'), btnEl = ref(null), popEl = ref(null)
/* Tab: Tất cả · Chưa đọc (thông báo của mình) · Hoạt động (ai thêm / sửa / xóa việc ở dự án mình tham gia — Quản trị: mọi dự án) */
/* Menu ⋯: đánh dấu đã đọc hết theo tab đang xem (Hoạt động · thông báo) — không còn gì chưa đọc thì mờ */
const tabUnread = computed(() => (tab.value === 'activity' ? unreadActivity.value : unreadCount.value))
const moreItems = computed(() => [{ id: 'read-all', icon: 'checks', label: tab.value === 'activity' ? 'Đánh dấu đã đọc hết hoạt động' : 'Đánh dấu đã đọc hết', disabled: !tabUnread.value }])
function onMore(item) { if (item.id === 'read-all') markAllRead(tab.value === 'activity') }
const tabs = computed(() => [
  { id: 'all', label: 'Tất cả' }, { id: 'unread', label: 'Chưa đọc', count: unreadCount.value },
  { id: 'activity', label: 'Hoạt động', count: unreadActivity.value },
])
const items = computed(() => notes.list
  .filter(n => (tab.value === 'activity' ? isActivity(n) : !isActivity(n) && (tab.value === 'all' || !n.readAt)))
  .slice(0, tab.value === 'activity' ? 150 : 60).map(n => ({ n, v: notificationView(n) })))

function toggle() { open.value = !open.value; if (open.value) loadNotifications() }
function openItem(x) {
  markRead([x.n.id])
  open.value = false
  if (x.v.chatAnn) openPeer(ANN)   // thông báo chung → mở kênh trong khung chat
  else if (x.v.chatPeer) openPeer(x.v.chatPeer)   // cảm xúc về tin nhắn → mở cuộc trò chuyện đó
  else if (x.v.to) router.push(x.v.to)
}
/* Bấm ra ngoài → đóng */
function onDoc(e) { if (!popEl.value?.contains(e.target) && !btnEl.value?.contains(e.target) && !e.target.closest?.('.dropdown-menu')) open.value = false }   // menu ⋯ gắn vào body → bấm trong menu không đóng popup
watch(open, v => (v ? document.addEventListener('mousedown', onDoc) : document.removeEventListener('mousedown', onDoc)))

/* Có thông báo mới → chuông lắc nhẹ */
const ringing = ref(false)
let ringTimer = null
watch(unreadCount, (n, o) => {
  if (n <= (o ?? 0)) return
  ringing.value = false; clearTimeout(ringTimer)
  requestAnimationFrame(() => { ringing.value = true; ringTimer = setTimeout(() => (ringing.value = false), 1000) })
})
/* Thông báo mới (đến sau lúc mở trang) → nháy tiêu đề tab “🔔 …” để biết khi đang làm ở tab khác; số chưa đọc cộng vào “(n)” trên tiêu đề */
const openedAt = new Date().toISOString(), blinked = new Set()
watch(() => notes.list.reduce((m, n) => (n.at > m ? n.at : m), ''), () => {   // chỉ chạy lại khi có thông báo mới hơn (không theo dõi sâu cả danh sách)
  const fresh = notes.list.filter(n => !n.readAt && !isActivity(n) && n.at > openedAt && !blinked.has(n.id + n.at))
  if (!fresh.length) return
  fresh.forEach(n => blinked.add(n.id + n.at))
  const latest = fresh.reduce((a, n) => (n.at > a.at ? n : a))
  const title = notificationView(latest).title
  blinkTitle(`🔔 ${title.length > 60 ? title.slice(0, 59) + '…' : title}`)
})
watch(unreadCount, n => (bellUnread.value = n), { immediate: true })
onBeforeUnmount(() => { clearTimeout(ringTimer); document.removeEventListener('mousedown', onDoc) })

function ago(iso) {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000)
  if (s < 60) return 'Vừa xong'
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}
useEscClose(() => { open.value = false }, () => !!open.value)   // ESC đóng panel (lớp trên cùng)
</script>

<style scoped>
.bell-btn { position: relative; }
/* Đang mở: dùng trạng thái active chuẩn của mds-ui (.btn-icon-white--active = như hover) */
.bell-btn--ring .bell-btn__icon { animation: bell-shake 0.9s ease-in-out; transform-origin: 50% 10%; }
.bell-btn__badge { animation: bell-pop 0.35s ease-out; }
@keyframes bell-shake { 0%, 100% { transform: rotate(0); } 15% { transform: rotate(-16deg); } 30% { transform: rotate(14deg); } 45% { transform: rotate(-10deg); } 60% { transform: rotate(7deg); } 75% { transform: rotate(-3deg); } }
@keyframes bell-pop { 0% { transform: scale(0.4); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .bell-btn--ring .bell-btn__icon, .bell-btn__badge { animation: none; } }

.bell-pop { position: fixed; top: calc(var(--layout-header-h) - 4px); right: 12px; z-index: var(--z-header-pop);   /* menu xổ từ header: luôn trên drawer, panel chat / AVA */
  width: 460px; max-width: calc(100vw - 24px); max-height: min(560px, calc(100vh - var(--layout-header-h) - 16px));
  display: flex; flex-direction: column; border-radius: var(--radius-dialog); background: var(--bg-white); box-shadow: var(--shadow-popover); }   /* popover chuẩn Figma: Bottom 12, không viền */
.bell-pop__head { display: flex; align-items: center; gap: 12px; padding: 10px 12px 10px 16px; border-bottom: 1px solid var(--stroke-divider); }   /* 1 hàng: tiêu đề · tab · ⋯ (thao tác phụ trong menu, không đổi theo tab) */
.bell-pop__head > .dropdown-wrap { margin-left: auto; flex-shrink: 0; }   /* ⋯ luôn sát lề phải, không xê dịch theo độ rộng tab */
.bell-pop { container-type: inline-size; }
@container (max-width: 420px) { .bell-pop__title { display: none; } }   /* điện thoại: bỏ chữ “Thông báo” cho đủ chỗ 3 tab + ⋯ (không đè nhau) */
.bell-pop__title { white-space: nowrap; font-size: var(--text-h3); font-weight: var(--fw-semibold); color: var(--text-primary); }
.bell-pop__tabs { display: inline-flex; min-width: 0; padding: 2px; gap: 2px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.bell-pop__tab { display: inline-flex; align-items: center; gap: 4px; height: calc(var(--btn-height) - 4px); padding: 0 8px; border: none; border-radius: calc(var(--radius-default) - 2px); background: transparent;
  font-family: inherit; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-secondary); cursor: pointer; white-space: nowrap; }   /* cùng độ đậm mọi tab → đổi tab không làm thanh tab rung */
.bell-pop__tab--on { background: var(--bg-white); color: var(--text-primary); box-shadow: var(--shadow-sm); }
.bell-pop__tab-count { min-width: 16px; padding: 0 4px; border-radius: var(--radius-pill); background: var(--bg-danger); color: #fff; font-size: 10px; line-height: 16px; text-align: center; }
/* Danh sách theo Menu List: đệm khung --menu-pad, item bo --menu-radius → hover / nền chưa đọc không chạm 2 mép */
.bell-pop__list { flex: 1; overflow-y: auto; padding: var(--menu-pad); display: flex; flex-direction: column; gap: var(--menu-gap); }
.bell-pop__empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 16px; font-size: var(--text-body); color: var(--text-secondary); }
.bell-pop__empty .ti { font-size: 28px; color: var(--icon-neutral); }
.bell-item { position: relative; display: flex; align-items: flex-start; gap: 12px; width: 100%; flex-shrink: 0; padding: 10px 28px 10px var(--menu-item-px); border: none; border-radius: var(--menu-radius); background: none; font-family: inherit; text-align: left; cursor: pointer; transition: background 0.12s; }
.bell-item:hover { background: var(--bg-brand-light); }
.bell-item:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
.bell-item--unread { background: var(--bg-brand-light); }
.bell-item--unread:hover { background: var(--bg-brand-light-hover); }   /* chưa đọc đã có nền brand nhạt → hover đậm hơn 1 bậc */
.bell-item__icon { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; }
.bell-item__icon--brand   { background: var(--bg-brand-light); color: var(--icon-brand); }
.bell-item__icon--success { background: var(--bg-success-light); color: var(--icon-success); }
.bell-item__icon--warning { background: var(--bg-warning-light); color: var(--icon-warning); }
.bell-item__icon--neutral { background: var(--bg-neutral-light); color: var(--icon-neutral); }
.bell-item__icon--danger  { background: var(--bg-danger-light); color: var(--icon-danger); }
.bell-pop__tab-count--soft { background: var(--bg-neutral-hover); color: var(--text-secondary); }
.bell-item--unread .bell-item__icon { background: var(--bg-white); }
.bell-item__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.bell-item__title { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.bell-item--unread .bell-item__title { font-weight: var(--fw-semibold); }
.bell-item__sub { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.bell-item__time { font-size: var(--text-body); color: var(--text-secondary); }
.bell-item__dot { position: absolute; right: 12px; top: 50%; width: 8px; height: 8px; margin-top: -4px; border-radius: 50%; background: var(--bg-brand); }
</style>
