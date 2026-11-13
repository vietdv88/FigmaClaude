<template>
  <DialogShell :title="form.id ? 'Chi tiết công việc' : copyFrom ? 'Nhân bản công việc' : 'Thêm công việc'" :width="form.id ? 640 : 560" @close="$emit('close')">
    <!-- Thông tin ban đầu → (khi sửa) thanh điểm + Tính điểm → Liên kết — cùng tên trường / tooltip với drawer -->
    <div ref="formEl" class="task-form">
      <!-- ① Thông tin ban đầu — nhập trước khi thêm: nội dung, giải pháp, ai làm, khi nào cần xong -->
      <section class="sec">
        <div class="grid">
          <!-- Thứ tự giống drawer chi tiết: Nội dung → Giải pháp sơ bộ → PBI (hàng riêng) → (thêm mới) Người đưa giải pháp · Độ phức tạp · Nền tảng → Thời hạn → PD · BA → (sửa) Trạng thái → Concept -->
          <!-- Thêm mới: chọn giai đoạn (1 dòng) — tự gợi ý theo người được giao, chọn tay thì giữ nguyên -->
          <StagePicker v-if="!form.id" class="span-2" :model-value="form.stage" @update:model-value="pickStage" />
          <!-- Dán / gõ “1283922 - Nội dung…” → tự tách mã PBI xuống ô PBI (khi dán, khi rời ô, khi Lưu) -->
          <TipField class="span-2" label="Nội dung" :required="true" :message="errors.content" @paste="onContentPaste" @focusout="splitPbi">
            <AppTextarea v-model="form.content" :min-height="40" :max-height="240" autosize :placeholder="form.stage === 'design' ? 'Mô tả công việc thiết kế' : 'Mô tả công việc'" :state="st('content', errors.content)" />
          </TipField>
          <!-- Mô tả giải pháp sơ bộ: link → bấm hiện ô nhập; bấm icon ✦ → AI gợi ý độ phức tạp (đang trống → tự điền) -->
          <SolutionBriefField v-if="showPdFields" v-model="form.solutionBrief" class="span-2" :ai-enabled="aiEnabled"
            :analyzed="!!aiCx.level && aiCx.key === briefKey()" :loading="aiCx.loading" @analyze="aiSuggest(true)" />
          <div v-if="showPdFields && aiEnabled && (aiCx.loading || aiCx.level || aiCx.error)" class="span-2 ai-cx" :class="{ 'ai-cx--error': aiCx.error }">
            <TIcon :name="aiCx.loading ? 'loader-2' : aiCx.error ? 'circle-x' : 'sparkles'" :class="{ 'ai-cx__spin': aiCx.loading, 'ti--ai': !aiCx.error }" />
            <span v-if="aiCx.loading" class="ai-cx__text"><span class="text-ai-primary">AI đang đánh giá độ phức tạp…</span></span>
            <span v-else-if="aiCx.error" class="ai-cx__text">{{ aiCx.error }}</span>
            <span v-else class="ai-cx__text"><span class="text-ai-primary">AI gợi ý:</span> <AppTag :label="aiCx.level" color="brand" /><template v-if="aiCx.business"> · nghiệp vụ <AppTag :label="aiCx.business" color="neutral" /></template>
              <template v-if="form.complexity === aiCx.level"> · đã chọn</template> — {{ aiCx.reason }}</span>
            <button v-if="!aiCx.loading && aiCx.level && form.complexity !== aiCx.level" type="button" class="btn btn--link btn--sm" @click="form.complexity = aiCx.level; if (aiCx.business) form.businessLevel = aiCx.business">Áp dụng</button>
            <button v-if="!aiCx.loading" type="button" class="btn btn--link btn--sm" @click="aiSuggest(true)">Gợi ý lại</button>
          </div>
          <!-- PBI: một hàng riêng (ô ngắn, nửa bề rộng) đứng trên Người đưa giải pháp -->
          <TipField class="span-2 half" label="PBI">
            <AppTextbox v-model="form.pbi" placeholder="Mã PBI" :state="st('pbi')" />
          </TipField>
          <!-- Thêm mới: chọn luôn Người đưa giải pháp (sửa thì nằm ở phần Tính điểm) -->
          <TipField v-if="!form.id && showPdFields" label="Người đưa giải pháp" :tip-items="solutionCriteria(form.solutionBy)" :tip="form.solutionBy ? `Tiêu chí “${form.solutionBy}”:` : 'Chọn BA / PD và BA / PD theo mức đóng góp giải pháp của PD — chọn để xem tiêu chí chi tiết. Chưa chọn → Điểm = 0.'">
            <AppCombobox v-model="form.solutionBy" :options="SOLUTION_ROLES" placeholder="Chọn" :state="st('solutionBy')" />
          </TipField>
          <!-- Thêm mới: chọn luôn Độ phức tạp nghiệp vụ (AI gợi ý từ Mô tả giải pháp sơ bộ sẽ điền vào đây; sửa thì nằm ở phần Tính điểm) -->
          <TipField v-if="!form.id && showPdFields" label="Độ phức tạp thiết kế" :tip-items="complexityCriteria(form.complexity)" :tip="complexityTip(form.complexity)" :tip-note="`${COMPLEXITY_NOTE} ${COMPLEXITY_TIE}`">
            <AppCombobox v-model="form.complexity" :options="COMPLEXITY_OPTIONS" placeholder="Chọn" :state="st('complexity')" />
          </TipField>
          <TipField v-if="!form.id && showPdFields" label="Hệ số nghiệp vụ" :tip="BUSINESS_HINT">
            <AppCombobox v-model="form.businessLevel" :options="BUSINESS_OPTIONS" :clearable="false" />
          </TipField>
          <!-- Thêm mới: chọn luôn Nền tảng (sửa thì nằm ở phần Tiêu chí tính điểm bên dưới) -->
          <TipField v-if="!form.id && showPdFields" label="Nền tảng" :tip="platformTip">
            <AppCombobox v-model="form.platform" :options="PLATFORMS" placeholder="Chọn" :clearable="false" :state="st('platform')" />
          </TipField>
          <TipField label="Deadline thiết kế" tip="Hạn hoàn thành phần thiết kế của PD — dùng cho danh sách Việc sắp đến hạn ở Tổng quan.">
            <AppDatebox v-model="form.expectedDate" :state="st('expectedDate')" />
          </TipField>
          <TipField v-if="form.stage !== 'analysis'" label="PD" :required="form.stage === 'design'" :message="errors.pdId"
            :tip="form.stage === 'both' ? 'Có thể giao sau — khi duyệt giai đoạn phân tích sẽ chọn PD thiết kế.' : ''">
            <AppCombobox v-model="form.pdId" :options="pdOptions" recent-key="pick-pd" :placeholder="form.stage === 'both' ? 'Giao sau khi duyệt' : 'Chọn người thực hiện'" :empty-option="form.stage === 'both' ? 'Giao sau khi duyệt' : ''" :state="st('pdId', errors.pdId)" />
          </TipField>
          <TipField label="BA" :required="form.stage !== 'design'" :message="errors.baId"
            :tip="form.stage !== 'design' ? 'Người phân tích — được tính Điểm thực nhận.' : 'Người đánh giá chất lượng thiết kế.'">
            <AppCombobox v-model="form.baId" :options="baOptions" recent-key="pick-ba" placeholder="Chọn BA" :empty-option="form.stage === 'design' ? 'Không gán BA' : ''" :state="st('baId', errors.baId)" />
          </TipField>
          <!-- Có giai đoạn Phân tích: PO / quản lý trực tiếp / BA của việc nhập luôn BA Point + deadline (để trống, nhập sau cũng được) -->
          <template v-if="!form.id && form.stage !== 'design' && canScoreBa">
            <TipField label="BA Point" tip="Story Point của việc — BA tự điền hoặc PO chấm. Có thể nhập sau.">
              <AppNumberbox v-model="form.baPoint" :min="0" decimal :stepper="false" placeholder="Nhập sau cũng được" />
            </TipField>
            <TipField label="Deadline phân tích" tip="Mốc xác định đúng hạn hay trễ của giai đoạn phân tích.">
              <AppDatebox v-model="form.baDeadline" />
            </TipField>
          </template>
          <!-- Trạng thái thiết kế: thêm mới dùng mặc định, cập nhật sau trong chi tiết -->
          <TipField v-if="form.id" label="Trạng thái thiết kế">
            <AppCombobox v-model="form.designStatus" :options="statusOptions" :state="st('designStatus')" />
          </TipField>
          <TipField v-if="form.stage !== 'analysis'" class="span-2" label="Concept" tip="Mô tả giải pháp / concept, link Google AI Studio, wireframe… Không ảnh hưởng điểm.">
            <AppTextarea v-model="form.concept" :min-height="40" :max-height="320" autosize placeholder="Mô tả concept" :state="st('concept')" />
          </TipField>
        </div>
      </section>

      <!-- Thêm mới = giao việc: chỉ thông tin ban đầu. Điểm / đánh giá / link nhập khi cập nhật công việc -->
      <template v-if="form.id">
      <div class="score-bar">
        <span class="score-bar__item">Điểm <strong>{{ fmtNum(score) }}</strong></span>
        <span class="score-bar__sep" />
        <span class="score-bar__item">Sau đánh giá <strong class="score-bar__final">{{ fmtNum(finalScore) }}</strong></span>
        <InfoTip text="Điểm tự tính theo màn Quy tắc chấm điểm. Điểm sau đánh giá = Điểm × hệ số mức hài lòng (chưa đánh giá → 0)." />
      </div>

      <!-- ② Tính điểm — các trường quyết định điểm -->
      <section class="sec sec--score" :class="{ 'sec--incomplete': missing.length }">
        <div class="sec__head">
          <span class="sec__title">Tính điểm</span>
          <AppTag v-if="missing.length" :label="`Còn thiếu ${missing.length}`" color="warning" />
          <AppTag v-else label="Đủ thông tin tính điểm" color="success" />
        </div>
        <div class="grid">
          <TipField label="Người đưa giải pháp" :tip-items="solutionCriteria(form.solutionBy)" :tip="form.solutionBy ? `Tiêu chí “${form.solutionBy}”:` : 'Chọn BA / PD và BA / PD theo mức đóng góp giải pháp của PD — chọn để xem tiêu chí chi tiết. Chưa chọn → Điểm = 0.'">
            <AppCombobox v-model="form.solutionBy" :options="SOLUTION_ROLES" placeholder="Chọn" :state="st('solutionBy')" />
          </TipField>
          <TipField label="Độ phức tạp thiết kế" :tip-items="complexityCriteria(form.complexity)" :tip="complexityTip(form.complexity)" :tip-note="`${COMPLEXITY_NOTE} ${COMPLEXITY_TIE}`">
            <AppCombobox v-model="form.complexity" :options="COMPLEXITY_OPTIONS" placeholder="Chọn" :state="st('complexity')" />
          </TipField>
          <TipField label="Hệ số nghiệp vụ" :tip="BUSINESS_HINT">
            <AppCombobox v-model="form.businessLevel" :options="BUSINESS_OPTIONS" :clearable="false" />
          </TipField>
          <TipField label="Nền tảng" :tip="platformTip">
            <AppCombobox v-model="form.platform" :options="PLATFORMS" placeholder="Chọn" :state="st('platform')" />
          </TipField>
          <TipField label="Là dự án phụ trách" :tip="`${OWN_PROJECT_HINT} ${ownTip}`">
            <AppCombobox v-model="form.isOwnProject" :options="YES_NO" placeholder="Chọn" :state="st('isOwnProject')" />
          </TipField>
          <TipField label="Màn hình chính" :tip="MAIN_SCREEN_HINT">
            <AppNumberbox v-model="form.mainScreens" :min="0" :state="st('mainScreens')" />
          </TipField>
          <TipField label="Màn hình phụ" :tip="SUB_SCREEN_HINT">
            <AppNumberbox v-model="form.subScreens" :min="0" :state="st('subScreens')" />
          </TipField>
          <TipField label="Ngày hoàn thành" :message="errors.completedDate" :tip="errors.completedDate ? '' : `${COMPLETED_DATE_HINT} Chưa có → chưa được tính vào tháng nào.`">
            <AppDatebox v-model="form.completedDate" :state="st('completedDate', errors.completedDate)" />
          </TipField>
          <TipField label="Mức hài lòng" :tip="`Đánh giá chất lượng thiết kế và phối hợp của PD. ${ratingTip}`">
            <AppCombobox v-model="form.qualityRating" :options="ratingOptions" placeholder="Chưa đánh giá" :state="st('qualityRating')" />
          </TipField>
          <TipField class="span-2" label="Lý do đánh giá" :required="reasonRequired" tip="Bắt buộc điền với mức Không hài lòng, Rất hài lòng." :message="errors.ratingReason">
            <AppTextarea v-model="form.ratingReason" :min-height="40" placeholder="Nhập lý do đánh giá" :state="st('ratingReason', errors.ratingReason)" />
          </TipField>
          <TipField label="Điểm nhập tay" tip="Chỉ dùng cho việc không đếm được màn hình (nghiên cứu, khảo sát…). Có giá trị → bỏ qua công thức, đây chính là Điểm sau đánh giá; khi đó chỉ cần thêm Ngày hoàn thành.">
            <AppNumberbox v-model="form.manualScore" :min="0" decimal :stepper="false" placeholder="Theo công thức" :state="st('manualScore')" />
          </TipField>
        </div>
      </section>

      <!-- ③ Liên kết -->
      <section class="sec">
        <span class="sec__title">Liên kết</span>
        <TipField label="Link thiết kế">
          <AppTextbox v-model="form.designLink" type="url" placeholder="https://www.figma.com/..." :state="st('designLink')" />
        </TipField>
        <TipField label="Link devmode" tip="Tự điền theo Link thiết kế + m=dev (chưa có “?” → ?m=dev, có rồi → &m=dev). Sửa tay được; đã sửa tay thì không bị ghi đè.">
          <AppTextbox v-model="form.devmodeLink" type="url" placeholder="https://www.figma.com/...?m=dev" :state="st('devmodeLink')" />
        </TipField>
      </section>
      </template>
    </div>

    <template #footer>
      <span v-if="readonlyAll" class="footer-note">Bạn chỉ có quyền xem công việc này</span>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">{{ readonlyAll ? 'Đóng' : 'Hủy' }}</button>
      <button v-if="!readonlyAll" class="btn btn--primary" @click="save">Lưu</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { isPdRole } from '../store/scoring.js'
import { fmtNum } from '@mds/utils/number.js'
import { aiEnabled, suggestComplexity } from '../store/ai.js'
import { toast } from '@mds/utils/toast.js'
import { splitPbiContent } from '../store/importCore.js'
import { useDocTitle } from '@mds/utils/docTitle.js'
import { reactive, ref, computed, watch, onMounted, nextTick } from 'vue'
import { focusFirstError } from '@mds/utils/fieldError.js'
import DialogShell  from './DialogShell.vue'
import AppTextbox   from '@mds/components/AppTextbox.vue'
import AppTextarea  from '@mds/components/AppTextarea.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import AppDatebox   from '@mds/components/AppDatebox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import SolutionBriefField from './SolutionBriefField.vue'
import StagePicker  from './StagePicker.vue'
import TipField     from './TipField.vue'
import InfoTip      from './InfoTip.vue'
import AppTag       from '@mds/components/AppTag.vue'
import TIcon        from '@mds/components/TIcon.vue'
import {
  DESIGN_STATUSES, DESIGN_STATUS_OPTIONS, DEFAULT_STATUS, DEFAULT_RATING, OWN_PROJECT_HINT, COMPLEXITIES, PLATFORMS, SOLUTION_ROLES, YES_NO, QUALITY_RATINGS, REASON_REQUIRED,
  COMPLEXITY_NOTE, COMPLEXITY_TIE, complexityTip, COMPLEXITY_OPTIONS, BUSINESS_OPTIONS, BUSINESS_HINT, MAIN_SCREEN_HINT, SUB_SCREEN_HINT, COMPLETED_DATE_HINT, solutionCriteria, complexityCriteria,
  computeScore, computeFinalScore, missingScoreFields, autoDevmodeLink,
} from '../store/scoring.js'
import { performerOptions, db, currentUser, membersOf, canEditField, canAddTask, saveTask, closedDateError, ownProjectFor, projectById, myProjectRole, isManagerOf, userById, baPerformerOptions } from '../store/db.js'
import { STAGES, BA_DEFAULT_STATUS } from '../store/scoring.js'
import { readPref, writePref } from '../store/userPrefs.js'
import { vTip } from '@mds/utils/tooltip.js'

const props = defineProps({
  task:        { type: Object, default: null },   // null → thêm mới
  copyFrom:    { type: Object, default: null },   // nhân bản: thêm mới, điền sẵn thông tin của việc này
  projectId:   { type: String, required: true },
  iterationId: { type: String, required: true },
})
const emit = defineEmits(['close', 'saved'])
/* Tiêu đề tab khi thêm mới: Thêm … | Cha | MISA Solution Point (sửa thì giữ tiêu đề trang) */
useDocTitle(() => (props.task ? [] : ['Thêm công việc', projectById(props.projectId)?.name, 'Dự án']))

const EMPTY = {
  pbi: '', content: '', designLink: '', designStatus: DEFAULT_STATUS, solutionBy: 'PD và BA', devmodeLink: '',
  concept: '', pdId: '', baId: '', expectedDate: '', completedDate: '',
  complexity: 'Trung bình', businessLevel: 'Bình thường', mainScreens: 0, subScreens: 0, isOwnProject: 'Có', platform: 'Web',
  qualityRating: DEFAULT_RATING, ratingReason: '', manualScore: '', solutionBrief: '',
  stage: 'design', baStatus: '', baPoint: '', baDeadline: '', baCompletedDate: '', baExempt: '', baExemptReason: '', baQuality: '',
}
/* Nhân bản: chép thông tin việc gốc, BỎ kết quả của việc cũ (ngày hoàn thành, đánh giá, điểm tay, link phụ), trạng thái về mặc định */
const copied = props.copyFrom ? (({ id, createdAt, createdBy, completedDate, qualityRating, ratingReason, manualScore, designStatus, moreLinks, source, ...rest }) => ({
  ...rest, content: `${String(rest.content ?? '').trim()} (bản sao)`, designStatus: DEFAULT_STATUS, qualityRating: DEFAULT_RATING,
}))(props.copyFrom) : {}
const form = reactive({ ...EMPTY, ...copied, projectId: props.projectId, iterationId: props.iterationId, ...(props.task ?? {}) })
const errors = reactive({})

/* Thêm mới: tự giao cho chính người tạo (PD → ô PD, BA → ô BA), vẫn chọn lại được */
const me = currentUser.value
if (!props.task && !props.copyFrom && me) {
  if (membersOf(props.projectId, 'PD').some(u => u.id === me.id)) {   // người bộ phận PD thêm việc → tự chọn chính mình
    form.pdId = me.id
    form.isOwnProject = ownProjectFor(form.pdId, props.projectId)
  }
  if (membersOf(props.projectId, 'BA').some(u => u.id === me.id)) form.baId = me.id
}
/* ── Giai đoạn: tự gợi ý theo người được giao (cả BA + PD → 2 giai đoạn · chỉ BA → Chỉ phân tích · chỉ PD → Chỉ thiết kế) ── */
let stageTouched = !!props.task || !!props.copyFrom
// Mặc định: BA → Chỉ phân tích · PD → Chỉ thiết kế · vai trò khác → giai đoạn chọn lần gần nhất (chưa có → gợi ý theo người được giao)
const lastStage = readPref('task-stage', '')
if (!stageTouched && (me?.role === 'BA' || isPdRole(me?.role))) { form.stage = me.role === 'BA' ? 'analysis' : 'design'; stageTouched = true }
else if (!stageTouched && STAGES.some(x => x.value === lastStage)) { form.stage = lastStage; stageTouched = true }
function suggestStage() {
  if (stageTouched || form.id) return
  form.stage = form.baId && form.pdId ? 'both' : form.baId ? 'analysis' : 'design'
}
suggestStage()
watch(() => [form.pdId, form.baId], suggestStage)
function pickStage(v) { stageTouched = true; form.stage = v }
const showPdFields = computed(() => !!form.id || form.stage === 'design')
// Nhập điểm BA lúc tạo: Quản trị dự án (PO) hoặc quản lý trực tiếp của BA đã chọn
const canScoreBa = computed(() => myProjectRole(props.projectId) === 'manager' || isManagerOf(currentUser.value, userById(form.baId))
  || (!!form.baId && form.baId === currentUser.value?.id))   // BA tự điền việc của mình

/* Link thiết kế đổi → tự điền Link devmode (thêm m=dev) nếu devmode trống / là bản tự sinh từ link cũ */
watch(() => form.designLink, (n, o) => {
  const dev = autoDevmodeLink(o, n, form.devmodeLink)
  if (dev !== null) form.devmodeLink = dev
})
/* Thêm mới: chọn PD → tự gợi ý "Là dự án phụ trách" theo dự án phụ trách của PD (vẫn sửa tay được) */
watch(() => form.pdId, id => { if (!form.id && id) form.isOwnProject = ownProjectFor(id, props.projectId) })

const pdOptions     = computed(() => performerOptions(props.projectId))
const baOptions     = computed(() => baPerformerOptions(props.projectId))
const statusOptions = DESIGN_STATUS_OPTIONS
const ratingOptions = QUALITY_RATINGS.map(s => s.value)

const score          = computed(() => computeScore(form, db.config))
const finalScore     = computed(() => computeFinalScore(form, db.config))
const missing        = computed(() => missingScoreFields(form, db.config))
const platformTip    = computed(() => PLATFORMS.map(p => `${p}: hệ số ${db.config.platform[p]}`).join(' · ') + ' (1 màn mobile = nửa màn web)')
const ownTip         = computed(() => `Có: hệ số ${db.config.ownProject['Có']} · Không (hỗ trợ dự án khác): hệ số ${db.config.ownProject['Không']}`)
const ratingTip      = computed(() => QUALITY_RATINGS.map(r => `${r.value}: ${r.note}`).join(' · ') + (db.config.unratedCountsAsSatisfied ? '' : ' · Chưa đánh giá: 0 điểm'))
const reasonRequired = computed(() => REASON_REQUIRED.includes(form.qualityRating))

/* Quyền theo trường: thêm mới → người được thêm (Quản trị dự án / Thành viên) nhập được mọi ô thông tin ban đầu */
const editable    = field => (form.id ? canEditField(form, field) : canAddTask(props.projectId))
const readonlyAll = computed(() => Object.keys(EMPTY).every(f => !editable(f)))
const st = (field, err) => !editable(field) ? 'readonly' : (err ? 'error' : 'default')

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.content.trim()) errors.content = 'Nội dung không được để trống'
  if (form.stage === 'design' && !form.pdId) errors.pdId = 'Cần giao cho một PD'
  if (form.stage !== 'design' && !form.baId) errors.baId = 'Cần giao cho một BA phân tích'
  const changedDone = form.completedDate !== (props.task?.completedDate ?? '') || form.pdId !== (props.task?.pdId ?? '')
  if (changedDone && closedDateError(form.completedDate, form.pdId)) errors.completedDate = closedDateError(form.completedDate, form.pdId)
  if (reasonRequired.value && !form.ratingReason.trim()) errors.ratingReason = `Bắt buộc nhập lý do khi đánh giá "${form.qualityRating}"`
  return !Object.keys(errors).length
}

const formEl = ref(null)
/* Thêm mới: con trỏ vào ô Nội dung */
onMounted(async () => { if (!props.task) { await nextTick(); formEl.value?.querySelector('textarea')?.focus() } })
/* Sửa ô nào → lỗi ô đó tự mất (không chờ bấm Lưu lại) */
watch(() => ({ ...form }), (n, o) => { for (const k in errors) if (String(n[k] ?? '') !== String(o[k] ?? '')) delete errors[k] })

/* AI gợi ý độ phức tạp từ Mô tả giải pháp sơ bộ — form thêm mới: độ phức tạp đang trống / đang là mặc định → điền theo gợi ý */
const aiCx = reactive({ loading: false, level: '', reason: '', error: '', key: '' })
const initialComplexity = form.complexity
const briefKey = () => `${String(form.solutionBrief ?? '').trim()}|${form.content}`
async function aiSuggest(force = false) {
  const brief = String(form.solutionBrief ?? '').trim()
  if (!aiEnabled.value || !brief) return
  const key = briefKey()
  if (!force && aiCx.key === key) return
  Object.assign(aiCx, { loading: true, error: '', key })
  try {
    const r = await suggestComplexity({ content: form.content, brief, concept: form.concept })
    if (aiCx.key !== key) return
    Object.assign(aiCx, { level: r.level, business: r.business || '', reason: r.reason })
    if (!form.id && (!form.complexity || form.complexity === initialComplexity)) { form.complexity = r.level; if (r.business) form.businessLevel = r.business }
  } catch (e) { aiCx.error = e.message || 'AI chưa gợi ý được' }
  finally { if (aiCx.key === key) aiCx.loading = false }
}

/* Nội dung bắt đầu bằng mã PBI → tách sang ô PBI (ô PBI đang có mã KHÁC thì giữ nguyên, không đè) */
function splitPbi() {
  const r = splitPbiContent(form.content)
  if (!r) return
  const cur = String(form.pbi ?? '').trim()
  if (cur && cur !== r.pbi) return
  form.pbi = r.pbi; form.content = r.content
  if (!cur) toast.info(`Đã tách mã PBI ${r.pbi} sang ô PBI`)
}
const onContentPaste = () => setTimeout(splitPbi)   // chờ chữ dán vào ô rồi mới tách
function save() {
  splitPbi()
  if (!validate()) return focusFirstError(formEl.value)
  const m = Number(form.manualScore)
  const stageFields = form.id ? {} : form.stage === 'design'
    ? { baStatus: '', baPoint: '', baDeadline: '' }
    : { baStatus: BA_DEFAULT_STATUS, designStatus: '', baPoint: form.baPoint === '' || form.baPoint == null ? '' : Math.max(0, Number(form.baPoint) || 0),
        ...(form.stage === 'analysis' ? { pdId: '' } : {}) }
  if (!form.id && !['BA', 'PD'].includes(me?.role)) writePref('task-stage', form.stage)   // nhớ cho lần thêm sau
  saveTask({ ...form, mainScreens: Number(form.mainScreens) || 0, subScreens: Number(form.subScreens) || 0,
    manualScore: form.manualScore === '' || form.manualScore == null || !Number.isFinite(m) ? '' : m, ...stageFields })
  toast.success(form.id ? 'Cập nhật thành công' : 'Thêm công việc thành công')
  emit('saved')
  emit('close')
}
</script>

<style scoped>
.ai-cx { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; padding: 6px 10px; border-radius: var(--radius-default); background: var(--bg-ai-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.ai-cx > .ti { font-size: 14px; flex-shrink: 0; }
.ai-cx--error { background: var(--bg-danger-light); }
.ai-cx--error > .ti { color: var(--icon-danger); }
.ai-cx__text { flex: 1; min-width: 0; }
.ai-cx .btn { padding: 0; height: auto; }
.ai-cx__spin { animation: ai-cx-spin 0.9s linear infinite; }
@keyframes ai-cx-spin { to { transform: rotate(360deg); } }
/* Cùng bố cục / khoảng cách với drawer Xem chi tiết công việc (TaskDrawer) */
.task-form { display: flex; flex-direction: column; gap: var(--input-group-gap); }
.score-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 6px 12px; border-radius: var(--radius-default);
  background: var(--bg-neutral-light);
  font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary);
}
.score-bar__item strong { margin-left: 4px; font-size: var(--text-body-md); font-weight: var(--fw-bold); color: var(--text-primary); font-feature-settings: 'tnum' 1; }
.score-bar__item .score-bar__final { color: var(--text-brand); }
.score-bar__sep { width: 1px; height: 16px; background: var(--stroke-divider); }
.sec { display: flex; flex-direction: column; gap: 12px; }
.sec__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sec--score { padding: 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.sec--incomplete { background: var(--bg-warning-light); }
.sec__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px var(--form-col-gap-sm); align-items: start; }
.span-2 { grid-column: 1 / -1; }
.half { max-width: calc((100% - var(--form-col-gap-sm)) / 2); }   /* chiếm 1 hàng nhưng chỉ rộng bằng 1 cột */
@media (max-width: 768px) { .half { max-width: none; } }
.footer-note { margin-right: auto; font-size: var(--text-body); color: var(--text-secondary); }
@media (max-width: 768px) { .grid { grid-template-columns: minmax(0, 1fr); } }
</style>
