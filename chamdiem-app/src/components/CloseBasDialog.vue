<template>
  <!-- Chốt điểm BA — cùng bố cục với chốt điểm PD: chọn tháng · số ngày nghỉ lễ · ngày làm việc · danh sách BA cần chốt (ngày làm, effort).
       BA chưa có điểm kỳ vọng → không có cột Kỳ vọng / Tỷ lệ đạt. -->
  <DialogShell title="Chốt điểm BA" :width="800" @close="$emit('close')">
    <div class="pdp-close-body">
      <div class="pdp-close-top">
        <TipField label="Chốt tháng" tip="Chốt = lưu lại bảng Điểm BA của tháng theo hệ số hiện tại. Sau khi chốt, phần phân tích của các việc có Ngày hoàn thành (BA) trong tháng bị khóa cho tới khi mở chốt.">
          <AppCombobox v-model="ym" :options="monthOptions" :clearable="false" />
        </TipField>
        <TipField label="Số ngày nghỉ lễ" :tip="holidayTip">
          <AppNumberbox v-model="holidays" :min="0" :stepper="false" />
        </TipField>
        <TipField label="Ngày làm việc của tháng" tip="Số ngày thứ 2 – thứ 6 trong tháng trừ số ngày nghỉ lễ.">
          <AppTextbox :model-value="String(workingDays)" state="readonly" />
        </TipField>
      </div>

      <div v-if="warnings.length" class="pdp-close-alert">
        <TIcon name="alert-triangle" />
        <span v-if="warnings.length === 1" v-html="warnings[0]" />
        <ul v-else class="pdp-close-alert__list"><li v-for="(w, i) in warnings" :key="i" v-html="w" /></ul>
      </div>

      <div v-if="rows.length" class="pdp-close-table">
        <DataTable :columns="columns" :rows="tableRows" :editable="true" :line-count="0" :hide-blank-rows="false" @cell-update="onCell" />
      </div>
      <p v-else class="empty-state">Không còn BA nào cần chốt trong tháng {{ monthLabel }}.</p>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button v-if="rows.length" class="btn btn--primary" @click="doConfirm"><TIcon name="lock" />Chốt {{ rows.length }} người</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { fmtNum } from '@mds/utils/number.js'
import { avatarOf } from '../store/avatar.js'
import { ref, reactive, computed, watch } from 'vue'
import DialogShell  from './DialogShell.vue'
import TIcon        from '@mds/components/TIcon.vue'
import AppTextbox   from '@mds/components/AppTextbox.vue'
import DataTable    from '@mds/components/DataTable.vue'
import TipField     from './TipField.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import { userName, userById, suggestedHolidays, ensureMonthTasks } from '../store/db.js'
import { workingDaysOf, monthLabelOf } from '../store/scoring.js'

/* rowsFor(ym) → [{ id, total, count, missing }] — BA chưa chốt (trong số đã chọn) của tháng ym */
const props = defineProps({
  month:   { type: String,   required: true },
  months:  { type: Array,    required: true },   // ['YYYY-MM', …]
  rowsFor: { type: Function, required: true },
})
const emit = defineEmits(['close', 'confirm'])

const thisMonth = new Date().toISOString().slice(0, 7)
const ym = ref(props.month)
const monthOptions = computed(() => props.months.map(m => ({ value: m, label: 'Tháng ' + monthLabelOf(m) })))
const monthLabel = computed(() => monthLabelOf(ym.value))
const ongoing = computed(() => ym.value >= thisMonth)

/* Nghỉ lễ: người chốt tự điền; gợi ý theo người đã chốt trước trong tháng (dùng chung với chốt PD) */
const holidays = ref(suggestedHolidays(props.month))
const holidayTip = computed(() => 'Ngày lễ / Tết rơi vào ngày làm việc — người chốt tự điền.' + (suggestedHolidays(ym.value) ? ' Đang gợi ý theo người đã chốt trước trong tháng.' : ''))
const workingDays = computed(() => workingDaysOf(ym.value, Number(holidays.value) || 0))

const rows = computed(() => props.rowsFor(ym.value))
const input = reactive({})
watch(rows, () => { for (const r of rows.value) if (!input[r.id]) input[r.id] = { actualDays: workingDays.value, effort: 100, touched: false } }, { immediate: true })
watch(ym, v => { holidays.value = suggestedHolidays(v); ensureMonthTasks(v) })   // đổi tháng chốt → tải công việc tháng đó
/* Đổi nghỉ lễ / tháng → ngày làm thực tế chưa sửa tay chạy theo */
watch(workingDays, wd => { for (const k in input) if (!input[k].touched) input[k].actualDays = wd })

const fmt = v => fmtNum(Number(v) || 0)
const columns = [
  { key: 'ba',         label: 'Nhân viên',     type: 'avatar-subtext', minWidth: 220, noFilter: true },
  { key: 'total',      label: 'Điểm BA tháng', width: 130, align: 'right', noFilter: true },
  { key: 'actualDays', label: 'Ngày làm',      type: 'numberbox', width: 120, noFilter: true },
  { key: 'effort',     label: 'Effort (%)',    type: 'numberbox', width: 120, noFilter: true },
]
const tableRows = computed(() => rows.value.map(r => {
  const i = input[r.id] ?? {}
  return {
    id: r.id,
    ba: { text: userName(r.id), avatar: avatarOf(userById(r.id)), subtext: [`${r.count} việc`, r.missing && `${r.missing} việc thiếu dữ liệu`].filter(Boolean).join(' · ') },
    total: fmt(r.total), actualDays: i.actualDays, effort: i.effort,
    _mark: r.missing ? 'warning' : '',   // có việc thiếu dữ liệu chấm
  }
}))
function onCell({ row, col, value }) {
  const i = input[row.id]; if (!i) return
  i[col.key] = value === '' ? '' : Number(String(value).replace(',', '.')) || 0
  if (col.key === 'actualDays') i.touched = true
}
const missingRows = computed(() => rows.value.filter(r => r.missing))
const warnings = computed(() => [
  ongoing.value && `Tháng ${monthLabel.value} chưa kết thúc — việc phân tích hoàn thành sau khi chốt sẽ không chọn được ngày trong tháng này.`,
  missingRows.value.length && `<strong>${missingRows.value.length} người</strong> có việc thiếu dữ liệu chấm (BA Point / deadline / chất lượng — vạch cam): các việc đó không được tính vào bản chốt.`,
].filter(Boolean))
function doConfirm() {
  emit('confirm', ym.value, rows.value.map(r => ({ baId: r.id, holidays: Number(holidays.value) || 0, workingDays: workingDays.value, actualDays: Number(input[r.id]?.actualDays) || 0, effort: Number(input[r.id]?.effort) || 0 })))
}
</script>

<style scoped>
.pdp-close-body { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.pdp-close-top { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--form-row-gap) var(--form-col-gap-sm); align-items: start; }
.pdp-close-alert { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-warning-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.pdp-close-alert .ti { color: var(--icon-warning); }
.pdp-close-alert :deep(strong) { font-weight: var(--fw-semibold); }
.pdp-close-alert__list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 2px; }
.pdp-close-table { max-height: 360px; overflow: auto; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); }
</style>
