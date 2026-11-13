<template>
  <AppShell>
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Quy tắc chấm điểm PD</h1>
      </div>
      <div v-if="admin" class="page-header__right">
        <button v-if="!backend.enabled" class="btn btn--outline btn--neutral" @click="confirmReset = true">Nạp lại dữ liệu mẫu</button>
        <button class="btn btn--outline btn--neutral" @click="restoreDefault">Khôi phục mặc định</button>
        <button class="btn btn--primary" :disabled="!dirty" @click="save">Lưu hệ số</button>
      </div>
      <div v-else class="page-header__right">
        <span class="pdp-ro-note"><TIcon name="lock" />Chỉ xem — chỉ Quản trị được sửa quy tắc và hệ số</span>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Quy trình: từ lúc bắt đầu vòng lặp tới khi chốt điểm cuối tháng -->
      <div class="card stack">
        <span class="card-title">Quy trình chấm điểm</span>
        <ol class="pdp-flow">
          <li v-for="(f, i) in FLOW" :key="i" class="pdp-flow__step" :style="{ '--c': f.color }">
            <span class="pdp-flow__dot"><TIcon :name="f.icon" /><span class="pdp-flow__no">{{ i + 1 }}</span></span>
            <span class="pdp-flow__title">{{ f.title }}</span>
            <span class="pdp-flow__who">{{ f.who }}</span>
            <span class="pdp-flow__desc">{{ f.desc }}</span>
          </li>
        </ol>
        <p class="pdp-flow__note"><TIcon name="info-circle" /><span>Điểm tính theo <strong>Ngày hoàn thành</strong>, không theo vòng lặp — việc xong ngày nào được cộng vào tháng của ngày đó, dù nằm ở vòng lặp nào.</span></p>
      </div>

      <!-- Công thức tổng — các mục 1 → 6 bên dưới giải thích từng thành phần theo đúng thứ tự trong công thức -->
      <div class="card stack">
        <span class="card-title">Công thức</span>
        <p class="formula">
          <strong>Điểm</strong> = <a class="f-term" href="#muc-1" @click.prevent="goSec(1)">① Số màn hình quy đổi</a> × <a class="f-term" href="#muc-2" @click.prevent="goSec(2)">② Hệ số độ phức tạp thiết kế × Hệ số nghiệp vụ</a> × <a class="f-term" href="#muc-3" @click.prevent="goSec(3)">③ Hệ số người đưa giải pháp</a>
          × <a class="f-term" href="#muc-4" @click.prevent="goSec(4)">④ Hệ số dự án phụ trách</a> × <a class="f-term" href="#muc-5" @click.prevent="goSec(5)">⑤ Hệ số nền tảng</a>
        </p>
        <p class="formula"><strong>Điểm sau đánh giá</strong> = Điểm × <a class="f-term" href="#muc-6" @click.prevent="goSec(6)">⑥ Hệ số mức hài lòng</a> ({{ cfg.unratedCountsAsSatisfied ? 'chưa đánh giá tính như Hài lòng' : 'chưa đánh giá = 0 điểm' }})</p>
        <p class="formula"><strong>Điểm nhập tay</strong> (PO nhập cho việc không đếm được màn hình như nghiên cứu, khảo sát) — nếu có thì dùng luôn làm Điểm sau đánh giá, bỏ qua công thức.</p>
        <p class="muted">Thiếu một trong các mục ① → ⑤ thì Điểm = 0. Đọc lần lượt các mục bên dưới — mỗi mục gồm quy tắc và hệ số đang áp dụng.</p>
      </div>

      <!-- ① Số màn hình -->
      <div :id="'muc-1'" class="card stack sec-card">
        <span class="card-title"><span class="sec-no">1</span>Số màn hình quy đổi</span>
        <p class="formula"><strong>Số màn hình quy đổi</strong> = Số màn hình chính × {{ n(cfg.mainScreenPoint) }} + Số màn hình phụ × {{ n(cfg.subScreenPoint) }}</p>
        <div class="field-grid coef-grid">
          <AppInput label="Điểm mỗi màn hình chính"><AppNumberbox v-model="cfg.mainScreenPoint" :min="0" :step="0.1" :state="ro" /></AppInput>
          <TipField label="Điểm mỗi màn hình phụ" tip="Quy định: 0,2 màn hình chính"><AppNumberbox v-model="cfg.subScreenPoint" :min="0" :step="0.1" :state="ro" /></TipField>
        </div>
        <span class="sub-title">Quy tắc đếm màn hình</span>
        <ol class="rule-ol">
          <li v-for="(r, i) in SCREEN_RULES" :key="i">{{ r }}
            <!-- Quy tắc màn phụ: định nghĩa chi tiết để PD tự phân biệt màn phụ / màn chính -->
            <div v-if="r.startsWith('Màn phụ')" class="sub-guide">
              <p class="sub-guide__rule">{{ SUB_SCREEN_GUIDE.rule }}</p>
              <div class="sub-guide__cols">
                <div class="sub-guide__col sub-guide__col--yes">
                  <span class="sub-guide__hd"><TIcon name="circle-check" />Tính là màn phụ (× {{ n(cfg.subScreenPoint) }})</span>
                  <ul><li v-for="x in SUB_SCREEN_GUIDE.sub" :key="x">{{ x }}</li></ul>
                </div>
                <div class="sub-guide__col sub-guide__col--no">
                  <span class="sub-guide__hd"><TIcon name="circle-x" />Không phải màn phụ → đếm màn chính</span>
                  <ul><li v-for="x in SUB_SCREEN_GUIDE.main" :key="x">{{ x }}</li></ul>
                </div>
              </div>
              <p class="sub-guide__tip"><TIcon name="bulb" />{{ SUB_SCREEN_GUIDE.tip }}</p>
            </div>
            <!-- Màn có sẵn chỉ sửa / bổ sung: vẫn màn chính + Rất đơn giản, có ví dụ tính theo hệ số đang áp dụng -->
            <div v-if="r.startsWith('Màn có sẵn')" class="sub-guide">
              <p class="sub-guide__rule">{{ EDIT_SCREEN_GUIDE.rule }}</p>
              <div class="sub-guide__col">
                <span class="sub-guide__hd">Cách khai</span>
                <ul><li v-for="x in EDIT_SCREEN_GUIDE.steps" :key="x">{{ x }}</li></ul>
              </div>
              <div class="sub-guide__col">
                <span class="sub-guide__hd">Ví dụ: sửa màn Danh sách khách hàng có sẵn, thêm 2 cột</span>
                <ul>
                  <li>Màn hình chính = 1 · Màn hình phụ = 0 · Độ phức tạp = Rất đơn giản (× {{ n(cfg.complexity['Rất đơn giản']) }})</li>
                  <li>Số màn quy đổi = 1 × {{ n(cfg.mainScreenPoint) }} = {{ n(cfg.mainScreenPoint) }} → nhân Rất đơn giản × {{ n(cfg.complexity['Rất đơn giản']) }} = <strong>{{ n(cfg.mainScreenPoint * cfg.complexity['Rất đơn giản']) }}</strong>, rồi nhân các hệ số còn lại như bình thường</li>
                </ul>
              </div>
              <p class="sub-guide__tip sub-guide__tip--info"><TIcon name="info-circle" />{{ EDIT_SCREEN_GUIDE.why }}</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Độ phức tạp: 4 câu hỏi chọn nhanh — bấm từng câu để mở chi tiết mức tương ứng (tóm tắt · dấu hiệu · ví dụ · hệ số) -->
      <div :id="'muc-2'" class="card stack sec-card">
        <span class="card-title"><span class="sec-no">2</span>Độ phức tạp thiết kế & Hệ số nghiệp vụ — định nghĩa & hệ số</span>
        <!-- Thay đổi từ 11/2026: độ phức tạp đo công THIẾT KẾ, độ khó nghiệp vụ tách thành hệ số phụ -->
        <p class="cx-change"><TIcon name="info-circle" />{{ COMPLEXITY_CHANGE_NOTE }}</p>
        <span class="sub-title">Độ phức tạp thiết kế — phần giao diện PD phải nghĩ & vẽ (không tính độ khó nghiệp vụ, lập trình)</span>
        <!-- Hệ số từng mức (Quản trị sửa ở đây, lưu cùng nút Lưu cấu hình) -->
        <div class="cx-coefs">
          <div v-for="r in COMPLEXITY_RULES" :key="r.value" class="cx-coef" v-tip="r.summary">
            <AppTag :label="r.value" :color="CX_COLOR[r.value]" />
            <AppNumberbox v-model="cfg.complexity[r.value]" :min="0" :step="0.05" :state="ro" />
          </div>
        </div>
        <div class="cx-steps">
          <p class="cx-steps__title"><TIcon name="help-circle" />Trả lời lần lượt, dừng ở câu đầu tiên trả lời <strong>Không</strong> — bấm vào từng câu để xem giải thích chi tiết</p>
          <ol class="cx-steps__list">
            <li v-for="(st, i) in COMPLEXITY_STEPS" :key="i" class="cx-step" :class="{ 'cx-step--open': cxOpen.has(i) }">
              <button type="button" class="cx-step__row" :aria-expanded="cxOpen.has(i)" @click="toggleCx(i)">
                <span class="cx-step__no">{{ i + 1 }}</span>
                <span class="cx-step__q">{{ st.q }}</span>
                <span class="cx-step__ans">
                  <span class="cx-step__ans-k">Không →</span><AppTag :label="st.no" :color="CX_COLOR[st.no]" />
                  <template v-if="st.yes"><span class="cx-step__ans-k">Có →</span><AppTag :label="st.yes" :color="CX_COLOR[st.yes]" /></template>
                </span>
                <TIcon :name="cxOpen.has(i) ? 'chevron-down' : 'chevron-right'" class="cx-step__chev" />
              </button>
              <!-- Chi tiết mức tương ứng -->
              <div v-if="cxOpen.has(i)" class="cx-step__detail">
                <div v-for="r in cxLevels(st)" :key="r.value" class="cx-level">
                  <div class="cx-level__head">
                    <AppTag :label="r.value" :color="CX_COLOR[r.value]" />
                    <span class="cx-level__coef">Hệ số {{ fmtNum(cfg.complexity?.[r.value]) }}</span>
                  </div>
                  <div class="cx-level__body">
                    <p class="cx-level__sum">{{ r.summary }}</p>
                    <ul class="cx-level__list"><li v-for="(c, k) in r.criteria" :key="k">{{ c }}</li></ul>
                    <p class="cx-level__ex"><span>Ví dụ:</span> {{ r.examples.join(' · ') }}</p>
                  </div>
                </div>
              </div>
            </li>
          </ol>
          <p class="muted">{{ COMPLEXITY_TIE }}</p>
        </div>
        <p class="warn"><TIcon name="info-circle" />{{ COMPLEXITY_NOTE }}</p>
        <!-- Hệ số nghiệp vụ: phụ, biên độ nhỏ — ghi nhận công tìm hiểu nghiệp vụ -->
        <span class="sub-title">Hệ số nghiệp vụ — độ khó để hiểu nghiệp vụ (đọc tài liệu, họp làm rõ)</span>
        <div class="biz-grid">
          <div v-for="b in BUSINESS_LEVELS" :key="b.value" class="biz-item">
            <div class="biz-item__hd"><strong>{{ b.value }}</strong><AppNumberbox v-model="cfg.business[b.value]" :min="0" :step="0.05" :state="ro" class="biz-item__num" /></div>
            <span class="muted">{{ b.summary }}</span>
          </div>
        </div>
        <p class="muted">Nghiệp vụ phức tạp nhưng giao diện đơn giản → chọn Độ phức tạp thiết kế theo phần giao diện (VD Đơn giản) + Hệ số nghiệp vụ cao. VD đồng bộ với hệ thống khác chỉ cần màn bật / tắt + nhật ký: Đơn giản × {{ n(cfg.complexity['Đơn giản']) }} × Rất phức tạp {{ n(cfg.business['Rất phức tạp']) }} = × {{ n(Math.round(cfg.complexity['Đơn giản'] * cfg.business['Rất phức tạp'] * 100) / 100) }}.</p>
      </div>

      <!-- ③ Người đưa giải pháp -->
      <div :id="'muc-3'" class="card stack sec-card">
        <span class="card-title"><span class="sec-no">3</span>Người đưa giải pháp thiết kế</span>
        <div v-for="r in SOLUTION_RULES" :key="r.value" class="rule-row">
          <div class="rule-row__key coef-key">
            <span>{{ r.value }}</span>
            <AppNumberbox v-model="cfg.solution[r.value]" :min="0" :step="0.05" :state="ro" />
          </div>
          <ul class="rule-row__list"><li v-for="(c, i) in r.criteria" :key="i">{{ c }}</li></ul>
        </div>
      </div>

      <div class="grid-2">
        <!-- ④ Dự án phụ trách -->
        <div :id="'muc-4'" class="card stack sec-card">
          <span class="card-title"><span class="sec-no">4</span>Là dự án phụ trách</span>
          <p class="rule-text">PD làm việc cho dự án mình phụ trách chọn <strong>Có</strong>; hỗ trợ dự án khác chọn <strong>Không</strong>. Dự án phụ trách của PD đặt ở Người dùng → Dự án tham gia.</p>
          <div class="field-grid">
            <TipField v-for="v in YES_NO" :key="v" :label="v === 'Có' ? 'Có (dự án phụ trách)' : 'Không (hỗ trợ dự án khác)'" :tip="v === 'Không' ? OWN_PROJECT_HINT : ''">
              <AppNumberbox v-model="cfg.ownProject[v]" :min="0" :step="0.05" :state="ro" />
            </TipField>
          </div>
        </div>
        <!-- ⑤ Nền tảng -->
        <div :id="'muc-5'" class="card stack sec-card">
          <span class="card-title"><span class="sec-no">5</span>Nền tảng</span>
          <p class="rule-text">Mobile hệ số {{ n(cfg.platform.Mobile) }}: 1 màn hình mobile tính bằng {{ cfg.platform.Mobile === 0.5 ? 'nửa' : n(cfg.platform.Mobile) + ' lần' }} điểm màn hình thiết kế trên web.</p>
          <div class="field-grid">
            <AppInput v-for="v in PLATFORMS" :key="v" :label="v"><AppNumberbox v-model="cfg.platform[v]" :min="0" :step="0.05" :state="ro" /></AppInput>
          </div>
        </div>
      </div>

      <!-- ⑥ Mức hài lòng -->
      <div :id="'muc-6'" class="card stack sec-card">
        <span class="card-title"><span class="sec-no">6</span>Mức độ hài lòng về chất lượng thiết kế và phối hợp</span>
        <p class="rule-text">BA / PO / PD Lead (của PD thực hiện) đánh giá sau khi PD hoàn thành. Công việc mới mặc định “{{ DEFAULT_RATING }}”.</p>
        <div v-for="r in QUALITY_RATINGS" :key="r.value" class="rule-row">
          <div class="rule-row__key coef-key">
            <AppTag :label="r.value" :color="r.color" />
            <AppNumberbox v-model="cfg.rating[r.value]" :min="0" :step="0.05" :state="ro" />
          </div>
          <span class="rule-text">{{ r.note }}{{ REASON_REQUIRED.includes(r.value) ? ' — bắt buộc nhập lý do' : '' }}</span>
        </div>
      </div>

      <!-- Điểm dẫn dắt — PD Lead (giao việc, review, chốt giải pháp cho PD mình quản lý) -->
      <div id="muc-lead" class="card stack sec-card">
        <span class="card-title"><span class="sec-no sec-no--end"><TIcon name="users" /></span>Điểm dẫn dắt (PD Lead)</span>
        <p class="rule-text"><strong>PD Lead</strong> = quản lý trực tiếp của PD và thuộc bộ phận PD (PO / Quản trị đứng tên quản lý không được tính). Lead vẫn được chấm việc tự vẽ như PD thường, cộng thêm điểm dẫn dắt từ các việc của PD mình quản lý có Ngày hoàn thành trong tháng mà Lead có tham gia. Mỗi việc chọn <strong>Vai trò của Lead</strong>: Không tham gia (mặc định, VD PO giao thẳng cho PD) · Giao việc & review · Chốt giải pháp — Lead tự chọn ở chi tiết công việc hoặc chọn hàng loạt ở Tổng hợp điểm → tên mình → tab Dẫn dắt.</p>
        <p class="formula"><strong>Điểm dẫn dắt</strong> = Σ Điểm sau đánh giá của việc PD mình quản lý × tỷ lệ theo vai trò (Không tham gia 0 · Giao việc & review {{ pctOf(cfg.lead.review) }} · Chốt giải pháp {{ pctOf(cfg.lead.solution) }}) — PD có nhiều Lead thì chia đều &nbsp;·&nbsp; <strong>Điểm tháng của Lead</strong> = điểm tự vẽ + điểm dẫn dắt</p>
        <div class="field-grid">
          <TipField label="Giao việc & review" tip="Việc chọn Vai trò của Lead = Giao việc & review (mặc định 0,1 = 10%)">
            <AppNumberbox v-model="cfg.lead.review" :min="0" :max="1" :step="0.05" :state="ro" />
          </TipField>
          <TipField label="Chốt giải pháp" tip="Việc chọn Vai trò của Lead = Chốt giải pháp (mặc định 0,2 = 20%)">
            <AppNumberbox v-model="cfg.lead.solution" :min="0" :max="1" :step="0.05" :state="ro" />
          </TipField>
        </div>
        <p class="muted">Lead chốt giải pháp thì PD vẽ theo không bị trừ điểm: hệ số Người đưa giải pháp của PD tính tối thiểu như “PD và BA” (× {{ n(cfg.solution['PD và BA']) }}). Việc Lead quản lý họp, kèm người mới… không quy ra điểm — giảm Effort (%) khi chốt để điểm kỳ vọng của Lead tương ứng.</p>
      </div>

      <!-- Cuối luồng: điểm vào tháng nào, chốt điểm, kỳ vọng -->
      <div class="card stack">
        <span class="card-title"><span class="sec-no sec-no--end"><TIcon name="lock" /></span>Tính điểm tháng & chốt điểm</span>
        <p class="formula"><strong>Điểm tháng của PD</strong> = Tổng Điểm sau đánh giá của các công việc có Ngày hoàn thành trong tháng (ở tất cả dự án PD tham gia). Điểm được chốt theo từng PD: quản lý trực tiếp chốt cho PD mình quản lý tại màn Tổng hợp điểm, tự điền nghỉ lễ / ngày làm thực tế / effort (Quản trị chốt được mọi PD); sau khi chốt, bảng điểm tháng của PD được giữ nguyên và công việc tương ứng bị khóa cho tới khi mở chốt.</p>
        <p class="formula"><strong>Điểm kỳ vọng</strong> = Effort (%) × Điểm kỳ vọng level × Số ngày làm việc thực tế ÷ Số ngày làm việc của tháng ÷ 100 &nbsp;·&nbsp; <strong>Tỷ lệ đạt</strong> = Điểm ÷ Điểm kỳ vọng × 100 (làm tròn)</p>
        <p class="formula"><strong>Số ngày làm việc của tháng</strong> = Số ngày từ thứ 2 đến thứ 6 trong tháng − Số ngày nghỉ lễ</p>
        <span class="sub-title">Trạng thái thiết kế được tính điểm</span>
        <p class="muted">Mặc định tính mọi trạng thái — chỉ lọc theo Ngày hoàn thành.</p>
        <div class="status-list">
          <AppCheckbox v-for="s in DESIGN_STATUSES" :key="s.value" v-model="cfg.countedStatuses" :value="s.value" :label="s.value" :disabled="!admin" />
        </div>
        <span class="sub-title">Ý nghĩa các trạng thái thiết kế</span>
        <ul class="rule-ol status-desc"><li v-for="s in DESIGN_STATUSES" :key="s.value"><strong>{{ s.value }}</strong>: {{ s.desc }}</li></ul>
        <AppCheckbox v-model="cfg.unratedCountsAsSatisfied" label="Công việc chưa đánh giá vẫn được tính điểm như Hài lòng (mặc định: chưa đánh giá = 0 điểm)" :disabled="!admin" />
      </div>

      <!-- Câu hỏi thường gặp: hướng dẫn chấm các trường hợp đặc biệt (chỉ hướng dẫn, app không tự áp dụng) -->
      <div class="card stack">
        <span class="card-title">Câu hỏi thường gặp</span>
        <div class="pdp-faq">
          <details v-for="(f, i) in faqs" :key="i" class="pdp-faq__item">
            <summary class="pdp-faq__q"><TIcon name="chevron-right" class="pdp-faq__chev" /><span>{{ f.q }}</span></summary>
            <div class="pdp-faq__a">
              <p v-for="(line, j) in f.a" :key="j">{{ line }}</p>
            </div>
          </details>
        </div>
      </div>
    </div>

    <ConfirmDialog v-if="confirmReset" title="Nạp lại dữ liệu mẫu" confirm-label="Nạp lại"
      message="Toàn bộ người dùng, dự án, vòng lặp, công việc, lịch sử, bảng điểm đã chốt và hệ số hiện tại sẽ bị thay bằng dữ liệu mẫu ban đầu."
      @cancel="confirmReset = false" @confirm="onResetData" />
  </AppShell>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { fmtNum } from '@mds/utils/number.js'
import { ref, computed, watch } from 'vue'
import AppShell      from '../components/AppShell.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import TIcon        from '@mds/components/TIcon.vue'
import AppTag       from '@mds/components/AppTag.vue'
import AppInput     from '@mds/components/AppInput.vue'
import TipField     from '../components/TipField.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import AppCheckbox  from '@mds/components/AppCheckbox.vue'
import { db, isAdmin, saveConfig, resetDemoData, myDeptAdmin } from '../store/db.js'
import { backend } from '../store/api.js'
import {
  DEFAULT_CONFIG, UNCONFIRMED_KEYS, DESIGN_STATUSES, COMPLEXITY_RULES, BUSINESS_LEVELS, COMPLEXITY_CHANGE_NOTE, COMPLEXITY_NOTE, COMPLEXITY_STEPS, COMPLEXITY_TIE, SOLUTION_RULES,
  SCREEN_RULES, SUB_SCREEN_GUIDE, EDIT_SCREEN_GUIDE, PLATFORMS, QUALITY_RATINGS, REASON_REQUIRED, YES_NO, OWN_PROJECT_HINT, DEFAULT_RATING,
  SCORING_FLOW as FLOW, scoringFaqs,
} from '../store/scoring.js'

const admin = computed(() => isAdmin() || myDeptAdmin() === 'PD')   // Quản trị hệ thống / Quản trị PD sửa hệ số PD
// Màu nhãn theo mức độ phức tạp (nhạt → đậm dần)
const CX_COLOR = { 'Rất đơn giản': 'neutral', 'Đơn giản': 'success', 'Trung bình': 'brand', 'Phức tạp': 'warning', 'Rất phức tạp': 'danger' }
// Hệ số độ phức tạp nằm chung khối Định nghĩa độ phức tạp (không lặp ở nhóm hệ số)
// Câu hỏi chọn độ phức tạp đang mở chi tiết · mức ứng với từng câu (câu cuối: cả “Không” lẫn “Có”)
const cxOpen = ref(new Set())
const toggleCx = i => { const n = new Set(cxOpen.value); n.has(i) ? n.delete(i) : n.add(i); cxOpen.value = n }
const cxLevels = st => [st.no, st.yes].filter(Boolean).map(v => COMPLEXITY_RULES.find(r => r.value === v)).filter(Boolean)
// Bấm số ①–⑥ ở Công thức → cuộn tới mục tương ứng và nháy sáng viền
function goSec(i) {
  const el = document.getElementById(`muc-${i}`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.classList.remove('sec-card--flash'); void el.offsetWidth; el.classList.add('sec-card--flash')
}
const ro    = computed(() => (admin.value ? 'default' : 'readonly'))
const clone = o => JSON.parse(JSON.stringify(o))

/* Cấu hình cũ chưa có hệ số Lead → điền mặc định để ô nhập có giá trị */
const withDefaults = o => ({ ...o, lead: { ...DEFAULT_CONFIG.lead, ...(o.lead ?? {}) } })
const cfg = ref(withDefaults(clone(db.config)))
const pctOf = v => fmtNum(Math.round((Number(v) || 0) * 1000) / 10) + '%'

/* Câu hỏi thường gặp — hướng dẫn người chấm / người đánh giá, hệ số lấy theo cấu hình hiện tại */
const n = v => fmtNum(v)

const faqs = computed(() => scoringFaqs(cfg.value))
watch(() => db.config, v => { cfg.value = withDefaults(clone(v)) })
const dirty = computed(() => JSON.stringify(cfg.value) !== JSON.stringify(withDefaults(clone(db.config))))


function save() {
  const fix = o => { for (const k in o) { if (typeof o[k] === 'object' && !Array.isArray(o[k])) fix(o[k]); else if (typeof o[k] === 'number' && isNaN(o[k])) o[k] = 0 } }
  fix(cfg.value)
  saveConfig(cfg.value)
}
function restoreDefault() { cfg.value = { ...clone(DEFAULT_CONFIG), ...(cfg.value.ba ? { ba: cfg.value.ba } : {}) } }   // giữ hệ số BA (trang Quy tắc chấm điểm BA)

const confirmReset = ref(false)
function onResetData() { resetDemoData(); confirmReset.value = false }
</script>

<style scoped src="../styles/rulePage.css"></style>

<style scoped>
/* Định nghĩa màn phụ (quy tắc 4) */
.sub-guide { display: flex; flex-direction: column; gap: 10px; margin: 8px 0 4px; padding: 12px 14px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.sub-guide__rule { margin: 0; color: var(--text-primary); font-weight: var(--fw-medium); }
.sub-guide__cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 720px) { .sub-guide__cols { grid-template-columns: minmax(0, 1fr); } }
.sub-guide__col { padding: 10px 12px; border-radius: var(--radius-default); background: var(--bg-white); border: 1px solid var(--stroke-neutral-light); }
.sub-guide__col ul { margin: 6px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
.sub-guide__hd { display: inline-flex; align-items: center; gap: 6px; font-weight: var(--fw-semibold); }
.sub-guide__col--yes .sub-guide__hd { color: var(--text-success); }
.sub-guide__col--no .sub-guide__hd { color: var(--text-danger); }
.sub-guide__tip { margin: 0; display: flex; gap: 6px; align-items: flex-start; color: var(--text-secondary); }
.sub-guide__tip .ti { flex-shrink: 0; margin-top: 2px; color: var(--icon-warning); }
.sub-guide__tip--info .ti { color: var(--icon-info); }
/* Độ phức tạp PD: hệ số 5 mức + 4 câu hỏi chọn mức */
.cx-change { display: flex; gap: 8px; align-items: flex-start; margin: 0; padding: 10px 12px; border-radius: var(--radius-default); background: var(--bg-info-light); color: var(--text-primary); }
.cx-change .ti { flex-shrink: 0; margin-top: 2px; color: var(--icon-info); }
.biz-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--form-col-gap-sm); }
@media (max-width: 720px) { .biz-grid { grid-template-columns: minmax(0, 1fr); } }
.biz-item { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border-radius: var(--radius-default); border: 1px solid var(--stroke-neutral-light); }
.biz-item__hd { display: flex; flex-direction: column; align-items: stretch; gap: 6px; }
.biz-item__num { width: 100%; }
.cx-coefs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--form-col-gap-sm); }
.cx-coef { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; min-width: 0; }
.cx-coef > :last-child { width: 100%; }
@media (max-width: 720px) { .cx-coefs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.cx-steps { display: flex; flex-direction: column; gap: 8px; padding: var(--box-padding); border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.cx-steps__title { display: flex; align-items: center; gap: 6px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.cx-steps__title .ti { font-size: 16px; color: var(--icon-brand); }
.cx-steps__list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
.cx-step { border-radius: var(--radius-default); background: var(--bg-white); overflow: hidden; }
.cx-step__row { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto 16px; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border: none; background: none; font-family: inherit; text-align: left; cursor: pointer; }
.cx-step__row:hover { background: var(--bg-brand-light); }
.cx-step--open .cx-step__row { background: var(--bg-brand-light); }
.cx-step__chev { font-size: 16px; color: var(--icon-neutral); }
.cx-step__detail { padding: 4px 16px 8px 46px; border-top: 1px solid var(--stroke-divider); }
.cx-step__no { width: 22px; height: 22px; border-radius: var(--radius-pill); background: var(--bg-brand); color: #fff; font-size: var(--text-body); font-weight: var(--fw-semibold); display: inline-flex; align-items: center; justify-content: center; }
.cx-step__q { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.cx-step__ans { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.cx-step__ans-k { font-size: var(--text-body); color: var(--text-secondary); }
.cx-level { display: grid; grid-template-columns: 160px minmax(0, 1fr); gap: 16px; padding: 14px 0; border-top: 1px solid var(--stroke-divider); }
.cx-level:first-child { border-top: none; padding-top: 4px; }
.cx-level__head { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.cx-level__body { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
@media (max-width: 720px) { .cx-level { grid-template-columns: minmax(0, 1fr); gap: 8px; } }
.cx-level__coef { font-size: var(--text-body); color: var(--text-secondary); }
.cx-level__sum { font-size: var(--text-body); font-weight: var(--fw-semibold); line-height: var(--text-body-lh); color: var(--text-primary); }
.cx-level__list { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 2px; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.cx-level__ex { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.cx-level__ex span { font-weight: var(--fw-semibold); }
</style>
