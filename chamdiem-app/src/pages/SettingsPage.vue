<template>
  <AppShell>
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Cài đặt hệ thống</h1>
      </div>
    </div>

    <div class="content-wrapper">
      <div v-if="!admin" class="card"><p class="empty-state">Chỉ Quản trị mới truy cập được trang này.</p></div>

      <template v-else>
      <!-- Danh mục Khối dự án DẠNG CÂY (cha › con, nhiều cấp) — chọn khi thêm / sửa dự án, lọc + gom nhóm ở danh sách dự án -->
      <section class="card pdp-set">
        <div class="pdp-set__head">
          <div class="pdp-set__title">
            <span class="pdp-set__icon"><TIcon name="building" /></span>
            <div>
              <h2 class="pdp-set__name">Danh mục Khối dự án</h2>
              <p class="pdp-set__sub">Dạng cây cha › con nhiều cấp (VD Khối sản phẩm Doanh nghiệp › AMIS). Khi thêm dự án chọn đúng mục trong cây; danh sách dự án lọc theo mục cha sẽ gồm cả các mục con.</p>
            </div>
          </div>
          <AppTag :label="`${divs.length} mục`" color="neutral" />
        </div>
        <div class="pdp-div">
          <!-- Kéo thả (tay nắm ⠿): thả nửa trên / dưới → trước / sau (cùng cấp) · thả giữa → thành mục con. Kéo cả nhánh con theo -->
          <div v-for="d in divTree" :key="d.key" class="pdp-div__row"
            :class="{ 'pdp-div__row--dragging': drag.key === d.key, [`pdp-div__row--drop-${drag.zone}`]: drag.over === d.key && drag.key !== d.key }"
            :style="{ paddingLeft: d.depth * 28 + 'px' }"
            @dragover.prevent="onDragOver($event, d)" @dragleave="onDragLeave(d)" @drop.prevent="onDrop(d)">
            <span class="pdp-div__grip" draggable="true" v-tip="'Kéo để sắp xếp / đổi cấp'" @dragstart="onDragStart($event, d)" @dragend="onDragEnd"><TIcon name="grip-vertical" /></span>
            <TIcon :name="d.depth ? 'corner-down-right' : 'building'" class="pdp-div__ic" />
            <AppTextbox v-model="d.name" :placeholder="d.depth ? 'Tên mục con' : 'Tên khối'" class="pdp-div__name" :state="divErrors[d.key] ? 'error' : 'default'" />
            <span class="pdp-div__count">{{ usedCount(d) ? `${usedCount(d)} dự án` : 'Chưa có dự án' }}</span>
            <button class="btn-icon btn-icon--sm" type="button" v-tip="'Thêm cấp con'" aria-label="Thêm cấp con" @click="addDivision(d)"><TIcon name="plus" /></button>
            <button v-if="!usedCount(d)" class="btn-icon btn-icon--sm btn-icon--danger" type="button" v-tip="hasChildren(d) ? 'Xóa mục này và các mục con' : 'Xóa'" :aria-label="hasChildren(d) ? 'Xóa mục này và các mục con' : 'Xóa'" @click="removeDivision(d)"><TIcon name="trash" /></button>
            <span v-else class="pdp-div__lock" v-tip="'Đang có dự án (gồm cả mục con) — chuyển dự án sang khối khác trước khi xóa'"><TIcon name="lock" /></span>
          </div>
          <button class="btn btn--link pdp-div__add" type="button" @click="addDivision(null)"><TIcon name="plus" />Thêm khối</button>
        </div>
        <p v-if="divMsg.text" class="pdp-set__msg" :class="`pdp-set__msg--${divMsg.type}`">
          <TIcon :name="divMsg.type === 'error' ? 'circle-x' : 'circle-check'" />{{ divMsg.text }}
        </p>
        <div class="pdp-set__actions">
          <button class="btn btn--primary" :disabled="divBusy || !divDirty" @click="saveDivs">Lưu danh mục</button>
          <button v-if="divDirty" class="btn btn--outline btn--neutral" @click="resetDivs">Hủy thay đổi</button>
        </div>
      </section>

      <!-- Email gửi lời mời người dùng — SMTP cấu hình trong .env (mật khẩu không qua giao diện) -->
      <section v-if="backend.enabled" class="card pdp-set">
        <div class="pdp-set__head">
          <div class="pdp-set__title">
            <span class="pdp-set__icon"><TIcon name="mail" /></span>
            <div>
              <h2 class="pdp-set__name">Email gửi lời mời</h2>
              <p class="pdp-set__sub">Khi mời người dùng, app gửi email kèm link đăng nhập từ địa chỉ này.</p>
            </div>
          </div>
          <AppTag :label="mail.enabled ? 'Đã cấu hình' : 'Chưa cấu hình'" :color="mail.enabled ? 'success' : 'neutral'" :dot="true" />
        </div>
        <div class="pdp-set__grid">
          <TipField label="Người gửi" tip="Đổi bằng SMTP_FROM trong file .env trên máy chủ.">
            <AppTextbox :model-value="mail.from" state="readonly" />
          </TipField>
          <TipField label="Máy chủ thư (SMTP)" tip="SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS trong .env — mật khẩu chỉ đặt trên máy chủ.">
            <AppTextbox :model-value="mail.host ? mail.host + (mail.missingPass ? ' — thiếu SMTP_PASS (mật khẩu ứng dụng)' : '') : 'Chưa cấu hình — mời người dùng sẽ hiện link để tự gửi'" state="readonly" />
          </TipField>
        </div>
        <p v-if="mailMsg.text" class="pdp-set__msg" :class="`pdp-set__msg--${mailMsg.type}`">
          <TIcon :name="mailMsg.type === 'error' ? 'circle-x' : 'circle-check'" />{{ mailMsg.text }}
        </p>
        <div class="pdp-set__actions">
          <button class="btn btn--outline btn--neutral" :disabled="!mail.enabled || mailBusy" @click="testMail"><TIcon name="send" />Gửi email thử tới {{ currentUser?.email || 'tôi' }}</button>
        </div>
      </section>

      <!-- Trạng thái hoạt động người dùng (trang Người dùng): quá N phút không thao tác → “Không hoạt động” -->
      <section v-if="backend.enabled" class="card pdp-set">
        <div class="pdp-set__head">
          <div class="pdp-set__title">
            <span class="pdp-set__icon"><TIcon name="user-check" /></span>
            <div>
              <h2 class="pdp-set__name">Trạng thái hoạt động người dùng</h2>
              <p class="pdp-set__sub">Ở trang Người dùng: <b class="pdp-st pdp-st--active">Đang hoạt động</b> = đang mở app và có thao tác (click, gõ phím, cuộn…);
                <b class="pdp-st pdp-st--idle">Không hoạt động</b> = vẫn mở app nhưng quá số phút dưới đây không thao tác; <b class="pdp-st">Offline</b> = đã đóng app.</p>
            </div>
          </div>
        </div>
        <div class="pdp-set__grid">
          <TipField label="Tính “Không hoạt động” sau (phút)" :message="idleErr" tip="Từ 1 đến 240 phút. Mặc định 10 phút.">
            <AppNumberbox v-model="idleMin" :min="1" :max="240" :state="idleErr ? 'error' : 'default'" />
          </TipField>
        </div>
        <p v-if="idleMsg" class="pdp-set__msg pdp-set__msg--ok"><TIcon name="circle-check" />{{ idleMsg }}</p>
        <div class="pdp-set__actions">
          <button class="btn btn--primary" :disabled="idleBusy || Number(idleMin) === idleSaved" @click="saveIdle">Lưu</button>
        </div>
      </section>

      <!-- Tích hợp AI: Google AI Studio (Gemini) — bóc tách ảnh chụp TFS thành danh sách công việc -->
      <section class="card pdp-set">
        <div class="pdp-set__head">
          <div class="pdp-set__title">
            <span class="pdp-set__icon"><TIcon name="sparkles" /></span>
            <div>
              <h2 class="pdp-set__name">AI bóc tách ảnh chụp — Google AI Studio</h2>
              <p class="pdp-set__sub">Dùng cho “Nhập từ ảnh chụp (AI)” trong vòng lặp: đọc ảnh chụp lưới TFS thành danh sách công việc.</p>
            </div>
          </div>
          <AppTag :label="info.hasKey ? 'Đã cấu hình' : 'Chưa cấu hình'" :color="info.hasKey ? 'success' : 'neutral'" :dot="true" />
        </div>

        <div class="pdp-set__alert">
          <TIcon name="alert-triangle" />
          <span>Khi dùng AI, <strong>ảnh chụp được gửi lên máy chủ của Google</strong> để xử lý. Chỉ bật nếu quy định công ty cho phép đưa nội dung đó ra ngoài.
            Chưa cấu hình → app dùng OCR chạy ngay trên máy (không gửi ảnh đi, kém chính xác hơn).</span>
        </div>

        <div class="pdp-set__grid">
          <TipField label="API key" :tip="`Tạo key miễn phí tại aistudio.google.com/apikey. ${backend.enabled ? 'Key chỉ lưu trên máy chủ, không gửi xuống trình duyệt người dùng.' : 'Chế độ demo: key lưu trong trình duyệt này.'}`">
            <AppTextbox v-model="keyInput" type="password" :placeholder="info.hasKey ? `Đang dùng ${info.keyMasked} — nhập key mới để thay` : 'Dán API key (AIza…)'" />
          </TipField>
          <TipField label="Model" tip="Gemini 2.5 Flash cân bằng tốc độ / độ chính xác và có hạn mức miễn phí.">
            <AppCombobox v-model="model" :options="AI_MODELS" :clearable="false" />
          </TipField>
        </div>

        <p v-if="msg.text" class="pdp-set__msg" :class="`pdp-set__msg--${msg.type}`">
          <TIcon :name="msg.type === 'error' ? 'circle-x' : 'circle-check'" />{{ msg.text }}
        </p>

        <div class="pdp-set__actions">
          <button class="btn btn--primary" :disabled="busy" @click="save">Lưu</button>
          <button v-if="info.hasKey" class="btn btn--outline btn--neutral" :disabled="busy" @click="test"><TIcon name="plug-connected" />Kiểm tra kết nối</button>
          <button v-if="info.hasKey" class="btn btn--link pdp-set__remove" :disabled="busy" @click="removeKey">Xóa key</button>
        </div>
      </section>

      <!-- Dữ liệu lưu trữ: công việc năm cũ được nén khỏi kho chính cho app nhẹ — xem / tải về / khôi phục -->
      <section v-if="backend.enabled" class="card pdp-set">
        <div class="pdp-set__head">
          <div class="pdp-set__title">
            <span class="pdp-set__icon"><TIcon name="archive" /></span>
            <div>
              <h2 class="pdp-set__name">Dữ liệu lưu trữ</h2>
              <p class="pdp-set__sub">Mỗi ngày máy chủ tự nén công việc (kèm lịch sử, vòng lặp đã hết việc) <b>cũ hơn 12 tháng thuộc năm trước và đã chốt điểm</b>,
                hoặc <b>cũ hơn 24 tháng</b>, ra khỏi kho chính để app tải nhanh. Bảng điểm đã chốt vẫn xem bình thường ở Tổng hợp điểm.
                Cần sửa việc cũ → Khôi phục phần đó về.</p>
            </div>
          </div>
        </div>
        <div v-if="arc.items.length" class="arc-list">
          <div class="arc-row arc-row--head"><span>Năm</span><span>Dự án</span><span class="arc-num">Công việc</span><span class="arc-num">Dung lượng</span><span>Nén lúc</span><span /></div>
          <div v-for="a in arc.items" :key="a.key" class="arc-row">
            <span>{{ a.year }}</span>
            <span class="arc-name">{{ a.projectName }}</span>
            <span class="arc-num">{{ fmtNum(a.tasks) }}</span>
            <span class="arc-num" v-tip="`Gốc ${kb(a.rawBytes)} → nén còn ${kb(a.bytes)}`">{{ kb(a.bytes) }}</span>
            <span>{{ new Date(a.archivedAt.replace(' ', 'T') + 'Z').toLocaleDateString('vi-VN') }}</span>
            <span class="arc-act">
              <a class="btn btn--link btn--sm" :href="`/api/admin/archive/${encodeURIComponent(a.key)}`" download><TIcon name="download" />Tải về</a>
              <button class="btn btn--link btn--sm" :disabled="arc.busy" @click="restore(a)"><TIcon name="restore" />Khôi phục</button>
            </span>
          </div>
        </div>
        <p v-else class="pdp-set__sub">Chưa có dữ liệu nào được nén.</p>
        <p v-if="arc.msg" class="pdp-set__msg" :class="`pdp-set__msg--${arc.type}`"><TIcon :name="arc.type === 'error' ? 'circle-x' : 'circle-check'" />{{ arc.msg }}</p>
        <div class="pdp-set__actions">
          <button class="btn btn--outline btn--neutral" :disabled="arc.busy" @click="runArchive"><TIcon name="archive" />Nén ngay</button>
        </div>
      </section>
      </template>
    </div>
  </AppShell>
</template>

<script setup>
import { fmtNum } from '@mds/utils/number.js'
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import AppShell    from '../components/AppShell.vue'
import TipField    from '../components/TipField.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTag      from '@mds/components/AppTag.vue'
import AppTextbox  from '@mds/components/AppTextbox.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import { db, isAdmin, currentUser, saveDivisions } from '../store/db.js'
import { vTip } from '@mds/utils/tooltip.js'
import { backend, api } from '../store/api.js'
import { getAiSettings, saveAiSettings, testAi } from '../store/ai.js'
import { AI_MODELS, DEFAULT_AI_MODEL } from '../store/aiExtract.js'

const admin = computed(() => isAdmin())
const info = reactive({ hasKey: false, keyMasked: '', model: DEFAULT_AI_MODEL })
const keyInput = ref(''), model = ref(DEFAULT_AI_MODEL), busy = ref(false)
const msg = reactive({ type: '', text: '' })
const say = (type, text) => { msg.type = type; msg.text = text }

async function load() {
  try { Object.assign(info, await getAiSettings()); model.value = info.model || DEFAULT_AI_MODEL } catch (e) { say('error', e.message) }
}
onMounted(() => { if (admin.value) { load(); loadMail(); loadIdle(); loadArchive() } })

/* ── Dữ liệu lưu trữ ── */
const arc = reactive({ items: [], busy: false, msg: '', type: 'ok' })
const kb = b => (b >= 1048576 ? `${fmtNum(b / 1048576, { decimals: 1 })} MB` : `${fmtNum(Math.max(1, Math.round(b / 1024)))} KB`)
async function loadArchive() { if (!backend.enabled) return; try { arc.items = (await api.get('/api/admin/archive')).items } catch { /* bỏ qua */ } }
async function runArchive() {
  arc.busy = true; arc.msg = ''
  try {
    const r = await api.post('/api/admin/archive/run', {})
    Object.assign(arc, r.tasks || r.iterations ? { type: 'ok', msg: `Đã nén ${r.tasks} công việc, ${r.iterations} vòng lặp.` } : { type: 'ok', msg: 'Không có dữ liệu nào đủ điều kiện nén.' })
    await loadArchive()
  } catch (e) { Object.assign(arc, { type: 'error', msg: e.message }) } finally { arc.busy = false }
}
async function restore(a) {
  arc.busy = true; arc.msg = ''
  try {
    const r = await api.post(`/api/admin/archive/${encodeURIComponent(a.key)}/restore`, {})
    Object.assign(arc, { type: 'ok', msg: `Đã khôi phục ${r.tasks} công việc của ${a.projectName} năm ${a.year}. Lưu ý: lần nén tự động sau có thể nén lại nếu vẫn đủ điều kiện.` })
    await loadArchive()
  } catch (e) { Object.assign(arc, { type: 'error', msg: e.message }) } finally { arc.busy = false }
}

/* Danh mục Khối dự án DẠNG CÂY: sửa trên bản nháp → Lưu danh mục. Mục mới tự sinh id để mục con trỏ được tới cha mới */
let seq = 0
const newId = () => 'dv' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const toDraft = () => db.divisions.map(d => ({ key: ++seq, id: d.id, name: d.name, parentId: d.parentId ?? '' }))
const divs = ref(toDraft())
// Hiển thị theo cây (cha trước con, thụt lề theo cấp)
const divTree = computed(() => {
  const out = [], ids = new Set(divs.value.map(d => d.id))
  const walk = (parent, depth) => divs.value.filter(d => (parent ? d.parentId === parent : !d.parentId || !ids.has(d.parentId))).forEach(d => { out.push(Object.assign(d, { depth })); walk(d.id, depth + 1) })
  walk(null, 0)
  return out
})
const divDirty = computed(() => JSON.stringify(divs.value.map(d => [d.id, d.name.trim(), d.parentId || ''])) !== JSON.stringify(db.divisions.map(d => [d.id, d.name, d.parentId || ''])))
watch(() => db.divisions, () => { if (!divDirty.value) divs.value = toDraft() })
const divErrors = reactive({}), divBusy = ref(false), divMsg = reactive({ type: '', text: '' })
const subtreeIds = d => { const out = new Set([d.id]); let grew = true; while (grew) { grew = false; for (const x of divs.value) if (x.parentId && out.has(x.parentId) && !out.has(x.id)) { out.add(x.id); grew = true } } return out }
const hasChildren = d => divs.value.some(x => x.parentId === d.id)
const usedCount = d => { const ids = subtreeIds(d); return db.projects.filter(p => ids.has(p.divisionId)).length }
async function addDivision(parent) {
  const item = { key: ++seq, id: newId(), name: '', parentId: parent?.id ?? '' }
  // Chèn ngay sau nhánh của mục cha (giữ thứ tự hiển thị), không có cha → cuối danh sách
  if (parent) { const ids = subtreeIds(parent); const last = divs.value.reduce((m, x, i) => (ids.has(x.id) ? i : m), -1); divs.value.splice(last + 1, 0, item) }
  else divs.value.push(item)
  divMsg.text = ''
  await nextTick(); document.querySelectorAll('.pdp-div__name input')[divTree.value.findIndex(x => x.key === item.key)]?.focus()
}
/* ── Kéo thả sắp xếp / đổi cấp ── */
const drag = reactive({ key: null, over: null, zone: '' })
function onDragStart(e, d) { drag.key = d.key; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(d.key)) }
function onDragEnd() { drag.key = null; drag.over = null; drag.zone = '' }
function onDragOver(e, d) {
  if (drag.key == null) return
  const src = divs.value.find(x => x.key === drag.key)
  if (!src || subtreeIds(src).has(d.id)) { drag.over = null; return }      // không thả vào chính nhánh của mình
  const r = e.currentTarget.getBoundingClientRect(), y = (e.clientY - r.top) / r.height
  drag.over = d.key; drag.zone = y < 0.3 ? 'before' : y > 0.7 ? 'after' : 'inside'
}
function onDragLeave(d) { if (drag.over === d.key) drag.over = null }
function onDrop(target) {
  const src = divs.value.find(x => x.key === drag.key), zone = drag.zone
  onDragEnd()
  if (!src || src.key === target.key || subtreeIds(src).has(target.id)) return
  const ids = subtreeIds(src)
  const moving = divs.value.filter(x => ids.has(x.id)), rest = divs.value.filter(x => !ids.has(x.id))
  src.parentId = zone === 'inside' ? target.id : (target.parentId || '')
  // Vị trí chèn trong danh sách phẳng: trước mục đích · sau cả nhánh của mục đích (sau / thành con cuối)
  let at = rest.findIndex(x => x.key === target.key)
  if (zone !== 'before') { const tIds = subtreeIds(target); at = rest.reduce((m, x, i) => (tIds.has(x.id) ? i : m), at) + 1 }
  rest.splice(at, 0, ...moving)
  divs.value = rest
  divMsg.text = ''
}
function removeDivision(d) { const ids = subtreeIds(d); divs.value = divs.value.filter(x => !ids.has(x.id)) }
function resetDivs() { divs.value = toDraft(); Object.keys(divErrors).forEach(k => delete divErrors[k]); divMsg.text = '' }
async function saveDivs() {
  Object.keys(divErrors).forEach(k => delete divErrors[k]); divMsg.text = ''
  const seen = new Set()
  for (const d of divs.value) {
    const k = `${d.parentId}|${d.name.trim().toLowerCase()}`
    if (!d.name.trim() || seen.has(k)) divErrors[d.key] = true
    seen.add(k)
  }
  if (Object.keys(divErrors).length) { Object.assign(divMsg, { type: 'error', text: 'Tên không được để trống hoặc trùng nhau trong cùng cấp' }); return }
  divBusy.value = true
  try { await saveDivisions(divTree.value.map(d => ({ id: d.id, name: d.name.trim(), parentId: d.parentId || '' }))); divs.value = toDraft(); Object.assign(divMsg, { type: 'ok', text: 'Đã lưu danh mục khối.' }) }
  catch (e) { Object.assign(divMsg, { type: 'error', text: e.message }) }
  finally { divBusy.value = false }
}

/* Email gửi lời mời */
const mail = reactive({ enabled: false, from: '', host: '' })
const mailBusy = ref(false), mailMsg = reactive({ type: '', text: '' })
async function loadMail() { if (backend.enabled) Object.assign(mail, await api.get('/api/mail/settings').catch(() => ({}))) }
async function testMail() {
  mailBusy.value = true; mailMsg.text = ''
  try { const r = await api.post('/api/mail/test', {}); Object.assign(mailMsg, { type: 'ok', text: `Đã gửi email thử tới ${r.to} — kiểm tra hộp thư (cả mục Spam).` }) }
  catch (e) { Object.assign(mailMsg, { type: 'error', text: e.message }) }
  finally { mailBusy.value = false }
}

/* Trạng thái hoạt động: số phút không thao tác → “Không hoạt động” */
const idleMin = ref(10), idleSaved = ref(10), idleErr = ref(''), idleMsg = ref(''), idleBusy = ref(false)
async function loadIdle() {
  if (!backend.enabled) return
  try { const r = await api.get('/api/presence/settings'); idleMin.value = idleSaved.value = r.idleMinutes } catch { /* giữ mặc định */ }
}
async function saveIdle() {
  idleErr.value = ''; idleMsg.value = ''
  const n = Number(idleMin.value)
  if (!Number.isInteger(n) || n < 1 || n > 240) { idleErr.value = 'Nhập số phút từ 1 đến 240'; return }
  idleBusy.value = true
  try { const r = await api.put('/api/presence/settings', { idleMinutes: n }); idleSaved.value = idleMin.value = r.idleMinutes; idleMsg.value = `Đã lưu — quá ${r.idleMinutes} phút không thao tác sẽ tính “Không hoạt động”.` }
  catch (e) { idleErr.value = e.message }
  finally { idleBusy.value = false }
}

async function run(fn, okText) {
  busy.value = true; say('', '')
  try { const r = await fn(); if (r && typeof r === 'object') Object.assign(info, r); say('ok', okText) }
  catch (e) { say('error', e.message) }
  finally { busy.value = false }
}
const save = () => run(() => saveAiSettings({ model: model.value, ...(keyInput.value.trim() ? { apiKey: keyInput.value.trim() } : {}) }).then(r => { keyInput.value = ''; return r }), 'Đã lưu cài đặt AI.')
const test = () => run(async () => { await testAi() }, 'Kết nối Google AI Studio thành công.')
const removeKey = () => run(() => saveAiSettings({ apiKey: '' }), 'Đã xóa API key — “Nhập từ ảnh chụp” sẽ dùng OCR trên máy.')
</script>

<style scoped>
.pdp-set + .pdp-set { margin-top: 0; }
.pdp-div { display: flex; flex-direction: column; gap: 8px; }
.pdp-div__row { display: flex; align-items: center; gap: 12px; }
.pdp-div__no { width: 20px; flex-shrink: 0; text-align: right; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-div__name { flex: 1; min-width: 0; max-width: 420px; }
.pdp-div__count { width: 110px; flex-shrink: 0; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-div__lock { width: 24px; display: inline-flex; justify-content: center; color: var(--icon-neutral, var(--text-secondary)); font-size: 16px; }
.pdp-div__row { position: relative; border-radius: var(--radius-default); }
.pdp-div__grip { display: inline-flex; flex-shrink: 0; color: var(--icon-neutral); font-size: 16px; cursor: grab; opacity: 0.6; }
.pdp-div__row:hover .pdp-div__grip { opacity: 1; }
.pdp-div__row--dragging { opacity: 0.4; }
/* Vị trí thả: vạch trên / dưới (trước / sau) · nền nhạt (thành mục con) */
.pdp-div__row--drop-before::before, .pdp-div__row--drop-after::after { content: ''; position: absolute; left: 0; right: 0; height: 2px; background: var(--bg-brand); border-radius: var(--radius-pill); }
.pdp-div__row--drop-before::before { top: -5px; }
.pdp-div__row--drop-after::after { bottom: -5px; }
.pdp-div__row--drop-inside { background: var(--bg-brand-light); outline: 1px dashed var(--stroke-brand); }
.pdp-div__ic { font-size: 16px; flex-shrink: 0; color: var(--icon-neutral); }
.pdp-div__add { align-self: flex-start; margin-left: 32px; }
.pdp-set { display: flex; flex-direction: column; gap: var(--input-row-gap); max-width: 860px; flex-shrink: 0; }
.pdp-set__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.pdp-set__title { display: flex; align-items: flex-start; gap: 12px; }
.pdp-set__icon { width: 36px; height: 36px; flex-shrink: 0; border-radius: var(--radius-default); display: inline-flex; align-items: center; justify-content: center; background: var(--bg-brand-light); color: var(--icon-brand); font-size: 20px; }
.pdp-set__name { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.pdp-set__sub { font-size: var(--text-body); color: var(--text-secondary); }
.pdp-set__alert { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-warning-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.pdp-set__alert .ti { color: var(--icon-warning); flex-shrink: 0; }
.pdp-set__alert strong { font-weight: var(--fw-semibold); }
.pdp-set__grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: var(--form-row-gap) var(--form-col-gap-sm); align-items: start; }
.pdp-set__msg { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); }
.pdp-set__msg--ok { color: var(--text-success); }
.pdp-set__msg--error { color: var(--text-danger); }
.pdp-set__actions { display: flex; align-items: center; gap: 8px; }
.pdp-st { font-weight: var(--fw-semibold); color: var(--text-secondary); }
.pdp-st--active { color: var(--text-success); }
.pdp-st--idle { color: var(--text-warning); }
.arc-list { display: flex; flex-direction: column; border-radius: var(--radius-default); box-shadow: 0 0 0 1px var(--stroke-neutral-light); overflow: hidden; }
.arc-row { display: grid; grid-template-columns: 56px minmax(0, 1fr) 84px 84px 92px 184px; align-items: center; gap: 12px; padding: 6px 12px; font-size: var(--text-body); color: var(--text-primary); }
.arc-row + .arc-row { border-top: 1px solid var(--stroke-divider); }
.arc-row--head { background: var(--bg-neutral-light); font-weight: var(--fw-semibold); color: var(--text-secondary); }
.arc-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arc-num { text-align: right; }
.arc-act { display: flex; gap: 4px; justify-content: flex-end; }
.pdp-set__remove { margin-left: auto; color: var(--text-danger); }
</style>
