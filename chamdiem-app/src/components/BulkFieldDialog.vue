<template>
  <DialogShell :title="FIELDS[field].title" :width="460" @close="$emit('close')">
    <div class="dlg-form">
      <p class="pdp-bf-desc">Áp dụng cho <strong>{{ editable.length }}</strong> công việc đã chọn.</p>
      <AppInput :label="FIELDS[field].label" :required="FIELDS[field].required">
        <AppCombobox v-model="value" :options="options" :placeholder="FIELDS[field].placeholder" :empty-option="FIELDS[field].required ? '' : 'Để trống'" :recent-key="field === 'pdId' ? 'pick-pd' : field === 'baId' ? 'pick-ba' : ''" />
      </AppInput>
      <AppInput v-if="field === 'qualityRating' && needReason" label="Lý do đánh giá" :required="true">
        <AppTextarea v-model="reason" :rows="3" placeholder="Bắt buộc với Rất hài lòng / Không hài lòng — áp dụng cho mọi việc được cập nhật" />
      </AppInput>
      <p v-if="field === 'qualityRating' && notDesign.length" class="pdp-bf-warn">
        <TIcon name="info-circle" /><span>{{ notDesign.length }} việc “Chỉ phân tích” không có phần thiết kế — bỏ qua.</span>
      </p>
      <p v-if="skipped.length" class="pdp-bf-warn">
        <TIcon name="lock" /><span>{{ skipped.length }} công việc thuộc tháng đã chốt điểm — không cập nhật được, sẽ bỏ qua.</span>
      </p>
      <p v-if="error" class="pdp-bf-err"><TIcon name="circle-x" />{{ error }}</p>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button class="btn btn--primary" :disabled="!editable.length || (FIELDS[field].required && !value) || (needReason && !reason.trim())" @click="save">Cập nhật {{ editable.length }} công việc</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import DialogShell from './DialogShell.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppInput    from '@mds/components/AppInput.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import { toast } from '@mds/utils/toast.js'
import { db, membersOf, updateTaskField, isTaskLocked, ownProjectFor, performerOptions } from '../store/db.js'
import { DESIGN_STATUSES, DESIGN_STATUS_OPTIONS, QUALITY_RATINGS, REASON_REQUIRED, hasDesign } from '../store/scoring.js'

/* Cập nhật hàng loạt 1 trường cho các công việc đã chọn: Gán PD · Gán BA · Trạng thái thiết kế */
const props = defineProps({
  field:     { type: String, required: true },   // 'pdId' | 'baId' | 'designStatus'
  taskIds:   { type: Array,  required: true },
  projectId: { type: String, required: true },
})
const emit = defineEmits(['close', 'done'])
const FIELDS = {
  pdId:         { title: 'Gán PD hàng loạt', label: 'PD thực hiện', placeholder: 'Bỏ gán PD', required: false },
  baId:         { title: 'Gán BA hàng loạt', label: 'BA', placeholder: 'Bỏ gán BA', required: false },
  designStatus: { title: 'Cập nhật trạng thái hàng loạt', label: 'Trạng thái thiết kế', placeholder: 'Chọn trạng thái', required: true },
  qualityRating: { title: 'Cập nhật mức hài lòng hàng loạt', label: 'Mức hài lòng (PD)', placeholder: 'Chọn mức hài lòng', required: true },
}
const options = computed(() => props.field === 'designStatus'
  ? DESIGN_STATUS_OPTIONS
  : props.field === 'qualityRating'
  ? QUALITY_RATINGS.map(r => ({ value: r.value, label: r.value, description: r.note }))
  : performerOptions(props.projectId, props.field === 'pdId' ? 'PD' : 'BA'))   // mọi thành viên — PO / Lead kiêm PD / BA được
const tasks    = computed(() => db.tasks.filter(t => props.taskIds.includes(t.id)))
const skipped  = computed(() => tasks.value.filter(isTaskLocked))
// Mức hài lòng chỉ có ở việc có phần thiết kế
const notDesign = computed(() => (props.field === 'qualityRating' ? tasks.value.filter(t => !hasDesign(t)) : []))
const editable = computed(() => tasks.value.filter(t => !isTaskLocked(t) && !notDesign.value.includes(t)))
const value = ref(''), error = ref(''), reason = ref('')
const needReason = computed(() => props.field === 'qualityRating' && REASON_REQUIRED.includes(value.value))

function save() {
  error.value = ''
  let ok = 0, fail = 0
  for (const t of editable.value) {
    const r = updateTaskField(t.id, props.field, value.value)
    if (r === true) {
      ok++
      // Mức hài lòng: Rất / Không hài lòng → ghi lý do (mức khác giữ lý do cũ)
      if (props.field === 'qualityRating' && needReason.value) updateTaskField(t.id, 'ratingReason', reason.value.trim())
      // Đổi PD → gợi ý lại "Là dự án phụ trách" theo dự án phụ trách của PD mới
      if (props.field === 'pdId' && value.value) updateTaskField(t.id, 'isOwnProject', ownProjectFor(value.value, props.projectId))
    } else fail++
  }
  if (!ok && fail) { error.value = 'Không cập nhật được công việc nào'; return }
  toast.success(`Đã cập nhật ${ok} công việc${fail + skipped.value.length ? ` · bỏ qua ${fail + skipped.value.length}` : ''}`)
  emit('done'); emit('close')
}
</script>

<style scoped>
.dlg-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.pdp-bf-desc { font-size: var(--text-body); color: var(--text-secondary); }
.pdp-bf-desc strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pdp-bf-warn { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-warning-light); font-size: var(--text-body); color: var(--text-primary); }
.pdp-bf-warn .ti { color: var(--icon-warning); flex-shrink: 0; }
.pdp-bf-err { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-danger); }
</style>
