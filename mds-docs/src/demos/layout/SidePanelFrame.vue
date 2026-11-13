<template>
  <!-- Màn hình mẫu TỔNG QUAN (Bố cục › Tổng quan — dùng chung DashboardScreen + LayoutFrame, header thật ControlHeader) 1440 × 800
       + PANEL PHẢI dùng chung cho Cửa sổ chat AI Agent / AMIS Chat / Trợ giúp (Help). Quy chuẩn (/ds/chatbox-ai-agent, /ds/help):
       · Panel nằm BÊN PHẢI, DƯỚI UI của app — đẩy app sang trái, KHÔNG che nội dung; cao hết màn hình (ngang hàng header).
       · Rê chuột vào cạnh trái panel → vạch màu + nút ↔, kéo để đổi rộng: tối thiểu 350px · tối đa 50% màn hình.
       · App bên trái co tối thiểu 1024px — hẹp hơn thì hiện thanh cuộn ngang dưới cùng vùng app.
       · Chỉ 1 panel tại một thời điểm: avatar agent → Chat agent · AMIS Chat → chat · ? › Hướng dẫn sử dụng (F1) → Trợ giúp (đang mở Chat AVA thì ẩn, hiện Trợ giúp). -->
  <div class="spf-root" @pointerenter="hover = true" @pointerleave="hover = false">
    <LayoutFrame :width="W" :height="H" :active="0" :help-menu="HELP_MENU" @help-select="onHelpMenu">
      <template #bar>
        <!-- Header panel Trợ giúp tự theo header app (Figma 51535:79812): app header màu → Default (trắng) · app header trắng → Brand -->
        <span v-if="open && mode === 'help'" class="demo-muted">Header panel: <b>{{ helpVariant === 'brand' ? 'Brand' : 'Trắng' }}</b> (app header {{ helpVariant === 'brand' ? 'trắng' : 'màu' }})</span>
        <span class="demo-muted">Panel <b>{{ open ? Math.round(pw) + 'px' : 'đóng' }}</b> · App bên trái <b>{{ Math.round(appW) }}px</b><template v-if="appW < MIN_APP"> &lt; 1024 → có thanh cuộn ngang</template></span>
      </template>
      <template #header-actions>
        <!-- Avatar agent trên header → mở cửa sổ chat agent -->
        <button type="button" class="btn-icon-white spf-hd__agent" :class="{ 'btn-icon-white--active': open && mode === 'agent' }" :aria-pressed="open && mode === 'agent'" :aria-label="agent.name" v-tip="agent.name" @click="toggle('agent')">
          <img :src="agentAvatar" alt="" width="24" height="24" />
        </button>
        <!-- Logo AMIS Chat → mở box chat ở CHÍNH vị trí panel -->
        <button type="button" class="btn-icon-white spf-hd__badge" :class="{ 'btn-icon-white--active': open && mode === 'chat' }" :aria-pressed="open && mode === 'chat'" aria-label="AMIS Chat" v-tip="'AMIS Chat'" @click="toggle('chat')">
          <TIcon name="message-circle" /><span class="header-badge">20</span>
        </button>
      </template>
      <DashboardScreen />
      <template #panel="{ scale }">
    <!-- ── PANEL PHẢI ── -->
    <aside v-if="open" class="spf-panel" :class="{ 'drawer-resizing': dragging, 'spf-panel--help': mode === 'help' }" :style="{ width: pw + 'px' }" :aria-label="mode === 'help' ? 'Trợ giúp' : mode === 'chat' ? 'AMIS Chat' : agent.name">
      <!-- Cạnh trái: rê chuột → vạch màu + nút ↔ · kéo để đổi rộng (350px → 50% màn hình) -->
      <!-- Tay kéo chuẩn mds-ui (.drawer-resize như v-resizable-drawer): rê → vạch Stroke/Brand + nút ↔ · kéo đổi rộng 350px → 50% màn hình · nhấp đúp về mặc định (chat 350 · Trợ giúp 500) -->
      <div class="drawer-resize" role="separator" aria-orientation="vertical" :aria-valuenow="Math.round(pw)" :aria-valuemin="MIN_PANEL" :aria-valuemax="W / 2"
        aria-label="Kéo để đổi độ rộng panel" title="Kéo để đổi độ rộng · nhấp đúp để về mặc định" tabindex="0"
        @pointerdown="e => startDrag(e, scale)" @dblclick="pw = defW()" @keydown.left.prevent="nudge(16)" @keydown.right.prevent="nudge(-16)"><span class="drawer-resize__knob" /></div>

      <!-- Header panel (Figma AVA Default 1132:67568): cao 60 · đệm ngang 16 · icon 24 (‹ ⋯ ✕) · avatar 32 · tên Body Bold gradient AI + tag Beta · dòng phụ Body Small -->
      <div v-if="mode !== 'help'" class="spf-ph">
        <button type="button" class="btn-icon" aria-label="Quay lại" v-tip="'Quay lại'" @click="back"><TIcon name="chevron-left" /></button>
        <template v-if="mode === 'agent'">
          <span class="spf-ph__av spf-ph__av--ai"><img :src="agentAvatar" alt="" width="32" height="32" /></span>
          <div class="spf-ph__txt">
            <span class="spf-ph__name"><span class="text-ai-primary spf-ph__name--ai">{{ agent.name }}</span><AppTag label="Beta" color="brand" size="xs" /></span>
            <span class="spf-ph__sub">{{ agent.role }}</span>
          </div>
        </template>
        <template v-else>
          <AppAvatar :src="personAvatar" name="Vũ Thị Thu Trang" :size="32" />
          <div class="spf-ph__txt"><span class="spf-ph__name">Vũ Thị Thu Trang</span><span class="spf-ph__sub">Nhân viên thiết kế</span></div>
        </template>
        <div class="spf-ph__acts">
          <button type="button" class="btn-icon" aria-label="Thêm" v-tip="'Thêm'"><TIcon name="dots" /></button>
          <button type="button" class="btn-icon" aria-label="Đóng" v-tip="'Đóng'" @click="open = false"><TIcon name="x" /></button>
        </div>
      </div>

      <!-- AGENT / AMIS CHAT -->
      <template v-if="mode !== 'help'">
        <div ref="msgEl" class="spf-msgs">
          <div v-if="mode === 'agent' && !thread.agent.length" class="spf-hello">
            <!-- Ảnh agent 173 × 176 (Figma: agent cần chỗ tải ảnh lên) · lớp mờ trắng ở chân ảnh -->
            <span class="spf-hello__art"><img :src="mascot" alt="" class="spf-hello__mascot" /></span>
            <p class="spf-hello__hi">Xin chào anh Chung!</p>
            <!-- Hiệu ứng typing: chữ hiện dần -->
            <p class="spf-hello__ask"><span class="spf-grad">{{ typed }}</span><span v-if="typed.length < ASK.length" class="spf-caret" /></p>
          </div>
          <div v-for="(m, i) in thread[mode]" :key="i" class="spf-msg" :class="`spf-msg--${m.from}`">
            <img v-if="m.from === 'bot' && mode === 'agent'" :src="agentAvatar" alt="" width="32" height="32" class="spf-msg__av" />
            <AppAvatar v-else-if="m.from === 'bot'" :src="personAvatar" name="Vũ Thị Thu Trang" :size="32" />
            <div class="spf-msg__bubble">{{ m.text }}<span v-if="m.typing" class="spf-caret" /></div>
          </div>
        </div>
        <div class="spf-foot">
          <div v-if="mode === 'agent'" class="spf-sugs" aria-label="Gợi ý">
            <button v-for="s in SUGS" :key="s" type="button" class="btn btn--outline btn--neutral" @click="send(s)">{{ s }}</button>
          </div>
          <!-- Ô nhập (Figma 1132:67601): đệm 12 · bo 12 · cao 48 · viền gradient AI (agent) / Neutral (AMIS Chat)
               + tròn 24 nền Neutral/200 · chữ gợi ý · micro tròn 24 icon AI · gửi tròn 24 gradient AI 300 (chưa gõ) → AI 600 (đã gõ) -->
          <form class="spf-composer" :class="{ 'spf-composer--ai': mode === 'agent' }" @submit.prevent="send()">
            <button type="button" class="spf-cbtn spf-cbtn--plus" aria-label="Tải lên tệp, hình ảnh" v-tip="'Tải lên tệp, hình ảnh'"><TIcon name="plus" /></button>
            <input :value="draft" class="spf-composer__input" @input="draft = $event.target.value" :placeholder="mode === 'agent' ? 'Hỏi tôi bất cứ điều gì ...' : 'Nhập tin nhắn ...'" :aria-label="mode === 'agent' ? 'Hỏi agent' : 'Nhập tin nhắn'" />
            <button type="button" class="spf-cbtn spf-cbtn--mic" aria-label="Nhập bằng giọng nói" v-tip="'Nhập bằng giọng nói'"><TIcon name="microphone" class="ti--ai" /></button>
            <button type="submit" class="spf-cbtn spf-send" :class="{ 'spf-send--on': draft.trim() }" :disabled="!draft.trim()" aria-label="Gửi" v-tip="'Gửi'"><TIcon name="location-filled" /></button>
          </form>
        </div>
      </template>

      <!-- TRỢ GIÚP (HELP) — component mds-ui AppHelpPanel (Figma 51535:79812) · nội dung bài viết = slot -->
      <AppHelpPanel v-else v-model="q" :variant="helpVariant" @close="open = false"><HelpArticleSample :q="q" /></AppHelpPanel>
    </aside>
      </template>
    </LayoutFrame>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppTag from '@mds/components/AppTag.vue'
import AppAvatar from '@mds/components/AppAvatar.vue'
import AppHelpPanel from '@mds/components/AppHelpPanel.vue'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'
import { currentMode } from '@mds/theme.js'
import HelpArticleSample from './HelpArticleSample.vue'
import { vTip } from '@mds/utils/tooltip.js'
import mascot from '../../assets/agent/mascot.png'
import agentAvatar from '../../assets/agent/avatar.png'
import personAvatar from '../../assets/avatar-sample.png'
import helpChat from '../../assets/header/help-chat.svg'
import helpAva from '../../assets/header/help-ava.svg'
import helpCommunity from '../../assets/header/help-community.svg'
import LayoutFrame from './LayoutFrame.vue'
import DashboardScreen from './DashboardScreen.vue'

const props = defineProps({
  initial: { type: String, default: 'agent' },   // panel mở sẵn: 'agent' | 'chat' | 'help'
  app:     { type: String, default: 'MISA Design System' },   // trùng tên app trên header màn hình mẫu
  agent:   { type: Object, default: () => ({ name: 'AVA Kế toán', role: 'Chuyên gia AI về kế toán' }) },   // tên / vai trò agent — tuỳ biến theo sản phẩm
})
const W = 1440, H = 800, MIN_PANEL = 350, MIN_APP = 1024
const open = ref(true), mode = ref(props.initial), dragging = ref(false)
const defW = (m = mode.value) => (m === 'help' ? 500 : 350)   // rộng mặc định: Trợ giúp 500 (Figma Help Frame) · chat agent / AMIS Chat 350 (Figma AVA Default)
const pw = ref(defW())
const appW = computed(() => W - (open.value ? pw.value : 0))

/* ── Kéo đổi rộng panel ── */
const clampW = v => Math.min(W / 2, Math.max(MIN_PANEL, v))
let sx = 0, sw = 0
function startDrag(e, k = 1) {   // k = tỉ lệ thu nhỏ của màn hình mẫu (LayoutFrame) → quy đổi px chuột về px thật
  dragging.value = true; sx = e.clientX; sw = pw.value; e.currentTarget.setPointerCapture?.(e.pointerId)
  const move = ev => { pw.value = clampW(sw + (sx - ev.clientX) / k) }
  const up = () => { dragging.value = false; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
}
const nudge = d => { pw.value = clampW(pw.value + d) }

/* ── Mở / chuyển panel (agent · AMIS Chat · Trợ giúp dùng chung 1 vị trí) ── */
function toggle(m) { if (open.value && mode.value === m) open.value = false; else go(m) }
function go(m) { if (!open.value || mode.value !== m) pw.value = defW(m); open.value = true; mode.value = m; if (m === 'agent') startTyping() }
function back() { if (props.initial === 'help') go('help'); else open.value = false }

/* ── Agent: lời chào gõ dần · hội thoại mô phỏng ── */
const ASK = 'Em có thể giúp gì cho anh?'
const typed = ref(''), draft = ref(''), msgEl = ref(null)
const SUGS = ['Hướng dẫn sử dụng', 'Thực hiện chức năng', 'Xem báo cáo']
const thread = reactive({ agent: [], chat: [{ from: 'me', text: 'Bổ sung nốt hộ chị hồ sơ nhá' }, { from: 'bot', text: 'Đang bổ sung rồi nhé. Chị chờ em chút ạ!' }] })
let tm = null
function typeInto(set, text, done) { clearInterval(tm); let i = 0; tm = setInterval(() => { i++; set(text.slice(0, i)); if (i >= text.length) { clearInterval(tm); done?.() } }, 35) }
function startTyping() { typed.value = ''; typeInto(v => (typed.value = v), ASK) }
async function send(text) {
  const t = (text ?? draft.value).trim(); if (!t) return
  draft.value = ''
  const list = thread[mode.value]; list.push({ from: 'me', text: t })
  const reply = mode.value === 'agent'
    ? `Em đã nhận yêu cầu “${t}”. Đây là mẫu mô phỏng — trên sản phẩm thật, câu trả lời của agent hiện dần (typing) tại đây và có thể kèm nút thao tác nhanh.`
    : 'Ok chị, em gửi ngay ạ.'
  const m = reactive({ from: 'bot', text: '', typing: true }); list.push(m)
  await nextTick(); scrollEnd()
  typeInto(v => { m.text = v; scrollEnd() }, reply, () => { m.typing = false })
}
const scrollEnd = () => { const el = msgEl.value; if (el) el.scrollTop = el.scrollHeight }

/* ── Menu ? Trợ giúp trên header = component Header_Help của ControlHeader (như /ds/header) · phím F1 khi chuột đang ở trong màn hình mẫu ── */
const HELP_MENU = [
  { title: 'Trợ giúp', items: [{ id: 'guide', icon: 'help-circle', label: 'Hướng dẫn sử dụng (F1)' }, { id: 'keys', icon: 'keyboard', label: 'Danh sách phím tắt' }, { id: 'quick', icon: 'rocket', label: 'Hướng dẫn nhanh' }] },
  { title: 'Kênh hỗ trợ', items: [{ id: 'chat', img: helpChat, label: 'Chat trực tuyến' }, { id: 'ava', img: helpAva, label: 'Chat với AVA' }, { id: 'community', img: helpCommunity, label: 'Cộng đồng MISA' }] },
]
function onHelpMenu(it) { const id = it?.id ?? it; if (id === 'guide') go('help'); else if (id === 'ava') go('agent'); else if (id === 'chat') go('chat') }
const hover = ref(false)
const helpVariant = computed(() => (currentMode.value === 'light' ? 'brand' : 'default'))   // header app trắng (giao diện sáng) → Brand · header màu → Default
function onF1(e) { if (e.key === 'F1' && hover.value) { e.preventDefault(); go('help') } }

/* ── Trợ giúp: nội dung bài = HelpArticleSample (lọc theo ô tìm kiếm của panel) ── */
const q = ref('')

onMounted(() => { window.addEventListener('keydown', onF1); if (mode.value === 'agent') startTyping() })
onBeforeUnmount(() => { clearInterval(tm); window.removeEventListener('keydown', onF1) })
</script>


<style scoped>
.spf-root { min-width: 0; }
/* Nút trên header (slot header-actions của ControlHeader): avatar agent · AMIS Chat */
.spf-hd__agent img { display: block; border-radius: 50%; }
.spf-hd__badge { position: relative; }
/* Panel phải: cao hết màn hình, nền trắng, vạch trái ngăn với app */
.spf-panel { position: relative; flex-shrink: 0; height: 100%; display: flex; flex-direction: column; background: var(--bg-white); border-left: 1px solid var(--stroke-neutral-light); }
.spf-panel--help { border-left: none; z-index: 1; }   /* Trợ giúp: bóng Left 8 của AppHelpPanel thay vạch trái (không vừa viền vừa bóng) */


.spf-grad { background: var(--ai-grad-600); -webkit-background-clip: text; background-clip: text; color: transparent; }   /* chữ gradient AI Primary */
.spf-caret { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -0.1em; background: var(--stroke-ai); animation: spf-blink 0.9s steps(1) infinite; }
@keyframes spf-blink { 50% { opacity: 0; } }
/* Header panel chat — Figma AVA Default (1132:67568): cao 60 · đệm ngang 16 (nút .btn-icon 32 chứa icon 24 → mép icon thẳng đệm 16) · cách 12 */
.spf-ph { flex-shrink: 0; display: flex; align-items: center; gap: calc(12px - (var(--btn-height) - 24px) / 2); height: 60px; padding: 0 calc(16px - (var(--btn-height) - 24px) / 2); border-bottom: 1px solid var(--stroke-neutral-light); }
.spf-ph .btn-icon .ti { font-size: 24px; }
.spf-ph__acts { display: flex; align-items: center; gap: max(0px, calc(36px - var(--btn-height))); flex-shrink: 0; }   /* ⋯ ↔ ✕ cách 12 (mép icon) */
.spf-ph__av { flex-shrink: 0; display: inline-flex; width: 32px; height: 32px; border-radius: 50%; overflow: hidden; }
.spf-ph__av img { display: block; width: 100%; height: 100%; object-fit: cover; }
.spf-ph__av--ai { background: var(--ai-grad-300); box-shadow: inset 0 0 0 1.5px var(--alpha-white-800); }   /* AVA: nền gradient AI 300 · viền trong trắng 80% */
.spf-ph__txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.spf-ph__name { display: inline-flex; align-items: center; gap: 4px; min-width: 0; font-weight: var(--fw-semibold); line-height: 20px; white-space: nowrap; }
.spf-ph__name--ai { font-weight: var(--fw-bold); min-width: 0; overflow: hidden; text-overflow: ellipsis; }   /* tên agent: Body Bold, màu gradient AI Primary */
.spf-ph__sub { color: var(--text-secondary); font-size: var(--text-body-sm); line-height: var(--text-sm-lh); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.spf-msgs { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 16px; }
/* Lời chào (Figma 1132:67584): sát trên, cách header 16 + 24 · ảnh 173 → cách 20 → “Xin chào” Body Large → cách 4 → câu hỏi H2 gradient AI (typing) */
.spf-hello { margin-top: 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
.spf-hello__art { position: relative; display: block; margin-bottom: 16px; }
.spf-hello__art::after { content: ''; position: absolute; left: 50%; bottom: -2px; width: 125px; height: 33px; transform: translateX(-50%); background: linear-gradient(179deg, color-mix(in srgb, var(--bg-white) 0%, transparent) 3%, var(--bg-white) 80%); pointer-events: none; }
.spf-hello__mascot { display: block; width: 173px; height: 176px; object-fit: cover; }
.spf-hello__hi { margin: 0; font-size: var(--text-body-lg); line-height: 20px; }
.spf-hello__ask { margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); min-height: var(--text-h2-lh); }

/* Ô nhập (Figma 1132:67601): đệm 12 · bo 12 · cao 48 · + / micro / gửi tròn 24 (icon 16) — không bóng vì đã có viền */
.spf-composer { display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid var(--stroke-neutral); border-radius: var(--radius-dialog); background: var(--bg-white); transition: box-shadow 0.15s; }   /* AMIS Chat (người): viền thường */
.spf-composer:not(.spf-composer--ai):hover { border-color: var(--stroke-brand); }
.spf-composer:not(.spf-composer--ai):focus-within { border-color: var(--stroke-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 12%, transparent); }
/* Chat AI (agent): viền gradient AI Primary (--ai-grad-600, như AppAiSearchbox) · rê AI 700 · focus thêm quầng AI */
.spf-composer--ai { border-color: transparent; background: linear-gradient(var(--bg-white), var(--bg-white)) padding-box, var(--ai-grad-600) border-box; }
.spf-composer--ai:hover { background: linear-gradient(var(--bg-white), var(--bg-white)) padding-box, var(--ai-grad-700) border-box; }
.spf-composer--ai:focus-within { background: linear-gradient(var(--bg-white), var(--bg-white)) padding-box, var(--ai-grad-600) border-box; box-shadow: 0 0 0 3px color-mix(in srgb, var(--ai-end-600) 14%, transparent); }
.spf-composer__input { flex: 1; min-width: 0; height: 24px; margin-left: 0; border: none; outline: none; background: transparent; font: inherit; line-height: 20px; color: var(--text-primary); padding: 0; }
.spf-composer__input::placeholder { color: var(--text-hint); }
/* Nút tròn 24 trong ô nhập (icon nằm bên trong control — như .ibox__icon) */
.spf-cbtn { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; border: none; border-radius: 50%; background: var(--bg-white); cursor: pointer; transition: background 0.15s; }
.spf-cbtn .ti { font-size: 16px; }
.spf-cbtn--plus { background: var(--bg-neutral-hover); color: var(--icon-neutral); }
.spf-cbtn--plus:hover { background: var(--bg-neutral-pressed); }
.spf-cbtn--mic { color: var(--ai-begin-600); }   /* icon micro: Icon/AI = gradient → TIcon .ti--ai (màu này chỉ dự phòng) */
.spf-cbtn--mic:hover { background: var(--ai-grad-50); }
.spf-cbtn:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 1px; }
.spf-send { margin-left: 0; background: var(--ai-grad-300); color: var(--icon-white); }
.spf-send .ti { color: var(--icon-white); }
.spf-send--on { background: var(--ai-grad-600); }
.spf-send--on:hover { background: var(--ai-grad-700); }
.spf-send:disabled { cursor: default; }
.spf-msg { display: flex; align-items: flex-start; gap: 8px; max-width: 88%; }
.spf-msg--me { align-self: flex-end; }
.spf-msg__av { border-radius: 50%; flex-shrink: 0; }
.spf-msg__bubble { padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); white-space: pre-wrap; }
.spf-msg--me .spf-msg__bubble { background: var(--bg-brand); color: var(--text-white); }

.spf-foot { flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; padding: 0 16px 16px; }
.spf-sugs { display: flex; gap: var(--gap-control); overflow-x: auto; scrollbar-width: none; }
.spf-sugs .btn { flex-shrink: 0; }
/* Chat AI (agent): viền gradient AI Primary (--ai-grad-600, như AppAiSearchbox) · rê AI 700 · focus thêm quầng AI */

</style>
