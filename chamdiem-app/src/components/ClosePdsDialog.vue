<template>
  <DialogShell title="Chốt điểm" :width="840" @close="$emit('close')">
    <div class="pdp-close-body">
      <div class="pdp-close-top">
        <TipField label="Chốt tháng" tip="Chốt = lưu lại bảng điểm tháng theo hệ số và thông số nhập ở đây. Sau khi chốt, công việc của người đó có Ngày hoàn thành trong tháng bị khóa chỉnh sửa cho tới khi mở chốt.">
          <AppCombobox v-model="ym" :options="monthOptions" :clearable="false" />
        </TipField>
        <TipField label="Số ngày nghỉ lễ" :tip="holidayTip">
          <AppNumberbox v-model="holidays" :min="0" :stepper="false" />
        </TipField>
        <TipField label="Ngày làm việc của tháng" tip="Số ngày thứ 2 – thứ 6 trong tháng trừ số ngày nghỉ lễ.">
          <AppTextbox :model-value="String(workingDays)" state="readonly" />
        </TipField>
      </div>

      <!-- Gom mọi cảnh báo vào 1 khung -->
      <div v-if="warnings.length" class="pdp-close-alert">
        <TIcon name="alert-triangle" />
        <span v-if="warnings.length === 1" v-html="warnings[0]" />
        <ul v-else class="pdp-close-alert__list"><li v-for="(w, i) in warnings" :key="i" v-html="w" /></ul>
      </div>

      <!-- Bảng chuẩn DataTable: chỉ các cột numberbox nhập được -->
      <div v-if="rows.length" class="pdp-close-table">
        <DataTable :columns="columns" :rows="tableRows" :editable="true" :line-count="0" :hide-blank-rows="false" @cell-update="onCell" />
      </div>
      <p v-else class="empty-state">Không còn ai cần chốt trong tháng {{ monthLabel }}.</p>
    </div>
    <ConfirmDialog v-if="askNoReason" title="Còn việc chưa có lý do đánh giá" confirm-label="Vẫn chốt" :danger="false"
      :message="`${noReasonRows.map(r => userName(r.pdId)).join(', ')} còn công việc đánh giá Rất hài lòng / Không hài lòng chưa có lý do. Vẫn chốt điểm?`"
      @cancel="askNoReason = false" @confirm="askNoReason = false; doConfirm()" />
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button v-if="rows.length" class="btn btn--primary" @click="confirm"><TIcon name="lock" />Chốt {{ rows.length }} người</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { avatarOf } from '../store/avatar.js'
import { ref, reactive, computed, watch } from 'vue'
import DialogShell  from './DialogShell.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import TIcon        from '@mds/components/TIcon.vue'
import AppTag       from '@mds/components/AppTag.vue'
import AppTextbox   from '@mds/components/AppTextbox.vue'
import DataTable    from '@mds/components/DataTable.vue'
import TipField     from './TipField.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import { userName, userById, suggestedHolidays, ensureMonthTasks } from '../store/db.js'
import { workingDaysOf, monthLabelOf, expectedScore, achievementRate, round } from '../store/scoring.js'

/* rowsFor(ym) → [{ pdId, final, pbis, unrated }] — người chưa chốt (trong số đã chọn) của tháng ym */
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

/* Nghỉ lễ: người chốt tự điền; gợi ý theo người đã chốt trước trong tháng */
const holidays = ref(suggestedHolidays(props.month))
const holidayTip = computed(() => 'Ngày lễ / Tết rơi vào ngày làm việc — người chốt tự điền.' + (suggestedHolidays(ym.value) ? ' Đang gợi ý theo người đã chốt trước trong tháng.' : ''))
const workingDays = computed(() => workingDaysOf(ym.value, Number(holidays.value) || 0))

const rows = computed(() => props.rowsFor(ym.value))
const input = reactive({})
function seed() {
  for (const r of rows.value) {
    if (!input[r.pdId]) input[r.pdId] = { actualDays: workingDays.value, effort: 100, target: Number(userById(r.pdId)?.target) || 0, touched: false }
  }
}
watch(rows, seed, { immediate: true })
watch(ym, v => { holidays.value = suggestedHolidays(v); ensureMonthTasks(v) })   // đổi tháng chốt → tải công việc tháng đó
/* Đổi nghỉ lễ / tháng → ngày làm thực tế chưa sửa tay chạy theo */
watch(workingDays, wd => { for (const k in input) if (!input[k].touched) input[k].actualDays = wd })

const rateOf = r => {
  const i = input[r.pdId]; if (!i) return null
  const exp = round(expectedScore({ actualDays: Number(i.actualDays) || 0, effort: Number(i.effort) || 0, target: Number(i.target) || 0 }, workingDays.value))
  return achievementRate(r.final, exp)
}
const columns = [
  { key: 'pd',         label: 'Nhân viên',     type: 'avatar-subtext', minWidth: 200, noFilter: true },
  { key: 'final',      label: 'Điểm',          width: 100, align: 'right', noFilter: true },
  { key: 'actualDays', label: 'Ngày làm',      type: 'numberbox', width: 120, noFilter: true },
  { key: 'effort',     label: 'Effort (%)',    type: 'numberbox', width: 120, noFilter: true },
  { key: 'target',     label: 'Kỳ vọng level', type: 'numberbox', width: 140, noFilter: true },
  { key: 'rate',       label: 'Tỷ lệ đạt',     type: 'status', width: 110, noFilter: true },
]
const tableRows = computed(() => rows.value.map(r => {
  const i = input[r.pdId] ?? {}, rate = rateOf(r)
  return {
    id: r.pdId,
    pd: { text: userName(r.pdId), avatar: avatarOf(userById(r.pdId)), subtext: [`${r.pbis} PBI`, r.noReason && `${r.noReason} việc thiếu lý do`, r.unrated && `${r.unrated} chưa đánh giá`].filter(Boolean).join(' · ') },
    final: r.final, actualDays: i.actualDays, effort: i.effort, target: i.target,
    rate: rate == null ? null : { label: rate + '%', color: rateColor(rate) },
    _mark: r.noReason ? 'warning' : '',   // việc Rất / Không hài lòng chưa có lý do
  }
}))
function onCell({ row, col, value }) {
  const i = input[row.id]; if (!i) return
  i[col.key] = value === '' ? '' : Number(String(value).replace(',', '.')) || 0
  if (col.key === 'actualDays') i.touched = true
}
const rateColor = v => (v == null ? 'neutral' : v >= 100 ? 'success' : v >= 80 ? 'warning' : 'danger')

const noReasonRows = computed(() => rows.value.filter(r => r.noReason))
const warnings = computed(() => [
  ongoing.value && `Tháng ${monthLabel.value} chưa kết thúc — công việc hoàn thành sau khi chốt sẽ không chọn được ngày trong tháng này.`,
  noReasonRows.value.length && `<strong>${noReasonRows.value.length} người</strong> có việc đánh giá Rất hài lòng / Không hài lòng chưa có lý do (vạch cam) — nên bổ sung trước khi chốt.`,
].filter(Boolean))
const askNoReason = ref(false)
/* Còn việc thiếu lý do → hỏi lại trước khi chốt */
function confirm() {
  if (noReasonRows.value.length) { askNoReason.value = true; return }
  doConfirm()
}
function doConfirm() {
  emit('confirm', ym.value, rows.value.map(r => ({ pdId: r.pdId, holidays: Number(holidays.value) || 0, ...input[r.pdId] })))
}
</script>

<style scoped>
/* Khoảng cách theo token form chuẩn; bảng = DataTable chuẩn */
.pdp-close-body { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.pdp-close-top { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--form-row-gap) var(--form-col-gap-sm); align-items: start; }
.pdp-close-alert { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-warning-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.pdp-close-alert .ti { color: var(--icon-warning); }
.pdp-close-alert :deep(strong) { font-weight: var(--fw-semibold); }
.pdp-close-alert__list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 2px; }
.pdp-close-table { max-height: 360px; overflow: auto; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); }
</style>
