<template>
  <!-- Trợ lý AVA trên header: hỏi đáp quy chuẩn MISA Design System & cách dùng control mds-ui -->
  <button ref="btnEl" type="button" class="btn-icon-white ds-ava-btn" :class="{ 'btn-icon-white--active': open }" v-tip="'Hỏi AVA về quy chuẩn Design System'"
    aria-label="Trợ lý AVA" @click="toggle()">
    <span class="border-beam-round border-beam-round--hover" :class="{ 'border-beam-round--on': loading || intro }"><IconMisaAI /></span>
  </button>

  <!-- Giới thiệu lần đầu (như AVA app Chấm điểm): người chưa từng mở AVA → khung xổ xuống dưới icon, chữ gõ dần; “Để sau” = ẩn tới hết phiên -->
  <Teleport to="body">
    <Transition name="ds-ava-callout">
      <div v-if="callout.show" class="ds-ava-callout" :style="callout.pos" role="dialog" aria-label="Giới thiệu trợ lý AVA">
        <span class="ds-ava-callout__arrow" :style="{ right: callout.arrow }" />
        <div class="ds-ava-callout__head">
          <span class="ds-ava-callout__logo"><IconMisaAI /></span>
          <span class="ds-ava-callout__name"><b class="text-ai-primary">AVA</b> <span>· Trợ lý Design System</span></span>
          <button type="button" class="btn-icon btn-icon--sm" aria-label="Đóng" @click="dismissCallout"><TIcon name="x" /></button>
        </div>
        <p class="ds-ava-callout__text">{{ typed }}<span v-if="typing" class="ds-ava-callout__caret" /></p>
        <div class="ds-ava-callout__actions" :class="{ 'ds-ava-callout__actions--on': !typing }">
          <button type="button" class="btn btn--text-neutral btn--sm" @click="dismissCallout">Để sau</button>
          <button type="button" class="btn btn--ai btn--sm" @click="openFromCallout"><TIcon name="sparkles" />Hỏi AVA ngay</button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="ds-ava-slide">
      <aside v-if="open" class="ds-ava side-panel" role="dialog" aria-label="Trợ lý AVA" v-resizable-drawer="{ key: 'ds-ava', min: 360 }" v-side-panel>
        <div class="ds-ava__head">
          <span class="ds-ava__logo border-beam-round border-beam-round--on"><IconMisaAI /></span>
          <span class="ds-ava__title-wrap">
            <span class="ds-ava__title text-ai-primary">Trợ lý AVA</span>
            <span class="ds-ava__sub">Hỏi về quy chuẩn MDS & control mds-ui</span>
          </span>
          <button v-if="msgs.length" type="button" class="btn-icon" aria-label="Cuộc trò chuyện mới" @click="reset"><TIcon name="message-plus" /></button>
          <button type="button" class="btn-icon" aria-label="Đóng (Esc)" @click="open = false"><TIcon name="x" /></button>
        </div>

        <div ref="listEl" class="ds-ava__msgs">
          <div class="ds-ava__msg ds-ava__msg--ava">
            <span class="ds-ava__avatar"><IconMisaAI /></span>
            <div class="ds-ava__bubble">
              Xin chào{{ firstName ? ' ' + firstName : '' }}! Mình là <strong>AVA</strong> — đã đọc hết tài liệu Design System, bộ quy chuẩn chung và code các control <strong>mds-ui</strong>.
              Hỏi mình về <strong>padding, font chữ, bo góc, shadow, màu</strong> của từng control… mình trả lời bằng <strong>con số cụ thể</strong> theo 3 mật độ hiển thị để bạn đối chiếu bản vẽ; cần token, class, code thì bấm <strong>Chi tiết cách thi công</strong> dưới câu trả lời.
              Gửi <strong>ảnh thiết kế</strong> (dán Ctrl + V hoặc bấm <TIcon name="photo-up" class="ds-ava__inline-ico" />) — mình soát xem bố cục có đúng quy chuẩn không.
            </div>
          </div>
          <div v-if="!msgs.length" class="ds-ava__chips">
            <span class="ds-ava__chips-title">{{ pageTitle ? `Về trang “${pageTitle}”` : 'Câu hỏi gợi ý' }}</span>
            <button type="button" class="ds-ava__chip" @click="fileEl?.click()"><TIcon name="photo-up" class="ti--ai" />Gửi ảnh thiết kế để AVA soát quy chuẩn</button>
            <button v-for="q in suggestions" :key="q" type="button" class="ds-ava__chip" @click="ask(q)"><TIcon name="sparkles" class="ti--ai" />{{ q }}</button>
          </div>
          <template v-for="(m, i) in msgs" :key="i">
            <div v-if="m.role === 'user'" class="ds-ava__msg ds-ava__msg--me">
              <div v-if="m.thumbs?.length" class="ds-ava__msg-imgs"><img v-for="(t, k) in m.thumbs" :key="k" :src="t" alt="Ảnh đính kèm" /></div>
              <span v-if="m.imgKind" class="ds-ava__msg-kind"><TIcon name="photo" />{{ m.imgKind }}</span>
              <div class="ds-ava__bubble">{{ m.text }}</div>
            </div>
            <div v-else class="ds-ava__msg ds-ava__msg--ava">
              <span class="ds-ava__avatar"><IconMisaAI /></span>
              <div class="ds-ava__col">
                <div class="ds-ava__bubble ds-ava__bubble--md" :class="{ 'ds-ava__bubble--err': m.error }" v-html="m.html" @click="onLink" />
                <!-- Phần cho lập trình viên (component, token, code) KHÔNG sinh sẵn — bấm mới hỏi AVA (đỡ token cho người không cần) -->
                <template v-if="canBuild(m)">
                  <button v-if="!m.build" type="button" class="btn btn--text btn--sm ds-ava__build-link" @click="loadBuild(m)"><TIcon name="code" />Chi tiết cách thi công</button>
                  <div v-else class="ds-ava__build">
                    <span class="ds-ava__build-hd"><TIcon name="code" />Chi tiết cách thi công</span>
                    <div v-if="m.build.loading && !m.build.text" class="ds-ava__typing" aria-label="AVA đang soạn phần thi công"><i /><i /><i /></div>
                    <div v-else class="ds-ava__bubble--md ds-ava__build-body" :class="{ 'ds-ava__bubble--err': m.build.error }" v-html="m.build.html" @click="onLink" />
                    <button v-if="m.build.error" type="button" class="btn btn--text btn--sm" @click="loadBuild(m)">Thử lại</button>
                  </div>
                </template>
                <!-- Gợi ý hỏi tiếp: AVA chỉ trả lời đúng ý được hỏi, ý liên quan để thành nút — bấm mới trả lời (câu trả lời mới nhất) -->
                <div v-if="m.followups?.length && i === lastRateIdx && !loading" class="ds-ava__fu" aria-label="Gợi ý hỏi tiếp">
                  <button v-for="f in m.followups" :key="f" type="button" class="ds-ava__chip" @click="ask(f)"><TIcon name="sparkles" class="ti--ai" />{{ f }}</button>
                </div>
                <div v-if="!m.error && !m.streaming" class="ds-ava__tools">
                  <a v-for="s in m.sources" :key="s.href" :href="s.href" class="ds-ava__src" @click="onLink"><TIcon name="file-text" />{{ s.title }}</a>
                  <button type="button" class="btn-icon btn-icon--sm" v-tip="'Sao chép câu trả lời'" aria-label="Sao chép câu trả lời" @click="copy(m.text)"><TIcon name="copy" /></button>
                  <span v-if="m.reused" class="ds-ava__reused"><TIcon name="history" />Câu trả lời có sẵn · không tốn lượt hỏi</span>
                </div>
                <!-- Đánh giá câu trả lời (giống AVA app Chấm điểm) → Quản trị xem ở Quản trị nội dung › Lịch sử hỏi AVA
                     Câu trả lời MỚI NHẤT chưa đánh giá → thẻ hỏi nổi bật (viền gradient AI, nút có chữ); câu cũ / đã đánh giá → dòng icon gọn -->
                <div v-if="m.logId && !m.error && !m.streaming && !m.refused && !m.vote && i === lastRateIdx" class="ds-ava__ask">
                  <span class="ds-ava__ask-q"><span class="text-ai-primary">{{ askLine(m)[0] }}</span> {{ askLine(m)[1] }}</span>
                  <div class="ds-ava__ask-btns">
                    <button type="button" class="btn btn--outline btn--sm ds-ava__ask-btn ds-ava__ask-btn--up" @click="vote(m, 'up')"><TIcon name="thumb-up" />Hài lòng</button>
                    <button type="button" class="btn btn--outline btn--neutral btn--sm ds-ava__ask-btn" @click="vote(m, 'down')"><TIcon name="thumb-down" />Chưa ổn</button>
                  </div>
                </div>
                <div v-else-if="m.logId && !m.error && !m.streaming && !m.refused" class="ds-ava__rate">
                  <span class="ds-ava__rate-q">{{ m.vote === 'up' ? 'Cảm ơn bạn đã đánh giá!' : m.vote === 'down' ? (m.noteSent ? 'Cảm ơn góp ý của bạn!' : 'Cảm ơn bạn — AVA sẽ được cải thiện') : 'Câu trả lời có giúp ích cho bạn?' }}</span>
                  <button type="button" class="btn-icon btn-icon--sm ds-ava__rate-btn" :class="{ 'ds-ava__rate-btn--up': m.vote === 'up' }" :aria-pressed="m.vote === 'up'"
                    v-tip="m.vote === 'up' ? 'Bỏ đánh giá' : 'Hữu ích'" aria-label="Hữu ích" @click="vote(m, 'up')"><TIcon name="thumb-up" /></button>
                  <button type="button" class="btn-icon btn-icon--sm ds-ava__rate-btn" :class="{ 'ds-ava__rate-btn--down': m.vote === 'down' }" :aria-pressed="m.vote === 'down'"
                    v-tip="m.vote === 'down' ? 'Bỏ đánh giá' : 'Chưa đúng / chưa đủ'" aria-label="Chưa đúng / chưa đủ" @click="vote(m, 'down')"><TIcon name="thumb-down" /></button>
                </div>
                <form v-if="m.vote === 'down' && !m.noteSent" class="ds-ava__rate-note" @submit.prevent="sendNote(m)">
                  <AppTextbox v-model="m.noteDraft" size="sm" class="ds-ava__rate-input" placeholder="AVA sai / thiếu ở đâu? (không bắt buộc)" />
                  <button type="submit" class="btn btn--outline btn--neutral btn--sm" :disabled="!m.noteDraft?.trim()">Gửi</button>
                </form>
              </div>
            </div>
          </template>
          <div v-if="loading && !msgs.at(-1)?.streaming" class="ds-ava__msg ds-ava__msg--ava">
            <span class="ds-ava__avatar border-beam-round border-beam-round--on"><IconMisaAI /></span>
            <div class="ds-ava__bubble ds-ava__typing" aria-label="AVA đang trả lời"><i /><i /><i /></div>
          </div>
        </div>

        <form class="ds-ava__foot" @submit.prevent="send">
          <!-- Đang gõ → các câu ĐÃ CÓ câu trả lời gần giống (lấy từ Lịch sử hỏi AVA) — bấm chọn là xem ngay, không gọi AI -->
          <div v-if="similar.length && !simHidden && !loading && !atts.length" class="ds-ava__similar">
            <div class="ds-ava__similar-hd">
              <TIcon name="history" />
              <span class="ds-ava__similar-title">Có phải bạn định hỏi? <span class="ds-ava__similar-sub">Đã có câu trả lời — bấm để xem ngay</span></span>
              <button type="button" class="btn-icon btn-icon--sm" v-tip="'Ẩn gợi ý'" aria-label="Ẩn gợi ý" @click="simHidden = true"><TIcon name="x" /></button>
            </div>
            <button v-for="s in similar" :key="s.id" type="button" class="ds-ava__similar-item" @click="reuse(s)">{{ s.question }}</button>
          </div>
          <!-- Ảnh thiết kế (như AVA app Chấm điểm): chọn file / dán Ctrl + V / kéo thả → trình duyệt thu nhỏ + nén rồi mới gửi (tối đa 3 ảnh) -->
          <div class="ds-ava__box" :class="{ 'ds-ava__box--drag': dragOver }" @dragover.prevent="dragOver = true" @dragleave.self="dragOver = false" @drop.prevent="onDrop">
            <div v-if="atts.length || preparing" class="ds-ava__atts">
              <div class="ds-ava__att-list">
                <span v-for="(a, k) in atts" :key="k" class="ds-ava__att">
                  <img :src="a.thumb" alt="Ảnh đính kèm" />
                  <button type="button" class="ds-ava__att-x" v-tip="'Bỏ ảnh'" aria-label="Bỏ ảnh" @click="atts.splice(k, 1)"><TIcon name="x" /></button>
                </span>
                <span v-if="preparing" class="ds-ava__att ds-ava__att--loading"><TIcon name="loader-2" class="ds-ava__spin" /></span>
              </div>
              <!-- Loại màn → AVA soát đúng nhóm quy tắc (danh sách: bảng / phân trang · form: nhãn, nút Lưu Hủy…) -->
              <div class="ds-ava__att-kind">
                <span class="ds-ava__att-kind-q">Đây là:</span>
                <button v-for="k in IMG_KINDS" :key="k.id" type="button" class="ds-ava__kind" :class="{ 'ds-ava__kind--on': imgKind === k.id }" :aria-pressed="imgKind === k.id"
                  @click="imgKind = imgKind === k.id ? '' : k.id">{{ k.label }}</button>
              </div>
            </div>
            <textarea ref="inputEl" :value="draft" class="ds-ava__input" @input="draft = $event.target.value" rows="2" maxlength="2000" :placeholder="placeholder"
              @keydown.enter.exact="onEnter" @paste="onPaste" />
            <input ref="fileEl" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden @change="onPick" />
            <button type="button" class="btn-icon btn-icon--sm ds-ava__attach" :disabled="atts.length >= AVA_MAX_IMAGES"
              v-tip="'Đính kèm ảnh thiết kế (hoặc dán Ctrl + V, kéo thả) — AVA soát bố cục theo quy chuẩn'" aria-label="Đính kèm ảnh" @click="fileEl?.click()"><TIcon name="photo-up" /></button>
            <button type="submit" class="btn btn--ai ds-ava__send" :disabled="!canSend" aria-label="Gửi"><TIcon name="send" /></button>
          </div>
          <p v-if="atts.length" class="ds-ava__note">Ảnh gửi AVA được lưu 30 ngày để ban biên tập kiểm tra chất lượng trả lời, sau đó tự xóa — tránh gửi ảnh có thông tin nhạy cảm.</p>
        </form>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Marked } from 'marked'
import DOMPurify from 'dompurify'
import TIcon from '@mds/components/TIcon.vue'
import IconMisaAI from '@mds/components/IconMisaAI.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { vSidePanel } from '@mds/utils/sidePanel.js'
import { vResizableDrawer } from '@mds/utils/resizableDrawer.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'
import { toast } from '@mds/utils/toast.js'
import { copyText } from '../copyText.js'
import { state, api, avaBus } from '../store.js'
import { prepareImage, AVA_MAX_IMAGES } from '../imageResize.js'

ensureAiGradient()
const route = useRoute(), router = useRouter()
const open = ref(false), loading = ref(false), draft = ref('')
/* Một cách trả lời duy nhất: lời thường kèm SỐ LIỆU rõ ràng (padding, font, bo góc, shadow, mã màu); phần thi công (token, class, code) bấm “Chi tiết cách thi công” */
const mode = ref('plain')
const msgs = ref([])   // { role: 'user' | 'ava', text, html?, sources?, error? }
const listEl = ref(null), inputEl = ref(null)
const firstName = computed(() => String(state.me.user?.name || '').trim().split(/\s+/).pop() || '')
const page = computed(() => (route.params.slug && !route.meta.admin ? String(route.params.slug) : ''))
const pageTitle = computed(() => state.pages.find(p => p.slug === page.value)?.title || '')
const GENERAL = ['Quy chuẩn Button: padding, font, bo góc, màu?', 'Shadow của card và dialog là gì?', 'Bo góc của dialog và card là bao nhiêu?', 'Khi nào dùng toast, khi nào dùng inline alert?', 'Cỡ chữ mặc định trong app là bao nhiêu?']
const suggestions = computed(() => (pageTitle.value
  ? [`Tóm tắt quy chuẩn chính của ${pageTitle.value}`, `Padding, font chữ, bo góc, shadow của ${pageTitle.value}?`, `Màu sắc của ${pageTitle.value} theo từng trạng thái?`, ...GENERAL.slice(0, 2)]
  : GENERAL))

const md = new Marked({ gfm: true, breaks: true })
md.use({ renderer: { link({ href, tokens }) { const t = this.parser.parseInline(tokens); return `<a href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>` } } })
const render = t => DOMPurify.sanitize(md.parse(t || ''), { ADD_ATTR: ['target'] })
/* Mục cho lập trình viên (“Cho lập trình viên”, bảng “Giá trị token CSS”) KHÔNG hiện sẵn ở bất kỳ câu trả lời nào (Dễ hiểu, Kỹ thuật, soát ảnh,
   câu dùng lại / gần giống / lịch sử cũ) → tách ra, giấu sau link “Chi tiết cách thi công” (bấm là hiện, không gọi AI lại) */
const DEV_SECS = /\n*#### (Cho lập trình viên|Giá trị token CSS)[^\n]*\n[\s\S]*?(?=\n#### |\n+\s*Nguồn\s*:|$)/g
function splitDev(t) {
  const dev = []
  const main = String(t || '').replace(DEV_SECS, x => { dev.push(x.trim()); return '' }).trim()
  return { main, dev: dev.join('\n\n') }
}
/** Gán câu trả lời vào tin AVA: phần chính hiện ngay, phần dev để dành cho link */
function setAnswer(m, text) {
  const { main, dev } = splitDev(text)
  m.text = main; m.html = render(main); m.devText = dev
}

async function scrollEnd() { await nextTick(); listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: 'smooth' }) }
async function toggle(v = !open.value) { open.value = v; if (v) { markSeen(); hideCallout(); await nextTick(); inputEl.value?.focus() } }
/* ── Câu hỏi đã có câu trả lời gần giống (gõ tới đâu gợi ý tới đó, chờ 250ms sau phím cuối) ── */
const similar = ref([]), simHidden = ref(false)
let simSeq = 0, simTimer = 0
function clearSimilar() { clearTimeout(simTimer); simSeq++; similar.value = [] }
watch([draft, mode], ([q]) => {
  clearTimeout(simTimer)
  const t = String(q || '').trim()
  if (!t) simHidden.value = false   // xóa trắng ô → lần gõ sau lại gợi ý
  if (t.length < 6) { clearSimilar(); return }
  simTimer = setTimeout(async () => {
    const my = ++simSeq
    try { const r = await api(`/ava/similar?q=${encodeURIComponent(t)}&mode=${mode.value}`); if (my === simSeq) similar.value = r.items || [] }
    catch { if (my === simSeq) similar.value = [] }
  }, 250)
})
/** Bấm 1 câu gợi ý → lấy câu trả lời đã có (không gọi AI). Câu đã cũ (tài liệu vừa sửa) → hỏi AVA như thường */
async function reuse(s) {
  if (loading.value) return
  draft.value = ''; if (inputEl.value) inputEl.value.value = ''
  clearSimilar()
  msgs.value.push({ role: 'user', text: s.question })
  loading.value = true; scrollEnd()
  let fallback = false
  try {
    const d = await api('/ava/reuse', { method: 'POST', body: { id: s.id, page: page.value, mode: mode.value } })
    const nm = { role: 'ava', sources: d.sources || [], logId: d.logId || '', vote: '', noteDraft: '', noteSent: false, reused: true, q: s.question, mode: mode.value }
    setAnswer(nm, d.text); nm.followups = d.followups || []; msgs.value.push(nm)
  } catch { msgs.value.pop(); fallback = true }
  finally { loading.value = false; scrollEnd() }
  if (fallback) ask(s.question)
}
function reset() { msgs.value = []; draft.value = ''; atts.value = []; imgKind.value = ''; imgStore.clear(); inputEl.value?.focus() }
useEscClose(() => { open.value = false }, () => open.value)

/* Enter gửi · đang gõ chữ có dấu (bộ gõ Telex / VNI còn gạch chân) thì Enter để bộ gõ chốt chữ, chưa gửi —
   nếu gửi ngay, bộ gõ chốt chữ SAU khi ô đã xóa → chữ hiện lại trong ô và câu gửi đi thiếu chữ cuối */
function onEnter(e) {
  if (e.isComposing || e.keyCode === 229) return
  e.preventDefault(); send()
}
/* ── Ảnh thiết kế đính kèm (cơ chế như AVA app Chấm điểm) ── */
const IMG_KINDS = [
  { id: 'list', label: 'Màn danh sách', note: 'MÀN DANH SÁCH (bảng, thanh công cụ, phân trang)' },
  { id: 'form', label: 'Form / popup', note: 'FORM NHẬP LIỆU / POPUP' },
  { id: 'detail', label: 'Màn chi tiết', note: 'MÀN CHI TIẾT (xem thông tin)' },
  { id: 'dash', label: 'Dashboard', note: 'DASHBOARD (card, KPI, biểu đồ)' },
]
const atts = ref([]), preparing = ref(false), dragOver = ref(false), imgKind = ref(''), fileEl = ref(null)
const canSend = computed(() => !!(draft.value.trim() || atts.value.length) && !loading.value && !preparing.value)
const placeholder = computed(() => (atts.value.length ? 'Mô tả thêm nếu cần (VD: màn danh sách đơn hàng, đã đúng chuẩn chưa?)…' : 'Hỏi AVA… (Enter để gửi, Shift + Enter xuống dòng · dán ảnh thiết kế để AVA soát)'))
async function addFiles(files) {
  const list = [...files].filter(f => f.type?.startsWith('image/'))
  if (!list.length) return
  for (const f of list) {
    const slots = AVA_MAX_IMAGES - atts.value.length
    if (slots <= 0) { toast.info(`Tối đa ${AVA_MAX_IMAGES} ảnh mỗi câu hỏi`); break }
    if (f.size > 40 * 1024 * 1024) { toast.error(`Ảnh “${f.name}” quá lớn (trên 40MB)`); continue }
    preparing.value = true
    try {
      const parts = await prepareImage(f, slots)
      atts.value.push(...parts)
      if (parts.length > 1) toast.info(`Ảnh dài được cắt thành ${parts.length} đoạn để AVA đọc rõ chữ`)
    } catch (e) { toast.error(e.message || 'Không đọc được ảnh') }
    finally { preparing.value = false }
  }
  inputEl.value?.focus()
}
function onPick(e) { if (!open.value) toggle(true); addFiles(e.target.files ?? []); e.target.value = '' }
function onDrop(e) { dragOver.value = false; addFiles(e.dataTransfer?.files ?? []) }
function onPaste(e) {
  const files = [...(e.clipboardData?.items ?? [])].filter(i => i.kind === 'file' && i.type.startsWith('image/')).map(i => i.getAsFile()).filter(Boolean)
  if (!files.length) return
  if (!e.clipboardData.types.includes('text/plain')) e.preventDefault()   // chỉ có ảnh → không dán chữ rác vào ô
  addFiles(files)
}
function send() {
  const body = String(inputEl.value?.value ?? draft.value).trim()
  if ((!body && !atts.value.length) || loading.value || preparing.value) return
  const images = atts.value.splice(0), kind = IMG_KINDS.find(k => k.id === imgKind.value)
  imgKind.value = ''
  ask(body || (images.length ? 'Thiết kế này đã đúng quy chuẩn MDS chưa? Chỉ ra chỗ cần sửa.' : ''), images, kind)
}
/* Ảnh đầy đủ chỉ giữ trong bộ nhớ tới khi AVA trả lời — lượt sau chỉ gửi chữ (AVA đã mô tả ảnh trong câu trả lời) */
const imgStore = new Map()
const payloadOf = list => list.filter(m => !m.error).map((m, i, arr) => {
  if (m.role !== 'user' || !m.thumbs?.length) return { role: m.role, text: m.text }
  const full = i === arr.length - 1 ? imgStore.get(m.imgKey) : null, t = m.imgNote ? `[Ảnh: ${m.imgNote}] ${m.text}` : m.text
  return full ? { role: 'user', text: t, images: full } : { role: 'user', text: `${t}\n[Lượt này có kèm ${m.thumbs.length} ảnh — nội dung ảnh xem câu trả lời ngay sau của AVA]` }
})

async function ask(q = inputEl.value?.value ?? draft.value, images = [], kind = null) {
  q = String(q || '').trim()
  if (!q || loading.value) return
  draft.value = ''
  if (inputEl.value) inputEl.value.value = ''
  clearSimilar()
  const um = { role: 'user', text: q }
  if (images.length) {
    Object.assign(um, { thumbs: images.map(i => i.thumb), imgKey: 'img' + Date.now(), ...(kind ? { imgKind: kind.label, imgNote: kind.note } : {}) })
    imgStore.set(um.imgKey, images.map(i => ({ mime: i.mime, data: i.data })))
  }
  msgs.value.push(um)
  loading.value = true; scrollEnd()
  const history = payloadOf(msgs.value)
  let m = null   // tin trả lời đang chảy về — tạo khi có chữ đầu tiên (trước đó hiện ba chấm “đang trả lời”)
  const asked = mode.value
  try {
    const o = await streamAva({ page: page.value, mode: asked, messages: history }, text => {
      if (!m) { msgs.value.push({ role: 'ava', text: '', html: '', sources: [], logId: '', vote: '', noteDraft: '', noteSent: false, streaming: true }); m = msgs.value.at(-1) }
      setAnswer(m, text); scrollEnd()
    })
    if (!m) { msgs.value.push({ role: 'ava', vote: '', noteDraft: '', noteSent: false }); m = msgs.value.at(-1) }
    setAnswer(m, o.text); m.followups = o.followups || []
    Object.assign(m, { sources: o.sources || [], logId: o.logId || '', refused: !!o.refused, reused: !!o.reused, streaming: false,
      quick: !!(o.clarify || o.spam || (o.repeated && !o.logId)), q: images.length ? '' : q, mode: asked })
  } catch (e) {
    const msg = e.message || 'AVA gặp lỗi, thử hỏi lại nhé'
    if (m) Object.assign(m, { text: (m.text ? m.text + '\n\n' : '') + msg, html: render((m.text ? m.text + '\n\n' : '') + msg), error: true, streaming: false })
    else msgs.value.push({ role: 'ava', text: msg, html: render(msg), error: true })
  } finally { if (um.imgKey) imgStore.delete(um.imgKey); loading.value = false; scrollEnd() }
}
/** Gọi /api/ds/ava dạng dòng chảy (NDJSON): onText(chữ đến giờ) mỗi khung hình · trả về dòng {done…} cuối */
async function streamAva(body, onText) {
  const res = await fetch('/api/ds/ava', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, stream: true }) })
  if (!res.ok || !res.body) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Lỗi ${res.status}`) }
  const reader = res.body.getReader(), dec = new TextDecoder()
  let buf = '', text = '', raf = 0
  const paint = () => { raf = 0; onText(text) }
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1)
      if (!line) continue
      const o = JSON.parse(line)
      if (o.error) throw new Error(o.error)
      if (o.d) { text += o.d; if (!raf) raf = requestAnimationFrame(paint) }   // vẽ lại tối đa 1 lần / khung hình
      if (o.done) { cancelAnimationFrame(raf); return o }
    }
  }
  cancelAnimationFrame(raf)
  throw new Error('Mất kết nối giữa chừng, thử hỏi lại nhé')
}
/* “Chi tiết cách thi công”: chỉ dưới câu trả lời Dễ hiểu thật (không lỗi / từ chối / hỏi lại / soát ảnh) */
const canBuild = m => !m.error && !m.streaming && !m.refused && (m.devText || (m.mode === 'plain' && m.q && !m.quick))
async function loadBuild(m) {
  if (m.build?.loading) return
  if (m.devText) { m.build = { text: m.devText, html: render(m.devText), loading: false, error: false }; return }   // đã có sẵn trong câu trả lời → hiện luôn
  m.build = { text: '', html: '', loading: true, error: false }
  try {
    const o = await streamAva({ page: page.value, mode: 'build', messages: [{ role: 'user', text: m.q }] }, t => { m.build.text = t; m.build.html = render(t) })
    Object.assign(m.build, { text: o.text, html: render(o.text), loading: false })
  } catch (e) {
    Object.assign(m.build, { html: render(e.message || 'AVA gặp lỗi, thử lại nhé'), loading: false, error: true })
  }
}
/** Mở AVA và hỏi luôn (nút “Hỏi AVA” ở trang tài liệu) */
async function askFromPage(q) { await toggle(true); if (q) ask(q) }
defineExpose({ askFromPage })

// Link trong câu trả lời: trang tài liệu (/ds/…) → chuyển trang trong app, giữ khung AVA
function onLink(e) {
  const a = e.target.closest('a[href]')
  if (!a || e.ctrlKey || e.metaKey || a.target === '_blank') return
  const m = a.getAttribute('href').match(/^\/ds(\/[^#?]*)?(#.*)?$/)
  if (m) { e.preventDefault(); router.push((m[1] || '/') + (m[2] || '')) }
}
// Thẻ hỏi đánh giá (giống AVA app Chấm điểm): câu vui chọn cố định theo logId để không đổi khi re-render
const ASK_LINES = [
  ['Hài lòng thì bảo hài lòng, chưa ổn thì bảo chưa ổn nha', '😄'],
  ['AVA trả lời vậy được chưa? Chấm cho AVA một phát nè', '👇'],
  ['Trúng ý bạn chưa? Một cú bấm giúp AVA khôn hơn đó', '✨'],
  ['Khen hay chê đều được, AVA không dỗi đâu', '😉'],
]
const askLine = m => ASK_LINES[[...String(m.logId)].reduce((h, c) => h + c.charCodeAt(0), 0) % ASK_LINES.length]
const lastRateIdx = computed(() => msgs.value.findLastIndex(m => m.role !== 'user'))

async function vote(m, v) {
  const next = m.vote === v ? '' : v
  try { await api('/ava/feedback', { method: 'POST', body: { logId: m.logId, vote: next } }); m.vote = next; m.noteSent = false }
  catch (e) { toast.error(e.message) }
}
async function sendNote(m) {
  try { await api('/ava/feedback', { method: 'POST', body: { logId: m.logId, vote: 'down', note: m.noteDraft } }); m.noteSent = true }
  catch (e) { toast.error(e.message) }
}
async function copy(t) {
  if (await copyText(t)) toast.success('Đã sao chép câu trả lời'); else toast.error('Trình duyệt chặn sao chép')
}
/* ── Giới thiệu lần đầu (cơ chế như AVA app Chấm điểm) ──
   Chưa từng mở AVA → viền beam chạy ~5 giây + khung giới thiệu dưới icon (chữ gõ dần) · mở AVA = đã xem · “Để sau” = ẩn tới hết phiên (tab)
   Đổi phiên bản SEEN_KEY khi AVA có khả năng mới để mọi người thấy lại giới thiệu 1 lần */
const SEEN_KEY = 'ds-ava-seen-v1', LATER_KEY = 'ds-ava-callout-later'
const seen = () => { try { return localStorage.getItem(SEEN_KEY) === '1' } catch { return true } }
const later = () => { try { return sessionStorage.getItem(LATER_KEY) === '1' } catch { return false } }
function markSeen() { intro.value = false; try { localStorage.setItem(SEEN_KEY, '1') } catch { /* bỏ qua */ } }
const intro = ref(false), btnEl = ref(null), typed = ref(''), typing = ref(false)
const callout = reactive({ show: false, pos: {}, arrow: '20px' })
const calloutText = computed(() => `Chào ${firstName.value || 'bạn'}! Mình là AVA — hỏi mình về quy chuẩn Design System và cách dùng control mds-ui: kích thước, màu, khoảng cách, token, code mẫu. Mình còn soát được ảnh thiết kế: dán hoặc gửi ảnh màn hình, mình chỉ ra chỗ chưa đúng quy chuẩn và cách sửa.`)
let showTimer = null, typeTimer = null, introTimer = null
function place() {
  const r = btnEl.value?.getBoundingClientRect(); if (!r) return
  const w = Math.min(320, window.innerWidth - 16)   // = bề rộng khung (max-width: 100vw - 16px)
  const right = Math.min(Math.max(8, window.innerWidth - r.right - 12), window.innerWidth - w - 8)   // không tràn mép trái màn hẹp
  callout.pos = { top: `${r.bottom + 10}px`, right: `${right}px` }
  callout.arrow = `${Math.max(12, window.innerWidth - (r.left + r.width / 2) - right - 7)}px`
}
function showCallout() {
  if (open.value || seen() || later() || !btnEl.value) return
  place(); callout.show = true
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { typed.value = calloutText.value; return }
  typed.value = ''; typing.value = true
  let i = 0
  typeTimer = setInterval(() => {
    typed.value = calloutText.value.slice(0, ++i)
    if (i >= calloutText.value.length) { clearInterval(typeTimer); typing.value = false }
  }, 28)
}
function hideCallout() { callout.show = false; clearTimeout(showTimer); clearInterval(typeTimer); typing.value = false }
function dismissCallout() { hideCallout(); try { sessionStorage.setItem(LATER_KEY, '1') } catch { /* bỏ qua */ } }
function openFromCallout() { hideCallout(); toggle(true) }
onMounted(() => {
  if (seen() || later()) return
  intro.value = true; introTimer = setTimeout(() => (intro.value = false), 5500)
  showTimer = setTimeout(showCallout, 1200)
  window.addEventListener('resize', place)
})
onBeforeUnmount(() => { hideCallout(); clearTimeout(introTimer); window.removeEventListener('resize', place) })

// Nút “Hỏi AVA” ở trang tài liệu → mở khung và hỏi luôn
watch(() => avaBus.n, () => askFromPage(avaBus.q))
</script>

<style scoped>
.ds-ava-btn :deep(svg) { display: block; }
/* Khung giới thiệu lần đầu — viền gradient AI, mũi tên chỉ vào icon AVA */
.ds-ava-callout { position: fixed; z-index: calc(var(--z-side-panel) + 1); width: 320px; max-width: calc(100vw - 16px); padding: 12px 16px; box-sizing: border-box; border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-popover); border: 1px solid transparent;
  background-image: linear-gradient(var(--bg-white), var(--bg-white)), linear-gradient(111deg, var(--ai-begin-600) 8.87%, var(--ai-end-600) 100%);
  background-origin: border-box; background-clip: padding-box, border-box; }
.ds-ava-callout__arrow { position: absolute; top: -7px; width: 12px; height: 12px; background: var(--bg-white); border-top: 1px solid var(--ai-begin-600); border-left: 1px solid var(--ai-begin-600);   /* mũi nhọn nằm phía đầu gradient viền → màu AI Begin */ transform: rotate(45deg); border-top-left-radius: 2px; }
.ds-ava-callout__head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.ds-ava-callout__logo { display: inline-flex; }
.ds-ava-callout__logo :deep(svg) { width: 28px; height: 28px; }
.ds-ava-callout__name { flex: 1; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ds-ava-callout__name span { font-weight: var(--fw-regular); color: var(--text-secondary); }
.ds-ava-callout__text { margin: 0; min-height: calc(var(--text-body-lh) * 5); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.ds-ava-callout__caret { display: inline-block; width: 2px; height: 1em; margin-left: 1px; vertical-align: -2px; background: var(--stroke-ai); animation: ds-ava-caret 0.8s steps(1) infinite; }
@keyframes ds-ava-caret { 50% { opacity: 0; } }
.ds-ava-callout__actions { display: flex; justify-content: flex-end; align-items: center; gap: var(--gap-control); margin-top: 12px; opacity: 0; transform: translateY(4px); transition: opacity 0.25s, transform 0.25s; pointer-events: none; }
.ds-ava-callout__actions--on { opacity: 1; transform: none; pointer-events: auto; }
.ds-ava-callout-enter-active, .ds-ava-callout-leave-active { transition: opacity 0.2s, transform 0.2s; }
.ds-ava-callout-enter-from, .ds-ava-callout-leave-to { opacity: 0; transform: translateY(-6px); }
.ds-ava { position: fixed; top: 0; right: 0; bottom: 0; z-index: var(--z-side-panel); width: 420px; max-width: 100vw; display: flex; flex-direction: column;
  background: var(--bg-white); box-shadow: var(--shadow-popover); }
.ds-ava__head { display: flex; align-items: center; gap: 10px; padding: 12px 12px 12px 16px; border-bottom: 1px solid var(--stroke-divider); }
.ds-ava__logo { display: inline-flex; flex-shrink: 0; }
.ds-ava__logo :deep(svg) { width: 32px; height: 32px; }
.ds-ava__title-wrap { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.ds-ava__title { align-self: flex-start; font-size: var(--text-h3); font-weight: var(--fw-semibold); }
.ds-ava__sub { font-size: var(--text-body); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-ava__msgs { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; background: var(--bg-page); }
.ds-ava__msg { display: flex; gap: 8px; max-width: 94%; }
.ds-ava__msg--me { align-self: flex-end; max-width: 82%; }
.ds-ava__msg--ava { align-self: flex-start; }
.ds-ava__avatar { display: inline-flex; flex-shrink: 0; align-self: flex-start; }
.ds-ava__avatar :deep(svg) { width: 28px; height: 28px; }
.ds-ava__col { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.ds-ava__bubble { padding: 8px 12px; border-radius: 14px; font-size: var(--text-body); line-height: var(--text-body-lh); word-break: break-word; min-width: 0; }
.ds-ava__msg--me .ds-ava__bubble { background: var(--bg-brand); color: var(--text-white); border-bottom-right-radius: 4px; white-space: pre-wrap; }
.ds-ava__msg--ava .ds-ava__bubble { background: var(--bg-white); color: var(--text-primary); border-top-left-radius: 4px; box-shadow: var(--shadow-card); }
.ds-ava__bubble--err { color: var(--text-danger) !important; }
.ds-ava__build-link { align-self: flex-start; }
.ds-ava__fu { display: flex; flex-wrap: wrap; gap: 8px; }
/* Lưu ý (VD soát ảnh: “ảnh chụp có thể sai lệch”) — ô cảnh báo nền Warning nhạt, không viền */
.ds-ava__bubble--md :deep(blockquote) { margin: 0 0 12px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-warning-light); color: var(--text-primary); }
.ds-ava__bubble--md :deep(blockquote p) { margin: 0; }
.ds-ava__build { display: flex; flex-direction: column; gap: 8px; padding: 8px 12px; border-radius: 14px; border-top-left-radius: 4px; background: var(--bg-white); box-shadow: var(--shadow-card);
  font-size: var(--text-body); line-height: var(--text-body-lh); min-width: 0; word-break: break-word; }
.ds-ava__build-hd { display: inline-flex; align-items: center; gap: 6px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.ds-ava__build-hd :deep(svg) { width: 16px; height: 16px; color: var(--icon-neutral); }
.ds-ava__build .ds-ava__typing { padding: 4px 0; }
.ds-ava__bubble strong, .ds-ava__bubble--md :deep(strong) { font-weight: var(--fw-semibold); }
.ds-ava__bubble--md :deep(p) { margin: 0 0 12px; }   /* khoảng nghỉ giữa các ý — đọc thoáng */
.ds-ava__bubble--md :deep(p:last-child) { margin-bottom: 0; }
.ds-ava__bubble--md :deep(ul), .ds-ava__bubble--md :deep(ol) { margin: 0 0 12px; padding-left: 18px; }
.ds-ava__bubble--md :deep(ul:last-child), .ds-ava__bubble--md :deep(ol:last-child) { margin-bottom: 0; }
.ds-ava__bubble--md :deep(li) { margin: 0 0 6px; }
.ds-ava__bubble--md :deep(li:last-child) { margin-bottom: 0; }
.ds-ava__bubble--md :deep(h4:first-child) { margin-top: 0; }
.ds-ava__bubble--md :deep(h4) { margin: 16px 0 6px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-brand); }
.ds-ava__bubble--md :deep(code) { padding: 0 4px; border-radius: 4px; background: var(--bg-neutral-light); font-size: 0.92em; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.ds-ava__bubble--md :deep(pre) { margin: 0 0 12px; padding: 8px 10px; border-radius: var(--radius-default); background: var(--neutral-950, #0c111d); color: var(--neutral-100); overflow-x: auto; }
.ds-ava__bubble--md :deep(pre code) { padding: 0; background: none; color: inherit; }
.ds-ava__bubble--md :deep(table) { border-collapse: collapse; margin: 0 0 12px; display: block; overflow-x: auto; }
.ds-ava__bubble--md :deep(th), .ds-ava__bubble--md :deep(td) { padding: 4px 8px; border: 1px solid var(--stroke-neutral-light); text-align: left; white-space: nowrap; }
.ds-ava__bubble--md :deep(td:last-child) { white-space: normal; overflow-wrap: anywhere; }   /* giá trị dài (bóng đổ, gradient) xuống dòng, không kéo ngang */
.ds-ava__bubble--md :deep(th) { background: var(--dt-header-bg); font-weight: var(--fw-semibold); }
.ds-ava__bubble--md :deep(a) { color: var(--text-link); text-decoration: none; }
.ds-ava__bubble--md :deep(a:hover) { text-decoration: underline; }
.ds-ava__tools { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.ds-ava__src { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);
  background: var(--bg-white); color: var(--text-secondary); font-size: var(--text-body); text-decoration: none; }
.ds-ava__src:hover { border-color: var(--stroke-brand); color: var(--text-brand); }
.ds-ava__src .ti { font-size: 14px; }
.ds-ava__ask { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; padding: 10px 12px; border: 1px solid transparent; border-radius: var(--radius-default);
  background: linear-gradient(var(--bg-white), var(--bg-white)) padding-box, linear-gradient(90deg, #1482ff, #cf11ff) border-box; animation: ds-ava-ask-in 0.4s ease 0.6s both; }   /* như thẻ hỏi AVA app Chấm điểm */
.ds-ava__ask-q { font-size: var(--text-body); font-weight: var(--fw-semibold); }
.ds-ava__ask-btns { display: flex; gap: var(--gap-control, 8px); }
.ds-ava__ask-btn .ti { font-size: 16px; }
.ds-ava__ask-btn--up:hover .ti { animation: ds-ava-thumb 0.5s ease; }
@keyframes ds-ava-ask-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes ds-ava-thumb { 30% { transform: rotate(-15deg) scale(1.15); } 60% { transform: rotate(8deg); } }
@media (prefers-reduced-motion: reduce) { .ds-ava__ask, .ds-ava__ask-btn--up:hover .ti { animation: none; } }
.ds-ava__rate { display: flex; align-items: center; gap: 2px; padding-left: 4px; font-size: var(--text-body); color: var(--text-secondary); }   /* như AVA app Chấm điểm */
.ds-ava__rate-q { margin-right: 4px; }
.ds-ava__rate-btn { color: var(--icon-neutral); }
.ds-ava__rate-btn--up, .ds-ava__rate-btn--up:hover { color: var(--text-brand); }
.ds-ava__rate-btn--down, .ds-ava__rate-btn--down:hover { color: var(--text-danger); }
.ds-ava__rate-note { display: flex; gap: 6px; padding-left: 4px; }
.ds-ava__rate-input { flex: 1; min-width: 0; }
.ds-ava__chips { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding-left: 36px; }
.ds-ava__chips-title { font-size: var(--text-body); color: var(--text-secondary); margin-top: 2px; }
.ds-ava__chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);
  background: var(--bg-white); color: var(--text-primary); font: inherit; font-size: var(--text-body); text-align: left; cursor: pointer; }
.ds-ava__chip:hover { border-color: transparent; background: var(--ai-border-on-ai-light); }   /* viền gradient AI (Stroke/AI) trên nền AI nhạt */
.ds-ava__chip .ti { font-size: 14px; flex-shrink: 0; }
.ds-ava__typing { display: inline-flex; gap: 4px; align-items: center; }
.ds-ava__typing i { width: 6px; height: 6px; border-radius: 50%; background: var(--text-hint); animation: ds-ava-dot 1s infinite ease-in-out; }
.ds-ava__typing i:nth-child(2) { animation-delay: 0.15s; }
.ds-ava__typing i:nth-child(3) { animation-delay: 0.3s; }
@keyframes ds-ava-dot { 0%, 80%, 100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
.ds-ava__similar { display: flex; flex-direction: column; gap: 2px; padding: 8px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); background: var(--bg-white); }
.ds-ava__similar-hd { display: flex; align-items: center; gap: 6px; padding: 0 0 4px 8px; }
.ds-ava__similar-hd > .ti { font-size: 16px; color: var(--icon-neutral); flex-shrink: 0; }
.ds-ava__similar-title { flex: 1; min-width: 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ds-ava__similar-sub { font-weight: var(--fw-regular); color: var(--text-secondary); }
.ds-ava__similar-item { display: block; width: 100%; padding: 6px 8px; border: none; border-radius: var(--radius-default); background: transparent; color: var(--text-primary);
  font: inherit; font-size: var(--text-body); text-align: left; cursor: pointer; overflow-wrap: anywhere; }
.ds-ava__similar-item:hover { background: var(--bg-brand-light); }
.ds-ava__reused { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); color: var(--text-secondary); }
.ds-ava__reused .ti { font-size: 14px; color: var(--icon-neutral); }
.ds-ava__foot { display: flex; flex-direction: column; gap: 6px; padding: 12px 16px 16px; border-top: 1px solid var(--stroke-divider); }
.ds-ava__box { position: relative; display: flex; flex-direction: column; border-radius: var(--radius-default); }
.ds-ava__box--drag .ds-ava__input { border-color: var(--stroke-brand); border-style: dashed; background: var(--bg-brand-light); }
.ds-ava__atts { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.ds-ava__att-list { display: flex; flex-wrap: wrap; gap: 8px; }
.ds-ava__att { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); overflow: hidden; background: var(--bg-neutral-light); }
.ds-ava__att img { width: 100%; height: 100%; object-fit: cover; }
.ds-ava__att-x { position: absolute; top: 2px; right: 2px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; padding: 0; border: none; border-radius: var(--radius-pill); background: var(--alpha-black-600); color: var(--icon-white); cursor: pointer; }
.ds-ava__att-x .ti { font-size: 12px; }
.ds-ava__spin { animation: ds-ava-spin 0.8s linear infinite; color: var(--icon-neutral); }
@keyframes ds-ava-spin { to { transform: rotate(360deg); } }
.ds-ava__att-kind { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.ds-ava__att-kind-q { font-size: var(--text-body); color: var(--text-secondary); }
.ds-ava__kind { height: calc(var(--btn-height) - 4px); padding: 0 10px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); background: var(--bg-white);
  font: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; }
.ds-ava__kind:hover { border-color: var(--stroke-brand); color: var(--text-brand); }
.ds-ava__kind--on { border-color: var(--stroke-brand); background: var(--bg-brand-light); color: var(--text-brand); font-weight: var(--fw-medium); }
.ds-ava__attach { position: absolute; right: calc(8px + var(--btn-height) + 4px); bottom: 8px; color: var(--icon-neutral); }
.ds-ava__note { margin: 0; font-size: var(--text-body); color: var(--text-secondary); }
.ds-ava__msg--me { flex-direction: column; align-items: flex-end; gap: 4px; }
.ds-ava__msg-imgs { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.ds-ava__msg-imgs img { width: 96px; height: 72px; object-fit: cover; border-radius: var(--radius-default); border: 1px solid var(--stroke-neutral-light); background: var(--bg-white); }
.ds-ava__msg-kind { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); color: var(--text-secondary); }
.ds-ava__msg-kind .ti { font-size: 14px; }
.ds-ava__inline-ico { font-size: 14px; vertical-align: -2px; }
.ds-ava__input { flex: 1; min-height: calc(var(--input-height) * 2); max-height: 168px; padding: 8px calc(var(--btn-height) * 2 + 16px) 8px 12px; box-sizing: border-box;
  border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); background: var(--bg-white); resize: none; font: inherit; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); field-sizing: content; }
.ds-ava__input:hover { border-color: var(--stroke-brand); }
.ds-ava__input:focus { outline: none; border-color: var(--stroke-brand); box-shadow: 0 0 0 3px var(--bg-brand-light); }
.ds-ava__send { position: absolute; right: 8px; bottom: 8px; min-width: 0; width: var(--btn-height); padding: 0; }
.ds-ava-slide-enter-active, .ds-ava-slide-leave-active { transition: transform 0.2s ease; }
.ds-ava-slide-enter-from, .ds-ava-slide-leave-to { transform: translateX(100%); }
</style>
