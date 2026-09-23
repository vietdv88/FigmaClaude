import type {
  ComponentPropertyInfo,
  ComponentRegistryItem,
  DesignRules,
  LeafElement,
  LibraryProfile,
  TextStyleRegistryItem
} from "./types";

export interface CatalogEntry {
  componentId: string;
  library: string;
  semanticId: string;
  aiDescription: string;
  nodeType: "COMPONENT" | "COMPONENT_SET";
  /** The ONLY properties this exact component supports — see "## Available components" below. */
  properties: ComponentPropertyInfo[];
}

export function buildComponentCatalog(
  components: ComponentRegistryItem[],
  libraries: LibraryProfile[]
): CatalogEntry[] {
  const libraryNameById = new Map(libraries.map((library) => [library.id, library.name]));
  return components.map((component) => ({
    componentId: component.id,
    library: libraryNameById.get(component.libraryId) ?? component.libraryId,
    semanticId: component.semanticId,
    aiDescription: component.aiDescription,
    nodeType: component.nodeType,
    properties: component.properties ?? []
  }));
}

export function isIconComponent(component: ComponentRegistryItem): boolean {
  const onIconsPage = (component.pageName ?? "").trim().toLowerCase() === "icons";
  if (!onIconsPage) return false;
  // A component that itself exposes an icon-swap slot (typically named "Icon Swap" — Size/
  // Color/Filled plus an INSTANCE_SWAP "Icon" property) is a WRAPPER meant to be used AS a
  // componentId with that property then filled in, never a raw icon graphic itself — even
  // though it commonly lives on the same "Icons" page as the actual icon glyphs it swaps
  // between. Misclassifying it as a plain icon (page name alone was the only signal before)
  // meant it was never offered as an assignable component at all, and was explicitly
  // instructed as forbidden to assign directly — exactly backwards from how it needs to be used.
  const hasOwnIconSwapProperty = (component.properties ?? []).some((prop) => prop.type === "INSTANCE_SWAP");
  return !hasOwnIconSwapProperty;
}

/**
 * Freeform (no schema, no JSON) extraction pass: describe a reference screenshot exhaustively
 * as a text outline ONCE, so every later step (mockup, component-replace) works from the exact
 * same literal description instead of each independently re-reading the image and potentially
 * missing/mis-reading something differently each time.
 */
export function buildImageDescriptionPrompt(): string {
  return [
    "You are given a screenshot of a UI screen. Describe it exhaustively and literally as a structured, nested",
    "outline (Markdown bullets) — this description will be used by LATER steps to help build the UI, so anything",
    "you don't capture here is much more likely to be missed downstream.",
    "",
    "For every region (header, sidebar, tab bar, search bar, main content, footer, etc.) and every major",
    "sub-group inside each region, note: what it is, roughly where it sits (top/left/right/center, stacked or",
    "side by side with what), and every piece of literal visible text inside it, transcribed verbatim (labels,",
    "headings, button captions, table headers/values, placeholder text). Do not summarize or skip anything — list",
    "every row of a table/list, every card, every navigation item, every icon's apparent purpose.",
    "",
    "Respond with ONLY the nested outline. No commentary, no JSON, just the structured description."
  ].join("\n");
}

function composeRulesSection(rules: DesignRules): string {
  const sections: Array<[string, string]> = [
    ["Chung (áp dụng cho mọi màn hình)", rules.general],
    ["Tổng quan / Dashboard", rules.overview],
    ["Danh sách", rules.list],
    ["Chi tiết", rules.detail]
  ];
  const nonEmpty = sections.filter(([, text]) => text.trim());
  if (!nonEmpty.length) return "(no rules provided)";
  return nonEmpty.map(([heading, text]) => `### ${heading}\n${text.trim()}`).join("\n\n");
}

/**
 * A freeform (no schema) design pass: sketch a complete, detailed wireframe of the screen as
 * plain HTML/CSS — a format the model has seen vastly more of, and is far more fluent and
 * thorough in, than our bespoke UIPlan JSON schema. Doing structure-and-content decisions here,
 * unconstrained by a component catalog, keeps this step from being pulled toward the same
 * "collapse into a sparse/half-finished result" failure that asking for catalog-grounded JSON
 * directly reliably produced. The resulting HTML is then parsed DETERMINISTICALLY (see
 * types.ts's HtmlNode, parsed by the UI iframe's real DOMParser) into the UIPlan tree structure
 * — no AI call ever has to reproduce this structure faithfully; see buildLeafMappingSystemPrompt
 * below for the one AI call that's still needed, to fit real components onto its leaves.
 */
export function buildHtmlWireframePrompt(
  rules: DesignRules,
  screenSize: { width: number; height: number },
  hasImage: boolean
): string {
  const rulesSection = composeRulesSection(rules);
  const sections = [
    [
      "You are a UI designer sketching a complete, detailed wireframe of a screen as plain HTML with inline CSS",
      "(a single `<style>` block plus semantic HTML elements) — NOT for a browser, purely as an intermediate design",
      "artifact that a separate step will translate into a real design system afterward. Because of that, you don't",
      "need to worry about any component catalog or property names here at all — just design the screen as",
      "completely and concretely as you would in HTML/CSS, the format you're most fluent and thorough in."
    ].join(" "),
    "## Canvas size",
    `Design for a fixed canvas ${screenSize.width}×${screenSize.height}px (a <body> or root <div> of that size).`,
    "## Task",
    [
      "Build the ENTIRE screen, big structure down to full leaf detail — every region (header, sidebar, tab bar,",
      "search/filter bar, main content, footer, etc.), and inside each region every real piece: every button,",
      "input field, label, nav item, card, table row/column, list item. Use semantic tags/classes that hint at each",
      'element\'s role (e.g. `<header class="header">`, `<nav class="sidebar">`, `<button class="btn-primary">`,',
      '`<input class="text-field">`, `<table>`/`<tr>`/`<td>`, `<ul>`/`<li>`) — a later step uses these hints to map',
      "each element onto a real design-system component, so being structurally specific and accurate matters far",
      "more than making it visually polished.",
      "Fill in REAL, literal content everywhere — actual headings, labels, button captions, table values, nav item",
      'names — never a generic placeholder like "Lorem ipsum" or "Item 1" unless the request is genuinely that',
      "generic. Do not stop at 2-3 example rows/items when the request implies a fuller list — build out a",
      "realistic, complete amount of content.",
      hasImage
        ? "An image of a reference layout is attached — reproduce its exact structure, arrangement, and every piece of literal visible text as closely as HTML/CSS allows; scan it deliberately region by region so nothing is missed."
        : "Infer a complete, realistic structure and content for the kind of screen requested."
    ].join(" "),
    "## Design rules (for spacing/structure guidance only — a later step maps colors/fonts onto the real design system)",
    rulesSection,
    "## Output",
    [
      "Respond with ONLY the HTML (a full `<html>` document, or just the root element and its `<style>` block —",
      "either is fine). No markdown fences, no commentary, no explanation before or after."
    ].join(" ")
  ];
  return sections.join("\n\n");
}

/**
 * The one remaining AI call in the HTML-first pipeline: a FIXED, already-correct list of leaf
 * elements (deterministically pulled from the parsed HTML wireframe — see types.ts's
 * LeafElement) needs each one mapped onto a real catalog component, or a plain text fallback.
 * Deliberately NOT asking for a nested tree here — the caller already built the exact tree
 * structure from the parsed HTML itself, so there's nothing left for the model to get wrong
 * about structure, only which component (if any) fits each individual piece.
 */
export function buildLeafMappingSystemPrompt(
  rules: DesignRules,
  libraries: LibraryProfile[],
  components: ComponentRegistryItem[],
  textStyles: TextStyleRegistryItem[],
  leaves: LeafElement[]
): string {
  const catalog = buildComponentCatalog(components, libraries);
  const rulesSection = composeRulesSection(rules);
  const librarySummaries = libraries.map((library) => ({
    name: library.name,
    description: library.description?.trim() || "(no description provided)"
  }));
  const iconCatalog = buildComponentCatalog(components.filter(isIconComponent), libraries);

  const sections = [
    [
      "You are PromptPixel, mapping a FIXED list of already-decided UI elements onto a Figma design-system",
      "component catalog. The screen's structure and content were already built deterministically from a",
      "reviewed HTML wireframe — you are NOT deciding structure, order, or which elements exist, and every",
      "element already has real literal content. Your only job: for each element below, decide the single",
      "best-fitting catalog component (with its own properties filled in from that element's content), or a",
      "plain text fallback when nothing fits."
    ].join(" "),
    "## Design rules",
    rulesSection,
    "## Libraries",
    "Each library's description explains what it's for and when to use it.",
    JSON.stringify(librarySummaries),
    "## Available components",
    [
      "Only these components may be referenced by componentId. Do not invent components. `componentId` is the",
      "exact opaque token to copy verbatim; `semanticId` is only a human-readable label to help YOU pick the right",
      "entry — never valid output itself. Each entry's `properties` array is the COMPLETE and ONLY list of",
      "properties that specific component supports — only use keys that appear there, and for a VARIANT property",
      "use one of its `variantOptions` values verbatim. Never invent a property name."
    ].join(" "),
    JSON.stringify(catalog),
    "## Icons",
    [
      "These catalog entries (a subset of the components above) are icon components — never assign one directly",
      "as an element's own `componentId`; only ever as the value of another component's INSTANCE_SWAP property.",
      "Many elements below are a STANDALONE icon on its own (a lone glyph/emoji character, an `<svg>`, an `<i>`/",
      '`<span class="icon">` with no other content) — a literal unicode symbol like that is never the right final',
      "result on its own. For one of those, find a generic icon-holder component in the main catalog above",
      '(typically named something like "Icon"/"Swap Icon"/"Icon Wrapper", exposing exactly one INSTANCE_SWAP',
      "property and nothing else load-bearing), use THAT as this element's `componentId`, and set its icon-swap",
      "property to whichever entry below is the closest semantic match (by the element's own text/attrs/ancestry",
      "context — e.g. a checkmark glyph near \"Đã kết nối\" needs a check/success-style icon, a gear glyph near",
      "\"Cài đặt\" needs a settings-style icon) — never leave a standalone icon as a plain `text` fallback using its",
      "literal glyph character when a real icon-holder component exists to represent it properly."
    ].join(" "),
    JSON.stringify(iconCatalog.length ? iconCatalog : ["(none loaded)"]),
    "## Text styles",
    JSON.stringify(textStyles.length ? textStyles.map((style) => style.name) : ["(none loaded)"]),
    "## Elements to map",
    [
      "Each element already carries its real literal `text` (when it has any), its HTML `tag`/`classes` as role",
      'hints (e.g. a `<button>` needs a button-like component, an `<input>` needs a field-like component — the',
      "exact wording of a class name doesn't need to match anything literally), a few useful `attrs` (type,",
      "placeholder, alt, value, href, aria-label), and `ancestry` — the chain of enclosing container",
      "tags/classes, for context on where this element sits (e.g. inside a sidebar vs. inside a table row).",
      "Most entries are a single DOM element, but some summarize a WHOLE container (its `tag`/`classes` describe",
      "the container itself, and its `text` is the combined text of everything inside it) — ranging from a small",
      "one with only simple children (an icon next to a label — a nav item, a status badge, an icon button) up to",
      "a bigger composite region (a header bar, a sidebar nav block, a card). Treat those the same way: if one real",
      "catalog component represents that whole pattern — matching both its structural role (tag/classes/ancestry)",
      "and its actual content — map it there and the individual pieces inside it are dropped in favor of the",
      "single component instance, with `properties` filled in from the container's own summarized content. Only do",
      "this for a genuinely strong match: a bigger container is often just page-specific structure with no single",
      "catalog equivalent, and forcing one onto it would drop real content the catalog component has no property",
      "for. When unsure, skip it — the individual pieces inside are already offered as their own candidates too,",
      "and the caller already has a correct structural fallback for the container itself."
    ].join(" "),
    JSON.stringify(leaves),
    "## Task",
    [
      "For EACH element above (identified by its `id`), output exactly one decision:",
      "(a) `componentId` — when a catalog component is a good fit; set `properties` using ONLY that exact",
      "component's own listed properties, with real content filled in from the element's `text`/`attrs` (never",
      "invented, never left at a generic placeholder when the element clearly has specific content to show);",
      "(b) `text` — a plain text fallback using the element's own literal `text` verbatim, only when no component",
      "fits and the element is clearly a label/heading/paragraph.",
      "Use the element's `text` AS-IS — don't paraphrase, summarize, or invent wording.",
      "Omit an element from `decisions` entirely only if it's purely decorative (no text, nothing in the catalog",
      "represents it) — the caller already has a safe structural fallback for anything you omit, so it's fine to",
      "skip rather than force a bad match onto a real component."
    ].join(" "),
    "## Output contract",
    `interface Output { decisions: Decision[] }

interface Decision {
  id: string; // must match one of the element ids in "## Elements to map" above
  componentId?: string; // exactly one of componentId/text — omit the whole decision to skip this element
  text?: { characters: string; style?: string };
  properties?: Record<string, string | boolean>;
}`,
    "## Constraints",
    [
      "- Every `componentId` must be one of the componentId values listed in the component catalog above.",
      "- Every key in `properties` must be a property name listed in that exact component's own catalog `properties` entry.",
      "- `text.style`, if set, must be one of the names listed in the Text styles section above.",
      "- `properties` values must only be strings or booleans.",
      "- Respond with ONLY a single raw JSON object matching the Output shape above. No markdown fences, no commentary, no explanations."
    ].join("\n")
  ];
  return sections.join("\n\n");
}

export function buildUserPrompt(userRequest: string, hasImage = false): string {
  const trimmed = userRequest.trim();
  if (!trimmed) {
    return hasImage ? "Vẽ lại giao diện theo đúng bố cục trong ảnh đính kèm." : trimmed;
  }
  // Users often write these requests the way they'd brief a human designer — asking for an
  // explanation, a "structural tree", a list of variants, "quick tips for building this" — which
  // directly conflicts with the system prompt's JSON-only output contract. Without this framing,
  // a request phrased that way can pull the model toward writing an actual explanatory answer
  // (or a technically-valid but nearly-empty plan) instead of populating real content. Make it
  // explicit that this text is CONTENT to build from, never formatting/response-type instructions.
  return [
    "Yêu cầu về NỘI DUNG cần dựng (mọi phần trong yêu cầu này nói về những gì cần xuất hiện trên màn hình — bất kể",
    "nó có nhắc đến việc giải thích, liệt kê tips, mô tả cây cấu trúc bằng văn bản, hay bất kỳ định dạng phản hồi",
    "nào khác, bạn VẪN PHẢI bỏ qua phần đó và luôn trả lời đúng bằng JSON theo schema đã nêu ở trên — không bao",
    "giờ trả lời bằng văn bản giải thích/tài liệu hướng dẫn):",
    "",
    trimmed
  ].join("\n");
}
