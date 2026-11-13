<template>
  <!-- Nút chat trên header: số tin chưa đọc · bấm mở khung chat bên phải -->
  <!-- Tin mới đến → icon rung + chấm đỏ nảy; còn tin chưa đọc mà chưa mở chat → rung nhắc mỗi 8 giây -->
  <button ref="btnEl" type="button" class="btn-icon-white chat-btn" :class="{ 'chat-btn--open btn-icon-white--active': chat.open, 'chat-btn--ring': ringing }"
    v-tip="totalUnread ? `Trò chuyện nội bộ — ${totalUnread} tin chưa đọc` : 'Trò chuyện nội bộ'" :aria-label="totalUnread ? `Trò chuyện nội bộ — ${totalUnread} tin chưa đọc` : 'Trò chuyện nội bộ'" @click="toggle">
    <TIcon name="message-circle" class="chat-btn__icon" />
    <span v-if="totalUnread" :key="totalUnread" class="header-badge chat-btn__badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
  </button>

  <!-- Thẻ xem trước tin mới: ngay dưới icon chat · bấm → mở đúng cuộc trò chuyện · tự ẩn sau vài giây, rê chuột vào thì giữ -->
  <Teleport to="body">
    <TransitionGroup v-if="!chat.open && chat.previews.length" tag="div" name="chat-pv" class="chat-pv" :style="pvStyle" role="status" aria-live="polite">
      <div v-for="pv in chat.previews" :key="pv.key" class="chat-pv__card" role="button" tabindex="0"
        @click="openPreview(pv)" @keydown.enter="openPreview(pv)" @mouseenter="holdPreview(pv.key)" @mouseleave="releasePreview(pv.key)">
        <UserAvatar class="chat-pv__avatar" :name="pv.name" :picture="avatarOf(userById(pv.from))" />
        <span class="chat-pv__body">
          <span class="chat-pv__head">
            <span class="chat-pv__name">{{ pv.ann ? '📢 Thông báo chung' : pv.name }}</span>
            <span class="chat-pv__time">{{ pv.count > 1 ? `${pv.count} tin mới` : 'vừa xong' }}</span>
          </span>
          <span class="chat-pv__text">{{ pv.ann ? `${pv.name}: ${pv.text}` : pv.text }}</span>
          <span class="chat-pv__reply"><TIcon name="message-circle" />Trả lời</span>
        </span>
        <button type="button" class="btn-icon btn-icon--sm chat-pv__close" aria-label="Ẩn" @click.stop="dismissPreview(pv.key)"><TIcon name="x" /></button>
      </div>
    </TransitionGroup>
  </Teleport>

  <Teleport to="body">
    <!-- Khung chat cao full màn hình, đẩy cả trang (kể cả header) sang trái — nằm ngoài .app-shell (Teleport) -->
    <Teleport to="body">
    <Transition name="chat-slide">
      <aside v-if="chat.open" class="chat side-panel" role="dialog" aria-label="Trò chuyện nội bộ" v-resizable-drawer="{ key: 'chat', min: 320 }" v-side-panel>
        <!-- ① Danh bạ -->
        <template v-if="!peer && !isAnn">
          <div class="chat__head">
            <span class="chat__title">Trò chuyện</span>
            <!-- Âm báo tin mới (bật / tắt, trình duyệt nhớ) -->
            <button class="btn-icon" type="button" v-tip="chat.sound ? 'Đang bật âm báo tin mới — bấm để tắt' : 'Đang tắt âm báo — bấm để bật'" :aria-label="chat.sound ? 'Đang bật âm báo tin mới — bấm để tắt' : 'Đang tắt âm báo — bấm để bật'" @click="toggleSound">
              <TIcon :name="chat.sound ? 'volume' : 'volume-off'" />
            </button>
            <button class="btn-icon" type="button" v-tip="'Đóng (Esc)'" aria-label="Đóng (Esc)" @click="close"><TIcon name="x" /></button>
          </div>
          <div class="chat__search"><AppSearchbox v-model="q" placeholder="Tìm người (gõ không dấu được)" /></div>
          <div class="chat__contacts">
            <!-- 📢 Thông báo chung — luôn ghim đầu danh bạ -->
            <button v-if="!q.trim()" type="button" class="chat__contact chat__contact--ann" @click="openPeer(ANN)">
              <span class="chat__avatar-wrap"><span class="chat__avatar chat__ann-icon"><TIcon name="speakerphone" /></span></span>
              <span class="chat__contact-text">
                <span class="chat__contact-name">Thông báo chung</span>
                <span class="chat__contact-sub">{{ chat.ann.last ? `${nameOf(chat.ann.last.from)}: ${chat.ann.last.text}` : 'Chưa có thông báo nào' }}</span>
              </span>
              <span v-if="chat.ann.unread" class="chat__unread">{{ chat.ann.unread }}</span>
            </button>
            <p v-if="!list.length" class="chat__empty">Không tìm thấy ai.</p>
            <button v-for="u in list" :key="u.id" type="button" class="chat__contact" @click="openPeer(u.id)">
              <span class="chat__avatar-wrap">
                <UserAvatar class="chat__avatar" :name="u.name" :picture="avatarOf(u)" />
                <span v-if="chat.states[u.id]" class="chat__dot" :class="`chat__dot--${chat.states[u.id]}`" />
              </span>
              <span class="chat__contact-text">
                <span class="chat__contact-name">{{ u.name }}</span>
                <span class="chat__contact-sub">{{ statusText(u.id) }}</span>
              </span>
              <span v-if="chat.unread[u.id]" class="chat__unread">{{ chat.unread[u.id] }}</span>
            </button>
          </div>
        </template>

        <!-- ② Cuộc trò chuyện 1-1 -->
        <template v-else>
          <div class="chat__head">
            <button class="btn-icon" type="button" v-tip="'Danh bạ'" aria-label="Danh bạ" @click="chat.peer = null"><TIcon name="arrow-left" /></button>
            <template v-if="isAnn">
              <span class="chat__avatar-wrap"><span class="chat__avatar chat__avatar--sm chat__ann-icon"><TIcon name="speakerphone" /></span></span>
              <span class="chat__peer">
                <span class="chat__peer-name">Thông báo chung</span>
                <span class="chat__peer-sub">{{ chat.ann.audiences.length ? 'Bạn gửi được cho: ' + chat.ann.audiences.map(a => a.label).join(', ') : 'Trả lời người gửi bằng “Nhắn riêng”' }}</span>
              </span>
            </template>
            <template v-else>
            <span class="chat__avatar-wrap">
              <UserAvatar class="chat__avatar chat__avatar--sm" :name="peer.name" :picture="avatarOf(peer)" />
              <span v-if="chat.states[peer.id]" class="chat__dot" :class="`chat__dot--${chat.states[peer.id]}`" />
            </span>
            <span class="chat__peer">
              <span class="chat__peer-name">{{ peer.name }}</span>
              <span class="chat__peer-sub">{{ statusText(peer.id) }}</span>
            </span>
            </template>
            <button class="btn-icon" type="button" v-tip="'Đóng (Esc)'" aria-label="Đóng (Esc)" @click="close"><TIcon name="x" /></button>
          </div>
          <div ref="listEl" class="chat__msgs">
            <button v-if="chat.more[chat.peer]" type="button" class="btn btn--link btn--sm chat__older" @click="older">Xem tin cũ hơn</button>
            <p v-if="chat.loading" class="chat__empty">Đang tải…</p>
            <p v-else-if="!msgs.length" class="chat__empty">{{ isAnn ? 'Chưa có thông báo chung nào.' : `Chưa có tin nhắn. Gửi lời chào ${peer.name} nhé!` }}</p>
            <template v-for="(m, i) in msgs" :key="m.id">
              <p v-if="dayOf(m) !== dayOf(msgs[i - 1])" class="chat__day">{{ dayLabel(m.at) }}</p>
              <div class="chat__msg" :class="[m.from === meId ? 'chat__msg--me' : 'chat__msg--peer', { 'chat__msg--picking': picker === m.id, 'chat__msg--reacted': reactionsOf(m).length }]">
                <!-- Bong bóng + nút thả cảm xúc (hiện khi hover) → bảng 6 emoji nhanh -->
                <span v-if="isAnn" class="chat__ann-from">
                  <UserAvatar class="chat__ann-av" :name="nameOf(m.from)" :picture="avatarOf(userById(m.from))" />{{ nameOf(m.from) }}
                  <span class="chat__ann-to">→ {{ audienceLabel(m.to) }}</span>
                </span>
                <div class="chat__row">
                  <div class="chat__bubble-wrap">
                    <div v-if="m.recalled" class="chat__bubble chat__bubble--recalled"><TIcon name="arrow-back-up" />Tin nhắn đã được thu hồi</div>
                    <div v-else class="chat__bubble">{{ m.text }}</div>
                    <!-- Cảm xúc đã thả: 1 bong bóng nhỏ đè lên góc đuôi tin nhắn · gộp theo emoji · bấm để bỏ / thả cùng -->
                    <div v-if="reactionsOf(m).length" class="chat__reactions">
                      <button v-for="r in reactionsOf(m)" :key="r.emoji" type="button" class="chat__reaction" :class="{ 'chat__reaction--mine': r.mine }" v-tip="r.names" @click="react(m, r.emoji)">{{ r.emoji }}</button>
                      <span v-if="reactionCount(m) > 1" class="chat__reaction-count">{{ reactionCount(m) }}</span>
                    </div>
                  </div>
                  <div v-if="!m.recalled" class="chat__react-wrap">
                    <!-- Tin của mình: thu hồi (xác nhận trước) -->
                    <button v-if="m.from === meId" type="button" class="btn-icon btn-icon--sm chat__react-btn" aria-label="Thu hồi" v-tip="'Thu hồi tin nhắn'" @click.stop="recallOf = m"><TIcon name="arrow-back-up" /></button>
                    <button type="button" class="btn-icon btn-icon--sm chat__react-btn" v-tip="'Thả cảm xúc'" aria-label="Thả cảm xúc" @click.stop="picker = picker === m.id ? null : m.id"><TIcon name="mood-smile" /></button>
                    <div v-if="picker === m.id" class="chat__picker" @click.stop>
                      <button v-for="e in REACTIONS" :key="e" type="button" class="chat__emoji" :class="{ 'chat__emoji--on': m.reactions?.[meId] === e }" @click="react(m, e)">{{ e }}</button>
                    </div>
                  </div>
                </div>
                <span class="chat__meta">{{ timeOf(m.at) }}<template v-if="!isAnn && m.from === meId && m.readAt && isLastMine(i)"> · Đã xem</template>
                  <template v-if="isAnn && m.from !== meId"> · <a href="#" class="chat__dm" @click.prevent="openPeer(m.from)">Nhắn riêng</a></template>
                  <!-- Thông báo chung: ai đã xem (người gửi / Quản trị) — gọn trên dòng giờ: 👁 N/M + mặt người xem gần nhất · bấm xem đủ danh sách -->
                  <button v-if="isAnn && m.seen" type="button" class="chat__seen" :aria-label="`Đã xem ${m.seen.n}/${m.seen.total}`"
                    v-tip="m.seen.n ? `Đã xem ${m.seen.n}/${m.seen.total} người nhận — bấm xem danh sách` : `Chưa ai xem · ${m.seen.total} người nhận`" @click="openSeen(m)">
                    <TIcon name="eye" />{{ m.seen.n }}/{{ m.seen.total }}
                    <span v-if="m.seen.faces.length" class="chat__seen-faces">
                      <UserAvatar v-for="f in m.seen.faces.slice(0, 3)" :key="f.id" class="chat__seen-av" :name="f.name" :picture="avatarOf(f)" />
                    </span>
                  </button></span>
              </div>
            </template>
          </div>
          <p v-if="isAnn && !chat.ann.audiences.length" class="chat__ann-note"><TIcon name="info-circle" />Chỉ Quản trị gửi được thông báo chung. Muốn trả lời, bấm “Nhắn riêng” dưới thông báo.</p>
          <form v-else class="chat__compose" @submit.prevent="send">
            <template v-if="isAnn">
              <!-- Cách gửi: 1 tin chung trong kênh · hoặc gửi 1 lần → mỗi người 1 tin riêng (như chat 1-1) -->
              <div class="chat__ann-mode" role="tablist">
                <button v-for="o in SEND_MODES" :key="o.id" type="button" role="tab" class="chat__ann-mode-btn" :class="{ 'chat__ann-mode-btn--on': sendMode === o.id }"
                  :aria-selected="sendMode === o.id" v-tip="o.tip" @click="sendMode = o.id">{{ o.label }}</button>
              </div>
              <div class="chat__ann-aud"><span>Gửi cho</span>
                <AppCombobox v-model="audience" :options="sendMode === 'dm' ? dmTargets : chat.ann.audiences" multiple :clearable="false" placeholder="Chọn nhóm" size="sm" class="chat__ann-select" />
              </div>
              <AppCombobox v-if="sendMode === 'dm' && audience.includes('__pick__')" v-model="pickedIds" :options="pickOptions" multiple tag-avatar recent-key="pick-chat-dm"
                placeholder="Chọn người nhận" size="sm" class="chat__ann-pick" />
            </template>
            <!-- Bộ gõ tiếng Việt (Telex / VNI): chữ đang soạn (gạch chân) chưa vào v-model → gửi đọc thẳng nội dung ô; Enter lúc đang soạn chỉ để chốt chữ -->
            <!-- Ô nhập + nút gửi nhỏ ở góc phải dưới, nằm TRONG khung viền -->
            <div class="chat__box">
              <textarea ref="inputEl" v-model="text" class="chat__input" rows="2" maxlength="2000" :placeholder="isAnn ? 'Nhập thông báo gửi cho mọi người… (Enter để gửi)' : 'Nhập tin nhắn… (Enter để gửi, Shift + Enter xuống dòng)'"
                @keydown.enter.exact="onEnter" @input="onInput" @compositionend="onInput" />
              <button class="btn-icon btn-icon--sm chat__send" :class="{ 'chat__send--on': text.trim() && !sending }" type="submit"
                :disabled="!text.trim() || sending" v-tip="'Gửi (Enter)'" aria-label="Gửi (Enter)"><TIcon name="send" /></button>
            </div>
          </form>
        </template>
      </aside>
    </Transition>
    </Teleport>
  </Teleport>
  <!-- Danh sách ai đã xem / chưa xem 1 thông báo chung -->
  <DialogShell v-if="seenOf" title="Ai đã xem thông báo" :width="420" @close="seenOf = null">
    <SubNavTabs v-model="seenTab" :items="[{ id: 'seen', label: 'Đã xem', n: seenList.seen.length }, { id: 'unseen', label: 'Chưa xem', n: seenList.unseen.length }]">
      <template #tab="{ item }">{{ item.label }} <span class="chat__seen-n">{{ item.n }}</span></template>
    </SubNavTabs>
    <p v-if="seenLoading" class="chat__seen-empty">Đang tải…</p>
    <p v-else-if="!seenList[seenTab].length" class="chat__seen-empty">{{ seenTab === 'seen' ? 'Chưa ai xem.' : 'Mọi người đã xem.' }}</p>
    <div v-else class="chat__seen-list">
      <div v-for="u in seenList[seenTab]" :key="u.id" class="chat__seen-row">
        <UserAvatar class="chat__seen-row-av" :name="u.name" :picture="avatarOf(u)" />
        <span class="chat__seen-row-name">{{ u.name }}<span>{{ u.code }}</span></span>
      </div>
    </div>
  </DialogShell>
  <ConfirmDialog v-if="recallOf" title="Thu hồi tin nhắn" confirm-label="Thu hồi"
    :message="recallOf.ann ? 'Thông báo sẽ bị gỡ với mọi người nhận — họ chỉ thấy “Tin nhắn đã được thu hồi”.' : 'Tin nhắn sẽ bị gỡ ở cả hai phía — người nhận chỉ thấy “Tin nhắn đã được thu hồi”.'"
    @cancel="recallOf = null" @confirm="doRecall" />
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import SubNavTabs from '@mds/components/SubNavTabs.vue'
import DialogShell from './DialogShell.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { api } from '../store/api.js'
import { avatarOf } from '../store/avatar.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { vResizableDrawer } from '@mds/utils/resizableDrawer.js'
import { vSidePanel } from '@mds/utils/sidePanel.js'
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import { matchText } from '@mds/utils/search.js'
import { toast } from '@mds/utils/toast.js'
import UserAvatar from './UserAvatar.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { currentUser, userById } from '../store/db.js'
import { ago } from '../store/presence.js'
import { dismissPreview, holdPreview, releasePreview } from '../store/chat.js'
import { chat, totalUnread, openPeer, loadOlder, sendMessage, sendAnnouncement, sendBroadcast, loadContacts, toggleSound, reactMessage, REACTIONS, ANN, audienceLabel, refreshAnnSeen, recallMessage } from '../store/chat.js'

/* Chat nội bộ 1-1: danh bạ (chưa đọc → đang online → nhắn gần đây) · bong bóng tin nhắn · Enter gửi */
const meId = computed(() => currentUser.value?.id)
const q = ref(''), text = ref(''), sending = ref(false), listEl = ref(null), inputEl = ref(null)
const RANK = { active: 0, idle: 1 }
const list = computed(() => chat.contacts
  .filter(u => !q.value.trim() || matchText([u.name, u.code], q.value))
  .sort((a, b) => (chat.unread[b.id] ? 1 : 0) - (chat.unread[a.id] ? 1 : 0)
    || (RANK[chat.states[a.id]] ?? 2) - (RANK[chat.states[b.id]] ?? 2)
    || String(chat.lastAt[b.id] ?? '').localeCompare(String(chat.lastAt[a.id] ?? ''))
    || a.name.localeCompare(b.name, 'vi')))
const peer = computed(() => chat.contacts.find(u => u.id === chat.peer) ?? null)
/* Kênh 📢 Thông báo chung */
const isAnn = computed(() => chat.peer === ANN)
/* Ai đã xem thông báo chung: mở danh sách đầy đủ · làm mới số người xem mỗi 30 giây khi đang mở kênh */
/* Thu hồi tin nhắn của mình */
const recallOf = ref(null)
async function doRecall() {
  const m = recallOf.value; recallOf.value = null
  try { await recallMessage(m.id); toast.success('Đã thu hồi tin nhắn') } catch (e) { toast.error(e.message || 'Không thu hồi được') }
}
const seenOf = ref(null), seenTab = ref('seen'), seenLoading = ref(false), seenList = ref({ seen: [], unseen: [] })
async function openSeen(m) {
  seenOf.value = m; seenTab.value = 'seen'; seenLoading.value = true; seenList.value = { seen: [], unseen: [] }
  try { seenList.value = await api.get(`/api/chat/announcements/${m.id}/seen`) } catch (e) { toast.error(e.message || 'Không tải được danh sách') }
  finally { seenLoading.value = false }
}
let seenTimer = null
watch(() => chat.open && isAnn.value, on => { clearInterval(seenTimer); if (on) seenTimer = setInterval(() => refreshAnnSeen().catch(() => {}), 30000) }, { immediate: true })
onBeforeUnmount(() => clearInterval(seenTimer))
/* Gửi cho: chọn nhiều nhóm (VD BA + PO) · “Tất cả” / “Chọn từng người…” dùng riêng — chọn cái này thì bỏ các nhóm khác và ngược lại */
const audience = ref([])
const EXCLUSIVE = ['__all__', '__pick__']
watch(() => chat.ann.audiences, a => { const ok = audience.value.filter(v => v === '__pick__' || a?.some(x => x.value === v)); audience.value = ok.length ? ok : a?.[0] ? [a[0].value] : [] }, { immediate: true })
watch(audience, (v, o = []) => {
  const added = v.find(x => !o.includes(x))
  if (added && EXCLUSIVE.includes(added) && v.length > 1) audience.value = [added]
  else if (added && v.some(x => EXCLUSIVE.includes(x))) audience.value = v.filter(x => !EXCLUSIVE.includes(x))
})
/* Cách gửi trong kênh: 'ann' = thông báo chung (1 tin cùng xem) · 'dm' = gửi riêng từng người (mỗi người 1 tin 1-1) */
const SEND_MODES = [
  { id: 'ann', label: 'Thông báo chung', tip: '1 tin trong kênh này — mọi người cùng xem, trả lời bằng “Nhắn riêng”' },
  { id: 'dm',  label: 'Gửi riêng từng người', tip: 'Gửi 1 lần — mỗi người nhận 1 tin trong cuộc trò chuyện riêng với bạn (như chat bình thường), trả lời ngay trong đó, có “Đã xem”' },
]
const sendMode = ref('ann'), pickedIds = ref([])
const dmTargets = computed(() => [...chat.ann.audiences, { value: '__pick__', label: 'Chọn từng người…' }])
const myDept = computed(() => (chat.ann.audiences.length === 1 ? chat.ann.audiences[0].value.replace('__dept:', '') : ''))
const pickOptions = computed(() => chat.contacts.filter(u => !myDept.value || u.role === myDept.value)
  .map(u => ({ value: u.id, label: u.name, description: u.code || '', avatar: avatarOf(u) })))
watch(sendMode, m => { if (m === 'ann' && audience.value.includes('__pick__')) audience.value = chat.ann.audiences[0] ? [chat.ann.audiences[0].value] : [] })
const msgs = computed(() => chat.messages[chat.peer] ?? [])
/* Đang hoạt động (mở app + có thao tác trong N phút) · Không hoạt động (mở app nhưng vắng) · Offline — kèm lần hoạt động gần nhất */
const statusText = id => {
  const st = chat.states[id], seen = chat.seen?.[id]
  if (st === 'active') return 'Đang hoạt động'
  if (st === 'idle') return seen ? `Không hoạt động · ${ago(seen)}` : 'Không hoạt động'
  return seen && Date.now() - seen < 30 * 864e5 ? `Offline · hoạt động ${ago(seen)}` : 'Offline'
}

/* Rung báo tin mới */
/* Thẻ xem trước: canh dưới icon chat, mép phải thẳng mép phải nút */
const btnEl = ref(null), pvPos = ref({ top: 56, right: 16 })
function placePv() { const r = btnEl.value?.getBoundingClientRect(); if (r) pvPos.value = { top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) } }
const pvStyle = computed(() => ({ top: pvPos.value.top + 'px', right: pvPos.value.right + 'px' }))
watch(() => chat.previews.length, n => { if (n) placePv() })
window.addEventListener('resize', placePv)
onBeforeUnmount(() => window.removeEventListener('resize', placePv))
function openPreview(pv) { dismissPreview(pv.key); openPeer(pv.peer) }
const ringing = ref(false)
let ringTimer = null, remindTimer = null
function ring() { ringing.value = false; clearTimeout(ringTimer); requestAnimationFrame(() => { ringing.value = true; ringTimer = setTimeout(() => (ringing.value = false), 1100) }) }
watch(totalUnread, (n, o) => { if (n > (o ?? 0)) ring() })
remindTimer = setInterval(() => { if (totalUnread.value && !chat.open && document.visibilityState === 'visible') ring() }, 8000)
onBeforeUnmount(() => { clearTimeout(ringTimer); clearInterval(remindTimer) })

function toggle() { chat.open = !chat.open; if (chat.open) loadContacts() }
function close() { chat.open = false }
const scrollEnd = () => nextTick(() => requestAnimationFrame(() => { if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight }))
// Khung tin nhắn vừa hiện (mở lại chat / chọn người) → luôn cuộn xuống tin cuối
watch(listEl, el => { if (el) scrollEnd() })
watch(() => chat.open, v => { if (v) scrollEnd() })
watch(() => [chat.peer, msgs.value.length], () => { scrollEnd(); nextTick(() => inputEl.value?.focus()) })
async function older() { const el = listEl.value, h = el?.scrollHeight ?? 0; await loadOlder(chat.peer); nextTick(() => { if (el) el.scrollTop = el.scrollHeight - h }) }
function autosize(el = inputEl.value) { if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 168) + 'px' }
// Nội dung thật trong ô (gồm cả chữ bộ gõ đang soạn) — v-model chỉ cập nhật khi bộ gõ chốt chữ
const draft = () => inputEl.value?.value ?? text.value
function onInput(e) { text.value = e.target.value; autosize(e.target) }
function onEnter(e) {
  if (e.isComposing || e.keyCode === 229) return      // đang soạn chữ có dấu → Enter để bộ gõ chốt chữ, chưa gửi
  e.preventDefault(); send()
}
async function send() {
  const body = draft()
  if (!body.trim() || sending.value) return
  sending.value = true
  try {
    if (isAnn.value && sendMode.value === 'dm') {
      const target = audience.value.includes('__pick__') ? { userIds: pickedIds.value } : { audience: audience.value }
      if (target.userIds && !target.userIds.length) { toast.warning('Chọn ít nhất 1 người nhận'); return }
      const n = await sendBroadcast(body, target)
      toast.success(`Đã gửi riêng cho ${n} người — xem trong từng cuộc trò chuyện`)
    } else if (isAnn.value) {
      if (!audience.value.length) { toast.warning('Chọn nhóm nhận thông báo'); return }
      await sendAnnouncement(body, audience.value)
    } else await sendMessage(body)
    text.value = ''; if (inputEl.value) { inputEl.value.value = ''; autosize() } }
  catch (e) { toast.error(e.message || 'Không gửi được tin nhắn') }
  finally { sending.value = false }
}
/* Thả cảm xúc */
const picker = ref(null)
const closePicker = () => (picker.value = null)
watch(picker, v => (v ? document.addEventListener('click', closePicker) : document.removeEventListener('click', closePicker)))
onBeforeUnmount(() => document.removeEventListener('click', closePicker))
async function react(m, emoji) {
  picker.value = null
  try { await reactMessage(m.id, emoji) } catch (e) { toast.error(e.message || 'Không thả được cảm xúc') }
}
const nameOf = id => (id === meId.value ? 'Bạn' : chat.contacts.find(u => u.id === id)?.name ?? 'Ai đó')
function reactionsOf(m) {
  const groups = {}
  for (const [uid, e] of Object.entries(m.reactions ?? {})) (groups[e] ??= []).push(uid)
  return REACTIONS.filter(e => groups[e]).map(e => ({ emoji: e, count: groups[e].length, mine: groups[e].includes(meId.value), names: groups[e].map(nameOf).join(', ') }))
}
const reactionCount = m => Object.keys(m.reactions ?? {}).length
const isLastMine = i => !msgs.value.slice(i + 1).some(m => m.from === meId.value)
const pad = n => String(n).padStart(2, '0')
const timeOf = iso => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }
const dayOf = m => (m ? new Date(m.at).toDateString() : '')
function dayLabel(iso) {
  const d = new Date(iso), today = new Date(), y = new Date(Date.now() - 86400e3)
  if (d.toDateString() === today.toDateString()) return 'Hôm nay'
  if (d.toDateString() === y.toDateString()) return 'Hôm qua'
  return d.toLocaleDateString('vi-VN')
}
useEscClose(() => { close() }, () => !!chat.open)   // ESC đóng panel (lớp trên cùng)
</script>

<style scoped>
.chat-btn { position: relative; }
/* Rung: icon lắc qua lại · chấm đỏ nảy lên (mỗi lần số tin đổi chấm được vẽ lại → nảy) */
.chat-btn--ring .chat-btn__icon { animation: chat-shake 0.9s ease-in-out; transform-origin: 50% 20%; }
/* Thẻ xem trước tin mới — chuẩn popover mds-ui (nền trắng, bo --radius-dialog, bóng --shadow-popover), nằm trên drawer / panel (--z-header-pop) */
.chat-pv { position: fixed; z-index: var(--z-header-pop); display: flex; flex-direction: column; gap: 8px; width: 340px; max-width: calc(100vw - 16px); }
.chat-pv__card { position: relative; display: flex; align-items: flex-start; gap: 12px; padding: 12px 40px 12px 12px; border-radius: var(--radius-dialog);
  background: var(--bg-white); box-shadow: var(--shadow-popover); border-left: 3px solid var(--bg-brand); cursor: pointer; text-align: left; }
.chat-pv__card:hover { background: color-mix(in srgb, var(--bg-brand) 4%, var(--bg-white)); }
.chat-pv__card:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 2px; }
.chat-pv__avatar { width: 36px; height: 36px; flex-shrink: 0; }
.chat-pv__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.chat-pv__head { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.chat-pv__name { font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-pv__time { flex-shrink: 0; font-size: var(--text-body); color: var(--text-brand); font-weight: var(--fw-medium); }
.chat-pv__text { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.chat-pv__reply { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-link); }
.chat-pv__reply .ti { font-size: 14px; }
.chat-pv__close { position: absolute; top: 8px; right: 8px; }
.chat-pv-enter-active, .chat-pv-leave-active { transition: opacity 0.2s, transform 0.2s; }
.chat-pv-enter-from { opacity: 0; transform: translateY(-8px); }
.chat-pv-leave-to { opacity: 0; transform: translateX(16px); }
.chat-pv-move { transition: transform 0.2s; }
@media (prefers-reduced-motion: reduce) { .chat-pv-enter-active, .chat-pv-leave-active, .chat-pv-move { transition: none; } }
.chat-btn__badge { animation: chat-pop 0.35s ease-out; }
.chat-btn--ring .chat-btn__badge { animation: chat-pop 0.35s ease-out, chat-pulse 1.1s ease-out; }
@keyframes chat-shake { 0%, 100% { transform: rotate(0); } 15% { transform: rotate(-16deg); } 30% { transform: rotate(14deg); } 45% { transform: rotate(-10deg); } 60% { transform: rotate(7deg); } 75% { transform: rotate(-3deg); } }
@keyframes chat-pop { 0% { transform: scale(0.4); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
@keyframes chat-pulse { 0% { box-shadow: 0 0 0 0 rgba(240, 68, 56, 0.55); } 100% { box-shadow: 0 0 0 8px rgba(240, 68, 56, 0); } }
@media (prefers-reduced-motion: reduce) { .chat-btn--ring .chat-btn__icon, .chat-btn__badge, .chat-btn--ring .chat-btn__badge { animation: none; } }
/* Đang mở: dùng trạng thái active chuẩn của mds-ui (.btn-icon-white--active = như hover) */
.chat { position: fixed; top: 0; right: 0; bottom: 0; z-index: 1050; width: 380px; max-width: 100vw; display: flex; flex-direction: column;
  background: var(--bg-white); box-shadow: var(--shadow-left-8); }   /* như Help panel: bóng trái, không viền */
.chat__ann-icon { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--bg-brand-light); color: var(--icon-brand); font-size: 18px; }
.chat__contact--ann { border-bottom: 1px solid var(--stroke-divider); }
.chat__ann-from { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.chat__ann-av { width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; }
.chat__bubble--recalled { display: inline-flex; align-items: center; gap: 6px; background: transparent !important; color: var(--text-secondary) !important; font-style: italic; border: 1px dashed var(--stroke-neutral); box-shadow: none !important; }
.chat__bubble--recalled .ti { font-size: 14px; }
.chat__seen { display: inline-flex; align-items: center; gap: 3px; margin-left: 6px; padding: 0 4px; border: none; border-radius: var(--radius-pill); background: transparent; font: inherit; color: inherit; cursor: pointer; vertical-align: middle; }
.chat__seen:hover { background: var(--bg-neutral-light); color: var(--icon-neutral); }
.chat__seen .ti { font-size: 12px; }
.chat__seen-faces { display: inline-flex; align-items: center; margin-left: 2px; }
.chat__seen-av { width: 14px; height: 14px; margin-left: -4px; border: 1px solid var(--bg-white); border-radius: 50%; }
.chat__seen-av:first-child { margin-left: 0; }
.chat__seen-n { margin-left: 4px; color: var(--text-secondary); font-weight: var(--fw-regular, 400); }
.chat__seen-empty { margin: 16px 0; text-align: center; color: var(--text-secondary); }
.chat__seen-list { display: flex; flex-direction: column; max-height: 360px; overflow-y: auto; margin-top: 8px; }
.chat__seen-row { display: flex; align-items: center; gap: 10px; padding: 6px 2px; }
.chat__seen-row-av { width: 28px; height: 28px; }
.chat__seen-row-name { display: flex; flex-direction: column; font-size: var(--text-body); color: var(--text-primary); }
.chat__seen-row-name span { font-size: var(--text-body); color: var(--text-secondary); }
.chat__ann-to { font-weight: var(--fw-regular, 400); color: var(--text-secondary); }
.chat__dm { color: var(--text-brand); }
.chat__ann-note { /* box thấp 1–2 dòng → icon căn giữa dọc (skill: Box / card thấp) */ display: flex; align-items: center; gap: 8px; margin: 0; padding: 12px 16px; border-top: 1px solid var(--stroke-divider); font-size: var(--text-body); color: var(--text-secondary); }
.chat__ann-note .ti { flex-shrink: 0; }
.chat__ann-aud { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.chat__ann-select { flex: 1; min-width: 0; }
.chat__ann-pick { margin-bottom: 8px; }
.chat__ann-mode { display: inline-flex; gap: 2px; padding: 2px; margin-bottom: 8px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.chat__ann-mode-btn { font-weight: var(--fw-semibold); height: calc(var(--btn-height) - 8px); padding: 0 10px; border: none; border-radius: calc(var(--radius-default) - 2px); background: transparent; font-family: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; white-space: nowrap; }
.chat__ann-mode-btn:hover:not(.chat__ann-mode-btn--on) { color: var(--text-primary); background: var(--bg-brand-light); }
.chat__ann-mode-btn--on { background: var(--bg-white); color: var(--text-brand); box-shadow: var(--shadow-sm); }
.chat__head { display: flex; align-items: center; gap: 10px; padding: 12px 12px 12px 16px; border-bottom: 1px solid var(--stroke-divider); }
.chat__title { flex: 1; font-size: var(--text-h3); font-weight: var(--fw-semibold); color: var(--text-primary); }
.chat__search { padding: 12px 16px 8px; }
.chat__contacts { flex: 1; overflow-y: auto; padding: 4px 0 8px; }
.chat__contact { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 16px; border: none; background: none; font-family: inherit; text-align: left; cursor: pointer; }
.chat__contact:hover { background: var(--bg-brand-light); }
.chat__avatar-wrap { position: relative; flex-shrink: 0; }
.chat__avatar { width: 36px; height: 36px; border-radius: var(--radius-pill); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: var(--fw-semibold); }
.chat__avatar--sm { width: 32px; height: 32px; font-size: 12px; }
.chat__dot { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--bg-white); }
.chat__dot--active { background: var(--bg-success); }
.chat__dot--idle { background: var(--bg-warning); }
.chat__contact-text, .chat__peer { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.chat__contact-name, .chat__peer-name { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat__contact-sub, .chat__peer-sub { font-size: var(--text-body); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat__unread { min-width: 20px; padding: 0 6px; border-radius: var(--radius-pill); background: var(--bg-danger, #f04438); color: #fff; font-size: var(--text-body); font-weight: var(--fw-semibold); line-height: 20px; text-align: center; }
.chat__empty { padding: 16px; font-size: var(--text-body); color: var(--text-secondary); text-align: center; }
.chat__msgs { flex: 1; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: 6px; padding: 12px 16px; background: var(--bg-page); }
.chat__older { align-self: center; }
.chat__day { align-self: center; margin: 6px 0; padding: 2px 10px; border-radius: var(--radius-pill); background: var(--bg-white); font-size: var(--text-body); color: var(--text-secondary); }
.chat__msg { display: flex; flex-direction: column; max-width: 80%; gap: 2px; }
.chat__msg--me { align-self: flex-end; align-items: flex-end; }
.chat__msg--peer { align-self: flex-start; align-items: flex-start; }
.chat__bubble { padding: 8px 12px; border-radius: 14px; font-size: var(--text-body); line-height: var(--text-body-lh); white-space: pre-wrap; word-break: break-word; }
.chat__msg--me .chat__bubble { background: var(--bg-brand); color: #fff; border-bottom-right-radius: 4px; }
.chat__msg--peer .chat__bubble { background: var(--bg-white); color: var(--text-primary); border-bottom-left-radius: 4px; box-shadow: var(--shadow-card); }
.chat__row { position: relative; display: flex; align-items: center; gap: 4px; max-width: 100%; }
.chat__msg--me .chat__row { flex-direction: row-reverse; }
.chat__react-wrap { flex-shrink: 0; }   /* không làm mốc: bảng emoji neo theo cả hàng (cạnh bong bóng phía trong khung) → không tràn ngang */
.chat__react-btn { color: var(--icon-neutral); opacity: 0; transition: opacity 0.15s; }
.chat__msg:hover .chat__react-btn, .chat__msg--picking .chat__react-btn, .chat__react-btn:focus-visible { opacity: 1; }
.chat__picker { position: absolute; bottom: calc(100% + 4px); z-index: 2; max-width: calc(100vw - 32px); display: flex; gap: 2px; padding: 4px; border-radius: var(--radius-pill); background: var(--bg-white); box-shadow: var(--shadow-popover); border: 1px solid var(--stroke-neutral-light); }
.chat__msg--me .chat__picker { right: 0; }
.chat__msg--peer .chat__picker { left: 0; }
.chat__emoji { width: calc(var(--btn-height) - 4px); height: calc(var(--btn-height) - 4px); padding: 0; border: none; border-radius: 50%; background: none; font-size: 18px; line-height: 1; cursor: pointer; transition: transform 0.12s; }
.chat__emoji:hover { transform: scale(1.25); background: var(--bg-brand-light); }
.chat__emoji--on { background: var(--bg-brand-light); }
.chat__bubble-wrap { position: relative; min-width: 0; }
.chat__msg--reacted .chat__bubble-wrap { margin-bottom: 14px; }   /* chừa chỗ cho bong bóng cảm xúc đè xuống dưới */
/* Bong bóng cảm xúc: đè lên góc đuôi (tin của tôi: phải dưới · tin người kia: trái dưới), viền màu nền khung chat để tách khỏi tin */
.chat__reactions { position: absolute; bottom: -16px; display: inline-flex; align-items: center; gap: 1px; padding: 1px 4px; border-radius: var(--radius-pill);
  background: var(--bg-white); box-shadow: 0 0 0 2px var(--bg-page), var(--shadow-sm); white-space: nowrap; }
.chat__msg--me .chat__reactions { right: 6px; }
.chat__msg--peer .chat__reactions { left: 6px; }
.chat__reaction { padding: 0 1px; border: none; border-radius: 50%; background: none; font-family: inherit; font-size: 14px; line-height: 20px; cursor: pointer; transition: transform 0.12s; }
.chat__reaction:hover { transform: scale(1.2); }
.chat__reaction-count { padding: 0 2px; font-size: 11px; font-weight: var(--fw-semibold); color: var(--text-secondary); }
.chat__meta { font-size: var(--text-body); color: var(--text-secondary); padding: 0 4px; }
.chat__compose { padding: 10px 12px; border-top: 1px solid var(--stroke-divider); }
/* Khung viền bọc ô nhập + nút gửi (nút nằm trong khung, góc phải dưới) */
.chat__box { position: relative; display: flex; border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); background: var(--bg-white); }
.chat__box:focus-within { border-color: var(--stroke-brand); }
.chat__input { flex: 1; min-height: calc(var(--input-height) * 2); max-height: 168px; padding: 8px 40px 8px 12px; border: none; border-radius: var(--radius-default); background: transparent; resize: none;
  font-family: inherit; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); outline: none; }
.chat__send { position: absolute; right: 6px; bottom: 6px; color: var(--icon-neutral); }
.chat__send--on { color: var(--text-brand); }
.chat__send--on:hover { background: var(--bg-brand-light); }
.chat__send:disabled { opacity: 0.45; cursor: default; }
.chat-slide-enter-active, .chat-slide-leave-active { transition: transform 0.2s ease; }
.chat-slide-enter-from, .chat-slide-leave-to { transform: translateX(100%); }
</style>
