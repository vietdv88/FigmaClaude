<template>
  <div class="demo-stack">
    <div class="demo-row">
      <button type="button" class="btn btn--primary" @click="openForm"><TIcon name="plus" />Thêm nhân viên</button>
      <span class="demo-muted">Mở form → nhập vài chữ → bấm ✕ / Hủy / Esc: hiện cảnh báo. Không nhập gì thì đóng luôn. Đang nhập mà F5 / đóng tab: trình duyệt tự hỏi (cảnh báo mặc định của trình duyệt).</span>
    </div>

    <Teleport to="body">
      <div v-if="open" class="demo-modal-overlay" @mousedown.self="tryClose">
        <div class="demo-modal" role="dialog" aria-label="Thêm nhân viên">
          <AppFormPanel title="Thêm nhân viên" autofocus @close="tryClose">
            <div class="form-fields form-fields--h">
              <AppInput label="Họ và tên" :vertical="false"><AppTextbox v-model="form.name" placeholder="Nhập họ và tên" /></AppInput>
              <AppInput label="Email" :vertical="false"><AppTextbox v-model="form.email" placeholder="ten@congty.vn" /></AppInput>
              <AppInput label="Phòng ban" :vertical="false"><AppCombobox v-model="form.dept" :options="DEPTS" placeholder="Chọn phòng ban" /></AppInput>
            </div>
            <template #footer>
              <button type="button" class="btn btn--outline btn--neutral" @click="tryClose">Hủy</button>
              <button type="button" class="btn btn--primary" @click="save">Lưu</button>
            </template>
          </AppFormPanel>
        </div>
      </div>
      <!-- Cảnh báo thoát (Alert Dialog chuẩn): “Thoát và không lưu?” · nút Ở lại + Thoát, không lưu — chỉ hỏi THOÁT KHÔNG LƯU (người dùng bấm Hủy / ✕ là đã muốn thoát) — không hỏi “có muốn lưu không” -->
    </Teleport>
    <AppAlertDialog v-if="warn" title="Thoát và không lưu?" message="Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại."
      cancel-label="Ở lại" confirm-label="Thoát, không lưu" @cancel="warn = false" @confirm="discard" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppFormPanel from '@mds/components/AppFormPanel.vue'
import AppAlertDialog from '@mds/components/AppAlertDialog.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { toast } from '@mds/utils/toast.js'
import { useEscClose } from '@mds/utils/escStack.js'

const DEPTS = ['Kế toán', 'Kinh doanh', 'Nhân sự', 'Kỹ thuật']
const EMPTY = { name: '', email: '', dept: '' }
const open = ref(false), warn = ref(false)
const form = reactive({ ...EMPTY })
const dirty = computed(() => open.value && Object.keys(EMPTY).some(k => String(form[k] ?? '').trim()))   // chỉ cảnh báo khi ĐÃ nhập liệu

// F5 / đóng tab / đóng trình duyệt → dùng cảnh báo MẶC ĐỊNH của trình duyệt (form tự vẽ sẽ mất khi trang tải lại)
const onBeforeUnload = e => { e.preventDefault(); e.returnValue = '' }
watch(dirty, d => (d ? window.addEventListener('beforeunload', onBeforeUnload) : window.removeEventListener('beforeunload', onBeforeUnload)))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

function openForm() { Object.assign(form, EMPTY); open.value = true }
function tryClose() { if (dirty.value) warn.value = true; else open.value = false }
function discard() { warn.value = false; open.value = false; Object.assign(form, EMPTY) }
function save() { open.value = false; toast.success(`Đã thêm nhân viên “${form.name.trim() || 'chưa đặt tên'}”`); Object.assign(form, EMPTY) }
useEscClose(tryClose, () => open.value && !warn.value)
</script>
