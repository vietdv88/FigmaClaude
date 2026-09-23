import type {
  ComponentRegistryItem,
  PaintStyleRegistryItem,
  TextStyleRegistryItem,
  UIPlan,
  UIPlanNode
} from "./types";

const DEFAULT_TEXT_STYLE = "Body Regular";
const GENERATED_PLUGIN_DATA_KEY = "promptpixel-generated";
// Pace node-by-node so the canvas visibly fills in big-to-small, like a person dragging
// components in one at a time, instead of the whole screen flashing in at the end.
const DRAW_STEP_DELAY_MS = 60;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RenderWarning {
  nodeId: string;
  message: string;
}

export interface RenderResult {
  frame: FrameNode;
  instanceCount: number;
  warnings: RenderWarning[];
}

type FrameSpec = { x: number; y: number; width: number; height: number };

// Every node is placed at its EXACT measured HTML position/size (see types.ts's UIPlanNode)
// rather than reconstructed via Figma Auto Layout — so this only ever sets plain x/y/resize,
// never layoutMode/padding/itemSpacing/sizing-mode properties, which is what made a persistent
// stream of CSS-flexbox-semantics-don't-map-1:1-onto-Auto-Layout bugs (wrong direction/wrap/
// align defaults, stretched children overflowing past a too-short forced size) possible at all.
function applyFrameGeometry(node: FrameNode, frame: FrameSpec): void {
  node.resize(Math.max(1, frame.width), Math.max(1, frame.height));
  node.x = frame.x;
  node.y = frame.y;
}

// Above this many characters, a text node is body copy (a card description, a paragraph) that
// was genuinely wrapped across multiple lines in the browser — keep the measured WIDTH (so it
// keeps wrapping at roughly the same point) but let height auto-size, since Figma's own font
// metrics can differ slightly from whatever font the browser actually substituted, and an exact
// fixed height would silently clip content instead of growing to fit it. A short label/caption/
// button/badge instead auto-sizes on BOTH axes (single line, hugs its own content) so it can
// never wrap or get clipped just because of that same metric mismatch, even if that renders it
// a little wider/narrower than originally measured.
const LONG_TEXT_WRAP_THRESHOLD = 40;

// Whether a node's real parent now uses genuine Figma Auto Layout (see detectAutoLayoutPattern
// in code.ts) rather than plain absolute positioning — a child of one needs an explicit
// layoutSizing mode, and Figma positions it itself (any x/y we set gets overridden), unlike a
// plain "NONE" parent where we still control position/size directly.
function isAutoLayoutParent(parent: FrameNode | InstanceNode): boolean {
  return parent.type === "FRAME" && parent.layoutMode !== "NONE";
}

// Every child of a real Auto Layout parent needs an explicit sizing mode; default to HUG (never
// stretch) — a component made of plain vectors/groups (common for icons) can't always accept it,
// so each axis is attempted independently and swallowed on failure rather than crashing the
// render.
function applyAutoLayoutChildSizing(node: FrameNode | InstanceNode): void {
  try {
    node.layoutSizingHorizontal = "HUG";
  } catch {
    // not eligible for HUG — leave its default size
  }
  try {
    node.layoutSizingVertical = "HUG";
  } catch {
    // not eligible for HUG — leave its default size
  }
}

function applyTextSizing(textNode: TextNode, frame: FrameSpec, parent: FrameNode | InstanceNode): void {
  const isLong = textNode.characters.length > LONG_TEXT_WRAP_THRESHOLD;
  try {
    textNode.textAutoResize = isLong ? "HEIGHT" : "WIDTH_AND_HEIGHT";
  } catch {
    // leave the node's default auto-resize if this combination isn't accepted
  }
  if (isLong) {
    try {
      textNode.resize(Math.max(1, frame.width), textNode.height);
    } catch {
      // leave the auto-computed size if this specific resize isn't accepted
    }
  }
  if (isAutoLayoutParent(parent)) {
    // Long (wrapped) text keeps its just-set FIXED width so it keeps wrapping at the same point
    // — HUG would collapse it back to one unwrapped line, same bug this was meant to avoid.
    try {
      textNode.layoutSizingHorizontal = isLong ? "FIXED" : "HUG";
    } catch {
      // leave whatever Figma already applied
    }
    try {
      textNode.layoutSizingVertical = "HUG";
    } catch {
      // leave whatever Figma already applied
    }
  } else {
    textNode.x = frame.x;
    textNode.y = frame.y;
  }
}

function nextRootX(): number {
  const topLevelFrames = figma.currentPage.children.filter(
    (child): child is FrameNode => child.type === "FRAME"
  );
  if (!topLevelFrames.length) return 0;
  const maxX = Math.max(...topLevelFrames.map((frame) => frame.x + frame.width));
  return maxX + 100;
}

function insertAt(parent: FrameNode | InstanceNode, node: SceneNode, index?: number): void {
  if (index === undefined || index >= parent.children.length) {
    parent.appendChild(node);
  } else {
    parent.insertChild(index, node);
  }
}

async function instantiate(item: ComponentRegistryItem): Promise<InstanceNode> {
  if (item.nodeType === "COMPONENT") {
    const component = await figma.importComponentByKeyAsync(item.componentKey);
    return component.createInstance();
  }
  const componentSet = await figma.importComponentSetByKeyAsync(item.componentKey);
  return componentSet.defaultVariant.createInstance();
}

interface RenderContext {
  componentsById: Map<string, ComponentRegistryItem>;
  textStylesByName: Map<string, TextStyleRegistryItem>;
  paintStylesByName: Map<string, PaintStyleRegistryItem>;
  warnings: RenderWarning[];
  counters: { instanceCount: number };
}

async function coerceValue(
  raw: string | boolean,
  type: string,
  key: string,
  nodeId: string,
  context: RenderContext
): Promise<string | boolean | undefined> {
  if (type === "BOOLEAN") {
    if (typeof raw === "boolean") return raw;
    if (raw === "true") return true;
    if (raw === "false") return false;
    context.warnings.push({ nodeId, message: `Giá trị không hợp lệ cho thuộc tính boolean "${key}".` });
    return undefined;
  }
  if (type === "TEXT" || type === "VARIANT") {
    if (typeof raw === "string") return raw;
    context.warnings.push({ nodeId, message: `Giá trị không hợp lệ cho thuộc tính "${key}" (cần string).` });
    return undefined;
  }
  if (type === "INSTANCE_SWAP") {
    if (typeof raw !== "string") {
      context.warnings.push({
        nodeId,
        message: `Giá trị không hợp lệ cho thuộc tính icon "${key}" (cần string).`
      });
      return undefined;
    }
    const iconItem = context.componentsById.get(raw);
    if (!iconItem) {
      context.warnings.push({
        nodeId,
        message: `Không tìm thấy icon "${raw}" cho thuộc tính "${key}", giữ icon mặc định.`
      });
      return undefined;
    }
    try {
      const iconNode =
        iconItem.nodeType === "COMPONENT"
          ? await figma.importComponentByKeyAsync(iconItem.componentKey)
          : (await figma.importComponentSetByKeyAsync(iconItem.componentKey)).defaultVariant;
      return iconNode.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      context.warnings.push({ nodeId, message: `Không thể import icon "${iconItem.name}": ${message}` });
      return undefined;
    }
  }
  context.warnings.push({ nodeId, message: `Bỏ qua thuộc tính không hỗ trợ "${key}" (${type}).` });
  return undefined;
}

async function applyProperties(
  instance: InstanceNode,
  properties: Record<string, string | boolean>,
  nodeId: string,
  context: RenderContext
): Promise<void> {
  const definitions = instance.componentProperties;
  const defNames = Object.keys(definitions);
  const exactMatch = new Map(defNames.map((name) => [name, name]));
  const prefixMatch = new Map(defNames.map((name) => [name.split("#")[0], name]));

  const filtered: Record<string, string | boolean> = {};
  for (const [key, rawValue] of Object.entries(properties)) {
    const fullName = exactMatch.get(key) ?? prefixMatch.get(key);
    if (!fullName) {
      context.warnings.push({ nodeId, message: `Bỏ qua thuộc tính không tồn tại: "${key}".` });
      continue;
    }
    const coerced = await coerceValue(rawValue, definitions[fullName].type, key, nodeId, context);
    if (coerced !== undefined) {
      filtered[fullName] = coerced;
    }
  }

  if (Object.keys(filtered).length > 0) {
    try {
      instance.setProperties(filtered);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      context.warnings.push({ nodeId, message: `Không thể áp dụng thuộc tính: ${message}` });
    }
  }
}

async function applyFillStyle(
  frame: FrameNode | TextNode,
  styleName: string | undefined,
  nodeId: string,
  context: RenderContext
): Promise<void> {
  if (!styleName?.trim()) return;
  const styleItem = context.paintStylesByName.get(styleName.trim().toLowerCase());
  if (!styleItem) {
    context.warnings.push({
      nodeId,
      message: `Không tìm thấy Color Style "${styleName}" đã nạp, bỏ qua fill.`
    });
    return;
  }
  try {
    const style = await figma.importStyleByKeyAsync(styleItem.styleKey);
    await frame.setFillStyleIdAsync(style.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    context.warnings.push({ nodeId, message: `Không thể áp dụng Color Style "${styleItem.name}": ${message}` });
  }
}

async function applyStrokeStyle(
  frame: FrameNode,
  styleName: string | undefined,
  nodeId: string,
  context: RenderContext
): Promise<void> {
  if (!styleName?.trim()) return;
  const styleItem = context.paintStylesByName.get(styleName.trim().toLowerCase());
  if (!styleItem) {
    context.warnings.push({
      nodeId,
      message: `Không tìm thấy Color Style "${styleName}" đã nạp, bỏ qua border.`
    });
    return;
  }
  try {
    const style = await figma.importStyleByKeyAsync(styleItem.styleKey);
    await frame.setStrokeStyleIdAsync(style.id);
    if (!frame.strokeWeight) frame.strokeWeight = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    context.warnings.push({ nodeId, message: `Không thể áp dụng Color Style cho border "${styleItem.name}": ${message}` });
  }
}

// Fallback for when nothing loaded is a close enough match — the wireframe's own literal CSS
// color applied directly as a plain solid paint, not tied to any named Color Style.
function applyRawSolidFill(frame: FrameNode | TextNode, rgb: { r: number; g: number; b: number }): void {
  frame.fills = [{ type: "SOLID", color: rgb }];
}

function applyRawSolidStroke(frame: FrameNode, rgb: { r: number; g: number; b: number }): void {
  frame.strokes = [{ type: "SOLID", color: rgb }];
  if (!frame.strokeWeight) frame.strokeWeight = 1;
}

// A fixed, generic "elevation" look — never a precise reproduction of the wireframe's own
// box-shadow value, since Figma has no equivalent "loaded Effect Style" registry this plugin
// scans the way it does Paint/Text styles; just enough to visually separate a card/panel from
// its background the way the wireframe's own shadow was clearly meant to.
function applyShadowEffect(frame: FrameNode): void {
  frame.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.08 },
      offset: { x: 0, y: 1 },
      radius: 3,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }
  ];
}

async function applyTextStyle(
  textNode: TextNode,
  styleName: string | undefined,
  nodeId: string,
  context: RenderContext
): Promise<void> {
  const trimmedStyleName = styleName?.trim();
  const requested = (trimmedStyleName || DEFAULT_TEXT_STYLE).toLowerCase();
  const styleItem = context.textStylesByName.get(requested);
  if (!styleItem) {
    // Only warn when the AI asked for a specific style that's genuinely missing — falling back
    // to Figma's own default font when the catalog simply has no style named "Body Regular" is
    // expected, harmless behavior (validate.ts always treats that name as acceptable regardless
    // of what's actually in the catalog), not something worth flagging on every single text node.
    if (trimmedStyleName && trimmedStyleName.toLowerCase() !== DEFAULT_TEXT_STYLE.toLowerCase()) {
      context.warnings.push({
        nodeId,
        message: `Không tìm thấy Text Style "${trimmedStyleName}" đã nạp, dùng định dạng mặc định.`
      });
    }
    return;
  }
  try {
    const style = await figma.importStyleByKeyAsync(styleItem.styleKey);
    await textNode.setTextStyleIdAsync(style.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    context.warnings.push({ nodeId, message: `Không thể áp dụng Text Style "${styleItem.name}": ${message}` });
  }
}

async function renderNode(
  planNode: UIPlanNode,
  parent: FrameNode | InstanceNode,
  context: RenderContext,
  index?: number
): Promise<void> {
  if (planNode.layout) {
    const container = figma.createFrame();
    container.name = planNode.id;
    if (planNode.layout.autoLayout) {
      // A clean, evenly-spaced row/column was detected among this container's children (see
      // code.ts's detectAutoLayoutPattern) — convert it to a real, editable Auto Layout frame
      // instead of plain absolute positioning, while keeping its own OUTER size locked to the
      // exact measured frame (never let internal padding/gap rounding drift it).
      const al = planNode.layout.autoLayout;
      container.layoutMode = al.direction;
      container.paddingTop = al.paddingTop;
      container.paddingRight = al.paddingRight;
      container.paddingBottom = al.paddingBottom;
      container.paddingLeft = al.paddingLeft;
      container.itemSpacing = al.gap;
      container.primaryAxisSizingMode = "FIXED";
      container.counterAxisSizingMode = "FIXED";
      container.resize(Math.max(1, planNode.frame.width), Math.max(1, planNode.frame.height));
      container.x = planNode.frame.x;
      container.y = planNode.frame.y;
    } else {
      container.layoutMode = "NONE";
      applyFrameGeometry(container, planNode.frame);
    }
    insertAt(parent, container, index);
    if (isAutoLayoutParent(parent)) applyAutoLayoutChildSizing(container);
    if (planNode.layout.fill) {
      await applyFillStyle(container, planNode.layout.fill, planNode.id, context);
    } else if (planNode.layout.fillRgb) {
      applyRawSolidFill(container, planNode.layout.fillRgb);
    } else {
      // A container with no detected CSS background must be genuinely transparent — a freshly
      // created frame otherwise keeps Figma's own default opaque white fill, which then hides
      // whatever's actually meant to show through from behind it (a gray page background, a
      // parent's own color), making nearly everything look solid white regardless of the
      // wireframe's real colors.
      container.fills = [];
    }
    if (planNode.layout.strokeColor) {
      await applyStrokeStyle(container, planNode.layout.strokeColor, planNode.id, context);
    } else if (planNode.layout.strokeRgb) {
      applyRawSolidStroke(container, planNode.layout.strokeRgb);
    }
    if (planNode.layout.shadow) applyShadowEffect(container);
    if (planNode.layout.cornerRadius) container.cornerRadius = planNode.layout.cornerRadius;
    await delay(DRAW_STEP_DELAY_MS);
    for (const child of planNode.children ?? []) {
      await renderNode(child, container, context);
    }
    return;
  }

  if (planNode.text) {
    const textNode = figma.createText();
    textNode.name = planNode.id;
    try {
      await figma.loadFontAsync(textNode.fontName as FontName);
      textNode.characters = planNode.text.characters;
      await applyTextStyle(textNode, planNode.text.style, planNode.id, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      context.warnings.push({ nodeId: planNode.id, message: `Không thể tạo text: ${message}` });
    }
    if (planNode.text.fill) {
      await applyFillStyle(textNode, planNode.text.fill, planNode.id, context);
    } else if (planNode.text.fillRgb) {
      applyRawSolidFill(textNode, planNode.text.fillRgb);
    }
    insertAt(parent, textNode, index);
    applyTextSizing(textNode, planNode.frame, parent);
    await delay(DRAW_STEP_DELAY_MS);
    return;
  }

  const item = context.componentsById.get(planNode.componentId ?? "");
  if (!item) {
    context.warnings.push({
      nodeId: planNode.id,
      message: `Không tìm thấy component cho "${planNode.componentId}".`
    });
    return;
  }

  let instance: InstanceNode;
  try {
    instance = await instantiate(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    context.warnings.push({
      nodeId: planNode.id,
      message: `Không thể import "${item.name}": ${message}`
    });
    return;
  }

  insertAt(parent, instance, index);
  // Positioned at its measured HTML slot, but never resized — a component instance always keeps
  // its own shipped default width/height (the "never resize a component" rule), even though that
  // may not exactly match the slot's measured size. Inside a real Auto Layout parent, Figma
  // positions it itself once it has an explicit sizing mode, so x/y aren't set there at all.
  if (isAutoLayoutParent(parent)) {
    applyAutoLayoutChildSizing(instance);
  } else {
    instance.x = planNode.frame.x;
    instance.y = planNode.frame.y;
  }
  context.counters.instanceCount += 1;

  await applyProperties(instance, planNode.properties ?? {}, planNode.id, context);
  await delay(DRAW_STEP_DELAY_MS);

  // Component instances can't structurally accept new appended children in Figma
  // (appendChild into an instance throws) — any children here are simply not renderable.
  if (planNode.children?.length) {
    context.warnings.push({
      nodeId: planNode.id,
      message: `Bỏ qua ${planNode.children.length} node con của "${item.name}" — component instance không thể chứa node con tự thêm, hãy bọc trong 1 node layout riêng.`
    });
  }
}

function createRenderContext(
  components: ComponentRegistryItem[],
  textStyles: TextStyleRegistryItem[],
  paintStyles: PaintStyleRegistryItem[]
): RenderContext {
  return {
    componentsById: new Map(components.map((component) => [component.id, component])),
    textStylesByName: new Map(textStyles.map((style) => [style.name.toLowerCase(), style])),
    paintStylesByName: new Map(paintStyles.map((style) => [style.name.toLowerCase(), style])),
    warnings: [],
    counters: { instanceCount: 0 }
  };
}

export async function renderUIPlan(
  plan: UIPlan,
  components: ComponentRegistryItem[],
  screenSize: { width: number; height: number },
  textStyles: TextStyleRegistryItem[],
  paintStyles: PaintStyleRegistryItem[]
): Promise<RenderResult> {
  // Always build a fresh frame rather than cloning-and-patching a similar earlier one: the
  // HTML-parse-driven pipeline (see code.ts) produces a differently-shaped tree on every single
  // generation (the wireframe's own content varies each time), so index-based patching against
  // an old, differently-shaped frame reliably ended up removing far more of the new, correctly
  // built content than it reused — visually indistinguishable from "draws everything, then
  // deletes most of it" by the time patching finished.
  const context = createRenderContext(components, textStyles, paintStyles);

  const root = figma.createFrame();
  root.name = plan.screen.name;
  if (plan.screen.autoLayout) {
    // The top-level regions themselves (header, sidebar+content, ...) formed a clean row/column
    // — same rationale as a nested container's own `autoLayout` (see detectAutoLayoutPattern).
    const al = plan.screen.autoLayout;
    root.layoutMode = al.direction;
    root.paddingTop = al.paddingTop;
    root.paddingRight = al.paddingRight;
    root.paddingBottom = al.paddingBottom;
    root.paddingLeft = al.paddingLeft;
    root.itemSpacing = al.gap;
    root.primaryAxisSizingMode = "FIXED";
    root.counterAxisSizingMode = "FIXED";
  } else {
    root.layoutMode = "NONE";
  }
  // The standard configured screen size is always enforced regardless of what was detected —
  // never let a wireframe make the root frame itself something other than that fixed size.
  root.resize(screenSize.width, screenSize.height);
  // A screen frame should behave like a real viewport: content that doesn't fit gets clipped
  // at the edge, not left spilling out past the configured screen size.
  root.clipsContent = true;
  root.x = nextRootX();
  root.y = 0;
  root.setPluginData(GENERATED_PLUGIN_DATA_KEY, "1");
  figma.currentPage.appendChild(root);
  figma.viewport.scrollAndZoomIntoView([root]);
  if (plan.screen.fill) {
    await applyFillStyle(root, plan.screen.fill, "__screen__", context);
  } else if (plan.screen.fillRgb) {
    applyRawSolidFill(root, plan.screen.fillRgb);
  }
  await delay(DRAW_STEP_DELAY_MS);

  for (const planNode of plan.nodes) {
    await renderNode(planNode, root, context);
  }

  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);

  const { instanceCount } = context.counters;
  const summary =
    `Đã tạo ${instanceCount} component instance(s)` +
    (context.warnings.length ? `, ${context.warnings.length} cảnh báo.` : ".");
  if (instanceCount === 0) {
    figma.notify(summary, { error: true });
  } else {
    figma.notify(summary);
  }

  return { frame: root, instanceCount, warnings: context.warnings };
}

/**
 * Swaps specific already-rendered nodes for a real component instance, found by their STABLE id
 * (every node's Figma layer name is set to its own `UIPlanNode.id` at creation time — see
 * renderNode above) rather than by sibling position. This is what lets structure get drawn
 * first, in full, deterministically (via renderUIPlan) and component-mapping happen as a
 * distinct later pass on the SAME frame: unlike the index-based patching this plugin used to do
 * against a DIFFERENT, differently-shaped frame (which reliably ended up deleting far more than
 * it reused), matching by id against the very frame that was just built from the very same plan
 * is safe — every id is guaranteed to exist exactly once, and only the ids actually being
 * upgraded are touched at all.
 */
export async function upgradeNodesInFrame(
  frame: FrameNode,
  upgrades: Array<{ id: string; planNode: UIPlanNode }>,
  components: ComponentRegistryItem[],
  textStyles: TextStyleRegistryItem[],
  paintStyles: PaintStyleRegistryItem[]
): Promise<RenderResult> {
  const context = createRenderContext(components, textStyles, paintStyles);

  for (const { id, planNode } of upgrades) {
    const existing = frame.findOne((node) => node.name === id);
    const parent = existing?.parent;
    if (!existing || !parent || (parent.type !== "FRAME" && parent.type !== "INSTANCE")) {
      context.warnings.push({ nodeId: id, message: "Không tìm thấy đúng node để nâng cấp lên component thật." });
      continue;
    }
    const index = parent.children.indexOf(existing);
    existing.remove();
    await renderNode(planNode, parent, context, index);
  }

  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);

  return { frame, instanceCount: context.counters.instanceCount, warnings: context.warnings };
}
