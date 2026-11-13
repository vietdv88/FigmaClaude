<template>
  <!-- Ai đang dùng hệ thống: chỉ tính người ĐANG HOẠT ĐỘNG (có thao tác trong N phút) — cập nhật mỗi 30 giây -->
  <div v-if="pres.loaded" ref="onlineEl" class="pdp-online-wrap">
    <button type="button" class="pdp-online" :class="{ 'pdp-online--open': onlineOpen }" @click="onlineOpen = !onlineOpen">
      <span class="pdp-online__part"><span class="pdp-dot pdp-dot--active" />{{ activeUsers.length }} đang hoạt động</span>
      <span v-if="demoList.length" class="pdp-online__part pdp-online__part--demo"><span class="pdp-dot pdp-dot--demo" />{{ demoList.length }} khách</span>
      <TIcon name="chevron-down" />
    </button>
    <!-- Danh sách: bấm mở, bấm ra ngoài / Esc để đóng -->
    <!-- Teleport ra body: nằm trong header (z-index 100) thì drawer đè lên — menu xổ từ header luôn trên drawer -->
    <Teleport to="body">
    <div v-if="onlineOpen" ref="popEl" class="pdp-online-pop" :style="popStyle" @keydown.esc="onlineOpen = false">
      <p class="pdp-online-pop__title">Đang dùng hệ thống <span>· cập nhật {{ updatedAgo }}</span></p>
      <!-- Có khách (vào bản dùng thử, không đăng nhập — chỉ Quản trị thấy) → 2 tab: Người dùng (mặc định) · Khách -->
      <SubNavTabs v-if="demoList.length" v-model="popTab" class="pdp-online-pop__tabs"
        :items="[{ id: 'users', label: 'Người dùng', n: activeUsers.length }, { id: 'demo', label: 'Khách', n: demoList.length }]">
        <template #tab="{ item }">{{ item.label }} <span class="pdp-online-pop__tab-n">{{ item.n }}</span></template>
      </SubNavTabs>
      <template v-if="popTab === 'users' || !demoList.length">
      <p v-if="!activeUsers.length" class="pdp-online-pop__empty">Chưa có ai đang hoạt động.</p>
      <template v-for="grp in onlineGroups" :key="grp.key">
        <p v-if="grp.users.length" class="pdp-online-pop__group" :class="`pdp-online-pop__group--${grp.key}`">
          <span class="pdp-dot" :class="`pdp-dot--${grp.key}`" />{{ grp.label }} ({{ grp.users.length }})<span v-if="grp.hint" class="pdp-online-pop__hint">{{ grp.hint }}</span>
        </p>
        <div v-for="u in grp.users" :key="u.id" class="pdp-online-pop__item">
          <span class="pdp-online-pop__avatar-wrap">
            <UserAvatar class="pdp-online-pop__avatar" :name="u.name" :picture="avatarOf(u)" />
            <span class="pdp-dot pdp-dot--badge" :class="`pdp-dot--${grp.key}`" />
          </span>
          <div class="pdp-online-pop__text">
            <span class="pdp-online-pop__name">{{ u.name }}<span class="pdp-online-pop__role">{{ roleLabelOf(u) }}</span></span>
            <span class="pdp-online-pop__sub">{{ u.email || u.code }}</span>
            <span v-for="(s, i) in pres.activity[u.id].sessions.filter(x => !x.idle)" :key="i" class="pdp-online-pop__dev">
              <TIcon :name="/iOS|Android/.test(s.device) ? 'device-mobile' : 'device-desktop'" />{{ s.device }} · {{ s.ip || '—' }} · {{ s.idle ? `không thao tác ${idleFor(s.lastActive)}` : `từ ${timeOf(s.since)}` }}
            </span>
          </div>
          <!-- Nhắn tin ngay cho người này (không hiện ở dòng của chính mình) -->
          <button v-if="u.id !== currentUser?.id" type="button" class="btn-icon btn-icon--sm pdp-online-pop__chat" v-tip="`Nhắn tin cho ${u.name}`" :aria-label="`Nhắn tin cho ${u.name}`" @click="chatWith(u.id)">
            <TIcon name="message-circle" />
          </button>
        </div>
      </template>
      </template>
      <!-- Tab Dùng thử (chỉ Quản trị): đã đăng nhập bản thật → tên thật; chưa → “Khách N” · vai trò đang xem trong demo · máy / IP -->
      <template v-else>
        <p class="pdp-online-pop__hint pdp-online-pop__guest-note">Khách đang xem bản dùng thử (dữ liệu mẫu, không cần đăng nhập)</p>
        <div v-for="v in demoList" :key="v.id" class="pdp-online-pop__item">
          <span class="pdp-online-pop__avatar-wrap">
            <UserAvatar class="pdp-online-pop__avatar" :name="v.name" :picture="v.user ? avatarOf(v.user) : ''" />
            <span class="pdp-dot pdp-dot--badge" :class="v.idle ? 'pdp-dot--idle' : 'pdp-dot--demo'" />
          </span>
          <div class="pdp-online-pop__text">
            <span class="pdp-online-pop__name">{{ v.name }}<span v-if="v.user" class="pdp-online-pop__role">{{ roleLabelOf(v.user) }}</span></span>
            <span v-if="v.viewAs" class="pdp-online-pop__sub">Đang xem với vai trò: {{ v.viewAs.name }} · {{ roleLabelOf(v.viewAs) }}</span>
            <span class="pdp-online-pop__dev" :class="{ 'pdp-online-pop__dev--idle': v.idle }">
              <TIcon :name="/iOS|Android/.test(v.device) ? 'device-mobile' : 'device-desktop'" />{{ v.device }} · {{ v.ip || '—' }} · {{ v.idle ? `không thao tác ${idleFor(v.lastActive)}` : `từ ${timeOf(v.since)}` }}
            </span>
          </div>
        </div>
      </template>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { avatarOf } from '../store/avatar.js'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import SubNavTabs from '@mds/components/SubNavTabs.vue'
import TIcon from '@mds/components/TIcon.vue'
import UserAvatar from './UserAvatar.vue'
import { db, roleLabelOf, currentUser } from '../store/db.js'
import { chat, openPeer, loadContacts } from '../store/chat.js'
import { usePresence, presence, stateOf, idleFor, timeOf, ago } from '../store/presence.js'

/* Cụm “N đang hoạt động · M không hoạt động” trên header chung (mọi người dùng) — bấm xổ danh sách người đang dùng (+ máy / IP với Quản trị), nhắn tin ngay */
const pres = usePresence()
// Người đang mở app: lấy thông tin từ dữ liệu đã tải, thiếu thì từ danh bạ chat (người dùng thường chỉ tải người liên quan)
const userOf = id => db.users.find(u => u.id === id) ?? presence.people[id] ?? (id === currentUser.value?.id ? currentUser.value : null)
const online = state => Object.keys(pres.activity).filter(id => stateOf(id) === state).map(userOf).filter(Boolean)
const activeUsers = computed(() => online('active').sort((a, b) => a.name.localeCompare(b.name, 'vi')))
// Chỉ thống kê người ĐANG HOẠT ĐỘNG (mở app + có thao tác trong N phút) — người mở app mà không thao tác không tính, không hiện
const onlineGroups = computed(() => [
  { key: 'active', label: 'Đang hoạt động', users: activeUsers.value },
])
// Khách đang dùng thử (API chỉ trả cho Quản trị) — cũng chỉ tính khách đang thao tác
const demoList = computed(() => (pres.demo ?? []).filter(v => !v.idle).map(v => { const user = v.userId ? userOf(v.userId) : null; return { ...v, user, name: user?.name ?? (v.guest || 'Khách') } }))
const onlineOpen = ref(false), onlineEl = ref(null), popEl = ref(null), popTab = ref('users'), popStyle = ref({})
/* Mỗi lần mở → tab Người dùng · neo dưới nút, mép phải thẳng mép phải nút */
watch(onlineOpen, v => {
  if (!v) return
  popTab.value = 'users'
  const r = onlineEl.value?.getBoundingClientRect()
  if (r) popStyle.value = { top: r.bottom + 6 + 'px', right: Math.max(16, window.innerWidth - r.right) + 'px' }
})
const onOutside = e => { if (onlineOpen.value && !onlineEl.value?.contains(e.target) && !popEl.value?.contains(e.target)) onlineOpen.value = false }
const onEsc = e => { if (e.key === 'Escape') onlineOpen.value = false }
onMounted(() => { document.addEventListener('mousedown', onOutside); document.addEventListener('keydown', onEsc) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', onOutside); document.removeEventListener('keydown', onEsc) })
// Bấm icon chat → đóng danh sách, mở khung chat với người đó
async function chatWith(id) {
  onlineOpen.value = false
  if (!chat.contacts.some(c => c.id === id)) await loadContacts()
  openPeer(id)
}
const updatedAgo = computed(() => (pres.loadedAt ? ago(pres.loadedAt) : ''))
</script>

<style scoped>
.pdp-online-wrap { position: relative; }
.pdp-online { display: inline-flex; align-items: center; gap: 10px; height: calc(var(--btn-height) - 4px); padding: 0 12px; border: none; border-radius: var(--radius-default); background: var(--bg-success-light, var(--bg-brand-light)); font-family: inherit; font-size: var(--text-body); color: var(--text-success, var(--text-brand)); font-weight: var(--fw-semibold); cursor: pointer; }
.pdp-online:hover { filter: brightness(0.97); }
.pdp-online .ti { font-size: 14px; transition: transform 0.15s; }
.pdp-online--open .ti { transform: rotate(180deg); }
.pdp-online-pop { position: fixed; z-index: var(--z-header-pop); width: 440px; max-width: calc(100vw - 32px); max-height: min(70vh, 520px); overflow-y: auto; padding: var(--menu-pad); background: var(--bg-white); border-radius: var(--radius-dialog); box-shadow: var(--shadow-popover); }   /* popover chuẩn: không viền, Bottom 12 · đệm khung như Menu List → dòng hover không chạm 2 mép */
.pdp-online-pop__title { padding: 4px var(--menu-item-px) 8px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.pdp-online-pop__title span { font-weight: var(--fw-regular); color: var(--text-secondary); }
.pdp-online-pop__empty { padding: 4px var(--menu-item-px) 8px; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-online-pop__item { display: flex; align-items: flex-start; gap: 10px; padding: 8px var(--menu-item-px); border-radius: var(--menu-radius); transition: background 0.12s; }
.pdp-online-pop__item:hover { background: var(--bg-brand-light); }
.pdp-online-pop__chat { flex-shrink: 0; margin-left: auto; color: var(--text-brand); }
.pdp-online-pop__chat:hover { background: var(--bg-white); }   /* dòng đang hover đã nền brand nhạt → nút nổi trên nền trắng */

.pdp-online-pop__avatar { width: 32px; height: 32px; flex-shrink: 0; border-radius: var(--radius-pill); display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: var(--fw-semibold); }
.pdp-online-pop__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.pdp-online-pop__name { display: flex; align-items: center; gap: 6px; min-width: 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pdp-online-pop__role { font-size: var(--text-body); font-weight: var(--fw-regular); color: var(--text-secondary); }
.pdp-online-pop__sub { font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pdp-online-pop__dev { display: flex; align-items: center; gap: 4px; min-width: 0; font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pdp-online-pop__dev .ti { font-size: 14px; flex-shrink: 0; }
.pdp-online__part { display: inline-flex; align-items: center; gap: 6px; }
.pdp-online__part--idle { padding-left: 10px; border-left: 1px solid currentColor; border-left-color: color-mix(in srgb, currentColor 30%, transparent); color: var(--text-warning); }
.pdp-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.pdp-dot--active { background: var(--bg-success); box-shadow: 0 0 0 0 color-mix(in srgb, var(--bg-success) 60%, transparent); animation: pdp-pulse 2s infinite; }
.pdp-dot--idle { background: var(--bg-warning); }
.pdp-online-pop__tabs { margin: 0 var(--menu-item-px) 4px; border-bottom: 1px solid var(--stroke-neutral-light); }
.pdp-online-pop__hint.pdp-online-pop__guest-note { display: block; margin: 0; padding: 4px 16px 6px; font-size: var(--text-body); }
.pdp-online-pop__tab-n { margin-left: 4px; color: var(--text-secondary); font-weight: var(--fw-regular, 400); }
.pdp-dot--demo { background: var(--chart-c6); }   /* người đang dùng thử — tím, khác xanh (đang hoạt động) / cam (không hoạt động) */
.pdp-online__part--demo { padding-left: 10px; border-left: 1px solid color-mix(in srgb, currentColor 30%, transparent); color: var(--chart-c6); }
@keyframes pdp-pulse { 70% { box-shadow: 0 0 0 5px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
@media (prefers-reduced-motion: reduce) { .pdp-dot--active { animation: none; } }
.pdp-online-pop__group { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 8px var(--menu-item-px) 4px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.pdp-online-pop__group + .pdp-online-pop__item { border-top: none; }
.pdp-online-pop__item + .pdp-online-pop__group { margin-top: 4px; border-top: 1px solid var(--stroke-divider); padding-top: 12px; }
.pdp-online-pop__hint { flex-basis: 100%; padding-left: 14px; font-weight: var(--fw-regular); color: var(--text-secondary); }
.pdp-online-pop__avatar-wrap { position: relative; flex-shrink: 0; }
.pdp-dot--badge { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border: 2px solid var(--bg-white); animation: none; }
.pdp-online-pop__dev--idle { color: var(--text-warning); }

/* Header có màu nền: chip kính mờ, chữ trắng — chấm xanh “đang hoạt động” giữ màu */
:root:not([data-mode="light"]) .pdp-online { background: rgba(255, 255, 255, 0.14); color: #fff; }
:root:not([data-mode="light"]) .pdp-online:hover { filter: none; background: rgba(255, 255, 255, 0.22); }
:root:not([data-mode="light"]) .pdp-online .pdp-dot { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.85); }   /* chấm trạng thái nổi trên nền header màu (VD xanh lá trùng chấm xanh) */
:root:not([data-mode="light"]) .pdp-online__part--idle { color: rgba(255, 255, 255, 0.8); }
:root:not([data-mode="light"]) .pdp-online__part--demo { color: rgba(255, 255, 255, 0.8); }
</style>
