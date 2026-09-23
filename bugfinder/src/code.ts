import type {
  DesignFixAction,
  NodeStyleInfo,
  PluginToUiMessage,
  ScannedNode,
  UiToPluginMessage,
} from "./types";
import { setLocale, t, type Locale } from "./i18n";

const API_KEY_STORAGE_KEY = "gemini-api-key";
const RULES_CONFIG_STORAGE_KEY = "rules-config";
const RULE_VALUES_STORAGE_KEY = "rule-values";
const CUSTOM_RULES_STORAGE_KEY = "custom-rules";
const IGNORE_PATTERNS_STORAGE_KEY = "ignore-patterns";
const UI_LOCALE_STORAGE_KEY = "ui-locale";
const COLOR_LIBRARY_STORAGE_KEY = "color-library-key";
const FIGMA_TOKEN_STORAGE_KEY = "figma-pat";
const MAX_TEXT_LENGTH = 4000;
const MAX_SCANNED_NODES = 3000;

/** Non-text node types worth linting for design-system compliance (buttons, cards, inputs...). Vectors/icons/groups are skipped as noise. */
const DESIGN_RELEVANT_TYPES = new Set(["FRAME", "COMPONENT", "INSTANCE", "RECTANGLE"]);

interface TraversalContext {
  insideInstance: boolean;
  insideIgnored: boolean;
}

function matchesIgnorePattern(name: string, patterns: string[]): boolean {
  const lower = name.toLowerCase();
  return patterns.some((p) => p && lower.includes(p.toLowerCase()));
}

function rectFullyContains(outer: Rect, inner: Rect): boolean {
  return (
    outer.x <= inner.x &&
    outer.y <= inner.y &&
    outer.x + outer.width >= inner.x + inner.width &&
    outer.y + outer.height >= inner.y + inner.height
  );
}

/** A shape counts as a "cover" only if it's fully opaque and not a clip mask — anything ambiguous (semi-transparent, decorative) is left alone rather than risk hiding real content. */
function isOpaqueCover(node: SceneNode): boolean {
  if (node.visible === false) return false;
  if ("isMask" in node && node.isMask) return false;
  if ("opacity" in node && typeof node.opacity === "number" && node.opacity < 0.95) return false;
  if (!("fills" in node)) return false;
  const fills = node.fills;
  if (!Array.isArray(fills)) return false;
  return (fills as Paint[]).some(
    (p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) >= 0.95
  );
}

/**
 * A layer with visible=true can still be effectively hidden if a LATER
 * sibling (rendered on top, per Figma's own z-order within a parent) is an
 * opaque shape whose bounding box fully covers it — common with leftover
 * draft content or duplicated states stacked in the same frame. Deliberately
 * conservative: only a fully opaque, fully covering, non-mask sibling counts;
 * partial overlap or a semi-transparent shape isn't enough to skip checking.
 */
// Above this, the occlusion check's O(n²) sibling scan (every node checked
// against every later sibling in the same parent) risks piling up hundreds
// of thousands of native property reads in one synchronous burst on a large
// parent (a data table row, an icon sheet...) — enough to have crashed
// Figma's plugin sandbox outright in practice. Occlusion-by-a-later-sibling
// is a rare cleanup-content edge case, not worth that risk at scale.
const OCCLUSION_SIBLING_LIMIT = 200;

function isOccludedBySibling(node: SceneNode): boolean {
  const parent = node.parent;
  if (!parent || !("children" in parent)) return false;
  const siblings = parent.children;
  if (siblings.length > OCCLUSION_SIBLING_LIMIT) return false;
  const box = node.absoluteBoundingBox;
  if (!box) return false;
  const myIndex = siblings.indexOf(node);
  for (let i = myIndex + 1; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (!isOpaqueCover(sibling)) continue;
    const siblingBox = sibling.absoluteBoundingBox;
    if (siblingBox && rectFullyContains(siblingBox, box)) return true;
  }
  return false;
}

figma.showUI(__html__, { width: 420, height: 640, themeColors: true });

function post(message: PluginToUiMessage) {
  figma.ui.postMessage(message);
}

function sendSelectionInfo() {
  const selection = figma.currentPage.selection;
  const names = selection.map((n) => n.name);
  // `label` only carries meaning for a single selection (the layer's own,
  // untranslatable name) — the UI builds its own localized count summary for
  // 0/multiple selections instead, so there's nothing language-specific to
  // send from this (main-thread) side.
  post({
    type: "selection-info",
    hasSelection: selection.length > 0,
    label: selection.length === 1 ? selection[0].name : "",
    count: selection.length,
    names,
  });
}

figma.on("selectionchange", sendSelectionInfo);

function rgbToHex(color: RGB): string {
  const to255 = (c: number) => Math.round(c * 255);
  return [to255(color.r), to255(color.g), to255(color.b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function extractSolidHexColors(paints: unknown): string[] {
  if (!Array.isArray(paints)) return [];
  return (paints as Paint[])
    .filter(
      (p): p is SolidPaint =>
        p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) >= 0.9
    )
    .map((p) => rgbToHex(p.color));
}

/**
 * "Linked" means this property follows a named Paint Style (fillStyleId) or
 * has at least one solid paint bound to a color Variable — either way, it's
 * traceable back to a library source, not a one-off raw color.
 */
function isPaintLinked(node: SceneNode, styleIdProp: "fillStyleId" | "strokeStyleId", paintsProp: "fills" | "strokes"): boolean {
  if (styleIdProp in node) {
    const styleId = (node as unknown as Record<string, unknown>)[styleIdProp];
    if (typeof styleId === "string" && styleId) return true;
  }
  if (paintsProp in node) {
    const paints = (node as unknown as Record<string, unknown>)[paintsProp];
    if (Array.isArray(paints)) {
      return (paints as Paint[]).some(
        (p) => p.type === "SOLID" && p.visible !== false && !!(p as SolidPaint).boundVariables?.color
      );
    }
  }
  return false;
}

function hasVisibleDropShadow(effects: unknown): boolean {
  if (!Array.isArray(effects)) return false;
  return (effects as Effect[]).some(
    (e) => e.type === "DROP_SHADOW" && e.visible !== false
  );
}

async function resolveEffectStyleName(node: SceneNode): Promise<string | null> {
  if (!("effectStyleId" in node) || !node.effectStyleId) return null;
  try {
    const style = await figma.getStyleByIdAsync(node.effectStyleId);
    return style?.name ?? null;
  } catch {
    return null;
  }
}

/**
 * Fields worth flagging when overridden inside a component instance — kept
 * deliberately narrow to padding, corner radius, stroke, and fill color, the
 * properties most likely to signal someone drifted from the Design System by
 * hand. Excludes everything else (text content, position, size, typography,
 * effects, opacity...), since those are either routinely/legitimately
 * customized per instance or too noisy to be worth surfacing here.
 */
const OVERRIDE_APPEARANCE_FIELDS = new Set<NodeChangeProperty>([
  "fills",
  "strokes",
  "strokeWeight",
  "cornerRadius",
  "topLeftRadius",
  "topRightRadius",
  "bottomLeftRadius",
  "bottomRightRadius",
  "paddingLeft",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
]);

/** Walks up from `target` to `ancestor`, recording each step's child index — the same path applies, walked back down from the main component, to find the node's un-overridden counterpart there. */
function findIndexPathFromAncestor(target: SceneNode, ancestor: SceneNode): number[] | null {
  const path: number[] = [];
  let current: BaseNode | null = target;
  while (current && current.id !== ancestor.id) {
    const parent: BaseNode | null = current.parent;
    if (!parent || !("children" in parent)) return null;
    const idx = (parent.children as SceneNode[]).indexOf(current as SceneNode);
    if (idx === -1) return null;
    path.unshift(idx);
    current = parent;
  }
  return current ? path : null;
}

function resolveNodeByPath(root: SceneNode, path: number[]): SceneNode | null {
  let node: SceneNode = root;
  for (const idx of path) {
    if (!("children" in node)) return null;
    const child = (node.children as SceneNode[])[idx];
    if (!child) return null;
    node = child;
  }
  return node;
}

/** Renders one overridden field's value for display — a hex color list for fills/strokes, otherwise a plain px number. Covers exactly `OVERRIDE_APPEARANCE_FIELDS`'s two shapes. */
function formatOverrideValue(node: SceneNode | null, field: NodeChangeProperty): string {
  if (!node) return "?";
  if (field === "fills" || field === "strokes") {
    const paints = field === "fills" ? ("fills" in node ? node.fills : undefined) : "strokes" in node ? node.strokes : undefined;
    const hexes = extractSolidHexColors(paints);
    return hexes.length > 0 ? hexes.map((h) => `#${h}`).join(", ") : "—";
  }
  const raw = (node as unknown as Record<string, unknown>)[field];
  return typeof raw === "number" ? `${raw}px` : "—";
}

/**
 * `InstanceNode.overrides` is Figma's own override tracker (one entry per
 * descendant node — or the instance root itself — that has a DIRECT
 * override), so this reads it straight rather than hand-diffing every
 * property against the main component. For each overridden field, the
 * "before" value is read off the corresponding node in the main component
 * (found by walking the same child-index path down from it), so the finding
 * can show exactly what changed, not just which property name changed.
 */
async function collectOverriddenAppearance(
  node: InstanceNode
): Promise<{ nodeName: string; changes: { field: string; before: string; after: string }[] }[]> {
  const out: { nodeName: string; changes: { field: string; before: string; after: string }[] }[] = [];
  try {
    const mainComponent = await node.getMainComponentAsync();
    for (const entry of node.overrides) {
      const fields = entry.overriddenFields.filter((f) => OVERRIDE_APPEARANCE_FIELDS.has(f));
      if (fields.length === 0) continue;
      const target = (await figma.getNodeByIdAsync(entry.id)) as SceneNode | null;
      if (!target) continue;
      const path = findIndexPathFromAncestor(target, node);
      const originalNode = mainComponent && path ? resolveNodeByPath(mainComponent, path) : null;
      // Figma's own override flag can stay set even when the current value
      // matches the main component again (e.g. changed then changed back,
      // or a detach/reattach) — trusting the flag alone produced false
      // positives on layers that were never actually changed. Only report a
      // field once its resolved value is confirmed to actually differ; skip
      // it entirely (rather than guessing) when the original can't be
      // resolved at all, since a "?" isn't evidence of a real change.
      const changes = fields
        .map((field) => ({
          field,
          before: formatOverrideValue(originalNode, field),
          after: formatOverrideValue(target, field),
        }))
        .filter((c) => c.before !== "?" && c.before !== c.after);
      if (changes.length === 0) continue;
      out.push({ nodeName: target.name, changes });
    }
  } catch {
    // if Figma can't resolve overrides for this instance, just skip the check for it
  }
  return out;
}

function buildStyleInfo(node: SceneNode): NodeStyleInfo {
  const fills = "fills" in node ? extractSolidHexColors(node.fills) : [];
  const strokes = "strokes" in node ? extractSolidHexColors(node.strokes) : [];
  const fillsLinked = isPaintLinked(node, "fillStyleId", "fills");
  const strokesLinked = isPaintLinked(node, "strokeStyleId", "strokes");
  const cornerRadius =
    "cornerRadius" in node && typeof node.cornerRadius === "number"
      ? node.cornerRadius
      : null;
  const layoutMode = "layoutMode" in node ? node.layoutMode : "NONE";
  const itemSpacing =
    "itemSpacing" in node && layoutMode !== "NONE" ? node.itemSpacing : null;
  const hasDropShadow = "effects" in node ? hasVisibleDropShadow(node.effects) : false;
  const childCount = "children" in node ? node.children.length : 0;
  const isAutoGap =
    "primaryAxisAlignItems" in node && node.primaryAxisAlignItems === "SPACE_BETWEEN";
  const isButtonRow =
    layoutMode === "HORIZONTAL" &&
    "children" in node &&
    node.children.length > 1 &&
    node.children.every((child) => /button/i.test(child.name));

  let fontFamilies: string[] = [];
  let fontSizes: number[] = [];
  if (node.type === "TEXT" && node.characters.length > 0) {
    // A mixed-style run (node.fontName === figma.mixed) can't be reduced to a
    // single value — read every styled segment instead so a wrong font/size
    // used in only PART of the text still gets caught, not silently skipped.
    const segments = node.getStyledTextSegments(["fontName", "fontSize"], 0, node.characters.length);
    fontFamilies = Array.from(new Set(segments.map((s) => s.fontName.family)));
    fontSizes = Array.from(new Set(segments.map((s) => s.fontSize)));
  }

  return {
    fills,
    strokes,
    fillsLinked,
    strokesLinked,
    cornerRadius,
    width: node.width,
    height: node.height,
    layoutMode: (layoutMode as NodeStyleInfo["layoutMode"]) || "NONE",
    itemSpacing,
    childCount,
    isAutoGap,
    isButtonRow,
    fontFamilies,
    fontSizes,
    hasDropShadow,
    // Filled in async afterward (see collectNodes' pendingWork) — resolving
    // overrides needs getMainComponentAsync/getNodeByIdAsync, which can't be
    // awaited inline without turning this whole synchronous tree walk async.
    overriddenAppearance: undefined,
  };
}

/**
 * Instances pulled from the library keep their own internal spacing
 * untouched most of the time — only a manual override on that specific
 * instance is worth flagging. Resolves the linked main
 * component's itemSpacing so the caller can both flag a mismatch and (since
 * the correct value is unambiguous here, unlike the general spacing scale)
 * offer a one-click fix back to it.
 */
async function resolveMainComponentSpacing(node: InstanceNode): Promise<number | undefined> {
  try {
    const main = await node.getMainComponentAsync();
    if (!main || !("layoutMode" in main) || main.layoutMode === "NONE") {
      return undefined;
    }
    return main.itemSpacing;
  } catch {
    return undefined;
  }
}

/**
 * Synchronous tree walk — no awaits, so it stays fast even for large
 * selections. Async style lookups (spacing-vs-main-component, effect style
 * names) are queued into `pendingWork` instead of awaited inline, and run in
 * parallel afterward (see scanSelection) so their round-trip latency doesn't
 * multiply by node count.
 */
function collectNodes(
  nodes: readonly SceneNode[],
  includeDesign: boolean,
  ignorePatterns: string[],
  ctx: TraversalContext,
  out: ScannedNode[],
  pendingWork: (() => Promise<void>)[]
) {
  for (const node of nodes) {
    if (out.length >= MAX_SCANNED_NODES) return;
    if (node.visible === false) continue;

    const isIgnoredSelf = matchesIgnorePattern(node.name, ignorePatterns);
    const insideIgnored = ctx.insideIgnored || isIgnoredSelf;
    // Unlike insideIgnored (user-configured, skips ONLY the design-system
    // rules by design — text checks intentionally run everywhere), an
    // occluded layer skips EVERY check: there's no point flagging spelling
    // or style on content nobody can actually see.
    const occluded = isOccludedBySibling(node);

    if (node.type === "TEXT") {
      const full = node.characters;
      const truncated = full.length > MAX_TEXT_LENGTH;
      out.push({
        id: node.id,
        name: node.name,
        type: node.type,
        text: truncated ? full.slice(0, MAX_TEXT_LENGTH) : full,
        truncated,
        style: includeDesign ? buildStyleInfo(node) : undefined,
        insideInstance: ctx.insideInstance,
        insideIgnored,
        occluded,
      });
    } else if (includeDesign && DESIGN_RELEVANT_TYPES.has(node.type)) {
      const style = buildStyleInfo(node);
      if (node.type === "INSTANCE" && style.layoutMode !== "NONE" && style.itemSpacing != null) {
        const itemSpacing = style.itemSpacing;
        pendingWork.push(async () => {
          const mainSpacing = await resolveMainComponentSpacing(node);
          if (mainSpacing != null) {
            style.spacingOverridden = mainSpacing !== itemSpacing;
            style.mainComponentSpacing = mainSpacing;
          }
        });
      }
      if (
        (node.type === "FRAME" || node.type === "RECTANGLE") &&
        style.fills.includes("FFFFFF") &&
        style.cornerRadius === 8
      ) {
        pendingWork.push(async () => {
          style.effectStyleName = await resolveEffectStyleName(node);
        });
      }
      if (node.type === "INSTANCE") {
        pendingWork.push(async () => {
          style.overriddenAppearance = await collectOverriddenAppearance(node);
        });
      }
      out.push({
        id: node.id,
        name: node.name,
        type: node.type,
        style,
        insideInstance: ctx.insideInstance,
        insideIgnored,
        occluded,
      });
    }

    if ("children" in node) {
      const childCtx: TraversalContext = {
        insideInstance:
          ctx.insideInstance || node.type === "INSTANCE" || node.type === "COMPONENT",
        insideIgnored,
      };
      collectNodes(node.children, includeDesign, ignorePatterns, childCtx, out, pendingWork);
    }
  }
}

async function scanSelection(includeDesign: boolean, ignorePatterns: string[]) {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify(t("code.selectAtLeastOneLayer"));
    post({ type: "scan-empty" });
    return;
  }

  const nodes: ScannedNode[] = [];
  const pendingWork: (() => Promise<void>)[] = [];
  collectNodes(
    selection,
    includeDesign,
    ignorePatterns,
    { insideInstance: false, insideIgnored: false },
    nodes,
    pendingWork
  );
  await Promise.all(pendingWork.map((run) => run()));

  if (nodes.length === 0) {
    figma.notify(t("code.noTextLayerFound"));
    post({ type: "scan-empty" });
    return;
  }

  if (nodes.length >= MAX_SCANNED_NODES) {
    figma.notify(t("code.tooManyLayers", { max: MAX_SCANNED_NODES }));
  }

  post({ type: "scanned-nodes", nodes });
}

/**
 * Walks a selected root looking only for TEXT nodes, keyed by a structural
 * "path" (sibling index at each level down to the text node, e.g. "0.2.1")
 * instead of by node id or by name — the whole point is matching the "same"
 * element across two SEPARATE trees (two different frames), where node ids
 * never match. Layer NAME was tried first but doesn't work for this file's
 * layers: Figma auto-renames a text layer to match its own content whenever
 * the name hasn't been manually pinned, so the very act of syncing text
 * between the two sides changes the matching key underneath it on the next
 * scan. Position in the tree isn't affected by an edit to the text itself,
 * only by actually reordering/inserting/deleting layers — a much rarer edit
 * than typing new content.
 */
function collectComparePaths(
  nodes: readonly SceneNode[],
  pathPrefix: string,
  out: { path: string; text: string; nodeId: string }[]
) {
  nodes.forEach((node, index) => {
    if (node.visible === false) return;
    const path = pathPrefix ? `${pathPrefix}.${index}` : `${index}`;

    if (node.type === "TEXT") {
      out.push({ path, text: node.characters, nodeId: node.id });
    }
    if ("children" in node) {
      collectComparePaths(node.children, path, out);
    }
  });
}

function scanForCompare() {
  const selection = figma.currentPage.selection;
  if (selection.length !== 2) {
    const message = t("code.compareNeedExactly2", { count: selection.length });
    figma.notify(message, { error: true });
    post({ type: "compare-error", message });
    return;
  }

  const [nodeA, nodeB] = selection;
  const textsA: { path: string; text: string; nodeId: string }[] = [];
  const textsB: { path: string; text: string; nodeId: string }[] = [];
  collectComparePaths("children" in nodeA ? nodeA.children : [], "", textsA);
  collectComparePaths("children" in nodeB ? nodeB.children : [], "", textsB);
  // The root itself might be a bare text node (unlikely for a "frame" but
  // cheap to support) rather than only its descendants.
  if (nodeA.type === "TEXT") textsA.unshift({ path: "root", text: nodeA.characters, nodeId: nodeA.id });
  if (nodeB.type === "TEXT") textsB.unshift({ path: "root", text: nodeB.characters, nodeId: nodeB.id });

  post({
    type: "compare-scanned",
    sideA: { id: nodeA.id, name: nodeA.name, texts: textsA },
    sideB: { id: nodeB.id, name: nodeB.name, texts: textsB },
  });
}

async function selectNode(nodeId: string) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.removed || !("resize" in node)) {
    figma.notify(t("code.layerNoLongerExists"));
    return;
  }

  figma.currentPage.selection = [node as SceneNode];
  figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
}

async function deleteLayer(nodeId: string) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.removed || node.type === "DOCUMENT" || node.type === "PAGE") {
    const error = t("code.layerNoLongerExists");
    figma.notify(error, { error: true });
    post({ type: "delete-layer-result", nodeId, success: false, error });
    return;
  }

  try {
    node.remove();
    figma.notify(t("code.layerDeleted"));
    post({ type: "delete-layer-result", nodeId, success: true });
  } catch (err) {
    const error = err instanceof Error ? err.message : t("code.unknownError");
    figma.notify(error, { error: true });
    post({ type: "delete-layer-result", nodeId, success: false, error });
  }
}

/**
 * Same idea as findLinkedColorMatch's need to tolerate Unicode normalization
 * mismatches: `original` usually comes from a fresh scan of the SAME node so
 * it should byte-match exactly, but an AI-sourced suggestion is text Gemini
 * re-typed into JSON rather than a literal excerpt — a diacritic can come
 * back re-composed differently (NFC vs NFD) even though it reads identically,
 * which would make a plain indexOf silently report "not found" on content
 * that, to the user, never changed. Tries an exact match first (cheap, covers
 * the overwhelming majority of cases), then falls back to a normalization-
 * tolerant sliding search that still returns RAW indices into `live` so the
 * caller's delete/insert lands in the right place.
 */
function findTextRange(
  live: string,
  target: string,
  fromEnd: boolean
): { start: number; end: number } | null {
  const exact = fromEnd ? live.lastIndexOf(target) : live.indexOf(target);
  if (exact !== -1) return { start: exact, end: exact + target.length };

  const normTarget = target.normalize("NFC");
  if (!normTarget) return null;

  const matchAt = (start: number): number => {
    const maxEnd = Math.min(live.length, start + normTarget.length + 8);
    for (let end = start + 1; end <= maxEnd; end++) {
      if (live.slice(start, end).normalize("NFC") === normTarget) return end;
    }
    return -1;
  };

  if (fromEnd) {
    for (let start = live.length; start >= 0; start--) {
      const end = matchAt(start);
      if (end !== -1) return { start, end };
    }
  } else {
    for (let start = 0; start <= live.length; start++) {
      const end = matchAt(start);
      if (end !== -1) return { start, end };
    }
  }
  return null;
}

async function applyFix(
  nodeId: string,
  original: string,
  suggestion: string,
  matchFromEnd?: boolean
) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.removed || node.type !== "TEXT") {
    const error = t("code.layerNotFound");
    figma.notify(error, { error: true });
    post({ type: "apply-fix-result", nodeId, original, success: false, error });
    return;
  }

  const textNode = node as TextNode;
  // A short/common substring (e.g. a single trailing space) can also occur
  // earlier in ordinary text — for findings anchored to the end (trailing
  // whitespace), search from the end so the fix lands on the right spot.
  const range = findTextRange(textNode.characters, original, !!matchFromEnd);
  const idx = range?.start ?? -1;
  if (idx === -1) {
    const error = t("code.originalContentChanged");
    figma.notify(error, { error: true });
    post({ type: "apply-fix-result", nodeId, original, success: false, error });
    return;
  }

  try {
    // Use the RAW matched length (range.end), not original.length — they can
    // differ when the match only succeeded via normalization-tolerant
    // fallback (a decomposed accent takes more code points than its
    // precomposed form).
    const end = range!.end;
    const foundText = textNode.characters.slice(idx, end);

    // Trim to the minimal actually-differing span (common prefix/suffix
    // between what's there and what it should become) instead of blindly
    // replacing the WHOLE matched range — a wholesale replace loses
    // per-character styling on parts that didn't even change, which is
    // fatal for text with multiple colors/fonts mixed in one layer (a
    // multi-color range reports as "mixed" and can't be captured/reapplied
    // as a single fill at all). Leaving the untouched prefix/suffix alone
    // means their original styling is never disturbed in the first place.
    let prefixLen = 0;
    const maxPrefix = Math.min(foundText.length, suggestion.length);
    while (prefixLen < maxPrefix && foundText[prefixLen] === suggestion[prefixLen]) prefixLen++;
    let suffixLen = 0;
    const maxSuffix = Math.min(foundText.length - prefixLen, suggestion.length - prefixLen);
    while (
      suffixLen < maxSuffix &&
      foundText[foundText.length - 1 - suffixLen] === suggestion[suggestion.length - 1 - suffixLen]
    ) {
      suffixLen++;
    }
    const editStart = idx + prefixLen;
    const editEnd = end - suffixLen;
    const insertText = suggestion.slice(prefixLen, suggestion.length - suffixLen);

    const fonts = textNode.getRangeAllFontNames(idx, end);
    await Promise.all(fonts.map((font) => figma.loadFontAsync(font)));

    if (editStart === editEnd && insertText === "") {
      // foundText already equals suggestion — nothing to change.
    } else {
      // insertCharacters' "AFTER" style inheritance has nothing to inherit
      // from when the edited range extends to the very end of the text (no
      // character exists after it) — capture the range's own fill first and
      // reapply it explicitly so color never shifts. Only possible when
      // there's a non-empty range to sample from and it isn't itself a
      // multi-color span; a pure insertion (editStart === editEnd) falls
      // back to "AFTER" inheriting from its immediate neighbor, which is
      // reliable since there IS real adjacent text in that case.
      const originalFills = editEnd > editStart ? textNode.getRangeFills(editStart, editEnd) : null;
      textNode.deleteCharacters(editStart, editEnd);
      textNode.insertCharacters(editStart, insertText, "AFTER");
      if (insertText.length > 0 && originalFills != null && originalFills !== figma.mixed) {
        textNode.setRangeFills(editStart, editStart + insertText.length, originalFills);
      }
    }

    // Confirm the edit actually landed rather than trusting the API calls
    // silently succeeded — catches any edge case (Unicode normalization,
    // an unexpected style/lock on this specific node...) that would
    // otherwise report success while the visible text never changed.
    if (textNode.characters.substr(idx, suggestion.length) !== suggestion) {
      throw new Error(t("code.fixAppliedButNoChange"));
    }
    figma.currentPage.selection = [textNode];
    figma.viewport.scrollAndZoomIntoView([textNode]);
    figma.notify(t("code.fixApplied"));
    post({ type: "apply-fix-result", nodeId, original, success: true });
  } catch (err) {
    const error = err instanceof Error ? err.message : t("code.unknownError");
    figma.notify(error, { error: true });
    post({ type: "apply-fix-result", nodeId, original, success: false, error });
  }
}

/**
 * Effect styles pulled from an external team library aren't returned by
 * getLocalEffectStylesAsync (that only lists styles owned by this file) — so
 * as a fallback, look for any node already on the page using a style with the
 * matching name and reuse its style id. That covers the common case where the
 * correct shadow style is already applied somewhere else in the same file.
 */
async function findEffectStyleIdByName(name: string): Promise<string | null> {
  try {
    const localStyles = await figma.getLocalEffectStylesAsync();
    const localMatch = localStyles.find((s) => s.name === name);
    if (localMatch) return localMatch.id;
  } catch {
    // fall through to the page-scan fallback below
  }

  try {
    const candidates = figma.currentPage.findAll(
      (n) => "effectStyleId" in n && !!n.effectStyleId
    );
    for (const n of candidates) {
      const id = (n as SceneNode & { effectStyleId: string }).effectStyleId;
      const style = await figma.getStyleByIdAsync(id);
      if (style?.name === name) return id;
    }
  } catch {
    // give up — caller reports "style not found"
  }
  return null;
}

function paintMatchesHex(paint: Paint, hex: string): boolean {
  return paint.type === "SOLID" && paint.visible !== false && rgbToHex(paint.color) === hex;
}

type ColorMatch = { kind: "style"; id: string } | { kind: "variable"; id: string };

/**
 * When the user picks a specific team library collection (see
 * selectColorLibrary), raw colors are matched against ITS actual variable
 * values first — this is what makes the match precise in files that only
 * consume a remote library and have no local Styles/Variables of their own.
 * Keyed by hex so lookup is O(1); rebuilt only when the selection changes.
 */
let libraryColorIndex: Map<string, ColorMatch> | null = null;

function variableValueMatchesHex(value: unknown, hex: string): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    "r" in (value as object) &&
    rgbToHex(value as RGB) === hex
  );
}

function variableValueMatchesHexAny(value: unknown): boolean {
  return !!value && typeof value === "object" && "r" in (value as object);
}

function isVariableAlias(value: unknown): value is VariableAlias {
  return !!value && typeof value === "object" && (value as VariableAlias).type === "VARIABLE_ALIAS";
}

/**
 * Design-system tokens are often layered (a semantic "Text/Secondary"
 * variable aliasing a primitive "Gray/600"), so a raw color can match a
 * variable several alias-hops away from where the actual RGBA value lives.
 * Follows the chain (bounded depth as a cycle guard) instead of only
 * comparing the variable's own direct value.
 */
async function variableResolvesToHex(variable: Variable, hex: string, depth = 0): Promise<boolean> {
  if (depth > 5) return false;
  for (const value of Object.values(variable.valuesByMode)) {
    if (variableValueMatchesHex(value, hex)) return true;
    if (isVariableAlias(value)) {
      const aliased = await figma.variables.getVariableByIdAsync(value.id);
      if (aliased && (await variableResolvesToHex(aliased, hex, depth + 1))) return true;
    }
  }
  return false;
}

/**
 * We don't know what a team calls their "Text Primary" style/variable in this
 * particular file, only its rendered hex value — so matching is by actual
 * COLOR rather than by name. Checks Paint Styles then color Variables (a
 * solid can be linked either way in Figma), both scoped to
 * `getLocalPaintStylesAsync`/`getLocalVariablesAsync` — deliberately NOT a
 * page-wide node scan (`figma.currentPage.findAll`), which froze the plugin
 * on any file with more than a few thousand nodes.
 */
async function findLinkedColorMatch(hex: string): Promise<ColorMatch | null> {
  const libraryMatch = libraryColorIndex?.get(hex);
  if (libraryMatch) return libraryMatch;

  try {
    const localStyles = await figma.getLocalPaintStylesAsync();
    const match = localStyles.find((s) => s.paints.some((p) => paintMatchesHex(p, hex)));
    if (match) return { kind: "style", id: match.id };
  } catch {
    // fall through
  }

  try {
    const localVars = await figma.variables.getLocalVariablesAsync("COLOR");
    for (const variable of localVars) {
      if (await variableResolvesToHex(variable, hex)) return { kind: "variable", id: variable.id };
    }
  } catch {
    // give up — caller reports "not found"
  }
  return null;
}

async function applyColorFix(node: BaseNode, hex: string, kind: "fill" | "stroke"): Promise<void> {
  const paintsProp = kind === "fill" ? "fills" : "strokes";
  if (!(paintsProp in node)) {
    throw new Error(kind === "fill" ? t("code.noFill") : t("code.noStroke"));
  }

  const match = await findLinkedColorMatch(hex);
  if (!match) {
    throw new Error(t("code.noStyleOrVariableFound", { hex }));
  }

  if (match.kind === "style") {
    if (kind === "fill") await (node as unknown as MinimalFillsMixin).setFillStyleIdAsync(match.id);
    else await (node as unknown as MinimalStrokesMixin).setStrokeStyleIdAsync(match.id);
    return;
  }

  const variable = await figma.variables.getVariableByIdAsync(match.id);
  if (!variable) {
    throw new Error(t("code.noVariableFound"));
  }
  const mixin = node as unknown as Record<string, Paint[]>;
  const paints = mixin[paintsProp];
  const idx = paints.findIndex((p) => paintMatchesHex(p, hex));
  if (idx === -1) {
    throw new Error(t("code.noMatchingColorOnLayer"));
  }
  const newPaints = paints.slice();
  newPaints[idx] = figma.variables.setBoundVariableForPaint(paints[idx] as SolidPaint, "color", variable);
  mixin[paintsProp] = newPaints;
}

async function applyFontFamilyFix(node: TextNode, fontFamily: string): Promise<void> {
  const segments = node.getStyledTextSegments(["fontName"], 0, node.characters.length);
  for (const seg of segments) {
    const target: FontName = { family: fontFamily, style: seg.fontName.style };
    await figma.loadFontAsync(seg.fontName);
    await figma.loadFontAsync(target);
    node.setRangeFontName(seg.start, seg.end, target);
  }
}

async function applyDesignFix(nodeId: string, original: string, designFix: DesignFixAction) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.removed) {
    const error = t("code.layerNotFound");
    figma.notify(error, { error: true });
    post({ type: "apply-design-fix-result", nodeId, original, success: false, error });
    return;
  }

  try {
    switch (designFix.kind) {
      case "font-family": {
        if (node.type !== "TEXT") throw new Error(t("code.notText"));
        await applyFontFamilyFix(node, designFix.fontFamily);
        break;
      }
      case "height": {
        if (!("resize" in node)) throw new Error(t("code.cannotResize"));
        node.resize(node.width, designFix.height);
        break;
      }
      case "corner-radius": {
        if (
          node.type !== "FRAME" &&
          node.type !== "RECTANGLE" &&
          node.type !== "COMPONENT" &&
          node.type !== "INSTANCE"
        ) {
          throw new Error(t("code.cannotRadius"));
        }
        node.cornerRadius = designFix.radius;
        break;
      }
      case "item-spacing": {
        if (!("itemSpacing" in node)) throw new Error(t("code.notAutoLayout"));
        node.itemSpacing = designFix.spacing;
        break;
      }
      case "effect-style": {
        if (!("effectStyleId" in node)) throw new Error(t("code.noEffectStyleSupport"));
        const styleId = await findEffectStyleIdByName(designFix.styleName);
        if (!styleId) {
          throw new Error(t("code.effectStyleNotFound", { name: designFix.styleName }));
        }
        await node.setEffectStyleIdAsync(styleId);
        break;
      }
      case "stroke-color": {
        await applyColorFix(node, designFix.hex, "stroke");
        break;
      }
    }
    if ("resize" in node) {
      figma.currentPage.selection = [node as SceneNode];
      figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
    }
    figma.notify(t("code.fixApplied"));
    post({ type: "apply-design-fix-result", nodeId, original, success: true });
  } catch (err) {
    const error = err instanceof Error ? err.message : t("code.unknownError");
    figma.notify(error, { error: true });
    post({ type: "apply-design-fix-result", nodeId, original, success: false, error });
  }
}

async function sendApiKey() {
  const key = (await figma.clientStorage.getAsync(API_KEY_STORAGE_KEY)) || "";
  post({ type: "api-key", key });
}

async function saveApiKey(key: string) {
  await figma.clientStorage.setAsync(API_KEY_STORAGE_KEY, key);
  figma.notify(t("code.apiKeySaved"));
}

async function sendFigmaToken() {
  const token = (await figma.clientStorage.getAsync(FIGMA_TOKEN_STORAGE_KEY)) || "";
  post({ type: "figma-token", token });
}

async function saveFigmaToken(token: string) {
  await figma.clientStorage.setAsync(FIGMA_TOKEN_STORAGE_KEY, token);
  figma.notify(t("code.figmaTokenSaved"));
}

async function sendRulesConfig() {
  const config =
    (await figma.clientStorage.getAsync(RULES_CONFIG_STORAGE_KEY)) || {};
  post({ type: "rules-config", config });
}

async function saveRulesConfig(config: Record<string, boolean>) {
  await figma.clientStorage.setAsync(RULES_CONFIG_STORAGE_KEY, config);
}

async function sendRuleValues() {
  const values =
    (await figma.clientStorage.getAsync(RULE_VALUES_STORAGE_KEY)) || {};
  post({ type: "rule-values", values });
}

async function saveRuleValues(values: Record<string, string>) {
  await figma.clientStorage.setAsync(RULE_VALUES_STORAGE_KEY, values);
}

async function sendCustomRules() {
  const rules =
    (await figma.clientStorage.getAsync(CUSTOM_RULES_STORAGE_KEY)) || "";
  post({ type: "custom-rules", rules });
}

async function saveCustomRules(rules: string) {
  await figma.clientStorage.setAsync(CUSTOM_RULES_STORAGE_KEY, rules);
  figma.notify(t("code.customRulesSaved"));
}

async function sendIgnorePatterns() {
  const patterns = await figma.clientStorage.getAsync(IGNORE_PATTERNS_STORAGE_KEY);
  post({ type: "ignore-patterns", patterns: patterns ?? "" });
}

async function saveIgnorePatterns(patterns: string) {
  await figma.clientStorage.setAsync(IGNORE_PATTERNS_STORAGE_KEY, patterns);
  figma.notify(t("code.ignorePatternsSaved"));
}

async function sendUiLocale() {
  const stored = await figma.clientStorage.getAsync(UI_LOCALE_STORAGE_KEY);
  const locale: Locale = stored === "en" ? "en" : "vi";
  setLocale(locale);
  post({ type: "ui-locale", locale });
}

async function saveUiLocale(locale: Locale) {
  setLocale(locale);
  await figma.clientStorage.setAsync(UI_LOCALE_STORAGE_KEY, locale);
}

/**
 * A library commonly publishes color tokens across several collections (a
 * "Primitives" collection aliased into a "Semantic" one, for example), so the
 * picker lets the user pick just the LIBRARY — every collection belonging to
 * it is indexed together, rather than making them pick one collection at a
 * time. `getVariablesInLibraryCollectionAsync` only returns name/key/type,
 * not the actual color value — that requires importing each variable into
 * the file (the standard way to consume a published library variable), after
 * which its real `valuesByMode` becomes readable like any local variable.
 */
async function buildLibraryColorIndex(libraryName: string) {
  post({ type: "color-library-status", status: "loading" });
  try {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    const matchingCollections = collections.filter((c) => c.libraryName === libraryName);
    const index = new Map<string, ColorMatch>();
    for (const collection of matchingCollections) {
      const libraryVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key);
      for (const libVar of libraryVars) {
        if (libVar.resolvedType !== "COLOR") continue;
        try {
          const imported = await figma.variables.importVariableByKeyAsync(libVar.key);
          for (const value of Object.values(imported.valuesByMode)) {
            if (variableValueMatchesHexAny(value)) {
              const hex = rgbToHex(value as RGB);
              if (!index.has(hex)) index.set(hex, { kind: "variable", id: imported.id });
            }
          }
        } catch {
          // skip variables that fail to import, keep indexing the rest
        }
      }
    }
    libraryColorIndex = index;
    post({ type: "color-library-status", status: "ready", colorCount: index.size });
  } catch (err) {
    libraryColorIndex = null;
    const error = err instanceof Error ? err.message : String(err);
    post({ type: "color-library-status", status: "error", error });
  }
}

async function sendColorLibraries() {
  let libraryNames: string[] = [];
  try {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    libraryNames = Array.from(new Set(collections.map((c) => c.libraryName))).sort((a, b) =>
      a.localeCompare(b)
    );
  } catch (err) {
    // Surface the real failure instead of silently reporting "no libraries" —
    // an empty list and a rejected call look identical to the user otherwise.
    const error = err instanceof Error ? err.message : String(err);
    console.error("getAvailableLibraryVariableCollectionsAsync failed:", err);
    post({ type: "color-library-status", status: "error", error });
  }
  const selectedLibrary = (await figma.clientStorage.getAsync(COLOR_LIBRARY_STORAGE_KEY)) || null;
  post({ type: "color-libraries", libraries: libraryNames, selectedLibrary });
  if (selectedLibrary && libraryNames.includes(selectedLibrary)) {
    void buildLibraryColorIndex(selectedLibrary);
  }
}

async function selectColorLibrary(libraryName: string | null) {
  await figma.clientStorage.setAsync(COLOR_LIBRARY_STORAGE_KEY, libraryName ?? "");
  if (!libraryName) {
    libraryColorIndex = null;
    post({ type: "color-library-status", status: "idle" });
    return;
  }
  await buildLibraryColorIndex(libraryName);
}

figma.ui.onmessage = (msg: UiToPluginMessage) => {
  switch (msg.type) {
    case "scan-selection":
      void scanSelection(msg.includeDesign, msg.ignorePatterns);
      break;
    case "get-api-key":
      void sendApiKey();
      break;
    case "save-api-key":
      void saveApiKey(msg.key);
      break;
    case "select-node":
      void selectNode(msg.nodeId);
      break;
    case "delete-layer":
      void deleteLayer(msg.nodeId);
      break;
    case "apply-fix":
      void applyFix(msg.nodeId, msg.original, msg.suggestion, msg.matchFromEnd);
      break;
    case "apply-design-fix":
      void applyDesignFix(msg.nodeId, msg.original, msg.designFix);
      break;
    case "get-rules-config":
      void sendRulesConfig();
      break;
    case "save-rules-config":
      void saveRulesConfig(msg.config);
      break;
    case "get-rule-values":
      void sendRuleValues();
      break;
    case "save-rule-values":
      void saveRuleValues(msg.values);
      break;
    case "get-custom-rules":
      void sendCustomRules();
      break;
    case "save-custom-rules":
      void saveCustomRules(msg.rules);
      break;
    case "get-ignore-patterns":
      void sendIgnorePatterns();
      break;
    case "save-ignore-patterns":
      void saveIgnorePatterns(msg.patterns);
      break;
    case "get-selection-info":
      sendSelectionInfo();
      break;
    case "scan-compare":
      scanForCompare();
      break;
    case "get-ui-locale":
      void sendUiLocale();
      break;
    case "save-ui-locale":
      void saveUiLocale(msg.locale);
      break;
    case "get-color-libraries":
      void sendColorLibraries();
      break;
    case "select-color-library":
      void selectColorLibrary(msg.libraryName);
      break;
    case "get-figma-token":
      void sendFigmaToken();
      break;
    case "save-figma-token":
      void saveFigmaToken(msg.token);
      break;
  }
};
