<template>
  <AppShell>
    <div class="vctt">

      <!-- ══ Header ══ -->
      <div class="vctt-header" :class="{ 'vctt-header--flat': currentProject.id !== 'all' }">
        <div class="vctt-bar">
          <!-- Tabs -->
          <div v-if="currentProject.id !== 'all'" class="vctt-tabs vctt-tabs--proj">
            <div class="vctt-proj-title" @click.stop="projOpen = !projOpen">
              <TIcon name="folder" />
              <span>{{ currentProject.label }}</span>
              <TIcon name="chevron-down" class="vctt-proj-title__arr" />

              <div v-if="projOpen" class="proj-dd" @click.stop>
                <div class="proj-dd__search">
                  <TIcon name="search" class="proj-dd__search-ico" />
                  <input class="proj-dd__search-input" v-model="projSearch"
                    placeholder="Tìm dự án..." @click.stop />
                </div>
                <div class="proj-dd__body">
                  <div class="proj-item proj-item--all"
                    :class="{ active: false }"
                    @click="projOpen = false; router.push('/viec-cua-toi')">
                    Tất cả
                  </div>
                  <div v-if="filteredProjGroups.length > 0" class="proj-dd__section-hd">Dự án</div>
                  <div v-for="grp in filteredProjGroups" :key="grp.id" class="proj-grp">
                    <div class="proj-grp__hd" @click.stop="grp.expanded = !grp.expanded">
                      <TIcon :name="grp.expanded ? 'chevron-down' : 'chevron-right'" class="proj-grp__arr" />
                      <span class="proj-grp__name">{{ grp.label }}</span>
                    </div>
                    <template v-if="grp.expanded">
                      <div v-for="p in grp.projects" :key="p.id"
                        class="proj-item" :class="{ active: currentProject.id === p.id }"
                        @click="projOpen = false; router.push('/du-an/' + p.id)">
                        <span class="proj-item__dot" :style="{ background: p.color }"></span>
                        {{ p.label }}
                      </div>
                    </template>
                  </div>
                  <div v-if="filteredProjGroups.length === 0" class="proj-dd__empty">Không tìm thấy</div>
                </div>
              </div>
            </div>
            <div class="vctt-proj-divider"></div>
            <div class="vctt-proj-tabs">
              <button v-for="pv in projectViewTabs" :key="pv.id" class="vctt-tab"
                :class="{ active: view === pv.id }" @click="view = pv.id">
                {{ pv.label }}
              </button>
            </div>
          </div>
          <div v-else class="vctt-tabs">
            <button class="vctt-tab" :class="{ active: tab === 'nhan' }" @click="onTabChange('nhan')">
              Giao cho tôi
              <span class="vctt-tab__badge">{{ tasksByTab.nhan.length }}</span>
            </button>
            <button class="vctt-tab" :class="{ active: tab === 'giao' }" @click="onTabChange('giao')">
              Tôi giao
              <span class="vctt-tab__badge">{{ tasksByTab.giao.length }}</span>
            </button>
            <button class="vctt-tab" :class="{ active: tab === 'lienquan' }" @click="onTabChange('lienquan')">
              Liên quan đến tôi
              <span class="vctt-tab__badge">{{ tasksByTab.lienquan.length }}</span>
            </button>
            <button class="vctt-tab" :class="{ active: tab === 'duyet' }" @click="onTabChange('duyet')">
              Tôi duyệt
              <span class="vctt-tab__badge">{{ tasksByTab.duyet.length }}</span>
            </button>
          </div>

          <div class="vctt-bar__right">
            <!-- Project selector (2-level) — ẩn khi ở chế độ dự án vì đã có tên dự án bên trái -->
            <div v-if="currentProject.id === 'all'" class="vctt-proj" @click.stop="projOpen = !projOpen">
              <span class="vctt-proj__lbl">Nhóm/Dự án:</span>
              <span class="vctt-proj__val">{{ currentProject.label }}</span>
              <TIcon name="chevron-down" class="vctt-proj__arr" />

              <div v-if="projOpen" class="proj-dd" @click.stop>
                <!-- Search -->
                <div class="proj-dd__search">
                  <TIcon name="search" class="proj-dd__search-ico" />
                  <input class="proj-dd__search-input" v-model="projSearch"
                    placeholder="Tìm dự án..." @click.stop />
                </div>
                <div class="proj-dd__body">
                  <div class="proj-item proj-item--all"
                    :class="{ active: currentProject.id === 'all' }"
                    @click="currentProject = { id: 'all', label: 'Tất cả' }; projOpen = false">
                    Tất cả
                  </div>
                  <div v-if="filteredProjGroups.length > 0" class="proj-dd__section-hd">Dự án</div>
                  <div v-for="grp in filteredProjGroups" :key="grp.id" class="proj-grp">
                    <div class="proj-grp__hd" @click.stop="grp.expanded = !grp.expanded">
                      <TIcon :name="grp.expanded ? 'chevron-down' : 'chevron-right'" class="proj-grp__arr" />
                      <span class="proj-grp__name">{{ grp.label }}</span>
                    </div>
                    <template v-if="grp.expanded">
                      <div v-for="p in grp.projects" :key="p.id"
                        class="proj-item" :class="{ active: currentProject.id === p.id }"
                        @click="currentProject = { id: p.id, label: p.label }; projOpen = false">
                        <span class="proj-item__dot" :style="{ background: p.color }"></span>
                        {{ p.label }}
                      </div>
                    </template>
                  </div>
                  <div v-if="filteredProjGroups.length === 0" class="proj-dd__empty">Không tìm thấy</div>
                </div>
              </div>
            </div>


            <!-- Gom nhóm dropdown — ẩn khi ở chế độ dự án (mặc định gom theo trạng thái riêng của dự án) -->
            <div v-if="currentProject.id === 'all'" class="vctt-grp" :class="{ active: showGroupBy }" @click.stop="showGroupBy = !showGroupBy">
              <span class="vctt-grp__lbl">Gom nhóm:</span>
              <span class="vctt-grp__val">{{ groupByOptions.find(o => o.id === groupBy)?.label }}</span>
              <TIcon name="chevron-down" class="vctt-grp__arr" />
              <div v-if="showGroupBy" class="grp-dd" @click.stop>
                <button v-for="opt in groupByOptions" :key="opt.id"
                  class="grp-dd__item" :class="{ active: groupBy === opt.id }"
                  @click.stop="groupBy = opt.id; showGroupBy = false">
                  <TIcon v-if="groupBy === opt.id" name="check" class="grp-dd__check" />
                  <span v-else class="grp-dd__check-spacer"></span>
                  Theo {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- View switcher — ẩn khi ở chế độ dự án vì đã có tab Bảng/Danh sách/Lịch bên trái -->
            <div v-if="currentProject.id === 'all'" class="vctt-views">
              <button class="vctt-view" :class="{ active: view === 'kanban' }"   @click="view = 'kanban'"   title="Kanban"><TIcon name="layout-kanban" /></button>
              <button class="vctt-view" :class="{ active: view === 'list' }"     @click="view = 'list'"     title="Danh sách"><TIcon name="list" /></button>
              <button class="vctt-view" :class="{ active: view === 'calendar' }" @click="view = 'calendar'" title="Lịch"><TIcon name="calendar" /></button>
            </div>

            <button v-if="currentProject.id === 'all'" class="vctt-filter-btn"
              :class="{ active: showFilter, 'has-filter': hasActiveFilter }"
              @click.stop="showFilter = !showFilter" title="Bộ lọc">
              <TIcon name="filter" />
            </button>

            <button class="btn btn--primary" @click="openAddTask()">
              <TIcon name="plus" /><span>Thêm công việc</span>
            </button>
          </div>
        </div>

      </div><!-- /vctt-header -->

      <!-- ══ Body: main view + right person panel ══ -->
      <div class="vctt-body" @click="closeDropdowns">

        <!-- Main view area -->
        <div class="vctt-main">

          <!-- Toolbar dự án: tìm kiếm + trạng thái + lọc + sắp xếp + tuỳ chỉnh hiển thị —
               đặt trong vctt-main (không full-width) để khung Người giao bên phải cao full, không bị toolbar này chèn lên đầu -->
          <div v-if="currentProject.id !== 'all'" class="proj-toolbar" @click.stop="closeDropdowns">
            <div class="fb-search proj-toolbar__search" @click.stop>
              <TIcon name="search" class="fb-search-ico" />
              <input class="fb-search-input" v-model="filterName" placeholder="Tìm kiếm công việc" />
              <button v-if="filterName" class="fb-search-clear" @click="filterName = ''"><TIcon name="x" /></button>
            </div>

            <div class="vctt-grp" :class="{ active: showStatusDd }" @click.stop="showStatusDd = !showStatusDd">
              <TIcon name="circle-check" class="vctt-grp__ico" />
              <span class="vctt-grp__val">{{ filterStatusId === 'all' ? 'Tất cả trạng thái' : (statuses.find(s => s.id === filterStatusId)?.label || 'Tất cả trạng thái') }}</span>
              <TIcon name="chevron-down" class="vctt-grp__arr" />
              <div v-if="showStatusDd" class="grp-dd" @click.stop>
                <button class="grp-dd__item" :class="{ active: filterStatusId === 'all' }" @click="filterStatusId = 'all'; showStatusDd = false">
                  <TIcon v-if="filterStatusId === 'all'" name="check" class="grp-dd__check" /><span v-else class="grp-dd__check-spacer"></span>
                  Tất cả trạng thái
                </button>
                <button v-for="s in statuses" :key="s.id" class="grp-dd__item" :class="{ active: filterStatusId === s.id }" @click="filterStatusId = s.id; showStatusDd = false">
                  <TIcon v-if="filterStatusId === s.id" name="check" class="grp-dd__check" /><span v-else class="grp-dd__check-spacer"></span>
                  {{ s.label }}
                </button>
              </div>
            </div>

            <div class="vctt-grp" :class="{ active: showFilter, 'has-filter': hasActiveFilter }" @click.stop="showFilter = !showFilter">
              <TIcon name="filter" class="vctt-grp__ico" />
              <span class="vctt-grp__val">{{ hasActiveFilter ? 'Đã lọc' : 'Không lọc' }}</span>
              <TIcon name="chevron-down" class="vctt-grp__arr" />
            </div>

            <div class="vctt-grp" :class="{ active: showSortDd }" @click.stop="showSortDd = !showSortDd">
              <TIcon name="sort-ascending" class="vctt-grp__ico" />
              <span class="vctt-grp__val">{{ SORT_OPTS.find(o => o.id === sortBy)?.label }}</span>
              <TIcon name="chevron-down" class="vctt-grp__arr" />
              <div v-if="showSortDd" class="grp-dd" @click.stop>
                <button v-for="o in SORT_OPTS" :key="o.id" class="grp-dd__item" :class="{ active: sortBy === o.id }" @click="sortBy = o.id; showSortDd = false">
                  <TIcon v-if="sortBy === o.id" name="check" class="grp-dd__check" /><span v-else class="grp-dd__check-spacer"></span>
                  {{ o.label }}
                </button>
              </div>
            </div>

            <div class="vctt-grp" :class="{ active: showDisplayDd }" @click.stop="showDisplayDd = !showDisplayDd">
              <TIcon name="eye" class="vctt-grp__ico" />
              <span class="vctt-grp__val">Tùy chỉnh hiển thị</span>
              <TIcon name="chevron-down" class="vctt-grp__arr" />
              <div v-if="showDisplayDd" class="grp-dd" @click.stop>
                <div class="grp-dd__soon">Đang phát triển</div>
              </div>
            </div>

            <div class="proj-toolbar__right">
              <button class="btn-icon btn-icon--outline" title="Làm mới" @click="resetProjToolbar"><TIcon name="refresh" /></button>
              <button class="btn-icon btn-icon--outline" title="Xuất CSV" @click="exportTasksCsv"><TIcon name="file-export" /></button>
              <button class="btn-icon btn-icon--outline" title="Biểu đồ"><TIcon name="chart-donut" /></button>
            </div>
          </div>

          <!-- Filter bar -->
          <transition name="slide-panel">
            <div v-if="showFilter" class="filter-bar" @click.stop>
              <div class="fb-search">
                <TIcon name="search" class="fb-search-ico" />
                <input class="fb-search-input" v-model="filterName" placeholder="Tìm tên công việc..." />
                <button v-if="filterName" class="fb-search-clear" @click="filterName = ''"><TIcon name="x" /></button>
              </div>
              <div class="fb-group">
                <span class="fb-lbl">Ưu tiên:</span>
                <button v-for="p in PRIORITY_OPTS" :key="p.id"
                  class="fb-pill" :class="{ active: filterPris.includes(p.id) }"
                  @click="toggleFilterPri(p.id)">{{ p.label }}</button>
              </div>
              <div class="fb-group">
                <span class="fb-lbl">Hạn:</span>
                <button v-for="d in DUE_OPTS" :key="d.id"
                  class="fb-pill" :class="{ active: filterDue === d.id }"
                  @click="filterDue = d.id">{{ d.label }}</button>
              </div>
              <button v-if="hasActiveFilter" class="fb-clear" @click="clearFilters">
                <TIcon name="x" />Xóa lọc
              </button>
            </div>
          </transition>

          <!-- KANBAN -->
          <div v-if="view === 'kanban'" class="kanban-wrap">

            <!-- Gom nhóm theo trạng thái vòng đời -->
            <div v-if="groupBy === 'lifecycle'" class="kanban-board">
              <div v-for="col in kanbanLifecycleCols" :key="col.id" class="kanban-col"
                :style="{ '--col-color': col.color }">
                <div class="kanban-col__hd">
                  <span class="kcol-name">{{ col.label }}</span>
                  <span class="kcol-count">{{ col.tasks.length }}</span>
                </div>
                <div class="kanban-col__body"
                  @dragover.prevent="onColDragOver($event, col.id)"
                  @dragleave="onColDragLeave($event, col.id)"
                  @drop.prevent="onColDrop(col.id)">
                  <template v-for="task in col.tasks" :key="task.id">
                    <div v-if="dragStarted && dragOverColId === col.id && dropBeforeTaskId === task.id && dragTaskId !== task.id"
                      class="kcard-ghost"></div>
                    <div class="kcard"
                      :class="{
                        'kcard--done':     task.done,
                        'kcard--new':      task.id === newTaskId,
                        'kcard--dragging': dragStarted && dragTaskId === task.id,
                        'kcard--dimmed':   dragStarted && dragTaskId !== task.id,
                      }"
                      :data-task-id="task.id" draggable="true"
                      @dragstart="onCardDragStart($event, task)" @dragend="onCardDragEnd"
                      @click.stop="openTask(task)">
                      <div class="kcard__top">
                        <button class="task-check" :class="{ 'task-check--done': task.done }" @click="toggleDone(task, $event)">
                          <TIcon v-if="task.done" name="check" :stroke-width="2.5" />
                        </button>
                        <div class="kcard__name">{{ task.name }}</div>
                      </div>
                      <div class="kcard__meta">
                        <span v-if="task.dueDate" class="kcard__date" :class="{ overdue: isOverdue(task.dueDate) }">
                          <TIcon name="calendar" />{{ fmtDate(task.dueDate) }}
                        </span>
                        <span class="kcard__pri" :class="`kcard__pri--${task.priority}`"><TIcon name="flag-2" /></span>
                      </div>
                      <div class="kcard__foot">
                        <img class="kcard__av" :src="task.assignee.avatar" :alt="task.assignee.av"
                          :style="{ background: task.assignee.color }" :title="task.assignee.name" />
                        <div class="kcard__foot-right">
                          <span v-if="task.subTasks" class="kcard__sub"><TIcon name="clipboard-list" />{{ task.subTasksDone }}/{{ task.subTasks }}</span>
                          <span v-if="task.comments" class="kcard__cmt"><TIcon name="message-circle" />{{ task.comments }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                  <div v-if="dragStarted && dragOverColId === col.id && dropBeforeTaskId === null" class="kcard-ghost"></div>
                  <button class="kcol-add" @click.stop="openAddTask(col.id)">
                    <TIcon name="plus" />Thêm công việc
                  </button>
                </div>
              </div>
            </div>

            <!-- Gom nhóm theo người: mỗi cột = 1 người -->
            <div v-else-if="groupBy !== 'status'" class="kanban-board kanban-board--person">
              <div v-for="col in kanbanPersonCols" :key="col.id" class="kanban-col kanban-col--person"
                :style="{ '--col-color': col.color }">
                <div class="kanban-col__hd">
                  <img v-if="col.avatar" class="kpc-av" :src="col.avatar" :alt="col.av" :style="{ background: col.color }" />
                  <span v-else class="kpc-av kpc-av--fb" :style="{ background: col.color }">{{ col.av }}</span>
                  <span class="kcol-name">{{ col.label }}</span>
                  <span class="kcol-count">{{ col.tasks.length }}</span>
                </div>
                <div class="kanban-col__body">
                  <template v-for="task in col.tasks" :key="task.id">
                    <div class="kcard" :class="{ 'kcard--done': task.done, 'kcard--new': task.id === newTaskId }"
                      @click.stop="openTask(task)">
                      <div class="kcard__top">
                        <button class="task-check" :class="{ 'task-check--done': task.done }" @click="toggleDone(task, $event)">
                          <TIcon v-if="task.done" name="check" :stroke-width="2.5" />
                        </button>
                        <div class="kcard__name">{{ task.name }}</div>
                      </div>
                      <div class="kcard__meta">
                        <span v-if="task.dueDate" class="kcard__date" :class="{ overdue: isOverdue(task.dueDate) }">
                          <TIcon name="calendar" />{{ fmtDate(task.dueDate) }}
                        </span>
                        <span class="kcard__pri" :class="`kcard__pri--${task.priority}`"><TIcon name="flag-2" /></span>
                      </div>
                      <div class="kcard__foot">
                        <span class="kcard__status-chip" :style="{ background: statusById(task.statusId)?.color+'22', color: statusById(task.statusId)?.color }">
                          {{ statusById(task.statusId)?.label }}
                        </span>
                        <div class="kcard__foot-right">
                          <span v-if="task.subTasks" class="kcard__sub"><TIcon name="clipboard-list" />{{ task.subTasksDone }}/{{ task.subTasks }}</span>
                          <span v-if="task.comments" class="kcard__cmt"><TIcon name="message-circle" />{{ task.comments }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                  <button class="kcol-add" @click.stop="openAddTask(col.id)">
                    <TIcon name="plus" />Thêm công việc
                  </button>
                </div>
              </div>
            </div>

            <!-- Gom nhóm theo trạng thái (mặc định) — All-projects: swimlane theo dự án -->
            <div v-else-if="currentProject.id === 'all'" class="kanban-swimlanes">
              <div v-for="lane in swimlanes" :key="lane.id" class="kanban-lane" :style="{ '--lane-color': lane.color }">
                <div class="kanban-lane__hd" @click="toggleLane(lane.id)">
                  <TIcon :name="collapsedLaneIds.has(lane.id) ? 'chevron-right' : 'chevron-down'" class="kl-chevron" />
                  <span class="kl-dot"></span>
                  <span class="kl-name">{{ lane.label }}</span>
                  <span class="kl-count">{{ lane.tasks.length }}</span>
                </div>
                <div v-if="!collapsedLaneIds.has(lane.id)" class="kanban-lane__body">
                  <div v-for="col in lane.cols" :key="col.id" class="kanban-col"
                    :style="{ '--col-color': col.color }">
                    <div class="kanban-col__hd">
                      <span class="kcol-name">{{ col.label }}</span>
                      <span class="kcol-count">{{ col.tasks.length }}</span>
                    </div>
                    <div class="kanban-col__body"
                      @dragover.prevent="onColDragOver($event, col.colKey)"
                      @dragleave="onColDragLeave($event, col.colKey)"
                      @drop.prevent="onColDrop(col.colKey)">
                      <template v-for="task in col.tasks" :key="task.id">
                        <div v-if="dragStarted && dragOverColId === col.colKey && dropBeforeTaskId === task.id && dragTaskId !== task.id"
                          class="kcard-ghost"></div>
                        <div class="kcard"
                          :class="{
                            'kcard--done':     task.done,
                            'kcard--new':      task.id === newTaskId,
                            'kcard--dragging': dragStarted && dragTaskId === task.id,
                            'kcard--dimmed':   dragStarted && dragTaskId !== task.id,
                          }"
                          :data-task-id="task.id" draggable="true"
                          @dragstart="onCardDragStart($event, task)" @dragend="onCardDragEnd"
                          @click.stop="openTask(task)">
                          <div class="kcard__top">
                            <button class="task-check" :class="{ 'task-check--done': task.done }" @click="toggleDone(task, $event)" :title="task.done ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'">
                              <TIcon v-if="task.done" name="check" :stroke-width="2.5" />
                            </button>
                            <div class="kcard__name">{{ task.name }}</div>
                          </div>
                          <div class="kcard__meta">
                            <span v-if="task.dueDate" class="kcard__date" :class="{ overdue: isOverdue(task.dueDate) }">
                              <TIcon name="calendar" />{{ fmtDate(task.dueDate) }}
                            </span>
                            <span class="kcard__pri" :class="`kcard__pri--${task.priority}`"><TIcon name="flag-2" /></span>
                          </div>
                          <div class="kcard__foot">
                            <img class="kcard__av" :src="task.assignee.avatar" :alt="task.assignee.av"
                              :style="{ background: task.assignee.color }" :title="task.assignee.name" />
                            <div class="kcard__foot-right">
                              <span v-if="task.subTasks" class="kcard__sub"><TIcon name="clipboard-list" />{{ task.subTasksDone }}/{{ task.subTasks }}</span>
                              <span v-if="task.comments" class="kcard__cmt"><TIcon name="message-circle" />{{ task.comments }}</span>
                            </div>
                          </div>
                        </div>
                      </template>
                      <div v-if="dragStarted && dragOverColId === col.colKey && dropBeforeTaskId === null" class="kcard-ghost"></div>
                      <button class="kcol-add" @click.stop="openAddTask(col.id, lane.id)">
                        <TIcon name="plus" />Thêm công việc
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Một dự án: kanban theo trạng thái -->
            <div v-else class="kanban-board">
              <div v-for="col in kanbanColumns" :key="col.id" class="kanban-col"
                :style="{ '--col-color': col.color }">
                <div class="kanban-col__hd">
                  <span v-if="colEditId !== col.id" class="kcol-name">{{ col.label }}</span>
                  <input v-else class="kcol-rename-input" v-model="colEditLabel"
                    @blur="saveRename(col)" @keyup.enter="saveRename(col)" @keyup.esc="colEditId = null" />
                  <span class="kcol-count">{{ col.tasks.length }}</span>
                  <button class="kcol-menu-btn" @click.stop="toggleColMenu(col.id)">
                    <TIcon name="dots-vertical" />
                  </button>
                  <div v-if="colMenuId === col.id" class="kcol-dd" @click.stop>
                    <template v-if="colorPickTarget?.id === col.id">
                      <div class="kcol-color-grid">
                        <button v-for="c in PALETTE" :key="c" class="kcol-color-swatch"
                          :class="{ active: colorPickTarget.color === c }"
                          :style="{ background: c }"
                          @click="pickColor(colorPickTarget, c)">
                          <TIcon v-if="colorPickTarget.color === c" name="check" />
                        </button>
                      </div>
                    </template>
                    <template v-else>
                      <button class="kcol-dd__item" @click="startRename(col)"><TIcon name="pencil" />Đổi tên</button>
                      <button class="kcol-dd__item" @click="openColorPick(statusById(col.id))"><TIcon name="palette" />Đổi màu</button>
                      <button class="kcol-dd__item kcol-dd__item--del" @click="deleteStatusByColId(col.id)"><TIcon name="trash" />Xóa nhóm</button>
                    </template>
                  </div>
                </div>
                <div class="kanban-col__body"
                  @dragover.prevent="onColDragOver($event, col.id)"
                  @dragleave="onColDragLeave($event, col.id)"
                  @drop.prevent="onColDrop(col.id)">
                  <template v-for="task in col.tasks" :key="task.id">
                    <div v-if="dragStarted && dragOverColId === col.id && dropBeforeTaskId === task.id && dragTaskId !== task.id"
                      class="kcard-ghost"></div>
                    <div class="kcard"
                      :class="{
                        'kcard--done':     task.done,
                        'kcard--new':      task.id === newTaskId,
                        'kcard--dragging': dragStarted && dragTaskId === task.id,
                        'kcard--dimmed':   dragStarted && dragTaskId !== task.id,
                      }"
                      :data-task-id="task.id" draggable="true"
                      @dragstart="onCardDragStart($event, task)" @dragend="onCardDragEnd"
                      @click.stop="openTask(task)">
                      <div class="kcard__top">
                        <button class="task-check" :class="{ 'task-check--done': task.done }" @click="toggleDone(task, $event)" :title="task.done ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'">
                          <TIcon v-if="task.done" name="check" :stroke-width="2.5" />
                        </button>
                        <div class="kcard__name">{{ task.name }}</div>
                      </div>
                      <div class="kcard__meta">
                        <span v-if="task.dueDate" class="kcard__date" :class="{ overdue: isOverdue(task.dueDate) }">
                          <TIcon name="calendar" />{{ fmtDate(task.dueDate) }}
                        </span>
                        <span class="kcard__pri" :class="`kcard__pri--${task.priority}`"><TIcon name="flag-2" /></span>
                      </div>
                      <div class="kcard__foot">
                        <img class="kcard__av" :src="task.assignee.avatar" :alt="task.assignee.av"
                          :style="{ background: task.assignee.color }" :title="task.assignee.name" />
                        <div class="kcard__foot-right">
                          <span v-if="task.subTasks" class="kcard__sub"><TIcon name="clipboard-list" />{{ task.subTasksDone }}/{{ task.subTasks }}</span>
                          <span v-if="task.comments" class="kcard__cmt"><TIcon name="message-circle" />{{ task.comments }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                  <div v-if="dragStarted && dragOverColId === col.id && dropBeforeTaskId === null" class="kcard-ghost"></div>
                  <button class="kcol-add" @click.stop="openAddTask(col.id)">
                    <TIcon name="plus" />Thêm công việc
                  </button>
                </div>
              </div>

              <button class="kanban-addcol" @click="addStatusColumn">
                <TIcon name="plus" />Thêm nhóm công việc
              </button>
            </div>

          </div>

          <!-- LIST -->
          <div v-else-if="view === 'list'" class="list-wrap"
            :class="{ 'list-wrap--resizing': resizingCol }"
            :style="{
              '--lw-person': colWidths.person + 'px',
              '--lw-date':   colWidths.date   + 'px',
              '--lw-status': colWidths.status + 'px',
              '--lw-pri':    colWidths.priority + 'px',
            }">
            <!-- Column divider lines: right = padding(16) + cumulative col widths (no gap) -->
            <div class="lcol-div" style="right:calc(16px + var(--lw-pri))"></div>
            <div class="lcol-div" style="right:calc(16px + var(--lw-pri) + var(--lw-status))"></div>
            <div class="lcol-div" style="right:calc(16px + var(--lw-pri) + var(--lw-status) + var(--lw-date))"></div>
            <div class="lcol-div" style="right:calc(16px + var(--lw-pri) + var(--lw-status) + var(--lw-date) + var(--lw-person))"></div>
            <div class="list-header">
              <span class="lh-check-spacer"></span>
              <span class="lh-name">Tên công việc</span>
              <span class="lh-person">
                {{ personColLabel }}
                <span class="col-rz" @mousedown.stop.prevent="onColResizeStart($event, 'person')"></span>
              </span>
              <span class="lh-date">
                Hạn hoàn thành
                <span class="col-rz" @mousedown.stop.prevent="onColResizeStart($event, 'date')"></span>
              </span>
              <span class="lh-status">
                Nhóm
                <span class="col-rz" @mousedown.stop.prevent="onColResizeStart($event, 'status')"></span>
              </span>
              <span class="lh-pri">
                Ưu tiên
                <span class="col-rz" @mousedown.stop.prevent="onColResizeStart($event, 'priority')"></span>
              </span>
            </div>
            <!-- ── TẤT CẢ DỰ ÁN + gom nhóm status: Dự án → Nhóm → Công việc → Công việc con ── -->
            <template v-if="currentProject.id === 'all' && groupBy === 'status'">
              <div v-for="proj in nestedListGroups" :key="proj.id" class="list-proj">
                <!-- Dự án header -->
                <div class="list-proj-hd" @click="toggleListGroup(proj.id)"
                  :style="{ '--proj-color': proj.color }">
                  <TIcon :name="collapsedGroupIds.has(proj.id) ? 'chevron-right' : 'chevron-down'" class="lgrp-chevron" />
                  <span class="lgrp-dot lgrp-dot--proj" :style="{ background: proj.color }"></span>
                  <span class="list-proj-name">{{ proj.label }}</span>
                  <span class="lgrp-count">{{ proj.statusGroups.reduce((s,g)=>s+g.tasks.length,0) }}</span>
                </div>
                <template v-if="!collapsedGroupIds.has(proj.id)">
                  <div v-for="sg in proj.statusGroups" :key="sg.id">
                    <!-- Nhóm trạng thái header -->
                    <div class="list-sg-hd" @click="toggleListGroup(proj.id+':'+sg.id)">
                      <TIcon :name="collapsedGroupIds.has(proj.id+':'+sg.id) ? 'chevron-right' : 'chevron-down'" class="lgrp-chevron" />
                      <span class="lgrp-dot" :style="{ background: sg.color }"></span>
                      <span class="lgrp-name">{{ sg.label }}</span>
                      <span class="lgrp-count">{{ sg.tasks.length }}</span>
                    </div>
                    <template v-if="!collapsedGroupIds.has(proj.id+':'+sg.id)">
                      <div v-for="task in sg.tasks" :key="task.id">
                        <!-- Công việc row -->
                        <div class="list-row list-row--l2" :class="{ 'list-row--done': task.done, 'list-row--new': task.id === newTaskId }" @click.stop="openTask(task)">
                          <span class="lr-indent lr-indent--l2"></span>
                          <button v-if="task.subTaskList.length" class="lr-sub-toggle" @click.stop="toggleSubTasks(task.id)">
                            <TIcon :name="expandedSubIds.has(task.id) ? 'chevron-down' : 'chevron-right'" />
                          </button>
                          <span v-else class="lr-sub-spacer"></span>
                          <button class="task-check" :class="{ 'task-check--done': task.done }" @click.stop="toggleDone(task, $event)">
                            <TIcon v-if="task.done" name="check" :stroke-width="2.5" />
                          </button>
                          <span class="lr-name" @click.stop="startCellEdit(task, 'name', $event)">
                            <input v-if="isCellEdit(task, 'name')" class="lr-cell-input" :value="task.name"
                              @blur="e => commitCellEdit(task,'name',e.target.value)"
                              @keyup.enter="e => commitCellEdit(task,'name',e.target.value)"
                              @keyup.esc="cancelCellEdit" />
                            <span v-else class="lr-name-text">{{ task.name }}</span>
                          </span>
                          <span class="lr-person">
                            <img class="lr-av" :src="getPerson(task).avatar" :alt="getPerson(task).av" :style="{ background: getPerson(task).color }" />
                            {{ getPerson(task).name }}
                          </span>
                          <span class="lr-date" :class="{ overdue: isOverdue(task.dueDate) }">{{ fmtDate(task.dueDate) || '—' }}</span>
                          <span class="lr-status">
                            <span class="lr-status-dot" :style="{ background: statusById(task.statusId)?.color }"></span>
                            {{ statusById(task.statusId)?.label }}
                          </span>
                          <span class="lr-pri" :class="`lr-pri--${task.priority}`" @click.stop="cyclePriority(task)">
                            <TIcon name="flag-2" />{{ PRIORITY_LABEL[task.priority] }}
                          </span>
                        </div>
                        <!-- Công việc con rows -->
                        <template v-if="expandedSubIds.has(task.id)">
                          <div v-for="(sub, si) in task.subTaskList" :key="si"
                            class="list-row list-sub-row" :class="{ 'list-row--done': sub.done }">
                            <span class="lr-indent lr-indent--l3"></span>
                            <button class="task-check" :class="{ 'task-check--done': sub.done }" @click.stop="sub.done = !sub.done">
                              <TIcon v-if="sub.done" name="check" :stroke-width="2.5" />
                            </button>
                            <span class="lr-sub-spacer"></span>
                            <span class="lr-name"><span class="lr-name-text">{{ sub.name }}</span></span>
                            <span class="lr-person"></span>
                            <span class="lr-date"></span>
                            <span class="lr-status"></span>
                            <span class="lr-pri"></span>
                          </div>
                        </template>
                      </div>
                      <button class="list-add-row list-add-row--l2" @click.stop="openAddTask(proj.id)">
                        <TIcon name="plus" />Thêm công việc
                      </button>
                    </template>
                  </div>
                </template>
              </div>
            </template>

            <!-- ── MỘT DỰ ÁN hoặc gom nhóm theo người: nhóm phẳng ── -->
            <template v-else>
              <div v-for="grp in listGroups" :key="grp.id" class="list-group">
                <div class="list-group__hd" @click="toggleListGroup(grp.id)">
                  <TIcon :name="collapsedGroupIds.has(grp.id) ? 'chevron-right' : 'chevron-down'" class="lgrp-chevron" />
                  <span class="lgrp-dot" :style="{ background: grp.color }"></span>
                  <span class="lgrp-name">{{ grp.label }}</span>
                  <span class="lgrp-count">{{ grp.tasks.length }}</span>
                </div>
                <template v-if="!collapsedGroupIds.has(grp.id)">
                  <div v-for="task in grp.tasks" :key="task.id" class="list-row" :class="{ 'list-row--done': task.done, 'list-row--new': task.id === newTaskId }">
                    <span class="lr-indent"></span>
                    <button class="task-check" :class="{ 'task-check--done': task.done }" @click.stop="toggleDone(task, $event)" :title="task.done ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'">
                      <TIcon v-if="task.done" name="check" :stroke-width="2.5" />
                    </button>
                    <span class="lr-name" @click.stop="startCellEdit(task, 'name', $event)">
                      <input v-if="isCellEdit(task, 'name')" class="lr-cell-input"
                        :value="task.name"
                        @blur="e => commitCellEdit(task, 'name', e.target.value)"
                        @keyup.enter="e => commitCellEdit(task, 'name', e.target.value)"
                        @keyup.esc="cancelCellEdit" />
                      <span v-else class="lr-name-text">{{ task.name }}</span>
                    </span>
                    <span class="lr-person" @click.stop="openTask(task)">
                      <img class="lr-av"
                        :src="getPerson(task).avatar"
                        :alt="getPerson(task).av"
                        :style="{ background: getPerson(task).color }" />
                      {{ getPerson(task).name }}
                    </span>
                    <span class="lr-date" :class="{ overdue: isOverdue(task.dueDate) }" @click.stop="startCellEdit(task, 'dueDate', $event)">
                      <input v-if="isCellEdit(task, 'dueDate')" type="date" class="lr-cell-input lr-cell-date"
                        :value="task.dueDate"
                        @change="e => commitCellEdit(task, 'dueDate', e.target.value)"
                        @blur="cancelCellEdit"
                        @keyup.esc="cancelCellEdit" />
                      <template v-else>{{ fmtDate(task.dueDate) || '—' }}</template>
                    </span>
                    <span class="lr-status" @click.stop="startCellEdit(task, 'statusId', $event)">
                      <select v-if="isCellEdit(task, 'statusId')" class="lr-cell-sel"
                        :value="task.statusId"
                        @change="e => commitCellEdit(task, 'statusId', e.target.value)"
                        @blur="cancelCellEdit"
                        @keyup.esc="cancelCellEdit">
                        <option v-for="s in taskStatuses(task)" :key="s.id" :value="s.id">{{ s.label }}</option>
                      </select>
                      <template v-else>
                        <span class="lr-status-dot" :style="{ background: statusById(task.statusId)?.color }"></span>
                        {{ statusById(task.statusId)?.label }}
                      </template>
                    </span>
                    <span class="lr-pri" :class="`lr-pri--${task.priority}`" @click.stop="cyclePriority(task)">
                      <TIcon name="flag-2" />{{ PRIORITY_LABEL[task.priority] }}
                    </span>
                  </div>
                  <button class="list-add-row" @click.stop="openAddTask(grp.id)">
                    <TIcon name="plus" />Thêm công việc
                  </button>
                </template>
              </div>
            </template>
          </div>

          <!-- CALENDAR -->
          <div v-else-if="view === 'calendar'" class="cal-wrap">
            <div class="cal-nav">
              <button class="cal-nav-btn" @click="prevMonth"><TIcon name="chevron-left" /></button>
              <span class="cal-nav-title">{{ CAL_MONTHS[calMonth] }} {{ calYear }}</span>
              <button class="cal-nav-btn" @click="nextMonth"><TIcon name="chevron-right" /></button>
              <button class="cal-today-btn" @click="goToday">Hôm nay</button>
            </div>
            <div class="cal-grid">
              <div class="cal-dow" v-for="d in DOW" :key="d">{{ d }}</div>
              <div v-for="(day, i) in calDays" :key="i" class="cal-cell"
                :class="{ 'cal-cell--empty': !day, 'cal-cell--today': isToday(day) }">
                <span v-if="day" class="cal-day-num">{{ day }}</span>
                <div v-if="day" class="cal-tasks">
                  <div v-for="t in tasksOnDay(day)" :key="t.id" class="cal-chip"
                    :style="{ background: (statusById(t.statusId)?.color||'#6b7280')+'22', borderLeft:`3px solid ${statusById(t.statusId)?.color||'#6b7280'}` }"
                    @click.stop="openTask(t)">{{ t.name }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Các tab dự án chưa xây (Gantt/Tài liệu/Báo cáo/Biểu mẫu/Hoạt động) -->
          <div v-else class="vctt-soon">
            <TIcon name="tool" />
            <span>Đang xây dựng — {{ projectViewTabs.find(t => t.id === view)?.label }}</span>
          </div>

        </div><!-- /vctt-main -->

        <!-- ══ Right person filter panel ══ -->
        <div class="person-panel" :class="{ 'person-panel--collapsed': ppCollapsed }">
          <div class="pp-header">
            <span v-if="!ppCollapsed" class="pp-title">{{ personColLabel }}</span>
          </div>
          <div class="pp-list">
            <!-- All -->
            <button class="pp-item" :class="{ active: selectedPersonId === 'all' }"
              @click="selectedPersonId = 'all'"
              title="Tất cả">
              <span class="pp-av pp-av--all"><TIcon name="users" /></span>
              <span v-if="ppCollapsed" class="pp-initial">Tất cả</span>
              <span v-if="!ppCollapsed" class="pp-name">Tất cả</span>
              <span v-if="!ppCollapsed" class="pp-count">{{ currentTasks.length }}</span>
            </button>
            <!-- Unassigned -->
            <button class="pp-item" :class="{ active: selectedPersonId === 'unassigned' }"
              @click="selectedPersonId = 'unassigned'"
              title="Chưa giao">
              <span class="pp-av pp-av--unassigned"><TIcon name="user-off" /></span>
              <span v-if="ppCollapsed" class="pp-initial">Chưa</span>
              <span v-if="!ppCollapsed" class="pp-name">Chưa giao</span>
              <span v-if="!ppCollapsed" class="pp-count">{{ taskCountUnassigned }}</span>
            </button>
            <!-- Per person -->
            <button v-for="p in personFilterList" :key="p.id"
              class="pp-item" :class="{ active: selectedPersonId === p.id }"
              @click="selectedPersonId = p.id"
              :title="p.name">
              <img class="pp-av pp-av--photo" :src="p.avatar" :alt="p.av"
                :style="{ background: p.color }" />
              <span v-if="ppCollapsed" class="pp-initial">{{ p.name.split(' ').pop() }}</span>
              <span v-if="!ppCollapsed" class="pp-name">{{ p.name }}</span>
              <span v-if="!ppCollapsed" class="pp-count">{{ taskCountForPerson(p.id) }}</span>
            </button>
          </div>

          <!-- Collapse/Expand — absolute bottom-left, mirrors sidebar btn-collapse -->
          <button class="pp-collapse-btn" @click.stop="ppCollapsed = !ppCollapsed"
            :title="ppCollapsed ? 'Mở rộng' : 'Thu gọn'">
            <TIcon :name="ppCollapsed ? 'chevron-left' : 'chevron-right'" />
          </button>
        </div>

      </div><!-- /vctt-body -->

      <!-- Task Detail Drawer -->
      <transition name="drawer-slide">
        <div v-if="taskDrawer.open" class="td-wrap" :style="{ width: drawerWidth + 'px' }">

            <!-- Edge btn — left column, spans full height -->
            <button class="td-edge-btn" @click="closeDrawer" title="Đóng"><TIcon name="chevron-right" /></button>

            <!-- Content: topbar + body -->
            <div class="td-content">
              <div class="td-resize-handle" @mousedown.prevent="startResize" title="Kéo để thay đổi độ rộng"></div>

            <!-- ── Topbar — spans content width only ── -->
            <div class="td-topbar">
              <button class="td-status-btn" :style="{ '--s-color': statusById(taskDrawer.task?.statusId)?.color || '#64748b' }">
                {{ statusById(taskDrawer.task?.statusId)?.label || '—' }}
                <TIcon name="chevron-down" />
              </button>
              <div class="td-tb-gap"></div>
              <button class="td-tb-icon" title="Ghim"><TIcon name="pinned" /></button>
              <button class="td-tb-icon" title="Thẻ nhãn"><TIcon name="tag" /></button>
              <button class="td-tb-icon" title="Đính kèm"><TIcon name="paperclip" /></button>
              <button class="td-tb-icon" title="Kanban"><TIcon name="apps" /></button>
              <button class="td-tb-icon" title="Bình luận"><TIcon name="message-circle" /></button>
              <button class="td-tb-icon" title="Sao chép"><TIcon name="copy" /></button>
              <button class="td-tb-icon" title="Nhắc việc"><TIcon name="bell" /></button>
              <button class="td-tb-icon" title="Liên kết"><TIcon name="link" /></button>
              <button class="td-tb-icon td-tb-icon--active" title="Tin nhắn"><img src="https://amis.misa.vn/sites/menu/images/ic-chat.svg" class="td-tb-chat-ico" /></button>
              <span class="td-tb-sep"></span>
              <button class="td-tb-icon" title="Thêm"><TIcon name="dots" /></button>
              <button class="td-tb-icon td-tb-close" @click="closeDrawer" title="Đóng"><TIcon name="x" /></button>
            </div>

            <!-- ── Body: main + side ── -->
            <div class="td-body">

            <!-- ── Left main panel ── -->
            <div class="td-main">

              <!-- Meta: breadcrumb Phòng ban / Dự án -->
              <div class="td-meta" ref="bcWrapRef">
                <button class="td-bc-btn" @click.stop="openBcDd">
                  <template v-if="drawerDeptLabel">
                    <span class="td-bc-dept td-bc-dept--sel">{{ drawerDeptLabel }}</span>
                    <span class="td-bc-sep">/</span>
                    <span class="td-bc-proj td-bc-proj--sel">
                      <span class="td-bc-dot" :style="{ background: drawerProjectColor }"></span>
                      {{ drawerProjectLabel }}
                    </span>
                  </template>
                  <span v-else class="td-bc-dept td-bc-dept--sel">Không thuộc Dự án/Nhóm</span>
                  <TIcon name="chevron-down" class="td-bc-arrow" />
                </button>
                <Teleport to="body">
                  <div v-if="bcOpen" class="bc-dd" :style="bcStyle" @click.stop>
                    <div class="bc-dd-search">
                      <TIcon name="search" class="bc-dd-search-ico" />
                      <input class="bc-dd-search-inp" v-model="bcSearch"
                        placeholder="Tìm phòng ban, dự án..." ref="bcSearchRef" @click.stop />
                    </div>
                    <div class="bc-dd-list">
                      <!-- Không thuộc nhóm -->
                      <div class="proj-item proj-item--all"
                        :class="{ active: !taskDrawer.task?.projectId }"
                        @mousedown.prevent="selectBcProject({ id: null })">
                        <span style="flex:1">Không thuộc Dự án/Nhóm</span>
                        <TIcon v-if="!taskDrawer.task?.projectId" name="check" class="bc-dd-check" />
                      </div>
                      <div v-if="filteredBcGroups.length > 0" class="proj-dd__section-hd">Chọn dự án/nhóm</div>
                      <!-- Groups -->
                      <div v-for="grp in filteredBcGroups" :key="grp.id" class="proj-grp">
                        <div class="proj-grp__hd" @mousedown.prevent="grp.expanded = !grp.expanded">
                          <TIcon :name="grp.expanded ? 'chevron-down' : 'chevron-right'" class="proj-grp__arr" />
                          <span class="proj-grp__name">{{ grp.label }}</span>
                        </div>
                        <template v-if="grp.expanded !== false">
                          <div v-for="proj in grp.projects" :key="proj.id"
                            class="proj-item"
                            :class="{ active: taskDrawer.task?.projectId === proj.id }"
                            @mousedown.prevent="selectBcProject(proj)">
                            <span class="proj-item__dot" :style="{ background: proj.color }"></span>
                            <span style="flex:1">{{ proj.label }}</span>
                            <TIcon v-if="taskDrawer.task?.projectId === proj.id" name="check" class="bc-dd-check" />
                          </div>
                        </template>
                      </div>
                      <div v-if="filteredBcGroups.length === 0" class="proj-dd__empty">Không tìm thấy</div>
                    </div>
                  </div>
                </Teleport>
              </div>

              <!-- Title -->
              <div class="td-title-wrap">
                <textarea class="td-title" v-if="taskDrawer.task" v-model="taskDrawer.task.name"
                  ref="tdTitleRef" rows="1" placeholder="Tên công việc..."
                  @input="onTdTitleInput"></textarea>
              </div>

              <!-- Assigner -->
              <div class="td-assigner" v-if="taskDrawer.task?.assigner">
                <span class="td-assigner-lbl">Người giao việc:</span>
                <span class="td-assigner-name">{{ taskDrawer.task.assigner.name }}</span>
              </div>

              <!-- Fields: assignee + due date -->
              <div class="td-fields">
                <div class="td-field-box" ref="tdAssigneeWrapRef"
                  :class="{ 'td-field-box--filled': taskDrawer.task?.assignee?.name }"
                  @click.stop="openTdAssigneeDd">
                  <img v-if="taskDrawer.task?.assignee?.avatar"
                    :src="taskDrawer.task.assignee.avatar"
                    class="td-field-av"
                    :style="{ background: taskDrawer.task.assignee.color }"
                  />
                  <div v-else class="td-field-ico-wrap"><TIcon name="user" class="td-field-ico" /></div>
                  <div class="td-field-text">
                    <span v-if="taskDrawer.task?.assignee?.name" class="td-field-label">Người thực hiện</span>
                    <span class="td-field-val" :class="{ 'td-field-placeholder': !taskDrawer.task?.assignee?.name }">
                      {{ taskDrawer.task?.assignee?.name || 'Chọn người thực hiện' }}
                    </span>
                  </div>
                  <button class="td-field-hist" @click.stop title="Lịch sử thay đổi">
                    <TIcon name="clock-hour-4" />
                  </button>
                  <Teleport to="body">
                    <div v-if="showTdAssigneeDd" class="td-assignee-dd" :style="tdAssigneeDdStyle" @click.stop>
                      <div class="td-dd-search">
                        <TIcon name="search" class="td-dd-search-ico" />
                        <input class="td-dd-search-inp" v-model="tdAssigneeSearch"
                          placeholder="Tìm người thực hiện..." ref="tdAssigneeSearchRef" @click.stop />
                      </div>
                      <div class="td-dd-list">
                        <button v-for="p in tdFilteredPeople" :key="p.id"
                          class="td-dd-person"
                          :class="{ 'td-dd-person--sel': taskDrawer.task?.assignee?.id === p.id }"
                          @click="pickTdAssignee(p)">
                          <img :src="p.avatar" class="td-dd-av" :style="{ background: p.color }" />
                          <span class="td-dd-name">{{ p.name }}</span>
                          <TIcon v-if="taskDrawer.task?.assignee?.id === p.id" name="check" class="td-dd-check" />
                        </button>
                        <div v-if="tdFilteredPeople.length === 0" class="td-dd-empty">Không tìm thấy</div>
                      </div>
                    </div>
                  </Teleport>
                </div>

                <div class="td-field-box" ref="tdDateWrapRef"
                  :class="{ 'td-field-box--filled': taskDrawer.task?.dueDate }"
                  @click.stop="openTdDateDd">
                  <div class="td-field-ico-wrap"><TIcon name="calendar" class="td-field-ico" /></div>
                  <div class="td-field-text">
                    <span v-if="taskDrawer.task?.dueDate" class="td-field-label">Hạn hoàn thành</span>
                    <div class="td-field-val-row">
                      <span class="td-field-val"
                        :class="{ 'td-field-placeholder': !taskDrawer.task?.dueDate, 'td-field-val--overdue': tdDueIsOverdue }">
                        {{ taskDrawer.task?.dueDate ? fmtDate(taskDrawer.task.dueDate) : 'Chọn hạn hoàn thành' }}
                      </span>
                      <span v-if="tdDueRemaining" class="td-field-remaining">{{ tdDueRemaining }}</span>
                    </div>
                  </div>
                  <button class="td-field-hist" @click.stop title="Lịch sử cập nhật hạn hoàn thành">
                    <TIcon name="clock-hour-4" />
                  </button>
                  <Teleport to="body">
                    <div v-if="showTdDateDd" class="td-cal" :style="tdDateDdStyle" @click.stop>
                      <div class="td-cal-hd">
                        <button class="td-cal-nav" @click="tdCalPrev"><TIcon name="chevron-left" /></button>
                        <span class="td-cal-title">{{ tdCalMonthLabel }}</span>
                        <button class="td-cal-nav" @click="tdCalNext"><TIcon name="chevron-right" /></button>
                      </div>
                      <div class="td-cal-grid">
                        <span v-for="d in ['T2','T3','T4','T5','T6','T7','CN']" :key="d" class="td-cal-dow">{{ d }}</span>
                        <button v-for="cell in tdCalCells" :key="cell.key"
                          class="td-cal-day"
                          :class="{ 'td-cal-day--other': cell.other, 'td-cal-day--today': cell.today, 'td-cal-day--sel': cell.selected }"
                          @click="tdSelectDate(cell)">{{ cell.day }}</button>
                      </div>
                      <div v-if="taskDrawer.task?.dueDate" class="td-cal-ft">
                        <button class="td-cal-clear" @click="taskDrawer.task.dueDate = null; showTdDateDd = false">Xóa ngày</button>
                      </div>
                    </div>
                  </Teleport>
                </div>
              </div>

              <!-- Description — của công việc cha, đứng trên -->
              <div class="td-desc">
                <button class="td-desc-btn">
                  <TIcon name="align-left" class="td-desc-ico" />
                  <span>Nhập mô tả</span>
                </button>
              </div>

              <!-- Công việc con -->
              <div class="td-section" :class="{ 'td-section--empty': taskDrawer.subTasks.length === 0 }">
                <template v-if="taskDrawer.subTasks.length > 0">
                  <div class="td-sec-hd">
                    <span class="td-sec-title">Công việc con</span>
                    <button class="td-suggest-btn"><TIcon name="sparkles" /><span>Gợi ý công việc con</span></button>
                    <div class="td-sub-tools">
                      <button class="td-tb-icon" title="Thay đổi công việc cha"><TIcon name="transfer" /></button>
                      <button class="td-tb-icon" title="Chọn nhanh người thực hiện"><TIcon name="user" /></button>
                      <button class="td-tb-icon" title="Chọn nhanh hạn hoàn thành"><TIcon name="calendar" /></button>
                      <button class="td-tb-icon" title="Tạo phê duyệt hàng loạt"><TIcon name="clipboard-check" /></button>
                    </div>
                  </div>
                  <div v-for="(sub, i) in taskDrawer.subTasks" :key="i" class="td-sub-row">
                    <button class="td-sub-check" @click="sub.done = !sub.done">
                      <div class="td-sub-circle" :class="{ done: sub.done }">
                        <TIcon v-if="sub.done" name="check" :stroke-width="2.5" />
                      </div>
                    </button>
                    <input class="td-sub-name td-sub-name--input" :class="{ done: sub.done }"
                      v-model="sub.name" placeholder="Tên công việc con"
                      :ref="el => { if (el) subInputRefs[i] = el; else delete subInputRefs[i] }" />
                    <div class="td-sub-end">
                      <!-- Người thực hiện -->
                      <div class="td-sub-group td-sub-group--click" @click.stop="openSubDd($event, i, 'assignee')">
                        <template v-if="sub.assignee">
                          <img :src="sub.assignee.avatar" class="td-sub-av" :style="{ background: sub.assignee.color }" />
                        </template>
                        <div v-else class="td-empty-circle"><TIcon name="user" /></div>
                        <Teleport to="body">
                          <div v-if="subDd.subIdx === i && subDd.type === 'assignee'"
                            class="td-assignee-dd" :style="subDd.style" @click.stop>
                            <div class="td-dd-search">
                              <TIcon name="search" class="td-dd-search-ico" />
                              <input class="td-dd-search-inp" v-model="subDd.search"
                                placeholder="Tìm người thực hiện..." ref="subDdSearchRef" @click.stop />
                            </div>
                            <div class="td-dd-list">
                              <button v-for="p in subFilteredPeople" :key="p.id"
                                class="td-dd-person"
                                :class="{ 'td-dd-person--sel': sub.assignee?.id === p.id }"
                                @click.stop="pickSubAssignee(sub, p)">
                                <img :src="p.avatar" class="td-dd-av" :style="{ background: p.color }" />
                                <span class="td-dd-name">{{ p.name }}</span>
                                <TIcon v-if="sub.assignee?.id === p.id" name="check" class="td-dd-check" />
                              </button>
                              <div v-if="subFilteredPeople.length === 0" class="td-dd-empty">Không tìm thấy</div>
                            </div>
                          </div>
                        </Teleport>
                      </div>
                      <!-- Hạn hoàn thành -->
                      <div class="td-sub-group td-sub-group--click" @click.stop="openSubDateDd($event, i, sub)">
                        <template v-if="sub.dueDate">
                          <span class="td-sub-date">{{ fmtDate(sub.dueDate) }}</span>
                        </template>
                        <div v-else class="td-empty-circle"><TIcon name="calendar" /></div>
                        <Teleport to="body">
                          <div v-if="subDd.subIdx === i && subDd.type === 'date'"
                            class="td-cal" :style="subDd.style" @click.stop>
                            <div class="td-cal-hd">
                              <button class="td-cal-nav" @click="subCalPrev"><TIcon name="chevron-left" /></button>
                              <span class="td-cal-title">{{ subCalMonthLabel }}</span>
                              <button class="td-cal-nav" @click="subCalNext"><TIcon name="chevron-right" /></button>
                            </div>
                            <div class="td-cal-grid">
                              <span v-for="d in ['T2','T3','T4','T5','T6','T7','CN']" :key="d" class="td-cal-dow">{{ d }}</span>
                              <button v-for="cell in subCalCells" :key="cell.key"
                                class="td-cal-day"
                                :class="{ 'td-cal-day--other': cell.other, 'td-cal-day--today': cell.today, 'td-cal-day--sel': cell.selected }"
                                @click="subSelectDate(sub, cell)">{{ cell.day }}</button>
                            </div>
                            <div v-if="sub.dueDate" class="td-cal-ft">
                              <button class="td-cal-clear" @click.stop="sub.dueDate = null; subDd.subIdx = null">Xóa ngày</button>
                            </div>
                          </div>
                        </Teleport>
                      </div>
                      <!-- Chi tiết -->
                      <button class="td-tb-icon" title="Xem chi tiết công việc con"><TIcon name="arrow-right" /></button>
                    </div>
                  </div>
                  <button class="td-sec-btn" @click="addDrawerSubTask"><TIcon name="plus" /><span>Thêm công việc con</span></button>
                </template>
                <button v-else class="td-sec-btn" @click="addDrawerSubTask"><TIcon name="plus" /><span>Thêm công việc con</span></button>
              </div>

              <!-- Checklist -->
              <div class="td-section td-section--checklist" :class="{ 'td-section--empty': taskDrawer.clItems.length === 0 }">
                <template v-if="taskDrawer.clItems.length > 0">
                  <div class="td-sec-hd">
                    <span class="td-sec-title">Checklist</span>
                    <span class="td-cl-count">{{ taskDrawer.clItems.filter(i => i.done).length }}/{{ taskDrawer.clItems.length }}</span>
                    <button class="td-suggest-btn"><TIcon name="sparkles" /><span>Gợi ý checklist</span></button>
                  </div>
                  <div v-for="(item, ii) in taskDrawer.clItems" :key="ii" class="td-sub-row td-cl-row">
                    <button class="td-sub-check" @click="item.done = !item.done">
                      <div class="td-cl-circle" :class="{ done: item.done }">
                        <TIcon v-if="item.done" name="check" :stroke-width="2.5" />
                      </div>
                    </button>
                    <span class="td-cl-num">{{ ii + 1 }}.</span>
                    <input
                      class="td-cl-input" :class="{ done: item.done }"
                      v-model="item.text"
                      placeholder="Nhập mục..."
                      :ref="el => { if (el) clInputRefs[ii] = el; else delete clInputRefs[ii] }"
                      @keydown.enter.prevent="addClItemAfter(ii)"
                    />
                    <button class="td-cl-del" @click.stop="taskDrawer.clItems.splice(ii, 1)" title="Xóa mục">
                      <TIcon name="trash" />
                    </button>
                  </div>
                </template>
                <button class="td-sec-btn" @click="addClItem"><TIcon name="plus" /><span>Thêm checklist</span></button>
              </div>

              <!-- Thẻ công việc -->
              <div class="td-section" :class="{ 'td-section--empty': taskDrawer.tags.length === 0 }">
                <template v-if="taskDrawer.tags.length > 0">
                  <div class="td-sec-title">Thẻ công việc</div>
                  <div class="td-tags-row">
                    <span v-for="(tag, ti) in taskDrawer.tags" :key="ti"
                      class="td-tag" :style="{ background: tag.color+'22', color: tag.color, borderColor: tag.color+'55' }">
                      {{ tag.label }}
                    </span>
                    <button class="td-tag-add"><TIcon name="plus" /></button>
                  </div>
                </template>
                <button v-else class="td-sec-btn"><TIcon name="plus" /><span>Gán thẻ công việc</span></button>
              </div>

              <!-- Tệp đính kèm -->
              <div class="td-section">
                <div class="td-sec-hd">
                  <span class="td-sec-title">Tệp đính kèm</span>
                  <button class="td-sec-filter">Tất cả <TIcon name="chevron-down" /></button>
                </div>
                <div class="td-upload-zone">
                  <div class="td-upload-hint"><kbd>Ctrl + V</kbd> để dán ảnh hoặc tải ảnh lên</div>
                  <div class="td-upload-drop"><TIcon name="upload" /><span>Thả tệp hoặc tải lên tại đây</span></div>
                </div>
              </div>

              <!-- ── Tabs: Bình luận / Hoạt động ── -->
              <div class="td-tabs">
                <div class="td-tabs-bar">
                  <button class="td-tab-btn" :class="{ active: taskDrawer.activeTab === 'comment' }" @click="taskDrawer.activeTab = 'comment'">
                    <TIcon name="message-circle" />
                    <span>Bình luận</span>
                    <span v-if="taskDrawer.comments.length" class="td-tab-count">{{ taskDrawer.comments.length }}</span>
                  </button>
                  <button class="td-tab-btn" :class="{ active: taskDrawer.activeTab === 'log' }" @click="taskDrawer.activeTab = 'log'">
                    <TIcon name="clock" />
                    <span>Hoạt động</span>
                  </button>
                </div>

                <!-- Tab: Bình luận -->
                <div v-if="taskDrawer.activeTab === 'comment'" class="td-tab-pane">
                  <div v-if="taskDrawer.comments.length === 0" class="td-empty-hint">Chưa có bình luận nào</div>
                  <div v-for="c in taskDrawer.comments" :key="c.id" class="td-cmt-row">
                    <img v-if="c.user.avatar" :src="c.user.avatar" class="td-cmt-av" />
                    <span v-else class="td-cmt-av-fb" :style="{ background: c.user.color }">{{ c.user.av }}</span>
                    <div class="td-cmt-body">
                      <div class="td-cmt-meta">
                        <strong>{{ c.user.name }}</strong>
                        <span class="td-cmt-time">{{ c.time }}</span>
                      </div>
                      <div class="td-cmt-text">{{ c.text }}</div>
                    </div>
                  </div>
                  <div class="td-cmt-input-wrap">
                    <img v-if="ME.avatar" :src="ME.avatar" class="td-cmt-av" />
                    <span v-else class="td-cmt-av-fb" :style="{ background: ME.color }">{{ ME.av }}</span>
                    <div class="td-cmt-input-box">
                      <input class="td-cmt-input" v-model="taskDrawer.newComment" placeholder="Thêm bình luận..." @keyup.enter="submitComment" />
                      <button v-if="taskDrawer.newComment.trim()" class="td-cmt-send" @click="submitComment"><TIcon name="send" /></button>
                    </div>
                  </div>
                </div>

                <!-- Tab: Hoạt động -->
                <div v-if="taskDrawer.activeTab === 'log'" class="td-tab-pane">
                  <div v-for="(entry, i) in taskDrawer.actLog" :key="i" class="td-log-row">
                    <img v-if="entry.user?.avatar" :src="entry.user.avatar" class="td-log-av" />
                    <span v-else class="td-log-av-fb" :style="{ background: entry.user?.color }">{{ entry.user?.av }}</span>
                    <div class="td-log-body">
                      <span class="td-log-name">{{ entry.user?.name }}</span>
                      <span class="td-log-action">{{ entry.action }}</span>
                      <span class="td-log-time">{{ entry.time }}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div><!-- /td-main -->

            <!-- ── Right sidebar ── -->
            <div class="td-side">

              <!-- Action list -->
              <div class="td-side-list">
                <button class="td-side-item"><TIcon name="circle-check" /><span>Phê duyệt</span></button>
                <button class="td-side-item"><TIcon name="refresh" /><span>Lặp lại</span></button>
                <button class="td-side-item"><TIcon name="bell" /><span>Nhắc việc</span></button>
                <button class="td-side-item"><TIcon name="users" /><span>Người liên quan</span></button>
                <button class="td-addon-btn"><TIcon name="settings" /><span>Thêm tiện ích khác</span></button>
              </div>
              <div class="td-side-sep"></div>

              <!-- Activity -->
              <div class="td-activity">
                <div class="td-act-hd" @click="taskDrawer.actOpen = !taskDrawer.actOpen">
                  <TIcon name="chart-line" />
                  <span>Tóm tắt hoạt động</span>
                  <TIcon :name="taskDrawer.actOpen ? 'chevron-up' : 'chevron-down'" />
                </div>
                <div v-if="taskDrawer.actOpen" class="td-act-body">
                  <div v-for="grp in actGroups" :key="grp.key" class="td-act-group">
                    <div class="td-act-group-hd">
                      <span>{{ grp.label }}</span>
                    </div>
                    <template v-for="(row, i) in grp.rows" :key="i">
                      <div v-if="i < 2 || taskDrawer.actGroupExpanded[grp.key]" class="td-act-row">
                        <span class="td-act-lbl">{{ row.label }}</span>
                        <div class="td-act-val">
                          <strong v-if="row.user">{{ row.user.name }}</strong>
                          <span class="td-act-date">{{ row.date }}</span>
                        </div>
                      </div>
                    </template>
                    <button v-if="grp.rows.length > 2" class="td-act-more-btn"
                      @click="taskDrawer.actGroupExpanded[grp.key] = !taskDrawer.actGroupExpanded[grp.key]">
                      {{ taskDrawer.actGroupExpanded[grp.key] ? 'Thu gọn' : 'Xem thêm' }}
                    </button>
                  </div>
                </div>
              </div>

              <button class="td-side-collapse-btn" title="Thu gọn"><TIcon name="chevron-down" /></button>

            </div><!-- /td-side -->

            </div><!-- /td-body -->

            </div><!-- /td-content -->

        </div><!-- /td-wrap -->
      </transition>


    </div>
  </AppShell>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '../components/AppShell.vue'
import TIcon    from '@mds/components/TIcon.vue'
import { departments } from '../store/departments.js'

const route  = useRoute()
const router = useRouter()

const PALETTE = ['#6b7280','#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899','#14b8a6','#f97316','#eab308','#06b6d4','#84cc16']
const PRIORITY_LABEL = { none: '—', low: 'Thấp', medium: 'Trung bình', high: 'Cao' }
const PRIORITY_OPTS  = [{ id:'high',label:'Cao' },{ id:'medium',label:'Trung bình' },{ id:'low',label:'Thấp' },{ id:'none',label:'Không' }]
const DUE_OPTS       = [{ id:'all',label:'Tất cả' },{ id:'overdue',label:'Quá hạn' },{ id:'today',label:'Hôm nay' },{ id:'week',label:'Tuần này' }]
const DOW = ['CN','T2','T3','T4','T5','T6','T7']
const CAL_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']

/* ── UI ── */
const tab             = ref('nhan')
const view            = ref('kanban')
const projectViewTabs = [
  { id: 'kanban',   label: 'Bảng' },
  { id: 'list',     label: 'Danh sách' },
  { id: 'gantt',    label: 'Gantt' },
  { id: 'calendar', label: 'Lịch' },
  { id: 'docs',     label: 'Tài liệu & Liên kết' },
  { id: 'reports',  label: 'Báo cáo' },
  { id: 'forms',    label: 'Biểu mẫu' },
  { id: 'activity', label: 'Hoạt động' },
]
const newTaskId       = ref(null)
const groupBy         = ref('lifecycle')
const showGroupBy     = ref(false)
const showFilter      = ref(false)
const filterName      = ref('')
const filterPris      = ref([])
const filterDue       = ref('all')
const filterStatusId  = ref('all')
const showStatusDd    = ref(false)
const sortBy          = ref('none')
const showSortDd      = ref(false)
const showDisplayDd   = ref(false)
const SORT_OPTS = [
  { id: 'none',     label: 'Không sắp xếp' },
  { id: 'priority', label: 'Độ ưu tiên' },
  { id: 'due',      label: 'Hạn chót' },
]
const projOpen        = ref(false)
const projSearch      = ref('')
const selectedPersonId = ref('all')
const colorPickTarget  = ref(null)
const ppCollapsed      = ref(false)

const colMenuId    = ref(null)
const colEditId    = ref(null)
const colEditLabel = ref('')

/* ── List cell inline edit ── */
const editCell = reactive({ taskId: null, field: null })
function startCellEdit(task, field, e) {
  editCell.taskId = task.id
  editCell.field = field
  nextTick(() => {
    const el = document.querySelector('.lr-cell-input, .lr-cell-sel')
    if (el) { el.focus(); if (field === 'dueDate') el.showPicker?.() }
  })
}
function isCellEdit(task, field) { return editCell.taskId === task.id && editCell.field === field }
function commitCellEdit(task, field, value) {
  if (value !== undefined) {
    task[field] = value
    if (field === 'statusId') task.done = DONE_STATUS_IDS.has(value)
  }
  editCell.taskId = null
  editCell.field = null
}
function cancelCellEdit() { editCell.taskId = null; editCell.field = null }
function taskStatuses(task) { return projectStatuses[task.projectId] || [] }
const PRI_ORDER = ['high', 'medium', 'low', 'none']
function cyclePriority(task) {
  const i = PRI_ORDER.indexOf(task.priority)
  task.priority = PRI_ORDER[(i + 1) % PRI_ORDER.length]
}

/* ── Kanban drag & drop ── */
const dragTaskId       = ref(null)
const dragStarted      = ref(false)   // delayed 1 frame để browser capture drag image trước
const dragOverColId    = ref(null)
const dropBeforeTaskId = ref(null)

function onCardDragStart(e, task) {
  dragTaskId.value = task.id
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(task.id))
  // Delay: cho browser render drag ghost trước rồi mới ẩn/mờ card gốc
  setTimeout(() => { dragStarted.value = true }, 0)
}
function onCardDragEnd() {
  dragTaskId.value = null
  dragStarted.value = false
  dragOverColId.value = null
  dropBeforeTaskId.value = null
}
function onColDragOver(e, colId) {
  // Khi vào cột mới: reset về cuối cột trước, rồi update nếu đang hover card
  if (dragOverColId.value !== colId) {
    dragOverColId.value = colId
    dropBeforeTaskId.value = null
  }
  const cardEl = e.target.closest?.('.kcard:not(.kcard--dragging)')
  if (cardEl) {
    dropBeforeTaskId.value = Number(cardEl.dataset.taskId)
  }
  // Không reset khi target là ghost hoặc vùng trống — tránh jitter
}
function onColDragLeave(e, colId) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    if (dragOverColId.value === colId) {
      dragOverColId.value = null
      dropBeforeTaskId.value = null
    }
  }
}
function onColDrop(targetColId) {
  if (!dragTaskId.value) return
  const tasks = currentTasks.value
  const fromIdx = tasks.findIndex(t => t.id === dragTaskId.value)
  if (fromIdx === -1) return
  const [task] = tasks.splice(fromIdx, 1)
  if (currentProject.value.id === 'all') {
    const [statusType, projId] = targetColId.split(':')
    const projStats = projectStatuses[projId] || []
    const matching = projStats.find(s => s.statusType === statusType)
    if (matching) task.statusId = matching.id
    if (projId && projId !== 'unknown') task.projectId = projId
  } else {
    task.statusId = targetColId
  }
  if (dropBeforeTaskId.value !== null) {
    const toIdx = tasks.findIndex(t => t.id === dropBeforeTaskId.value)
    tasks.splice(toIdx !== -1 ? toIdx : tasks.length, 0, task)
  } else {
    tasks.push(task)
  }
  dragTaskId.value = null
  dragOverColId.value = null
  dropBeforeTaskId.value = null
}

function closeDropdowns() {
  projOpen.value = false; showGroupBy.value = false; colMenuId.value = null
  showStatusDd.value = false; showSortDd.value = false; showDisplayDd.value = false
  colorPickTarget.value = null
}

function applyPostAdd() {
  const raw = localStorage.getItem('cv-post-add')
  if (!raw) return
  try {
    const { tab: t, project: pid, task: taskData } = JSON.parse(raw)
    if (t) tab.value = t
    if (pid) {
      // intentionally not changing project filter — always stays "Tất cả"
    }
    if (taskData?.name) {
      const projectId   = pid || 'cv-ca-nhan'
      const firstStatus = projectStatuses[projectId]?.[0]?.id || 'cv-s0'
      const newTask = mk(
        taskData.name,
        firstStatus,
        taskData.assigneeId || 'u0',
        'u0',
        taskData.deadline || null,
        'medium',
        0, 0, 0,
        projectId
      )
      tasksGiao.unshift(newTask)
      newTaskId.value = newTask.id
      setTimeout(() => { newTaskId.value = null }, 4200)
    }
  } catch {}
  localStorage.removeItem('cv-post-add')
}

function onDocClick() { bcOpen.value = false; showTdAssigneeDd.value = false; showTdDateDd.value = false; subDd.subIdx = null; subDd.type = null }
onMounted(() => {
  applyPostAdd()
  window.addEventListener('cv-post-add', applyPostAdd)
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  window.removeEventListener('cv-post-add', applyPostAdd)
  document.removeEventListener('click', onDocClick)
})

/* ── List column resize ── */
const colWidths    = reactive({ person: 160, date: 130, status: 150, priority: 100 })
const resizingCol  = ref(null)
let   _rz          = null

function onColResizeStart(e, col) {
  resizingCol.value = col
  _rz = { col, startX: e.clientX, startW: colWidths[col] }
  document.addEventListener('mousemove', onColResizeMove)
  document.addEventListener('mouseup',   onColResizeEnd)
}
function onColResizeMove(e) {
  if (!_rz) return
  const mins = { person: 80, date: 70, status: 80, priority: 60 }
  colWidths[_rz.col] = Math.max(mins[_rz.col], _rz.startW + (e.clientX - _rz.startX))
}
function onColResizeEnd() {
  resizingCol.value = null
  _rz = null
  document.removeEventListener('mousemove', onColResizeMove)
  document.removeEventListener('mouseup',   onColResizeEnd)
}

function toggleColMenu(colId) {
  colMenuId.value = colMenuId.value === colId ? null : colId
  colorPickTarget.value = null
}

function startRename(col) {
  colEditId.value = col.id
  colEditLabel.value = col.label
  colMenuId.value = null
  nextTick(() => { document.querySelector('.kcol-rename-input')?.focus() })
}
function saveRename(col) {
  const s = statusById(col.id)
  if (s && colEditLabel.value.trim()) s.label = colEditLabel.value.trim()
  colEditId.value = null
}
function deleteStatusByColId(colId) {
  const pid = currentProject.value.id
  if (pid === 'all') return
  const arr = projectStatuses[pid]
  if (!arr) return
  const idx = arr.findIndex(s => s.id === colId)
  if (idx >= 0) arr.splice(idx, 1)
  colMenuId.value = null
}
function addStatusColumn() {
  const pid = currentProject.value.id
  if (pid === 'all') return
  if (!projectStatuses[pid]) projectStatuses[pid] = []
  const list = projectStatuses[pid]
  const newStatus = {
    id: `${pid}-s${Date.now()}`,
    label: 'Nhóm mới',
    color: PALETTE[list.length % PALETTE.length],
    statusType: 'doing',
    lifecycleId: 'lc-doing',
  }
  list.push(newStatus)
  startRename(newStatus)
}
function pickColor(status, color) {
  if (!status) return
  status.color = color
  colorPickTarget.value = null
  colMenuId.value = null
}
const groupByOptions = computed(() => {
  const base = [{ id: 'lifecycle', label: 'Trạng thái' }]
  if (tab.value === 'nhan')  return [...base, { id: 'assigner', label: 'Người giao việc' }]
  if (tab.value === 'giao')  return [...base, { id: 'assignee', label: 'Người thực hiện' }]
  return [...base, { id: 'assigner', label: 'Người giao việc' }, { id: 'assignee', label: 'Người thực hiện' }]
})
function onTabChange(t) {
  tab.value = t
  selectedPersonId.value = 'all'
  currentProject.value = { id: 'all', label: 'Tất cả' }
  const ids = groupByOptions.value.map(o => o.id)
  if (!ids.includes(groupBy.value)) groupBy.value = 'lifecycle'
}

/* ── Project groups — dùng chung với sidebar ── */
const filteredProjGroups = computed(() => {
  const q = projSearch.value.trim().toLowerCase()
  if (!q) return departments
  return departments
    .map(g => ({ ...g, projects: g.projects.filter(p => p.label.toLowerCase().includes(q)) }))
    .filter(g => g.label.toLowerCase().includes(q) || g.projects.length > 0)
    .map(g => ({ ...g, _open: true }))
})

const projectMap = computed(() => {
  const m = new Map()
  departments.forEach(g => g.projects.forEach(p => m.set(p.id, p)))
  return m
})

// Thứ tự canonical của projects theo departments (giống sidebar)
const projectOrder = computed(() => {
  const order = new Map()
  let i = 0
  departments.forEach(g => g.projects.forEach(p => order.set(p.id, i++)))
  return order
})

const currentProject = ref({ id: 'all', label: 'Tất cả' })

/* Vào từ sidebar (route /du-an/:id) hoặc trực tiếp /viec-cua-toi → set/khôi phục bộ lọc dự án */
function syncProjectFromRoute() {
  const pid = route.params.id
  if (!pid) { currentProject.value = { id: 'all', label: 'Tất cả' }; return }
  for (const g of departments) {
    const p = g.projects.find(pp => pp.id === pid)
    if (p) {
      currentProject.value = { id: p.id, label: p.label }
      // Vào 1 dự án cụ thể → dùng bảng trạng thái riêng của dự án (có thể thêm/sửa/xoá cột),
      // không dùng nhóm "vòng đời" dùng chung (cố định, không quản lý được).
      groupBy.value = 'status'
      return
    }
  }
  currentProject.value = { id: 'all', label: 'Tất cả' }
}
syncProjectFromRoute()
watch(() => route.params.id, syncProjectFromRoute)

/* Rời chế độ dự án (về "Tất cả") mà đang xem tab riêng của dự án (Gantt/Tài liệu/...) → về lại Bảng */
const PROJECT_ONLY_VIEWS = ['gantt', 'docs', 'reports', 'forms', 'activity']
watch(() => currentProject.value.id, id => {
  if (id === 'all' && PROJECT_ONLY_VIEWS.includes(view.value)) view.value = 'kanban'
})

/* ── Nhóm công việc — per-project ── */
let _sid = 10
const UNIVERSAL_COLS = [
  { id: 'todo',  label: 'Chưa làm',   color: '#64748b', statusType: 'todo'  },
  { id: 'doing', label: 'Đang làm',   color: '#3b82f6', statusType: 'doing' },
  { id: 'done',  label: 'Hoàn thành', color: '#10b981', statusType: 'done'  },
]

const LIFECYCLE_STATUSES = [
  { id: 'lc-todo',     label: 'Chưa thực hiện', color: '#64748b' },
  { id: 'lc-doing',    label: 'Đang thực hiện',  color: '#3b82f6' },
  { id: 'lc-pending',  label: 'Chờ phê duyệt',   color: '#f59e0b' },
  { id: 'lc-approved', label: 'Đã phê duyệt',    color: '#8b5cf6' },
  { id: 'lc-done',     label: 'Hoàn thành',       color: '#10b981' },
]

const projectStatuses = reactive({
  'cv-ca-nhan': [
    { id:'cv-s0', label:'Chưa thực hiện', color:'#64748b', statusType:'todo',  lifecycleId:'lc-todo'    },
    { id:'cv-s1', label:'Đang thực hiện', color:'#3b82f6', statusType:'doing', lifecycleId:'lc-doing'   },
    { id:'cv-s3', label:'Chờ duyệt',      color:'#f59e0b', statusType:'doing', lifecycleId:'lc-pending' },
    { id:'cv-s2', label:'Đã hoàn thành',  color:'#10b981', statusType:'done',  lifecycleId:'lc-done'    },
  ],
  'proj-qt-1': [
    { id:'qt1-s0', label:'Mới',        color:'#64748b', statusType:'todo',  lifecycleId:'lc-todo'    },
    { id:'qt1-s1', label:'Đang xử lý', color:'#3b82f6', statusType:'doing', lifecycleId:'lc-doing'   },
    { id:'qt1-s2', label:'Chờ duyệt',  color:'#f59e0b', statusType:'doing', lifecycleId:'lc-pending' },
    { id:'qt1-s3', label:'Hoàn thành', color:'#10b981', statusType:'done',  lifecycleId:'lc-done'    },
  ],
  'proj-qt-2': [
    { id:'qt2-s0', label:'Chờ xử lý',     color:'#64748b', statusType:'todo',  lifecycleId:'lc-todo'  },
    { id:'qt2-s1', label:'Đang tiến hành', color:'#3b82f6', statusType:'doing', lifecycleId:'lc-doing' },
    { id:'qt2-s2', label:'Hoàn thành',     color:'#10b981', statusType:'done',  lifecycleId:'lc-done'  },
  ],
  'proj-mt-1': [
    { id:'mt1-s0', label:'Chưa bắt đầu',  color:'#64748b', statusType:'todo',  lifecycleId:'lc-todo'  },
    { id:'mt1-s1', label:'Đang thực hiện', color:'#3b82f6', statusType:'doing', lifecycleId:'lc-doing' },
    { id:'mt1-s2', label:'Đạt mục tiêu',   color:'#10b981', statusType:'done',  lifecycleId:'lc-done'  },
  ],
  'proj-mt-2': [
    { id:'mt2-s0', label:'Kế hoạch',       color:'#64748b', statusType:'todo',  lifecycleId:'lc-todo'  },
    { id:'mt2-s1', label:'Thực hiện',      color:'#3b82f6', statusType:'doing', lifecycleId:'lc-doing' },
    { id:'mt2-s2', label:'Hoàn thành KPI', color:'#10b981', statusType:'done',  lifecycleId:'lc-done'  },
  ],
})

// Nhóm của dự án đang chọn
const statuses = computed(() =>
  currentProject.value.id === 'all' ? [] : (projectStatuses[currentProject.value.id] || [])
)
// Tất cả nhóm mọi dự án — cho statusById lookup
const allStatuses = computed(() => Object.values(projectStatuses).flat())
// Nhóm hiển thị trong modal — theo dự án đang chọn trong form
function statusById(id)  { return allStatuses.value.find(s => s.id === id) }
function getLifecycleId(task) {
  const s = statusById(task.statusId)
  if (s?.lifecycleId) return s.lifecycleId
  if (s?.statusType === 'done')  return 'lc-done'
  if (s?.statusType === 'doing') return 'lc-doing'
  return 'lc-todo'
}
function addStatus() {
  const pid = currentProject.value.id
  if (pid === 'all') return
  if (!projectStatuses[pid]) projectStatuses[pid] = []
  projectStatuses[pid].push({ id:`${pid}-s${_sid++}`, label:'Nhóm mới', color:'#6b7280', statusType:'todo' })
}
function deleteStatus(i) {
  const pid = currentProject.value.id
  if (pid !== 'all') projectStatuses[pid]?.splice(i, 1)
}
function openColorPick(s){ colorPickTarget.value = colorPickTarget.value?.id === s.id ? null : s }

/* ── People ── */
const ME = { id: 'u0', name: 'Đoàn Văn Việt',       av: 'ĐV', color: '#3b82f6', avatar: 'https://i.pravatar.cc/40?img=3'  }
const PEOPLE = [
  ME,
  { id: 'u1', name: 'Nguyễn Thị Lan Anh', av: 'LA', color: '#8b5cf6', avatar: 'https://i.pravatar.cc/40?img=10' },
  { id: 'u2', name: 'Trần Văn Minh',      av: 'TM', color: '#ec4899', avatar: 'https://i.pravatar.cc/40?img=33' },
  { id: 'u3', name: 'Lê Thị Thu Hà',      av: 'TH', color: '#10b981', avatar: 'https://i.pravatar.cc/40?img=21' },
  { id: 'u4', name: 'Phạm Văn Đức',       av: 'PĐ', color: '#f97316', avatar: 'https://i.pravatar.cc/40?img=15' },
]

/* ── Tasks ── */
let _tid = 100
const DONE_STATUS_IDS = new Set(['cv-s2','qt1-s3','qt2-s2','mt1-s2','mt2-s2'])
function mk(name, sid, aid, rid, due, pri='medium', st=0, sd=0, cmt=0, pid='cv-ca-nhan') {
  const id = _tid++
  let startDate = null
  if (due) {
    const d = new Date(due + 'T00:00:00')
    const offsetDays = pri === 'high' ? 14 : pri === 'medium' ? 7 : 3
    const offsetHours = id % 23
    const offsetMins  = (id * 13) % 60
    d.setDate(d.getDate() - offsetDays)
    startDate = d.toISOString().slice(0, 10) + 'T' + String(offsetHours).padStart(2,'0') + ':' + String(offsetMins).padStart(2,'0') + ':00'
  }
  return { id, name, statusId:sid, assignee:PEOPLE.find(p=>p.id===aid)||ME, assigner:PEOPLE.find(p=>p.id===rid)||ME, dueDate:due, startDate, priority:pri, subTasks:st, subTasksDone:sd, comments:cmt, done:DONE_STATUS_IDS.has(sid), projectId:pid }
}
function toggleDone(task, e) { e.stopPropagation(); task.done = !task.done }
const tasksNhan = reactive([
  // cv-ca-nhan — Chưa thực hiện
  mk('Thiết kế màn hình dashboard mới cho module quản lý nhân sự và báo cáo tổng hợp Q3 2026', 'cv-s0','u0','u1','2026-07-10','high',  0,0,0,'cv-ca-nhan'),
  mk('Viết tài liệu API v2',                 'cv-s0','u0','u2','2026-07-14','medium',0,0,2,'cv-ca-nhan'),
  mk('Nghiên cứu giải pháp cache Redis',     'cv-s0','u0','u3','2026-07-18','medium',0,0,0,'cv-ca-nhan'),
  mk('Phân tích yêu cầu module thông báo',   'cv-s0','u0','u4','2026-07-22','low',   0,0,1,'cv-ca-nhan'),
  mk('Lên kế hoạch migration database',      'cv-s0','u0','u1','2026-06-28','high',  0,0,0,'cv-ca-nhan'), // quá hạn
  // cv-ca-nhan — Đang thực hiện
  mk('Triển khai module thanh toán',         'cv-s1','u0','u1','2026-07-05','high',  3,1,5,'cv-ca-nhan'),
  mk('Refactor module xác thực người dùng',  'cv-s1','u0','u2','2026-07-08','medium',4,2,3,'cv-ca-nhan'),
  mk('Viết test cho API đặt lịch',           'cv-s1','u0','u4','2026-07-11','low',   2,0,1,'cv-ca-nhan'),
  mk('Tích hợp OAuth2 với Google',           'cv-s1','u0','u3','2026-07-15','high',  1,0,3,'cv-ca-nhan'),
  mk('Xây dựng hệ thống gợi ý nội dung',    'cv-s1','u0','u2','2026-06-29','medium',5,3,2,'cv-ca-nhan'), // quá hạn
  mk('Cải thiện accessibility trang chủ',    'cv-s1','u0','u1','2026-07-03','low',   2,1,0,'cv-ca-nhan'), // quá hạn
  // cv-ca-nhan — Chờ duyệt
  mk('Tối ưu tốc độ tải trang chủ',         'cv-s3','u0','u2','2026-07-07','high',  1,1,4,'cv-ca-nhan'),
  mk('Cập nhật giao diện mobile app',        'cv-s3','u0','u1','2026-07-12','medium',3,3,2,'cv-ca-nhan'),
  mk('Thiết kế lại luồng đăng ký tài khoản','cv-s3','u0','u3','2026-07-09','high',  0,0,5,'cv-ca-nhan'),
  mk('Tích hợp chat hỗ trợ khách hàng',     'cv-s3','u0','u4','2026-06-27','medium',2,2,1,'cv-ca-nhan'), // quá hạn
  // cv-ca-nhan — Đã hoàn thành
  mk('Xử lý lỗi timeout thanh toán',        'cv-s2','u0','u3','2026-06-20','high',  0,0,6,'cv-ca-nhan'),
  mk('Triển khai CI/CD pipeline',            'cv-s2','u0','u4','2026-06-15','medium',5,5,3,'cv-ca-nhan'),
  mk('Cấu hình SSL/TLS cho production',      'cv-s2','u0','u1','2026-06-10','high',  0,0,2,'cv-ca-nhan'),
  mk('Viết script backup database tự động', 'cv-s2','u0','u2','2026-06-05','medium',0,0,1,'cv-ca-nhan'),
  // các project khác
  mk('Kiểm tra hiệu năng database',          'qt1-s2','u0','u1','2026-07-10','high',  2,2,3,'proj-qt-1'),
  mk('Sửa bug màn hình đăng nhập',           'qt1-s3','u0','u3','2026-06-25','low',   0,0,1,'proj-qt-1'),
  mk('Review code PR #42',                   'mt1-s0','u0','u2','2026-07-15','medium',0,0,0,'proj-mt-1'),
  mk('Thiết kế lại trang tổng quan',         'mt1-s1','u0','u4','2026-07-08','high',  5,2,4,'proj-mt-1'),
  mk('Cập nhật dependencies',                'mt2-s0','u0','u1','2026-07-20','low',   0,0,0,'proj-mt-2'),
  mk('Họp báo cáo tiến độ Q3',              'qt2-s2','u0','u3','2026-06-22','medium',0,0,2,'proj-qt-2'),
])
const tasksGiao = reactive([
  mk('Xây dựng module quản lý nhân sự',      'qt1-s1','u1','u0','2026-07-12','high',  4,1,6,'proj-qt-1'),
  mk('Design màn hình báo cáo',              'cv-s0', 'u2','u0','2026-07-18','medium',0,0,1,'cv-ca-nhan'),
  mk('Cập nhật form nhập liệu khách hàng',   'cv-s1', 'u3','u0','2026-07-07','medium',2,1,0,'cv-ca-nhan'),
  mk('Review thiết kế landing page',         'cv-s3', 'u4','u0','2026-07-09','low',   0,0,2,'cv-ca-nhan'),
  mk('Tích hợp Google Analytics',            'cv-s2', 'u1','u0','2026-06-18','low',   0,0,1,'cv-ca-nhan'),
  mk('Viết hướng dẫn sử dụng module mới',    'cv-s0', 'u2','u0','2026-07-25','medium',0,0,0,'cv-ca-nhan'),
  mk('Kiểm tra cross-browser compatibility', 'cv-s1', 'u3','u0','2026-07-06','medium',3,1,2,'cv-ca-nhan'), // quá hạn
  mk('Phân tích log lỗi production',         'cv-s1', 'u4','u0','2026-07-14','high',  0,0,4,'cv-ca-nhan'),
  mk('Cập nhật thư viện phụ thuộc',          'cv-s3', 'u1','u0','2026-07-11','low',   1,1,0,'cv-ca-nhan'),
  mk('Cấu hình monitoring server',           'cv-s2', 'u2','u0','2026-06-12','medium',0,0,3,'cv-ca-nhan'),
  mk('Fix bug trên mobile Safari',           'qt1-s2','u3','u0','2026-07-05','high',  0,0,3,'proj-qt-1'), // quá hạn
  mk('Viết unit test cho service layer',     'qt2-s1','u4','u0','2026-07-20','medium',6,3,2,'proj-qt-2'),
  mk('Tối ưu query báo cáo tổng hợp',       'mt1-s0','u1','u0','2026-07-25','low',   0,0,0,'proj-mt-1'),
  mk('Chuẩn bị demo cho khách hàng',        'mt1-s2','u2','u0','2026-06-20','high',  2,2,4,'proj-mt-1'),
  mk('Phân tích yêu cầu module lương',      'mt2-s0','u3','u0','2026-07-30','medium',0,0,0,'proj-mt-2'),
  mk('Tích hợp thanh toán VNPay',           'qt2-s1','u4','u0','2026-07-16','high',  3,1,2,'proj-qt-2'),
  mk('Lên roadmap sản phẩm Q4',             'qt1-s0','u1','u0','2026-08-01','high',  0,0,0,'proj-qt-1'),
  mk('Nghiên cứu công nghệ microservices',  'mt2-s1','u2','u0','2026-07-23','medium',0,0,1,'proj-mt-2'),
  mk('Triển khai module thông báo đẩy',     'qt2-s0','u3','u0','2026-08-05','medium',4,0,0,'proj-qt-2'),
])
const tasksLienQuan = reactive([
  mk('Họp kick-off dự án ERP mới',           'qt1-s1','u1','u2','2026-07-16','high',  2,0,4,'proj-qt-1'),
  mk('Review thiết kế UX module báo cáo',    'mt1-s0','u2','u3','2026-07-22','medium',0,0,3,'proj-mt-1'),
  mk('Lên kế hoạch sprint Q3',              'qt2-s1','u3','u1','2026-07-11','high',  5,3,6,'proj-qt-2'),
  mk('Cập nhật tài liệu kỹ thuật v3',       'mt2-s1','u4','u2','2026-07-19','medium',0,0,1,'proj-mt-2'),
  mk('Kiểm thử tích hợp hệ thống',          'qt1-s0','u1','u4','2026-07-28','low',   3,1,0,'proj-qt-1'),
  mk('Demo sản phẩm cho ban lãnh đạo',      'mt1-s2','u2','u1','2026-06-18','high',  0,0,5,'proj-mt-1'),
  mk('Góp ý thiết kế hệ thống phân quyền',  'cv-s1', 'u3','u4','2026-07-10','medium',1,0,2,'cv-ca-nhan'),
  mk('Tham gia họp retrospective sprint 5', 'qt1-s3','u4','u1','2026-06-25','low',   0,0,3,'proj-qt-1'),
  mk('Hỗ trợ đào tạo nhân viên mới',        'cv-s0', 'u1','u3','2026-07-31','medium',0,0,0,'cv-ca-nhan'),
  mk('Phối hợp test UAT module báo cáo',    'qt2-s2','u2','u4','2026-06-22','high',  0,0,4,'proj-qt-2'),
  mk('Xem xét đề xuất kiến trúc hệ thống',  'mt2-s0','u3','u2','2026-07-26','high',  2,0,1,'proj-mt-2'),
  mk('Họp đánh giá KPI tháng 7',            'mt1-s1','u4','u3','2026-07-15','medium',0,0,2,'proj-mt-1'),
  mk('Review pull request module thanh toán','cv-s3', 'u1','u2','2026-07-04','high',  0,0,3,'cv-ca-nhan'), // quá hạn
])
const tasksDuyet = reactive([
  mk('Đề xuất tăng ngân sách marketing',    'qt2-s1','u1','u0','2026-07-10','high',  0,0,2,'proj-qt-2'),
  mk('Phê duyệt quy trình onboarding',      'cv-s1', 'u2','u0','2026-07-14','medium',0,0,1,'cv-ca-nhan'),
  mk('Xét duyệt báo cáo chi phí Q2',        'qt1-s2','u3','u0','2026-06-28','high',  0,0,3,'proj-qt-1'), // quá hạn
  mk('Duyệt kế hoạch tuyển dụng Q3',        'qt2-s0','u4','u0','2026-07-25','medium',0,0,0,'proj-qt-2'),
  mk('Phê duyệt hợp đồng nhà cung cấp',     'mt1-s1','u1','u0','2026-07-12','high',  0,0,4,'proj-mt-1'),
  mk('Xem xét đề xuất đổi công nghệ',       'mt2-s1','u2','u0','2026-07-20','medium',1,0,2,'proj-mt-2'),
  mk('Duyệt ngân sách đào tạo nhân viên',   'qt1-s2','u3','u0','2026-06-27','low',   0,0,1,'proj-qt-1'), // quá hạn
  mk('Phê duyệt kế hoạch ra mắt tính năng', 'cv-s3', 'u4','u0','2026-07-08','high',  0,0,5,'cv-ca-nhan'),
  mk('Duyệt đề xuất mua thiết bị văn phòng','cv-s0', 'u1','u0','2026-07-17','low',   0,0,0,'cv-ca-nhan'),
  mk('Xét duyệt phương án bảo mật dữ liệu', 'qt2-s1','u2','u0','2026-07-16','high',  0,0,3,'proj-qt-2'),
  mk('Phê duyệt thiết kế UI v2.0',          'cv-s2', 'u3','u0','2026-06-15','medium',0,0,2,'cv-ca-nhan'),
  mk('Duyệt kế hoạch kiểm thử tổng thể',    'mt1-s0','u4','u0','2026-07-29','medium',3,0,1,'proj-mt-1'),
  mk('Xét duyệt đề xuất tích hợp Zalo OA',  'qt1-s1','u1','u0','2026-07-22','high',  0,0,4,'proj-qt-1'),
  mk('Phê duyệt ngân sách server cloud',    'mt2-s2','u2','u0','2026-06-20','high',  0,0,6,'proj-mt-2'),
])
const tasksByTab   = computed(() => ({ nhan: tasksNhan, giao: tasksGiao, lienquan: tasksLienQuan, duyet: tasksDuyet }))
const currentTasks = computed(() => {
  if (tab.value === 'nhan')     return tasksNhan
  if (tab.value === 'giao')     return tasksGiao
  if (tab.value === 'lienquan') return tasksLienQuan
  return tasksDuyet
})

/* ── Person helpers ── */
// 'nhan' → hiển thị người giao (assigner); mọi tab khác → người thực hiện (assignee)
function getPerson(t) { return tab.value === 'nhan' ? t.assigner : t.assignee }

const personColLabel = computed(() => tab.value === 'nhan' ? 'Người giao' : 'Người thực hiện')

/* ── Person filter ── */
const personFilterList = computed(() => {
  const map = new Map()
  currentTasks.value.forEach(t => {
    const p = getPerson(t)
    if (!map.has(p.id)) map.set(p.id, p)
  })
  return [...map.values()]
})

const PEOPLE_IDS = new Set(PEOPLE.map(p => p.id))

const collapsedGroupIds = ref(new Set())
function toggleListGroup(id) {
  const s = new Set(collapsedGroupIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsedGroupIds.value = s
}

const collapsedLaneIds = ref(new Set())
function toggleLane(id) {
  const s = new Set(collapsedLaneIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsedLaneIds.value = s
}

function toggleFilterPri(id) {
  const i = filterPris.value.indexOf(id)
  i >= 0 ? filterPris.value.splice(i, 1) : filterPris.value.push(id)
}
const hasActiveFilter = computed(() =>
  !!(filterName.value.trim() || filterPris.value.length > 0 || filterDue.value !== 'all')
)
function clearFilters() { filterName.value = ''; filterPris.value = []; filterDue.value = 'all' }

/* ── Toolbar dự án (search/trạng thái/lọc/sắp xếp) ── */
function resetProjToolbar() {
  filterName.value = ''
  filterStatusId.value = 'all'
  filterPris.value = []
  filterDue.value = 'all'
  sortBy.value = 'none'
}
function exportTasksCsv() {
  const rows = [['Tên công việc', 'Trạng thái', 'Người thực hiện', 'Hạn chót', 'Ưu tiên']]
  filteredTasks.value.forEach(t => {
    rows.push([
      t.name,
      statusById(t.statusId)?.label || '',
      t.assignee?.name || '',
      t.dueDate || '',
      PRIORITY_LABEL[t.priority] || '',
    ])
  })
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentProject.value.label || 'cong-viec'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function taskCountForPerson(personId) {
  return currentTasks.value.filter(t => getPerson(t).id === personId).length
}

const taskCountUnassigned = computed(() =>
  currentTasks.value.filter(t => !PEOPLE_IDS.has(getPerson(t).id)).length
)

const filteredTasks = computed(() => {
  let tasks = currentTasks.value
  if (currentProject.value.id !== 'all') {
    tasks = tasks.filter(t => t.projectId === currentProject.value.id)
  }
  if (selectedPersonId.value !== 'all') {
    if (selectedPersonId.value === 'unassigned') tasks = tasks.filter(t => !PEOPLE_IDS.has(getPerson(t).id))
    else tasks = tasks.filter(t => getPerson(t).id === selectedPersonId.value)
  }
  // advanced filters
  if (filterName.value.trim()) {
    const q = filterName.value.trim().toLowerCase()
    tasks = tasks.filter(t => t.name.toLowerCase().includes(q))
  }
  if (filterPris.value.length > 0) {
    tasks = tasks.filter(t => filterPris.value.includes(t.priority))
  }
  if (filterDue.value !== 'all') {
    const today = new Date(); today.setHours(0,0,0,0)
    const todayStr = today.toISOString().slice(0,10)
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate()+7)
    const weekStr  = weekEnd.toISOString().slice(0,10)
    if (filterDue.value === 'overdue') tasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr)
    else if (filterDue.value === 'today')  tasks = tasks.filter(t => t.dueDate === todayStr)
    else if (filterDue.value === 'week')   tasks = tasks.filter(t => t.dueDate && t.dueDate >= todayStr && t.dueDate <= weekStr)
  }
  if (filterStatusId.value !== 'all') {
    tasks = tasks.filter(t => t.statusId === filterStatusId.value)
  }
  if (sortBy.value === 'priority') {
    const order = { high: 0, medium: 1, low: 2, none: 3 }
    tasks = [...tasks].sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9))
  } else if (sortBy.value === 'due') {
    tasks = [...tasks].sort((a, b) => (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99'))
  }
  return tasks
})

/* ── Kanban columns ── */
const kanbanColumns = computed(() => {
  if (currentProject.value.id === 'all') {
    return UNIVERSAL_COLS.map(uc => ({
      id: uc.id, label: uc.label, color: uc.color,
      tasks: filteredTasks.value.filter(t => statusById(t.statusId)?.statusType === uc.id)
    }))
  }
  return statuses.value.map(s => ({ id:s.id, label:s.label, color:s.color, tasks:filteredTasks.value.filter(t=>t.statusId===s.id) }))
})

/* ── Kanban lifecycle columns ── */
const kanbanLifecycleCols = computed(() =>
  LIFECYCLE_STATUSES.map(ls => ({
    id: ls.id, label: ls.label, color: ls.color,
    tasks: filteredTasks.value.filter(t => getLifecycleId(t) === ls.id)
  }))
)

/* ── Kanban swimlanes (all-projects mode) ── */
const swimlanes = computed(() => {
  if (currentProject.value.id !== 'all') return []
  const map = new Map()
  filteredTasks.value.forEach(t => {
    const proj = projectMap.value.get(t.projectId)
    const pid = t.projectId || 'unknown'
    if (!map.has(pid)) map.set(pid, { id:pid, label:proj?.label||pid, color:proj?.color||'#6b7280', tasks:[] })
    map.get(pid).tasks.push(t)
  })
  const order = projectOrder.value
  return [...map.values()]
    .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
    .map(lane => ({
      ...lane,
      cols: UNIVERSAL_COLS.map(uc => ({
        ...uc,
        colKey: `${uc.id}:${lane.id}`,
        tasks: lane.tasks.filter(t => statusById(t.statusId)?.statusType === uc.id)
      }))
    }))
})

/* ── Kanban gom nhóm theo người ── */
const kanbanPersonCols = computed(() => {
  if (groupBy.value === 'lifecycle') return []
  const tasks = filteredTasks.value
  const field = groupBy.value
  const map = new Map()
  tasks.forEach(t => {
    const p = t[field] || { id: 'unassigned', name: 'Chưa giao', color: '#94a3b8', avatar: null, av: '??' }
    if (!map.has(p.id)) map.set(p.id, { id: p.id, label: p.name, color: p.color, avatar: p.avatar, av: p.av, tasks: [] })
    map.get(p.id).tasks.push(t)
  })
  return [...map.values()]
})

/* ── List groups ── */
const listGroups = computed(() => {
  const tasks = filteredTasks.value
  const field = groupBy.value === 'assigner' ? 'assigner' : 'assignee'

  // Gom nhóm theo trạng thái vòng đời
  if (groupBy.value === 'lifecycle') {
    return LIFECYCLE_STATUSES.map(ls => ({
      id: ls.id, label: ls.label, color: ls.color,
      tasks: tasks.filter(t => getLifecycleId(t) === ls.id)
    }))
  }

  // Tất cả + gom nhóm theo người: nhóm phẳng by person
  if (currentProject.value.id === 'all') {
    const map = new Map()
    tasks.forEach(t => {
      const p = t[field] || { id: 'unassigned', name: 'Chưa giao', color: '#94a3b8' }
      if (!map.has(p.id)) map.set(p.id, { id: p.id, label: p.name, color: p.color, tasks: [] })
      map.get(p.id).tasks.push(t)
    })
    return [...map.values()]
  }

  // Một dự án + theo người
  const map = new Map()
  tasks.forEach(t => {
    const p = t[field] || { id: 'unassigned', name: 'Chưa giao', color: '#94a3b8' }
    if (!map.has(p.id)) map.set(p.id, { id:p.id, label:p.name, color:p.color, tasks:[], expanded:true })
    map.get(p.id).tasks.push(t)
  })
  return [...map.values()]
})

/* ── Nested list: Dự án → Nhóm → Công việc → Công việc con (chỉ khi "all") ── */
function genSubTaskList(task) {
  if (!task.subTasks) return []
  const tmpl = SUB_TASK_TEMPLATES[task.id % SUB_TASK_TEMPLATES.length]
  return Array.from({ length: Math.min(task.subTasks, tmpl.length) }, (_, i) => ({
    name: tmpl[i], done: i < task.subTasksDone
  }))
}
const nestedListGroups = computed(() => {
  if (currentProject.value.id !== 'all') return []
  const tasks = filteredTasks.value
  const projMap = new Map()
  tasks.forEach(t => {
    const proj = projectMap.value.get(t.projectId)
    const pid = t.projectId || 'unknown'
    if (!projMap.has(pid)) projMap.set(pid, { id:pid, label:proj?.label||pid, color:proj?.color||'#6b7280', taskList:[] })
    projMap.get(pid).taskList.push(t)
  })
  const order = projectOrder.value
  return [...projMap.values()]
    .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
    .map(proj => ({
      id: proj.id, label: proj.label, color: proj.color,
      statusGroups: (projectStatuses[proj.id] || [])
        .map(s => ({
          id: s.id, label: s.label, color: s.color,
          tasks: proj.taskList
            .filter(t => t.statusId === s.id)
            .map(t => ({ ...t, subTaskList: genSubTaskList(t) }))
        }))
        .filter(sg => sg.tasks.length > 0)
    }))
    .filter(proj => proj.statusGroups.length > 0)
})

const expandedSubIds = ref(new Set())
function toggleSubTasks(taskId) {
  const s = new Set(expandedSubIds.value)
  s.has(taskId) ? s.delete(taskId) : s.add(taskId)
  expandedSubIds.value = s
}

/* ── Helpers ── */
function isOverdue(d) { return d && new Date(d) < new Date() }
function fmtDate(d) {
  if (!d) return ''
  const [y,m,day] = d.split('-')
  return `${day}/${m}/${y}`
}

/* ── Calendar ── */
const now = new Date()
const calYear  = ref(now.getFullYear())
const calMonth = ref(now.getMonth())
function prevMonth() { calMonth.value === 0 ? (calMonth.value=11, calYear.value--) : calMonth.value-- }
function nextMonth() { calMonth.value === 11 ? (calMonth.value=0, calYear.value++) : calMonth.value++ }
function goToday()   { calYear.value=now.getFullYear(); calMonth.value=now.getMonth() }
const calDays = computed(() => {
  const first = new Date(calYear.value, calMonth.value, 1).getDay()
  const last  = new Date(calYear.value, calMonth.value+1, 0).getDate()
  return [...Array(first).fill(null), ...Array.from({length:last},(_,i)=>i+1)]
})
function isToday(day) { return day && calYear.value===now.getFullYear() && calMonth.value===now.getMonth() && day===now.getDate() }
function tasksOnDay(day) {
  const iso = `${calYear.value}-${String(calMonth.value+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  return filteredTasks.value.filter(t=>t.dueDate===iso)
}

/* ── Task Detail Drawer ── */
const SAMPLE_COMMENTS = [
  { id:1, user: null, text: 'Đã xem xét yêu cầu, cần clarify thêm về authentication flow trước khi bắt đầu.', time: '25/06/2026 14:32' },
  { id:2, user: null, text: 'Đã cập nhật spec theo góp ý, bạn check lại nhé.', time: '25/06/2026 15:10' },
  { id:3, user: null, text: 'Phần này liên quan đến ticket #214, cần sync với team backend.', time: '26/06/2026 09:05' },
]
const SAMPLE_LOG = [
  { user: null, action: 'Tạo công việc', time: '22/07/2022 09:27' },
  { user: null, action: 'Giao việc cho người thực hiện', time: '22/07/2022 09:28' },
  { user: null, action: 'Cập nhật trạng thái: Chưa thực hiện → Đang thực hiện', time: '25/07/2022 08:15' },
  { user: null, action: 'Thêm bình luận', time: '25/06/2026 14:32' },
  { user: null, action: 'Cập nhật hạn hoàn thành', time: '26/06/2026 10:00' },
  { user: null, action: 'Cập nhật trạng thái: Đang thực hiện → Chờ duyệt', time: '28/06/2026 17:45' },
]
const taskDrawer = reactive({
  open: false, task: null,
  subTasks: [],
  clItems: [],
  tags: [],
  actOpen: true, activeTab: 'comment', comments: [], newComment: '', actLog: [],
  actGroupExpanded: {}
})

const SUB_TASK_TEMPLATES = [
  ['Phân tích yêu cầu và lên kế hoạch', 'Thiết kế giải pháp kỹ thuật', 'Triển khai và viết code', 'Viết test và kiểm thử', 'Review và merge code'],
  ['Nghiên cứu và thu thập tài liệu', 'Xây dựng prototype', 'Kiểm tra và đánh giá', 'Hoàn thiện và bàn giao'],
  ['Tạo nhánh feature mới', 'Implement tính năng chính', 'Xử lý edge case', 'Cập nhật tài liệu'],
]
const CHECKLIST_TEMPLATES = [
  { name: 'Checklist', items: ['Xem xét yêu cầu', 'Review code', 'Chạy toàn bộ test', 'Deploy lên staging', 'Xác nhận với PM'] },
  { name: 'Checklist', items: ['Viết tài liệu kỹ thuật', 'Cập nhật changelog', 'Thông báo các bên liên quan'] },
]
const TAG_SAMPLES = [
  [{ label: 'Bug', color: '#ef4444' }, { label: 'Ưu tiên cao', color: '#f59e0b' }],
  [{ label: 'Feature', color: '#3b82f6' }, { label: 'UI/UX', color: '#8b5cf6' }, { label: 'Frontend', color: '#10b981' }],
  [{ label: 'Backend', color: '#0ea5e9' }, { label: 'API', color: '#6366f1' }],
  [],
]

function openTask(task) {
  taskDrawer.task = task
  const total = task.subTasks || 0
  const done  = task.subTasksDone || 0
  if (total > 0) {
    const tmpl = SUB_TASK_TEMPLATES[task.id % SUB_TASK_TEMPLATES.length]
    taskDrawer.subTasks = Array.from({ length: Math.min(total, tmpl.length) }, (_, i) => ({
      name: tmpl[i], done: i < done,
      assignee: i % 2 === 0 ? PEOPLE[(task.id + i + 1) % PEOPLE.length] : null,
      dueDate:  i % 3 === 0 ? `2026-07-${String(10 + i * 5).padStart(2,'0')}` : null,
    }))
  } else {
    taskDrawer.subTasks = []
  }
  taskDrawer.clItems = []
  // Tags: xoay vòng mẫu, một số task để trống
  const tagSet = TAG_SAMPLES[task.id % TAG_SAMPLES.length]
  taskDrawer.tags = tagSet.map(t => ({ ...t }))

  const cmtUsers = [task.assigner, task.assignee, PEOPLE[1], PEOPLE[2]]
  taskDrawer.comments = task.comments > 0
    ? SAMPLE_COMMENTS.slice(0, task.comments).map((c, i) => ({ ...c, user: cmtUsers[i % cmtUsers.length] }))
    : []
  taskDrawer.actLog = SAMPLE_LOG.map((e, i) => ({ ...e, user: i % 2 === 0 ? task.assigner : task.assignee }))
  taskDrawer.newComment = ''
  taskDrawer.activeTab = 'comment'
  taskDrawer.actOpen = true
  taskDrawer.actGroupExpanded = {}
  taskDrawer.open = true
  nextTick(() => autoResizeEl(tdTitleRef.value))
}
function closeDrawer() { taskDrawer.open = false }

const tdTitleRef = ref(null)
function autoResizeEl(el) { if (!el) return; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
function onTdTitleInput(e) { autoResizeEl(e.target) }

const actGroups = computed(() => {
  const task = taskDrawer.task
  if (!task) return []
  const assigner = task.assigner
  const assignee = task.assignee
  const base = new Date(2023, task.id % 12, (task.id % 20) + 1, 9, 27)
  const fmt = (d) => {
    const dd = String(d.getDate()).padStart(2,'0')
    const mm = String(d.getMonth()+1).padStart(2,'0')
    const h  = String(d.getHours()).padStart(2,'0')
    const mi = String(d.getMinutes()).padStart(2,'0')
    return `${dd}/${mm}/${d.getFullYear()} ${h}:${mi}`
  }
  const addDays = (d, days, h=9, m=0) => { const x=new Date(d); x.setDate(x.getDate()+days); x.setHours(h,m); return x }

  const d0 = fmt(base)
  const d1 = fmt(addDays(base, 0, 9, 32))
  const d3 = fmt(addDays(base, 3, 14, 20))
  const d10 = fmt(addDays(base, 10, 8, 49))
  const d14 = fmt(addDays(base, 14, 14, 18))
  const d15 = fmt(addDays(base, 15, 8, 5))

  const statuses = projectStatuses[task.projectId] || projectStatuses['cv-ca-nhan']
  const todoSt   = statuses.find(s => s.statusType === 'todo')
  const doingSt  = statuses.find(s => s.statusType === 'doing')
  const curSt    = statuses.find(s => s.id === task.statusId)

  const groups = []

  // "Tạo, xem và cập nhật" — newest first
  const crudRows = []
  if (task.done) crudRows.push({ label: 'Hoàn thành công việc', user: assignee, date: d15 })
  crudRows.push({ label: 'Đã xem', user: assignee, date: d14 })
  crudRows.push({ label: 'Cập nhật trạng thái tự động', user: null, date: d10 })
  crudRows.push({ label: 'Đã xem', user: assigner, date: d3 })
  crudRows.push({ label: 'Giao việc cho người thực hiện', user: assigner, date: d1 })
  crudRows.push({ label: 'Tạo công việc', user: assigner, date: d0 })
  groups.push({ key: 'crud', label: 'Tạo, xem và cập nhật', rows: crudRows })

  // "Chuyển đến cột" — only if task has moved past todo
  if (curSt && curSt.statusType !== 'todo') {
    const colRows = []
    if (task.done || curSt.statusType === 'done') {
      colRows.push({ label: `${doingSt?.label || 'Đang thực hiện'} → ${curSt.label}`, user: assignee, date: d15 })
    }
    colRows.push({ label: `${todoSt?.label || 'Chưa thực hiện'} → ${doingSt?.label || 'Đang thực hiện'}`, user: assigner, date: fmt(addDays(base, 1, 8, 15)) })
    groups.push({ key: 'column', label: 'Chuyển đến cột', rows: colRows })
  }

  return groups
})

const drawerWidth = ref(Math.min(960, Math.round(window.innerWidth * 0.82)))

function startResize(e) {
  const startX = e.clientX
  const startW = drawerWidth.value
  const onMove = (ev) => {
    const delta = startX - ev.clientX
    drawerWidth.value = Math.max(360, Math.min(window.innerWidth - 240, startW + delta))
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
function submitComment() {
  const text = taskDrawer.newComment.trim()
  if (!text) return
  taskDrawer.comments.push({ id: Date.now(), user: ME, text, time: new Date().toLocaleString('vi-VN') })
  taskDrawer.newComment = ''
  if (taskDrawer.task) taskDrawer.task.comments = taskDrawer.comments.length
}
const subInputRefs = {}
function addDrawerSubTask() {
  const idx = taskDrawer.subTasks.length
  taskDrawer.subTasks.push({ name: '', done: false, assignee: null, dueDate: null })
  if (taskDrawer.task) taskDrawer.task.subTasks = taskDrawer.subTasks.length
  nextTick(() => subInputRefs[idx]?.focus())
}
const clInputRefs = {}
function addClItem() {
  const idx = taskDrawer.clItems.length
  taskDrawer.clItems.push({ text: '', done: false })
  nextTick(() => clInputRefs[idx]?.focus())
}
function addClItemAfter(ii) {
  taskDrawer.clItems.splice(ii + 1, 0, { text: '', done: false })
  nextTick(() => clInputRefs[ii + 1]?.focus())
}

/* ── Breadcrumb dropdown ── */
const bcOpen      = ref(false)
const bcSearch    = ref('')
const bcWrapRef   = ref(null)
const bcSearchRef = ref(null)
const bcStyle     = ref({})

const filteredBcGroups = computed(() => {
  const q = bcSearch.value.trim().toLowerCase()
  if (!q) return departments
  return departments
    .map(d => ({ ...d, projects: d.projects.filter(p => p.label.toLowerCase().includes(q) || d.label.toLowerCase().includes(q)) }))
    .filter(d => d.projects.length > 0)
})

function openBcDd() {
  bcSearch.value = ''
  if (!bcOpen.value && bcWrapRef.value) {
    const rect = bcWrapRef.value.getBoundingClientRect()
    bcStyle.value = { position: 'fixed', top: rect.bottom + 4 + 'px', left: rect.left + 'px', zIndex: 9999 }
    bcOpen.value = true
    nextTick(() => bcSearchRef.value?.focus())
  } else {
    bcOpen.value = false
  }
}
function selectBcProject(proj) {
  if (taskDrawer.task) taskDrawer.task.projectId = proj.id ?? null
  bcOpen.value = false
}

const tdDueIsOverdue = computed(() => {
  const due = taskDrawer.task?.dueDate
  if (!due) return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return new Date(due + 'T00:00:00') < today
})
const tdDueRemaining = computed(() => {
  const task = taskDrawer.task
  const due  = task?.dueDate
  if (!due || !task?.startDate) return ''
  const startMs = new Date(task.startDate).getTime()
  const endMs   = new Date(due + 'T23:59:59').getTime()
  const diffMs  = endMs - startMs
  if (diffMs <= 0) return ''
  const days  = Math.floor(diffMs / 86400000)
  const hours = Math.floor((diffMs % 86400000) / 3600000)
  const mins  = Math.floor((diffMs % 3600000) / 60000)
  const parts = []
  if (days  > 0) parts.push(`${days} ngày`)
  if (hours > 0) parts.push(`${hours} giờ`)
  if (mins  > 0) parts.push(`${mins} phút`)
  return `(${parts.join(' ') || '0 phút'})`
})

const drawerProjectLabel = computed(() => {
  if (!taskDrawer.task) return ''
  const p = projectMap.value.get(taskDrawer.task.projectId)
  return p?.label || taskDrawer.task.projectId
})
const drawerProjectColor = computed(() => {
  if (!taskDrawer.task) return '#64748b'
  const p = projectMap.value.get(taskDrawer.task.projectId)
  return p?.color || '#64748b'
})
const drawerDeptLabel = computed(() => {
  if (!taskDrawer.task) return ''
  const dept = departments.find(d => d.projects.some(p => p.id === taskDrawer.task.projectId))
  return dept?.label || ''
})

/* ── td-fields: assignee dropdown ── */
const tdAssigneeWrapRef  = ref(null)
const tdAssigneeSearchRef= ref(null)
const tdAssigneeDdStyle  = ref({})
const tdAssigneeSearch   = ref('')
const showTdAssigneeDd   = ref(false)

const tdFilteredPeople = computed(() => {
  const q = tdAssigneeSearch.value.trim().toLowerCase()
  return q ? PEOPLE.filter(p => p.name.toLowerCase().includes(q)) : PEOPLE
})
function openTdAssigneeDd() {
  tdAssigneeSearch.value = ''
  if (!showTdAssigneeDd.value && tdAssigneeWrapRef.value) {
    const rect = tdAssigneeWrapRef.value.getBoundingClientRect()
    tdAssigneeDdStyle.value = { position: 'fixed', top: rect.bottom + 6 + 'px', left: rect.left + 'px', zIndex: 9999 }
    showTdAssigneeDd.value = true
    nextTick(() => tdAssigneeSearchRef.value?.focus())
  } else {
    showTdAssigneeDd.value = false
  }
  showTdDateDd.value = false
}
function pickTdAssignee(p) {
  showTdAssigneeDd.value = false
  if (!taskDrawer.task) return
  const isSame = taskDrawer.task.assignee?.id === p.id
  taskDrawer.task.assignee = isSame ? null : p
}

/* ── td-fields: date picker ── */
const tdDateWrapRef  = ref(null)
const tdDateDdStyle  = ref({})
const showTdDateDd   = ref(false)
const tdCalYear      = ref(new Date().getFullYear())
const tdCalMonth     = ref(new Date().getMonth())

const TD_CAL_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
const tdCalMonthLabel = computed(() => `${TD_CAL_MONTHS[tdCalMonth.value]} ${tdCalYear.value}`)
const tdCalCells = computed(() => {
  const today = new Date()
  const sel = taskDrawer.task?.dueDate ? new Date(taskDrawer.task.dueDate + 'T00:00:00') : null
  let startDow = new Date(tdCalYear.value, tdCalMonth.value, 1).getDay()
  startDow = startDow === 0 ? 6 : startDow - 1
  const cells = []
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(tdCalYear.value, tdCalMonth.value, -i)
    cells.push({ key: `p${i}`, day: d.getDate(), date: d, other: true, today: false, selected: false })
  }
  const dim = new Date(tdCalYear.value, tdCalMonth.value + 1, 0).getDate()
  for (let i = 1; i <= dim; i++) {
    const d = new Date(tdCalYear.value, tdCalMonth.value, i)
    cells.push({ key: `c${i}`, day: i, date: d, other: false,
      today: d.toDateString() === today.toDateString(),
      selected: sel ? d.toDateString() === sel.toDateString() : false })
  }
  const rem = 42 - cells.length
  for (let i = 1; i <= rem; i++) {
    const d = new Date(tdCalYear.value, tdCalMonth.value + 1, i)
    cells.push({ key: `n${i}`, day: i, date: d, other: true, today: false, selected: false })
  }
  return cells
})
function openTdDateDd() {
  if (taskDrawer.task?.dueDate) {
    const d = new Date(taskDrawer.task.dueDate + 'T00:00:00')
    tdCalYear.value = d.getFullYear(); tdCalMonth.value = d.getMonth()
  } else {
    tdCalYear.value = new Date().getFullYear(); tdCalMonth.value = new Date().getMonth()
  }
  if (!showTdDateDd.value && tdDateWrapRef.value) {
    const rect = tdDateWrapRef.value.getBoundingClientRect()
    tdDateDdStyle.value = { position: 'fixed', top: rect.bottom + 6 + 'px', left: rect.left + 'px', zIndex: 9999 }
  }
  showTdDateDd.value = !showTdDateDd.value
  showTdAssigneeDd.value = false
}
function tdCalPrev() { if (tdCalMonth.value === 0) { tdCalMonth.value = 11; tdCalYear.value-- } else tdCalMonth.value-- }
function tdCalNext() { if (tdCalMonth.value === 11) { tdCalMonth.value = 0; tdCalYear.value++ } else tdCalMonth.value++ }
function tdSelectDate(cell) {
  if (!taskDrawer.task) return
  const d = cell.date
  const pad = n => String(n).padStart(2, '0')
  taskDrawer.task.dueDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  showTdDateDd.value = false
}

/* ── Subtask inline dropdowns ── */
const subDd = reactive({ subIdx: null, type: null, style: {}, search: '' })
const subDdSearchRef = ref(null)

const subFilteredPeople = computed(() => {
  const q = subDd.search.toLowerCase()
  return q ? PEOPLE.filter(p => p.name.toLowerCase().includes(q)) : PEOPLE
})

const subCalYear  = ref(new Date().getFullYear())
const subCalMonth = ref(new Date().getMonth())
const subCalMonthLabel = computed(() => `${TD_CAL_MONTHS[subCalMonth.value]} ${subCalYear.value}`)
const subCalCells = computed(() => {
  const today = new Date()
  const activeSub = subDd.subIdx !== null ? taskDrawer.subTasks[subDd.subIdx] : null
  const sel = activeSub?.dueDate ? new Date(activeSub.dueDate + 'T00:00:00') : null
  let startDow = new Date(subCalYear.value, subCalMonth.value, 1).getDay()
  startDow = startDow === 0 ? 6 : startDow - 1
  const cells = []
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(subCalYear.value, subCalMonth.value, -i)
    cells.push({ key: `p${i}`, day: d.getDate(), date: d, other: true, today: false, selected: false })
  }
  const dim = new Date(subCalYear.value, subCalMonth.value + 1, 0).getDate()
  for (let i = 1; i <= dim; i++) {
    const d = new Date(subCalYear.value, subCalMonth.value, i)
    cells.push({ key: `c${i}`, day: i, date: d, other: false,
      today: d.toDateString() === today.toDateString(),
      selected: sel ? d.toDateString() === sel.toDateString() : false })
  }
  const rem = 42 - cells.length
  for (let i = 1; i <= rem; i++) {
    const d = new Date(subCalYear.value, subCalMonth.value + 1, i)
    cells.push({ key: `n${i}`, day: i, date: d, other: true, today: false, selected: false })
  }
  return cells
})

function openSubDd(e, idx, type) {
  if (subDd.subIdx === idx && subDd.type === type) {
    subDd.subIdx = null; subDd.type = null; return
  }
  const rect = e.currentTarget.getBoundingClientRect()
  subDd.subIdx = idx
  subDd.type = type
  subDd.search = ''
  subDd.style = { position: 'fixed', top: rect.bottom + 6 + 'px', left: rect.left + 'px', zIndex: 9999 }
  if (type === 'assignee') nextTick(() => subDdSearchRef.value?.focus())
  showTdAssigneeDd.value = false
  showTdDateDd.value = false
}

function openSubDateDd(e, idx, sub) {
  if (sub.dueDate) {
    const d = new Date(sub.dueDate + 'T00:00:00')
    subCalYear.value = d.getFullYear(); subCalMonth.value = d.getMonth()
  } else {
    subCalYear.value = new Date().getFullYear(); subCalMonth.value = new Date().getMonth()
  }
  openSubDd(e, idx, 'date')
}

function pickSubAssignee(sub, p) {
  sub.assignee = sub.assignee?.id === p.id ? null : p
  subDd.subIdx = null; subDd.type = null
}

function subCalPrev() { if (subCalMonth.value === 0) { subCalMonth.value = 11; subCalYear.value-- } else subCalMonth.value-- }
function subCalNext() { if (subCalMonth.value === 11) { subCalMonth.value = 0; subCalYear.value++ } else subCalMonth.value++ }

function subSelectDate(sub, cell) {
  const d = cell.date
  const pad = n => String(n).padStart(2, '0')
  sub.dueDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  subDd.subIdx = null; subDd.type = null
}

/* ── Add task: delegate to CvSidebar popup ── */
function openAddTask() {
  const pid = currentProject.value.id !== 'all' ? currentProject.value.id : null
  window.dispatchEvent(new CustomEvent('cv-open-add-popup', { detail: { projectId: pid } }))
}
</script>

<style scoped>
.vctt { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; }

/* ══ Header ══ */
.vctt-header {
  flex-shrink:0; background:rgba(255,255,255,0.95);
  border-bottom:1px solid var(--stroke-neutral-light);
  box-shadow:0 1px 4px rgba(0,0,0,0.06);
}
.vctt-header--flat { box-shadow:none; background:rgba(255,255,255,0.9); }
.vctt-bar {
  display:flex; align-items:center; justify-content:space-between;
  gap:10px; padding:0 16px; height:48px;
}
.vctt-tabs { display:flex; align-items:stretch; height:100%; }
.vctt-tabs--proj { flex:1; }
.vctt-proj-tabs { display:flex; align-items:stretch; }
.vctt-tab {
  display:inline-flex; align-items:center; gap:6px; padding:0 12px;
  border:none; background:transparent;
  font-size:13px; font-weight:var(--fw-medium); color:var(--text-primary);
  cursor:pointer; transition:color .15s; white-space:nowrap;
  position:relative;
}
.vctt-tab:hover { color:var(--text-primary); background:var(--bg-neutral-hover); border-radius:var(--radius-default); }
.vctt-tab.active { color:var(--text-brand); font-weight:var(--fw-semibold); }
/* Underline indicator — bottom:-1px overlaps the header border so it looks flush */
.vctt-tab::after {
  content:''; position:absolute; bottom:-1px; left:8px; right:8px;
  height:3px; border-radius:3px 3px 0 0; background:transparent; transition:background .15s;
}
.vctt-tab.active::after { background:var(--stroke-brand, #3b82f6); }
.vctt-tab__badge {
  display:inline-flex; align-items:center; justify-content:center;
  min-width:18px; height:18px; padding:0 5px;
  background:var(--bg-neutral-light); color:var(--text-secondary);
  border-radius:9px; font-size:10px; font-weight:var(--fw-semibold);
}
.vctt-tab.active .vctt-tab__badge { background:var(--bg-brand-light); color:var(--text-brand); }
/* Chế độ 1 dự án: tên dự án + tab xem theo chế độ (Bảng/Danh sách/Gantt/Lịch/...) */
.vctt-proj-title {
  display:flex; align-items:center; gap:6px; flex-shrink:0;
  padding:0 8px; border-radius:var(--radius-default);
  font-size:14px; font-weight:var(--fw-semibold); color:var(--text-primary);
  cursor:pointer; position:relative; transition:background .1s;
}
.vctt-proj-title:hover { background:var(--bg-neutral-hover); }
.vctt-proj-divider { width:1px; height:20px; background:var(--stroke-neutral-light); flex-shrink:0; align-self:center; margin:0 8px; }
.vctt-proj-title .ti { font-size:16px; color:var(--icon-neutral); }
.vctt-proj-title__arr { font-size:11px; color:var(--text-hint); }
.vctt-proj-title .proj-dd { top:calc(100% + 4px); left:0; right:auto; }
.vctt-soon {
  flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:8px; color:var(--text-hint); font-size:13px;
}
.vctt-soon .ti { font-size:28px; color:var(--icon-neutral); }
.vctt-bar__right { display:flex; align-items:center; gap:6px; }

/* ── Project dropdown ── */
.vctt-proj {
  display:inline-flex; align-items:center; gap:5px; height:var(--btn-height); padding:0 10px;
  border:1px solid var(--stroke-neutral); border-radius:var(--radius-default);
  background:var(--bg-white); font-size:12px; color:var(--text-primary);
  cursor:pointer; position:relative; user-select:none; white-space:nowrap;
  transition:border-color .15s,background .15s;
}
.vctt-proj:hover { background:var(--bg-neutral-light); }
.vctt-proj__lbl { color:var(--text-secondary); font-weight:var(--fw-medium); white-space:nowrap; flex-shrink:0; }
.vctt-proj__val { color:var(--text-primary); font-weight:var(--fw-semibold); max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.vctt-proj__arr { margin-left:1px; }
.vctt-proj__arr .ti { font-size:11px; color:var(--text-hint); }

.proj-dd {
  position:absolute; top:calc(100% + 4px); left:0; width:240px;
  background:var(--bg-white); border:1px solid var(--stroke-neutral-light);
  border-radius:var(--radius-default); box-shadow:0 4px 20px rgba(0,0,0,0.12);
  z-index:60; overflow:hidden;
}
.proj-dd__search {
  display:flex; align-items:center; gap:6px;
  padding:8px 10px; border-bottom:1px solid var(--stroke-neutral-light);
}
.proj-dd__search-ico .ti { font-size:13px; color:var(--text-hint); }
.proj-dd__search-input {
  flex:1; border:none; background:transparent; outline:none;
  font-size:12px; color:var(--text-primary);
}
.proj-dd__body { max-height:260px; overflow-y:auto; padding:4px 0; }
.proj-dd__empty { padding:12px 14px; font-size:12px; color:var(--text-hint); }
.proj-dd__section-hd { padding:8px 14px 4px; font-size:10px; font-weight:var(--fw-semibold); color:var(--text-secondary); text-transform:uppercase; letter-spacing:.07em; }

.proj-grp { }
.proj-grp__hd {
  display:flex; align-items:center; gap:4px;
  height:32px; padding:0 10px; cursor:pointer;
  font-size:12px; font-weight:var(--fw-semibold); color:var(--text-secondary);
  user-select:none; transition:background .1s;
}
.proj-grp__hd:hover { background:var(--bg-neutral-hover); }
.proj-grp__arr .ti { font-size:12px; color:var(--text-hint); }
.proj-grp__name { flex:1; }

.proj-item {
  display:flex; align-items:center; gap:8px;
  height:32px; padding:0 10px 0 26px; cursor:pointer;
  font-size:12px; color:var(--text-primary); transition:background .1s;
}
.proj-item:hover  { background:var(--bg-neutral-hover); }
.proj-item.active { background:var(--bg-brand-light); color:var(--text-brand); }
.proj-item__dot   { width:8px; height:8px; border-radius:2px; flex-shrink:0; }
.proj-item--all   { border-bottom:1px solid var(--stroke-neutral-light); margin-bottom:4px; padding-left:14px; }
.proj-item__all-dot { width:8px; height:8px; border-radius:2px; flex-shrink:0; background:linear-gradient(135deg,#3b82f6 0%,#10b981 100%); }

/* ── Group-by ── */
.vctt-groupby { display:flex; align-items:center; gap:6px; }
.vctt-groupby__lbl { font-size:11px; color:var(--text-secondary); white-space:nowrap; }
.vctt-segs { display:flex; }
.vctt-seg {
  height:var(--btn-height); padding:0 10px; border:1px solid var(--stroke-neutral);
  background:var(--bg-white); font-size:12px; color:var(--text-secondary); cursor:pointer;
}
.vctt-seg:first-child { border-radius:var(--radius-default) 0 0 var(--radius-default); }
.vctt-seg:last-child  { border-radius:0 var(--radius-default) var(--radius-default) 0; border-left:none; }
.vctt-seg:hover { background:var(--bg-neutral-light); }
.vctt-seg.active { background:var(--bg-brand-light); border-color:var(--stroke-brand); color:var(--text-brand); font-weight:var(--fw-semibold); }

/* ── View switcher ── */
.vctt-views { display:flex; flex-shrink:0; height:var(--btn-height); border:1px solid var(--stroke-neutral); border-radius:var(--radius-default); overflow:hidden; }
.vctt-view {
  display:inline-flex; align-items:center; justify-content:center;
  width:var(--btn-height); height:var(--btn-height); border:none; border-right:1px solid var(--stroke-neutral);
  background:var(--bg-white); cursor:pointer; color:var(--text-secondary); transition:background .1s,color .1s;
}
.vctt-view:last-child { border-right:none; }
.vctt-view:hover  { background:var(--bg-neutral-light); }
.vctt-view.active { background:var(--bg-brand-light); color:var(--text-brand); }
.vctt-view .ti { font-size:15px; }

/* ── Gom nhóm button + dropdown ── */
.vctt-grp {
  display: inline-flex; align-items: center; gap: 4px; height: var(--btn-height); padding: 0 8px;
  border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default);
  background: var(--bg-white); font-size: 12px;
  cursor: pointer; transition: all .1s; position: relative; white-space: nowrap;
}
.vctt-grp:hover, .vctt-grp.active { background: var(--bg-brand-light); border-color: var(--stroke-brand); }
.vctt-grp:hover .vctt-grp__lbl, .vctt-grp.active .vctt-grp__lbl { color: var(--text-brand); }
.vctt-grp:hover .vctt-grp__val, .vctt-grp.active .vctt-grp__val { color: var(--text-brand); }
.vctt-grp__lbl { color: var(--text-secondary); font-weight: var(--fw-medium); flex-shrink: 0; }
.vctt-grp__ico { display:inline-flex; color: var(--text-secondary); flex-shrink: 0; }
.vctt-grp__ico .ti { font-size: 13px; }
.vctt-grp:hover .vctt-grp__ico, .vctt-grp.active .vctt-grp__ico { color: var(--text-brand); }
.vctt-grp__val { color: var(--text-primary); font-weight: var(--fw-semibold); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vctt-grp__arr { margin-left: 1px; }
.vctt-grp__arr .ti { font-size: 11px; color: var(--text-hint); }
.grp-dd {
  position: absolute; top: calc(100% + 4px); right: 0; z-index: 300;
  min-width: 200px; background: var(--bg-white);
  border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);
  box-shadow: 0 4px 16px rgba(0,0,0,.10); padding: 4px 0; cursor: default;
}
.grp-dd__item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  height: 36px; padding: 0 12px; border: none; background: transparent;
  font-size: 13px; color: var(--text-primary); cursor: pointer; text-align: left;
  transition: background .1s;
}
.grp-dd__item:hover { background: var(--bg-neutral-hover); }
.grp-dd__item.active { color: var(--text-brand); font-weight: var(--fw-semibold); }
.grp-dd__item.active .ti { color: var(--text-brand); }
.grp-dd__check .ti { font-size: 14px; }
.grp-dd__check-spacer { width: 14px; flex-shrink: 0; }
.grp-dd__soon { padding: 10px 12px; font-size: 12px; color: var(--text-hint); white-space: nowrap; }

/* ── Toolbar dự án (search / trạng thái / lọc / sắp xếp / hiển thị) ── */
.proj-toolbar {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 12px 16px;
  background: var(--bg-page);
}
/* Chế độ ảnh nền: nền trắng siêu nhẹ để ảnh vẫn nhìn xuyên qua được, thay vì xám đặc */
:root[data-wallpaper] .proj-toolbar { background: transparent; }
/* Bỏ khoảng cách với board bên dưới — toolbar đã có padding-bottom riêng rồi */
.proj-toolbar + .kanban-wrap { padding-top: 0; }
.proj-toolbar__search { min-width: 220px; }
.proj-toolbar__right { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.proj-toolbar__right .ti { font-size: 16px; }
/* Đồng nhất chiều cao mọi control trong hàng này = var(--btn-height) (không dùng bậc "sm") */
.proj-toolbar .fb-search,
.proj-toolbar .vctt-grp { height: var(--btn-height); }

/* ── Kanban person columns ── */
.kanban-board--person { display: flex; gap: 12px; padding: 0; overflow-x: auto; align-items: flex-start; min-height: 0; flex: 1; }
.kanban-col--person { min-width: 280px; }
.kpc-av {
  width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
}
.kpc-av--fb {
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: var(--fw-semibold); color: #fff;
}
.kcard__status-chip {
  display: inline-flex; align-items: center; height: 20px; padding: 0 8px;
  border-radius: 10px; font-size: 11px; font-weight: var(--fw-medium); white-space: nowrap;
}


/* ══ Body layout ══ */
.vctt-body { flex:1; min-height:0; display:flex; overflow:hidden; }
.vctt-main { flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden; }

/* ══ Right person panel ══ */
.person-panel {
  width:180px; flex-shrink:0; position:relative;
  border-left:1px solid var(--stroke-neutral-light);
  background:var(--bg-white);
  display:flex; flex-direction:column;
  overflow-y:auto; overflow-x:hidden;
  transition:width .2s ease;
}
.person-panel--collapsed { width:52px; }

.pp-header {
  display:flex; align-items:center;
  padding:10px 12px 8px; flex-shrink:0;
  border-bottom:1px solid var(--stroke-neutral-light); min-height:36px;
}
.person-panel--collapsed .pp-header { padding:10px 0 8px; }
.pp-title {
  font-size:11px; font-weight:var(--fw-semibold); color:var(--text-secondary);
  text-transform:uppercase; letter-spacing:.06em; white-space:nowrap;
}

/* Scrollable list — bottom padding keeps items above collapse button */
.pp-list { display:flex; flex-direction:column; padding:6px 6px 52px; gap:8px; }

.pp-item {
  display:flex; align-items:center; gap:8px;
  height:36px; padding:0 6px; border:none; border-radius:var(--radius-default);
  background:transparent; cursor:pointer; text-align:left;
  transition:background .1s; width:100%; position:relative;
}
.pp-item:hover { background:var(--bg-neutral-hover); }
.pp-item.active { background:var(--bg-brand-light); }
.pp-item.active .pp-name { color:var(--text-brand); font-weight:var(--fw-semibold); }
.pp-item.active .pp-count { background:var(--stroke-brand); color:#fff; }

/* Collapsed: avatar + initials stacked */
.person-panel--collapsed .pp-item {
  flex-direction:column; height:auto; padding:6px 0;
  gap:2px; align-items:center; justify-content:center;
}


.pp-av {
  width:28px; height:28px; border-radius:50%; flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  font-size:10px; font-weight:700; color:#fff;
}
.pp-av--photo { object-fit:cover; display:block; }
.pp-av--all { background:var(--bg-neutral-light); color:var(--text-secondary); border:1px solid var(--stroke-neutral); }
.pp-av--all .ti { font-size:15px; }
.pp-av--unassigned { background:transparent; color:var(--text-hint); border:1.5px dashed var(--stroke-neutral); }
.pp-av--unassigned .ti { font-size:14px; }
.pp-initial {
  font-size:9px; font-weight:var(--fw-semibold); color:var(--text-secondary);
  text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  max-width:44px; line-height:1.2;
}
.pp-item.active .pp-initial { color:var(--text-brand); }
.pp-name {
  flex:1; min-width:0; font-size:12px; color:var(--text-primary);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.pp-count {
  display:inline-flex; align-items:center; justify-content:center;
  min-width:18px; height:18px; padding:0 4px; border-radius:9px;
  background:var(--bg-neutral-light); color:var(--text-secondary);
  font-size:10px; font-weight:var(--fw-semibold); flex-shrink:0;
}

/* ── Collapse/Expand button — absolute at bottom-left, mirrors sidebar btn-collapse ── */
.pp-collapse-btn {
  position:absolute; bottom:0; left:0;
  width:40px; height:40px;
  background:var(--neutral-50, #f9fafb);
  border:none;
  border-top:1px solid var(--stroke-neutral-light);
  border-right:1px solid var(--stroke-neutral-light);
  border-radius:0 8px 0 0;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--text-secondary);
  transition:background .15s;
}
/* When collapsed: full-width button */
.person-panel--collapsed .pp-collapse-btn {
  left:0; right:0; width:auto;
  border-right:none;
  border-radius:0;
}
.pp-collapse-btn:hover { background:var(--bg-neutral-hover); }
.pp-collapse-btn .ti { font-size:18px; }

/* ══ KANBAN ══ */
.kanban-wrap { flex:1; min-height:0; padding:16px; overflow:hidden; display:flex; flex-direction:column; }
.kanban-board {
  display:flex; gap:0; height:100%; overflow-x:auto; overflow-y:hidden;
  padding-bottom:4px; scrollbar-width:thin; scrollbar-color:rgba(0,0,0,.12) transparent;
  border-radius:10px; overflow:hidden;
}
.kanban-board::-webkit-scrollbar { height:5px; }
.kanban-board::-webkit-scrollbar-thumb { background:rgba(0,0,0,.15); border-radius:3px; }
.kanban-col {
  display:flex; flex-direction:column; width:260px; flex-shrink:0;
  background: rgba(0,0,0,0.14);
  backdrop-filter: blur(4px) saturate(1.1); -webkit-backdrop-filter: blur(4px) saturate(1.1);
  overflow: hidden;
}
/* Bo góc trên của cột đầu/cuối tự thân — không phụ thuộc clip của .kanban-board,
   vì khi board cuộn ngang, cột "chạm mép" không phải lúc nào cũng là cột đầu/cuối thật. */
.kanban-col:first-child { border-top-left-radius: 10px; }
.kanban-col:last-of-type { border-top-right-radius: 10px; }
.kanban-col__hd {
  display:flex; align-items:center; gap:7px; padding:9px 12px;
  flex-shrink:0; position:relative;
  background: var(--col-color, #64748b);
}
.kanban-col__body { border-right: 1px solid rgba(255,255,255,0.16); }
.kanban-col:last-of-type .kanban-col__body { border-right: none; }
.kcol-dot   { display:none; }
.kcol-name  { flex:1; font-size:12px; font-weight:var(--fw-semibold); color:#fff; }
.kcol-rename-input {
  flex:1; height:22px; padding:0 6px; border:none; border-radius:4px;
  background:rgba(255,255,255,0.25); color:#fff; font-size:12px; font-weight:var(--fw-semibold);
  outline:2px solid rgba(255,255,255,0.6); caret-color:#fff;
}
.kcol-rename-input::placeholder { color:rgba(255,255,255,0.5); }
.kcol-menu-btn {
  display:inline-flex; align-items:center; justify-content:center;
  width:22px; height:22px; border:none; background:transparent; border-radius:4px;
  cursor:pointer; color:rgba(255,255,255,0.7); flex-shrink:0; transition:background .1s, color .1s;
  position:relative;
}
.kcol-menu-btn:hover { background:rgba(255,255,255,0.18); color:#fff; }
.kcol-menu-btn .ti   { font-size:14px; }
.kcol-dd {
  position:absolute; top:calc(100% + 2px); right:0;
  width:160px; background:var(--bg-white); border:1px solid var(--stroke-neutral-light);
  border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.14);
  z-index:80; overflow:hidden; padding:4px 0;
}
.kcol-dd__item {
  display:flex; align-items:center; gap:8px;
  width:100%; height:34px; padding:0 12px;
  border:none; background:transparent; text-align:left;
  font-size:12px; color:var(--text-primary); cursor:pointer; transition:background .1s;
}
.kcol-dd__item:hover { background:var(--bg-neutral-hover); }
.kcol-dd__item .ti { font-size:13px; color:var(--icon-neutral); flex-shrink:0; }
.kcol-dd__item--del { color:var(--text-danger); }
.kcol-dd__item--del .ti { color:var(--text-danger); }
.kcol-dd__item--del:hover { background:var(--bg-danger-light); }
.kcol-color-grid {
  display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; padding:8px 10px;
}
.kcol-color-swatch {
  width:24px; height:24px; border-radius:50%; border:2px solid transparent;
  cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff;
  transition:transform .1s;
}
.kcol-color-swatch:hover { transform:scale(1.12); }
.kcol-color-swatch.active { border-color:var(--stroke-neutral-light); box-shadow:0 0 0 1px currentColor; }
.kcol-color-swatch .ti { font-size:13px; }
.kanban-addcol {
  flex-shrink:0; align-self:flex-start; margin-top:2px; margin-left:12px;
  display:flex; align-items:center; gap:6px; height:36px; padding:0 12px;
  border:1px dashed var(--stroke-neutral); border-radius:var(--radius-default);
  background:transparent; color:var(--text-secondary); font-size:13px; font-weight:var(--fw-medium);
  cursor:pointer; white-space:nowrap; transition:background .1s, color .1s, border-color .1s;
}
.kanban-addcol:hover { background:var(--bg-white); color:var(--text-brand); border-color:var(--stroke-brand); border-style:solid; }
.kanban-addcol .ti { font-size:14px; }
:root[data-wallpaper] .kanban-addcol { border-color:rgba(255,255,255,0.6); color:#fff; }
:root[data-wallpaper] .kanban-addcol:hover { background:rgba(255,255,255,0.12); color:#fff; border-color:#fff; }
.kcol-count {
  display:inline-flex; align-items:center; justify-content:center;
  min-width:18px; height:18px; padding:0 5px;
  background: rgba(255,255,255,0.22);
  color: #fff;
  border-radius:9px; font-size:10px; font-weight:var(--fw-semibold);
}
/* scrollbar-width: thin cố định (không đổi none↔thin theo hover) nên không giật layout;
   track + thumb tô màu đen mờ sẵn, đồng bộ 2 mã màu track/track-piece. */
.kanban-col__body {
  flex:1; min-height:0; overflow-y:auto; padding:8px 8px 8px; display:flex; flex-direction:column; gap:8px;
  scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.25) rgba(0,0,0,0.05);
}
.kanban-col__body::-webkit-scrollbar { width: 6px; }
.kanban-col__body::-webkit-scrollbar-track,
.kanban-col__body::-webkit-scrollbar-track-piece { background: rgba(0,0,0,0.05); box-shadow: none; border: none; }
.kanban-col__body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.25); border-radius: 3px; box-shadow: none; border: none; }
.kanban-col__body:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.4); }
.kcard { background:var(--bg-white); border-radius:8px; border:none; padding:10px 12px; cursor:grab; transition:transform .1s,opacity .15s; position:relative; }
.kcard:hover { transform:translateY(-1px); }
.kcard--dragging { opacity:0.22; cursor:grabbing; box-shadow:none; transform:none; }
.kcard--dimmed   { opacity:0.5; transition:opacity .12s; }
.kcard--new { animation: task-highlight 4s ease forwards; z-index: 2; }
@keyframes task-highlight {
  0%   { background: #fed7aa; box-shadow: 0 0 0 2px rgba(249,115,22,0.35); transform: translateX(0); }
  4%   { transform: translateX(-5px); background: #fef9c3; box-shadow: 0 0 0 2px rgba(234,179,8,0.3); }
  8%   { transform: translateX(5px);  background: #fed7aa; box-shadow: 0 0 0 2px rgba(249,115,22,0.35); }
  12%  { transform: translateX(-5px); background: #fef9c3; box-shadow: 0 0 0 2px rgba(234,179,8,0.3); }
  16%  { transform: translateX(5px);  background: #fed7aa; box-shadow: 0 0 0 2px rgba(249,115,22,0.35); }
  20%  { transform: translateX(-4px); background: #fef9c3; box-shadow: 0 0 0 2px rgba(234,179,8,0.25); }
  24%  { transform: translateX(4px);  background: #fed7aa; box-shadow: 0 0 0 2px rgba(249,115,22,0.25); }
  28%  { transform: translateX(-3px); background: #fef9c3; box-shadow: 0 0 0 2px rgba(234,179,8,0.2); }
  32%  { transform: translateX(3px);  background: #fed7aa; box-shadow: 0 0 0 2px rgba(249,115,22,0.2); }
  36%  { transform: translateX(-2px); background: #ffedd5; }
  40%  { transform: translateX(0);    background: #ffedd5; box-shadow: 0 0 0 1px rgba(249,115,22,0.15); }
  70%  { background: #fff7ed; box-shadow: none; }
  100% { background: var(--bg-white); box-shadow: 0 1px 3px rgba(0,0,0,.05); transform: translateX(0); }
}
.kcard-ghost {
  flex-shrink:0; min-height:78px; border-radius:8px;
  border:2px dashed var(--bg-brand);
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
  animation: ghost-pulse .9s ease-in-out infinite;
  pointer-events: none;
}
@keyframes ghost-pulse { 0%,100% { opacity:.65; } 50% { opacity:1; } }
.kcard__top { display:flex; align-items:flex-start; gap:7px; margin-bottom:8px; }
.kcard__name { font-size:13px; font-weight:var(--fw-medium); color:var(--text-primary); line-height:1.45; flex:1; min-width:0; }
.kcard--done .kcard__name { text-decoration:line-through; color: var(--text-primary); }

/* ── Task check button (shared kanban + list) ── */
.task-check {
  flex-shrink:0; width:16px; height:16px; border-radius:50%;
  border:1.5px solid var(--stroke-neutral); background:transparent;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; padding:0; transition:border-color .15s, background .15s;
  margin-top:1px;
}
.task-check:hover { border-color:var(--bg-brand); }
.task-check--done { border-color:#16a34a; background:#16a34a; }
.task-check--done .ti { font-size:12px; color:#fff; }
.task-check:not(.task-check--done) .ti { display:none; }
.kcard__meta { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.kcard__date { display:flex; align-items:center; gap:3px; font-size:11px; color:var(--text-primary); }
.kcard__date .ti { font-size:11px; }
.kcard__date.overdue { color:var(--text-danger); }
.kcard__pri .ti { font-size:14px; }
.kcard__pri--high .ti { color:#ef4444; }
.kcard__pri--medium .ti { color:#f59e0b; }
.kcard__pri--low .ti { color:#94a3b8; }
.kcard__pri--none .ti { color:transparent; }
.kcard__foot { display:flex; align-items:center; justify-content:space-between; }
.kcard__foot-right { display:flex; align-items:center; gap:8px; }
.kcard__av { width:22px; height:22px; border-radius:50%; flex-shrink:0; object-fit:cover; display:block; }
.kcard__sub,.kcard__cmt { display:flex; align-items:center; gap:3px; font-size:11px; color:var(--text-secondary); }
.kcard__sub .ti,.kcard__cmt .ti { font-size:11px; }
.kcol-add {
  display:flex; align-items:center; gap:5px; flex-shrink:0; height:28px; padding:0 8px;
  border:none; background:transparent; border-radius:5px; font-size:13px;
  color: var(--text-brand);
  cursor:pointer; transition:background .1s, color .1s; font-weight:var(--fw-medium);
}
.kcol-add:hover { background:rgba(255,255,255,0.12); color: var(--text-brand); }
.kcol-add .ti { font-size:13px; }
:root[data-wallpaper] .kcol-add,
:root[data-wallpaper] .kcol-add:hover { color: #fff; }

/* ══ LIST ══ */
.list-wrap {
  flex:1; min-height:0; overflow-y:auto;
  margin:12px 16px 16px;
  border-radius:12px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px) saturate(1.2); -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  scrollbar-width:thin; scrollbar-color:rgba(0,0,0,.1) transparent;
  position: relative;
}
.list-header {
  display:flex; align-items:center; height:38px; padding:0 16px; gap:0;
  border-bottom:1px solid var(--stroke-neutral-light);
  border-top:1px solid var(--stroke-neutral-light);
  font-size:13px; font-weight:var(--fw-semibold); color:var(--text-primary);
  position:sticky; top:0; border-radius:12px 12px 0 0;
  background: var(--neutral-200); z-index:2;
}
/* check-spacer = lr-indent(20) + check(16) để header name căn với task name */
.lh-check-spacer { width:36px; flex-shrink:0; }
/* Header cells: stretch full height, center nội dung, border-right trải đủ chiều cao header */
.lh-name { flex:1; min-width:0; padding:0 8px; align-self:stretch; display:flex; align-items:center; white-space:nowrap; }
/* Resizable columns — width driven by CSS vars set from colWidths reactive */
.lh-person, .lr-person { width:var(--lw-person,160px); flex-shrink:0; padding:0 8px; }
.lh-date,   .lr-date   { width:var(--lw-date,130px);   flex-shrink:0; padding:0 8px; }
.lh-status, .lr-status { width:var(--lw-status,150px); flex-shrink:0; padding:0 8px; }
.lh-pri,    .lr-pri    { width:var(--lw-pri,100px);    flex-shrink:0; padding:0 8px; }
/* Header cells: align-self:stretch + flex center → border-right kéo full chiều cao header */
.lh-person,.lh-date,.lh-status {
  position:relative; align-self:stretch; display:flex; align-items:center; white-space:nowrap;
}
.lh-pri { align-self:stretch; display:flex; align-items:center; white-space:nowrap; }
.lh-name,.lh-person,.lh-date,.lh-status { border-right:1px solid var(--stroke-neutral); }
/* Resize handle — chỉ hiện màu brand khi hover/resize, không tạo đường tĩnh */
.col-rz {
  position:absolute; right:-4px; top:0; bottom:0; width:8px;
  cursor:col-resize; z-index:3;
  display:flex; align-items:center; justify-content:center;
}
.col-rz::after {
  content:''; display:block;
  width:0; height:100%;
  background:var(--stroke-brand);
  transition:width .1s;
}
.col-rz:hover::after { width:2px; }
.lh-pri .col-rz { display:none; }
.list-wrap--resizing { user-select:none; }
.list-wrap--resizing .col-rz::after { width:2px; }
/* Column divider lines — kéo từ header đến footer, overlay toàn bộ chiều cao */
.lcol-div {
  position: absolute;
  top: 0; bottom: 0;
  width: 1px;
  background: var(--stroke-neutral);
  pointer-events: none;
  z-index: 1;
}
/* ── Nested list: project / status group headers ── */
.list-proj { margin-bottom: 2px; }
.list-proj-hd {
  display: flex; align-items: center; gap: 6px;
  height: 40px; padding: 0 16px;
  cursor: pointer; user-select: none;
  font-weight: var(--fw-semibold);
  border-left: 3px solid var(--proj-color, transparent);
  background: var(--bg-neutral-light);
  transition: background .1s;
}
.list-proj-hd:hover { background: var(--bg-neutral-hover); }
.list-proj-name { flex: 1; font-size: 14px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.lgrp-dot--proj { width: 12px; height: 12px; border-radius: 3px; }

.list-sg-hd {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 16px 0 32px;
  border-radius: var(--radius-default);
  cursor: pointer; user-select: none; transition: background .1s;
}
.list-sg-hd:hover { background: var(--bg-neutral-hover); }

/* Extra indent levels for nested rows */
.lr-indent--l2 { width: 44px; flex-shrink: 0; }
.lr-indent--l3 { width: 64px; flex-shrink: 0; }
.list-row--l2 { cursor: pointer; }
.list-sub-row { background: var(--bg-neutral-light); }
.list-sub-row .lr-name-text { color: var(--text-secondary); font-size: 12px; }

/* Sub-task expand toggle */
.lr-sub-toggle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; flex-shrink: 0;
  border: none; background: transparent; cursor: pointer;
  color: var(--icon-neutral); padding: 0;
  align-self: center;
}
.lr-sub-toggle:hover { background: var(--bg-neutral-hover); color: var(--text-primary); border-radius: 4px; }
.lr-sub-toggle .ti { font-size: 13px; }
.lr-sub-spacer { width: 16px; flex-shrink: 0; align-self: center; }

/* Add row indent for l2 */
.list-add-row--l2 { padding-left: 80px; }

.list-group { margin-bottom:2px; }
.list-group__hd { display:flex; align-items:center; gap:6px; height:36px; padding:0 16px; border-radius:var(--radius-default); cursor:pointer; user-select:none; transition:background .1s; }
.list-group__hd:hover { background:var(--bg-neutral-hover); }
.lgrp-chevron .ti { font-size:13px; color:var(--icon-neutral); }
.lgrp-dot  { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.lgrp-name { flex:1; font-size:13px; font-weight:var(--fw-semibold); color:var(--text-primary); }
.lgrp-count { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; padding:0 5px; background:var(--bg-neutral-light); border-radius:9px; font-size:10px; color:var(--text-secondary); }
.list-row { display:flex; align-items:stretch; height:40px; padding:0 16px; gap:0; border-bottom:1px solid var(--stroke-neutral-light); }
.list-row .task-check { margin-top:0; align-self:center; }
.list-row .lr-indent  { align-self:center; }
/* Indent spacer — pushes check icon to align with group color dot */
.lr-indent { width:20px; flex-shrink:0; }
.list-row--done .lr-name-text { text-decoration:line-through; color: var(--text-primary); }
.list-row--new { animation: row-highlight 4s ease forwards; }
@keyframes row-highlight {
  0%   { background: #fed7aa; box-shadow: inset 3px 0 0 rgba(249,115,22,0.5); transform: translateX(0); }
  4%   { transform: translateX(-5px); background: #fef9c3; box-shadow: inset 3px 0 0 rgba(234,179,8,0.45); }
  8%   { transform: translateX(5px);  background: #fed7aa; box-shadow: inset 3px 0 0 rgba(249,115,22,0.5); }
  12%  { transform: translateX(-5px); background: #fef9c3; box-shadow: inset 3px 0 0 rgba(234,179,8,0.45); }
  16%  { transform: translateX(5px);  background: #fed7aa; box-shadow: inset 3px 0 0 rgba(249,115,22,0.5); }
  20%  { transform: translateX(-4px); background: #fef9c3; box-shadow: inset 3px 0 0 rgba(234,179,8,0.35); }
  24%  { transform: translateX(4px);  background: #fed7aa; box-shadow: inset 3px 0 0 rgba(249,115,22,0.35); }
  28%  { transform: translateX(-3px); background: #fef9c3; box-shadow: inset 3px 0 0 rgba(234,179,8,0.25); }
  32%  { transform: translateX(3px);  background: #fed7aa; box-shadow: inset 3px 0 0 rgba(249,115,22,0.25); }
  38%  { transform: translateX(0);    background: #ffedd5; box-shadow: inset 3px 0 0 rgba(249,115,22,0.2); }
  70%  { background: #fff7ed; box-shadow: inset 2px 0 0 rgba(249,115,22,0.1); }
  100% { background: transparent; box-shadow: inset 2px 0 0 transparent; transform: translateX(0); }
}
/* Body cells — stretch full row height, center content, per-cell hover */
.lr-name   { flex:1; min-width:0; padding:0 8px; display:flex; align-items:center; overflow:hidden; cursor:text; border-radius:4px; transition:background .1s; }
.lr-name-text { flex:1; min-width:0; font-size:13px; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.lr-person { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-primary); cursor:pointer; border-radius:4px; transition:background .1s; }
.lr-av     { width:20px; height:20px; border-radius:50%; flex-shrink:0; object-fit:cover; display:block; }
.lr-date   { display:flex; align-items:center; font-size:12px; color:var(--text-primary); cursor:pointer; border-radius:4px; transition:background .1s; }
.lr-date.overdue { color:var(--text-danger); }
.lr-status { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-primary); cursor:pointer; border-radius:4px; transition:background .1s; }
.lr-status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.lr-pri    { display:flex; align-items:center; gap:4px; font-size:12px; color:var(--text-primary); cursor:pointer; border-radius:4px; transition:background .1s; }
.lr-pri .ti { font-size:12px; }
.lr-name:hover,.lr-person:hover,.lr-date:hover,.lr-status:hover,.lr-pri:hover { background:var(--bg-neutral-hover); }
/* Inline edit inputs/selects */
.lr-cell-input {
  width:100%; height:24px; padding:0 4px; border:1px solid var(--stroke-brand);
  border-radius:4px; font-size:13px; color:var(--text-primary); background:var(--bg-white); outline:none;
}
.lr-cell-date { font-size:12px; }
.lr-cell-sel {
  width:100%; height:24px; padding:0 4px; border:1px solid var(--stroke-brand);
  border-radius:4px; font-size:12px; color:var(--text-primary); background:var(--bg-white); outline:none; cursor:pointer;
}
.lr-pri--high .ti { color:#ef4444; } .lr-pri--medium .ti { color:#f59e0b; } .lr-pri--low .ti { color:#94a3b8; } .lr-pri--none .ti { color:var(--icon-neutral); }
.list-add-row { display:flex; align-items:center; gap:6px; height:34px; padding:0 16px; padding-left:60px; width:100%; border:none; background:transparent; text-align:left; font-size:12px; color:var(--text-brand); font-weight:var(--fw-medium); cursor:pointer; transition:background .1s,opacity .1s; }
.list-add-row:hover { background:var(--bg-neutral-hover); opacity:.8; }
.list-add-row .ti { font-size:13px; }

/* ══ CALENDAR ══ */
.cal-wrap { flex:1; min-height:0; overflow-y:auto; padding:16px 16px 20px 20px; display:flex; flex-direction:column; gap:12px; }
.cal-nav { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.cal-nav-btn { display:inline-flex; align-items:center; justify-content:center; width:calc(var(--btn-height) - 4px); height:calc(var(--btn-height) - 4px); border:1px solid var(--stroke-neutral); border-radius:var(--radius-default); background:var(--bg-white); cursor:pointer; color:var(--text-secondary); }
.cal-nav-btn:hover { background:var(--bg-neutral-hover); }
.cal-nav-btn .ti { font-size:14px; }
.cal-nav-title { font-size:14px; font-weight:var(--fw-semibold); color:var(--text-primary); min-width:130px; text-align:center; }
.cal-today-btn { height:calc(var(--btn-height) - 4px); padding:0 12px; border:1px solid var(--stroke-neutral); border-radius:var(--radius-default); background:var(--bg-white); font-size:12px; color:var(--text-secondary); cursor:pointer; }
.cal-today-btn:hover { background:var(--bg-neutral-hover); }
.cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; background:var(--stroke-neutral-light); border:1px solid var(--stroke-neutral-light); border-radius:8px; overflow:hidden; }
.cal-dow { background:var(--bg-neutral-light); height:32px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:var(--fw-semibold); color:var(--text-secondary); }
.cal-cell { background:var(--bg-white); min-height:90px; padding:6px; display:flex; flex-direction:column; gap:3px; }
.cal-cell--empty { background:var(--bg-neutral-light); }
.cal-day-num { font-size:12px; color:var(--text-secondary); line-height:20px; }
.cal-cell--today .cal-day-num { background:var(--bg-brand); color:#fff; border-radius:50%; width:20px; height:20px; display:inline-flex; align-items:center; justify-content:center; }
.cal-chip { font-size:11px; color:var(--text-primary); padding:2px 5px; border-radius:3px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cal-chip:hover { opacity:.8; }

/* Transitions */
.slide-panel-enter-active,.slide-panel-leave-active { transition:opacity .18s,transform .18s; }
.slide-panel-enter-from,.slide-panel-leave-to { opacity:0; transform:translateY(-6px); }
.modal-fade-enter-active,.modal-fade-leave-active { transition:opacity .18s; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity:0; }

/* ══ Filter button ══ */
.vctt-filter-btn {
  display:inline-flex; align-items:center; gap:5px; height:var(--btn-height); padding:0 10px;
  border:1px solid var(--stroke-neutral); border-radius:var(--radius-default);
  background:var(--bg-white); font-size:12px; color:var(--text-secondary);
  cursor:pointer; transition:all .1s; position:relative; white-space:nowrap;
}
.vctt-filter-btn:hover { background:var(--bg-neutral-light); }
.vctt-filter-btn.active { background:var(--bg-brand-light); border-color:var(--stroke-brand); color:var(--text-brand); }
.vctt-filter-btn .ti { font-size:14px; }
.vctt-filter-btn.has-filter::after {
  content:''; position:absolute; top:4px; right:4px;
  width:6px; height:6px; border-radius:50%; background:var(--bg-brand); border:1.5px solid var(--bg-white);
}

/* ══ Filter bar ══ */
.filter-bar {
  display:flex; align-items:center; flex-wrap:wrap; gap:10px;
  padding:8px 20px; border-top:1px solid var(--stroke-neutral-light);
  background:var(--bg-white);
}
.fb-search {
  display:flex; align-items:center; gap:6px;
  height:calc(var(--btn-height) - 4px); padding:0 8px; border:1px solid var(--stroke-neutral);
  border-radius:var(--radius-default); background:var(--bg-white); min-width:200px;
  transition:border-color .15s;
}
.fb-search:focus-within { border-color:var(--stroke-brand); }
.fb-search-ico .ti { font-size:13px; color:var(--text-hint); }
.fb-search-input { flex:1; border:none; background:transparent; outline:none; font-size:12px; color:var(--text-primary); }
.fb-search-clear { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border:none; background:transparent; cursor:pointer; color:var(--text-hint); padding:0; }
.fb-search-clear:hover { color:var(--text-primary); }
.fb-search-clear .ti { font-size:12px; }
.fb-group { display:flex; align-items:center; gap:5px; }
.fb-lbl { font-size:11px; font-weight:var(--fw-semibold); color:var(--text-secondary); white-space:nowrap; }
.fb-pill {
  height:24px; padding:0 10px; border:1px solid var(--stroke-neutral);
  border-radius:20px; background:var(--bg-white); font-size:12px; color:var(--text-secondary);
  cursor:pointer; transition:all .1s; white-space:nowrap;
}
.fb-pill:hover { border-color:var(--stroke-brand); color:var(--text-brand); background:var(--bg-brand-light); }
.fb-pill.active { border-color:var(--stroke-brand); color:var(--text-brand); background:var(--bg-brand-light); font-weight:var(--fw-semibold); }
.fb-clear {
  display:inline-flex; align-items:center; gap:4px; height:24px; padding:0 10px;
  border:1px solid var(--stroke-neutral); border-radius:20px; background:transparent;
  font-size:12px; color:var(--text-secondary); cursor:pointer;
}
.fb-clear:hover { border-color:var(--text-danger); color:var(--text-danger); }
.fb-clear .ti { font-size:12px; }

/* ══ Kanban swimlanes (all-projects mode) ══ */
.kanban-swimlanes {
  flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column;
  padding:0; gap:12px;
  scrollbar-width:thin; scrollbar-color:rgba(0,0,0,.1) transparent;
}
.kanban-lane {
  flex-shrink:0;
  border-radius:10px; overflow:hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
}
.kanban-lane__hd {
  display:flex; align-items:center; gap:8px;
  height:44px; padding:0 16px; cursor:pointer; user-select:none;
  background: rgba(255,255,255,0.45);
  backdrop-filter: blur(16px) saturate(1.6); -webkit-backdrop-filter: blur(16px) saturate(1.6);
  border-left: 4px solid var(--lane-color, #64748b);
  box-shadow: 0 2px 6px rgba(0,0,0,0.10);
  transition: background .12s;
}
.kanban-lane__hd:hover { background: rgba(255,255,255,0.58); }
.kl-chevron .ti { font-size:14px; color:var(--icon-neutral); }
.kl-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; background: var(--lane-color, #64748b); }
.kl-name { font-size:13px; font-weight:var(--fw-semibold); color:var(--text-primary); flex:1; }
.kl-count {
  display:inline-flex; align-items:center; justify-content:center;
  min-width:20px; height:20px; padding:0 6px;
  background: var(--bg-neutral-light); color:var(--text-secondary);
  border-radius:10px; font-size:11px; font-weight:var(--fw-semibold);
}
.kanban-lane__body {
  display:flex; overflow-x:auto; min-height:140px;
  background: rgba(0,0,0,0.22);
  padding: 12px;
  scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.25) rgba(0,0,0,0.05);
}
.kanban-lane__body::-webkit-scrollbar { height: 6px; }
.kanban-lane__body::-webkit-scrollbar-track,
.kanban-lane__body::-webkit-scrollbar-track-piece { background: rgba(0,0,0,0.05); box-shadow: none; border: none; }
.kanban-lane__body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.25); border-radius: 3px; box-shadow: none; border: none; }
.kanban-lane__body:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.4); }
.kanban-lane .kanban-col { border-bottom:none; min-height:140px; }

/* ══ TASK DETAIL DRAWER ══════════════════════════════════════════════════════ */
.td-wrap {
  position: fixed; top: 0; right: 0; bottom: 0;
  display: flex; flex-direction: row;
  background: transparent;
  z-index: 200;
}
.td-content {
  position: relative; flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 32px rgba(0,0,0,0.18);
}
.td-body {
  flex: 1; min-height: 0; display: flex;
}

/* Drawer slide transition */
.drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform 0.22s ease; }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }

/* Resize handle */
.td-resize-handle {
  position: absolute; left: -6px; top: 0; bottom: 0; width: 12px;
  cursor: col-resize; z-index: 10;
}
.td-resize-handle::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 5px; width: 2px;
  background: transparent; border-radius: 2px; transition: background 0.15s;
}
.td-resize-handle:hover::after { background: var(--stroke-brand); }

/* ── Edge collapse button ── */
.td-edge-btn {
  align-self: center; flex-shrink: 0;
  width: 16px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; color: var(--icon-neutral);
  background: var(--bg-white);
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 8px rgba(0,0,0,0.10);
  transition: background .12s, color .12s;
}
.td-edge-btn:hover { background: var(--bg-neutral-hover); color: var(--text-primary); }
.td-edge-btn .ti { font-size: 14px; }

/* ── Breadcrumb dropdown ── */
.bc-dd {
  min-width: 240px; background: var(--bg-white);
  border: 1px solid var(--stroke-neutral-light); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.14); overflow: hidden;
}
.bc-dd-search {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; border-bottom: 1px solid var(--stroke-neutral-light);
}
.bc-dd-search-ico { flex-shrink: 0; color: var(--text-hint); }
.bc-dd-search-ico .ti { font-size: 14px; }
.bc-dd-search-inp {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 13px; color: var(--text-primary); font-family: inherit;
}
.bc-dd-search-inp::placeholder { color: var(--text-hint); }
.bc-dd-list { padding: 4px 0; max-height: 260px; overflow-y: auto; }
.bc-dd-check { margin-left: auto; color: var(--text-brand); flex-shrink: 0; }
.bc-dd-check .ti { font-size: 13px; }

/* ── Main content left panel ── */
.td-main {
  flex: 1; min-width: 0; overflow-y: auto; display: flex; flex-direction: column;
  background: var(--bg-white);
  scrollbar-width: thin; scrollbar-color: var(--stroke-neutral) transparent;
}

/* ── Topbar ── */
.td-topbar {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-bottom: 1px solid var(--stroke-neutral);
  background: var(--bg-white);
  flex-shrink: 0;
}
.td-status-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 30px; padding: 0 10px 0 12px; border-radius: 6px;
  border: none; background: var(--s-color, #64748b); color: #fff;
  font-size: 12px; font-weight: var(--fw-semibold); cursor: pointer;
  transition: opacity .12s;
}
.td-status-btn:hover { opacity: 0.88; }
.td-status-btn .ti { font-size: 13px; }
.td-tb-gap { flex: 1; }
.td-tb-sep { width: 1px; height: 16px; background: var(--stroke-neutral-light); margin: 0 2px; flex-shrink: 0; }
.td-tb-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; color: var(--icon-neutral); flex-shrink: 0;
}
.td-tb-icon:hover { background: var(--bg-neutral-hover); color: var(--text-primary); }
.td-tb-chat-ico { width: 20px; height: 20px; display: block; }
.td-tb-icon .ti { font-size: 20px; }
.td-tb-close:hover { color: var(--text-danger); }

/* ── Meta pills ── */
.td-meta {
  padding: 10px 20px 2px; flex-shrink: 0;
}
.td-bc-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; background: transparent; cursor: pointer; padding: 4px 0;
  transition: opacity .12s;
}
.td-bc-btn:hover { opacity: 0.7; }
.td-bc-dept { font-size: 12px; color: var(--text-secondary); }
.td-bc-dept--sel { color: var(--text-primary); }
.td-bc-sep  { font-size: 12px; color: var(--text-hint); }
.td-bc-proj {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--text-secondary);
}
.td-bc-proj--sel { color: var(--text-primary); }
.td-bc-dot { width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0; }
.td-bc-arrow .ti { font-size: 12px; color: var(--icon-neutral); }

/* ── Title ── */
.td-title-wrap { padding: 4px 20px 2px; flex-shrink: 0; }
.td-title {
  display: block; width: 100%; box-sizing: border-box;
  border: none; background: transparent; outline: none; resize: none; overflow: hidden;
  font-size: 20px; font-weight: var(--fw-bold); color: var(--text-primary);
  font-family: inherit; padding: 0; line-height: 1.3;
}

/* ── Assigner ── */
.td-assigner {
  padding: 2px 20px 4px; font-size: 12px; color: var(--text-secondary); flex-shrink: 0;
  display: flex; align-items: center; gap: 6px;
}
.td-assigner-lbl { white-space: nowrap; }
.td-assigner-name { color: var(--text-brand); cursor: pointer; }
.td-assigner-name:hover { text-decoration: underline; }

/* ── Field boxes ── */
.td-fields {
  display: flex; gap: 8px; flex-wrap: wrap; padding: 6px 20px; flex-shrink: 0;
}
.td-field-box {
  display: inline-flex; flex-direction: row; align-items: center; gap: 8px;
  padding: 6px 10px; border-radius: 8px;
  border: 1px solid var(--stroke-neutral); background: var(--bg-white);
  cursor: pointer; white-space: nowrap;
  transition: border-color .15s;
}
.td-field-box:hover { border-color: var(--stroke-brand); }
.td-field-text { display: flex; flex-direction: column; gap: 4px; height: 32px; justify-content: center; }
.td-field-label { font-size: 12px; color: var(--text-secondary); line-height: 1; }
.td-field-val { font-size: 13px; color: var(--text-secondary); line-height: 1; }
.td-field-box--filled .td-field-label { color: var(--text-primary); }
.td-field-box--filled .td-field-val { color: var(--text-primary); font-weight: var(--fw-semibold); }
.td-field-ico-wrap {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  border: 1.5px dashed var(--stroke-neutral); background: transparent;
  display: flex; align-items: center; justify-content: center; transition: border-color .12s;
}
.td-field-box--filled .td-field-ico-wrap { border-style: solid; border-color: var(--stroke-neutral-light); }
.td-field-ico { font-size: 18px; color: var(--icon-neutral); }
.td-field-av { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.td-field-placeholder { color: var(--text-hint); }

/* ── Description ── */
.td-desc { padding: 8px 20px 12px; flex-shrink: 0; }
.td-desc + .td-section--empty { padding-top: 0; }
.td-section--empty + .td-section--empty { padding-top: 0; }
.td-desc-btn {
  display: flex; align-items: center; gap: 8px;
  border: none; background: transparent; cursor: pointer;
  font-size: 13px; color: var(--text-brand); padding: 0;
}
.td-desc-btn:hover { opacity: 0.7; }
.td-desc-ico .ti { font-size: 15px; }

/* ── Sections — divider lines, no card box ── */
.td-section {
  padding: 12px 20px 8px;
  flex-shrink: 0;
}
.td-sec-title { font-size: 14px; font-weight: var(--fw-semibold); color: var(--text-primary); margin-bottom: 6px; }
.td-sec-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.td-sec-hd .td-sec-title { margin-bottom: 0; flex: none; }
.td-sec-filter {
  display: inline-flex; align-items: center; gap: 4px;
  height: 26px; padding: 0 8px; border-radius: 5px;
  border: 1px solid var(--stroke-neutral-light); background: transparent;
  font-size: 12px; color: var(--text-secondary); cursor: pointer;
}
.td-sec-filter:hover { background: var(--bg-neutral-hover); }
.td-sec-btn {
  display: flex; align-items: center; gap: 6px; width: 100%;
  height: 28px; padding: 0; border: none; background: transparent;
  cursor: pointer; font-size: 13px; color: var(--text-brand);
  transition: opacity .12s; margin-top: 8px;
}
.td-section--empty .td-sec-btn { margin-top: 0; }
.td-sec-btn:hover { opacity: 0.7; }
.td-sec-btn .ti { font-size: 14px; }

/* ── Upload zone ── */
.td-upload-zone {
  border: 1.5px dashed var(--stroke-neutral); border-radius: 8px;
  padding: 10px 16px; display: flex; flex-direction: column; gap: 4px;
}
.td-upload-hint { font-size: 12px; color: var(--text-secondary); }
.td-upload-hint kbd {
  display: inline-flex; align-items: center; padding: 1px 5px; border-radius: 4px;
  border: 1px solid var(--stroke-neutral); background: var(--bg-neutral-light);
  font-size: 11px; font-family: inherit;
}
.td-upload-drop {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--text-secondary);
}
.td-upload-drop .ti { font-size: 18px; color: var(--icon-neutral); }

/* ── Sub-tasks ── */
.td-suggest-btn {
  display: inline-flex; align-items: center; gap: 4px;
  height: 26px; padding: 0 8px 0 0; border-radius: 5px; cursor: pointer;
  font-size: 12px; border: none; background: transparent;
  margin-left: 4px;
  opacity: 0; transition: opacity .15s;
}
.td-suggest-btn span {
  background: linear-gradient(98deg, #1482ff 8.87%, #cf11ff 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.td-suggest-btn .ti { font-size: 13px; color: #1482ff; }
.td-sub-tools { display: flex; align-items: center; gap: 12px; margin-left: auto; opacity: 0; transition: opacity .15s; }
.td-sub-tools .td-tb-icon { width: 20px; height: 20px; border-radius: 4px; }
.td-sub-tools .td-tb-icon .ti { font-size: 16px; }
.td-section:hover .td-suggest-btn,
.td-section:hover .td-sub-tools { opacity: 1; }
.td-suggest-btn:hover { opacity: 0.65; }
.td-cl-circle {
  width: 16px; height: 16px; border-radius: 4px;
  border: 1.5px solid var(--stroke-neutral); display: flex; align-items: center; justify-content: center;
  background: transparent; flex-shrink: 0;
}
.td-cl-circle.done { background: #16a34a; border-color: #16a34a; }
.td-cl-circle.done .ti { font-size: 10px; color: #fff; }
.td-sub-row {
  display: flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 4px;
  border-bottom: 1px dotted var(--stroke-neutral);
  transition: background .1s;
}
.td-sub-row:last-child { border-bottom: none; }
.td-sub-row:hover { background: var(--bg-neutral-hover); }
.td-sub-check { border: none; background: transparent; cursor: pointer; padding: 0; flex-shrink: 0; }
.td-sub-circle {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1.5px solid var(--stroke-neutral); display: flex; align-items: center; justify-content: center;
  transition: border-color .12s, background .12s;
}
.td-section--empty { padding-top: 4px; padding-bottom: 4px; }
.td-sub-circle.done { background: #16a34a; border-color: #16a34a; }
.td-sub-circle.done .ti { font-size: 11px; color: #fff; }
.td-sub-name { flex: 1; font-size: 13px; color: var(--text-primary); }
.td-sub-name.done { text-decoration: line-through; color: var(--text-primary); }
.td-sub-name--input {
  border: none; background: transparent; outline: none;
  font-family: inherit; padding: 0; min-width: 0;
}
.td-sub-name--input::placeholder { color: var(--text-hint); }
.td-sub-end { display: flex; align-items: center; gap: 12px; margin-left: auto; flex-shrink: 0; }
.td-sub-end .ti { font-size: 16px; color: var(--icon-neutral); }
.td-sub-group { display: flex; align-items: center; gap: 4px; }
.td-sub-group--click { cursor: pointer; border-radius: 20px; padding: 2px 6px; margin: 0 -6px; transition: background .1s; }
.td-sub-group--click:hover { background: var(--bg-neutral-hover); }
.td-sub-av { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.td-sub-person-name { font-size: 12px; color: var(--text-primary); white-space: nowrap; }
.td-sub-date { font-size: 12px; color: var(--text-primary); white-space: nowrap; }
.td-empty-circle {
  width: 20px; height: 20px; border-radius: 50%;
  border: 1.5px dashed var(--stroke-neutral);
  background: transparent; cursor: pointer; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  transition: border-color .12s;
}
.td-empty-circle:hover { border-color: var(--stroke-brand); }
.td-empty-circle .ti { font-size: 12px; color: var(--icon-neutral); }
.td-filled-circle {
  width: 20px; height: 20px; border-radius: 50%;
  border: 1.5px solid var(--stroke-neutral);
  background: transparent; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
}
.td-filled-circle .ti { font-size: 12px; color: var(--icon-neutral); }
/* ── Checklist progress ── */
.td-checklist { display: flex; flex-direction: column; }
.td-checklist + .td-checklist { margin-top: 8px; }
.td-cl-row:last-of-type { border-bottom: none; }
.td-cl-num { font-size: 13px; color: var(--text-secondary); flex-shrink: 0; min-width: 20px; }
.td-cl-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 13px; color: var(--text-primary); font-family: inherit;
  padding: 0; min-width: 0;
}
.td-cl-input::placeholder { color: var(--text-hint); }
.td-cl-input.done { text-decoration: line-through; }
.td-cl-del {
  opacity: 0; flex-shrink: 0;
  width: 24px; height: 24px; border: none; background: transparent;
  border-radius: 4px; cursor: pointer; color: var(--icon-neutral);
  display: flex; align-items: center; justify-content: center;
  transition: opacity .12s, background .1s;
}
.td-cl-del .ti { font-size: 14px; }
.td-sub-row:hover .td-cl-del { opacity: 1; }
.td-cl-del:hover { background: var(--bg-neutral-hover); color: var(--text-danger); }
.td-cl-count {
  font-size: 11px; color: var(--text-secondary); font-weight: var(--fw-semibold); flex-shrink: 0;
  background: var(--bg-neutral-light); border-radius: 8px; padding: 2px 6px;
}

/* ── Tags ── */
.td-tags-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
.td-tag {
  display: inline-flex; align-items: center;
  height: 24px; padding: 0 8px; border-radius: 6px;
  border: 1px solid; font-size: 12px; font-weight: var(--fw-medium);
  white-space: nowrap; cursor: default;
}
.td-tag-add {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 6px;
  border: 1px dashed var(--stroke-neutral); background: transparent;
  color: var(--text-secondary); cursor: pointer;
  transition: border-color .1s, color .1s;
}
.td-tag-add:hover { border-color: var(--stroke-brand); color: var(--text-brand); }
.td-tag-add .ti { font-size: 12px; }

/* ── Right sidebar ── */
.td-side {
  width: 240px; flex-shrink: 0;
  display: flex; flex-direction: column;
  border-left: 1px solid var(--stroke-neutral-light);
  background: var(--bg-white);
  overflow-y: auto;
}
.td-side-list { display: flex; flex-direction: column; padding: 8px 0; }
.td-side-item {
  display: flex; align-items: center; gap: 10px;
  height: 38px; padding: 0 16px; border: none; background: transparent;
  font-size: 13px; color: var(--text-primary); cursor: pointer; text-align: left;
  transition: background .1s;
}
.td-side-item:hover { background: var(--bg-neutral-hover); }
.td-side-item .ti { font-size: 16px; color: var(--icon-neutral); flex-shrink: 0; }
.td-side-sep { height: 1px; background: var(--stroke-neutral-light); margin: 4px 0; }
.td-addon-btn {
  display: flex; align-items: center; gap: 10px;
  width: 100%; height: 38px; padding: 0 16px; border: none; background: transparent;
  font-size: 13px; color: var(--text-brand); cursor: pointer; text-align: left;
  transition: background .1s;
}
.td-addon-btn:hover { background: var(--bg-brand-light); }
.td-addon-btn .ti { font-size: 16px; color: var(--text-brand); }

/* ── Activity ── */
.td-activity { padding: 8px 0; }
.td-act-hd {
  display: flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 16px; cursor: pointer;
  font-size: 13px; font-weight: var(--fw-semibold); color: var(--text-primary);
  transition: background .1s;
}
.td-act-hd:hover { background: var(--bg-neutral-hover); }
.td-act-hd .ti { font-size: 15px; color: var(--icon-neutral); }
.td-act-hd .ti:last-child { margin-left: auto; font-size: 13px; }
.td-act-body { padding: 4px 0 8px; }
.td-act-group { margin-bottom: 12px; }
.td-act-group + .td-act-group { padding-top: 8px; }
.td-act-group-hd {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 16px 8px;
  font-size: 11px; font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.td-act-row {
  display: flex; flex-direction: column; gap: 3px;
  padding: 6px 16px;
}
.td-act-lbl {
  font-size: 13px; color: var(--text-secondary); line-height: 1.4;
}
.td-act-val {
  display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px;
}
.td-act-val strong { font-size: 13px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.td-act-role { font-size: 12px; color: var(--text-secondary); }
.td-act-date { font-size: 12px; color: var(--text-secondary); }
.td-act-more-btn {
  display: block; width: 100%; padding: 2px 16px 8px;
  border: none; background: transparent; text-align: left;
  font-size: 13px; color: var(--text-brand); cursor: pointer;
}
.td-act-more-btn:hover { text-decoration: underline; }
.td-side-collapse-btn {
  position: sticky; bottom: 8px; margin: auto 8px 8px auto;
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid var(--stroke-neutral-light); background: var(--bg-white);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--icon-neutral);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.td-side-collapse-btn:hover { background: var(--bg-neutral-hover); }
.td-side-collapse-btn .ti { font-size: 13px; }

/* ── Tabs: Bình luận / Hoạt động ── */
.td-tabs { margin-top: 12px; flex-shrink: 0; }
.td-tabs-bar {
  display: flex; border-bottom: 1px solid var(--stroke-neutral-light);
  padding: 0 20px;
}
.td-tab-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 40px; padding: 0 4px; margin-right: 20px;
  border: none; background: transparent; cursor: pointer;
  font-size: 13px; color: var(--text-secondary);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color .12s, border-color .12s;
}
.td-tab-btn:hover { color: var(--text-primary); }
.td-tab-btn.active { color: var(--text-brand); border-bottom-color: var(--color-brand); font-weight: var(--fw-semibold); }
.td-tab-btn .ti { font-size: 15px; }
.td-tab-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--bg-neutral-light); border-radius: 9px;
  font-size: 11px; font-weight: var(--fw-semibold); color: var(--text-secondary);
}
.td-tab-btn.active .td-tab-count { background: var(--bg-brand-light); color: var(--text-brand); }
.td-tab-pane { padding: 12px 20px 20px; }
.td-empty-hint { font-size: 13px; color: var(--text-secondary); padding: 8px 0; }

/* Comments */
.td-cmt-row { display: flex; gap: 10px; padding: 10px 0; border-top: 1px solid var(--stroke-neutral-light); }
.td-cmt-row:first-of-type { border-top: none; }
.td-cmt-av { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.td-cmt-av-fb {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: var(--fw-semibold); color: #fff;
}
.td-cmt-body { flex: 1; min-width: 0; }
.td-cmt-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.td-cmt-meta strong { font-size: 13px; color: var(--text-primary); }
.td-cmt-time { font-size: 11px; color: var(--text-secondary); }
.td-cmt-text { font-size: 13px; color: var(--text-primary); line-height: 1.5; }

/* Comment input */
.td-cmt-input-wrap {
  display: flex; gap: 10px; align-items: center;
  padding: 12px 0 0; margin-top: 4px;
  border-top: 1px solid var(--stroke-neutral-light);
}
.td-cmt-input-box {
  flex: 1; display: flex; align-items: center; gap: 6px;
  border: 1px solid var(--stroke-neutral-light); border-radius: 8px;
  padding: 0 10px; background: var(--bg-neutral-light);
  transition: border-color .12s;
}
.td-cmt-input-box:focus-within { border-color: var(--stroke-brand); background: var(--bg-white); }
.td-cmt-input {
  flex: 1; height: 36px; border: none; background: transparent; outline: none;
  font-size: 13px; color: var(--text-primary);
}
.td-cmt-input::placeholder { color: var(--text-hint); }
.td-cmt-send {
  border: none; background: transparent; cursor: pointer;
  color: var(--text-brand); padding: 0; display: flex;
}
.td-cmt-send:hover { opacity: 0.7; }
.td-cmt-send .ti { font-size: 16px; }

/* Activity log */
.td-log-row { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--stroke-neutral-light); align-items: flex-start; }
.td-log-row:last-child { border-bottom: none; }
.td-log-av { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0; margin-top: 2px; }
.td-log-av-fb {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; margin-top: 2px;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: var(--fw-semibold); color: #fff;
}
.td-log-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.td-log-name { font-size: 13px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.td-log-action { font-size: 13px; color: var(--text-secondary); }
.td-log-time { font-size: 11px; color: var(--text-secondary); }

.td-field-val-row { display: flex; align-items: baseline; gap: 4px; }
.td-field-val--overdue { color: #ef4444 !important; }
.td-field-remaining { font-size: 12px; color: var(--text-primary) !important; white-space: nowrap; font-weight: 400 !important; }

/* ── td-field history icon ── */
.td-field-hist {
  flex-shrink: 0;
  width: 0; overflow: hidden;
  height: 24px; border-radius: 6px; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  color: var(--icon-neutral); opacity: 0; transition: width .15s, opacity .12s, background .1s;
}
.td-field-box--filled:hover .td-field-hist { width: 24px; opacity: 1; }
.td-field-hist:hover { background: var(--bg-neutral-hover); }
.td-field-hist .ti { font-size: 14px; flex-shrink: 0; }

/* ── td-fields dropdowns ── */
.td-assignee-dd {
  background: var(--bg-white); border: 1px solid var(--stroke-neutral-light);
  border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,.1);
  width: 220px; overflow: hidden;
}
.td-dd-search {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; border-bottom: 1px solid var(--stroke-neutral-light);
}
.td-dd-search-ico .ti { font-size: 14px; color: var(--icon-neutral); }
.td-dd-search-inp {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 13px; color: var(--text-primary);
}
.td-dd-search-inp::placeholder { color: var(--text-hint); }
.td-dd-list { padding: 4px 0; max-height: 220px; overflow-y: auto; }
.td-dd-person {
  display: flex; align-items: center; gap: 8px;
  width: 100%; height: 36px; padding: 0 10px;
  border: none; background: transparent; cursor: pointer; text-align: left;
  transition: background .1s;
}
.td-dd-person:hover { background: var(--bg-neutral-hover); }
.td-dd-person--sel { background: var(--bg-brand-light); }
.td-dd-av { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.td-dd-name { flex: 1; font-size: 13px; color: var(--text-primary); }
.td-dd-check .ti { font-size: 14px; color: var(--text-brand); }
.td-dd-empty { padding: 10px; font-size: 13px; color: var(--text-secondary); text-align: center; }

/* ── td calendar picker ── */
.td-cal {
  background: var(--bg-white); border: 1px solid var(--stroke-neutral-light);
  border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,.1);
  width: 260px; padding: 10px;
}
.td-cal-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.td-cal-nav {
  width: 28px; height: 28px; border: none; background: transparent; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  color: var(--icon-neutral); transition: background .1s;
}
.td-cal-nav:hover { background: var(--bg-neutral-hover); }
.td-cal-nav .ti { font-size: 14px; }
.td-cal-title { font-size: 13px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.td-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.td-cal-dow { font-size: 11px; color: var(--text-secondary); text-align: center; padding: 2px 0 4px; }
.td-cal-day {
  aspect-ratio: 1; border: none; background: transparent; border-radius: 6px;
  font-size: 12px; color: var(--text-primary); cursor: pointer; transition: background .1s;
}
.td-cal-day:hover { background: var(--bg-neutral-hover); }
.td-cal-day--other { color: var(--text-hint); }
.td-cal-day--today { font-weight: var(--fw-semibold); color: var(--text-brand); }
.td-cal-day--sel { background: var(--bg-brand); color: #fff !important; font-weight: var(--fw-semibold); }
.td-cal-ft { padding-top: 8px; border-top: 1px solid var(--stroke-neutral-light); margin-top: 4px; text-align: right; }
.td-cal-clear {
  border: none; background: transparent; font-size: 12px; color: var(--text-secondary);
  cursor: pointer; padding: 2px 4px; border-radius: 4px; transition: color .1s;
}
.td-cal-clear:hover { color: var(--text-danger); }
</style>
