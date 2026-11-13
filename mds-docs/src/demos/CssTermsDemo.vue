<template>
  <!-- Minh họa thuật ngữ CSS cho người không làm code: box model (Margin · Border · Padding · Content), Gap, Border radius, Font size / Line height.
       Màu giống công cụ Đo: nội dung xanh dương · Padding xanh lá · khoảng cách (Margin / Gap) cam đỏ. -->
  <div class="demo-stack">
    <p class="demo-label">1. Một phần tử gồm 4 lớp từ trong ra ngoài (box model)</p>
    <div class="ct-box">
      <div class="ct-margin">
        <span class="ct-tag ct-tag--margin">Margin — khoảng trống BÊN NGOÀI viền, đẩy phần tử khác ra xa</span>
        <div class="ct-border">
          <span class="ct-tag ct-tag--border">Border — đường viền</span>
          <div class="ct-padding">
            <span class="ct-tag ct-tag--padding">Padding — khoảng đệm BÊN TRONG viền, giữa viền và nội dung</span>
            <div class="ct-content">Content — nội dung (chữ, icon…)<br><b>Size</b> = rộng × cao của cả phần tử (tính tới hết Border)</div>
          </div>
        </div>
      </div>
    </div>

    <p class="demo-label">Ví dụ thật: nút bấm</p>
    <div class="demo-row ct-real">
      <div class="ct-btnwrap">
        <span class="ct-pad ct-pad--l">12</span>
        <button type="button" class="btn btn--primary"><TIcon name="plus" />Thêm mới</button>
        <span class="ct-pad ct-pad--r">12</span>
      </div>
      <span class="demo-muted">Padding left / right của nút = 12px: chữ cách mép nút 12px mỗi bên · Size cao 32px (mật độ Trung bình) = token <code>--btn-height</code></span>
    </div>

    <p class="demo-label">2. Gap — khoảng cách giữa các phần tử nằm cạnh nhau trong cùng một nhóm</p>
    <div class="demo-row ct-real">
      <div class="ct-gaprow">
        <button type="button" class="btn btn--outline btn--neutral">Hủy</button><span class="ct-gap">8</span><button type="button" class="btn btn--primary">Lưu</button>
      </div>
      <span class="demo-muted">Gap 8px = token <code>--gap-control</code>. Khác Padding (bên trong 1 phần tử) và Margin (bên ngoài 1 phần tử): Gap do <b>khung chứa</b> đặt, chia đều cho mọi phần tử con.</span>
    </div>

    <p class="demo-label">3. Border radius — độ bo tròn của góc</p>
    <div class="demo-row ct-real">
      <div v-for="r in RADII" :key="r.v" class="ct-radius" :style="{ borderRadius: r.v + 'px' }"><b>{{ r.v }}px</b><span>{{ r.use }}</span></div>
    </div>

    <p class="demo-label">4. Font size · Line height · Font weight</p>
    <div class="demo-row ct-real">
      <div class="ct-lh"><span class="ct-lh__line">Chữ mẫu Ổ Ậ</span><span class="ct-lh__mark">Khung nét đứt = <b>Line height</b> · độ cao chữ = <b>Font size</b></span></div>
      <span class="demo-muted"><b>Font size</b>: cỡ chữ. <b>Line height</b>: chiều cao một dòng chữ (gồm cả khoảng trống trên dưới chữ) — luôn lớn hơn Font size. <b>Font weight</b>: độ đậm — 400 Regular · 500 Medium · 600 Semi Bold · 700 Bold.</span>
    </div>
  </div>
</template>

<script setup>
import TIcon from '@mds/components/TIcon.vue'
const RADII = [{ v: 4, use: '--radius-sm' }, { v: 8, use: 'Control · card' }, { v: 12, use: 'Popup · dialog' }, { v: 999, use: 'Tròn (pill)' }]
</script>

<style scoped>
.ct-box { max-width: 640px; }
.ct-margin { position: relative; padding: 28px; background: repeating-linear-gradient(45deg, rgba(242, 72, 34, 0.12) 0 6px, rgba(242, 72, 34, 0.04) 6px 12px); border: 1px dashed #f24822; border-radius: var(--radius-card); }
.ct-border { position: relative; padding: 0; border: 6px solid #f5b400; border-radius: var(--radius-default); }
.ct-padding { position: relative; padding: 32px 24px 24px; background: rgba(20, 174, 92, 0.18); }
.ct-content { padding: 12px; background: rgba(13, 153, 255, 0.16); outline: 1px solid #0d99ff; text-align: center; font-size: var(--text-body); line-height: var(--text-body-lh); }
.ct-tag { position: absolute; left: 8px; top: 4px; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); }
.ct-tag--margin { color: #c2380f; top: 4px; }
.ct-tag--border { color: #8a6500; top: -26px; left: auto; right: 0; }
.ct-tag--padding { color: #0e7a43; }
.ct-real { align-items: center; gap: 16px; }
.ct-real .demo-muted { flex: 1; min-width: 240px; }
.ct-btnwrap { position: relative; display: inline-flex; }
.ct-pad { position: absolute; top: 50%; transform: translateY(-50%); z-index: 1; width: 12px; height: var(--btn-height); display: inline-flex; align-items: center; justify-content: center; background: rgba(20, 174, 92, 0.35); color: #fff; font-size: 9px; pointer-events: none; }
.ct-pad--l { left: 1px; border-radius: var(--radius-default) 0 0 var(--radius-default); }
.ct-pad--r { right: 1px; border-radius: 0 var(--radius-default) var(--radius-default) 0; }
.ct-gaprow { display: inline-flex; align-items: center; }
.ct-gap { width: var(--gap-control, 8px); height: var(--btn-height); display: inline-flex; align-items: center; justify-content: center; background: repeating-linear-gradient(45deg, rgba(242, 72, 34, 0.5) 0 3px, rgba(242, 72, 34, 0.2) 3px 6px); color: #c2380f; font-size: 9px; font-weight: var(--fw-bold); }
.ct-radius { width: 112px; height: 72px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border: 2px solid var(--stroke-brand); background: var(--bg-brand-light); font-size: var(--text-body); line-height: var(--text-body-lh); }
.ct-radius span { color: var(--text-secondary); }
.ct-lh { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.ct-lh__line { display: inline-block; font-size: 26px; line-height: 40px; background: rgba(13, 153, 255, 0.12); outline: 1px dashed #0d99ff; }
.ct-lh__mark { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
</style>
