<template>
  <div class="demo-stack">
    <div class="demo-row">
      <button type="button" class="btn btn--primary" @click="openPopup"><TIcon name="plus" />Thêm khách hàng</button>
      <span class="demo-muted">Bấm để mở popup thật (Esc / ✕ / Hủy để đóng) — bên dưới là bố cục popup “Form 1 cột”</span>
    </div>
    <div class="demo-row">
      <span class="demo-muted">Vị trí nhãn:</span>
      <div class="seg" role="group" aria-label="Vị trí nhãn">
        <button v-for="l in LAYOUTS" :key="l.id" type="button" class="seg__item" :class="{ 'seg__item--active': labelTop === l.top }" :aria-pressed="labelTop === l.top" @click="labelTop = l.top">{{ l.label }}</button>
      </div>
    </div>
    <!-- Bố cục popup đặt tĩnh trong khung ví dụ (giống Figma MDS Form 1 Column) -->
    <div class="demo-popup">
      <AppFormPanel title="Thêm khách hàng">
        <div :class="['form-fields', { 'form-fields--h': !labelTop }]">
          <AppInput label="Tên khách hàng" required :vertical="labelTop"><AppTextbox v-model="preview.name" placeholder="Nhập tên" /></AppInput>
          <AppInput label="Nhóm khách hàng" :vertical="labelTop"><AppCombobox v-model="preview.group" :options="GROUPS" placeholder="Chọn nhóm" /></AppInput>
          <AppInput label="Ngày hợp tác" :vertical="labelTop"><AppDatebox v-model="preview.date" /></AppInput>
          <AppInput label="Hạn mức nợ" :vertical="labelTop"><AppNumberbox v-model="preview.limit" :stepper="false" /></AppInput>
        </div>
        <template #footer>
          <button type="button" class="btn btn--outline btn--neutral">Hủy</button>
          <button type="button" class="btn btn--primary">Lưu</button>
        </template>
      </AppFormPanel>
    </div>

    <!-- Popup thật: lớp phủ + AppFormPanel, mở ra con trỏ ở ô đầu tiên, Lưu kiểm tra trường bắt buộc -->
    <Teleport to="body">
      <div v-if="open" class="demo-modal-overlay" @mousedown.self="open = false">
        <div class="demo-modal" role="dialog" aria-label="Thêm khách hàng">
          <AppFormPanel title="Thêm khách hàng" autofocus @close="open = false">
            <div ref="formEl" :class="['form-fields', { 'form-fields--h': !labelTop }]">
              <AppInput label="Tên khách hàng" required :vertical="labelTop" :message="errors.name"><AppTextbox v-model="form.name" placeholder="Nhập tên" /></AppInput>
              <AppInput label="Nhóm khách hàng" required :vertical="labelTop" :message="errors.group"><AppCombobox v-model="form.group" :options="GROUPS" placeholder="Chọn nhóm" /></AppInput>
              <AppInput label="Ngày hợp tác" :vertical="labelTop"><AppDatebox v-model="form.date" /></AppInput>
              <AppInput label="Hạn mức nợ" :vertical="labelTop"><AppNumberbox v-model="form.limit" :stepper="false" /></AppInput>
            </div>
            <template #footer>
              <button type="button" class="btn btn--outline btn--neutral" @click="open = false">Hủy</button>
              <button type="button" class="btn btn--primary" @click="save">Lưu</button>
            </template>
          </AppFormPanel>
        </div>
      </div>
    </Teleport>

    <!-- ── Popup phóng to / thu nhỏ ── -->
    <div class="demo-row" style="margin-top:16px">
      <button type="button" class="btn btn--outline btn--neutral" @click="openMax"><TIcon name="maximize" />Popup phóng to được</button>
      <span class="demo-muted">Bấm icon <strong>⤢</strong> trong header để phóng to full màn hình, bấm lại để thu nhỏ</span>
    </div>
    <Teleport to="body">
      <div v-if="openM" class="demo-modal-overlay" @mousedown.self="openM = false">
        <div class="demo-modal" role="dialog" aria-label="Xem hợp đồng">
          <AppFormPanel title="Hợp đồng HĐ-2024-00123" maximizable autofocus @close="openM = false">
            <div class="form-fields">
              <AppInput label="Khách hàng"><AppTextbox v-model="mForm.customer" /></AppInput>
              <AppInput label="Giá trị hợp đồng"><AppNumberbox v-model="mForm.value" :stepper="false" /></AppInput>
              <AppInput label="Ngày ký"><AppDatebox v-model="mForm.date" /></AppInput>
              <AppInput label="Ghi chú"><AppTextbox v-model="mForm.note" :rows="4" /></AppInput>
            </div>
            <template #footer>
              <button type="button" class="btn btn--outline btn--neutral" @click="openM = false">Đóng</button>
              <button type="button" class="btn btn--primary" @click="openM = false; toast.success('Đã lưu hợp đồng')">Lưu</button>
            </template>
          </AppFormPanel>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppFormPanel from '@mds/components/AppFormPanel.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppDatebox from '@mds/components/AppDatebox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import { toast } from '@mds/utils/toast.js'
import { focusFirstError } from '@mds/utils/fieldError.js'
import { useEscClose } from '@mds/utils/escStack.js'

const GROUPS = ['Doanh nghiệp', 'Hộ kinh doanh', 'Cá nhân']
// Form 1 cột: nhãn trái – ô phải (mặc định) · nhãn trên – ô dưới (popup hẹp / nhãn dài)
const LAYOUTS = [{ id: 'left', top: false, label: 'Nhãn trái, ô phải' }, { id: 'top', top: true, label: 'Nhãn trên, ô dưới' }]
const labelTop = ref(false)
const preview = reactive({ name: 'Công ty TNHH An Phát', group: 'Doanh nghiệp', date: '', limit: 50000000 })
const open = ref(false), formEl = ref(null)
const form = reactive({ name: '', group: '', date: '', limit: '' })
const errors = reactive({ name: '', group: '' })
useEscClose(() => { open.value = false }, () => open.value)

// Popup phóng to
const openM = ref(false)
const mForm = reactive({ customer: 'Công ty TNHH Phát Đạt', value: 150000000, date: '', note: '' })
useEscClose(() => { openM.value = false }, () => openM.value)
function openMax() { openM.value = true }

function openPopup() {
  Object.assign(form, { name: '', group: '', date: '', limit: '' }); Object.assign(errors, { name: '', group: '' })
  open.value = true
}
async function save() {
  errors.name = form.name.trim() ? '' : 'Nhập tên khách hàng'
  errors.group = form.group ? '' : 'Chọn nhóm khách hàng'
  if (errors.name || errors.group) { await nextTick(); return focusFirstError(formEl.value) }
  open.value = false
  toast.success(`Đã thêm khách hàng “${form.name.trim()}”`)
}
</script>
