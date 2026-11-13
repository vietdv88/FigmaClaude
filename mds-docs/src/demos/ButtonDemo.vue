<template>
  <div class="demo-stack">
    <div class="demo-row">
      <button class="btn btn--primary">Lưu</button>
      <button class="btn btn--outline btn--neutral">Hủy</button>
      <button class="btn btn--primary"><TIcon name="plus" />Thêm mới</button>
      <div class="btn-split">
        <button class="btn btn--primary">Lưu</button>
        <button class="btn btn--primary btn-split__arrow" aria-label="Thêm lựa chọn lưu"><TIcon name="chevron-down" /></button>
      </div>
    </div>
    <div class="demo-row">
      <button class="btn-icon btn-icon--outline" aria-label="Sửa"><TIcon name="pencil" /></button>
      <button class="btn-icon btn-icon--outline" aria-label="Thêm tùy chọn"><TIcon name="dots" /></button>
      <button class="btn-icon btn-icon--danger" aria-label="Xóa"><TIcon name="trash" /></button>
      <button class="btn btn--primary" disabled>Không bấm được</button>
      <AppButton label="Đang lưu" loading />
    </div>
    <!-- Link button = Figma Button Style=Text: không nền, rê chuột hiện nền nhạt, bấm đậm hơn -->
    <div class="demo-row">
      <span class="demo-muted">Link button:</span>
      <button class="btn btn--text">Xem tất cả</button>
      <button class="btn btn--text"><TIcon name="plus" />Thêm dòng</button>
      <button class="btn btn--text-neutral"><TIcon name="download" />Tải mẫu</button>
      <button class="btn btn--text-danger"><TIcon name="trash" />Xóa</button>
      <button class="btn btn--text" disabled>Không bấm được</button>
    </div>
    <div class="demo-muted">Liên kết chèn trong câu dùng chữ link: Xem <a href="#" class="btn btn--link" @click.prevent>hướng dẫn chi tiết</a> trước khi nhập.</div>

    <!-- Button Split xổ menu: phần chính làm việc hay dùng nhất, mũi tên mở các cách khác -->
    <p class="demo-label">Button Split xổ menu</p>
    <div class="demo-row">
      <div class="btn-split">
        <button class="btn btn--primary" @click="last = 'Thêm mới'"><TIcon name="plus" />Thêm mới</button>
        <DropdownMenu :items="addItems" placement="bottom-end" :min-width="220" @select="pick">
          <template #trigger="{ toggle, isOpen }">
            <button class="btn btn--primary btn-split__arrow" aria-label="Cách thêm khác" :aria-expanded="isOpen" @click.stop="toggle"><TIcon name="chevron-down" /></button>
          </template>
        </DropdownMenu>
      </div>
      <div class="btn-split">
        <button class="btn btn--outline btn--neutral" @click="last = 'Nhập khẩu'"><TIcon name="file-import" />Nhập khẩu</button>
        <DropdownMenu :items="importItems" placement="bottom-end" :min-width="240" @select="pick">
          <template #trigger="{ toggle, isOpen }">
            <button class="btn btn--outline btn--neutral btn-split__arrow" aria-label="Chọn cách nhập khẩu" :aria-expanded="isOpen" @click.stop="toggle"><TIcon name="chevron-down" /></button>
          </template>
        </DropdownMenu>
      </div>
    </div>
    <div v-if="last" class="demo-muted">Đã chọn: <b>{{ last }}</b></div>

    <!-- Bảng màu theo Figma: Button Medium (6019:11920) cao = --btn-height (32 ở Trung bình) · Button Small (6019:12695) cao − 4 (28).
         Mỗi cỡ: 7 màu × Solid / Outline / Text + Disabled · Neutral Inverse đặt trên nền tối / nền màu -->
    <template v-for="z in SIZES" :key="z.id">
      <p class="demo-label">{{ z.label }} — <code>{{ z.code }}</code></p>
      <div class="demo-sm-grid">
        <template v-for="r in MATRIX" :key="r.style">
          <span class="demo-muted demo-sm-grid__head">{{ r.style }}</span>
          <div class="demo-row demo-row--tight">
            <button v-for="c in r.items" :key="c.cls" class="btn" :class="[z.cls, c.cls]"><TIcon :name="c.icon || 'circle-plus'" />{{ c.label }}</button>
            <button class="btn" :class="[z.cls, r.items[0].cls]" disabled><TIcon name="circle-plus" />Disabled</button>
          </div>
        </template>
        <span class="demo-muted demo-sm-grid__head">Inverse</span>
        <div class="demo-row demo-row--tight demo-inverse">
          <button class="btn btn--white" :class="z.cls"><TIcon name="circle-plus" />Solid</button>
          <button class="btn btn--outline-inverse" :class="z.cls"><TIcon name="circle-plus" />Outline</button>
          <button class="btn btn--text-inverse" :class="z.cls"><TIcon name="circle-plus" />Text</button>
          <button class="btn btn--white" :class="z.cls" disabled><TIcon name="circle-plus" />Disabled</button>
        </div>
      </div>
    </template>

    <!-- Button Icon (Figma Button Icon Medium 6019:13890 · Small 6019:14107): vuông, icon 16 · mọi nút chỉ có icon phải có tooltip ghi tên -->
    <template v-for="z in ICON_SIZES" :key="'bi' + z.id">
      <p class="demo-label">{{ z.label }} — <code>.btn-icon{{ z.cls ? '.' + z.cls : '' }}</code></p>
      <div class="demo-sm-grid">
        <template v-for="r in ICON_MATRIX.filter(r => !r.smallOnly || z.id === 'sm')" :key="r.style">
          <span class="demo-muted demo-sm-grid__head">{{ r.style }}</span>
          <div class="demo-row demo-row--tight">
            <template v-for="c in ICON_COLORS" :key="c.id">
              <button v-if="c.id === 'ai'" type="button" class="btn btn--icon-only" :class="[r.ai, z.cls && 'btn--sm']" :aria-label="`AI — ${r.style}`" v-tip="`AI — ${r.style}`"><TIcon name="sparkles" /></button>
              <button v-else type="button" class="btn-icon" :class="[z.cls, r.cls, c.cls]" :aria-label="`${c.label} — ${r.style}`" v-tip="`${c.label} — ${r.style}`"><TIcon :name="c.icon" /></button>
            </template>
            <button type="button" class="btn-icon" :class="[z.cls, r.cls, 'btn-icon--brand']" disabled aria-label="Disabled"><TIcon name="pencil" /></button>
          </div>
        </template>
        <span class="demo-muted demo-sm-grid__head">White</span>
        <div class="demo-row demo-row--tight demo-inverse">
          <button v-for="r in ICON_MATRIX.filter(r => !r.smallOnly)" :key="r.style" type="button" class="btn-icon btn-icon--white" :class="[z.cls, r.cls]" :aria-label="`White — ${r.style}`" v-tip="`White — ${r.style}`"><TIcon name="settings" /></button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppButton from '@mds/components/AppButton.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
import { vTip } from '@mds/utils/tooltip.js'

const last = ref('')
const pick = item => (last.value = item.label)
const addItems = [
  { id: 'excel', label: 'Nhập khẩu từ Excel', icon: 'file-spreadsheet' },
  { id: 'photo', label: 'Nhập khẩu bằng ảnh', icon: 'photo-up' },
  { id: 'ai',    label: 'Nhập bằng AI từ văn bản', icon: 'sparkles', ai: true },
  { separator: true },
  { id: 'copy',  label: 'Nhân bản từ chứng từ cũ', icon: 'copy' },
]
const importItems = [
  { id: 'excel',  label: 'Nhập khẩu từ Excel', icon: 'file-spreadsheet' },
  { id: 'photo',  label: 'Nhập khẩu bằng ảnh chụp', icon: 'camera' },
  { id: 'scan',   label: 'Nhập khẩu từ file PDF / ảnh scan', icon: 'scan' },
  { separator: true },
  { id: 'tpl',    label: 'Tải file mẫu Excel', icon: 'download' },
  { id: 'hist',   label: 'Lịch sử nhập khẩu', icon: 'history' },
]
const SIZES = [
  { id: 'md', cls: '',        code: '.btn',          label: 'Button Medium' },
  { id: 'sm', cls: 'btn--sm', code: '.btn.btn--sm',  label: 'Button Small' },
]
const ICON_SIZES = [{ id: 'md', cls: '', label: 'Button Icon Medium' }, { id: 'sm', cls: 'btn-icon--sm', label: 'Button Icon Small' }]
const ICON_MATRIX = [
  { style: 'Solid',   cls: 'btn-icon--solid',   ai: 'btn--ai' },
  { style: 'Outline', cls: 'btn-icon--outline', ai: 'btn--ai-outline' },
  { style: 'Neutral Icon Color', cls: 'btn-icon--framed', ai: 'btn--ai-outline', smallOnly: true },
  { style: 'Icon',    cls: '',                  ai: 'btn--ai-text' },
]
const ICON_COLORS = [
  { id: 'brand', cls: 'btn-icon--brand', label: 'Brand', icon: 'plus' },
  { id: 'info', cls: 'btn-icon--info', label: 'Info', icon: 'info-circle' },
  { id: 'warning', cls: 'btn-icon--warning', label: 'Warning', icon: 'alert-triangle' },
  { id: 'danger', cls: 'btn-icon--danger', label: 'Danger', icon: 'trash' },
  { id: 'success', cls: 'btn-icon--success', label: 'Success', icon: 'check' },
  { id: 'neutral', cls: '', label: 'Neutral', icon: 'dots' },
  { id: 'ai', label: 'AI' },
]
const MATRIX = [
  { style: 'Solid', items: [
    { cls: 'btn--primary', label: 'Brand' }, { cls: 'btn--info', label: 'Info' }, { cls: 'btn--warning', label: 'Warning' },
    { cls: 'btn--danger', label: 'Danger' }, { cls: 'btn--success', label: 'Success' }, { cls: 'btn--black', label: 'Neutral' },
    { cls: 'btn--ai', label: 'AI', icon: 'sparkles' } ] },
  { style: 'Outline', items: [
    { cls: 'btn--outline', label: 'Brand' }, { cls: 'btn--outline-info', label: 'Info' }, { cls: 'btn--outline-warning', label: 'Warning' },
    { cls: 'btn--outline-danger', label: 'Danger' }, { cls: 'btn--outline-success', label: 'Success' }, { cls: 'btn--outline btn--neutral', label: 'Neutral' },
    { cls: 'btn--ai-outline', label: 'AI', icon: 'sparkles' } ] },
  { style: 'Text', items: [
    { cls: 'btn--text', label: 'Brand' }, { cls: 'btn--text-info', label: 'Info' }, { cls: 'btn--text-warning', label: 'Warning' },
    { cls: 'btn--text-danger', label: 'Danger' }, { cls: 'btn--text-success', label: 'Success' }, { cls: 'btn--text-neutral', label: 'Neutral' },
    { cls: 'btn--ai-text', label: 'AI', icon: 'sparkles' } ] },
]
</script>

<style scoped>
.demo-label { margin: 8px 0 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-row--tight { gap: 8px; }
.demo-sm-grid { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 12px 8px; align-items: center; }
.demo-sm-grid__head { align-self: center; }
.demo-inverse { padding: 8px 12px; border-radius: var(--radius-card); background: var(--bg-brand); }
@media (max-width: 640px) { .demo-sm-grid { grid-template-columns: minmax(0, 1fr); gap: 4px; } }
</style>
