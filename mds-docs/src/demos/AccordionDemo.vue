<template>
  <div class="demo-stack">
    <!-- Thuộc tính Figma: Style Outline (True / False) · thêm cách mở: nhiều mục cùng lúc hoặc 1 mục -->
    <div class="demo-row acc-demo__opts" data-dsi-ignore>
      <span class="demo-muted">Style Outline:</span>
      <AppSegmented v-model="outline" :options="OUTLINE" aria-label="Kiểu accordion" />
      <AppCheckbox v-model="single" label="Chỉ mở 1 mục" />
    </div>
    <div class="acc-demo__stage" :class="!outline && 'acc-demo__stage--flat'">
      <AppAccordion v-model="open" :items="ITEMS" :outline="outline" :multiple="!single">
        <template #item-fee>
          <p class="acc-demo__p">Phí được tính theo số người dùng đang hoạt động trong tháng:</p>
          <ul class="acc-demo__ul"><li>Dưới 50 người: 120.000 đ / người</li><li>Từ 50 người: 95.000 đ / người</li></ul>
        </template>
      </AppAccordion>
    </div>
    <span class="demo-muted">Bấm cả hàng tiêu đề để mở / đóng; Tab tới tiêu đề rồi Enter / Space cũng được.</span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppAccordion from '@mds/components/AppAccordion.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'

const OUTLINE = [{ value: true, label: 'True' }, { value: false, label: 'False' }]
const ITEMS = [
  { key: 'what', title: 'Ứng dụng dùng để làm gì?', content: 'Quản lý công việc, dự án và tiến độ của cả nhóm trên cùng một nơi.' },
  { key: 'fee', title: 'Phí sử dụng tính thế nào?' },
  { key: 'data', title: 'Dữ liệu có được sao lưu không?', content: 'Dữ liệu được sao lưu tự động mỗi ngày và giữ trong 30 ngày.' },
]
const outline = ref(true), single = ref(false), open = ref(['fee', 'data'])
watch(single, v => { if (v && open.value.length > 1) open.value = open.value.slice(0, 1) })
</script>

<style scoped>
.acc-demo__opts { flex-wrap: wrap; }
.acc-demo__stage { max-width: 480px; }
.acc-demo__p { margin: 0 0 4px; }
.acc-demo__ul { margin: 0; padding-left: 20px; }
</style>
