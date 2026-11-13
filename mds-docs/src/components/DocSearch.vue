<template>
  <div class="ds-search" :class="{ 'ds-search--open': mobileOpen }">
    <button type="button" class="btn-icon-white ds-search__toggle" aria-label="Tìm kiếm tài liệu" @click="openMobile"><TIcon name="search" /></button>
    <label ref="boxEl" class="search-box-header ds-search__box">
      <TIcon name="search" />
      <input ref="inputEl" :value="q" type="search" @input="q = $event.target.value" placeholder="Tìm trong tài liệu ( / )" autocomplete="off"
        @focus="onFocus" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="e => !e.isComposing && go(results[active])" @keydown.esc="close" />
      <button v-if="mobileOpen" type="button" class="btn-icon-white ds-search__close" aria-label="Đóng tìm kiếm" @click="close"><TIcon name="x" /></button>
    </label>
    <Teleport to="body">
      <div v-if="open && q.trim()" ref="popEl" class="ds-search__pop" :style="popStyle" @mousedown.prevent>
        <!-- Gõ là hiện NGAY: kết quả theo tiêu đề / tóm tắt (danh sách trang có sẵn ở máy) · chỉ mục toàn văn đang về → dòng spinner nhỏ, kết quả tự bổ sung
             “Không tìm thấy” chỉ khi đã tìm xong toàn bộ (không thay danh sách bằng chữ “Đang tải…”) -->
        <div v-if="index && !results.length" class="ds-search__empty">Không tìm thấy trang nào có “{{ q.trim() }}”</div>
        <button v-for="(r, i) in results" :key="r.slug" type="button" class="ds-search__item" :class="{ 'ds-search__item--on': i === active }"
          @mouseenter="active = i" @click="go(r)">
          <span class="ds-search__title">{{ r.title }} <span class="ds-search__group">{{ r.group }}</span></span>
          <span v-if="r.snippet" class="ds-search__snippet">{{ r.snippet }}</span>
        </button>
        <div v-if="!index" class="ds-search__loading" role="status"><span class="spinner spinner--sm" />{{ results.length ? 'Đang tìm thêm trong nội dung trang…' : 'Đang tìm trong nội dung trang…' }}</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import { normVi } from '@mds/utils/search.js'
import { api, state } from '../store.js'

const router = useRouter()
const q = ref(''), open = ref(false), active = ref(0), mobileOpen = ref(false)
const index = ref(null), boxEl = ref(null), inputEl = ref(null), popEl = ref(null)
const rect = ref(null)

/* Chỉ mục toàn văn: tải TRƯỚC khi trình duyệt rảnh (không đợi bấm vào ô) · bấm vào ô mà chưa có thì tải ngay */
let loading = null
function loadIndex() {
  return (loading ||= api('/search')
    .then(d => { index.value = d.items.map(it => ({ ...it, nTitle: normVi(it.title), nText: normVi(`${it.summary} ${it.text}`) })) })
    .catch(() => { index.value = [] }))
}
async function onFocus() { open.value = true; measure(); loadIndex() }
/* Nguồn tức thì khi chỉ mục chưa về: danh sách trang đã có (menu trái) — tiêu đề + tóm tắt */
const quick = computed(() => state.pages.map(p => ({ slug: p.slug, title: p.title, group: p.group, summary: p.summary || '', text: '', nTitle: normVi(p.title), nText: normVi(p.summary || '') })))
const results = computed(() => {
  const words = normVi(q.value).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return (index.value || quick.value)
    .map(it => {
      if (!words.every(w => it.nTitle.includes(w) || it.nText.includes(w))) return null
      // Điểm: cả cụm có trong tiêu đề > cả cụm có trong nội dung (càng nhiều lần càng cao) > từng từ có trong tiêu đề
      const phrase = words.join(' ')
      const hits = Math.min(10, it.nText.split(phrase).length - 1)
      const score = (it.nTitle.includes(phrase) ? 60 : 0) + (it.nTitle.startsWith(phrase) ? 20 : 0) + hits * 4
        + words.reduce((s, w) => s + (it.nTitle.includes(w) ? 3 : 0), 0)
      // Đoạn trích quanh từ khớp đầu tiên trong nội dung (vị trí trên chữ bỏ dấu = vị trí trên chữ gốc)
      const raw = `${it.summary} ${it.text}`.trim()
      const at = normVi(raw).indexOf(words[0])
      const snippet = at < 0 ? it.summary.slice(0, 90) : (at > 30 ? '…' : '') + raw.slice(Math.max(0, at - 30), at + 70).trim() + '…'
      return { ...it, score, snippet }
    })
    .filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8)
})
function move(d) { if (results.value.length) active.value = (active.value + d + results.value.length) % results.value.length }
function go(r) {
  if (!r) return
  router.push('/' + r.slug)
  q.value = ''; close()
}
function close() { open.value = false; mobileOpen.value = false; active.value = 0; inputEl.value?.blur() }
async function openMobile() { mobileOpen.value = true; await nextTick(); inputEl.value?.focus() }

function measure() { rect.value = boxEl.value?.getBoundingClientRect() ?? null }
const popStyle = computed(() => {
  const r = rect.value; if (!r) return {}
  const w = Math.min(Math.max(r.width, 420), window.innerWidth - 16)
  return { top: `${r.bottom + 4}px`, left: `${Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8))}px`, width: `${w}px` }
})
function onDoc(e) { if (open.value && !boxEl.value?.contains(e.target) && !popEl.value?.contains(e.target)) close() }
function onKey(e) {
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) { e.preventDefault(); inputEl.value?.focus() }
}
onMounted(() => {
  ;(window.requestIdleCallback || (f => setTimeout(f, 1200)))(() => loadIndex())   // tải trước chỉ mục khi rảnh
  document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey); window.addEventListener('resize', measure) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', measure) })
</script>
