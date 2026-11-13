<template>
  <DialogShell title="Đồng bộ từ Google Sheet" :width="720" @close="$emit('close')">
    <div class="ss">
      <p class="ss__src">
        <TIcon name="file-spreadsheet" />
        <span>Vòng lặp <strong>{{ iteration.name }}</strong> ·
          <a :href="iteration.sheetUrl" target="_blank" rel="noopener">Mở Google Sheet<TIcon name="external-link" /></a></span>
      </p>

      <p v-if="loading" class="ss__status"><TIcon name="loader-2" class="ss__spin" />Đang đọc dữ liệu từ Google Sheet…</p>
      <p v-else-if="error" class="ss__msg ss__msg--error"><TIcon name="circle-x" /><span>{{ error }}</span></p>

      <template v-else-if="plan">
        <!-- Tóm tắt những gì sẽ thay đổi (chưa ghi gì) -->
        <div class="ss__sum">
          <AppTag :label="`${plan.total} dòng trên Sheet`" color="neutral" />
          <AppTag :label="`${plan.add.length} việc mới`" :color="plan.add.length ? 'success' : 'neutral'" />
          <AppTag :label="`${plan.update.length} việc có thay đổi`" :color="plan.update.length ? 'brand' : 'neutral'" />
          <AppTag v-if="plan.errors.length" :label="`${plan.errors.length} dòng lỗi — bỏ qua`" color="danger" />
          <AppTag v-if="plan.skipped.length" :label="`${plan.skipped.length} bỏ qua`" color="warning" />
        </div>
        <p v-if="plan.missing" class="ss__note"><TIcon name="info-circle" />{{ plan.missing }} việc trong app không có trên Sheet — giữ nguyên, không xóa.</p>

        <!-- Cách áp dụng -->
        <div class="ss__modes" role="radiogroup" aria-label="Cách đồng bộ">
          <label v-for="m in MODES" :key="m.value" class="ss__mode" :class="{ 'ss__mode--on': mode === m.value }">
            <input v-model="mode" type="radio" name="ss-mode" :value="m.value" />
            <span class="ss__mode-text">
              <span class="ss__mode-title">{{ m.label }}<span class="ss__mode-count">{{ m.count(plan) }}</span></span>
              <span class="ss__mode-desc">{{ m.desc }}</span>
            </span>
          </label>
        </div>

        <!-- Chi tiết -->
        <div class="ss__detail">
          <details v-if="plan.add.length" open>
            <summary>Việc mới sẽ thêm ({{ plan.add.length }})</summary>
            <ul><li v-for="a in plan.add" :key="a.row"><span class="ss__lbl">{{ a.label }}</span>{{ a.content }}</li></ul>
          </details>
          <details v-if="plan.update.length" :open="mode === 'merge'">
            <summary>Việc có thay đổi so với app ({{ plan.update.length }}){{ mode === 'add' ? ' — sẽ không cập nhật' : '' }}</summary>
            <ul><li v-for="u in plan.update" :key="u.row"><span class="ss__lbl">{{ u.label }}</span>{{ u.content }}
              <span class="ss__fields">đổi: {{ u.fields.join(', ') }}</span></li></ul>
          </details>
          <details v-if="plan.errors.length">
            <summary class="ss__sum-err">Dòng lỗi — bỏ qua ({{ plan.errors.length }})</summary>
            <ul><li v-for="e in plan.errors" :key="e.row"><span class="ss__lbl">{{ e.label }}</span>{{ e.reason }}</li></ul>
          </details>
          <details v-if="plan.skipped.length">
            <summary>Bỏ qua ({{ plan.skipped.length }})</summary>
            <ul><li v-for="k in plan.skipped" :key="k.row"><span class="ss__lbl">{{ k.label }}</span>{{ k.reason }}</li></ul>
          </details>
        </div>
      </template>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button v-if="error" class="btn btn--outline btn--neutral" @click="load"><TIcon name="refresh" />Thử lại</button>
      <button class="btn btn--primary" :disabled="!plan || busy || !willChange" @click="apply">
        <TIcon name="refresh" />{{ busy ? 'Đang đồng bộ…' : willChange ? `Đồng bộ ${willChange} việc` : 'Không có gì thay đổi' }}
      </button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DialogShell from './DialogShell.vue'
import TIcon  from '@mds/components/TIcon.vue'
import AppTag from '@mds/components/AppTag.vue'
import { toast } from '@mds/utils/toast.js'
import { useDocTitle } from '@mds/utils/docTitle.js'
import { api } from '../store/api.js'
import { iterationSaved, loadFromServer } from '../store/db.js'

/* Bấm Đồng bộ: đọc Sheet → xem trước (chưa ghi) → chọn cách áp dụng → đồng bộ. Cách chọn được nhớ cho lần tự đồng bộ hằng ngày */
const props = defineProps({ iteration: { type: Object, required: true } })
const emit = defineEmits(['close'])
useDocTitle(() => ['Đồng bộ Google Sheet', props.iteration.name])

const MODES = [
  { value: 'merge', label: 'Thêm mới và cập nhật theo Sheet (ghi đè)', count: p => `+${p.add.length} · ${p.update.length} cập nhật`,
    desc: 'Ô có giá trị trên Sheet ghi đè vào app. Ô trống trên Sheet không xóa dữ liệu trong app; đánh giá đã nhập trong app (mức hài lòng, lý do, điểm tay) giữ nguyên.' },
  { value: 'add', label: 'Chỉ thêm việc mới', count: p => `+${p.add.length}`,
    desc: 'Chỉ thêm các dòng chưa có trong vòng lặp; không đụng tới việc đã có.' },
]
const loading = ref(true), busy = ref(false), error = ref(''), plan = ref(null)
const mode = ref(props.iteration.sheetMode ?? 'merge')
const willChange = computed(() => (plan.value ? plan.value.add.length + (mode.value === 'merge' ? plan.value.update.length : 0) : 0))

async function load() {
  loading.value = true; error.value = ''
  try {
    await iterationSaved(props.iteration.id)                     // vòng lặp vừa tạo / vừa gắn link → chờ lưu xong
    const r = await api.post(`/api/iterations/${props.iteration.id}/sheet/preview`, {})
    plan.value = r.plan
    if (!props.iteration.sheetMode) mode.value = r.mode
  } catch (e) { error.value = e.message }
  finally { loading.value = false }
}
onMounted(load)

async function apply() {
  busy.value = true
  try {
    const { result: r } = await api.post(`/api/iterations/${props.iteration.id}/sheet/apply`, { mode: mode.value })
    await loadFromServer().catch(() => {})                         // lấy ngay việc vừa thêm / cập nhật (không chờ realtime)
    const parts = [r.added && `thêm ${r.added}`, r.updated && `cập nhật ${r.updated}`].filter(Boolean)
    toast.success(parts.length ? `Đã đồng bộ: ${parts.join(', ')} công việc` : 'Đã đồng bộ — không có thay đổi')
    if (r.failed?.length) toast.error(`${r.failed.length} việc không ghi được: ${r.failed[0].label} — ${r.failed[0].reason}`)
    emit('close')
  } catch (e) { error.value = e.message; plan.value = null }
  finally { busy.value = false }
}
</script>

<style scoped>
.ss { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.ss__src { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.ss__src strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.ss__src a { display: inline-flex; align-items: center; gap: 2px; color: var(--text-brand); text-decoration: none; }
.ss__src a:hover { text-decoration: underline; }
.ss__src .ti { font-size: 16px; flex-shrink: 0; }
.ss__status, .ss__note { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.ss__note .ti { font-size: 16px; flex-shrink: 0; }
.ss__spin { animation: ss-spin 0.9s linear infinite; }
@keyframes ss-spin { to { transform: rotate(360deg); } }
.ss__msg { /* box thấp 1–2 dòng → icon căn giữa dọc (skill: Box / card thấp) */ display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); font-size: var(--text-body); line-height: var(--text-body-lh); }
.ss__msg--error { background: var(--bg-danger-light); color: var(--text-danger); }
.ss__msg .ti { font-size: 16px; flex-shrink: 0; }
.ss__sum { display: flex; flex-wrap: wrap; gap: 6px; }
.ss__modes { display: flex; flex-direction: column; gap: 8px; }
.ss__mode { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); cursor: pointer; }
.ss__mode--on { border-color: var(--stroke-brand); background: var(--bg-brand-light); }
.ss__mode input { margin: 3px 0 0; accent-color: var(--bg-brand); flex-shrink: 0; cursor: pointer; }
.ss__mode-text { display: flex; flex-direction: column; gap: 2px; }
.ss__mode-title { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ss__mode-count { font-weight: var(--fw-regular); color: var(--text-secondary); }
.ss__mode-desc { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.ss__detail { display: flex; flex-direction: column; gap: 6px; max-height: 280px; overflow: auto; }
.ss__detail summary { cursor: pointer; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); padding: 4px 0; }
.ss__detail .ss__sum-err { color: var(--text-danger); }
.ss__detail ul { margin: 0; padding: 0 0 4px 18px; display: flex; flex-direction: column; gap: 4px; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.ss__lbl { margin-right: 6px; color: var(--text-secondary); }
.ss__fields { margin-left: 6px; font-size: var(--text-body); color: var(--text-brand); }
</style>
