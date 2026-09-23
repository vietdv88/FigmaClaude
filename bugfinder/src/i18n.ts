/**
 * UI-language translation — this is entirely separate from the auto-detected
 * EN/VI mode used to decide which spelling rules to run on the design's OWN
 * text content. This module only controls what language the PLUGIN'S OWN
 * interface (labels, buttons, rule descriptions, status/error messages)
 * displays in.
 *
 * `t()` reads a shared module-level "current locale" rather than taking it as
 * a parameter everywhere, since every consumer (ui.ts, localChecks.ts,
 * designChecks.ts, gemini.ts) runs synchronously on the UI thread where a
 * single mutable locale is safe and avoids threading a `locale` argument
 * through dozens of call sites. code.ts (the separate main-thread bundle)
 * keeps its OWN copy of this same module and its own copy of the locale,
 * kept in sync via a dedicated message whenever the user switches language.
 */

export type Locale = "vi" | "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  vi: "🇻🇳 Tiếng Việt",
  en: "🇬🇧 English",
};

let currentLocale: Locale = "vi";

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

type Dict = Record<string, string>;

const VI: Dict = {
  // ---- Top-level tabs ----
  "tab.review": "Review",
  "tab.compare": "So sánh Text",
  "tab.comments": "Xem Comment",

  // ---- Export Comments tab ----
  "comments.tokenLabel": "Figma Personal Access Token",
  "comments.tokenHelpAria": "Hướng dẫn lấy Personal Access Token",
  "comments.tokenHelpIntro": "Tạo token miễn phí tại",
  "comments.tokenHelpStep1": "Vào Figma → Settings → Security → Personal access tokens.",
  "comments.tokenHelpStep2": "Bấm <b>Generate new token</b>, chọn quyền đọc file/comment.",
  "comments.tokenHelpStep3": "Copy token và dán vào ô bên cạnh — chỉ lưu trên máy bạn, không gửi đi đâu khác ngoài Figma.",
  "comments.tokenPlaceholder": "Dán Personal Access Token vào đây...",
  "comments.tokenSaveBtn": "Lưu",
  "comments.fileLinkLabel": "Link hoặc file key của file Figma",
  "comments.fileLinkPlaceholder": "Dán link file Figma (hoặc dán thẳng file key)...",
  "comments.fetchBtn": "Tải comment của file này",
  "comments.statusNoToken": "Chưa có Personal Access Token — dán token ở trên rồi bấm Lưu.",
  "comments.statusNoFileKey": "Chưa nhập link/file key hợp lệ — dán link file Figma (hoặc file key) vào ô ở trên.",
  "comments.statusLoading": "Đang tải comment...",
  "comments.statusEmpty": "File này chưa có comment nào.",
  "comments.statusLoaded": "Đã tải {count} comment.",
  "comments.statusTokenInvalid": "Token không hợp lệ hoặc không có quyền đọc file này.",
  "comments.statusHttpError": "Figma API trả về lỗi (HTTP {status}).",
  "comments.statusNetworkError": "Không thể kết nối tới Figma API. Kiểm tra kết nối mạng.",
  "comments.filterAuthorAll": "Tất cả người viết",
  "comments.filterStatusAll": "Tất cả trạng thái",
  "comments.filterStatusResolved": "Đã resolve",
  "comments.filterStatusUnresolved": "Chưa resolve",
  "comments.resultsEmpty": "Không có comment nào khớp bộ lọc.",
  "comments.badgeResolved": "Đã resolve",
  "comments.badgeUnresolved": "Chưa resolve",
  "comments.openInFigma": "Mở vị trí này trong Figma",
  "comments.replyPrefix": "↳ Trả lời",
  "comments.tableAuthor": "Người viết",
  "comments.tableStatus": "Trạng thái",
  "comments.tableDate": "Ngày tạo",
  "comments.tableMessage": "Nội dung",

  // ---- API key section ----
  "apiKey.label": "Gemini API key",
  "apiKey.help.aria": "Hướng dẫn lấy API key",
  "apiKey.help.intro": "Lấy API key miễn phí tại",
  "apiKey.help.step1": "Đăng nhập bằng tài khoản Google.",
  "apiKey.help.step2": "Bấm <b>Create API key</b>.",
  "apiKey.help.step3": "Chọn \"Create API key in new project\" (hoặc project có sẵn).",
  "apiKey.help.step4": "Copy key và dán vào ô bên cạnh.",
  "apiKey.savedText": "✓ Đã lưu",
  "apiKey.editBtn": "Sửa",
  "apiKey.placeholder": "Dán API key vào đây...",
  "apiKey.saveBtn": "Lưu",
  "apiKey.savedToast": "Đã lưu API key.",

  // ---- Config tabs (Website / Web App) ----
  "configTab.website": "Review Website",
  "configTab.webapp": "Review Web App",

  // ---- Selection state ----
  "selection.emptyReview": "Chọn 1 Frame để review",
  "selection.prefix": "Đang chọn:",
  "selection.multiple": "{count} layer đã chọn",

  // ---- Review button ----
  "review.runWebsite": "Review Website",
  "review.runWebapp": "Review Web App",

  // ---- Rule panel ----
  "rulesPanel.group.local": "Kiểm tra chung (không cần AI)",
  "rulesPanel.group.aiEn": "AI — Check Tiếng Anh",
  "rulesPanel.group.aiVi": "AI — Check Tiếng Việt",
  "rulesPanel.group.designApp": "Design System (Web App)",
  "rulesPanel.aiMasterSwitch.title": "Bật/tắt toàn bộ rule AI trong mục này",
  "lang.en": "Tiếng Anh",
  "lang.vi": "Tiếng Việt",

  // ---- Color library picker ----
  "colorLibrary.title": "Thư viện màu",
  "colorLibrary.none": "Không chọn (dùng style/variable cục bộ)",
  "colorLibrary.loading": "Đang tải màu từ thư viện...",
  "colorLibrary.ready": "Đã đọc {count} màu từ thư viện.",
  "colorLibrary.error": "Không tải được thư viện: {error}",
  "colorLibrary.empty": "Không có thư viện nào được bật trong file này.",
  "colorLibrary.hint": "Chọn thư viện để gợi ý sửa màu khớp đúng token thực tế (chỉ đọc Color Variables, chưa hỗ trợ Paint Style).",

  // ---- Custom rules ----
  "customRules.label": "Rule tùy chỉnh (mỗi dòng 1 rule, áp dụng cho cả 2 ngôn ngữ, cần API key)",
  "customRules.placeholder": "Ví dụ: Không dùng từ \"oke\", phải viết \"OK\"\nTên sản phẩm \"Acme Cloud\" phải viết đúng hoa thường",
  "customRules.saveBtn": "Lưu rule tùy chỉnh",
  "customRules.savedToast": "Đã lưu rule tùy chỉnh.",

  // ---- Ignore patterns ----
  "ignorePatterns.label": "Rule bỏ qua (mỗi dòng 1 từ khóa — khớp trực tiếp theo tên layer có chứa từ khóa đó, không phân biệt hoa/thường)",
  "ignorePatterns.placeholder": "Ví dụ: Icon Swap",
  "ignorePatterns.saveBtn": "Lưu rule bỏ qua",
  "ignorePatterns.savedToast": "Đã lưu rule bỏ qua.",

  // ---- Results view ----
  "results.back": "← Quay lại",
  "results.collapseAll": "▾ Thu gọn tất cả",
  "results.expandAll": "▸ Mở rộng tất cả",
  "results.modeWebsite": "Kết quả Review Website",
  "results.modeWebapp": "Kết quả Review Web App",
  "results.issuesCount": "{count} lỗi",
  "results.emptyNone": "Không tìm thấy lỗi nào. 🎉",
  "results.emptyFiltered": "Không có lỗi nào ở nhóm này. 🎉",
  "results.fixBtn": "Fix lỗi",
  "results.fixArrow": "Fix → {label}",
  "results.deleteLabel": "(xóa)",
  "results.moreActions": "Thao tác khác",
  "results.deleteLayer": "Xóa layer",

  // ---- Filter tabs ----
  "filter.all": "Tất cả",
  "filter.content": "Chính tả & ngôn ngữ",
  "filter.textformat": "Khoảng trắng & dấu câu",
  "filter.color": "Màu sắc",
  "filter.font": "Font chữ",
  "filter.dimension": "Kích thước",
  "filter.gap": "Khoảng cách",
  "filter.effect": "Hiệu ứng",
  "filter.override": "Component bị đổi thuộc tính",

  // ---- Issue type labels ----
  "type.non_english": "Không phải tiếng Anh",
  "type.spelling": "Sai chính tả",
  "type.grammar": "Ngữ pháp",
  "type.spacing": "Khoảng trắng",
  "type.punctuation": "Dấu câu",
  "type.nonsense": "Vô nghĩa",
  "type.proper_noun": "Danh từ riêng",
  "type.case_inconsistency": "Viết hoa/thường không nhất quán",
  "type.custom": "Rule tùy chỉnh",
  "type.design_font": "Font sai chuẩn",
  "type.design_font_size": "Cỡ chữ sai chuẩn",
  "type.design_color": "Fill/Stroke sai token",
  "type.design_dimension": "Kích thước sai chuẩn",
  "type.design_spacing": "Gap sai chuẩn",
  "type.design_effect": "Thiếu/sai Drop Shadow",
  "type.design_override": "Component bị đổi thuộc tính",

  // ---- Status messages ----
  "status.checking": "Đang kiểm tra {count} layer...",
  "status.checkingAi": "Đang kiểm tra AI: {done}/{total} layer...",
  "status.aiOffLang": "Đã tắt kiểm tra AI {lang} — chỉ chạy kiểm tra khoảng trắng/dấu câu/định dạng số cục bộ.",
  "status.noApiKey": "Chưa nhập API key — chỉ chạy kiểm tra khoảng trắng/dấu câu/định dạng số cục bộ.",
  "status.aiUnknownError": "Lỗi không xác định khi gọi AI.",
  "status.foundIssues": "Tìm thấy {count} lỗi.",
  "status.noIssues": "Không tìm thấy lỗi nào.",
  "status.scanning": "Đang quét lựa chọn...",
  "status.genericError": "Lỗi không xác định khi kiểm tra.",

  // ---- Compare view ----
  "compare.pickerEmpty": "Chọn 2 Frame để so sánh",
  "compare.selectedNames": "{a} ↔ {b}",
  "compare.runBtn": "So sánh",
  "compare.running": "Đang so sánh...",
  "compare.noDiff": "Không có khác biệt nào giữa \"{a}\" và \"{b}\". 🎉",
  "compare.foundDiff": "Tìm thấy {count} khác biệt giữa \"{a}\" và \"{b}\".",
  "compare.missingLayer": "— không có layer này —",
  "compare.emptyText": "(rỗng)",
  "compare.useThis": "Dùng nội dung này →",

  // ---- Language switcher ----
  "langSwitcher.title": "Ngôn ngữ giao diện",

  // ---- Rule definitions ----
  "rule.spacingDoubleSpace.label": "Thừa khoảng trắng liên tiếp",
  "rule.spacingDoubleSpace.description": "Hai dấu cách trở lên đứng liền nhau.",
  "rule.spacingSplitKnownTerm.label": "Tên control quen thuộc bị tách bởi khoảng trắng",
  "rule.spacingSplitKnownTerm.description":
    "Khoảng trắng thừa chèn giữa các chữ cái của 1 tên control quen thuộc (Button, Textbox, Checkbox, Dropdown...), ví dụ \"Textb      ox\" thực chất là \"Textbox\" — gợi ý xóa hết khoảng trắng thừa để nối lại đúng chính tả, không cần AI.",
  "rule.spacingEdge.label": "Thừa khoảng trắng đầu văn bản",
  "rule.spacingEdge.description": "Dấu cách thừa ở đầu văn bản. (Không check khoảng trắng thừa ở cuối — không quan trọng.)",
  "rule.spacingBeforePunct.label": "Thừa khoảng trắng trước dấu câu",
  "rule.spacingBeforePunct.description": "Có dấu cách ngay trước dấu , . ; : ! ?",
  "rule.spacingAfterPunct.label": "Thiếu khoảng trắng sau dấu câu",
  "rule.spacingAfterPunct.description": "Không có dấu cách ngay sau dấu , ; : ! ?",
  "rule.punctRepeated.label": "Dấu câu lặp lại",
  "rule.punctRepeated.description": "Dấu câu bị gõ lặp, ví dụ !! hoặc ,,",
  "rule.numberThousandSeparator.label": "Định dạng số theo chuẩn Design System",
  "rule.numberThousandSeparator.description":
    "Số phải dùng dấu phân cách hàng nghìn chuẩn (mặc định dấu chấm: 1.200.000), không dùng dấu phẩy (1,200,000).",
  "rule.numberThousandSeparator.editableLabel": "Ký tự phân cách chuẩn",
  "rule.textCaseConsistency.label": "Cùng 1 cụm từ viết hoa/thường không nhất quán",
  "rule.textCaseConsistency.description":
    "Cùng 1 cụm từ (từ 2 từ trở lên) xuất hiện ở nhiều layer trong lựa chọn nhưng viết hoa/thường khác nhau, ví dụ \"iGOV Kế toán\" / \"IGOV Kế toán\" / \"iGOV kế toán\". Nếu các cách viết chỉ khác nhau ở chữ cái đầu tiên (kiểu viết hoa tiêu đề/đầu câu bình thường, ví dụ \"Kế toán\" so với \"kế toán\") thì bỏ qua; chỉ báo lỗi khi có cách viết hoa bất thường hơn (chữ không phải đầu tiên cũng hoa, hoặc mẫu đặc biệt như \"iGOV\") chứng tỏ đây là tên riêng/thương hiệu cố định. Không tự chọn cách viết chuẩn — Fix lỗi hiện các cách viết khác đang có để người dùng tự chọn.",
  "rule.aiNonEnglish.label": "Từ/cụm từ không phải tiếng Anh",
  "rule.aiNonEnglish.description": "Phát hiện từ ngữ ngôn ngữ khác lẫn vào văn bản tiếng Anh.",
  "rule.aiSpellingEn.label": "Sai chính tả tiếng Anh",
  "rule.aiSpellingEn.description": "Từ tiếng Anh bị gõ sai chính tả.",
  "rule.aiGrammarEn.label": "Sai ngữ pháp tiếng Anh",
  "rule.aiGrammarEn.description":
    "Lỗi ngữ pháp tiếng Anh rõ ràng. Mặc định TẮT — plugin chỉ tập trung vào lỗi chính tả (sai từ, thừa/thiếu dấu câu, khoảng trắng), không phải công cụ gợi ý cải thiện văn phong/cách hành văn; bật lại nếu bạn thực sự muốn AI báo cả lỗi ngữ pháp.",
  "rule.aiNonsenseVi.label": "Từ ngữ vô nghĩa / sai chính tả tiếng Việt",
  "rule.aiNonsenseVi.description": "Từ hoặc cụm từ vô nghĩa, gõ sai dấu, sai chính tả tiếng Việt.",
  "rule.aiProperNounVi.label": "Danh từ riêng chưa viết hoa",
  "rule.aiProperNounVi.description":
    "Tên người, địa danh, thương hiệu... chưa viết hoa chữ cái đầu. Mặc định TẮT — hay báo nhầm với tên thương hiệu/sản phẩm nội bộ có cách viết hoa đặc thù (chữ hoa xen kẽ không theo quy tắc thông thường) mà AI không biết là tên riêng có chủ đích; bật lại nếu nội dung của bạn không có các tên riêng kiểu này.",
  "rule.aiGrammarVi.label": "Sai ngữ pháp / dùng từ sai ngữ cảnh tiếng Việt",
  "rule.aiGrammarVi.description":
    "Lỗi ngữ pháp hoặc dùng từ rõ ràng không phù hợp ngữ cảnh. Mặc định TẮT — plugin chỉ tập trung vào lỗi chính tả (sai từ, thừa/thiếu dấu câu, khoảng trắng, từ ngữ vô nghĩa), không phải công cụ gợi ý cải thiện văn phong/cách dùng từ; bật lại nếu bạn thực sự muốn AI báo cả lỗi ngữ pháp.",
  "rule.designFontFamily.label": "Font không đúng chuẩn",
  "rule.designFontFamily.description": "Text layer dùng font khác font chuẩn theo Design System.",
  "rule.designFontFamily.editableLabel": "Font chuẩn",
  "rule.designFontSize.label": "Cỡ chữ lệch thang chuẩn",
  "rule.designFontSize.description": "Cỡ chữ không thuộc thang chuẩn (mặc định 20/16/13/12: h2/h3/Body/Body Small).",
  "rule.designFontSize.editableLabel": "Thang cỡ chữ (px, cách nhau bởi dấu phẩy)",
  "rule.designTextColor.label": "Fill (màu chữ) chưa link token",
  "rule.designTextColor.description":
    "Fill của text layer là màu thô (raw), chưa link tới bất kỳ Paint Style hay Variable nào trong thư viện. Nếu ô bên dưới có nhập mã hex, màu thô khớp đúng 1 trong các mã đó cũng được coi là đạt (dù chưa link). Chỉ báo lỗi, không có Fix — màu xám khó phân biệt chính xác bằng mắt/hex nên để người dùng tự link thủ công đúng token.",
  "rule.designTextColor.editableLabel": "Mã màu hợp lệ (hex, cách nhau bởi dấu phẩy — để trống nếu chỉ cần đã link)",
  "rule.designBorderColor.label": "Stroke (màu viền) chưa link token",
  "rule.designBorderColor.description":
    "Stroke là màu thô (raw), chưa link tới bất kỳ Paint Style hay Variable nào trong thư viện (áp dụng cho cả border lẫn icon). Nếu ô bên dưới có nhập mã hex, màu thô khớp đúng 1 trong các mã đó cũng được coi là đạt. Bấm Fix để tự link nếu file có sẵn Style/Variable trùng màu.",
  "rule.designBorderColor.editableLabel": "Mã màu hợp lệ (hex, cách nhau bởi dấu phẩy — để trống nếu chỉ cần đã link)",
  "rule.designControlHeight.label": "Chiều cao control sai chuẩn",
  "rule.designControlHeight.description":
    "Layer tên trùng control nhập liệu (button, textbox, combobox, searchbox...) nhưng chiều cao khác chuẩn. Bỏ qua icon thường (tên chứa \"icon\", trừ Button Icon/Icon Button), bỏ qua checkbox/radio/switch/tag (kích thước riêng), và bỏ qua Dropdown Menu (là menu/danh sách nổi, khác loại với control combobox nhập liệu).",
  "rule.designControlHeight.editableLabel": "Chiều cao control chuẩn (px)",
  "rule.designControlRadius.label": "Bo góc control sai chuẩn",
  "rule.designControlRadius.description":
    "Bo góc không khớp chuẩn (mặc định 8px control thường, 12px card/modal/popup). Bỏ qua layer không có Fill lẫn Stroke — bo góc không có gì để nhìn thấy.",
  "rule.designControlRadius.editableLabel": "Bo góc chuẩn (thường, lớn — px)",
  "rule.designControlSpacing.label": "Gap không phải bội số chuẩn",
  "rule.designControlSpacing.description":
    "Gap (khoảng cách giữa các item) trong auto layout phải là bội số của đơn vị chuẩn. Bỏ qua frame chỉ có 1 child — Gap không có ý nghĩa khi không có gì để cách ra.",
  "rule.designControlSpacing.editableLabel": "Gap phải là bội số của (px)",
  "rule.designButtonRowGap.label": "Gap giữa các button ngang sai chuẩn",
  "rule.designButtonRowGap.description":
    "Auto layout Horizontal mà mọi child đều là button (tên chứa \"button\") phải có Gap đúng bằng giá trị chuẩn — quy tắc riêng, ưu tiên hơn thang bội số chung.",
  "rule.designButtonRowGap.editableLabel": "Gap chuẩn giữa các button ngang (px)",
  "rule.designCardShadow.label": "Card nền trắng bo góc 8px thiếu/sai Drop Shadow",
  "rule.designCardShadow.description":
    "Box/card Fill trắng (#FFFFFF), bo góc 8px — thường đặt trên nền xám BG Page — phải gắn effect style Drop Shadow chuẩn. Chỉ áp dụng cho frame/rectangle nằm trực tiếp trên trang, không áp dụng cho bất kỳ layer nào nằm bên trong component/instance (button, textbox...) — kể cả 1 rectangle trắng bo góc 8px lồng bên trong 1 component khác.",
  "rule.designCardShadow.editableLabel": "Tên effect style Drop Shadow chuẩn",
  "rule.designInstanceOverride.label": "Component bị đổi thuộc tính khác bản gốc",
  "rule.designInstanceOverride.description":
    "Instance kéo từ thư viện nhưng có 1 layer bên trong bị override 1 trong 4 nhóm thuộc tính: Padding, Bo góc, Stroke (màu/độ dày), hoặc Fill (màu) — khác với component gốc, dấu hiệu ai đó chỉnh tay lệch khỏi Design System. Lỗi hiện rõ giá trị gốc ở component và giá trị đã đổi ở instance (dạng \"trước → sau\"), không chỉ nêu tên thuộc tính. Chạy hoàn toàn cục bộ (không dùng AI); Figma đôi khi vẫn giữ cờ \"đã override\" dù giá trị đổi rồi đổi lại y hệt bản gốc, nên chỉ báo lỗi sau khi so lại giá trị thật và xác nhận có khác nhau, không tin thẳng vào cờ đó. Không tính override nội dung chữ, vị trí, kích thước, font hay hiệu ứng vì đó là tùy biến hợp lệ/ngoài phạm vi rule này. Chỉ báo lỗi, không có Fix — reset override sẽ xóa luôn cả phần tùy biến hợp lệ (chữ, kích thước).",

  // ---- code.ts (main thread) notifications/errors ----
  "code.selectAtLeastOneLayer": "Vui lòng chọn ít nhất một layer để kiểm tra.",
  "code.noTextLayerFound": "Không tìm thấy text layer nào trong lựa chọn.",
  "code.tooManyLayers": "Lựa chọn có nhiều layer, chỉ quét {max} layer đầu tiên.",
  "code.compareNeedExactly2": "Cần chọn đúng 2 frame để so sánh (đang chọn {count}).",
  "code.layerNoLongerExists": "Layer này không còn tồn tại.",
  "code.layerNotFound": "Không tìm thấy layer.",
  "code.originalContentChanged": "Nội dung gốc đã thay đổi, không thể áp dụng gợi ý.",
  "code.fixAppliedButNoChange":
    "Đã gọi API sửa nhưng nội dung layer không đổi như mong đợi — có thể layer bị khóa hoặc là text override đặc biệt.",
  "code.fixApplied": "Đã fix lỗi.",
  "code.layerDeleted": "Đã xóa layer.",
  "code.unknownError": "Lỗi không xác định.",
  "code.noFill": "Layer không có Fill.",
  "code.noStroke": "Layer không có Stroke.",
  "code.noStyleOrVariableFound":
    "Không tìm thấy Style hoặc Variable màu #{hex} nào trong file để link — chưa áp dụng, cần link thủ công.",
  "code.noVariableFound": "Không tìm thấy Variable để link.",
  "code.noMatchingColorOnLayer": "Không tìm thấy màu phù hợp trên layer để link Variable.",
  "code.notText": "Layer không phải text.",
  "code.cannotResize": "Layer không hỗ trợ đổi kích thước.",
  "code.cannotRadius": "Layer không hỗ trợ bo góc.",
  "code.notAutoLayout": "Layer không phải auto layout.",
  "code.noEffectStyleSupport": "Layer không hỗ trợ effect style.",
  "code.effectStyleNotFound": "Không tìm thấy effect style \"{name}\" trong file này.",
  "code.apiKeySaved": "Đã lưu API key.",
  "code.figmaTokenSaved": "Đã lưu Figma Personal Access Token.",
  "code.customRulesSaved": "Đã lưu rule tùy chỉnh.",
  "code.ignorePatternsSaved": "Đã lưu rule bỏ qua.",

  // ---- Design System check messages (designChecks.ts) ----
  "designCheck.fontMismatch": "Font \"{font}\" không phải {expected} theo Design System.",
  "designCheck.fontSizeOffScale": "Cỡ chữ {size}px không thuộc thang chuẩn ({allowed}).",
  "designCheck.fillRawColor":
    "Fill #{hex} đang là màu thô (raw), chưa link Style/Variable nào từ thư viện — cần tự link thủ công.",
  "designCheck.strokeRawColor":
    "Stroke #{hex} đang là màu thô (raw), chưa link Style/Variable nào từ thư viện — bấm Fix để tự link nếu file có sẵn màu trùng.",
  "designCheck.heightMismatch": "Layer \"{name}\" trông giống control nhưng cao {height}px thay vì {expected}px.",
  "designCheck.radiusValueLabel": "bo góc {value}px",
  "designCheck.radiusMismatch": "Layer \"{name}\" nên bo góc {expected}px theo Design System, hiện đang {current}px.",
  "designCheck.buttonRowGapMismatch":
    "Hàng button ngang phải có Gap {expected}px theo quy chuẩn, hiện đang {current}px.",
  "designCheck.instanceGapOverride": "Gap {current}px trong \"{name}\" khác với component gốc trong thư viện.",
  "designCheck.gapNotMultiple": "Gap {current}px phải là bội số của {unit}px — chọn nhanh giá trị gần nhất bên dưới.",
  "designCheck.noDropShadowLabel": "Không có Drop Shadow",
  "designCheck.missingDropShadow": "Box \"{name}\" nền trắng bo góc 8px nhưng chưa gắn effect style \"{expected}\".",
  "designCheck.wrongDropShadow": "Box \"{name}\" đang dùng effect \"{current}\" thay vì \"{expected}\".",
  "designCheck.instanceOverride": "Instance \"{name}\" có thuộc tính bị chỉnh khác component gốc — {details}.",

  // ---- Override field labels (design-instance-override, used inside designCheck.instanceOverride's {details}) ----
  "overrideField.fills": "Fill",
  "overrideField.strokes": "Stroke",
  "overrideField.strokeWeight": "Độ dày stroke",
  "overrideField.cornerRadius": "Bo góc",
  "overrideField.topLeftRadius": "Bo góc trên-trái",
  "overrideField.topRightRadius": "Bo góc trên-phải",
  "overrideField.bottomLeftRadius": "Bo góc dưới-trái",
  "overrideField.bottomRightRadius": "Bo góc dưới-phải",
  "overrideField.paddingLeft": "Padding trái",
  "overrideField.paddingTop": "Padding trên",
  "overrideField.paddingRight": "Padding phải",
  "overrideField.paddingBottom": "Padding dưới",

  // ---- Local check messages (localChecks.ts) ----
  "localCheck.splitKnownTerm": "\"{original}\" có khoảng trắng thừa chèn giữa từ — có thể bạn muốn viết \"{suggestion}\".",
  "localCheck.doubleSpace": "Thừa khoảng trắng ({count} dấu cách liên tiếp).",
  "localCheck.leadingSpace": "Thừa khoảng trắng ở đầu văn bản.",
  "localCheck.spaceBeforePunct": "Thừa khoảng trắng trước dấu câu.",
  "localCheck.missingSpaceAfterPunct": "Thiếu khoảng trắng sau dấu câu.",
  "localCheck.repeatedPunctSimple": "Dấu \"{char}\" bị gõ lặp {count} lần liên tiếp ({run}) — chỉ cần 1 dấu.",
  "localCheck.repeatedDots2":
    "Chỉ có 2 dấu chấm liên tiếp ({run}) — nếu ý là dấu ba chấm \"...\" thì thiếu 1 dấu, còn không thì thừa và chỉ cần 1 dấu.",
  "localCheck.repeatedDotsMany":
    "Có {count} dấu chấm liên tiếp ({run}), nhiều hơn dấu ba chấm chuẩn \"...\" — thừa {extra} dấu.",
  "localCheck.thousandSeparator":
    "Số phải dùng dấu \"{separator}\" phân cách hàng nghìn theo chuẩn Design System, không dùng dấu phẩy.",
  "localCheck.caseInconsistent":
    "\"{text}\" viết hoa/thường khác với cách viết khác đang dùng trong lựa chọn ({variants}) — chọn 1 cách viết chuẩn bên dưới để đồng bộ.",

  // ---- Gemini API errors (gemini.ts) ----
  "gemini.networkError": "Không thể kết nối tới Gemini API. Kiểm tra kết nối mạng.",
  "gemini.invalidApiKey": "API key không hợp lệ hoặc không có quyền truy cập.",
  "gemini.rateLimited": "Đã vượt giới hạn gọi API miễn phí (rate limit). Vui lòng thử lại sau ít phút.",
  "gemini.httpError": "Gemini API trả về lỗi (HTTP {status}).",
  "gemini.noContent": "Gemini API không trả về nội dung hợp lệ.",
  "gemini.badJson": "Không thể đọc kết quả JSON từ Gemini API.",
};

const EN: Dict = {
  "tab.review": "Review",
  "tab.compare": "Compare Text",
  "tab.comments": "View Comments",

  "comments.tokenLabel": "Figma Personal Access Token",
  "comments.tokenHelpAria": "How to get a Personal Access Token",
  "comments.tokenHelpIntro": "Create a free token at",
  "comments.tokenHelpStep1": "Go to Figma → Settings → Security → Personal access tokens.",
  "comments.tokenHelpStep2": "Click <b>Generate new token</b>, grant file/comment read access.",
  "comments.tokenHelpStep3": "Copy the token and paste it into the field next to it — it stays on your machine, sent only to Figma.",
  "comments.tokenPlaceholder": "Paste your Personal Access Token here...",
  "comments.tokenSaveBtn": "Save",
  "comments.fileLinkLabel": "Figma file link or file key",
  "comments.fileLinkPlaceholder": "Paste the Figma file link (or the raw file key)...",
  "comments.fetchBtn": "Fetch comments for this file",
  "comments.statusNoToken": "No Personal Access Token yet — paste one above and click Save.",
  "comments.statusNoFileKey": "No valid file link/key entered yet — paste the Figma file link (or its key) above.",
  "comments.statusLoading": "Fetching comments...",
  "comments.statusEmpty": "This file has no comments yet.",
  "comments.statusLoaded": "Loaded {count} comments.",
  "comments.statusTokenInvalid": "Invalid token, or it doesn't have access to this file.",
  "comments.statusHttpError": "Figma API returned an error (HTTP {status}).",
  "comments.statusNetworkError": "Couldn't connect to the Figma API. Check your network connection.",
  "comments.filterAuthorAll": "All authors",
  "comments.filterStatusAll": "All statuses",
  "comments.filterStatusResolved": "Resolved",
  "comments.filterStatusUnresolved": "Unresolved",
  "comments.resultsEmpty": "No comments match the current filter.",
  "comments.badgeResolved": "Resolved",
  "comments.badgeUnresolved": "Unresolved",
  "comments.openInFigma": "Open this location in Figma",
  "comments.replyPrefix": "↳ Reply",
  "comments.tableAuthor": "Author",
  "comments.tableStatus": "Status",
  "comments.tableDate": "Date",
  "comments.tableMessage": "Message",

  "apiKey.label": "Gemini API key",
  "apiKey.help.aria": "How to get an API key",
  "apiKey.help.intro": "Get a free API key at",
  "apiKey.help.step1": "Sign in with a Google account.",
  "apiKey.help.step2": "Click <b>Create API key</b>.",
  "apiKey.help.step3": "Choose \"Create API key in new project\" (or an existing project).",
  "apiKey.help.step4": "Copy the key and paste it into the field next to it.",
  "apiKey.savedText": "✓ Saved",
  "apiKey.editBtn": "Edit",
  "apiKey.placeholder": "Paste your API key here...",
  "apiKey.saveBtn": "Save",
  "apiKey.savedToast": "API key saved.",

  "configTab.website": "Review Website",
  "configTab.webapp": "Review Web App",

  "selection.emptyReview": "Select 1 Frame to review",
  "selection.prefix": "Selected:",
  "selection.multiple": "{count} layers selected",

  "review.runWebsite": "Review Website",
  "review.runWebapp": "Review Web App",

  "rulesPanel.group.local": "General checks (no AI needed)",
  "rulesPanel.group.aiEn": "AI — Check English",
  "rulesPanel.group.aiVi": "AI — Check Vietnamese",
  "rulesPanel.group.designApp": "Design System (Web App)",
  "rulesPanel.aiMasterSwitch.title": "Toggle every AI rule in this section",
  "lang.en": "English",
  "lang.vi": "Vietnamese",

  "colorLibrary.title": "Color library",
  "colorLibrary.none": "None (use local styles/variables)",
  "colorLibrary.loading": "Loading colors from the library...",
  "colorLibrary.ready": "Loaded {count} colors from the library.",
  "colorLibrary.error": "Couldn't load the library: {error}",
  "colorLibrary.empty": "No libraries are enabled in this file.",
  "colorLibrary.hint": "Pick a library so color fixes match its actual tokens (only reads Color Variables, Paint Styles aren't supported yet).",

  "customRules.label": "Custom rules (one per line, applies to both languages, needs an API key)",
  "customRules.placeholder": "e.g. Don't use \"oke\", write \"OK\" instead\nProduct name \"Acme Cloud\" must use the exact same capitalization",
  "customRules.saveBtn": "Save custom rules",
  "customRules.savedToast": "Custom rules saved.",

  "ignorePatterns.label": "Ignore rules (one keyword per line — matches directly against layer names containing it, case-insensitive)",
  "ignorePatterns.placeholder": "e.g. Icon Swap",
  "ignorePatterns.saveBtn": "Save ignore rules",
  "ignorePatterns.savedToast": "Ignore rules saved.",

  "results.back": "← Back",
  "results.collapseAll": "▾ Collapse all",
  "results.expandAll": "▸ Expand all",
  "results.modeWebsite": "Review Website results",
  "results.modeWebapp": "Review Web App results",
  "results.issuesCount": "{count} issues",
  "results.emptyNone": "No issues found. 🎉",
  "results.emptyFiltered": "No issues in this group. 🎉",
  "results.fixBtn": "Fix",
  "results.fixArrow": "Fix → {label}",
  "results.deleteLabel": "(delete)",
  "results.moreActions": "More actions",
  "results.deleteLayer": "Delete layer",

  "filter.all": "All",
  "filter.content": "Spelling & language",
  "filter.textformat": "Spacing & punctuation",
  "filter.color": "Color",
  "filter.font": "Font",
  "filter.dimension": "Dimensions",
  "filter.gap": "Spacing",
  "filter.effect": "Effects",
  "filter.override": "Overridden components",

  "type.non_english": "Not English",
  "type.spelling": "Misspelling",
  "type.grammar": "Grammar",
  "type.spacing": "Spacing",
  "type.punctuation": "Punctuation",
  "type.nonsense": "Nonsensical",
  "type.proper_noun": "Proper noun",
  "type.case_inconsistency": "Inconsistent capitalization",
  "type.custom": "Custom rule",
  "type.design_font": "Wrong font",
  "type.design_font_size": "Wrong font size",
  "type.design_color": "Fill/Stroke not linked",
  "type.design_dimension": "Wrong dimension",
  "type.design_spacing": "Wrong gap",
  "type.design_effect": "Missing/wrong Drop Shadow",
  "type.design_override": "Overridden component",

  "status.checking": "Checking {count} layers...",
  "status.checkingAi": "Checking with AI: {done}/{total} layers...",
  "status.aiOffLang": "{lang} AI check is off — only running local spacing/punctuation/number-format checks.",
  "status.noApiKey": "No API key entered — only running local spacing/punctuation/number-format checks.",
  "status.aiUnknownError": "Unknown error calling the AI.",
  "status.foundIssues": "Found {count} issues.",
  "status.noIssues": "No issues found.",
  "status.scanning": "Scanning selection...",
  "status.genericError": "Unknown error while checking.",

  "compare.pickerEmpty": "Select 2 Frames to compare",
  "compare.selectedNames": "{a} ↔ {b}",
  "compare.runBtn": "Compare",
  "compare.running": "Comparing...",
  "compare.noDiff": "No differences between \"{a}\" and \"{b}\". 🎉",
  "compare.foundDiff": "Found {count} differences between \"{a}\" and \"{b}\".",
  "compare.missingLayer": "— no matching layer —",
  "compare.emptyText": "(empty)",
  "compare.useThis": "Use this text →",

  "langSwitcher.title": "Interface language",

  "rule.spacingDoubleSpace.label": "Repeated spaces",
  "rule.spacingDoubleSpace.description": "Two or more spaces in a row.",
  "rule.spacingSplitKnownTerm.label": "Familiar control name split by spaces",
  "rule.spacingSplitKnownTerm.description":
    "Extra spaces inserted between the letters of a familiar control name (Button, Textbox, Checkbox, Dropdown...), e.g. \"Textb      ox\" is really \"Textbox\" — suggests removing all the extra spaces to rejoin it correctly, no AI needed.",
  "rule.spacingEdge.label": "Leading whitespace",
  "rule.spacingEdge.description": "Extra space at the start of the text. (Trailing whitespace is NOT checked — not important.)",
  "rule.spacingBeforePunct.label": "Space before punctuation",
  "rule.spacingBeforePunct.description": "There's a space right before , . ; : ! ?",
  "rule.spacingAfterPunct.label": "Missing space after punctuation",
  "rule.spacingAfterPunct.description": "No space right after , ; : ! ?",
  "rule.punctRepeated.label": "Repeated punctuation",
  "rule.punctRepeated.description": "A punctuation mark typed more than once in a row, e.g. !! or ,,",
  "rule.numberThousandSeparator.label": "Number formatting per the Design System",
  "rule.numberThousandSeparator.description":
    "Numbers must use the standard thousands separator (default is a period: 1.200.000), not a comma (1,200,000).",
  "rule.numberThousandSeparator.editableLabel": "Standard separator character",
  "rule.textCaseConsistency.label": "Same phrase capitalized inconsistently",
  "rule.textCaseConsistency.description":
    "The same phrase (2+ words) appears on multiple layers in the selection with different capitalization, e.g. \"iGOV Kế toán\" / \"IGOV Kế toán\" / \"iGOV kế toán\". If the variants only differ by their very first letter (normal title/sentence-start capitalization, e.g. \"Kế toán\" vs \"kế toán\"), it's skipped; only flags when some variant shows unusual capitalization (a non-first letter also capitalized, or a special pattern like \"iGOV\") proving it's a fixed proper noun/brand name. Doesn't auto-pick a standard casing — Fix shows the other existing variants for you to choose from.",
  "rule.aiNonEnglish.label": "Non-English word/phrase",
  "rule.aiNonEnglish.description": "Detects words from another language mixed into English text.",
  "rule.aiSpellingEn.label": "English misspelling",
  "rule.aiSpellingEn.description": "An English word typed with a spelling mistake.",
  "rule.aiGrammarEn.label": "English grammar mistake",
  "rule.aiGrammarEn.description":
    "A clear English grammar mistake. OFF by default — this plugin focuses on spelling errors (wrong words, extra/missing punctuation, spacing), not a wording/style-improvement tool; turn it back on if you really want the AI to flag grammar too.",
  "rule.aiNonsenseVi.label": "Nonsensical / misspelled Vietnamese",
  "rule.aiNonsenseVi.description": "A nonsensical word or phrase, wrong tone marks, or a clear Vietnamese spelling mistake.",
  "rule.aiProperNounVi.label": "Uncapitalized proper noun",
  "rule.aiProperNounVi.description":
    "A person's name, place, brand... not capitalized at all. OFF by default — often misfires on internal brand/product names with unusual capitalization (mixed-case letters that don't follow normal rules) that the AI can't tell are deliberate proper nouns; turn it back on if your content doesn't have names like these.",
  "rule.aiGrammarVi.label": "Vietnamese grammar / wrong word choice",
  "rule.aiGrammarVi.description":
    "A clear grammar mistake or a word that's obviously wrong for the context. OFF by default — this plugin focuses on spelling errors (wrong words, extra/missing punctuation, spacing, nonsensical text), not a wording/style-improvement tool; turn it back on if you really want the AI to flag grammar too.",
  "rule.designFontFamily.label": "Font doesn't match the standard",
  "rule.designFontFamily.description": "A text layer uses a different font than the Design System standard.",
  "rule.designFontFamily.editableLabel": "Standard font",
  "rule.designFontSize.label": "Font size off the standard scale",
  "rule.designFontSize.description": "Font size isn't on the standard scale (default 20/16/13/12: h2/h3/Body/Body Small).",
  "rule.designFontSize.editableLabel": "Font size scale (px, comma-separated)",
  "rule.designTextColor.label": "Fill (text color) not linked to a token",
  "rule.designTextColor.description":
    "A text layer's fill is a raw color, not linked to any Paint Style or Variable in the library. If the field below has hex values entered, a raw color exactly matching one of them also counts as compliant (even though unlinked). Report-only, no Fix — grays are too hard to tell apart exactly by eye/hex, so the user links the right token manually.",
  "rule.designTextColor.editableLabel": "Allowed colors (hex, comma-separated — leave blank to just require linking)",
  "rule.designBorderColor.label": "Stroke (border color) not linked to a token",
  "rule.designBorderColor.description":
    "The stroke is a raw color, not linked to any Paint Style or Variable in the library (applies to both borders and icons). If the field below has hex values entered, a raw color exactly matching one of them also counts as compliant. Click Fix to auto-link if the file already has a matching Style/Variable.",
  "rule.designBorderColor.editableLabel": "Allowed colors (hex, comma-separated — leave blank to just require linking)",
  "rule.designControlHeight.label": "Control height off standard",
  "rule.designControlHeight.description":
    "A layer named like an input control (button, textbox, combobox, searchbox...) but with a non-standard height. Skips plain icons (name contains \"icon\", except Button Icon/Icon Button), checkbox/radio/switch/tag (their own sizing), and Dropdown Menu (a floating list/menu, a different kind of component from the input combobox control).",
  "rule.designControlHeight.editableLabel": "Standard control height (px)",
  "rule.designControlRadius.label": "Corner radius off standard",
  "rule.designControlRadius.description":
    "Corner radius doesn't match the standard (default 8px for normal controls, 12px for card/modal/popup). Skips layers with neither Fill nor Stroke — nothing there for a radius to show on.",
  "rule.designControlRadius.editableLabel": "Standard radius (normal, large — px)",
  "rule.designControlSpacing.label": "Gap isn't a multiple of the standard unit",
  "rule.designControlSpacing.description":
    "Gap (spacing between items) in an auto layout must be a multiple of the standard unit. Skips frames with only 1 child — Gap is meaningless when there's nothing to space out.",
  "rule.designControlSpacing.editableLabel": "Gap must be a multiple of (px)",
  "rule.designButtonRowGap.label": "Gap between horizontal buttons off standard",
  "rule.designButtonRowGap.description":
    "A Horizontal auto layout where every child is a button (name contains \"button\") must have exactly the standard Gap — its own rule, takes priority over the general multiple-of scale.",
  "rule.designButtonRowGap.editableLabel": "Standard gap between horizontal buttons (px)",
  "rule.designCardShadow.label": "White 8px-radius card missing/wrong Drop Shadow",
  "rule.designCardShadow.description":
    "A white-fill (#FFFFFF) box/card with an 8px radius — usually sitting on the gray BG Page background — must have the standard Drop Shadow effect style attached. Only applies to a frame/rectangle sitting directly on the page, not to any layer inside a component/instance (button, textbox...) — even a white 8px-radius rectangle nested inside another component.",
  "rule.designCardShadow.editableLabel": "Standard Drop Shadow effect style name",
  "rule.designInstanceOverride.label": "Component overridden away from its original",
  "rule.designInstanceOverride.description":
    "An instance pulled from the library has a layer inside it with one of 4 property groups overridden — Padding, Corner radius, Stroke (color/weight), or Fill (color) — differing from the main component, a sign someone tweaked it by hand, drifting from the Design System. The finding shows the original value on the component and the changed value on the instance (as \"before → after\"), not just the property name. Runs entirely locally (no AI); Figma sometimes keeps the \"overridden\" flag set even after a value was changed and then changed back to match the original, so this only reports a field once the actual values are re-checked and confirmed to differ — it doesn't trust that flag alone. Content, position, size, font, and effect overrides don't count — those are routine customization or outside this rule's scope. Report-only, no Fix — resetting overrides would also wipe out the legitimate customization (text, size).",

  // ---- code.ts (main thread) notifications/errors ----
  "code.selectAtLeastOneLayer": "Please select at least one layer to check.",
  "code.noTextLayerFound": "No text layers found in the selection.",
  "code.tooManyLayers": "The selection has a lot of layers, only scanning the first {max}.",
  "code.compareNeedExactly2": "Select exactly 2 frames to compare ({count} currently selected).",
  "code.layerNoLongerExists": "This layer no longer exists.",
  "code.layerNotFound": "Layer not found.",
  "code.originalContentChanged": "The original content has changed, can't apply the suggestion.",
  "code.fixAppliedButNoChange":
    "The fix API call succeeded but the layer's content didn't change as expected — it may be locked or a special text override.",
  "code.fixApplied": "Fixed.",
  "code.layerDeleted": "Layer deleted.",
  "code.unknownError": "Unknown error.",
  "code.noFill": "This layer has no Fill.",
  "code.noStroke": "This layer has no Stroke.",
  "code.noStyleOrVariableFound":
    "Couldn't find a Style or Variable with color #{hex} in this file to link — not applied, needs linking manually.",
  "code.noVariableFound": "Couldn't find the Variable to link.",
  "code.noMatchingColorOnLayer": "Couldn't find a matching color on this layer to link the Variable to.",
  "code.notText": "This layer isn't text.",
  "code.cannotResize": "This layer doesn't support resizing.",
  "code.cannotRadius": "This layer doesn't support corner radius.",
  "code.notAutoLayout": "This layer isn't an auto layout.",
  "code.noEffectStyleSupport": "This layer doesn't support effect styles.",
  "code.effectStyleNotFound": "Couldn't find the effect style \"{name}\" in this file.",
  "code.apiKeySaved": "API key saved.",
  "code.figmaTokenSaved": "Figma Personal Access Token saved.",
  "code.customRulesSaved": "Custom rules saved.",
  "code.ignorePatternsSaved": "Ignore rules saved.",

  // ---- Design System check messages (designChecks.ts) ----
  "designCheck.fontMismatch": "Font \"{font}\" isn't {expected} per the Design System.",
  "designCheck.fontSizeOffScale": "Font size {size}px isn't on the standard scale ({allowed}).",
  "designCheck.fillRawColor":
    "Fill #{hex} is a raw color, not linked to any Style/Variable from the library — needs linking manually.",
  "designCheck.strokeRawColor":
    "Stroke #{hex} is a raw color, not linked to any Style/Variable from the library — click Fix to auto-link if the file already has a matching color.",
  "designCheck.heightMismatch": "Layer \"{name}\" looks like a control but is {height}px tall instead of {expected}px.",
  "designCheck.radiusValueLabel": "{value}px radius",
  "designCheck.radiusMismatch": "Layer \"{name}\" should have a {expected}px radius per the Design System, currently {current}px.",
  "designCheck.buttonRowGapMismatch":
    "A horizontal row of buttons must have a {expected}px Gap per the standard, currently {current}px.",
  "designCheck.instanceGapOverride": "The {current}px Gap in \"{name}\" differs from the library's original component.",
  "designCheck.gapNotMultiple": "Gap {current}px must be a multiple of {unit}px — pick the nearest value below.",
  "designCheck.noDropShadowLabel": "No Drop Shadow",
  "designCheck.missingDropShadow": "Box \"{name}\" is a white 8px-radius box but has no \"{expected}\" effect style attached.",
  "designCheck.wrongDropShadow": "Box \"{name}\" uses effect \"{current}\" instead of \"{expected}\".",
  "designCheck.instanceOverride": "Instance \"{name}\" has a property overridden away from the main component — {details}.",

  "overrideField.fills": "Fill",
  "overrideField.strokes": "Stroke",
  "overrideField.strokeWeight": "Stroke weight",
  "overrideField.cornerRadius": "Corner radius",
  "overrideField.topLeftRadius": "Top-left radius",
  "overrideField.topRightRadius": "Top-right radius",
  "overrideField.bottomLeftRadius": "Bottom-left radius",
  "overrideField.bottomRightRadius": "Bottom-right radius",
  "overrideField.paddingLeft": "Left padding",
  "overrideField.paddingTop": "Top padding",
  "overrideField.paddingRight": "Right padding",
  "overrideField.paddingBottom": "Bottom padding",

  // ---- Local check messages (localChecks.ts) ----
  "localCheck.splitKnownTerm": "\"{original}\" has extra whitespace inserted inside a word — you may have meant \"{suggestion}\".",
  "localCheck.doubleSpace": "Extra whitespace ({count} spaces in a row).",
  "localCheck.leadingSpace": "Extra whitespace at the start of the text.",
  "localCheck.spaceBeforePunct": "Extra whitespace before punctuation.",
  "localCheck.missingSpaceAfterPunct": "Missing whitespace after punctuation.",
  "localCheck.repeatedPunctSimple": "\"{char}\" typed {count} times in a row ({run}) — only needs one.",
  "localCheck.repeatedDots2":
    "Only 2 dots in a row ({run}) — if you meant the \"...\" ellipsis it's missing one, otherwise it's one too many.",
  "localCheck.repeatedDotsMany":
    "{count} dots in a row ({run}), more than the standard \"...\" ellipsis — {extra} too many.",
  "localCheck.thousandSeparator":
    "Numbers must use \"{separator}\" as the thousands separator per the Design System, not a comma.",
  "localCheck.caseInconsistent":
    "\"{text}\" is capitalized differently from another casing already used in the selection ({variants}) — pick a standard casing below to sync.",

  // ---- Gemini API errors (gemini.ts) ----
  "gemini.networkError": "Couldn't connect to the Gemini API. Check your network connection.",
  "gemini.invalidApiKey": "The API key is invalid or doesn't have access.",
  "gemini.rateLimited": "You've hit the free API rate limit. Please try again in a few minutes.",
  "gemini.httpError": "The Gemini API returned an error (HTTP {status}).",
  "gemini.noContent": "The Gemini API didn't return any valid content.",
  "gemini.badJson": "Couldn't parse the JSON result from the Gemini API.",
};

const DICTS: Record<Locale, Dict> = { vi: VI, en: EN };

/**
 * Looks up `key` in the current locale's dictionary (falling back to
 * Vietnamese, then to the raw key, so a missing translation never crashes
 * or silently shows blank). `{name}`-style placeholders in the string are
 * replaced from `vars`.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const template = DICTS[currentLocale][key] ?? VI[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}
