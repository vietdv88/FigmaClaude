<template>
  <!-- ── Trial expiry banner ── -->
  <div v-if="showTrialBanner" class="trial-banner">
    <p class="trial-banner__text">
      Thời gian dùng thử <strong>{{ appName }}</strong> của quý khách còn <strong>{{ trialDaysLeft }}</strong> ngày. Vui lòng nâng cấp phiên bản chính thức để không bị gián đoạn công việc.
    </p>
    <div class="trial-banner__actions">
      <button class="btn btn--warning btn--sm">Nâng cấp ngay</button>
      <button class="trial-banner__dismiss" @click="showTrialBanner = false">Để sau</button>
    </div>
  </div>

  <!-- ── Global Header ── -->
  <header class="global-header" :class="{ 'global-header--white': (mode || currentMode) === 'light' }">
    <!-- Left -->
    <div class="header-left">
      <!-- Chỗ đặt nút trước logo (VD nút ☰ mở menu trái ở màn hẹp) -->
      <slot name="header-start" />
      <!-- Nút 9 chấm (chuyển ứng dụng) — ẩn bằng hide-tools="['apps']" -->
      <!-- Có prop apps → bấm xổ danh sách ứng dụng (logo + tên), app đang dùng được đánh dấu; chọn app khác → chuyển sang app đó -->
      <button v-if="!hidden('apps') && apps.length" :ref="el => (panelBtn.apps = el)" type="button" class="btn-icon-white" :class="{ 'btn-icon-white--active': panel === 'apps' }"
        v-tip="'Tất cả ứng dụng'" aria-label="Tất cả ứng dụng" aria-haspopup="menu" :aria-expanded="String(panel === 'apps')" @click.stop="togglePanel('apps')"><TIcon name="grid-dots" /></button>
      <button v-else-if="!hidden('apps')" class="btn-icon-white" v-tip="'Tất cả ứng dụng'" aria-label="Tất cả ứng dụng"><TIcon name="grid-dots" /></button>
      <!-- Logo + tên app = link về trang chủ (quy chuẩn): app có router bắt @home; không bắt → đi tới home-href -->
      <a class="header-brand" :href="homeHref" v-tip="'Về trang chủ'" aria-label="Về trang chủ" @click="onHome">
      <slot name="logo-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
          <path d="M0 16C0 3.2 3.2 0 16 0C28.8 0 32 3.2 32 16C32 28.8 28.8 32 16 32C3.2 32 0 28.8 0 16Z" fill="url(#paint0_linear_4480_1201)"/>
          <circle cx="16" cy="16" r="10" fill="white"/>
          <path d="M20.2432 7.8353C18.9324 7.15508 17.4773 6.8 16.0005 6.8C14.5237 6.8 13.0685 7.15508 11.7578 7.8353L19.9223 15.9979L24.1652 11.7557C23.2902 10.0783 21.9212 8.7098 20.2432 7.8353Z" fill="#FF9500"/>
          <path d="M12.0781 16.0016L7.835 20.2432C8.96023 22.4079 10.8994 24.0371 13.2261 24.7723C15.5527 25.5075 18.0761 25.2886 20.2413 24.1636L12.0781 16.0016Z" fill="#4CD964"/>
          <path d="M24.1642 11.7592L15.9999 19.9209L20.2431 24.1631C22.408 23.0379 24.0373 21.0989 24.7725 18.7727C25.5077 16.4465 25.2885 13.9236 24.1633 11.7589L24.1642 11.7592Z" fill="#007AFF"/>
          <path d="M11.7561 7.8356C9.59182 8.96137 7.96314 10.9002 7.22794 13.226C6.49274 15.5518 6.71117 18.0743 7.83521 20.2391L15.9986 12.0771L11.7561 7.8356Z" fill="#FF3B30"/>
          <path d="M15.9996 12.0793L12.0789 15.9993L15.9996 19.9194L19.9203 15.9993L15.9996 12.0793Z" fill="#393A3D"/>
          <path d="M15.9991 12.811L19.1882 15.9996L15.9991 19.1873L12.8109 15.9996L15.9991 12.811Z" fill="#EEF3F6"/>
          <g opacity="0.15">
            <path d="M13.226 17.148L7.85547 20.2213L12.0782 16.0002L13.226 17.148Z" fill="black"/>
            <path d="M14.8512 13.225L11.7771 7.85541L15.9998 12.0777L14.8512 13.225Z" fill="black"/>
            <path d="M18.773 14.8506L24.1435 11.777L19.9208 15.999L18.773 14.8506Z" fill="black"/>
            <path d="M17.1481 18.7734L20.2222 24.1429L15.9995 19.9212L17.1481 18.7734Z" fill="black"/>
          </g>
          <defs>
            <linearGradient id="paint0_linear_4480_1201" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3DC9F9"/>
              <stop offset="1" stop-color="#02A3EC"/>
            </linearGradient>
          </defs>
        </svg>
      </slot>
      <span class="app-name-header">{{ appName }}</span>
      </a>
      <template v-if="!noMeta">
        <div class="divider-v-header"></div>
        <slot name="header-meta">
          <button class="header-company">
            Công ty mẫu <TIcon name="chevron-down" />
          </button>
          <span class="header-year-badge">
            <span class="year-dot"></span>
            Dữ liệu năm 2025
          </span>
        </slot>
      </template>
    </div>

    <!-- Right — search + actions — thứ tự chuẩn: Search → MISA AI → Bell → Help → More → Settings → Avatar (KHÔNG còn icon AMIS Chat) -->
    <div class="header-right">
      <slot v-if="!hidden('search')" name="header-search">
        <!-- Ô tìm kiếm toàn cục: app bắt @search → gõ là tự tìm, kết quả xổ ra theo nhóm phân hệ (:search-results); không bắt thì chỉ là ô nhập -->
        <AppGlobalSearch :placeholder="searchPlaceholder" :results="searchResults" :loading="searchLoading" :panel-width="searchPanelWidth"
          v-bind="hasSearch ? { onSearch: q => emit('search', q) } : {}"
          @select="(it, g) => emit('search-select', it, g)" @more="openMore" />
        <!-- “Xem thêm” của 1 phân hệ → popup chỉ chứa kết quả của phân hệ đó (app nạp :search-more-items theo @search-more) -->
        <AppSearchResultsDialog v-if="more" :group-title="more.group.title" :keyword="more.q" :items="searchMoreItems || []" :total="searchMoreTotal" :loading="searchMoreLoading || searchMoreItems === null"
          @search="q => emit('search-more', more.group, q)" @select="it => { emit('search-select', it, more.group); more = null }" @close="more = null" />
      </slot>
      <!-- Cụm icon + avatar (Figma Global Header › Toolbar Header): các nút icon cách nhau 8 · cách ô tìm kiếm 16 (gap của .header-right) -->
      <div class="header-tools">
      <slot name="header-actions" />
      <div class="header-toolbar">
        <button v-if="!hidden('ai')" class="btn-icon-white" v-tip="'MISA AI'" aria-label="MISA AI">
          <slot name="ai-icon"><IconMisaAI /></slot>
        </button>
        <!-- Thông báo / Trợ giúp / Thêm: có dữ liệu (notifications / help-menu / more-menu) → bấm xổ popover theo Figma Global Header (Header_Notification · Header_Help · Header_More) -->
        <button v-if="!hidden('notify')" :ref="el => (panelBtn.notify = el)" class="btn-icon-white" :class="{ 'btn-icon-white--active': panel === 'notify' }" v-tip="'Thông báo'" aria-label="Thông báo"
          :aria-expanded="notifications ? String(panel === 'notify') : undefined" @click.stop="notifications && togglePanel('notify')">
          <TIcon name="bell" />
          <span v-if="notifyBadge" class="header-badge">{{ notifyBadge }}</span>
        </button>
        <button v-if="!hidden('help')" :ref="el => (panelBtn.help = el)" class="btn-icon-white" :class="{ 'btn-icon-white--active': panel === 'help' }" v-tip="'Trợ giúp'" aria-label="Trợ giúp"
          :aria-expanded="helpMenu.length ? String(panel === 'help') : undefined" @click.stop="helpMenu.length && togglePanel('help')">
          <TIcon name="help-circle" />
        </button>
        <button v-if="!hidden('more')" :ref="el => (panelBtn.more = el)" class="btn-icon-white" :class="{ 'btn-icon-white--active': panel === 'more' }" v-tip="'Thêm tùy chọn'" aria-label="Thêm tùy chọn"
          :aria-expanded="moreMenu.length ? String(panel === 'more') : undefined" @click.stop="moreMenu.length && togglePanel('more')">
          <TIcon name="dots-circle-horizontal" />
        </button>
        <!-- settingsMenu: bánh răng xổ menu “Thiết lập hiển thị” + các mục của app (VD Cài đặt hệ thống) -->
        <!-- Cùng kiểu popover header (khung + mũi nhọn chỉ vào icon) như Thông báo / Trợ giúp / Thêm -->
        <button v-if="settingsMenu.length" :ref="el => (panelBtn.settings = el)" class="btn-icon-white" :class="{ 'btn-icon-white--active': panel === 'settings' }" v-tip="'Thiết lập'" aria-label="Thiết lập"
          aria-haspopup="menu" :aria-expanded="String(panel === 'settings')" @click.stop="togglePanel('settings')"><TIcon name="settings" /></button>
        <button v-else ref="toolsBtnRef" class="btn-icon-white"
          v-tip="settingsOnly ? 'Thiết lập màu sắc và hiển thị' : 'Các tiện ích và thiết lập'" :aria-label="settingsOnly ? 'Thiết lập màu sắc và hiển thị' : 'Các tiện ích và thiết lập'"
          @click="settingsOnly ? openSettings() : openToolsPopover()">
          <TIcon name="settings" />
        </button>
      </div>
      <!-- avatarName: avatar chữ cái đầu theo bảng màu avatar (giống DataTable), viền stroke-neutral-light -->
      <!-- Avatar góc phải = nút tài khoản: bấm → thông tin cá nhân + Đăng xuất (quy chuẩn) -->
      <slot name="header-end" />
      <button v-if="!hideAvatar" ref="avatarBtnRef" type="button" class="header-avatar-btn" :class="{ 'header-avatar-btn--open': profileOpen }" v-tip="'Tài khoản'" aria-label="Tài khoản" @click.stop="toggleProfile">
        <img v-if="userPicture && !picBroken" class="header-avatar" :src="userPicture" alt="" referrerpolicy="no-referrer" @error="picBroken = true" />
        <div v-else-if="avatarName" class="header-avatar header-avatar--initials" :style="avatarStyle">{{ avatarInitials }}</div>
        <div v-else class="header-avatar">VT</div>
      </button>
      <Teleport to="body">
        <!-- Menu tài khoản — Figma Header_UserProfile (49869:3245): avatar 64 giữa · tên H3 · email · khung công ty / dữ liệu (profile-context, có ›) · danh sách mục · ngôn ngữ -->
        <div v-if="profileOpen" ref="profileRef" class="hdr-profile hdr-pop" :style="profileStyle" @click.stop>
          <span class="hdr-pop__arrow" :style="{ right: profileArrow + 'px' }" />
          <div class="hdr-profile__head">
            <img v-if="userPicture && !picBroken" class="hdr-profile__avatar" :src="userPicture" alt="" referrerpolicy="no-referrer" @error="picBroken = true" />
            <span v-else class="hdr-profile__avatar hdr-profile__avatar--initials" :style="avatarStyle">{{ avatarInitials || 'VT' }}</span>
            <span class="hdr-profile__info">
              <span class="hdr-profile__name">{{ avatarName || 'Người dùng' }}</span>
              <span v-if="userEmail" class="hdr-profile__sub">{{ userEmail }}</span>
              <span v-if="userRole" class="hdr-profile__role">{{ userRole }}</span>
            </span>
          </div>
          <div v-if="profileContext.length" class="hdr-profile__ctx">
            <template v-for="(it, i) in profileContext" :key="it.id || i">
              <div v-if="i" class="hdr-profile__ctx-sep" role="separator" />
              <button type="button" class="hdr-pop__item" @click="onProfileItem(it)">
                <TIcon v-if="it.icon" :name="it.icon" /><span class="hdr-pop__label">{{ it.label }}</span><TIcon name="chevron-right" class="hdr-pop__chev" />
              </button>
            </template>
          </div>
          <!-- Phần menu: chuẩn Menu List (đệm khung 8 · item bo góc, hover không chạm 2 mép) -->
          <div v-if="profileMenu.length || hasLogout || language" class="hdr-profile__menu">
            <template v-for="(it, i) in profileMenu" :key="it.id || 'sep' + i">
              <div v-if="it.separator" class="hdr-profile__sep" role="separator" />
              <button v-else type="button" class="hdr-pop__item" @click="onProfileItem(it)">
                <img v-if="it.img" :src="it.img" alt="" class="hdr-pop__img" /><TIcon v-else-if="it.icon" :name="it.icon" /><span class="hdr-pop__label">{{ it.label }}</span><TIcon v-if="it.chevron" :name="it.chevron === true ? 'chevron-right' : it.chevron" class="hdr-pop__chev" />
              </button>
            </template>
            <button v-if="language" type="button" class="hdr-pop__item" @click="onProfileItem({ id: '__language', label: language.label })">
              <img v-if="language.flag" :src="language.flag" alt="" class="hdr-pop__img" /><TIcon v-else name="language" /><span class="hdr-pop__label">Ngôn ngữ: {{ language.label }}</span><TIcon name="chevron-down" class="hdr-pop__chev" />
            </button>
            <div v-if="(profileMenu.length || language) && hasLogout" class="hdr-profile__sep" role="separator" />
            <button v-if="hasLogout" type="button" class="btn btn--text-neutral hdr-profile__logout" @click="onLogout"><TIcon name="logout" />Đăng xuất</button>
          </div>
        </div>

        <!-- Thông báo — Figma Header_Notification (49850:3240): tiêu đề H3 + 3 nút icon nhỏ (đánh dấu đã đọc · lọc · thiết lập) · nhóm Hôm nay / Trước đó · dòng bo góc, chưa đọc nền Brand Light -->
        <!-- Chuyển ứng dụng: lưới ô to (logo trong ô bo tròn + tên + mô tả), app đang dùng có viền + dấu ✓; hiện ra có hiệu ứng nhẹ -->
        <div v-if="panel === 'apps'" ref="panelEl" class="hdr-pop hdr-apps" :style="[panelStyle, { '--apps-cols': appCols }]" role="menu" aria-label="Tất cả ứng dụng" @click.stop>
          <span class="hdr-pop__arrow" :style="{ right: panelArrow + 'px' }" />
          <div class="hdr-apps__title">Ứng dụng của bạn</div>
          <div class="hdr-apps__grid">
            <button v-for="(a, i) in appItems" :key="a.id" type="button" role="menuitem" class="hdr-apps__tile" :class="{ 'hdr-apps__tile--on': a.checked }" :style="{ '--i': i }"
              :aria-current="a.checked ? 'true' : undefined" @click="panel = null; onAppSelect(a)">
              <span class="hdr-apps__logo"><img v-if="a.img" :src="a.img" alt="" /><TIcon v-else :name="a.icon || 'apps'" /></span>
              <span class="hdr-apps__name">{{ a.label }}</span>
              <span v-if="a.desc" class="hdr-apps__desc">{{ a.desc }}</span>
              <span v-if="a.checked" class="hdr-apps__check" aria-hidden="true"><TIcon name="check" /></span>
            </button>
          </div>
        </div>
        <div v-if="panel === 'notify' && notifications" ref="panelEl" class="hdr-pop hdr-notify" :style="panelStyle" role="dialog" aria-label="Thông báo" @click.stop>
          <span class="hdr-pop__arrow" :style="{ right: panelArrow + 'px' }" />
          <div class="hdr-notify__head">
            <h3 class="hdr-notify__title">Thông báo</h3>
            <button type="button" class="btn-icon btn-icon--sm" v-tip="'Đánh dấu tất cả là đã đọc'" aria-label="Đánh dấu tất cả là đã đọc" @click="$emit('notify-action', 'read-all')"><TIcon name="checks" /></button>
            <button type="button" class="btn-icon btn-icon--sm" v-tip="'Lọc thông báo'" aria-label="Lọc thông báo" @click="$emit('notify-action', 'filter')"><TIcon name="adjustments-horizontal" /></button>
            <button type="button" class="btn-icon btn-icon--sm" v-tip="'Thiết lập thông báo'" aria-label="Thiết lập thông báo" @click="$emit('notify-action', 'settings')"><TIcon name="settings" /></button>
          </div>
          <div class="hdr-notify__body">
            <p v-if="!notifications.length" class="hdr-notify__empty">Chưa có thông báo nào.</p>
            <section v-for="g in notifyGroups" :key="g.name" class="hdr-notify__group">
              <h4 class="hdr-notify__group-title">{{ g.name }}</h4>
              <button v-for="n in g.items" :key="n.id" type="button" class="hdr-notify__item" :class="{ 'hdr-notify__item--unread': n.unread }" @click="panel = null; $emit('notify-select', n)">
                <span class="hdr-notify__avatar">
                  <img v-if="n.avatar" :src="n.avatar" alt="" />
                  <span v-else-if="n.icon" class="hdr-notify__avatar-icon" :class="`hdr-notify__avatar-icon--${n.tone || 'brand'}`"><TIcon :name="n.icon" /></span>
                  <span v-else class="hdr-notify__avatar-initials" :style="initialsStyle(n.name)">{{ initialsOf(n.name) }}</span>
                  <img v-if="n.badgeImg" :src="n.badgeImg" alt="" class="hdr-notify__badge-img" />
                  <span v-else-if="n.badgeIcon" class="hdr-notify__badge"><TIcon :name="n.badgeIcon" /></span>
                </span>
                <span class="hdr-notify__text">
                  <span class="hdr-notify__msg"><template v-for="(part, k) in msgParts(n.text)" :key="k"><b v-if="part.b">{{ part.t }}</b><template v-else>{{ part.t }}</template></template></span>
                  <span class="hdr-notify__time">{{ n.time }}</span>
                </span>
              </button>
            </section>
          </div>
        </div>

        <!-- Trợ giúp — Figma Header_Help (49869:3243) · Thêm — Header_More (49869:3244): nhóm có tiêu đề H3 · Menu List Item 32 · icon 20 -->
        <div v-if="(panel === 'help' && helpMenu.length) || (panel === 'more' && moreMenu.length) || (panel === 'settings' && settingsMenu.length)" ref="panelEl" class="hdr-pop hdr-menu" :class="`hdr-menu--${panel}`" :style="panelStyle" role="menu" @click.stop>
          <span class="hdr-pop__arrow" :style="{ right: panelArrow + 'px' }" />
          <template v-for="(sec, si) in (panel === 'help' ? helpMenu : [{ items: panel === 'settings' ? settingsItems : moreMenu }])" :key="si">
            <section class="hdr-menu__sec">
              <h4 v-if="sec.title" class="hdr-menu__title">{{ sec.title }}</h4>
              <template v-for="(it, i) in sec.items" :key="it.id || 'sep' + i">
                <div v-if="it.separator" class="hdr-menu__sep" role="separator" />
                <button v-else type="button" class="hdr-pop__item" role="menuitem" @click="onMenuSelect(it)">
                  <img v-if="it.img" :src="it.img" alt="" class="hdr-pop__img" /><TIcon v-else-if="it.icon" :name="it.icon" :style="it.color ? { color: it.color } : null" /><span class="hdr-pop__label">{{ it.label }}</span>
                </button>
              </template>
            </section>
          </template>
          <div v-if="panel === 'more' && $slots['more-footer']" class="hdr-menu__footer"><slot name="more-footer" /></div>
        </div>
      </Teleport>
      </div>
    </div>
  </header>

  <!-- ── Tools & Settings Popover ── -->
  <Teleport to="body">
    <Transition name="tools-pop">
      <div v-if="showToolsPopover" ref="toolsPopoverRef" class="tools-popover" :style="toolsPopoverStyle">
        <p class="tools-popover__title">Các tiện ích và thiết lập</p>
        <div class="tools-popover__body">
          <div class="tools-popover__columns">
            <div v-for="col in toolColumns" :key="col.title" class="tools-col">
              <p class="tools-col__title">{{ col.title }}</p>
              <button
                v-for="item in col.items" :key="item.label"
                class="tools-item"
                @click="onToolItemClick(item)"
              >
                {{ item.label }}
                <span v-if="item.tag" class="tools-item__tag">{{ item.tag }}</span>
              </button>
            </div>
          </div>
          <div class="tools-popover__side">
            <div v-for="sec in toolSideSections" :key="sec.title" class="tools-col">
              <p class="tools-col__title">{{ sec.title }}</p>
              <button
                v-for="item in sec.items" :key="item.label"
                class="tools-item"
                @click="onToolItemClick(item)"
              >
                {{ item.label }}
                <span v-if="item.tag" class="tools-item__tag">{{ item.tag }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Kết nối ứng dụng Dialog ── -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="showConnectApps" class="dialog-overlay connect-overlay" @mousedown.self="closeConnectApps">
        <Transition name="dialog">
          <div class="connect-dialog" @click.stop>
            <!-- Header -->
            <div class="connect-dialog__header">
              <h2 class="connect-dialog__title">Kết nối</h2>
              <div class="connect-dialog__header-actions">
                <button class="btn-icon" v-tip="'Trợ giúp'" aria-label="Trợ giúp"><TIcon name="help-circle" /></button>
                <button class="btn-icon" aria-label="Đóng" @click="closeConnectApps"><TIcon name="x" /></button>
              </div>
            </div>

            <!-- Sync info bar -->
            <div class="connect-syncbar">
              <div class="connect-syncbar__left">
                <TIcon name="database" />
                <span class="connect-syncbar__label">Dữ liệu đồng bộ với các ứng dụng AMIS</span>
                <span class="connect-version-tag">2025_2</span>
                <a class="connect-link" href="#" @click.prevent>Thay đổi</a>
              </div>
              <div class="connect-syncbar__right">
                <a class="connect-link" href="#" @click.prevent><TIcon name="external-link" /> Chuẩn hóa danh mục với AMIS Hệ thống</a>
                <a class="connect-link" href="#" @click.prevent><TIcon name="settings" /> Thiết lập đồng bộ dữ liệu</a>
              </div>
            </div>

            <!-- Body: sidebar + grid -->
            <div class="connect-body">
              <div class="connect-sidebar">
                <button
                  v-for="c in connectCategories" :key="c.id"
                  class="connect-sidebar__item"
                  :class="{ 'connect-sidebar__item--active': connectCategory === c.id }"
                  @click="connectCategory = c.id"
                >
                  <TIcon :name="c.icon" />
                  <span>{{ c.label }}</span>
                </button>
              </div>
              <div class="connect-grid-wrap">
                <div class="connect-toolbar">
                  <div class="connect-segment">
                    <button
                      v-for="t in connectTabs" :key="t.id"
                      class="connect-segment__item"
                      :class="{ 'connect-segment__item--active': connectTab === t.id }"
                      @click="connectTab = t.id"
                    >{{ t.label }}</button>
                  </div>
                  <div class="connect-search">
                    <TIcon name="search" />
                    <input :value="connectSearch" type="text" @input="connectSearch = $event.target.value" placeholder="Tìm kiếm ứng dụng..." />
                  </div>
                </div>
                <div class="connect-grid">
                  <div v-for="app in filteredConnectApps" :key="app.id" class="connect-card">
                    <div class="connect-card__head">
                      <div class="connect-card__icon" :style="{ background: app.color }">
                        <TIcon :name="app.icon" />
                      </div>
                      <div class="connect-card__title">
                        <span class="connect-card__name">{{ app.name }}</span>
                        <span class="connect-card__status" :class="app.connected ? 'is-connected' : 'is-pending'">
                          {{ app.connected ? 'Đã kết nối' : 'Chưa kết nối' }}
                        </span>
                      </div>
                      <div class="connect-card__actions">
                        <button class="btn-icon btn-icon--sm" v-tip="'Hướng dẫn'" aria-label="Hướng dẫn" @click.stop>
                          <TIcon name="help-circle" />
                        </button>
                        <button
                          class="btn btn--sm"
                          :class="app.connected ? 'btn--outline-danger' : 'btn--outline'"
                          @click.stop="toggleConnect(app)"
                        >
                          <TIcon :name="app.connected ? 'plug-connected' : 'plug'" />
                          {{ app.connected ? 'Ngắt kết nối' : 'Kết nối' }}
                        </button>
                      </div>
                    </div>
                    <p class="connect-card__desc">{{ app.desc }}</p>
                  </div>
                  <p v-if="!filteredConnectApps.length" class="connect-empty">Không có ứng dụng nào trong mục này.</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Settings Dialog ── -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="showSettings" class="dialog-overlay" @mousedown.self="cancelSettings">
        <Transition name="dialog">
          <div class="settings-dialog" @click.stop>
            <!-- Header -->
            <div class="settings-dialog__header">
              <span class="h2">Thiết lập màu sắc và hiển thị</span>
              <button class="btn-icon" aria-label="Đóng" @click="cancelSettings"><TIcon name="x" /></button>
            </div>

            <!-- Tabs -->
            <div class="settings-dialog__tabs">
              <button
                v-for="tab in dialogTabs" :key="tab.id"
                class="dialog-tab"
                :class="{ 'dialog-tab--active': activeTab === tab.id }"
                @click="activeTab = tab.id"
              >{{ tab.label }}</button>
            </div>

            <!-- Body -->
            <div class="settings-dialog__body">

              <!-- ── Tab: Thiết lập màu sắc ── -->
              <template v-if="activeTab === 'color'">

                <!-- Tiêu đề + Nền + Sidebar — luôn nằm trên, thấy ngay khi mở -->
                <div class="settings-options-row">
                  <div class="srow">
                    <span class="srow__label">Tiêu đề</span>
                    <div class="srow__btns">
                      <button v-for="m in modes" :key="m.value" class="sopt"
                        :class="{ 'sopt--active': draftMode === m.value }" type="button"
                        @click="draftMode = m.value">
                        <span class="sopt__dot" />{{ m.label }}
                      </button>
                    </div>
                  </div>
                  <div class="srow">
                    <span class="srow__label">Nền</span>
                    <div class="srow__btns">
                      <button v-for="t in bgTints" :key="t.value" class="sopt"
                        :class="{ 'sopt--active': draftBgTint === t.value }" type="button"
                        @click="draftBgTint = t.value">
                        <span class="sopt__dot" />{{ t.label }}
                      </button>
                    </div>
                  </div>
                  <div class="srow">
                    <span class="srow__label">Sidebar</span>
                    <div class="srow__btns">
                      <!-- Sidebar nền tối chỉ đi với Tiêu đề màu trắng (Tiêu đề màu → sidebar luôn nền trắng) -->
                      <button v-for="s in sidebarModes" :key="s.value" class="sopt" type="button"
                        :class="{ 'sopt--active': draftSidebarMode === s.value, 'sopt--disabled': s.value === 'dark' && !sidebarDarkAllowed(draftMode) }"
                        :aria-disabled="s.value === 'dark' && !sidebarDarkAllowed(draftMode) ? 'true' : null"
                        v-tip="s.value === 'dark' && !sidebarDarkAllowed(draftMode) ? 'Chỉ dùng được khi Tiêu đề màu trắng' : ''"
                        @click="(s.value !== 'dark' || sidebarDarkAllowed(draftMode)) && (draftSidebarMode = s.value)">
                        <span class="sopt__dot" />{{ s.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <p class="settings-section-title">Lựa chọn màu sắc bạn muốn hiển thị trên phần mềm</p>

                <!-- Color swatches -->
                <div class="color-swatches">
                  <div
                    v-for="c in COLORS" :key="c.id"
                    class="color-swatch"
                    :class="{ 'color-swatch--selected': draftColor === c.id }"
                    :style="draftColor === c.id ? { borderColor: c.main } : {}"
                    @click="draftColor = c.id"
                  >
                    <div class="color-swatch__preview">
                      <div
                        v-if="draftColor === c.id"
                        class="color-swatch__check"
                        :style="{ background: c.main }"
                      >
                        <TIcon name="check" />
                      </div>
                      <div class="color-swatch__block-left"  :style="{ background: c.light }"></div>
                      <div class="color-swatch__block-right" :style="{ background: c.gradient || c.main }"></div>
                    </div>
                    <span class="color-swatch__label">{{ c.label }}</span>
                  </div>
                </div>

                <!-- App mini preview -->
                <div class="preview-wrap" ref="previewWrapRef">
                  <div class="preview-inner" ref="previewInnerRef">
                    <!-- Mini App Shell -->
                    <div class="mini-app">
                      <!-- Mini Header -->
                      <div class="mini-header" :style="miniHeaderStyle">
                        <div class="mini-header-left">
                          <div style="width:14px;height:14px;border-radius:3px;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center">
                            <div style="width:8px;height:8px;border-radius:50%;background:var(--bg-brand)"></div>
                          </div>
                          <div style="width:60px;height:8px;background:rgba(255,255,255,0.8);border-radius:3px"></div>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px">
                          <div style="width:120px;height:18px;background:rgba(255,255,255,0.2);border-radius:4px"></div>
                        </div>
                        <div style="display:flex;align-items:center;gap:5px">
                          <div v-for="i in 5" :key="i" style="width:18px;height:18px;border-radius:4px;background:rgba(255,255,255,0.2)"></div>
                          <div style="width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,0.9)"></div>
                        </div>
                      </div>
                      <!-- Mini Sub-nav -->
                      <div class="mini-subnav">
                        <div v-for="(t,i) in ['Trợ lý AI','Tổng quan','Tính năng mới']" :key="i"
                          class="mini-subnav-tab"
                          :class="{ active: i===1 }"
                          :style="i===1 ? { color: previewColor.main, borderBottomColor: previewColor.main } : {}"
                        >{{ t }}</div>
                        <div style="flex:1"></div>
                        <div style="display:flex;align-items:center;gap:4px;font-size:9px;color:var(--text-brand);padding-bottom:6px" :style="{color: previewColor.main}">
                          <TIcon name="player-play" style="font-size:9px" /> Bắt đầu sử dụng
                        </div>
                      </div>
                      <!-- Mini Body -->
                      <div class="mini-body" :style="{ background: draftBgTint === 'color' ? previewColor.light : '#f0f2f4' }">
                        <!-- Mini Sidebar -->
                        <div class="mini-sidebar" :style="miniSidebarStyle">
                          <div style="padding:6px 4px 4px">
                            <div style="width:100%;height:16px;border-radius:3px;border:1px solid"
                              :style="{ borderColor: draftSidebarMode === 'dark' ? 'rgba(255,255,255,0.2)' : previewColor.main }"></div>
                          </div>
                          <div style="display:flex;flex-direction:column;gap:2px;padding:4px">
                            <div v-for="(item,i) in sidebarItems" :key="i"
                              style="display:flex;align-items:center;gap:4px;height:20px;padding:0 4px;border-radius:3px"
                              :style="i===activeNav
                                ? (draftSidebarMode === 'dark' ? { background: previewColor.main } : { background: previewColor.light })
                                : {}"
                            >
                              <div style="width:10px;height:10px;border-radius:2px;flex-shrink:0"
                                :style="{ background: i===activeNav ? 'rgba(255,255,255,0.9)' : (draftSidebarMode === 'dark' ? 'rgba(255,255,255,0.28)' : '#d5d7da') }"></div>
                              <div style="height:6px;border-radius:2px;flex:1"
                                :style="{ background: i===activeNav ? 'rgba(255,255,255,0.7)' : (draftSidebarMode === 'dark' ? 'rgba(255,255,255,0.2)' : '#d5d7da') }"></div>
                            </div>
                          </div>
                        </div>
                        <!-- Mini Main -->
                        <div class="mini-main">
                          <!-- Page header -->
                          <div style="display:flex;align-items:center;justify-content:space-between;height:28px;padding:0 10px;background:white;border-bottom:1px solid #e9eaeb;flex-shrink:0;gap:6px">
                            <div style="display:flex;align-items:center;gap:6px">
                              <div style="height:16px;width:90px;background:#f0f2f4;border-radius:3px;border:1px solid #d5d7da"></div>
                              <div style="height:16px;width:70px;background:#f0f2f4;border-radius:3px;border:1px solid #d5d7da"></div>
                              <div style="height:16px;width:55px;background:#f0f2f4;border-radius:3px;border:1px solid #d5d7da"></div>
                            </div>
                            <div style="display:flex;gap:5px">
                              <div style="height:16px;padding:0 8px;border-radius:3px;display:flex;align-items:center;font-size:7px;font-weight:600;white-space:nowrap"
                                :style="{ background: previewColor.light, color: previewColor.main }">
                                Phân tích với AVA
                              </div>
                              <div style="height:16px;padding:0 8px;border-radius:3px;border:1px solid #d5d7da;display:flex;align-items:center;font-size:7px;color:#717680">Tùy chỉnh</div>
                            </div>
                          </div>
                          <!-- Content -->
                          <div style="flex:1;overflow:hidden;padding:8px;display:flex;flex-direction:column;gap:8px">
                            <!-- Row 1: 3 stat cards -->
                            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
                              <div v-for="i in 3" :key="i" style="background:white;border-radius:5px;padding:8px;box-shadow:var(--shadow-card)">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                                  <div style="height:7px;width:60px;background:#f0f2f4;border-radius:2px"></div>
                                  <div style="height:14px;width:40px;background:#f0f2f4;border-radius:2px"></div>
                                </div>
                                <div style="height:14px;width:70%;background:#e9eaeb;border-radius:3px;margin-bottom:4px"></div>
                                <div style="height:7px;width:50%;background:#f0f2f4;border-radius:2px"></div>
                              </div>
                            </div>
                            <!-- Row 2: chart + pie -->
                            <div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;flex:1">
                              <div style="background:white;border-radius:5px;padding:8px;box-shadow:var(--shadow-card)">
                                <div style="height:7px;width:80px;background:#f0f2f4;border-radius:2px;margin-bottom:8px"></div>
                                <div style="height:60%;position:relative;overflow:hidden">
                                  <svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none">
                                    <polyline
                                      :points="`0,60 40,45 80,55 120,30 160,40 200,20 240,35 280,15 300,25`"
                                      fill="none" :stroke="previewColor.main" stroke-width="1.5"
                                    />
                                    <polyline
                                      :points="`0,70 40,65 80,68 120,50 160,60 200,45 240,55 280,40 300,50`"
                                      fill="none" stroke="#f79009" stroke-width="1.5" stroke-dasharray="3,2"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <div style="background:white;border-radius:5px;padding:8px;box-shadow:var(--shadow-card);display:flex;flex-direction:column;align-items:center;justify-content:center">
                                <svg width="60" height="60" viewBox="0 0 60 60">
                                  <circle cx="30" cy="30" r="22" fill="none" stroke="#e9eaeb" stroke-width="8"/>
                                  <circle cx="30" cy="30" r="22" fill="none" :stroke="previewColor.main" stroke-width="8"
                                    stroke-dasharray="80 58" stroke-dashoffset="-14" stroke-linecap="round"/>
                                </svg>
                                <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;width:100%">
                                  <div v-for="i in 4" :key="i" style="display:flex;align-items:center;gap:4px">
                                    <div style="width:7px;height:7px;border-radius:2px;flex-shrink:0"
                                      :style="{ background: i===1 ? previewColor.main : '#d5d7da' }"></div>
                                    <div style="height:5px;flex:1;background:#f0f2f4;border-radius:2px"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ── Tab: Thiết lập hiển thị ── -->
              <template v-else-if="activeTab === 'display'">
                <p class="settings-section-title">Lựa chọn mật độ hiển thị dữ liệu trên phần mềm</p>
                <div class="density-options">
                  <label
                    v-for="d in DENSITIES" :key="d.id"
                    class="density-item"
                    :class="{ 'density-item--active': draftDensity === d.id }"
                    @click="draftDensity = d.id"
                  >
                    <div class="density-item__radio">
                      <span class="radio-circle" :class="{ 'radio-circle--checked': draftDensity === d.id }"></span>
                    </div>
                    <div class="density-item__preview">
                      <div v-for="i in 3" :key="i" class="density-row-mock" :style="{ height: d.height + 'px' }">
                        <div class="density-row-mock__bar"></div>
                        <div class="density-row-mock__bar density-row-mock__bar--short"></div>
                      </div>
                    </div>
                    <div class="density-item__info">
                      <span class="density-item__label">{{ d.label }}</span>
                      <span class="density-item__desc">{{ d.description }}</span>
                    </div>
                  </label>
                </div>
                <!-- Cỡ chữ — Figma collection 🔢 Font Size (Small · Medium · Large); màn ≤ 640px tự dùng mode Mobile Responsive -->
                <p class="settings-section-title settings-section-title--gap">Cỡ chữ</p>
                <div class="density-options">
                  <label v-for="f in FONT_SIZES" :key="f.id" class="density-item" :class="{ 'density-item--active': draftFontSize === f.id }" @click="draftFontSize = f.id">
                    <div class="density-item__radio">
                      <span class="radio-circle" :class="{ 'radio-circle--checked': draftFontSize === f.id }"></span>
                    </div>
                    <div class="density-item__preview font-size-preview font-size-scope" :data-font-size="f.id">
                      <span class="font-size-preview__h">Tiêu đề</span>
                      <span class="font-size-preview__b">Nội dung chữ thường</span>
                    </div>
                    <div class="density-item__info">
                      <span class="density-item__label">{{ f.label }}</span>
                      <span class="density-item__desc">{{ f.description }}</span>
                    </div>
                  </label>
                </div>
              </template>

              <!-- ── Tab: Hình nền ── -->
              <template v-else-if="activeTab === 'wallpaper'">
                <p class="settings-section-title">Chọn hình nền cho ứng dụng</p>
                <div class="wallpaper-grid">
                  <!-- Tùy chọn: Không có -->
                  <div
                    class="wallpaper-item wallpaper-item--none"
                    :class="{ 'wallpaper-item--selected': draftWallpaper === 'none' }"
                    @click="draftWallpaper = 'none'"
                  >
                    <div class="wallpaper-item__thumb wallpaper-item__thumb--none">
                      <TIcon name="x" style="font-size:28px;color:var(--text-hint)" />
                    </div>
                    <span class="wallpaper-item__label">Không có</span>
                    <span v-if="draftWallpaper === 'none'" class="wallpaper-check"><TIcon name="check" /></span>
                  </div>
                  <!-- Preset images -->
                  <div
                    v-for="wp in WALLPAPERS.filter(w => w.id !== 'none')"
                    :key="wp.id"
                    class="wallpaper-item"
                    :class="{ 'wallpaper-item--selected': draftWallpaper === wp.id }"
                    @click="draftWallpaper = wp.id"
                  >
                    <div
                      class="wallpaper-item__thumb"
                      :style="{ backgroundImage: wp.type === 'gradient' ? wp.thumb : `url(${wp.thumb})` }"
                    ></div>
                    <span class="wallpaper-item__label">{{ wp.label }}</span>
                    <span v-if="draftWallpaper === wp.id" class="wallpaper-check"><TIcon name="check" /></span>
                  </div>
                </div>
                <!-- Preview live nhỏ -->
                <div v-if="draftWallpaper !== 'none'" class="wallpaper-preview-wrap">
                  <div
                    class="wallpaper-preview"
                    :style="{ backgroundImage: WALLPAPERS.find(w=>w.id===draftWallpaper)?.type === 'gradient' ? WALLPAPERS.find(w=>w.id===draftWallpaper)?.thumb : `url(${WALLPAPERS.find(w=>w.id===draftWallpaper)?.thumb})` }"
                  >
                    <div class="wp-preview-header"></div>
                    <div class="wp-preview-body">
                      <div class="wp-preview-sidebar"></div>
                      <div class="wp-preview-main">
                        <div class="wp-preview-card"></div>
                        <div class="wp-preview-card"></div>
                        <div class="wp-preview-card wp-preview-card--wide"></div>
                      </div>
                    </div>
                  </div>
                  <p class="wp-preview-note">Kính mờ (glass) được áp dụng trên toàn bộ giao diện</p>
                </div>
              </template>

              <!-- ── Tab placeholders ── -->
              <template v-else>
                <div class="settings-placeholder">
                  <TIcon name="tool" style="font-size:48px;color:var(--text-hint)" />
                  <p class="text-secondary" style="margin-top:12px">Đang phát triển...</p>
                </div>
              </template>
            </div>

            <!-- Footer -->
            <div class="settings-dialog__footer">
              <button class="btn btn--outline" @click="cancelSettings">Hủy</button>
              <button class="btn btn--primary" @click="saveSettings">Lưu</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import { avatarInitials as avatarInitialsOf, avatarColor } from '../utils/avatar.js'
import { ref, computed, watch, nextTick, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { COLORS, currentTheme, applyTheme, currentMode, applyMode, currentBgTint, applyBgTint, DENSITIES, currentDensity, applyDensity, FONT_SIZES, currentFontSize, applyFontSize, WALLPAPERS, currentWallpaper, applyWallpaper, currentSidebarMode, applySidebarMode, sidebarDarkAllowed } from '../theme.js'
import TIcon        from './TIcon.vue'
import AppGlobalSearch from './AppGlobalSearch.vue'
import AppSearchResultsDialog from './AppSearchResultsDialog.vue'
import IconMisaAI   from './IconMisaAI.vue'

const props = defineProps({
  appName: { type: String, default: 'Kế Toán' },
  appTag:  { type: String, default: '' },
  /** Ép nền header: 'color' (nền màu chủ đề) | 'light' (nền trắng) — bỏ trống = theo Thiết lập hiển thị của người dùng (VD khung ví dụ trong tài liệu) */
  mode:    { type: String, default: '' },
  noMeta:  { type: Boolean, default: false },
  hideTrialBanner: { type: Boolean, default: false },
  /** true: nút bánh răng mở thẳng "Thiết lập màu sắc và hiển thị" (bỏ bảng tiện ích & thiết lập) */
  settingsOnly:    { type: Boolean, default: false },
  /** Tên người dùng → avatar chữ cái đầu; để trống giữ avatar mặc định */
  avatarName:      { type: String,  default: '' },
  /** Ẩn các công cụ không dùng: 'apps' (nút 9 chấm) | 'search' | 'ai' | 'notify' | 'help' | 'more' */
  hideTools:       { type: Array,   default: () => [] },
  /** Mục thêm vào menu bánh răng: [{ id, icon, label }] — có giá trị thì bánh răng xổ menu
      (mục đầu luôn là “Thiết lập hiển thị”); chọn mục của app → emit('settings-select', item) */
  settingsMenu:    { type: Array,   default: () => [] },
  /** Thông tin tài khoản hiện trong menu avatar: email, vai trò, ảnh (Google picture) */
  userEmail:       { type: String,  default: '' },
  userRole:        { type: String,  default: '' },
  userPicture:     { type: String,  default: '' },
  /** Mục thêm vào menu avatar (trên Đăng xuất): [{ id, icon, label } | { separator: true }] → emit('profile-select', item) */
  profileMenu:     { type: Array,   default: () => [] },
  /** Ẩn avatar / menu tài khoản — trang công khai khi người xem chưa đăng nhập (đặt nút “Đăng nhập” vào slot header-end) */
  hideAvatar:      { type: Boolean, default: false },
  /** Ô tìm kiếm toàn cục (bắt @search mới xổ kết quả): nhóm theo phân hệ [{ key, title, total, items: [{ id, name, subtitle, meta, avatar }] }] — null = chưa tìm */
  searchPlaceholder: { type: String, default: 'Tìm kiếm' },
  searchResults:   { type: Array,   default: null },
  /** Popup “Xem thêm” của 1 phân hệ: toàn bộ kết quả của phân hệ đó (null = đang nạp) — app nạp khi nhận @search-more(group, q) */
  searchMoreItems: { type: Array,   default: null },
  searchMoreTotal: { type: Number,  default: null },
  searchMoreLoading: { type: Boolean, default: false },
  searchLoading:   { type: Boolean, default: false },
  searchPanelWidth: { type: Number, default: 640 },
  /** Địa chỉ trang chủ khi bấm logo / tên app (app dùng router: bắt @home để điều hướng) */
  homeHref:        { type: String,  default: '/' },
  /** Danh sách ứng dụng cho nút 9 chấm: [{ id, label, img (logo), href }] — có giá trị thì bấm 9 chấm xổ menu chuyển app */
  apps:            { type: Array,   default: () => [] },
  /** id của ứng dụng đang dùng trong apps (được đánh dấu ✓, chọn lại không làm gì) */
  currentApp:      { type: String,  default: '' },
  /** Popover Thông báo (Figma Header_Notification): [{ id, group ('Hôm nay' | 'Trước đó'…), text ('**đậm** thường'), time, unread?, avatar? | icon? + tone? | name?, badgeIcon? | badgeImg? }]
      null = chuông không xổ (giữ như cũ) */
  notifications:   { type: Array,   default: null },
  /** Số trên chuông (mặc định = số thông báo chưa đọc) */
  notifyCount:     { type: Number,  default: null },
  /** Popover Trợ giúp (Header_Help): [{ title, items: [{ id, icon | img, label, color? }] }] → emit('help-select', item) */
  helpMenu:        { type: Array,   default: () => [] },
  /** Popover Thêm ⋯ (Header_More): [{ id, icon, label } | { separator: true }] + slot more-footer (VD khối cài app mobile) → emit('more-select', item) */
  moreMenu:        { type: Array,   default: () => [] },
  /** Menu tài khoản: khung công ty / dữ liệu đang làm việc (có ›) — [{ id, icon, label }] → emit('profile-select', item) */
  profileContext:  { type: Array,   default: () => [] },
  /** Dòng ngôn ngữ cuối menu tài khoản: { label: 'Tiếng Việt', flag?: url } → emit('profile-select', { id: '__language' }) */
  language:        { type: Object,  default: null },
})
const appItems = computed(() => props.apps.map(a => ({ ...a, checked: a.id === props.currentApp })))
const onAppSelect = a => { if (a.id === props.currentApp) return; emit('app-select', a); if (a.href) window.location.href = a.href }   // không có href → app tự xử lý qua @app-select
/* Ảnh tài khoản (Google) lỗi / hết hạn → hiện chữ cái đầu */
const picBroken = ref(false)
watch(() => props.userPicture, () => { picBroken.value = false })
const emit = defineEmits(['settings-select', 'home', 'logout', 'profile-select', 'app-select', 'notify-select', 'notify-action', 'help-select', 'more-select', 'search', 'search-select', 'search-more'])

/* ── Menu tài khoản (bấm avatar) ── */
const profileOpen = ref(false), profileStyle = ref({}), avatarBtnRef = ref(null), profileRef = ref(null)
const more = ref(null)   // { group, q } — popup kết quả của 1 phân hệ đang mở
function openMore(group, q) { more.value = { group, q }; emit('search-more', group, q) }
const hasSearch = computed(() => !!inst?.vnode.props?.onSearch)   // app bắt @search → ô tìm kiếm xổ kết quả
const hasLogout = computed(() => !!inst?.vnode.props?.onLogout)   // app bắt @logout → hiện “Đăng xuất”
function onProfileOutside(e) { if (!profileRef.value?.contains(e.target) && !avatarBtnRef.value?.contains(e.target)) closeProfile() }
function onProfileKey(e) { if (e.key === 'Escape') closeProfile() }
const profileArrow = ref(16)
function toggleProfile() {
  if (profileOpen.value) return closeProfile()
  panel.value = null
  const r = avatarBtnRef.value.getBoundingClientRect(), right = Math.max(8, window.innerWidth - r.right - 8)
  profileStyle.value = { top: r.bottom + 12 + 'px', right: right + 'px' }
  profileArrow.value = Math.max(12, window.innerWidth - right - (r.left + r.width / 2) - 7)   // mũi nhọn chỉ đúng giữa avatar
  profileOpen.value = true
  document.addEventListener('mousedown', onProfileOutside, true); document.addEventListener('keydown', onProfileKey)
}
function closeProfile() {
  profileOpen.value = false
  document.removeEventListener('mousedown', onProfileOutside, true); document.removeEventListener('keydown', onProfileKey)
}
function onProfileItem(it) { closeProfile(); emit('profile-select', it) }
function onLogout() { closeProfile(); emit('logout') }
onUnmounted(closeProfile)
const inst = getCurrentInstance()
function onHome(e) { if (inst?.vnode.props?.onHome) { e.preventDefault(); emit('home') } }
const settingsItems = computed(() => [{ id: '__display', icon: 'palette', label: 'Thiết lập hiển thị' }, ...props.settingsMenu])
function onSettingsSelect(item) { if (item.id === '__display') openSettings(); else if (item.action === 'connect-apps') openConnectApps(); else emit('settings-select', item) }   // item.action 'connect-apps' → mở sẵn dialog Kết nối ứng dụng
const hidden = k => props.hideTools.includes(k)

/* ── Popover Thông báo / Trợ giúp / Thêm (Figma Global Header) — xổ dưới icon, mép phải canh theo icon, mũi nhọn chỉ giữa icon ── */
const panel = ref(null), panelEl = ref(null), panelStyle = ref({}), panelArrow = ref(16)
const panelBtn = {}
const APP_TILE = 152, APP_GAP = 8
const appCols = computed(() => Math.min(3, Math.max(1, props.apps.length)))
const PANEL_W = { notify: 434, help: 296, more: 288, settings: 296, get apps() { return appCols.value * APP_TILE + (appCols.value - 1) * APP_GAP + 32 } }
function togglePanel(name) {
  if (panel.value === name) return (panel.value = null)
  closeProfile()
  const r = panelBtn[name]?.getBoundingClientRect(); if (!r) return
  const w = Math.min(PANEL_W[name], window.innerWidth - 16)
  const center = r.left + r.width / 2
  const left = name === 'apps'
    ? Math.max(8, Math.min(center - 28, window.innerWidth - w - 8))     // nút 9 chấm ở bên trái → popover mở sang phải
    : Math.max(8, Math.min(center + 40 - w, window.innerWidth - w - 8))   // icon nằm gần mép phải popover
  panelStyle.value = { top: r.bottom + 12 + 'px', left: left + 'px', width: w + 'px' }
  panelArrow.value = Math.max(12, Math.min(w - 26, left + w - center - 7))
  panel.value = name
}
const onPanelOutside = e => { if (panel.value && !panelEl.value?.contains(e.target) && !Object.values(panelBtn).some(b => b?.contains?.(e.target))) panel.value = null }
const onPanelKey = e => { if (e.key === 'Escape') panel.value = null }
watch(panel, v => {
  if (v) { document.addEventListener('mousedown', onPanelOutside, true); document.addEventListener('keydown', onPanelKey) }
  else { document.removeEventListener('mousedown', onPanelOutside, true); document.removeEventListener('keydown', onPanelKey) }
})
onUnmounted(() => { panel.value = null })
const notifyBadge = computed(() => { const n = props.notifyCount ?? (props.notifications ? props.notifications.filter(x => x.unread).length : 9); return n > 99 ? '99+' : n || '' })
const notifyGroups = computed(() => { const m = new Map(); for (const n of props.notifications || []) { const g = n.group || 'Thông báo'; if (!m.has(g)) m.set(g, []); m.get(g).push(n) } return [...m].map(([name, items]) => ({ name, items })) })
/* '**Nguyễn A** đã bình luận' → các đoạn đậm / thường (không dùng v-html) */
const msgParts = t => String(t || '').split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(x => (x.startsWith('**') ? { b: true, t: x.slice(2, -2) } : { b: false, t: x }))
function onMenuSelect(it) { const name = panel.value; panel.value = null; if (name === 'settings') return onSettingsSelect(it); emit(name === 'help' ? 'help-select' : 'more-select', it) }
const initialsOf = n => avatarInitialsOf(n || '')
const initialsStyle = n => { const c = avatarColor(n || ''); return { background: c.bg, color: c.fg } }

/* ── Avatar chữ cái đầu — cùng quy tắc & bảng màu với DataTable ── */
const avatarInitials = computed(() => avatarInitialsOf(props.avatarName))
const avatarStyle = computed(() => { const c = avatarColor(props.avatarName); return { background: c.bg, color: c.fg } })

/* ── Trial expiry banner ── */
const showTrialBanner = ref(!props.hideTrialBanner)
const trialDaysLeft   = ref(7)

/* ── Tools & Settings popover ── */
const toolsBtnRef       = ref(null)
const toolsPopoverRef   = ref(null)
const showToolsPopover  = ref(false)
const toolsPopoverStyle = ref({})

const toolColumns = [
  {
    title: 'Nghiệp vụ',
    items: [
      { label: 'Quản lý danh mục' },
      { label: 'Nhập số dư ban đầu' },
    ],
  },
  {
    title: 'Tiện ích',
    items: [
      { label: 'Bảo trì dữ liệu' },
      { label: 'Ghi sổ/bỏ ghi theo lô' },
      { label: 'Đánh lại số chứng từ' },
      { label: 'Phục hồi chứng từ đã xóa nhầm' },
      { label: 'Lấy chứng từ từ dữ liệu khác' },
      { label: 'Kiểm tra đối chiếu chứng từ, sổ sách' },
      { label: 'Kiểm soát hồ sơ và hạch toán', tag: 'Mới' },
      { label: 'Gợi ý, nhắc nhở thông minh' },
      { label: 'Tra cứu thông tin doanh nghiệp' },
      { label: 'Nhật ký truy cập' },
      { label: 'Mã QR thanh toán' },
    ],
  },
  {
    title: 'Công cụ khác',
    items: [
      { label: 'Hướng dẫn chuyển đổi từ SME' },
      { label: 'Chuyển đổi từ AMIS Kế toán bản cũ' },
      { label: 'Danh sách lệnh tính giá, bảo trì,... đang thực hiện' },
      { label: 'Xóa bộ nhớ đệm nâng cao' },
      { label: 'Cập nhật số dư từ dữ liệu năm trước' },
      { label: 'Danh sách người dùng đang truy cập', tag: 'Mới' },
    ],
  },
]

const toolSideSections = [
  {
    title: 'Công ty của bạn',
    items: [
      { label: 'Thông tin công ty' },
      { label: 'Quản lý người dùng và phân quyền', tag: 'Mới' },
      { label: 'Quản lý dữ liệu' },
    ],
  },
  {
    title: 'Thiết lập',
    items: [
      { label: 'Tùy chọn' },
      { label: 'Ngày hạch toán' },
      { label: 'Kết nối ứng dụng', action: 'connect-apps' },
      { label: 'Ngôn ngữ' },
      { label: 'Thiết lập cấu hình gửi email' },
      { label: 'Thiết lập ký số' },
      { label: 'Thiết lập màu sắc và hiển thị', action: 'color-settings' },
    ],
  },
]

function openToolsPopover() {
  if (toolsBtnRef.value) {
    const rect = toolsBtnRef.value.getBoundingClientRect()
    toolsPopoverStyle.value = {
      position: 'fixed',
      top:   (rect.bottom + 8) + 'px',
      right: (window.innerWidth - rect.right) + 'px',
      zIndex: 'var(--z-header-pop)',   // menu xổ từ header: luôn trên drawer / panel
    }
  }
  showToolsPopover.value = true
}
function closeToolsPopover() { showToolsPopover.value = false }
function onToolItemClick(item) {
  closeToolsPopover()
  if (item.action === 'color-settings') openSettings()
  if (item.action === 'connect-apps')  openConnectApps()
}

/* ── Kết nối ứng dụng dialog ── */
const showConnectApps = ref(false)
const connectTab      = ref('all')
const connectCategory = ref('all')
const connectSearch   = ref('')

const connectTabs = [
  { id: 'all',      label: 'Tất cả' },
  { id: 'misa',     label: 'Trong MISA' },
  { id: 'external', label: 'Ngoài MISA' },
]

const connectCategories = [
  { id: 'all',           label: 'Tất cả',                       icon: 'check' },
  { id: 'amis',          label: 'Ứng dụng AMIS',                icon: 'apps' },
  { id: 'sales-app',     label: 'Ứng dụng bán hàng',            icon: 'shopping-cart' },
  { id: 'edoc',          label: 'Tài liệu điện tử',              icon: 'file-text' },
  { id: 'ecommerce',     label: 'Sàn thương mại điện tử',        icon: 'building-community' },
  { id: 'pharma-db',     label: 'Cơ sở DL Dược Quốc Gia',        icon: 'building-bank' },
  { id: 'emis',          label: 'Kết nối EMIS',                  icon: 'link' },
  { id: 'api',           label: 'API Kết Nối',                   icon: 'git-branch' },
  { id: 'unified-data',  label: 'Kết nối dữ liệu hợp nhất',      icon: 'transfer' },
]

const connectApps = ref([
  { id: 'crm',        name: 'CRM',                icon: 'users-group',     color: '#2f6fed', connected: true,  group: 'misa',     category: 'amis',       desc: 'Các dữ liệu sẽ được đồng bộ với AMIS CRM: Đơn đặt hàng/hợp đồng, Chính sách giá, Đề nghị xuất hóa đơn.' },
  { id: 'payroll',    name: 'Tiền lương',          icon: 'cash',            color: '#17a34a', connected: false, group: 'misa',     category: 'amis',       desc: 'Kết nối với ứng dụng AMIS Tiền lương để tiếp nhận bảng tổng hợp phân bổ lương, bảng chi trả lương để hạch toá...' },
  { id: 'timekeeping',name: 'Chấm công',           icon: 'fingerprint',     color: '#f97316', connected: true,  group: 'misa',     category: 'amis',       desc: 'Kết nối với ứng dụng AMIS Chấm công để tiếp nhận bảng chấm công tổng hợp vào dữ liệu kế toán đã được thiết l...' },
  { id: 'pit',        name: 'Thuế TNCN',           icon: 'file-invoice',    color: '#2563eb', connected: false, group: 'misa',     category: 'amis',       desc: 'Kết nối ứng dụng AMIS Thuế TNCN để lập và gửi chứng từ khấu trừ Thuế TNCN cho người lao động ngay trên...' },
  { id: 'workflow',   name: 'Quy trình',           icon: 'sitemap',         color: '#4f46e5', connected: true,  group: 'misa',     category: 'amis',       desc: 'Kết nối với ứng dụng AMIS Quy trình để tiếp nhận đề nghị thu chi, đề nghị thanh quyết toán tạm ứng về AMIS Kế...' },
  { id: 'social',     name: 'Mạng xã hội',         icon: 'message-circle',  color: '#7c3aed', connected: true,  group: 'misa',     category: 'amis',       desc: 'Kết nối với ứng dụng AMIS Mạng xã hội để tự động đồng bộ số liệu kế toán về tình hình tài chính, kết quả hoạt...' },
  { id: 'purchasing', name: 'Mua hàng',            icon: 'mail',            color: '#2563eb', connected: false, group: 'misa',     category: 'amis',       desc: 'Kết nối với ứng dụng AMIS Mua hàng để tiếp nhận đơn mua hàng về AMIS Kế toán và cập nhật tình trạng giao...' },
  { id: 'asset',      name: 'Quản lý tài sản',     icon: 'package',         color: '#16a34a', connected: false, group: 'misa',     category: 'amis',       desc: 'Kết nối với ứng dụng AMIS Tài sản để đồng bộ ghi tăng, đánh giá lại, điều chuyển, ghi giảm, kiểm kê Tài sản cố...' },
  { id: 'cukcuk',     name: 'CukCuk',              icon: 'device-desktop',  color: '#2563eb', connected: false, group: 'external', category: 'sales-app',  desc: 'Tích hợp với phần mềm MISA CUKCUK để tự động hạch toán chứng từ mua – bán hàng hóa, dịch vụ, thu –...' },
  { id: 'eshop',      name: 'EShop',               icon: 'shopping-cart',   color: '#0d9488', connected: false, group: 'external', category: 'sales-app',  desc: 'Tích hợp với phần mềm MISA eShop để tự động hạch toán chứng từ mua – bán hàng hóa, dịch vụ, thu – chi,...' },
  { id: 'eshopv2',    name: 'EShopV2',             icon: 'shopping-cart',   color: '#0d9488', connected: false, group: 'external', category: 'sales-app',  desc: 'Tích hợp với phần mềm MISA eShop V2 để tự động hạch toán chứng từ mua – bán hàng hóa, dịch vụ, thu – chi,...' },
  { id: 'wesign',     name: 'Wesign',              icon: 'file-certificate',color: '#2563eb', connected: false, group: 'external', category: 'edoc',       desc: 'Kết nối với ứng dụng AMIS WeSign ký các loại chứng từ kế toán một cách đơn giản, tiện lợi.' },
  { id: 'shopee',     name: 'Shopee',              icon: 'shopping-cart',   color: '#f97316', connected: false, group: 'external', category: 'ecommerce',  desc: 'Kết nối với sàn Shopee để đồng bộ đơn hàng, doanh thu bán hàng về AMIS Kế toán.' },
  { id: 'tiktok',     name: 'Tiktok',              icon: 'message-circle',  color: '#111827', connected: false, group: 'external', category: 'ecommerce',  desc: 'Kết nối với sàn TikTok Shop để đồng bộ đơn hàng, doanh thu bán hàng về AMIS Kế toán.' },
  { id: 'pharma',     name: 'Cơ sở DL Dược Quốc Gia', icon: 'building-bank',color: '#0d9488', connected: false, group: 'external', category: 'pharma-db',  desc: 'Kết nối với Cơ sở dữ liệu Dược Quốc gia để tra cứu, đối chiếu thông tin thuốc, dược phẩm.' },
  { id: 'emis-kg',    name: 'EMIS Kindergarten',   icon: 'book',            color: '#16a34a', connected: false, group: 'misa',     category: 'emis',       desc: 'Kết nối với ứng dụng EMIS Kindergarten để đồng bộ dữ liệu học phí, thu chi trường mầm non.' },
])

const filteredConnectApps = computed(() => {
  const q = connectSearch.value.trim().toLowerCase()
  return connectApps.value.filter(app => {
    if (connectTab.value !== 'all' && app.group !== connectTab.value) return false
    if (connectCategory.value !== 'all' && app.category !== connectCategory.value) return false
    if (q && !app.name.toLowerCase().includes(q)) return false
    return true
  })
})

function openConnectApps()  { showConnectApps.value = true }
function closeConnectApps() { showConnectApps.value = false }
function toggleConnect(app) { app.connected = !app.connected }

function onDocMousedown(e) {
  const inToolsBtn = toolsBtnRef.value?.contains(e.target)
  const inToolsPop = toolsPopoverRef.value?.contains(e.target)
  if (!inToolsBtn && !inToolsPop) closeToolsPopover()
}
function onDocKeydown(e) {
  if (e.key === 'Escape') closeToolsPopover()
}
onMounted(() => {
  document.addEventListener('mousedown', onDocMousedown)
  document.addEventListener('keydown', onDocKeydown)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocMousedown)
  document.removeEventListener('keydown', onDocKeydown)
})

/* ── Dialog state ── */
const showSettings = ref(false)
const activeTab    = ref('color')
const draftColor     = ref(currentTheme.value)
const draftMode      = ref(currentMode.value)
const draftBgTint    = ref(currentBgTint.value)
const draftDensity   = ref(currentDensity.value)
const draftFontSize  = ref(currentFontSize.value)
const draftWallpaper    = ref(currentWallpaper.value)
const draftSidebarMode  = ref(currentSidebarMode.value)

watch(draftMode, m => { if (!sidebarDarkAllowed(m)) draftSidebarMode.value = 'light' })   // chọn Tiêu đề màu → sidebar về nền trắng

const sidebarModes = [
  { value: 'light', label: 'Nền trắng' },
  { value: 'dark',  label: 'Nền tối' },
]

const dialogTabs = [
  { id: 'color',      label: 'Thiết lập màu sắc' },
  { id: 'display',    label: 'Thiết lập hiển thị' },
  // Tab "Hình nền" đã bỏ — không cho chọn hình nền nữa (áp dụng chung mọi app)
]
const modes = [
  { value: 'color', label: 'Màu đang chọn' },
  { value: 'light', label: 'Màu trắng' },
]
const bgTints = [
  { value: 'color', label: 'Màu đang chọn' },
  { value: 'gray',  label: 'Màu xám' },
]
const sidebarItems = Array(14).fill(0)
const activeNav    = ref(1)

const previewColor = computed(() => COLORS.find(c => c.id === draftColor.value) || COLORS[0])

const miniHeaderStyle = computed(() =>
  draftMode.value === 'light'
    ? { background: 'white', borderBottom: '1px solid #e9eaeb' }
    : { background: previewColor.value.gradient || previewColor.value.main }
)

const miniSidebarStyle = computed(() =>
  draftSidebarMode.value === 'dark'
    ? { background: '#1c1e26', borderRightColor: 'rgba(255,255,255,0.07)' }
    : {}
)

function openSettings() {
  activeTab.value        = 'color'
  draftColor.value       = currentTheme.value
  draftMode.value        = currentMode.value
  draftBgTint.value      = currentBgTint.value
  draftDensity.value     = currentDensity.value
  draftFontSize.value    = currentFontSize.value
  draftWallpaper.value   = currentWallpaper.value
  draftSidebarMode.value = currentSidebarMode.value
  showSettings.value     = true
  nextTick(() => scalePreview())
}
function cancelSettings() { showSettings.value = false }
function saveSettings() {
  applyTheme(draftColor.value)
  applyMode(draftMode.value)
  applyBgTint(draftBgTint.value)
  applyDensity(draftDensity.value)
  applyFontSize(draftFontSize.value)
  applyWallpaper(draftWallpaper.value)
  applySidebarMode(draftSidebarMode.value)
  showSettings.value = false
}

/* ── Preview scaling ── */
const previewWrapRef  = ref(null)
const previewInnerRef = ref(null)

function scalePreview() {
  if (!previewWrapRef.value || !previewInnerRef.value) return
  const w = previewWrapRef.value.offsetWidth
  const maxH = 200
  const scaleByW = w / 1440
  const scaleByH = maxH / 650
  const scale = Math.min(scaleByW, scaleByH)
  previewInnerRef.value.style.transform = `scale(${scale})`
  previewWrapRef.value.style.height = `${Math.round(650 * scale)}px`
}

watch(showSettings, (v) => { if (v) nextTick(scalePreview) })
watch(activeTab,    (v) => { if (v === 'color') nextTick(scalePreview) })
</script>

<style scoped>
/* ── Trial expiry banner ── */
.trial-banner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; height: 44px; padding: 0 24px;
  background: #3f3f46; color: var(--text-white);
  flex-shrink: 0;
}
.trial-banner__text {
  font-size: var(--text-body); line-height: var(--text-body-lh); margin: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.trial-banner__text strong { font-weight: var(--fw-semibold); }
.trial-banner__actions { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.trial-banner__dismiss {
  background: none; border: none; cursor: pointer;
  font-family: var(--font-family); font-size: var(--text-body);
  color: rgba(255,255,255,0.72);
}
.trial-banner__dismiss:hover { color: var(--text-white); text-decoration: underline; }

/* ── Settings Dialog ── */
.dialog-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(16,24,40,0.45);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 20px; overflow-y: auto;
}
.settings-dialog {
  background: var(--bg-white);
  border-radius: var(--radius-dialog);
  width: 100%; max-width: 1440px;
  display: flex; flex-direction: column;
  max-height: calc(100vh - 40px);
  overflow: hidden; flex-shrink: 0;
}

/* Header */
.settings-dialog__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--dialog-py) var(--dialog-px);
  flex-shrink: 0;
}

/* Tabs */
.settings-dialog__tabs {
  display: flex; align-items: flex-end;
  padding: 0 var(--dialog-px);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
.dialog-tab {
  height: 44px; padding: 0 16px;
  font-size: var(--text-body); font-weight: var(--fw-medium);
  color: var(--text-secondary);
  border: none; background: transparent; cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.dialog-tab:hover { color: var(--text-primary); background: var(--bg-brand-light); }   /* hover nền Brand Light (quy tắc hover chung) */
.dialog-tab:active { background: var(--bg-brand-light-hover); }
.dialog-tab--active { color: var(--text-brand); border-bottom-color: var(--stroke-brand); font-weight: var(--fw-semibold); }

/* Body */
.settings-dialog__body {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 24px var(--dialog-px) 16px;
  display: flex; flex-direction: column; gap: 20px;
}

/* Section title */
.settings-section-title {
  font-size: var(--text-h2); font-weight: var(--fw-semibold);
  color: var(--text-primary);
  text-align: center; line-height: var(--text-h2-lh);
}

/* Settings option rows — pill style */
.settings-options-row {
  display: flex; align-items: center; gap: 24px;
  justify-content: center; flex-wrap: wrap; row-gap: 12px;
}
.srow { display: flex; align-items: center; gap: 10px; }
.srow__label {
  font-size: var(--text-body); font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.06em;
  min-width: 44px; text-align: right; white-space: nowrap;
}
.srow__btns { display: flex; gap: 6px; }
.sopt {
  display: flex; align-items: center; gap: 6px;
  height: 28px; padding: 0 12px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--stroke-neutral);
  background: var(--bg-white);
  font-size: var(--text-body); font-weight: var(--fw-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.sopt:hover { border-color: var(--stroke-brand); color: var(--text-brand); }
.sopt--active {
  border-color: var(--stroke-brand);
  background: var(--bg-brand-light);
  color: var(--text-brand);
  font-weight: var(--fw-semibold);
}
.sopt__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--stroke-neutral); flex-shrink: 0;
  transition: background 0.15s;
}
.sopt--active .sopt__dot { background: var(--text-brand); }
.sopt--disabled, .sopt--disabled:hover { border-color: var(--stroke-neutral-light); background: var(--bg-white); color: var(--text-disabled); cursor: not-allowed; }

/* Color swatches */
.color-swatches {
  display: flex; gap: 10px;
  flex-wrap: nowrap; overflow-x: auto;
  padding-bottom: 4px;
  justify-content: safe center;   /* safe: màn hẹp hơn dãy màu → dồn trái để cuộn được tới màu đầu (center thường đẩy màu đầu ra ngoài, không cuộn tới được) */
}
.color-swatch {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; flex-shrink: 0;
  padding: 6px; border-radius: var(--radius-default);
  border: 2px solid transparent;
  transition: border-color 0.15s, background 0.15s;
  background: var(--bg-white);
  min-width: 80px;
}
.color-swatch:hover { background: var(--bg-brand-light); }
.color-swatch--selected { background: var(--bg-white); }

.color-swatch__preview {
  width: 72px; height: 40px;
  border-radius: 6px; overflow: hidden;
  display: flex; position: relative;
  border: 1px solid var(--stroke-neutral-light);
}
.color-swatch__block-left  { flex: 1; }
.color-swatch__block-right { flex: 1.6; }
.color-swatch__check {
  position: absolute; top: 4px; right: 4px;
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
}
.color-swatch__check .ti { font-size: 10px; color: white; }
.color-swatch__label {
  font-size: var(--text-body); font-weight: var(--fw-medium);
  color: var(--text-primary); white-space: nowrap;
}

/* Preview wrap */
.preview-wrap {
  width: 100%; overflow: hidden;
  border-radius: var(--radius-default);
  border: 1px solid var(--stroke-neutral-light);   /* có viền thì không bóng */
  flex-shrink: 0;
  display: flex; justify-content: center;
}
.preview-inner {
  width: 1440px;
  flex-shrink: 0;
  transform-origin: top center;
}

/* ── Mini App Styles ── */
.mini-app {
  display: flex; flex-direction: column;
  width: 1440px; height: 650px;
  background: var(--bg-page);
  font-family: var(--font-family);
  overflow: hidden;
}
.mini-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 48px; padding: 0 16px; flex-shrink: 0; gap: 12px;
}
.mini-header-left { display: flex; align-items: center; gap: 8px; flex: 1; }
.mini-subnav {
  display: flex; align-items: flex-end;
  height: 44px; padding: 0 16px;
  background: white; border-bottom: 1px solid #e9eaeb;
  flex-shrink: 0; gap: 0;
}
.mini-subnav-tab {
  display: flex; align-items: center;
  height: 44px; padding: 0 14px;
  font-size: 10px; font-weight: 500; color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.mini-subnav-tab.active { font-weight: 600; }
.mini-body {
  display: flex; flex: 1; overflow: hidden;
}
.mini-sidebar {
  width: 200px; flex-shrink: 0;
  background: white; border-right: 1px solid #e9eaeb;
  display: flex; flex-direction: column;
}
.mini-main {
  display: flex; flex-direction: column; flex: 1; overflow: hidden;
}

/* Footer */
.settings-dialog__footer {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 12px; padding: 12px var(--dialog-px);
  background: var(--bg-form-footer);
  border-top: 1px solid var(--stroke-form-footer);
  border-radius: 0 0 var(--radius-dialog) var(--radius-dialog);
  flex-shrink: 0;
}

/* Density options */
.density-options {
  display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
}
.settings-section-title--gap { margin-top: 20px; }
/* Xem trước cỡ chữ: dùng đúng token của mode (khung .font-size-scope[data-font-size]) */
.font-size-preview { display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 0 12px; overflow: hidden; }
.font-size-preview__h { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); white-space: nowrap; }
.font-size-preview__b { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); white-space: nowrap; }
.density-item {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  cursor: pointer; padding: 16px;
  border: 2px solid var(--stroke-neutral-light);
  border-radius: var(--radius-default);
  background: var(--bg-white);
  transition: border-color 0.15s, background 0.15s;
  min-width: 160px;
}
.density-item:hover { background: var(--bg-brand-light); }
.density-item--active { border-color: var(--stroke-brand); background: var(--bg-white); }
.density-item__radio { display: flex; align-items: center; }
.density-item__preview {
  width: 100%; display: flex; flex-direction: column; gap: 2px;
  border: 1px solid var(--stroke-neutral-light); border-radius: 4px;
  overflow: hidden; background: var(--bg-page);
}
.density-row-mock {
  display: flex; align-items: center; gap: 6px; padding: 0 8px;
  border-bottom: 1px solid var(--stroke-neutral-light);
  background: var(--bg-white);
}
.density-row-mock:last-child { border-bottom: none; }
.density-row-mock__bar {
  height: 8px; width: 60%; border-radius: 3px; background: var(--bg-neutral-light);
}
.density-row-mock__bar--short { width: 30%; }
.density-item__info {
  display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center;
}
.density-item__label {
  font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary);
}
.density-item__desc {
  font-size: var(--text-body); color: var(--text-secondary); line-height: 1.4;
}

/* Placeholder */
.settings-placeholder {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; min-height: 200px;
}

/* ── Wallpaper picker ── */
.wallpaper-grid {
  display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
}
.wallpaper-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; position: relative;
  border-radius: var(--radius-default);
  padding: 4px; border: 2px solid transparent;
  transition: border-color 0.15s;
}
.wallpaper-item:hover { border-color: var(--stroke-neutral); }
.wallpaper-item--selected { border-color: var(--stroke-brand); }

.wallpaper-item__thumb {
  width: 120px; height: 80px; border-radius: 8px;
  background-size: cover; background-position: center;
  border: 1px solid var(--stroke-neutral-light);
}
.wallpaper-item__thumb--none {
  background: var(--bg-neutral-light);
  display: flex; align-items: center; justify-content: center;
}
.wallpaper-item__label {
  font-size: var(--text-body); font-weight: var(--fw-medium);
  color: var(--text-primary);
}
.wallpaper-check {
  position: absolute; top: 8px; right: 8px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--bg-brand); color: var(--icon-white);
  display: flex; align-items: center; justify-content: center;
}
.wallpaper-check .ti { font-size: 12px; }

/* Mini preview */
.wallpaper-preview-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.wallpaper-preview {
  width: 480px; height: 280px; border-radius: 10px;
  background-size: cover; background-position: center;
  overflow: hidden; border: 1px solid var(--stroke-neutral-light);   /* có viền thì không bóng */
  display: flex; flex-direction: column;
}
.wp-preview-header {
  height: 36px; flex-shrink: 0;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.5);
}
.wp-preview-body { display: flex; flex: 1; overflow: hidden; }
.wp-preview-sidebar {
  width: 60px; flex-shrink: 0;
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255,255,255,0.45);
}
.wp-preview-main {
  flex: 1; padding: 10px; display: flex; gap: 8px; flex-wrap: wrap; align-content: flex-start;
}
.wp-preview-card {
  height: 70px; flex: 1; min-width: 100px;
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 8px;
}
.wp-preview-card--wide { flex: 2; min-width: 200px; }
.wp-preview-note {
  font-size: var(--text-body); color: var(--text-hint);
  margin: 0; text-align: center;
}

/* Transitions */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s ease; }
.overlay-enter-from,  .overlay-leave-to      { opacity: 0; }
.dialog-enter-active, .dialog-leave-active   { transition: transform 0.22s ease, opacity 0.22s ease; }
.dialog-enter-from,  .dialog-leave-to        { transform: translateY(-16px); opacity: 0; }

/* ── Tools & Settings Popover ── */
.tools-popover {
  width: max-content;
  max-width: calc(100vw - 32px);
  background: var(--bg-white);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-popover);   /* chuẩn popover Figma: Bottom 12, không viền */
  font-family: var(--font-family);
  padding: 20px 24px 24px;
}
.tools-popover__title {
  font-size: 16px;
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 20px;
}
.tools-popover__body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.tools-popover__columns {
  display: flex;
  gap: 24px;
}
.tools-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tools-popover__columns .tools-col:nth-child(1) { flex: 0 0 160px; }
.tools-popover__columns .tools-col:nth-child(2) { flex: 0 0 300px; }
.tools-popover__columns .tools-col:nth-child(3) { flex: 0 0 380px; }
.tools-popover__side {
  flex: 0 0 320px;
  background: var(--bg-neutral-light);
  border-radius: var(--radius-default);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.tools-col__title {
  font-size: var(--text-body);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0;
}
.tools-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 8px;
  margin: 0 -8px;
  border: none;
  background: transparent;
  border-radius: var(--radius-default);
  font-size: var(--text-body);
  font-family: var(--font-family);
  color: var(--text-primary);
  text-align: left;
  line-height: var(--text-body-lh);
  cursor: pointer;
  transition: background 0.12s;
}
.tools-item:hover { background: var(--bg-brand-light); }
.tools-item__tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  background: var(--bg-warning);
  color: var(--text-white);
  font-size: 10px;
  font-weight: var(--fw-bold);
  border-radius: var(--radius-pill);
  flex-shrink: 0;
}
.tools-pop-enter-active, .tools-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tools-pop-enter-from, .tools-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Kết nối ứng dụng Dialog — full-screen popup ── */
.connect-overlay { padding: 0; align-items: stretch; justify-content: stretch; }
.connect-dialog {
  background: var(--bg-white);
  border-radius: 0;
  width: 100%; max-width: none;
  display: flex; flex-direction: column;
  height: 100%; max-height: none;
  overflow: hidden; flex-shrink: 0;
}
.connect-dialog__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--dialog-py) var(--dialog-px);
  flex-shrink: 0;
}
.connect-dialog__title { font-size: 20px; font-weight: var(--fw-semibold); color: var(--text-primary); margin: 0; }
.connect-dialog__header-actions { display: flex; align-items: center; gap: 8px; }

.connect-syncbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 10px 24px;
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0; flex-wrap: wrap;
}
.connect-syncbar__left, .connect-syncbar__right {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--text-body); color: var(--text-secondary);
}
.connect-syncbar__left .ti { font-size: 16px; color: var(--icon-neutral); }
.connect-syncbar__label { color: var(--text-primary); font-weight: var(--fw-medium); }
.connect-version-tag {
  display: inline-flex; align-items: center;
  height: 20px; padding: 0 8px;
  background: var(--bg-brand-light); color: var(--text-brand);
  font-size: var(--text-body); font-weight: var(--fw-semibold);
  border-radius: var(--radius-pill);
}
.connect-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--text-body); color: var(--text-link); text-decoration: none; cursor: pointer;
}
.connect-link .ti { font-size: 14px; }
.connect-link:hover { text-decoration: underline; }

.connect-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; margin-bottom: 16px;
}
.connect-search {
  display: flex; align-items: center; gap: 8px;
  width: 260px; height: 32px; padding: 0 12px;
  background: var(--bg-white);
  border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default);
  flex-shrink: 0;
}
.connect-search .ti { font-size: 16px; color: var(--icon-neutral); flex-shrink: 0; }
.connect-search input {
  border: none; outline: none; background: transparent;
  font-size: var(--text-body); font-family: var(--font-family); color: var(--text-primary);
  width: 100%;
}

.connect-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
.connect-sidebar {
  width: 240px; flex-shrink: 0;
  display: flex; flex-direction: column; gap: 4px;
  padding: 16px 12px; overflow-y: auto;
  border-right: 1px solid var(--stroke-neutral-light);
}
.connect-sidebar__item {
  display: flex; align-items: center; gap: 10px;
  height: 36px; padding: 0 12px;
  border: none; background: transparent; border-radius: var(--radius-default);
  font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-primary);
  text-align: left; cursor: pointer;
  transition: background 0.12s;
}
.connect-sidebar__item .ti { font-size: 16px; color: var(--icon-neutral); flex-shrink: 0; }
.connect-sidebar__item:hover { background: var(--bg-brand-light); }
.connect-sidebar__item--active { background: var(--bg-brand-light); color: var(--text-brand); font-weight: var(--fw-semibold); }
.connect-sidebar__item--active .ti { color: var(--icon-brand); }

.connect-grid-wrap { flex: 1; min-width: 0; overflow-y: auto; padding: 20px 24px; background: var(--bg-page); }
.connect-segment {
  display: inline-flex; align-items: center; gap: 2px;
  padding: 2px;
  background: var(--bg-neutral-light);
  border-radius: var(--radius-default);
  flex-shrink: 0;
}
.connect-segment__item {
  height: 28px; padding: 0 16px;
  font-size: var(--text-body); font-weight: var(--fw-medium);
  color: var(--text-primary);
  border: none; background: transparent; border-radius: calc(var(--radius-default) - 2px);
  cursor: pointer; transition: background 0.15s, color 0.15s;
}
.connect-segment__item:hover:not(.connect-segment__item--active) { color: var(--text-primary); background: var(--bg-brand-light); }
.connect-segment__item--active {
  background: var(--bg-white); color: var(--text-brand); font-weight: var(--fw-semibold);
  box-shadow: var(--shadow-sm);
}
.connect-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--card-col-gap);
  align-items: stretch;
}
.connect-card {
  background: var(--bg-white);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  padding: var(--card-py) var(--card-px);
  display: flex; flex-direction: column; gap: 12px;
  min-height: 162px;
  cursor: pointer; transition: box-shadow 0.15s;
}
.connect-card:hover { box-shadow: var(--shadow-bottom-8); }
.connect-card__head { display: flex; align-items: flex-start; gap: 12px; }
.connect-card__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.connect-card__icon {
  width: 28px; height: 28px; border-radius: var(--radius-default);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.connect-card__icon .ti { font-size: 16px; color: var(--icon-white); }
.connect-card__title {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 2px;
}
.connect-card__name {
  font-size: 14px; font-weight: var(--fw-semibold); color: var(--text-primary);
  line-height: 18px;
}
.connect-card__status {
  font-size: var(--text-body); color: var(--text-hint);
}
.connect-card__status.is-connected { color: var(--text-success); }
.connect-card__desc {
  flex: 1;
  font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary);
  margin: 0; margin-left: 40px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.connect-empty {
  grid-column: 1 / -1;
  text-align: center; color: var(--text-hint); font-size: var(--text-body);
  padding: 40px 0;
}

@media (max-width: 1280px) { .connect-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 960px)  { .connect-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

/* ── Avatar = nút tài khoản + menu thông tin cá nhân / Đăng xuất ── */
.header-avatar-btn { padding: 0; border: none; background: none; border-radius: 50%; cursor: pointer; display: inline-flex; transition: box-shadow 0.15s; }
.header-avatar-btn:hover, .header-avatar-btn--open { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.35); }
.global-header--white .header-avatar-btn:hover, .global-header--white .header-avatar-btn--open { box-shadow: 0 0 0 3px var(--bg-brand-light); }
.header-avatar-btn img.header-avatar { object-fit: cover; }
/* ── Popover của Global Header (Figma ❖ Global Header: Header_Notification · Header_Help · Header_More · Header_UserProfile) ──
   Nền trắng · bo 8 · bóng Bottom 16 · mũi nhọn trên đầu chỉ vào icon vừa bấm · luôn trên drawer / panel */
.hdr-pop { position: fixed; z-index: var(--z-header-pop); box-sizing: border-box; max-width: calc(100vw - 16px);
  background: var(--bg-white); border-radius: var(--radius-default); box-shadow: var(--shadow-bottom-16, var(--shadow-popover)); font-family: var(--font-family); }
.hdr-pop > .hdr-pop__arrow { position: absolute; display: block; top: -7px; width: 14px; height: 14px; background: var(--bg-white); transform: rotate(45deg); border-radius: 2px; box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.04); }
/* Menu List Item dùng chung: cao 32 · đệm ngang 12 · icon 20 · chữ 13 · bo 8 · hover Brand Light */
.hdr-pop__item {
  display: flex; align-items: center; gap: var(--menu-item-gap, 8px); width: 100%; min-height: var(--menu-item-h, 32px); padding: 0 var(--menu-item-px, 12px); box-sizing: border-box;
  border: none; border-radius: var(--menu-radius, var(--radius-default)); background: transparent; cursor: pointer; text-align: left; flex-shrink: 0;
  font-family: inherit; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); transition: background 0.12s;
}
.hdr-pop__item > .ti { font-size: var(--menu-icon, 20px); color: var(--icon-neutral); flex-shrink: 0; }
.hdr-pop__item:hover { background: var(--bg-brand-light); }
.hdr-pop__item:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
.hdr-pop__label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hdr-pop__chev.ti { font-size: 16px; }
.hdr-pop__img { width: 20px; height: 20px; flex-shrink: 0; object-fit: contain; border-radius: 4px; }

/* Chuyển ứng dụng (9 chấm): lưới ô thoáng, nền gradient nhẹ, ô nổi lên khi rê */
.hdr-apps { padding: 16px; border-radius: 12px; background: radial-gradient(120% 90px at 0 0, var(--bg-brand-light), transparent 70%), var(--bg-white);
  transform-origin: 28px -8px; animation: hdr-apps-in 0.18s cubic-bezier(.2, .8, .3, 1.2); }
.hdr-apps > .hdr-pop__arrow { background: color-mix(in srgb, var(--bg-brand-light) 85%, var(--bg-white)); }
.hdr-apps__title { margin: 0 4px 12px; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); color: var(--text-secondary); }
.hdr-apps__grid { display: grid; grid-template-columns: repeat(var(--apps-cols, 2), minmax(0, 1fr)); gap: 8px; }
.hdr-apps__tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 8px 14px; min-width: 0;
  border: 1px solid transparent; border-radius: 12px; background: transparent; cursor: pointer; font-family: inherit; text-align: center; color: var(--text-primary);
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s, border-color 0.18s; animation: hdr-apps-tile 0.28s ease both; animation-delay: calc(var(--i) * 40ms + 40ms); }
.hdr-apps__tile:hover { background: var(--bg-white); border-color: var(--stroke-neutral-light); box-shadow: var(--shadow-bottom-8); transform: translateY(-2px); }
.hdr-apps__tile:active { transform: translateY(0); }
.hdr-apps__tile:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 2px; }
.hdr-apps__tile--on { background: var(--bg-white); border-color: var(--stroke-brand); box-shadow: 0 0 0 3px var(--bg-brand-light); }
.hdr-apps__tile--on:hover { border-color: var(--stroke-brand); box-shadow: 0 0 0 3px var(--bg-brand-light), 0 8px 20px -6px rgba(16, 24, 40, 0.16); }
.hdr-apps__logo { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin-bottom: 8px; border-radius: 14px;
  filter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.14)); transition: transform 0.25s cubic-bezier(.2, .8, .3, 1.4); }   /* logo app vốn là ô bo màu → chỉ thêm bóng, không đóng khung thêm */
.hdr-apps__logo img { width: 48px; height: 48px; object-fit: contain; }
.hdr-apps__logo:not(:has(img)) { background: var(--bg-brand-light); }
.hdr-apps__logo .ti { font-size: 28px; color: var(--icon-brand); }
.hdr-apps__tile:hover .hdr-apps__logo { transform: scale(1.08) rotate(-3deg); }
.hdr-apps__name { max-width: 100%; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hdr-apps__desc { max-width: 100%; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hdr-apps__check { position: absolute; top: 8px; right: 8px; display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: var(--bg-brand); color: var(--icon-white); }
.hdr-apps__check .ti { font-size: 14px; }
@keyframes hdr-apps-in { from { opacity: 0; transform: translateY(-4px) scale(0.96); } to { opacity: 1; transform: none; } }
@keyframes hdr-apps-tile { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .hdr-apps, .hdr-apps__tile, .hdr-apps__logo { animation: none; transition: none; } }

/* Tài khoản: đệm 24 trên dưới · 12 hai bên · các khối cách 20 */
.hdr-profile { width: 352px; display: flex; flex-direction: column; gap: 16px; padding: 8px; }   /* Figma Header_UserProfile: đệm 8 đều 4 phía · 8 hai bên · khối cách 16 */
.hdr-profile__head { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-top: 8px; text-align: center; }   /* avatar ↔ tên 8 · đệm trên 8 */
.hdr-profile__avatar { width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0; object-fit: cover; box-sizing: border-box; border: 0.5px solid var(--stroke-neutral); }
.hdr-profile__avatar--initials { display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: var(--fw-semibold); color: var(--text-primary); }   /* Figma Avatar cỡ lớn (56): chữ 20 Semi Bold Text/Primary */
.hdr-profile__info { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; max-width: 100%; }
.hdr-profile__name { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hdr-profile__sub { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hdr-profile__role { margin-top: 2px; padding: 0 6px; border-radius: var(--radius-default); background: var(--bg-brand-light); color: var(--text-brand); font-size: var(--text-body); font-weight: var(--fw-medium); }
/* Khung công ty / dữ liệu: viền Stroke/Neutral, bo 8, đệm dọc 8, vạch ngăn thụt 12 */
.hdr-profile__ctx { display: flex; flex-direction: column; gap: 4px; margin: 0 12px; padding: var(--menu-pad, 8px); border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); }   /* chuẩn Menu List: đệm khung 8 → dòng bo góc, hover không chạm 2 mép viền */
.hdr-profile__ctx-sep { height: 1px; margin: 0 var(--menu-item-px, 12px); background: var(--stroke-neutral); flex-shrink: 0; }
.hdr-profile__menu { display: flex; flex-direction: column; margin-top: -8px; }   /* cách khối công ty / dữ liệu 8 · mục liền nhau */
.hdr-profile__logout { width: 100%; }   /* Figma: Đăng xuất = Button Medium (chữ + icon trung tính, căn giữa) dưới vạch ngăn */
.hdr-profile__sep { height: 1px; margin: 8px 12px; background: var(--stroke-divider); flex-shrink: 0; }

/* Thông báo: rộng 434 · đệm 12 / 24 · tiêu đề 20 Semi Bold + 3 icon 24 cách 12 · nhóm cách 16 · dòng: avatar 40 + chữ, đệm dọc 8, chưa đọc nền Brand Light tràn 2 mép */
.hdr-notify { display: flex; flex-direction: column; gap: 12px; padding: 8px; max-height: min(580px, calc(100vh - 72px)); }   /* Figma Header_Notification: đệm 8 đều 4 phía */
.hdr-notify__head { display: flex; align-items: center; gap: 12px; min-height: 32px; padding: 0 12px; flex-shrink: 0; }   /* hàng tiêu đề cao 32 */
.hdr-notify__head .btn-icon .ti { font-size: 20px; }   /* Figma: Button Icon Small 28 · icon bên trong 20 */
.hdr-notify__title { flex: 1; min-width: 0; margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }   /* H3 */
.hdr-notify__body { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.hdr-notify__group { display: flex; flex-direction: column; }   /* dòng liền nhau (mỗi dòng đệm 8 trên-dưới) */
.hdr-notify__group-title { margin: 0 0 8px; padding: 0 12px; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.hdr-notify__item { display: flex; align-items: flex-start; gap: 12px; width: 100%; padding: 8px 12px; border: none; border-radius: var(--radius-default); background: transparent; text-align: left; cursor: pointer; font-family: inherit; }   /* dòng bo góc, thụt 8 khỏi mép popup (chuẩn Menu List) */
.hdr-notify__item:hover { background: var(--bg-brand-light); }
.hdr-notify__item--unread { background: var(--bg-brand-light); }
.hdr-notify__item--unread:hover { background: var(--bg-brand-light-hover); }
.hdr-notify__avatar { position: relative; width: 40px; height: 40px; flex-shrink: 0; }
.hdr-notify__avatar > img:not(.hdr-notify__badge-img), .hdr-notify__avatar-initials, .hdr-notify__avatar-icon { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; }
.hdr-notify__avatar-initials { font-size: 12px; font-weight: var(--fw-medium); color: var(--text-primary); }   /* Figma Avatar 40px: chữ 12 Medium Text/Primary */
.hdr-notify__avatar-icon .ti { font-size: 22px; }
.hdr-notify__avatar-icon--brand { background: var(--bg-brand-light); color: var(--icon-brand); }
.hdr-notify__avatar-icon--danger { background: var(--bg-danger-light); color: var(--icon-danger); }
.hdr-notify__avatar-icon--warning { background: var(--bg-warning-light); color: var(--icon-warning); }
.hdr-notify__avatar-icon--success { background: var(--bg-success-light); color: var(--icon-success); }
.hdr-notify__badge { position: absolute; right: -4px; bottom: -4px; width: 20px; height: 20px; border-radius: 50%; background: var(--bg-white); box-shadow: 0 0 0 1px var(--stroke-neutral-light); display: inline-flex; align-items: center; justify-content: center; color: var(--icon-brand); }
.hdr-notify__badge .ti { font-size: 12px; }
.hdr-notify__badge-img { position: absolute; left: 22px; top: 22px; width: 24px; height: 24px; }   /* biểu cảm / huy hiệu ảnh góc dưới avatar (Figma) */
.hdr-notify__text { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.hdr-notify__msg { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.hdr-notify__msg b { font-weight: var(--fw-semibold); }
.hdr-notify__time { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.hdr-notify__empty { margin: 0; color: var(--text-secondary); font-size: var(--text-body); }

/* Trợ giúp (304) / Thêm (296): đệm 24 trên dưới · 12 hai bên · nhóm có tiêu đề H3 cách 8, nhóm cách 12 · vạch ngăn thụt 12 */
.hdr-menu { display: flex; flex-direction: column; gap: 12px; padding: 8px; }   /* Figma Header_Help / Header_More (và menu Thiết lập): đệm 8 đều 4 phía */
.hdr-menu__sec { display: flex; flex-direction: column; }   /* Menu List Item 32 liền nhau */
.hdr-menu--help { gap: 16px; }
.hdr-menu__sec > .hdr-menu__sep:last-child { margin-bottom: 0; }   /* vạch cuối nhóm → khối dưới chỉ cách 12 (gap khung) */   /* Trợ giúp: các nhóm có tiêu đề cách nhau 16 */
.hdr-menu__title { display: flex; align-items: center; min-height: 32px; margin: 0; padding: 0 12px; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.hdr-menu__sep { height: 1px; margin: 8px 12px; background: var(--stroke-neutral); flex-shrink: 0; }
.hdr-menu__footer { padding: 0 12px; }
</style>
