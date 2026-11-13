<template>
  <!-- Panel Trợ giúp — component mds-ui AppHelpPanel (Figma MDS “Help Frame” 51535:79812), 2 biến thể:
       Default: header trắng — dùng cho app có header màu · Brand: header nền Brand — dùng cho app có header trắng.
       Màn hình mẫu: bấm ? › Hướng dẫn sử dụng (F1) → panel bên phải, đẩy app sang trái (không che), kéo cạnh trái đổi rộng 350px → 50% màn hình. -->
  <div class="demo-stack">
    <div class="hpd-variants">
      <div v-for="v in VARIANTS" :key="v.id" class="hpd-variant">
        <span class="demo-muted"><b>{{ v.label }}</b> — {{ v.note }}</span>
        <div class="hpd-box">
          <AppHelpPanel v-model="q[v.id]" :variant="v.id" @close="() => {}"><HelpArticleSample :q="q[v.id]" /></AppHelpPanel>
        </div>
      </div>
    </div>
    <span class="demo-muted">Trong màn hình: bấm ? trên header › Hướng dẫn sử dụng (F1) để mở panel. Header panel tự theo header app (đổi giao diện sáng / màu ở bánh răng). Kéo cạnh trái panel để đổi độ rộng.</span>
    <SidePanelFrame initial="help" />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import AppHelpPanel from '@mds/components/AppHelpPanel.vue'
import HelpArticleSample from './layout/HelpArticleSample.vue'
import SidePanelFrame from './layout/SidePanelFrame.vue'

const VARIANTS = [
  { id: 'default', label: 'Default', note: 'dùng cho app có header màu' },
  { id: 'brand',   label: 'Brand',   note: 'dùng cho app có header trắng' },
]
const q = reactive({ default: '', brand: '' })
</script>

<style scoped>
.hpd-variants { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 16px; }
.hpd-variant { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
/* Khung xem biến thể: rộng tối đa 500 (Figma) · cao 640 để thấy đủ header / tìm / nội dung cuộn / chân */
.hpd-box { width: 100%; max-width: 500px; height: 640px; padding-left: 8px; overflow: hidden; }
</style>
