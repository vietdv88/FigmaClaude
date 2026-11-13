<template>
  <!-- Thêm việc từ sidebar: ① chọn Dự án + Vòng lặp → ② form Thêm công việc đầy đủ (như trong dự án) -->
  <DialogShell v-if="step === 'pick'" title="Thêm việc" :width="480" @close="$emit('close')">
    <div class="atf">
      <AppInput label="Dự án" :required="true" :message="err.project">
        <AppCombobox v-model="projectId" :options="projectOptions" recent-key="pick-project-add" avatar-square placeholder="Chọn dự án"
          :clearable="false" :state="err.project ? 'error' : 'default'" />
      </AppInput>
      <AppInput label="Vòng lặp" :required="true" :message="err.iter">
        <AppCombobox v-model="iterationId" :options="iterOptions" :placeholder="projectId ? (iterOptions.length ? 'Chọn vòng lặp' : 'Dự án chưa có vòng lặp') : 'Chọn dự án trước'"
          :clearable="false" :state="!projectId || !iterOptions.length ? 'disabled' : err.iter ? 'error' : 'default'" />
      </AppInput>
      <p v-if="projectId && !iterOptions.length" class="atf__note"><TIcon name="info-circle" />
        <span>Dự án chưa có vòng lặp. <template v-if="canManageProject(projectId)"><a href="#" @click.prevent="goCreateIter">Tạo vòng lặp</a> trước rồi thêm việc.</template><template v-else>Nhờ Quản trị dự án tạo vòng lặp trước.</template></span>
      </p>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button class="btn btn--primary" :disabled="!projectId || !iterationId" @click="next">Tiếp tục<TIcon name="arrow-right" /></button>
    </template>
  </DialogShell>
  <TaskDialog v-else :project-id="projectId" :iteration-id="iterationId" @close="$emit('close')" />
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DialogShell from './DialogShell.vue'
import TaskDialog from './TaskDialog.vue'
import TIcon from '@mds/components/TIcon.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { myProjects, iterationsOf, canAddTask, canManageProject } from '../store/db.js'

const emit = defineEmits(['close'])
const router = useRouter()
const step = ref('pick')
const err = reactive({ project: '', iter: '' })

/* Dự án mình được thêm việc (Quản trị / Thành viên dự án, Quản trị hệ thống / bộ phận) — kèm logo, mã */
const projectOptions = computed(() => myProjects.value.filter(p => canAddTask(p.id))
  .map(p => ({ value: p.id, label: p.name, description: p.code || '', avatar: p.logo || '' }))
  .sort((a, b) => a.label.localeCompare(b.label, 'vi')))
const lastProject = (() => { try { return localStorage.getItem('pdpoint-addtask-project') || '' } catch { return '' } })()
const projectId = ref(projectOptions.value.some(o => o.value === lastProject) ? lastProject : (projectOptions.value.length === 1 ? projectOptions.value[0].value : ''))

/* Vòng lặp: đang chạy lên đầu (gợi ý mặc định), rồi mới nhất */
const today = new Date().toISOString().slice(0, 10)
const fmt = d => (d ? d.split('-').reverse().join('/') : '')
const iterOptions = computed(() => (projectId.value ? iterationsOf(projectId.value) : []).map(i => ({
  value: i.id, label: i.name,
  description: [i.startDate && i.endDate ? `${fmt(i.startDate)} – ${fmt(i.endDate)}` : '', i.startDate <= today && today <= i.endDate ? 'Đang chạy' : ''].filter(Boolean).join(' · '),
})))
const iterationId = ref('')
watch(projectId, pid => {
  err.project = ''; err.iter = ''
  const list = pid ? iterationsOf(pid) : []
  iterationId.value = (list.find(i => i.startDate <= today && today <= i.endDate) ?? list[0])?.id ?? ''
}, { immediate: true })

function next() {
  if (!projectId.value) { err.project = 'Chọn dự án'; return }
  if (!iterationId.value) { err.iter = 'Chọn vòng lặp'; return }
  try { localStorage.setItem('pdpoint-addtask-project', projectId.value) } catch { /* bỏ qua */ }
  step.value = 'form'
}
function goCreateIter() { emit('close'); router.push(`/du-an/${projectId.value}?mo=vong-lap`) }
</script>

<style scoped>
.atf { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.atf__note { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.atf__note .ti { flex-shrink: 0; margin-top: 2px; }
.atf__note a { color: var(--text-brand); font-weight: var(--fw-medium); }
</style>
