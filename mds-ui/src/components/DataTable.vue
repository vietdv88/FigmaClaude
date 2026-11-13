<template>
  <div class="datatable" ref="tableRef" :class="{ 'datatable--editable': editable, 'datatable--paged': pagination, 'datatable--no-vlines': !columnLines || summary, 'datatable--vlines-solid': columnLineStyle === 'solid' && columnLines && !summary, 'datatable--grouped': !!headerGroups, 'datatable--summary': summary, 'datatable--clickable': summary && rowClickable }">
    <div v-if="hoveredCol" class="col-hover-line" :style="{ left: hoverLineLeft + 'px' }" />

    <!-- Header NHÓM (gộp ô): cột khai báo `group` → các cột LIỀN NHAU cùng nhóm gộp thành 1 ô nhãn nhóm phía trên (VD Bảng lương: Lương chuẩn · Phụ cấp · Làm thêm).
         Cột không thuộc nhóm nào: ô tiêu đề cao 2 hàng (gộp dọc), nhãn căn giữa. Nên dùng cùng columnLineStyle="solid" -->
    <div v-if="headerGroups" class="dt-row dt-row--header-group" :style="{ minWidth: totalRowMinWidth + 'px' }" role="row">
      <div v-for="g in headerGroups" :key="g.key" class="dt-cell dt-cell--group" :class="{ 'dt-cell--group-empty': !g.label }" :style="g.style" role="columnheader">
        <span v-if="g.label" class="dt-cell-inner dt-cell-inner--group" v-tip="g.label">{{ g.label }}</span>
      </div>
    </div>
    <!-- Header row -->
    <div class="dt-row dt-row--header" :class="{ 'dt-row--header-grouped': headerGroups }" :style="{ minWidth: totalRowMinWidth + 'px' }">
      <div
        v-for="col in visibleCols" :key="col.key"
        class="dt-cell dt-cell--header"
        :class="{
          'dt-cell--sorted': sortState[col.key],
          'dt-cell--filtered': isColFiltered(col),
          'dt-cell--accent': col.accent,
          'dt-cell--header-tall': headerGroups && !col.group,
        }"
        :style="col.accent ? { ...cellStyle(col), '--dt-accent': col.accent } : cellStyle(col)"
        @mouseenter="hoveredHeaderKey = col.key"
        @mouseleave="hoveredHeaderKey = null"
        @click="openHeaderMenu(col, $event)"
      >
        <!-- Checkbox column header: SelectAll checkbox, no menu, no filter -->
        <template v-if="col.type === 'checkbox'">
          <div class="dt-cell-inner" style="justify-content:center;padding:0" @click.stop>
            <AppCheckbox :model-value="isAllSelected" @update:model-value="toggleSelectAll" />
          </div>
        </template>
        <!-- Normal column header -->
        <template v-else>
          <div class="dt-cell-inner dt-cell-inner--header">
            <!-- col.accent (màu CSS): chấm màu trước tên — đánh dấu nhóm cột (VD cột của BA / của PD) · col.accentTip: tooltip khi di lên chấm -->
            <span v-if="col.accent" class="dt-accent-dot" :aria-label="col.accentTip || undefined" v-tip="col.accentTip"><span class="dt-accent-dot__in" /></span>
            <span class="dt-header-text" :class="{ 'dt-header-text--abbr': col.tip || abbrTip(col.label) }" v-tip="col.tip || abbrTip(col.label)">{{ col.label }}</span>
            <!-- Sort indicator -->
            <TIcon v-if="sortState[col.key] === 'asc'"  name="arrow-up"   class="dt-sort-icon" />
            <TIcon v-if="sortState[col.key] === 'desc'" name="arrow-down" class="dt-sort-icon" />
            <!-- Active filter dot -->
            <span v-if="isColFiltered(col)" class="dt-filter-dot" />
          </div>
          <!-- Filter icon: hiện khi hover hoặc đang có filter -->
          <button
            v-if="canFilter(col)"
            class="dt-filter-btn"
            :class="{
              'dt-filter-btn--visible': hoveredHeaderKey === col.key || isColFiltered(col),
              'dt-filter-btn--active': isColFiltered(col),
            }"
            aria-label="Lọc cột" v-tip="'Lọc cột'"
            @click.stop="openFilter(col, $event)"
          >
            <TIcon name="filter" />
          </button>
        </template>
        <div class="dt-col-divider"
          @click.stop
          @dblclick.stop="resetWidth(col)"
          @mousedown.prevent="startResize($event, col)"
          @mouseenter="onDividerEnter($event)"
          @mouseleave="onDividerLeave"
        />
      </div>
      <!-- Placeholder to match dt-cell--actions in data rows so :not(:last-child) border works consistently -->
      <div v-if="rowActions.length && actionMode === 'hover'" class="dt-cell dt-cell--header dt-cell--actions-ph" />
      <!-- Cột thao tác ghim cuối bảng (action-mode icons | link) — Figma ReadOnly Column Table · Type=Icons / Link Action Icon -->
      <div v-if="pinnedActions" class="dt-cell dt-cell--header dt-cell--pinact" :class="{ 'dt-cell--pinact-edit': editActs }" :style="{ width: pinActWidth + 'px' }" :aria-label="editActs ? actionsLabel || 'Thao tác' : undefined">
        <div v-if="!editActs" class="dt-cell-inner dt-cell-inner--header"><span class="dt-header-label">{{ actionsLabel }}</span></div>
      </div>
    </div>

    <!-- ── Column header context menu ── -->
    <Teleport to="body">
      <div v-if="headerMenu" class="dt-header-overlay" @click="closeHeaderMenu" />
      <div v-if="headerMenu" class="dt-header-menu"
        :style="{ top: headerMenu.y + 'px', left: headerMenu.x + 'px' }"
        @click.stop
      >
        <!-- Group 1: Sort -->
        <div class="dt-header-menu__group">
          <button class="dt-header-menu__item"
            :class="{ active: !sortState[headerMenu.col.key] }"
            @click="setSort(headerMenu.col, null)">
            <TIcon name="circle-off" /><span>Không sắp xếp</span>
            <TIcon v-if="!sortState[headerMenu.col.key]" name="check" class="dt-menu-check" />
          </button>
          <button class="dt-header-menu__item"
            :class="{ active: sortState[headerMenu.col.key] === 'asc' }"
            @click="setSort(headerMenu.col, 'asc')">
            <TIcon name="arrow-up" /><span>Tăng dần</span>
            <TIcon v-if="sortState[headerMenu.col.key] === 'asc'" name="check" class="dt-menu-check" />
          </button>
          <button class="dt-header-menu__item"
            :class="{ active: sortState[headerMenu.col.key] === 'desc' }"
            @click="setSort(headerMenu.col, 'desc')">
            <TIcon name="arrow-down" /><span>Giảm dần</span>
            <TIcon v-if="sortState[headerMenu.col.key] === 'desc'" name="check" class="dt-menu-check" />
          </button>
          <button v-if="!summary" class="dt-header-menu__item"
            :class="{ active: pinnedCols.has(headerMenu.col.key) }"
            @click="togglePin(headerMenu.col)">
            <TIcon :name="pinnedCols.has(headerMenu.col.key) ? 'pinned' : 'pinned'" /><span>Ghim cột</span>
            <TIcon v-if="pinnedCols.has(headerMenu.col.key)" name="check" class="dt-menu-check" />
          </button>
        </div>
        <!-- Group 2: Position (bảng tóm tắt summary: chỉ có nhóm Sắp xếp) -->
        <div v-if="!summary" class="dt-header-menu__group">
          <button v-if="pinnedCols.has(headerMenu.col.key)" class="dt-header-menu__item"
            @click="togglePin(headerMenu.col)">
            <TIcon name="pinned-off" /><span>Bỏ ghim cột</span>
          </button>
          <button class="dt-header-menu__item" @click="moveCol(headerMenu.col, 'first')">
            <TIcon name="table-column" /><span>Đặt làm cột đầu tiên</span>
          </button>
          <button class="dt-header-menu__item" @click="moveCol(headerMenu.col, 'last')">
            <TIcon name="column-insert-right" /><span>Đặt làm cột cuối cùng</span>
          </button>
        </div>
        <!-- Group 3: Manage -->
        <div v-if="!summary" class="dt-header-menu__group">
          <button class="dt-header-menu__item" @click="insertCol(headerMenu.col, 'left')">
            <TIcon name="column-insert-left" /><span>Thêm cột bên trái</span>
          </button>
          <button class="dt-header-menu__item" @click="insertCol(headerMenu.col, 'right')">
            <TIcon name="column-insert-right" /><span>Thêm cột bên phải</span>
          </button>
          <button v-if="!headerMenu.col.locked" class="dt-header-menu__item dt-header-menu__item--danger" @click="hideCol(headerMenu.col)">   <!-- cột bắt buộc hiển thị (locked) không có “Ẩn cột” -->
            <TIcon name="column-remove" /><span>Ẩn cột</span>
          </button>
        </div>
        <!-- Group 4: Wrap -->
        <div v-if="!summary" class="dt-header-menu__group">
          <button class="dt-header-menu__item"
            :class="{ active: !isWrap(headerMenu.col) }"
            @click="setWrap(headerMenu.col, false)">
            <TIcon name="text-wrap-disabled" /><span>Hiển thị 1 dòng</span>
            <TIcon v-if="!isWrap(headerMenu.col)" name="check" class="dt-menu-check" />
          </button>
          <button class="dt-header-menu__item"
            :class="{ active: isWrap(headerMenu.col) }"
            @click="setWrap(headerMenu.col, true)">
            <TIcon name="text-wrap" /><span>Hiển thị nhiều dòng</span>
            <TIcon v-if="isWrap(headerMenu.col)" name="check" class="dt-menu-check" />
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ── Column filter popover ── -->
    <Teleport to="body">
      <div v-if="filterPopover" class="dt-header-overlay" @click="closeFilter" />
      <div v-if="filterPopover" class="dt-filter-popover"
        :style="{ top: filterPopover.y + 'px', left: filterPopover.x + 'px' }"
        @click.stop @keydown.esc="closeFilter"
      >
        <!-- Form lọc theo quy chuẩn form chung: AppInput (nhãn trên, Semibold, màu chữ chính, cách ô 4px, các trường cách 16px) + control của mds-ui (không dùng <select> của trình duyệt) -->
        <!-- Liên thông bộ lọc Advance (prop filter + filterFields): cùng toán tử / ô nhập với panel bên phải, Áp dụng = ghi vào CHÍNH bộ lọc chung → panel tự tick trường này -->
        <div v-if="filter" class="dt-filter-popover__fields">
          <span class="dt-filter-popover__label">{{ filterPopover.field.label }}</span>
          <FilterConditionEditor :field="filterPopover.field" v-model="linkDraft" @enter="applyFilter" />
        </div>
        <div v-else class="form-fields dt-filter-popover__fields">
          <AppInput label="Điều kiện lọc">
            <AppCombobox v-model="filterDraft.condition" :options="FILTER_OPTIONS" required :clearable="false" />
          </AppInput>
          <AppInput v-if="filterDraft.condition !== 'empty' && filterDraft.condition !== 'not-empty'" label="Giá trị">
            <AppTextbox v-model="filterDraft.value" placeholder="Nhập giá trị" @keydown.enter.prevent="applyFilter" />
          </AppInput>
        </div>
        <div class="dt-filter-popover__footer">
          <button v-if="filter && isColFiltered(filterPopover.col)" class="btn btn--text-neutral dt-filter-popover__clear" @click="clearColFilter">Bỏ lọc</button>
          <button class="btn btn--outline btn--neutral" @click="closeFilter">Hủy</button>
          <button class="btn btn--primary" @click="applyFilter">Áp dụng</button>
        </div>
      </div>
    </Teleport>

    <!-- Data rows (groupBy → chèn dòng tiêu đề nhóm, bấm để thu gọn / mở) -->
    <template v-for="item in displayItems" :key="item.key">
      <div v-if="item.group !== undefined" class="dt-row dt-row--group" :class="{ 'dt-row--group-collapsed': item.collapsed }"
        :style="{ minWidth: totalRowMinWidth + 'px' }" role="button" :aria-expanded="!item.collapsed" @click="toggleGroup(item.group)">
        <span class="dt-group">
          <TIcon :name="item.collapsed ? 'chevron-right' : 'chevron-down'" class="dt-group__chev" />
          <TIcon name="folder" class="dt-group__icon" />
          <span class="dt-group__label">{{ item.label }}</span>
          <span class="dt-group__count">{{ item.count }}</span>
        </span>
      </div>
      <template v-else v-for="[row, i] in [[item.row, item.i]]" :key="item.key">
      <div
        v-if="!isRowHidden(row)"
        class="dt-row dt-row--body"
        :class="[{ 'dt-row--selected': isSelected(row, i) }, rowLineClass, row._mark ? `dt-row--mark-${row._mark}` : '']"
        :style="{ minWidth: totalRowMinWidth + 'px' }"
        @click="$emit('row-click', row)"
      >
        <div
          v-for="col in visibleCols" :key="col.key"
          class="dt-cell"
          :class="{ 'dt-cell--wrap': isWrap(col), 'dt-cell--link': col.link }"
          :style="cellStyle(col)"
          :data-type="col.type"
        >
          <div class="dt-cell-inner" :class="alignClass(col)">

            <!-- Checkbox -->
            <template v-if="col.type === 'checkbox'">
              <div style="display:flex;align-items:center;justify-content:center;width:100%;padding:0" @click.stop>
                <!-- row._noSelect: dòng không cho chọn (VD dòng lỗi trong bảng xem trước nhập khẩu) — ô tick mờ, “chọn tất cả” bỏ qua -->
                <AppCheckbox
                  :model-value="!row._noSelect && isSelected(row, i)" :disabled="!!row._noSelect"
                  @update:model-value="toggleSelect(row, i)"
                />
              </div>
            </template>

            <!-- Radio -->
            <template v-else-if="col.type === 'radio'">
              <input type="radio" class="dt-radio"
                :checked="isSelected(row, i)"
                @change.stop="$emit('update:selected', [getRowId(row, i)])"
                @click.stop />
            </template>

            <!-- Toggle switch -->
            <template v-else-if="col.type === 'toggle'">
              <div class="dt-toggle" :class="{ active: !!cellVal(row, col) }"
                @click.stop="$emit('cell-update', { row, col, value: !cellVal(row, col) })">
                <div class="dt-toggle-thumb" />
              </div>
            </template>

            <!-- Status badge -->
            <template v-else-if="col.type === 'status'">
              <template v-if="cellVal(row, col)">
                <!-- { label, color, tip? } — tip: rê chuột lên nhãn để xem chi tiết (có biểu tượng ⓘ) -->
                <span class="dt-status-badge"
                  :class="[`dt-status-badge--${cellVal(row, col).color || 'neutral'}`, { 'dt-status-badge--tip': cellVal(row, col).tip }]"
                  v-tip="cellVal(row, col).tip || ''">
                  {{ cellVal(row, col).label ?? cellVal(row, col) }}<TIcon v-if="cellVal(row, col).tip" name="info-circle" class="dt-status-badge__info" />
                </span>
              </template>
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Tag / chip — renders AppTag, accepts string | {label,color} | [{label,color}] -->
            <template v-else-if="col.type === 'tag'">
              <template v-if="cellVal(row, col)">
                <!-- Nhiều tag: hiện tối đa col.maxTags (mặc định 3), còn lại gộp “+n” (hover xem tên); cột “nhiều dòng” → hiện đủ -->
                <div v-if="Array.isArray(cellVal(row, col))" class="dt-tag-group" :class="{ 'dt-tag-group--wrap': isWrap(col) }">
                  <AppTag
                    v-for="(t, ti) in shownTags(col, cellVal(row, col))" :key="ti"
                    :label="t.label ?? String(t)"
                    :color="t.color || 'neutral'"
                    v-tip="t.label ?? String(t)"
                  />
                  <AppTag v-if="moreTags(col, cellVal(row, col)).length" class="dt-tag-more"
                    :label="'+' + moreTags(col, cellVal(row, col)).length" color="neutral"
                    v-tip="moreTags(col, cellVal(row, col)).map(t => t.label ?? String(t)).join(', ')" />
                </div>
                <AppTag v-else
                  :label="cellVal(row, col).label ?? String(cellVal(row, col))"
                  :color="cellVal(row, col).color || 'neutral'"
                />
              </template>
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Trend Up — value text + Tag Small success badge (Figma: arrow-up icon + %)
                 data: { value, pct } | fallback: plain value -->
            <template v-else-if="col.type === 'trend-up'">
              <template v-if="cellVal(row, col) != null">
                <span class="dt-text">{{ cellVal(row, col)?.value ?? cellVal(row, col) }}</span>
                <span v-if="cellVal(row, col)?.pct != null" class="dt-trend-badge dt-trend-badge--up">
                  <TIcon name="trending-up" />{{ cellVal(row, col).pct }}%
                </span>
              </template>
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Trend Down — value text + Tag Small danger badge (Figma: arrow-down icon + %)
                 data: { value, pct } | fallback: plain value -->
            <template v-else-if="col.type === 'trend-down'">
              <template v-if="cellVal(row, col) != null">
                <span class="dt-text">{{ cellVal(row, col)?.value ?? cellVal(row, col) }}</span>
                <span v-if="cellVal(row, col)?.pct != null" class="dt-trend-badge dt-trend-badge--down">
                  <TIcon name="trending-down" />{{ cellVal(row, col).pct }}%
                </span>
              </template>
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Progress bar -->
            <template v-else-if="col.type === 'progress'">
              <div class="dt-progress">
                <div class="dt-progress-bar"
                  :style="{ width: Math.min(100, Math.max(0, cellVal(row, col) || 0)) + '%' }" />
              </div>
              <span class="dt-progress-label">{{ cellVal(row, col) ?? 0 }}%</span>
            </template>

            <!-- Icon only -->
            <template v-else-if="col.type === 'icon'">
              <TIcon v-if="cellVal(row, col)" :name="cellVal(row, col)" />
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Icon + Text -->
            <template v-else-if="col.type === 'icon-text'">
              <!-- icon (+ iconColor: brand | success | warning | danger | neutral, iconTitle: tooltip) -->
              <span v-if="cellVal(row, col)?.icon" class="dt-icon" :class="cellVal(row, col).iconColor && `dt-icon--${cellVal(row, col).iconColor}`"
                v-tip="cellVal(row, col).iconTitle"><TIcon :name="cellVal(row, col).icon" /></span>
              <span class="dt-text">{{ cellVal(row, col)?.text ?? cellVal(row, col) ?? '–' }}</span>
            </template>

            <!-- Text + Subtext (two-line, 56px row) -->
            <template v-else-if="col.type === 'subtext'">
              <div class="dt-subtext-wrap">
                <span class="dt-text">{{ cellVal(row, col)?.text ?? cellVal(row, col) ?? '–' }}</span>
                <span v-if="cellVal(row, col)?.subtext" class="dt-subtext">{{ cellVal(row, col).subtext }}</span>
              </div>
            </template>

            <!-- Avatar (24px) + Text — Type=Avatar+Text (1-line, density-controlled) -->
            <!-- data: { avatar?: url, text } -->
            <template v-else-if="col.type === 'avatar-text'">
              <template v-if="cellVal(row, col)">
                <div class="dt-avatar" :class="{ 'dt-avatar--initials': !avatarOk(cellVal(row, col).avatar), 'dt-avatar--square': col.avatarSquare }"
                  :style="!avatarOk(cellVal(row, col).avatar) ? { background: avatarColor(cellVal(row, col).text, col.avatarColor).bg, color: avatarColor(cellVal(row, col).text, col.avatarColor).fg } : {}">
                  <img v-if="avatarOk(cellVal(row, col).avatar)" :src="cellVal(row, col).avatar" referrerpolicy="no-referrer" @error="brokenAvatars.add(cellVal(row, col).avatar)" class="dt-avatar__img" :alt="cellVal(row, col).text" />
                  <span v-else class="dt-avatar__initials">{{ avatarInitials(cellVal(row, col).text) }}</span>
                </div>
                <span class="dt-text">{{ cellVal(row, col).text ?? '–' }}</span>
              </template>
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Avatar (40px) + Text + Subtext — Type=Avatar+Text+Subtext (2-line, 56px fixed) -->
            <!-- data: { avatar?: url, text, subtext } -->
            <template v-else-if="col.type === 'avatar-subtext'">
              <template v-if="cellVal(row, col)">
                <div class="dt-avatar dt-avatar--lg" :class="{ 'dt-avatar--initials': !avatarOk(cellVal(row, col).avatar), 'dt-avatar--square': col.avatarSquare }"
                  :style="!avatarOk(cellVal(row, col).avatar) ? { background: avatarColor(cellVal(row, col).text, col.avatarColor).bg, color: avatarColor(cellVal(row, col).text, col.avatarColor).fg } : {}">
                  <img v-if="avatarOk(cellVal(row, col).avatar)" :src="cellVal(row, col).avatar" referrerpolicy="no-referrer" @error="brokenAvatars.add(cellVal(row, col).avatar)" class="dt-avatar__img" :alt="cellVal(row, col).text" />
                  <span v-else class="dt-avatar__initials">{{ avatarInitials(cellVal(row, col).text) }}</span>
                </div>
                <div class="dt-subtext-wrap">
                  <span class="dt-text">{{ cellVal(row, col).text ?? '–' }}</span>
                  <span v-if="cellVal(row, col).subtext" class="dt-subtext">{{ cellVal(row, col).subtext }}</span>
                </div>
              </template>
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Action icons -->
            <template v-else-if="col.type === 'action-icon'">
              <div class="dt-actions">
                <button v-for="action in (col.actions || [])" :key="action.emit ?? action.icon"
                  class="btn-icon btn-icon--sm dt-action-btn" :aria-label="action.title" v-tip="action.title"
                  @click.stop="$emit(action.emit, row)">
                  <TIcon :name="action.icon" />
                </button>
              </div>
            </template>

            <!-- Action text link — 2 text links, gap 16px, right-aligned (Figma: Link Group)
                 data: col.actions = [{ label, emit }] -->
            <template v-else-if="col.type === 'action-text'">
              <div class="dt-link-group">
                <button v-for="act in (col.actions || [])" :key="act.emit ?? act.label"
                  class="dt-action-link"
                  @click.stop="$emit(act.emit, row)">
                  {{ act.label ?? '–' }}
                </button>
              </div>
            </template>

            <!-- Rating — 5 star icons 20px each, gap 4px (Figma: star icons filled/empty)
                 data: 0-5 (number) -->
            <template v-else-if="col.type === 'rating'">
              <div class="dt-rating">
                <TIcon v-for="n in 5" :key="n"
                  name="star"
                  :class="n <= Math.round(cellVal(row, col) || 0) ? 'dt-star--filled' : 'dt-star--empty'" />
              </div>
            </template>

            <!-- Group Avatar — overlapping 24px circles + "+N" overflow (Figma: AvatarGroupHorizontal)
                 data: [{ name, avatar? }] -->
            <template v-else-if="col.type === 'group-avatar'">
              <div v-if="cellVal(row, col)?.length" class="dt-avatar-group">
                <div v-for="(member, idx) in (cellVal(row, col) || []).slice(0, 5)" :key="idx"
                  class="dt-avatar dt-avatar--group" :class="{ 'dt-avatar--initials': !avatarOk(member.avatar) }" v-tip="member.name"
                  :style="!avatarOk(member.avatar) ? { background: avatarColor(member.name, col.avatarColor).bg, color: avatarColor(member.name, col.avatarColor).fg } : {}">
                  <img v-if="avatarOk(member.avatar)" :src="member.avatar" referrerpolicy="no-referrer" @error="brokenAvatars.add(member.avatar)" class="dt-avatar__img" :alt="member.name" />
                  <span v-else class="dt-avatar__initials">{{ avatarInitials(member.name) }}</span>
                </div>
                <div v-if="cellVal(row, col).length > 5" class="dt-avatar dt-avatar--overflow dt-avatar--initials">
                  +{{ cellVal(row, col).length - 5 }}
                </div>
              </div>
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Product Logo — 32px logo + product name text 13px/500 (Figma: 56px 2-line row)
                 data: { logo, name } -->
            <template v-else-if="col.type === 'product-logo'">
              <template v-if="cellVal(row, col)">
                <img v-if="cellVal(row, col).logo" :src="cellVal(row, col).logo"
                  class="dt-product-logo" :alt="cellVal(row, col).name" />
                <span class="dt-text dt-text--medium">{{ cellVal(row, col).name ?? '–' }}</span>
              </template>
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Swap Component — placeholder slot (Figma: dashed blue border slot)
                 Developer dùng col.render(row) để inject custom content khi cần -->
            <template v-else-if="col.type === 'swap-component'">
              <component v-if="col.component" :is="col.component" :row="row" :col="col" />
              <span v-else class="dt-empty">–</span>
            </template>

            <!-- Textbox (editable input) -->
            <template v-else-if="col.type === 'textbox'">
              <!-- Ô sửa trực tiếp = control chuẩn AppTextbox (ghost: viền hiện khi rê dòng / focus) — không tự dựng <input> -->
              <DtCellError v-if="editable" :message="cellError(row, col)" :icon="false">
                <AppTextbox class="dt-ctl" ghost :model-value="cellVal(row, col) == null ? '' : String(cellVal(row, col))" :align="col.align === 'right' ? 'right' : 'left'"
                  @update:model-value="v => { touch(row, col); $emit('cell-update', { row, col, value: v }) }" @focusout="touch(row, col)" @click.stop />
              </DtCellError>
              <span v-else class="dt-text">{{ cellVal(row, col) ?? '–' }}</span>
            </template>

            <!-- Textarea (editable, nhiều dòng — tự giãn theo nội dung, tối đa ~6 dòng rồi cuộn) · không sửa: hiện đủ nhiều dòng -->
            <template v-else-if="col.type === 'textarea'">
              <DtCellError v-if="editable" :message="cellError(row, col)">
                <textarea class="dt-input dt-textarea" rows="2" :class="{ 'dt-input--error': !!cellError(row, col) }"
                  :value="cellVal(row, col)" :aria-invalid="!!cellError(row, col) || undefined"
                  @input.stop="touch(row, col); $emit('cell-update', { row, col, value: $event.target.value })" @blur="touch(row, col)"
                  @click.stop @keydown.stop />
              </DtCellError>
              <span v-else class="dt-text dt-text--multiline">{{ cellVal(row, col) ?? '–' }}</span>
            </template>

            <!-- Numberbox (editable, right-aligned) -->
            <template v-else-if="col.type === 'numberbox'">
              <!-- Ô số sửa trực tiếp = AppNumberbox (ghost, căn phải, không nút tăng giảm) · phát ra chuỗi đã định dạng (50.000) như trước -->
              <DtCellError v-if="editable" :message="cellError(row, col)" :icon="false">
                <AppNumberbox class="dt-ctl" ghost align="right" :stepper="false" :model-value="numOf(cellVal(row, col))"
                  @update:model-value="v => { touch(row, col); $emit('cell-update', { row, col, value: v === '' || v == null ? '' : fmtNum(v) }) }" @focusout="touch(row, col)" @click.stop />
              </DtCellError>
              <span v-else class="dt-text dt-text--right">{{ cellVal(row, col) ?? '–' }}</span>
            </template>

            <!-- Combobox (editable select) -->
            <template v-else-if="col.type === 'combobox'">
              <!-- Combobox của mds-ui (danh sách tự vẽ, gõ để lọc) — KHÔNG dùng <select> của trình duyệt -->
              <DtCellError v-if="editable" :message="cellError(row, col)" :icon="false">
                <AppCombobox class="dt-combobox dt-ctl" ghost :model-value="cellVal(row, col) ?? ''" :options="col.options || []" placeholder="Chọn" :required="!!col.required"
                  @update:model-value="v => { touch(row, col); $emit('cell-update', { row, col, value: v }) }" @click.stop />
              </DtCellError>
              <span v-else class="dt-text">{{ (col.options || []).find(o => (o.value ?? o) === cellVal(row, col))?.label ?? cellVal(row, col) ?? '–' }}</span>
            </template>

            <!-- Default: text (read-only or editable textbox) -->
            <template v-else>
              <span class="dt-text" :class="{ 'dt-text--right': col.align === 'right' }">
                {{ textOf(row, col) }}
              </span>
            </template>

          </div>
        </div>

        <!-- Cột thao tác ghim: Icons = icon chức năng chính + “…” (chức năng phụ) · Link = tên chức năng chính + ⌄ xổ chức năng phụ -->
        <div v-if="pinnedActions" class="dt-cell dt-cell--pinact" :class="{ 'dt-cell--pinact-edit': editActs }" :style="{ width: pinActWidth + 'px' }" @click.stop>
          <div class="dt-pinact">
            <template v-if="mainAction(row)">
              <button v-if="actionMode === 'icons'" type="button" class="icon-swap icon-swap--16 icon-swap--action" :class="{ 'icon-swap--danger': mainAction(row).danger }"
                :aria-label="mainAction(row).title || mainAction(row).label" v-tip="mainAction(row).title || mainAction(row).label" @click="runAction(mainAction(row), row)">
                <TIcon :name="mainAction(row).icon" />
              </button>
              <button v-else type="button" class="dt-pinact__link" @click="runAction(mainAction(row), row)">{{ mainAction(row).label || mainAction(row).title }}</button>
            </template>
            <DropdownMenu v-if="subActions(row).length" :items="subActions(row)" placement="bottom-end" :min-width="160" @select="a => runAction(a, row)">
              <template #trigger="{ toggle }">
                <button v-if="actionMode === 'icons'" type="button" class="icon-swap icon-swap--16 icon-swap--action" aria-label="Thêm thao tác" v-tip="'Thêm thao tác'" @click.stop="toggle"><TIcon name="dots" /></button>
                <button v-else type="button" class="icon-swap icon-swap--16 icon-swap--action icon-swap--link" aria-label="Thao tác khác" v-tip="'Thao tác khác'" @click.stop="toggle"><TIcon name="chevron-down" /></button>
              </template>
            </DropdownMenu>
          </div>
        </div>
        <!-- Sticky action column -->
        <div v-if="rowActions.length && actionMode === 'hover'" class="dt-cell dt-cell--actions">
          <div class="row-actions">
            <button
              v-for="action in hoverIcons(row)" :key="action.emit ?? action.icon"
              class="btn-icon btn-icon--sm btn-icon--outline"
              :class="{ 'btn-icon--danger': action.danger }"
              :aria-label="action.title" v-tip="action.title"
              @click.stop="$emit(action.emit, row)"
            >
              <TIcon :name="action.icon" />
            </button>
            <!-- “…”: thao tác vượt quá 2 nút + thao tác nguy hiểm (Xóa) + more-actions -->
            <DropdownMenu v-if="hoverMore(row).length" :items="hoverMore(row)" placement="bottom-end" :min-width="160" @select="a => runAction(a, row)">
              <template #trigger="{ toggle }">
                <button class="btn-icon btn-icon--sm btn-icon--outline" aria-label="Thêm thao tác" v-tip="'Thêm thao tác'" @click.stop="toggle">
                  <TIcon name="dots" />
                </button>
              </template>
            </DropdownMenu>
          </div>
        </div>
      </div>
      </template>
    </template>

    <!-- Dòng Tổng (show-footer): ít dòng → bám sau dòng cuối; nhiều dòng phải cuộn → ghim đáy vùng cuộn sát Paging · nhãn “Tổng” (footerLabel) tự đặt ở cột đầu tiên đang hiện (bỏ qua cột tick chọn) ·
         các cột số cộng được truyền footerText (tổng trên TOÀN BỘ dữ liệu, không chỉ trang hiện tại) -->
    <!-- Trạng thái trống: không có dòng nào → slot #empty giữa thân bảng; hàng tiêu đề cột VẪN GIỮ (danh sách đã xóa hết / tìm kiếm, lọc không ra) -->
    <div v-if="!rows.length && $slots.empty" class="dt-empty-state" role="status"><slot name="empty" /></div>
    <div v-if="showFooter" class="dt-row dt-row--footer" :style="{ minWidth: totalRowMinWidth + 'px' }">
      <div
        v-for="col in visibleCols" :key="col.key"
        class="dt-cell dt-cell--footer"
        :style="cellStyle(col)"
      >
        <div class="dt-cell-inner" :class="col.key === footerLabelKey ? '' : alignClass(col)">
          <span class="dt-footer-text" :class="{ 'dt-footer-text--label': col.key === footerLabelKey }">{{ col.key === footerLabelKey ? footerLabel : (col.footerText ?? '') }}</span>
        </div>
      </div>
      <div v-if="rowActions.length && actionMode === 'hover'" class="dt-cell dt-cell--footer dt-cell--actions-ph" />
      <div v-if="pinnedActions" class="dt-cell dt-cell--footer dt-cell--pinact" :style="{ width: pinActWidth + 'px' }" />
    </div>

    <!-- Pagination -->
    <AppPagination
      v-if="pagination"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-size-options="pageSizeOptions"
      :sums="sums"
      :sum-vertical="sumVertical"
      :type="pagingType"
      @update:current-page="$emit('update:currentPage', $event)"
      @update:page-size="$emit('update:pageSize', $event)"
    />
  </div>
</template>

<script setup>
import { abbrTip } from '../utils/abbr.js'
import { fmtNum, parseNum } from '../utils/number.js'
import { ref, reactive, computed, watch, nextTick, inject, getCurrentInstance } from 'vue'
import TIcon from './TIcon.vue'
import { avatarInitials, avatarColor } from '../utils/avatar.js'
import { vTip } from '../utils/tooltip.js'
import AppPagination from './AppPagination.vue'
import DropdownMenu from './DropdownMenu.vue'
import AppCheckbox from './AppCheckbox.vue'
import AppTag from './AppTag.vue'
import AppTextbox from './AppTextbox.vue'
import AppNumberbox from './AppNumberbox.vue'
import AppInput from './AppInput.vue'
import AppCombobox from './AppCombobox.vue'
import FilterConditionEditor from './FilterConditionEditor.vue'
import { isComplete, newCondition } from '../utils/advancedFilter.js'
import DtCellError from './DtCellError.vue'

/** Giá trị ô số (số hoặc chuỗi đã định dạng “50.000”) → số cho AppNumberbox */
const numOf = v => (v === '' || v == null ? '' : typeof v === 'number' ? v : (Number.isFinite(parseNum(String(v))) ? parseNum(String(v)) : ''))
const props = defineProps({
  columns:         { type: Array,   default: () => [] },
  /** Liên thông với bộ lọc Advance: { mode, conditions } (v-model:filter) — lọc theo cột trên tiêu đề ghi vào CHÍNH bộ lọc này → TableFilterPanel tự tick trường, TableFilterTags hiện tag; ngược lại lọc ở panel → cột tự hiện đang lọc.
      Cột ↔ trường: col.filterKey ?? col.key khớp field.key trong filterFields; cột không có trường → không có nút lọc. Bỏ trống = lọc cột kiểu cũ (emit column-filter) */
  filter:          { type: Object,  default: null },
  /** Trường lọc (giống TableFilterPanel): [{ key, label, type: 'text' | 'enum' | 'number' | 'date', options?, get(row) }] */
  filterFields:    { type: Array,   default: () => [] },
  rows:            { type: Array,   default: () => [] },
  editable:        { type: Boolean, default: false },
  selected:        { type: Array,   default: () => [] },
  showFooter:      { type: Boolean, default: false },
  footerLabel:     { type: String,  default: 'Tổng' },   // nhãn dòng Tổng — tự đặt ở cột đầu tiên đang hiện
  rowIdKey:        { type: String,  default: 'id' },
  hideBlankRows:   { type: Boolean, default: true },
  /** Gom nhóm: tên trường trong mỗi dòng chứa khóa nhóm ('' = nhóm trống) · groupLabel(key) → tên hiển thị · nhớ nhóm đang đóng theo groupStorageKey */
  groupBy:         { type: String,  default: '' },
  /** Khóa nhớ độ rộng cột (app cung cấp kho lưu qua provide('dtWidthStore')) · trống = tự sinh theo bộ cột */
  persistKey:      { type: String,  default: '' },
  groupLabel:      { type: Function, default: null },
  groupStorageKey: { type: String,  default: '' },
  pagination:      { type: Boolean, default: false },
  pagingType:      { type: String,  default: 'basic' },   // phân trang dựng sẵn: 'basic' | 'advance' (dạng số)
  total:           { type: Number,  default: 0 },
  pageSize:        { type: Number,  default: 10 },
  currentPage:     { type: Number,  default: 1 },
  pageSizeOptions: { type: Array,   default: () => [10, 20, 50, 100] },
  sums:            { type: Array,   default: () => [] },
  sumVertical:     { type: Boolean, default: false },
  rowActions:      { type: Array,   default: () => [] }, // [{icon, title, emit, show?(row) → false = ẩn ở dòng đó}] — hiện tối đa maxRowActions
  maxRowActions:   { type: Number,  default: 2 },   // rê chuột: tối đa 2 thao tác chính, phần còn lại + thao tác danger (Xóa) vào “…”
  moreActions:     { type: Array,   default: () => [] }, // [{id, icon, label, danger?, separator?}]
  /** Cách hiện thao tác dòng: 'hover' (rê chuột hiện nút cuối dòng) · 'icons' (cột ghim cuối: icon chức năng chính + … chức năng phụ)
      · 'link' (cột ghim cuối: tên chức năng chính dạng link + ⌄ xổ chức năng phụ). Chức năng chính = rowActions[0] (cần label cho 'link') */
  actionMode:      { type: String,  default: 'hover' },
  /** Bảng TÓM TẮT chỉ xem (bảng trong card màn Tổng quan, 5–7 dòng + “Xem tất cả”): giữ nguyên style bảng chuẩn; tự tắt vách ngăn cột,
      lọc cột, header ghim; menu cột chỉ còn Sắp xếp (app không nghe @column-sort thì bảng TỰ sắp xếp dòng); vẫn kéo đổi độ rộng cột;
      dòng chỉ có con trỏ tay khi app nghe @row-click */
  summary:         { type: Boolean, default: false },
  /** Kiểu vạch ngăn cột ở THÂN bảng: 'dotted' (nét chấm — mặc định) | 'solid' (nét liền — dùng cho bảng có header gộp ô / bảng nhóm cột như Bảng lương) */
  columnLineStyle: { type: String,  default: 'dotted' },
  columnLines:     { type: Boolean, default: true },   // false = không kẻ vạch ngăn dài giữa các cột ở thân bảng; header còn vạch ngăn ngắn 16px; kéo đổi độ rộng cột vẫn dùng được
  actionsLabel:    { type: String,  default: '' },     // tiêu đề cột thao tác ghim
  actionsWidth:    { type: Number,  default: 0 },      // 0 = tự: icons 76 · link 120
  lineCount:       { type: Number,  default: 1 },
})

const emit = defineEmits([
  'row-click', 'update:selected', 'cell-update',
  'update:currentPage', 'update:pageSize',
  'update:filter', 'column-sort', 'column-filter', 'column-hide', 'column-move', 'column-insert', 'column-wrap',
  'column-resize',   // (col, width | null) — thả chuột sau khi kéo / nhấp đúp vạch chia (null = về mặc định) → app lưu theo người dùng
  'more-action',     // ({ action, row }) — mục trong menu thao tác không có emit riêng
])

const DATA_TYPES    = new Set([
  'text', 'subtext', 'avatar-text', 'avatar-subtext',
  'icon-text', 'icon', 'status', 'tag',
  'trend-up', 'trend-down', 'progress',
  'rating', 'group-avatar', 'product-logo', 'swap-component',
  'checkbox', 'radio', 'toggle',
  'action-icon', 'action-text',
  'textbox', 'textarea', 'numberbox', 'combobox',
])
const TWO_LINE_TYPES = new Set(['subtext', 'avatar-subtext', 'product-logo'])

const ACTION_WIDTH = 140

/* ── Pin / Hide state — declared before visibleCols computed ── */
const pinnedCols         = ref(new Set(props.columns.filter(c => c.pinned).map(c => c.key)))   // cột có pinned: true → ghim sẵn (người dùng vẫn bỏ ghim được ở menu cột)
/* App đổi pinned trên cột (VD Thiết lập bảng) → nhận lại trạng thái ghim */
watch(() => props.columns.map(c => (c.pinned ? c.key : '')).join('|'), () => { pinnedCols.value = new Set(props.columns.filter(c => c.pinned).map(c => c.key)) })
const internalHiddenCols = ref(new Set())

const visibleCols   = computed(() => {
  const cols = props.columns.filter(c => !c.hidden && !internalHiddenCols.value.has(c.key))
  // Thứ tự: cột tick chọn → cột ghim (giữ thứ tự gốc) → các cột còn lại
  const isSel    = c => c.type === 'checkbox' || c.type === 'radio'
  const sel      = cols.filter(isSel)
  const pinned   = cols.filter(c => !isSel(c) && pinnedCols.value.has(c.key))
  const unpinned = cols.filter(c => !isSel(c) && !pinnedCols.value.has(c.key))
  return [...sel, ...pinned, ...unpinned]
})
/* Ghim cột = DÍNH bên trái khi kéo ngang (position: sticky): cột tick chọn + các cột ghim, cộng dồn bề rộng làm `left`.
   Chỉ bật khi có ít nhất 1 cột ghim (bảng không ghim giữ nguyên như cũ) · cột ghim cuối có bóng ngăn với phần trôi */
const stickyLeft = computed(() => {
  const m = {}
  if (!visibleCols.value.some(c => pinnedCols.value.has(c.key))) return m
  let x = 0
  for (const c of visibleCols.value) {
    if (!(c.type === 'checkbox' || c.type === 'radio' || pinnedCols.value.has(c.key))) break
    m[c.key] = x; x += colWidths.value[c.key] ?? c.width ?? c.minWidth ?? 100
  }
  return m
})
const lastStickyKey = computed(() => Object.keys(stickyLeft.value).pop() ?? null)
/** Cột đặt nhãn “Tổng”: cột đầu tiên đang hiện (bỏ qua cột tick chọn) — đổi thứ tự / ẩn cột thì nhãn tự theo */
const footerLabelKey = computed(() => visibleCols.value.find(c => c.type !== 'checkbox' && c.type !== 'radio')?.key ?? null)
const lastColKey    = computed(() => props.rowActions.length && props.actionMode === 'hover' ? visibleCols.value[visibleCols.value.length - 1]?.key : null)
/* Cột thao tác ghim (action-mode icons | link) */
const pinnedActions = computed(() => props.actionMode !== 'hover' && (props.rowActions.length > 0 || props.moreActions.length > 0))
/* Độ rộng: Figma Icons 76 (2 icon) · Link 120 — có tiêu đề cột thì nới vừa chữ tiêu đề (đệm 4 + 12 hai bên, chữ 13 Semi Bold ~7px/ký tự) */
/* Bảng sửa trực tiếp (editable) + cột icon ghim: quy chuẩn chung — tiêu đề cột để trống, icon căn giữa, cột vừa đủ icon */
const editActs      = computed(() => props.editable && props.actionMode === 'icons')
const pinActWidth   = computed(() => {
  if (props.actionsWidth) return props.actionsWidth
  if (editActs.value) { const n = (props.rowActions.length ? 1 : 0) + (props.rowActions.length > 1 || props.moreActions.length ? 1 : 0); return 8 + 24 + n * 16 + Math.max(0, n - 1) * 12 }   // ô đệm 4×2 + 12×2 + icon 16, cách 12
  const base = props.actionMode === 'link' ? 120 : 76
  return Math.max(base, props.actionsLabel ? Math.ceil(props.actionsLabel.length * 7.5) + 34 : 0)
})
const visibleActs   = row => props.rowActions.filter(a => !a.show || a.show(row))
const mainAction    = row => visibleActs(row)[0] || null
const subActions    = row => [...visibleActs(row).slice(1).map(a => ({ ...a, label: a.label || a.title })), ...props.moreActions]
/* Dạng rê chuột: nút = thao tác KHÔNG nguy hiểm, tối đa maxRowActions · “…” = phần dư + thao tác danger (Xóa) + moreActions */
const hoverIcons = row => visibleActs(row).filter(a => !a.danger).slice(0, props.maxRowActions)
const hoverMore  = row => {
  const shown = new Set(hoverIcons(row))
  const rest = visibleActs(row).filter(a => !shown.has(a)).map(a => ({ ...a, label: a.label || a.title }))
  const danger = rest.filter(a => a.danger), normal = rest.filter(a => !a.danger)
  const extra = [...normal, ...props.moreActions]
  return danger.length ? [...extra, ...(extra.length ? [{ separator: true }] : []), ...danger] : extra
}
function runAction(a, row) { if (a.emit) emit(a.emit, row); else emit('more-action', { action: a, row }) }
/** Nếu bảng có cột subtext, avatar-subtext, hoặc product-logo → toàn bộ row dùng chiều cao 56px */
const has2LineCol   = computed(() => props.columns.some(c => TWO_LINE_TYPES.has(c.type)))
const rowLineClass  = computed(() => {
  if (props.lineCount >= 2 || anyWrap.value) return 'dt-row--flex'
  // Cột 2 dòng (tên + dòng phụ, avatar + dòng phụ, logo) LUÔN cần dòng 56px — xét TRƯỚC lineCount mặc định = 1,
  // nếu không bảng có cột subtext sẽ bị ép cao 32px, 2 dòng chữ dính sát nhau
  if (has2LineCol.value)    return 'dt-row--2line'
  if (props.lineCount === 1) return 'dt-row--1line'
  return ''
})

/* Header nhóm: cột có `group` (chuỗi) → gộp các cột liền nhau cùng nhóm. Bề rộng ô nhóm = tổng bề rộng các cột con (cột trong nhóm nên có `width` cố định). Không cột nào có group → null */
const headerGroups = computed(() => {
  if (!visibleCols.value.some(c => c.group)) return null
  const spans = []
  for (const col of visibleCols.value) {
    const w = (colWidths.value[col.key] ?? col.width ?? col.minWidth ?? 100) + (col.key === lastColKey.value ? ACTION_WIDTH : 0)
    const label = col.group || ''
    const last = spans[spans.length - 1]
    if (label && last && last.label === label) { last.w += w; last.cols.push(col) } else spans.push({ key: 'g:' + col.key, label, w, cols: [col] })
  }
  return spans.map(g => ({ ...g, style: g.cols.every(c => c.width || colWidths.value[c.key] || stickyLeft.value[c.key] !== undefined) ? { width: g.w + 'px', flexShrink: 0 } : { flex: '1 0 0', minWidth: g.w + 'px' } }))
})

const totalRowMinWidth = computed(() => {
  let total = 0
  for (const col of visibleCols.value) {
    const base  = colWidths.value[col.key] ?? col.width ?? 100
    const extra = col.key === lastColKey.value ? ACTION_WIDTH : 0
    total += base + extra
  }
  return total + (pinnedActions.value ? pinActWidth.value : 0)
})

function getRowId(row, i) {
  return row[props.rowIdKey] ?? i
}

function isSelected(row, i) {
  return props.selected.includes(getRowId(row, i))
}

function toggleSelect(row, i) {
  const id = getRowId(row, i)
  const cur = [...props.selected]
  const idx = cur.indexOf(id)
  if (idx >= 0) cur.splice(idx, 1)
  else cur.push(id)
  emit('update:selected', cur)
}

function cellVal(row, col) {
  return row[col.key]
}
/* Lỗi ô sửa trực tiếp (quy chuẩn báo lỗi input): col.required → báo khi người dùng xóa trắng / rời ô trống (ô chưa đụng tới không báo)
   · col.validate(value, row) → chuỗi lỗi (rỗng = hợp lệ) · col.requiredMessage thay câu mặc định “<Tên cột> không được để trống” */
const touched = reactive(new Set())
const cellKey = (row, col) => `${row.id ?? props.rows.indexOf(row)}:${col.key}`
const touch = (row, col) => touched.add(cellKey(row, col))
const isBlank = v => v == null || String(v).trim() === ''
function cellError(row, col) {
  const v = cellVal(row, col)
  if (col.required && isBlank(v) && touched.has(cellKey(row, col))) return col.requiredMessage || `${col.label} không được để trống`
  return (typeof col.validate === 'function' && col.validate(v, row)) || ''
}
/* Cột số (căn phải) có giá trị kiểu number → định dạng theo quy tắc số chung (TT200: 1.234.567,89) · col.format === false: giữ nguyên (mã, năm…) */
function textOf(row, col) {
  const v = cellVal(row, col)
  if (v == null) return '–'
  return typeof v === 'number' && col.align === 'right' && col.format !== false ? fmtNum(v, col.decimals != null ? { decimals: col.decimals } : undefined) : v
}

/* ── Gom nhóm (groupBy): dòng tiêu đề nhóm + các dòng của nhóm; nhóm theo thứ tự xuất hiện trong rows (đã sắp xếp) ── */
const collapsedGroups = ref(new Set((() => { try { return JSON.parse(localStorage.getItem('dt-groups:' + props.groupStorageKey) || '[]') } catch { return [] } })()))
function setCollapsed(next) {
  collapsedGroups.value = next
  if (props.groupStorageKey) try { localStorage.setItem('dt-groups:' + props.groupStorageKey, JSON.stringify([...next])) } catch { /* bỏ qua */ }
}
function toggleGroup(key) {
  const next = new Set(collapsedGroups.value)
  next.has(key) ? next.delete(key) : next.add(key)
  setCollapsed(next)
}
/* Thu gọn / mở rộng TẤT CẢ nhóm (nút ngoài bảng gọi qua ref: tableRef.collapseAll() / expandAll(); allCollapsed để đổi icon) */
const groupKeys = computed(() => (props.groupBy ? [...new Set(props.rows.map(r => String(r[props.groupBy] ?? '')))] : []))
const allCollapsed = computed(() => groupKeys.value.length > 0 && groupKeys.value.every(k => collapsedGroups.value.has(k)))
const collapseAll = () => setCollapsed(new Set([...collapsedGroups.value, ...groupKeys.value]))
const expandAll = () => setCollapsed(new Set())
/* Bảng tóm tắt (summary) không có app xử lý @column-sort → tự sắp xếp dòng theo cột đang chọn (giá trị: col.sortValue(row) ?? row[col.key]; object lấy title / label / name / text) */
const sortVal = (col, row) => {
  let v = col.sortValue ? col.sortValue(row) : row[col.key]
  if (v && typeof v === 'object') v = v.title ?? v.label ?? v.name ?? v.text ?? v.value ?? ''
  return v
}
const viewRows = computed(() => {
  const rows = props.rows.map((row, i) => ({ row, i }))
  const key = props.summary && !externalSort && Object.keys(sortState.value)[0]
  const col = key && props.columns.find(c => c.key === key)
  if (!col) return rows
  const dir = sortState.value[key] === 'desc' ? -1 : 1
  return rows.sort((a, b) => {
    const x = sortVal(col, a.row), y = sortVal(col, b.row)
    if (x == null || x === '') return 1
    if (y == null || y === '') return -1
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi', { numeric: true })) * dir
  })
})
const displayItems = computed(() => {
  if (!props.groupBy) return viewRows.value.map(({ row, i }) => ({ key: getRowId(row, i), row, i }))
  const order = [], map = new Map()
  props.rows.forEach((row, i) => {
    const g = String(row[props.groupBy] ?? '')
    if (!map.has(g)) { map.set(g, []); order.push(g) }
    map.get(g).push({ key: getRowId(row, i), row, i })
  })
  const out = []
  for (const g of order) {
    const items = map.get(g), collapsed = collapsedGroups.value.has(g)
    out.push({ key: 'grp:' + g, group: g, label: props.groupLabel ? props.groupLabel(g) : (g || '—'), count: items.filter(x => !isRowHidden(x.row)).length, collapsed })
    if (!collapsed) out.push(...items)
  }
  return out
})

function isRowHidden(row) {
  if (!props.hideBlankRows) return false
  const dataCols = visibleCols.value.filter(c => DATA_TYPES.has(c.type ?? 'text'))
  if (!dataCols.length) return false
  return dataCols.every(c => {
    const v = row[c.key]
    return v === null || v === undefined || v === ''
  })
}

/* ── Column resize ── */
const tableRef        = ref(null)
const colWidths       = ref({})
const resizedFlexCols = ref({})

/* ── Nhớ độ rộng cột cho MỌI bảng: app provide('dtWidthStore', { get(key) → { colKey: px } | null, set(key, colKey, px | null) }).
      Bảng có @column-resize riêng (app tự lưu qua col.width) → không dùng kho chung để khỏi lưu trùng. */
const widthStore = inject('dtWidthStore', null)
const externalResize = !!getCurrentInstance()?.vnode.props?.onColumnResize
const rowClickable = !!getCurrentInstance()?.vnode.props?.onRowClick
const externalSort = !!getCurrentInstance()?.vnode.props?.onColumnSort
const storeKey = computed(() => props.persistKey || 'auto:' + props.columns.map(c => c.key).join('|'))
const savedWidths = () => (widthStore && !externalResize ? widthStore.get(storeKey.value) ?? {} : {})
const propWidths = {}   // col.width lần trước — app đổi width (VD nạp độ rộng đã lưu) thì nhận giá trị mới
watch(() => props.columns, (cols) => {
  const w = {}
  for (const col of cols) {
    const changed = col.width != null && propWidths[col.key] !== col.width
    w[col.key] = changed ? col.width : (colWidths.value[col.key] ?? col.width ?? col.minWidth ?? 100)
    propWidths[col.key] = col.width
  }
  colWidths.value = w
  applySaved()
}, { immediate: true })
/* Độ rộng đã lưu trong kho chung (tài khoản) → áp lên cột (cột co giãn → thành cố định đúng độ rộng đó). Dữ liệu tài khoản về muộn → áp lại */
function applySaved() {
  const saved = savedWidths()
  for (const [k, px] of Object.entries(saved)) if (props.columns.some(c => c.key === k)) { colWidths.value[k] = px; resizedFlexCols.value[k] = true }
}
if (widthStore && !externalResize) watch(() => JSON.stringify(widthStore.get(storeKey.value) ?? null), applySaved)

function cellStyle(col) {
  const pinned = resizedFlexCols.value[col.key]
  const extra  = col.key === lastColKey.value ? ACTION_WIDTH : 0
  const left = stickyLeft.value[col.key]
  if (left !== undefined) {   // ô dính: bề rộng cố định, nền theo dòng (hover / chọn), nằm trên ô đang trôi
    return { width: (colWidths.value[col.key] ?? col.width ?? col.minWidth ?? 100) + 'px', flexShrink: 0, position: 'sticky', left: left + 'px', zIndex: 2, background: 'inherit',
      ...(col.key === lastStickyKey.value ? { boxShadow: '6px 0 6px -6px rgba(16, 24, 40, 0.18)' } : {}) }
  }
  if (col.width || pinned) {
    return { width: (colWidths.value[col.key] ?? col.width ?? 100) + extra + 'px', flexShrink: 0 }
  }
  const style = { flex: '1 0 0', minWidth: (colWidths.value[col.key] ?? 0) + 'px', overflow: 'hidden' }
  if (extra) style.paddingRight = extra + 'px'
  return style
}

function startResize(e, col) {
  e.preventDefault()
  hoveredCol.value = null

  const startX = e.clientX
  let startW
  const isFlex = !col.width && !resizedFlexCols.value[col.key]
  const extra  = col.key === lastColKey.value ? ACTION_WIDTH : 0

  if (isFlex) {
    startW = e.currentTarget.parentElement.getBoundingClientRect().width - extra
    colWidths.value[col.key] = Math.round(startW)
    resizedFlexCols.value[col.key] = true
  } else {
    startW = colWidths.value[col.key] ?? col.width ?? 100
  }

  let moved = false
  function onMove(ev) { moved = true; colWidths.value[col.key] = Math.max(60, startW + ev.clientX - startX) }
  function onUp() {
    document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp)
    if (!moved) return
    const px = Math.round(colWidths.value[col.key])
    emit('column-resize', col, px)                                            // app tự lưu (useColumnSettings…)
    if (widthStore && !externalResize) widthStore.set(storeKey.value, col.key, px)   // hoặc kho chung (mọi bảng khác)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

/* Nhấp đúp vạch chia → về độ rộng mặc định của cột (app xóa độ rộng đã lưu) */
function resetWidth(col) {
  delete resizedFlexCols.value[col.key]
  colWidths.value[col.key] = col.defaultWidth ?? col.width ?? col.minWidth ?? 100
  emit('column-resize', col, null)
  if (widthStore && !externalResize) widthStore.set(storeKey.value, col.key, null)
}

/* ── Column hover line ── */
const hoveredCol   = ref(null)
const hoverLineLeft = ref(0)

function onDividerEnter(e) {
  const divRect   = e.currentTarget.getBoundingClientRect()
  const tableRect = tableRef.value.getBoundingClientRect()
  hoverLineLeft.value = divRect.left + 4 - tableRect.left
  hoveredCol.value = true
}

function onDividerLeave() { hoveredCol.value = null }

function alignClass(col) {
  if (col.align === 'right') return 'dt-cell-inner--right'
  if (col.align === 'center') return 'dt-cell-inner--center'
  return ''
}

/* ── Header hover ── */
const hoveredHeaderKey = ref(null)

/* ── Sort ── */
const sortState = ref({}) // { colKey: 'asc' | 'desc' | null }

function setSort(col, dir) {
  if (props.summary && !externalSort) sortState.value = {}   // bảng tự sắp xếp: mỗi lần 1 cột
  if (dir === null) {
    delete sortState.value[col.key]
  } else {
    sortState.value[col.key] = dir
  }
  closeHeaderMenu()
  emit('column-sort', col, dir)
}

/* ── Pin ── */
function togglePin(col) {
  const s = new Set(pinnedCols.value)
  if (s.has(col.key)) s.delete(col.key)
  else s.add(col.key)
  pinnedCols.value = s
  closeHeaderMenu()
}

/* ── Hide ── */
function hideCol(col) {
  if (col.locked) return   // cột bắt buộc hiển thị
  const s = new Set(internalHiddenCols.value)
  s.add(col.key)
  internalHiddenCols.value = s
  closeHeaderMenu()
  emit('column-hide', col)
}

/* ── Move / Insert ── */
function moveCol(col, pos) {
  closeHeaderMenu()
  emit('column-move', col, pos)
}

function insertCol(col, side) {
  closeHeaderMenu()
  emit('column-insert', col, side)
}

/* ── Wrap ── */
/* Hiển thị 1 dòng / nhiều dòng theo từng cột (menu tiêu đề cột). Khởi tạo từ col.wrap; app lưu lại qua emit column-wrap */
const wrapOverride = reactive({})
/* Ảnh avatar (vd ảnh Google) lỗi / hết hạn → hiện chữ cái đầu */
const brokenAvatars = reactive(new Set())
const avatarOk = url => !!url && !brokenAvatars.has(url)
const isWrap = col => wrapOverride[col.key] ?? !!col.wrap
const anyWrap = computed(() => visibleCols.value.some(isWrap))
const tagLimit  = col => (isWrap(col) ? Infinity : (col.maxTags ?? 3))
const shownTags = (col, list) => list.slice(0, tagLimit(col))
const moreTags  = (col, list) => list.slice(tagLimit(col))
function setWrap(col, wrap) {
  wrapOverride[col.key] = wrap
  closeHeaderMenu()
  emit('column-wrap', col, wrap)
}

/* ── Header context menu ── */
const headerMenu = ref(null)

/* ── SelectAll (for checkbox-type column header) ── */
const isAllSelected = computed(() => {
  const visibleRows = props.rows.filter(r => !isRowHidden(r) && !r._noSelect)
  return visibleRows.length > 0 && visibleRows.every((r, i) => isSelected(r, i))
})
function toggleSelectAll(val) {
  if (val) {
    const ids = props.rows.filter(r => !isRowHidden(r) && !r._noSelect).map((r, i) => getRowId(r, i))
    emit('update:selected', ids)
  } else {
    emit('update:selected', [])
  }
}

function openHeaderMenu(col, e) {
  // Không mở menu cho cột checkbox/radio
  if (col.type === 'checkbox' || col.type === 'radio' || col.noMenu) return
  const rect = e.currentTarget.closest('.dt-cell--header').getBoundingClientRect()
  // position: fixed → dùng viewport coords trực tiếp (không cộng scrollX/Y)
  let x = rect.left
  const menuW = 220
  if (x + menuW > window.innerWidth - 8) x = rect.right - menuW
  if (x < 8) x = 8
  headerMenu.value = { col, x, y: rect.bottom + 2 }
}

function closeHeaderMenu() {
  headerMenu.value = null
}

/* ── Column filter ── */
const colFilters    = ref({})  // { colKey: { condition, value } }
const filterPopover = ref(null)
const filterDraft   = ref({ condition: 'contains', value: '' })
const filterInputRef = ref(null)
const FILTER_OPTIONS = computed(() => Object.entries(FILTER_CONDITIONS).map(([value, label]) => ({ value, label })))

const FILTER_CONDITIONS = {
  'contains':     'Chứa',
  'not-contains': 'Không chứa',
  'equals':       'Bằng',
  'not-equals':   'Không bằng',
  'starts-with':  'Bắt đầu bằng',
  'ends-with':    'Kết thúc bằng',
  'empty':        'Rỗng',
  'not-empty':    'Không rỗng',
}

/* ── Liên thông bộ lọc Advance ── */
const linkDraft  = ref(null)
const fieldOfCol = col => props.filterFields.find(f => f.key === (col.filterKey ?? col.key))
const condOfCol  = col => { const f = fieldOfCol(col); return f ? props.filter?.conditions?.find(c => c.key === f.key && isComplete(c)) : null }
function isColFiltered(col) {
  if (!col) return false
  if (props.filter) return !!condOfCol(col)
  const x = colFilters.value[col.key]
  return !!(x?.value || x?.condition === 'empty' || x?.condition === 'not-empty')
}
const canFilter = col => !props.summary && !col.noFilter && (!props.filter || !!fieldOfCol(col))
function setColCondition(col, cond) {
  const f = fieldOfCol(col), list = props.filter.conditions || []
  const has = list.some(c => c.key === f.key)
  const conditions = cond
    ? (has ? list.map(c => (c.key === f.key ? { ...cond, key: f.key } : c)).filter((c, i, a) => a.findIndex(x => x.key === c.key) === i) : [...list, { ...cond, key: f.key }])
    : list.filter(c => c.key !== f.key)
  emit('update:filter', { ...props.filter, mode: props.filter.mode || 'all', conditions })
  emit('column-filter', col, cond)
}
function clearColFilter() { const col = filterPopover.value?.col; if (col) setColCondition(col, null); closeFilter() }

function openFilter(col, e) {
  if (props.filter) {
    const field = fieldOfCol(col), existing = props.filter.conditions?.find(c => c.key === field.key)
    linkDraft.value = existing ? { ...existing } : newCondition(field)
    const r = e.currentTarget.getBoundingClientRect(), popW = 280
    filterPopover.value = { col, field, x: Math.max(8, Math.min(r.left, window.innerWidth - popW - 8)), y: r.bottom + 4 }
    nextTick(() => document.querySelectorAll('.dt-filter-popover input')[1]?.focus())   // ô giá trị (sau ô toán tử)
    return
  }
  // Load existing filter into draft
  const existing = colFilters.value[col.key]
  filterDraft.value = existing
    ? { condition: existing.condition, value: existing.value ?? '' }
    : { condition: 'contains', value: '' }

  // Position popover below the filter button
  // position: fixed → dùng viewport coords trực tiếp (không cộng scrollX/Y)
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  let x = rect.left
  const popW = 280
  if (x + popW > window.innerWidth - 8) x = Math.max(8, window.innerWidth - popW - 8)
  filterPopover.value = { col, x, y: rect.bottom + 4 }

  nextTick(() => document.querySelector('.dt-filter-popover input:not([role=combobox])')?.focus())   // con trỏ sẵn ở ô giá trị
}

function closeFilter() {
  filterPopover.value = null
}

function applyFilter() {
  const col = filterPopover.value?.col
  if (!col) return
  if (props.filter) { setColCondition(col, isComplete(linkDraft.value) ? { ...linkDraft.value } : null); closeFilter(); return }
  const { condition, value } = filterDraft.value
  const isValueless = condition === 'empty' || condition === 'not-empty'
  if (!isValueless && !value.trim()) {
    // Clear filter if value is empty
    const f = { ...colFilters.value }
    delete f[col.key]
    colFilters.value = f
    emit('column-filter', col, null)
  } else {
    colFilters.value = { ...colFilters.value, [col.key]: { condition, value: value.trim() } }
    emit('column-filter', col, { condition, value: value.trim() })
  }
  closeFilter()
}

/** Lấy 2 ký tự đầu của tên để hiển thị trong avatar tròn */
/* avatarInitials / avatarColor: quy tắc chung ở utils/avatar.js */
defineExpose({ collapseAll, expandAll, allCollapsed })
</script>
