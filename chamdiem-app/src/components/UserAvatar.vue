<template>
  <!-- Avatar người dùng — quy tắc giống DataTable: ảnh (tải lên / Google) nếu có; lỗi / chưa có → chữ cái đầu trên nền nhạt theo tên, viền nhạt.
       Luôn tròn; kích thước theo class của nơi dùng. -->
  <span class="pdp-uavatar" :class="{ 'pdp-uavatar--initials': !showImg }" :style="showImg ? null : avatarStyle(name)">
    <img v-if="showImg" :src="picture" :alt="name" referrerpolicy="no-referrer" class="pdp-uavatar__img" @error="broken = true" />
    <template v-else>{{ initials(name) }}</template>
  </span>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { avatarStyle, initials } from '../store/avatar.js'

const props = defineProps({
  name:    { type: String, default: '' },
  picture: { type: String, default: '' },
})
const broken = ref(false)
watch(() => props.picture, () => { broken.value = false })
const showImg = computed(() => !!props.picture && !broken.value)
</script>

<style scoped>
/* Avatar người luôn TRÒN (quy chuẩn) — nơi dùng chỉ đặt kích thước; ảnh hay chữ cái đều viền nhạt → cùng cỡ */
.pdp-uavatar { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 50%; overflow: hidden; box-sizing: border-box; border: 1px solid var(--stroke-neutral-light); }
.pdp-uavatar--initials { color: var(--text-primary); font-weight: var(--fw-semibold); line-height: 1; }
.pdp-uavatar__img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
