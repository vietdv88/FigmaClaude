<template>
  <!-- Trường giai đoạn Phân tích (BA) — PO / quản lý trực tiếp của BA nhập; BA xem được ngay, Điểm thực nhận tự tính -->
  <div class="grid">
    <TipField field="baPoint" label="BA Point" :highlight="need('baPoint')" tip="Story Point của việc — PO chấm, thống nhất với BA, chỉ gán 1 lần (không cộng thêm vì sửa nhiều lần / OT).">
      <AppNumberbox v-model="draft.baPoint" :min="0" decimal :stepper="false" placeholder="Nhập Point" :state="st('baPoint', warn('baPoint'))"
        @change="commitPoint" @focusout="commitPoint" />
    </TipField>
    <TipField field="baQuality" label="Kết quả chất lượng" :highlight="need('baQuality')" :tip-items="qualityTips" tip="Chấm khi đã có đầu ra dùng được:">
      <AppCombobox :model-value="task.baQuality || BA_UNRATED" :options="qualityOptions" :clearable="false" :state="st('baQuality', warn('baQuality'))"
        @update:model-value="v => emit('commit', 'baQuality', v === BA_UNRATED ? '' : v)" />
    </TipField>
    <TipField field="baDeadline" label="Deadline phân tích" :highlight="need('baDeadline')" tip="Mốc xác định đúng hạn hay trễ.">
      <AppDatebox :model-value="task.baDeadline" :state="st('baDeadline', warn('baDeadline'))" @update:model-value="v => emit('commit', 'baDeadline', v)" />
    </TipField>
    <TipField field="baCompletedDate" label="Ngày hoàn thành thực tế" :highlight="need('baCompletedDate')" tip="BA tự điền khi đã xong và có đầu ra dùng được (PO / quản lý trực tiếp cũng sửa được). Quyết định tháng được tính Điểm BA.">
      <AppDatebox :model-value="task.baCompletedDate" :state="st('baCompletedDate', warn('baCompletedDate'))" @update:model-value="v => emit('commit', 'baCompletedDate', v)" />
    </TipField>
    <TipField label="Miễn trừ trễ" tip="Chỉ chọn Có khi trễ do nguyên nhân khách quan được chấp nhận — bắt buộc ghi lý do.">
      <AppCombobox :model-value="task.baExempt || 'Không'" :options="YES_NO" :clearable="false" :state="st('baExempt')" @update:model-value="v => emit('commit', 'baExempt', v)" />
    </TipField>
    <div class="ba-progress">
      <span class="ba-progress__k">Tiến độ</span>
      <AppTag v-if="progress" :label="progress.label" :color="progress.color" />
      <span v-else class="ba-progress__none">Chưa đủ ngày để xác định</span>
    </div>
    <TipField v-if="task.baExempt === 'Có'" class="span-2" label="Lý do miễn trừ" :required="true"
      :message="!String(task.baExemptReason ?? '').trim() ? 'Bắt buộc ghi lý do miễn trừ trễ' : ''" message-type="warning">
      <AppTextarea v-model="draft.baExemptReason" :min-height="40" placeholder="Nguyên nhân khách quan được chấp nhận"
        :state="st('baExemptReason', !String(task.baExemptReason ?? '').trim() ? 'warning' : '')" @focusout="emit('commit', 'baExemptReason', String(draft.baExemptReason ?? ''))" />
    </TipField>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import AppTag       from '@mds/components/AppTag.vue'
import AppTextarea  from '@mds/components/AppTextarea.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import AppDatebox   from '@mds/components/AppDatebox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import TipField     from './TipField.vue'
import { YES_NO, missingBaFields } from '../store/scoring.js'
import { BA_QUALITY_LEVELS, BA_UNRATED, baConfigOf, baOnTime } from '../store/baScoring.js'
import { db, canEditField } from '../store/db.js'

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['commit'])

const draft = reactive({ baPoint: '', baExemptReason: '' })
watch(() => [props.task.id, props.task.baPoint, props.task.baExemptReason], () => {
  draft.baPoint = props.task.baPoint ?? ''
  draft.baExemptReason = props.task.baExemptReason ?? ''
}, { immediate: true })

const cfg = computed(() => baConfigOf(db.config))
const qualityOptions = computed(() => [...BA_QUALITY_LEVELS.map(q => ({ value: q.value, label: `${cfg.value.quality[q.value]}% — ${q.value}` })), { value: BA_UNRATED, label: BA_UNRATED }])
const qualityTips = computed(() => BA_QUALITY_LEVELS.map(q => `${cfg.value.quality[q.value]}% — ${q.criteria}`))
const missing = computed(() => missingBaFields(props.task))
const need = k => missing.value.includes(k)
const warn = k => (need(k) ? 'warning' : '')
const st = (field, err) => (!canEditField(props.task, field) ? 'readonly' : err === 'warning' ? 'warning' : err ? 'error' : 'default')

// Tiến độ tự xác định: đúng hạn / trễ được miễn trừ / trễ
const progress = computed(() => {
  const t = props.task
  if (!t.baCompletedDate || (!t.baDeadline && t.baExempt !== 'Có')) return null
  const late = !!t.baDeadline && t.baCompletedDate > t.baDeadline
  if (!late) return { label: 'Đúng hạn · 100%', color: 'success' }
  return baOnTime({ deadline: t.baDeadline, completedDate: t.baCompletedDate, exempt: t.baExempt === 'Có' })
    ? { label: 'Trễ — được miễn trừ · 100%', color: 'warning' }
    : { label: 'Trễ · 0%', color: 'danger' }
})

function commitPoint() {
  const n = Number(draft.baPoint)
  const v = draft.baPoint === '' || draft.baPoint == null || !Number.isFinite(n) ? '' : Math.max(0, n)
  draft.baPoint = v
  emit('commit', 'baPoint', v)
}
</script>

<style scoped>
.span-2 { grid-column: 1 / -1; }
.ba-progress { display: flex; flex-direction: column; justify-content: flex-end; gap: 6px; min-width: 0; padding-bottom: 6px; }
.ba-progress__k { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ba-progress__none { font-size: var(--text-body); color: var(--text-secondary); }
</style>
