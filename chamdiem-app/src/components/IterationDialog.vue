<template>
  <DialogShell :title="form.id ? 'Sửa vòng lặp' : 'Thêm vòng lặp'" :width="620" :autofocus="!form.id" @close="$emit('close')">
    <div ref="formEl" class="dlg-form">
      <AppInput label="Tên vòng lặp" :required="true" :message="errors.name">
        <AppTextbox v-model="form.name" placeholder="VD: Vòng lặp 11/2026" :state="errors.name ? 'error' : 'default'" />
      </AppInput>
      <div class="dlg-grid">
        <AppInput label="Ngày bắt đầu" :required="true" :message="errors.startDate">
          <AppDatebox v-model="form.startDate" :state="errors.startDate ? 'error' : 'default'" />
        </AppInput>
        <AppInput label="Ngày kết thúc" :required="true" :message="errors.endDate">
          <AppDatebox v-model="form.endDate" :state="errors.endDate ? 'error' : 'default'" />
        </AppInput>
      </div>

      <!-- Đồng bộ công việc từ Google Sheet (tùy chọn): dự án quen nhập Excel → gắn link Sheet theo template, app tự đọc về -->
      <SheetLinkField v-model="form.sheetUrl" v-model:auto="form.sheetAuto" :error="errors.sheetUrl" scope="iteration" />

      <!-- Chuyển việc chưa xong (chưa có Ngày hoàn thành) từ vòng lặp gần nhất — tick chọn từng việc, mặc định chọn hết -->
      <div v-if="!form.id && prevIter && carryTasks.length" class="carry">
        <div class="carry__head">
          <AppCheckbox :model-value="allPicked" :indeterminate="picked.length > 0 && !allPicked" label="Chuyển công việc chưa xong sang vòng lặp này"
            @update:model-value="v => (picked = v ? carryTasks.map(t => t.id) : [])" />
          <span class="carry__count">Đã chọn {{ picked.length }}/{{ carryTasks.length }} · từ “{{ prevIter.name }}”</span>
        </div>
        <div class="carry__list">
          <label v-for="t in carryTasks" :key="t.id" class="carry__item">
            <AppCheckbox v-model="picked" :value="t.id" />
            <span class="carry__text">
              <span class="carry__name">{{ t.pbi ? t.pbi + ' · ' : '' }}{{ t.content }}</span>
              <span class="carry__meta">{{ userName(t.pdId) || 'Chưa giao PD' }} · {{ t.designStatus }}</span>
            </span>
            <!-- Đã thiết kế xong mà quên điền ngày → nên điền ngày thay vì chuyển -->
            <AppTag v-if="DONE_STATUSES.includes(t.designStatus)" label="Đã thiết kế, chưa có ngày hoàn thành" color="warning" v-tip="'Việc đã thiết kế xong nhưng chưa có Ngày hoàn thành nên chưa được tính điểm — nên điền ngày ở vòng cũ thay vì chuyển sang vòng mới'" />
          </label>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button class="btn btn--primary" @click="save">Lưu</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { useDocTitle } from '@mds/utils/docTitle.js'
import { toast } from '@mds/utils/toast.js'
import { reactive, ref, computed, watch } from 'vue'
import { focusFirstError } from '@mds/utils/fieldError.js'
import DialogShell from './DialogShell.vue'
import AppInput    from '@mds/components/AppInput.vue'
import AppTextbox  from '@mds/components/AppTextbox.vue'
import AppDatebox  from '@mds/components/AppDatebox.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import AppTag      from '@mds/components/AppTag.vue'
import SheetLinkField, { isSheetUrl } from './SheetLinkField.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { DONE_STATUSES } from '../store/scoring.js'
import { saveIteration, iterationsOf, unfinishedTasksOf, moveTasks, userName, projectById } from '../store/db.js'

const props = defineProps({
  iteration: { type: Object, default: null },
  projectId: { type: String, required: true },
})
const emit = defineEmits(['close', 'saved', 'sync'])
const initialSheetUrl = props.iteration?.sheetUrl ?? ''   // nhớ link lúc mở form (saveIteration sửa thẳng vào object vòng lặp)
/* Tiêu đề tab khi thêm mới: Thêm … | Cha | MISA Solution Point (sửa thì giữ tiêu đề trang) */
useDocTitle(() => (props.iteration ? [] : ['Thêm vòng lặp', projectById(props.projectId)?.name, 'Dự án']))

const form = reactive({ name: '', startDate: '', endDate: '', projectId: props.projectId, sheetUrl: '', sheetAuto: true, ...(props.iteration ?? {}) })
if (form.sheetAuto === undefined) form.sheetAuto = true
const errors = reactive({})

/* Vòng lặp gần nhất của dự án → đề xuất chuyển các việc chưa có Ngày hoàn thành */
const prevIter   = computed(() => iterationsOf(props.projectId)[0])   // vòng lặp mới nhất
const carryTasks = computed(() => prevIter.value ? unfinishedTasksOf(prevIter.value.id) : [])
// Mặc định chuyển hết, trừ việc đã thiết kế xong mà quên ngày hoàn thành (nên điền ngày ở vòng cũ) — vẫn tick lại được
const picked     = ref(carryTasks.value.filter(t => !DONE_STATUSES.includes(t.designStatus)).map(t => t.id))
const allPicked  = computed(() => carryTasks.value.length > 0 && picked.value.length === carryTasks.value.length)

const formEl = ref(null)
/* Sửa ô nào → lỗi ô đó tự mất (không chờ bấm Lưu lại) */
watch(() => ({ ...form }), (n, o) => { for (const k in errors) if (String(n[k] ?? '') !== String(o[k] ?? '')) delete errors[k] })

function save() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name = 'Nhập tên vòng lặp'
  if (!form.startDate)   errors.startDate = 'Chọn ngày bắt đầu'
  if (!form.endDate)     errors.endDate = 'Chọn ngày kết thúc'
  else if (form.startDate && form.endDate < form.startDate) errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
  form.sheetUrl = String(form.sheetUrl ?? '').trim()
  if (form.sheetUrl && !isSheetUrl(form.sheetUrl)) errors.sheetUrl = 'Link không phải Google Sheet (cần dạng https://docs.google.com/spreadsheets/d/…)'
  if (Object.keys(errors).length) return focusFirstError(formEl.value)
  const id = saveIteration({ ...form })
  if (!form.id && picked.value.length) moveTasks(picked.value, id)
  toast.success(form.id ? 'Cập nhật thành công' : `Đã thêm vòng lặp${picked.value.length ? ` · chuyển ${picked.value.length} công việc` : ''}`)
  emit('saved', id)
  // Vừa gắn / đổi link Sheet → mở luôn bước đồng bộ để lấy dữ liệu về
  if (form.sheetUrl && form.sheetUrl !== initialSheetUrl) emit('sync', id)
  emit('close')
}
</script>

<style scoped>
.dlg-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.carry {
  display: flex; flex-direction: column; gap: 8px;
  padding: 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light);
}
.carry__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.carry__count { font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; }
.carry__list { max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; border-radius: var(--radius-default); background: var(--bg-white); }
.carry__item { display: flex; align-items: center; gap: 8px; padding: 6px 12px; cursor: pointer; }
.carry__item + .carry__item { border-top: 1px solid var(--stroke-divider); }
.carry__item:hover { background: var(--bg-brand-light); }
.carry__text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.carry__name { font-size: var(--text-body); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.carry__meta { font-size: var(--text-body); color: var(--text-secondary); }
.dlg-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--form-row-gap) var(--form-col-gap-sm); }
</style>
