<template>
  <div class="demo-stack">
    <!-- Chọn biến thể đúng theo thuộc tính component Figma: Kiểu (Style) · Cỡ · Loại tag · Bấm được · Disabled -->
    <div class="demo-row tag-demo__opts" data-dsi-ignore>
      <span class="demo-muted">Kiểu:</span>
      <AppSegmented v-model="variant" :options="VARIANTS" aria-label="Kiểu tag" />
      <span class="demo-muted">Cỡ:</span>
      <AppSegmented v-model="size" :options="SIZES" aria-label="Cỡ tag" />
    </div>
    <div class="demo-row tag-demo__opts" data-dsi-ignore>
      <span class="demo-muted">Loại:</span>
      <AppSegmented v-model="kind" :options="KINDS" aria-label="Loại tag" />
      <AppCheckbox v-model="clickable" label="Bấm được (Hover / Pressed / Focus)" />
      <AppCheckbox v-model="disabled" label="Disabled" />
    </div>
    <span v-if="variant === 'text' && kind !== 'dot'" class="demo-muted">Kiểu Text chỉ có ở Tag Dot (chấm + chữ) — đã chuyển sang loại Chấm.</span>

    <div class="tag-demo__grid">
      <div v-for="c in COLORS" :key="c.value" class="tag-demo__cell">
        <AppTag
          :color="c.value" :variant="variant" :size="size" :clickable="clickable" :disabled="disabled"
          :label="kind === 'icon-only' ? '' : (kind === 'avatar' ? 'Thu Hà' : c.label)"
          :dot="effKind === 'dot'" :icon="effKind === 'icon' || effKind === 'icon-only' ? 'tag' : ''"
          :avatar="effKind === 'avatar' ? 'Nguyễn Thu Hà' : ''" :avatar-src="effKind === 'avatar' ? PHOTO : ''" :aria-label="c.label"
          v-tip="effKind === 'icon-only' ? c.label : ''"
        />
        <span class="demo-muted tag-demo__name">{{ c.figma }}</span>
      </div>
    </div>

    <p class="demo-label">Nhóm tag chỉ để hiển thị (ô bảng dữ liệu, thông tin chi tiết) — dư thì “+N” ở cuối</p>
    <div class="app-tag-group">
      <AppTag label="Thiết kế" color="brand" :size="size" />
      <AppTag label="Gấp" color="warning" :size="size" />
      <AppTag label="Lỗi" color="danger" :size="size" />
      <AppTag label="Đã duyệt" color="success" :size="size" />
      <AppTag label="+3" :size="size" class="app-tag--more" v-tip="'Kế toán, Nhân sự, Pháp chế'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppTag from '@mds/components/AppTag.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import { vTip } from '@mds/utils/tooltip.js'
import PHOTO from '../assets/avatar-sample.png'   // Figma Tag Avatar dùng ảnh chân dung (Avatar/Women 1)

const VARIANTS = [{ value: 'solid', label: 'Solid' }, { value: 'outline', label: 'Outline' }, { value: 'text', label: 'Text' }]
const SIZES = [{ value: 'xs', label: 'X Small 20' }, { value: 'sm', label: 'Small 24' }, { value: 'md', label: 'Medium 28' }]
const KINDS = [{ value: 'text', label: 'Chữ' }, { value: 'icon', label: 'Icon + chữ' }, { value: 'avatar', label: 'Avatar' }, { value: 'dot', label: 'Chấm' }, { value: 'icon-only', label: 'Chỉ icon' }]
const COLORS = [
  { value: 'brand', label: 'Brand', figma: 'Brand' }, { value: 'accent', label: 'Accent', figma: 'Accent' },
  { value: 'info', label: 'Info', figma: 'Info' }, { value: 'warning', label: 'Warning', figma: 'Warning' },
  { value: 'danger', label: 'Danger', figma: 'Danger' }, { value: 'success', label: 'Success', figma: 'Success' },
  { value: 'neutral', label: 'Neutral', figma: 'Neutral' },
]
const variant = ref('outline'), size = ref('sm'), kind = ref('text'), clickable = ref(false), disabled = ref(false)
/* Kiểu Text chỉ có ở Tag Dot */
const effKind = computed(() => (variant.value === 'text' ? 'dot' : kind.value))
</script>

<style scoped>
.demo-label { margin: 8px 0 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.tag-demo__opts { flex-wrap: wrap; }
.tag-demo__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 16px 12px; padding: 16px; border-radius: var(--radius-default); background: var(--bg-page); }
.tag-demo__cell { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; min-width: 0; }
.tag-demo__name { font-size: var(--text-body); }
</style>
