<template>
  <DialogShell :title="TITLES[source]" :width="1200" :tab-fields-only="false" :fill="hasPreview" @close="$emit('close')">
    <div class="pdp-imp">
      <!-- Đã nhập xong -->
      <div v-if="importedCount" class="pdp-imp-done">
        <TIcon name="circle-check" class="pdp-imp-done__icon" />
        <p class="pdp-imp-done__text">Đã nhập <strong>{{ importedCount }}</strong> công việc vào {{ targetIter?.name }}.</p>
      </div>

      <template v-else>
        <!-- Ảnh chụp: 2 bước (không cuộn) — ① bóc tách ② xem trước + gán PD / BA rồi nhập -->
        <div v-if="isWizard" class="pdp-imp-steps">
          <span v-for="(st, i) in STEPS" :key="i" class="pdp-imp-step" :class="{ 'pdp-imp-step--on': step === i + 1, 'pdp-imp-step--done': step > i + 1 }">
            <span class="pdp-imp-step__no"><TIcon v-if="step > i + 1" name="check" /><template v-else>{{ i + 1 }}</template></span>{{ st }}
          </span>
          <label class="pdp-imp-target"><span>Nhập vào</span><AppCombobox v-model="targetIterId" :options="iterOptions" :clearable="false" class="pdp-imp-target__box" /></label>
        </div>

        <div v-else class="pdp-imp-row">
          <TipField label="PD cho dòng chưa có PD" tip="Dữ liệu từ TFS / ảnh chụp thường chưa có PD trong app — chọn PD để gán cho các dòng trống cột PD. Dòng đã có PD giữ nguyên.">
            <AppCombobox v-model="defaultPdId" :options="pdOptions" recent-key="pick-pd" placeholder="Không gán — dòng thiếu PD sẽ báo lỗi" empty-option="Không gán" />
          </TipField>
          <label class="pdp-imp-target"><span>Nhập vào</span><AppCombobox v-model="targetIterId" :options="iterOptions" :clearable="false" class="pdp-imp-target__box" /></label>
        </div>

        <!-- ① File Excel / CSV -->
        <template v-if="source === 'file'">
          <div class="pdp-imp-actions">
            <button class="btn btn--outline btn--neutral" @click="fileEl.click()"><TIcon name="upload" />Chọn file</button>
            <button class="btn btn--link" @click="downloadImportTemplate"><TIcon name="download" />Tải file mẫu</button>
            <InfoTip text="Dòng đầu là tiêu đề cột, khớp theo tên cột của file mẫu (thứ tự tùy ý); hỗ trợ .xlsx nhiều trang tính hoặc .csv. Bắt buộc có Nội dung; PD / BA nhập tài khoản, họ tên hoặc email của thành viên dự án; ngày dd/mm/yyyy. Cột Điểm được bỏ qua — app tự tính lại." />
            <span v-if="fileName" class="pdp-imp-file"><TIcon name="paperclip" />{{ fileName }}</span>
            <AppCombobox v-if="sheets.length > 1" v-model="sheetName" :clearable="false" class="pdp-imp-sheet" :options="sheetOptions" icon-left="table" />
            <input ref="fileEl" type="file" accept=".xlsx,.csv" class="pdp-imp-hidden" @change="onFile" />
          </div>
        </template>

        <!-- ② Dán từ TFS -->
        <template v-else-if="source === 'paste'">
          <TipField label="Dán các dòng copy từ TFS" tip="Trong TFS: chọn các dòng trên lưới Backlog / Query (gồm cả dòng tiêu đề nếu được) → Ctrl+C → dán vào đây. Nhận cột ID → PBI, Title → Nội dung, Assigned To → PD; không có tiêu đề thì tự đoán cột số là PBI, cột chữ dài nhất là Nội dung.">
            <AppTextarea v-model="pasteText" :min-height="120" :max-height="220" autosize placeholder="Ctrl+V để dán…" />
          </TipField>
        </template>

        <!-- ③ Ảnh chụp → AI bóc tách (Gemini) · chưa cấu hình AI → OCR chạy trên máy -->
        <template v-else-if="step === 1">
          <p class="pdp-imp-engine" :class="{ 'pdp-imp-engine--ai': aiEnabled }">
            <TIcon :name="aiEnabled ? 'sparkles' : 'scan'" />
            <span v-if="aiEnabled"><strong>Bóc tách bằng AI (Google Gemini)</strong> — ảnh được gửi lên Google để xử lý.</span>
            <span v-else><strong>Đọc chữ bằng OCR trên máy</strong> (không gửi ảnh đi, kém chính xác hơn) — Quản trị cấu hình AI ở Cài đặt hệ thống để bóc tách chính xác hơn.</span>
          </p>
          <div class="pdp-imp-drop" :class="{ 'pdp-imp-drop--over': dragOver }" tabindex="0"
            @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop" @click="imgEl.click()">
            <img v-if="imageUrl" :src="imageUrl" alt="" class="pdp-imp-drop__img" />
            <template v-else>
              <TIcon name="photo" class="pdp-imp-drop__icon" />
              <span><strong>Dán ảnh (Ctrl+V)</strong>, kéo thả hoặc bấm để chọn ảnh chụp lưới vòng lặp trong TFS</span>
            </template>
            <input ref="imgEl" type="file" accept="image/*" class="pdp-imp-hidden" @change="e => useImage(e.target.files?.[0], e)" />
          </div>
          <p v-if="ocrBusy" class="pdp-imp-msg"><TIcon name="loader-2" class="pdp-imp-spin" />{{ aiEnabled ? 'AI đang bóc tách danh sách công việc…' : `Đang đọc chữ trong ảnh… ${ocrProgress}%` }}</p>
          <TipField v-if="ocrText && !ocrBusy" :label="`Kết quả bóc tách: ${result?.rows.length ?? 0} công việc — sửa lại nếu sai`" :tip="aiEnabled ? 'Mỗi dòng: PBI ⇥ Nội dung ⇥ Người được giao ⇥ Point ⇥ Deadline ⇥ Ngày hoàn thành ⇥ Kết quả chất lượng (cách nhau bằng Tab, ngày dd/mm/yyyy; ảnh không có cột nào thì để trống). Sửa trực tiếp ở đây rồi bấm Tiếp tục.' : 'Mỗi dòng bắt đầu bằng mã PBI (4–8 chữ số) là 1 công việc. Sửa trực tiếp ở đây rồi bấm Tiếp tục.'">
            <AppTextarea v-model="ocrText" :min-height="96" :max-height="160" autosize />
          </TipField>
        </template>

        <!-- Ảnh chụp · bước 2: gán PD / BA (tùy chọn) cho các dòng chưa có -->
        <!-- Ảnh chụp · bước 2 — 1 hàng gọn (giải thích để trong tooltip) để bảng xem trước hiện được nhiều dòng nhất:
             Loại việc (tự nhận ra) · Định dạng ngày trên ảnh · Gán BA · Gán PD -->
        <div v-if="isWizard && step === 2" class="pdp-imp-assign">
          <TipField :label="stageAuto ? 'Loại việc · tự nhận ra' : 'Loại việc'" :tip="(stageAuto ? stageAuto + ' ' : '') + STAGE_HINT[stage]" class="pdp-imp-assign__stage">
            <StagePicker v-model="stage" @update:model-value="stageAuto = ''" />
          </TipField>
          <TipField v-if="dateSamples.length" label="Ngày trên ảnh đang là" :tip="`Chọn định dạng ngày ĐANG DÙNG TRÊN ẢNH — app đổi về định dạng của phần mềm (Ngày/Tháng/Năm). VD trên ảnh ghi ${dateSamples[0]} → vào phần mềm ${dateExample}${dateGuessNote ? ' · ' + dateGuessNote : ''}.`">
            <AppCombobox v-model="dateFmt" :options="dateOptions" :clearable="false" :state="dateGuess && !dateGuess.sure ? 'warning' : 'default'" />
          </TipField>
          <TipField label="Gán BA" tip="Gán cho các dòng chưa có BA. Không chọn → để trống.">
            <AppCombobox v-model="defaultBaId" :options="baOptions" recent-key="pick-ba" placeholder="Không gán" empty-option="Không gán" />
          </TipField>
          <TipField v-if="stage !== 'analysis'" label="Gán PD" tip="Gán cho các dòng chưa có PD. Không chọn → để trống, giao PD sau.">
            <AppCombobox v-model="defaultPdId" :options="pdOptions" recent-key="pick-pd" placeholder="Không gán" empty-option="Không gán" />
          </TipField>
        </div>

        <p v-if="error" class="pdp-imp-msg pdp-imp-msg--error"><TIcon name="circle-x" />{{ error }}</p>

        <template v-if="result && (!isWizard || step === 2)">
          <div class="pdp-imp-summary">
            <AppTag :label="`${rows.length} dòng`" color="neutral" />
            <AppTag v-if="validRows.length" :label="`Đã chọn ${importRows.length}/${validRows.length}`" :color="importRows.length ? 'brand' : 'neutral'" />
            <AppTag v-if="okCount" :label="`${okCount} hợp lệ`" color="success" />
            <AppTag v-if="warnCount" :label="`${warnCount} cần lưu ý`" color="warning" />
            <AppTag v-if="dupCount" :label="`${dupCount} trùng PBI`" color="warning" />
            <AppTag v-if="errorRows.length" :label="`${errorRows.length} lỗi — sẽ bỏ qua`" color="danger" />
            <span class="pdp-imp-summary__hint">Bấm vào PBI / Nội dung để sửa trực tiếp trước khi nhập</span>
          </div>
          <!-- Trùng mã PBI (với việc đã có trong dự án — kể cả việc thêm tay — hoặc giữa các dòng nhập): nhập vẫn tạo bản mới → cảnh báo rõ -->
          <p v-if="dupCount" class="pdp-imp-msg pdp-imp-msg--warning">
            <TIcon name="alert-triangle" />
            <span><strong>{{ dupCount }} dòng trùng mã PBI</strong> với công việc đã có trong dự án hoặc với dòng khác trong dữ liệu nhập (rê chuột lên nhãn ở cột Kết quả để xem).
              Nhập vẫn tạo công việc mới, không xóa / sửa việc đã có — sửa mã PBI nếu không muốn bị trùng.</span>
          </p>
          <p v-if="pdAsBaCount" class="pdp-imp-msg pdp-imp-msg--warning">
            <TIcon name="alert-triangle" />
            <span><strong>{{ pdAsBaCount }} dòng đang gán PD vào ô BA</strong> vì Loại việc là việc phân tích. Việc thiết kế của PD → chọn Loại việc <strong>Chỉ thiết kế</strong>, nếu không việc sẽ không có điểm PD.</span>
          </p>
          <p v-if="blockedCount" class="pdp-imp-msg pdp-imp-msg--warning">
            <TIcon name="alert-triangle" />
            <span><strong>{{ blockedCount }} dòng sẽ KHÔNG nhập BA Point, deadline, ngày hoàn thành, chất lượng BA</strong> (đã để trống trong bảng) — chỉ BA của việc, PO hoặc quản lý trực tiếp của BA nhập được. Gán chính bạn ở ô “Gán BA” nếu đây là việc của bạn, hoặc nhờ PO nhập.</span>
          </p>
          <div class="pdp-imp-table table-scroll" :class="{ 'pdp-imp-table--flash': dateFlash }">
            <DataTable :columns="previewCols" :rows="previewRows" :editable="true" :hide-blank-rows="false" :line-count="2"
              :selected="selectedIds" @update:selected="onSelect" @cell-update="onCell" />
          </div>
        </template>
      </template>
    </div>

    <template #footer>
      <template v-if="importedCount">
        <button class="btn btn--primary" @click="$emit('close')">Đóng</button>
      </template>
      <template v-else>
        <template v-if="isWizard && step === 1">
          <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
          <button v-if="result && !ocrBusy" class="btn btn--primary" @click="step = 2">Tiếp tục<TIcon name="arrow-right" /></button>
        </template>
        <template v-else>
          <button v-if="isWizard" class="btn btn--outline btn--neutral" @click="step = 1"><TIcon name="arrow-left" />Quay lại</button>
          <button v-else class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
          <button v-if="validRows.length" class="btn btn--primary" :disabled="!importRows.length" @click="doImport">Nhập {{ importRows.length }} công việc</button>
        </template>
      </template>
    </template>
  </DialogShell>
</template>

<script setup>
import { isPdRole } from '../store/scoring.js'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import DialogShell from './DialogShell.vue'
import TipField    from './TipField.vue'
import InfoTip     from './InfoTip.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTag      from '@mds/components/AppTag.vue'
import DataTable   from '@mds/components/DataTable.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import StagePicker from './StagePicker.vue'
import { readPref, writePref } from '../store/userPrefs.js'
import { performerOptions, importTasks, userName, membersOf, currentUser, baPerformerOptions, canApproveBa, iterationsOf, myProjectRole } from '../store/db.js'
import { DEFAULT_RATING, STAGES, hasAnalysis, formatDate } from '../store/scoring.js'
import { readSheets, looksLikeTaskSheet, validateRows, downloadImportTemplate, parsePastedTable, parseOcrText } from '../store/taskImport.js'
import { BA_IMPORT_FIELDS } from '../store/importCore.js'
import { recognizeImage } from '../store/ocr.js'
import { aiEnabled, extractTasksFromImage } from '../store/ai.js'
import { isChunkError, reloadForChunk } from '../store/chunkReload.js'

const props = defineProps({
  projectId: { type: String, required: true },
  iteration: { type: Object, required: true },
  mode:      { type: String, default: 'file' },   // 'file' | 'paste' | 'image'
})
defineEmits(['close'])

/* Vòng lặp nhận công việc — mặc định vòng đang xem, chọn lại được ngay trên hộp thoại */
const targetIterId = ref(props.iteration.id)
const fmtD = d => (d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '')
const iterOptions = computed(() => iterationsOf(props.projectId).map(i => ({ value: i.id, label: i.startDate ? `${i.name} (${fmtD(i.startDate)} – ${fmtD(i.endDate)})` : i.name })))
const targetIter = computed(() => iterationsOf(props.projectId).find(i => i.id === targetIterId.value) ?? props.iteration)
const TITLES = { file: 'Nhập công việc từ file Excel', paste: 'Dán công việc từ TFS', image: 'Nhập công việc từ ảnh chụp' }
const source = ref(props.mode)
const isWizard = computed(() => source.value === 'image')
const STEPS = ['Ảnh chụp & bóc tách', 'Xem trước & nhập']
const step = ref(1)
const error  = ref('')
const importedCount = ref(0)

/* PD gán cho dòng chưa có PD — mặc định: người đăng nhập nếu là PD của dự án */
const pdOptions = computed(() => performerOptions(props.projectId))
const defaultPdId = ref(props.mode !== 'image' && pdOptions.value.some(o => o.value === currentUser.value?.id) ? currentUser.value.id : '')
const baOptions = computed(() => baPerformerOptions(props.projectId))
const defaultBaId = ref(currentUser.value?.role === 'BA' && baOptions.value.some(o => o.value === currentUser.value.id) ? currentUser.value.id : '')   // BA nhập → mặc định gán chính mình cho dòng chưa có BA
/* Ảnh chụp: chọn Loại việc chung — mặc định như thêm việc: BA → Chỉ phân tích · PD → Chỉ thiết kế · vai trò khác → loại chọn lần gần nhất */
const lastStage = readPref('task-stage', '')
const stage = ref(currentUser.value?.role === 'BA' ? 'analysis' : isPdRole(currentUser.value?.role) ? 'design' : STAGES.some(x => x.value === lastStage) ? lastStage : 'design')
const STAGE_HINT = {
  analysis: 'Người được giao trên ảnh → BA · Point → BA Point · Deadline → Deadline phân tích · Ngày hoàn thành → Ngày hoàn thành (BA).',
  both:     'Đang ở giai đoạn phân tích: Người được giao trên ảnh → BA · Point → BA Point · Deadline → Deadline phân tích · Ngày hoàn thành → Ngày hoàn thành (BA). PD gán được luôn, thiết kế sau khi duyệt.',
  design:   'Người được giao trên ảnh → PD · Deadline → Deadline thiết kế · Ngày hoàn thành → Ngày hoàn thành (PD) · Point bỏ qua.',
}
/* Tự nhận ra loại việc từ kết quả AI: có BA Point / Kết quả chất lượng hoặc người được giao là BA → Chỉ phân tích;
   người được giao là PD, không có số liệu BA → Chỉ thiết kế. Không đủ dấu hiệu → giữ mặc định. Người dùng đổi tay thì thôi ghi “tự nhận ra”. */
const stageAuto = ref('')
const normName = v => String(v ?? '').replace(/<[^>]*>/g, '').trim().toLowerCase()
function detectStage(list) {
  const members = membersOf(props.projectId)
  const roleOf = a => { const k = normName(a); if (!k) return ''; const u = members.find(m => [m.name, m.code, m.email].some(x => normName(x) === k)); return u?.role ?? '' }
  const roles = list.map(x => roleOf(x.assignedTo))
  const ba = roles.filter(r => r === 'BA').length, pd = roles.filter(isPdRole).length
  const baData = list.some(x => x.point || x.quality)
  // Ưu tiên người được giao: ảnh TFS của PD thường cũng có cột Effort / Story Points / Original Estimate (AI đọc thành Point)
  // → không được vì có Point mà ép thành việc phân tích (PD bị gán vào ô BA, máy chủ bỏ hết số liệu → chỉ còn tên việc)
  if (ba > pd) { stage.value = 'analysis'; stageAuto.value = 'Người được giao là BA → việc phân tích.' }
  else if (pd > ba) { stage.value = 'design'; stageAuto.value = 'Người được giao là PD → việc thiết kế' + (baData ? ' (cột Point / Effort trên ảnh bỏ qua — điểm PD tính theo số màn hình, độ phức tạp, mức hài lòng).' : '.') }
  else if (baData) { stage.value = 'analysis'; stageAuto.value = 'Ảnh có cột BA Point / Kết quả chất lượng → việc phân tích.' }
  else stageAuto.value = ''
}
/* Ảnh chụp: PD không bắt buộc (để trống, giao sau) */
const opts = () => ({ defaultPdId: stage.value === 'analysis' && isWizard.value ? '' : defaultPdId.value, defaultBaId: defaultBaId.value, pdOptional: isWizard.value, defaultStage: isWizard.value ? stage.value : '' })

/* Dữ liệu thô của từng nguồn → validateRows (dùng chung xem trước + kiểm tra) */
const rawRows = ref(null)
const result = computed(() => {
  if (!rawRows.value) return null
  const r = validateRows(rawRows.value, props.projectId, opts())
  return r.missingColumns.length || !r.rows.length ? null : r
})
watch([rawRows, defaultPdId, defaultBaId, stage], () => {
  error.value = ''
  if (!rawRows.value) return
  const r = validateRows(rawRows.value, props.projectId, opts())
  if (r.missingColumns.length) error.value = `Thiếu cột bắt buộc: ${r.missingColumns.join(', ')}.` + (r.missingColumns.includes('PD') ? ' Chọn “PD cho dòng chưa có PD” ở trên.' : '')
  else if (!r.rows.length) error.value = 'Không có dòng công việc nào.'
})

/* ① File */
const fileEl = ref(null), fileName = ref(''), sheets = ref([]), sheetName = ref('')
const sheetOptions = computed(() => sheets.value.map(s => ({ value: s.name, label: `Trang tính: ${s.name}` })))
watch(sheetName, n => { rawRows.value = sheets.value.find(s => s.name === n)?.rows ?? null })
async function onFile(e) {
  const file = e.target.files?.[0]; e.target.value = ''
  if (!file) return
  fileName.value = file.name; error.value = ''
  try {
    sheets.value = await readSheets(file)
    const first = sheets.value.find(s => looksLikeTaskSheet(s.rows)) ?? sheets.value[0]
    if (sheetName.value === first?.name) rawRows.value = first.rows
    else sheetName.value = first?.name ?? ''
  } catch (err) { error.value = isChunkError(err) && reloadForChunk() ? 'Ứng dụng vừa cập nhật — đang tải lại trang, mở lại Nhập file sau khi tải xong.' : 'Không đọc được file: ' + (err.message || err) }
}

/* ② Dán từ TFS */
const pasteText = ref('')
watch(pasteText, t => { rawRows.value = t.trim() ? parsePastedTable(t) : null })

/* ③ Ảnh chụp → OCR */
const imgEl = ref(null), imageUrl = ref(''), dragOver = ref(false)
const ocrBusy = ref(false), ocrProgress = ref(0), ocrText = ref(''), aiResult = ref(false)
/* Cột của kết quả AI theo Loại việc: có phân tích → trường BA · chỉ thiết kế → trường PD (Point bỏ qua) */
const aiHeader = () => (hasAnalysis({ stage: stage.value })
  ? ['ID', 'Title', 'Mã nhân viên BA', 'BA Point', 'Deadline phân tích', 'Ngày hoàn thành (BA)', 'Chất lượng (BA)']
  : ['ID', 'Title', 'Assigned To', '', 'Deadline thiết kế', 'Ngày hoàn thành', '']).join('\t')
/* ── Định dạng ngày trên ảnh: AI giữ nguyên chuỗi ngày → quy đổi theo lựa chọn (Ngày/Tháng/Năm · Tháng/Ngày/Năm) ── */
const DATE_FORMATS = [{ value: 'dmy', label: 'Ngày/Tháng/Năm (dd/mm/yyyy)' }, { value: 'mdy', label: 'Tháng/Ngày/Năm (mm/dd/yyyy)' }]
const DATE_COLS = [4, 5]   // cột Deadline · Ngày hoàn thành trong kết quả bóc tách (PBI ⇥ Nội dung ⇥ Người giao ⇥ Point ⇥ Deadline ⇥ Hoàn thành ⇥ Chất lượng)
const DATE_RE = /^(\d{1,4})[/.-](\d{1,2})[/.-](\d{1,4})/
const dateCells = () => ocrText.value.split('\n').flatMap(l => { const c = l.split('\t'); return DATE_COLS.map(i => (c[i] ?? '').trim()).filter(Boolean) })
const dateSamples = computed(() => (aiResult.value ? [...new Set(dateCells())].filter(v => DATE_RE.test(v)) : []))
/* Tự đoán: phần đầu > 12 → ngày trước · phần giữa > 12 → tháng trước · có AM/PM → kiểu Mỹ · còn lại → lựa chọn lần trước / Ngày/Tháng/Năm */
function guessDateFmt(list) {
  const parts = list.map(v => v.match(DATE_RE)).filter(m => m && m[1].length <= 2)
  if (parts.some(m => +m[1] > 12)) return { fmt: 'dmy', sure: true }
  if (parts.some(m => +m[2] > 12)) return { fmt: 'mdy', sure: true }
  if (list.some(v => /\b(AM|PM)\b/i.test(v))) return { fmt: 'mdy', sure: true, why: 'trên ảnh có giờ AM/PM → kiểu Mỹ Tháng/Ngày/Năm' }
  // Không phân biệt được (VD 2/10/2026, giờ AM/PM bị cắt “…”) → chọn cách hiểu cho ngày GẦN HÔM NAY nhất (việc vừa làm)
  const far = fmt => { const ds = list.map(v => toDmy(v, fmt).split('/')).map(([d, m, y]) => new Date(+y, +m - 1, +d)).filter(d => !isNaN(d)); return ds.length ? ds.reduce((a, d) => a + Math.abs(d - Date.now()), 0) / ds.length : Infinity }
  const dmy = far('dmy'), mdy = far('mdy')
  if (dmy !== mdy && isFinite(dmy + mdy)) return { fmt: dmy < mdy ? 'dmy' : 'mdy', sure: false, why: 'không phân biệt được — đã chọn cách hiểu cho ngày gần hôm nay nhất, kiểm tra lại' }
  return { fmt: readPref('import-date-fmt', 'dmy'), sure: false }
}
const dateFmt = ref('dmy'), dateGuess = ref(null)
const dateOptions = computed(() => { const s = (dateSamples.value[0] ?? '').match(DATE_RE)?.[0]; return DATE_FORMATS.map(o => ({ ...o, label: `${o.value === 'dmy' ? 'Ngày/Tháng/Năm' : 'Tháng/Ngày/Năm (kiểu Mỹ)'}${s ? ` · ${s} → ${toDmy(s, o.value)}` : ''}` })) })
watch(dateSamples, list => { if (!list.length) return; dateGuess.value = guessDateFmt(list); dateFmt.value = dateGuess.value.fmt })
watch(dateFmt, v => writePref('import-date-fmt', v))
const dateGuessNote = computed(() => (!dateGuess.value ? '' : dateGuess.value.why || (dateGuess.value.sure ? 'đã nhận ra chắc chắn' : 'không phân biệt được — kiểm tra lại')))
/** Chuỗi ngày trên ảnh → dd/mm/yyyy theo định dạng chọn (bỏ phần giờ; năm 2 số → 20xx; dạng yyyy-mm-dd giữ thứ tự) */
function toDmy(v, fmt) {
  const m = String(v ?? '').trim().match(DATE_RE)
  if (!m) return String(v ?? '').trim()
  let [, a, b, c] = m
  let d, mo, y
  if (a.length === 4) [y, mo, d] = [a, b, c]
  else { y = c; [d, mo] = fmt === 'mdy' ? [b, a] : [a, b] }
  if (y.length === 2) y = '20' + y
  return `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${y}`
}
const dateExample = computed(() => (dateSamples.value[0] ? (d => { const [dd, mm, yy] = d.split('/'); return `${dd}/${mm}/${yy} (ngày ${+dd} tháng ${+mm})` })(toDmy(dateSamples.value[0], dateFmt.value)) : ''))
const withDates = t => t.split('\n').map(l => { const c = l.split('\t'); DATE_COLS.forEach(i => { if (c[i]) c[i] = toDmy(c[i], dateFmt.value) }); return c.join('\t') }).join('\n')

watch([ocrText, stage, dateFmt], ([t]) => { rawRows.value = !t.trim() ? null : (aiResult.value ? parsePastedTable(aiHeader() + '\n' + withDates(t)) : parseOcrText(t)) })
function onDrop(e) { dragOver.value = false; useImage([...(e.dataTransfer?.files ?? [])].find(f => f.type.startsWith('image/'))) }
async function useImage(file, e) {
  if (e?.target) e.target.value = ''
  if (!file) return
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = URL.createObjectURL(file)
  ocrBusy.value = true; ocrProgress.value = 0; ocrText.value = ''; error.value = ''
  try {
    if (aiEnabled.value) {
      const list = await extractTasksFromImage(file)
      aiResult.value = true
      detectStage(list)
      if (!list.length) error.value = 'AI không tìm thấy công việc nào trong ảnh. Thử chụp rõ hơn phần lưới danh sách.'
      ocrText.value = list.map(x => [x.pbi, x.content, x.assignedTo, x.point, x.deadline, x.completedDate, x.quality].join('\t').replace(/\t+$/, '')).join('\n')
    } else {
      const text = await recognizeImage(file, p => { ocrProgress.value = p })
      aiResult.value = false
      if (!parseOcrText(text).slice(1).length) error.value = 'Không nhận ra dòng công việc nào (dòng phải bắt đầu bằng mã PBI). Thử chụp rõ hơn / phóng to lưới, hoặc sửa tay trong ô chữ đọc được.'
      ocrText.value = text.trim()
    }
  } catch (err) { error.value = isChunkError(err) && reloadForChunk() ? 'Ứng dụng vừa cập nhật — đang tải lại trang, mở lại Nhập ảnh sau khi tải xong.' : (aiEnabled.value ? 'AI bóc tách lỗi: ' : 'Không đọc được ảnh: ') + (err.message || err) }
  finally { ocrBusy.value = false }
}
/* Ctrl+V: tab ảnh nhận ảnh trong clipboard */
function onPaste(e) {
  if (source.value !== 'image') return
  const f = [...(e.clipboardData?.files ?? [])].find(x => x.type.startsWith('image/'))
  if (f) { e.preventDefault(); useImage(f) }
}
onMounted(() => window.addEventListener('paste', onPaste))
onBeforeUnmount(() => { window.removeEventListener('paste', onPaste); if (imageUrl.value) URL.revokeObjectURL(imageUrl.value) })

/* ── Xem trước: sửa trực tiếp PBI / Nội dung (ghi đè lên kết quả bóc tách, theo số dòng) ── */
const edits = ref({})
watch(rawRows, () => { edits.value = {} })
function onCell({ row, col, value }) {
  edits.value = { ...edits.value, [row.rowNo]: { ...edits.value[row.rowNo], [col.key]: value } }
}
const rows = computed(() => (result.value?.rows ?? []).map(r => {
  const e = edits.value[r.rowNo]
  if (!e) return r
  const data = { ...r.data, ...e }
  const errors = r.errors.filter(x => !('content' in e && x === 'Thiếu Nội dung'))
  if ('content' in e && !String(e.content).trim() && !errors.includes('Thiếu Nội dung')) errors.unshift('Thiếu Nội dung')
  return { ...r, data, errors }
}))
const validRows = computed(() => rows.value.filter(r => !r.errors.length))
const errorRows = computed(() => rows.value.filter(r => r.errors.length))
const warnCount = computed(() => validRows.value.filter(r => r.warnings.length || baBlocked(r.data) || pdAsBa(r.data)).length)
const dupCount  = computed(() => validRows.value.filter(r => r.dupPbi).length)
const okCount   = computed(() => validRows.value.length - warnCount.value)
/* Đang có bảng xem trước → hộp thoại cao cố định, bảng giãn lấp phần còn lại (1 thanh cuộn) */
const hasPreview = computed(() => !importedCount.value && !!result.value && (!isWizard.value || step.value === 2))
/* Tick chọn dòng nhập: mặc định tick hết dòng hợp lệ — lưu các dòng BỎ tick (đổi dữ liệu nguồn → tick lại hết); dòng lỗi không tick được */
const unchecked = ref(new Set())
watch(rawRows, () => { unchecked.value = new Set() })
const rowKey = r => 'r' + r.rowNo
const selectedIds = computed(() => validRows.value.map(rowKey).filter(id => !unchecked.value.has(id)))
const importRows = computed(() => validRows.value.filter(r => !unchecked.value.has(rowKey(r))))
function onSelect(ids) { const on = new Set(ids); unchecked.value = new Set(validRows.value.map(rowKey).filter(id => !on.has(id))) }
/* Cột xem trước: đúng tên cột của danh sách công việc · theo Loại việc
   — ảnh chụp: theo loại việc đã chọn · file / dán TFS: hiện đủ cột PD + BA (mỗi dòng có thể khác loại việc) */
const COL = {
  pick:    { key: 'pick',    label: '',         type: 'checkbox', width: 48 },
  stt:     { key: 'stt',     label: 'STT',      width: 72, align: 'center', noFilter: true },
  check:   { key: 'check',   label: 'Kết quả',  type: 'status', width: 150, tip: 'Kết quả kiểm tra trước khi nhập — rê chuột lên nhãn có ⓘ để xem lý do' },
  pbi:     { key: 'pbi',     label: 'PBI',      type: 'textbox', width: 100 },
  content: { key: 'content', label: 'Nội dung', type: 'textarea', minWidth: 320, wrap: true },
  stage:   { key: 'stage',   label: 'Loại việc', width: 130 },
  pd:      { key: 'pd',      label: 'PD',       width: 120 },
  ba:      { key: 'ba',      label: 'BA',       width: 120 },
  baPoint: { key: 'baPoint', label: 'BA Point', width: 110, align: 'right' },
  baDeadline: { key: 'baDeadline', label: 'Deadline phân tích', type: 'text', width: 170 },
  baDone:  { key: 'baDone',  label: 'Ngày hoàn thành (BA)', type: 'text', width: 190 },
  baQuality: { key: 'baQuality', label: 'Chất lượng (BA)', width: 200, wrap: true },
  expected: { key: 'expected', label: 'Deadline thiết kế', type: 'text', width: 170 },
  done:    { key: 'done',    label: 'Ngày hoàn thành (PD)', type: 'text', width: 190 },
}
const previewCols = computed(() => {
  const base = [COL.pick, COL.stt, COL.check, COL.pbi, COL.content]
  const baCols = [COL.ba, COL.baPoint, COL.baDeadline, COL.baDone, COL.baQuality], pdCols = [COL.pd, COL.expected, COL.done]
  if (!isWizard.value) return [...base, COL.stage, ...pdCols, ...baCols]
  if (stage.value === 'analysis') return [...base, ...baCols]
  if (stage.value === 'design') return [...base, ...pdCols]
  return [...base, ...baCols, COL.pd]   // Phân tích → Thiết kế: đang ở giai đoạn phân tích
})
/* Ngày trong bảng xem trước: đã quy đổi về định dạng phần mềm (Ngày/Tháng/Năm) theo ô “Ngày trên ảnh” */
const dateText = iso => formatDate(iso)   // định dạng thống nhất của phần mềm: dd/mm/yyyy
/* Đổi định dạng ngày → các ô ngày nháy sáng 1 nhịp cho thấy giá trị vừa đổi */
const dateFlash = ref(false)
let dateFlashTimer = null
watch(dateFmt, () => { dateFlash.value = false; clearTimeout(dateFlashTimer); requestAnimationFrame(() => { dateFlash.value = true; dateFlashTimer = setTimeout(() => { dateFlash.value = false }, 1200) }) })
const previewRows = computed(() => rows.value.map((r, i) => ({
  id: 'r' + r.rowNo,
  rowNo: r.rowNo, stt: i + 1, _noSelect: r.errors.length > 0,   // dòng lỗi không tick được
  // Kết quả kiểm tra — lý do (lỗi / cần lưu ý / thông tin) xem khi rê chuột lên nhãn (không phải cột dữ liệu của công việc)
  check: { ...(r.errors.length ? { label: 'Lỗi — bỏ qua', color: 'danger' } : r.dupPbi ? { label: 'Trùng PBI', color: 'warning' } : r.warnings.length || baBlocked(r.data) || pdAsBa(r.data) ? { label: 'Cần lưu ý', color: 'warning' } : { label: 'Hợp lệ', color: 'success' }),
    tip: [...r.errors, ...r.warnings, ...(r.notes ?? []), ...(baBlocked(r.data) ? [BA_BLOCKED_NOTE] : [])].join(' · ') },
  pbi: r.data.pbi, content: r.data.content,
  stage: STAGES.find(x => x.value === (r.data.stage || 'design'))?.label,
  pd: userName(r.data.pdId), ba: userName(r.data.baId),   // thiếu trên ảnh → để trống, cập nhật sau
  // Không có quyền nhập số liệu BA → hiện trống đúng như sau khi nhập (trước đây hiện số, nhập xong mới mất)
  ...(baBlocked(r.data) ? { baPoint: '', baDeadline: '', baDone: '', baQuality: '' } : {
    baPoint: r.data.baPoint === '' || r.data.baPoint == null ? '' : r.data.baPoint,
    baDeadline: dateText(r.data.baDeadline), baDone: dateText(r.data.baCompletedDate), baQuality: r.data.baQuality || '' }),
  expected: dateText(r.data.expectedDate), done: dateText(r.data.completedDate),
})))

/* BA Point / deadline / ngày hoàn thành BA lúc tạo việc: chỉ PO / quản lý trực tiếp của BA ghi được (máy chủ bỏ qua với người khác) → báo trước */
const BA_BLOCKED_NOTE = 'BA Point / deadline / ngày hoàn thành / chất lượng BA sẽ để trống — chỉ BA của việc, PO hoặc quản lý trực tiếp của BA nhập được'
const baBlocked = d => hasAnalysis(d) && BA_IMPORT_FIELDS.some(f => d[f] !== '' && d[f] != null) && !canApproveBa({ projectId: props.projectId, baId: d.baId })
  && d.baId !== currentUser.value?.id   // BA tự nhập việc của chính mình → được
/* Loại việc có phân tích nhưng người ở ô BA lại là PD (thường do chọn nhầm loại việc) → cảnh báo */
const pdAsBa = d => hasAnalysis(d) && !!d.baId && isPdRole(membersOf(props.projectId).find(m => m.id === d.baId)?.role)
const blockedCount = computed(() => importRows.value.filter(r => baBlocked(r.data)).length)
const pdAsBaCount  = computed(() => importRows.value.filter(r => pdAsBa(r.data)).length)
/* Bỏ số liệu BA không có quyền nhập ngay ở trình duyệt — khớp máy chủ (không hiện điểm rồi tải lại mới mất) */
const stripBlocked = d => (baBlocked(d) ? { ...d, ...Object.fromEntries(BA_IMPORT_FIELDS.map(f => [f, ''])) } : d)
function doImport() {
  importTasks(importRows.value.map(r => ({
    ...stripBlocked(r.data),
    projectId: props.projectId, iterationId: targetIterId.value,
    qualityRating: r.data.qualityRating || DEFAULT_RATING, ratingReason: r.data.ratingReason ?? '',   // file để trống mức hài lòng → mặc định Hài lòng
    // Thành viên không tự đánh giá lúc tạo (máy chủ để trống) → trình duyệt cũng để trống, khỏi hiện điểm rồi tải lại mới mất
    ...(myProjectRole(props.projectId) !== 'manager' ? { qualityRating: '', ratingReason: '', manualScore: '' } : {}),
  })))
  importedCount.value = importRows.value.length
}
</script>

<style scoped>
.pdp-imp-summary__hint { margin-left: auto; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-imp { display: flex; flex-direction: column; gap: var(--input-row-gap); min-height: 0; }
.pdp-imp > :not(.pdp-imp-table) { flex-shrink: 0; }   /* phần trên giữ nguyên chiều cao, chỉ bảng co giãn */
.pdp-imp-engine { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-size: var(--text-body); color: var(--text-primary); }
.pdp-imp-engine strong { font-weight: var(--fw-semibold); }
.pdp-imp-engine .ti { font-size: 16px; color: var(--icon-neutral); flex-shrink: 0; }
.pdp-imp-engine--ai { background: var(--bg-brand-light); }
.pdp-imp-engine--ai .ti { color: var(--icon-brand); }
.pdp-imp-row { display: flex; align-items: flex-end; gap: var(--form-col-gap-sm); }
.pdp-imp-steps { display: flex; align-items: center; gap: 24px; }
.pdp-imp-step { display: inline-flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-imp-step__no { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--bg-neutral-light); color: var(--text-secondary); font-size: var(--text-body); font-weight: var(--fw-semibold); }
.pdp-imp-step__no .ti { font-size: 14px; }
.pdp-imp-step--on { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pdp-imp-step--on .pdp-imp-step__no { background: var(--bg-brand); color: var(--text-white); }
.pdp-imp-step--done .pdp-imp-step__no { background: var(--bg-brand-light); color: var(--text-brand); }
.pdp-imp-steps .pdp-imp-hint { padding-bottom: 0; }
.pdp-imp-assign { display: grid; grid-template-columns: minmax(0, 2.2fr) repeat(3, minmax(0, 1fr)); gap: 12px var(--form-col-gap-sm); align-items: end; }
.pdp-imp-assign__stage :deep(.stage-picker__k) { display: none; }   /* nhãn đã có ở TipField phía trên */
@media (max-width: 1100px) { .pdp-imp-assign { grid-template-columns: repeat(2, minmax(0, 1fr)); } .pdp-imp-assign__stage { grid-column: 1 / -1; } }
.pdp-imp-row > :first-child { width: 320px; }
.pdp-imp-hint { margin-left: auto; padding-bottom: 6px; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-imp-hint strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pdp-imp-target { display: inline-flex; align-items: center; gap: 8px; margin-left: auto; font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; }
.pdp-imp-target__box { width: 240px; }
.pdp-imp-row .pdp-imp-target { align-self: flex-end; }
.pdp-imp-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pdp-imp-file { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); color: var(--text-primary); }
.pdp-imp-hidden { display: none; }
.pdp-imp-sheet { width: 240px; }
.pdp-imp-drop {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  min-height: 120px; padding: 16px; cursor: pointer; text-align: center;
  border: 1px dashed var(--stroke-neutral); border-radius: var(--radius-default); background: var(--bg-neutral-light);
  font-size: var(--text-body); color: var(--text-primary);
  transition: border-color 0.15s, background 0.15s;
}
.pdp-imp-drop:hover, .pdp-imp-drop--over { border-color: var(--stroke-brand); background: var(--bg-brand-light); }
.pdp-imp-drop strong { font-weight: var(--fw-semibold); }
.pdp-imp-drop__icon { font-size: 28px; color: var(--icon-neutral); }
.pdp-imp-drop__sub { font-size: var(--text-body); color: var(--text-secondary); }
.pdp-imp-drop__img { max-width: 100%; max-height: 180px; border-radius: var(--radius-default); }
.pdp-imp-msg { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-imp-msg--error { color: var(--text-danger); }
.pdp-imp-msg--warning { /* box thấp 1–2 dòng → icon căn giữa dọc (skill: Box / card thấp) */ align-items: center; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-warning-light); color: var(--text-primary); line-height: var(--text-body-lh); }
.pdp-imp-msg--warning .ti { color: var(--icon-warning); font-size: 16px; flex-shrink: 0; }
.pdp-imp-msg--warning strong { font-weight: var(--fw-semibold); }
.pdp-imp-spin { animation: pdp-imp-spin 1s linear infinite; }
@keyframes pdp-imp-spin { to { transform: rotate(360deg); } }
.pdp-imp-summary { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
/* Bảng xem trước: khung cuộn 2 chiều (.table-scroll của mds-ui — thanh cuộn ngang luôn ở đáy khung, tiêu đề cột đứng yên) */
/* Bảng xem trước: giãn lấp phần còn lại của hộp thoại (DialogShell fill) — chỉ bảng cuộn; .table-scroll của mds-ui → cuộn 2 chiều, tiêu đề cột đứng yên */
.pdp-imp-table { flex: 1 1 auto; min-height: 200px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); overflow: hidden; }
.pdp-imp-table--flash :deep(.dt-cell[data-type="text"]) { animation: pdp-imp-flash 1.2s ease; }
@keyframes pdp-imp-flash { 0%, 40% { background: var(--bg-warning-light); } 100% { background: transparent; } }
.pdp-imp-done { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: var(--input-group-gap) 0; }
.pdp-imp-done__icon { font-size: 40px; color: var(--icon-success); }
.pdp-imp-done__text { font-size: var(--text-body-md); color: var(--text-primary); }
</style>
