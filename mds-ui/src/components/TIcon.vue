<template>
  <!-- Icon custom của MDS (tên mds-…): SVG gốc xuất từ Figma (icons/customIcons.js) -->
  <span v-if="custom" class="ti ti--custom" :class="`ti--custom-${custom.color}`" v-html="custom.svg" />
  <span v-else class="ti">
    <component v-if="iconComp" :is="iconComp" :stroke-width="strokeWidth" />
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { CUSTOM_ICONS } from '../icons/customIcons.js'
// Import TỪNG icon (không import cả bộ ~5.000 icon) — dev server chỉ tải icon thực sự dùng.
// Thêm icon mới: thêm 1 dòng import như dưới + thêm vào MAP.
import IconGridDots               from '@tabler/icons-vue/dist/esm/icons/IconGridDots.mjs'
import IconDeviceAnalytics        from '@tabler/icons-vue/dist/esm/icons/IconDeviceAnalytics.mjs'
// Icon popover Global Header (Thông báo / Trợ giúp / Thêm / Tài khoản)
import IconAdjustmentsHorizontal  from '@tabler/icons-vue/dist/esm/icons/IconAdjustmentsHorizontal.mjs'
import IconHeadset                from '@tabler/icons-vue/dist/esm/icons/IconHeadset.mjs'
import IconSchool                 from '@tabler/icons-vue/dist/esm/icons/IconSchool.mjs'
import IconBrandFacebook          from '@tabler/icons-vue/dist/esm/icons/IconBrandFacebook.mjs'   // chân panel Trợ giúp — Kênh hỗ trợ
import IconBrandYoutube           from '@tabler/icons-vue/dist/esm/icons/IconBrandYoutube.mjs'
import IconAlertCircleFilled       from '@tabler/icons-vue/dist/esm/icons/IconAlertCircleFilled.mjs'   // khay tiến trình: lỗi / xong một phần
import IconAlertTriangleFilled     from '@tabler/icons-vue/dist/esm/icons/IconAlertTriangleFilled.mjs'
import IconFileAlert              from '@tabler/icons-vue/dist/esm/icons/IconFileAlert.mjs'   // khay tiến trình: Tải file lỗi
import IconHourglass              from '@tabler/icons-vue/dist/esm/icons/IconHourglass.mjs'   // icon Tiến trình trên header
import IconCircle                 from '@tabler/icons-vue/dist/esm/icons/IconCircle.mjs'   // Bắt đầu sử dụng: bước / việc chưa xong
import IconBook2                  from '@tabler/icons-vue/dist/esm/icons/IconBook2.mjs'    // Bắt đầu sử dụng: Xem bài viết hướng dẫn
import IconInbox                  from '@tabler/icons-vue/dist/esm/icons/IconInbox.mjs'   // trạng thái trống
import IconTrashX                 from '@tabler/icons-vue/dist/esm/icons/IconTrashX.mjs'   // Xóa vĩnh viễn (thùng rác)
import IconBrandFigma             from '@tabler/icons-vue/dist/esm/icons/IconBrandFigma.mjs'   // liên kết Figma (trang chủ /ds)
import IconLocationFilled         from '@tabler/icons-vue/dist/esm/icons/IconLocationFilled.mjs'   // nút gửi của ô chat AI Agent (Figma)
import IconVideo                  from '@tabler/icons-vue/dist/esm/icons/IconVideo.mjs'
import IconCircleCaretRight       from '@tabler/icons-vue/dist/esm/icons/IconCircleCaretRight.mjs'
import IconLicense                from '@tabler/icons-vue/dist/esm/icons/IconLicense.mjs'
import IconCertificate2           from '@tabler/icons-vue/dist/esm/icons/IconCertificate2.mjs'
import IconCircleKey              from '@tabler/icons-vue/dist/esm/icons/IconCircleKey.mjs'
import IconShieldCheck            from '@tabler/icons-vue/dist/esm/icons/IconShieldCheck.mjs'
// Icon trang trí card trang chủ tài liệu (mds-docs)
import IconCompass                from '@tabler/icons-vue/dist/esm/icons/IconCompass.mjs'
import IconHandClick              from '@tabler/icons-vue/dist/esm/icons/IconHandClick.mjs'
import IconPointer                from '@tabler/icons-vue/dist/esm/icons/IconPointer.mjs'
import IconIcons                  from '@tabler/icons-vue/dist/esm/icons/IconIcons.mjs'
import IconLayout                 from '@tabler/icons-vue/dist/esm/icons/IconLayout.mjs'
import IconTypography             from '@tabler/icons-vue/dist/esm/icons/IconTypography.mjs'
import IconAppWindow              from '@tabler/icons-vue/dist/esm/icons/IconAppWindow.mjs'
import IconBox                    from '@tabler/icons-vue/dist/esm/icons/IconBox.mjs'
import IconLoader                 from '@tabler/icons-vue/dist/esm/icons/IconLoader.mjs'
import IconClick                  from '@tabler/icons-vue/dist/esm/icons/IconClick.mjs'
import IconRulerMeasure           from '@tabler/icons-vue/dist/esm/icons/IconRulerMeasure.mjs'
import IconSelector               from '@tabler/icons-vue/dist/esm/icons/IconSelector.mjs'
import IconCircleDot              from '@tabler/icons-vue/dist/esm/icons/IconCircleDot.mjs'
import IconToggleLeft             from '@tabler/icons-vue/dist/esm/icons/IconToggleLeft.mjs'
import IconForms                  from '@tabler/icons-vue/dist/esm/icons/IconForms.mjs'
import IconBinaryTree             from '@tabler/icons-vue/dist/esm/icons/IconBinaryTree.mjs'
import IconLayoutNavbar           from '@tabler/icons-vue/dist/esm/icons/IconLayoutNavbar.mjs'
import IconPictureInPicture       from '@tabler/icons-vue/dist/esm/icons/IconPictureInPicture.mjs'
import IconLayoutSidebar          from '@tabler/icons-vue/dist/esm/icons/IconLayoutSidebar.mjs'
import IconAd                     from '@tabler/icons-vue/dist/esm/icons/IconAd.mjs'
import IconBrowser                from '@tabler/icons-vue/dist/esm/icons/IconBrowser.mjs'
import IconMessageChatbot         from '@tabler/icons-vue/dist/esm/icons/IconMessageChatbot.mjs'
import IconMicrophone             from '@tabler/icons-vue/dist/esm/icons/IconMicrophone.mjs'
import IconArrowsHorizontal       from '@tabler/icons-vue/dist/esm/icons/IconArrowsHorizontal.mjs'
import IconCopyright              from '@tabler/icons-vue/dist/esm/icons/IconCopyright.mjs'
import IconCategory               from '@tabler/icons-vue/dist/esm/icons/IconCategory.mjs'
import IconLanguage               from '@tabler/icons-vue/dist/esm/icons/IconLanguage.mjs'
import IconNumber123              from '@tabler/icons-vue/dist/esm/icons/IconNumber123.mjs'
import IconAbc                    from '@tabler/icons-vue/dist/esm/icons/IconAbc.mjs'
import IconCalculator             from '@tabler/icons-vue/dist/esm/icons/IconCalculator.mjs'
import IconMathAvg                from '@tabler/icons-vue/dist/esm/icons/IconMathAvg.mjs'
import IconChecks                 from '@tabler/icons-vue/dist/esm/icons/IconChecks.mjs'
import IconChevronDown            from '@tabler/icons-vue/dist/esm/icons/IconChevronDown.mjs'
import IconSearch                 from '@tabler/icons-vue/dist/esm/icons/IconSearch.mjs'
import IconSettings               from '@tabler/icons-vue/dist/esm/icons/IconSettings.mjs'
import IconMoodSmile              from '@tabler/icons-vue/dist/esm/icons/IconMoodSmile.mjs'
import IconBell                   from '@tabler/icons-vue/dist/esm/icons/IconBell.mjs'
import IconCircleCheck            from '@tabler/icons-vue/dist/esm/icons/IconCircleCheck.mjs'
import IconClockHour4             from '@tabler/icons-vue/dist/esm/icons/IconClockHour4.mjs'
import IconCheck                  from '@tabler/icons-vue/dist/esm/icons/IconCheck.mjs'
import IconHelpCircle             from '@tabler/icons-vue/dist/esm/icons/IconHelpCircle.mjs'
import IconPlayerPlay             from '@tabler/icons-vue/dist/esm/icons/IconPlayerPlay.mjs'
import IconPlayerPlayFilled       from '@tabler/icons-vue/dist/esm/icons/IconPlayerPlayFilled.mjs'
import IconFlameFilled            from '@tabler/icons-vue/dist/esm/icons/IconFlameFilled.mjs'
import IconLayoutDashboard        from '@tabler/icons-vue/dist/esm/icons/IconLayoutDashboard.mjs'
import IconTool                   from '@tabler/icons-vue/dist/esm/icons/IconTool.mjs'
import IconX                      from '@tabler/icons-vue/dist/esm/icons/IconX.mjs'
import IconPlus                   from '@tabler/icons-vue/dist/esm/icons/IconPlus.mjs'
import IconCpu                    from '@tabler/icons-vue/dist/esm/icons/IconCpu.mjs'
import IconSparkles               from '@tabler/icons-vue/dist/esm/icons/IconSparkles.mjs'
import IconTrendingUp             from '@tabler/icons-vue/dist/esm/icons/IconTrendingUp.mjs'
import IconTrendingDown           from '@tabler/icons-vue/dist/esm/icons/IconTrendingDown.mjs'
import IconLink                   from '@tabler/icons-vue/dist/esm/icons/IconLink.mjs'
import IconShoppingCart           from '@tabler/icons-vue/dist/esm/icons/IconShoppingCart.mjs'
import IconPackage                from '@tabler/icons-vue/dist/esm/icons/IconPackage.mjs'
import IconBuildingWarehouse      from '@tabler/icons-vue/dist/esm/icons/IconBuildingWarehouse.mjs'
import IconBuildingBank           from '@tabler/icons-vue/dist/esm/icons/IconBuildingBank.mjs'
import IconCash                   from '@tabler/icons-vue/dist/esm/icons/IconCash.mjs'
import IconBuilding               from '@tabler/icons-vue/dist/esm/icons/IconBuilding.mjs'
import IconUsers                  from '@tabler/icons-vue/dist/esm/icons/IconUsers.mjs'
import IconFileInvoice            from '@tabler/icons-vue/dist/esm/icons/IconFileInvoice.mjs'
import IconChartBar               from '@tabler/icons-vue/dist/esm/icons/IconChartBar.mjs'
import IconBook                   from '@tabler/icons-vue/dist/esm/icons/IconBook.mjs'
import IconCalendar               from '@tabler/icons-vue/dist/esm/icons/IconCalendar.mjs'
import IconClock                  from '@tabler/icons-vue/dist/esm/icons/IconClock.mjs'
import IconMinus                  from '@tabler/icons-vue/dist/esm/icons/IconMinus.mjs'
import IconEye                    from '@tabler/icons-vue/dist/esm/icons/IconEye.mjs'
import IconEyeOff                 from '@tabler/icons-vue/dist/esm/icons/IconEyeOff.mjs'
import IconAlertTriangle          from '@tabler/icons-vue/dist/esm/icons/IconAlertTriangle.mjs'
import IconInfoCircle             from '@tabler/icons-vue/dist/esm/icons/IconInfoCircle.mjs'
import IconCircleX                from '@tabler/icons-vue/dist/esm/icons/IconCircleX.mjs'
import IconChevronUp              from '@tabler/icons-vue/dist/esm/icons/IconChevronUp.mjs'
import IconFilter                 from '@tabler/icons-vue/dist/esm/icons/IconFilter.mjs'
import IconDownload               from '@tabler/icons-vue/dist/esm/icons/IconDownload.mjs'
import IconSpeakerphone           from '@tabler/icons-vue/dist/esm/icons/IconSpeakerphone.mjs'
import IconFold                   from '@tabler/icons-vue/dist/esm/icons/IconFold.mjs'
import IconArrowsMoveVertical     from '@tabler/icons-vue/dist/esm/icons/IconArrowsMoveVertical.mjs'
import IconArchive                from '@tabler/icons-vue/dist/esm/icons/IconArchive.mjs'
import IconRestore                from '@tabler/icons-vue/dist/esm/icons/IconRestore.mjs'
import IconUpload                 from '@tabler/icons-vue/dist/esm/icons/IconUpload.mjs'
import IconRefresh                from '@tabler/icons-vue/dist/esm/icons/IconRefresh.mjs'
import IconEdit                   from '@tabler/icons-vue/dist/esm/icons/IconEdit.mjs'
import IconTrash                  from '@tabler/icons-vue/dist/esm/icons/IconTrash.mjs'
import IconCopy                   from '@tabler/icons-vue/dist/esm/icons/IconCopy.mjs'
import IconMessagePlus            from '@tabler/icons-vue/dist/esm/icons/IconMessagePlus.mjs'
import IconPaperclip              from '@tabler/icons-vue/dist/esm/icons/IconPaperclip.mjs'
import IconChevronLeft            from '@tabler/icons-vue/dist/esm/icons/IconChevronLeft.mjs'
import IconChevronsLeft           from '@tabler/icons-vue/dist/esm/icons/IconChevronsLeft.mjs'
import IconChevronsRight          from '@tabler/icons-vue/dist/esm/icons/IconChevronsRight.mjs'
import IconChevronRight           from '@tabler/icons-vue/dist/esm/icons/IconChevronRight.mjs'
import IconChevronLeftPipe        from '@tabler/icons-vue/dist/esm/icons/IconChevronLeftPipe.mjs'
import IconChevronRightPipe       from '@tabler/icons-vue/dist/esm/icons/IconChevronRightPipe.mjs'
import IconLoader2                from '@tabler/icons-vue/dist/esm/icons/IconLoader2.mjs'
import IconFileSpreadsheet        from '@tabler/icons-vue/dist/esm/icons/IconFileSpreadsheet.mjs'
import IconClipboard              from '@tabler/icons-vue/dist/esm/icons/IconClipboard.mjs'
import IconPhoto                  from '@tabler/icons-vue/dist/esm/icons/IconPhoto.mjs'
import IconFolders                from '@tabler/icons-vue/dist/esm/icons/IconFolders.mjs'
import IconCornerDownRight        from '@tabler/icons-vue/dist/esm/icons/IconCornerDownRight.mjs'
import IconVolume                 from '@tabler/icons-vue/dist/esm/icons/IconVolume.mjs'
import IconVolumeOff              from '@tabler/icons-vue/dist/esm/icons/IconVolumeOff.mjs'
import IconBellOff                from '@tabler/icons-vue/dist/esm/icons/IconBellOff.mjs'
import IconBellRinging            from '@tabler/icons-vue/dist/esm/icons/IconBellRinging.mjs'
import IconPhotoUp                from '@tabler/icons-vue/dist/esm/icons/IconPhotoUp.mjs'
import IconZoomIn                 from '@tabler/icons-vue/dist/esm/icons/IconZoomIn.mjs'
import IconZoomOut                from '@tabler/icons-vue/dist/esm/icons/IconZoomOut.mjs'
import IconScan                   from '@tabler/icons-vue/dist/esm/icons/IconScan.mjs'
import IconPalette                from '@tabler/icons-vue/dist/esm/icons/IconPalette.mjs'
import IconAdjustments            from '@tabler/icons-vue/dist/esm/icons/IconAdjustments.mjs'
import IconLogin2                 from '@tabler/icons-vue/dist/esm/icons/IconLogin2.mjs'
import IconLogin                  from '@tabler/icons-vue/dist/esm/icons/IconLogin.mjs'
import IconLogout                 from '@tabler/icons-vue/dist/esm/icons/IconLogout.mjs'
import IconWallet                 from '@tabler/icons-vue/dist/esm/icons/IconWallet.mjs'
import IconBriefcase              from '@tabler/icons-vue/dist/esm/icons/IconBriefcase.mjs'
import IconList                   from '@tabler/icons-vue/dist/esm/icons/IconList.mjs'
import IconCoin                   from '@tabler/icons-vue/dist/esm/icons/IconCoin.mjs'
import IconCurrencyDollar         from '@tabler/icons-vue/dist/esm/icons/IconCurrencyDollar.mjs'
import IconReceipt                from '@tabler/icons-vue/dist/esm/icons/IconReceipt.mjs'
import IconSignature              from '@tabler/icons-vue/dist/esm/icons/IconSignature.mjs'
import IconBorderOuter              from '@tabler/icons-vue/dist/esm/icons/IconBorderOuter.mjs'
import IconBorderRadius             from '@tabler/icons-vue/dist/esm/icons/IconBorderRadius.mjs'
import IconShadow                   from '@tabler/icons-vue/dist/esm/icons/IconShadow.mjs'
import IconSpacingHorizontal        from '@tabler/icons-vue/dist/esm/icons/IconSpacingHorizontal.mjs'
import IconTextSize                 from '@tabler/icons-vue/dist/esm/icons/IconTextSize.mjs'
import IconChartPie                 from '@tabler/icons-vue/dist/esm/icons/IconChartPie.mjs'
import IconFileCheck              from '@tabler/icons-vue/dist/esm/icons/IconFileCheck.mjs'
import IconDeviceDesktop          from '@tabler/icons-vue/dist/esm/icons/IconDeviceDesktop.mjs'
import IconDeviceMobile           from '@tabler/icons-vue/dist/esm/icons/IconDeviceMobile.mjs'
import IconListDetails            from '@tabler/icons-vue/dist/esm/icons/IconListDetails.mjs'
import IconArrowsExchange         from '@tabler/icons-vue/dist/esm/icons/IconArrowsExchange.mjs'
import IconChartBarOff            from '@tabler/icons-vue/dist/esm/icons/IconChartBarOff.mjs'
import IconBuildingCommunity      from '@tabler/icons-vue/dist/esm/icons/IconBuildingCommunity.mjs'
import IconHelp                   from '@tabler/icons-vue/dist/esm/icons/IconHelp.mjs'
import IconDotsCircleHorizontal   from '@tabler/icons-vue/dist/esm/icons/IconDotsCircleHorizontal.mjs'
import IconMessageCircle          from '@tabler/icons-vue/dist/esm/icons/IconMessageCircle.mjs'
import IconFileExport             from '@tabler/icons-vue/dist/esm/icons/IconFileExport.mjs'
import IconFileImport             from '@tabler/icons-vue/dist/esm/icons/IconFileImport.mjs'
import IconPencil                 from '@tabler/icons-vue/dist/esm/icons/IconPencil.mjs'
import IconDots                   from '@tabler/icons-vue/dist/esm/icons/IconDots.mjs'
import IconHome                   from '@tabler/icons-vue/dist/esm/icons/IconHome.mjs'
import IconScissors               from '@tabler/icons-vue/dist/esm/icons/IconScissors.mjs'
import IconHeart                  from '@tabler/icons-vue/dist/esm/icons/IconHeart.mjs'
import IconDroplet                from '@tabler/icons-vue/dist/esm/icons/IconDroplet.mjs'
import IconLeaf                   from '@tabler/icons-vue/dist/esm/icons/IconLeaf.mjs'
import IconFlower                 from '@tabler/icons-vue/dist/esm/icons/IconFlower.mjs'
import IconHandStop               from '@tabler/icons-vue/dist/esm/icons/IconHandStop.mjs'
import IconStarFilled             from '@tabler/icons-vue/dist/esm/icons/IconStarFilled.mjs'
import IconSparkle                from '@tabler/icons-vue/dist/esm/icons/IconSparkle.mjs'
import IconUserPlus               from '@tabler/icons-vue/dist/esm/icons/IconUserPlus.mjs'
import IconUserMinus              from '@tabler/icons-vue/dist/esm/icons/IconUserMinus.mjs'
import IconUserCheck              from '@tabler/icons-vue/dist/esm/icons/IconUserCheck.mjs'
import IconUserOff                from '@tabler/icons-vue/dist/esm/icons/IconUserOff.mjs'
import IconIdBadge2               from '@tabler/icons-vue/dist/esm/icons/IconIdBadge2.mjs'
import IconFileCertificate        from '@tabler/icons-vue/dist/esm/icons/IconFileCertificate.mjs'
import IconTransfer               from '@tabler/icons-vue/dist/esm/icons/IconTransfer.mjs'
import IconDoorExit               from '@tabler/icons-vue/dist/esm/icons/IconDoorExit.mjs'
import IconMedal                  from '@tabler/icons-vue/dist/esm/icons/IconMedal.mjs'
import IconHeartHandshake         from '@tabler/icons-vue/dist/esm/icons/IconHeartHandshake.mjs'
import IconSitemap                from '@tabler/icons-vue/dist/esm/icons/IconSitemap.mjs'
import IconLadder                 from '@tabler/icons-vue/dist/esm/icons/IconLadder.mjs'
import IconDiamond                from '@tabler/icons-vue/dist/esm/icons/IconDiamond.mjs'
import IconShirt                  from '@tabler/icons-vue/dist/esm/icons/IconShirt.mjs'
import IconBulb                   from '@tabler/icons-vue/dist/esm/icons/IconBulb.mjs'
import IconScale                  from '@tabler/icons-vue/dist/esm/icons/IconScale.mjs'
import IconArrowsLeftRight        from '@tabler/icons-vue/dist/esm/icons/IconArrowsLeftRight.mjs'
import IconFilePlus               from '@tabler/icons-vue/dist/esm/icons/IconFilePlus.mjs'
import IconGift                   from '@tabler/icons-vue/dist/esm/icons/IconGift.mjs'
import IconStar                   from '@tabler/icons-vue/dist/esm/icons/IconStar.mjs'
import IconAward                  from '@tabler/icons-vue/dist/esm/icons/IconAward.mjs'
import IconReport                 from '@tabler/icons-vue/dist/esm/icons/IconReport.mjs'
import IconChartLine              from '@tabler/icons-vue/dist/esm/icons/IconChartLine.mjs'
import IconChartDonut             from '@tabler/icons-vue/dist/esm/icons/IconChartDonut.mjs'
import IconSend                   from '@tabler/icons-vue/dist/esm/icons/IconSend.mjs'
import IconClipboardList          from '@tabler/icons-vue/dist/esm/icons/IconClipboardList.mjs'
import IconClipboardCheck         from '@tabler/icons-vue/dist/esm/icons/IconClipboardCheck.mjs'
import IconLock                   from '@tabler/icons-vue/dist/esm/icons/IconLock.mjs'
import IconLockOpen               from '@tabler/icons-vue/dist/esm/icons/IconLockOpen.mjs'
import IconMapPin                 from '@tabler/icons-vue/dist/esm/icons/IconMapPin.mjs'
import IconPhone                  from '@tabler/icons-vue/dist/esm/icons/IconPhone.mjs'
import IconMail                   from '@tabler/icons-vue/dist/esm/icons/IconMail.mjs'
import IconAt                     from '@tabler/icons-vue/dist/esm/icons/IconAt.mjs'
import IconBuildingFactory        from '@tabler/icons-vue/dist/esm/icons/IconBuildingFactory.mjs'
import IconBuildingSkyscraper     from '@tabler/icons-vue/dist/esm/icons/IconBuildingSkyscraper.mjs'
import IconFileText               from '@tabler/icons-vue/dist/esm/icons/IconFileText.mjs'
import IconFileDiff               from '@tabler/icons-vue/dist/esm/icons/IconFileDiff.mjs'
import IconFileAnalytics          from '@tabler/icons-vue/dist/esm/icons/IconFileAnalytics.mjs'
import IconUserCircle             from '@tabler/icons-vue/dist/esm/icons/IconUserCircle.mjs'
import IconUsersGroup             from '@tabler/icons-vue/dist/esm/icons/IconUsersGroup.mjs'
import IconCheckbox               from '@tabler/icons-vue/dist/esm/icons/IconCheckbox.mjs'
import IconSquare                 from '@tabler/icons-vue/dist/esm/icons/IconSquare.mjs'
import IconSortAscending          from '@tabler/icons-vue/dist/esm/icons/IconSortAscending.mjs'
import IconSortDescending         from '@tabler/icons-vue/dist/esm/icons/IconSortDescending.mjs'
import IconArrowUp                from '@tabler/icons-vue/dist/esm/icons/IconArrowUp.mjs'
import IconArrowDown              from '@tabler/icons-vue/dist/esm/icons/IconArrowDown.mjs'
import IconArrowLeft              from '@tabler/icons-vue/dist/esm/icons/IconArrowLeft.mjs'
import IconArrowRight             from '@tabler/icons-vue/dist/esm/icons/IconArrowRight.mjs'
import IconExternalLink           from '@tabler/icons-vue/dist/esm/icons/IconExternalLink.mjs'
import IconMaximize               from '@tabler/icons-vue/dist/esm/icons/IconMaximize.mjs'
import IconMinimize               from '@tabler/icons-vue/dist/esm/icons/IconMinimize.mjs'
import IconCirclePlus             from '@tabler/icons-vue/dist/esm/icons/IconCirclePlus.mjs'
import IconCircleMinus            from '@tabler/icons-vue/dist/esm/icons/IconCircleMinus.mjs'
import IconDotsVertical           from '@tabler/icons-vue/dist/esm/icons/IconDotsVertical.mjs'
import IconCircleOff              from '@tabler/icons-vue/dist/esm/icons/IconCircleOff.mjs'
import IconPinned                 from '@tabler/icons-vue/dist/esm/icons/IconPinned.mjs'
import IconPinnedOff              from '@tabler/icons-vue/dist/esm/icons/IconPinnedOff.mjs'
import IconTableColumn            from '@tabler/icons-vue/dist/esm/icons/IconTableColumn.mjs'
import IconColumnInsertLeft       from '@tabler/icons-vue/dist/esm/icons/IconColumnInsertLeft.mjs'
import IconColumnInsertRight      from '@tabler/icons-vue/dist/esm/icons/IconColumnInsertRight.mjs'
import IconColumnRemove           from '@tabler/icons-vue/dist/esm/icons/IconColumnRemove.mjs'
import IconTextWrap               from '@tabler/icons-vue/dist/esm/icons/IconTextWrap.mjs'
import IconTextWrapDisabled       from '@tabler/icons-vue/dist/esm/icons/IconTextWrapDisabled.mjs'
import IconKeyboard               from '@tabler/icons-vue/dist/esm/icons/IconKeyboard.mjs'
import IconPrinter                from '@tabler/icons-vue/dist/esm/icons/IconPrinter.mjs'
import IconSun                    from '@tabler/icons-vue/dist/esm/icons/IconSun.mjs'
import IconMoon                   from '@tabler/icons-vue/dist/esm/icons/IconMoon.mjs'
import IconApps                   from '@tabler/icons-vue/dist/esm/icons/IconApps.mjs'
import IconGrid3x3                from '@tabler/icons-vue/dist/esm/icons/IconGrid3x3.mjs'
import IconBrandSlack             from '@tabler/icons-vue/dist/esm/icons/IconBrandSlack.mjs'
import IconFolder                 from '@tabler/icons-vue/dist/esm/icons/IconFolder.mjs'
import IconFolderOpen             from '@tabler/icons-vue/dist/esm/icons/IconFolderOpen.mjs'
import IconLayoutKanban           from '@tabler/icons-vue/dist/esm/icons/IconLayoutKanban.mjs'
import IconFlag                   from '@tabler/icons-vue/dist/esm/icons/IconFlag.mjs'
import IconFlag2                  from '@tabler/icons-vue/dist/esm/icons/IconFlag2.mjs'
import IconFlag3                  from '@tabler/icons-vue/dist/esm/icons/IconFlag3.mjs'
import IconCloud                  from '@tabler/icons-vue/dist/esm/icons/IconCloud.mjs'
import IconWind                   from '@tabler/icons-vue/dist/esm/icons/IconWind.mjs'
import IconThermometer            from '@tabler/icons-vue/dist/esm/icons/IconThermometer.mjs'
import IconDroplets               from '@tabler/icons-vue/dist/esm/icons/IconDroplets.mjs'
import IconTag                    from '@tabler/icons-vue/dist/esm/icons/IconTag.mjs'
import IconUser                   from '@tabler/icons-vue/dist/esm/icons/IconUser.mjs'
import IconRepeat                 from '@tabler/icons-vue/dist/esm/icons/IconRepeat.mjs'
import IconGitBranch              from '@tabler/icons-vue/dist/esm/icons/IconGitBranch.mjs'
import IconAlignLeft              from '@tabler/icons-vue/dist/esm/icons/IconAlignLeft.mjs'
import IconTable                  from '@tabler/icons-vue/dist/esm/icons/IconTable.mjs'
import IconFingerprint            from '@tabler/icons-vue/dist/esm/icons/IconFingerprint.mjs'
import IconWorld                  from '@tabler/icons-vue/dist/esm/icons/IconWorld.mjs'
import IconHistory                from '@tabler/icons-vue/dist/esm/icons/IconHistory.mjs'
import IconDatabase               from '@tabler/icons-vue/dist/esm/icons/IconDatabase.mjs'
import IconPlug                   from '@tabler/icons-vue/dist/esm/icons/IconPlug.mjs'
import IconPlugConnected          from '@tabler/icons-vue/dist/esm/icons/IconPlugConnected.mjs'
import IconGripVertical           from '@tabler/icons-vue/dist/esm/icons/IconGripVertical.mjs'
import IconAddressBook            from '@tabler/icons-vue/dist/esm/icons/IconAddressBook.mjs'
import IconChecklist              from '@tabler/icons-vue/dist/esm/icons/IconChecklist.mjs'
import IconHash                   from '@tabler/icons-vue/dist/esm/icons/IconHash.mjs'
import IconNews                   from '@tabler/icons-vue/dist/esm/icons/IconNews.mjs'
import IconPin                    from '@tabler/icons-vue/dist/esm/icons/IconPin.mjs'
import IconPinFilled              from '@tabler/icons-vue/dist/esm/icons/IconPinFilled.mjs'
import IconCircleCheckFilled      from '@tabler/icons-vue/dist/esm/icons/IconCircleCheckFilled.mjs'
import IconCamera                 from '@tabler/icons-vue/dist/esm/icons/IconCamera.mjs'
import IconRocket                 from '@tabler/icons-vue/dist/esm/icons/IconRocket.mjs'
import IconRoute                  from '@tabler/icons-vue/dist/esm/icons/IconRoute.mjs'
import IconShare3                 from '@tabler/icons-vue/dist/esm/icons/IconShare3.mjs'
import IconArrowBackUp            from '@tabler/icons-vue/dist/esm/icons/IconArrowBackUp.mjs'
import IconArrowForwardUp          from '@tabler/icons-vue/dist/esm/icons/IconArrowForwardUp.mjs'
import IconThumbUp                from '@tabler/icons-vue/dist/esm/icons/IconThumbUp.mjs'
import IconThumbDown              from '@tabler/icons-vue/dist/esm/icons/IconThumbDown.mjs'
import IconTrophy                 from '@tabler/icons-vue/dist/esm/icons/IconTrophy.mjs'
import IconDeviceFloppy              from '@tabler/icons-vue/dist/esm/icons/IconDeviceFloppy.mjs'
import IconMenu2                     from '@tabler/icons-vue/dist/esm/icons/IconMenu2.mjs'
import IconBold                      from '@tabler/icons-vue/dist/esm/icons/IconBold.mjs'
import IconItalic                    from '@tabler/icons-vue/dist/esm/icons/IconItalic.mjs'
import IconListNumbers               from '@tabler/icons-vue/dist/esm/icons/IconListNumbers.mjs'
import IconH2                        from '@tabler/icons-vue/dist/esm/icons/IconH2.mjs'
import IconH3                        from '@tabler/icons-vue/dist/esm/icons/IconH3.mjs'
import IconCode                      from '@tabler/icons-vue/dist/esm/icons/IconCode.mjs'
import IconLayoutGrid                from '@tabler/icons-vue/dist/esm/icons/IconLayoutGrid.mjs'
import IconQuote                     from '@tabler/icons-vue/dist/esm/icons/IconQuote.mjs'
import IconColumns2                  from '@tabler/icons-vue/dist/esm/icons/IconColumns2.mjs'
import IconAlertCircle            from '@tabler/icons-vue/dist/esm/icons/IconAlertCircle.mjs'

const props = defineProps({
  name:        { type: String, required: true },
  strokeWidth: { type: [Number, String], default: 1.5 },
})

const MAP = {
  'device-analytics':       IconDeviceAnalytics,
  'adjustments-horizontal': IconAdjustmentsHorizontal,
  'headset':                IconHeadset,
  'school':                 IconSchool,
  'brand-facebook':         IconBrandFacebook,
  'brand-youtube':          IconBrandYoutube,
  'alert-circle-filled':    IconAlertCircleFilled,
  'alert-triangle-filled':  IconAlertTriangleFilled,
  'file-alert':             IconFileAlert,
  'hourglass':              IconHourglass,
  'circle':                 IconCircle,
  'book-2':                 IconBook2,
  'inbox':                  IconInbox,
  'trash-x':                IconTrashX,
  'brand-figma':            IconBrandFigma,
  'location-filled':        IconLocationFilled,
  'video':                  IconVideo,
  'circle-caret-right':     IconCircleCaretRight,
  'license':                IconLicense,
  'certificate-2':          IconCertificate2,
  'circle-key':             IconCircleKey,
  'shield-check':           IconShieldCheck,
  'compass':                IconCompass,
  'hand-click':             IconHandClick,
  'pointer':                IconPointer,
  'icons':                  IconIcons,
  'layout':                 IconLayout,
  'typography':             IconTypography,
  'app-window':             IconAppWindow,
  'box':                    IconBox,
  'loader':                 IconLoader,
  'click':                  IconClick,
  'ruler-measure':          IconRulerMeasure,
  'selector':               IconSelector,
  'circle-dot':             IconCircleDot,
  'toggle-left':            IconToggleLeft,
  'forms':                  IconForms,
  'binary-tree':            IconBinaryTree,
  'layout-navbar':          IconLayoutNavbar,
  'picture-in-picture':     IconPictureInPicture,
  'layout-sidebar':         IconLayoutSidebar,
  'ad':                     IconAd,
  'browser':                IconBrowser,
  'message-chatbot':        IconMessageChatbot,
  'microphone':             IconMicrophone,
  'arrows-horizontal':      IconArrowsHorizontal,
  'copyright':              IconCopyright,
  'category':               IconCategory,
  'language':               IconLanguage,
  'number-123':             IconNumber123,
  'abc':                    IconAbc,
  // ── Layout & Navigation ──
  'grid-dots':              IconGridDots,
  'layout-dashboard':       IconLayoutDashboard,
  'home':                   IconHome,
  'list':                   IconList,
  'sitemap':                IconSitemap,
  'ladder':                 IconLadder,

  // ── Chevron / Arrow ──
  'chevron-down':           IconChevronDown,
  'chevron-up':             IconChevronUp,
  'chevron-left':           IconChevronLeft,
  'chevrons-left':          IconChevronsLeft,
  'chevrons-right':         IconChevronsRight,
  'chevron-right':          IconChevronRight,
  'chevron-left-pipe':      IconChevronLeftPipe,
  'chevron-right-pipe':     IconChevronRightPipe,
  'arrow-up':               IconArrowUp,
  'arrow-down':             IconArrowDown,
  'arrow-left':             IconArrowLeft,
  'arrow-right':            IconArrowRight,
  'arrows-left-right':      IconArrowsLeftRight,
  'transfer':               IconTransfer,

  // ── User & HR ──
  'users':                  IconUsers,
  'users-group':            IconUsersGroup,
  'user-circle':            IconUserCircle,
  'user-plus':              IconUserPlus,
  'user-minus':             IconUserMinus,
  'user-check':             IconUserCheck,
  'user-off':               IconUserOff,
  'id-badge-2':             IconIdBadge2,
  'door-exit':              IconDoorExit,
  'medal':                  IconMedal,
  'heart-handshake':        IconHeartHandshake,
  'diamond':                IconDiamond,
  'shirt':                  IconShirt,
  'bulb':                   IconBulb,
  'scale':                  IconScale,
  'math-avg':               IconMathAvg,
  'checks':                 IconChecks,
  'award':                  IconAward,
  'gift':                   IconGift,

  // ── File & Document ──
  'file-invoice':           IconFileInvoice,
  'file-check':             IconFileCheck,
  'file-certificate':       IconFileCertificate,
  'file-export':            IconFileExport,
  'file-import':            IconFileImport,
  'file-plus':              IconFilePlus,
  'file-text':              IconFileText,
  'file-diff':              IconFileDiff,
  'file-analytics':         IconFileAnalytics,
  'clipboard-list':         IconClipboardList,
  'clipboard-check':        IconClipboardCheck,
  'report':                 IconReport,

  // ── Finance & Business ──
  'calculator':             IconCalculator,
  'cash':                   IconCash,
  'coin':                   IconCoin,
  'currency-dollar':        IconCurrencyDollar,
  'receipt':                IconReceipt,
  'signature':              IconSignature,
  'border-outer':            IconBorderOuter,
  'border-radius':           IconBorderRadius,
  'shadow':                  IconShadow,
  'spacing-horizontal':      IconSpacingHorizontal,
  'text-size':               IconTextSize,
  'chart-pie':               IconChartPie,
  'wallet':                 IconWallet,
  'building-bank':          IconBuildingBank,
  'building':               IconBuilding,
  'building-warehouse':     IconBuildingWarehouse,
  'building-community':     IconBuildingCommunity,
  'building-factory':       IconBuildingFactory,
  'building-skyscraper':    IconBuildingSkyscraper,
  'briefcase':              IconBriefcase,
  'shopping-cart':          IconShoppingCart,
  'package':                IconPackage,

  // ── Chart & Data ──
  'chart-bar':              IconChartBar,
  'chart-line':             IconChartLine,
  'chart-donut':            IconChartDonut,
  'trending-up':            IconTrendingUp,
  'trending-down':          IconTrendingDown,

  // ── Action ──
  'plus':                   IconPlus,
  'minus':                  IconMinus,
  'x':                      IconX,
  'check':                  IconCheck,
  'search':                 IconSearch,
  'filter':                 IconFilter,
  'settings':               IconSettings,
  'refresh':                IconRefresh,
  'edit':                   IconEdit,
  'pencil':                 IconPencil,
  'trash':                  IconTrash,
  'copy':                   IconCopy,
  'message-plus':           IconMessagePlus,
  'download':               IconDownload,
  'speakerphone':           IconSpeakerphone,   // thông báo chung
  'fold':                   IconFold,                 // thu gọn tất cả
  'unfold':                 IconArrowsMoveVertical,   // mở rộng tất cả
  'archive':                IconArchive,
  'restore':                IconRestore,
  'upload':                 IconUpload,
  'eye':                    IconEye,
  'eye-off':                IconEyeOff,
  'lock':                   IconLock,
  'lock-open':              IconLockOpen,
  'external-link':          IconExternalLink,
  'maximize':               IconMaximize,
  'minimize':               IconMinimize,
  'sort-ascending':         IconSortAscending,
  'sort-descending':        IconSortDescending,
  'send':                   IconSend,

  // ── Status & Indicator ──
  'circle-check':           IconCircleCheck,
  'circle-x':               IconCircleX,
  'circle-plus':            IconCirclePlus,
  'circle-minus':           IconCircleMinus,
  'alert-circle':           IconAlertCircle,
  'alert-triangle':         IconAlertTriangle,
  'info-circle':            IconInfoCircle,
  'star':                   IconStar,
  'star-filled':            IconStarFilled,
  'checkbox':               IconCheckbox,
  'square':                 IconSquare,

  // ── DataTable header menu ──
  'circle-off':             IconCircleOff,
  'pinned':                 IconPinned,
  'pinned-off':             IconPinnedOff,
  'table-column':           IconTableColumn,
  'column-insert-left':     IconColumnInsertLeft,
  'column-insert-right':    IconColumnInsertRight,
  'column-remove':          IconColumnRemove,
  'text-wrap':              IconTextWrap,
  'text-wrap-disabled':     IconTextWrapDisabled,

  // ── UI & Misc ──
  'dots':                   IconDots,
  'dots-vertical':          IconDotsVertical,
  'dots-circle-horizontal': IconDotsCircleHorizontal,
  'paperclip':              IconPaperclip,
  'link':                   IconLink,
  'book':                   IconBook,
  'calendar':               IconCalendar,
  // ── Spa & Beauty ──
  'scissors':               IconScissors,
  'heart':                  IconHeart,
  'droplet':                IconDroplet,
  'leaf':                   IconLeaf,
  'flower':                 IconFlower,
  'hand-stop':              IconHandStop,
  'sparkle':                IconSparkle,
  'clock':                  IconClock,
  'clock-hour-4':           IconClockHour4,
  'fingerprint':            IconFingerprint,
  'loader-2':               IconLoader2,
  'file-spreadsheet':       IconFileSpreadsheet,
  'clipboard':              IconClipboard,
  'photo':                  IconPhoto,
  'photo-up':               IconPhotoUp,
  'volume':                 IconVolume,
  'volume-off':             IconVolumeOff,
  'bell-off':               IconBellOff,
  'bell-ringing':           IconBellRinging,
  'corner-down-right':      IconCornerDownRight,
  'folders':                IconFolders,
  'zoom-in':                IconZoomIn,
  'zoom-out':               IconZoomOut,
  'scan':                   IconScan,
  'palette':                IconPalette,
  'adjustments':            IconAdjustments,
  'login-2':                IconLogin2,
  'login':                  IconLogin,
  'logout':                 IconLogout,
  'bell':                   IconBell,
  'mood-smile':             IconMoodSmile,
  'player-play':            IconPlayerPlay,
  'player-play-filled':     IconPlayerPlayFilled,
  'flame-filled':           IconFlameFilled,
  'tool':                   IconTool,
  'cpu':                    IconCpu,
  'sparkles':               IconSparkles,
  'device-desktop':         IconDeviceDesktop,
  'device-mobile':          IconDeviceMobile,
  'list-details':           IconListDetails,
  'arrows-exchange':        IconArrowsExchange,
  'chart-bar-off':          IconChartBarOff,
  'help':                   IconHelp,
  'help-circle':            IconHelpCircle,
  'message-circle':         IconMessageCircle,
  'map-pin':                IconMapPin,
  'phone':                  IconPhone,
  'mail':                   IconMail,
  'at':                     IconAt,
  'keyboard':               IconKeyboard,
  'printer':                IconPrinter,
  'sun':                    IconSun,
  'moon':                   IconMoon,
  'apps':                   IconApps,
  'grid-3x3':               IconGrid3x3,
  'folder':                 IconFolder,
  'folder-open':            IconFolderOpen,
  'layout-kanban':          IconLayoutKanban,
  'flag':                   IconFlag,
  'flag-2':                 IconFlag2,
  'flag-3':                 IconFlag3,
  // ── Weather ──
  'cloud':                  IconCloud,
  'wind':                   IconWind,
  'thermometer':            IconThermometer,
  'droplets':               IconDroplets,
  // ── Task form extras ──
  'tag':                    IconTag,
  'user':                   IconUser,
  'repeat':                 IconRepeat,
  'git-branch':             IconGitBranch,
  'align-left':             IconAlignLeft,
  'table':                  IconTable,
  'world':                  IconWorld,
  'history':                IconHistory,
  'database':               IconDatabase,
  'plug':                   IconPlug,
  'plug-connected':         IconPlugConnected,
  // ── AMIS Home ──
  'address-book':           IconAddressBook,
  'news':                   IconNews,
  'arrow-back-up':          IconArrowBackUp,
  'arrow-forward-up':       IconArrowForwardUp,
  'thumb-up':               IconThumbUp,
  'thumb-down':             IconThumbDown,
  'share-3':                IconShare3,
  'hash':                   IconHash,
  'trophy':                 IconTrophy,
  'pin':                    IconPin,
  'pin-filled':             IconPinFilled,
  'circle-check-filled':    IconCircleCheckFilled,
  'camera':                 IconCamera,
  'checklist':               IconChecklist,
  'rocket':                 IconRocket,
  'route':                  IconRoute,
  'grip-vertical':          IconGripVertical,
  // ── Soạn thảo tài liệu (mds-docs) ──
  'device-floppy':          IconDeviceFloppy,
  'menu-2':                 IconMenu2,
  'bold':                   IconBold,
  'italic':                 IconItalic,
  'list-numbers':           IconListNumbers,
  'h-2':                    IconH2,
  'h-3':                    IconH3,
  'code':                   IconCode,
  'layout-grid':            IconLayoutGrid,
  'quote':                  IconQuote,
  'columns-2':              IconColumns2,
}

const custom = computed(() => CUSTOM_ICONS[props.name] || null)
const iconComp = computed(() => {
  const key = props.name.replace(/^ti-/, '')
  return MAP[key] || null
})
</script>
