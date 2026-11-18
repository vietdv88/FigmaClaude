<template>
  <!-- AppDrawer — chi tiết dạng drawer bên phải (/ds/layout › Master + Detail dạng drawer):
       đè lên danh sách nhưng danh sách VẪN bấm được để đổi bản ghi · kéo mép trái đổi độ rộng (nhấp đúp về mặc định, nhớ theo storageKey)
       · Esc / ✕ đóng · đầu: tiêu đề (cắt …) + actions (Sửa, ⋯) + ✕ · thân cuộn riêng · chân tuỳ chọn (Lưu / Hủy).
       Đặt TRONG <AppPage> (neo theo khung trang, không che header / sidebar). -->
  <aside v-if="open" class="app-drawer" :style="{ width: width + 'px' }" v-resizable-drawer="{ key: storageKey, min: minWidth }" :aria-label="title">
    <div class="app-drawer__head">
      <h3 class="app-drawer__title" :title="title">{{ title }}</h3>
      <slot name="actions" />
      <button type="button" class="btn-icon" v-tip="'Đóng (Esc)'" aria-label="Đóng" @click="emit('update:open', false)"><TIcon name="x" /></button>
    </div>
    <div class="app-drawer__body"><slot /></div>
    <footer v-if="$slots.footer" class="app-drawer__footer"><slot name="footer" /></footer>
  </aside>
</template>

<script setup>
import TIcon from './TIcon.vue'
import { vTip } from '../utils/tooltip.js'
import { vResizableDrawer } from '../utils/resizableDrawer.js'
import { useEscClose } from '../utils/escStack.js'

const props = defineProps({
  open:       { type: Boolean, default: false },
  title:      { type: String, default: '' },
  width:      { type: Number, default: 420 },
  minWidth:   { type: Number, default: 320 },
  storageKey: { type: String, default: '' },
})
const emit = defineEmits(['update:open'])
useEscClose(() => emit('update:open', false), () => props.open)
</script>
