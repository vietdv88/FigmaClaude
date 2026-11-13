<template>
  <!-- Trợ lý AVA trên header (bên trái icon chat): hỏi đáp quy tắc chấm điểm, cách xác định độ phức tạp, cách dùng app -->
  <button ref="btnEl" type="button" class="btn-icon-white ava-btn" :class="{ 'ava-btn--open btn-icon-white--active': open }" v-tip="'Trợ lý AVA — hỏi về cách chấm điểm, độ phức tạp, cách dùng app'"
    aria-label="Trợ lý AVA" @click="toggle">
    <!-- Viền beam tròn: chạy khi rê chuột lên nút, khi AVA đang trả lời, hoặc vài giây giới thiệu khi người dùng chưa từng mở AVA -->
    <span class="border-beam-round border-beam-round--hover" :class="{ 'border-beam-round--on': loading || intro }"><IconMisaAI /></span>
  </button>

  <!-- Callout giới thiệu cho người chưa từng mở AVA: chữ gõ lần lượt + Hỏi AVA ngay / Để sau -->
  <Teleport to="body">
    <Transition name="ava-callout">
      <div v-if="callout.show" class="ava-callout" :style="callout.pos" role="dialog" aria-label="Giới thiệu trợ lý AVA">
        <span class="ava-callout__arrow" :style="{ right: callout.arrow }" />
        <div class="ava-callout__head">
          <span class="ava-callout__logo"><IconMisaAI /></span>
          <span class="ava-callout__name"><b class="text-ai-primary">AVA</b> <span>· Trợ lý Solution Point</span></span>
          <button type="button" class="btn-icon btn-icon--sm" aria-label="Đóng" @click="dismissCallout"><TIcon name="x" /></button>
        </div>
        <!-- Kiến thức mới: AVA vừa được cập nhật → gợi ý câu hỏi, bấm là hỏi luôn -->
        <template v-if="callout.kind === 'news'">
          <p class="ava-callout__text ava-callout__text--news"><span class="ava-callout__new">Mới</span> Mình vừa được cập nhật kiến thức về {{ newsTopics }}. Bạn có thể hỏi mình:</p>
          <div class="ava-callout__qs">
            <button v-for="q in calloutQs" :key="q" type="button" class="ava__chip" @click="askNews(q)"><TIcon name="sparkles" class="ti--ai" />{{ q }}</button>
          </div>
          <div class="ava-callout__actions ava-callout__actions--on">
            <button type="button" class="btn btn--link btn--sm" @click="dismissCallout">Để sau</button>
            <button type="button" class="btn btn--outline btn--sm" @click="markNewsSeen(); hideCallout()">Đã xem</button>
          </div>
        </template>
        <template v-else>
        <p class="ava-callout__text">{{ typed }}<span v-if="typing" class="ava-callout__caret" /></p>
        <div class="ava-callout__actions" :class="{ 'ava-callout__actions--on': !typing }">
          <button type="button" class="btn btn--link btn--sm" @click="dismissCallout">Để sau</button>
          <button type="button" class="btn btn--ai btn--sm" @click="openFromCallout"><TIcon name="sparkles" />Hỏi AVA ngay</button>
        </div>
        </template>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <!-- Khung AVA cao full màn hình, đẩy cả trang (kể cả header) sang trái — nằm ngoài .app-shell (Teleport) -->
    <Teleport to="body">
    <Transition name="ava-slide">
      <aside v-if="open" class="ava side-panel" role="dialog" aria-label="Trợ lý AVA" v-resizable-drawer="{ key: 'ava', min: 340 }" v-side-panel>
        <div class="ava__head">
          <!-- Avatar AVA đầu khung: viền border beam luôn xoay khi khung đang mở -->
          <span class="ava__logo border-beam-round border-beam-round--on"><IconMisaAI /></span>
          <span class="ava__title-wrap">
            <span class="ava__title text-ai-primary">Trợ lý AVA</span>
            <!-- Đang tư vấn cho bộ phận nào — đổi được bất cứ lúc nào -->
            <span v-if="focus" class="ava__focus" role="group" aria-label="Tư vấn chấm điểm cho">
              <span class="ava__focus-k">Tư vấn cho</span>
              <button v-for="f in FOCUS_LIST" :key="f.id" type="button" class="ava__focus-btn" :class="{ 'ava__focus-btn--on': focus === f.id }" :aria-pressed="focus === f.id" @click="setFocus(f.id)">{{ f.id }}</button>
            </span>
            <span v-else class="ava__sub">Hỏi về quy tắc chấm điểm & cách dùng Solution Point</span>
          </span>
          <button v-if="msgs.length" class="btn-icon" type="button" v-tip="'Cuộc trò chuyện mới'" aria-label="Cuộc trò chuyện mới" @click="reset"><TIcon name="message-plus" /></button>
          <button class="btn-icon" type="button" v-tip="'Đóng (Esc)'" aria-label="Đóng" @click="open = false"><TIcon name="x" /></button>
        </div>

        <div ref="listEl" class="ava__msgs">
          <!-- Lời chào + câu hỏi gợi ý -->
          <div class="ava__msg ava__msg--ava">
            <span class="ava__avatar"><IconMisaAI /></span>
            <div class="ava__bubble">
              Xin chào {{ firstName }}! Mình là <strong>AVA</strong>.
              <template v-if="!focus">Bạn muốn hỏi <strong>cách chấm điểm cho PD hay cho BA</strong>? Chọn bên dưới để mình gợi ý câu hỏi phù hợp nhé.</template>
              <template v-else-if="focus === 'PD'">Mình tư vấn <strong>cách chấm điểm PD</strong>: độ phức tạp, người đưa giải pháp, đếm màn hình, mức hài lòng, chốt điểm… Bạn cũng có thể mô tả một công việc để mình gợi ý độ phức tạp.</template>
              <template v-else>Mình tư vấn <strong>cách chấm điểm BA</strong>: BA Point, tiến độ, chất lượng, điểm thực nhận, chốt điểm… Bạn cũng có thể đưa số liệu một việc để mình tính điểm thực nhận.</template>
              <!-- Giới thiệu khả năng làm thay: mọi thao tác đều có thẻ xác nhận, bấm nút mới ghi dữ liệu -->
              <span class="ava__can"><strong>Mình còn làm giúp bạn được</strong> (bạn xem lại rồi bấm xác nhận mới ghi):</span>
              <ul class="ava__can-list">
                <li>Gợi ý <strong>độ phức tạp, hệ số nghiệp vụ, số màn</strong>… rồi <strong>điền luôn</strong> vào công việc đang mở</li>
                <li><strong>Tạo công việc</strong> — 1 việc hoặc cả danh sách, kèm PD, số màn, độ phức tạp</li>
                <li><strong>Tạo dự án</strong> (kèm thành viên, vòng lặp đầu) hoặc <strong>tạo vòng lặp</strong> mới</li>
                <li><strong>Đọc ảnh</strong> màn hình / thiết kế (dán Ctrl + V hoặc bấm <TIcon name="photo-up" class="ava__inline-ico" />) rồi đề xuất chấm điểm</li>
              </ul>
            </div>
          </div>
          <!-- Lộ trình chấm điểm trên ứng dụng — theo vai trò đăng nhập (PD / BA / PO), luôn hiện khi chưa hỏi gì -->
          <button v-if="journey && !msgs.length" type="button" class="ava__journey" @click="ask(journey.q)">
            <span class="ava__journey-icon"><TIcon name="route" class="ti--ai" /></span>
            <span class="ava__journey-text"><strong>{{ journey.title }}</strong><span>{{ journey.sub }}</span></span>
            <TIcon name="chevron-right" class="ava__pick-chev" />
          </button>
          <!-- Chưa biết bộ phận → hỏi trước -->
          <div v-if="!focus" class="ava__pick">
            <button v-for="f in FOCUS_LIST" :key="f.id" type="button" class="ava__pick-btn" @click="setFocus(f.id)">
              <span class="ava__pick-icon"><TIcon :name="f.icon" class="ti--ai" /></span>
              <span class="ava__pick-text"><strong>Chấm điểm {{ f.id }}</strong><span>{{ f.label }}</span></span>
              <TIcon name="chevron-right" class="ava__pick-chev" />
            </button>
          </div>
          <div v-else-if="!msgs.length" class="ava__chips">
            <template v-if="panelNewsQs.length">
              <span class="ava__chips-title"><span class="ava-callout__new">Mới</span> Kiến thức vừa cập nhật</span>
              <button v-for="q in panelNewsQs" :key="q" type="button" class="ava__chip" @click="ask(q)"><TIcon name="sparkles" class="ti--ai" />{{ q }}</button>
            </template>
            <span class="ava__chips-title">Câu hỏi gợi ý cho {{ focus }}</span>
            <button v-for="q in SUGGESTIONS[focus]" :key="q" type="button" class="ava__chip" @click="ask(q)"><TIcon name="sparkles" class="ti--ai" />{{ q }}</button>
            <span class="ava__chips-title"><span class="text-ai-primary">Nhờ AVA làm giúp</span></span>
            <!-- Mẫu câu lệnh: điền sẵn vào ô nhập để bạn sửa chi tiết rồi gửi -->
            <button v-for="q in DO_PROMPTS" :key="q.label" type="button" class="ava__chip ava__chip--do" @click="prefill(q.text)"><TIcon :name="q.icon" />{{ q.label }}</button>
          </div>

          <template v-for="(m, i) in msgs" :key="i">
            <div v-if="m.role === 'user'" class="ava__msg ava__msg--me">
              <div v-if="m.thumbs?.length" class="ava__msg-imgs"><img v-for="(t, k) in m.thumbs" :key="k" :src="t" alt="Ảnh đính kèm" /></div>
              <span v-if="m.imgKind" class="ava__msg-kind"><TIcon name="photo" />{{ m.imgKind }}</span>
              <div class="ava__bubble">{{ m.text }}</div>
            </div>
            <div v-else class="ava__msg ava__msg--ava">
              <span class="ava__avatar"><IconMisaAI /></span>
              <!-- eslint-disable-next-line vue/no-v-html — nội dung đã escape HTML trước khi định dạng (fmt) -->
              <div class="ava__col">
                <div class="ava__bubble ava__bubble--md" v-html="fmt(m.text)" @click="onLink" />
                <span v-if="m.reused" class="ava__reused"><TIcon name="history" />Câu trả lời có sẵn · không tốn lượt hỏi</span>
                <!-- AVA đề xuất thao tác (tạo việc / dự án, điền tham số…) → thẻ xác nhận: sửa / bỏ từng dòng rồi bấm mới ghi dữ liệu -->
                <AvaActionCard v-if="m.action" :action="m.action" :state="m.actionState" @update:state="v => (m.actionState = v)" />
                <!-- Đánh giá câu trả lời: Like / Dislike (Dislike → góp ý AVA sai / thiếu ở đâu, không bắt buộc)
                     Câu trả lời MỚI NHẤT chưa đánh giá → thẻ hỏi nổi bật (nút có chữ); câu cũ / đã đánh giá → dòng icon gọn -->
                <div v-if="m.logId && !m.refused && !m.vote && i === lastRateIdx" class="ava__ask">
                  <span class="ava__ask-q"><span class="text-ai-primary">{{ askLine(m)[0] }}</span> {{ askLine(m)[1] }}</span>
                  <div class="ava__ask-btns">
                    <button type="button" class="btn btn--outline btn--sm ava__ask-btn ava__ask-btn--up" @click="vote(m, 'up')"><TIcon name="thumb-up" />Hài lòng</button>
                    <button type="button" class="btn btn--outline btn--neutral btn--sm ava__ask-btn" @click="vote(m, 'down')"><TIcon name="thumb-down" />Chưa ổn</button>
                  </div>
                </div>
                <div v-else-if="m.logId && !m.refused" class="ava__rate">
                  <span class="ava__rate-q">{{ m.vote === 'up' ? 'Cảm ơn bạn đã đánh giá!' : m.vote === 'down' ? (m.noteSent ? 'Cảm ơn góp ý của bạn!' : 'Cảm ơn bạn — AVA sẽ được cải thiện') : 'Câu trả lời có giúp ích cho bạn?' }}</span>
                  <button type="button" class="btn-icon btn-icon--sm ava__rate-btn" :class="{ 'ava__rate-btn--up': m.vote === 'up' }" :aria-pressed="m.vote === 'up'"
                    v-tip="m.vote === 'up' ? 'Bỏ đánh giá' : 'Hữu ích'" aria-label="Hữu ích" @click="vote(m, 'up')"><TIcon name="thumb-up" /></button>
                  <button type="button" class="btn-icon btn-icon--sm ava__rate-btn" :class="{ 'ava__rate-btn--down': m.vote === 'down' }" :aria-pressed="m.vote === 'down'"
                    v-tip="m.vote === 'down' ? 'Bỏ đánh giá' : 'Chưa đúng / chưa đủ'" aria-label="Chưa đúng / chưa đủ" @click="vote(m, 'down')"><TIcon name="thumb-down" /></button>
                </div>
                <form v-if="m.vote === 'down' && !m.noteSent" class="ava__rate-note" @submit.prevent="sendNote(m)">
                  <AppTextbox v-model="m.noteDraft" size="sm" class="ava__rate-input" placeholder="AVA sai / thiếu ở đâu? (không bắt buộc)" />
                  <button type="submit" class="btn btn--outline btn--neutral btn--sm" :disabled="!m.noteDraft?.trim()">Gửi</button>
                </form>
              </div>
            </div>
          </template>

          <div v-if="loading" class="ava__msg ava__msg--ava">
            <span class="ava__avatar border-beam-round border-beam-round--on"><IconMisaAI /></span>
            <div class="ava__bubble ava__typing" aria-label="AVA đang trả lời"><i /><i /><i /></div>
          </div>
          <div v-if="error" class="ava__error">
            <TIcon name="circle-x" /><span class="ava__error-text">{{ error }}</span>
            <button type="button" class="btn btn--link btn--sm" @click="retry">Thử lại</button>
          </div>
        </div>

        <form class="ava__compose" @submit.prevent="send">
          <!-- Đang gõ → câu ĐÃ CÓ câu trả lời gần giống (Lịch sử hỏi AVA, cùng nhóm vai trò) — bấm chọn là xem ngay, không gọi AI -->
          <div v-if="similar.length && !simHidden && !loading && !atts.length" class="ava__similar">
            <div class="ava__similar-hd">
              <TIcon name="history" />
              <span class="ava__similar-title">Có phải bạn định hỏi? <span class="ava__similar-sub">Đã có câu trả lời — bấm để xem ngay</span></span>
              <button type="button" class="btn-icon btn-icon--sm" v-tip="'Ẩn gợi ý'" aria-label="Ẩn gợi ý" @click="simHidden = true"><TIcon name="x" /></button>
            </div>
            <button v-for="s in similar" :key="s.id" type="button" class="ava__similar-item" @click="reuse(s)">{{ s.question }}</button>
          </div>
          <!-- Bộ gõ tiếng Việt: chữ đang soạn chưa vào v-model → gửi đọc thẳng nội dung ô; Enter lúc đang soạn chỉ để chốt chữ -->
          <!-- Ảnh đính kèm: chọn file / dán (Ctrl + V) / kéo thả → trình duyệt thu nhỏ + nén rồi mới gửi AI (tối đa 3 ảnh) -->
          <div class="ava__box" :class="{ 'ava__box--drag': dragOver }" @dragover.prevent="dragOver = true" @dragleave.self="dragOver = false" @drop.prevent="onDrop">
            <div v-if="atts.length || preparing" class="ava__atts">
              <div class="ava__att-list">
                <span v-for="(a, k) in atts" :key="k" class="ava__att">
                  <img :src="a.thumb" alt="Ảnh đính kèm" />
                  <button type="button" class="ava__att-x" v-tip="'Bỏ ảnh'" aria-label="Bỏ ảnh" @click="atts.splice(k, 1)"><TIcon name="x" /></button>
                </span>
                <span v-if="preparing" class="ava__att ava__att--loading"><TIcon name="loader-2" class="ava__spin" /></span>
              </div>
              <!-- Ảnh chỉ cho thấy kết quả → hỏi vẽ mới hay chỉnh sửa để AVA khoanh vùng tính điểm cho đúng -->
              <div class="ava__att-kind">
                <span class="ava__att-kind-q">Màn này bạn:</span>
                <button v-for="k in IMG_KINDS" :key="k.id" type="button" class="ava__chip ava__chip--sm" :class="{ 'ava__chip--on': imgKind === k.id }" @click="imgKind = imgKind === k.id ? '' : k.id">{{ k.label }}</button>
              </div>
            </div>
            <textarea ref="inputEl" v-model="text" class="ava__input" rows="2" :maxlength="AVA_MAX_CHARS" :placeholder="placeholder"
              @keydown.enter.exact="onEnter" @input="onInput" @compositionend="onInput" @paste="onPaste" />
            <input ref="fileEl" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden @change="onPick" />
            <button class="btn-icon btn-icon--sm ava__attach" type="button" :disabled="atts.length >= AVA_MAX_IMAGES"
              v-tip="'Đính kèm ảnh màn hình / thiết kế (hoặc dán Ctrl + V) — AVA đọc ảnh và đề xuất chấm điểm'" aria-label="Đính kèm ảnh" @click="fileEl?.click()"><TIcon name="photo-up" /></button>
            <button class="btn-icon btn-icon--sm ava__send" :class="{ 'ava__send--on': canSend }" type="submit"
              :disabled="!canSend" v-tip="'Gửi (Enter)'" aria-label="Gửi"><TIcon name="send" :class="{ 'ti--ai': canSend }" /></button>
          </div>
          <p v-if="atts.length" class="ava__note">Ảnh gửi AVA được lưu 30 ngày để Quản trị kiểm tra chất lượng trả lời, sau đó tự xóa — tránh gửi ảnh có thông tin nhạy cảm.</p>
          <p v-else class="ava__note">AVA chỉ trả lời trong phạm vi Solution Point, có thể nhầm — đối chiếu trang Quy tắc chấm điểm khi cần.</p>
        </form>
      </aside>
    </Transition>
    </Teleport>
  </Teleport>
</template>

<script>
let introShown = false   // giới thiệu chỉ 1 lần mỗi lần tải trang (AppShell dựng lại khi chuyển trang)
let typedOnce = false     // callout gõ chữ lần đầu; chuyển trang hiện lại thì hiện đủ chữ luôn
</script>

<script setup>
import { isPdRole } from '../store/scoring.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { vResizableDrawer } from '@mds/utils/resizableDrawer.js'
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import { toast } from '@mds/utils/toast.js'
import IconMisaAI from '@mds/components/IconMisaAI.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'
import { currentUser, myDeptAdmin } from '../store/db.js'
import { chat } from '../store/chat.js'
import { askAva, rateAva } from '../store/ai.js'
import { api, backend } from '../store/api.js'
import { avaBus, avaCtx } from '../store/avaBus.js'
import { vSidePanel } from '@mds/utils/sidePanel.js'
import { AVA_MAX_CHARS } from '../store/aiAva.js'
import { prepareImage, AVA_MAX_IMAGES } from '../store/imageResize.js'
import { avaHtml as fmt } from '../store/avaFormat.js'
import { useRouter, useRoute } from 'vue-router'
import AvaActionCard from './AvaActionCard.vue'
import { db, canAddTask, canManageProject, canCreateProject, canEditField, projectById, iterationById } from '../store/db.js'
import { AVA_TASK_FIELDS } from '../store/avaActions.js'
import { latestNews, isFresh, newsQuestions, newsTopics as topicsOf } from '../store/avaNews.js'
import { userPref } from '../store/userPrefs.js'
const router = useRouter(), route = useRoute()
/* Ngữ cảnh màn đang mở gửi kèm câu hỏi: dự án (+ thành viên, quyền) · vòng lặp · công việc đang xem — để AVA đề xuất thao tác đúng chỗ */
function avaContext() {
  const pid = String(route.params?.id ?? ''), p = route.path.startsWith('/du-an/') ? projectById(pid) : null
  const tid = avaCtx.taskId || String(route.query?.cv ?? ''), t = tid ? db.tasks.find(x => x.id === tid) : null
  const proj = p ?? (t ? projectById(t.projectId) : null)
  const it = route.query?.vl ? iterationById(String(route.query.vl)) : (t ? iterationById(t.iterationId) : null)
  return {
    canCreateProject: canCreateProject(),
    project: proj ? { id: proj.id, name: proj.name, code: proj.code ?? '', canAdd: canAddTask(proj.id), canManage: canManageProject(proj.id),
      members: db.users.filter(u => proj.memberIds?.includes(u.id) && u.status !== 'disabled').map(u => ({ name: u.name, code: u.code ?? '', role: u.role })) } : null,
    iteration: it ? { id: it.id, name: it.name, startDate: it.startDate, endDate: it.endDate } : null,
    // Danh bạ người dùng — chỉ khi được quản trị dự án đang mở / tạo dự án (để AVA thêm thành viên đúng người)
    directory: canCreateProject() || (proj && canManageProject(proj.id)) ? db.users.filter(u => u.status !== 'disabled').slice(0, 300).map(u => ({ name: u.name, code: u.code ?? '', role: u.role })) : null,
    task: t ? { id: t.id, content: t.content, pbi: t.pbi, stage: t.stage, mainScreens: t.mainScreens, subScreens: t.subScreens, complexity: t.complexity, businessLevel: t.businessLevel,
      solutionBy: t.solutionBy, platform: t.platform, solutionBrief: t.solutionBrief, editable: AVA_TASK_FIELDS.filter(f => canEditField(t, f)) } : null,
  }
}
/* Link AVA gửi (dự án, tạo vòng lặp, thêm công việc…) → chuyển trang trong app, không tải lại; màn hẹp thì đóng khung AVA cho thấy trang */
function onLink(e) {
  const a = e.target.closest?.('a[data-ava-link]')
  if (!a) return
  e.preventDefault()
  router.push(a.getAttribute('href'))
  if (window.innerWidth < 900) open.value = false
}

ensureAiGradient()

/* Câu hỏi gợi ý theo bộ phận — PD và BA có quy tắc chấm điểm khác nhau */
const FOCUS_LIST = [
  { id: 'PD', label: 'UI/UX Designer — độ phức tạp, màn hình, mức hài lòng', icon: 'pencil' },
  { id: 'BA', label: 'Business Analyst — BA Point, tiến độ, chất lượng', icon: 'clipboard-list' },
]
/* Mẫu câu nhờ AVA làm giúp — bấm điền sẵn vào ô nhập (sửa chi tiết rồi Enter) */
const DO_PROMPTS = [
  { icon: 'pencil', label: 'Gợi ý & điền tham số cho việc đang mở', text: 'Việc đang mở có … màn hình chính, … màn phụ, mô tả: … — gợi ý độ phức tạp, hệ số nghiệp vụ rồi chọn luôn giúp mình' },
  { icon: 'list-details', label: 'Tạo công việc vào vòng lặp đang mở', text: 'Tạo giúp các việc sau vào vòng lặp đang mở: 1) … (… màn), 2) … — giao cho …' },
  { icon: 'briefcase', label: 'Tạo dự án mới', text: 'Tạo dự án … mã …, thành viên: … (quản trị), …; vòng lặp đầu từ … đến …' },
]
function prefill(t) { text.value = t; nextTick(() => { const el = inputEl.value; if (!el) return; el.value = t; autosize(el); el.focus(); const i = t.indexOf('…'); if (i >= 0) el.setSelectionRange(i, i + 1) }) }
const SUGGESTIONS = {
  PD: [
    'Điểm một công việc thiết kế được tính như thế nào?',
    'Làm sao chọn độ phức tạp thiết kế và hệ số nghiệp vụ?',
    'Màn hình chính và màn hình phụ khác nhau thế nào?',
    'Popup thêm mới có combo bên trong thì khai mấy màn chính, mấy màn phụ?',
    'Khi nào chọn người đưa giải pháp là PD?',
    'Điểm kỳ vọng và tỷ lệ đạt tính ra sao?',
    'Khi nào chọn loại việc Chỉ thiết kế hay Phân tích → Thiết kế?',
  ],
  BA: [
    'Điểm thực nhận của BA tính thế nào?',
    'BA Point được chấm như thế nào?',
    'Khi nào được miễn trừ trễ?',
    'Phân biệt chất lượng 100% và 80%?',
    'Việc làm tháng này nhưng tháng sau mới xong thì tính sao?',
    'Khi nào chọn loại việc Chỉ phân tích hay Phân tích → Thiết kế?',
  ],
}
/* Lộ trình chấm điểm trên ứng dụng theo vai trò đăng nhập — câu hỏi bấm sẵn, AVA trả lời đúng lộ trình của vai trò (tri thức “LỘ TRÌNH…” trong aiAva.js)
   PD / PD Lead → PD · BA → BA · PO / Quản trị / Quản trị PD, BA → PO · HRBP / QA (chỉ xem) → không hiện */
const journey = computed(() => {
  const u = currentUser.value, r = u?.role
  if (isPdRole(r)) return { title: 'Cách chấm điểm cho PD trên ứng dụng', sub: 'Đọc quy tắc → vào dự án → khai & cập nhật việc → chốt điểm cuối tháng', q: 'Hướng dẫn mình cách chấm điểm cho PD trên ứng dụng, từ đầu đến khi chốt điểm' }
  if (r === 'BA') return { title: 'Cách chấm điểm cho BA trên ứng dụng', sub: 'Đọc quy tắc → vào dự án → khai & cập nhật việc → chốt điểm cuối tháng', q: 'Hướng dẫn mình cách chấm điểm cho BA trên ứng dụng, từ đầu đến khi chốt điểm' }
  if (r === 'PO' || r === 'admin' || myDeptAdmin()) return { title: 'Cách tổ chức chấm điểm PD, BA trên ứng dụng', sub: 'Tạo dự án & thành viên → vòng lặp → công việc → đánh giá → chốt điểm', q: 'Mình là PO — hướng dẫn các bước tổ chức chấm điểm cho PD và BA trên ứng dụng, từ tạo dự án đến chốt điểm' }
  return null
})
/* Bộ phận đang tư vấn: theo vai trò (PD / BA) — vai trò khác thì hỏi trước; nhớ trong tab */
const FOCUS_KEY = 'pdpoint-ava-focus'
const focus = ref((() => { try { const v = sessionStorage.getItem(FOCUS_KEY); if (v === 'PD' || v === 'BA') return v } catch { /* bỏ qua */ }
  const r = currentUser.value?.role; return isPdRole(r) ? 'PD' : r === 'BA' ? r : '' })())
function setFocus(f) { focus.value = f; try { sessionStorage.setItem(FOCUS_KEY, f) } catch { /* bỏ qua */ } scrollEnd() }

/* Hội thoại giữ trong tab (sessionStorage) — đóng mở khung vẫn còn; “Cuộc trò chuyện mới” để xóa */
const KEY = 'pdpoint-ava'
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || [] } catch { return [] } }
const msgs = ref(load())
/** Câu trả lời AVA mới nhất (để hiện thẻ hỏi đánh giá nổi bật) */
// Câu mời đánh giá — vui vẻ cho người dùng dễ bấm; chọn theo mã lượt hỏi để không đổi câu khi vẽ lại
// [chữ, emoji] — emoji để NGOÀI .text-ai-primary (gradient cắt theo chữ sẽ tô đặc emoji)
const ASK_LINES = [
  ['Hài lòng thì bảo hài lòng, chưa ổn thì bảo chưa ổn nha', '😄'],
  ['AVA trả lời vậy được chưa? Chấm cho AVA một phát nè', '👇'],
  ['Trúng ý bạn chưa? Một cú bấm giúp AVA khôn hơn đó', '✨'],
  ['Khen hay chê đều được, AVA không dỗi đâu', '😉'],
]
const askLine = m => ASK_LINES[[...String(m.logId)].reduce((h, c) => h + c.charCodeAt(0), 0) % ASK_LINES.length]
const lastRateIdx = computed(() => msgs.value.findLastIndex(m => m.role !== 'user'))
watch(msgs, v => { try { sessionStorage.setItem(KEY, JSON.stringify(v.slice(-40))) } catch { /* bỏ qua */ } }, { deep: true })

/* Ảnh đính kèm đang soạn */
const IMG_KINDS = [
  { id: 'new', label: 'Vẽ mới toàn bộ', note: 'màn VẼ MỚI TOÀN BỘ' },
  { id: 'edit', label: 'Chỉnh sửa một phần', note: 'CHỈ CHỈNH SỬA một phần màn có sẵn' },
]
const atts = ref([]), preparing = ref(false), dragOver = ref(false), imgKind = ref(''), fileEl = ref(null)
const canSend = computed(() => !!(text.value.trim() || atts.value.length) && !loading.value && !preparing.value)
const placeholder = computed(() => !atts.value.length ? 'Hỏi AVA… (Enter để gửi, Shift + Enter xuống dòng · dán ảnh để AVA đọc)'
  : imgKind.value === 'edit' ? 'Mô tả phần đã chỉnh sửa (VD: thêm cột Ghi chú, thêm popup xác nhận…)'
  : 'Mô tả thêm nếu cần (VD: màn danh sách đơn hàng cho kế toán)…')
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
  focusInput()
}
function onPick(e) { addFiles(e.target.files ?? []); e.target.value = '' }
function onDrop(e) { dragOver.value = false; addFiles(e.dataTransfer?.files ?? []) }
function onPaste(e) {
  const files = [...(e.clipboardData?.items ?? [])].filter(i => i.kind === 'file' && i.type.startsWith('image/')).map(i => i.getAsFile()).filter(Boolean)
  if (!files.length) return
  if (!e.clipboardData.types.includes('text/plain')) e.preventDefault()   // chỉ có ảnh → không dán chữ rác vào ô
  addFiles(files)
}
const open = ref(false), text = ref(''), loading = ref(false), error = ref(''), listEl = ref(null), inputEl = ref(null)
/* Giới thiệu lần đầu: người dùng chưa từng mở AVA → viền beam chạy ~5 giây (1 lần mỗi lần tải trang); mở AVA rồi thì thôi */
const SEEN_KEY = 'pdpoint-ava-seen-v3'   // v3: giới thiệu khả năng làm giúp (tạo việc, dự án, điền tham số) · đổi phiên bản = cho mọi người thấy lại giới thiệu (callout + viền beam) 1 lần
const seen = () => { try { return localStorage.getItem(SEEN_KEY) === '1' } catch { return true } }
const intro = ref(false)
if (!introShown && !seen()) {
  introShown = true; intro.value = true
  setTimeout(() => (intro.value = false), 5500)
}
function markSeen() { intro.value = false; try { localStorage.setItem(SEEN_KEY, '1') } catch { /* bỏ qua */ } }

/* ── Kiến thức mới (store/avaNews.js): chưa xem mục mới nhất → callout gợi ý câu hỏi; khung AVA có nhóm “Mới cập nhật” ── */
const newsSeen = userPref('ava-news-seen', '')   // id mục tin đã xem — theo từng người dùng
const news = latestNews()
const hasNews = () => !!news && isFresh(news) && newsSeen.value !== news.id
function markNewsSeen() { if (news) newsSeen.value = news.id }
const newsTopics = computed(() => topicsOf(news, currentUser.value))
const calloutQs = computed(() => newsQuestions(news, currentUser.value))
const panelNewsQs = computed(() => (isFresh(news) ? newsQuestions(news, currentUser.value, focus.value) : []))
function askNews(q) { markNewsSeen(); hideCallout(); if (!open.value) toggle(); ask(q) }
const firstName = computed(() => String(currentUser.value?.name ?? '').trim().split(/\s+/).pop() || 'bạn')

// Khung AVA và khung chat nội bộ cùng nằm bên phải → mở cái này thì đóng cái kia
watch(() => chat.open, v => { if (v) open.value = false })
function toggle() { open.value = !open.value; if (open.value) { chat.open = false; markSeen(); markNewsSeen(); hideCallout(); focusInput() } }   // mở AVA = đã thấy nhóm “Mới cập nhật”
// Mỗi lúc chỉ 1 khung bên phải: mở chat → đóng AVA
watch(() => chat.open, v => { if (v && open.value) open.value = false })
// Nơi khác (VD gợi ý ở Tổng quan) bấm “Hỏi AVA” → mở panel, chọn chủ đề, gửi luôn câu hỏi
watch(() => avaBus.n, () => {
  if (!avaBus.question) return
  if (avaBus.focus === 'PD' || avaBus.focus === 'BA') setFocus(avaBus.focus)
  if (!open.value) toggle()
  ask(avaBus.question)
})

/* ── Callout giới thiệu: người chưa từng mở AVA → bật dưới icon, gõ chữ lần lượt; “Để sau” = ẩn tới hết phiên (tab) ── */
const LATER_KEY = 'pdpoint-ava-callout-later', NEWS_LATER_KEY = 'pdpoint-ava-news-later'
const later = () => { try { return sessionStorage.getItem(LATER_KEY) === '1' } catch { return false } }
const btnEl = ref(null), typed = ref(''), typing = ref(false)
const callout = reactive({ show: false, pos: {}, arrow: '20px', kind: 'intro' })   // kind: intro (giới thiệu lần đầu) · news (kiến thức mới)
const newsLater = () => { try { return sessionStorage.getItem(NEWS_LATER_KEY) === news?.id } catch { return false } }
const calloutText = computed(() => `Chào ${firstName.value}! Mình là AVA — hỏi mình về cách chấm điểm bất cứ lúc nào. Mình còn làm giúp được: gợi ý rồi điền độ phức tạp vào việc đang mở, tạo công việc, tạo dự án / vòng lặp — bạn chỉ cần xem lại và bấm xác nhận.`)
let showTimer = null, typeTimer = null
function place() {
  const r = btnEl.value?.getBoundingClientRect(); if (!r) return
  const right = Math.max(8, window.innerWidth - r.right - 12)
  callout.pos = { top: `${r.bottom + 10}px`, right: `${right}px` }
  callout.arrow = `${Math.max(12, window.innerWidth - (r.left + r.width / 2) - right - 7)}px`
}
function showCallout() {
  if (open.value) return
  // Đã xem giới thiệu → còn kiến thức mới chưa xem thì gợi ý (hiện đủ chữ, không gõ)
  if (seen()) {
    if (!hasNews() || newsLater() || !calloutQs.value.length) return
    place(); callout.kind = 'news'; callout.show = true; return
  }
  if (later()) return
  markNewsSeen()   // người mới: giới thiệu đã nói đủ → không báo “kiến thức mới” cũ nữa
  place(); callout.kind = 'intro'; callout.show = true
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (typedOnce || reduce) { typed.value = calloutText.value; typing.value = false; return }
  typedOnce = true; typed.value = ''; typing.value = true
  let i = 0
  typeTimer = setInterval(() => {
    typed.value = calloutText.value.slice(0, ++i)
    if (i >= calloutText.value.length) { clearInterval(typeTimer); typing.value = false }
  }, 28)
}
function hideCallout() { callout.show = false; clearTimeout(showTimer); clearInterval(typeTimer); typing.value = false }
function dismissCallout() { const k = callout.kind; hideCallout(); try { k === 'news' ? sessionStorage.setItem(NEWS_LATER_KEY, news?.id ?? '') : sessionStorage.setItem(LATER_KEY, '1') } catch { /* bỏ qua */ } }   // Để sau: ẩn tới hết phiên
function openFromCallout() { hideCallout(); if (!open.value) toggle() }
onMounted(() => {
  if (seen() ? !hasNews() || newsLater() : later()) return
  showTimer = setTimeout(showCallout, typedOnce ? 200 : 1200)
  window.addEventListener('resize', place)
})
onBeforeUnmount(() => { hideCallout(); window.removeEventListener('resize', place) })
const focusInput = () => nextTick(() => { scrollEnd(); inputEl.value?.focus() })
const scrollEnd = () => nextTick(() => requestAnimationFrame(() => { if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight }))
watch(listEl, el => { if (el) scrollEnd() })   // mở lại khung AVA → cuộn xuống câu cuối

function autosize(el = inputEl.value) { if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 168) + 'px' }
function onInput(e) { text.value = e.target.value; autosize(e.target) }
function onEnter(e) {
  if (e.isComposing || e.keyCode === 229) return      // đang soạn chữ có dấu → Enter để bộ gõ chốt chữ
  e.preventDefault(); send()
}
function send() {
  let body = (inputEl.value?.value ?? text.value).trim()
  if ((!body && !atts.value.length) || loading.value || preparing.value) return
  const images = atts.value.splice(0)
  if (images.length) {
    const kind = IMG_KINDS.find(k => k.id === imgKind.value)
    body ||= 'Đọc ảnh và đề xuất tham số chấm điểm giúp mình.'
    imgKind.value = ''
    text.value = ''; if (inputEl.value) { inputEl.value.value = ''; autosize() }
    return ask(body, images, kind)
  }
  text.value = ''; if (inputEl.value) { inputEl.value.value = ''; autosize() }
  ask(body)
}
async function ask(q, images = [], kind = null) {
  const m = { role: 'user', text: q }
  if (images.length) {
    Object.assign(m, { thumbs: images.map(i => i.thumb), imgKey: 'img' + Date.now(), ...(kind ? { imgKind: kind.label, imgNote: kind.note } : {}) })
    imgStore.set(m.imgKey, images.map(i => ({ mime: i.mime, data: i.data })))
  }
  msgs.value.push(m)
  await run()
}
/* Ảnh đầy đủ chỉ giữ trong bộ nhớ tới khi AVA trả lời (không lưu sessionStorage) — lượt sau chỉ gửi chữ, AVA đã mô tả ảnh trong câu trả lời */
const imgStore = new Map()
const payloadOf = list => list.map((m, i) => {
  if (m.role !== 'user' || !m.thumbs?.length) return { role: m.role, text: m.text }
  const full = i === list.length - 1 ? imgStore.get(m.imgKey) : null, t = m.imgNote ? `[Ảnh: ${m.imgNote}] ${m.text}` : m.text
  return full ? { role: 'user', text: t, images: full } : { role: 'user', text: `${t}\n[Lượt này có kèm ${m.thumbs.length} ảnh — nội dung ảnh xem câu trả lời ngay sau của AVA]` }
})
/* ── Câu hỏi đã có câu trả lời gần giống (gõ tới đâu gợi ý tới đó, chờ 250ms sau phím cuối) ── */
const similar = ref([]), simHidden = ref(false)
let simSeq = 0, simTimer = 0
function clearSimilar() { clearTimeout(simTimer); simSeq++; similar.value = [] }
watch([text, focus], ([q]) => {
  clearTimeout(simTimer)
  const t = String(q || '').trim()
  if (!t) simHidden.value = false
  if (t.length < 6 || !backend.enabled) { clearSimilar(); return }
  simTimer = setTimeout(async () => {
    const my = ++simSeq
    try { const r = await api.get(`/api/ai/ava/similar?q=${encodeURIComponent(t)}&focus=${focus.value}`); if (my === simSeq) similar.value = r.items || [] }
    catch { if (my === simSeq) similar.value = [] }
  }, 250)
})
/** Bấm 1 câu gợi ý → lấy câu trả lời đã có (không gọi AI). Câu đã cũ → hỏi AVA như thường */
async function reuse(s) {
  if (loading.value) return
  text.value = ''; if (inputEl.value) { inputEl.value.value = ''; autosize() }
  clearSimilar()
  msgs.value.push({ role: 'user', text: s.question })
  loading.value = true; error.value = ''; scrollEnd()
  let fallback = false
  try {
    const r = await api.post('/api/ai/ava/reuse', { id: s.id, focus: focus.value })
    msgs.value.push({ role: 'ava', text: r.text, logId: r.logId || '', refused: false, vote: '', action: null, actionState: null, reused: true })
  } catch { msgs.value.pop(); fallback = true }
  finally { loading.value = false; scrollEnd() }
  if (fallback) ask(s.question)
}
async function run() {
  clearSimilar()
  loading.value = true; error.value = ''; scrollEnd()
  try {
    const ctx = avaContext()
    const sent = msgs.value.at(-1)
    const { text: answer, logId, refused, action, reused } = await askAva(payloadOf(msgs.value), focus.value, ctx)
    if (sent?.imgKey) imgStore.delete(sent.imgKey)
    // Thao tác gắn với ngữ cảnh lúc hỏi (việc / dự án / vòng lặp đang mở) — thẻ xác nhận dùng đúng chỗ đó
    const act = action ? { ...action, taskId: ctx?.task?.id ?? '', projectId: ctx?.project?.id ?? '', iterationId: ctx?.iteration?.id ?? '' } : null
    msgs.value.push({ role: 'ava', text: answer, logId: logId || '', refused: !!refused, vote: '', action: act, actionState: null, reused: !!reused })
  } catch (e) { error.value = e.message || 'AVA chưa trả lời được' }
  finally { loading.value = false; scrollEnd(); nextTick(() => inputEl.value?.focus()) }
}
function retry() { if (msgs.value.at(-1)?.role === 'user') run() }
/* Like / Dislike — bấm lại nút đang chọn = bỏ đánh giá */
async function vote(m, v) {
  const prev = m.vote, next = m.vote === v ? '' : v
  m.vote = next; m.noteSent = false
  try { await rateAva(m.logId, next) } catch (e) { m.vote = prev; toast.error(e.message || 'Không gửi được đánh giá') }
}
async function sendNote(m) {
  const note = String(m.noteDraft ?? '').trim().slice(0, 500); if (!note) return
  try { await rateAva(m.logId, 'down', note); m.noteSent = true; m.noteDraft = '' } catch (e) { toast.error(e.message || 'Không gửi được góp ý') }
}
function reset() { msgs.value = []; error.value = ''; focusInput() }

watch(() => msgs.value.length, scrollEnd)
useEscClose(() => { open.value = false }, () => !!open.value)   // ESC đóng panel (lớp trên cùng)
</script>

<style scoped>
/* Đang mở: dùng trạng thái active chuẩn của mds-ui (.btn-icon-white--active = như hover) */
.ava-btn :deep(svg) { display: block; }
.ava { position: fixed; top: 0; right: 0; bottom: 0; z-index: 1050; width: 400px; max-width: 100vw; display: flex; flex-direction: column;
  background: var(--bg-white); box-shadow: var(--shadow-left-8); }   /* panel ghim phải như Help panel: bóng trái, không viền (có bóng thì không viền) */
.ava__head { display: flex; align-items: center; gap: 10px; padding: 12px 12px 12px 16px; border-bottom: 1px solid var(--stroke-divider);
  background: linear-gradient(111deg, #edf9ff 8.87%, #fee2ff 100%); }
.ava__logo { display: inline-flex; flex-shrink: 0; }
.ava__logo :deep(svg) { width: 32px; height: 32px; }
.ava__title-wrap { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.ava__title { align-self: flex-start; font-size: var(--text-h3); font-weight: var(--fw-semibold); }   /* màu AI Primary: class .text-ai-primary (mds-ui) */
.ava__sub { font-size: var(--text-body); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ava__msgs { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; background: var(--bg-page); }
.ava__msg { display: flex; gap: 8px; max-width: 92%; }
.ava__msg--me { align-self: flex-end; max-width: 82%; flex-direction: column; align-items: flex-end; }
.ava__msg--ava { align-self: flex-start; }
.ava__avatar { flex-shrink: 0; align-self: flex-start; display: inline-flex; width: 24px; height: 24px; margin-top: 4px; }   /* không kéo giãn theo chiều cao bong bóng → viền beam tròn đúng tâm */
.ava__avatar :deep(svg) { width: 24px; height: 24px; }
.ava__bubble { padding: 8px 12px; border-radius: 14px; font-size: var(--text-body); line-height: var(--text-body-lh); white-space: pre-wrap; word-break: break-word; min-width: 0; }
.ava__msg--me .ava__bubble { background: var(--bg-brand); color: #fff; border-bottom-right-radius: 4px; }
.ava__msg--ava .ava__bubble { background: var(--bg-white); color: var(--text-primary); border-top-left-radius: 4px; box-shadow: var(--shadow-card); white-space: normal; }
.ava__bubble strong { font-weight: var(--fw-semibold); }
.ava__can { display: block; margin-top: 8px; }
.ava__can-list { margin: 4px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 2px; }
.ava__chip--do .ti { color: var(--icon-brand); }
.ava__col { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ava__ask { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; padding: 10px 12px; border: 1px solid transparent; border-radius: var(--radius-default);
  background: linear-gradient(var(--bg-white), var(--bg-white)) padding-box, linear-gradient(90deg, #1482ff, #cf11ff) border-box; animation: ava-ask-in 0.4s ease 0.6s both; }
.ava__ask-q { font-size: var(--text-body); font-weight: var(--fw-semibold); }
.ava__ask-btns { display: flex; gap: 8px; }
.ava__ask-btn .ti { font-size: 16px; }
.ava__ask-btn--up:hover .ti { animation: ava-thumb 0.5s ease; }
@keyframes ava-ask-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes ava-thumb { 30% { transform: rotate(-15deg) scale(1.15); } 60% { transform: rotate(8deg); } }
.ava__rate { display: flex; align-items: center; gap: 2px; padding-left: 4px; font-size: var(--text-body); color: var(--text-secondary); }
.ava__rate-q { margin-right: 4px; }
.ava__rate-btn { color: var(--icon-neutral); }
.ava__rate-btn--up, .ava__rate-btn--up:hover { color: var(--text-brand); }
.ava__rate-btn--down, .ava__rate-btn--down:hover { color: var(--text-danger); }
.ava__rate-note { display: flex; gap: 6px; padding-left: 4px; }
.ava__rate-input { flex: 1; min-width: 0; }
.ava__bubble--md :deep(p) { margin: 0 0 12px; }   /* khoảng nghỉ giữa các ý — đọc thoáng */
.ava__bubble--md :deep(p:last-child) { margin-bottom: 0; }
.ava__bubble--md :deep(ul), .ava__bubble--md :deep(ol) { margin: 0 0 12px; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; }
.ava__bubble--md :deep(ul:last-child), .ava__bubble--md :deep(ol:last-child) { margin-bottom: 0; }
.ava__bubble--md :deep(li) { margin: 0; }
.ava__bubble--md :deep(li > ul), .ava__bubble--md :deep(li > ol) { margin: 6px 0 0; color: var(--text-secondary); }   /* mục con: thụt + chữ phụ */
.ava__bubble--md :deep(h4) { margin: 16px 0 6px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-brand); }
.ava__bubble--md :deep(h4:first-child) { margin-top: 0; }
.ava__bubble--md :deep(code) { padding: 0 4px; border-radius: 4px; background: var(--bg-neutral-light); font-size: 0.92em; }
.ava__chips-title { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-secondary); }
.ava__focus { display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; }
.ava__focus-k { font-size: var(--text-body); color: var(--text-secondary); margin-right: 2px; }
.ava__focus-btn { padding: 0 10px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-pill); background: var(--bg-white); font-family: inherit; font-size: var(--text-body); line-height: 20px; font-weight: var(--fw-semibold); color: var(--text-secondary); cursor: pointer; }
.ava__focus-btn:hover { border-color: transparent; background: var(--ai-border-on-white); color: var(--text-primary); }   /* viền gradient AI */
.ava__focus-btn--on { border-color: transparent; background: var(--text-ai) text, linear-gradient(var(--bg-ai-light), var(--bg-ai-light)) padding-box, linear-gradient(var(--bg-white), var(--bg-white)) padding-box, var(--stroke-ai) border-box; -webkit-text-fill-color: transparent; color: transparent; }   /* chữ gradient AI (Text/AI) trên nền AI nhạt */
.ava__pick { display: flex; flex-direction: column; gap: 8px; padding-left: 32px; }
.ava__pick-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); background: var(--bg-white); font-family: inherit; text-align: left; cursor: pointer; }
.ava__pick-btn:hover { border-color: transparent; background: var(--ai-border-on-ai-light); }
.ava__pick-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: var(--bg-ai-light); color: var(--ai-begin-600); flex-shrink: 0; }   /* icon trong ô: thêm class .ti--ai để tô gradient Icon/AI (màu này dự phòng) */
.ava__pick-icon .ti { font-size: 18px; }
.ava__pick-text { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; font-size: var(--text-body); color: var(--text-secondary); }
.ava__pick-text strong { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ava__pick-chev { font-size: 16px; color: var(--icon-neutral); }
.ava__similar { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; padding: 8px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); background: var(--bg-white); }
.ava__similar-hd { display: flex; align-items: center; gap: 6px; padding: 0 0 4px 8px; }
.ava__similar-hd > .ti { font-size: 16px; color: var(--icon-neutral); flex-shrink: 0; }
.ava__similar-title { flex: 1; min-width: 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ava__similar-sub { font-weight: var(--fw-regular); color: var(--text-secondary); }
.ava__similar-item { display: block; width: 100%; padding: 6px 8px; border: none; border-radius: var(--radius-default); background: transparent; color: var(--text-primary);
  font: inherit; font-size: var(--text-body); text-align: left; cursor: pointer; overflow-wrap: anywhere; }
.ava__similar-item:hover { background: var(--bg-brand-light); }
.ava__reused { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); color: var(--text-secondary); }
.ava__reused .ti { font-size: 14px; color: var(--icon-neutral); }
.ava__journey { display: flex; align-items: center; gap: 12px; width: calc(100% - 32px); margin-left: 32px; padding: 12px; border: 1px solid transparent; border-radius: var(--radius-default);
  background: var(--ai-border-on-ai-light); color: var(--text-primary); font: inherit; text-align: left; cursor: pointer;   /* viền gradient AI (Stroke/AI) */ }
.ava__journey:hover { background: var(--ai-border-on-white); }
.ava__journey-icon { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 32px; height: 32px; border-radius: var(--radius-default); background: var(--bg-white); }
.ava__journey-icon .ti { font-size: 18px; color: var(--ai-begin-600); }   /* Icon/AI gradient qua .ti--ai */
.ava__journey-text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; font-size: var(--text-body); }
.ava__journey-text span { color: var(--text-secondary); }
.ava__chips { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding-left: 32px; }
.ava__chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);   /* bo 8 đồng bộ (không pill) — câu dài 2 dòng không méo */
  background: var(--bg-white); font-family: inherit; font-size: var(--text-body); color: var(--text-primary); text-align: left; cursor: pointer; }
.ava__chip:hover { border-color: transparent; background: var(--ai-border-on-ai-light); }
.ava__chip .ti { font-size: 14px; flex-shrink: 0; }
.ava__typing { display: inline-flex; gap: 4px; align-items: center; padding: 12px 14px; }
.ava__typing i { width: 6px; height: 6px; border-radius: 50%; background: var(--icon-neutral); animation: ava-dot 1.2s ease-in-out infinite; }
.ava__typing i:nth-child(2) { animation-delay: 0.15s; }
.ava__typing i:nth-child(3) { animation-delay: 0.3s; }
@keyframes ava-dot { 0%, 80%, 100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
.ava__error { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: var(--radius-default); background: var(--bg-danger-light);
  font-size: var(--text-body); color: var(--text-primary); }
.ava__error > .ti { font-size: 14px; color: var(--icon-danger); flex-shrink: 0; }
.ava__error-text { flex: 1; min-width: 0; }
.ava__error .btn { padding: 0; height: auto; }
.ava__compose { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border-top: 1px solid var(--stroke-divider); }
.ava__box { position: relative; display: flex; border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); background: var(--bg-white); }
.ava__box:focus-within { border-color: transparent; background: var(--ai-border-on-white); }
.ava__box { flex-wrap: wrap; }
.ava__box--drag { border-color: var(--ai-begin-600); border-style: dashed; background: var(--bg-ai-light); }   /* viền nét đứt không tô gradient được → AI Begin */
.ava__atts { display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 8px 8px 0; }
.ava__att-list { display: flex; flex-wrap: wrap; gap: 8px; }
.ava__att { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); overflow: hidden; background: var(--bg-neutral-light); }
.ava__att img { width: 100%; height: 100%; object-fit: cover; }
.ava__att-x { position: absolute; top: 2px; right: 2px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; padding: 0; border: none; border-radius: var(--radius-pill); background: rgba(16, 24, 40, 0.6); color: #fff; cursor: pointer; }
.ava__att-x .ti { font-size: 12px; }
.ava__att--loading .ti { font-size: 20px; color: var(--icon-neutral); }
.ava__spin { animation: ava-spin 0.8s linear infinite; }
@keyframes ava-spin { to { transform: rotate(360deg); } }
.ava__att-kind { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: var(--text-body); color: var(--text-secondary); }
.ava__chip--sm { padding: 2px 10px; }
.ava__chip--on, .ava__chip--on:hover { border-color: transparent; background: var(--ai-border-on-ai-light); color: var(--text-primary); font-weight: var(--fw-semibold); }
.ava__attach { position: absolute; right: calc(6px + var(--btn-height)); bottom: 6px; color: var(--icon-neutral); }
.ava__attach:hover:not(:disabled) { color: var(--text-primary); }
.ava__attach:disabled { opacity: 0.45; cursor: default; }
.ava__inline-ico { font-size: 14px; vertical-align: -2px; }
.ava__msg-kind { display: inline-flex; align-items: center; gap: 4px; margin-bottom: 4px; font-size: var(--text-body); color: var(--text-secondary); }
.ava__msg-kind .ti { font-size: 14px; }
.ava__msg-imgs { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; margin-bottom: 4px; }
.ava__msg-imgs img { width: 72px; height: 72px; object-fit: cover; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); }
.ava__input { flex: 1; min-height: calc(var(--input-height) * 2); max-height: 168px; padding: 8px calc(var(--btn-height) * 2 + 4px) 8px 12px; border: none; border-radius: var(--radius-default); background: transparent; resize: none;
  font-family: inherit; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); outline: none; }
.ava__send { position: absolute; right: 6px; bottom: 6px; color: var(--icon-neutral); }
.ava__send--on:hover { background: var(--bg-ai-light); }
.ava__send:disabled { opacity: 0.45; cursor: default; }
.ava__note { font-size: var(--text-body); line-height: 16px; color: var(--text-secondary); }
.ava-callout { position: fixed; z-index: 1060; width: 320px; max-width: calc(100vw - 16px); padding: 12px 14px; border-radius: var(--radius-lg, 12px);
  background: var(--bg-white); box-shadow: var(--shadow-popover); border: 1px solid transparent;
  background-image: linear-gradient(var(--bg-white), var(--bg-white)), linear-gradient(111deg, #1482ff 8.87%, #cf11ff 100%);
  background-origin: border-box; background-clip: padding-box, border-box; }
.ava-callout__arrow { position: absolute; top: -7px; width: 12px; height: 12px; background: var(--bg-white); border-top: 1px solid #5a6dff; border-left: 1px solid #5a6dff; transform: rotate(45deg); border-top-left-radius: 2px; }
.ava-callout__head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.ava-callout__logo { display: inline-flex; }
.ava-callout__logo :deep(svg) { width: 28px; height: 28px; }
.ava-callout__name { flex: 1; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ava-callout__name span { font-weight: var(--fw-regular); color: var(--text-secondary); }
.ava-callout__text--news { min-height: 0 !important; }
.ava-callout__new { display: inline-flex; align-items: center; height: 20px; padding: 0 6px; margin-right: 2px; border-radius: var(--radius-default); background: var(--bg-ai-light, #f3eaff); color: #7a3cff; font-size: var(--text-body); font-weight: var(--fw-semibold); vertical-align: 1px; }
.ava-callout__qs { display: flex; flex-direction: column; align-items: stretch; gap: 6px; margin-top: 10px; }
.ava-callout__qs .ava__chip { width: 100%; text-align: left; }
.ava-callout__text { min-height: calc(var(--text-body-lh) * 3); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.ava-callout__caret { display: inline-block; width: 2px; height: 1em; margin-left: 1px; vertical-align: -2px; background: #5a6dff; animation: ava-caret 0.8s steps(1) infinite; }
@keyframes ava-caret { 50% { opacity: 0; } }
.ava-callout__actions { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 10px; opacity: 0; transform: translateY(4px); transition: opacity 0.25s, transform 0.25s; pointer-events: none; }
.ava-callout__actions--on { opacity: 1; transform: none; pointer-events: auto; }
.ava-callout__actions .btn--link { padding: 0; height: auto; color: var(--text-secondary); }
.ava-callout-enter-active, .ava-callout-leave-active { transition: opacity 0.2s, transform 0.2s; }
.ava-callout-enter-from, .ava-callout-leave-to { opacity: 0; transform: translateY(-6px); }
.ava-slide-enter-active, .ava-slide-leave-active { transition: transform 0.2s ease; }
.ava-slide-enter-from, .ava-slide-leave-to { transform: translateX(100%); }
@media (prefers-reduced-motion: reduce) { .ava__typing i { animation: none; } }
</style>
