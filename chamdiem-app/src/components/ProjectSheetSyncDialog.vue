<template>
  <DialogShell title="Đồng bộ dự án từ Google Sheet" :width="860" @close="$emit('close')">
    <div class="pss">
      <p class="pss__src">
        <TIcon name="file-spreadsheet" />
        <span>Dự án <strong>{{ project.name }}</strong> · mỗi trang tính = 1 vòng lặp ·
          <a :href="project.sheetUrl" target="_blank" rel="noopener">Mở Google Sheet<TIcon name="external-link" /></a></span>
      </p>

      <p v-if="loading" class="pss__status"><TIcon name="loader-2" class="pss__spin" />Đang đọc các trang tính từ Google Sheet…</p>
      <p v-else-if="error" class="pss__msg"><TIcon name="circle-x" /><span>{{ error }}</span></p>

      <template v-else-if="tabs.length">
        <!-- Từng trang tính: chọn đồng bộ / vòng lặp khớp hoặc tạo mới (ngày sửa được) / số việc thay đổi -->
        <div class="pss__table">
          <div class="pss__row pss__row--head">
            <span><AppCheckbox :model-value="allPicked" :indeterminate="pickedCount > 0 && !allPicked" @update:model-value="pickAll" /></span>
            <span>Trang tính</span><span>Vòng lặp</span><span>Thay đổi</span>
          </div>
          <div v-for="t in tabs" :key="t.gid" class="pss__row" :class="{ 'pss__row--off': !usable(t) }">
            <span><AppCheckbox v-if="usable(t)" v-model="t.picked" /></span>
            <span class="pss__tab">{{ t.name }}</span>
            <span class="pss__iter">
              <template v-if="t.status === 'existing'"><AppTag label="Có sẵn" color="success" />{{ t.iterationName }}</template>
              <template v-else-if="t.status === 'new'">
                <span class="pss__new"><AppTag label="Tạo vòng lặp mới" color="brand" /></span>
                <span class="pss__dates">
                  <AppDatebox v-model="t.startDate" :disabled="!t.picked" />
                  <span>–</span>
                  <AppDatebox v-model="t.endDate" :disabled="!t.picked" />
                </span>
              </template>
              <template v-else-if="t.status === 'own'"><AppTag label="Bỏ qua" color="neutral" />Vòng lặp “{{ t.iterationName }}” đã gắn link Sheet riêng</template>
              <template v-else><AppTag :label="t.status === 'error' ? 'Lỗi đọc' : 'Bỏ qua'" :color="t.status === 'error' ? 'danger' : 'neutral'" /><span class="pss__reason">{{ shortReason(t) }}</span></template>
            </span>
            <span class="pss__chg">
              <template v-if="t.plan">
                <span v-if="t.plan.add.length" class="pss__n pss__n--add">+{{ t.plan.add.length }} mới</span>
                <span v-if="t.newMembers?.length" class="pss__n pss__n--join" v-tip="'Thêm vào dự án: ' + t.newMembers.map(m => m.name).join(', ')">+{{ t.newMembers.length }} thành viên</span>
                <span v-if="t.plan.update.length" class="pss__n" :class="mode === 'merge' ? 'pss__n--upd' : 'pss__n--off'">{{ t.plan.update.length }} cập nhật</span>
                <span v-if="t.plan.errors.length" class="pss__n pss__n--err" v-tip="t.plan.errors.slice(0, 8).map(e => `${e.label}: ${e.reason}`).join('\n')">{{ t.plan.errors.length }} lỗi</span>
                <span v-if="!t.plan.add.length && !t.plan.update.length && !t.plan.errors.length" class="pss__n pss__n--off">Không đổi</span>
              </template>
            </span>
          </div>
        </div>
        <!-- Mã nhân viên trong Sheet trùng người dùng chưa thuộc dự án → tự thêm làm Thành viên -->
        <p v-if="joining.length" class="pss__join">
          <TIcon name="user-plus" />
          <span>Sẽ tự thêm <strong>{{ joining.length }} người</strong> vào dự án (vai trò Thành viên) vì mã nhân viên trong Sheet trùng người dùng trong hệ thống:
            {{ joining.map(m => `${m.name} (${m.code} · ${m.role})`).join(', ') }}</span>
        </p>
        <p v-if="more" class="pss__note"><TIcon name="info-circle" />File còn {{ more }} trang tính nữa — chỉ đọc 60 trang đầu.</p>

        <!-- Cách áp dụng (như đồng bộ 1 vòng lặp) -->
        <div class="pss__modes" role="radiogroup" aria-label="Cách đồng bộ">
          <label v-for="m in MODES" :key="m.value" class="pss__mode" :class="{ 'pss__mode--on': mode === m.value }">
            <input v-model="mode" type="radio" name="pss-mode" :value="m.value" />
            <span><span class="pss__mode-title">{{ m.label }}</span><span class="pss__mode-desc">{{ m.desc }}</span></span>
          </label>
        </div>
        <p v-if="dateError" class="pss__msg"><TIcon name="circle-x" /><span>{{ dateError }}</span></p>
      </template>
      <p v-else class="pss__status">File không có trang tính nào.</p>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button v-if="error" class="btn btn--outline btn--neutral" @click="load"><TIcon name="refresh" />Thử lại</button>
      <button class="btn btn--primary" :disabled="loading || busy || !!error || !pickedCount" @click="apply">
        <TIcon name="refresh" />{{ busy ? 'Đang đồng bộ…' : `Đồng bộ ${pickedCount} trang tính` }}
      </button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DialogShell from './DialogShell.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTag      from '@mds/components/AppTag.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import AppDatebox  from '@mds/components/AppDatebox.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { useDocTitle } from '@mds/utils/docTitle.js'
import { api } from '../store/api.js'
import { projectSaved, loadFromServer } from '../store/db.js'

/* Cả dự án 1 file Google Sheet: đọc mọi trang tính → xem trước theo từng vòng lặp → chọn trang + cách áp dụng → đồng bộ */
const props = defineProps({ project: { type: Object, required: true } })
const emit = defineEmits(['close'])
useDocTitle(() => ['Đồng bộ Google Sheet', props.project.name])

const MODES = [
  { value: 'merge', label: 'Thêm mới và cập nhật theo Sheet (ghi đè)', desc: 'Ô có giá trị trên Sheet ghi đè vào app; ô trống không xóa dữ liệu trong app; đánh giá đã nhập trong app giữ nguyên.' },
  { value: 'add',   label: 'Chỉ thêm việc mới', desc: 'Chỉ thêm các dòng chưa có trong vòng lặp; không đụng tới việc đã có.' },
]
const loading = ref(true), busy = ref(false), error = ref(''), tabs = ref([]), more = ref(0)
const mode = ref(props.project.sheetMode ?? 'merge')
const usable = t => ['existing', 'new'].includes(t.status)
const pickedCount = computed(() => tabs.value.filter(t => usable(t) && t.picked).length)
const allPicked = computed(() => tabs.value.some(usable) && tabs.value.filter(usable).every(t => t.picked))
// Người sẽ được thêm vào dự án — chỉ tính các trang tính đang chọn
const joining = computed(() => { const m = new Map(); tabs.value.filter(t => usable(t) && t.picked).forEach(t => (t.newMembers ?? []).forEach(x => m.set(x.id, x))); return [...m.values()] })
const pickAll = v => tabs.value.filter(usable).forEach(t => { t.picked = v })
const shortReason = t => String(t.reason ?? '').replace(/ — dùng đúng template nhập công việc$/, '') || 'Không đúng template'
const dateError = computed(() => {
  const bad = tabs.value.find(t => t.status === 'new' && t.picked && (!t.startDate || !t.endDate || t.endDate < t.startDate))
  return bad ? `Trang tính “${bad.name}”: chọn ngày bắt đầu / kết thúc hợp lệ cho vòng lặp mới` : ''
})

async function load() {
  loading.value = true; error.value = ''
  try {
    await projectSaved(props.project.id)                       // vừa gắn link → chờ lưu xong
    const r = await api.post(`/api/projects/${props.project.id}/sheet/preview`, {})
    // Mặc định chọn: vòng lặp có sẵn + trang mới có công việc hợp lệ
    tabs.value = r.tabs.map(t => ({ ...t, picked: t.status === 'existing' || (t.status === 'new' && t.plan?.add.length > 0) }))
    more.value = r.more
    if (!props.project.sheetMode) mode.value = r.mode
  } catch (e) { error.value = e.message }
  finally { loading.value = false }
}
onMounted(load)

async function apply() {
  if (dateError.value) return
  busy.value = true
  try {
    const picks = tabs.value.filter(t => usable(t) && t.picked).map(t => ({ gid: t.gid, startDate: t.startDate, endDate: t.endDate }))
    const { result: r } = await api.post(`/api/projects/${props.project.id}/sheet/apply`, { mode: mode.value, picks })
    await loadFromServer().catch(() => {})
    const parts = [r.created && `tạo ${r.created} vòng lặp`, r.members?.length && `thêm ${r.members.length} thành viên`, r.added && `thêm ${r.added} công việc`, r.updated && `cập nhật ${r.updated} công việc`].filter(Boolean)
    toast.success(parts.length ? `Đã đồng bộ: ${parts.join(', ')}` : 'Đã đồng bộ — không có thay đổi')
    if (r.failed?.length) toast.error(`${r.failed.length} việc không ghi được: ${r.failed[0].label} — ${r.failed[0].reason}`)
    emit('close')
  } catch (e) { error.value = e.message }
  finally { busy.value = false }
}
</script>

<style scoped>
.pss { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.pss__src { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.pss__src strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pss__src a { display: inline-flex; align-items: center; gap: 2px; color: var(--text-brand); text-decoration: none; }
.pss__src a:hover { text-decoration: underline; }
.pss__src .ti { font-size: 16px; flex-shrink: 0; }
.pss__status, .pss__note { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.pss__note .ti { font-size: 16px; }
.pss__spin { animation: pss-spin 0.9s linear infinite; }
@keyframes pss-spin { to { transform: rotate(360deg); } }
.pss__msg { /* box thấp 1–2 dòng → icon căn giữa dọc (skill: Box / card thấp) */ display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-danger-light); color: var(--text-danger); font-size: var(--text-body); line-height: var(--text-body-lh); }
.pss__msg .ti { font-size: 16px; flex-shrink: 0; }
.pss__table { display: flex; flex-direction: column; max-height: 340px; overflow: auto; border: 1px solid var(--stroke-divider); border-radius: var(--radius-default); }
.pss__row { display: grid; grid-template-columns: 36px minmax(120px, 1fr) minmax(260px, 2fr) 170px; align-items: center; gap: 8px; padding: 6px 12px; border-bottom: 1px solid var(--stroke-divider); font-size: var(--text-body); color: var(--text-primary); }
.pss__row:last-child { border-bottom: none; }
.pss__row--head { position: sticky; top: 0; z-index: 1; background: var(--bg-neutral-light); font-weight: var(--fw-semibold); color: var(--text-secondary); }
.pss__row--off { color: var(--text-secondary); }
.pss__tab { font-weight: var(--fw-medium); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pss__iter { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-width: 0; }
.pss__reason { font-size: var(--text-body); color: var(--text-secondary); }
.pss__dates { display: flex; align-items: center; gap: 4px; }
.pss__dates > :deep(.ibox) { width: 130px; }
.pss__chg { display: flex; flex-wrap: wrap; gap: 6px; font-size: var(--text-body); }
.pss__n--add { color: var(--text-success); font-weight: var(--fw-semibold); }
.pss__n--upd { color: var(--text-brand); font-weight: var(--fw-semibold); }
.pss__n--err { color: var(--text-danger); cursor: help; }
.pss__n--off { color: var(--text-secondary); }
.pss__n--join { color: var(--text-brand); cursor: help; }
.pss__join { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-brand-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.pss__join strong { font-weight: var(--fw-semibold); }
.pss__join .ti { font-size: 16px; flex-shrink: 0; margin-top: 2px; color: var(--icon-brand); }
.pss__modes { display: flex; flex-direction: column; gap: 8px; }
.pss__mode { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); cursor: pointer; }
.pss__mode--on { border-color: var(--stroke-brand); background: var(--bg-brand-light); }
.pss__mode input { margin: 3px 0 0; accent-color: var(--bg-brand); flex-shrink: 0; cursor: pointer; }
.pss__mode-title { display: block; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.pss__mode-desc { display: block; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
</style>
