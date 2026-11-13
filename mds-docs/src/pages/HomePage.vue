<template>
  <div class="ds-home">
    <section class="ds-hero">
      <div class="ds-hero__kicker">Hệ thống quy chuẩn thiết kế MISA · Version 2.0</div>
      <h1 class="ds-hero__title">MISA Design System — Webapps</h1>
      <p class="ds-hero__lead">Quy chuẩn, nguyên tắc và ví dụ mẫu cho các ứng dụng web của MISA. Mỗi trang thành phần có mô tả cách dùng, quy tắc, hình minh họa và ví dụ chạy thật bằng bộ control <b>mds-ui</b>.</p>
      <div class="ds-hero__actions">
        <RouterLink v-if="first" :to="'/' + first.slug" class="btn btn--primary">Bắt đầu đọc<TIcon name="arrow-right" /></RouterLink>
        <a href="https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0" target="_blank" rel="noopener" class="btn btn--outline btn--neutral"><TIcon name="external-link" />Bộ component trên Figma</a>
        <a :href="DEMO_APP_URL" target="_blank" rel="noopener" class="btn btn--outline btn--neutral"><TIcon name="player-play" />Xem app mẫu (Chấm điểm — dùng thử)</a>
      </div>
    </section>
    <!-- Liên kết hữu ích (nhập ở Quản trị › Liên kết hữu ích): nhiều link → lọc theo nhóm (Segmented) + tìm nhanh · thẻ gọn 4 cột · mặc định 8 thẻ, “Xem tất cả” bung hết -->
    <section v-if="links.length || state.me.canEdit" class="ds-home__group ds-links">
      <div class="ds-links__head">
        <h2 class="ds-home__title">Liên kết hữu ích <span v-if="links.length" class="ds-home__count" :aria-label="`${links.length} liên kết`">{{ links.length }}</span></h2>
        <span class="ds-links__sp" />
        <AppSearchbox v-if="links.length > LIMIT" v-model="lq" placeholder="Tìm liên kết" :width="240" />
        <RouterLink v-if="state.me.canEdit" to="/quan-tri?tab=links" class="btn btn--text"><TIcon name="settings" />Quản lý liên kết</RouterLink>
      </div>
      <div v-if="linkGroups.length > 1" class="ds-links__groups"><AppSegmented v-model="lg" :options="groupOpts" aria-label="Nhóm liên kết" /></div>
      <div v-if="shownLinks.length" class="ds-links__grid">
        <a v-for="l in shownLinks" :key="l.id" :href="l.url" target="_blank" rel="noopener" class="ds-link">
          <span class="ds-card__icon ds-link__icon" :class="`ds-card__icon--${toneOfGroup(l.group)}`" aria-hidden="true"><TIcon :name="iconOfLink(l)" /></span>
          <span class="ds-link__body">
            <span class="ds-link__title">{{ l.title }}</span>
            <span v-if="l.desc" class="ds-link__desc">{{ l.desc }}</span>
            <span class="ds-link__host"><TIcon name="external-link" />{{ hostOf(l.url) }}</span>
          </span>
        </a>
      </div>
      <p v-else-if="links.length" class="ds-muted">Không tìm thấy liên kết khớp “{{ lq }}”.</p>
      <p v-else class="ds-muted">Chưa có liên kết nào — bấm “Quản lý liên kết” để thêm các link hướng dẫn hay dùng.</p>
      <button v-if="filteredLinks.length > LIMIT" type="button" class="btn btn--text ds-links__more" @click="allLinks = !allLinks">
        {{ allLinks ? 'Thu gọn' : `Xem tất cả (${filteredLinks.length})` }}<TIcon :name="allLinks ? 'chevron-up' : 'chevron-down'" />
      </button>
    </section>
    <section v-for="(g, gi) in groups" :key="g.group" class="ds-home__group">
      <h2 class="ds-home__title">{{ g.group }} <span class="ds-home__count" :aria-label="`${g.pages.length} trang`">{{ g.pages.length }}</span></h2>
      <div class="ds-cards">
        <RouterLink v-for="(p, i) in g.pages" :key="p.slug" :to="'/' + p.slug" class="ds-card">
          <!-- Icon trang trí: mỗi trang 1 icon riêng, nền nhạt đổi màu lần lượt cho sinh động (thuần trang trí → aria-hidden) -->
          <span class="ds-card__icon" :class="`ds-card__icon--${toneOf(gi, i)}`" aria-hidden="true"><TIcon :name="iconOf(p)" /></span>
          <span class="ds-card__title">{{ p.title }}</span>
          <span class="ds-card__desc">{{ plain(p.summary) || 'Xem chi tiết quy chuẩn' }}</span>
        </RouterLink>
      </div>
    </section>
    <div v-if="!state.loaded" class="ds-loading"><i /><i /><i /><i class="ds-loading__img" /></div>
  </div>
</template>

<script setup>
import { DEMO_APP_URL } from '../demoApp.js'
import { ref, computed, onMounted, watch } from 'vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
import { matchText } from '@mds/utils/search.js'
import TIcon from '@mds/components/TIcon.vue'
import { setPageTitle } from '@mds/utils/docTitle.js'
import { state, navGroups, api } from '../store.js'

const groups = computed(() => navGroups())
const first = computed(() => groups.value[0]?.pages[0])
// Mô tả ngắn: bỏ cú pháp Markdown (link, in đậm)
const plain = s => String(s || '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '')
/* Icon theo trang (trang mới tạo trong CMS chưa có trong bảng → icon tài liệu) */
const PAGE_ICONS = {
  'general-design-rules': 'compass', 'general-usability-requirements': 'hand-click', 'display-requirement': 'device-desktop', 'interaction-states': 'pointer',
  color: 'palette', icons: 'icons', layout: 'layout', typography: 'typography',
  announcement: 'speakerphone', contents: 'file-text', 'data-visualization': 'chart-bar', dialog: 'app-window', 'empty-state': 'box',
  'error-page': 'alert-triangle', 'leave-page-warning': 'door-exit', loading: 'loader',
  button: 'click', checkbox: 'checkbox', combobox: 'selector', contextmenu: 'menu-2', datetimepicker: 'calendar', dropdownlist: 'list',
  radiobutton: 'circle-dot', segmented: 'toggle-left', tabs: 'folders', 'text-field': 'forms', tree: 'binary-tree',
  avatar: 'user-circle', 'data-table': 'table', 'hearder-bar': 'layout-navbar', popup: 'picture-in-picture', sidebar: 'layout-sidebar', 'search-box': 'search', textarea: 'align-left', 'rich-text-editor': 'file-text',
  'advertising-cross-selling': 'ad', 'browser-title': 'browser', 'chatbox-ai-agent': 'message-chatbot', copyright: 'copyright', email: 'mail',
  'general-icons': 'category', language: 'language', 'number-separation-rules': 'number-123', onboarding: 'rocket', 'onboarding-uiux': 'school', 'design-tokens': 'palette', 'checklist-pd': 'palette', 'checklist-dev': 'code', 'checklist-qc': 'clipboard-check', tag: 'tag', accordion: 'list', 'shortcut-key': 'keyboard', 'spelling-rules': 'abc',
}
const iconOf = p => PAGE_ICONS[p.slug] || 'file-text'
// Màu nền nhạt lần lượt trong nhóm; mỗi nhóm bắt đầu lệch 1 màu → 2 nhóm liền nhau không trùng thứ tự
const TONES = ['brand', 'success', 'warning', 'ai', 'danger', 'info']
const toneOf = (gi, i) => TONES[(gi + i) % TONES.length]
/* ── Liên kết hữu ích ── */
const LIMIT = 8
const links = ref([]), lq = ref(''), lg = ref(''), allLinks = ref(false)
const linkGroups = computed(() => [...new Set(links.value.map(l => l.group || 'Khác'))])
const groupOpts = computed(() => [{ value: '', label: `Tất cả (${links.value.length})` }, ...linkGroups.value.map(g => ({ value: g, label: `${g} (${links.value.filter(l => (l.group || 'Khác') === g).length})` }))])
const filteredLinks = computed(() => links.value.filter(l => (!lg.value || (l.group || 'Khác') === lg.value) && matchText([l.title, l.desc, l.url], lq.value)))
const shownLinks = computed(() => (allLinks.value || lq.value ? filteredLinks.value : filteredLinks.value.slice(0, LIMIT)))
watch([lg, lq], () => { allLinks.value = false })
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u } }
const iconOfLink = l => { const h = hostOf(l.url); return /figma\.com/.test(h) ? 'brand-figma' : /youtu/.test(h) ? 'brand-youtube' : /facebook/.test(h) ? 'brand-facebook' : /docs\.google|drive\.google/.test(h) ? 'file-text' : 'link' }
const toneOfGroup = g => TONES[Math.max(0, linkGroups.value.indexOf(g || 'Khác')) % TONES.length]
async function loadLinks() { try { links.value = (await api('/links')).links || [] } catch { links.value = [] } }
onMounted(() => { setPageTitle([]); loadLinks() })
</script>
