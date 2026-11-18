<template>
  <!-- AppPopover (mds-ui): lớp nổi nội dung tuỳ ý — menu = khung Menu List, panel = Figma Body Filter -->
  <div class="demo-stack">
    <div class="demo-row">
      <AppPopover placement="bottom-start">
        <template #trigger="{ toggle }">
          <button type="button" class="btn btn--outline btn--neutral" @click="toggle"><TIcon name="user" />{{ owner || 'Chọn người phụ trách' }}</button>
        </template>
        <template #default="{ close }">
          <AppSearchbox v-model="q" placeholder="Tìm người" />
          <button v-for="p in people" :key="p" type="button" class="dropdown-menu__item" :class="{ 'dropdown-menu__item--active': p === owner }" @click="owner = p; close()">
            <AppAvatar :size="24" :name="p" /><span class="dropdown-menu__label">{{ p }}</span>
          </button>
          <span v-if="!people.length" class="demo-muted">Không tìm thấy người phù hợp</span>
        </template>
      </AppPopover>
      <span class="demo-muted">variant="menu" — danh sách chọn có ô tìm kiếm</span>
    </div>

    <div class="demo-row">
      <AppPopover variant="panel" title="Bộ lọc" placement="bottom-start">
        <template #trigger="{ toggle }">
          <button type="button" class="btn-icon btn-icon--outline" aria-label="Bộ lọc" v-tip="'Bộ lọc'" @click="toggle"><TIcon name="filter" /></button>
        </template>
        <AppInput label="Trạng thái"><AppCombobox v-model="status" :options="STATUS" placeholder="Tất cả" /></AppInput>
        <AppInput label="Tỉnh/Thành"><AppCombobox v-model="city" :options="CITY" placeholder="Tất cả" /></AppInput>
        <template #footer="{ close }">
          <button type="button" class="btn btn--outline btn--neutral" data-left @click="status = ''; city = ''">Bỏ lọc</button>
          <button type="button" class="btn btn--primary" @click="toast.success('Đã áp dụng bộ lọc'); close()">Áp dụng</button>
        </template>
      </AppPopover>
      <span class="demo-muted">variant="panel" — tiêu đề + ✕, chân Bỏ lọc / Áp dụng · chọn trong Combobox không làm đóng popover</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppPopover from '@mds/components/AppPopover.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import AppAvatar from '@mds/components/AppAvatar.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'

const ALL = ['Lê Minh', 'Trần Hậu', 'Phạm Quân', 'Vũ Lan', 'Nguyễn An']
const q = ref(''), owner = ref(''), status = ref(''), city = ref('')
const people = computed(() => ALL.filter(p => matchText([p], q.value)))
const STATUS = ['Đang giao dịch', 'Chờ duyệt', 'Ngừng giao dịch'].map(v => ({ value: v, label: v }))
const CITY = ['Hà Nội', 'TP.HCM', 'Đà Nẵng'].map(v => ({ value: v, label: v }))
</script>
