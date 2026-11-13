<template>
  <DialogShell title="Chuyển công việc sang vòng lặp khác" :width="480" @close="$emit('close')">
    <div class="dlg-form">
      <p v-if="tasks.length === 1" class="pdp-mv-desc">Chuyển công việc <strong>{{ tasks[0].content || 'chưa có nội dung' }}</strong> từ <strong>{{ fromName }}</strong> sang:</p>
      <p v-else class="pdp-mv-desc">Chuyển <strong>{{ movable.length }}</strong> công việc đã chọn từ <strong>{{ fromName }}</strong> sang:</p>
      <AppInput label="Vòng lặp đích" :required="true" :message="error">
        <AppCombobox v-model="target" :options="targetOptions" placeholder="Chọn vòng lặp" :clearable="false" />
      </AppInput>
      <p v-if="locked.length" class="pdp-mv-warn">
        <TIcon name="lock" /><span>{{ locked.length }} công việc thuộc tháng đã chốt điểm — không chuyển được, sẽ bỏ qua.</span>
      </p>
      <p class="pdp-mv-hint">Chuyển vòng lặp không làm thay đổi điểm — điểm tính theo Ngày hoàn thành.</p>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button class="btn btn--primary" :disabled="!movable.length" @click="save">{{ tasks.length === 1 ? 'Chuyển' : `Chuyển ${movable.length} công việc` }}</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import DialogShell from './DialogShell.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppInput    from '@mds/components/AppInput.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { toast } from '@mds/utils/toast.js'
import { db, iterationsOf, iterationById, moveTasks, isTaskLocked } from '../store/db.js'

const props = defineProps({
  taskIds:   { type: Array,  required: true },
  projectId: { type: String, required: true },
  fromId:    { type: String, required: true },
})
const emit = defineEmits(['close', 'moved'])
const tasks   = computed(() => db.tasks.filter(t => props.taskIds.includes(t.id)))
const locked  = computed(() => tasks.value.filter(isTaskLocked))
const movable = computed(() => tasks.value.filter(t => !isTaskLocked(t)))
const fromName = computed(() => iterationById(props.fromId)?.name ?? '')
const targetOptions = computed(() => iterationsOf(props.projectId).filter(i => i.id !== props.fromId).map(i => ({ value: i.id, label: i.name })))
const target = ref(targetOptions.value[0]?.value ?? ''), error = ref('')

function save() {
  if (!target.value) { error.value = 'Chọn vòng lặp đích'; return }
  moveTasks(movable.value.map(t => t.id), target.value)
  toast.success(tasks.value.length === 1 ? `Đã chuyển công việc sang ${iterationById(target.value)?.name ?? ''}` : `Đã chuyển ${movable.value.length} công việc sang ${iterationById(target.value)?.name ?? ''}`)
  emit('moved', target.value, movable.value.length)
  emit('close')
}
</script>

<style scoped>
.dlg-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.pdp-mv-desc { font-size: var(--text-body); color: var(--text-secondary); }
.pdp-mv-desc strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pdp-mv-warn { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-warning-light); font-size: var(--text-body); color: var(--text-primary); }
.pdp-mv-warn .ti { color: var(--icon-warning); flex-shrink: 0; }
.pdp-mv-hint { font-size: var(--text-body); color: var(--text-secondary); }
</style>
