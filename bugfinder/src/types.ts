export type CheckMode = "en" | "vi";

export type IssueType =
  | "non_english"
  | "spelling"
  | "spacing"
  | "punctuation"
  | "grammar"
  | "nonsense"
  | "proper_noun"
  | "case_inconsistency"
  | "custom"
  | "design_font"
  | "design_font_size"
  | "design_color"
  | "design_dimension"
  | "design_spacing"
  | "design_effect"
  | "design_override";

/**
 * Design-system findings that have exactly one unambiguous correct value can
 * carry one of these so the UI can apply it directly (as opposed to text
 * issues, which are fixed via search/replace on `original`/`suggestion`).
 * Findings with more than one plausible correct value (which font size in the
 * scale, which Gap multiple) instead get several of these via `fixOptions` —
 * see TextIssue — so the user can pick, rather than guessing one.
 */
export type DesignFixAction =
  | { kind: "effect-style"; styleName: string }
  | { kind: "font-family"; fontFamily: string }
  | { kind: "height"; height: number }
  | { kind: "corner-radius"; radius: number }
  | { kind: "item-spacing"; spacing: number }
  /**
   * Link a raw (unlinked) solid stroke to whatever Style or Variable in the
   * file already resolves to this exact color — chosen at apply time (see
   * code.ts), since which token that is isn't known until then. (Fill/text
   * color has no auto-fix — grays are too close to auto-match reliably by
   * hex alone, left for the designer to link manually.)
   */
  | { kind: "stroke-color"; hex: string };

export interface TextIssue {
  type: IssueType;
  original: string;
  suggestion: string;
  message: string;
  source: "local" | "ai";
  /** false for style/layout findings that can't be auto-applied as a text replace. Defaults to true. */
  fixable?: boolean;
  /** present when this design-system finding can be applied directly (see DesignFixAction) */
  designFix?: DesignFixAction;
  /**
   * When a finding has more than one equally-plausible correct value (e.g. Gap
   * must be a multiple of 4, but which one?), offer the nearest candidates as
   * their own quick-pick buttons instead of guessing a single "the" fix.
   */
  fixOptions?: { label: string; designFix: DesignFixAction }[];
  /**
   * Same idea as `fixOptions`, but for plain text search/replace fixes
   * instead of a DesignFixAction — e.g. a case-consistency finding where
   * several existing casings are equally plausible as "the" standard one,
   * so the user picks instead of the plugin guessing.
   */
  textFixOptions?: { label: string; suggestion: string }[];
  /**
   * For text fixes (search/replace on `original`): true when `original` should
   * be matched from the END of the text rather than the start. Needed for
   * findings like trailing whitespace, where `original` (e.g. a single space)
   * also occurs constantly earlier in ordinary text — matching from the start
   * would silently edit the wrong spot.
   */
  matchFromEnd?: boolean;
}

export interface NodeStyleInfo {
  fills: string[];
  strokes: string[];
  /** true if the fill is linked to a Paint Style or a color Variable, rather than a raw/detached color. */
  fillsLinked: boolean;
  /** true if the stroke is linked to a Paint Style or a color Variable, rather than a raw/detached color. */
  strokesLinked: boolean;
  cornerRadius: number | null;
  width: number;
  height: number;
  layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  itemSpacing: number | null;
  /** number of direct children — a Gap with only 1 child has nothing to space out, so it's not worth checking. */
  childCount: number;
  /** true when primaryAxisAlignItems is SPACE_BETWEEN — Figma shows "Auto" for Gap in this mode and itemSpacing isn't a real fixed value to check. */
  isAutoGap: boolean;
  /** true when layoutMode is HORIZONTAL and every direct child's name looks like a button — a horizontal row of buttons has its own fixed Gap standard, separate from the general Gap scale. */
  isButtonRow: boolean;
  /** TEXT nodes only: every distinct font family used across the text's styled segments — a mixed-style text run can use more than one, and each is checked independently instead of skipping the whole node. */
  fontFamilies: string[];
  /** TEXT nodes only: every distinct font size used across the text's styled segments. */
  fontSizes: number[];
  /** INSTANCE nodes only: true if itemSpacing differs from the linked main component's. Undefined if not applicable/resolvable. */
  spacingOverridden?: boolean;
  /** INSTANCE nodes only: the linked main component's itemSpacing, when resolvable — lets the fix action restore the exact original value. */
  mainComponentSpacing?: number;
  /** true if the node has a visible DROP_SHADOW effect (of any kind, linked style or not) */
  hasDropShadow: boolean;
  /** name of the linked effect style, resolved only for white/8px-radius candidate nodes; null if unlinked/unresolved */
  effectStyleName?: string | null;
  /**
   * INSTANCE nodes only: padding/radius/stroke/fill fields overridden on this
   * instance or a nested layer within it, compared to its main component —
   * deliberately excludes text content/position/size and every other
   * property, which are routinely and legitimately customized per instance.
   * Grouped by the overridden node's own name, with the before (main
   * component) and after (this instance) value for each changed field;
   * empty/undefined when nothing relevant is overridden.
   */
  overriddenAppearance?: {
    nodeName: string;
    changes: { field: string; before: string; after: string }[];
  }[];
}

export interface ScannedNode {
  id: string;
  name: string;
  type: string;
  /** present only for TEXT nodes */
  text?: string;
  truncated?: boolean;
  /** present for nodes relevant to design-system checks (frames, instances, text, shapes) */
  style?: NodeStyleInfo;
  /** true if an ANCESTOR (not this node itself) is a component or component instance */
  insideInstance?: boolean;
  /** true if this node or an ancestor's name matches one of the user's ignore patterns */
  insideIgnored?: boolean;
  /** true if a later sibling (rendered on top) is an opaque shape fully covering this node — visually hidden even though visible=true. Skips ALL checks (text and design), unlike insideIgnored which only skips design rules. */
  occluded?: boolean;
}

export interface NodeResult {
  id: string;
  name: string;
  text: string;
  issues: TextIssue[];
}

// UI -> plugin main thread
export type UiToPluginMessage =
  | { type: "scan-selection"; includeDesign: boolean; ignorePatterns: string[] }
  | { type: "get-api-key" }
  | { type: "save-api-key"; key: string }
  | { type: "select-node"; nodeId: string }
  | { type: "delete-layer"; nodeId: string }
  | {
      type: "apply-fix";
      nodeId: string;
      original: string;
      suggestion: string;
      matchFromEnd?: boolean;
    }
  | { type: "apply-design-fix"; nodeId: string; original: string; designFix: DesignFixAction }
  | { type: "get-rules-config" }
  | { type: "save-rules-config"; config: Record<string, boolean> }
  | { type: "get-rule-values" }
  | { type: "save-rule-values"; values: Record<string, string> }
  | { type: "get-custom-rules" }
  | { type: "save-custom-rules"; rules: string }
  | { type: "get-ignore-patterns" }
  | { type: "save-ignore-patterns"; patterns: string }
  | { type: "get-selection-info" }
  | { type: "scan-compare" }
  | { type: "get-ui-locale" }
  | { type: "save-ui-locale"; locale: "vi" | "en" }
  | { type: "get-color-libraries" }
  | { type: "select-color-library"; libraryName: string | null }
  | { type: "get-figma-token" }
  | { type: "save-figma-token"; token: string };

/** One side of a 2-frame text comparison: every text node found under the selected root, keyed by a structural path (sibling index at each level, e.g. "0.2.1" — not layer name, since editing a text's content can auto-rename its layer) so the same logical element can be matched up against the other side. */
export interface CompareSide {
  id: string;
  name: string;
  texts: { path: string; text: string; nodeId: string }[];
}

// plugin main thread -> UI
export type PluginToUiMessage =
  | { type: "scanned-nodes"; nodes: ScannedNode[] }
  | { type: "scan-empty" }
  | { type: "api-key"; key: string }
  | { type: "delete-layer-result"; nodeId: string; success: boolean; error?: string }
  | {
      type: "apply-fix-result";
      nodeId: string;
      original: string;
      success: boolean;
      error?: string;
    }
  | {
      type: "apply-design-fix-result";
      nodeId: string;
      original: string;
      success: boolean;
      error?: string;
    }
  | { type: "rules-config"; config: Record<string, boolean> }
  | { type: "rule-values"; values: Record<string, string> }
  | { type: "custom-rules"; rules: string }
  | { type: "ignore-patterns"; patterns: string }
  | { type: "selection-info"; hasSelection: boolean; label: string; count: number; names: string[] }
  | { type: "compare-scanned"; sideA: CompareSide; sideB: CompareSide }
  | { type: "compare-error"; message: string }
  | { type: "ui-locale"; locale: "vi" | "en" }
  | {
      type: "color-libraries";
      libraries: string[];
      selectedLibrary: string | null;
    }
  | {
      type: "color-library-status";
      status: "idle" | "loading" | "ready" | "error";
      error?: string;
      colorCount?: number;
    }
  | { type: "figma-token"; token: string };
