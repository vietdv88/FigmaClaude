<template>
  <div class="demo-stack">
    <!-- Avatar chữ cái nền Brand Light Hover → đổi theme là đổi màu nền -->
    <div class="demo-row">
      <span class="demo-muted">Theme (đổi cả trang):</span>
      <div class="demo-av-themes" role="radiogroup" aria-label="Màu chủ đề">
        <button v-for="c in COLORS" :key="c.id" type="button" class="demo-av-theme" :class="{ 'demo-av-theme--on': currentTheme === c.id }"
          role="radio" :aria-checked="currentTheme === c.id" :aria-label="c.label" v-tip="c.label" :style="{ background: c.main }" @click="applyTheme(c.id)">
          <TIcon v-if="currentTheme === c.id" name="check" />
        </button>
      </div>
    </div>

    <div class="demo-av-grid">
      <span class="demo-muted">Cỡ</span>
      <span v-for="s in SIZES" :key="s" class="demo-muted demo-av-grid__size">{{ s }}</span>
      <span class="demo-muted">Ảnh</span>
      <span v-for="s in SIZES" :key="'i' + s" class="demo-av-cell"><AppAvatar :size="s" name="Nguyễn Thu Hà" :src="PHOTO" /></span>
      <span class="demo-muted">Chữ · Brand</span>
      <span v-for="s in SIZES" :key="'b' + s" class="demo-av-cell"><AppAvatar :size="s" name="Trần Hậu" /></span>
      <span class="demo-muted">Chữ · Neutral</span>
      <span v-for="s in SIZES" :key="'n' + s" class="demo-av-cell"><AppAvatar :size="s" name="Lê Minh" color="neutral" /></span>
      <span class="demo-muted">Badge Dot</span>
      <span v-for="s in SIZES" :key="'d' + s" class="demo-av-cell"><AppAvatar :size="s" name="Nguyễn Thu Hà" :src="PHOTO" dot online /></span>
      <span class="demo-muted">Trống</span>
      <span v-for="s in SIZES" :key="'e' + s" class="demo-av-cell"><AppAvatar :size="s" /></span>
    </div>

    <p class="demo-label">Badge</p>
    <div class="demo-row demo-av-badges">
      <span class="demo-av-item"><AppAvatar :size="48" name="Nguyễn Thu Hà" :src="PHOTO" dot online /><small>Dot</small></span>
      <span class="demo-av-item"><AppAvatar :size="48" name="Nguyễn Thu Hà" :src="PHOTO" :count="6" online /><small>Text &amp; Icon Top</small></span>
      <span class="demo-av-item"><AppAvatar :size="48" name="Nguyễn Thu Hà" :src="PHOTO" dot badge-icon="camera" /><small>Text &amp; Icon Bottom</small></span>
      <span class="demo-av-item"><AppAvatar :size="80" name="Nguyễn Thu Hà" :src="PHOTO" :count="6" badge-icon="camera" /><small>Cỡ 80</small></span>
    </div>

    <p class="demo-label">State Hover + Active</p>
    <!-- Figma _Avatar Type Item: Hover + Active có đủ 3 kiểu (Ảnh · Chữ cái · Trống) — vòng 2px Stroke/Brand Light, cỡ ảnh không đổi.
         Lưới dưới đặt cạnh nhau Default ↔ Hover + Active (dùng prop active để giữ trạng thái) để so sánh; hàng cuối rê chuột / bấm thử thật -->
    <div class="demo-av-grid">
      <span class="demo-muted">Cỡ</span>
      <span v-for="s in SIZES" :key="s" class="demo-muted demo-av-grid__size">{{ s }}</span>
      <template v-for="t in STATE_TYPES" :key="t.id">
        <span class="demo-muted">{{ t.label }} · Default</span>
        <span v-for="s in SIZES" :key="t.id + 'd' + s" class="demo-av-cell"><AppAvatar :size="s" :name="t.name" :src="t.src" /></span>
        <span class="demo-muted">{{ t.label }} · Hover + Active</span>
        <span v-for="s in SIZES" :key="t.id + 'h' + s" class="demo-av-cell"><AppAvatar :size="s" :name="t.name" :src="t.src" active /></span>
      </template>
    </div>
    <p class="demo-muted">Thử thật: rê chuột để xem Hover, bấm để chọn (Active).</p>
    <div class="demo-row">
      <span class="demo-muted">Ảnh</span>
      <AppAvatar v-for="p in PEOPLE" :key="'a' + p" :size="40" :name="p" :src="PHOTO" interactive :active="picked === p" v-tip="p" @click="picked = p" />
      <span class="demo-muted">Chữ cái</span>
      <AppAvatar v-for="p in PEOPLE" :key="p" :size="40" :name="p" interactive :active="picked === p" v-tip="p" @click="picked = p" />
      <span class="demo-muted">Đang chọn: <b>{{ picked }}</b></span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppAvatar from '@mds/components/AppAvatar.vue'
import TIcon from '@mds/components/TIcon.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { COLORS, currentTheme, applyTheme } from '@mds/theme.js'
import photoUrl from '../assets/avatar-sample.png'

const SIZES = [12, 16, 20, 24, 32, 40, 48, 56, 80]
/* Ảnh “Avatar/Women 1” lấy từ component Figma Avatar */
const PHOTO = photoUrl
/* Kiểu avatar trong lưới so sánh trạng thái: Ảnh · Chữ cái · Trống (Figma _Avatar Type Item) */
const STATE_TYPES = [{ id: 'img', label: 'Ảnh', name: 'Nguyễn Thu Hà', src: PHOTO }, { id: 'txt', label: 'Chữ cái', name: 'Trần Hậu', src: '' }, { id: 'empty', label: 'Trống', name: '', src: '' }]
const PEOPLE = ['Nguyễn An', 'Trần Bình', 'Lê Chi', 'Phạm Dũng', 'Hoàng Giang']
const picked = ref('Lê Chi')
</script>

<style scoped>
.demo-label { margin: 8px 0 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-av-themes { display: flex; flex-wrap: wrap; gap: 6px; }
.demo-av-theme { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; border: 2px solid var(--stroke-white); border-radius: var(--radius-pill);
  box-shadow: 0 0 0 1px var(--stroke-neutral-light); cursor: pointer; color: var(--icon-white); }
.demo-av-theme .ti { font-size: 14px; }
.demo-av-theme--on { box-shadow: 0 0 0 2px var(--stroke-brand); }
.demo-av-grid { display: grid; grid-template-columns: 104px repeat(9, minmax(min-content, 1fr)); align-items: center; gap: 12px 8px; overflow-x: auto; padding-bottom: 4px; }
.demo-av-grid__size { text-align: center; }
.demo-av-cell { display: flex; justify-content: center; }
.demo-av-badges { gap: 24px; align-items: flex-start; }
.demo-av-item { display: inline-flex; flex-direction: column; align-items: center; gap: 8px; }
.demo-av-item small { font-size: var(--text-body); color: var(--text-secondary); }
@media (max-width: 640px) {
  .demo-av-grid { grid-template-columns: 88px repeat(9, min-content); gap: 12px; }
}
</style>
