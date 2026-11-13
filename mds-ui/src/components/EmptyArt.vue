<template>
  <!-- Hình minh họa trạng thái trống (quy chuẩn /ds/empty-state) — SVG vẽ sẵn, đúng tỉ lệ, màu theo token (đổi theme tự đổi):
       nền tròn BG/Neutral Light · thẻ trắng viền Stroke/Neutral · dòng nội dung BG/Neutral Hover · điểm nhấn Brand (+) hoặc kính lúp
       Cùng 1 bố cục cho mọi dạng: HÌNH CHÍNH (thẻ chứng từ / biểu đồ) + HÌNH PHỤ (huy hiệu tròn r11 góc dưới phải), cùng cỡ
       variant: doc (+ · danh sách lần đầu) · cleared (thùng rác · đã xóa hết) · search (kính lúp · tìm / lọc không ra) · chart (+ · Tổng quan tài khoản mới) -->
  <svg class="empty-art" :width="width" :height="width * 0.8" viewBox="0 0 120 96" fill="none" aria-hidden="true" focusable="false">
    <circle cx="60" cy="50" r="40" class="ea-bg" />
    <circle cx="18" cy="26" r="3" class="ea-dot" /><circle cx="104" cy="20" r="2" class="ea-dot" /><circle cx="108" cy="70" r="2.5" class="ea-dot" />

    <template v-if="variant === 'chart'">
      <rect x="28" y="24" width="64" height="50" rx="6" class="ea-card" />
      <rect x="36" y="32" width="22" height="4" rx="2" class="ea-line" />
      <rect x="38" y="54" width="7" height="12" rx="1.5" class="ea-bar" /><rect x="49" y="47" width="7" height="19" rx="1.5" class="ea-bar" />
      <rect x="60" y="51" width="7" height="15" rx="1.5" class="ea-bar" /><rect x="71" y="42" width="7" height="24" rx="1.5" class="ea-bar ea-bar--strong" />
      <rect x="36" y="66" width="48" height="1.5" rx="0.75" class="ea-line" />
    </template>
    <template v-else>
      <rect x="36" y="16" width="48" height="62" rx="6" class="ea-card" />
      <rect x="44" y="27" width="20" height="4" rx="2" class="ea-line ea-line--strong" />
      <rect x="44" y="37" width="32" height="4" rx="2" class="ea-line" />
      <rect x="44" y="46" width="26" height="4" rx="2" class="ea-line" />
      <rect x="44" y="55" width="30" height="4" rx="2" class="ea-line" />
    </template>

    <!-- Hình phụ: huy hiệu tròn r11 cùng vị trí — + (Brand) · kính lúp (Brand) · thùng rác (Icon/Neutral) -->
    <circle cx="86" cy="72" r="11" class="ea-accent" :class="{ 'ea-accent--neutral': variant === 'cleared' }" />
    <g v-if="variant === 'search'" class="ea-glyph">
      <circle cx="84.5" cy="70.5" r="4" /><path d="M87.5 73.5 L91 77" />
    </g>
    <g v-else-if="variant === 'cleared'" class="ea-glyph">
      <path d="M80.5 67.5 H91.5 M84 67.5 V66 H88 V67.5 M82 67.5 L82.8 77.5 H89.2 L90 67.5 M84.8 70.5 V75 M87.2 70.5 V75" />
    </g>
    <g v-else class="ea-glyph"><path d="M86 67 V77 M81 72 H91" /></g>
  </svg>
</template>

<script setup>
defineProps({
  /** 'doc' | 'cleared' | 'search' | 'chart' */
  variant: { type: String, default: 'doc' },
  /** Bề rộng px (cao = 0,8 × rộng) — mặc định 120, màn lần đầu dùng 160 */
  width:   { type: Number, default: 120 },
})
</script>

<style scoped>
.empty-art { display: block; flex-shrink: 0; }
.ea-bg { fill: var(--bg-neutral-light); }
.ea-dot { fill: var(--stroke-neutral-light); }
.ea-card { fill: var(--bg-white); stroke: var(--stroke-neutral); stroke-width: 1.5; }
.ea-line { fill: var(--bg-neutral-hover); }
.ea-line--strong { fill: var(--stroke-neutral); }
.ea-bar { fill: var(--bg-brand-light-pressed); }
.ea-bar--strong { fill: var(--bg-brand); }
.ea-accent { fill: var(--bg-brand); }
.ea-accent--neutral { fill: var(--icon-neutral); }
.ea-glyph { fill: none; stroke: var(--icon-white); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.ea-glyph circle { stroke-width: 1.8; }
</style>
