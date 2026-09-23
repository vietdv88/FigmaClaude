export type ProviderKind =
  | "openai"
  | "anthropic"
  | "gemini"
  | "openrouter"
  | "openai-compatible"
  | "custom";

export interface ProviderProfile {
  id: string;
  name: string;
  provider: ProviderKind;
  model: string;
  baseUrl?: string;
}

export interface LibraryProfile {
  id: string;
  name: string;
  description: string;
  variableCollectionKeys?: string[];
  figmaUrl?: string;
  fileKey?: string;
}

export interface ComponentPropertyInfo {
  /** Cleaned property name, with the Figma "#nodeId:index" suffix stripped off. */
  name: string;
  type: "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT";
  /** Only present for VARIANT properties — the exact allowed values. */
  variantOptions?: string[];
}

export interface ComponentRegistryItem {
  id: string;
  libraryId: string;
  name: string;
  semanticId: string;
  aiDescription: string;
  componentKey: string;
  nodeType: "COMPONENT" | "COMPONENT_SET";
  /** Name of the page it was found on during the last scan, for grouping in the UI. */
  pageName?: string;
  /** The component's actual settable properties, captured during the last scan. */
  properties?: ComponentPropertyInfo[];
}

export interface DesignRules {
  version: 2;
  /** Rules that apply to every screen (spacing, color, typography, ...). */
  general: string;
  /** Rules for overview/dashboard-style screens. */
  overview: string;
  /** Rules for list/table screens. */
  list: string;
  /** Rules for detail/form screens. */
  detail: string;
}

export interface TextStyleRegistryItem {
  id: string;
  libraryId: string;
  name: string;
  /** Publish key, usable cross-file via figma.importStyleByKeyAsync. */
  styleKey: string;
}

export interface PaintStyleRegistryItem {
  id: string;
  libraryId: string;
  name: string;
  /** Publish key, usable cross-file via figma.importStyleByKeyAsync. */
  styleKey: string;
  /** The style's own actual solid color (0-1 RGB, straight from Figma), captured at scan time —
   * lets the wireframe's CSS colors be matched to the closest loaded Color Style by real color
   * distance instead of asking an AI to guess a name. Absent for a non-solid (gradient/image)
   * paint style, which can't be distance-matched this way. */
  color?: { r: number; g: number; b: number };
}

/** A clean, evenly-spaced row/column detected among a set of children from their already-measured
 * absolute positions (see code.ts's detectAutoLayoutPattern) — converts a would-be absolutely
 * positioned frame into a real, editable Figma Auto Layout frame instead, starting out at the
 * exact same visual arrangement the absolute positions would have produced. */
export interface AutoLayoutSpec {
  direction: "HORIZONTAL" | "VERTICAL";
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  gap: number;
}

export interface UIPlan {
  version: 1;
  screen: {
    name: string;
    width: number;
    /** Name of a registered PaintStyleRegistryItem for the root screen's own background —
     * resolved from the wireframe's own `body { background: ... }`, if any. */
    fill?: string;
    /** Raw fallback (0-1 RGB) for the same, used when nothing loaded was close enough. */
    fillRgb?: { r: number; g: number; b: number };
    /** Set when the top-level regions themselves (header, sidebar+content, ...) form a clean
     * row/column — same rationale as UIPlanNode.layout's own `autoLayout`. */
    autoLayout?: AutoLayoutSpec;
  };
  nodes: UIPlanNode[];
  /** Short notes on catalog gaps the AI hit — no component fit something the request needed. */
  missingComponents?: string[];
  /** Short notes on judgment calls the AI made to resolve an ambiguous request. */
  assumptions?: string[];
}

export interface UIPlanNode {
  id: string;
  /** Absolute position/size relative to this node's own parent, measured from the real HTML
   * render (see HtmlNode's `style`) — every node is placed exactly where its HTML counterpart
   * actually rendered, rather than reconstructed from CSS's flexbox/grid semantics via Figma
   * Auto Layout (direction/wrap/align/stretch never correspond 1:1 to Auto Layout's model, which
   * was a persistent source of misaligned/overlapping/clipped output). */
  frame: { x: number; y: number; width: number; height: number };
  /** Exactly one of `componentId`/`layout`/`text` must be present. */
  componentId?: string;
  /** A plain (non-Auto-Layout) container node, used when there's no registered component to map
   * to — its own visual properties only; its position/size come from `frame` above. */
  layout?: {
    /** Name of a registered PaintStyleRegistryItem — preferred whenever the wireframe's CSS
     * color was close enough to a real loaded color. Omit for no fill (transparent). */
    fill?: string;
    /** Raw fallback fill (0-1 RGB), used ONLY when `fill` is unset because nothing loaded was
     * close enough (or no Color Style has a captured color to match against at all) — guarantees
     * a color still shows up rather than leaving the element blank, at the cost of not being tied
     * to a real design-system style. */
    fillRgb?: { r: number; g: number; b: number };
    /** Name of a registered PaintStyleRegistryItem for a 1px border. Omit for no border. */
    strokeColor?: string;
    /** Raw fallback border color (0-1 RGB) — same rationale as `fillRgb`. */
    strokeRgb?: { r: number; g: number; b: number };
    /** Apply a small default drop-shadow effect (a fixed, reasonable "elevation" look — never a
     * precise reproduction of the wireframe's own box-shadow value, since Figma has no equivalent
     * "loaded Effect Style" registry this plugin scans the way it does Paint/Text styles). */
    shadow?: boolean;
    /** Corner radius in px, from the wireframe's own `border-radius`. */
    cornerRadius?: number;
    /** Set ONLY when this container's direct children form a clean, evenly-spaced row/column —
     * detected from their already-measured absolute positions (see code.ts's
     * detectAutoLayoutPattern), not from CSS. Converts this container to a real, editable Figma
     * Auto Layout frame (reflow/resize-friendly afterward) while starting out at the exact same
     * visual position as the absolute layout would have. Omitted when no clean pattern was found
     * (irregular spacing, overlap, a wrapped/grid arrangement) — that container stays absolutely
     * positioned instead, since forcing a single gap/direction onto it would visually misplace it. */
    autoLayout?: AutoLayoutSpec;
  };
  /** A freeform text node, used only when no catalog component fits (e.g. a plain label/heading). */
  text?: {
    characters: string;
    /** Name of a registered TextStyleRegistryItem. Defaults to "Body Regular" when omitted. */
    style?: string;
    /** Name of a registered PaintStyleRegistryItem for the glyph color — preferred whenever the
     * wireframe's CSS text color was close enough to a real loaded color. */
    fill?: string;
    /** Raw fallback glyph color (0-1 RGB) — same rationale as layout's `fillRgb`. */
    fillRgb?: { r: number; g: number; b: number };
  };
  properties: Record<string, string | boolean>;
  children?: UIPlanNode[];
}

/**
 * A structural HTML wireframe (see prompt.ts's buildHtmlWireframePrompt), parsed by the UI
 * iframe's real DOMParser (the main thread has no DOM to parse HTML with itself) into a plain
 * tree the main thread can walk deterministically — guaranteeing the resulting UIPlan tree
 * structure exactly matches the HTML the user already reviewed, instead of trusting an AI call
 * to faithfully reproduce it as JSON.
 */
export interface HtmlNode {
  tag: string;
  classes: string[];
  attrs: Record<string, string>;
  /** This node's own direct text — set both for a pure leaf (all its content is text) and for
   * "mixed content" (e.g. an icon element followed by unwrapped label text, `<li><span
   * class="icon">X</span> Label</li>`) — always separate from `children`, never mutually
   * exclusive with it. */
  text?: string;
  /** Only set for "mixed content" (`text` alongside element `children`) — the bare text's own
   * measured position/size (via a DOM Range, since it has no element of its own to measure),
   * relative to this node. A pure leaf has no need for this: its text already occupies this
   * node's own full `style` box. */
  textRect?: { x: number; y: number; width: number; height: number };
  children: HtmlNode[];
  /** The browser's own RESOLVED position/size (`getBoundingClientRect`, relative to this node's
   * parent) and paint-relevant computed style for this element — not a raw `style="..."`
   * attribute, which a wireframe styled through a `<style>` block (class selectors, the normal
   * case) never has at all, and not reconstructed from CSS layout properties (display,
   * flex-direction, gap, align-items, ...) either, since a real rendering engine already resolved
   * the actual on-screen box directly (see code.ts's parseHtmlWireframe / ui.html's
   * elementToNode). */
  style?: {
    x: number;
    y: number;
    width: number;
    height: number;
    backgroundColor?: string;
    borderTopWidth?: string;
    borderTopStyle?: string;
    borderTopColor?: string;
    boxShadow?: string;
    borderTopLeftRadius?: string;
    /** Resolved (inheritance already accounted for) text color. */
    color?: string;
  };
}

/**
 * One leaf element pulled out of the deterministically-parsed HTML wireframe (see HtmlNode) —
 * the flat unit the leaf-mapping AI call decides a component for. `id` is caller-assigned and
 * stable for the lifetime of one generation; `ancestry` is a breadcrumb of enclosing container
 * roles (e.g. ["header.header", "div.actions"]) for context only.
 */
export interface LeafElement {
  id: string;
  tag: string;
  classes: string[];
  attrs: Record<string, string>;
  text?: string;
  ancestry: string[];
}

/** One AI decision for a single LeafElement — exactly one of componentId/text, or neither
 * (meaning: no good match, the caller's own deterministic fallback stays in place). */
export interface LeafDecision {
  id: string;
  componentId?: string;
  text?: { characters: string; style?: string };
  properties?: Record<string, string | boolean>;
}

export interface StoredState {
  providerProfiles: ProviderProfile[];
  activeProviderId?: string;
  libraries: LibraryProfile[];
  enabledLibraryIds: string[];
  components: ComponentRegistryItem[];
  rules: DesignRules;
  screenSize: { width: number; height: number };
  textStyles: TextStyleRegistryItem[];
  paintStyles: PaintStyleRegistryItem[];
}
