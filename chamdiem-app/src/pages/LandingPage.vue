<template>
  <!-- Trang giới thiệu công khai (không cần đăng nhập): hệ thống chấm điểm PD / BA · quy tắc · chấm thử · đăng nhập / đăng ký
       Bố cục: Hero (chữ + bảng điểm mẫu) → Cách hoạt động → Quy tắc (tab PD | BA) → Chấm thử → Hỏi đáp → Kêu gọi -->
  <div ref="rootEl" class="lp" :class="{ 'lp--reveal': revealOn }">
    <!-- Nền liquid glass: mảng màu loang mờ (thương hiệu · BA · PD) trôi chậm phía sau lớp kính -->
    <div class="lp-bg" aria-hidden="true">
      <i class="lp-blob lp-blob--1" /><i class="lp-blob lp-blob--2" /><i class="lp-blob lp-blob--3" />
      <i class="lp-blob lp-blob--4" /><i class="lp-blob lp-blob--5" /><i class="lp-blob lp-blob--6" />
    </div>
    <header class="lp-nav">
      <div class="lp-wrap lp-nav__inner">
        <a class="lp-brand" href="#top" @click.prevent="scrollTo('top')">
          <img src="/logo.svg" width="32" height="32" alt="" />
          <span>{{ APP_NAME }}</span>
        </a>
        <nav class="lp-nav__links" aria-label="Mục lục">
          <a v-for="l in NAV" :key="l.id" :href="`#${l.id}`" :class="{ 'is-active': activeId === l.id }" :aria-current="activeId === l.id ? 'true' : undefined" @click.prevent="scrollTo(l.id)"><span v-if="l.ava" class="lp-nav__ava border-beam-round border-beam-round--hover"><IconMisaAI /></span>{{ l.label }}</a>
        </nav>
        <div class="lp-nav__actions">
          <router-link v-if="signedIn" class="btn btn--primary" to="/">Vào ứng dụng<TIcon name="arrow-right" /></router-link>
          <template v-else>
            <!-- Dùng thử: bản demo riêng (dữ liệu mẫu, không cần đăng nhập) — chỉ hiện khi máy chủ cấu hình DEMO_URL -->
            <!-- Thứ tự: Dùng thử (primary) → Đăng ký → Đăng nhập; chưa bật bản dùng thử thì Đăng ký là primary -->
            <a v-if="demoUrl" class="btn btn--primary lp-demo-btn" :href="demoUrl"><TIcon name="player-play" />Dùng thử</a>
            <router-link class="btn" :class="demoUrl ? 'btn--outline' : 'btn--primary'" to="/dang-ky">Đăng ký</router-link>
            <router-link class="btn btn--outline" :class="{ 'btn--neutral': demoUrl }" to="/dang-nhap">Đăng nhập</router-link>
          </template>
        </div>
      </div>
    </header>

    <main id="top">
      <!-- ① Hero -->
      <section class="lp-hero">
        <!-- Banner: tấm kính màu bo góc lớn, tách hẳn khỏi các section bên dưới -->
        <div class="lp-wrap"><div class="lp-hero__panel"><div class="lp-hero__grid">
          <div>
            <span class="lp-eyebrow"><TIcon name="sparkles" />Hệ thống chấm điểm cho PD &amp; BA</span>
            <h1 class="lp-hero__title">
              <!-- 2 từ nhấn mạnh tô màu thương hiệu -->
              <span class="lp-nowrap">Mỗi công việc đều có <span class="lp-hl lp-tw"><span class="lp-tw__ghost">điểm</span><span class="lp-tw__live" aria-hidden="true">{{ twText[0] }}<i v-if="twCaret === 0" class="lp-tw__caret" /></span></span>,</span><br class="lp-br" />{{ ' ' }}<span class="lp-nowrap">mỗi điểm đều có <span class="lp-hl lp-hl--2 lp-tw"><span class="lp-tw__ghost">lý do</span><span class="lp-tw__live" aria-hidden="true">{{ twText[1] }}<i v-if="twCaret === 1" class="lp-tw__caret" /></span></span>.</span>
            </h1>
            <p class="lp-hero__lead">Ghi nhận công việc thiết kế và phân tích theo vòng lặp, tự tính điểm theo một bộ quy tắc chung, chốt điểm minh bạch mỗi tháng.</p>
            <div class="lp-hero__cta">
              <router-link v-if="signedIn" class="btn btn--primary btn--lg" to="/">Vào ứng dụng<TIcon name="arrow-right" /></router-link>
              <template v-else>
                <a v-if="demoUrl" class="btn btn--primary btn--lg lp-demo-btn" :href="demoUrl"><TIcon name="player-play" />Dùng thử không cần đăng nhập</a>
                <router-link class="btn btn--lg" :class="demoUrl ? 'btn--outline' : 'btn--primary'" to="/dang-ky">Đăng ký tài khoản</router-link>
                <router-link class="btn btn--outline btn--lg" :class="{ 'btn--neutral': demoUrl }" to="/dang-nhap">Đăng nhập</router-link>
              </template>
            </div>
            <ul class="lp-hero__points">
              <li v-for="v in VALUES" :key="v"><TIcon name="circle-check" />{{ v }}</li>
            </ul>
          </div>

          <!-- Bảng điểm mẫu (minh họa): tự chuyển qua lại ví dụ PD ↔ BA · rê chuột để dừng · bấm PD / BA để xem ngay -->
          <div class="lp-mock-wrap" @mouseenter="mockPaused = true" @mouseleave="mockPaused = false">
            <div class="lp-mock-switch" role="tablist" aria-label="Ví dụ bảng điểm">
              <button v-for="(m, i) in MOCKS" :key="m.role" type="button" role="tab" class="lp-mock-switch__btn" :class="[`lp-mock-switch__btn--${m.role.toLowerCase()}`, { 'is-on': mockIndex === i }]"
                :aria-selected="mockIndex === i" @click="showMock(i)">
                <i />Ví dụ {{ m.role }}
                <span v-if="mockIndex === i && !mockPaused" :key="mockTick" class="lp-mock-switch__timer" />
              </button>
            </div>
            <div class="lp-mock" :class="`lp-mock--${mock.role.toLowerCase()}`">
              <Transition name="lp-mock" mode="out-in">
                <div :key="mock.role" class="lp-mock__body">
                  <div class="lp-mock__head">
                    <span class="lp-mock__avatar">{{ mock.initials }}</span>
                    <div class="lp-mock__who"><b>{{ mock.name }}</b><span>{{ mock.sub }}</span></div>
                    <span class="lp-mock__badge">Đã chốt</span>
                  </div>
                  <div class="lp-mock__rows">
                    <div v-for="(r, i) in mock.rows" :key="r.name" class="lp-mock__row" :style="{ animationDelay: `${120 + i * 90}ms` }">
                      <span class="lp-mock__name">{{ r.name }}</span>
                      <span class="lp-mock__meta">{{ r.meta }}</span>
                      <span class="lp-mock__pts">{{ r.pts }}</span>
                    </div>
                  </div>
                  <div class="lp-mock__total">
                    <div><span>{{ mock.totalLabel }}</span><b>{{ num(mockCount) }}</b></div>
                    <div class="lp-mock__bar"><i :style="{ width: barOn ? `${mock.pct}%` : '0%' }" /></div>
                    <span class="lp-mock__target">{{ mock.pct }}% điểm kỳ vọng ({{ mock.target }})</span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div></div></div>
      </section>

      <!-- ③ Quy tắc chấm điểm: tab PD | BA -->
      <section id="quy-tac" class="lp-sec lp-sec--white">
        <div class="lp-wrap">
          <div class="lp-head">
            <span class="lp-kicker"><span class="lp-kicker__no">01</span>Quy tắc chấm điểm</span>
            <h2>Công thức rõ ràng, hệ số công khai</h2>
            <p>Hệ số dưới đây là hệ số đang áp dụng — Quản trị điều chỉnh thì trang tự cập nhật.</p>
          </div>
          <div class="lp-seg" role="tablist" aria-label="Quy tắc của">
            <button v-for="t in ROLE_TABS" :key="t.id" type="button" role="tab" class="lp-seg__btn" :class="[`lp-seg__btn--${t.id.toLowerCase()}`, { 'lp-seg__btn--on': ruleRole === t.id }]"
              :aria-selected="ruleRole === t.id" @click="ruleRole = t.id">{{ t.label }}</button>
          </div>

          <!-- PD -->
          <template v-if="ruleRole === 'PD'">
            <div class="lp-eq">
              <template v-for="(f, i) in PD_EQ.slice(0, -1)" :key="f.label">
                <span v-if="i" class="lp-eq__op">{{ f.op }}</span>
                <span class="lp-eq__box"><b>{{ f.label }}</b><small>{{ f.sub }}</small></span>
              </template>
              <span class="lp-eq__end"><span class="lp-eq__op">=</span><span class="lp-eq__box lp-eq__box--result"><b>{{ PD_EQ.at(-1).label }}</b><small>{{ PD_EQ.at(-1).sub }}</small></span></span>
            </div>
            <p class="lp-eq__note">Điểm tháng của PD = tổng <b>Điểm sau đánh giá</b> các công việc có Ngày hoàn thành trong tháng, ở mọi dự án tham gia.</p>
            <div class="lp-factors">
              <div v-for="f in pdFactors" :key="f.title" class="lp-factor">
                <div class="lp-factor__head"><span class="lp-factor__icon"><TIcon :name="f.icon" /></span><h3>{{ f.title }}</h3></div>
                <p>{{ f.desc }}</p>
                <dl class="lp-opts">
                  <template v-for="o in f.opts" :key="o.k"><dt v-tip="o.tip">{{ o.k }}</dt><dd>{{ o.v }}</dd></template>
                </dl>
              </div>
            </div>
          </template>

          <!-- BA -->
          <template v-else>
            <div class="lp-eq">
              <template v-for="(f, i) in baEq.slice(0, -1)" :key="f.label">
                <span v-if="i" class="lp-eq__op">{{ f.op }}</span>
                <span class="lp-eq__box lp-eq__box--ba"><b>{{ f.label }}</b><small>{{ f.sub }}</small></span>
              </template>
              <span class="lp-eq__end"><span class="lp-eq__op">=</span><span class="lp-eq__box lp-eq__box--result"><b>{{ baEq.at(-1).label }}</b><small>{{ baEq.at(-1).sub }}</small></span></span>
            </div>
            <p class="lp-eq__note">Điểm tháng của BA = tổng <b>Điểm thực nhận</b> các Work Item có Ngày hoàn thành thực tế trong tháng.</p>
            <div class="lp-factors lp-factors--3">
              <div v-for="f in baFactors" :key="f.title" class="lp-factor">
                <div class="lp-factor__head"><span class="lp-factor__icon lp-factor__icon--ba"><TIcon :name="f.icon" /></span><h3>{{ f.title }}</h3></div>
                <p>{{ f.desc }}</p>
                <dl v-if="f.opts" class="lp-opts">
                  <template v-for="o in f.opts" :key="o.k"><dt>{{ o.k }}</dt><dd>{{ o.v }}</dd></template>
                </dl>
                <ul v-else class="lp-bullets"><li v-for="b in f.bullets" :key="b">{{ b }}</li></ul>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- ④ Chấm thử -->
      <section id="cham-thu" class="lp-sec lp-sec--gray">
        <div class="lp-wrap">
          <div class="lp-head">
            <span class="lp-kicker"><span class="lp-kicker__no">02</span>Chấm thử</span>
            <h2>Nhập thử một công việc, xem điểm được tính ra sao</h2>
            <p>Tính ngay trên trình duyệt theo hệ số đang áp dụng — không lưu lại.</p>
          </div>
          <div class="lp-seg" role="tablist" aria-label="Chấm thử cho">
            <button v-for="t in ROLE_TABS" :key="t.id" type="button" role="tab" class="lp-seg__btn" :class="[`lp-seg__btn--${t.id.toLowerCase()}`, { 'lp-seg__btn--on': calcRole === t.id }]"
              :aria-selected="calcRole === t.id" @click="calcRole = t.id">{{ t.id === 'PD' ? 'Công việc thiết kế (PD)' : 'Work Item phân tích (BA)' }}</button>
          </div>
          <div class="lp-calc">
            <div class="lp-calc__form">
              <div class="lp-examples">
                <span>Ví dụ nhanh</span>
                <template v-if="calcRole === 'PD'"><button v-for="e in PD_EXAMPLES" :key="e.label" type="button" class="lp-chip" @click="Object.assign(pd, e.v)">{{ e.label }}</button></template>
                <template v-else><button v-for="e in BA_EXAMPLES" :key="e.label" type="button" class="lp-chip" @click="Object.assign(baCalc, e.v)">{{ e.label }}</button></template>
              </div>
              <div v-if="calcRole === 'PD'" class="lp-fields">
                <AppInput label="Màn hình chính"><AppNumberbox v-model="pd.mainScreens" :min="0" /></AppInput>
                <AppInput label="Màn hình phụ"><AppNumberbox v-model="pd.subScreens" :min="0" /></AppInput>
                <AppInput label="Độ phức tạp thiết kế"><AppCombobox v-model="pd.complexity" :options="opts(cfg.complexity)" :clearable="false" /></AppInput>
                <AppInput label="Hệ số nghiệp vụ"><AppCombobox v-model="pd.businessLevel" :options="opts(cfg.business ?? DEFAULT_CONFIG.business)" :clearable="false" /></AppInput>
                <AppInput label="Người đưa giải pháp"><AppCombobox v-model="pd.solutionBy" :options="opts(cfg.solution)" :clearable="false" /></AppInput>
                <AppInput label="Nền tảng"><AppCombobox v-model="pd.platform" :options="opts(cfg.platform)" :clearable="false" /></AppInput>
                <AppInput label="Là dự án phụ trách"><AppCombobox v-model="pd.isOwnProject" :options="opts(cfg.ownProject)" :clearable="false" /></AppInput>
                <AppInput label="Mức hài lòng" class="lp-fields__full"><AppCombobox v-model="pd.qualityRating" :options="opts(cfg.rating)" :clearable="false" /></AppInput>
              </div>
              <div v-else class="lp-fields">
                <AppInput label="BA Point"><AppNumberbox v-model="baCalc.point" :min="0" :step="0.5" /></AppInput>
                <AppInput label="Tiến độ"><AppCombobox v-model="baCalc.progress" :options="PROGRESS_OPTIONS" :clearable="false" /></AppInput>
                <AppInput label="Kết quả chất lượng" class="lp-fields__full"><AppCombobox v-model="baCalc.quality" :options="baQualityOptions" :clearable="false" /></AppInput>
              </div>
            </div>
            <div class="lp-calc__out">
              <div class="lp-calc__steps">
                <div v-for="s in steps.slice(0, -1)" :key="s.label" class="lp-out">
                  <div><span class="lp-out__label">{{ s.label }}</span><span class="lp-out__how">{{ s.how }}</span></div>
                  <span class="lp-out__value">{{ s.value }}</span>
                </div>
              </div>
              <div class="lp-result">
                <span>{{ steps.at(-1).label }}</span>
                <b>{{ steps.at(-1).value }}</b>
                <small>{{ steps.at(-1).how }}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ⑤ Trợ lý AVA: giới thiệu khả năng hỏi đáp / hướng dẫn · khung chat mô phỏng tự chạy -->
      <section id="tro-ly-ava" class="lp-sec lp-sec--dark">
        <div class="lp-wrap lp-ava">
          <div class="lp-ava__text">
            <span class="lp-kicker"><span class="lp-kicker__no">03</span>Trợ lý AVA</span>
            <h2>Thắc mắc gì về chấm điểm, hỏi AVA</h2>
            <p class="lp-ava__lead">AVA là trợ lý AI có sẵn trong ứng dụng — trả lời ngay theo đúng quy tắc và hệ số đang áp dụng, hướng dẫn từng bước khi bạn chưa biết làm.</p>
            <ul class="lp-ava__caps">
              <li v-for="c in AVA_CAPS" :key="c.title">
                <span class="lp-ava__cap-icon"><TIcon :name="c.icon" /></span>
                <div><b>{{ c.title }}</b><span>{{ c.text }}</span></div>
              </li>
            </ul>
            <p class="lp-ava__hint"><TIcon name="info-circle" />Sau khi đăng nhập, bấm biểu tượng AVA trên thanh trên cùng để hỏi.</p>
          </div>

          <!-- Khung chat mô phỏng: hỏi → AVA đang gõ → trả lời từng chữ, xoay vòng các ví dụ -->
          <div class="lp-chat" aria-hidden="true">
            <div class="lp-chat__head">
              <span class="lp-chat__logo border-beam-round border-beam-round--on"><IconMisaAI /></span>
              <div><b>AVA</b><span><i class="lp-chat__online" />Trợ lý chấm điểm · luôn sẵn sàng</span></div>
            </div>
            <div class="lp-chat__body">
              <Transition name="lp-chat" mode="out-in">
                <div :key="avaIndex" class="lp-chat__pair">
                  <div class="lp-chat__msg lp-chat__msg--me"><div class="lp-chat__bubble">{{ avaDemo.q }}</div></div>
                  <div class="lp-chat__msg lp-chat__msg--ava">
                    <span class="lp-chat__av"><IconMisaAI /></span>
                    <div class="lp-chat__bubble">
                      <span v-if="avaTyping" class="lp-chat__dots"><i /><i /><i /></span>
                      <template v-else>{{ avaShown }}<span v-if="avaShown.length < avaDemo.a.length" class="lp-chat__caret" /></template>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
            <div class="lp-chat__suggest">
              <button v-for="(d, i) in AVA_DEMOS" :key="d.q" type="button" class="lp-chat__chip" :class="{ 'is-on': avaIndex === i }" @click="playAva(i)"><TIcon name="sparkles" />{{ d.short }}</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ⑥ Kêu gọi + chân trang -->
      <section class="lp-sec lp-sec--last lp-sec--white">
        <div class="lp-wrap">
          <div class="lp-final">
            <div>
              <h2>Sẵn sàng ghi nhận công việc của bạn?</h2>
              <p>Đăng ký bằng mã nhân viên — Quản trị duyệt và gán vai trò, dự án cho bạn.</p>
            </div>
            <div class="lp-final__cta">
              <router-link v-if="signedIn" class="btn btn--lg lp-btn-light" to="/">Vào ứng dụng</router-link>
              <template v-else>
                <a v-if="demoUrl" class="btn btn--lg lp-btn-light" :href="demoUrl"><TIcon name="player-play" />Dùng thử</a>
                <router-link class="btn btn--lg" :class="demoUrl ? 'lp-btn-ghost' : 'lp-btn-light'" to="/dang-ky">Đăng ký</router-link>
                <router-link class="btn btn--lg lp-btn-ghost" to="/dang-nhap">Đăng nhập</router-link>
              </template>
            </div>
          </div>
          <footer class="lp-foot">
            <span>© {{ year }} {{ APP_NAME }}</span>
            <router-link to="/cai-chung-chi"><TIcon name="lock" />Trình duyệt báo không an toàn? Cài chứng chỉ HTTPS</router-link>
          </footer>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { fmtNum } from '@mds/utils/number.js'
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import TIcon        from '@mds/components/TIcon.vue'
import AppInput     from '@mds/components/AppInput.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import { vTip }     from '@mds/utils/tooltip.js'
import IconMisaAI   from '@mds/components/IconMisaAI.vue'
import { APP_NAME } from '../store/app.js'
import { backend, fetchPublicRules } from '../store/api.js'
import { db } from '../store/db.js'
import { DEFAULT_CONFIG, COMPLEXITY_RULES, BUSINESS_LEVELS, QUALITY_RATINGS, computeScore, computeFinalScore, businessFactor } from '../store/scoring.js'
import { baConfigOf, baWorkItemScore, BA_QUALITY_LEVELS } from '../store/baScoring.js'

const signedIn = computed(() => backend.enabled && backend.user?.status === 'active')
const demoUrl = computed(() => backend.publicConfig?.demoUrl || '')
const year = new Date().getFullYear()

/* Hệ số đang áp dụng: máy chủ (công khai) → không có thì cấu hình đang có / mặc định */
const cfg = ref({ ...DEFAULT_CONFIG, ...(db.config ?? {}) })
const ba = computed(() => baConfigOf(cfg.value))
onMounted(async () => {
  if (!backend.enabled) return
  try { const r = await fetchPublicRules(); if (r?.config) cfg.value = { ...DEFAULT_CONFIG, ...r.config } } catch { /* giữ mặc định */ }
})
const num = v => (v == null ? '—' : fmtNum(v))
const opts = obj => Object.entries(obj ?? {}).map(([k, v]) => ({ value: k, label: `${k} (× ${num(v)})` }))
const range = obj => { const v = Object.values(obj ?? {}).map(Number); return v.length ? `× ${num(Math.min(...v))} – ${num(Math.max(...v))}` : '' }

const NAV = [{ id: 'quy-tac', label: 'Quy tắc' }, { id: 'cham-thu', label: 'Chấm thử' }, { id: 'tro-ly-ava', label: 'Trợ lý AVA', ava: true }]
/* Menu: mục đang xem sáng lên — bấm thì sáng ngay; cuộn tới khối nào thì mục đó sáng (theo dõi khối đang ở giữa màn hình) */
const activeId = ref('')
let lockUntil = 0, spy = null
function scrollTo(id) {
  if (NAV.some(l => l.id === id)) { activeId.value = id; lockUntil = Date.now() + 900 }   // giữ trạng thái trong lúc cuộn mượt
  else activeId.value = ''
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
onMounted(() => {
  spy = new IntersectionObserver(entries => {
    if (Date.now() < lockUntil) return
    const hit = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    if (hit) activeId.value = hit.target.id
    else if (window.scrollY < 200) activeId.value = ''
  }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01] })
  NAV.forEach(l => { const el = document.getElementById(l.id); if (el) spy.observe(el) })
})
onBeforeUnmount(() => { spy?.disconnect(); clearInterval(mockTimer); cancelAnimationFrame(countRaf) })
onMounted(() => { playCount(); restartMock() })

const VALUES = ['Quy tắc công khai, ai cũng tra được', 'Tự tính điểm, báo thiếu trường', 'Chốt điểm cuối tháng, lưu lại để đối chiếu']
/* Bảng điểm mẫu ở banner: ví dụ PD ↔ BA tự chuyển (dừng khi rê chuột / người dùng bật giảm chuyển động) */
const MOCKS = [
  { role: 'PD', name: 'Nguyễn An', initials: 'NA', sub: 'PD · Tháng 10', totalLabel: 'Tổng điểm sau đánh giá', total: 37.8, target: 40, pct: 94,
    rows: [{ name: 'Màn danh sách hóa đơn', meta: '3 màn chính · Trung bình', pts: '4,6' },
      { name: 'Luồng duyệt chứng từ', meta: '8 màn chính · Phức tạp', pts: '18,0' },
      { name: 'Báo cáo tổng hợp mobile', meta: '6 màn chính · Phức tạp · Rất hài lòng', pts: '15,2' }] },
  { role: 'BA', name: 'Trần Bình', initials: 'TB', sub: 'BA · Tháng 10', totalLabel: 'Tổng điểm thực nhận', total: 23.1, target: 25, pct: 92,
    rows: [{ name: 'Làm rõ YCPT hóa đơn điện tử', meta: 'BA Point 10 · Đúng hạn · 80%', pts: '9,6' },
      { name: 'Họp CCB chốt phạm vi R99', meta: 'BA Point 5 · Trễ · 50%', pts: '3,5' },
      { name: 'Viết PBI phân quyền chi tiết', meta: 'BA Point 10 · Đúng hạn · 100%', pts: '10,0' }] },
]
const mockIndex = ref(0), mockPaused = ref(false), mockTick = ref(0), mockCount = ref(0), barOn = ref(false)
const mock = computed(() => MOCKS[mockIndex.value])
const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
let mockTimer = null, countRaf = 0
/* Tổng điểm đếm lên + thanh tiến độ chạy lại mỗi lần đổi ví dụ */
function playCount() {
  cancelAnimationFrame(countRaf); barOn.value = false
  const to = mock.value.total, t0 = performance.now(), dur = reduceMotion ? 0 : 900
  const step = now => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1
    mockCount.value = Math.round(to * (1 - Math.pow(1 - k, 3)) * 10) / 10
    if (k < 1) countRaf = requestAnimationFrame(step)
  }
  countRaf = requestAnimationFrame(step)
  setTimeout(() => { barOn.value = true }, reduceMotion ? 0 : 180)
}
function showMock(i) { mockIndex.value = i; mockTick.value++; playCount(); restartMock() }
function restartMock() {
  clearInterval(mockTimer)
  if (reduceMotion) return
  mockTimer = setInterval(() => { if (!mockPaused.value && document.visibilityState === 'visible') { mockIndex.value = (mockIndex.value + 1) % MOCKS.length; mockTick.value++; playCount() } }, 4500)
}
const ROLE_TABS = [{ id: 'PD', label: 'Chấm điểm PD' }, { id: 'BA', label: 'Chấm điểm BA' }]
const ruleRole = ref('PD')

/* Công thức PD dạng khối */
const PD_EQ = computed(() => [
  { label: 'Số màn quy đổi', sub: `chính × ${num(cfg.value.mainScreenPoint)} + phụ × ${num(cfg.value.subScreenPoint)}` },
  { op: '×', label: 'Độ phức tạp thiết kế', sub: range(cfg.value.complexity) },
  { op: '×', label: 'Hệ số nghiệp vụ', sub: range(cfg.value.business ?? DEFAULT_CONFIG.business) },
  { op: '×', label: 'Người đưa giải pháp', sub: range(cfg.value.solution) },
  { op: '×', label: 'Dự án phụ trách', sub: range(cfg.value.ownProject) },
  { op: '×', label: 'Nền tảng', sub: range(cfg.value.platform) },
  { op: '×', label: 'Mức hài lòng', sub: range(cfg.value.rating) },
  { op: '=', label: 'Điểm sau đánh giá', sub: 'cộng vào điểm tháng', result: true },
])
const SOLUTION_HINT = { BA: 'BA đưa giải pháp chi tiết, PD vẽ theo', 'PD và BA': 'Cùng làm giải pháp', PD: 'PD tự đề xuất giải pháp' }
const pdFactors = computed(() => {
  const c = cfg.value, x = v => `× ${num(v)}`
  return [
    { icon: 'device-desktop', title: 'Số màn hình', desc: 'Màn đã chốt trong vòng lặp; màn phụ (combo, tooltip, thông báo…) quy đổi theo hệ số.',
      opts: [{ k: 'Màn hình chính', v: x(c.mainScreenPoint) }, { k: 'Màn hình phụ', v: x(c.subScreenPoint) }] },
    { icon: 'trending-up', title: 'Độ phức tạp thiết kế', desc: 'Theo phần giao diện PD phải nghĩ & vẽ: trạng thái, luồng, tương tác, thành phần mới. Di chuột lên từng mức để xem định nghĩa.',
      opts: COMPLEXITY_RULES.map(r => ({ k: r.value, v: x(c.complexity[r.value]), tip: r.summary })) },
    { icon: 'book', title: 'Hệ số nghiệp vụ', desc: 'Ghi nhận công tìm hiểu nghiệp vụ khó, kể cả khi giao diện đơn giản.',
      opts: BUSINESS_LEVELS.map(b => ({ k: b.value, v: x((c.business ?? DEFAULT_CONFIG.business)[b.value]), tip: b.summary })) },
    { icon: 'bulb', title: 'Người đưa giải pháp', desc: 'Ai là người nghĩ ra giải pháp thiết kế cho công việc.',
      opts: Object.entries(c.solution).map(([k, v]) => ({ k, v: x(v), tip: SOLUTION_HINT[k] })) },
    { icon: 'briefcase', title: 'Dự án phụ trách', desc: 'Hỗ trợ dự án không phải dự án mình phụ trách được nhân thêm.',
      opts: Object.entries(c.ownProject).map(([k, v]) => ({ k: k === 'Có' ? 'Dự án mình phụ trách' : 'Hỗ trợ dự án khác', v: x(v) })) },
    { icon: 'device-mobile', title: 'Nền tảng', desc: 'Nền tảng của thiết kế.',
      opts: Object.entries(c.platform).map(([k, v]) => ({ k, v: x(v) })) },
    { icon: 'star', title: 'Mức hài lòng', desc: 'BA / PO / PD Lead đánh giá chất lượng thiết kế và phối hợp.',
      opts: QUALITY_RATINGS.map(r => ({ k: r.value, v: x(c.rating[r.value]), tip: r.note })) },
  ]
})
/* Công thức BA dạng khối */
const baEq = computed(() => {
  const w = ba.value.weights
  return [
    { label: 'BA Point', sub: `× ${w.point}% (năng suất)` },
    { op: '+', label: 'Point tiến độ', sub: `× ${w.progress}%` },
    { op: '+', label: 'Point chất lượng', sub: `× ${w.quality}%` },
    { op: '=', label: 'Điểm thực nhận', sub: 'cộng vào điểm tháng', result: true },
  ]
})
const baFactors = computed(() => [
  { icon: 'star', title: `BA Point · ${ba.value.weights.point}%`, desc: 'Điểm gốc của Work Item, PO / PM / Lead thống nhất với BA.',
    bullets: ['Nhập 1 lần cho mỗi Work Item', 'Không cộng thêm vì sửa nhiều lần, làm chậm hay OT', 'Việc lớn thì tách nhỏ để ghi nhận đúng kỳ'] },
  { icon: 'clock', title: `Tiến độ · ${ba.value.weights.progress}%`, desc: 'So Ngày hoàn thành thực tế với Deadline phân tích.',
    opts: [{ k: 'Đúng hạn', v: '100%' }, { k: 'Trễ, được miễn trừ', v: '100%' }, { k: 'Trễ, không miễn trừ', v: '0%' }] },
  { icon: 'circle-check', title: `Chất lượng · ${ba.value.weights.quality}%`, desc: 'Mức dùng được ngay của đầu ra khi hoàn thành.',
    opts: BA_QUALITY_LEVELS.map(q => ({ k: q.value, v: `${num(ba.value.quality[q.value])}%` })) },
])

/* Chấm thử */
const calcRole = ref('PD')
const pd = reactive({ mainScreens: 3, subScreens: 5, complexity: 'Trung bình', businessLevel: 'Bình thường', solutionBy: 'PD và BA', platform: 'Web', isOwnProject: 'Có', qualityRating: 'Hài lòng' })
const PD_EXAMPLES = [
  { label: 'Thêm vài trường vào form', v: { mainScreens: 1, subScreens: 0, complexity: 'Rất đơn giản', businessLevel: 'Bình thường', solutionBy: 'BA', platform: 'Web', isOwnProject: 'Có', qualityRating: 'Hài lòng' } },
  { label: 'Màn danh sách + chi tiết', v: { mainScreens: 3, subScreens: 5, complexity: 'Trung bình', businessLevel: 'Phức tạp', solutionBy: 'PD và BA', platform: 'Web', isOwnProject: 'Có', qualityRating: 'Hài lòng' } },
  { label: 'Luồng mới trên Mobile', v: { mainScreens: 8, subScreens: 10, complexity: 'Phức tạp', businessLevel: 'Bình thường', solutionBy: 'PD', platform: 'Mobile', isOwnProject: 'Không', qualityRating: 'Rất hài lòng' } },
]
const pdSteps = computed(() => {
  const c = cfg.value
  const units = (Number(pd.mainScreens) || 0) * c.mainScreenPoint + (Number(pd.subScreens) || 0) * c.subScreenPoint
  const k = [c.complexity[pd.complexity], businessFactor(pd, c), c.solution[pd.solutionBy], c.ownProject[pd.isOwnProject], c.platform[pd.platform]]
  return [
    { label: 'Số màn quy đổi', value: num(units), how: `${pd.mainScreens || 0} × ${num(c.mainScreenPoint)} + ${pd.subScreens || 0} × ${num(c.subScreenPoint)}` },
    { label: 'Tích các hệ số', value: `× ${num(k.reduce((a, b) => a * (b ?? 0), 1))}`, how: k.map(num).join(' × ') },
    { label: 'Điểm PD', value: num(computeScore({ ...pd }, c)), how: 'Số màn quy đổi × tích các hệ số' },
    { label: 'Điểm sau đánh giá', value: num(computeFinalScore({ ...pd }, c)), how: `Điểm PD × ${num(c.rating[pd.qualityRating])} (${pd.qualityRating})` },
  ]
})
const PROGRESS_OPTIONS = [{ value: 'ontime', label: 'Đúng hạn' }, { value: 'exempt', label: 'Trễ — được miễn trừ' }, { value: 'late', label: 'Trễ — không miễn trừ' }]
const baQualityOptions = computed(() => BA_QUALITY_LEVELS.map(q => ({ value: q.value, label: `${num(ba.value.quality[q.value])}% — ${q.value}` })))
const baCalc = reactive({ point: 10, progress: 'ontime', quality: 'Dùng ngay, cần bổ sung' })
const BA_EXAMPLES = [
  { label: 'Làm rõ YCPT đúng hạn', v: { point: 10, progress: 'ontime', quality: 'Dùng ngay, cần bổ sung' } },
  { label: 'Họp CCB, trễ hạn', v: { point: 5, progress: 'late', quality: 'Sửa đáng kể / nhiều lần' } },
  { label: 'Concept đạt ngay lần đầu', v: { point: 10, progress: 'ontime', quality: 'Gần như đạt ngay lần đầu' } },
]
const baSteps = computed(() => {
  const r = baWorkItemScore({ point: baCalc.point, done: true, onTime: baCalc.progress !== 'late', quality: baCalc.quality }, ba.value)
  const w = ba.value.weights
  return [
    { label: 'Năng suất', value: num((Number(baCalc.point) || 0) * w.point / 100), how: `BA Point ${num(baCalc.point)} × ${w.point}%` },
    { label: 'Point tiến độ', value: num(r?.progressPoint), how: `Tiến độ ${r?.progressRate ?? 0}% × BA Point × ${w.progress}%` },
    { label: 'Point chất lượng', value: num(r?.qualityPoint), how: `Chất lượng ${r?.qualityRate ?? 0}% × BA Point × ${w.quality}%` },
    { label: 'Điểm thực nhận', value: num(r?.actual), how: 'Năng suất + Point tiến độ + Point chất lượng' },
  ]
})
/* ── Tiêu đề: chỉ gõ chữ 2 từ nhấn “điểm” → “lý do” (phần còn lại hiện sẵn; máy bật giảm chuyển động → hiện ngay) ── */
const TW_WORDS = ['điểm', 'lý do']
const twText = ref(reduceMotion ? [...TW_WORDS] : ['', '']), twCaret = ref(reduceMotion ? -1 : 0)
let twTimer = null
function typeWords(w = 0, n = 0) {
  if (reduceMotion || w >= TW_WORDS.length) { twTimer = setTimeout(() => { twCaret.value = -1 }, 1600); return }
  twCaret.value = w
  const word = TW_WORDS[w]
  twText.value = twText.value.map((t, i) => (i === w ? word.slice(0, n) : t))
  if (n < word.length) twTimer = setTimeout(() => typeWords(w, n + 1), 110)
  else twTimer = setTimeout(() => typeWords(w + 1, 0), 380)   // gõ xong 1 từ → nghỉ chút rồi sang từ kế
}
onMounted(() => { if (!reduceMotion) twTimer = setTimeout(() => typeWords(0, 0), 500) })
onBeforeUnmount(() => clearTimeout(twTimer))

/* ── Cuộn tới đâu, phần tử hiện dần tới đó (mờ + trượt nhẹ từ dưới lên, mỗi phần tử 1 lần) ──
   Banner không ẩn (hiện ngay khi mở trang). Phần tử cùng hàng hiện lần lượt (trễ theo thứ tự). Máy bật giảm chuyển động → bỏ qua. */
const rootEl = ref(null), revealOn = ref(false)
const REVEAL = ['.lp-head', '.lp-stage', '.lp-timeline li', '.lp-seg', '.lp-eq', '.lp-eq__note', '.lp-factor', '.lp-calc', '.lp-ava__text', '.lp-ava__caps li', '.lp-chat', '.lp-final', '.lp-foot']
let revealObs = null
function setupReveal() {
  if (reduceMotion || !('IntersectionObserver' in window)) return
  const els = [...rootEl.value.querySelectorAll(REVEAL.join(','))].filter(el => !el.closest('.lp-hero'))
  els.forEach(el => {
    const sibs = [...el.parentElement.children].filter(x => x.classList.contains('lp-rv') || els.includes(x))
    el.style.setProperty('--rv-d', `${Math.min(sibs.indexOf(el), 6) * 80}ms`)
    el.classList.add('lp-rv')
  })
  revealOn.value = true
  revealObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); revealObs.unobserve(e.target) }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
  els.forEach(el => revealObs.observe(el))
}
onMounted(setupReveal)
onBeforeUnmount(() => revealObs?.disconnect())
/* Đổi tab PD / BA ở Quy tắc → thẻ mới hiện ngay (không chờ cuộn) */
watch(ruleRole, () => nextTick(() => rootEl.value?.querySelectorAll('#quy-tac .lp-factor, #quy-tac .lp-eq, #quy-tac .lp-eq__note').forEach(el => el.classList.add('lp-rv', 'is-in'))))

/* ── Trợ lý AVA: khung chat mô phỏng ── */
const AVA_CAPS = [
  { icon: 'book', title: 'Giải thích quy tắc PD & BA', text: 'Độ phức tạp, cách đếm màn hình, BA Point, tiến độ, chất lượng — theo hệ số đang áp dụng.' },
  { icon: 'help-circle', title: 'Hướng dẫn từng thao tác', text: 'Thêm việc, nhập từ Excel / ảnh chụp, duyệt phân tích, chốt điểm… chỉ rõ bấm vào đâu.' },
  { icon: 'search', title: 'Chỉ ra vì sao chưa có điểm', text: 'Thiếu trường nào, tính vào tháng nào, khi nào bị khóa — trả lời ngắn gọn, đúng việc.' },
]
const AVA_DEMOS = [
  { short: 'Vì sao chưa có điểm?', q: 'Vì sao việc của tôi chưa có điểm?',
    a: 'Thường do thiếu trường bắt buộc: số màn hình, độ phức tạp, người đưa giải pháp hoặc Ngày hoàn thành. Mở công việc — cột “Tính điểm” báo đúng trường còn thiếu.' },
  { short: 'Màn phụ tính thế nào?', q: 'Màn phụ được tính bao nhiêu điểm?',
    a: 'Màn phụ là phần nhỏ bật ra trên màn chính, không có ô nhập liệu (combo xổ ra, tooltip, menu nút 3 chấm, thông báo, toast…) — mỗi màn tính 0,2 màn hình chính, sau đó nhân các hệ số như màn chính. Popup / form có nhập liệu, drawer chi tiết thì đếm là màn chính.' },
  { short: 'BA trễ hạn có mất hết điểm?', q: 'BA làm trễ hạn có bị mất hết điểm không?',
    a: 'Không. Trễ hạn không được miễn trừ chỉ mất phần Point tiến độ (20%) — vẫn giữ 60% năng suất và Point chất lượng.' },
  { short: 'Quên chốt tháng trước?', q: 'Tôi quên chốt điểm tháng trước thì sao?',
    a: 'Vẫn chốt bình thường. Lưu ý bảng điểm lấy dữ liệu và hệ số tại lúc bấm chốt — nên xem lại trước khi chốt.' },
]
const avaIndex = ref(0), avaTyping = ref(true), avaShown = ref('')
const avaDemo = computed(() => AVA_DEMOS[avaIndex.value])
let avaTimers = []
const avaLater = (fn, ms) => avaTimers.push(setTimeout(fn, ms))
function playAva(i = avaIndex.value) {
  avaTimers.forEach(clearTimeout); avaTimers = []
  avaIndex.value = i; avaShown.value = ''; avaTyping.value = !reduceMotion
  const full = AVA_DEMOS[i].a, next = () => playAva((i + 1) % AVA_DEMOS.length)
  if (reduceMotion) { avaShown.value = full; avaLater(next, 7000); return }
  avaLater(() => {                                   // “đang gõ…” rồi hiện từng chữ
    avaTyping.value = false
    let n = 0
    const tick = () => { n = Math.min(full.length, n + 2); avaShown.value = full.slice(0, n); if (n < full.length) avaLater(tick, 22); else avaLater(next, 3800) }
    tick()
  }, 1100)
}
onMounted(() => playAva(0))
onBeforeUnmount(() => avaTimers.forEach(clearTimeout))

const steps = computed(() => (calcRole.value === 'PD' ? pdSteps.value : baSteps.value))

</script>

<style scoped>
.lp { min-height: 100vh; background: var(--bg-white); color: var(--text-primary); }
.lp-wrap { width: 100%; max-width: 1140px; margin: 0 auto; padding: 0 24px; }
@media (max-width: 640px) { .lp-wrap { padding: 0 16px; } }

/* ── Thanh trên ── */
.lp-nav { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg-white) 90%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--stroke-neutral-light); }
.lp-nav__inner { display: flex; align-items: center; gap: 32px; height: 64px; }
.lp-brand { display: inline-flex; align-items: center; gap: 10px; font-size: var(--text-h3); font-weight: var(--fw-semibold); color: var(--text-primary); text-decoration: none; white-space: nowrap; }
.lp-nav__links { display: flex; align-self: stretch; gap: 4px; }
/* Menu dạng tab: mục đang xem chữ màu thương hiệu + gạch chân 2px sát đáy thanh menu */
.lp-nav__links a { position: relative; display: inline-flex; align-items: center; padding: 0 12px; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-secondary); text-decoration: none; white-space: nowrap; transition: color 0.2s; }
.lp-nav__links a::after { content: ''; position: absolute; left: 12px; right: 12px; bottom: -1px; height: 2px; border-radius: 2px 2px 0 0; background: var(--bg-brand); transform: scaleX(0); transition: transform 0.25s ease; }
.lp-nav__links a:hover { color: var(--text-primary); }
.lp-nav__links a.is-active { color: var(--text-brand); }
.lp-nav__links a.is-active::after { transform: scaleX(1); }
.lp-nav__actions { display: flex; gap: 8px; margin-left: auto; }
@media (max-width: 900px) { .lp-nav__links { display: none; } }
@media (max-width: 480px) { .lp-brand span { display: none; } }

/* ── Khung khối ── */
.lp-sec { padding: 88px 0; }
.lp-sec--tint { background: var(--bg-page); }
.lp-sec--last { padding-bottom: 32px; }
@media (max-width: 640px) { .lp-sec { padding: 56px 0; } }
.lp-head { max-width: 680px; margin: 0 auto 40px; text-align: center; }
.lp-head h2 { text-wrap: balance; margin-top: 10px; font-size: 32px; line-height: 1.25; font-weight: 700; letter-spacing: -0.015em; }
.lp-head p { margin-top: 12px; font-size: 16px; line-height: 1.6; color: var(--text-secondary); }
.lp-head--side { margin: 0; text-align: left; }
.lp-kicker { font-size: var(--text-sm); font-weight: var(--fw-semibold); letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-brand); }
@media (max-width: 640px) { .lp-head h2 { font-size: 26px; } }

/* ── Hero ── */
.lp-hero { padding: 72px 0 88px; background: linear-gradient(180deg, var(--bg-brand-light) 0%, var(--bg-white) 100%); }
.lp-hero__grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 56px; align-items: center; }
.lp-eyebrow { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: var(--radius-pill); background: var(--bg-white); border: 1px solid var(--stroke-neutral-light); color: var(--text-brand); font-size: var(--text-body); font-weight: var(--fw-medium); }
.lp-nowrap { white-space: nowrap; }
@media (max-width: 960px) { .lp-br { display: none; } }   /* màn hẹp: bỏ ngắt dòng cố định, để chữ tự xuống dòng */
.lp-hero__title { text-wrap: balance; margin-top: 20px; font-size: 46px; line-height: 1.12; font-weight: 700; letter-spacing: -0.025em; }
.lp-hero__lead { margin-top: 20px; max-width: 520px; font-size: 18px; line-height: 1.6; color: var(--text-secondary); }
.lp-hero__cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.lp-hero__points { display: flex; flex-direction: column; gap: 10px; margin-top: 32px; padding: 0; list-style: none; }
.lp-hero__points li { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-primary); }
.lp-hero__points .ti { font-size: 18px; color: var(--icon-success); }
@media (max-width: 1100px) { .lp-hero__title { font-size: 38px; } }
@media (max-width: 960px) { .lp-hero__grid { grid-template-columns: minmax(0, 1fr); gap: 40px; } .lp-hero__title { font-size: 36px; } .lp-nowrap { white-space: normal; } }
@media (max-width: 640px) { .lp-nowrap { white-space: normal; } .lp-hero { padding: 48px 0 56px; } .lp-hero__title { font-size: 30px; } .lp-hero__lead { font-size: 16px; } }

/* Bảng điểm mẫu */
.lp-mock { padding: 24px; border-radius: 16px; background: var(--bg-white); border: 1px solid var(--stroke-neutral-light); box-shadow: 0 24px 48px -16px rgba(16, 24, 40, 0.18); }
.lp-mock__head { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--stroke-divider); }
.lp-mock__avatar { width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--role-pd) 14%, transparent); color: var(--role-pd); font-weight: var(--fw-semibold); }
.lp-mock__who { display: flex; flex-direction: column; flex: 1; font-size: var(--text-body); color: var(--text-secondary); }
.lp-mock__who b { font-size: var(--text-body); color: var(--text-primary); font-weight: var(--fw-semibold); }
.lp-mock__badge { padding: 2px 10px; border-radius: var(--radius-pill); background: var(--bg-success-light); color: var(--text-success); font-size: var(--text-body); font-weight: var(--fw-medium); }
.lp-mock__rows { display: flex; flex-direction: column; }
.lp-mock__row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 16px; padding: 14px 0; border-bottom: 1px solid var(--stroke-divider); }
.lp-mock__name { font-size: var(--text-body); font-weight: var(--fw-medium); }
.lp-mock__meta { grid-column: 1; font-size: var(--text-body); color: var(--text-secondary); }
.lp-mock__pts { grid-column: 2; grid-row: 1 / span 2; align-self: center; font-size: 18px; font-weight: var(--fw-semibold); }
.lp-mock__total { display: flex; flex-direction: column; gap: 8px; padding-top: 16px; }
.lp-mock__total > div:first-child { display: flex; align-items: baseline; justify-content: space-between; font-size: var(--text-body); color: var(--text-secondary); }
.lp-mock__total b { font-size: 28px; color: var(--text-brand); }
.lp-mock__bar { height: 8px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); overflow: hidden; }
.lp-mock__bar i { display: block; height: 100%; border-radius: inherit; background: var(--bg-brand); }
.lp-mock__target { font-size: var(--text-body); color: var(--text-secondary); }

/* ── Cách hoạt động ── */
.lp-stages { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.lp-stage { padding: 24px; border-radius: 14px; border: 1px solid var(--stroke-neutral-light); background: var(--bg-white); }
.lp-stage__flow { display: flex; align-items: center; gap: 8px; height: 28px; }
.lp-stage__arrow { color: var(--icon-neutral); }
.lp-stage h3 { margin-top: 16px; font-size: 18px; font-weight: var(--fw-semibold); }
.lp-stage p { margin-top: 8px; font-size: var(--text-body); line-height: 1.6; color: var(--text-secondary); }
.lp-pill { padding: 3px 12px; border-radius: var(--radius-pill); font-size: var(--text-body); font-weight: var(--fw-semibold); }
.lp-pill--ba { background: color-mix(in srgb, var(--role-ba) 12%, transparent); color: var(--role-ba); }
.lp-pill--pd { background: color-mix(in srgb, var(--role-pd) 12%, transparent); color: var(--role-pd); }
.lp-timeline { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-top: 56px; padding: 0; list-style: none; }
.lp-timeline::before { content: ''; position: absolute; top: 15px; left: 16px; right: calc(25% - 16px); height: 2px; background: var(--stroke-neutral-light); }
.lp-timeline li { position: relative; display: flex; flex-direction: column; gap: 6px; padding-right: 8px; }
.lp-timeline__no { width: 32px; height: 32px; margin-bottom: 8px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--bg-brand); color: #fff; font-weight: var(--fw-semibold); box-shadow: 0 0 0 6px var(--bg-white); }
.lp-timeline b { font-size: 16px; font-weight: var(--fw-semibold); }
.lp-timeline li > span:last-child { font-size: var(--text-body); line-height: 1.55; color: var(--text-secondary); }
@media (max-width: 960px) { .lp-stages { grid-template-columns: minmax(0, 1fr); } .lp-timeline { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 32px; } .lp-timeline::before { display: none; } }
@media (max-width: 560px) { .lp-timeline { grid-template-columns: minmax(0, 1fr); } }

/* ── Tab PD | BA ── */
.lp-seg { display: flex; justify-content: center; gap: 4px; width: fit-content; margin: 0 auto 32px; padding: 4px; border-radius: 12px; background: var(--bg-white); border: 1px solid var(--stroke-neutral-light); }
.lp-seg__btn { display: inline-flex; align-items: center; gap: 8px; height: calc(var(--btn-height) + 8px); padding: 0 20px; border: none; border-radius: 9px; background: transparent; font-family: inherit; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-primary); cursor: pointer; }
.lp-seg__btn::before { content: ''; width: 8px; height: 8px; border-radius: 50%; }
.lp-seg__btn--pd::before { background: var(--role-pd); }
.lp-seg__btn--ba::before { background: var(--role-ba); }
.lp-seg__btn--on { background: var(--bg-neutral-light); color: var(--text-primary); }
@media (max-width: 480px) { .lp-seg { width: 100%; } .lp-seg__btn { flex: 1; justify-content: center; padding: 0 8px; } }

/* Công thức dạng khối */
.lp-eq { display: flex; flex-wrap: wrap; align-items: stretch; justify-content: center; gap: 8px 6px; }
.lp-eq__end { display: inline-flex; align-items: stretch; gap: 6px; }   /* “= kết quả” không bị tách dòng */
.lp-eq__box { display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 10px 14px; border-radius: 12px; background: var(--bg-white); border: 1px solid var(--stroke-neutral-light); text-align: center; }
.lp-eq__box b { font-size: var(--text-body); font-weight: var(--fw-semibold); }
.lp-eq__box small { font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; }
.lp-eq__box--ba { border-color: color-mix(in srgb, var(--role-ba) 30%, transparent); }
.lp-eq__box--result { background: var(--bg-brand); border-color: var(--bg-brand); }
.lp-eq__box--result b, .lp-eq__box--result small { color: #fff; }
.lp-eq__op { display: inline-flex; align-items: center; padding: 0 2px; font-size: 18px; font-weight: var(--fw-semibold); color: var(--icon-neutral); }
.lp-eq__note { max-width: 680px; margin: 20px auto 40px; text-align: center; font-size: var(--text-body); line-height: 1.6; color: var(--text-secondary); }
.lp-eq__note b { color: var(--text-primary); font-weight: var(--fw-semibold); }

/* Thẻ hệ số */
.lp-factors { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
@media (max-width: 960px) { .lp-factors { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .lp-factors { grid-template-columns: minmax(0, 1fr); } }
.lp-factor { display: flex; flex-direction: column; padding: 24px; border-radius: 14px; background: var(--bg-white); border: 1px solid var(--stroke-neutral-light); }
.lp-factor__head { display: flex; align-items: center; gap: 12px; }
.lp-factor__head h3 { font-size: 16px; font-weight: var(--fw-semibold); }
.lp-factor__icon { width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--role-pd) 12%, transparent); color: var(--role-pd); font-size: 18px; }
.lp-factor__icon--ba { background: color-mix(in srgb, var(--role-ba) 12%, transparent); color: var(--role-ba); }
.lp-factor > p { margin-top: 12px; font-size: var(--text-body); line-height: 1.55; color: var(--text-secondary); }
.lp-opts { display: grid; grid-template-columns: minmax(0, 1fr) auto; margin-top: auto; padding-top: 16px; }
.lp-opts dt, .lp-opts dd { padding: 8px 0; border-top: 1px solid var(--stroke-divider); font-size: var(--text-body); }
.lp-opts dt { color: var(--text-primary); }
.lp-opts dt[aria-describedby], .lp-opts dt:hover { cursor: default; }
.lp-opts dd { text-align: right; font-weight: var(--fw-semibold); color: var(--text-brand); white-space: nowrap; padding-left: 12px; }
.lp-bullets { display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding: 16px 0 0 18px; font-size: var(--text-body); line-height: 1.5; color: var(--text-primary); }

/* ── Chấm thử ── */
.lp-calc { display: grid; grid-template-columns: minmax(0, 1fr) 400px; border-radius: 16px; border: 1px solid var(--stroke-neutral-light); background: var(--bg-white); box-shadow: var(--shadow-card); overflow: hidden; }
.lp-calc__form { padding: 28px; }
.lp-examples { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 20px; font-size: var(--text-body); color: var(--text-secondary); }
.lp-examples > span { margin-right: 4px; font-weight: var(--fw-medium); }
.lp-chip { height: calc(var(--btn-height) - 4px); padding: 0 12px; border: 1px solid var(--stroke-neutral); border-radius: var(--radius-pill); background: var(--bg-white); font-family: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; }
.lp-chip:hover { border-color: var(--stroke-brand); color: var(--text-brand); }
.lp-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.lp-fields__full { grid-column: 1 / -1; }
.lp-calc__out { display: flex; flex-direction: column; justify-content: space-between; gap: 16px; padding: 28px; background: var(--bg-page); border-left: 1px solid var(--stroke-neutral-light); }
.lp-calc__steps { display: flex; flex-direction: column; }
.lp-out { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px dashed var(--stroke-neutral-light); }
.lp-out > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.lp-out__label { font-size: var(--text-body); font-weight: var(--fw-medium); }
.lp-out__how { font-size: var(--text-body); color: var(--text-secondary); }
.lp-out__value { font-size: 18px; font-weight: var(--fw-semibold); white-space: nowrap; }
.lp-result { display: flex; flex-direction: column; gap: 4px; padding: 20px; border-radius: 12px; background: var(--bg-brand); color: #fff; }
.lp-result span { font-size: var(--text-body); opacity: 0.9; }
.lp-result b { font-size: 40px; line-height: 1.1; font-weight: 700; }
.lp-result small { font-size: var(--text-body); opacity: 0.85; }
@media (max-width: 960px) { .lp-calc { grid-template-columns: minmax(0, 1fr); } .lp-calc__out { border-left: none; border-top: 1px solid var(--stroke-neutral-light); } }
@media (max-width: 560px) { .lp-calc__form, .lp-calc__out { padding: 20px 16px; } .lp-fields { grid-template-columns: minmax(0, 1fr); } }


/* ── Kêu gọi + chân trang ── */
.lp-final { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; padding: 40px 48px; border-radius: 20px; background: var(--bg-brand); color: #fff; }
.lp-final h2 { font-size: 28px; line-height: 1.25; font-weight: 700; }
.lp-final p { margin-top: 8px; font-size: 16px; opacity: 0.9; }
.lp-final__cta { display: flex; gap: 12px; flex-wrap: wrap; }
.lp-btn-light { background: #fff; color: var(--text-brand); border: 1px solid #fff; }
.lp-btn-light:hover { background: rgba(255, 255, 255, 0.9); }
.lp-btn-ghost { background: transparent; color: #fff; border: 1px solid rgba(255, 255, 255, 0.6); }
.lp-btn-ghost:hover { background: rgba(255, 255, 255, 0.12); }
@media (max-width: 640px) { .lp-final { padding: 28px 20px; } .lp-final h2 { font-size: 22px; } }
.lp-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--stroke-divider); font-size: var(--text-body); color: var(--text-secondary); }
.lp-foot a { display: inline-flex; align-items: center; gap: 4px; color: var(--text-secondary); text-decoration: none; }
.lp-foot a:hover { color: var(--text-brand); }

/* ═══ LIQUID GLASS ═══
   Nền: mảng màu loang (blur lớn) trôi chậm · Bề mặt: kính mờ trong (backdrop-filter) + viền sáng + vệt bóng ở mép trên.
   Mọi khối nội dung dùng chung các biến --glass-* để đồng nhất độ trong / độ sáng. */
.lp {
  --glass-bg: rgba(255, 255, 255, 0.52);
  --glass-bg-strong: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(255, 255, 255, 0.75);
  --glass-edge: rgba(16, 24, 40, 0.06);
  --glass-blur: blur(22px) saturate(180%);
  --glass-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 -1px 0 rgba(255, 255, 255, 0.25) inset, 0 12px 32px -12px rgba(16, 24, 40, 0.16), 0 0 0 1px var(--glass-edge);
  position: relative; isolation: isolate; overflow-x: clip; background: #f4f7fb;
}
.lp-bg { position: absolute; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
.lp-blob { position: absolute; display: block; border-radius: 50%; filter: blur(80px); opacity: 0.55; animation: lp-float 22s ease-in-out infinite alternate; }
.lp-blob--1 { width: 620px; height: 620px; top: -160px; left: -120px; background: var(--bg-brand); opacity: 0.35; }
.lp-blob--2 { width: 520px; height: 520px; top: 80px; right: -140px; background: var(--role-ba); opacity: 0.32; animation-delay: -6s; }
.lp-blob--3 { width: 480px; height: 480px; top: 1150px; left: -160px; background: var(--role-pd); opacity: 0.30; animation-delay: -11s; }
.lp-blob--4 { width: 560px; height: 560px; top: 1700px; right: -180px; background: #60a5fa; opacity: 0.30; animation-delay: -3s; }
.lp-blob--5 { width: 520px; height: 520px; top: 2700px; left: 10%; background: var(--role-ba); opacity: 0.24; animation-delay: -15s; }
.lp-blob--6 { width: 600px; height: 600px; bottom: -200px; right: 5%; background: var(--bg-brand); opacity: 0.28; animation-delay: -8s; }
@keyframes lp-float { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, -30px) scale(1.08); } 100% { transform: translate(-30px, 40px) scale(0.95); } }
@media (prefers-reduced-motion: reduce) { .lp-blob { animation: none; } }

/* Bề mặt kính dùng chung */
.lp-nav, .lp-mock, .lp-stage, .lp-factor, .lp-eq__box:not(.lp-eq__box--result), .lp-seg, .lp-calc, .lp-eyebrow {
  background: var(--glass-bg); -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);
}
/* Vệt bóng ánh lên ở mép trên (specular) */
.lp-mock, .lp-stage, .lp-factor, .lp-calc, .lp-final { position: relative; }
.lp-mock::before, .lp-stage::before, .lp-factor::before, .lp-calc::before, .lp-final::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.12) 28%, transparent 55%);
}
.lp-mock > *, .lp-stage > *, .lp-factor > *, .lp-calc > *, .lp-final > * { position: relative; }

/* Thanh trên + khối nền: trong suốt để thấy màu loang */
.lp-nav { border-width: 0 0 1px; border-radius: 0; box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 8px 24px -16px rgba(16, 24, 40, 0.2); }
.lp-hero, .lp-sec--tint { background: transparent; }
.lp-hero__lead, .lp-head p { color: #475467; }

/* Thẻ: bo lớn hơn, nổi nhẹ khi rê chuột */
.lp-mock { border-radius: 24px; background: var(--glass-bg-strong); }
.lp-stage, .lp-factor { border-radius: 20px; transition: transform 0.25s ease, box-shadow 0.25s ease; }
.lp-stage:hover, .lp-factor:hover { transform: translateY(-3px); box-shadow: var(--glass-shadow), 0 20px 40px -18px rgba(16, 24, 40, 0.28); }
.lp-mock__head, .lp-mock__row, .lp-opts dt, .lp-opts dd { border-color: rgba(16, 24, 40, 0.07); }
.lp-mock__bar { background: rgba(16, 24, 40, 0.07); }
.lp-mock__bar i { background: linear-gradient(90deg, var(--role-pd), var(--bg-brand)); }
.lp-factor__icon, .lp-mock__avatar { box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset; }

/* Công thức */
.lp-eq__box { border-radius: 16px; }
.lp-eq__box--result { background: linear-gradient(135deg, color-mix(in srgb, var(--bg-brand) 85%, #fff), var(--bg-brand)); border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.45) inset, 0 12px 28px -10px color-mix(in srgb, var(--bg-brand) 60%, transparent); }

/* Tab dạng viên kính, nút đang chọn sáng hơn */
.lp-seg { border-radius: 16px; }
.lp-seg__btn { border-radius: 12px; }
.lp-seg__btn--on { background: rgba(255, 255, 255, 0.9); box-shadow: 0 1px 0 #fff inset, 0 4px 12px -4px rgba(16, 24, 40, 0.18); }

/* Chấm thử */
.lp-calc { border-radius: 24px; }
.lp-calc__out { background: rgba(255, 255, 255, 0.35); border-left-color: rgba(255, 255, 255, 0.7); }
.lp-out { border-bottom-color: rgba(16, 24, 40, 0.1); }
.lp-result { border-radius: 18px; background: linear-gradient(135deg, color-mix(in srgb, var(--bg-brand) 80%, #fff), var(--bg-brand) 60%, color-mix(in srgb, var(--bg-brand) 80%, #000));
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 16px 32px -12px color-mix(in srgb, var(--bg-brand) 55%, transparent); }
.lp-chip { background: rgba(255, 255, 255, 0.6); border-color: rgba(16, 24, 40, 0.12); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.lp-calc :deep(.textbox), .lp-calc :deep(.combobox), .lp-calc :deep(input) { background-color: rgba(255, 255, 255, 0.75); }


/* Kêu gọi: kính màu thương hiệu */
.lp-final { border-radius: 28px; overflow: hidden;
  background: linear-gradient(135deg, color-mix(in srgb, var(--bg-brand) 88%, #fff) 0%, var(--bg-brand) 45%, color-mix(in srgb, var(--role-pd) 70%, var(--bg-brand)) 100%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.45) inset, 0 24px 48px -20px color-mix(in srgb, var(--bg-brand) 60%, transparent); }
.lp-final::before { background: linear-gradient(160deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 35%, transparent 60%); }
.lp-btn-light { box-shadow: 0 1px 0 #fff inset, 0 6px 16px -6px rgba(0, 0, 0, 0.25); }
.lp-btn-ghost { -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); background: rgba(255, 255, 255, 0.12); }
.lp-foot { border-top: none; padding-top: 0; }   /* chân trang: không vạch ngăn */

/* Nút chính trên trang: bóng nhẹ, ánh sáng mép trên */
.lp :deep(.btn--primary) { box-shadow: 0 1px 0 rgba(255, 255, 255, 0.35) inset, 0 8px 20px -8px color-mix(in srgb, var(--bg-brand) 70%, transparent); }
.lp :deep(.btn--outline) { background: rgba(255, 255, 255, 0.6); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }

/* ═══ PHÂN CẤP SECTION ═══
   Cấp 1 — section: tiêu đề lớn có số thứ tự; xen kẽ nền trong suốt ↔ dải kính mờ chạy hết bề ngang (viền trên / dưới).
   Cấp 2 — thẻ trong section: kính sáng hơn nền section, bo nhỏ hơn.
   Cấp 3 — nội dung trong thẻ: phẳng, chỉ đường kẻ mảnh. */
.lp-sec { padding: 104px 0; }
@media (max-width: 640px) { .lp-sec { padding: 64px 0; } }
.lp-sec--band { position: relative; background: rgba(255, 255, 255, 0.58); -webkit-backdrop-filter: blur(28px) saturate(160%); backdrop-filter: blur(28px) saturate(160%);
  border: none;
  /* Mép trên / dưới mờ dần vào nền (không cắt thẳng mảng màu loang) — nội dung cách mép ≥ 104px nên không bị ảnh hưởng */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 72px, #000 calc(100% - 72px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 72px, #000 calc(100% - 72px), transparent 100%); }
.lp-sec--band .lp-stage, .lp-sec--band .lp-factor, .lp-sec--band .lp-eq__box:not(.lp-eq__box--result), .lp-sec--band .lp-seg { background: rgba(255, 255, 255, 0.78); }
.lp-head { margin-bottom: 48px; }
.lp-head h2 { font-size: 36px; }
@media (max-width: 640px) { .lp-head h2 { font-size: 26px; } }
.lp-kicker { display: inline-flex; align-items: center; gap: 10px; }
.lp-kicker__no { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 24px; padding: 0 8px; border-radius: var(--radius-pill);
  background: var(--bg-brand); color: #fff; font-size: 12px; letter-spacing: 0.04em; }
.lp-head::after { content: ''; display: block; width: 48px; height: 3px; margin: 20px auto 0; border-radius: var(--radius-pill); background: var(--bg-brand); opacity: 0.85; }
.lp-head--side::after { margin-left: 0; }

/* ═══ NÚT PHẲNG — không bóng đổ / vệt sáng giả nổi ═══ */
.lp :deep(.btn--primary), .lp :deep(.btn--outline), .lp-btn-light, .lp-btn-ghost, .lp-chip { box-shadow: none !important; }
.lp :deep(.btn--outline) { -webkit-backdrop-filter: none; backdrop-filter: none; background: rgba(255, 255, 255, 0.85); }
.lp :deep(.btn--outline:hover) { background: var(--bg-brand-light); }   /* Đăng nhập: viền + chữ màu thương hiệu (cặp với nút Đăng ký) */
.lp-btn-ghost { -webkit-backdrop-filter: none; backdrop-filter: none; }
.lp-seg__btn--on { box-shadow: none; background: var(--bg-brand-light); color: var(--text-brand); }
.lp-chip { -webkit-backdrop-filter: none; backdrop-filter: none; background: #fff; }

/* ═══ HERO BANNER — rộng hết bề ngang, nền riêng (kính màu + lưới chấm), ngăn cách với phần dưới bằng viền đáy + bóng ═══ */
.lp-hero { position: relative; overflow: hidden; padding: 80px 0 96px;
  background:
    radial-gradient(900px 480px at 8% 0%, color-mix(in srgb, var(--bg-brand) 22%, transparent), transparent 70%),
    radial-gradient(800px 480px at 95% 100%, color-mix(in srgb, var(--role-ba) 18%, transparent), transparent 70%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.45));
  -webkit-backdrop-filter: blur(24px) saturate(170%); backdrop-filter: blur(24px) saturate(170%);
  border-bottom: 1px solid rgba(16, 24, 40, 0.05); }   /* ngăn cách nhẹ: chỉ 1 đường mảnh, không bóng */
/* Lưới chấm mờ trang trí nửa phải */
.lp-hero::after { content: ''; position: absolute; top: 0; right: 0; width: 50%; height: 100%; pointer-events: none;
  background-image: radial-gradient(rgba(16, 24, 40, 0.08) 1px, transparent 1px); background-size: 18px 18px;
  -webkit-mask-image: linear-gradient(to left, #000, transparent); mask-image: linear-gradient(to left, #000, transparent); }
.lp-hero__panel { position: relative; z-index: 1; }
.lp-hero .lp-eyebrow { background: rgba(255, 255, 255, 0.85); }
.lp-hero + .lp-sec { padding-top: 104px; }
@media (max-width: 640px) { .lp-hero { padding: 40px 0 56px; } .lp-hero::after { display: none; } }

/* ═══ BẢNG ĐIỂM MẪU TỰ CHUYỂN PD ↔ BA ═══ */
.lp-mock-wrap { display: flex; flex-direction: column; gap: 12px; }
.lp-mock-switch { display: flex; gap: 4px; align-self: center; padding: 4px; border-radius: var(--radius-pill); background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(255, 255, 255, 0.9); }
.lp-mock-switch__btn { position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 6px; height: calc(var(--btn-height) - 4px); padding: 0 14px; border: none; border-radius: var(--radius-pill);
  background: transparent; font-family: inherit; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-primary); cursor: pointer; transition: background-color 0.25s, color 0.25s; }
.lp-mock-switch__btn i { width: 7px; height: 7px; border-radius: 50%; }
.lp-mock-switch__btn--pd i { background: var(--role-pd); }
.lp-mock-switch__btn--ba i { background: var(--role-ba); }
.lp-mock-switch__btn.is-on { background: #fff; color: var(--text-primary); }
/* Vạch chạy dưới nút đang hiện = thời gian tới lần đổi tiếp theo */
.lp-mock-switch__timer { position: absolute; left: 12px; right: 12px; bottom: 3px; height: 2px; border-radius: 2px; transform-origin: left; animation: lp-timer 4.5s linear forwards; }
.lp-mock-switch__btn--pd .lp-mock-switch__timer { background: var(--role-pd); }
.lp-mock-switch__btn--ba .lp-mock-switch__timer { background: var(--role-ba); }
@keyframes lp-timer { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.lp-mock { overflow: hidden; transition: box-shadow 0.4s; }
.lp-mock--ba .lp-mock__avatar { background: color-mix(in srgb, var(--role-ba) 14%, transparent); color: var(--role-ba); }
.lp-mock--ba .lp-mock__bar i { background: linear-gradient(90deg, var(--role-ba), var(--bg-brand)); }
.lp-mock__bar i { transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
/* Chuyển ví dụ: trượt + mờ; từng dòng hiện lần lượt */
.lp-mock-enter-active, .lp-mock-leave-active { transition: opacity 0.35s ease, transform 0.35s ease, filter 0.35s ease; }
.lp-mock-enter-from { opacity: 0; transform: translateX(24px); filter: blur(4px); }
.lp-mock-leave-to { opacity: 0; transform: translateX(-24px); filter: blur(4px); }
.lp-mock__row { animation: lp-row-in 0.45s ease both; }
@keyframes lp-row-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .lp-mock__row, .lp-mock-switch__timer { animation: none; } .lp-mock-enter-active, .lp-mock-leave-active, .lp-mock__bar i { transition: none; } }

/* ═══ TRỢ LÝ AVA ═══ */
.lp-ava { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 64px; align-items: center; }
@media (max-width: 960px) { .lp-ava { grid-template-columns: minmax(0, 1fr); gap: 40px; } }
.lp-ava__text h2 { margin-top: 12px; font-size: 36px; line-height: 1.25; font-weight: 700; letter-spacing: -0.015em; text-wrap: balance; }
@media (max-width: 640px) { .lp-ava__text h2 { font-size: 26px; } }
.lp-ava__lead { margin-top: 14px; font-size: 16px; line-height: 1.6; color: #475467; }
.lp-ava__caps { display: flex; flex-direction: column; gap: 16px; margin-top: 28px; padding: 0; list-style: none; }
.lp-ava__caps li { display: flex; gap: 14px; }
.lp-ava__caps li > div { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-body); line-height: 1.55; color: var(--text-secondary); }
.lp-ava__caps b { font-size: 16px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.lp-ava__cap-icon { width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px;
  background: var(--bg-ai-light, var(--bg-brand-light)); color: var(--text-ai, var(--icon-brand)); }
.lp-ava__hint { display: flex; align-items: center; gap: 6px; margin-top: 24px; font-size: var(--text-body); color: var(--text-secondary); }

.lp-chat { position: relative; display: flex; flex-direction: column; min-height: 420px; border-radius: 24px; overflow: hidden;
  background: rgba(255, 255, 255, 0.72); -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.9); box-shadow: 0 0 0 1px rgba(16, 24, 40, 0.05), 0 24px 48px -24px rgba(16, 24, 40, 0.25); }
.lp-chat__head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid rgba(16, 24, 40, 0.06); }
.lp-chat__head > div { display: flex; flex-direction: column; font-size: var(--text-body); color: var(--text-secondary); }
.lp-chat__head b { font-size: 16px; color: var(--text-primary); font-weight: var(--fw-semibold); }
.lp-chat__head span { display: inline-flex; align-items: center; gap: 6px; }
.lp-chat__logo { width: 36px; height: 36px; }
.lp-chat__logo :deep(svg) { width: 36px; height: 36px; }
.lp-chat__online { width: 7px; height: 7px; border-radius: 50%; background: var(--bg-success); }
.lp-chat__body { flex: 1; padding: 20px; }
.lp-chat__pair { display: flex; flex-direction: column; gap: 14px; }
.lp-chat__msg { display: flex; gap: 8px; }
.lp-chat__msg--me { justify-content: flex-end; }
.lp-chat__av { flex-shrink: 0; width: 26px; height: 26px; margin-top: 2px; }
.lp-chat__av :deep(svg) { width: 26px; height: 26px; }
.lp-chat__bubble { max-width: 85%; padding: 10px 14px; border-radius: 16px; font-size: var(--text-body); line-height: 1.6; }
.lp-chat__msg--me .lp-chat__bubble { background: var(--bg-brand); color: #fff; border-bottom-right-radius: 4px; }
.lp-chat__msg--ava .lp-chat__bubble { min-height: 42px; background: #fff; color: var(--text-primary); border: 1px solid rgba(16, 24, 40, 0.06); border-bottom-left-radius: 4px; }
.lp-chat__dots { display: inline-flex; gap: 4px; padding: 6px 0; }
.lp-chat__dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--icon-neutral); animation: lp-dot 1s infinite ease-in-out; }
.lp-chat__dots i:nth-child(2) { animation-delay: 0.15s; } .lp-chat__dots i:nth-child(3) { animation-delay: 0.3s; }
@keyframes lp-dot { 0%, 80%, 100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
.lp-chat__caret { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -2px; background: var(--text-brand); animation: lp-caret 0.8s steps(1) infinite; }
@keyframes lp-caret { 50% { opacity: 0; } }
.lp-chat-enter-active, .lp-chat-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.lp-chat-enter-from { opacity: 0; transform: translateY(10px); }
.lp-chat-leave-to { opacity: 0; transform: translateY(-10px); }
.lp-chat__suggest { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 20px 18px; border-top: 1px solid rgba(16, 24, 40, 0.06); }
.lp-chat__chip { display: inline-flex; align-items: center; gap: 6px; height: calc(var(--btn-height) - 4px); padding: 0 12px; border: 1px solid rgba(16, 24, 40, 0.12); border-radius: var(--radius-pill);
  background: #fff; font-family: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; transition: border-color 0.2s, color 0.2s, background-color 0.2s; }
.lp-chat__chip .ti { font-size: 14px; color: var(--text-ai, var(--icon-brand)); }
.lp-chat__chip:hover { border-color: var(--stroke-brand); }
.lp-chat__chip.is-on { border-color: var(--stroke-brand); background: var(--bg-brand-light); color: var(--text-brand); }
@media (prefers-reduced-motion: reduce) { .lp-chat__dots i, .lp-chat__caret { animation: none; } .lp-chat-enter-active, .lp-chat-leave-active { transition: none; } }
@media (max-width: 560px) { .lp-chat { min-height: 460px; } .lp-chat__body, .lp-chat__head, .lp-chat__suggest { padding-left: 14px; padding-right: 14px; } }

/* ═══ TIÊU ĐỀ: 2 từ nhấn mạnh tô màu thương hiệu — tĩnh, không hiệu ứng ═══ */
.lp-hl { color: var(--text-brand); }

/* ═══ SECTION TỐI — điểm nhấn (Trợ lý AVA): xanh đêm + quầng sáng AI tím / xanh, chữ sáng ═══ */
.lp-sec--dark { position: relative; overflow: hidden; color: #fff;
  background:
    radial-gradient(700px 420px at 12% 20%, rgba(20, 130, 255, 0.28), transparent 70%),
    radial-gradient(640px 420px at 88% 85%, rgba(207, 17, 255, 0.24), transparent 70%),
    radial-gradient(500px 300px at 60% 0%, color-mix(in srgb, var(--bg-brand) 22%, transparent), transparent 70%),
    linear-gradient(160deg, #0b1220 0%, #101935 55%, #140f2e 100%); }
/* Lưới chấm sáng mờ như bầu trời đêm */
.lp-sec--dark::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px); background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%); mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%); }
.lp-sec--dark > * { position: relative; }
.lp-sec--dark .lp-kicker { color: #8be0b8; }
.lp-sec--dark .lp-ava__text h2 { color: #fff; }
.lp-sec--dark .lp-ava__lead { color: rgba(255, 255, 255, 0.72); }
.lp-sec--dark .lp-ava__caps b { color: #fff; }
.lp-sec--dark .lp-ava__caps li > div { color: rgba(255, 255, 255, 0.62); }
.lp-sec--dark .lp-ava__cap-icon { background: rgba(255, 255, 255, 0.08); color: #8fd3ff; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset; }
.lp-sec--dark .lp-ava__hint { color: rgba(255, 255, 255, 0.5); }
/* Khung chat: kính sáng nổi trên nền tối, quầng sáng AI phía sau */
.lp-sec--dark .lp-chat { background: rgba(255, 255, 255, 0.94); border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 30px 80px -20px rgba(20, 130, 255, 0.45), 0 20px 60px -30px rgba(207, 17, 255, 0.5); }
.lp-sec--dark + .lp-sec { padding-top: 104px; }

/* ═══ MỖI SECTION 1 NỀN RIÊNG — có điểm dừng rõ khi cuộn ═══
   Xen kẽ 1 trắng – 1 có nền: Banner (kính màu) → 01 Quy tắc trắng → 02 Chấm thử xám nhạt → 03 AVA tối → cuối trang trắng.
   Nền gần đặc (chỉ còn thoáng màu loang phía sau) + 1 đường mảnh ở mép trên. */
.lp-sec--mint, .lp-sec--white, .lp-sec--gray, .lp-sec--lilac { position: relative; border-top: 1px solid rgba(16, 24, 40, 0.05); }
.lp-sec--mint  { background: linear-gradient(180deg, rgba(236, 249, 243, 0.94) 0%, rgba(244, 251, 248, 0.94) 100%); }
.lp-sec--white { background: rgba(255, 255, 255, 0.96); }
.lp-sec--gray  { background: linear-gradient(180deg, rgba(242, 244, 247, 0.96) 0%, rgba(247, 248, 250, 0.96) 100%); }
.lp-sec--lilac { background: linear-gradient(180deg, rgba(243, 242, 255, 0.95) 0%, rgba(247, 246, 255, 0.95) 100%); }
/* Thẻ trên nền trắng: viền rõ hơn chút để không chìm */
.lp-sec--white .lp-stage, .lp-sec--white .lp-calc, .lp-sec--white .lp-factor, .lp-sec--white .lp-eq__box:not(.lp-eq__box--result), .lp-sec--white .lp-seg { background: #fff; border-color: rgba(16, 24, 40, 0.08); }
.lp-sec--gray .lp-calc, .lp-sec--gray .lp-factor, .lp-sec--gray .lp-eq__box:not(.lp-eq__box--result), .lp-sec--gray .lp-seg { background: #fff; border-color: rgba(16, 24, 40, 0.06); box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 12px -4px rgba(16, 24, 40, 0.08); }
.lp-sec--lilac .lp-calc, .lp-sec--lilac .lp-seg { background: rgba(255, 255, 255, 0.9); }
.lp-sec--mint .lp-stage { background: rgba(255, 255, 255, 0.85); }
.lp-sec--mint .lp-timeline__no { box-shadow: 0 0 0 6px #eef9f4; }
.lp-sec--last { border-top: none; }

/* ═══ HIỆN DẦN KHI CUỘN ═══ (chỉ ẩn khi JS đã sẵn sàng — lp--reveal) */
.lp--reveal .lp-rv { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: var(--rv-d, 0ms); }
.lp--reveal .lp-rv.is-in { opacity: 1; transform: none; }
/* Thẻ có hiệu ứng nổi khi rê chuột: sau khi hiện xong trả lại transition gốc */
.lp--reveal .lp-stage.lp-rv.is-in, .lp--reveal .lp-factor.lp-rv.is-in { transition: opacity 0.7s ease var(--rv-d, 0ms), transform 0.25s ease, box-shadow 0.25s ease; }
@media (prefers-reduced-motion: reduce) { .lp--reveal .lp-rv { opacity: 1; transform: none; transition: none; } }

/* ═══ NHÃN BANNER “Hệ thống chấm điểm cho PD & BA” — điểm chú ý ═══
   Vào trang: bật lên nảy nhẹ · sau đó vệt sáng lướt qua mỗi ~4,5 giây · biểu tượng ✦ lấp lánh. */
.lp-hero .lp-eyebrow { position: relative; overflow: hidden; isolation: isolate;
  background: linear-gradient(90deg, var(--bg-brand-light), rgba(255, 255, 255, 0.9)); border: 1px solid color-mix(in srgb, var(--bg-brand) 28%, transparent);
  animation: lp-eyebrow-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }
.lp-hero .lp-eyebrow::after { content: ''; position: absolute; z-index: -1; top: 0; bottom: 0; left: -40%; width: 35%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.95), transparent); transform: skewX(-20deg);
  animation: lp-eyebrow-shine 4.5s ease-in-out 1s infinite; }
.lp-hero .lp-eyebrow .ti { animation: lp-twinkle 2.4s ease-in-out infinite; transform-origin: center; }
@keyframes lp-eyebrow-pop { 0% { opacity: 0; transform: translateY(6px) scale(0.85); } 100% { opacity: 1; transform: none; } }
@keyframes lp-eyebrow-shine { 0% { left: -40%; } 35%, 100% { left: 120%; } }
@keyframes lp-twinkle { 0%, 100% { transform: scale(1) rotate(0); opacity: 1; } 40% { transform: scale(1.3) rotate(20deg); opacity: 0.75; } 60% { transform: scale(0.95) rotate(-8deg); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .lp-hero .lp-eyebrow, .lp-hero .lp-eyebrow::after, .lp-hero .lp-eyebrow .ti { animation: none; } }

/* ═══ GÕ CHỮ 2 TỪ NHẤN ═══ bản ẩn giữ đúng bề rộng · bản đang gõ chồng lên */
.lp-tw { display: inline-grid; }
.lp-tw__ghost, .lp-tw__live { grid-area: 1 / 1; white-space: nowrap; }
.lp-tw__ghost { visibility: hidden; }
.lp-tw__caret { display: inline-block; width: 3px; height: 0.85em; margin-left: 3px; vertical-align: -0.06em; border-radius: 2px; background: currentColor; animation: lp-tw-blink 0.9s steps(1) infinite; }
@keyframes lp-tw-blink { 50% { opacity: 0; } }

/* Menu: mặt AVA cạnh “Trợ lý AVA” — rê chuột thì vòng sáng AI chạy quanh (border-beam-round của mds-ui) */
.lp-nav__ava { width: 20px; height: 20px; margin-right: 6px; flex-shrink: 0; }
.lp-nav__ava :deep(svg) { width: 20px; height: 20px; }

/* ═══ MỌI CARD: KHÔNG VIỀN — chỉ bóng đổ mềm (đè các quy tắc kính / nền section phía trên) ═══
   --card-shadow: nhẹ · --card-shadow-lg: card lớn (bảng điểm mẫu, chấm thử) · hover: nổi thêm chút. Đường chia bên trong card giữ nguyên. */
.lp { --card-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px -10px rgba(16, 24, 40, 0.12);
      --card-shadow-lg: 0 2px 6px rgba(16, 24, 40, 0.04), 0 20px 48px -16px rgba(16, 24, 40, 0.18);
      --card-shadow-hover: 0 2px 4px rgba(16, 24, 40, 0.04), 0 16px 36px -12px rgba(16, 24, 40, 0.18); }
.lp .lp-sec .lp-factor, .lp .lp-sec .lp-stage, .lp .lp-sec .lp-eq__box:not(.lp-eq__box--result), .lp .lp-sec .lp-seg, .lp .lp-mock-switch { border: none; box-shadow: var(--card-shadow); }
.lp .lp-sec .lp-factor:hover, .lp .lp-sec .lp-stage:hover { box-shadow: var(--card-shadow-hover); }
.lp .lp-hero .lp-mock, .lp .lp-sec .lp-calc { border: none; box-shadow: var(--card-shadow-lg); }
.lp .lp-sec--dark .lp-chat { border: none; }

/* Trình duyệt không hỗ trợ kính mờ → nền trắng đặc hơn cho dễ đọc */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .lp { --glass-bg: rgba(255, 255, 255, 0.92); --glass-bg-strong: #fff; }
}
</style>
