<template>
  <DialogShell title="Nhập nhanh công việc" :width="640" :autofocus="true" @close="$emit('close')">
    <div ref="formEl" class="dlg-form">
      <TipField label="Danh sách công việc" :required="true" :message="error"
        tip="Mỗi dòng là 1 công việc. Dòng bắt đầu bằng mã PBI (dãy số) thì tự tách ra cột PBI. Chi tiết (link, màn hình, độ phức tạp…) cập nhật sau trong từng công việc.">
        <AppTextarea v-model="text" :min-height="200" :max-height="360" autosize
          :placeholder="'Mỗi dòng 1 công việc, VD:\n671234 Thiết kế màn danh sách hợp đồng\n671235 Bổ sung bộ lọc nâng cao\nPopup xác nhận xóa chứng từ'"
          @keydown.ctrl.enter.prevent="save" @keydown.meta.enter.prevent="save" />
      </TipField>
      <div class="dlg-grid">
        <TipField label="PD" tip="Giao cho tất cả công việc vừa nhập. Để trống → giao sau.">
          <AppCombobox v-model="pdId" :options="pdOptions" recent-key="pick-pd" placeholder="Chưa giao" empty-option="Chưa giao" />
        </TipField>
        <TipField label="BA" tip="Gán cho tất cả công việc vừa nhập. Để trống → gán sau.">
          <AppCombobox v-model="baId" :options="baOptions" recent-key="pick-ba" placeholder="Chưa gán" empty-option="Chưa gán" />
        </TipField>
        <TipField label="Nền tảng" tip="Áp dụng cho tất cả công việc vừa nhập — sửa riêng từng việc sau nếu khác.">
          <AppCombobox v-model="platform" :options="PLATFORMS" :clearable="false" />
        </TipField>
      </div>
      <!-- Trùng mã PBI với việc đã có trong dự án (kể cả việc thêm tay) / giữa các dòng → cảnh báo, vẫn cho thêm -->
      <div v-if="dups.length" class="pdp-qa-warn">
        <TIcon name="alert-triangle" />
        <div>
          <strong>{{ dups.length }} dòng trùng mã PBI</strong> — vẫn thêm thành công việc mới, không xóa / sửa việc đã có:
          <ul><li v-for="d in dups.slice(0, 5)" :key="d.rowNo">Dòng {{ d.rowNo }}: {{ d.warnings.join('; ') }}</li></ul>
          <span v-if="dups.length > 5">… và {{ dups.length - 5 }} dòng khác.</span>
        </div>
      </div>
      <p class="pdp-qa-hint">
        <template v-if="lines.length">Sẽ thêm <strong>{{ lines.length }}</strong> công việc vào <strong>{{ iteration.name }}</strong><template v-if="withPbi"> · {{ withPbi }} việc có PBI</template>.</template>
        <template v-else>Gõ hoặc dán danh sách công việc, mỗi dòng 1 việc.</template>
        <span class="pdp-qa-key">Ctrl + Enter để thêm</span>
      </p>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button class="btn btn--primary" :disabled="!lines.length" @click="save">Thêm {{ lines.length || '' }} công việc</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import DialogShell from './DialogShell.vue'
import TipField    from './TipField.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import TIcon from '@mds/components/TIcon.vue'
import { markDuplicatePbis } from '../store/taskImport.js'
import { useDocTitle } from '@mds/utils/docTitle.js'
import { toast } from '@mds/utils/toast.js'
import { PLATFORMS } from '../store/scoring.js'
import { performerOptions, currentUser, membersOf, projectById, quickAddTasks, baPerformerOptions } from '../store/db.js'

/* Nhập nhanh: gõ / dán nhiều công việc 1 lần (mỗi dòng 1 việc) — chỉ thông tin ban đầu, chi tiết cập nhật sau */
const props = defineProps({
  projectId: { type: String, required: true },
  iteration: { type: Object, required: true },
})
const emit = defineEmits(['close', 'added'])
useDocTitle(() => ['Nhập nhanh công việc', projectById(props.projectId)?.name, 'Dự án'])

const pdOptions = computed(() => performerOptions(props.projectId))
const baOptions = computed(() => baPerformerOptions(props.projectId))
// Người nhập là PD / BA của dự án → chọn sẵn chính mình (đổi được)
const me = currentUser.value
const pdId = ref(pdOptions.value.some(o => o.value === me?.id) ? me.id : '')
const baId = ref(baOptions.value.some(o => o.value === me?.id) ? me.id : '')

const text = ref(''), error = ref(''), formEl = ref(null), platform = ref('Web')
/* Tách dòng: bỏ dòng trống, bỏ ký hiệu đầu dòng (-, *, •, 1.), "671234 Nội dung" / "671234 - Nội dung" / "671234<Tab>Nội dung" → PBI + nội dung */
const lines = computed(() => text.value.split(/\r?\n/)
  .map(l => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim()).filter(Boolean)
  .map(l => { const m = l.match(/^(\d{4,9})\s*(?:[-–:|\t]\s*|\s+)(.+)$/); return m ? { pbi: m[1], content: m[2].trim() } : { pbi: '', content: l } })
  .filter(x => x.content))
const withPbi = computed(() => lines.value.filter(x => x.pbi).length)
const dups = computed(() => {
  const items = lines.value.map((x, i) => ({ pbi: x.pbi, rowNo: i + 1, warnings: [] }))
  markDuplicatePbis(items, props.projectId)
  return items.filter(x => x.dupPbi)
})

function save() {
  if (!lines.value.length) { error.value = 'Nhập ít nhất 1 công việc'; return }
  quickAddTasks(props.projectId, props.iteration.id, lines.value, { pdId: pdId.value, baId: baId.value, platform: platform.value })
  toast.success(`Đã thêm ${lines.value.length} công việc vào ${props.iteration.name}`)
  emit('added', lines.value.length)
  emit('close')
}
</script>

<style scoped>
.dlg-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.dlg-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--form-row-gap) var(--form-col-gap-sm); }
.pdp-qa-hint { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-qa-hint strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pdp-qa-warn { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-warning-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.pdp-qa-warn > .ti { color: var(--icon-warning); font-size: 16px; flex-shrink: 0; margin-top: 2px; }
.pdp-qa-warn strong { font-weight: var(--fw-semibold); }
.pdp-qa-warn ul { margin: 2px 0 0; padding-left: 18px; color: var(--text-secondary); }
.pdp-qa-key { margin-left: auto; font-size: var(--text-body); color: var(--text-hint, var(--text-secondary)); }
</style>
