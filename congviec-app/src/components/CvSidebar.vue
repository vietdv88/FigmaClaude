<template>
  <div class="sidebar-host" :class="{ 'sidebar-host--expanded': isExpanded }">
    <aside class="sidebar" :class="{ expanded: isExpanded }">
      <div class="sidebar-inner">

        <!-- Split button: left = popup, right = dropdown -->
        <div class="cv-quick-add-wrap qab-wrap" ref="qaWrap">
          <div class="qab-split">
            <button class="qab-main" @click.stop="openPopup" title="Thêm công việc">
              <TIcon name="plus" />
              <span class="qab-text">Thêm công việc</span>
            </button>
            <div class="qab-sep"></div>
            <button class="qab-arr" @click.stop="openDropdown" title="Thêm loại khác">
              <TIcon name="chevron-down" />
            </button>
          </div>

          <!-- Dropdown menu (teleported) -->
          <Teleport to="body">
            <div v-if="qaOpen" class="qa-dd" :style="qaStyle" @click.stop>
              <button v-for="item in quickAddItems" :key="item.id" class="qa-dd__item" @click="onQuickAdd(item)">
                <TIcon :name="item.icon" class="qa-dd__ico" />
                <span class="qa-dd__lbl">{{ item.label }}</span>
                <span v-if="item.badge" class="qa-dd__badge">{{ item.badge }}</span>
              </button>
            </div>
          </Teleport>
        </div>

        <!-- Fixed top nav -->
        <nav class="sidebar-nav">
          <button
            v-for="item in topNav" :key="item.id"
            class="sidebar-item"
            :class="{ active: activeId === item.id }"
            :title="item.label"
            @click="$emit('nav', item.id)"
          >
            <TIcon :name="item.icon" />
            <span class="sidebar-item__label">{{ item.label }}</span>
          </button>
        </nav>

        <!-- Separator + tree (hidden when collapsed) -->
        <div class="cv-sep"></div>

        <div class="cv-search-row">
          <TIcon name="search" class="cv-search-ico" />
          <input class="cv-search-input" placeholder="Tìm kiếm" v-model="searchQuery" />
          <button class="cv-tool-btn" title="Bộ lọc"><TIcon name="filter" /></button>
          <button class="cv-tool-btn cv-tool-btn--dot" title="Cài đặt"><TIcon name="settings" /></button>
        </div>

        <div class="cv-tree">
          <div v-for="group in filteredGroups" :key="group.id" class="cv-group">
            <div class="cv-group__hd" @click="group.expanded = !group.expanded">
              <TIcon :name="group.expanded ? 'chevron-down' : 'chevron-right'" class="cv-chevron" />
              <input v-if="group._editing"
                class="cv-inline-input" v-model="group._editVal"
                @click.stop @blur="commitGroupEdit(group)"
                @keyup.enter="commitGroupEdit(group)" @keyup.esc="cancelGroupEdit(group)"
                :ref="el => { if (el && group._editing) el.focus() }" />
              <span v-else class="cv-group__name">{{ group.label }}</span>
              <div class="cv-hd-acts">
                <template v-if="!group.fixed">
                  <button class="cv-act" title="Đổi tên" @click.stop="startGroupEdit(group)"><TIcon name="pencil" /></button>
                  <button class="cv-act cv-act--del" title="Xóa phòng ban" @click.stop="deleteDepartment(group)"><TIcon name="trash" /></button>
                </template>
                <button class="cv-act cv-act--add" title="Thêm nhóm/dự án" @click.stop="addProject(group)"><TIcon name="plus" /></button>
              </div>
            </div>
            <template v-if="group.expanded">
              <div
                v-for="proj in group.projects" :key="proj.id"
                class="cv-proj"
                :class="{ active: activeProjectId === proj.id && !topNav.some(n => n.id === activeId) }"
                @click="onSelectProject(proj.id)"
              >
                <span class="cv-proj__dot" :style="{ background: proj.color }"></span>
                <input v-if="proj._editing"
                  class="cv-inline-input" v-model="proj._editVal"
                  @click.stop @blur="commitProjEdit(group, proj)"
                  @keyup.enter="commitProjEdit(group, proj)" @keyup.esc="cancelProjEdit(proj)"
                  :ref="el => { if (el && proj._editing) el.focus() }" />
                <span v-else class="cv-proj__name">{{ proj.label }}</span>
                <div v-if="!proj.fixed" class="cv-hd-acts">
                  <button class="cv-act" title="Đổi tên" @click.stop="startProjEdit(proj)"><TIcon name="pencil" /></button>
                  <button class="cv-act cv-act--del" title="Xóa" @click.stop="deleteProject(group, proj)"><TIcon name="trash" /></button>
                </div>
              </div>
            </template>
          </div>
          <button class="cv-add-group" @click="addDepartment">
            <TIcon name="plus" />
            <span>Thêm phòng ban</span>
          </button>
        </div>

      </div><!-- /sidebar-inner -->

      <button class="btn-collapse" @click="onCollapseClick" :title="isExpanded ? 'Thu gọn' : 'Ghim mở rộng'">
        <svg v-if="isExpanded" viewBox="0 0 16.5 9.83333" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="11">
          <path d="M9.08333 0.75H15.75M9.08333 9.08333H15.75M12.4167 4.91667H15.75M0.75 4.91667H9.08333M4.5 1.16667L0.75 4.91667L4.5 8.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else viewBox="0 0 16.5 9.83333" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="11">
          <path d="M0.75 0.75H7.41667M0.75 9.08333H7.41667M0.75 4.91667H4.08333M15.75 4.91667H7.41667M12 1.16667L15.75 4.91667L12 8.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </aside>
  </div>

  <!-- ══ Quick-add popup ══ -->
  <Teleport to="body">
    <div v-if="popupOpen" class="qap-overlay" @click.self="closePopup">
      <div class="qap-modal" @click.stop>

        <!-- Header -->
        <div class="qap-hd">
          <div class="qap-hd-left">
            <!-- Department selector -->
            <div class="qap-sel-wrap" ref="deptSelRef">
              <button class="qap-sel-btn" @click.stop="toggleDeptDd">
                <span v-if="selectedDept" class="qap-sel-val">{{ selectedDept.label }}</span>
                <span v-else class="qap-sel-ph">Chọn phòng ban</span>
                <TIcon name="chevron-down" class="qap-sel-arr" />
              </button>
              <Teleport to="body">
                <div v-if="showDeptDd" class="qap-sel-dd" :style="deptDdStyle" @click.stop>
                  <button class="qap-sel-dd-item qap-sel-dd-item--clear" @click="clearDept">
                    Không thuộc phòng ban
                  </button>
                  <div class="qap-sel-dd-sep"></div>
                  <button
                    v-for="dept in departments" :key="dept.id"
                    class="qap-sel-dd-item"
                    :class="{ active: selectedDept?.id === dept.id }"
                    @click="selectDept(dept)"
                  >{{ dept.label }}</button>
                </div>
              </Teleport>
            </div>
            <span class="qap-hd-slash">/</span>
            <!-- Project selector -->
            <div class="qap-sel-wrap" ref="projSelRef">
              <button class="qap-sel-btn" @click.stop="toggleProjDd" :disabled="!selectedDept">
                <template v-if="selectedProj">
                  <span class="qap-proj-dot" :style="{ background: selectedProj.color }"></span>
                  <span class="qap-sel-val">{{ selectedProj.label }}</span>
                </template>
                <span v-else class="qap-sel-ph">Nhóm/Dự án</span>
                <TIcon name="chevron-down" class="qap-sel-arr" />
              </button>
              <Teleport to="body">
                <div v-if="showProjDd && selectedDept" class="qap-sel-dd" :style="projDdStyle" @click.stop>
                  <button class="qap-sel-dd-item qap-sel-dd-item--clear" @click="clearProj">
                    Không thuộc nhóm/dự án
                  </button>
                  <div class="qap-sel-dd-sep"></div>
                  <button
                    v-for="proj in selectedDept.projects" :key="proj.id"
                    class="qap-sel-dd-item"
                    :class="{ active: selectedProj?.id === proj.id }"
                    @click="selectProj(proj)"
                  >
                    <span class="qap-proj-dot" :style="{ background: proj.color }"></span>
                    {{ proj.label }}
                  </button>
                </div>
              </Teleport>
            </div>
          </div>
          <div class="qap-hd-right">
            <button class="qap-hd-btn" title="Thẻ nhãn"><TIcon name="tag" /></button>
            <button class="qap-hd-btn" title="Đính kèm"><TIcon name="paperclip" /></button>
            <button class="qap-hd-btn" title="Công việc con"><TIcon name="git-branch" /></button>
            <button class="qap-close" @click="closePopup"><TIcon name="x" /></button>
          </div>
        </div>

        <!-- Body: main + right sidebar -->
        <div class="qap-body">

          <!-- Main content -->
          <div class="qap-main">

            <!-- AI input -->
            <div class="qap-ai-section">
              <div class="qap-ai-label">
                <TIcon name="sparkles" />
                <span>Giao việc nhanh bằng ngôn ngữ tự nhiên</span>
              </div>
              <div class="qap-ai-wrap" :class="{ expanded: aiExpanded }" ref="aiWrapRef">
                <input v-if="!aiExpanded"
                  class="qap-ai-textarea qap-ai-textarea--collapsed"
                  readonly
                  placeholder="@[Tên người thực hiện] thực hiện [Tên công việc], hạn [dd/mm]"
                  @focus="expandAi"
                  @click="expandAi"
                />
                <textarea v-else
                  ref="aiTextareaRef"
                  class="qap-ai-textarea"
                  v-model="aiText"
                  placeholder="@[Tên người thực hiện] thực hiện [Tên công việc], hạn [dd/mm]"
                  rows="3"
                  @blur="onAiBlur"
                  @input="onAiInput"
                  @keydown="onAiKeydown"
                ></textarea>
                <div v-if="mentionList.length" class="qap-mention-dd">
                  <button
                    v-for="(p, i) in mentionList" :key="p.id"
                    class="qap-mention-item"
                    :class="{ active: i === mentionIdx }"
                    @mousedown.prevent="selectMention(p)"
                  >
                    <img :src="p.avatar" class="qap-av" :style="{ background: p.color }" />
                    <span>{{ p.name }}</span>
                  </button>
                </div>
              </div>
              <div v-if="aiParsed" class="qap-ai-hint">
                <TIcon name="check" /><span>Đã phân tích — kiểm tra thông tin bên dưới</span>
              </div>
            </div>

            <!-- Form -->
            <div class="qap-form">

              <!-- Title -->
              <div class="qap-title-field" :class="{ 'qap-title-field--err': formErrors.taskName }">
                <textarea
                  class="qap-title-input"
                  v-model="form.taskName"
                  ref="qapTitleRef"
                  rows="1"
                  placeholder="Nhập tên công việc"
                  @input="onQapTitleInput"
                />
                <span v-if="formErrors.taskName" class="qap-err-msg">Vui lòng nhập tên công việc</span>
              </div>

              <!-- Fields row -->
              <div class="qap-chips">
                <div class="qap-field-box" :class="{ 'qap-field-box--filled': form.assignee }"
                  ref="assigneeWrapRef" @click.stop="openAssigneeDd">
                  <img v-if="form.assignee" :src="form.assignee.avatar" class="qap-field-av"
                    :style="{ background: form.assignee.color }" />
                  <div v-else class="qap-field-ico-wrap"><TIcon name="user" /></div>
                  <div class="qap-field-text">
                    <span v-if="form.assignee" class="qap-field-label">Người thực hiện</span>
                    <span class="qap-field-val" :class="{ 'qap-field-ph': !form.assignee }">
                      {{ form.assignee?.name || 'Chọn người thực hiện' }}
                    </span>
                  </div>
                  <Teleport to="body">
                    <div v-if="showAssigneeDd" class="qap-people-dd" :style="assigneeDdStyle" @click.stop>
                      <div class="qap-people-search">
                        <TIcon name="search" class="qap-people-search-ico" />
                        <input
                          class="qap-people-search-inp"
                          v-model="assigneeSearch"
                          placeholder="Tìm người thực hiện..."
                          @click.stop
                          ref="assigneeSearchRef"
                        />
                      </div>
                      <div class="qap-people-list">
                        <button v-for="p in filteredPeople" :key="p.id" class="qap-mention-item"
                          :class="{ 'qap-mention-item--sel': form.assignee?.id === p.id }"
                          @click.stop="pickAssignee(p)">
                          <img :src="p.avatar" class="qap-av" :style="{ background: p.color }" />
                          <span class="qap-mention-name">{{ p.name }}</span>
                          <TIcon v-if="form.assignee?.id === p.id" name="check" class="qap-mention-check" />
                        </button>
                        <div v-if="filteredPeople.length === 0" class="qap-people-empty">Không tìm thấy</div>
                      </div>
                    </div>
                  </Teleport>
                </div>
                <div class="qap-field-box" :class="{ 'qap-field-box--filled': form.deadline }"
                  ref="dateWrapRef" @click.stop="openDateDd">
                  <div class="qap-field-ico-wrap"><TIcon name="calendar" /></div>
                  <div class="qap-field-text">
                    <span v-if="form.deadline" class="qap-field-label">Hạn hoàn thành</span>
                    <span class="qap-field-val" :class="{ 'qap-field-ph': !form.deadline }">
                      {{ form.deadline ? formatDate(form.deadline) : 'Chọn hạn hoàn thành' }}
                    </span>
                  </div>
                  <Teleport to="body">
                    <div v-if="showDateDd" class="qap-cal" :style="calStyle" @click.stop>
                      <div class="qap-cal-hd">
                        <button class="qap-cal-nav" @click="calPrevMonth"><TIcon name="chevron-left" /></button>
                        <span class="qap-cal-title">{{ calMonthLabel }}</span>
                        <button class="qap-cal-nav" @click="calNextMonth"><TIcon name="chevron-right" /></button>
                      </div>
                      <div class="qap-cal-grid">
                        <span v-for="d in ['T2','T3','T4','T5','T6','T7','CN']" :key="d" class="qap-cal-dow">{{ d }}</span>
                        <button
                          v-for="cell in calCells" :key="cell.key"
                          class="qap-cal-day"
                          :class="{ 'qap-cal-day--other': cell.other, 'qap-cal-day--today': cell.today, 'qap-cal-day--sel': cell.selected }"
                          @click="selectDate(cell)"
                        >{{ cell.day }}</button>
                      </div>
                      <div v-if="form.deadline" class="qap-cal-ft">
                        <button class="qap-cal-clear" @click="form.deadline = ''; showDateDd = false">Xóa ngày</button>
                      </div>
                    </div>
                  </Teleport>
                </div>
              </div>

              <!-- Mô tả textarea (khi active) -->
              <textarea v-if="showDesc || form.note" class="qap-desc" v-model="form.note" placeholder="Mô tả thêm về công việc..." rows="2" @blur="onDescBlur" />

              <!-- Action links -->
              <div class="qap-action-links">
                <button v-if="!showDesc && !form.note" class="qap-add-link" @click="showDesc = true"><TIcon name="align-left" /><span>Thêm mô tả</span></button>
                <button class="qap-add-link"><TIcon name="git-branch" /><span>Thêm công việc con</span></button>
                <button class="qap-add-link"><TIcon name="checkbox" /><span>Thêm checklist</span></button>
                <button class="qap-add-link"><TIcon name="tag" /><span>Thêm thẻ công việc</span></button>
              </div>

              <!-- Tệp đính kèm -->
              <div class="qap-attach">
                <div class="qap-attach-hd">
                  <TIcon name="paperclip" />
                  <span>Tệp đính kèm</span>
                </div>
                <div class="qap-attach-zone">
                  <TIcon name="upload" />
                  <div class="qap-attach-texts">
                    <span>Kéo thả file vào đây</span>
                    <span class="qap-attach-hint">hoặc nhấn để chọn · Ctrl+V để dán</span>
                  </div>
                </div>
              </div>

            </div><!-- /qap-form -->
          </div><!-- /qap-main -->

          <!-- Right sidebar -->
          <div class="qap-sidebar">
            <button class="qap-sb-btn">
              <TIcon name="circle-check" />
              <span>Phê duyệt</span>
              <TIcon name="plus" class="qap-sb-add" />
            </button>
            <button class="qap-sb-btn">
              <TIcon name="repeat" />
              <span>Lặp lại</span>
              <TIcon name="plus" class="qap-sb-add" />
            </button>
            <button class="qap-sb-btn">
              <TIcon name="bell" />
              <span>Nhắc việc</span>
              <TIcon name="plus" class="qap-sb-add" />
            </button>
            <button class="qap-sb-btn">
              <TIcon name="users" />
              <span>Người liên quan</span>
              <TIcon name="plus" class="qap-sb-add" />
            </button>
          </div>

        </div><!-- /qap-body -->

        <!-- Footer -->
        <div class="qap-ft">
          <AppButton variant="outline" color="neutral" label="Hủy" @click="closePopup" />
          <AppButton label="Lưu" @click="submitTask" />
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import AppButton from '@mds/components/AppButton.vue'
import { departments, addDepartment, deleteDepartment, addProject, deleteProject } from '../store/departments.js'
import { PEOPLE } from '../store/people.js'

defineProps({ activeId: { type: String, default: '' } })
const emit = defineEmits(['nav', 'select-project', 'quick-add'])
const router = useRouter()

/* ── Expand/collapse ── */
const STORAGE_KEY = 'mds-sidebar-expanded'
const stored = localStorage.getItem(STORAGE_KEY)
const isExpanded = ref(stored !== null ? stored === 'true' : false)
function onCollapseClick() {
  isExpanded.value = !isExpanded.value
  localStorage.setItem(STORAGE_KEY, isExpanded.value)
}

/* ── Top nav ── */
const topNav = [
  { id: 'tong-quan',    label: 'Tổng quan',   icon: 'layout-dashboard' },
  { id: 'viec-cua-toi', label: 'Việc của tôi', icon: 'clipboard-list'   },
  { id: 'bao-cao',      label: 'Báo cáo',      icon: 'chart-bar'        },
]

/* ── Search ── */
const searchQuery = ref('')
const activeProjectId = ref('cv-ca-nhan')
const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return departments
  return departments
    .map(g => ({ ...g, projects: g.projects.filter(p => p.label.toLowerCase().includes(q)) }))
    .filter(g => g.label.toLowerCase().includes(q) || g.projects.length > 0)
    .map(g => ({ ...g, expanded: true }))
})
function onSelectProject(id) {
  activeProjectId.value = id
  emit('select-project', id)
  router.push(`/du-an/${id}`)
}

/* ── Inline edits ── */
function startGroupEdit(g) { g._editVal = g.label; g._editing = true }
function commitGroupEdit(g) { if (g._editVal.trim()) g.label = g._editVal.trim(); g._editing = false }
function cancelGroupEdit(g) { g._editing = false }
function startProjEdit(p) { p._editVal = p.label; p._editing = true }
function commitProjEdit(g, p) { if (p._editVal.trim()) p.label = p._editVal.trim(); p._editing = false }
function cancelProjEdit(p) { p._editing = false }

/* ── Dropdown (split button right side) ── */
const qaOpen  = ref(false)
const qaWrap  = ref(null)
const qaStyle = ref({})
const quickAddItems = [
  { id: 'task-template', icon: 'file-plus',  label: 'Thêm công việc từ mẫu',                    badge: 'Mới' },
  { id: 'milestone',     icon: 'flag',        label: 'Thêm cột mốc công việc',                   badge: 'Mới' },
  { id: 'project',       icon: 'folder',      label: 'Thêm dự án/nhóm',                          badge: null  },
  { id: 'department',    icon: 'building',    label: 'Thêm phòng ban',                            badge: null  },
  { id: 'org-dept',      icon: 'sitemap',     label: 'Thêm phòng ban theo cơ cấu tổ chức',       badge: null  },
  { id: 'add-employee',  icon: 'user-plus',   label: 'Thêm nhanh nhân viên vào phòng ban/dự án', badge: null  },
]
function openDropdown() {
  if (qaOpen.value) { qaOpen.value = false; return }
  const rect = qaWrap.value.getBoundingClientRect()
  qaStyle.value = { position: 'fixed', top: rect.bottom + 6 + 'px', left: rect.left + 'px', zIndex: 9999 }
  qaOpen.value = true
}
function onQuickAdd(item) { qaOpen.value = false; emit('quick-add', item.id) }

/* ── Quick-add popup ── */
const popupOpen      = ref(false)
const aiText         = ref('')
const aiParsed       = ref(false)
const aiExpanded     = ref(false)
const aiTextareaRef  = ref(null)
const aiWrapRef      = ref(null)
const qapTitleRef    = ref(null)
function autoResizeEl(el) { if (!el) return; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
function onQapTitleInput(e) { autoResizeEl(e.target); formErrors.taskName = false }
const assigneeWrapRef  = ref(null)
const assigneeSearchRef= ref(null)
const assigneeDdStyle  = ref({})
const assigneeSearch   = ref('')
const showAssigneeDd   = ref(false)
const mentionList      = ref([])
const mentionIdx     = ref(0)
const mentionAtPos   = ref(-1)

/* ── Department / Project context ── */
const selectedDept  = ref(null)
const selectedProj  = ref(null)
const showDeptDd    = ref(false)
const showProjDd    = ref(false)
const deptSelRef    = ref(null)
const projSelRef    = ref(null)
const deptDdStyle   = ref({})
const projDdStyle   = ref({})
const showDateDd    = ref(false)
const dateWrapRef   = ref(null)
const calStyle      = ref({})
const calYear       = ref(new Date().getFullYear())
const calMonth      = ref(new Date().getMonth())
const showDesc      = ref(false)

const filteredPeople = computed(() => {
  const q = assigneeSearch.value.trim().toLowerCase()
  return q ? PEOPLE.filter(p => p.name.toLowerCase().includes(q)) : PEOPLE
})
function openAssigneeDd() {
  assigneeSearch.value = ''
  if (!showAssigneeDd.value && assigneeWrapRef.value) {
    const rect = assigneeWrapRef.value.getBoundingClientRect()
    assigneeDdStyle.value = { position: 'fixed', top: rect.bottom + 6 + 'px', left: rect.left + 'px', zIndex: 9999 }
    showAssigneeDd.value = true
    nextTick(() => assigneeSearchRef.value?.focus())
  } else {
    showAssigneeDd.value = false
  }
  showDeptDd.value = false; showProjDd.value = false; showDateDd.value = false
}
function pickAssignee(p) {
  form.assignee = form.assignee?.id === p.id ? null : p
  showAssigneeDd.value = false
}
function toggleDeptDd() {
  showAssigneeDd.value = false; showProjDd.value = false
  if (showDeptDd.value) { showDeptDd.value = false; return }
  const rect = deptSelRef.value?.getBoundingClientRect()
  if (rect) deptDdStyle.value = { position: 'fixed', top: rect.bottom + 4 + 'px', left: rect.left + 'px', zIndex: 9999 }
  showDeptDd.value = true
}
function toggleProjDd() {
  if (!selectedDept.value) return
  showDeptDd.value = false
  if (showProjDd.value) { showProjDd.value = false; return }
  const rect = projSelRef.value?.getBoundingClientRect()
  if (rect) projDdStyle.value = { position: 'fixed', top: rect.bottom + 4 + 'px', left: rect.left + 'px', zIndex: 9999 }
  showProjDd.value = true
}
function selectDept(dept) {
  selectedDept.value = dept
  if (selectedProj.value && !dept.projects.find(p => p.id === selectedProj.value?.id)) {
    selectedProj.value = null
  }
  showDeptDd.value = false
}
function clearDept() { selectedDept.value = null; selectedProj.value = null; showDeptDd.value = false }
function selectProj(proj) { selectedProj.value = proj; showProjDd.value = false }
function clearProj() { selectedProj.value = null; showProjDd.value = false }

/* ── Calendar picker ── */
const CAL_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
const calMonthLabel = computed(() => `${CAL_MONTHS[calMonth.value]} ${calYear.value}`)
const calCells = computed(() => {
  const today = new Date()
  const sel = form.deadline ? new Date(form.deadline + 'T00:00:00') : null
  let startDow = new Date(calYear.value, calMonth.value, 1).getDay()
  startDow = startDow === 0 ? 6 : startDow - 1
  const cells = []
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(calYear.value, calMonth.value, -i)
    cells.push({ key:`p${i}`, day: d.getDate(), date: d, other: true, today: false, selected: false })
  }
  const dim = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  for (let i = 1; i <= dim; i++) {
    const d = new Date(calYear.value, calMonth.value, i)
    cells.push({ key:`c${i}`, day: i, date: d, other: false,
      today: d.toDateString() === today.toDateString(),
      selected: sel ? d.toDateString() === sel.toDateString() : false })
  }
  const rem = 42 - cells.length
  for (let i = 1; i <= rem; i++) {
    const d = new Date(calYear.value, calMonth.value + 1, i)
    cells.push({ key:`n${i}`, day: i, date: d, other: true, today: false, selected: false })
  }
  return cells
})
function openDateDd() {
  if (form.deadline) {
    const d = new Date(form.deadline + 'T00:00:00')
    calYear.value = d.getFullYear(); calMonth.value = d.getMonth()
  } else {
    calYear.value = new Date().getFullYear(); calMonth.value = new Date().getMonth()
  }
  if (!showDateDd.value && dateWrapRef.value) {
    const rect = dateWrapRef.value.getBoundingClientRect()
    calStyle.value = { position: 'fixed', top: rect.bottom + 6 + 'px', left: rect.left + 'px', zIndex: 9999 }
  }
  showDateDd.value = !showDateDd.value
  showDeptDd.value = false; showProjDd.value = false; showAssigneeDd.value = false
}
function calPrevMonth() { if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- } else calMonth.value-- }
function calNextMonth() { if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ } else calMonth.value++ }
function onDescBlur() { if (!form.note) showDesc.value = false }
function selectDate(cell) {
  const d = cell.date
  const pad = n => String(n).padStart(2,'0')
  form.deadline = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  showDateDd.value = false
}

const form       = reactive({ taskName: '', assignee: null, deadline: '', note: '' })
const formErrors = reactive({ taskName: false })

function openPopup(e) {
  qaOpen.value = false
  Object.assign(form, { taskName: '', assignee: null, deadline: '', note: '' })
  Object.assign(formErrors, { taskName: false })
  aiText.value = ''; aiParsed.value = false; aiExpanded.value = false; mentionList.value = []
  showAssigneeDd.value = false; showDeptDd.value = false; showProjDd.value = false; showDateDd.value = false; showDesc.value = false

  const projectId = e?.detail?.projectId ?? null
  selectedDept.value = null; selectedProj.value = null
  if (projectId) {
    for (const dept of departments) {
      const proj = dept.projects.find(p => p.id === projectId)
      if (proj) { selectedDept.value = dept; selectedProj.value = proj; break }
    }
  }

  popupOpen.value = true
  nextTick(() => aiTextareaRef.value?.focus())
}
function closePopup() {
  popupOpen.value = false
  showAssigneeDd.value = false; showDeptDd.value = false; showProjDd.value = false
  showDateDd.value = false; showDesc.value = false
  mentionList.value = []
}

function toIsoDate(d) {
  const pad = n => String(n).padStart(2,'0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}
function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

/* ── AI parsing — NLP pattern extraction ── */
function parseAiText(text) {
  let w = text.trim()

  // ─── 1. Assignee ────────────────────────────────────────────────
  let assignee = null

  // @mention: try 1–3 tokens after @, longest match first
  const atM = w.match(/@([\wÀ-ỹ]+(?:\s+[\wÀ-ỹ]+)?(?:\s+[\wÀ-ỹ]+)?)/u)
  if (atM) {
    const tokens = atM[1].trim().split(/\s+/)
    for (let len = tokens.length; len >= 1; len--) {
      const q = tokens.slice(0, len).join(' ').toLowerCase()
      const p = PEOPLE.find(px => px.name.toLowerCase().includes(q))
      if (p) { assignee = p; break }
    }
    // Always strip full @mention so it never bleeds into task name
    w = w.replace(atM[0], '')
  }

  // Fallback: "giao(việc) cho [Tên]" without @
  if (!assignee) {
    const choM = w.match(/(?:giao\s+(?:việc\s+)?cho|cho)\s+((?:[\wÀ-ỹ]+\s+){0,3}[\wÀ-ỹ]+?)(?=\s+(?:thực\s+hiện|làm|hạn|deadline)|[,.]|$)/iu)
    if (choM) {
      const q = choM[1].trim().toLowerCase()
      const p = PEOPLE.find(px =>
        px.name.toLowerCase().includes(q) ||
        px.name.toLowerCase().split(' ').some(part => part === q || q.includes(part))
      )
      if (p) { assignee = p; w = w.replace(choM[0], ' ') }
    }
  }

  // ─── 2. Deadline (before task name to avoid consuming it) ────────
  const today = new Date()
  let deadline = ''

  // Prefix pattern: hạn / hạn hoàn thành / hoàn thành (vào...) / vào / trong / deadline / trước
  const DL_PFX = '(?:(?:hoàn\\s+thành\\s+)?(?:hạn(?:\\s+hoàn\\s+thành)?|vào(?:\\s+(?:lúc|ngày))?|trong|deadline|trước)\\s+|hoàn\\s+thành\\s+)?'
  const relTests = [
    { re: new RegExp(DL_PFX + 'hôm nay', 'i'),                          days: 0  },
    { re: new RegExp(DL_PFX + 'ngày mai', 'i'),                         days: 1  },
    { re: new RegExp(DL_PFX + 'ngày kia', 'i'),                         days: 2  },
    { re: new RegExp(DL_PFX + '(?:tuần sau|tuần tới)', 'i'),            days: 7  },
    { re: new RegExp(DL_PFX + '2\\s*tuần', 'i'),                        days: 14 },
    { re: new RegExp(DL_PFX + 'cuối\\s*tuần', 'i'),
      getDays: () => (6 - today.getDay() + 7) % 7 || 7 },
    { re: new RegExp(DL_PFX + '(?:tháng sau|tháng tới)', 'i'),
      getDate: () => { const d = new Date(today); d.setMonth(d.getMonth() + 1); return d } },
  ]
  for (const t of relTests) {
    const m = w.match(t.re)
    if (m) {
      let d
      if (t.getDate) d = t.getDate()
      else { d = new Date(today); d.setDate(today.getDate() + (t.getDays ? t.getDays() : t.days)) }
      deadline = toIsoDate(d)
      w = w.replace(m[0], ' ')
      break
    }
  }

  // Absolute date: "25/7", "25-7", "25/07/2026", "25 tháng 7"
  if (!deadline) {
    const absRe = /(?:(?:hạn(?:\s+hoàn\s+thành)?|vào(?:\s+(?:lúc|ngày))?|trong|deadline|trước\s+ngày|đến\s+ngày|ngày)\s+)?(\d{1,2})\s*(?:tháng\s+|[\/\-])(\d{1,2})(?:\s*[\/\-]\s*(\d{2,4}))?(?!\d)/i
    const m = w.match(absRe)
    if (m) {
      const day = +m[1], mon = +m[2] - 1
      let year = m[3] ? +m[3] : today.getFullYear()
      if (year < 100) year += 2000
      const dt = new Date(year, mon, day)
      if (!isNaN(dt.getTime())) {
        if (!m[3] && dt < today) dt.setFullYear(year + 1)
        deadline = toIsoDate(dt)
        w = w.replace(m[0], ' ')
      }
    }
  }

  // ─── 3. Task name ────────────────────────────────────────────────
  w = w.replace(/\bgiao\s+(?:việc\s+)?(?:cho\s+)?/gi, ' ')

  // Prefer text after "thực hiện" / "làm"
  const verbM = w.match(/\b(?:thực hiện|làm(?:\s+việc)?)\s+(.+)/iu)
  let taskName = verbM ? verbM[1] : w

  // Strip deadline stop words that may remain after extraction
  taskName = taskName
    .replace(/\b(?:hạn\s+hoàn\s+thành|hoàn\s+thành|hạn|deadline|vào(?:\s+(?:lúc|ngày))?|trong|trước)\b/gi, ' ')
    .replace(/\b(?:nhé|nhỉ|nha|nhen|ạ|ơi)\s*[!.]*$/i, '')
    .replace(/\bcho\s*$/i, '')
    .replace(/\b(?:thực hiện|làm\s+việc|làm)\b/gi, ' ')
    .replace(/[,.:;!?]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Capitalize first letter
  if (taskName) taskName = taskName[0].toUpperCase() + taskName.slice(1)

  return { assignee, taskName, deadline }
}

function runParse() {
  if (!aiText.value.trim()) return
  const result = parseAiText(aiText.value)
  if (result.taskName) form.taskName = result.taskName
  if (result.assignee) form.assignee = result.assignee
  if (result.deadline) form.deadline = result.deadline
  aiParsed.value = !!(result.taskName || result.assignee || result.deadline)
  nextTick(() => autoResizeEl(qapTitleRef.value))
}

/* ── @mention detection ── */
function onAiInput(e) {
  const val = e.target.value
  const cursor = e.target.selectionStart
  const before = val.slice(0, cursor)
  const lastAt = before.lastIndexOf('@')

  if (lastAt >= 0) {
    const query = before.slice(lastAt + 1)
    if (!/\s/.test(query)) {
      mentionAtPos.value = lastAt
      mentionIdx.value = 0
      mentionList.value = PEOPLE.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      return
    }
  }
  mentionList.value = []

  // Auto-parse after short delay
  clearTimeout(parseTimer)
  parseTimer = setTimeout(runParse, 600)
}
let parseTimer = null

function expandAi() {
  aiExpanded.value = true
  nextTick(() => aiTextareaRef.value?.focus())
}
function onAiBlur() { if (!aiText.value) aiExpanded.value = false }

function onAiKeydown(e) {
  if (mentionList.value.length) {
    if (e.key === 'ArrowDown') { e.preventDefault(); mentionIdx.value = (mentionIdx.value + 1) % mentionList.value.length }
    if (e.key === 'ArrowUp')   { e.preventDefault(); mentionIdx.value = (mentionIdx.value - 1 + mentionList.value.length) % mentionList.value.length }
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); selectMention(mentionList.value[mentionIdx.value]) }
    if (e.key === 'Escape') { mentionList.value = [] }
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    runParse()
    aiText.value = ''
    aiExpanded.value = false
    aiTextareaRef.value?.blur()
  }
  if (e.key === 'Escape') {
    aiText.value = ''
    aiExpanded.value = false
    aiTextareaRef.value?.blur()
  }
}

function selectMention(person) {
  const val = aiText.value
  const before = val.slice(0, mentionAtPos.value)
  const afterMention = val.slice(mentionAtPos.value).replace(/^@[\wÀ-ỹ]*/, '')
  const sep = afterMention.startsWith(' ') ? '' : ' '
  aiText.value = before + '@' + person.name + sep + afterMention
  form.assignee = person
  mentionList.value = []
  nextTick(() => {
    const pos = before.length + 1 + person.name.length + sep.length
    aiTextareaRef.value?.setSelectionRange(pos, pos)
    aiTextareaRef.value?.focus()
  })
}

/* ── Submit ── */
function submitTask() {
  if (!form.taskName.trim()) { formErrors.taskName = true; return }
  const projectId = selectedProj.value?.id || 'cv-ca-nhan'
  localStorage.setItem('cv-post-add', JSON.stringify({
    tab: 'giao',
    project: projectId,
    task: {
      name:       form.taskName.trim(),
      assigneeId: form.assignee?.id || null,
      deadline:   form.deadline || null,
      note:       form.note      || ''
    }
  }))
  closePopup()
  if (router.currentRoute.value.path === '/viec-cua-toi') {
    window.dispatchEvent(new CustomEvent('cv-post-add'))
  } else {
    router.push('/viec-cua-toi')
  }
}

/* ── Click-outside (dropdown + popup) ── */
function onDocClick(e) {
  if (qaWrap.value && !qaWrap.value.contains(e.target)) qaOpen.value = false
  if (assigneeWrapRef.value && !assigneeWrapRef.value.contains(e.target)) showAssigneeDd.value = false
  showDeptDd.value = false
  showProjDd.value = false
  if (dateWrapRef.value && !dateWrapRef.value.contains(e.target)) showDateDd.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('cv-open-add-popup', openPopup)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('cv-open-add-popup', openPopup)
  clearTimeout(parseTimer)
})
</script>

<style scoped>
/* Override global flex:1 so top nav stays compact and tree fills remaining space */
.sidebar-nav { flex: none; }
.cv-tree     { flex: 1; }
.sidebar-nav .sidebar-item { height: 36px; }

/* ── Split button ── */
.qab-wrap { flex-shrink: 0; }
.qab-split {
  display: flex; align-items: stretch;
  width: 100%; height: var(--btn-height, 32px);
  border: 1px solid var(--stroke-brand); border-radius: var(--radius-default);
  overflow: hidden; flex-shrink: 0;
}
.qab-main {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 0; background: transparent; border: none;
  color: var(--text-brand); cursor: pointer;
  font-size: 13px; font-weight: var(--fw-medium);
  white-space: nowrap; overflow: hidden;
  transition: background .1s, gap .22s;
}
.qab-main:hover { background: var(--bg-brand-light); }
.qab-main .ti { font-size: 16px; flex-shrink: 0; }
.qab-text {
  opacity: 0; max-width: 0; overflow: hidden;
  transition: opacity .15s, max-width .15s;
}
.qab-sep  { width: 0; background: var(--stroke-brand); flex-shrink: 0; transition: width .15s; }
.qab-arr  {
  width: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; color: var(--text-brand);
  cursor: pointer; flex-shrink: 0; transition: width .15s, background .1s;
}
.qab-arr:hover { background: var(--bg-brand-light); }
.qab-arr .ti { font-size: 12px; }

/* Expanded or hover: show text + sep + arrow */
.sidebar.expanded .qab-main,
.sidebar:not(.expanded):hover .qab-main { gap: 8px; }
.sidebar.expanded .qab-text,
.sidebar:not(.expanded):hover .qab-text { opacity: 1; max-width: 130px; transition: opacity .18s .1s, max-width .18s .1s; }
.sidebar.expanded .qab-sep,
.sidebar:not(.expanded):hover .qab-sep  { width: 1px; }
.sidebar.expanded .qab-arr,
.sidebar:not(.expanded):hover .qab-arr  { width: 28px; }

/* ── Separator ── */
.cv-sep {
  display: none; height: 1px;
  background: var(--stroke-neutral-light); margin: 4px 0; flex-shrink: 0;
}

/* ── Search row ── */
.cv-search-row {
  display: none; align-items: center; gap: 2px;
  height: 32px; padding: 0 4px; flex-shrink: 0;
}
.cv-search-ico { color: var(--icon-neutral); flex-shrink: 0; }
.cv-search-ico .ti { font-size: 14px; }
.cv-search-input {
  flex: 1; min-width: 0; border: none; background: transparent; outline: none;
  font-size: 13px; color: var(--text-primary);
}
.cv-search-input::placeholder { color: var(--text-hint); }
.cv-tool-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; background: transparent;
  border-radius: 5px; cursor: pointer; color: var(--text-secondary);
  flex-shrink: 0; position: relative;
}
.cv-tool-btn:hover { background: var(--bg-neutral-hover); }
.cv-tool-btn .ti { font-size: 14px; }
.cv-tool-btn--dot::after {
  content: ''; position: absolute; top: 3px; right: 3px;
  width: 6px; height: 6px; border-radius: 50%; background: #ef4444;
}

/* ── Tree ── */
.cv-tree { display: none; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; overflow-x: hidden; }
.sidebar.expanded .cv-sep,
.sidebar:not(.expanded):hover .cv-sep { display: block; }
.sidebar.expanded .cv-search-row,
.sidebar:not(.expanded):hover .cv-search-row { display: flex; }
.sidebar.expanded .cv-tree,
.sidebar:not(.expanded):hover .cv-tree { display: flex; }

/* ── Group ── */
.cv-group { display: flex; flex-direction: column; gap: 4px; }
.cv-group__hd {
  display: flex; align-items: center; gap: 2px;
  height: 36px; padding: 0 4px 0 2px;
  border-radius: var(--radius-default); cursor: pointer;
  user-select: none; transition: background 0.1s; overflow: hidden;
}
.cv-group__hd:hover { background: var(--bg-neutral-hover); }
.cv-chevron { color: var(--icon-neutral); flex-shrink: 0; }
.cv-chevron .ti { font-size: 13px; }
.cv-group__name {
  flex: 1; min-width: 0; font-size: 13px; font-weight: var(--fw-semibold);
  color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Project ── */
.cv-proj {
  display: flex; align-items: center; gap: 6px;
  height: 36px; padding: 0 4px 0 20px;
  border-radius: var(--radius-default); cursor: pointer;
  transition: background 0.1s; overflow: hidden;
}
.cv-proj:hover { background: var(--bg-neutral-hover); }
.cv-proj.active { background: var(--bg-brand-light); }
.cv-proj.active .cv-proj__name { color: var(--text-brand); font-weight: var(--fw-semibold); }
.cv-proj__dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.cv-proj__name {
  flex: 1; min-width: 0; font-size: 13px; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Hover actions ── */
.cv-hd-acts { display: none; align-items: center; gap: 1px; flex-shrink: 0; }
.cv-group__hd:hover .cv-hd-acts,
.cv-proj:hover .cv-hd-acts { display: flex; }
.cv-act {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border: none; background: transparent;
  border-radius: 4px; cursor: pointer; color: var(--text-secondary); padding: 0;
}
.cv-act:hover { background: rgba(0,0,0,0.08); }
.cv-act--del:hover { background: var(--bg-danger-light); color: var(--text-danger); }
.cv-act .ti { font-size: 12px; }

/* ── Inline edit ── */
.cv-inline-input {
  flex: 1; min-width: 0; border: 1px solid var(--stroke-brand); border-radius: 4px;
  padding: 0 4px; height: 22px; font-size: 13px; color: var(--text-primary);
  background: var(--bg-white); outline: none;
}

/* ── Add group ── */
.cv-add-group {
  display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 8px;
  border: none; background: transparent; border-radius: var(--radius-default);
  font-size: 13px; color: var(--text-hint); cursor: pointer;
  transition: background 0.1s, color 0.1s; white-space: nowrap;
}
.cv-add-group:hover { background: var(--bg-neutral-hover); color: var(--text-primary); }
.cv-add-group .ti { font-size: 13px; }

/* ── Dropdown ── */
.qa-dd {
  min-width: 280px; background: var(--bg-white);
  border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);
  box-shadow: 0 8px 24px rgba(0,0,0,.12); padding: 12px;
}
.qa-dd__item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; height: 40px; padding: 0 10px;
  border: none; background: transparent; cursor: pointer;
  text-align: left; transition: background .1s; border-radius: 6px;
}
.qa-dd__item:hover { background: var(--bg-neutral-hover); }
.qa-dd__ico { flex-shrink: 0; color: var(--text-secondary); }
.qa-dd__ico .ti { font-size: 16px; }
.qa-dd__lbl { flex: 1; font-size: 13px; color: var(--text-primary); white-space: nowrap; }
.qa-dd__badge {
  flex-shrink: 0; height: 18px; padding: 0 6px; border-radius: 9px;
  background: #ef4444; color: #fff; font-size: 11px; font-weight: var(--fw-semibold);
  display: inline-flex; align-items: center;
}

/* ══ Quick-add popup ══ */
.qap-overlay {
  position: fixed; inset: 0; z-index: 8000;
  background: rgba(10,10,20,0.5);
  display: flex; align-items: center; justify-content: center;
}
.qap-modal {
  width: 780px; max-width: calc(100vw - 32px); max-height: calc(100vh - 64px);
  background: var(--bg-white); border-radius: 14px;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
  display: flex; flex-direction: column; overflow: hidden;
}

/* Header */
.qap-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px 10px;
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0; gap: 8px;
}
.qap-hd-left {
  display: flex; align-items: center; gap: 4px; min-width: 0; flex: 1;
}
.qap-hd-slash { color: var(--text-hint); font-size: 14px; flex-shrink: 0; }

/* ── Cascading selectors (dept / project) ── */
.qap-sel-wrap { position: static; }
.qap-sel-btn {
  display: inline-flex; align-items: center; gap: 5px;
  height: 28px; padding: 0 8px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; font-size: 13px;
  transition: background .1s; white-space: nowrap;
}
.qap-sel-btn:hover:not(:disabled) { background: var(--bg-neutral-hover); }
.qap-sel-btn:disabled { cursor: default; opacity: .5; }
.qap-sel-val { color: var(--text-primary); font-weight: var(--fw-medium); }
.qap-sel-ph  { color: var(--text-hint); }
.qap-sel-arr .ti { font-size: 11px; color: var(--text-hint); }
.qap-proj-dot {
  width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0;
}
.qap-sel-dd {
  min-width: 200px; background: var(--bg-white);
  border: 1px solid var(--stroke-neutral-light); border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0,0,0,.13); padding: 4px 6px;
  max-height: 240px; overflow-y: auto;
}
.qap-sel-dd-item {
  display: flex; align-items: center; gap: 7px;
  width: 100%; height: 34px; padding: 0 8px;
  border: none; background: transparent; border-radius: 6px;
  cursor: pointer; font-size: 13px; color: var(--text-primary);
  text-align: left; transition: background .1s;
}
.qap-sel-dd-item:hover { background: var(--bg-neutral-hover); }
.qap-sel-dd-item.active { color: var(--text-brand); background: var(--bg-brand-light); }
.qap-sel-dd-item--clear { color: var(--text-secondary); font-size: 12px; }
.qap-sel-dd-sep { height: 1px; background: var(--stroke-neutral-light); margin: 3px 2px; }
.qap-hd-right { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.qap-hd-btn {
  width: 28px; height: 28px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  transition: background .1s;
}
.qap-hd-btn:hover { background: var(--bg-neutral-hover); color: var(--text-primary); }
.qap-hd-btn .ti { font-size: 15px; }
.qap-close {
  width: 28px; height: 28px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  margin-left: 4px;
}
.qap-close:hover { background: var(--bg-neutral-hover); color: var(--text-primary); }
.qap-close .ti { font-size: 16px; }

/* Body: two-column layout */
.qap-body {
  display: flex; flex: 1; min-height: 0; overflow: hidden;
}
.qap-main {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  overflow-y: auto;
}

/* ── AI section — violet/indigo palette ── */
.qap-ai-section { padding: 14px 18px 10px; }
.qap-ai-label {
  display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
  font-size: 12px; font-weight: var(--fw-semibold);
}
.qap-ai-label span {
  background: linear-gradient(98deg, #1482ff 8.87%, #cf11ff 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.qap-ai-label .ti { font-size: 14px; color: #1482ff; }

@property --qap-ai-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes qap-ai-spin {
  to { --qap-ai-angle: 360deg; }
}

.qap-ai-wrap { position: relative; }
.qap-ai-wrap.expanded { border-radius: 8px; box-shadow: 0 0 0 3px rgba(20, 130, 255, 0.10); }
.qap-ai-textarea {
  display: block; width: 100%; padding: 8px 12px; box-sizing: border-box;
  border: 1.5px solid transparent; border-radius: 8px;
  background-image:
    linear-gradient(var(--bg-white), var(--bg-white)),
    conic-gradient(from var(--qap-ai-angle) at 50% 50%,
      #1482ff 0%,
      #cf11ff 35%,
      #7b61ff 55%,
      #1482ff 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  animation: qap-ai-spin 4s linear infinite;
  font-size: 13px; color: var(--text-primary); line-height: 1.6;
  outline: none; resize: none; font-family: inherit;
}
.qap-ai-textarea--collapsed { cursor: text; }
.qap-ai-wrap.expanded .qap-ai-textarea { overflow: auto; }
.qap-ai-textarea::placeholder { color: var(--text-hint); }
.qap-ai-hint {
  display: flex; align-items: center; gap: 5px;
  margin-top: 6px; font-size: 12px; color: var(--text-success);
}
.qap-ai-hint .ti { font-size: 13px; }

/* @mention dropdown */
.qap-mention-dd {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
  background: var(--bg-white); border: 1px solid var(--stroke-neutral-light);
  border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,.14);
  padding: 4px 6px; max-height: 200px; overflow-y: auto;
}
.qap-mention-item {
  display: flex; align-items: center; gap: 8px;
  width: 100%; height: 36px; padding: 0 8px;
  border: none; background: transparent; cursor: pointer;
  text-align: left; border-radius: 6px; font-size: 13px; color: var(--text-primary);
  transition: background .1s;
}
.qap-mention-item:hover, .qap-mention-item.active { background: var(--bg-neutral-hover); }
.qap-av { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }

/* ── Form ── */
.qap-form { padding: 4px 18px 16px; display: flex; flex-direction: column; gap: 12px; }

/* Title input */
.qap-title-field { }
.qap-title-field--err .qap-title-input { border-color: var(--stroke-danger); }
.qap-title-input {
  display: block; width: 100%; box-sizing: border-box;
  padding: 6px 0; border: none; outline: none; resize: none; overflow: hidden;
  font-size: 20px; font-weight: var(--fw-semibold); color: var(--text-primary);
  background: transparent; font-family: inherit; line-height: 1.3;
}
.qap-title-input::placeholder { color: var(--text-hint); font-weight: var(--fw-normal); }
.qap-err-msg { display: block; font-size: 11px; color: #ef4444; margin-top: 4px; }

/* Chip row */
.qap-chips { display: flex; gap: 8px; flex-wrap: wrap; }

/* Field box (assignee + deadline) */
.qap-field-box {
  display: inline-flex; flex-direction: row; align-items: center; gap: 8px;
  padding: 6px 10px; border-radius: 8px;
  border: 1px solid var(--stroke-neutral); background: var(--bg-white);
  cursor: pointer; white-space: nowrap; transition: border-color .15s;
}
.qap-field-box:hover { border-color: var(--stroke-brand); }
.qap-field-ico-wrap {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  border: 1.5px dashed var(--stroke-neutral); background: transparent;
  display: flex; align-items: center; justify-content: center;
}
.qap-field-ico-wrap .ti { font-size: 18px; color: var(--icon-neutral); }
.qap-field-box--filled .qap-field-ico-wrap { border-style: solid; border-color: var(--stroke-neutral-light); }
.qap-field-av { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.qap-field-text {
  display: flex; flex-direction: column; gap: 4px; height: 32px; justify-content: center;
}
.qap-field-label { font-size: 12px; color: var(--text-secondary); line-height: 1; }
.qap-field-box--filled .qap-field-label { color: var(--text-primary); }
.qap-field-val { font-size: 13px; color: var(--text-secondary); line-height: 1; }
.qap-field-box--filled .qap-field-val { color: var(--text-primary); font-weight: var(--fw-semibold); }
.qap-field-ph { color: var(--text-hint); }

/* ── Calendar popover ── */
.qap-cal {
  width: 248px; background: var(--bg-white);
  border: 1px solid var(--stroke-neutral-light); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.12); padding: 10px;
}
.qap-cal-hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.qap-cal-title { font-size: 13px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.qap-cal-nav {
  width: 26px; height: 26px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
}
.qap-cal-nav:hover { background: var(--bg-neutral-hover); }
.qap-cal-nav .ti { font-size: 14px; }
.qap-cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px;
}
.qap-cal-dow {
  text-align: center; font-size: 11px; font-weight: var(--fw-semibold);
  color: var(--text-secondary); padding: 4px 0;
}
.qap-cal-day {
  text-align: center; font-size: 12px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; padding: 5px 0; color: var(--text-primary);
  transition: background .1s;
}
.qap-cal-day:hover:not(.qap-cal-day--other) { background: var(--bg-neutral-hover); }
.qap-cal-day--other { color: var(--text-hint); cursor: default; }
.qap-cal-day--today { font-weight: var(--fw-semibold); color: var(--text-brand); }
.qap-cal-day--sel { background: var(--bg-brand) !important; color: var(--text-white) !important; border-radius: 6px; }
.qap-cal-ft { border-top: 1px solid var(--stroke-neutral-light); margin-top: 8px; padding-top: 8px; text-align: right; }
.qap-cal-clear {
  border: none; background: transparent; font-size: 12px;
  color: var(--text-secondary); cursor: pointer; padding: 2px 4px; border-radius: 4px;
}
.qap-cal-clear:hover { color: var(--text-danger); background: var(--bg-danger-light); }

/* People dropdown */
.qap-people-dd {
  min-width: 220px;
  background: var(--bg-white); border: 1px solid var(--stroke-neutral-light);
  border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.14);
  overflow: hidden;
}
.qap-people-search {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; border-bottom: 1px solid var(--stroke-neutral-light);
}
.qap-people-search-ico { flex-shrink: 0; color: var(--text-hint); }
.qap-people-search-ico .ti { font-size: 14px; }
.qap-people-search-inp {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 13px; color: var(--text-primary); font-family: inherit;
}
.qap-people-search-inp::placeholder { color: var(--text-hint); }
.qap-people-list { padding: 4px 6px; max-height: 200px; overflow-y: auto; }
.qap-people-empty { padding: 10px 6px; font-size: 13px; color: var(--text-hint); text-align: center; }
.qap-mention-name { flex: 1; }
.qap-mention-check { flex-shrink: 0; color: var(--text-brand); }
.qap-mention-check .ti { font-size: 14px; }
.qap-mention-item--sel { background: var(--bg-brand-light); }

/* Mô tả textarea */
.qap-desc {
  padding: 8px 10px; box-sizing: border-box;
  border: 1px solid var(--stroke-neutral); border-radius: 8px;
  font-size: 13px; color: var(--text-primary); background: var(--bg-white);
  outline: none; width: 100%; resize: none; font-family: inherit; line-height: 1.5;
  transition: border-color .15s;
}
.qap-desc:focus { border-color: var(--stroke-brand); }
.qap-desc::placeholder { color: var(--text-hint); }

/* Action links */
.qap-action-links { display: flex; flex-direction: column; gap: 0; }
.qap-add-link {
  display: flex; align-items: center; gap: 8px;
  height: 32px; padding: 0 4px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; font-size: 12px; color: var(--text-brand);
  transition: background .1s, color .1s;
}
.qap-add-link:hover { color: var(--text-brand-hover, var(--text-brand)); opacity: 0.8; }
.qap-add-link .ti { font-size: 14px; }

/* Tệp đính kèm */
.qap-attach { display: flex; flex-direction: column; gap: 6px; }
.qap-attach-hd {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: var(--fw-semibold); color: var(--text-secondary);
}
.qap-attach-hd .ti { font-size: 14px; }
.qap-attach-zone {
  display: flex; align-items: center; gap: 10px;
  border: 1.5px dashed var(--stroke-neutral); border-radius: 8px;
  padding: 12px 14px; cursor: pointer; transition: border-color .15s, background .1s;
}
.qap-attach-zone:hover { border-color: var(--stroke-brand); background: var(--bg-brand-light); }
.qap-attach-zone .ti { font-size: 20px; color: var(--text-hint); flex-shrink: 0; }
.qap-attach-texts { display: flex; flex-direction: column; gap: 2px; }
.qap-attach-texts span:first-child { font-size: 13px; color: var(--text-secondary); }
.qap-attach-hint { font-size: 11px; color: var(--text-hint); }

/* ── Right sidebar ── */
.qap-sidebar {
  width: 192px; flex-shrink: 0;
  border-left: 1px solid var(--stroke-neutral-light);
  padding: 14px 12px; display: flex; flex-direction: column; gap: 4px;
  overflow-y: auto;
}
.qap-sb-btn {
  display: flex; align-items: center; gap: 6px;
  width: 100%; height: 34px; padding: 0 6px 0 4px;
  border: none; background: transparent; border-radius: 7px;
  cursor: pointer; font-size: 13px; color: var(--text-primary);
  text-align: left; transition: background .1s, color .1s;
}
.qap-sb-btn:hover { background: var(--bg-neutral-hover); color: var(--text-primary); }
.qap-sb-btn > .ti { font-size: 16px; flex-shrink: 0; color: var(--icon-neutral); }
.qap-sb-btn span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.qap-sb-add { margin-left: auto; opacity: 0; transition: opacity .1s; color: var(--text-hint); flex-shrink: 0; }
.qap-sb-add .ti { font-size: 14px; }
.qap-sb-btn:hover .qap-sb-add { opacity: 1; }

/* Footer */
.qap-ft {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  padding: 12px 18px; border-top: 1px solid var(--stroke-neutral-light);
  background: var(--neutral-100); flex-shrink: 0;
}

/* ══ Sidebar: Dark mode (khi chọn "Tối" ở thiết lập màu sắc) ══ */
:root[data-sidebar="dark"] .qab-split { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); }
:root[data-sidebar="dark"] .qab-main,
:root[data-sidebar="dark"] .qab-arr { color: rgba(255,255,255,0.9); }
:root[data-sidebar="dark"] .qab-main:hover,
:root[data-sidebar="dark"] .qab-arr:hover { background: rgba(255,255,255,0.16); }
:root[data-sidebar="dark"] .qab-sep { background: rgba(255,255,255,0.3); }

:root[data-sidebar="dark"] .cv-sep { background: rgba(255,255,255,0.08); }

:root[data-sidebar="dark"] .cv-search-ico,
:root[data-sidebar="dark"] .cv-tool-btn,
:root[data-sidebar="dark"] .cv-chevron,
:root[data-sidebar="dark"] .qa-dd__ico,
:root[data-sidebar="dark"] .cv-act { color: rgba(255,255,255,0.5); }
:root[data-sidebar="dark"] .cv-search-input { color: rgba(255,255,255,0.9); }
:root[data-sidebar="dark"] .cv-search-input::placeholder { color: rgba(255,255,255,0.35); }
:root[data-sidebar="dark"] .cv-tool-btn:hover,
:root[data-sidebar="dark"] .cv-act:hover { background: rgba(255,255,255,0.12); }
:root[data-sidebar="dark"] .cv-act--del:hover { color: var(--text-danger); }

:root[data-sidebar="dark"] .cv-group__hd:hover,
:root[data-sidebar="dark"] .cv-proj:hover { background: rgba(255,255,255,0.08); }
:root[data-sidebar="dark"] .cv-group__name,
:root[data-sidebar="dark"] .cv-proj__name { color: rgba(255,255,255,0.85); }
:root[data-sidebar="dark"] .cv-proj.active { background: rgba(255,255,255,0.12); }
:root[data-sidebar="dark"] .cv-proj.active .cv-proj__name { color: #fff; }

:root[data-sidebar="dark"] .cv-add-group { color: rgba(255,255,255,0.4); }
:root[data-sidebar="dark"] .cv-add-group:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); }

:root[data-sidebar="dark"] .cv-inline-input {
  background: rgba(255,255,255,0.08); color: #fff; border-color: var(--bg-brand);
}
</style>
