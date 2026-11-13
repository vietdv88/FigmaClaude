<template>
  <!-- Ai đang xem tài liệu (như app Chấm điểm): chỉ tính người ĐANG HOẠT ĐỘNG (có thao tác trong N phút) — cập nhật mỗi 30 giây · chỉ người biên tập thấy -->
  <div v-if="pres.loaded" ref="wrapEl" class="ds-online-wrap">
    <button type="button" class="ds-online" :class="{ 'ds-online--open': open }" :aria-expanded="open" :aria-label="`${people.length} đang hoạt động${guests.length ? `, ${guests.length} khách` : ''}`" @click="open = !open">
      <span class="ds-online__part"><span class="ds-dot ds-dot--active" />{{ people.length }}<span class="ds-online__label"> đang hoạt động</span></span>
      <span v-if="guests.length" class="ds-online__part ds-online__part--guest"><span class="ds-dot ds-dot--guest" />{{ guests.length }} khách</span>
      <TIcon name="chevron-down" />
    </button>
    <!-- Teleport ra body: popover luôn nằm trên ngăn menu / drawer -->
    <Teleport to="body">
      <div v-if="open" ref="popEl" class="ds-online-pop" :style="popStyle">
        <p class="ds-online-pop__title">Đang xem tài liệu <span>· cập nhật {{ updatedAgo }}</span></p>
        <!-- Có khách (người đọc chưa đăng nhập) → 2 tab: Người dùng (mặc định) · Khách -->
        <SubNavTabs v-if="guests.length" v-model="popTab" class="ds-online-pop__tabs"
          :items="[{ id: 'users', label: 'Người dùng', n: people.length }, { id: 'guests', label: 'Khách', n: guests.length }]">
          <template #tab="{ item }">{{ item.label }} <span class="ds-online-pop__tab-n">{{ item.n }}</span></template>
        </SubNavTabs>
        <template v-if="popTab === 'users' || !guests.length">
          <p v-if="!people.length" class="ds-online-pop__empty">Chưa có ai đăng nhập đang hoạt động.</p>
          <div v-for="u in people" :key="u.userId" class="ds-online-pop__item">
            <AppAvatar :name="u.name" :size="32" online />
            <div class="ds-online-pop__text">
              <span class="ds-online-pop__name">{{ u.name }}</span>
              <span v-if="u.email" class="ds-online-pop__sub">{{ u.email }}</span>
              <span v-for="s in u.sessions" :key="s.id" class="ds-online-pop__dev">
                <TIcon :name="/iOS|Android/.test(s.device) ? 'device-mobile' : 'device-desktop'" />{{ s.device }} · {{ s.ip || '—' }} · từ {{ timeOf(s.since) }} · {{ s.pageTitle }}
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <p class="ds-online-pop__note">Người đọc tài liệu chưa đăng nhập</p>
          <div v-for="v in guests" :key="v.id" class="ds-online-pop__item">
            <AppAvatar :name="v.name" :size="32" color="neutral" online />
            <div class="ds-online-pop__text">
              <span class="ds-online-pop__name">{{ v.name }}</span>
              <span class="ds-online-pop__sub">Đang xem: {{ v.pageTitle }}</span>
              <span class="ds-online-pop__dev"><TIcon :name="/iOS|Android/.test(v.device) ? 'device-mobile' : 'device-desktop'" />{{ v.device }} · {{ v.ip || '—' }} · từ {{ timeOf(v.since) }}</span>
            </div>
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppAvatar from '@mds/components/AppAvatar.vue'
import SubNavTabs from '@mds/components/SubNavTabs.vue'
import { presence as pres, watchPresence, unwatchPresence, timeOf, ago } from '../presence.js'

// Chỉ tính phiên đang thao tác; người đăng nhập mở nhiều tab → gộp 1 người, liệt kê từng phiên
const activeList = computed(() => pres.visitors.filter(v => !v.idle))
const people = computed(() => {
  const m = new Map()
  for (const v of activeList.value.filter(v => !v.guest)) { const p = m.get(v.userId) ?? m.set(v.userId, { userId: v.userId, name: v.name, email: v.email, sessions: [] }).get(v.userId); p.sessions.push(v) }
  return [...m.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
})
const guests = computed(() => activeList.value.filter(v => v.guest))
const updatedAgo = computed(() => (pres.loadedAt ? ago(pres.loadedAt) : ''))

const open = ref(false), popTab = ref('users'), wrapEl = ref(null), popEl = ref(null), popStyle = ref({})
/* Mỗi lần mở → tab Người dùng · neo dưới nút, mép phải thẳng mép phải nút */
watch(open, v => {
  if (!v) return
  popTab.value = 'users'
  const r = wrapEl.value?.getBoundingClientRect()
  if (r) popStyle.value = { top: r.bottom + 6 + 'px', right: Math.max(16, window.innerWidth - r.right) + 'px' }
})
const onOutside = e => { if (open.value && !wrapEl.value?.contains(e.target) && !popEl.value?.contains(e.target)) open.value = false }
const onEsc = e => { if (e.key === 'Escape') open.value = false }
onMounted(() => { watchPresence(); document.addEventListener('mousedown', onOutside); document.addEventListener('keydown', onEsc) })
onBeforeUnmount(() => { unwatchPresence(); document.removeEventListener('mousedown', onOutside); document.removeEventListener('keydown', onEsc) })
</script>

<style scoped>
.ds-online-wrap { position: relative; }
.ds-online { display: inline-flex; align-items: center; gap: 10px; height: calc(var(--btn-height) - 4px); padding: 0 12px; border: none; border-radius: var(--radius-default); background: var(--bg-success-light, var(--bg-brand-light)); font-family: inherit; font-size: var(--text-body); color: var(--text-success, var(--text-brand)); font-weight: var(--fw-semibold); white-space: nowrap; cursor: pointer; }
.ds-online:hover { filter: brightness(0.97); }
.ds-online .ti { font-size: 14px; transition: transform 0.15s; }
.ds-online--open .ti { transform: rotate(180deg); }
.ds-online__part { display: inline-flex; align-items: center; gap: 6px; }
.ds-online__part--guest { padding-left: 10px; border-left: 1px solid color-mix(in srgb, currentColor 30%, transparent); color: var(--chart-c6); }
.ds-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ds-dot--active { background: var(--bg-success); animation: ds-pulse 2s infinite; }
.ds-dot--guest { background: var(--chart-c6); }   /* khách — tím, khác xanh (người dùng đang hoạt động) */
@keyframes ds-pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--bg-success) 60%, transparent); } 70% { box-shadow: 0 0 0 5px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
@media (prefers-reduced-motion: reduce) { .ds-dot--active { animation: none; } }

/* popover chuẩn: không viền, bo 12 · đệm khung như Menu List → dòng hover không chạm 2 mép */
.ds-online-pop { position: fixed; z-index: var(--z-header-pop); width: 440px; max-width: calc(100vw - 32px); max-height: min(70vh, 520px); overflow-y: auto; padding: var(--menu-pad); background: var(--bg-white); border-radius: var(--radius-dialog); box-shadow: var(--shadow-popover); }
.ds-online-pop__title { margin: 0; padding: 4px var(--menu-item-px) 8px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ds-online-pop__title span { font-weight: var(--fw-regular); color: var(--text-secondary); }
.ds-online-pop__tabs { margin: 0 var(--menu-item-px) 4px; border-bottom: 1px solid var(--stroke-neutral-light); }
.ds-online-pop__tab-n { margin-left: 4px; color: var(--text-secondary); font-weight: var(--fw-regular); }
.ds-online-pop__empty, .ds-online-pop__note { margin: 0; padding: 4px var(--menu-item-px) 8px; font-size: var(--text-body); color: var(--text-secondary); }
.ds-online-pop__item { display: flex; align-items: flex-start; gap: 10px; padding: 8px var(--menu-item-px); border-radius: var(--menu-radius); }
.ds-online-pop__item:hover { background: var(--bg-brand-light); }
.ds-online-pop__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.ds-online-pop__name { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ds-online-pop__sub { font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ds-online-pop__dev { display: flex; align-items: flex-start; gap: 4px; min-width: 0; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); overflow-wrap: anywhere; }   /* dòng phiên dài (máy · IP · giờ · trang) → xuống dòng, không cắt */
.ds-online-pop__dev .ti { font-size: 14px; flex-shrink: 0; height: var(--text-body-lh); color: var(--icon-neutral); }

/* Header có màu nền: chip kính mờ, chữ trắng — chấm xanh giữ màu, viền trắng cho nổi */
:root:not([data-mode="light"]) .ds-online { background: rgba(255, 255, 255, 0.14); color: #fff; }
:root:not([data-mode="light"]) .ds-online:hover { filter: none; background: rgba(255, 255, 255, 0.22); }
:root:not([data-mode="light"]) .ds-online .ds-dot { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.85); animation: none; }
:root:not([data-mode="light"]) .ds-online__part--guest { color: rgba(255, 255, 255, 0.8); }
/* Màn hẹp: chỉ chấm + số (header không đủ chỗ), bấm vẫn xổ danh sách đầy đủ */
@media (max-width: 640px) { .ds-online { gap: 8px; padding: 0 8px; } .ds-online__label, .ds-online__part--guest, .ds-online .ti { display: none; } }
</style>
