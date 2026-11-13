<template>
  <!-- Popup kết quả tìm kiếm của MỘT phân hệ (mở từ “Xem thêm” trong ô tìm kiếm toàn cục của Global header):
       Popup chuẩn MDS (bo 12 · bóng Bottom 12 · header H2 + ✕, không gạch dưới) · ô tìm kiếm điền sẵn từ khóa (sửa được → tìm lại trong phân hệ này) ·
       “N kết quả” · danh sách giãn hết chiều cao popup, cuộn trong khung (quy chuẩn popup chứa danh sách). Esc / ✕ / bấm nền tối đóng. -->
  <Teleport to="body">
    <div class="srd-overlay" @mousedown.self="emit('close')">
      <!-- Esc đóng popup NGAY, kể cả khi đang gõ trong ô tìm (ô tìm kiếm chuẩn mặc định dùng Esc để xóa chữ → chặn ở pha capture) -->
        <div class="srd" role="dialog" aria-modal="true" :aria-label="heading" @keydown.esc.capture.stop.prevent="emit('close')">
        <div class="form-header">
          <h2 class="form-header__title">{{ heading }}</h2>
          <button type="button" class="btn-icon" aria-label="Đóng (Esc)" v-tip="'Đóng (Esc)'" @click="emit('close')"><TIcon name="x" /></button>
        </div>
        <div class="srd__body">
          <AppSearchbox ref="boxEl" v-model="q" :placeholder="placeholder" :clearable="false" @update:model-value="onType" />
          <p class="srd__count" role="status">
            <span v-if="busy" class="srd__loading"><span class="spinner spinner--sm" aria-hidden="true" />Đang tìm…</span>
            <template v-else><b>{{ fmtNum(total ?? items.length) }}</b> kết quả</template>
          </p>
          <div class="srd__list" role="list">
            <template v-if="!busy">
              <button v-for="it in items" :key="it.id" type="button" class="srd__item" role="listitem" @click="emit('select', it)">
                <AppAvatar v-if="it.avatar !== false && (it.avatar || it.name)" :src="it.avatar || ''" :name="it.name" :size="32" />
                <span class="srd__text">
                  <span class="srd__name"><template v-for="(p, i) in highlightParts(it.name, q)" :key="i"><mark v-if="p.m" class="gs-hl">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></span>
                  <span v-if="it.subtitle || it.meta" class="srd__sub"><template v-for="(p, i) in highlightParts([it.subtitle, it.meta].filter(Boolean).join(' · '), q)" :key="i"><mark v-if="p.m" class="gs-hl">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></span>
                </span>
              </button>
              <p v-if="!items.length" class="srd__empty">Không tìm thấy kết quả cho “{{ q.trim() }}” trong {{ groupTitle }}</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import TIcon from './TIcon.vue'
import AppSearchbox from './AppSearchbox.vue'
import AppAvatar from './AppAvatar.vue'
import { vTip } from '../utils/tooltip.js'
import { fmtNum } from '../utils/number.js'
import { highlightParts } from '../utils/search.js'
import { useEscClose } from '../utils/escStack.js'

const props = defineProps({
  /** Tên phân hệ đang xem (VD “Hợp đồng”) */
  groupTitle: { type: String, default: '' },
  /** Từ khóa ban đầu (điền sẵn vào ô) */
  keyword:    { type: String, default: '' },
  /** Toàn bộ kết quả của phân hệ này: [{ id, name, subtitle, meta, avatar }] */
  items:      { type: Array,  default: () => [] },
  total:      { type: Number, default: null },
  loading:    { type: Boolean, default: false },
  placeholder: { type: String, default: 'Tìm kiếm' },
  debounce:   { type: Number, default: 300 },
})
const emit = defineEmits(['close', 'search', 'select'])
const q = ref(props.keyword), waiting = ref(false), boxEl = ref(null)
const busy = computed(() => waiting.value || props.loading)
const heading = computed(() => (props.groupTitle ? `Tìm kiếm trong ${props.groupTitle}` : 'Tìm kiếm'))
let timer = 0
function onType(v) {
  clearTimeout(timer)
  if (!String(v).trim()) { waiting.value = false; emit('search', ''); return }
  waiting.value = true   // spinner ngay khi gõ
  timer = setTimeout(() => { waiting.value = false; emit('search', String(v).trim()) }, props.debounce)
}
useEscClose(() => emit('close'))
onMounted(() => nextTick(() => boxEl.value?.focus()))
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style>
.srd-overlay { position: fixed; inset: 0; z-index: var(--z-header-pop, 9600); display: flex; align-items: center; justify-content: center; padding: var(--page-gutter, 16px); background: var(--bg-overlay); }
/* Rộng 960 · cao 640 (hoặc vừa màn hình) — cố định chiều cao để danh sách giãn hết, ít kết quả thì khoảng trống nằm TRONG khung */
.srd { display: flex; flex-direction: column; width: 960px; max-width: 100%; height: 640px; max-height: 100%; overflow: hidden; background: var(--bg-white); border-radius: var(--radius-dialog); box-shadow: var(--shadow-dialog); font-family: var(--font-family); color: var(--text-primary); }
.srd__body { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 16px; padding: 0 24px 24px; }
.srd__count { margin: 0; display: flex; align-items: center; min-height: var(--text-body-lh); font-size: var(--text-body); line-height: var(--text-body-lh); }
.srd__count b { margin-right: 4px; font-size: var(--text-h3); font-weight: var(--fw-semibold); }
.srd__loading { display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); }
.srd__list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; border-top: 1px solid var(--stroke-neutral-light); }
.srd__item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px; border: none; border-bottom: 1px solid var(--stroke-neutral-light); background: none; text-align: left; font: inherit; color: inherit; cursor: pointer; }
.srd__item:hover { background: var(--bg-brand-light); }
.srd__item:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
.srd__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.srd__name { font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); overflow-wrap: anywhere; }
.srd__sub { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); overflow-wrap: anywhere; }
.srd mark { padding: 0; background: none; color: var(--text-brand); font-weight: var(--fw-semibold); }   /* phần khớp từ khóa */
.srd__empty { margin: 0; padding: 16px 8px; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); overflow-wrap: anywhere; }
</style>
