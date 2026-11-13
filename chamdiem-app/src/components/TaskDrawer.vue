<template>
  <Teleport to="body">
    <Transition name="drawer">
      <aside v-if="task" class="drawer" :class="{ 'drawer--resizing': resizing }" :style="{ width: drawerWidth + 'px' }" tabindex="-1" ref="rootEl">
        <!-- Kéo mép trái để đổi bề rộng (nhấp đúp = về mặc định) -->
        <div class="drawer__resize" v-tip="'Kéo để đổi bề rộng · nhấp đúp để về mặc định'" @mousedown.prevent="startResize" @dblclick="resetWidth" />
        <!-- Header + điểm: ghim cố định, không cuộn theo nội dung -->
        <div class="drawer__head">
          <div class="drawer__head-row">
            <!-- Tiêu đề = Nội dung công việc: bấm vào để sửa trực tiếp (Enter lưu · Esc hủy) -->
            <div class="drawer__title-wrap">
              <AppTextarea v-if="editingTitle" ref="titleInput" v-model="draft.content" class="drawer__title-input" autosize :min-height="32" :max-height="200"
                :state="errors.content ? 'error' : 'default'" @focusout="finishTitle" @keydown="onTitleKey" />
              <button v-else-if="canEditTitle" class="drawer__title drawer__title--editable" type="button" v-tip="'Bấm để sửa nội dung'" aria-label="Bấm để sửa nội dung" @click="startTitle">
                {{ task.content || 'Công việc chưa có nội dung' }}
              </button>
              <span v-else class="drawer__title" v-tip="task.content">{{ task.content || 'Công việc chưa có nội dung' }}</span>
              <span v-if="errors.content" class="drawer__title-error">{{ errors.content }}</span>
            </div>
            <div class="drawer__head-actions">
              <DropdownMenu v-if="moreMenu.length" :items="moreMenu" placement="bottom-end" :min-width="170" @select="onMore">
                <template #trigger="{ toggle }">
                  <button class="btn-icon" v-tip="'Thao tác khác'" aria-label="Thao tác khác" @click.stop="toggle"><TIcon name="dots" /></button>
                </template>
              </DropdownMenu>
              <button class="btn-icon" v-tip="'Đóng (Esc)'" aria-label="Đóng (Esc)" @click="$emit('close')"><TIcon name="x" /></button>
            </div>
          </div>

          <div class="score-bar">
            <!-- Điểm BA (giai đoạn Phân tích) — Điểm thực nhận tự tính khi PO nhập đủ -->
            <template v-if="showBa">
              <span class="score-bar__item">Điểm thực nhận <strong class="score-bar__final">{{ baScoreText }}</strong><span class="score-bar__tip"><InfoTip :text="baTip.text" :items="baTip.items" :note="baTip.note" /></span></span>
              <span v-if="showPd" class="score-bar__sep" />
            </template>
            <!-- ⓘ giải thích cụ thể Điểm / Điểm sau đánh giá được tính từ các tham số bên dưới -->
            <template v-if="showPd">
              <span class="score-bar__item">Điểm PD <strong>{{ fmtNum(score) }}</strong><span class="score-bar__tip"><InfoTip :text="scoreTip.text" :items="scoreTip.items" :note="scoreTip.note" /></span></span>
              <span class="score-bar__sep" />
              <span class="score-bar__item">Sau đánh giá <strong class="score-bar__final">{{ fmtNum(finalScore) }}</strong><span class="score-bar__tip"><InfoTip :text="finalTip.text" :items="finalTip.items" :note="finalTip.note" /></span></span>
            </template>
            <!-- Trạng thái: bấm tag để chọn (giai đoạn thiết kế, có quyền) — thay cho trường “Trạng thái” riêng bên dưới · giai đoạn phân tích: tự chuyển, chỉ xem -->
            <DropdownMenu v-if="canChangeStatus" class="score-bar__status" :items="statusItems" :active-id="statusLabel" placement="bottom-end" :min-width="220" @select="it => changeStatus(it.id)">
              <template #trigger="{ toggle, isOpen }">
                <button type="button" class="score-bar__status-btn" :class="{ 'score-bar__status-btn--open': isOpen }" v-tip="'Bấm để đổi trạng thái'" @click.stop="toggle">
                  <AppTag :label="statusLabel" :color="statusMeta?.color ?? 'neutral'" :dot="true" /><TIcon name="chevron-down" />
                </button>
              </template>
            </DropdownMenu>
            <AppTag v-else class="score-bar__status" :label="statusLabel" :color="statusMeta?.color ?? 'neutral'" :dot="true" v-tip="statusTip" />
          </div>
          <p v-if="locked && phase === 'design'" class="head-note head-note--lock">
            <TIcon name="lock" />Điểm tháng {{ lockedMonth }} của PD đã được chốt — không thể chỉnh sửa.
            <button class="head-note__link" type="button" @click="openClosing">{{ canReopen ? 'Xem / mở chốt' : 'Xem bảng điểm đã chốt' }}</button>
            <InfoTip v-if="!canReopen" text="Chỉ quản lý trực tiếp của PD hoặc Quản trị mới mở chốt được." />
          </p>
          <p v-else-if="phase === 'analysis' && baMissing.length" class="head-note head-note--warn">
            <TIcon name="alert-triangle" />
            <span>Thiếu {{ baMissing.length }} trường để có Điểm thực nhận:</span>
            <span v-for="(k, i) in baMissing" :key="k" class="head-note__item">
              <button class="head-note__link" type="button" @click="focusField(k)">{{ BA_FIELD_LABELS[k] }}</button>{{ i < baMissing.length - 1 ? ',' : '' }}
            </span>
          </p>
          <p v-else-if="phase === 'design' && missing.length" class="head-note head-note--warn">
            <TIcon name="alert-triangle" />
            <span>Thiếu {{ missing.length }} trường để có Điểm PD:</span>
            <span v-for="(k, i) in missing" :key="k" class="head-note__item">
              <button class="head-note__link" type="button" v-tip="SCORE_FIELD_EFFECT[k]" :aria-label="SCORE_FIELD_EFFECT[k]" @click="focusField(k)">{{ SCORE_FIELD_LABELS[k] }}</button>{{ i < missing.length - 1 ? ',' : '' }}
            </span>
          </p>
        </div>

        <div class="drawer__tabs">
          <button class="sub-nav-tab" :class="{ active: tab === 'info' }" @click="tab = 'info'">Thông tin</button>
          <button class="sub-nav-tab" :class="{ active: tab === 'history' }" @click="tab = 'history'">
            Lịch sử<span v-if="historyCount" class="tab-count">{{ historyCount }}</span>
          </button>
        </div>

        <div v-if="tab === 'history'" class="drawer__body">
          <HistoryList :task-id="task.id" />
        </div>

        <div v-else ref="bodyEl" class="drawer__body">
          <!-- Giai đoạn: đầu tiên, 1 dòng — quyết định các trường bên dưới -->
          <StagePicker :model-value="stage" :readonly="st('stage') === 'readonly'" @update:model-value="changeStage" />
          <!-- Việc 2 giai đoạn: Phân tích → Duyệt → Thiết kế -->
          <ol v-if="stage === 'both'" class="stepper">
            <li v-for="(s, i) in steps" :key="s.label" class="stepper__step" :class="`stepper__step--${s.state}`">
              <span class="stepper__dot"><TIcon v-if="s.state === 'done'" name="check" /><template v-else>{{ i + 1 }}</template></span>
              <span class="stepper__label">{{ s.label }}</span>
            </li>
          </ol>
          <!-- ⓪ Giai đoạn Phân tích đang làm: trường chấm điểm BA + duyệt -->
          <section v-if="phase === 'analysis'" class="sec sec--score" :class="{ 'sec--incomplete': baMissing.length }">
            <span class="sec__title"><TIcon name="clipboard-list" />Phân tích · BA</span>
            <p v-if="baLocked" class="head-note head-note--lock"><TIcon name="lock" />Điểm BA tháng {{ baLockedMonth }} đã chốt — phần phân tích không sửa được (mở chốt ở Tổng hợp điểm → Điểm BA).</p>
            <BaPhaseFields :task="task" @commit="commit" />
            <!-- Việc 2 giai đoạn: PO / quản lý trực tiếp của BA duyệt rồi mới chuyển cho PD -->
            <div v-if="stage === 'both'" class="approve">
              <template v-if="canApprove">
                <span class="approve__text">{{ baMissing.length ? 'Nhập đủ BA Point, deadline, ngày hoàn thành và kết quả chất lượng để duyệt.' : 'Đã đủ thông tin — duyệt để chuyển sang PD thiết kế.' }}</span>
                <button class="btn btn--primary btn--sm" type="button" :disabled="!!baMissing.length" @click="approveOpen = true"><TIcon name="circle-check" />Duyệt & chuyển thiết kế</button>
              </template>
              <span v-else class="approve__text"><TIcon name="info-circle" />PD bắt đầu thiết kế sau khi PO hoặc quản lý trực tiếp của BA duyệt giai đoạn phân tích.</span>
            </div>
          </section>

          <!-- Việc 2 giai đoạn đã sang thiết kế: xem lại / sửa phần Phân tích (PO, quản lý trực tiếp của BA) -->
          <details v-if="stage === 'both' && phase === 'design'" class="ba-done">
            <summary class="ba-done__sum">
              <TIcon name="chevron-right" class="ba-done__chev" /><TIcon name="clipboard-list" />
              <span class="ba-done__title">Phân tích · BA</span>
              <span class="ba-done__meta">Điểm thực nhận <strong>{{ baScoreText }}</strong>{{ reviewedText }}</span>
            </summary>
            <div class="ba-done__body">
              <BaPhaseFields :task="task" @commit="commit" />
              <button v-if="canApprove" class="btn btn--link btn--sm ba-done__reopen" type="button" @click="commit('baStatus', '')"><TIcon name="refresh" />Mở lại giai đoạn phân tích</button>
            </div>
          </details>

          <!-- ① Các trường quyết định điểm — khối nền xám (thiếu trường → nền vàng); không tiêu đề nhóm cho gọn -->
          <section v-if="phase === 'design'" class="sec sec--score" :class="{ 'sec--incomplete': missing.length }">
            <span v-if="stage === 'both'" class="sec__title"><TIcon name="pencil" />Thiết kế · PD</span>
            <div class="grid">
              <!-- Thứ tự theo mức cập nhật: số màn + ngày hoàn thành (PD điền ở mọi việc) → mô tả giải pháp + độ phức tạp → người đưa giải pháp + mức hài lòng → dự án phụ trách, điểm nhập tay (hiếm) -->
              <TipField field="screens" label="Màn hình chính" :highlight="need('screens')" :tip="MAIN_SCREEN_HINT">
                <AppNumberbox v-model="draft.mainScreens" :min="0" :state="st('mainScreens', warn('screens'))" @change="commitNumber('mainScreens')" @focusout="commitNumber('mainScreens')" />
              </TipField>
              <TipField label="Màn hình phụ" :tip="SUB_SCREEN_HINT">
                <AppNumberbox v-model="draft.subScreens" :min="0" :state="st('subScreens', warn('screens'))" @change="commitNumber('subScreens')" @focusout="commitNumber('subScreens')" />
              </TipField>
              <TipField field="completedDate" label="Ngày hoàn thành" :highlight="need('completedDate')" :tip="`${COMPLETED_DATE_HINT} Chưa có → chưa được tính vào tháng nào.`" :message="errors.completedDate">
                <AppDatebox :model-value="task.completedDate" :state="st('completedDate', errors.completedDate || warn('completedDate'))" @update:model-value="onCompletedDate" />
              </TipField>
              <TipField field="platform" label="Nền tảng" :highlight="need('platform')" :tip="platformTip">
                <AppCombobox :model-value="task.platform" :options="PLATFORMS" placeholder="Chọn" :state="st('platform', warn('platform'))" @update:model-value="v => commit('platform', v)" />
              </TipField>
              <!-- Mô tả giải pháp sơ bộ → AI đánh giá độ phức tạp theo quy tắc chấm điểm (ô trống → tự điền, khác → gợi ý Áp dụng) -->
              <SolutionBriefField :key="task.id" v-model="draft.solutionBrief" class="span-2" :state="st('solutionBrief')" :ai-enabled="aiEnabled"
                :analyzed="!!aiCx.level && aiCx.key === briefKey()" :loading="aiCx.loading" @commit="commitText('solutionBrief')" @analyze="aiSuggest(true)" />
              <div v-if="aiEnabled && (aiCx.loading || aiCx.level || aiCx.error)" class="span-2 ai-cx" :class="{ 'ai-cx--error': aiCx.error }">
                <TIcon :name="aiCx.loading ? 'loader-2' : aiCx.error ? 'circle-x' : 'sparkles'" :class="{ 'ai-cx__spin': aiCx.loading, 'ti--ai': !aiCx.error }" />
                <span v-if="aiCx.loading" class="ai-cx__text"><span class="text-ai-primary">AI đang đánh giá độ phức tạp…</span></span>
                <span v-else-if="aiCx.error" class="ai-cx__text">{{ aiCx.error }}</span>
                <span v-else class="ai-cx__text"><span class="text-ai-primary">AI gợi ý:</span> <AppTag :label="aiCx.level" color="brand" /><template v-if="aiCx.business"> · nghiệp vụ <AppTag :label="aiCx.business" color="neutral" /></template>
                  <template v-if="aiCx.applied && task.complexity === aiCx.level"> · đã chọn</template> — {{ aiCx.reason }}</span>
                <button v-if="!aiCx.loading && aiCx.level && task.complexity !== aiCx.level && canEditField(task, 'complexity')" type="button" class="btn btn--link btn--sm" @click="commit('complexity', aiCx.level); if (aiCx.business) commit('businessLevel', aiCx.business); aiCx.applied = true">Áp dụng</button>
                <button v-if="!aiCx.loading" type="button" class="btn btn--link btn--sm" @click="aiSuggest(true)">Gợi ý lại</button>
              </div>
              <TipField field="complexity" label="Độ phức tạp thiết kế" :highlight="need('complexity')" :tip-items="complexityCriteria(task.complexity)" :tip="complexityTip(task.complexity)" :tip-note="`${COMPLEXITY_NOTE} ${COMPLEXITY_TIE}`">
                <AppCombobox :model-value="task.complexity" :options="COMPLEXITY_OPTIONS" placeholder="Chọn" :state="st('complexity', warn('complexity'))" @update:model-value="v => commit('complexity', v)" />
              </TipField>
              <!-- Hệ số nghiệp vụ: độ khó HIỂU nghiệp vụ (phụ, × 1 / 1,1 / 1,2) — bỏ trống = Bình thường -->
              <TipField field="businessLevel" label="Hệ số nghiệp vụ" :tip="BUSINESS_HINT">
                <AppCombobox :model-value="task.businessLevel || DEFAULT_BUSINESS" :options="BUSINESS_OPTIONS" :clearable="false" :state="st('businessLevel')" @update:model-value="v => commit('businessLevel', v)" />
              </TipField>
              <TipField field="solutionBy" label="Người đưa giải pháp" :highlight="need('solutionBy')" :tip-items="solutionCriteria(task.solutionBy)" :tip="task.solutionBy ? `Tiêu chí “${task.solutionBy}”:` : 'Chọn BA / PD và BA / PD theo mức đóng góp giải pháp của PD — chọn để xem tiêu chí chi tiết. Chưa chọn → Điểm = 0.'">
                <AppCombobox :model-value="task.solutionBy" :options="SOLUTION_ROLES" placeholder="Chọn" :state="st('solutionBy', warn('solutionBy'))" @update:model-value="v => commit('solutionBy', v)" />
              </TipField>
              <!-- Vai trò của Lead: chỉ hiện khi PD có Lead (quản lý trực tiếp bộ phận PD) — Lead tự chọn; mặc định Không tham gia (0 điểm dẫn dắt) -->
              <TipField v-if="taskLeads.length || leadRoleOf(task)" field="leadRole" :label="taskLeads.length === 1 ? `Vai trò của Lead (${taskLeads[0].name})` : 'Vai trò của Lead'" :tip="leadTip">
                <AppCombobox :model-value="leadRoleOf(task)" :options="LEAD_ROLE_OPTIONS" :clearable="false" :state="st('leadRole')" @update:model-value="onLeadRole" />
              </TipField>
              <TipField field="qualityRating" label="Mức hài lòng" :highlight="need('qualityRating')" :tip="`Đánh giá chất lượng thiết kế và phối hợp của PD. ${ratingTip}`">
                <AppCombobox :model-value="task.qualityRating" :options="ratingOptions" placeholder="Chưa đánh giá"
                  :state="st('qualityRating', warn('qualityRating'))" @update:model-value="v => commit('qualityRating', v)" />
              </TipField>
              <TipField v-if="reasonRequired || task.ratingReason || draft.ratingReason" class="span-2" label="Lý do đánh giá" :required="reasonRequired" tip="Bắt buộc điền với mức Không hài lòng, Rất hài lòng."
                :message="reasonMissing ? `Bắt buộc nhập lý do khi đánh giá “${task.qualityRating}”` : ''" message-type="warning">
                <AppTextarea v-model="draft.ratingReason" :min-height="40" placeholder="Nhập lý do đánh giá"
                  :state="st('ratingReason', reasonMissing ? 'warning' : '')" @focusout="commitText('ratingReason')" />
              </TipField>
              <!-- Là dự án phụ trách: checkbox (tick = Có · bỏ tick = hỗ trợ dự án khác, × hệ số) — còn trống (chưa có PD) → gạch ngang “chưa chọn” -->
              <TipField field="isOwnProject" class="span-2" label="Dự án phụ trách" :highlight="need('isOwnProject')" :tip="ownTip">
                <AppCheckbox :model-value="task.isOwnProject !== 'Không'" :indeterminate="!task.isOwnProject" :disabled="st('isOwnProject') === 'readonly'"
                  :label="`Là dự án phụ trách của PD${task.isOwnProject === 'Không' ? ` — đang tính hỗ trợ dự án khác (× ${fmt(db.config.ownProject?.['Không'] ?? 1.2).replace('.', ',')})` : ''}`"
                  @update:model-value="v => commit('isOwnProject', v ? 'Có' : 'Không')" />
              </TipField>
              <TipField label="Điểm nhập tay" tip="Dùng cho việc phát sinh ngoài quy tắc chấm điểm / không đếm được màn hình (nghiên cứu, khảo sát, workshop, hỗ trợ demo, review…). Có giá trị → bỏ qua công thức và mọi hệ số, đây chính là Điểm sau đánh giá; khi đó chỉ cần thêm Ngày hoàn thành. PO / Quản trị dự án nhập.">
                <AppNumberbox v-model="draft.manualScore" :min="0" decimal :stepper="false" placeholder="Theo công thức"
                  :state="st('manualScore')" @change="commitManual" @focusout="commitManual" />
              </TipField>
            </div>
          </section>


          <!-- ② Thông tin chung: Deadline thiết kế | PBI · PD | BA · Trạng thái · Concept -->
          <section class="sec">
            <div class="grid">
              <TipField label="Deadline thiết kế" tip="Hạn hoàn thành phần thiết kế của PD — dùng cho danh sách Việc sắp đến hạn ở Tổng quan.">
                <AppDatebox :model-value="task.expectedDate" :state="st('expectedDate')" @update:model-value="v => commit('expectedDate', v)" />
              </TipField>
              <TipField label="PBI">
                <AppTextbox v-model="draft.pbi" placeholder="Mã PBI" :state="st('pbi')" @focusout="commitText('pbi')" @keydown.enter="commitText('pbi')" />
              </TipField>
              <TipField v-if="hasDesign(task)" label="PD" :required="stage === 'design'">
                <template v-if="canClaim(task, 'pd')" #action><button type="button" class="btn btn--link btn--sm" @click="claim('pd')"><TIcon name="user-plus" />Nhận việc</button></template>
                <AppCombobox :empty-option="stage !== 'design' ? 'Chưa giao PD' : ''" :model-value="task.pdId" :options="pdOptions" recent-key="pick-pd" placeholder="Chọn PD" :state="st('pdId')" @update:model-value="v => commit('pdId', v)" />
              </TipField>
              <TipField label="BA" :required="hasAnalysis(task)" :tip="baTipText">
                <template v-if="canClaim(task, 'ba')" #action><button type="button" class="btn btn--link btn--sm" @click="claim('ba')"><TIcon name="user-plus" />Nhận việc</button></template>
                <AppCombobox :empty-option="hasAnalysis(task) ? '' : 'Chưa gán BA'" :model-value="task.baId" :options="baOptions" recent-key="pick-ba" placeholder="Chọn BA" :state="st('baId')" @update:model-value="changeBa" />
              </TipField>
              <TipField v-if="stage !== 'analysis'" class="span-2" label="Concept" tip="Mô tả giải pháp / concept, link Google AI Studio, wireframe… Không ảnh hưởng điểm.">
                <AppTextarea v-model="draft.concept" :min-height="40" :max-height="320" autosize placeholder="Mô tả concept" :state="st('concept')" @focusout="commitText('concept')" />
              </TipField>
            </div>
          </section>

          <!-- ③ Liên kết: nhãn + “Thêm link thiết kế”; mỗi link nhập vào → Link devmode (thêm m=dev) tự sinh ngay bên dưới -->
          <section v-if="phase === 'design'" class="sec">
            <div class="links">
              <span class="links__label">Link thiết kế</span>
              <button v-if="canLinks" class="btn btn--link links__add" type="button" @click="addLink"><TIcon name="plus" />Thêm link thiết kế</button>
              <p v-if="!links.length && !canLinks" class="links__empty">Chưa có link thiết kế</p>
              <!-- Link mới thêm nằm ngay dưới nút “Thêm”, link cũ đẩy xuống (thứ tự lưu vẫn cũ → mới) -->
              <div v-for="{ l, i } in linksNewestFirst" :key="l.key" class="links__item">
                <div class="link-row">
                  <AppTextbox v-model="l.design" type="url" class="link-row__box link-input" placeholder="Dán link thiết kế (Figma…)"
                    :state="canLinks ? 'default' : 'readonly'" @focusout="commitLink(i)" @keydown.enter="commitLink(i)" />
                  <a v-if="l.design" class="btn-icon btn-icon--outline" :href="l.design" target="_blank" rel="noopener" v-tip="'Mở link thiết kế'"><TIcon name="external-link" /></a>
                  <button v-if="canLinks" class="btn-icon btn-icon--outline btn-icon--danger" type="button" v-tip="'Bỏ link này'" aria-label="Bỏ link này" @click="removeLink(i)"><TIcon name="trash" /></button>
                </div>
                <div v-if="l.devmode" class="links__dev">
                  <span class="links__dev-label">Devmode</span>
                  <a :href="l.devmode" target="_blank" rel="noopener" class="links__dev-url" v-tip="l.devmode">{{ l.devmode }}</a>
                </div>
              </div>
            </div>
          </section>
        </div>

      </aside>
    </Transition>
  </Teleport>

  <!-- Duyệt & chuyển thiết kế: chọn PD (nếu chưa có) -->
  <DialogShell v-if="approveOpen && task" title="Duyệt & chuyển thiết kế" :width="460" :tab-fields-only="false" @close="approveOpen = false">
    <div class="approve-form">
      <p class="approve-form__text">Giai đoạn phân tích được duyệt với <strong>Điểm thực nhận {{ baScoreText }}</strong>. Công việc chuyển sang <strong>PD thiết kế</strong>.</p>
      <TipField label="PD thiết kế" :required="true" :message="approveErr">
        <AppCombobox v-model="approvePd" :options="pdOptions" recent-key="pick-pd" placeholder="Chọn PD" :state="approveErr ? 'error' : 'default'" />
      </TipField>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="approveOpen = false">Hủy</button>
      <button class="btn btn--primary" @click="approve">Duyệt & chuyển</button>
    </template>
  </DialogShell>

  <!-- Chuyển công việc đang xem sang vòng lặp khác (menu ⋯) — dùng chung hộp thoại chuyển hàng loạt -->
  <MoveTasksDialog v-if="moving && task" :task-ids="[task.id]" :project-id="task.projectId" :from-id="task.iterationId" @close="moving = false" />
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { fmtNum } from '@mds/utils/number.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { aiEnabled, suggestComplexity } from '../store/ai.js'
import { toast } from '@mds/utils/toast.js'
import { splitPbiContent } from '../store/importCore.js'
import { fieldsOnlyTab } from '@mds/utils/autofocus.js'
import { reactive, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import { avaCtx } from '../store/avaBus.js'
import TIcon        from '@mds/components/TIcon.vue'
import AppTag       from '@mds/components/AppTag.vue'
import AppTextbox   from '@mds/components/AppTextbox.vue'
import AppTextarea  from '@mds/components/AppTextarea.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import AppDatebox   from '@mds/components/AppDatebox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
import SolutionBriefField from './SolutionBriefField.vue'
import TipField     from './TipField.vue'
import InfoTip      from './InfoTip.vue'
import HistoryList  from './HistoryList.vue'
import BaPhaseFields from './BaPhaseFields.vue'
import StagePicker  from './StagePicker.vue'
import DialogShell  from './DialogShell.vue'
import MoveTasksDialog from './MoveTasksDialog.vue'
import {
  DESIGN_STATUSES, DESIGN_STATUS_OPTIONS, DONE_STATUSES, OWN_PROJECT_HINT, COMPLEXITIES, PLATFORMS, SOLUTION_ROLES, YES_NO, QUALITY_RATINGS, REASON_REQUIRED,
  COMPLEXITY_NOTE, COMPLEXITY_TIE, complexityTip, COMPLEXITY_OPTIONS, BUSINESS_OPTIONS, BUSINESS_HINT, DEFAULT_BUSINESS, businessFactor, MAIN_SCREEN_HINT, SUB_SCREEN_HINT, COMPLETED_DATE_HINT,
  computeScore, computeFinalScore, screenUnits, hasManualScore, solutionFactor, isLeadSolution, leadRoleOf, LEAD_ROLE_OPTIONS, leadsOf, leadRates,
  missingScoreFields, SCORE_FIELD_LABELS, FIELD_LABELS, SCORE_FIELD_EFFECT, statusColor, solutionCriteria, complexityCriteria, monthLabelOf, round,
  cleanLinks, autoDevmodeLink, sameValue,
  STAGES, stageOf, hasAnalysis, hasDesign, phaseOf, taskStatusOf, taskStatusMeta, BA_STATUSES, BA_APPROVED, baScoreOf, missingBaFields, BA_FIELD_LABELS,
} from '../store/scoring.js'
import { baConfigOf } from '../store/baScoring.js'
import { canAddTask, performerOptions, baPerformerOptions,
  db, projectById, iterationById, membersOf, canEditField, canDeleteTask, isTaskLocked, historyOf,
  updateTaskField, updateTaskFields, closedDateError, canBulkTask, iterationsOf, canReopenPd, canApproveBa, userName, isBaLocked, ensureTask, ensureHistory, taskById, canClaim, claimTask, userById, setLeadRole } from '../store/db.js'
import { useRouter } from 'vue-router'

const props = defineProps({ taskId: { type: String, default: null } })
// Báo AVA công việc đang mở (để “gợi ý rồi chọn luôn vào việc này”)
watch(() => props.taskId, id => { avaCtx.taskId = id || '' }, { immediate: true })
onBeforeUnmount(() => { if (avaCtx.taskId === props.taskId) avaCtx.taskId = '' })
const emit = defineEmits(['close', 'delete', 'duplicate'])

/* ── Đổi bề rộng drawer (kéo mép trái), nhớ cho lần sau ── */
const W_KEY = 'pdpoint-task-drawer-w2', W_DEFAULT = 680, W_MIN = 520   // w2: mặc định rộng hơn (đỡ xuống dòng) → áp lại cho mọi người 1 lần
const clampW = w => Math.round(Math.min(Math.max(w, W_MIN), window.innerWidth * 0.9))
const drawerWidth = ref((() => { try { return clampW(Number(localStorage.getItem(W_KEY)) || W_DEFAULT) } catch { return W_DEFAULT } })())
const resizing = ref(false)
function startResize() {
  resizing.value = true
  const move = e => { drawerWidth.value = clampW(window.innerWidth - e.clientX) }
  const up = () => {
    resizing.value = false
    window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up)
    try { localStorage.setItem(W_KEY, String(drawerWidth.value)) } catch { /* bỏ qua */ }
  }
  window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
}
function resetWidth() { drawerWidth.value = W_DEFAULT; try { localStorage.removeItem(W_KEY) } catch { /* bỏ qua */ } }

const task = computed(() => taskById(props.taskId) ?? null)
useEscClose(() => emit('close'), () => !!task.value)   // ESC đóng drawer (lớp trên cùng)
watch([() => props.taskId, () => db.loadGen], ([id]) => { ensureTask(id); ensureHistory(id) }, { immediate: true })   // việc / lịch sử chưa tải → tải
const tab  = ref('info')

// Thao tác khác: Nhân bản (người được thêm việc) · Chuyển vòng lặp · Xóa (quyền xóa)
// Chuyển vòng lặp: cùng quyền với chuyển hàng loạt (Quản trị dự án · Thành viên với việc mình thêm), dự án có ≥ 2 vòng lặp, việc chưa thuộc tháng đã chốt
const canMove = computed(() => !!task.value && canBulkTask(task.value) && !isTaskLocked(task.value) && iterationsOf(task.value.projectId).length > 1)
const moving = ref(false)
const moreMenu = computed(() => [
  ...(task.value && canAddTask(task.value.projectId) ? [{ id: 'duplicate', icon: 'copy', label: 'Nhân bản công việc' }] : []),
  ...(canMove.value ? [{ id: 'move', icon: 'arrows-exchange', label: 'Chuyển sang vòng lặp khác' }] : []),
  ...(canDelete.value ? [{ id: 'delete', icon: 'trash', label: 'Xóa công việc', danger: true }] : []),
])
const onMore = item => { if (item.id === 'move') moving.value = true; else emit(item.id, task.value) }
const canDelete     = computed(() => !!task.value && canDeleteTask(task.value))
const locked        = computed(() => isTaskLocked(task.value))
/* Người mở chốt được → màn Tổng hợp điểm; người khác → Tổng quan (xem bảng điểm đã chốt) — đúng tháng + PD */
const router    = useRouter()
const canReopen = computed(() => !!task.value?.pdId && canReopenPd(task.value.pdId))
function openClosing() {
  const t = task.value
  emit('close')
  router.push({ path: canReopen.value ? '/chot-diem' : '/', query: { thang: t.completedDate.slice(0, 7), pd: t.pdId } })
}
const lockedMonth   = computed(() => task.value?.completedDate ? monthLabelOf(task.value.completedDate.slice(0, 7)) : '')
const historyCount  = computed(() => task.value ? historyOf(task.value.id).length : 0)

const pdOptions     = computed(() => performerOptions(task.value?.projectId))
const baOptions     = computed(() => baPerformerOptions(task.value?.projectId))
/* ── Giai đoạn: Chỉ thiết kế (như cũ) · Chỉ phân tích · Phân tích → Thiết kế ── */
const stage      = computed(() => stageOf(task.value))
const phase      = computed(() => (task.value ? phaseOf(task.value) : 'design'))
const showBa     = computed(() => !!task.value && hasAnalysis(task.value))
const showPd     = computed(() => !!task.value && hasDesign(task.value) && (stage.value === 'design' || phase.value === 'design'))
const canApprove = computed(() => canApproveBa(task.value))
// Ô BA: việc có phân tích đã có kết quả → đổi người = chuyển Điểm BA sang người mới
const baHasResult = computed(() => !!task.value && hasAnalysis(task.value) && (!!task.value.baCompletedDate || task.value.baStatus === BA_APPROVED))
const baTipText = computed(() => {
  if (!task.value || !hasAnalysis(task.value)) return 'Người đánh giá chất lượng thiết kế (không tính điểm BA).'
  if (isBaLocked(task.value)) return 'Người phân tích — Điểm BA tháng này đã chốt, không đổi được (mở chốt trước).'
  return baHasResult.value ? 'Người phân tích — đã có kết quả: chỉ PO hoặc quản lý trực tiếp đổi được; đổi người thì Điểm thực nhận chuyển sang người mới.' : 'Người phân tích — được tính Điểm thực nhận.'
})
/* Nhận việc chưa có người thực hiện (gán chính mình) */
function claim(slot) {
  const r = claimTask(task.value, slot)
  r === true ? toast.success(slot === 'pd' ? 'Đã nhận việc — bạn là PD thực hiện' : 'Đã nhận việc — bạn là BA phân tích') : toast.warning(r)
}
function changeBa(v) {
  const was = task.value?.baId
  commit('baId', v)
  if (baHasResult.value && was && v !== was && task.value?.baId === v) toast.info(`Điểm thực nhận của việc này đã chuyển từ ${userName(was) || '—'} sang ${userName(v) || '—'}`)
}
const baLocked   = computed(() => !!task.value && isBaLocked(task.value))
const baLockedMonth = computed(() => (task.value?.baCompletedDate ? monthLabelOf(task.value.baCompletedDate.slice(0, 7)) : ''))
const stageOptions = STAGES.map(x => ({ value: x.value, label: x.label, description: x.hint }))
const statusLabel  = computed(() => (task.value ? taskStatusOf(task.value) : ''))
const statusMeta   = computed(() => (task.value ? taskStatusMeta(task.value) : null))
// Trạng thái theo giai đoạn đang làm; “Đã duyệt” chỉ hiện cho người được duyệt (việc 2 giai đoạn duyệt bằng nút riêng)
// Giai đoạn phân tích: trạng thái tự suy (chỉ xem) · thiết kế: chọn như cũ
const statusOptions = computed(() => (phase.value === 'analysis' ? [statusLabel.value] : DESIGN_STATUS_OPTIONS))
function changeStatus(v) { if (phase.value === 'design') commit('designStatus', v) }
// Chọn trạng thái ngay trên tag ở đầu bảng (thay trường riêng): chỉ giai đoạn thiết kế + có quyền sửa
const canChangeStatus = computed(() => !!task.value && phase.value === 'design' && st('designStatus') !== 'readonly')
const statusItems = computed(() => DESIGN_STATUS_OPTIONS.map(o => ({ id: o.value, label: o.label })))
const statusTip = computed(() => phase.value === 'analysis'
  ? (stage.value === 'both' ? 'Tự chuyển: Đang phân tích → Chờ duyệt (khi có ngày hoàn thành). PO hoặc quản lý trực tiếp của BA bấm “Duyệt & chuyển thiết kế”.' : 'Tự chuyển: Đang phân tích → Chờ chấm điểm (có ngày hoàn thành, thiếu Point / chất lượng) → Hoàn thành.')
  : 'Bạn không có quyền đổi trạng thái công việc này')
function changeStage(v) {
  const t = task.value, from = stageOf(t)
  if (v === from) return
  const baData = Number(t.baPoint) > 0 || t.baCompletedDate || t.baQuality
  const pdData = t.completedDate || Number(t.mainScreens) > 0 || Number(t.subScreens) > 0 || t.designLink
  if (from !== 'design' && v === 'design' && baData) return toast.warning('Phần phân tích đã có dữ liệu chấm điểm BA — không đổi loại việc sang “Chỉ thiết kế” được')
  if (from !== 'analysis' && v === 'analysis' && pdData) return toast.warning('Phần thiết kế đã có dữ liệu của PD — không đổi loại việc sang “Chỉ phân tích” được')
  commit('stage', v)
}
const steps = computed(() => {
  const t = task.value, approved = t?.baStatus === BA_APPROVED, designDone = DONE_STATUSES.includes(t?.designStatus)
  return [
    { label: 'Phân tích', state: approved || t?.baCompletedDate ? 'done' : 'current' },
    { label: 'Duyệt',     state: approved ? 'done' : t?.baCompletedDate ? 'current' : 'todo' },
    { label: 'Thiết kế',  state: designDone ? 'done' : approved ? 'current' : 'todo' },
  ]
})
/* Điểm BA */
const baScore     = computed(() => (task.value ? baScoreOf(task.value, db.config) : null))
const baScoreText = computed(() => (baScore.value?.actual != null ? fmtNum(baScore.value.actual) : '—'))
const baMissing   = computed(() => (task.value ? missingBaFields(task.value) : []))
const baTip = computed(() => {
  const t = task.value, w = baConfigOf(db.config).weights, r = baScore.value
  if (!t) return { text: '', items: [] }
  const items = [
    `BA Point: ${t.baPoint || 0}`,
    r ? `Tiến độ: ${r.progressRate}% → Point tiến độ ${fmt(r.progressPoint)}` : 'Tiến độ: chưa có ngày hoàn thành',
    r?.qualityRate != null ? `Chất lượng: ${r.qualityRate}% → Point chất lượng ${fmt(r.qualityPoint)}` : 'Chất lượng: chưa đánh giá',
  ]
  const note = r?.actual != null ? `= ${t.baPoint} × ${w.point}% + ${fmt(r.progressPoint)} × ${w.progress}% + ${fmt(r.qualityPoint)} × ${w.quality}% = ${fmt(r.actual)}` : 'Nhập đủ BA Point, ngày hoàn thành và kết quả chất lượng để có điểm'
  return { text: `Điểm thực nhận = BA Point × ${w.point}% + Point tiến độ × ${w.progress}% + Point chất lượng × ${w.quality}%`, items, note }
})
const reviewedText = computed(() => {
  const t = task.value
  if (!t?.baReviewedAt) return ''
  const d = new Date(t.baReviewedAt)
  return ` · duyệt bởi ${userName(t.baReviewedBy) || '—'} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
})
/* Duyệt & chuyển thiết kế */
const approveOpen = ref(false), approvePd = ref(''), approveErr = ref('')
watch(approveOpen, v => { if (v) { approvePd.value = task.value?.pdId || ''; approveErr.value = '' } })
function approve() {
  if (!approvePd.value) { approveErr.value = 'Chọn PD thiết kế'; return }
  const r = updateTaskFields(task.value.id, { pdId: approvePd.value, baStatus: BA_APPROVED })
  if (r === true) { approveOpen.value = false; flash('saved'); toast.success('Đã duyệt — chuyển sang PD thiết kế') }
  else approveErr.value = r
}
const ratingOptions = QUALITY_RATINGS.map(s => s.value)

const score      = computed(() => task.value ? computeScore(task.value, db.config) : 0)
const finalScore = computed(() => task.value ? computeFinalScore(task.value, db.config) : 0)
/* PD Lead của việc (quản lý trực tiếp thuộc bộ phận PD của PD thực hiện) */
const taskLeads = computed(() => (task.value?.pdId ? leadsOf(userById(task.value.pdId), db.users) : []))
const leadTip = computed(() => {
  const r = leadRates(db.config), p = n => fmtNum(Math.round(n * 1000) / 10) + '%'
  return `Lead nhận điểm dẫn dắt theo vai trò trong việc: Không tham gia → 0 (mặc định, VD PO giao thẳng cho PD) · Giao việc & review → ${p(r.review)} · Chốt giải pháp → ${p(r.solution)} Điểm sau đánh giá của việc. Chốt giải pháp thì PD vẽ theo không bị trừ: hệ số người đưa giải pháp tính tối thiểu như “PD và BA”.`
})
function onLeadRole(v) {
  if (!task.value) return
  const t = task.value, prev = { leadRole: t.leadRole ?? '', ...(t.leadSolution ? { leadSolution: t.leadSolution } : {}) }
  const r = setLeadRole(t.id, v || '')
  if (r === true) { flash('saved'); queueUndo(t.id, prev) } else toast.error(r)
}

/** Diễn giải phép tính để người dùng đối chiếu */
/* ── Giải thích điểm (tooltip ⓘ) — từng tham số đang chọn → hệ số → phép tính ra đúng con số ── */
const fmt = n => fmtNum(n)   // cùng định dạng số với thanh điểm (TT200: 1.234,5)
const scoreTip = computed(() => {
  const t = task.value, c = db.config
  if (!t) return { text: '', items: [] }
  if (hasManualScore(t)) return { text: `Điểm nhập tay: ${fmt(t.manualScore)}`, items: ['Có Điểm nhập tay → bỏ qua công thức màn hình và các hệ số; đây cũng là Điểm sau đánh giá.'] }
  const units = screenUnits(t, c)
  const f = [
    { label: 'Độ phức tạp thiết kế',  v: t.complexity,   k: c.complexity[t.complexity] },
    { label: 'Hệ số nghiệp vụ',       v: t.businessLevel || DEFAULT_BUSINESS, k: businessFactor(t, c) },
    { label: 'Người đưa giải pháp',   v: isLeadSolution(t) ? `${t.solutionBy || 'chưa chọn'} · Lead chốt giải pháp` : t.solutionBy, k: solutionFactor(t, c) },
    { label: 'Là dự án phụ trách',    v: t.isOwnProject, k: c.ownProject[t.isOwnProject] },
    { label: 'Nền tảng',              v: t.platform,     k: c.platform[t.platform] },
  ]
  const items = [
    `Số màn quy đổi: ${t.mainScreens || 0} màn chính × ${fmt(c.mainScreenPoint)} + ${t.subScreens || 0} màn phụ × ${fmt(c.subScreenPoint)} = ${fmt(units)}`,
    ...f.map(x => (x.k == null ? `${x.label}: chưa chọn → Điểm = 0` : `${x.label} “${x.v}”: × ${fmt(x.k)}`)),
  ]
  const missing = f.filter(x => x.k == null)
  const note = missing.length
    ? `Còn thiếu ${missing.map(x => x.label).join(', ')} → Điểm = 0`
    : `= ${fmt(units)} × ${f.map(x => fmt(x.k)).join(' × ')} = ${fmt(score.value)}`
  return { text: 'Điểm = Số màn quy đổi × Độ phức tạp × Người đưa giải pháp × Là dự án phụ trách × Nền tảng', items, note }
})
const finalTip = computed(() => {
  const t = task.value, c = db.config
  if (!t) return { text: '', items: [] }
  if (hasManualScore(t)) return { text: `Điểm sau đánh giá = Điểm nhập tay = ${fmt(t.manualScore)}`, items: ['Điểm nhập tay không nhân hệ số mức hài lòng.'] }
  const scale = Object.entries(c.rating).map(([k, v]) => `${k} × ${fmt(v)}`).join(' · ')
  if (!t.qualityRating) {
    const k = c.unratedCountsAsSatisfied ? 1 : 0
    return { text: 'Điểm sau đánh giá = Điểm × hệ số mức hài lòng', items: [`Mức hài lòng: chưa đánh giá → × ${k}`, `Hệ số: ${scale}`], note: `= ${fmt(score.value)} × ${k} = ${fmt(finalScore.value)}` }
  }
  const k = c.rating[t.qualityRating]
  return { text: 'Điểm sau đánh giá = Điểm × hệ số mức hài lòng', items: [`Mức hài lòng “${t.qualityRating}”: × ${fmt(k)}`, `Hệ số: ${scale}`], note: `= ${fmt(score.value)} × ${fmt(k)} = ${fmt(finalScore.value)}` }
})
const platformTip = computed(() => PLATFORMS.map(p => `${p}: hệ số ${db.config.platform[p]}`).join(' · ') + ' (1 màn mobile = nửa màn web)')
const ownTip      = computed(() => `Có: hệ số ${db.config.ownProject['Có']} · Không (hỗ trợ dự án khác): hệ số ${db.config.ownProject['Không']}`)
const ratingTip   = computed(() => QUALITY_RATINGS.map(r => `${r.value}: ${r.note}`).join(' · ') + (db.config.unratedCountsAsSatisfied ? '' : ' · Chưa đánh giá: 0 điểm'))

const reasonRequired = computed(() => REASON_REQUIRED.includes(task.value?.qualityRating))
const reasonMissing  = computed(() => reasonRequired.value && !task.value.ratingReason?.trim())
/* ── Trường bắt buộc để có điểm ── */
const missing = computed(() => (task.value ? missingScoreFields(task.value, db.config) : []))
const need = k => missing.value.includes(k)
const warn = k => (need(k) ? 'warning' : '')

/** Bấm tên trường thiếu → về tab Thông tin, cuộn tới và đặt con trỏ vào ô đó */
const bodyEl = ref(null)
/* Tab trong drawer chỉ đi qua ô nhập (quy chuẩn form) */
watch(bodyEl, (el, _old, onCleanup) => { if (el) onCleanup(fieldsOnlyTab(el)) })
async function focusField(k) {
  tab.value = 'info'
  await nextTick()
  const el = bodyEl.value?.querySelector(`[data-field="${k}"]`)
  if (!el) return
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  el.classList.add('field-flash')
  setTimeout(() => el.classList.remove('field-flash'), 1200)
  el.querySelector('input:not([readonly]), select:not([disabled]), .cb-trigger:not([disabled])')?.focus({ preventScroll: true })
}

/* ── Bản nháp cho các ô gõ chữ / số: lưu khi rời ô (blur) hoặc Enter ── */
const TEXT_FIELDS = ['manualScore', 'pbi', 'content', 'concept', 'solutionBrief', 'designLink', 'devmodeLink', 'ratingReason', 'mainScreens', 'subScreens']
const draft  = reactive({})
const errors = reactive({})
function syncDraft() {
  TEXT_FIELDS.forEach(f => { draft[f] = task.value?.[f] ?? '' })
  Object.keys(errors).forEach(k => delete errors[k])
}
/* ── Link thiết kế: danh sách hợp nhất — link 1 lưu designLink / devmodeLink (giữ dữ liệu cũ), link 2+ lưu moreLinks ──
   Nhập / sửa link thiết kế → Link devmode tự sinh (thêm m=dev); devmode đã sửa tay trước đó thì giữ nguyên. */
let linkSeq = 0
const links = ref([])
const canLinks = computed(() => !!task.value && canEditField(task.value, 'designLink'))
function loadLinks() {
  const t = task.value
  const all = t ? [...(t.designLink || t.devmodeLink ? [{ design: t.designLink || '', devmode: t.devmodeLink || '' }] : []), ...(t.moreLinks ?? [])] : []
  links.value = all.map(x => ({ key: ++linkSeq, design: x.design, devmode: x.devmode, _design: x.design }))
}
watch(() => [props.taskId, task.value?.designLink, task.value?.devmodeLink, JSON.stringify(task.value?.moreLinks ?? [])], loadLinks, { immediate: true })
const linksNewestFirst = computed(() => links.value.map((l, i) => ({ l, i })).reverse())
function saveLinks() {
  const clean = cleanLinks(links.value), first = clean[0] ?? { design: '', devmode: '' }
  commit('designLink', first.design)
  commit('devmodeLink', first.devmode)
  commit('moreLinks', clean.slice(1))
}
function commitLink(i) {
  const l = links.value[i]; if (!l || l.design === l._design) return
  const dev = autoDevmodeLink(l._design, l.design, l.devmode)
  if (dev !== null) l.devmode = dev
  l._design = l.design
  saveLinks()
}
async function addLink() {
  links.value.push({ key: ++linkSeq, design: '', devmode: '', _design: '' })
  await nextTick(); bodyEl.value?.querySelector('.link-input input')?.focus()   // ô vừa thêm nằm trên cùng → con trỏ vào đó
}
function removeLink(i) { links.value.splice(i, 1); saveLinks() }

const rootEl = ref(null)
watch(() => props.taskId, async () => {
  syncDraft()
  editingTitle.value = false
  saveState.type = ''
  await nextTick()
  rootEl.value?.focus({ preventScroll: true })
})

/* ── Trạng thái lưu ── */
const saveState = reactive({ type: '', text: '' })
let saveTimer = null
function flash(type, text = '') {
  saveState.type = type; saveState.text = text
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { saveState.type = '' }, type === 'saved' ? 1800 : 3500)
}

const st = (field, err) => !task.value || !canEditField(task.value, field) ? 'readonly' : (err === 'warning' ? 'warning' : err ? 'error' : 'default')

function commit(field, value) {
  if (!task.value || sameValue(task.value[field], value)) return
  const before = task.value[field]
  const r = updateTaskField(task.value.id, field, value)
  if (r === true) { flash('saved'); queueUndo(task.value.id, { [field]: before ?? '' }) }
  else toast.error(r)   // lỗi lưu → toast theo quy chuẩn chung
}

/* ── Hoàn tác: mỗi lần lưu hiện toast 8 giây có nút “Hoàn tác” (rê chuột vào thì dừng đếm).
      Các trường lưu cùng 1 lượt (VD link thiết kế + devmode, áp dụng gợi ý AI) gộp 1 toast → hoàn tác trả lại tất cả ── */
let undoBatch = null
function queueUndo(taskId, prev) {
  if (undoBatch && undoBatch.taskId === taskId) { undoBatch.prev = { ...prev, ...undoBatch.prev }; return }   // giữ giá trị TRƯỚC lần sửa đầu
  undoBatch = { taskId, prev: { ...prev } }
  queueMicrotask(() => {
    const b = undoBatch; undoBatch = null
    if (!b) return
    const keys = Object.keys(b.prev)
    const msg = keys.length === 1 && FIELD_LABELS[keys[0]] ? `Đã cập nhật “${FIELD_LABELS[keys[0]]}”` : 'Cập nhật thành công'
    toast.success(msg, { action: { label: 'Hoàn tác', icon: 'arrow-back-up', onClick: () => undo(b) } })
  })
}
function undo(b) {
  const r = updateTaskFields(b.taskId, b.prev)
  if (r !== true) return toast.error(r)
  if (task.value?.id === b.taskId) { syncDraft(); loadLinks() }   // ô đang gõ / danh sách link lấy lại giá trị cũ
  toast.info('Đã hoàn tác')
}

function onCompletedDate(v) {
  const err = closedDateError(v, task.value?.pdId)
  if (err) { errors.completedDate = err; return }
  delete errors.completedDate
  commit('completedDate', v)
}

/* ── Sửa nội dung ngay trên tiêu đề ── */
const editingTitle = ref(false)
const titleInput   = ref(null)
const canEditTitle = computed(() => !!task.value && canEditField(task.value, 'content'))
async function startTitle() {
  draft.content = task.value.content ?? ''
  editingTitle.value = true
  await nextTick()
  const t = titleInput.value?.$el?.querySelector('textarea')
  t?.focus(); t?.setSelectionRange(t.value.length, t.value.length)
}
function finishTitle() {
  if (!editingTitle.value) return
  // Nội dung sửa thành “1283922 - …” → tách mã sang PBI (việc chưa có PBI hoặc cùng mã; có quyền sửa PBI)
  const r = splitPbiContent(draft.content), cur = String(task.value?.pbi ?? '').trim()
  if (r && (!cur || cur === r.pbi) && canEditField(task.value, 'pbi')) {
    draft.content = r.content
    if (!cur) { draft.pbi = r.pbi; commitText('pbi'); toast.info(`Đã tách mã PBI ${r.pbi} sang ô PBI`) }
  }
  commitText('content')
  if (!errors.content) editingTitle.value = false
}
function onTitleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finishTitle() }
  if (e.key === 'Escape') {               // hủy sửa, không đóng drawer
    e.stopPropagation()
    draft.content = task.value.content ?? ''; delete errors.content
    editingTitle.value = false
  }
}

/* AI gợi ý độ phức tạp từ Mô tả giải pháp sơ bộ — chỉ chạy khi bấm icon ✦ trong ô */
const aiCx = reactive({ loading: false, level: '', reason: '', error: '', key: '', applied: false })
watch(() => task.value?.id, () => Object.assign(aiCx, { loading: false, level: '', reason: '', error: '', key: '', applied: false }))
const briefKey = () => `${task.value?.id}|${String(draft.solutionBrief ?? '').trim()}|${task.value?.content}`
async function aiSuggest(force = false) {
  const t = task.value
  if (!aiEnabled.value || !t) return
  const brief = String(draft.solutionBrief ?? t.solutionBrief ?? '').trim()
  if (!brief) return
  const key = briefKey()
  if (!force && aiCx.key === key) return
  Object.assign(aiCx, { loading: true, error: '', key })
  try {
    const r = await suggestComplexity({ content: t.content, brief, concept: t.concept })
    if (aiCx.key !== key) return
    Object.assign(aiCx, { level: r.level, business: r.business || '', reason: r.reason, applied: false })
    if (!t.complexity && canEditField(t, 'complexity')) { commit('complexity', r.level); if (r.business && !t.businessLevel) commit('businessLevel', r.business); aiCx.applied = true }   // ô trống → tự điền
  } catch (e) { aiCx.error = e.message || 'AI chưa gợi ý được' }
  finally { if (aiCx.key === key) aiCx.loading = false }
}

function commitText(field) {
  const value = String(draft[field] ?? '')
  if (field === 'content' && !value.trim()) {
    errors.content = 'Nội dung không được để trống — chưa lưu'
    return
  }
  delete errors[field]
  commit(field, value)
  if (field === 'designLink') draft.devmodeLink = task.value?.devmodeLink ?? ''   // devmode có thể vừa được tự điền
}

function commitManual() {
  const n = Number(draft.manualScore)
  const value = draft.manualScore === '' || draft.manualScore == null || !Number.isFinite(n) ? '' : Math.max(0, n)
  draft.manualScore = value
  commit('manualScore', value)
}

function commitNumber(field) {
  const n = Number(draft[field])
  const value = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  draft[field] = value
  commit(field, value)
}

syncDraft()
</script>

<style scoped>
.drawer {
  position: fixed; z-index: 900;
  top: var(--layout-header-h); right: var(--side-panel-w, 0px); bottom: 0;   /* chat / AVA mở → neo theo mép trang đã co */
  width: 680px; max-width: 100vw;
  display: flex; flex-direction: column;
  background: var(--bg-white);
  box-shadow: var(--shadow-dialog);
  outline: none;
}
/* Tay kéo đổi bề rộng ở mép trái: hover / đang kéo hiện vạch brand */
.drawer__resize { position: absolute; top: 0; bottom: 0; left: -3px; width: 7px; z-index: 2; cursor: col-resize; }
.drawer__resize::after { content: ''; position: absolute; top: 0; bottom: 0; left: 3px; width: 2px; background: transparent; transition: background 0.15s; }
.drawer__resize:hover::after, .drawer--resizing .drawer__resize::after { background: var(--stroke-brand); }
.drawer--resizing { user-select: none; transition: none; }

/* ── Header ghim: meta + tiêu đề + dải điểm ── */
.ai-cx { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; padding: 6px 10px; border-radius: var(--radius-default); background: var(--bg-ai-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.ai-cx > .ti { font-size: 14px; flex-shrink: 0; }
.ai-cx--error { background: var(--bg-danger-light); }
.ai-cx--error > .ti { color: var(--icon-danger); }
.ai-cx__text { flex: 1; min-width: 0; }
.ai-cx .btn { padding: 0; height: auto; }
.ai-cx__spin { animation: ai-cx-spin 0.9s linear infinite; }
@keyframes ai-cx-spin { to { transform: rotate(360deg); } }
.drawer__head {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px var(--dialog-px) 8px;
  flex-shrink: 0;
}
.drawer__head-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.drawer__title-wrap { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.drawer__title {   /* tiêu đề form / drawer = H2 20px / 28px (Figma MDS Form 6019:124359) */
  font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); color: var(--text-primary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
/* Tiêu đề sửa được: hover hiện nền như ô nhập */
.drawer__title--editable {
  width: 100%; margin: 0 -9px; padding: 2px 8px; box-sizing: content-box;
  border: 1px solid transparent; border-radius: var(--radius-default); background: none;
  font-family: inherit; text-align: left; cursor: text;
  transition: border-color 0.15s, background 0.15s;
}
.drawer__title--editable:hover { border-color: var(--stroke-brand); }
.drawer__title-input { margin: 0 -9px; width: calc(100% + 18px); }
.drawer__title-input :deep(textarea) { font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.drawer__title-error { font-size: var(--text-body); color: var(--text-danger); }
.drawer__head-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.save-state { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); white-space: nowrap; }
.save-state--saved { color: var(--text-success); }
.save-state--error { color: var(--text-danger); white-space: normal; max-width: 260px; }

.score-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 6px 12px; border-radius: var(--radius-default);
  background: var(--bg-neutral-light);
  font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary);
}
.score-bar__item strong { margin-left: 4px; font-size: var(--text-body-md); font-weight: var(--fw-bold); color: var(--text-primary); font-feature-settings: 'tnum' 1; }
.score-bar__item .score-bar__final { color: var(--text-brand); }
.score-bar__item { display: inline-flex; align-items: center; }
.score-bar__tip { display: inline-flex; margin-left: 4px; }
.score-bar__sep { width: 1px; height: 16px; background: var(--stroke-divider); }
.score-bar__status { margin-left: auto; }
.score-bar__status-btn { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border: none; border-radius: var(--radius-default); background: transparent; cursor: pointer; font-family: inherit; }
.score-bar__status-btn:hover, .score-bar__status-btn--open { background: var(--bg-brand-light); }
.score-bar__status-btn--open:hover { background: var(--bg-brand-light-hover); }
.score-bar__status-btn > .ti { font-size: 14px; color: var(--icon-neutral); }

.head-note { display: flex; align-items: center; gap: 4px 6px; font-size: var(--text-body); line-height: var(--text-body-lh); }
.head-note--lock { color: var(--text-warning); }
.head-note--warn { color: var(--text-warning); flex-wrap: wrap; }
.head-note__link:hover { filter: brightness(0.8); text-decoration-thickness: 2px; }
.head-note__link {
  padding: 0; border: none; background: none; cursor: pointer;
  font-family: inherit; font-size: inherit; line-height: inherit; font-weight: var(--fw-semibold);
  color: var(--text-warning); text-decoration: underline; text-underline-offset: 2px;
}

.drawer__tabs {
  display: flex; align-items: flex-end; flex-shrink: 0;
  padding: 0 calc(var(--dialog-px) - var(--tab-px));   /* chữ tab đầu thẳng lề nội dung drawer */
  border-bottom: 1px solid var(--stroke-neutral-light);
}
.drawer__tabs .sub-nav-tab { margin-bottom: -1px; }   /* gạch chân đè viền dưới thanh tab */
.tab-count {
  margin-left: 6px; padding: 0 6px; border-radius: var(--radius-pill);
  background: var(--bg-neutral-light); color: var(--text-secondary);
  font-size: var(--text-sm); line-height: var(--text-body-lh); font-weight: var(--fw-medium);
}

/* ── Nội dung cuộn ── */
.drawer__body {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 12px var(--dialog-px) var(--dialog-py);
  display: flex; flex-direction: column; gap: 16px;   /* gọn để thấy được nhiều thông tin nhất */
}
.sec { display: flex; flex-direction: column; gap: 10px; }
.sec__title { display: flex; align-items: center; gap: 6px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.sec__title .ti { font-size: 16px; color: var(--icon-brand); }
.approve { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding-top: 12px; border-top: 1px dashed var(--stroke-neutral-light); }
.approve__text { display: inline-flex; align-items: center; gap: 6px; flex: 1; min-width: 200px; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.approve__text .ti { font-size: 14px; color: var(--icon-brand); flex-shrink: 0; }
.approve-form { display: flex; flex-direction: column; gap: 12px; }
.approve-form__text { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.approve-form__text strong { font-weight: var(--fw-semibold); }
.stepper { display: flex; align-items: center; gap: 8px; margin: -6px 0; padding: 0; list-style: none; }   /* cách trên / dưới đều 10px */
.stepper__step { display: flex; align-items: center; gap: 6px; font-size: var(--text-body); color: var(--text-secondary); }
.stepper__step + .stepper__step::before { content: ''; width: 20px; height: 1px; background: var(--stroke-neutral-light); margin-right: 2px; }
.stepper__dot { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--stroke-neutral); font-size: 11px; font-weight: var(--fw-semibold); }
.stepper__dot .ti { font-size: 12px; }
.stepper__step--done { color: var(--text-success); }
.stepper__step--done .stepper__dot { border-color: var(--bg-success); background: var(--bg-success); color: #fff; }
.stepper__step--current { color: var(--text-brand); font-weight: var(--fw-semibold); }
.stepper__step--current .stepper__dot { border-color: var(--bg-brand); background: var(--bg-brand); color: #fff; }
.ba-done { border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); }
.ba-done__sum { display: flex; align-items: center; gap: 6px; padding: 10px 12px; list-style: none; cursor: pointer; font-size: var(--text-body); color: var(--text-primary); }
.ba-done__sum::-webkit-details-marker { display: none; }
.ba-done__sum > .ti { font-size: 16px; color: var(--icon-neutral); }
.ba-done__chev { transition: transform 0.15s; }
.ba-done[open] .ba-done__chev { transform: rotate(90deg); }
.ba-done__title { font-weight: var(--fw-semibold); }
.ba-done__meta { flex: 1; text-align: right; font-size: var(--text-body); color: var(--text-secondary); }
.ba-done__meta strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.ba-done__body { display: flex; flex-direction: column; gap: 12px; padding: 4px 12px 12px; }
.ba-done__reopen { align-self: flex-start; padding: 0; height: auto; }
.sec--score {
  padding: 12px; margin: 0;   /* cùng mép với các khung khác (Phân tích · BA, thông tin chung) */
  border-radius: var(--radius-default);
  background: var(--bg-neutral-light);
}
.sec--incomplete { background: var(--bg-warning-light); }
.field-flash { animation: field-flash 1.2s ease; border-radius: var(--radius-default); }
@keyframes field-flash { 0%, 60% { box-shadow: 0 0 0 4px var(--stroke-warning); } 100% { box-shadow: 0 0 0 4px transparent; } }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px var(--form-col-gap-sm); align-items: start; }
.span-2 { grid-column: 1 / -1; }
.half { width: calc((100% - var(--form-col-gap-sm)) / 2); }   /* ô nửa bề rộng nhưng chiếm cả hàng */
.link-row { display: flex; align-items: center; gap: 8px; }
.link-row__box { flex: 1; min-width: 0; }
.links { display: flex; flex-direction: column; gap: 8px; }
.links__label { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.links__add { align-self: flex-start; }
.links__empty { font-size: var(--text-body); color: var(--text-secondary); }
.links__item { display: flex; flex-direction: column; gap: 4px; }
.links__dev { display: flex; align-items: center; gap: 6px; min-width: 0; padding-left: 2px; font-size: var(--text-body); }
.links__dev-label { flex-shrink: 0; color: var(--text-secondary); }
.links__dev-url { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-link); text-decoration: none; }
.links__dev-url:hover { text-decoration: underline; }

.drawer-enter-active, .drawer-leave-active { transition: transform 0.2s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>
