<!-- source: Số đo và trạng thái từng control — đọc từ CSS thật trong mds-ui -->
# SỐ ĐO + TRẠNG THÁI TỪNG CONTROL (đọc tự động từ code mds-ui)

Mỗi dòng = 1 phần tử của control: selector → các số đo (đã đổi token sang số). Mục “trạng thái” = màu / viền / bóng khi hover, focus, disabled, lỗi, được chọn.

## Accordion — AppAccordion
- `.accordion`: Rộng **100%**
- `.accordion--outline`: Gap **12px**
- `.accordion__item`: Nền **#ffffff**
- `.accordion__header`: Rộng **100%** · Padding **16px** · Gap **8px** · Border **0** · Màu chữ **#10141b**
- `.accordion__title`: Rộng tối thiểu **0** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.accordion__chevron`: Cao **20px** · Rộng **20px** · Font size **20px** · Màu chữ **#6b707a**
- `.accordion__body`: Padding **12px 16px 16px** · Font size **13px** · Line height **20px** · Màu chữ **#10141b**

## Accordion — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.accordion__header:focus-visible`: Outline **2px solid #245fdf**

## AI Search box (tìm thông minh) — AppAiSearchbox
- `.ais` (Viền gradient AI vẽ bằng 2 lớp nền (padding-box trắng / border-box gradient) — bo góc giữ nguyên): Cao Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Rộng **240px** · Rộng tối đa **100%** · Padding **0 8px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Border **1px solid transparent** · Nền **linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(110deg, #1482ff 0%, #cf11ff 100%) border-box**
- `.ais__icon`: Font size **16px**
- `.ais__native`: Cao **100%** · Rộng tối thiểu **0** · Padding **0** · Font size **13px** · Line height **20px** · Nền **transparent** · Màu chữ **#10141b**
- `.ais__native::placeholder` (Placeholder: chữ gradient AI 400 (AI_Hint)): Nền **linear-gradient(135deg, #50beff, #ee5dff)** · Màu chữ **#50beff**
- `.ais__btn`: Cao **20px** · Rộng **20px** · Padding **0** · Border radius **4px** · Font size **16px** · Nền **transparent** · Màu chữ **#6b707a**
- `.ais__badge` (Huy hiệu “AI”: 16×16 bo 4, nền gradient AI 200, chữ 11 Medium gradient AI 600): Cao **16px** · Rộng tối thiểu **16px** · Padding **0 3px** · Border radius **4px** · Font size **10px** · Font weight **500** · Line height **15px** · Nền **linear-gradient(98deg, #b9e5ff, #f6c6ff)**
- `.ais__badge-t`: Nền **linear-gradient(95deg, #1482ff, #cf11ff)** · Màu chữ **#1482ff**
- `.ais-pop` (Popup của ô tìm kiếm AI (nằm ở <body>) — Figma Search Global engine: nền trắng · bo 8 · bóng popover): Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff** · Màu chữ **#10141b**
- `.ais-pop--parsed`: Rộng tối đa **560px** · Padding **16px**
- `.ais-pop--results` (đệm khối đều 4 phía (quy chuẩn)): Padding **16px** · Padding **16px**
- `.ais-res__group:last-child`: Padding dưới **0**
- `.ais-muted`: Màu chữ **#6b707a**
- `.ais-cond` (Dòng điều kiện: icon phân tích 16 + “Trường: “giá trị”” — giá trị đậm): Gap **8px** · Font size **13px** · Line height **20px**
- `.ais-cond b` (chữ UI tối thiểu Body 13): Font weight **600**
- `.ais-cond__icon.ti`: Font size **16px**
- `.ais-res__head`: Padding dưới **12px** · Gap **8px**
- `.ais-res__title`: Gap **8px** · Font size **16px** · Font weight **600** · Line height **22px**
- `.ais-res__spark.ti` (đúng kiểu chữ H3 (Semi Bold) — chỉ đổi màu sang .text-ai-primary): Font size **20px**
- `.ais-res__empty`: Padding **12px 0 16px** · Font size **13px**
- `.ais-res__group` (Nhóm kết quả: nhãn nhóm 120px VIẾT HOA chữ phụ · danh sách · số kết quả (Tag X Small) bên phải): Padding **12px 0** · Gap **12px** · Gap **4px 12px**
- `.ais-res__gtitle`: Rộng **120px** · Padding **8px 0** · Font size **13px** · Font weight **600** · Line height **20px** · Màu chữ **#6b707a** · Rộng **auto**
- `.ais-res__items`: Rộng tối thiểu **0** · Gap **4px**
- `.ais-res__item`: Rộng **100%** · Padding **8px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- `.ais-res__text`: Rộng tối thiểu **0** · Gap **2px**
- `.ais-res__name`: Font size **13px** · Font weight **600** · Line height **20px**
- `.ais-res__sub`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.ais-res__meta`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.text-ai-primary`: Nền **linear-gradient(110deg, #1482ff 0%, #cf11ff 100%)** · Màu chữ **transparent**

## AI Search box (tìm thông minh) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.ais:hover:not(.ais--disabled)`: Nền **linear-gradient(135deg, #edf9ff, #fef2ff) padding-box, linear-gradient(110deg, #0a68eb 0%, #aa00cf 100%) border-box**
- `.ais:focus-within:not(.ais--disabled)`: Nền **linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(110deg, #1482ff 0%, #cf11ff 100%) border-box** · Box shadow **0 0 0 3px color-mix(in srgb, #cf11ff 14%, transparent)**
- `.ais__btn:hover`: Nền **#f2f2f4**
- `.ais__btn--on`: Nền **#f2f2f4**
- `.ais__badge--btn:hover`: Box shadow **0 0 0 2px color-mix(in srgb, #cf11ff 20%, transparent)**
- `.ais__badge--btn:focus-visible`: Outline **2px solid #245fdf**
- `.ais--disabled`: Nền **linear-gradient(#f2f2f4, #f2f2f4) padding-box, linear-gradient(#88d6ff, #88d6ff) border-box**
- `.ais--disabled .ais__native::placeholder`: Màu chữ **#9da2ac**
- `.ais--disabled .ais__icon`: Độ mờ **0.5**
- `.ais-res__item:hover`: Nền **#f0f6fe**
- `.ais-res__item:focus-visible`: Outline **2px solid #245fdf**

## Dialog (hộp thoại xác nhận) — AppAlertDialog
- `.alert-dialog-overlay`: Padding **16px** · Nền **rgba(16, 24, 40, 0.4)**
- `.alert-dialog-inline`: Rộng tối thiểu **0** · Rộng tối đa **100%**
- `.alert-dialog`: Cao tối đa **calc(100vh - 32px)** · Rộng **432px** · Rộng tối đa **100%** · Padding **24px** · Gap **16px** · Border radius **12px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.alert-dialog__head`: Gap **12px**
- `.alert-dialog__title`: Rộng tối thiểu **0** · Padding trên **2px** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.alert-dialog__close` (tiêu đề tối đa 2 dòng (tài liệu Dialog)): Cao **20px** · Rộng **20px** · Padding **0** · Border radius **4px** · Nền **transparent** · Màu chữ **#6b707a**
- `.alert-dialog__close .ti`: Font size **20px**
- `.alert-dialog__body`: Font size **13px** · Line height **20px** · Màu chữ **#10141b**
- `.alert-dialog__actions`: Gap **8px**
- `.alert-dialog__btns`: Gap **8px**

## Dialog (hộp thoại xác nhận) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.alert-dialog__close:hover`: Màu chữ **#6b707a**
- `.alert-dialog__close:focus-visible`: Outline **2px solid #245fdf**

## Avatar (ảnh đại diện) — AppAvatar
- `.app-avatar`: Border radius **9999px** · Line height **1** · Border **1px solid #ffffff** · Màu chữ **#10141b**
- `.app-avatar--image`: Nền **#f2f2f4**
- `.app-avatar__img`: Cao **100%** · Rộng **100%**
- `.app-avatar__dot`: Cao **12px** · Rộng **12px** · Border radius **9999px** · Border **1px solid #ffffff** · Nền **#f04438**
- `.app-avatar__dot--online`: Nền **#12b76a**
- `.app-avatar__count`: Cao **20px** · Rộng tối thiểu **20px** · Padding **0 4px** · Border radius **9999px** · Font size **11px** · Font weight **600** · Line height **1** · Border **1px solid #ffffff** · Màu chữ **#ffffff** · Nền **#f04438**
- `.app-avatar__icon`: Cao **20px** · Rộng tối thiểu **20px** · Padding **0 4px** · Border radius **9999px** · Font size **11px** · Font weight **600** · Line height **1** · Border **1px solid #ffffff** · Màu chữ **#ffffff** · Màu chữ **#ffffff** · Rộng **20px** · Padding **0** · Nền **#8f949d**

## Avatar (ảnh đại diện) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.app-avatar--interactive:hover`: Màu viền **#99c5f7** · Box shadow **0 0 0 1px #99c5f7**
- `.app-avatar--active`: Màu viền **#99c5f7** · Box shadow **0 0 0 1px #99c5f7**

## AppAvatarCropper
- `.avc`: Gap **12px**
- `.avc__stage`: Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Nền **#f2f2f4**
- `.avc__mask`: Border radius **50%** · Box shadow **0 0 0 999px rgba(0, 0, 0, 0.45)**
- `.avc__empty`: Padding **16px** · Gap **6px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Border **1px dashed #ced1d6** · Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.avc__zoom`: Rộng **240px** · Gap **8px** · Màu chữ **#6b707a**
- `.avc__actions`: Gap **8px**
- `.avc__error`: Gap **4px** · Font size **13px** · Màu chữ **#f04438**

## AppAvatarCropper — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.avc__empty:hover`: Nền **#f0f6fe** · Màu viền **#245fdf**

## Button (nút) — AppButton
- `.btn--success`: Màu chữ **#ffffff** · Nền **#12b76a** · Màu chữ **#ffffff**
- `.btn--warning`: Màu chữ **#ffffff** · Nền **#f79009** · Màu chữ **#ffffff**
- `.btn--danger`: Màu chữ **#ffffff** · Nền **#f04438** · Màu chữ **#ffffff**
- `.btn--black`: Màu chữ **#ffffff** · Nền **#000000** · Màu chữ **#ffffff**
- `.btn--info`: Màu chữ **#ffffff** · Nền **#1570ef** · Màu chữ **#ffffff**
- `.btn--outline-inverse`: Màu chữ **#ffffff** · Nền **transparent** · Màu chữ **#ffffff**
- `.btn--primary`: Nền **#245fdf** · Màu chữ **#ffffff**
- `.btn--outline`: Nền **#ffffff** · Màu chữ **#245fdf**
- `.btn--ghost`: Nền **transparent** · Màu chữ **#6b707a**
- `.btn--link`: Cao **auto** · Rộng tối thiểu **0** · Padding **0** · Gap **4px** · Nền **transparent** · Màu chữ **#245fdf**
- `.btn--ghost-white`: Nền **transparent** · Màu chữ **rgba(255,255,255,0.85)**
- `.btn--neutral`: Nền **#ffffff** · Màu chữ **#10141b**
- `.btn--block`: Rộng **100%**
- `.btn--icon-only`: Rộng Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Padding **0**
- `.spinner`: Cao **40px** · Rộng **40px** · Border radius **50%** · Border **3px solid currentColor** · Màu chữ **#245fdf**
- `.spinner--sm`: Cao **20px** · Rộng **20px**
- `.btn--white`: Nền **#ffffff** · Màu chữ **#10141b**
- `.btn--text-inverse`: Nền **transparent** · Màu chữ **#ffffff**
- `.btn--outline-info`: Nền **#ffffff** · Màu chữ **#1570ef**
- `.btn--outline-success`: Nền **#ffffff** · Màu chữ **#039855**
- `.btn--outline-warning`: Nền **#ffffff** · Màu chữ **#dc6803**
- `.btn--outline-danger`: Nền **#ffffff** · Màu chữ **#f04438**
- `.btn--text`: Nền **transparent** · Màu chữ **var(--bt-c)**
- `.btn--text-neutral`: Nền **transparent** · Màu chữ **var(--bt-c)** · Màu chữ **var(--bt-ic)** · Nền **var(--bt-h)** · Nền **var(--bt-p)** · Nền **transparent** · Màu chữ **var(--bt-d)** · Màu chữ **var(--bt-icd)**
- `.btn--text-info`: Nền **transparent** · Màu chữ **var(--bt-c)** · Màu chữ **var(--bt-ic)** · Nền **var(--bt-h)** · Nền **var(--bt-p)** · Nền **transparent** · Màu chữ **var(--bt-d)** · Màu chữ **var(--bt-icd)**
- `.btn--text-warning`: Nền **transparent** · Màu chữ **var(--bt-c)** · Màu chữ **var(--bt-ic)** · Nền **var(--bt-h)** · Nền **var(--bt-p)** · Nền **transparent** · Màu chữ **var(--bt-d)** · Màu chữ **var(--bt-icd)**
- `.btn--text-danger`: Nền **transparent** · Màu chữ **var(--bt-c)** · Màu chữ **var(--bt-ic)** · Nền **var(--bt-h)** · Nền **var(--bt-p)** · Nền **transparent** · Màu chữ **var(--bt-d)** · Màu chữ **var(--bt-icd)**
- `.btn--text-success`: Nền **transparent** · Màu chữ **var(--bt-c)**
- `.btn--ai-outline`: Nền **linear-gradient(110deg, #1482ff 0%, #cf11ff 100%), #ffffff** · Màu chữ **transparent**
- `.btn--ai-text`: Nền **linear-gradient(110deg, #1482ff 0%, #cf11ff 100%), transparent** · Màu chữ **transparent**

## Button (nút) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.btn--primary:hover`: Nền **#2753ce** · Màu viền **#2753ce**
- `.btn--primary:active`: Nền **#2644a7** · Màu viền **#2644a7**
- `.btn--primary:disabled`: Nền **#68a6f2** · Màu viền **#68a6f2**
- `.btn--outline:hover`: Nền **#f0f6fe**
- `.btn--outline:active`: Nền **#c2dbfb**
- `.btn--ghost:hover`: Nền **#f2f2f4**
- `.btn--link:hover:not(:disabled)`: Nền **transparent**
- `.btn--link:disabled`: Màu chữ **#9da2ac**
- `.btn--ghost-white:hover`: Nền **rgba(255,255,255,0.15)**
- `.btn--neutral:hover`: Nền **#f2f2f4**
- `.btn--success:hover`: Nền **#039855** · Màu viền **#039855**
- `.btn--success:active`: Nền **#027a48** · Màu viền **#027a48**
- `.btn--warning:hover`: Nền **#dc6803** · Màu viền **#dc6803**
- `.btn--warning:active`: Nền **#b54708** · Màu viền **#b54708**
- `.btn--danger:hover`: Nền **#d92d20** · Màu viền **#d92d20**
- `.btn--danger:active`: Nền **#b42318** · Màu viền **#b42318**
- `.btn--black:hover`: Nền **#484e59** · Màu viền **#484e59**
- `.btn--black:active`: Nền **#303642** · Màu viền **#303642**
- `.btn--white:hover`: Nền **#f2f2f4** · Màu viền **#f2f2f4**
- `.btn--white:active`: Nền **#e6e7ea** · Màu viền **#e6e7ea**
- `.btn--outline-inverse:hover`: Nền **#ffffff độ mờ 20%**
- `.btn--outline-inverse:active`: Nền **#ffffff độ mờ 30%**
- `.btn--text-inverse:hover`: Nền **#ffffff độ mờ 20%**
- `.btn--text-inverse:active`: Nền **#ffffff độ mờ 30%**
- `.btn--info:hover`: Nền **#175cd3** · Màu viền **#175cd3**
- `.btn--info:active`: Nền **#1849a9** · Màu viền **#1849a9**
- `.btn--outline-info:hover`: Nền **#eff8ff**
- `.btn--outline-info:active`: Nền **#b2ddff**
- `.btn--outline-success:hover`: Nền **#ecfdf3**
- `.btn--outline-warning:hover`: Nền **#fffaeb**

## Checkbox (ô tick) — AppCheckbox
- `.app-cb`: Gap **8px**
- `.app-cb__wrap` (20×20 hover-ring container): Cao **20px** · Rộng **20px** · Border radius **50%**
- `.app-cb__native` (Native input — visually hidden, stays focusable): Cao **0** · Rộng **0**
- `.app-cb__box` (Visible box: 16×16): Cao **16px** · Rộng **16px** · Border radius **4px** · Border **1.5px solid #ced1d6** · Nền **#ffffff**
- `.app-cb__icon`: Rộng **10px**
- `.app-cb__label`: Font size **13px** · Line height **20px** · Màu chữ **#10141b**

## Checkbox (ô tick) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.app-cb:not(.app-cb--disabled):hover .app-cb__wrap`: Nền **#f0f6fe**
- `.app-cb:not(.app-cb--disabled):active .app-cb__wrap`: Nền **#ddeafc**
- `.app-cb:not(.app-cb--disabled):hover .app-cb__box` (Hover: border → brand): Màu viền **#245fdf**
- `.app-cb--error .app-cb__box` (Error: viền đỏ khi chưa chọn + trường bắt buộc): Màu viền **#f04438**
- `.app-cb--checked .app-cb__box` (Checked & indeterminate: fill brand): Nền **#245fdf** · Màu viền **#245fdf**
- `.app-cb--indeterminate .app-cb__box` (Checked & indeterminate: fill brand): Nền **#245fdf** · Màu viền **#245fdf**
- `.app-cb__native:focus-visible + .app-cb__box` (Focus ring via hidden native input): Outline **2px solid #245fdf**
- `.app-cb--disabled .app-cb__box` (Disabled (Figma Checkbox 6019:33623): · Unchecked = nền BG/Neutral Light + viền Stroke/Neutral · Checked / Ind): Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.app-cb--disabled.app-cb--checked .app-cb__box`: Nền **#68a6f2** · Màu viền **#68a6f2**
- `.app-cb--disabled.app-cb--indeterminate .app-cb__box`: Nền **#68a6f2** · Màu viền **#68a6f2**

## ComboBox / DropDownList (ô chọn xổ xuống) — AppCombobox
- `.cb-avatar` (Avatar trong tag đã chọn / logo vuông (avatarSquare) — dòng danh sách người dùng AppAvatar 32px): Cao **24px** · Rộng **24px** · Border radius **50%** · Border **1px solid #e5e6e9**
- `.cb-avatar img`: Cao **100%** · Rộng **100%** · Font size **9px** · Font weight **600** · Line height **1** · Màu chữ **#10141b**
- `.cb-avatar span`: Cao **100%** · Rộng **100%** · Font size **9px** · Font weight **600** · Line height **1** · Màu chữ **#10141b**
- `.cb-field`: Cao **100%** · Rộng tối thiểu **0** · Gap **4px**
- `.cb-trigger`: Rộng tối thiểu **40px** · Padding **0**
- `.cb-trigger--tight`: Rộng tối thiểu **8px**
- `.cb-tags`: Rộng tối thiểu **0** · Gap **4px**
- `.cb-tags:not(.cb-tags--measure) .cb-tag:last-child` (Thẻ cuối được co + cắt “…” khi 1 thẻ cũng không đủ chỗ; lúc đo thì giữ nguyên bề rộng thật): Rộng tối thiểu **0**
- `.cb-tag__label`: Rộng tối thiểu **0**
- `.ibox--tags` (Chọn nhiều — Figma MDS “Combobox Multiple” (6019:50293): ô lề trái 4px (tính cả viền 1px), thẻ Tag Small cao =): Padding trái **3px**
- `.cb-tag`: Cao **24px** · Padding **0 8px** · Gap **6px** · Border radius Trung bình **6px** · Nhỏ **4px** · Rộng **6px** · Font size **13px** · Font weight **500** · Line height **18px** · Border **1px solid #ced1d6** · Nền **#f2f2f4** · Màu chữ **#10141b**
- `.cb-tag--custom`: Nền **#ffffff**
- `.cb-tag.cb-tag--more` (Thẻ đếm “Tag More”: ô vuông chứa số mục ẩn + 2 mép thẻ xếp phía sau (Figma “Subtract” 8×24, lệch nhau 4px)): Rộng tối thiểu **24px** · Padding **0 6px**
- `.cb-tag--more::before`: Rộng **8px** · Nền **url('../assets/tag-stack.svg') no-repeat center / 100% 100%**
- `.cb-tag--more::after`: Rộng **8px** · Nền **url('../assets/tag-stack.svg') no-repeat center / 100% 100%**
- `.cb-tag__ic`: Font size **12px** · Màu chữ **#6b707a**
- `.cb-avatar--tag`: Cao **14px** · Rộng **14px**
- `.cb-avatar--tag img` (giữ viền 1px như mọi avatar người): Font size **7px**
- `.cb-avatar--tag span` (giữ viền 1px như mọi avatar người): Font size **7px**
- `.cb-avatar--square`: Border radius **4px** · Nền **transparent**
- `.cb-avatar--square img`: Nền **transparent**
- `.cb-avatar--tag.cb-avatar--square` (logo: không nền, không viền): Border radius **3px**
- `.cb-list__create`: Màu chữ **#245fdf**
- `.cb-list__create-link`: Font size **13px** · Line height **20px** · Màu chữ **#245fdf**
- `.cb-split` (Split: ô phải ngăn vạch, cao bằng ô · icon 16): Rộng Trung bình **30px** · Nhỏ **26px** · Rộng **34px** · Border radius Trung bình **0 7px 7px 0** · Nhỏ **0 5px 5px 0** · Rộng **0 7px 7px 0** · Nền **transparent** · Màu chữ **#6b707a**
- `.cb-split .ti`: Font size **16px**
- `.cb-thead` (Dạng bảng (Figma Combobox Single › Dạng bảng): hàng tiêu đề nền xám nhạt chữ đậm · dòng kẻ ngang · chân danh s): Rộng **100%** · Cao tối thiểu Trung bình **32px** · Nhỏ **32px** · Rộng **36px** · Padding Trung bình **0 20px** · Nhỏ **0 20px** · Rộng **0 24px** · Font size **13px** · Font weight **600** · Nền **#f2f2f4** · Màu chữ **#10141b**
- `.cb-tr` (Dạng bảng (Figma Combobox Single › Dạng bảng): hàng tiêu đề nền xám nhạt chữ đậm · dòng kẻ ngang · chân danh s): Rộng **100%**
- `.cb-th`: Rộng tối thiểu **0** · Font size **13px** · Line height **20px**
- `.cb-td`: Rộng tối thiểu **0** · Font size **13px** · Line height **20px** · Màu chữ **#10141b**
- `.cb-list--table .cb-thead` (màn hẹp hơn bảng → cuộn ngang cả tiêu đề lẫn dòng): Rộng tối thiểu **max-content**
- `.cb-list--table .cb-list__scroll` (màn hẹp hơn bảng → cuộn ngang cả tiêu đề lẫn dòng): Rộng tối thiểu **max-content** · Padding **0** · Gap **0**
- `.cb-list--table .cb-list__item`: Cao tối thiểu Trung bình **36px** · Nhỏ **36px** · Rộng **40px** · Padding Trung bình **6px 20px** · Nhỏ **6px 20px** · Rộng **6px 24px** · Border radius **0**
- `.cb-list__foot`: Padding Trung bình **8px 20px** · Nhỏ **8px 20px** · Rộng **8px 24px** · Gap **12px** · Nền **#f2f2f4**
- `.cb-list__create-ic`: Màu chữ **#245fdf**
- `.cb-tag__x`: Màu chữ **#6b707a**

## ComboBox / DropDownList (ô chọn xổ xuống) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.cb-tag.cb-tag--focus` (Backspace lần 1: thẻ cuối sáng màu brand (lần 2 mới bỏ)): Nền **#f0f6fe** · Màu chữ **#245fdf** · Màu viền **#245fdf**
- `.cb-split:hover:not(:disabled)`: Nền **#f2f2f4**
- `.cb-list--table .cb-list__item--selected .cb-td`: Màu chữ **#245fdf** · Font weight **600**
- `.cb-tag__x:hover` (Figma icon × 12px): Màu chữ **#10141b**
- `.cb-list__item--active` (dòng có avatar 32px → cao Fix-Height-2-Line (48 · Rộng 52)): Nền **#f0f6fe**
- `.cb-list__item--selected`: Nền **#f0f6fe**
- `.cb-list__item:active:not(:disabled)`: Nền **color-mix(in srgb, #245fdf 12%, #ffffff)**
- `.cb-list__item:disabled`: Độ mờ **0.5**
- `.cb-list__item--selected .cb-list__label`: Màu chữ **#245fdf** · Font weight **600**
- `.cb-list__toggle:hover`: Nền **#ddeafc** · Màu chữ **#6b707a**
- `.ibox:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--no-border:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox--no-border:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--header:hover:not(:focus-within)`: Nền **rgba(255,255,255,0.28)** · Màu viền **transparent**
- `.ibox--header:focus-within`: Nền **rgba(255,255,255,0.3)** · Màu viền **transparent** · Box shadow **none**
- `.ibox--error`: Màu viền **#f04438 !important**
- `.ibox--error:focus-within`: Box shadow **0 0 0 3px rgba(240,68,56,0.12) !important**
- `.ibox--disabled`: Nền **#f2f2f4** · Màu viền **#ced1d6** · Độ mờ **0.7**
- `.ibox--readonly`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.ibox__search-clear:hover`: Màu chữ **#10141b**
- `.ibox__icon--action:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.ibox__icon--clear:hover`: Nền **#f2f2f4**
- `.ibox__icon--brand:hover`: Màu chữ **#4584ec**
- `.ibox__stepper-btn:hover`: Nền **#f2f2f4**
- `.ibox__stepper-btn:disabled`: Độ mờ **0.4**

## AppCrossSell
- `.kpi-icon`: Cao **44px** · Rộng **44px** · Border radius **10px**
- `.kpi-icon--brand`: Nền **#f0f6fe** · Màu chữ **#245fdf**
- `.kpi-icon--success`: Nền **#ecfdf3** · Màu chữ **#039855**
- `.kpi-icon--warning`: Nền **#fffaeb** · Màu chữ **#dc6803**
- `.kpi-icon--danger`: Nền **#fef3f2** · Màu chữ **#f04438**
- `.kpi-icon--info`: Nền **color-mix(in srgb, var(--kpi-c) 12%, transparent)** · Màu chữ **var(--kpi-c)**
- `.kpi-icon--purple`: Nền **color-mix(in srgb, var(--kpi-c) 12%, transparent)** · Màu chữ **var(--kpi-c)**
- `.kpi-icon--blue`: Nền **color-mix(in srgb, var(--kpi-c) 12%, transparent)** · Màu chữ **var(--kpi-c)**
- `.kpi-icon--pink`: Nền **color-mix(in srgb, var(--kpi-c) 12%, transparent)** · Màu chữ **var(--kpi-c)**
- `.xsell`: Padding **16px**
- `.xsell__row`: Rộng tối thiểu **0** · Gap **16px**
- `.xsell__head`: Gap **12px**
- `.xsell__badge`: Cao **36px** · Rộng **36px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- `.xsell__titles`: Rộng tối thiểu **0**
- `.xsell__title`: Font size **13px** · Font weight **600** · Line height **20px** · Màu chữ **#10141b**
- `.xsell__sub`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.xsell__divider`: Rộng **1px** · Nền **#e5e6e9**
- `.xsell__inline`: Cao **40px** · Rộng tối thiểu **0** · Padding **0** · Gap **4px 8px**
- `.xsell__chip`: Gap **8px** · Nền **transparent** · Màu chữ **#10141b** · Cao **40px** · Padding **0 8px 0 4px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Border **0**
- `.xsell__card`: Gap **8px** · Nền **transparent** · Màu chữ **#10141b** · Cao tối thiểu **56px** · Padding **12px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Border **1px solid #e5e6e9**
- `.xsell__ic`: Cao **32px** · Rộng **32px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- `.xsell__ic--brand`: Nền **#f0f6fe** · Màu chữ **#245fdf**
- `.xsell__ic--success`: Nền **#ecfdf3** · Màu chữ **#039855**
- `.xsell__ic--info`: Nền **#eff8ff** · Màu chữ **#1570ef**
- `.xsell__ic--warning`: Nền **#fffaeb** · Màu chữ **#dc6803**
- `.xsell__ic--danger`: Nền **#fef3f2** · Màu chữ **#f04438**
- `.xsell__ic--purple`: Nền **#f9f5ff** · Màu chữ **#9e77ed**
- `.xsell__ic--pink`: Nền **color-mix(in srgb, #ee46bc 12%, transparent)** · Màu chữ **#ee46bc**
- `.xsell__name`: Font size **13px** · Line height **20px**
- `.xsell__more-in`: Cao tối thiểu **0**
- `.xsell__grid`: Padding **0** · Gap **12px**

## AppCrossSell — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.xsell__chip:hover`: Nền **#f0f6fe**
- `.xsell__card:hover`: Nền **#f0f6fe**
- `.xsell__chip:active`: Nền **#c2dbfb**
- `.xsell__card:active`: Nền **#c2dbfb**
- `.xsell__chip:focus-visible`: Outline **2px solid #245fdf**
- `.xsell__card:focus-visible`: Outline **2px solid #245fdf**

## DatePicker (lịch chọn ngày) — AppDatePicker
- `.dp` (Bảng chọn (nằm ở <body>) — Figma Date Time Picker: nền trắng · bo 12 · bóng Bottom 12 · đệm 12 trên-dưới / 12 ): Rộng tối đa **calc(100vw - 16px)** · Padding **12px 0** · Border radius **12px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff** · Màu chữ **#10141b**
- `.dp__pane`: Padding **0 12px**
- `.dp__head`: Cao tối thiểu **28px** · Gap **4px**
- `.dp__nav`: Rộng tối thiểu **56px**
- `.dp__nav .btn-icon`: Border radius **4px**
- `.dp__title-btn`: Cao **28px** · Padding **0 8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Font weight **500** · Nền **transparent** · Màu chữ **#10141b**
- `.dp__divider`: Cao **1px** · Nền **#e5e6e9**
- `.dp__wd`: Cao **32px** · Font size **10px** · Line height **15px** · Màu chữ **#10141b**
- `.dp__wd--sun`: Màu chữ **#f04438**
- `.dp-cell` (Ô ngày / tháng / năm): Cao **32px** · Rộng tối thiểu **32px** · Padding **0** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Line height **20px** · Border **1px solid transparent** · Nền **transparent** · Màu chữ **#10141b**
- `.dp-cell--wide`: Cao **40px**
- `.dp__grid--decades .dp-cell`: Font size **13px** · Line height **15px**
- `.dp-cell--other`: Màu chữ **#9da2ac)**
- `.dp-cell--today`: Font weight **500** · Màu chữ **#245fdf**
- `.dp-cell--in`: Border radius **0** · Nền **#f0f6fe** · Màu chữ **#10141b**
- `.dp-cell--sel`: Font weight **500** · Nền **#245fdf** · Màu chữ **#ffffff**
- `.dp-cell--band`: Font weight **500** · Nền **#245fdf** · Màu chữ **#ffffff** · Border radius **0**
- `.dp__pane--time` (Cột giờ : phút : giây — cuộn từng cột, ngăn bằng vạch): Rộng tối thiểu **0**
- `.dp__cols`: Cao **224px**
- `.dp__col`: Rộng **64px** · Padding **0 8px** · Gap **4px**
- `.dp-cell--time`: Rộng **100%**
- `.dp-cell--slot`: Font size **13px**
- `.dp__presets` (Chọn nhanh): Padding **12px 8px** · Gap **4px**
- `.dp__preset`: Cao tối thiểu **32px** · Rộng **100%** · Padding **0 12px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Nền **transparent** · Màu chữ **#10141b**
- `.dp__foot` (Chân): Padding **0 12px** · Gap **8px**
- `.ibox--no-border`: Nền **#f2f2f4**
- `.ibox--ghost`: Nền **transparent**
- `.ibox--header`: Border radius **8px** · Nền **rgba(255,255,255,0.2)**
- `.ibox--sm`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 6px 0 10px** · Gap **6px**
- `.ibox--area`: Cao **auto** · Padding trên **6px** · Padding dưới **6px**
- `.ibox__native`: Cao Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Rộng tối thiểu **0** · Padding **0** · Font size **13px** · Line height Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Nền **transparent** · Màu chữ **#10141b**
- `.ibox__native--area`: Cao **auto** · Padding **2px 0** · Line height **20px**
- `.ibox__clear-btn`: Màu chữ **#6b707a**
- `.ibox__search-clear`: Padding **0** · Màu chữ **#6b707a**
- `.ibox__icon`: Font size **16px** · Line height **0** · Màu chữ **#6b707a**
- `.ibox__icon--sm`: Font size **14px**

## DatePicker (lịch chọn ngày) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.dp-box--open`: Màu viền **#245fdf**
- `.dp__title-btn:hover:not(.dp__title-btn--static)`: Nền **#f2f2f4**
- `.dp-cell:hover`: Nền **#f2f2f4**
- `.dp-cell--today:hover`: Nền **#ddeafc**
- `.dp-cell--in:hover`: Nền **#f0f6fe** · Màu chữ **#10141b**
- `.dp-cell--sel:hover`: Nền **#245fdf** · Màu chữ **#ffffff** · Màu viền **transparent** · Font weight **500**
- `.dp-cell--band:hover`: Nền **#245fdf** · Màu chữ **#ffffff** · Màu viền **transparent** · Font weight **500**
- `.dp-cell:focus-visible`: Outline **2px solid #245fdf**
- `.dp__preset:hover`: Nền **#f0f6fe**
- `.dp__preset--on`: Nền **#f0f6fe** · Màu chữ **#245fdf** · Font weight **600**
- `.ibox:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--no-border:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox--no-border:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--header:hover:not(:focus-within)`: Nền **rgba(255,255,255,0.28)** · Màu viền **transparent**
- `.ibox--header:focus-within`: Nền **rgba(255,255,255,0.3)** · Màu viền **transparent** · Box shadow **none**
- `.ibox--error`: Màu viền **#f04438 !important**
- `.ibox--error:focus-within`: Box shadow **0 0 0 3px rgba(240,68,56,0.12) !important**
- `.ibox--disabled`: Nền **#f2f2f4** · Màu viền **#ced1d6** · Độ mờ **0.7**
- `.ibox--readonly`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.ibox__search-clear:hover`: Màu chữ **#10141b**
- `.ibox__icon--action:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.ibox__icon--clear:hover`: Nền **#f2f2f4**
- `.ibox__icon--brand:hover`: Màu chữ **#4584ec**
- `.ibox__stepper-btn:hover`: Nền **#f2f2f4**
- `.ibox__stepper-btn:disabled`: Độ mờ **0.4**

## Datebox / DateTimePicker (chọn ngày) — AppDatebox
- `.date-pop`: Rộng **280px** · Padding **12px** · Gap **8px** · Border radius **12px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.date-pop__head`: Gap **8px**
- `.date-pop__title`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 8px** · Gap **4px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Font weight **600** · Nền **transparent** · Màu chữ **#10141b**
- `.date-pop__title svg`: Màu chữ **#6b707a**
- `.date-pop__weekdays`: Gap **2px**
- `.date-pop__grid`: Gap **2px**
- `.date-pop__weekdays span`: Padding **2px 0** · Font size **13px** · Font weight **500** · Line height **20px** · Màu chữ **#6b707a**
- `.date-pop__day`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Border **1px solid transparent** · Nền **transparent** · Màu chữ **#10141b**
- `.date-pop__day--muted`: Màu chữ **#9da2ac**
- `.date-pop__day--today`: Font weight **600** · Màu chữ **#245fdf**
- `.date-pop__months`: Padding **4px 0** · Gap **8px**
- `.date-pop__month`: Cao Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Border **1px solid transparent** · Nền **transparent** · Màu chữ **#10141b**
- `.date-pop__month--today`: Màu chữ **#245fdf**
- `.date-pop__foot`: Padding trên **8px** · Gap **8px**
- `.date-pop__link`: Padding **0** · Font size **13px** · Font weight **500** · Nền **transparent** · Màu chữ **#245fdf**
- `.date-pop__link--muted`: Font weight **400** · Màu chữ **#6b707a**
- `.ibox--no-border`: Nền **#f2f2f4**
- `.ibox--ghost`: Nền **transparent**
- `.ibox--header`: Border radius **8px** · Nền **rgba(255,255,255,0.2)**
- `.ibox--sm`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 6px 0 10px** · Gap **6px**
- `.ibox--area`: Cao **auto** · Padding trên **6px** · Padding dưới **6px**
- `.ibox__native`: Cao Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Rộng tối thiểu **0** · Padding **0** · Font size **13px** · Line height Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Nền **transparent** · Màu chữ **#10141b**
- `.ibox__native--area`: Cao **auto** · Padding **2px 0** · Line height **20px**
- `.ibox__clear-btn`: Màu chữ **#6b707a**
- `.ibox__search-clear`: Padding **0** · Màu chữ **#6b707a**
- `.ibox__icon`: Font size **16px** · Line height **0** · Màu chữ **#6b707a**
- `.ibox__icon--sm`: Font size **14px**
- `.ibox__icon--action`: Padding **1px** · Border radius **4px** · Màu chữ **#6b707a**
- `.ibox__icon--clear`: Padding **1px** · Border radius **4px**
- `.ibox__icon--brand`: Màu chữ **#245fdf**
- `.ibox__stepper-btn`: Cao Trung bình **30px** · Nhỏ **26px** · Rộng **34px** · Rộng **28px** · Font size **14px** · Nền **transparent** · Màu chữ **#6b707a**

## Datebox / DateTimePicker (chọn ngày) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.ibox--open`: Màu viền **#245fdf**
- `.date-pop__title:hover`: Nền **#f0f6fe**
- `.date-pop__day:hover`: Nền **#f0f6fe**
- `.date-pop__day--selected`: Nền **#245fdf** · Màu chữ **#ffffff** · Màu viền **#245fdf** · Font weight **600**
- `.date-pop__day--selected:hover`: Nền **#245fdf** · Màu chữ **#ffffff** · Màu viền **#245fdf** · Font weight **600**
- `.date-pop__month:hover`: Nền **#f0f6fe**
- `.date-pop__month--selected`: Nền **#245fdf** · Màu chữ **#ffffff** · Màu viền **#245fdf** · Font weight **600**
- `.date-pop__month--selected:hover`: Nền **#245fdf** · Màu chữ **#ffffff** · Màu viền **#245fdf** · Font weight **600**
- `.ibox:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--no-border:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox--no-border:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--header:hover:not(:focus-within)`: Nền **rgba(255,255,255,0.28)** · Màu viền **transparent**
- `.ibox--header:focus-within`: Nền **rgba(255,255,255,0.3)** · Màu viền **transparent** · Box shadow **none**
- `.ibox--error`: Màu viền **#f04438 !important**
- `.ibox--error:focus-within`: Box shadow **0 0 0 3px rgba(240,68,56,0.12) !important**
- `.ibox--disabled`: Nền **#f2f2f4** · Màu viền **#ced1d6** · Độ mờ **0.7**
- `.ibox--readonly`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.ibox__search-clear:hover`: Màu chữ **#10141b**
- `.ibox__icon--action:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.ibox__icon--clear:hover`: Nền **#f2f2f4**
- `.ibox__icon--brand:hover`: Màu chữ **#4584ec**
- `.ibox__stepper-btn:hover`: Nền **#f2f2f4**
- `.ibox__stepper-btn:disabled`: Độ mờ **0.4**
- `.ibox__icon--error`: Màu chữ **#f04438**

## Popup / Form panel (form nhập liệu dạng popup) — AppFormPanel
- `.form-panel`: Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Nền **#ffffff**
- `.form-panel--maximized`: Border radius **0** · Box shadow **none**
- `.form-header`: Padding **24px 24px 16px** · Gap **12px** · Nền **#ffffff**
- `.form-header__title`: Rộng tối thiểu **0** · Font size **20px** · Font weight **600** · Line height **28px** · Màu chữ **#10141b**
- `.form-body`: Cao tối thiểu **0** · Padding **0 24px 24px**
- `.form-footer`: Padding **12px 24px** · Gap **8px** · Border radius **0 0 12px 12px** · Nền **#f4f4f6**

## AppGlobalAlert
- `.gal`: Cao tối thiểu **36px** · Rộng **100%** · Padding **4px 16px** · Gap **8px** · Font size **13px** · Line height **20px**
- `.gal__icon`: Font size **18px**
- `.gal__text`: Rộng tối thiểu **0**
- `.gal__title`: Font weight **600**
- `.gal--solid` (Nền đặc: chữ + icon trắng): Màu chữ **#ffffff**
- `.gal--solid .gal__icon`: Màu chữ **#ffffff**
- `.gal--solid .gal__close`: Màu chữ **#ffffff**
- `.gal--solid.gal--info`: Nền **#1570ef**
- `.gal--solid.gal--warning`: Nền **#f79009**
- `.gal--solid.gal--danger`: Nền **#f04438**
- `.gal--solid.gal--success`: Nền **#12b76a**
- `.gal--solid.gal--neutral`: Nền **#000000**
- `.gal--light` (Nền nhạt: chữ thường, tiêu đề + icon theo màu loại, nút × neutral): Màu chữ **#10141b**
- `.gal--light .gal__close`: Màu chữ **#6b707a**
- `.gal--light.gal--info`: Nền **#eff8ff**
- `.gal--light.gal--info .gal__icon`: Màu chữ **#1570ef**
- `.gal--light.gal--info .gal__title`: Màu chữ **#1570ef**
- `.gal--light.gal--warning`: Nền **#fffaeb**
- `.gal--light.gal--warning .gal__icon`: Màu chữ **#dc6803**
- `.gal--light.gal--warning .gal__title`: Màu chữ **#dc6803**
- `.gal--light.gal--danger`: Nền **#fef3f2**
- `.gal--light.gal--danger .gal__icon`: Màu chữ **#f04438**
- `.gal--light.gal--danger .gal__title`: Màu chữ **#f04438**
- `.gal--light.gal--success`: Nền **#ecfdf3**
- `.gal--light.gal--success .gal__icon`: Màu chữ **#039855**
- `.gal--light.gal--success .gal__title`: Màu chữ **#039855**
- `.gal--light.gal--neutral`: Nền **#f2f2f4**
- `.gal--light.gal--neutral .gal__icon`: Màu chữ **#10141b**
- `.gal--light.gal--neutral .gal__title`: Màu chữ **#10141b**

## AppGlobalAlert — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.gal--solid .gal__close:hover`: Nền **#ffffff độ mờ 20%**

## AppGlobalSearch
- `.gs-clear` (Nút ✕ xóa trong ô — màu theo nền header (nền màu: trắng mờ · header trắng: icon Neutral)): Cao **20px** · Rộng **20px** · Padding **0** · Border radius **4px** · Nền **transparent**
- `.gs-clear .ti`: Font size **16px** · Màu chữ **#ffffff độ mờ 70%**
- `.global-header--white .gs-clear .ti`: Màu chữ **#6b707a**
- `.gs-pop` (Popup kết quả (ở <body>) — cùng khuôn popup “Kết quả tìm kiếm với AI”: nền trắng · bo 8 · bóng popover · đệm 1): Padding **16px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff** · Màu chữ **#10141b**
- `.gs-state`: Padding **4px 0** · Gap **8px** · Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.gs-empty`: Padding **4px 0**
- `.gs-empty__t`: Font size **13px** · Font weight **600** · Line height **20px**
- `.gs-empty__s`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.gs-group` (Nhóm phân hệ: tên phân hệ 120px VIẾT HOA chữ phụ (trái) · bản ghi (giữa) · số kết quả — Tag Neutral (phải)): Padding **12px 0** · Gap **12px** · Gap **4px 12px**
- `.gs-group:first-child`: Padding trên **0**
- `.gs-group__title`: Rộng **120px** · Padding **8px 0** · Font size **13px** · Font weight **600** · Line height **20px** · Màu chữ **#6b707a** · Rộng **auto**
- `.gs-group__items`: Rộng tối thiểu **0** · Gap **4px**
- `.gs-item`: Rộng **100%** · Padding **8px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- `.gs-item__text`: Rộng tối thiểu **0** · Gap **2px**
- `.gs-item__name`: Font size **13px** · Font weight **600** · Line height **20px**
- `.gs-item__sub`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.gs-item__meta`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.gs-hl`: Padding **0** · Font weight **600** · Màu chữ **#245fdf**
- `.gs-foot`: Padding trên **12px** · Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.search-box-header`: Cao Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Rộng **240px** · Padding **0 8px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Nền **#ffffff độ mờ 20%**

## AppGlobalSearch — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.gs-clear:hover`: Nền **#ffffff độ mờ 20%**
- `.gs-clear:hover .ti`: Màu chữ **#ffffff**
- `.global-header--white .gs-clear:hover`: Nền **#ecedef**
- `.gs-item:hover` (đệm ĐỀU 8 bốn phía (trước 4 trên-dưới / 8 trái-phải → vùng hover nhìn lệch)): Nền **#f0f6fe**
- `.gs-item--active` (đệm ĐỀU 8 bốn phía (trước 4 trên-dưới / 8 trái-phải → vùng hover nhìn lệch)): Nền **#f0f6fe**
- `.gs-item:focus-visible`: Outline **2px solid #245fdf**
- `.search-box-header:hover`: Nền **#ffffff độ mờ 30%** · Box shadow **inset 0 0 0 1px #ffffff**
- `.search-box-header:focus-within`: Nền **#ffffff độ mờ 20%** · Box shadow **inset 0 0 0 1px #ffffff**

## AppHelpPanel
- `.dropdown-menu__item--danger`: Màu chữ **#f04438**
- `.dropdown-menu__icon`: Font size **20px** · Line height **0** · Màu chữ **#6b707a**
- `.dropdown-menu__label`: Rộng tối thiểu **0**
- `.help-panel`: Cao **100%** · Cao tối thiểu **0** · Rộng **100%** · Box shadow **-2px 0 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Left 8) · Nền **#ffffff**
- `.help-panel__head`: Cao **48px** · Padding Trung bình **0 calc(20px - (32px - 20px) / 2) 0 20px** · Nhỏ **0 calc(20px - (28px - 20px) / 2) 0 20px** · Rộng **0 calc(20px - (36px - 20px) / 2) 0 20px** · Gap Trung bình **max(0px, 0px)** · Nhỏ **max(0px, 4px)** · Rộng **max(0px, -4px)** · Nền **#ffffff**
- `.help-panel__title`: Rộng tối thiểu **0** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.help-panel__search`: Padding **12px 20px** · Nền **#f2f2f4**
- `.help-panel__body`: Cao tối thiểu **0** · Padding **16px 20px** · Gap **16px**
- `.help-panel__foot`: Padding Trung bình **calc((44px - 1px - 32px) / 2) calc(16px - (32px - 20px) / 2) calc((44px - 1px - 32px) / 2) 16px** · Nhỏ **calc((44px - 1px - 28px) / 2) calc(16px - (28px - 20px) / 2) calc((44px - 1px - 28px) / 2) 16px** · Rộng **calc((44px - 1px - 36px) / 2) calc(16px - (36px - 20px) / 2) calc((44px - 1px - 36px) / 2) 16px** · Gap Trung bình **calc(22px - 32px / 2)** · Nhỏ **calc(22px - 28px / 2)** · Rộng **calc(22px - 36px / 2)** · Nền **#ffffff**
- `.help-panel__foot-label`: Màu chữ **#10141b**
- `.help-panel__channels`: Rộng tối thiểu **0** · Gap Trung bình **max(0px, 8px)** · Nhỏ **max(0px, 12px)** · Rộng **max(0px, 4px)**
- `.help-panel__foot--expand`: Padding Trung bình **16px calc(16px - (32px - 20px) / 2) 16px 16px** · Nhỏ **16px calc(16px - (28px - 20px) / 2) 16px 16px** · Rộng **16px calc(16px - (36px - 20px) / 2) 16px 16px** · Gap **12px**
- `.help-panel__foot-main`: Rộng tối thiểu **0** · Gap **8px**
- `.help-panel__foot-title`: Padding **0 12px** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.help-panel__foot-item`: Cao tối thiểu **32px** · Padding **0 12px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**

## AppHelpPanel — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.dropdown-menu__item:hover:not(:disabled)`: Nền **#f0f6fe**
- `.dropdown-menu__item:active:not(:disabled)`: Nền **#c2dbfb**
- `.dropdown-menu__item:focus-visible`: Outline **2px solid #245fdf**
- `.dropdown-menu__item:disabled`: Độ mờ **0.45**
- `.dropdown-menu__item--disabled`: Độ mờ **0.45**
- `.dropdown-menu__item--danger:hover:not(:disabled)`: Nền **#fef3f2**
- `.dropdown-menu__item--ai:hover:not(:disabled)`: Nền **linear-gradient(111deg, #edf9ff 8.87%, #fee2ff 100%)**
- `.dropdown-menu__item--active`: Nền **#f0f6fe** · Màu chữ **#245fdf** · Font weight **600**
- `.dropdown-menu__item--active:hover:not(:disabled)`: Nền **#ddeafc**
- `.dropdown-menu__item--active:active:not(:disabled)`: Nền **#c2dbfb**

## AppImageUpload
- `.img-up`: Gap **12px**
- `.img-up__box`: Padding **0** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **24px** · Border **1px solid #ced1d6** · Nền **#ffffff** · Màu chữ **#6b707a**
- `.img-up__box--empty`: Nền **#f2f2f4**
- `.img-up__img`: Cao **100%** · Rộng **100%**
- `.img-up__initials`: Font size **18px** · Font weight **600** · Màu chữ **#6b707a**
- `.img-up__side`: Rộng tối thiểu **0** · Gap **4px**
- `.img-up__actions`: Gap **8px**
- `.img-up__hint`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.img-up__error`: Gap **4px** · Font size **13px** · Màu chữ **#f04438**
- `.img-up__remove`: Màu chữ **#f04438**

## AppImageUpload — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.img-up__box:hover`: Màu viền **#245fdf)**
- `.img-up__box:focus-visible`: Outline **2px solid #245fdf**

## Inline alert (thông báo trong trang) — AppInlineAlert
- `.inline-alert__icon`: Font size **18px**
- `.inline-alert__body`: Rộng tối thiểu **0** · Padding **2px 0**
- `.inline-alert__title`: Font weight **600**
- `.inline-alert__actions`: Gap **8px**
- `.inline-alert__close`: Màu chữ **#6b707a**
- `.inline-alert--info`: Nền **#eff8ff**
- `.inline-alert--warning`: Nền **#fffaeb**
- `.inline-alert--success`: Nền **#ecfdf3**
- `.inline-alert--danger`: Nền **#fef3f2**
- `.inline-alert--stacked`: Padding **12px 12px 12px 16px** · Gap **12px**

## Input (ô nhập) — AppInput
- `.input-field`: Rộng **100%** · Gap **4px**
- `.input-field--row`: Gap **8px**
- `.input-field__label-wrap`: Gap **3px**
- `.input-field__label`: Font size **13px** · Font weight **600** · Line height **20px** · Màu chữ **#10141b**
- `.input-field__required`: Font size **13px** · Font weight **600** · Màu chữ **#f04438**
- `.input-field__body`: Rộng tối thiểu **0** · Gap **4px**
- `.input-field__caption`: Font size **13px** · Line height **16px** · Màu chữ **#6b707a**
- `.input-field__message`: Gap **4px** · Font size **13px** · Line height **16px**
- `.input-field__message--success`: Màu chữ **#039855**
- `.input-field__message--warning`: Màu chữ **#dc6803**
- `.input-field__message--info`: Màu chữ **#1570ef**

## Input (ô nhập) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.input-field__message--error`: Màu chữ **#f04438**

## AppNotification
- `.notif`: Rộng **fit-content** · Rộng tối thiểu **320px** · Rộng tối đa **min(400px, 100%)** · Padding **16px** · Gap **16px** · Border radius **12px** · Font size **13px** · Line height **20px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff** · Màu chữ **#10141b**
- `.notif__ico`: Cao **40px** · Rộng **40px** · Border radius **50%** · Font size **20px**
- `.notif--success .notif__ico`: Nền **#ecfdf3** · Màu chữ **#039855**
- `.notif--warning .notif__ico`: Nền **#fffaeb** · Màu chữ **#dc6803**
- `.notif--info .notif__ico`: Nền **#eff8ff** · Màu chữ **#1570ef**
- `.notif__body`: Rộng tối thiểu **0** · Padding trên **1px** · Gap **4px**
- `.notif__title`: Font size **16px** · Font weight **600** · Line height **22px**
- `.notif__msg`: Màu chữ **#10141b**
- `.notif__actions`: Gap **8px**
- `.notif__close`: Màu chữ **#6b707a**

## AppNotification — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.notif--error .notif__ico`: Nền **#fef3f2** · Màu chữ **#f04438**

## AppNotifier
- `.notifier`: Cao tối đa **calc(100vh - 48px - 32px)** · Gap **16px**

## Numberbox (ô nhập số) — AppNumberbox
- `.ibox--no-border`: Nền **#f2f2f4**
- `.ibox--ghost`: Nền **transparent**
- `.ibox--header`: Border radius **8px** · Nền **rgba(255,255,255,0.2)**
- `.ibox--sm`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 6px 0 10px** · Gap **6px**
- `.ibox--area`: Cao **auto** · Padding trên **6px** · Padding dưới **6px**
- `.ibox__native`: Cao Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Rộng tối thiểu **0** · Padding **0** · Font size **13px** · Line height Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Nền **transparent** · Màu chữ **#10141b**
- `.ibox__native--area`: Cao **auto** · Padding **2px 0** · Line height **20px**
- `.ibox__clear-btn`: Màu chữ **#6b707a**
- `.ibox__search-clear`: Padding **0** · Màu chữ **#6b707a**
- `.ibox__icon`: Font size **16px** · Line height **0** · Màu chữ **#6b707a**
- `.ibox__icon--sm`: Font size **14px**
- `.ibox__icon--action`: Padding **1px** · Border radius **4px** · Màu chữ **#6b707a**
- `.ibox__icon--clear`: Padding **1px** · Border radius **4px**
- `.ibox__icon--brand`: Màu chữ **#245fdf**
- `.ibox__stepper-btn`: Cao Trung bình **30px** · Nhỏ **26px** · Rộng **34px** · Rộng **28px** · Font size **14px** · Nền **transparent** · Màu chữ **#6b707a**

## Numberbox (ô nhập số) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.ibox:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--no-border:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox--no-border:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--header:hover:not(:focus-within)`: Nền **rgba(255,255,255,0.28)** · Màu viền **transparent**
- `.ibox--header:focus-within`: Nền **rgba(255,255,255,0.3)** · Màu viền **transparent** · Box shadow **none**
- `.ibox--error`: Màu viền **#f04438 !important**
- `.ibox--error:focus-within`: Box shadow **0 0 0 3px rgba(240,68,56,0.12) !important**
- `.ibox--disabled`: Nền **#f2f2f4** · Màu viền **#ced1d6** · Độ mờ **0.7**
- `.ibox--readonly`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.ibox__search-clear:hover`: Màu chữ **#10141b**
- `.ibox__icon--action:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.ibox__icon--clear:hover`: Nền **#f2f2f4**
- `.ibox__icon--brand:hover`: Màu chữ **#4584ec**
- `.ibox__stepper-btn:hover`: Nền **#f2f2f4**
- `.ibox__stepper-btn:disabled`: Độ mờ **0.4**
- `.ibox__icon--error`: Màu chữ **#f04438**

## AppOnboarding
- `.ob-overlay` (Lớp phủ + khung popup: rộng 1032 · bo Radius/Dialog 12 · bóng dialog · cao tối đa vừa màn hình, thân cuộn): Padding **24px** · Nền **rgba(16, 24, 40, 0.4)**
- `.ob`: Cao tối đa **100%** · Rộng **1032px** · Rộng tối đa **100%** · Border radius **12px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.ob__head` (Header: đệm 24 / 24 / 16 · tiêu đề H2 · mô tả Body · ✕ icon 20): Padding **24px 24px 16px** · Gap **12px**
- `.ob__head-txt`: Rộng tối thiểu **0** · Gap **4px**
- `.ob__title`: Font size **20px** · Font weight **600** · Line height **28px** · Màu chữ **#10141b**
- `.ob__sub`: Màu chữ **#10141b**
- `.ob__close .ti`: Font size **20px**
- `.ob__body` (Thân: trái nền Neutral Light (đệm 32, các bước cuộn) · phải 360 nền trắng, vạch trái): Cao tối thiểu **0** · Nền **#ffffff**
- `.ob__main`: Rộng tối thiểu **0** · Padding **32px** · Nền **#f2f2f4** · Padding **16px**
- `.ob__bar` (cột trái: BG/Page): Gap **16px**
- `.ob__h3`: Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.ob-progress` (Thanh tiến độ: cao 8 · bo 8 · nền Neutral/300 · Brand (đang làm) / Success (xong) · số Semi Bold): Gap **8px**
- `.ob-progress__track`: Cao **8px** · Rộng **100px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Nền **#ecedef**
- `.ob-progress--sm .ob-progress__track` (rãnh thanh tiến độ: BG/Neutral Hover): Rộng **30px**
- `.ob-progress__fill`: Cao **100%** · Nền **#245fdf**
- `.ob-progress__fill--done`: Nền **#12b76a**
- `.ob-progress__num`: Rộng tối thiểu **28px** · Font weight **600** · Màu chữ **#10141b**
- `.ob__steps` (Bước (Accordion Item): nền trắng · viền Stroke/Neutral · bo 8 · đệm 16 · xong: nền Neutral/100 · bước tiếp the): Gap **12px**
- `.ob-step`: Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Border **1px solid #ced1d6** · Nền **#ffffff**
- `.ob-step--done`: Nền **#fbfbfc**
- `.ob-step__head`: Rộng **100%** · Padding **16px** · Gap **8px** · Border radius Trung bình **7px** · Nhỏ **5px** · Rộng **7px**
- `.ob-step__icon`: Font size **24px** · Màu chữ **#6b707a**
- `.ob-step__title` (bước đang mở: icon Brand cùng tiêu đề): Rộng tối thiểu **0** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.ob-step__chev`: Font size **20px** · Màu chữ **#6b707a**
- `.ob-step__body`: Padding **0 16px 12px**
- `.ob-step__foot`: Padding trên **4px**
- `.ob-group__row`: Gap **8px**
- `.ob-group__check`: Cao **28px** · Rộng **28px** · Padding **0** · Border radius **50%**
- `.ob-group__head`: Rộng tối thiểu **0** · Padding **16px 0** · Gap **8px**
- `.ob-group__chev`: Font size **20px** · Màu chữ **#6b707a**
- `.ob-group__title`: Rộng tối thiểu **0** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.ob-group__status`: Font size **20px** · Màu chữ **#6b707a**
- `.ob-group__status--done`: Màu chữ **#039855**
- `.ob-tasks` (Việc: link Brand + ô video 64 × 40 · rê / đang làm: nền Brand Light): Padding **12px 0 8px** · Gap **12px**
- `.ob-step__body > .ob-tasks`: Padding trên **4px**
- `.ob-task`: Padding trái **16px** · Gap **12px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**

## AppOnboarding — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.ob-step__head:focus-visible`: Outline **2px solid #245fdf**
- `.ob-step__head:hover`: Nền **#f0f6fe**
- `.ob-step__head:active` (quy tắc hover chung: nền Brand Light, chữ giữ nguyên): Nền **#ddeafc**
- `.ob-step--open .ob-step__icon` (icon bước Icon/Neutral (cả khi đã xong)): Màu chữ **#245fdf**
- `.ob-step--open .ob-step__title`: Màu chữ **#245fdf**
- `.ob-group__check:hover` (vùng bấm 28 · icon 20 thẳng mép phải): Nền **#f0f6fe**
- `.ob-group__check:hover .ob-group__status:not(.ob-group__status--done)`: Màu chữ **#245fdf**
- `.ob-group__check:active`: Nền **#ddeafc**
- `.ob-group__check:focus-visible`: Outline **2px solid #245fdf**
- `.ob-group__head:focus-visible`: Outline **2px solid #245fdf**
- `.ob-task:hover`: Nền **#f0f6fe**
- `.ob-task--active`: Nền **#f0f6fe**
- `.ob-task__link:focus-visible`: Outline **2px solid #245fdf**
- `.ob-video:focus-visible`: Outline **2px solid #245fdf**
- `.ob-link:hover`: Nền **#f0f6fe**
- `.ob-link:active`: Nền **#ddeafc**
- `.ob-link:focus-visible`: Outline **2px solid #245fdf**

## Pagination (phân trang) — AppPagination
- `.pagination-bar`: Cao Trung bình **48px** · Nhỏ **40px** · Rộng **56px** · Padding Trung bình **0 16px** · Nhỏ **0 12px** · Rộng **0 16px** · Gap **16px** · Nền **#ffffff**
- `.pagination-bar__sums`: Gap **24px**
- `.pagination-bar__sum-item`: Gap **4px** · Font size **13px** · Line height **20px**
- `.pagination-bar__sum-item--vertical`: Gap **2px**
- `.pagination-bar__sum-label`: Màu chữ **#6b707a**
- `.pagination-bar__sum-value`: Font weight **600** · Màu chữ **#10141b**
- `.pagination-bar__controls`: Gap **16px**
- `.pagination-bar__label`: Font size **13px** · Màu chữ **#10141b**
- `.pagination-bar__range`: Rộng tối thiểu **40px** · Font size **13px** · Font weight **600** · Màu chữ **#10141b**
- `.pagination-bar__nav`: Gap **2px**
- `.pagination-bar__nav-btn`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Rộng Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **16px** · Nền **transparent** · Màu chữ **#6b707a**
- `.paging__nav--advance`: Gap **0**
- `.paging-num`: Cao Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Rộng tối thiểu Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Padding **0 4px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Font weight **400** · Line height **20px** · Nền **transparent** · Màu chữ **#10141b**

## Pagination (phân trang) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.pagination-bar__nav-btn:hover:not(:disabled)`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.pagination-bar__nav-btn:disabled`: Độ mờ **0.35**
- `.paging-num--on`: Màu chữ **#245fdf** · Font weight **700**

## Radio button — AppRadio
- `.app-rb` (Kích thước theo Figma: vòng 16 (Rộng 20) · chấm chọn 8 (Rộng 10) · cách chữ 8): Gap **8px**
- `.app-rb__wrap` (Vòng hover 20 (Rộng 24) quanh nút — như AppCheckbox): Cao **calc(var(--rb-size) + 4px)** · Rộng **calc(var(--rb-size) + 4px)** · Border radius **50%**
- `.app-rb__native`: Cao **0** · Rộng **0**
- `.app-rb__dot`: Cao **var(--rb-size)** · Rộng **var(--rb-size)** · Border radius **50%** · Border **1.5px solid #ced1d6** · Nền **#ffffff**
- `.app-rb__dot::after`: Cao **var(--rb-dot)** · Rộng **var(--rb-dot)** · Border radius **50%** · Nền **#245fdf**
- `.app-rb__label`: Font size **13px** · Line height **20px** · Màu chữ **#10141b**

## Radio button — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.app-rb:not(.app-rb--disabled):hover .app-rb__wrap`: Nền **#f0f6fe**
- `.app-rb:not(.app-rb--disabled):active .app-rb__wrap`: Nền **#ddeafc**
- `.app-rb:not(.app-rb--disabled):hover .app-rb__dot`: Màu viền **#245fdf**
- `.app-rb--checked .app-rb__dot`: Màu viền **#245fdf**
- `.app-rb__native:focus-visible + .app-rb__dot`: Outline **2px solid #245fdf**
- `.app-rb--error .app-rb__dot`: Màu viền **#f04438**
- `.app-rb--error:not(.app-rb--disabled):hover .app-rb__dot`: Màu viền **#f04438**
- `.app-rb--disabled .app-rb__dot`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.app-rb--disabled.app-rb--checked .app-rb__dot::after`: Nền **#9da2ac**
- `.app-rb--disabled .app-rb__label`: Màu chữ **#9da2ac**

## AppRichText
- `.mds-rt` (── Root wrapper ──): Rộng **100%**
- `.mds-rt .tox-tinymce` (── BASIC MODE — override TinyMCE container ──): Border radius Trung bình **8px !important** · Nhỏ **6px !important** · Rộng **8px !important** · Border **1px solid #ced1d6 !important** · Box shadow **none !important**
- `.mds-rt .tox .tox-editor-header` (Thanh công cụ theo Figma ❖ Editor Toolbar: nền trắng · vạch dưới Neutral nhạt · nút 28 bo Inner · hover / đang): Padding **0 !important** · Box shadow **none !important**
- `.mds-rt .tox .tox-toolbar__primary`: Nền **#ffffff !important**
- `.mds-rt .tox .tox-toolbar-overlord`: Nền **#ffffff !important**
- `.mds-rt .tox .tox-menubar`: Nền **#ffffff !important**
- `.mds-rt .tox .tox-toolbar__group`: Padding **0 4px !important**
- `.mds-rt .tox .tox-tbtn`: Border radius Trung bình **6px** · Nhỏ **4px** · Rộng **6px** · Màu chữ **#6b707a**
- `.mds-rt .tox .tox-tbtn--enabled`: Nền **#f2f2f4 !important**
- `.mds-rt .tox .tox-tbtn__select-label`: Font size **13px** · Màu chữ **#10141b**
- `.mds-rt__inline` (── INLINE MODE — editable div ──): Cao tối thiểu **80px** · Padding **8px 12px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Line height **20px** · Border **1px solid #ced1d6** · Nền **#ffffff** · Màu chữ **#10141b**
- `.mds-rt__inline ul`: Padding trái **24px**
- `.mds-rt__inline ol`: Padding trái **24px**
- `.mds-rt__inline a`: Màu chữ **#245fdf**
- `.mds-rt__inline:empty::before`: Màu chữ **#9da2ac**
- `.tox.tox-tinymce-inline .tox-editor-header` (Mode inline: thanh công cụ nổi nằm ngoài .mds-rt (TinyMCE gắn vào <body>) → style toàn cục, cùng kiểu Figma ❖ ): Border radius Trung bình **8px !important** · Nhỏ **6px !important** · Rộng **8px !important** · Border **1px solid #e5e6e9 !important** · Box shadow **0 4px 12px 0 #000000 độ mờ 10% !important** (Figma Effect style: Neutral / Bottom 12)
- `.tox.tox-tinymce-inline .tox-toolbar__primary`: Nền **#ffffff !important**
- `.tox.tox-tinymce-inline .tox-toolbar__group`: Padding **0 4px !important**
- `.tox.tox-tinymce-inline .tox-tbtn`: Border radius Trung bình **6px** · Nhỏ **4px** · Rộng **6px**
- `.tox.tox-tinymce-inline .tox-tbtn--enabled`: Nền **#f2f2f4 !important**
- `.tox .tox-tbtn` (Cỡ nút theo Figma ❖ Editor Toolbar: nút = nút nhỏ của mật độ (calc(--btn-height − 4): 28 · Nhỏ 24 · Rộng 32), ): Cao Trung bình **28px !important** · Nhỏ **24px !important** · Rộng **32px !important** · Rộng **auto !important** · Rộng tối thiểu Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 4px !important**
- `.tox .tox-tbtn--select` (icon TinyMCE vẽ cố định 24×24 (không có viewBox) → thu bằng scale về 16, margin âm cho khung chiếm đúng 16): Padding **0 4px 0 8px !important**
- `.tox .tox-tbtn__select-label`: Font size **13px !important**
- `.tox .tox-split-button`: Cao Trung bình **28px !important** · Nhỏ **24px !important** · Rộng **32px !important** · Border radius Trung bình **6px !important** · Nhỏ **4px !important** · Rộng **6px !important**
- `.tox .tox-split-button__chevron`: Rộng **16px !important** · Padding **0 !important**
- `.tox .tox-mbtn`: Cao Trung bình **28px !important** · Nhỏ **24px !important** · Rộng **32px !important** · Padding **0 8px !important** · Border radius Trung bình **6px !important** · Nhỏ **4px !important** · Rộng **6px !important**
- `.tox .tox-mbtn__select-label`: Font size **13px !important**
- `.tox .tox-menubar`: Padding **4px 4px 0 !important**
- `.tox .tox-statusbar`: Cao **auto !important** · Cao tối thiểu **20px** · Font size **10px !important**

## AppRichText — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.mds-rt:focus-within .tox-tinymce`: Màu viền **#245fdf !important** · Box shadow **0 0 0 3px rgba(4, 153, 228, 0.12) !important**
- `.mds-rt--error .tox-tinymce`: Màu viền **#f04438 !important**
- `.mds-rt--error:focus-within .tox-tinymce`: Box shadow **0 0 0 3px rgba(240, 68, 56, 0.12) !important**
- `.mds-rt--disabled .tox-tinymce`: Nền **#f2f2f4 !important** · Độ mờ **0.65**
- `.mds-rt--readonly .tox-tinymce`: Nền **#f2f2f4 !important**
- `.mds-rt .tox .tox-tbtn:hover`: Nền **#f2f2f4 !important**
- `.mds-rt .tox .tox-tbtn--enabled:hover`: Nền **#f2f2f4 !important**
- `.mds-rt__inline:focus`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(36, 95, 223, 0.12)**
- `.mds-rt--inline:focus-within .mds-rt__inline`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(36, 95, 223, 0.12)**
- `.mds-rt--error .mds-rt__inline` (State variants for inline): Màu viền **#f04438**
- `.mds-rt--error:focus-within .mds-rt__inline`: Box shadow **0 0 0 3px rgba(240, 68, 56, 0.12)**
- `.mds-rt--disabled .mds-rt__inline`: Nền **#f2f2f4** · Độ mờ **0.65**
- `.mds-rt--readonly .mds-rt__inline`: Nền **#f2f2f4**
- `.tox.tox-tinymce-inline .tox-tbtn:hover`: Nền **#f2f2f4 !important**
- `.tox.tox-tinymce-inline .tox-tbtn--enabled:hover`: Nền **#f2f2f4 !important**

## AppSearchResultsDialog
- `.srd-overlay`: Padding **16px** · Nền **rgba(16, 24, 40, 0.4)**
- `.srd` (Rộng 960 · cao 640 (hoặc vừa màn hình) — cố định chiều cao để danh sách giãn hết, ít kết quả thì khoảng trống ): Cao **640px** · Cao tối đa **100%** · Rộng **960px** · Rộng tối đa **100%** · Border radius **12px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff** · Màu chữ **#10141b**
- `.srd__body`: Cao tối thiểu **0** · Padding **0 24px 24px** · Gap **16px**
- `.srd__count`: Cao tối thiểu **20px** · Font size **13px** · Line height **20px**
- `.srd__count b`: Font size **16px** · Font weight **600**
- `.srd__loading`: Gap **8px** · Màu chữ **#6b707a**
- `.srd__list`: Cao tối thiểu **0**
- `.srd__item`: Rộng **100%** · Padding **8px** · Gap **12px**
- `.srd__text`: Rộng tối thiểu **0** · Gap **2px**
- `.srd__name`: Font size **13px** · Font weight **600** · Line height **20px**
- `.srd__sub`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.srd mark`: Padding **0** · Font weight **600** · Màu chữ **#245fdf**
- `.srd__empty` (phần khớp từ khóa): Padding **16px 8px** · Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.form-header`: Padding **24px 24px 16px** · Gap **12px** · Nền **#ffffff**
- `.form-header__title`: Rộng tối thiểu **0** · Font size **20px** · Font weight **600** · Line height **28px** · Màu chữ **#10141b**

## AppSearchResultsDialog — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.srd__item:hover`: Nền **#f0f6fe**
- `.srd__item:focus-visible`: Outline **2px solid #245fdf**

## Search box (ô tìm kiếm) — AppSearchbox
- `.ibox--no-border`: Nền **#f2f2f4**
- `.ibox-search__clear`: Màu chữ **#6b707a**
- `.ibox--ghost`: Nền **transparent**
- `.ibox--header`: Border radius **8px** · Nền **rgba(255,255,255,0.2)**
- `.ibox--sm`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 6px 0 10px** · Gap **6px**
- `.ibox--area`: Cao **auto** · Padding trên **6px** · Padding dưới **6px**
- `.ibox__native`: Cao Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Rộng tối thiểu **0** · Padding **0** · Font size **13px** · Line height Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Nền **transparent** · Màu chữ **#10141b**
- `.ibox__native--area`: Cao **auto** · Padding **2px 0** · Line height **20px**
- `.ibox__clear-btn`: Màu chữ **#6b707a**
- `.ibox__search-clear`: Padding **0** · Màu chữ **#6b707a**
- `.ibox__icon`: Font size **16px** · Line height **0** · Màu chữ **#6b707a**
- `.ibox__icon--sm`: Font size **14px**
- `.ibox__icon--action`: Padding **1px** · Border radius **4px** · Màu chữ **#6b707a**
- `.ibox__icon--clear`: Padding **1px** · Border radius **4px**
- `.ibox__icon--brand`: Màu chữ **#245fdf**
- `.ibox__stepper-btn`: Cao Trung bình **30px** · Nhỏ **26px** · Rộng **34px** · Rộng **28px** · Font size **14px** · Nền **transparent** · Màu chữ **#6b707a**

## Search box (ô tìm kiếm) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.ibox:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--no-border:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox--no-border:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--header:hover:not(:focus-within)`: Nền **rgba(255,255,255,0.28)** · Màu viền **transparent**
- `.ibox--header:focus-within`: Nền **rgba(255,255,255,0.3)** · Màu viền **transparent** · Box shadow **none**
- `.ibox--error`: Màu viền **#f04438 !important**
- `.ibox--error:focus-within`: Box shadow **0 0 0 3px rgba(240,68,56,0.12) !important**
- `.ibox--disabled`: Nền **#f2f2f4** · Màu viền **#ced1d6** · Độ mờ **0.7**
- `.ibox--readonly`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.ibox__search-clear:hover`: Màu chữ **#10141b**
- `.ibox__icon--action:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.ibox__icon--clear:hover`: Nền **#f2f2f4**
- `.ibox__icon--brand:hover`: Màu chữ **#4584ec**
- `.ibox__stepper-btn:hover`: Nền **#f2f2f4**
- `.ibox__stepper-btn:disabled`: Độ mờ **0.4**
- `.ibox__icon--error`: Màu chữ **#f04438**

## Segmented (nhóm nút chọn 1) — AppSegmented
- `.seg`: Cao Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Rộng tối đa **100%** · Padding **0 2px** · Gap **0** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Nền **#ecedef**
- `.seg--solid`: Box shadow **inset 0 0 0 1px #e5e6e9** · Nền **#ffffff**
- `.seg--filled`: Box shadow **inset 0 0 0 1px #e5e6e9** · Nền **#ffffff**
- `.seg--fit`: Rộng **100%**
- `.seg__item`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 12px** · Gap **8px** · Border radius Trung bình **6px** · Nhỏ **4px** · Rộng **6px** · Font size **13px** · Font weight **500** · Line height **20px** · Nền **transparent** · Màu chữ **#10141b**
- `.seg__item--icon`: Rộng Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0**

## Segmented (nhóm nút chọn 1) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.seg__item:hover`: Nền **#f0f6fe**
- `.seg__item:active`: Nền **#ddeafc**
- `.seg__item:focus-visible`: Box shadow **inset 0 0 0 2px #245fdf**
- `.seg__item:disabled`: Nền **transparent** · Màu chữ **#9da2ac**
- `.seg__item--active`: Nền **#ffffff** · Màu chữ **#245fdf** · Box shadow **0 1px 4px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 4) · Font weight **600**
- `.seg__item--active:hover`: Nền **#ffffff**

## Sidebar (thanh bên) — AppSidebar
- `.sidebar-host`: Cao **100%** · Rộng **64px**
- `.sidebar-host--expanded`: Rộng **200px**
- `.sidebar`: Rộng **64px** · Nền **#ffffff**
- `.sidebar-inner`: Cao tối thiểu **0** · Padding **16px 12px 52px** · Gap **8px**
- `.sidebar-nav`: Gap **4px**
- `.sidebar-item__count`: Cao **20px** · Rộng tối thiểu **20px** · Padding **0 6px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Font weight **600** · Line height **20px** · Nền **#f04438** · Màu chữ **#ffffff**
- `.sidebar-subitem`: Gap **8px** · Cao tối thiểu **36px** · Rộng **100%** · Padding **8px 12px 8px 40px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Line height **20px** · Nền **transparent** · Màu chữ **#10141b**
- `.sidebar-subitem__label`: Rộng tối thiểu **0**
- `.sidebar-item--parent-active`: Font weight **600** · Màu chữ **#245fdf**
- `.sidebar-sub`: Gap **4px**
- `.sidebar-sub__sep`: Cao **1px** · Nền **#e5e6e9**
- `.sidebar-group`: Padding **12px 12px 0**
- `.sidebar-group__label`: Font size **10px** · Font weight **500** · Line height **15px** · Màu chữ **#6b707a**
- `.sidebar-sep`: Cao **1px** · Nền **#e5e6e9**
- `.sidebar-subitem--parent-active`: Font weight **600** · Màu chữ **#245fdf**
- `.sidebar-sub__group`: Padding **12px 12px 0 40px** · Font size **10px** · Font weight **500** · Line height **15px** · Màu chữ **#6b707a**
- `.sidebar-flyout__group`: Padding **12px 12px 4px** · Font size **10px** · Font weight **500** · Line height **15px** · Màu chữ **#6b707a**
- `.dropdown-menu`: Cao tối đa **min(60vh, 420px)** · Rộng tối thiểu Trung bình **max(200px, 80px)** · Nhỏ **max(200px, 80px)** · Rộng **max(200px, 96px)** · Rộng tối đa **360px** · Padding **8px** · Gap **0px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.dropdown-menu__item--danger`: Màu chữ **#f04438**
- `.dropdown-menu__icon`: Font size **20px** · Line height **0** · Màu chữ **#6b707a**
- `.dropdown-menu__img`: Cao **24px** · Rộng **24px**
- `.dropdown-menu__check`: Font size **16px** · Màu chữ **#245fdf**
- `.dropdown-menu__label`: Rộng tối thiểu **0**
- `.dropdown-menu__tag`: Padding **1px 6px** · Border radius **4px** · Font size **13px** · Nền **#f4f4f6** · Màu chữ **#6b707a**
- `.dropdown-menu__separator`: Cao **1px** · Rộng **100%** · Nền **#e5e6e9**
- `.accordion`: Rộng **100%**
- `.accordion--outline`: Gap **12px**
- `.accordion__item`: Nền **#ffffff**
- `.accordion__header`: Rộng **100%** · Padding **16px** · Gap **8px** · Border **0** · Màu chữ **#10141b**
- `.accordion__title`: Rộng tối thiểu **0** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.accordion__chevron`: Cao **20px** · Rộng **20px** · Font size **20px** · Màu chữ **#6b707a**
- `.accordion__body`: Padding **12px 16px 16px** · Font size **13px** · Line height **20px** · Màu chữ **#10141b**

## Sidebar (thanh bên) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.sidebar:not(.expanded):hover`: Box shadow **4px 0 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Right 12)
- `.sidebar-item:hover`: Nền **#f0f6fe**
- `.sidebar-item--open:not(.active)`: Nền **#f0f6fe**
- `.sidebar-subitem:hover`: Nền **#f0f6fe**
- `.sidebar-subitem:focus-visible`: Outline **2px solid #245fdf**
- `.sidebar-item:focus-visible`: Outline **2px solid #245fdf**
- `.sidebar-flyout__item--open:not(.dropdown-menu__item--active)`: Nền **#f0f6fe**
- `.dropdown-menu__item:hover:not(:disabled)`: Nền **#f0f6fe**
- `.dropdown-menu__item:active:not(:disabled)`: Nền **#c2dbfb**
- `.dropdown-menu__item:focus-visible`: Outline **2px solid #245fdf**
- `.dropdown-menu__item:disabled`: Độ mờ **0.45**
- `.dropdown-menu__item--disabled`: Độ mờ **0.45**
- `.dropdown-menu__item--danger:hover:not(:disabled)`: Nền **#fef3f2**
- `.dropdown-menu__item--ai:hover:not(:disabled)`: Nền **linear-gradient(111deg, #edf9ff 8.87%, #fee2ff 100%)**
- `.dropdown-menu__item--active`: Nền **#f0f6fe** · Màu chữ **#245fdf** · Font weight **600**
- `.dropdown-menu__item--active:hover:not(:disabled)`: Nền **#ddeafc**
- `.dropdown-menu__item--active:active:not(:disabled)`: Nền **#c2dbfb**
- `.accordion__header:focus-visible`: Outline **2px solid #245fdf**

## Tabs — AppTabs
- `.tabs`: Rộng tối thiểu **0** · Gap **4px**
- `.tabs--line`: Gap **0** · Box shadow **inset 0 -1px 0 #ced1d6**
- `.tab`: Cao **36px** · Padding **0 12px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Font weight **400** · Line height **20px** · Nền **transparent** · Màu chữ **#10141b**
- `.tab__badge`: Cao **16px** · Rộng tối thiểu **16px** · Padding **0 4px** · Border radius **9999px** · Font size **10px** · Font weight **600** · Line height **16px** · Nền **#e6e7ea** · Màu chữ **#10141b**

## Tabs — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.tab:hover`: Nền **#f0f6fe**
- `.tab:active`: Nền **#ddeafc**
- `.tab:focus-visible`: Box shadow **inset 0 0 0 2px #245fdf**
- `.tab--active`: Nền **var(--tab-bg-on)** · Màu chữ **var(--tab-c-on)** · Font weight **700**
- `.tab--active:hover`: Nền **var(--tab-bg-on)** · Màu chữ **var(--tab-c-on)** · Font weight **700**
- `.tab--active:active`: Nền **var(--tab-bg-on)** · Màu chữ **var(--tab-c-on)** · Font weight **700**
- `.tab:disabled`: Nền **transparent** · Màu chữ **#9da2ac**

## Tag (nhãn) — AppTag
- `.app-tag__icon`: Cao **var(--tg-ic)** · Rộng **var(--tg-ic)** · Font size **var(--tg-ic)** · Màu chữ **var(--tg-icon)**
- `.app-tag__dot`: Cao **6px** · Rộng **6px** · Border radius **50%** · Nền **var(--tg-dot)**
- `.app-tag--dot`: Padding trái **var(--tg-pl-dot)**
- `.app-tag--avatar`: Padding trái **var(--tg-pl-av)**
- `.app-tag--icon-only`: Rộng **var(--tg-h)** · Padding **0**
- `.app-tag--solid`: Nền **var(--tg-s)** · Màu chữ **#ffffff**
- `.app-tag--outline`: Nền **var(--tg-l)** · Màu chữ **var(--tg-t)**
- `.app-tag--text`: Padding **0** · Font size **13px** · Font weight **400** · Line height **20px** · Màu chữ **var(--tg-t)**
- `.app-tag--more`: Màu chữ **#6b707a**

## AppTaskTray
- `.task-tray`: Rộng **400px** · Rộng tối đa **calc(100vw - 32px)** · Border radius **12px 12px 0 0** · Box shadow **0 0 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / All 12) · Nền **#ffffff**
- `.task-tray--inline`: Rộng tối đa **100%** · Border radius **12px**
- `.task-tray__head`: Cao **48px** · Padding Trung bình **0 calc(16px - (32px - 20px) / 2) 0 16px** · Nhỏ **0 calc(16px - (28px - 20px) / 2) 0 16px** · Rộng **0 calc(16px - (36px - 20px) / 2) 0 16px** · Gap Trung bình **max(0px, 0px)** · Nhỏ **max(0px, 4px)** · Rộng **max(0px, -4px)** · Nền **#245fdf**
- `.task-tray__title`: Rộng tối thiểu **0** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#ffffff**
- `.task-tray__hbtn`: Màu chữ **#ffffff**
- `.task-tray__mini`: Cao **3px** · Nền **#ecedef**
- `.task-tray__list`: Cao tối đa **calc(5 * 52px + 16px)** · Padding **8px** · Gap **2px**
- `.task-tray__item`: Cao tối thiểu **52px** · Padding Trung bình **8px calc(8px - (32px - 4px - 16px) / 2) 8px 8px** · Nhỏ **8px calc(8px - (28px - 4px - 16px) / 2) 8px 8px** · Rộng **8px calc(8px - (36px - 4px - 16px) / 2) 8px 8px** · Gap **12px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- `.task-tray__status`: Cao **20px** · Rộng **20px**
- `.task-tray__body`: Rộng tối thiểu **0** · Gap **2px**
- `.task-tray__name`: Font weight **600** · Màu chữ **#10141b**
- `.task-tray__progress`: Rộng tối thiểu **0** · Gap **8px**
- `.task-tray__bar`: Cao **4px** · Border radius **9999px** · Nền **#ecedef**
- `.task-tray__bar-fill`: Cao **100%** · Nền **#245fdf**
- `.task-tray__bar-fill--indet`: Rộng **40%**
- `.task-tray__sub`: Rộng tối thiểu **0** · Font size **12px** · Line height **16px** · Màu chữ **#6b707a**
- `.task-tray__sub--danger`: Màu chữ **#f04438**
- `.task-tray__sub--warning`: Màu chữ **#dc6803**
- `.task-tray__acts`: Gap **4px**
- `.task-tray__foot`: Padding **4px 8px**

## AppTaskTray — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.task-tray__hbtn:hover`: Màu chữ **#ffffff** · Nền **#ffffff độ mờ 20%**
- `.task-tray__hbtn:active`: Nền **#ffffff độ mờ 30%**
- `.task-tray__item--link:hover`: Nền **#f0f6fe**
- `.task-tray__item--link:active`: Nền **#ddeafc**
- `.task-tray__item--link:focus-visible`: Outline **2px solid #245fdf**

## Textarea (ô nhập nhiều dòng) — AppTextarea
- `.ibox--no-border`: Nền **#f2f2f4**
- `.ibox--ghost`: Nền **transparent**
- `.ibox--header`: Border radius **8px** · Nền **rgba(255,255,255,0.2)**
- `.ibox--sm`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 6px 0 10px** · Gap **6px**
- `.ibox--area`: Cao **auto** · Padding trên **6px** · Padding dưới **6px**
- `.ibox__native`: Cao Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Rộng tối thiểu **0** · Padding **0** · Font size **13px** · Line height Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Nền **transparent** · Màu chữ **#10141b**
- `.ibox__native--area`: Cao **auto** · Padding **2px 0** · Line height **20px**
- `.ibox__clear-btn`: Màu chữ **#6b707a**
- `.ibox__search-clear`: Padding **0** · Màu chữ **#6b707a**
- `.ibox__icon`: Font size **16px** · Line height **0** · Màu chữ **#6b707a**
- `.ibox__icon--sm`: Font size **14px**
- `.ibox__icon--action`: Padding **1px** · Border radius **4px** · Màu chữ **#6b707a**
- `.ibox__icon--clear`: Padding **1px** · Border radius **4px**
- `.ibox__icon--brand`: Màu chữ **#245fdf**
- `.ibox__stepper-btn`: Cao Trung bình **30px** · Nhỏ **26px** · Rộng **34px** · Rộng **28px** · Font size **14px** · Nền **transparent** · Màu chữ **#6b707a**

## Textarea (ô nhập nhiều dòng) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.ibox:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--no-border:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox--no-border:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--header:hover:not(:focus-within)`: Nền **rgba(255,255,255,0.28)** · Màu viền **transparent**
- `.ibox--header:focus-within`: Nền **rgba(255,255,255,0.3)** · Màu viền **transparent** · Box shadow **none**
- `.ibox--error`: Màu viền **#f04438 !important**
- `.ibox--error:focus-within`: Box shadow **0 0 0 3px rgba(240,68,56,0.12) !important**
- `.ibox--disabled`: Nền **#f2f2f4** · Màu viền **#ced1d6** · Độ mờ **0.7**
- `.ibox--readonly`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.ibox__search-clear:hover`: Màu chữ **#10141b**
- `.ibox__icon--action:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.ibox__icon--clear:hover`: Nền **#f2f2f4**
- `.ibox__icon--brand:hover`: Màu chữ **#4584ec**
- `.ibox__stepper-btn:hover`: Nền **#f2f2f4**
- `.ibox__stepper-btn:disabled`: Độ mờ **0.4**
- `.ibox__icon--error`: Màu chữ **#f04438**

## Textbox / Text field (ô nhập) — AppTextbox
- `.ibox--no-border`: Nền **#f2f2f4**
- `.ibox--ghost`: Nền **transparent**
- `.ibox--header`: Border radius **8px** · Nền **rgba(255,255,255,0.2)**
- `.ibox--sm`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 6px 0 10px** · Gap **6px**
- `.ibox--area`: Cao **auto** · Padding trên **6px** · Padding dưới **6px**
- `.ibox__native`: Cao Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Rộng tối thiểu **0** · Padding **0** · Font size **13px** · Line height Trung bình **24px** · Nhỏ **20px** · Rộng **28px** · Nền **transparent** · Màu chữ **#10141b**
- `.ibox__native--area`: Cao **auto** · Padding **2px 0** · Line height **20px**
- `.ibox__clear-btn`: Màu chữ **#6b707a**
- `.ibox__search-clear`: Padding **0** · Màu chữ **#6b707a**
- `.ibox__icon`: Font size **16px** · Line height **0** · Màu chữ **#6b707a**
- `.ibox__icon--sm`: Font size **14px**
- `.ibox__icon--action`: Padding **1px** · Border radius **4px** · Màu chữ **#6b707a**
- `.ibox__icon--clear`: Padding **1px** · Border radius **4px**
- `.ibox__icon--brand`: Màu chữ **#245fdf**
- `.ibox__stepper-btn`: Cao Trung bình **30px** · Nhỏ **26px** · Rộng **34px** · Rộng **28px** · Font size **14px** · Nền **transparent** · Màu chữ **#6b707a**

## Textbox / Text field (ô nhập) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.ibox:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--no-border:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox--no-border:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--header:hover:not(:focus-within)`: Nền **rgba(255,255,255,0.28)** · Màu viền **transparent**
- `.ibox--header:focus-within`: Nền **rgba(255,255,255,0.3)** · Màu viền **transparent** · Box shadow **none**
- `.ibox--error`: Màu viền **#f04438 !important**
- `.ibox--error:focus-within`: Box shadow **0 0 0 3px rgba(240,68,56,0.12) !important**
- `.ibox--disabled`: Nền **#f2f2f4** · Màu viền **#ced1d6** · Độ mờ **0.7**
- `.ibox--readonly`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.ibox__search-clear:hover`: Màu chữ **#10141b**
- `.ibox__icon--action:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.ibox__icon--clear:hover`: Nền **#f2f2f4**
- `.ibox__icon--brand:hover`: Màu chữ **#4584ec**
- `.ibox__stepper-btn:hover`: Nền **#f2f2f4**
- `.ibox__stepper-btn:disabled`: Độ mờ **0.4**
- `.ibox__icon--error`: Màu chữ **#f04438**

## Toast (thông báo nổi) — AppToaster
- `.toaster`: Gap **8px**
- `.toast`: Rộng tối thiểu **320px** · Rộng tối đa **min(560px, calc(100vw - 32px))** · Padding **12px 12px 12px 16px** · Gap **12px** · Border radius **12px** · Font size **13px** · Font weight **500** · Line height **20px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **var(--toast-bg)** · Màu chữ **#ffffff**
- `.toast__icon`: Font size **22px** · Màu chữ **#ffffff**
- `.toast__msg`: Rộng tối thiểu **0**
- `.toast__close`: Padding **4px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Nền **transparent** · Màu chữ **#ffffff**
- `.toast__close .ti`: Font size **20px**
- `.toast__action` (Nút thao tác (VD Hoàn tác): chữ trắng đậm trên nền mờ, cùng hàng với nội dung): Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 10px** · Gap **4px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Font weight **600** · Border **1px solid rgba(255, 255, 255, 0.6)** · Nền **transparent** · Màu chữ **#ffffff**
- `.toast__action .ti`: Font size **16px**

## Toast (thông báo nổi) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.toast__close:hover`: Nền **#ffffff độ mờ 20%**
- `.toast__action:hover`: Nền **rgba(255, 255, 255, 0.18)**
- `.toast__action:focus-visible`: Outline **2px solid #fff**

## Tree (cây) — AppTree
- `.tree`: Rộng tối thiểu **0** · Gap **8px**
- `.tree--panel`: Padding **12px** · Border radius **8px** · Box shadow **0 6px 20px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 20) · Nền **#ffffff**
- `.tree__search`: Rộng **100%**
- `.tree__list`: Cao tối thiểu **0** · Gap **4px**
- `.tree__item`: Cao Trung bình **32px** · Nhỏ **32px** · Rộng **36px** · Padding **0 16px 0 calc(16px + var(--tree-depth) * var(--tree-indent))** · Gap **8px** · Border radius Trung bình **8px)** · Nhỏ **6px)** · Rộng **8px)** · Font size **13px** · Line height **20px** · Màu chữ **#10141b**
- `.tree__toggle`: Cao **16px** · Rộng **16px** · Màu chữ **#6b707a**
- `.tree__toggle .ti`: Font size **16px**
- `.tree__label`: Rộng tối thiểu **0**
- `.tree__empty`: Padding **6px 16px** · Font size **13px** · Màu chữ **#6b707a**

## Tree (cây) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.tree__item--active`: Nền **#f0f6fe**
- `.tree__item:focus-visible`: Box shadow **inset 0 0 0 2px #245fdf**
- `.tree__item--selected .tree__label`: Màu chữ **#245fdf**
- `.tree__item--disabled`: Màu chữ **#9da2ac**

## AppUpdateNotice
- `.upd`: Rộng **min(420px, calc(100vw - 32px))** · Padding **12px 12px 12px 14px** · Gap **12px** · Border radius **12px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.upd__icon`: Cao **36px** · Rộng **36px** · Border radius **50%** · Nền **#3a63e6** · Màu chữ **#ffffff**
- `.upd__icon .ti`: Font size **18px**
- `.upd__body`: Rộng tối thiểu **0** · Gap **2px**
- `.upd__title`: Font size **13px** · Font weight **600** · Màu chữ **#10141b**
- `.upd__text`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**

## AvatarFilter
- `.avf`: Rộng tối thiểu **0** · Gap **8px**
- `.avf__accent` (Chấm 6px như chấm ở tiêu đề cột DataTable · vùng di chuột 14px cho tooltip): Cao **14px** · Rộng **14px**
- `.avf__accent-in`: Cao **6px** · Rộng **6px** · Border radius **50%**
- `.avf__label`: Font size **13px** · Màu chữ **#6b707a**
- `.avf__list`: Gap **8px**
- `.avf__avatar` (Avatar = nút bấm → cỡ theo token mật độ (nhỏ: btn-height − 4px)): Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Rộng Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0** · Border radius **50%**
- `.avf__avatar img`: Cao **100%** · Rộng **100%** · Border radius **50%** · Border **1px solid #ced1d6**
- `.avf__initials` (Figma Avatar: ảnh viền Stroke/Neutral · chữ cái viền trắng (dưới) — cùng cỡ): Cao **100%** · Rộng **100%** · Border radius **50%** · Border **1px solid #ced1d6** · Font size **10px** · Font weight **500** · Line height **1** · Border **1px solid #ffffff** · Màu chữ **#10141b**
- `.avf__avatar--sm`: Cao **28px** · Rộng **28px**
- `.avf__more`: Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Rộng tối thiểu Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Padding **0 6px** · Border radius **9999px** · Font size **13px** · Font weight **600** · Border **1px solid #ced1d6** · Nền **#ffffff** · Màu chữ **#6b707a**
- `.avf__more .ti`: Font size **14px**
- `.avf-pop` (Popover chọn người — chuẩn menu xổ ra (Figma MDS Dropdown Menu, có ô tìm kiếm + dạng Multi Line)): Cao tối đa **360px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.avf-pop__search`: Padding Trung bình **4px 12px 8px** · Nhỏ **4px 12px 8px** · Rộng **4px 16px 8px**
- `.avf-pop__list` (Figma Search: 4 · 12 · 8 · 12): Padding **8px** · Gap **0px**
- `.avf-pop__item`: Cao tối thiểu Trung bình **32px** · Nhỏ **32px** · Rộng **36px** · Rộng **100%** · Padding Trung bình **0 12px** · Nhỏ **0 12px** · Rộng **0 16px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- `.avf-pop__item:has(.avf-pop__sub)`: Cao tối thiểu **0** · Padding trên **6px** · Padding dưới **6px**
- `.avf-pop__text`: Rộng tối thiểu **0** · Gap **2px**
- `.avf-pop__name`: Font size **13px** · Line height **20px** · Màu chữ **#10141b**
- `.avf-pop__sub`: Font size **13px** · Line height **20px** · Màu chữ **#6b707a**
- `.avf-pop__check`: Font size **16px** · Màu chữ **#245fdf**
- `.avf-pop__empty`: Padding **12px** · Font size **13px** · Màu chữ **#6b707a**
- `.avf-pop__foot`: Padding **8px 12px** · Font size **13px** · Màu chữ **#6b707a**
- `.avf-pop__foot .btn`: Cao **auto** · Padding **0**

## AvatarFilter — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.avf__avatar--on`: Box shadow **0 0 0 2px #ffffff, 0 0 0 4px #245fdf**
- `.avf__avatar--dim:hover`: Độ mờ **1**
- `.avf__more:hover`: Màu chữ **#245fdf** · Màu viền **#245fdf**
- `.avf__more--open`: Màu chữ **#245fdf** · Màu viền **#245fdf**
- `.avf-pop__item:hover` (1 dòng = ĐÚNG --menu-item-h (32 · Rộng 36), không cộng đệm dọc · có dòng phụ = cao theo nội dung: đệm 6 + 20 +): Nền **#f0f6fe**
- `.avf-pop__item:active`: Nền **color-mix(in srgb, #245fdf 12%, #ffffff)**
- `.avf-pop__item--on`: Nền **#f0f6fe**
- `.avf-pop__item--on .avf-pop__name`: Màu chữ **#245fdf** · Font weight **600**

## BulkActionBar
- `.bulk-bar`: Cao tối thiểu Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Rộng tối thiểu **0** · Gap **16px**
- `.bulk-bar__count`: Gap **4px** · Font size **13px** · Màu chữ **#10141b**
- `.bulk-bar__count strong`: Font weight **700**
- `.bulk-bar__link strong`: Font weight **700**
- `.bulk-bar__link` (Figma: số đếm Bold): Padding **0** · Gap **4px** · Font size **13px** · Màu chữ **#245fdf**
- `.bulk-bar__buttons`: Rộng tối thiểu **0** · Gap **8px**

## BulkActionBar — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.bulk-bar__link:focus-visible`: Outline **2px solid #245fdf**

## CollapseExpandPanel
- `.cep`: Border **1px solid #e5e6e9** · Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.cep--white`: Nền **#ffffff**
- `.cep--bottom` (Bottom: hangs from top divider line, rounded top corners): Cao **16px** · Rộng **40px**
- `.cep--top` (Top: hangs from bottom divider line, rounded bottom corners): Cao **16px** · Rộng **40px**
- `.cep--left` (Left: vertical, rounded right corners): Cao **40px** · Rộng **16px**
- `.cep--right` (Right: vertical, rounded left corners): Cao **40px** · Rộng **16px**
- `.cep__icon`: Font size **13px**

## CollapseExpandPanel — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.cep:hover`: Nền **#f0f6fe**
- `.cep--white:hover`: Nền **#f0f6fe**

## Header / Control header — ControlHeader
- `.trial-banner` (── Trial expiry banner ──): Cao **44px** · Padding **0 24px** · Gap **16px** · Nền **#3f3f46** · Màu chữ **#ffffff**
- `.trial-banner__text`: Font size **13px** · Line height **20px**
- `.trial-banner__text strong`: Font weight **600**
- `.trial-banner__actions`: Gap **16px**
- `.trial-banner__dismiss`: Font size **13px** · Màu chữ **rgba(255,255,255,0.72)**
- `.dialog-overlay` (── Settings Dialog ──): Padding **20px** · Nền **rgba(16,24,40,0.45)**
- `.settings-dialog`: Cao tối đa **calc(100vh - 40px)** · Rộng **100%** · Rộng tối đa **1440px** · Border radius **12px** · Nền **#ffffff**
- `.settings-dialog__header` (Header): Padding **16px 24px**
- `.settings-dialog__tabs` (Tabs): Padding **0 24px**
- `.dialog-tab`: Cao **44px** · Padding **0 16px** · Font size **13px** · Font weight **500** · Nền **transparent** · Màu chữ **#6b707a**
- `.settings-dialog__body` (Body): Cao tối thiểu **0** · Padding **24px 24px 16px** · Gap **20px**
- `.settings-section-title` (Section title): Font size **20px** · Font weight **600** · Line height **28px** · Màu chữ **#10141b**
- `.settings-options-row` (Settings option rows — pill style): Gap **24px**
- `.srow`: Gap **10px**
- `.srow__label`: Rộng tối thiểu **44px** · Font size **13px** · Font weight **600** · Màu chữ **#6b707a**
- `.srow__btns`: Gap **6px**
- `.sopt`: Cao **28px** · Padding **0 12px** · Gap **6px** · Border radius **9999px** · Font size **13px** · Font weight **500** · Border **1.5px solid #ced1d6** · Nền **#ffffff** · Màu chữ **#6b707a**
- `.sopt__dot`: Cao **6px** · Rộng **6px** · Border radius **50%** · Nền **#ced1d6**
- `.color-swatches` (Color swatches): Padding dưới **4px** · Gap **10px**
- `.color-swatch`: Rộng tối thiểu **80px** · Padding **6px** · Gap **6px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Border **2px solid transparent** · Nền **#ffffff**
- `.color-swatch__preview`: Cao **40px** · Rộng **72px** · Border radius **6px** · Border **1px solid #e5e6e9**
- `.color-swatch__check`: Cao **18px** · Rộng **18px** · Border radius **50%**
- `.color-swatch__check .ti`: Font size **10px** · Màu chữ **white**
- `.color-swatch__label`: Font size **13px** · Font weight **500** · Màu chữ **#10141b**
- `.preview-wrap` (Preview wrap): Rộng **100%** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Border **1px solid #e5e6e9**
- `.preview-inner`: Rộng **1440px**
- `.mini-app` (── Mini App Styles ──): Cao **650px** · Rộng **1440px** · Nền **#f2f2f4**
- `.mini-header`: Cao **48px** · Padding **0 16px** · Gap **12px**
- `.mini-header-left`: Gap **8px**
- `.mini-subnav`: Cao **44px** · Padding **0 16px** · Gap **0** · Nền **white**
- `.mini-subnav-tab`: Cao **44px** · Padding **0 14px** · Font size **10px** · Font weight **500** · Màu chữ **#6b707a**
- `.mini-subnav-tab.active`: Font weight **600**
- `.mini-sidebar`: Rộng **200px** · Nền **white**
- `.settings-dialog__footer` (Footer): Padding **12px 24px** · Gap **12px** · Border radius **0 0 12px 12px** · Nền **#f4f4f6**
- `.density-options` (Density options): Gap **16px**
- `.font-size-preview` (Xem trước cỡ chữ: dùng đúng token của mode (khung .font-size-scope[data-font-size])): Padding **0 12px** · Gap **2px**

## Header / Control header — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.trial-banner__dismiss:hover`: Màu chữ **#ffffff**
- `.dialog-tab:hover`: Nền **#f0f6fe** · Màu chữ **#10141b**
- `.dialog-tab:active` (hover nền Brand Light (quy tắc hover chung)): Nền **#ddeafc**
- `.dialog-tab--active`: Màu chữ **#245fdf** · Font weight **600**
- `.sopt:hover`: Màu chữ **#245fdf** · Màu viền **#245fdf**
- `.sopt--active`: Nền **#f0f6fe** · Màu chữ **#245fdf** · Màu viền **#245fdf** · Font weight **600**
- `.sopt--active .sopt__dot`: Nền **#245fdf**
- `.sopt--disabled`: Nền **#ffffff** · Màu chữ **#9da2ac** · Màu viền **#e5e6e9**
- `.sopt--disabled:hover`: Nền **#ffffff** · Màu chữ **#9da2ac** · Màu viền **#e5e6e9**
- `.color-swatch:hover`: Nền **#f0f6fe**
- `.color-swatch--selected`: Nền **#ffffff**
- `.density-item:hover`: Nền **#f0f6fe**
- `.density-item--active`: Nền **#ffffff** · Màu viền **#245fdf**
- `.wallpaper-item:hover`: Màu viền **#ced1d6**
- `.wallpaper-item--selected`: Màu viền **#245fdf**
- `.tools-item:hover`: Nền **#f0f6fe**
- `.connect-sidebar__item:hover`: Nền **#f0f6fe**
- `.connect-sidebar__item--active`: Nền **#f0f6fe** · Màu chữ **#245fdf** · Font weight **600**
- `.connect-sidebar__item--active .ti`: Màu chữ **#245fdf**
- `.connect-segment__item:hover:not(.connect-segment__item--active)`: Nền **#f0f6fe** · Màu chữ **#10141b**
- `.connect-segment__item--active`: Nền **#ffffff** · Màu chữ **#245fdf** · Box shadow **0 1px 2px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 2) · Font weight **600**
- `.connect-card:hover`: Box shadow **0 2px 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 8)
- `.header-avatar-btn:hover`: Box shadow **0 0 0 3px rgba(255, 255, 255, 0.35)**
- `.header-avatar-btn--open`: Box shadow **0 0 0 3px rgba(255, 255, 255, 0.35)**
- `.global-header--white .header-avatar-btn:hover`: Box shadow **0 0 0 3px #f0f6fe**
- `.global-header--white .header-avatar-btn--open`: Box shadow **0 0 0 3px #f0f6fe**
- `.hdr-pop__item:hover`: Nền **#f0f6fe**
- `.hdr-pop__item:focus-visible`: Outline **2px solid #245fdf**
- `.hdr-apps__tile:hover`: Nền **#ffffff** · Màu viền **#e5e6e9** · Box shadow **0 2px 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 8)
- `.hdr-apps__tile:focus-visible`: Outline **2px solid #245fdf**

## Data table (bảng dữ liệu) — DataTable
- `.icon-swap`: Font size **20px** · Line height **0** · Màu chữ **var(--is-c)**
- `.icon-swap--12`: Font size **12px**
- `.icon-swap--16`: Font size **16px**
- `.icon-swap--24`: Font size **24px**
- `.icon-swap--28`: Font size **28px**
- `.icon-swap--32`: Font size **32px**
- `.icon-swap--36`: Font size **36px**
- `.icon-swap--40`: Font size **40px**
- `.icon-swap--44`: Font size **44px**
- `.icon-swap--48`: Font size **48px**
- `.icon-swap--action`: Padding **0** · Border radius **4px**
- `.dt-row--mark-current`: Nền **#ddeafc** · Nền **#c2dbfb** · Box shadow **inset 3px 0 0 #245fdf** · Nền **#f0f6fe**
- `.datatable`: Rộng **100%** · Nền **#ffffff**
- `.dt-row`: Rộng tối thiểu **100%**
- `.dt-row--header`: Nền **#f2f2f4**
- `.dt-row--body`: Nền **#ffffff**
- `.dt-row--mark-warning`: Box shadow **inset 3px 0 0 #f79009**
- `.dt-row--mark-danger`: Box shadow **inset 3px 0 0 #f04438**
- `.dt-row--mark-brand`: Box shadow **inset 3px 0 0 #245fdf**
- `.dt-row--footer`: Box shadow **0 -1px 0 #ced1d6** · Nền **#f2f2f4**
- `.dt-cell`: Cao Trung bình **32px** · Nhỏ **32px** · Rộng **36px** · Padding **0 4px**
- `.dt-cell--header`: Nền **#f2f2f4**
- `.dt-accent-dot`: Cao **14px** · Rộng **14px**
- `.dt-accent-dot__in`: Cao **6px** · Rộng **6px** · Border radius **50%** · Nền **var(--dt-accent)**
- `.dt-cell--footer`: Nền **#f2f2f4**
- `.dt-row--header-group`: Nền **#f2f2f4**
- `.dt-cell-inner--group`: Rộng tối thiểu **0** · Font size **13px** · Font weight **700** · Màu chữ **#10141b**
- `.dt-cell--header-tall`: Cao Trung bình **calc(32px * 2)** · Nhỏ **calc(32px * 2)** · Rộng **calc(36px * 2)**
- `.dt-col-divider`: Rộng **8px**
- `.dt-footer-text--label`: Font weight **600**
- `.dt-filter-dot`: Cao **6px** · Rộng **6px** · Border radius **50%** · Nền **#245fdf**
- `.dt-cell--sorted`: Nền **color-mix(in srgb, #f0f6fe 60%, transparent) !important**
- `.dt-cell--filtered`: Nền **color-mix(in srgb, #f0f6fe 60%, transparent) !important**
- `.dt-filter-btn`: Cao **20px** · Rộng **20px** · Padding **0** · Border radius **4px** · Nền **transparent** · Màu chữ **#6b707a**
- `.dt-header-overlay`: Nền **transparent**
- `.dt-header-menu`: Cao tối đa **calc(100vh - 32px)** · Rộng **220px** · Padding **8px** · Gap **0px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**

## Data table (bảng dữ liệu) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.icon-swap--action:hover:not(:disabled)`: Màu chữ **var(--is-h)**
- `.icon-swap:disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--action:focus-visible`: Outline **2px solid #245fdf**
- `.dt-row--selected`: Nền **#ddeafc** · Nền **#c2dbfb** · Nền **#f0f6fe !important**
- `.dt-row--active`: Nền **#ddeafc** · Nền **#c2dbfb** · Nền **#f0f6fe !important**
- `.dt-row--body:hover`: Nền **#f0f6fe**
- `.dt-cell--header:has(.dt-cell-inner--header):hover`: Nền **#f0f6fe**
- `.dt-filter-btn:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.dt-filter-btn--active`: Màu chữ **#245fdf !important** · Độ mờ **1**
- `.dt-header-menu__item:hover`: Nền **#f0f6fe**
- `.dt-header-menu__item:active`: Nền **#ddeafc**
- `.dt-header-menu__item--danger:hover`: Nền **#fef3f2**
- `.dt-pinact__link:focus-visible`: Outline **2px solid #245fdf**
- `.dt-toggle:hover`: Màu viền **#245fdf**
- `.dt-input:hover`: Màu viền **#245fdf**
- `.dt-input:focus`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.dt-row--group:hover`: Nền **#f0f6fe**

## Detail field (trường xem chi tiết) — DetailField
- `.detail-field`: Rộng tối thiểu **0** · Gap **8px**
- `.detail-field__label`: Rộng **200px** · Padding Trung bình **calc((32px - 20px) / 2) 0** · Nhỏ **calc((28px - 20px) / 2) 0** · Rộng **calc((36px - 20px) / 2) 0** · Font size **13px** · Line height **20px** · Màu chữ **#10141b**
- `.detail-field__value`: Cao tối thiểu Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Rộng tối thiểu **0** · Padding **4px 8px 4px 0** · Font size **13px** · Line height **20px** · Màu chữ **#10141b**
- `.detail-field__value--empty`: Màu chữ **#6b707a**
- `.detail-field__value--editable`: Gap **8px**
- `.detail-field__pen`: Font size **16px** · Màu chữ **#6b707a**
- `.detail-field__input`: Rộng tối thiểu **0**
- `.detail-field__acts`: Cao Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Gap **8px**
- `.detail-field__ok`: Màu chữ **#039855**

## Detail field (trường xem chi tiết) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.detail-field__ok:hover`: Màu chữ **#039855**

## Dropdown menu / Context menu (menu xổ ra) — DropdownMenu
- `.dropdown-menu`: Cao tối đa **min(60vh, 420px)** · Rộng tối thiểu Trung bình **max(200px, 80px)** · Nhỏ **max(200px, 80px)** · Rộng **max(200px, 96px)** · Rộng tối đa **360px** · Padding **8px** · Gap **0px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.dropdown-menu__item--danger`: Màu chữ **#f04438**
- `.dropdown-menu__icon`: Font size **20px** · Line height **0** · Màu chữ **#6b707a**
- `.dropdown-menu__img`: Cao **24px** · Rộng **24px**
- `.dropdown-menu__check`: Font size **16px** · Màu chữ **#245fdf**
- `.dropdown-menu__label`: Rộng tối thiểu **0**
- `.dropdown-menu__tag`: Padding **1px 6px** · Border radius **4px** · Font size **13px** · Nền **#f4f4f6** · Màu chữ **#6b707a**
- `.dropdown-menu__separator`: Cao **1px** · Rộng **100%** · Nền **#e5e6e9**

## Dropdown menu / Context menu (menu xổ ra) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.dropdown-menu__item:hover:not(:disabled)`: Nền **#f0f6fe**
- `.dropdown-menu__item:active:not(:disabled)`: Nền **#c2dbfb**
- `.dropdown-menu__item:focus-visible`: Outline **2px solid #245fdf**
- `.dropdown-menu__item:disabled`: Độ mờ **0.45**
- `.dropdown-menu__item--disabled`: Độ mờ **0.45**
- `.dropdown-menu__item--danger:hover:not(:disabled)`: Nền **#fef3f2**
- `.dropdown-menu__item--ai:hover:not(:disabled)`: Nền **linear-gradient(111deg, #edf9ff 8.87%, #fee2ff 100%)**
- `.dropdown-menu__item--active`: Nền **#f0f6fe** · Màu chữ **#245fdf** · Font weight **600**
- `.dropdown-menu__item--active:hover:not(:disabled)`: Nền **#ddeafc**
- `.dropdown-menu__item--active:active:not(:disabled)`: Nền **#c2dbfb**

## DtCellError
- `.dt-err`: Rộng **100%** · Rộng tối thiểu **0**
- `.dt-err__icon`: Font size **20px** · Màu chữ **#f04438**

## ErrorTip
- `.error-tip`: Padding **6px 10px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Font weight **500** · Line height **20px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#f04438** · Màu chữ **#ffffff**
- `.error-tip::after` (Mũi nhọn chỉ vào ô): Border **5px solid transparent**

## FilterConditionEditor
- `.fce`: Gap **8px**

## OverflowActions
- `.ofa`: Rộng tối thiểu **0** · Gap **8px**
- `.ofa__measure`: Cao **0** · Gap **8px**

## StickyNotes
- `.sn-fab` (── Fab ──): Cao **40px** · Rộng **40px** · Border radius **50%** · Box shadow **0 3px 10px rgba(0,0,0,.22)** · Nền **#f5c518** · Màu chữ **#5a4000**
- `.sn-fab-icon`: Cao **20px** · Rộng **20px**
- `.sn-badge`: Cao **16px** · Rộng tối thiểu **16px** · Padding **0 3px** · Border radius **8px** · Border **2px solid #fff** · Nền **#e63946** · Màu chữ **#fff**
- `.sn-panel` (── Panel ──): Border radius **8px** · Box shadow **3px 6px 20px rgba(0,0,0,.24), inset 0 -1px 0 rgba(0,0,0,.06)** · Nền **#fff9c4**
- `.sn-header` (── Header ──): Padding **6px 8px 5px** · Gap **5px** · Nền **#f5c518**
- `.sn-title-icon`: Cao **14px** · Rộng **14px**
- `.sn-title`: Font size **13px** · Font weight **700** · Màu chữ **#5a4000**
- `.sn-close`: Cao **20px** · Rộng **20px** · Border radius **50%** · Màu chữ **#5a4000** · Nền **transparent**
- `.sn-sync`: Cao **20px** · Rộng **20px** · Border radius **50%** · Màu chữ **#5a4000**
- `.sn-close svg`: Cao **12px** · Rộng **12px**
- `.sn-sync svg`: Cao **16px** · Rộng **16px**
- `.sn-add` (── Add ──): Padding **6px 8px** · Gap **6px**
- `.sn-input`: Font size **13px** · Line height **20px** · Nền **transparent** · Màu chữ **#3a2a00** · Rộng tối thiểu **0**
- `.sn-input::placeholder`: Màu chữ **#a08030**
- `.sn-list` (── List ──): Cao tối thiểu **0**
- `.sn-empty`: Padding **10px** · Font size **13px** · Màu chữ **#a08030**
- `.sn-item`: Padding **5px 6px 5px 8px** · Gap **6px**
- `.sn-check`: Padding **3px 0**
- `.sn-check svg`: Cao **14px** · Rộng **14px**
- `.sn-text`: Font size **13px** · Line height **20px** · Màu chữ **#3a2a00**
- `.sn-edit-input`: Rộng tối thiểu **0** · Padding **0 3px** · Border radius **3px** · Font size **13px** · Line height **20px** · Border **1px solid #b8860b** · Nền **#fffde7** · Màu chữ **#3a2a00**
- `.sn-del`: Padding **0 2px** · Font size **15px** · Line height **1** · Màu chữ **#b8860b**
- `.sn-footer` (── Footer ──): Padding **4px 8px**
- `.sn-clear`: Padding **2px 0** · Font size **13px** · Màu chữ **#a08030**
- `.sn-resize--e`: Rộng **5px**
- `.sn-resize--s`: Cao **5px**
- `.sn-resize--se`: Cao **14px** · Rộng **14px**
- `.sn-resize--se::after`: Cao **7px** · Rộng **7px**
- `.sn-list::-webkit-scrollbar` (── Scrollbar ──): Rộng **4px**
- `.sn-list::-webkit-scrollbar-thumb`: Border radius **2px** · Nền **#c8a000**
- `.sn-list::-webkit-scrollbar-track`: Nền **transparent**

## StickyNotes — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.sn-fab:hover`: Nền **#e8b800**
- `.sn-close:hover`: Nền **rgba(0,0,0,.18)**
- `.sn-sync--error`: Màu chữ **#b42318**
- `.sn-item:hover`: Nền **rgba(0,0,0,.04)**
- `.sn-item:hover .sn-del`: Độ mờ **1**
- `.sn-clear:hover`: Màu chữ **#5a4000**

## Tabs (thanh tab phụ) — SubNavTabs
- `.sntabs__more`: Gap **4px** · Màu chữ **#6b707a**
- `.sntabs__more .ti`: Font size **14px**
- `.sub-nav__scroll`: Rộng tối thiểu **0**

## Tabs (thanh tab phụ) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.sub-nav-tab:hover`: Nền **#f0f6fe**
- `.sub-nav-tab:active`: Nền **#ddeafc**
- `.sub-nav-tab:focus-visible`: Outline **2px solid #245fdf**

## TableFilterPanel
- `.afp`: Cao tối thiểu **0** · Rộng **300px** · Border radius **8px** · Box shadow **0 0 2px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / All 2) · Nền **#ffffff**
- `.afp__head`: Padding **16px 16px 0** · Gap **8px**
- `.afp__title`: Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.afp__search`: Padding **12px 16px 8px**
- `.afp__section` (Đã lưu (Figma Menu Header + Menu List): tiêu đề nhóm 13 Semi Bold cao 32 · mục cao 32, đệm 12, bo 8 · đang dùn): Cao **32px** · Padding **0 8px** · Gap **8px** · Font size **13px** · Font weight **600** · Màu chữ **#10141b**
- `.afp__section .ti`: Font size **16px** · Màu chữ **#6b707a**
- `.afp__saved`: Padding **0 8px**
- `.afp__saved-item`: Cao **32px** · Padding **0 12px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Màu chữ **#10141b**
- `.afp__saved-label`: Rộng tối thiểu **0**
- `.afp__list`: Cao tối thiểu **0** · Padding **0 8px 12px** · Gap **2px**
- `.afp__item`: Padding **6px 8px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- `.afp__body`: Gap **8px**
- `.afp__empty`: Padding **12px 8px** · Font size **13px** · Màu chữ **#6b707a**
- `.afp__foot`: Padding **12px 16px** · Gap **8px** · Nền **#f4f4f6**
- `.icon-swap`: Font size **20px** · Line height **0** · Màu chữ **var(--is-c)**
- `.icon-swap--12`: Font size **12px**
- `.icon-swap--16`: Font size **16px**
- `.icon-swap--24`: Font size **24px**
- `.icon-swap--28`: Font size **28px**
- `.icon-swap--32`: Font size **32px**
- `.icon-swap--36`: Font size **36px**
- `.icon-swap--40`: Font size **40px**
- `.icon-swap--44`: Font size **44px**
- `.icon-swap--48`: Font size **48px**
- `.icon-swap--action`: Padding **0** · Border radius **4px**

## TableFilterPanel — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.afp__saved-item:hover`: Nền **#f0f6fe**
- `.afp__saved-item:active`: Nền **#c2dbfb**
- `.afp__saved-item:focus-visible`: Outline **1px solid #245fdf**
- `.afp__saved-item--on`: Nền **#f0f6fe** · Màu chữ **#245fdf**
- `.afp__saved-item--on:hover`: Nền **#ddeafc**
- `.afp__item--on`: Nền **#f0f6fe**
- `.icon-swap--action:hover:not(:disabled)`: Màu chữ **var(--is-h)**
- `.icon-swap:disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--action:focus-visible`: Outline **2px solid #245fdf**

## TableFilterPopover
- `.tfb` (Popover 320px · bo 8 · bóng All 2 · đệm trên 12 · thân đệm ngang 12 · vùng trường đệm 8, các trường cách 12 · ): Cao tối đa **calc(100vh - 16px)** · Rộng **320px** · Rộng tối đa **calc(100vw - 16px)** · Padding trên **12px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.tfb__body`: Cao tối thiểu **0** · Padding **0 12px** · Gap **8px**
- `.tfb__head`: Cao **32px** · Padding **0 8px** · Gap **8px**
- `.tfb__title`: Rộng tối thiểu **0** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.tfb__fields`: Padding **8px** · Gap **12px**
- `.tfb__fields--horizontal .input-field--row .input-field__body` (Nhãn trái: cột nhãn = nhãn dài nhất + 8px (tự tính chung mds-ui — utils/autoLabelWidth.js), ô nhập lấp phần cò): Rộng tối thiểu **0**
- `.tfb__range`: Gap **8px**
- `.tfb__foot`: Padding **12px 24px** · Gap **16px** · Nền **#f4f4f6**
- `.icon-swap`: Font size **20px** · Line height **0** · Màu chữ **var(--is-c)**
- `.icon-swap--12`: Font size **12px**
- `.icon-swap--16`: Font size **16px**
- `.icon-swap--24`: Font size **24px**
- `.icon-swap--28`: Font size **28px**
- `.icon-swap--32`: Font size **32px**
- `.icon-swap--36`: Font size **36px**
- `.icon-swap--40`: Font size **40px**
- `.icon-swap--44`: Font size **44px**
- `.icon-swap--48`: Font size **48px**
- `.icon-swap--action`: Padding **0** · Border radius **4px**

## TableFilterPopover — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.icon-swap--action:hover:not(:disabled)`: Màu chữ **var(--is-h)**
- `.icon-swap:disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--action:focus-visible`: Outline **2px solid #245fdf**

## TableFilterTags
- `.tft`: Padding **0 12px 8px** · Gap **8px** · Font size **13px**
- `.tft__tag`: Cao **36px** · Rộng tối đa **360px** · Padding **8px 12px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Border **1px solid #ced1d6** · Nền **#ffffff**
- `.tft__text`: Rộng tối thiểu **0** · Gap **4px** · Line height **20px**
- `.tft__field`: Màu chữ **#10141b**
- `.tft__value`: Màu chữ **#10141b**
- `.tft__op`: Màu chữ **#245fdf**
- `.tft__mode`: Màu chữ **#6b707a**
- `.tft__link`: Padding **0** · Font size **13px** · Màu chữ **#245fdf**
- `.tft__link--muted`: Màu chữ **#6b707a**
- `.icon-swap`: Font size **20px** · Line height **0** · Màu chữ **var(--is-c)**
- `.icon-swap--12`: Font size **12px**
- `.icon-swap--16`: Font size **16px**
- `.icon-swap--24`: Font size **24px**
- `.icon-swap--28`: Font size **28px**
- `.icon-swap--32`: Font size **32px**
- `.icon-swap--36`: Font size **36px**
- `.icon-swap--40`: Font size **40px**
- `.icon-swap--44`: Font size **44px**
- `.icon-swap--48`: Font size **48px**
- `.icon-swap--action`: Padding **0** · Border radius **4px**

## TableFilterTags — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.icon-swap--action:hover:not(:disabled)`: Màu chữ **var(--is-h)**
- `.icon-swap:disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--action:focus-visible`: Outline **2px solid #245fdf**

## Table header (thanh công cụ bảng) — TableHeader
- `.table-header`: Padding **8px 12px** · Gap **8px** · Nền **#ffffff**
- `.table-header__left` (── Normal mode ──): Rộng tối thiểu **0** · Gap **8px**
- `.table-header__left > .table-header__search` (Ô tìm kiếm: bề rộng đặt (search-width) là tối đa — thanh hẹp thì co lại trước khi phải gom ô lọc): Rộng tối thiểu **120px** · Rộng tối đa **100%**
- `.table-header__search .ibox__native`: Rộng tối thiểu **0**
- `.table-header__right`: Gap **8px**
- `.table-header__icon-group`: Gap **8px**
- `.table-header__charts--off`: Màu chữ **#6b707a**
- `.table-header__filter-count`: Cao **16px** · Rộng tối thiểu **16px** · Padding **0 4px** · Border radius **9999px** · Font size **10px** · Font weight **700** · Line height **16px** · Nền **#245fdf** · Màu chữ **#ffffff**
- `.table-header__divider` (Nút "Gợi ý AI" dùng component dùng chung <BorderBeamButton> — style xem ở .btn--border-beam trong style.css): Cao **20px** · Rộng **1px** · Nền **#e5e6e9**
- `.table-header__main-group`: Gap **8px**
- `.table-header__bulk` (── Bulk action mode ──): Rộng tối thiểu **0** · Gap **16px**
- `.table-header__bulk-search`: Rộng **200px** · Rộng tối thiểu **120px**
- `.bulk-action` (chật: co, rồi ẩn hẳn (bulkCompact)): Rộng tối thiểu **0** · Gap **16px**
- `.table-header--bulk-compact .bulk-action`: Gap **12px**
- `.bulk-selected`: Gap **4px** · Font size **13px** · Màu chữ **#10141b**
- `.bulk-selected strong`: Font weight **700**
- `.bulk-select-all strong`: Font weight **700**
- `.bulk-deselect` (Figma: số đếm Bold): Padding **0** · Font size **13px** · Màu chữ **#245fdf**
- `.bulk-select-all`: Gap **4px**
- `.bulk-buttons`: Rộng tối thiểu **0** · Gap **8px**
- `.thf` (Popover “Bộ lọc” khi thanh chật — cùng kiểu bộ lọc cơ bản (TableFilterPopover): 320px, bo 8, đầu “Bộ lọc” + ✕,): Cao tối đa **calc(100vh - 16px)** · Rộng tối đa **calc(100vw - 16px)** · Padding **12px** · Gap **8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.thf__head`: Cao **32px** · Padding **0 8px** · Gap **8px**
- `.thf__title`: Rộng tối thiểu **0** · Font size **16px** · Font weight **600** · Line height **22px** · Màu chữ **#10141b**
- `.thf__fields`: Padding **8px** · Gap **12px**
- `.thf__fields > *`: Rộng **100% !important** · Rộng tối đa **none !important**
- `.icon-swap`: Font size **20px** · Line height **0** · Màu chữ **var(--is-c)**
- `.icon-swap--12`: Font size **12px**
- `.icon-swap--16`: Font size **16px**
- `.icon-swap--24`: Font size **24px**
- `.icon-swap--28`: Font size **28px**
- `.icon-swap--32`: Font size **32px**
- `.icon-swap--36`: Font size **36px**
- `.icon-swap--40`: Font size **40px**
- `.icon-swap--44`: Font size **44px**
- `.icon-swap--48`: Font size **48px**
- `.icon-swap--action`: Padding **0** · Border radius **4px**

## Table header (thanh công cụ bảng) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.table-header__charts--on`: Màu chữ **#245fdf**
- `.table-header__filter--active` (đang ẩn: màu neutral như các icon khác): Nền **#f0f6fe** · Màu chữ **#245fdf** · Màu viền **#245fdf**
- `.icon-swap--action:hover:not(:disabled)`: Màu chữ **var(--is-h)**
- `.icon-swap:disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--disabled`: Màu chữ **var(--is-d)**
- `.icon-swap--action:focus-visible`: Outline **2px solid #245fdf**
- `.ibox:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--no-border:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Màu viền **#245fdf**
- `.ibox--no-border:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--filled:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:hover:not(:focus-within):not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf**
- `.ibox--ghost:focus-within:not(.ibox--disabled):not(.ibox--readonly)`: Nền **#ffffff** · Màu viền **#245fdf** · Box shadow **0 0 0 3px rgba(4,153,228,0.12)**
- `.ibox--header:hover:not(:focus-within)`: Nền **rgba(255,255,255,0.28)** · Màu viền **transparent**
- `.ibox--header:focus-within`: Nền **rgba(255,255,255,0.3)** · Màu viền **transparent** · Box shadow **none**
- `.ibox--error`: Màu viền **#f04438 !important**
- `.ibox--error:focus-within`: Box shadow **0 0 0 3px rgba(240,68,56,0.12) !important**
- `.ibox--disabled`: Nền **#f2f2f4** · Màu viền **#ced1d6** · Độ mờ **0.7**
- `.ibox--readonly`: Nền **#f2f2f4** · Màu viền **#ced1d6**
- `.ibox__search-clear:hover`: Màu chữ **#10141b**
- `.ibox__icon--action:hover`: Nền **#f2f2f4** · Màu chữ **#6b707a**
- `.ibox__icon--clear:hover`: Nền **#f2f2f4**
- `.ibox__icon--brand:hover`: Màu chữ **#4584ec**
- `.ibox__stepper-btn:hover`: Nền **#f2f2f4**
- `.ibox__stepper-btn:disabled`: Độ mờ **0.4**
- `.ibox__icon--error`: Màu chữ **#f04438**

## Table paging (phân trang bảng) — TablePaging
- `.paging`: Cao Trung bình **48px** · Nhỏ **40px** · Rộng **56px** · Padding Trung bình **0 16px** · Nhỏ **0 12px** · Rộng **0 16px** · Gap **24px** · Nền **#ffffff** · Gap **12px**
- `.paging__total`: Gap **4px**
- `.paging__total-label` (“Tổng số: 10” — Vue bỏ khoảng trắng giữa 2 thẻ span nên cần gap): Font size **13px** · Font weight **400** · Màu chữ **#6b707a**
- `.paging__total-value`: Font size **13px** · Font weight **600** · Màu chữ **#10141b**
- `.paging__right`: Rộng tối thiểu **0** · Gap **8px**
- `.paging__size`: Rộng **80px**
- `.paging__label`: Font size **13px** · Màu chữ **#10141b**
- `.paging__range`: Font size **13px** · Font weight **600** · Màu chữ **#10141b**
- `.paging__nav`: Gap **2px**
- `.paging__nav--advance`: Gap **0** · Gap **0**
- `.paging-num`: Cao Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Rộng tối thiểu Trung bình **32px** · Nhỏ **28px** · Rộng **36px** · Padding **0 4px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Font weight **400** · Line height **20px** · Nền **transparent** · Màu chữ **#10141b**

## Table paging (phân trang bảng) — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.paging-num--on`: Màu chữ **#245fdf** · Font weight **700**

## TableSettingsDrawer
- `.tsd-overlay`: Nền **rgba(16, 24, 40, 0.4)**
- `.tsd`: Cao **100%** · Rộng **625px** · Rộng tối đa **100vw** · Box shadow **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12) · Nền **#ffffff**
- `.tsd__head`: Padding **24px 24px 16px** · Gap **12px**
- `.tsd__title`: Rộng tối thiểu **0** · Font size **20px** · Font weight **600** · Line height **28px** · Màu chữ **#10141b**
- `.tsd__body`: Cao tối thiểu **0** · Padding **0 24px 24px** · Gap **12px**
- `.tsd__section`: Font size **13px** · Font weight **600** · Màu chữ **#10141b**
- `.tsd__search`: Rộng **240px** · Rộng tối đa **100%**
- `.tsd__foot`: Padding **16px 24px** · Gap **8px** · Nền **#f4f4f6**
- `.tsd-grid` (Bảng cột — cùng nhịp DataTable: tiêu đề nền Table Header, dòng cao --dt-row-height, kẻ ngang): Border radius **8px** · Border **1px solid #e5e6e9**
- `.tsd-row`: Cao Trung bình **32px** · Nhỏ **32px** · Rộng **36px** · Font size **13px** · Nền **#ffffff** · Màu chữ **#10141b**
- `.tsd-row--head`: Font weight **600** · Nền **#f2f2f4**
- `.tsd-row--over`: Box shadow **inset 0 2px 0 #245fdf**
- `.tsd-c`: Rộng tối thiểu **0** · Padding **0 8px**
- `.tsd-c--drag`: Rộng **40px** · Màu chữ **#6b707a**
- `.tsd-c--drag .ti`: Font size **16px**
- `.tsd-c--check`: Rộng **40px**
- `.tsd-c--field`: Line height Trung bình **32px** · Nhỏ **32px** · Rộng **36px**
- `.tsd-c--label`: Rộng **160px** · Rộng **120px**
- `.tsd-c--width`: Rộng **120px** · Rộng **84px**
- `.tsd-c--pin`: Rộng **44px**
- `.tsd-input` (Ô sửa trong dòng: không viền khi nghỉ, rê dòng / focus mới hiện viền (như bảng sửa trực tiếp)): Cao Trung bình **28px** · Nhỏ **24px** · Rộng **32px** · Rộng **100%** · Padding **0 8px** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Font size **13px** · Border **1px solid transparent** · Nền **transparent** · Màu chữ **#10141b**
- `.tsd-pin`: Cao **28px** · Rộng **28px** · Padding **0** · Border radius Trung bình **8px** · Nhỏ **6px** · Rộng **8px** · Nền **transparent** · Màu chữ **#245fdf**
- `.tsd-pin .ti`: Font size **16px**
- `.tsd-empty` (đã ghim: ghim tô đặc): Padding **12px** · Font size **13px** · Màu chữ **#6b707a**

## TableSettingsDrawer — trạng thái (hover, focus, disabled, lỗi, được chọn)
- `.tsd-row:not(.tsd-row--head):hover`: Nền **#f0f6fe**
- `.tsd-row:hover .tsd-input`: Nền **#ffffff** · Màu viền **#ced1d6**
- `.tsd-input:hover`: Màu viền **#245fdf**
- `.tsd-row:hover .tsd-input:hover`: Màu viền **#245fdf**
- `.tsd-input:focus`: Nền **#ffffff** · Màu viền **#245fdf**
- `.tsd-pin:hover`: Nền **#f0f6fe**

## Bóng đổ (box shadow) — mọi mức
Cú pháp: offset-x offset-y blur spread màu. Mỗi dòng ghi tên Effect style trong Figma (Drop Shadow / Neutral / …) để designer chọn đúng. Card = Neutral / All 2; popover / dropdown / dialog / toast = Neutral / Bottom 12.
- `--shadow-all-2`: **0 0 2px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / All 2)
- `--shadow-all-4`: **0 0 4px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / All 4)
- `--shadow-all-8`: **0 0 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / All 8)
- `--shadow-all-12`: **0 0 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / All 12)
- `--shadow-bottom-2`: **0 1px 2px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 2)
- `--shadow-bottom-4`: **0 1px 4px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 4)
- `--shadow-bottom-8`: **0 2px 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 8)
- `--shadow-bottom-12`: **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12)
- `--shadow-bottom-16`: **0 4px 16px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 16)
- `--shadow-bottom-20`: **0 6px 20px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 20)
- `--shadow-top-4`: **0 -1px 4px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Top 4)
- `--shadow-top-8`: **0 -2px 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Top 8)
- `--shadow-top-12`: **0 -4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Top 12)
- `--shadow-right-4`: **1px 0 4px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Right 4)
- `--shadow-right-8`: **2px 0 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Right 8)
- `--shadow-right-12`: **4px 0 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Right 12)
- `--shadow-left-4`: **-1px 0 4px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Left 4)
- `--shadow-left-8`: **-2px 0 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Left 8)
- `--shadow-left-12`: **-4px 0 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Left 12)
- `--shadow-card`: **0 0 2px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / All 2)
- `--shadow-popover`: **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12)
- `--shadow-sm`: **0 1px 2px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 2)
- `--shadow-md`: **0 2px 8px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 8)
- `--shadow-lg`: **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12)
- `--shadow-dialog`: **0 4px 12px 0 #000000 độ mờ 10%** (Figma Effect style: Neutral / Bottom 12)

## Bo góc (border radius) — mọi mức
Card 8px · Dialog / popup 12px · control (nút, ô nhập, menu, tag) = radius-default theo mật độ.
- `--radius-sm`: **4px**
- `--radius-inner`: Trung bình **6px** · Nhỏ **4px** · Rộng **6px**
- `--radius-default`: Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- `--radius-focus`: Trung bình **12px** · Nhỏ **8px** · Rộng **12px**
- `--radius-dialog`: **12px**
- `--radius-pill`: **9999px**
- `--radius-card`: **8px**

## Kiểu chữ (typography) — cỡ chữ, dòng, độ đậm
- `--font-family`: **InterVariable, 'Inter var', sans-serif**
- `--text-h1`: **24px**
- `--text-h1-lh`: **32px**
- `--text-h2`: **20px**
- `--text-h2-lh`: **28px**
- `--text-h3`: **16px**
- `--text-h3-lh`: **22px**
- `--text-body`: **13px**
- `--text-body-lh`: **20px**
- `--text-body-sm`: **12px**
- `--text-body-sm-lh`: **18px**
- `--text-body-md`: **14px**
- `--text-body-md-lh`: **22px**
- `--text-body-lg`: **16px**
- `--text-body-lg-lh`: **24px**
- `--text-caption`: **10px**
- `--text-caption-lh`: **15px**
- `--lh-btn-md`: **20px**
- `--lh-btn-sm`: **18px**
- `--lh-label`: **20px**
- `--text-sm`: **12px**
- `--text-sm-lh`: **16px**
- `--fw-regular`: **400**
- `--fw-medium`: **500**
- `--fw-semibold`: **600**
- `--fw-bold`: **700**

## Khoảng cách chuẩn (padding, gap, margin)
- `--card-px`: **16px**
- `--card-py`: **16px**
- `--card-gap`: **12px**
- `--card-col-gap`: **16px**
- `--gap-control`: **8px**
- `--page-gutter`: **16px**
- `--box-padding`: **16px**
- `--form-label-w`: **200px**
- `--form-label-gap-h`: **8px**
- `--form-row-gap-h`: **12px**
- `--form-row-gap-v`: **16px**
- `--form-group-gap`: **32px**
- `--form-group-title-gap`: **12px**
- `--layout-header-h`: **48px**
- `--layout-sidebar-w`: **200px**
- `--layout-sidebar-sm-w`: **64px**
- `--layout-page-header-h`: **56px**

## Màu chữ (text)
- `--text-primary`: **#10141b**
- `--text-secondary`: **#6b707a**
- `--text-hint`: **#9da2ac**
- `--text-disabled`: **#9da2ac**
- `--text-brand`: **#245fdf**
- `--text-brand-disabled`: **#68a6f2**
- `--text-link`: **#245fdf**
- `--text-link-default`: **#1570ef**
- `--text-link-disabled`: **#68a6f2**
- `--text-link-hover`: **#2644a7**
- `--text-link-default-hover`: **#175cd3**
- `--text-white`: **#ffffff**
- `--text-white-disabled`: **#ffffff độ mờ 70%**
- `--text-info`: **#1570ef**
- `--text-info-disabled`: **#84caff**
- `--text-warning`: **#dc6803**
- `--text-warning-disabled`: **#fec84b**
- `--text-danger`: **#f04438**
- `--text-danger-disabled`: **#fda29b**
- `--text-success`: **#039855**
- `--text-success-disabled`: **#6ce9a6**
- `--text-accent`: **#9e77ed**
- `--text-accent-disabled`: **#d6bbfb**

## Màu nền (background)
- `--bg-ai-light`: **rgba(20, 130, 255, 0.06)**
- `--bg-overlay`: **rgba(16, 24, 40, 0.4)**
- `--bg-ai-gradient`: **linear-gradient(110deg, #1482ff 9%, #cf11ff 100%)**
- `--bg-ai-gradient-light`: **linear-gradient(111deg, #edf9ff 8.87%, #fee2ff 100%)**
- `--bg-page`: **#f2f2f4**
- `--bg-white`: **#ffffff**
- `--bg-black`: **#000000**
- `--bg-brand`: **#245fdf**
- `--bg-brand-hover`: **#2753ce**
- `--bg-brand-pressed`: **#2644a7**
- `--bg-brand-light`: **#f0f6fe**
- `--bg-brand-light-hover`: **#ddeafc**
- `--bg-brand-light-pressed`: **#c2dbfb**
- `--bg-brand-disable`: **#68a6f2**
- `--bg-neutral`: **#8f949d**
- `--bg-neutral-light`: **#f2f2f4**
- `--bg-neutral-lighter`: **#fbfbfc**
- `--bg-neutral-hover`: **#ecedef**
- `--bg-neutral-pressed`: **#e6e7ea**
- `--bg-neutral-disable`: **#ced1d6**
- `--bg-info`: **#1570ef**
- `--bg-info-hover`: **#175cd3**
- `--bg-info-pressed`: **#1849a9**
- `--bg-info-light`: **#eff8ff**
- `--bg-info-light-hover`: **#d1e9ff**
- `--bg-info-light-pressed`: **#b2ddff**
- `--bg-info-disable`: **#84caff**
- `--bg-warning`: **#f79009**
- `--bg-warning-hover`: **#dc6803**
- `--bg-warning-pressed`: **#b54708**
- `--bg-warning-light`: **#fffaeb**
- `--bg-warning-light-hover`: **#fef0c7**
- `--bg-warning-light-pressed`: **#fedf89**
- `--bg-warning-disable`: **#fec84b**
- `--bg-danger`: **#f04438**
- `--bg-danger-hover`: **#d92d20**
- `--bg-danger-pressed`: **#b42318**
- `--bg-danger-light`: **#fef3f2**
- `--bg-danger-light-hover`: **#fee4e2**
- `--bg-danger-light-pressed`: **#fecdca**
- `--bg-danger-disable`: **#fda29b**
- `--bg-success`: **#12b76a**
- `--bg-success-hover`: **#039855**
- `--bg-success-pressed`: **#027a48**
- `--bg-success-light`: **#ecfdf3**
- `--bg-success-light-hover`: **#d1fadf**
- `--bg-success-light-pressed`: **#a6f4c5**
- `--bg-success-disable`: **#6ce9a6**
- `--bg-accent`: **#9e77ed**
- `--bg-accent-hover`: **#9e77ed**
- `--bg-accent-pressed`: **#7f56d9**
- `--bg-accent-light`: **#f9f5ff**
- `--bg-accent-light-hover`: **#f4ebff**
- `--bg-accent-light-pressed`: **#e9d7fe**
- `--bg-accent-disable`: **#d6bbfb**
- `--bg-form-footer`: **#f4f4f6**

## Màu viền (stroke / border)
- `--stroke-ai`: **linear-gradient(110deg, #1482ff 0%, #cf11ff 100%)**
- `--stroke-neutral`: **#ced1d6**
- `--stroke-neutral-light`: **#e5e6e9**
- `--stroke-neutral-disable`: **#ecedef**
- `--stroke-divider`: **#e5e6e9**
- `--stroke-brand`: **#245fdf**
- `--stroke-brand-light`: **#99c5f7**
- `--stroke-brand-disabled`: **#68a6f2**
- `--stroke-white`: **#ffffff**
- `--stroke-white-disabled`: **#ffffff độ mờ 70%**
- `--stroke-info`: **#1570ef**
- `--stroke-info-light`: **#b2ddff**
- `--stroke-info-disabled`: **#84caff**
- `--stroke-warning`: **#dc6803**
- `--stroke-warning-light`: **#fedf89**
- `--stroke-warning-disabled`: **#fec84b**
- `--stroke-danger`: **#f04438**
- `--stroke-danger-light`: **#fecdca**
- `--stroke-danger-disabled`: **#fda29b**
- `--stroke-success`: **#039855**
- `--stroke-success-light`: **#a6f4c5**
- `--stroke-success-disabled`: **#6ce9a6**
- `--stroke-accent`: **#9e77ed**
- `--stroke-accent-light`: **#e9d7fe**
- `--stroke-accent-disabled`: **#d6bbfb**
- `--stroke-form-footer`: **#ced1d6**

## Màu icon
- `--icon-ai`: **linear-gradient(110deg, #1482ff 0%, #cf11ff 100%)**
- `--icon-neutral`: **#6b707a**
- `--icon-neutral-hover`: **#245fdf**
- `--icon-neutral-disabled`: **#ced1d6**
- `--icon-brand`: **#245fdf**
- `--icon-brand-hover`: **#4584ec**
- `--icon-brand-disabled`: **#68a6f2**
- `--icon-link`: **#2753ce**
- `--icon-link-default`: **#1570ef**
- `--icon-link-disabled`: **#68a6f2**
- `--icon-white`: **#ffffff**
- `--icon-white-hover`: **#ffffff độ mờ 50%**
- `--icon-white-disabled`: **#ffffff độ mờ 70%**
- `--icon-info`: **#1570ef**
- `--icon-info-hover`: **#53b1fd**
- `--icon-info-disabled`: **#84caff**
- `--icon-warning`: **#dc6803**
- `--icon-warning-hover`: **#fdb022**
- `--icon-warning-disabled`: **#fec84b**
- `--icon-danger`: **#f04438**
- `--icon-danger-hover`: **#f97066**
- `--icon-danger-disabled`: **#fda29b**
- `--icon-success`: **#039855**
- `--icon-success-hover`: **#32d583**
- `--icon-success-disabled`: **#6ce9a6**
- `--icon-accent`: **#9e77ed**
- `--icon-accent-hover`: **#b692f6**
- `--icon-accent-disabled`: **#d6bbfb**
