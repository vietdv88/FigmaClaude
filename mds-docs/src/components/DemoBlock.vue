<template>
  <section class="ds-demo">
    <header class="ds-demo__bar">
      <span class="ds-demo__title"><TIcon name="player-play" />{{ info ? info.title : `Ví dụ “${name}”` }}</span>
      <div class="ds-demo__tools">
        <!-- Màu nền khung ví dụ: Trắng | Xám (BG Page) — xem control đặt trên từng nền (nhớ chung cho mọi ví dụ) -->
        <AppCombobox v-if="info" v-model="demoBg" :options="BG_OPTIONS" class="ds-demo__bg" :clearable="false" />
        <AppCombobox v-if="info" :model-value="currentDensity" :options="densityOptions" class="ds-demo__density" :clearable="false" @update:model-value="applyDensity" />
        <!-- Mode Font Size theo Figma (collection 🔢 Font Size): Small · Medium · Large · Mobile Responsive — đổi cỡ chữ toàn trang như Thiết lập hiển thị › Cỡ chữ -->
        <AppCombobox v-if="info" :model-value="fontMode" :options="fontOptions" class="ds-demo__font" :clearable="false" @update:model-value="setFont" />
        <!-- Đo thông số: rê chuột lên phần tử trong khung → font, cỡ, độ đậm, màu (tên token), cao, bo góc, đệm, viền, khoảng cách -->
        <button v-if="info" type="button" class="btn btn--outline btn--neutral" :class="{ 'btn--active': inspect }" :aria-pressed="inspect" @click="inspect = !inspect">
          <TIcon name="ruler-measure" />{{ inspect ? 'Tắt đo' : 'Đo' }}
        </button>
        <!-- Lúc đang đo: bật / tắt giải thích thuật ngữ trong thẻ thông số + link trang Thuật ngữ CSS (thẻ chạy theo chuột nên link không đặt trong thẻ) -->
        <template v-if="inspect">
          <AppCheckbox v-model="explain" label="Giải thích" />
          <a :href="BASE + 'css-terms'" target="_blank" rel="noopener" class="btn btn--text"><TIcon name="book" />Thuật ngữ CSS</a>
        </template>
        <button v-if="info" type="button" class="btn btn--outline btn--neutral" :class="{ 'btn--active': showCode }" :aria-pressed="showCode" @click="toggleCode">
          <TIcon name="code" />{{ showCode ? 'Ẩn code' : 'Xem code' }}
        </button>
      </div>
    </header>
    <div v-if="!info" class="ds-demo__missing">Chưa có ví dụ mã “{{ name }}”. Kiểm tra lại mã ví dụ trong khối <code>::: demo</code>.</div>
    <div v-else ref="stageEl" class="ds-demo__stage" :class="{ 'ds-demo__stage--page': demoBg === 'page' }"><component :is="comp" v-if="comp" /></div>
    <DemoInspector v-if="inspect && stageEl" :root="stageEl" :explain="explain" @close="inspect = false" />
    <div v-if="showCode" class="ds-demo__code">
      <button type="button" class="btn-icon btn-icon--sm ds-demo__copy" aria-label="Sao chép code" @click="copy"><TIcon name="copy" /></button>
      <pre><code>{{ code || 'Đang tải…' }}</code></pre>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, shallowRef, defineAsyncComponent } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { toast } from '@mds/utils/toast.js'
import { copyText } from '../copyText.js'
import { DENSITIES, currentDensity, applyDensity, currentFontSize, applyFontSize } from '@mds/theme.js'
import { DEMOS, demoComponent, demoSource } from '../demos/index.js'
import { demoBg, BG_OPTIONS, mobileFontPreview, demoInspect as inspect, demoExplain as explain } from '../demoBg.js'
import DemoInspector from './DemoInspector.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'

const props = defineProps({ name: { type: String, required: true } })
const info = computed(() => DEMOS[props.name])
const comp = computed(() => (info.value ? defineAsyncComponent(demoComponent(props.name)) : null))
const densityOptions = DENSITIES.map(d => ({ value: d.id, label: `Mật độ: ${d.label}` }))
const fontOptions = [
  { value: 'small', label: 'Font size: Small' }, { value: 'medium', label: 'Font size: Medium' },
  { value: 'large', label: 'Font size: Large' }, { value: 'mobile', label: 'Font size: Mobile Responsive' },
]
const fontMode = computed(() => (mobileFontPreview.value ? 'mobile' : currentFontSize.value || 'small'))
// Mobile Responsive chỉ để xem thử (app tự dùng ở màn ≤ 640px) → không lưu làm lựa chọn của người dùng
function setFont(v) {
  mobileFontPreview.value = v === 'mobile'
  if (v === 'mobile') document.documentElement.setAttribute('data-font-size', 'mobile')
  else applyFontSize(v)
}
const showCode = ref(false), code = shallowRef(''), stageEl = ref(null)   // inspect / explain: dùng chung mọi khung (demoBg.js) — Đo mặc định bật
const BASE = import.meta.env.BASE_URL

async function toggleCode() {
  showCode.value = !showCode.value
  if (showCode.value && !code.value) code.value = (await demoSource(props.name)()).trim()
}
async function copy() {
  if (await copyText(code.value)) toast.success('Đã sao chép code')
  else toast.error('Trình duyệt chặn sao chép — hãy bôi đen và sao chép thủ công')
}
</script>
