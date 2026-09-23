import type {
  AutoLayoutSpec,
  ComponentPropertyInfo,
  ComponentRegistryItem,
  DesignRules,
  HtmlNode,
  LeafDecision,
  LeafElement,
  LibraryProfile,
  PaintStyleRegistryItem,
  ProviderProfile,
  StoredState,
  TextStyleRegistryItem,
  UIPlan,
  UIPlanNode
} from "./types";
import { callProvider, compareScreens, listModels, type ImageInput } from "./providers";
import { buildHtmlWireframePrompt, buildImageDescriptionPrompt, buildLeafMappingSystemPrompt, buildUserPrompt } from "./prompt";
import { countPlanNodes } from "./validate";
import { renderUIPlan, upgradeNodesInFrame } from "./render";
import { buildGeminiLeafDecisionsSchema, buildLeafDecisionsJsonSchema } from "./schema";

const STORAGE_KEY = "promptpixel-state-v1";
const LEGACY_STORAGE_KEY = "khuon-state-v1";
const API_KEYS_STORAGE_KEY = "promptpixel-api-keys-v1";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const defaultRules: DesignRules = {
  version: 2,
  general: [
    "- Spacing theo bội số 4 (4, 8, 12, 16, 24, 32...)",
    "- Dùng đúng Color Style và Text Style đã nạp, không tự chọn màu/font ngoài danh sách",
    "- Luôn dùng Button/Primary cho hành động chính (CTA), Button/Secondary cho hành động phụ",
    "- Padding hai bên màn hình tối thiểu 24px"
  ].join("\n"),
  overview: [
    "- Bố cục dạng lưới thẻ (card) thống kê ở trên cùng",
    "- Có bộ lọc theo thời gian (hôm nay/tuần/tháng) ở góc phải trên",
    "- Biểu đồ hoặc bảng tóm tắt đặt ngay dưới các thẻ số liệu"
  ].join("\n"),
  list: [
    "- Có ô tìm kiếm và bộ lọc phía trên bảng/danh sách",
    "- Danh sách có phân trang hoặc load thêm ở cuối",
    "- Nút \"Thêm mới\" đặt cố định ở góc phải trên cùng",
    "- Mỗi dòng có hành động nhanh (sửa/xóa) ở cuối dòng"
  ].join("\n"),
  detail: [
    "- Chia 2 cột: thông tin chính bên trái, thông tin phụ/hành động bên phải",
    "- Nút Lưu / Hủy đặt cố định ở cuối màn hình",
    "- Trường bắt buộc có dấu * hoặc ghi chú rõ ràng"
  ].join("\n")
};

const defaultState: StoredState = {
  providerProfiles: [],
  libraries: [],
  enabledLibraryIds: [],
  components: [],
  rules: defaultRules,
  screenSize: { width: 1366, height: 768 },
  textStyles: [],
  paintStyles: []
};

figma.showUI(__html__, {
  width: 420,
  height: 680,
  themeColors: true
});

function migrateRules(rules: unknown): DesignRules {
  if (!rules || typeof rules !== "object") return defaultRules;
  const legacy = rules as { version?: number; markdown?: string };
  if (legacy.version === 2) {
    const sections = rules as Partial<DesignRules>;
    return {
      version: 2,
      general: sections.general ?? "",
      overview: sections.overview ?? "",
      list: sections.list ?? "",
      detail: sections.detail ?? ""
    };
  }
  // legacy version 1 shape: { version: 1, markdown: string } — fold into "general"
  return { ...defaultRules, general: legacy.markdown ?? "" };
}

async function loadState(): Promise<StoredState> {
  const stored = ((await figma.clientStorage.getAsync(STORAGE_KEY)) ??
    (await figma.clientStorage.getAsync(LEGACY_STORAGE_KEY))) as
    | Partial<StoredState>
    | undefined;
  return stored
    ? {
        ...defaultState,
        ...stored,
        providerProfiles: stored.providerProfiles ?? [],
        libraries: stored.libraries ?? [],
        enabledLibraryIds: stored.enabledLibraryIds ?? [],
        components: stored.components ?? [],
        rules: migrateRules(stored.rules),
        screenSize: stored.screenSize ?? defaultState.screenSize,
        textStyles: stored.textStyles ?? [],
        paintStyles: stored.paintStyles ?? []
      }
    : defaultState;
}

async function saveState(state: StoredState): Promise<void> {
  await figma.clientStorage.setAsync(STORAGE_KEY, state);
}

async function loadApiKeys(): Promise<Record<string, string>> {
  return (await figma.clientStorage.getAsync(API_KEYS_STORAGE_KEY)) ?? {};
}

async function saveApiKeys(apiKeys: Record<string, string>): Promise<void> {
  await figma.clientStorage.setAsync(API_KEYS_STORAGE_KEY, apiKeys);
}

async function publishState(): Promise<void> {
  const apiKeys = await loadApiKeys();
  figma.ui.postMessage({
    type: "STATE_CHANGED",
    state: await loadState(),
    savedApiKeyIds: Object.keys(apiKeys).filter((id) => Boolean(apiKeys[id]))
  });
}

function notifyError(message: string): void {
  figma.notify(message, { error: true });
  figma.ui.postMessage({ type: "ERROR", message });
}

function toSemanticId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

function isPrivateComponentName(name: string): boolean {
  const segments = name.split("/");
  const leaf = segments[segments.length - 1]?.trim() ?? "";
  return leaf.startsWith("_");
}

const COMPONENT_DESCRIPTION_HINTS: Record<string, string> = {
  button: "Các nút hành động chính, phụ, submit, nút lưu, hủy trên form và các thao tác khác.",
  input: "Ô nhập liệu văn bản, dùng trong form để người dùng nhập thông tin (tên, email, số điện thoại...).",
  textfield: "Ô nhập liệu văn bản, dùng trong form để người dùng nhập thông tin.",
  textbox: "Ô nhập liệu văn bản, dùng trong form để người dùng nhập thông tin.",
  checkbox: "Ô chọn nhiều lựa chọn, dùng khi cho phép chọn 1 hoặc nhiều mục cùng lúc.",
  radio: "Nút chọn 1 trong nhiều lựa chọn loại trừ nhau.",
  switch: "Công tắc bật/tắt 1 trạng thái (VD: bật thông báo, chế độ tối).",
  toggle: "Công tắc bật/tắt 1 trạng thái.",
  dropdown: "Danh sách chọn xổ xuống, dùng khi cần chọn 1 giá trị từ nhiều lựa chọn.",
  select: "Danh sách chọn xổ xuống, dùng khi cần chọn 1 giá trị từ nhiều lựa chọn.",
  combobox: "Danh sách chọn xổ xuống kèm tìm kiếm, dùng khi cần chọn 1 giá trị từ nhiều lựa chọn.",
  card: "Khối hiển thị thông tin dạng thẻ, thường dùng cho danh sách hoặc dashboard.",
  sidebar: "Thanh điều hướng dọc, chứa menu chính của ứng dụng.",
  header: "Thanh trên cùng màn hình, chứa tiêu đề, logo, hoặc hành động chính.",
  navbar: "Thanh điều hướng chính của ứng dụng.",
  tab: "Chuyển đổi giữa các nhóm nội dung trong cùng 1 màn hình.",
  modal: "Hộp thoại nổi lên trên, dùng để xác nhận hành động hoặc hiển thị form nhanh.",
  dialog: "Hộp thoại nổi lên trên, dùng để xác nhận hành động hoặc hiển thị form nhanh.",
  avatar: "Ảnh đại diện người dùng.",
  badge: "Nhãn nhỏ hiển thị số lượng hoặc trạng thái (VD: số thông báo chưa đọc).",
  tooltip: "Chú thích nhỏ hiện khi di chuột qua 1 phần tử.",
  table: "Bảng dữ liệu dạng hàng/cột, dùng cho danh sách chi tiết.",
  pagination: "Điều hướng phân trang cho danh sách dài.",
  tag: "Nhãn nhỏ hiển thị 1 giá trị hoặc bộ lọc đang chọn.",
  chip: "Nhãn nhỏ hiển thị 1 giá trị hoặc bộ lọc đang chọn.",
  breadcrumb: "Đường dẫn điều hướng thể hiện vị trí hiện tại trong cấu trúc trang.",
  accordion: "Khối nội dung có thể mở/thu gọn.",
  alert: "Thông báo nổi bật (thành công, lỗi, cảnh báo) hiển thị cho người dùng.",
  banner: "Thông báo nổi bật hiển thị cho người dùng.",
  progress: "Thanh hoặc vòng thể hiện tiến trình hoàn thành.",
  divider: "Đường kẻ phân cách các khối nội dung.",
  search: "Ô tìm kiếm."
};

function humanizeComponentName(name: string): { description: string; words: string[] } {
  const words: string[] = [];
  for (const segment of name.split("/")) {
    const spaced = segment
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_\-.]+/g, " ")
      .trim();
    for (const word of spaced.split(/\s+/)) {
      if (word) words.push(word);
    }
  }
  return { description: words.join(" "), words };
}

function suggestComponentDescription(name: string): string {
  const { description, words } = humanizeComponentName(name);
  for (const word of words) {
    const hint = COMPONENT_DESCRIPTION_HINTS[word.toLowerCase()];
    if (hint) return hint;
  }
  return description;
}

function extractComponentProperties(
  node: ComponentNode | ComponentSetNode
): ComponentPropertyInfo[] {
  const seen = new Map<string, ComponentPropertyInfo>();
  for (const [rawName, definition] of Object.entries(node.componentPropertyDefinitions)) {
    // SLOT properties (child-swap) have no render-time support (applyProperties only
    // handles BOOLEAN/TEXT/VARIANT/INSTANCE_SWAP) — leave them out of the catalog so the
    // AI never tries to set one.
    if (definition.type === "SLOT") continue;
    const name = rawName.split("#")[0];
    if (seen.has(name)) continue;
    seen.set(name, {
      name,
      type: definition.type,
      variantOptions: definition.type === "VARIANT" ? definition.variantOptions : undefined
    });
  }
  return [...seen.values()];
}

async function scanCurrentFileAsLibrary(libraryId: string): Promise<void> {
  const state = await loadState();
  const library = state.libraries.find((item) => item.id === libraryId);
  if (!library) {
    notifyError("Library Profile được chọn không còn tồn tại.");
    return;
  }

  await figma.loadAllPagesAsync();

  const candidates: Array<{ node: ComponentNode | ComponentSetNode; pageName: string }> = [];
  for (const page of figma.root.children) {
    const found = page
      .findAllWithCriteria({ types: ["COMPONENT", "COMPONENT_SET"] })
      .filter(
        (node) =>
          node.type === "COMPONENT_SET" ||
          (node.type === "COMPONENT" && node.parent?.type !== "COMPONENT_SET")
      )
      .filter((node) => !isPrivateComponentName(node.name));
    for (const node of found) candidates.push({ node, pageName: page.name });
  }

  const published: Array<{ node: ComponentNode | ComponentSetNode; pageName: string }> = [];
  for (const candidate of candidates) {
    const status = await candidate.node.getPublishStatusAsync();
    if (status !== "UNPUBLISHED" && candidate.node.key) published.push(candidate);
  }

  const localTextStyles = await figma.getLocalTextStylesAsync();
  const publishedTextStyles: TextStyle[] = [];
  for (const style of localTextStyles) {
    const status = await style.getPublishStatusAsync();
    if (status !== "UNPUBLISHED" && style.key) publishedTextStyles.push(style);
  }

  const localPaintStyles = await figma.getLocalPaintStylesAsync();
  const publishedPaintStyles: PaintStyle[] = [];
  for (const style of localPaintStyles) {
    const status = await style.getPublishStatusAsync();
    if (status !== "UNPUBLISHED" && style.key) publishedPaintStyles.push(style);
  }

  if (!published.length && !publishedTextStyles.length && !publishedPaintStyles.length) {
    notifyError(
      "Không tìm thấy component, text style, hoặc color style đã publish trong file đang mở. Hãy mở đúng file library rồi thử lại."
    );
    return;
  }

  const scannedComponents: ComponentRegistryItem[] = published.map(({ node, pageName }) => {
    const existing = state.components.find(
      (component) => component.componentKey === node.key
    );
    const autoDescription = suggestComponentDescription(node.name);
    const existingDescription = existing?.aiDescription?.trim();
    return {
      id: existing?.id ?? `${node.type.toLowerCase()}-${node.key}`,
      libraryId,
      name: node.name,
      semanticId: existing?.semanticId ?? toSemanticId(node.name),
      aiDescription: existingDescription || node.description?.trim() || autoDescription,
      componentKey: node.key,
      nodeType: node.type,
      pageName,
      properties: extractComponentProperties(node)
    };
  });

  const scannedKeys = new Set(scannedComponents.map((item) => item.componentKey));
  state.components = [
    ...state.components.filter(
      (item) => item.libraryId !== libraryId && !scannedKeys.has(item.componentKey)
    ),
    ...scannedComponents
  ];

  const scannedTextStyles: TextStyleRegistryItem[] = publishedTextStyles.map((style) => {
    const existing = state.textStyles.find((item) => item.styleKey === style.key);
    return {
      id: existing?.id ?? `textstyle-${style.key}`,
      libraryId,
      name: style.name,
      styleKey: style.key
    };
  });

  const scannedStyleKeys = new Set(scannedTextStyles.map((item) => item.styleKey));
  state.textStyles = [
    ...state.textStyles.filter(
      (item) => item.libraryId !== libraryId && !scannedStyleKeys.has(item.styleKey)
    ),
    ...scannedTextStyles
  ];

  const scannedPaintStyles: PaintStyleRegistryItem[] = publishedPaintStyles.map((style) => {
    const existing = state.paintStyles.find((item) => item.styleKey === style.key);
    const solidPaint = style.paints[0];
    return {
      id: existing?.id ?? `paintstyle-${style.key}`,
      libraryId,
      name: style.name,
      styleKey: style.key,
      color: solidPaint?.type === "SOLID" ? { ...solidPaint.color } : undefined
    };
  });

  const scannedPaintKeys = new Set(scannedPaintStyles.map((item) => item.styleKey));
  state.paintStyles = [
    ...state.paintStyles.filter(
      (item) => item.libraryId !== libraryId && !scannedPaintKeys.has(item.styleKey)
    ),
    ...scannedPaintStyles
  ];

  await saveState(state);
  await publishState();
  figma.notify(
    `Đã quét ${scannedComponents.length} component, ${scannedTextStyles.length} text style, ${scannedPaintStyles.length} color style vào “${library.name}”.`
  );
}

async function discoverEnabledLibraries(): Promise<void> {
  const collections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

  if (!collections.length) {
    notifyError(
      "File này chưa add thư viện nào. Vui lòng add thư viện (Assets → Team library) để khi thiết kế có thể lấy component ra vẽ."
    );
    return;
  }

  const grouped = new Map<string, string[]>();
  for (const collection of collections) {
    const keys = grouped.get(collection.libraryName) ?? [];
    keys.push(collection.key);
    grouped.set(collection.libraryName, keys);
  }

  const state = await loadState();
  const discovered: LibraryProfile[] = [...grouped].map(([name, keys]) => {
    const id = `library-enabled-${toSemanticId(name) || "default"}`;
    const existing = state.libraries.find((library) => library.id === id);
    return {
      id,
      name,
      description: existing?.description ?? "",
      variableCollectionKeys: keys
    };
  });
  const discoveredIds = new Set(discovered.map((library) => library.id));

  state.libraries = [
    ...state.libraries.filter((library) => !discoveredIds.has(library.id)),
    ...discovered
  ];
  state.enabledLibraryIds = [
    ...new Set([
      ...discovered.map((library) => library.id),
      ...state.enabledLibraryIds
    ])
  ];

  await saveState(state);
  await publishState();
  figma.notify(`Đã tải ${discovered.length} library đang bật trong file.`);
}

async function addSelectedComponent(requestedLibraryId?: string): Promise<void> {
  const selected = figma.currentPage.selection;
  if (selected.length !== 1) {
    notifyError("Chọn đúng một main component hoặc component set.");
    return;
  }

  const node = selected[0];
  if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
    notifyError("Selection phải là main component hoặc component set.");
    return;
  }

  if (!node.key) {
    notifyError("Component chưa có key. Hãy publish component vào library trước.");
    return;
  }

  const state = await loadState();
  const libraryId = requestedLibraryId ?? state.enabledLibraryIds[0];
  if (!libraryId) {
    notifyError("Hãy tạo và bật ít nhất một Library Profile trước.");
    return;
  }
  if (!state.libraries.some((library) => library.id === libraryId)) {
    notifyError("Library Profile được chọn không còn tồn tại.");
    return;
  }
  const existing = state.components.find((item) => item.componentKey === node.key);

  const item: ComponentRegistryItem = {
    id: existing?.id ?? `${node.type.toLowerCase()}-${Date.now()}`,
    libraryId: existing?.libraryId ?? libraryId,
    name: node.name,
    semanticId: existing?.semanticId ?? toSemanticId(node.name),
    aiDescription: existing?.aiDescription ?? "",
    componentKey: node.key,
    nodeType: node.type
  };

  state.components = existing
    ? state.components.map((component) =>
        component.componentKey === node.key ? item : component
      )
    : [...state.components, item];

  await saveState(state);
  await publishState();
  figma.notify(`Đã thêm “${node.name}” vào PromptPixel.`);
}

let isGenerating = false;

async function exportSelectionAsImage(): Promise<ImageInput | undefined> {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1) {
    notifyError("Chọn đúng một frame/section trên canvas để dùng làm ảnh mẫu.");
    return undefined;
  }
  const node = selection[0];
  if (!("exportAsync" in node)) {
    notifyError("Lựa chọn hiện tại không thể export thành ảnh.");
    return undefined;
  }
  try {
    const bytes = await (node as SceneNode & ExportMixin).exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: 2 }
    });
    return { base64: figma.base64Encode(bytes), mimeType: "image/png" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    notifyError(`Không thể export ảnh từ lựa chọn: ${message}`);
    return undefined;
  }
}

async function generateUI(userRequest: string, useSelectionImage: boolean): Promise<void> {
  const trimmed = userRequest.trim();
  if (!trimmed && !useSelectionImage) {
    notifyError("Nhập mô tả màn hình hoặc chọn dùng ảnh từ canvas trước khi generate.");
    return;
  }
  if (isGenerating) return;
  isGenerating = true;

  try {
    await generateUIInner(trimmed, useSelectionImage);
  } finally {
    isGenerating = false;
  }
}

async function generateUIInner(trimmed: string, useSelectionImage: boolean): Promise<void> {
  const state = await loadState();
  const profile = state.providerProfiles.find((item) => item.id === state.activeProviderId);
  if (!profile) {
    notifyError("Chọn và lưu một AI provider trước.");
    return;
  }
  const apiKeys = await loadApiKeys();
  const apiKey = apiKeys[profile.id];
  if (!apiKey) {
    notifyError("Provider chưa có API key. Vào tab AI để lưu key.");
    return;
  }
  const enabledLibraries = state.libraries.filter((library) =>
    state.enabledLibraryIds.includes(library.id)
  );
  const enabledComponents = state.components.filter((component) =>
    state.enabledLibraryIds.includes(component.libraryId)
  );
  if (!enabledComponents.length) {
    notifyError("Chưa có component nào trong các library đang bật.");
    return;
  }
  const enabledTextStyles = state.textStyles.filter((style) =>
    state.enabledLibraryIds.includes(style.libraryId)
  );
  const enabledPaintStyles = state.paintStyles.filter((style) =>
    state.enabledLibraryIds.includes(style.libraryId)
  );
  // A library scanned before this session added color-distance matching has no captured RGB for
  // any of its Color Styles yet — matchNearestPaintStyle then never finds anything to match
  // against, so every fill/border falls back to the wireframe's own literal CSS color (still
  // shows up, just not tied to a real design-system style). Surfaced explicitly so this doesn't
  // need another diagnosis round-trip.
  const needsPaintStyleRescan = enabledPaintStyles.length > 0 && !enabledPaintStyles.some((style) => style.color);
  const paintStyleRescanWarning =
    'Chưa có Color Style nào có sẵn màu RGB thật (cần nạp lại thư viện) — màu nền/viền trong bản vẽ này đang lấy trực tiếp từ CSS thay vì đúng Color Style thật. Vào tab Libraries, bấm "Nạp lại component, text style & color style" rồi generate lại để dùng đúng Color Style.';

  let image: ImageInput | undefined;
  if (useSelectionImage) {
    image = await exportSelectionAsImage();
    if (!image) return;
  }

  figma.ui.postMessage({ type: "GENERATE_STARTED" });
  try {
    // Step 0 (image only): extract one literal, exhaustive text description up front, so step 1
    // (below) works from a checklist instead of relying on it to catch everything in one pass.
    let describedChecklist = "";
    if (image) {
      try {
        const imageDescription = await callProvider(
          profile,
          apiKey,
          buildImageDescriptionPrompt(),
          "Mô tả chi tiết ảnh đính kèm theo cấu trúc trên.",
          image
        );
        describedChecklist = `\n\nMô tả chi tiết đã trích xuất sẵn từ ảnh gốc (dùng làm checklist, đảm bảo không bỏ sót vùng/nội dung nào):\n${imageDescription}`;
      } catch {
        // best-effort — later steps just read the image directly
      }
    }

    // Step 1: sketch a complete HTML/CSS wireframe of the whole screen — a format the model is
    // far more fluent and thorough in than our bespoke JSON schema, so structure/content
    // decisions happen here unconstrained by the component catalog, instead of collapsing into
    // a sparse result the way asking for catalog-grounded JSON directly reliably did.
    const htmlWireframe = await requestHtmlWireframe(profile, apiKey, trimmed, image, describedChecklist, state);
    // Surface the intermediate HTML immediately, before step 2 even starts, so it's inspectable
    // on its own — lets you tell whether a bad result came from step 1 (the wireframe itself was
    // already wrong/thin) or step 2 (the wireframe was fine but the JSON conversion dropped it).
    figma.ui.postMessage({ type: "GENERATE_HTML_WIREFRAME", html: htmlWireframe });

    // Step 2: parse the wireframe's actual HTML structure DETERMINISTICALLY (via the UI iframe's
    // real DOMParser — see parseHtmlWireframe) and build the UIPlan tree directly from it, so the
    // tree structure is guaranteed to match the wireframe already shown above, instead of relying
    // on an AI call to reproduce it faithfully as JSON (which is what kept silently dropping
    // content or invalid componentIds and rendering blank).
    const { nodes: htmlNodes, rootBackgroundColor } = await parseHtmlWireframe(htmlWireframe, state.screenSize);
    const leaves: LeafElement[] = [];
    const leafPlaceholders = new Map<string, UIPlanNode>();
    // Fill/border colors are resolved synchronously right here (see matchNearestPaintStyle) —
    // no AI call needed for them at all, unlike component matching.
    const planNodes = buildPlanFromHtmlNodes(htmlNodes, [], "n", leaves, leafPlaceholders, enabledPaintStyles);

    // The wireframe's own `body { background: ... }` (its whole-screen background — see
    // ParsedWireframe) resolves onto the root screen frame's own fill the same deterministic way
    // as any other container's.
    const rootColor = normalizeCssColor(rootBackgroundColor);
    const rootFill = matchNearestPaintStyle(rootColor, enabledPaintStyles);
    const rootFillRgb = rootFill ? undefined : toFigmaRgb(rootColor);

    const rootAutoLayout = detectAutoLayoutPattern(state.screenSize, planNodes.map((node) => node.frame));

    const plan: UIPlan = {
      version: 1,
      screen: {
        name: "Generated Screen",
        width: state.screenSize.width,
        ...(rootFill ? { fill: rootFill } : {}),
        ...(rootFillRgb ? { fillRgb: rootFillRgb } : {}),
        ...(rootAutoLayout ? { autoLayout: rootAutoLayout } : {})
      },
      nodes: planNodes
    };

    // Step 3: draw the full, already-correct structure onto the canvas FIRST — every placeholder
    // still as its safe deterministic fallback (real text, plain layout frames), no AI involved
    // in this draw at all. This is the actual, visible result if the next step's AI call did
    // nothing whatsoever — never blank, never dependent on that call succeeding.
    const renderResult = await renderUIPlan(
      plan,
      enabledComponents,
      state.screenSize,
      enabledTextStyles,
      enabledPaintStyles
    );
    const structureStats = countPlanNodes(plan.nodes);
    figma.ui.postMessage({
      type: "GENERATE_WARNINGS",
      warnings: [
        `Đã dựng khung đúng cấu trúc HTML (${structureStats.total} node) — đang map component thật cho ${leaves.length} phần tử…`,
        ...(needsPaintStyleRescan ? [paintStyleRescanWarning] : []),
        ...(isLikelyTruncatedHtml(htmlWireframe)
          ? [
              "HTML wireframe có vẻ bị cắt giữa chừng do vượt giới hạn độ dài phản hồi (dù đã thử lại) — màn hình " +
                "có thể thiếu 1 phần ở cuối. Có thể do màn hình có quá nhiều thành phần; thử yêu cầu ngắn gọn hơn " +
                "hoặc chia nhỏ thành nhiều lần generate."
            ]
          : []),
        ...renderResult.warnings.map((warning) => `${warning.nodeId}: ${warning.message}`)
      ]
    });

    // Step 4: the ONE remaining AI call — a flat, already-correct list of leaf elements, each
    // needing only a component (or plain text) decision, never a nested structure to get right.
    // Only the ids it actually upgrades to a real componentId get patched into the frame just
    // drawn above (found by their own stable id, not by fragile sibling position — see
    // upgradeNodesInFrame); everything else keeps the safe fallback already on canvas.
    const leafResult = await requestLeafDecisions(
      profile,
      apiKey,
      leaves,
      state,
      enabledLibraries,
      enabledComponents,
      enabledTextStyles
    );
    applyLeafDecisions(leafPlaceholders, leafResult.decisions);
    const unmappedCount = leaves.filter((leaf) => !leafResult.decisions.has(leaf.id)).length;

    const upgradedNodes = new Map<string, UIPlanNode>();
    for (const node of leafPlaceholders.values()) {
      if (node.componentId) upgradedNodes.set(node.id, node);
    }
    const upgradeResult = await upgradeNodesInFrame(
      renderResult.frame,
      [...upgradedNodes.values()].map((planNode) => ({ id: planNode.id, planNode })),
      enabledComponents,
      enabledTextStyles,
      enabledPaintStyles
    );

    const finalStats = countPlanNodes(plan.nodes);
    const allWarnings = [
      `Bản vẽ có ${finalStats.total} node (${finalStats.layout} vùng layout, ${finalStats.text} dòng text, ` +
        `${finalStats.componentId} component) — ${renderResult.instanceCount + upgradeResult.instanceCount} component instance đã dựng thật trên canvas.`,
      ...(needsPaintStyleRescan ? [paintStyleRescanWarning] : []),
      ...leafResult.warnings,
      ...(unmappedCount
        ? [
            `${unmappedCount}/${leaves.length} phần tử không map được component thật, giữ nguyên dạng text/khung trống theo đúng HTML gốc.`
          ]
        : []),
      ...upgradeResult.warnings.map((warning) => `${warning.nodeId}: ${warning.message}`)
    ];
    figma.ui.postMessage({ type: "GENERATE_WARNINGS", warnings: allWarnings });

    // GENERATE_SUCCESS (which hides the "đang generate" status and re-enables the button) is
    // deliberately held until AFTER the comparison pass below finishes too — sending it earlier
    // made the UI look "done" while a whole extra vision call could still be running for several
    // more seconds, with nothing visible distinguishing "finished" from "still comparing".
    if (image) {
      figma.ui.postMessage({ type: "GENERATE_STATUS", status: "Đang so sánh với ảnh gốc…" });
      try {
        const resultBytes = await renderResult.frame.exportAsync({
          format: "PNG",
          constraint: { type: "SCALE", value: 2 }
        });
        const resultImage: ImageInput = { base64: figma.base64Encode(resultBytes), mimeType: "image/png" };
        const instruction = [
          "So sánh ảnh gốc (ảnh thứ nhất) với ảnh kết quả vừa dựng bằng component có sẵn (ảnh thứ hai).",
          'Dòng đầu tiên của câu trả lời PHẢI là đúng một từ: "MATCH" nếu khớp tốt, hoặc "MISMATCH" nếu có khác biệt',
          "đáng chú ý. Từ dòng thứ hai trở đi: nếu MISMATCH, liệt kê ngắn gọn các điểm khác biệt cụ thể (bố cục,",
          "thứ tự thành phần, thành phần thiếu/thừa, text/icon sai...); nếu MATCH, chỉ cần xác nhận ngắn gọn."
        ].join(" ");
        const rawComparison = await compareScreens(profile, apiKey, image, resultImage, instruction);
        const marker = rawComparison.match(/^\s*(MATCH|MISMATCH)\b/i);
        const isMismatch = marker?.[1]?.toUpperCase() === "MISMATCH";
        const comparisonNotes = (marker ? rawComparison.slice(marker[0].length) : rawComparison).trim();

        // Deliberately informational only, never auto-modifies the canvas: an earlier version
        // tried to "fix" a MISMATCH by asking for a whole corrected UIPlan JSON in one shot and
        // patching it over the already-good frame — that's the exact one-shot full-tree
        // generation this whole HTML-first pipeline was built to avoid, and it reliably produced
        // a sparser result that then overwrote/deleted most of what the reliable build had just
        // drawn. Surfacing the mismatch notes lets you decide what to do with them instead.
        figma.ui.postMessage({
          type: "GENERATE_COMPARISON",
          comparison: comparisonNotes || (isMismatch ? "Có khác biệt so với ảnh gốc." : "Khớp với ảnh gốc.")
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        figma.ui.postMessage({
          type: "GENERATE_COMPARISON",
          comparison: `Không thể so sánh với ảnh gốc: ${message}`
        });
      }
    }
    figma.ui.postMessage({ type: "GENERATE_SUCCESS" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
    figma.ui.postMessage({ type: "GENERATE_ERROR", errors: [message] });
    figma.notify(message, { error: true });
  }
}

// Below this many opening tags, an HTML wireframe is suspiciously thin for anything but a
// trivial screen — worth a retry before handing it to the (much more expensive, catalog-bound)
// conversion step.
const MIN_HTML_TAG_COUNT = 15;

function countHtmlTags(html: string): number {
  return (html.match(/<[a-zA-Z][a-zA-Z0-9]*\b/g) ?? []).length;
}

// Tags with no closing counterpart at all — never expected to appear as `</tag>`, so excluded
// from the open/close balance check below.
const VOID_HTML_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
  "track", "wbr"
]);

// A response cut off by hitting the provider's output-length limit mid-stream (as opposed to the
// model choosing to stop early, which MIN_HTML_TAG_COUNT below already catches) lands mid-tag or
// mid-attribute, and/or leaves one or more containers opened with no matching close — either is a
// strong, cheap signal that this is a truncated fragment rather than a complete document. This is
// deliberately a heuristic, not a real parser: good enough to catch "cấu trúc dở dang, thiếu thẻ
// đóng" without needing every provider to report its own finish/stop reason uniformly.
function isLikelyTruncatedHtml(html: string): boolean {
  const trimmed = html.trimEnd();
  if (!trimmed) return true;
  if (!trimmed.endsWith(">")) return true;

  const openCounts = new Map<string, number>();
  for (const [, rawTag, selfClosing] of trimmed.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g)) {
    const tag = rawTag.toLowerCase();
    if (selfClosing || VOID_HTML_TAGS.has(tag)) continue;
    openCounts.set(tag, (openCounts.get(tag) ?? 0) + 1);
  }
  for (const [, rawTag] of trimmed.matchAll(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g)) {
    const tag = rawTag.toLowerCase();
    openCounts.set(tag, (openCounts.get(tag) ?? 0) - 1);
  }
  return [...openCounts.values()].some((count) => count > 0);
}

function extractHtml(rawText: string): string {
  const fenced = rawText.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : rawText).trim();
  // Defensive: if the response still came back JSON-string-escaped (no real newlines, but
  // literal `\n` sequences — e.g. a provider wrapped it in a JSON object on its own initiative
  // even though none was requested), unwrap it instead of treating the escaped blob as HTML.
  if (!candidate.includes("\n") && candidate.includes("\\n")) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (typeof parsed === "string") return parsed;
      if (parsed && typeof parsed === "object") {
        const stringValue = Object.values(parsed as Record<string, unknown>).find(
          (value): value is string => typeof value === "string"
        );
        if (stringValue) return stringValue;
      }
    } catch {
      // not actually JSON — leave the candidate as-is
    }
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// HTML → Figma tree: deterministic parse + structure build, no AI call involved (see
// parseHtmlWireframe below for why parsing itself has to happen in the UI iframe).
// ---------------------------------------------------------------------------

function parsePx(value: string | undefined): number | undefined {
  const match = value?.match(/(-?\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

function frameFromStyle(style: HtmlNode["style"]): { x: number; y: number; width: number; height: number } {
  return { x: style?.x ?? 0, y: style?.y ?? 0, width: style?.width ?? 0, height: style?.height ?? 0 };
}

// Padding/gap must land on a multiple of 4 — this reconciles whatever the measured pixels
// happened to be into that grid, rather than carrying an arbitrary value like 9 or 14 straight
// through onto the canvas.
function roundToSpacingGrid(value: number): number {
  return Math.max(0, Math.round(value / 4) * 4);
}

// Above this many px of unevenness between consecutive gaps, the children don't form a single
// clean row/column Figma Auto Layout could represent with one gap value (overlapping, wrapped
// onto multiple rows/columns, or just genuinely irregularly spaced) — safer to leave that
// container absolutely positioned than to force a single gap that would visually misplace it.
const MAX_GAP_DEVIATION = 6;

/**
 * Infers a Figma Auto Layout direction/padding/gap for a container from its direct children's
 * OWN already-measured absolute positions (not from CSS) — converts what would otherwise stay a
 * fixed absolute-position frame into a real, editable/reflowable Auto Layout frame wherever the
 * children happen to form a clean, evenly-spaced single row or column, while starting out at the
 * exact same visual arrangement the absolute positions would have produced. Returns undefined
 * (stay absolutely positioned) for anything that doesn't cleanly resolve to one direction/gap —
 * a wrapped grid, overlapping elements, or simply irregular spacing.
 */
function detectAutoLayoutPattern(
  containerFrame: { width: number; height: number },
  childFrames: Array<{ x: number; y: number; width: number; height: number }>
): AutoLayoutSpec | undefined {
  if (childFrames.length === 0) return undefined;

  if (childFrames.length === 1) {
    const child = childFrames[0];
    return {
      direction: "VERTICAL",
      paddingTop: roundToSpacingGrid(child.y),
      paddingRight: roundToSpacingGrid(containerFrame.width - (child.x + child.width)),
      paddingBottom: roundToSpacingGrid(containerFrame.height - (child.y + child.height)),
      paddingLeft: roundToSpacingGrid(child.x),
      gap: 0
    };
  }

  // A horizontal row has near-constant y (only x varies) across children; a vertical column the
  // opposite. Neither varying (an exact tie, or everything piled on top of itself) isn't a clean
  // pattern at all.
  const yRange = Math.max(...childFrames.map((c) => c.y)) - Math.min(...childFrames.map((c) => c.y));
  const xRange = Math.max(...childFrames.map((c) => c.x)) - Math.min(...childFrames.map((c) => c.x));
  if (Math.abs(yRange - xRange) < 2) return undefined;
  const direction: "HORIZONTAL" | "VERTICAL" = yRange < xRange ? "HORIZONTAL" : "VERTICAL";

  const ordered = [...childFrames].sort((a, b) => (direction === "HORIZONTAL" ? a.x - b.x : a.y - b.y));
  const gaps = ordered.slice(1).map((child, i) => {
    const prev = ordered[i];
    return direction === "HORIZONTAL" ? child.x - (prev.x + prev.width) : child.y - (prev.y + prev.height);
  });
  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  if (avgGap < -2 || gaps.some((gap) => Math.abs(gap - avgGap) > MAX_GAP_DEVIATION)) return undefined;

  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const crossStarts = ordered.map((c) => (direction === "HORIZONTAL" ? c.y : c.x));
  const crossEnds = ordered.map((c) => (direction === "HORIZONTAL" ? c.y + c.height : c.x + c.width));
  const minCrossStart = Math.min(...crossStarts);
  const maxCrossEnd = Math.max(...crossEnds);

  return {
    direction,
    paddingTop: roundToSpacingGrid(Math.max(0, direction === "HORIZONTAL" ? minCrossStart : first.y)),
    paddingLeft: roundToSpacingGrid(Math.max(0, direction === "HORIZONTAL" ? first.x : minCrossStart)),
    paddingRight: roundToSpacingGrid(
      Math.max(0, direction === "HORIZONTAL" ? containerFrame.width - (last.x + last.width) : containerFrame.width - maxCrossEnd)
    ),
    paddingBottom: roundToSpacingGrid(
      Math.max(0, direction === "HORIZONTAL" ? containerFrame.height - maxCrossEnd : containerFrame.height - (last.y + last.height))
    ),
    gap: roundToSpacingGrid(Math.max(0, avgGap))
  };
}

function describeElement(node: HtmlNode): string {
  return node.classes.length ? `${node.tag}.${node.classes.join(".")}` : node.tag;
}

const NO_COLOR_VALUES = new Set(["", "transparent", "none"]);

function normalizeCssColor(value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw || NO_COLOR_VALUES.has(raw.toLowerCase())) return undefined;
  // A fully transparent color still resolves to an explicit rgba(...) with a zero alpha channel
  // rather than the keyword "transparent" once run through getComputedStyle.
  if (/^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*0(?:\.0+)?\s*\)$/.test(raw)) return undefined;
  return raw;
}

function extractBackgroundColor(style: HtmlNode["style"]): string | undefined {
  return normalizeCssColor(style?.backgroundColor);
}

function extractBorderColor(style: HtmlNode["style"]): string | undefined {
  const width = parsePx(style?.borderTopWidth);
  const borderStyle = (style?.borderTopStyle ?? "").toLowerCase();
  if (!width || width <= 0 || borderStyle === "none" || borderStyle === "hidden") return undefined;
  return normalizeCssColor(style?.borderTopColor);
}

function hasBoxShadow(style: HtmlNode["style"]): boolean {
  const value = style?.boxShadow?.trim().toLowerCase();
  return Boolean(value) && value !== "none";
}

// getComputedStyle always normalizes a color to this canonical rgb()/rgba() functional form
// (never hex or a named color), so a small regex is all that's needed here — no general CSS
// color parser required.
function parseRgbColor(value: string): { r: number; g: number; b: number } | undefined {
  const match = value.match(/rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*[\d.]+\s*)?\)/i);
  if (!match) return undefined;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

// Beyond this Euclidean RGB distance, the closest loaded Color Style still isn't really a match
// — better to leave the element transparent/borderless than force an unrelated color onto it.
const MAX_COLOR_MATCH_DISTANCE = 60;

/**
 * Finds the closest loaded Color Style to a CSS color by real, captured RGB distance — no AI
 * call needed at all, unlike component matching (which genuinely requires understanding what a
 * component is *for*, not just a numeric comparison). Only paint styles captured with a solid
 * color at scan time (see scanCurrentFileAsLibrary) can be matched this way; anything else, or
 * nothing close enough, is treated the same as no match.
 */
function matchNearestPaintStyle(
  cssColor: string | undefined,
  paintStyles: PaintStyleRegistryItem[]
): string | undefined {
  if (!cssColor) return undefined;
  const target = parseRgbColor(cssColor);
  if (!target) return undefined;

  let best: { name: string; distance: number } | undefined;
  for (const style of paintStyles) {
    if (!style.color) continue;
    const distance = Math.sqrt(
      (target.r - style.color.r * 255) ** 2 +
        (target.g - style.color.g * 255) ** 2 +
        (target.b - style.color.b * 255) ** 2
    );
    if (!best || distance < best.distance) best = { name: style.name, distance };
  }
  return best && best.distance <= MAX_COLOR_MATCH_DISTANCE ? best.name : undefined;
}

// Fallback for when nothing loaded is a close enough match (or no Color Style has a captured
// color to match against at all, e.g. before a library re-scan) — the wireframe's own literal
// CSS color, applied directly rather than leaving the element with no fill/border at all.
function toFigmaRgb(cssColor: string | undefined): { r: number; g: number; b: number } | undefined {
  if (!cssColor) return undefined;
  const rgb = parseRgbColor(cssColor);
  if (!rgb) return undefined;
  return { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 };
}

/** Same fill/fallback-raw-color resolution as a container's background, applied to a text
 * node's own glyph color instead — `color` is an inherited CSS property, so the element's own
 * resolved `style.color` already accounts for wherever up the ancestor chain it was actually
 * declared. */
function resolveTextFill(
  style: HtmlNode["style"],
  enabledPaintStyles: PaintStyleRegistryItem[]
): { fill?: string; fillRgb?: { r: number; g: number; b: number } } {
  const textColor = normalizeCssColor(style?.color);
  const fill = matchNearestPaintStyle(textColor, enabledPaintStyles);
  if (fill) return { fill };
  const fillRgb = toFigmaRgb(textColor);
  return fillRgb ? { fillRgb } : {};
}

// Elements worth keeping even with no nested elements: either they carry their own literal
// text, or they're one of a small set of tags that are meaningful even empty (a form field, an
// image/icon) — everything else (a bare decorative `<div>`/`<span>` with nothing in it) is
// dropped entirely rather than rendered as an empty box.
// "i" covers the common icon-font convention (`<i class="fa fa-check"></i>` — an empty tag whose
// glyph comes purely from a font + CSS, no text content of its own).
const MEANINGFUL_EMPTY_LEAF_TAGS = new Set(["input", "img", "svg", "textarea", "select", "hr", "i"]);

function isMeaningfulLeaf(node: HtmlNode): boolean {
  if (node.text?.trim()) return true;
  return MEANINGFUL_EMPTY_LEAF_TAGS.has(node.tag.toLowerCase());
}

// Depth-independent versions of the "simple leaf-like container" checks below — a markup style
// that wraps an icon in its own extra `<div class="icon">` level (common alongside real `<svg>`
// icons, unlike a bare `<span class="icon">`) would otherwise miss the shallow, one-level-only
// check a nav-item/status-badge/icon-button pattern needs to still be recognized as one.
// Upper bound (in leaf-descendant count) for offering a whole container as a single-component
// swap candidate — generous enough to cover a composite region (header bar, sidebar nav block,
// card) but well short of a whole screen, so the AI is never tempted to collapse the entire page
// into one instance.
const BIG_WHOLE_MAX_LEAVES = 30;

function countLeafDescendants(node: HtmlNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((sum, child) => sum + countLeafDescendants(child), 0);
}

function gatherLeafTexts(node: HtmlNode): string[] {
  if (node.children.length === 0) return node.text?.trim() ? [node.text.trim()] : [];
  const childTexts = node.children.flatMap(gatherLeafTexts);
  return node.text?.trim() ? [...childTexts, node.text.trim()] : childTexts;
}

const LEAF_ATTR_ALLOWLIST = ["type", "placeholder", "alt", "href", "value", "aria-label"];

/**
 * Walks the deterministically-parsed HTML tree and builds the UIPlan tree structure directly —
 * every container element becomes a `layout` node (recursing into its children), and every leaf
 * element becomes a placeholder UIPlanNode seeded with a SAFE fallback (its own literal text, if
 * it has any) that already renders correctly on its own. Leaf placeholders are also collected
 * into `leavesOut`/`leafPlaceholders` so requestLeafDecisions (below) can try to upgrade each one
 * to a real catalog component afterward — but even if that AI call fails outright, every
 * placeholder object built here is already a complete, valid, visible UIPlanNode by construction.
 * A container's fill/border color, by contrast, is decided right here, synchronously — no AI
 * call needed for that at all, since `matchNearestPaintStyle` can find the closest loaded Color
 * Style by real, captured RGB distance the moment the color is known.
 * A container whose leaf-descendant count is within `BIG_WHOLE_MAX_LEAVES` — from a small
 * "icon next to a label" pattern (nav item/status badge/icon button) up to a bigger composite
 * region (header bar, sidebar nav block, card) — is ALSO offered as a leaf-decision candidate
 * under an aliased `${id}-whole` id, alongside its own children's individual leaf candidacy — a
 * design system commonly has exactly one real component for a pattern like that, which a leaf-only
 * view of the tree could never reach (only individual pieces would be offered, never the composite
 * as a unit).
 */
function buildPlanFromHtmlNodes(
  nodes: HtmlNode[],
  ancestry: string[],
  path: string,
  leavesOut: LeafElement[],
  leafPlaceholders: Map<string, UIPlanNode>,
  enabledPaintStyles: PaintStyleRegistryItem[]
): UIPlanNode[] {
  const result: UIPlanNode[] = [];
  nodes.forEach((node, index) => {
    const id = `${path}-${index}`;

    const frame = frameFromStyle(node.style);

    if (node.children.length > 0) {
      const childAncestry = [...ancestry, describeElement(node)];
      const childPlanNodes = buildPlanFromHtmlNodes(node.children, childAncestry, id, leavesOut, leafPlaceholders, enabledPaintStyles);

      // Mixed content: this container ALSO carries its own bare label text (e.g. an icon element
      // followed by unwrapped text, `<li><span class="icon">X</span> Label</li>`) — represent it
      // as one extra leaf child instead of silently dropping it just because it was never itself
      // wrapped in its own element. Its own measured rect (via a DOM Range) is relative to this
      // container, matching its icon sibling's coordinate frame.
      const labelText = node.text?.trim();
      if (labelText) {
        const labelId = `${id}-label`;
        const labelFrame = node.textRect ?? frame;
        const labelPlaceholder: UIPlanNode = {
          id: labelId,
          frame: labelFrame,
          text: { characters: labelText, ...resolveTextFill(node.style, enabledPaintStyles) },
          properties: {}
        };
        leafPlaceholders.set(labelId, labelPlaceholder);
        leavesOut.push({ id: labelId, tag: "#text", classes: [], attrs: {}, text: labelText, ancestry: childAncestry });
        childPlanNodes.push(labelPlaceholder);
      }

      const containerNode: UIPlanNode = { id, frame, layout: {}, properties: {}, children: childPlanNodes };

      // Some UI patterns are naturally written as a container with several leaf-ish children —
      // small atomic ones (an icon + a label — a nav item, a status badge, an icon button) as well
      // as bigger composite regions (a header bar, a sidebar nav block, a card) — exactly the kind
      // of thing a design system usually has ONE real component for, even though structurally it's
      // a container, not a leaf. Offer the whole container as an ADDITIONAL flat candidate in the
      // SAME leaf-decision batch (reusing leafPlaceholders/leavesOut as-is — no separate call
      // needed) under an aliased id, so it can be promoted to a single real component (discarding
      // its children) instead of always staying a generic auto-layout wrapper. Capped at
      // BIG_WHOLE_MAX_LEAVES so this never reaches all the way up to the whole screen wrapper —
      // the AI is also told it's safe to skip whenever nothing in the catalog is a strong enough
      // structural/content match, so an oversized or novel container just keeps today's correct
      // deterministic rendering instead of being forced into a bad partial match.
      if (countLeafDescendants(node) <= BIG_WHOLE_MAX_LEAVES) {
        const wholeId = `${id}-whole`;
        const summaryText = gatherLeafTexts(node).join(" ").trim();
        leafPlaceholders.set(wholeId, containerNode);
        leavesOut.push({
          id: wholeId,
          tag: node.tag,
          classes: node.classes,
          attrs: Object.fromEntries(Object.entries(node.attrs).filter(([key]) => LEAF_ATTR_ALLOWLIST.includes(key))),
          text: summaryText || undefined,
          ancestry: childAncestry
        });
      }

      if (hasBoxShadow(node.style)) {
        containerNode.layout!.shadow = true;
      }

      const backgroundColor = extractBackgroundColor(node.style);
      const fill = matchNearestPaintStyle(backgroundColor, enabledPaintStyles);
      if (fill) containerNode.layout!.fill = fill;
      else {
        const rgb = toFigmaRgb(backgroundColor);
        if (rgb) containerNode.layout!.fillRgb = rgb;
      }

      const borderColor = extractBorderColor(node.style);
      const strokeColor = matchNearestPaintStyle(borderColor, enabledPaintStyles);
      if (strokeColor) containerNode.layout!.strokeColor = strokeColor;
      else {
        const rgb = toFigmaRgb(borderColor);
        if (rgb) containerNode.layout!.strokeRgb = rgb;
      }

      const cornerRadius = parsePx(node.style?.borderTopLeftRadius);
      if (cornerRadius) containerNode.layout!.cornerRadius = Math.round(cornerRadius);

      const autoLayout = detectAutoLayoutPattern(frame, childPlanNodes.map((child) => child.frame));
      if (autoLayout) containerNode.layout!.autoLayout = autoLayout;

      result.push(containerNode);
      return;
    }

    if (!isMeaningfulLeaf(node)) return;

    const fallbackText = node.text?.trim();
    const placeholder: UIPlanNode = fallbackText
      ? { id, frame, text: { characters: fallbackText, ...resolveTextFill(node.style, enabledPaintStyles) }, properties: {} }
      : { id, frame, layout: {}, properties: {} };
    leafPlaceholders.set(id, placeholder);
    leavesOut.push({
      id,
      tag: node.tag,
      classes: node.classes,
      attrs: Object.fromEntries(
        Object.entries(node.attrs).filter(([key]) => LEAF_ATTR_ALLOWLIST.includes(key))
      ),
      text: fallbackText,
      ancestry
    });
    result.push(placeholder);
  });
  return result;
}

/** Upgrades leaf placeholders in place (they're already embedded by reference inside the plan
 * tree built above) wherever the AI found a real component or a better text fit — anything it
 * skipped keeps its already-safe fallback untouched. */
function applyLeafDecisions(leafPlaceholders: Map<string, UIPlanNode>, decisions: Map<string, LeafDecision>): void {
  for (const [id, decision] of decisions) {
    const placeholder = leafPlaceholders.get(id);
    if (!placeholder) continue;
    if (decision.componentId) {
      placeholder.componentId = decision.componentId;
      placeholder.properties = decision.properties ?? {};
      delete placeholder.text;
      delete placeholder.layout;
      delete placeholder.children;
    } else if (decision.text?.characters?.trim()) {
      placeholder.text = decision.text;
      delete placeholder.componentId;
      delete placeholder.layout;
      delete placeholder.children;
    }
  }
}

// Deliberately lenient, like validate.ts's UIPlan parsing: a garbled/unparseable response here
// just means every leaf keeps its already-safe deterministic fallback, never a thrown error.
function parseLeafDecisions(
  rawText: string,
  allowedIds: Set<string>,
  allowedStyleNames: Set<string>
): { decisions: Map<string, LeafDecision>; warnings: string[] } {
  let parsed: unknown;
  try {
    const cleaned = rawText
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      decisions: new Map(),
      warnings: ["Không parse được JSON kết quả map component — giữ nguyên fallback text thô theo HTML gốc."]
    };
  }

  const rawList = Array.isArray((parsed as { decisions?: unknown })?.decisions)
    ? (parsed as { decisions: unknown[] }).decisions
    : Array.isArray(parsed)
      ? parsed
      : [];

  const decisions = new Map<string, LeafDecision>();
  for (const rawEntry of rawList) {
    if (!rawEntry || typeof rawEntry !== "object") continue;
    const entry = rawEntry as Record<string, unknown>;
    const id = typeof entry.id === "string" ? entry.id : undefined;
    if (!id) continue;

    if (typeof entry.componentId === "string" && allowedIds.has(entry.componentId)) {
      const properties: Record<string, string | boolean> = {};
      if (entry.properties && typeof entry.properties === "object") {
        for (const [key, value] of Object.entries(entry.properties as Record<string, unknown>)) {
          if (typeof value === "string" || typeof value === "boolean") properties[key] = value;
        }
      }
      decisions.set(id, { id, componentId: entry.componentId, properties });
      continue;
    }

    const text = entry.text as { characters?: unknown; style?: unknown } | undefined;
    if (text && typeof text.characters === "string" && text.characters.trim()) {
      const style =
        typeof text.style === "string" && allowedStyleNames.has(text.style.trim().toLowerCase())
          ? text.style
          : undefined;
      decisions.set(id, { id, text: { characters: text.characters, style } });
    }
  }

  return { decisions, warnings: [] };
}

/**
 * The one remaining AI call in the pipeline: a flat list of already-decided leaf elements, each
 * needing only a component-or-text decision — see buildLeafMappingSystemPrompt. Retries once if
 * the response comes back empty/unparseable; on total failure, every leaf just keeps its
 * already-safe deterministic fallback (see buildPlanFromHtmlNodes) rather than failing the whole
 * generation.
 */
async function requestLeafDecisions(
  profile: ProviderProfile,
  apiKey: string,
  leaves: LeafElement[],
  state: StoredState,
  enabledLibraries: LibraryProfile[],
  enabledComponents: ComponentRegistryItem[],
  enabledTextStyles: TextStyleRegistryItem[]
): Promise<{ decisions: Map<string, LeafDecision>; warnings: string[] }> {
  if (!leaves.length) return { decisions: new Map(), warnings: [] };

  const componentIds = enabledComponents.map((component) => component.id);
  const textStyleNames = ["Body Regular", ...enabledTextStyles.map((style) => style.name)];
  const allowedIds = new Set(componentIds);
  const allowedStyleNames = new Set(textStyleNames.map((name) => name.toLowerCase()));

  const systemPrompt = buildLeafMappingSystemPrompt(state.rules, enabledLibraries, enabledComponents, enabledTextStyles, leaves);
  const jsonSchema = buildLeafDecisionsJsonSchema(componentIds, textStyleNames);
  const geminiSchema = buildGeminiLeafDecisionsSchema(componentIds, textStyleNames);
  const userPrompt = 'Map từng phần tử trong "## Elements to map" theo đúng chỉ dẫn ở trên.';

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const rawText = await callProvider(profile, apiKey, systemPrompt, userPrompt, undefined, jsonSchema, geminiSchema);
      const result = parseLeafDecisions(rawText, allowedIds, allowedStyleNames);
      if (result.decisions.size > 0 || attempt === 1) return result;
    } catch (error) {
      if (attempt === 1) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          decisions: new Map(),
          warnings: [`Không map được component (${message}) — giữ nguyên nội dung text thô theo HTML gốc.`]
        };
      }
      // A thrown error here (unlike a merely-sparse result) is usually the provider's own
      // transient failure (rate limit, momentary server overload, a flaky 5xx) — retrying
      // instantly tends to just hit the same overloaded moment again, so pause briefly first.
      await delay(1500);
    }
  }
  return { decisions: new Map(), warnings: [] };
}

interface ParsedWireframe {
  nodes: HtmlNode[];
  /** The wireframe's own `<body>` background color — a `body { background: ... }` CSS rule is
   * extremely common for setting the whole screen's own background, so this is what the root
   * screen frame's own fill gets resolved from (see requestHtmlWireframe's caller). */
  rootBackgroundColor?: string;
}

let parseRequestCounter = 0;
const pendingHtmlParseRequests = new Map<
  string,
  { resolve: (result: ParsedWireframe) => void; reject: (error: Error) => void }
>();

// The main thread (this file) has no DOM — HTML has to be parsed inside the UI iframe (a real
// browser context) and the result sent back over postMessage. See figma.ui.onmessage below for
// where HTML_WIREFRAME_PARSED/HTML_WIREFRAME_PARSE_ERROR resolve the pending promise this creates.
function parseHtmlWireframe(
  html: string,
  screenSize: { width: number; height: number }
): Promise<ParsedWireframe> {
  return new Promise((resolve, reject) => {
    const requestId = `parse-${++parseRequestCounter}`;
    pendingHtmlParseRequests.set(requestId, { resolve, reject });
    figma.ui.postMessage({
      type: "PARSE_HTML_WIREFRAME",
      requestId,
      html,
      screenWidth: screenSize.width,
      screenHeight: screenSize.height
    });
  });
}

/**
 * Step 1: sketch the whole screen as HTML/CSS — see buildHtmlWireframePrompt for why. Retries
 * once if the result looks suspiciously thin, keeping whichever attempt came out more detailed
 * rather than always trusting the last one.
 */
async function requestHtmlWireframe(
  profile: ProviderProfile,
  apiKey: string,
  trimmed: string,
  image: ImageInput | undefined,
  describedChecklist: string,
  state: StoredState
): Promise<string> {
  const systemPrompt = buildHtmlWireframePrompt(state.rules, state.screenSize, Boolean(image));
  const baseUserPrompt = `${buildUserPrompt(trimmed, Boolean(image))}${describedChecklist}`;

  let best = "";
  let bestTruncated = true;
  let lastTruncated = false;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const retryNote =
        attempt === 0
          ? ""
          : lastTruncated
            ? "\n\nLần trước phản hồi bị CẮT GIỮA CHỪNG vì vượt quá giới hạn độ dài (thiếu thẻ đóng, cấu trúc dở dang) — lần này PHẢI hoàn thành đầy đủ mọi thẻ đã mở; có thể rút gọn bớt nội dung (ít item/hàng hơn) nếu cần để không bị cắt, nhưng tuyệt đối không được dừng giữa chừng."
            : "\n\nLần trước bạn dựng HTML quá sơ sài (thiếu vùng hoặc thiếu chi tiết) — lần này PHẢI dựng đầy đủ chi tiết thật cho mọi vùng, đừng bỏ cuộc hay để trống.";
      const rawText = await callProvider(profile, apiKey, systemPrompt, `${baseUserPrompt}${retryNote}`, image);
      const html = extractHtml(rawText);
      lastTruncated = isLikelyTruncatedHtml(html);
      // Prefer a complete response over a merely denser-but-truncated one; only compare tag
      // counts within the same truncated/complete tier.
      const isBetter =
        !best ||
        (bestTruncated && !lastTruncated) ||
        (bestTruncated === lastTruncated && countHtmlTags(html) > countHtmlTags(best));
      if (isBetter) {
        best = html;
        bestTruncated = lastTruncated;
      }
      if (!lastTruncated && countHtmlTags(html) >= MIN_HTML_TAG_COUNT) return html;
    } catch (error) {
      if (attempt === 1 && !best) throw error;
    }
  }
  if (!best) throw new Error("Không tạo được HTML wireframe.");
  return best;
}

figma.ui.onmessage = async (message: unknown) => {
  if (!message || typeof message !== "object" || !("type" in message)) return;

  const typedMessage = message as {
    type: string;
    profile?: ProviderProfile;
    activeProviderId?: string;
    library?: LibraryProfile;
    libraryId?: string;
    enabled?: boolean;
    rules?: { general: string; overview: string; list: string; detail: string };
    screenSize?: { width: number; height: number };
    componentId?: string;
    componentIds?: string[];
    component?: ComponentRegistryItem;
    apiKey?: string;
    prompt?: string;
    useSelectionImage?: boolean;
    requestId?: string;
    nodes?: HtmlNode[];
    rootBackgroundColor?: string;
    message?: string;
  };

  switch (typedMessage.type) {
    case "READY":
      await publishState();
      break;

    case "HTML_WIREFRAME_PARSED": {
      const pending = typedMessage.requestId ? pendingHtmlParseRequests.get(typedMessage.requestId) : undefined;
      if (pending && typedMessage.requestId) {
        pendingHtmlParseRequests.delete(typedMessage.requestId);
        pending.resolve({ nodes: typedMessage.nodes ?? [], rootBackgroundColor: typedMessage.rootBackgroundColor });
      }
      break;
    }

    case "HTML_WIREFRAME_PARSE_ERROR": {
      const pending = typedMessage.requestId ? pendingHtmlParseRequests.get(typedMessage.requestId) : undefined;
      if (pending && typedMessage.requestId) {
        pendingHtmlParseRequests.delete(typedMessage.requestId);
        pending.reject(new Error(typedMessage.message ?? "Không parse được HTML wireframe."));
      }
      break;
    }

    case "SAVE_PROVIDER": {
      if (!typedMessage.profile) return;
      const state = await loadState();
      const profile = typedMessage.profile;
      const exists = state.providerProfiles.some((item) => item.id === profile.id);
      state.providerProfiles = exists
        ? state.providerProfiles.map((item) =>
            item.id === profile.id ? profile : item
          )
        : [...state.providerProfiles, profile];
      state.activeProviderId = profile.id;
      await saveState(state);
      if (typedMessage.apiKey) {
        const apiKeys = await loadApiKeys();
        apiKeys[profile.id] = typedMessage.apiKey;
        await saveApiKeys(apiKeys);
      }
      await publishState();
      figma.notify("Đã lưu provider và API key trên thiết bị.");
      break;
    }

    case "LOAD_PROVIDER_MODELS": {
      if (!typedMessage.profile) return;
      const profile = typedMessage.profile;
      let apiKey = typedMessage.apiKey;
      if (!apiKey) {
        const apiKeys = await loadApiKeys();
        apiKey = apiKeys[profile.id];
      }
      if (!apiKey) {
        notifyError("Nhập hoặc lưu API key trước khi tải danh sách model.");
        return;
      }
      try {
        const models = await listModels(profile, apiKey);
        figma.ui.postMessage({ type: "PROVIDER_MODELS", models });
        figma.notify(`Đã tải ${models.length} model.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notifyError(`Không thể tải danh sách model: ${message}`);
      }
      break;
    }

    case "DELETE_API_KEY": {
      if (!typedMessage.activeProviderId) return;
      const apiKeys = await loadApiKeys();
      delete apiKeys[typedMessage.activeProviderId];
      await saveApiKeys(apiKeys);
      await publishState();
      figma.notify("Đã xóa API key khỏi thiết bị.");
      break;
    }

    case "SAVE_RULES": {
      if (!typedMessage.rules) return;
      const state = await loadState();
      state.rules = {
        version: 2,
        general: typedMessage.rules.general ?? "",
        overview: typedMessage.rules.overview ?? "",
        list: typedMessage.rules.list ?? "",
        detail: typedMessage.rules.detail ?? ""
      };
      if (
        typedMessage.screenSize &&
        typedMessage.screenSize.width > 0 &&
        typedMessage.screenSize.height > 0
      ) {
        state.screenSize = typedMessage.screenSize;
      }
      await saveState(state);
      await publishState();
      figma.notify("Đã lưu design rules.");
      break;
    }

    case "SAVE_LIBRARY": {
      if (!typedMessage.library) return;
      const state = await loadState();
      const library = typedMessage.library;
      const exists = state.libraries.some((item) => item.id === library.id);
      state.libraries = exists
        ? state.libraries.map((item) => (item.id === library.id ? library : item))
        : [...state.libraries, library];
      if (!state.enabledLibraryIds.includes(library.id)) {
        state.enabledLibraryIds = [...state.enabledLibraryIds, library.id];
      }
      await saveState(state);
      await publishState();
      figma.notify(`Đã lưu library “${library.name}”.`);
      break;
    }

    case "SCAN_CURRENT_FILE_LIBRARY":
      if (!typedMessage.libraryId) return;
      await scanCurrentFileAsLibrary(typedMessage.libraryId);
      break;

    case "DISCOVER_ENABLED_LIBRARIES":
      await discoverEnabledLibraries();
      break;

    case "TOGGLE_LIBRARY": {
      if (!typedMessage.libraryId) return;
      const state = await loadState();
      state.enabledLibraryIds = typedMessage.enabled
        ? [...new Set([...state.enabledLibraryIds, typedMessage.libraryId])]
        : state.enabledLibraryIds.filter((id) => id !== typedMessage.libraryId);
      await saveState(state);
      await publishState();
      break;
    }

    case "DELETE_LIBRARY": {
      if (!typedMessage.libraryId) return;
      const state = await loadState();
      state.libraries = state.libraries.filter((item) => item.id !== typedMessage.libraryId);
      state.enabledLibraryIds = state.enabledLibraryIds.filter(
        (id) => id !== typedMessage.libraryId
      );
      state.components = state.components.filter(
        (item) => item.libraryId !== typedMessage.libraryId
      );
      await saveState(state);
      await publishState();
      break;
    }

    case "ADD_SELECTED_COMPONENT":
      await addSelectedComponent(typedMessage.libraryId);
      break;

    case "FOCUS_COMPONENT": {
      if (!typedMessage.componentId) return;
      const state = await loadState();
      const item = state.components.find((component) => component.id === typedMessage.componentId);
      if (!item) {
        notifyError("Component không còn tồn tại trong danh sách.");
        return;
      }
      try {
        const node =
          item.nodeType === "COMPONENT"
            ? await figma.importComponentByKeyAsync(item.componentKey)
            : await figma.importComponentSetByKeyAsync(item.componentKey);
        if (node.remote) {
          notifyError(
            `"${item.name}" thuộc thư viện ngoài — mở đúng file thư viện gốc để xem trực tiếp.`
          );
          return;
        }
        let ancestor: BaseNode | null = node;
        while (ancestor && ancestor.type !== "PAGE") ancestor = ancestor.parent;
        const page = ancestor as PageNode | null;
        if (!page) {
          notifyError(`Không xác định được page chứa "${item.name}".`);
          return;
        }
        if (page.id !== figma.currentPage.id) {
          await figma.setCurrentPageAsync(page);
        }
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notifyError(`Không thể mở "${item.name}": ${message}`);
      }
      break;
    }

    case "REMOVE_COMPONENT": {
      const state = await loadState();
      state.components = state.components.filter(
        (item) => item.id !== typedMessage.componentId
      );
      await saveState(state);
      await publishState();
      break;
    }

    case "REMOVE_COMPONENTS": {
      if (!typedMessage.componentIds?.length) return;
      const state = await loadState();
      const idsToRemove = new Set(typedMessage.componentIds);
      state.components = state.components.filter((item) => !idsToRemove.has(item.id));
      await saveState(state);
      await publishState();
      figma.notify(`Đã xóa ${idsToRemove.size} component.`);
      break;
    }

    case "UPDATE_COMPONENT": {
      if (!typedMessage.component) return;
      const state = await loadState();
      state.components = state.components.map((item) =>
        item.id === typedMessage.component?.id ? typedMessage.component : item
      );
      await saveState(state);
      await publishState();
      figma.notify("Đã cập nhật semantic mapping.");
      break;
    }

    case "GENERATE_UI":
      await generateUI(typedMessage.prompt ?? "", Boolean(typedMessage.useSelectionImage));
      break;

    case "CLOSE":
      figma.closePlugin();
      break;
  }
};
