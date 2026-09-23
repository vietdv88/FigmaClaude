import { checkCaseConsistency, runLocalChecks } from "./localChecks";
import { checkWithGemini, GeminiError } from "./gemini";
import { runDesignChecks } from "./designChecks";
import { getLocale, LOCALE_LABELS, setLocale, t, type Locale } from "./i18n";
import {
  defaultRulesConfig,
  defaultRuleValues,
  isRuleEnabled,
  RULE_DEFINITIONS,
  type RuleScope,
  type RulesConfig,
  type RuleValues,
} from "./rulesConfig";
import type {
  CheckMode,
  CompareSide,
  IssueType,
  NodeResult,
  PluginToUiMessage,
  ScannedNode,
  TextIssue,
  UiToPluginMessage,
} from "./types";

const apiKeyInput = document.getElementById("apiKey") as HTMLInputElement;
const saveKeyBtn = document.getElementById("saveKeyBtn") as HTMLButtonElement;
const apiKeyHelpBtn = document.getElementById("apiKeyHelpBtn") as HTMLButtonElement;
const apiKeyTooltip = document.getElementById("apiKeyTooltip") as HTMLDivElement;
const apiKeyCompact = document.getElementById("apiKeyCompact") as HTMLDivElement;
const apiKeyEditRow = document.getElementById("apiKeyEditRow") as HTMLDivElement;
const editApiKeyBtn = document.getElementById("editApiKeyBtn") as HTMLButtonElement;
const runReviewBtn = document.getElementById("runReviewBtn") as HTMLButtonElement;
const configTabButtons = document.querySelectorAll<HTMLButtonElement>(".config-tab");
const resultsModeBar = document.getElementById("resultsModeBar") as HTMLDivElement;
const rulesPanel = document.getElementById("rulesPanel") as HTMLDivElement;
const rulesGroupsEl = document.getElementById("rulesGroups") as HTMLDivElement;
const customRulesInput = document.getElementById("customRules") as HTMLTextAreaElement;
const saveCustomRulesBtn = document.getElementById(
  "saveCustomRulesBtn"
) as HTMLButtonElement;
const ignorePatternsInput = document.getElementById("ignorePatterns") as HTMLTextAreaElement;
const saveIgnorePatternsBtn = document.getElementById(
  "saveIgnorePatternsBtn"
) as HTMLButtonElement;
const statusEls = document.querySelectorAll<HTMLSpanElement>(".status-text");
const listEl = document.getElementById("list") as HTMLDivElement;
const configView = document.getElementById("configView") as HTMLDivElement;
const resultsView = document.getElementById("resultsView") as HTMLDivElement;
const backBtn = document.getElementById("backBtn") as HTMLButtonElement;
const toggleAllBtn = document.getElementById("toggleAllBtn") as HTMLButtonElement;
const filterTabsEl = document.getElementById("filterTabs") as HTMLDivElement;
const selectionEmptyEl = document.getElementById("selectionEmpty") as HTMLDivElement;
const selectionInfoEl = document.getElementById("selectionInfo") as HTMLDivElement;
const selectionNameEl = document.getElementById("selectionName") as HTMLSpanElement;
const topTabButtons = document.querySelectorAll<HTMLButtonElement>(".top-tab");
const compareView = document.getElementById("compareView") as HTMLDivElement;
const comparePickerSection = document.getElementById("comparePickerSection") as HTMLDivElement;
const compareResultsSection = document.getElementById("compareResultsSection") as HTMLDivElement;
const compareBackBtn = document.getElementById("compareBackBtn") as HTMLButtonElement;
const compareSelectionEmptyEl = document.getElementById("compareSelectionEmpty") as HTMLDivElement;
const compareSelectionInfoEl = document.getElementById("compareSelectionInfo") as HTMLDivElement;
const compareSelectionNamesEl = document.getElementById("compareSelectionNames") as HTMLSpanElement;
const runCompareBtn = document.getElementById("runCompareBtn") as HTMLButtonElement;
const compareStatusEl = document.getElementById("compareStatus") as HTMLSpanElement;
const compareResultsEl = document.getElementById("compareResults") as HTMLDivElement;
const langSwitcherEl = document.getElementById("langSwitcher") as HTMLDivElement;
const langButtons = document.querySelectorAll<HTMLButtonElement>(".lang-btn");
const customRulesLabelEl = document.getElementById("customRulesLabel") as HTMLLabelElement;
const ignorePatternsLabelEl = document.getElementById("ignorePatternsLabel") as HTMLLabelElement;
const selectionPrefixEl = document.getElementById("selectionPrefix") as HTMLSpanElement;
const comparePrefixEl = document.getElementById("comparePrefix") as HTMLSpanElement;
const commentsView = document.getElementById("commentsView") as HTMLDivElement;
const figmaTokenInput = document.getElementById("figmaToken") as HTMLInputElement;
const saveFigmaTokenBtn = document.getElementById("saveFigmaTokenBtn") as HTMLButtonElement;
const figmaTokenHelpBtn = document.getElementById("figmaTokenHelpBtn") as HTMLButtonElement;
const figmaTokenTooltip = document.getElementById("figmaTokenTooltip") as HTMLDivElement;
const figmaFileLinkLabelEl = document.getElementById("figmaFileLinkLabel") as HTMLLabelElement;
const figmaFileLinkInput = document.getElementById("figmaFileLink") as HTMLInputElement;
const fetchCommentsBtn = document.getElementById("fetchCommentsBtn") as HTMLButtonElement;
const commentsStatusEl = document.getElementById("commentsStatus") as HTMLSpanElement;
const commentsFilterRowEl = document.getElementById("commentsFilterRow") as HTMLDivElement;
const commentsAuthorFilterEl = document.getElementById("commentsAuthorFilter") as HTMLSelectElement;
const commentsStatusFilterEl = document.getElementById("commentsStatusFilter") as HTMLSelectElement;
const commentsListEl = document.getElementById("commentsList") as HTMLDivElement;
let customRules = "";
let ignorePatterns = "";
let hasSelection = false;
let selectionCount = 0;
let selectionNames: string[] = [];

interface FilterTab {
  id: string;
  labelKey: string;
  types?: IssueType[];
}

const FILTER_TABS: FilterTab[] = [
  { id: "all", labelKey: "filter.all" },
  {
    id: "content",
    labelKey: "filter.content",
    types: ["non_english", "spelling", "grammar", "nonsense", "proper_noun", "case_inconsistency", "custom"],
  },
  { id: "textformat", labelKey: "filter.textformat", types: ["spacing", "punctuation"] },
  { id: "color", labelKey: "filter.color", types: ["design_color"] },
  { id: "font", labelKey: "filter.font", types: ["design_font", "design_font_size"] },
  { id: "dimension", labelKey: "filter.dimension", types: ["design_dimension"] },
  { id: "gap", labelKey: "filter.gap", types: ["design_spacing"] },
  { id: "effect", labelKey: "filter.effect", types: ["design_effect"] },
  { id: "override", labelKey: "filter.override", types: ["design_override"] },
];

let activeFilter = "all";
let collapsedNodes = new Set<string>();
// Tracked by (nodeId, issueIndex) rather than a DOM element reference so the
// highlight survives a re-render (collapse/expand, filter change...).
let activeIssueKey: string | null = null;
let openIssueMenuKey: string | null = null;

const RULE_GROUP_LABEL_KEYS: Record<RuleScope, string> = {
  local: "rulesPanel.group.local",
  "ai-en": "rulesPanel.group.aiEn",
  "ai-vi": "rulesPanel.group.aiVi",
  "design-app": "rulesPanel.group.designApp",
};

let rulesConfig: RulesConfig = defaultRulesConfig();
let ruleValues: RuleValues = defaultRuleValues();

let colorLibraries: string[] = [];
let selectedColorLibrary: string | null = null;
let colorLibraryStatus: {
  status: "idle" | "loading" | "ready" | "error";
  error?: string;
  colorCount?: number;
} = { status: "idle" };

function colorLibraryStatusText(): string {
  // An error fetching the library list itself takes priority — otherwise it's
  // indistinguishable from "the file genuinely has no libraries enabled".
  if (colorLibraryStatus.status === "error") {
    return t("colorLibrary.error", { error: colorLibraryStatus.error ?? "" });
  }
  if (colorLibraries.length === 0) return t("colorLibrary.empty");
  switch (colorLibraryStatus.status) {
    case "loading":
      return t("colorLibrary.loading");
    case "ready":
      return t("colorLibrary.ready", { count: colorLibraryStatus.colorCount ?? 0 });
    default:
      return t("colorLibrary.hint");
  }
}

type ConfigTab = "website" | "webapp";
let activeConfigTab: ConfigTab = "website";

/** Master switch id per AI language group — "ai-en" -> disables the whole English AI section, "ai-vi" -> Vietnamese. */
const AI_GROUP_MASTER_RULE_ID: Partial<Record<RuleScope, string>> = {
  "ai-en": "ai-en-master-enabled",
  "ai-vi": "ai-vi-master-enabled",
};

// Collapsed/expanded is pure UI state (not persisted) — every group starts expanded.
let collapsedRuleGroups = new Set<RuleScope>();

function renderRulesPanel() {
  const groups: RuleScope[] =
    activeConfigTab === "webapp"
      ? ["local", "ai-en", "ai-vi", "design-app"]
      : ["local", "ai-en", "ai-vi"];
  rulesGroupsEl.innerHTML = groups
    .map((scope) => {
      const masterRuleId = AI_GROUP_MASTER_RULE_ID[scope];
      const isCollapsed = collapsedRuleGroups.has(scope);
      // When a group's own master switch is off, its sub-rules don't matter —
      // render them visibly unchecked and non-interactive rather than leaving
      // them clickable but functionally ignored. Their real stored
      // preference in rulesConfig is left untouched, so turning the master
      // back on restores whatever was individually selected before.
      const groupDisabled = masterRuleId ? !isRuleEnabled(rulesConfig, masterRuleId) : false;
      const rows = RULE_DEFINITIONS.filter((rule) => rule.scope === scope)
        .map((rule) => {
          const checked = !groupDisabled && rulesConfig[rule.id] !== false ? "checked" : "";
          const disabledAttr = groupDisabled ? "disabled" : "";
          const valueHtml = rule.editable
            ? `
              <div class="rule-row-value">
                <label>${escapeHtml(t(rule.editable.labelKey))}</label>
                <input
                  type="text"
                  data-rule-value-id="${rule.id}"
                  placeholder="${escapeHtml(rule.editable.placeholder || rule.editable.default)}"
                  value="${escapeHtml(ruleValues[rule.id] ?? rule.editable.default)}"
                  ${disabledAttr}
                />
              </div>
            `
            : "";
          const checkboxId = `rule-chk-${rule.id}`;
          return `
            <div class="rule-row">
              <input type="checkbox" id="${checkboxId}" data-rule-id="${rule.id}" ${checked} ${disabledAttr} />
              <label for="${checkboxId}" class="rule-row-text">
                <span class="rule-row-label">${escapeHtml(t(rule.labelKey))}</span>
                <span class="rule-row-desc">${escapeHtml(t(rule.descriptionKey))}</span>
              </label>
              ${valueHtml}
            </div>
          `;
        })
        .join("");
      const groupLabel = t(RULE_GROUP_LABEL_KEYS[scope]);
      const arrow = isCollapsed ? "▸" : "▾";
      // The group name/arrow toggle collapse via a <span>, not a <label for>,
      // so clicking it doesn't also flip the adjacent master-switch checkbox.
      const masterCheckboxHtml = masterRuleId
        ? (() => {
            const masterChecked = isRuleEnabled(rulesConfig, masterRuleId) ? "checked" : "";
            return `<input type="checkbox" id="rule-chk-${masterRuleId}" data-rule-id="${masterRuleId}" ${masterChecked} title="${escapeHtml(
              t("rulesPanel.aiMasterSwitch.title")
            )}" />`;
          })()
        : "";
      const titleHtml = `
        <div class="rules-group-title">
          ${masterCheckboxHtml}
          <span class="rules-group-arrow" data-toggle-group="${scope}">${arrow}</span>
          <span class="rules-group-label-text" data-toggle-group="${scope}">${escapeHtml(groupLabel)}</span>
        </div>
      `;
      const colorLibraryHtml =
        scope === "design-app"
          ? `
            <div class="color-library-picker">
              <label for="colorLibrarySelect">${escapeHtml(t("colorLibrary.title"))}</label>
              <select id="colorLibrarySelect" data-color-library-select>
                <option value="">${escapeHtml(t("colorLibrary.none"))}</option>
                ${colorLibraries
                  .map(
                    (name) =>
                      `<option value="${escapeHtml(name)}" ${
                        name === selectedColorLibrary ? "selected" : ""
                      }>${escapeHtml(name)}</option>`
                  )
                  .join("")}
              </select>
              <div class="color-library-status">${escapeHtml(colorLibraryStatusText())}</div>
            </div>
          `
          : "";
      const bodyHtml = isCollapsed ? "" : `${colorLibraryHtml}${rows}`;
      return `${titleHtml}${bodyHtml}`;
    })
    .join("");
}

const AI_MASTER_RULE_IDS = new Set(Object.values(AI_GROUP_MASTER_RULE_ID));

rulesPanel.addEventListener("change", (e) => {
  const checkbox = e.target as HTMLInputElement;
  const ruleId = checkbox.dataset.ruleId;
  if (!ruleId) return;
  rulesConfig = { ...rulesConfig, [ruleId]: checkbox.checked };
  send({ type: "save-rules-config", config: rulesConfig });
  // A per-language master switch needs the sub-rules below it to visually
  // re-render as disabled/unchecked (or restored) right away.
  if (AI_MASTER_RULE_IDS.has(ruleId)) renderRulesPanel();
});

rulesGroupsEl.addEventListener("input", (e) => {
  const input = e.target as HTMLInputElement;
  const ruleId = input.dataset.ruleValueId;
  if (!ruleId) return;
  ruleValues = { ...ruleValues, [ruleId]: input.value };
  send({ type: "save-rule-values", values: ruleValues });
});

rulesGroupsEl.addEventListener("change", (e) => {
  const select = e.target as HTMLSelectElement;
  if (!select.matches("[data-color-library-select]")) return;
  selectedColorLibrary = select.value || null;
  colorLibraryStatus = { status: selectedColorLibrary ? "loading" : "idle" };
  send({ type: "select-color-library", libraryName: selectedColorLibrary });
  renderRulesPanel();
});

rulesGroupsEl.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>("[data-toggle-group]");
  if (!target) return;
  const scope = target.dataset.toggleGroup as RuleScope;
  if (collapsedRuleGroups.has(scope)) collapsedRuleGroups.delete(scope);
  else collapsedRuleGroups.add(scope);
  renderRulesPanel();
});

// Vietnamese vowels/letters that only appear with diacritics (à, đ, ơ, ...).
// A non-trivial share of these among a selection's letters means the
// dominant language is Vietnamese; otherwise treat it as English.
const VI_DIACRITIC_RE =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
const VI_DIACRITIC_THRESHOLD = 0.02;

function detectMode(combinedText: string): CheckMode {
  const viMatches = combinedText.match(VI_DIACRITIC_RE);
  const viCount = viMatches ? viMatches.length : 0;
  const letterCount = (combinedText.match(/[a-zA-Z]/g) || []).length + viCount;
  if (letterCount === 0) return "en";
  return viCount / letterCount > VI_DIACRITIC_THRESHOLD ? "vi" : "en";
}

let mode: CheckMode = "en";
let apiKey = "";
let results: NodeResult[] = [];
let busy = false;

function typeLabel(type: string): string {
  return t(`type.${type}`);
}

function send(message: UiToPluginMessage) {
  parent.postMessage({ pluginMessage: message }, "*");
}

function setStatus(text: string) {
  statusEls.forEach((el) => {
    el.textContent = text;
  });
}

function updateButtonsDisabled() {
  runReviewBtn.disabled = busy || !hasSelection;
  runCompareBtn.disabled = busy || selectionCount !== 2;
}

function setConfigTab(tab: ConfigTab) {
  activeConfigTab = tab;
  configTabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  runReviewBtn.textContent = tab === "webapp" ? t("review.runWebapp") : t("review.runWebsite");
  runReviewBtn.classList.toggle("webapp-mode", tab === "webapp");
  renderRulesPanel();
}

configTabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab as ConfigTab;
    if (tab) setConfigTab(tab);
  });
});

function setBusy(next: boolean) {
  busy = next;
  updateButtonsDisabled();
}

function setSelectionInfo(next: boolean, label: string, count: number, names: string[]) {
  hasSelection = next;
  selectionCount = count;
  selectionNames = names;
  updateButtonsDisabled();
  if (next) {
    selectionEmptyEl.classList.add("hidden");
    selectionInfoEl.classList.remove("hidden");
    // A single selection's `label` is the actual layer's own name — real
    // design content, not UI text, so it's never translated. Multiple
    // selections get a localized count summary instead.
    selectionNameEl.textContent = count > 1 ? t("selection.multiple", { count }) : label;
  } else {
    selectionInfoEl.classList.add("hidden");
    selectionEmptyEl.classList.remove("hidden");
  }
  renderCompareSelectionStatus();
}

function renderCompareSelectionStatus() {
  if (selectionCount === 2) {
    compareSelectionEmptyEl.classList.add("hidden");
    compareSelectionInfoEl.classList.remove("hidden");
    compareSelectionNamesEl.textContent = t("compare.selectedNames", {
      a: selectionNames[0],
      b: selectionNames[1],
    });
  } else {
    compareSelectionInfoEl.classList.add("hidden");
    compareSelectionEmptyEl.classList.remove("hidden");
  }
}

function showApiKeyMode(compact: boolean) {
  apiKeyCompact.classList.toggle("hidden", !compact);
  apiKeyEditRow.classList.toggle("hidden", compact);
}

/**
 * Refreshes every piece of STATIC chrome (labels, placeholders, tooltip,
 * button text baked into ui.html) plus the dynamically-generated panels that
 * depend on the current locale. Called once at startup and again whenever
 * the language switcher changes locale — there's no per-string diffing, it
 * just re-applies everything, which is cheap enough for a settings panel
 * this size.
 */
function applyStaticTranslations() {
  apiKeyHelpBtn.setAttribute("aria-label", t("apiKey.help.aria"));
  // The steps intentionally contain real markup (e.g. <b>) from the
  // dictionary itself (trusted, developer-authored content) — not escaped,
  // unlike anything derived from scanned layer/design content elsewhere.
  apiKeyTooltip.innerHTML = `
    ${t("apiKey.help.intro")}
    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com/app/apikey</a>:
    <ol>
      <li>${t("apiKey.help.step1")}</li>
      <li>${t("apiKey.help.step2")}</li>
      <li>${t("apiKey.help.step3")}</li>
      <li>${t("apiKey.help.step4")}</li>
    </ol>
  `;
  const apiCompactText = apiKeyCompact.querySelector(".api-compact-text");
  if (apiCompactText) apiCompactText.textContent = t("apiKey.savedText");
  editApiKeyBtn.textContent = t("apiKey.editBtn");
  apiKeyInput.placeholder = t("apiKey.placeholder");
  saveKeyBtn.textContent = t("apiKey.saveBtn");

  topTabButtons.forEach((btn) => {
    if (btn.dataset.topTab === "review") btn.textContent = t("tab.review");
    else if (btn.dataset.topTab === "compare") btn.textContent = t("tab.compare");
    else if (btn.dataset.topTab === "comments") btn.textContent = t("tab.comments");
  });

  configTabButtons.forEach((btn) => {
    if (btn.dataset.tab === "website") btn.textContent = t("configTab.website");
    else if (btn.dataset.tab === "webapp") btn.textContent = t("configTab.webapp");
  });

  customRulesLabelEl.textContent = t("customRules.label");
  customRulesInput.placeholder = t("customRules.placeholder");
  saveCustomRulesBtn.textContent = t("customRules.saveBtn");

  ignorePatternsLabelEl.textContent = t("ignorePatterns.label");
  ignorePatternsInput.placeholder = t("ignorePatterns.placeholder");
  saveIgnorePatternsBtn.textContent = t("ignorePatterns.saveBtn");

  selectionEmptyEl.textContent = t("selection.emptyReview");
  selectionPrefixEl.textContent = t("selection.prefix");
  runReviewBtn.textContent = activeConfigTab === "webapp" ? t("review.runWebapp") : t("review.runWebsite");

  backBtn.textContent = t("results.back");
  toggleAllBtn.textContent = t("results.collapseAll");

  compareSelectionEmptyEl.textContent = t("compare.pickerEmpty");
  comparePrefixEl.textContent = t("selection.prefix");
  runCompareBtn.textContent = t("compare.runBtn");
  compareBackBtn.textContent = t("results.back");

  langButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.locale === getLocale());
  });

  figmaTokenHelpBtn.setAttribute("aria-label", t("comments.tokenHelpAria"));
  figmaTokenTooltip.innerHTML = `
    ${t("comments.tokenHelpIntro")}
    <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noopener">figma.com/developers/api</a>:
    <ol>
      <li>${t("comments.tokenHelpStep1")}</li>
      <li>${t("comments.tokenHelpStep2")}</li>
      <li>${t("comments.tokenHelpStep3")}</li>
    </ol>
  `;
  figmaTokenInput.placeholder = t("comments.tokenPlaceholder");
  figmaFileLinkLabelEl.textContent = t("comments.fileLinkLabel");
  figmaFileLinkInput.placeholder = t("comments.fileLinkPlaceholder");
  saveFigmaTokenBtn.textContent = t("comments.tokenSaveBtn");
  fetchCommentsBtn.textContent = t("comments.fetchBtn");
  commentsStatusFilterEl.innerHTML = `
    <option value="all">${escapeHtml(t("comments.filterStatusAll"))}</option>
    <option value="unresolved">${escapeHtml(t("comments.filterStatusUnresolved"))}</option>
    <option value="resolved">${escapeHtml(t("comments.filterStatusResolved"))}</option>
  `;
  commentsStatusFilterEl.value = commentStatusFilter;
  renderCommentsAuthorFilter();
  renderCommentsList();

  renderRulesPanel();
  renderFilterTabs();
  render();
}

langSwitcherEl.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest<HTMLButtonElement>(".lang-btn");
  const locale = target?.dataset.locale;
  if (!locale || (locale !== "vi" && locale !== "en") || locale === getLocale()) return;
  setLocale(locale as Locale);
  send({ type: "save-ui-locale", locale });
  applyStaticTranslations();
});

function parseIgnorePatterns(): string[] {
  return ignorePatterns
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function showResultsView() {
  configView.classList.add("hidden");
  compareView.classList.add("hidden");
  commentsView.classList.add("hidden");
  resultsView.classList.remove("hidden");
}

function showConfigView() {
  resultsView.classList.add("hidden");
  compareView.classList.add("hidden");
  commentsView.classList.add("hidden");
  configView.classList.remove("hidden");
}

function showCompareView() {
  configView.classList.add("hidden");
  resultsView.classList.add("hidden");
  commentsView.classList.add("hidden");
  compareView.classList.remove("hidden");
}

function showCommentsView() {
  configView.classList.add("hidden");
  resultsView.classList.add("hidden");
  compareView.classList.add("hidden");
  commentsView.classList.remove("hidden");
}

function showComparePicker() {
  compareResultsSection.classList.add("hidden");
  comparePickerSection.classList.remove("hidden");
}

function showCompareResultsSection() {
  comparePickerSection.classList.add("hidden");
  compareResultsSection.classList.remove("hidden");
}

compareBackBtn.addEventListener("click", () => showComparePicker());

topTabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.topTab;
    if (!tab) return;
    topTabButtons.forEach((b) => b.classList.toggle("active", b === btn));
    if (tab === "compare") showCompareView();
    else if (tab === "comments") showCommentsView();
    else showConfigView();
  });
});

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showWhitespace(input: string): string {
  return input
    .replace(/ /g, "·")
    .replace(/\t/g, "→")
    .replace(/\r\n|\r|\n/g, "↵");
}

/**
 * Whitespace by itself is invisible in the issue preview. For findings that
 * remove/collapse whitespace, include one real character on each side and
 * render spaces as dots, e.g. "Xin  chào" becomes "n··c → n·c". Boundary
 * markers cover leading/trailing whitespace where one side has no character.
 */
function renderWhitespaceDiff(text: string, issue: TextIssue): string | null {
  const originalWhitespace = (issue.original.match(/\s/g) || []).length;
  const suggestionWhitespace = (issue.suggestion.match(/\s/g) || []).length;
  if (originalWhitespace === 0 || originalWhitespace <= suggestionWhitespace) return null;

  const start = issue.matchFromEnd
    ? text.lastIndexOf(issue.original)
    : text.indexOf(issue.original);
  if (start < 0) return null;
  const whitespaceRun = /\s+/.exec(issue.original);
  if (!whitespaceRun || whitespaceRun.index == null) return null;
  const runStart = start + whitespaceRun.index;
  const runEnd = runStart + whitespaceRun[0].length;
  const before = runStart > 0 ? Array.from(text.slice(0, runStart)).pop() || "⟦" : "⟦";
  const after = runEnd < text.length ? Array.from(text.slice(runEnd))[0] || "⟧" : "⟧";
  const replacementRun = /\s+/.exec(issue.suggestion)?.[0] || "";
  const oldText = escapeHtml(showWhitespace(whitespaceRun[0]));
  const newText = escapeHtml(showWhitespace(replacementRun));

  return `<div class="diff whitespace-diff">
    <span class="context-char">${escapeHtml(showWhitespace(before))}</span><span class="old">${oldText}</span><span class="context-char">${escapeHtml(
      showWhitespace(after)
    )}</span>
    →
    <span class="context-char">${escapeHtml(showWhitespace(before))}</span><span class="new">${newText}</span><span class="context-char">${escapeHtml(
      showWhitespace(after)
    )}</span>
  </div>`;
}

function renderEmpty(message: string) {
  listEl.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

function getFilteredResults(): NodeResult[] {
  const tab = FILTER_TABS.find((t) => t.id === activeFilter);
  if (!tab || !tab.types) {
    return results.filter((r) => r.issues.length > 0);
  }
  const types = new Set(tab.types);
  return results
    .map((r) => ({ ...r, issues: r.issues.filter((i) => types.has(i.type)) }))
    .filter((r) => r.issues.length > 0);
}

function renderFilterTabs() {
  const allIssues: TextIssue[] = [];
  for (const r of results) allIssues.push(...r.issues);
  filterTabsEl.innerHTML = FILTER_TABS.map((tab) => {
    const count = tab.types
      ? allIssues.filter((i) => tab.types!.includes(i.type)).length
      : allIssues.length;
    if (tab.id !== "all" && count === 0) return "";
    const activeClass = tab.id === activeFilter ? " active" : "";
    return `<button class="filter-tab${activeClass}" type="button" data-filter="${tab.id}">${escapeHtml(
      t(tab.labelKey)
    )} (${count})</button>`;
  }).join("");
}

filterTabsEl.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>("[data-filter]");
  if (!target) return;
  activeFilter = target.dataset.filter || "all";
  renderFilterTabs();
  render();
});

function dropFixedIssue(nodeId: string, original: string) {
  const node = results.find((r) => r.id === nodeId);
  if (!node) return;
  node.issues = node.issues.filter((i) => i.original !== original);
  // Indices shift once an issue is removed, so a stale key could now point
  // at the wrong issue — safer to just clear the highlight.
  activeIssueKey = null;
  renderFilterTabs();
  render();
}

function dropDeletedNode(nodeId: string) {
  results = results.filter((r) => r.id !== nodeId);
  collapsedNodes.delete(nodeId);
  activeIssueKey = null;
  openIssueMenuKey = null;
  renderFilterTabs();
  render();
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  setStatus(totalIssues > 0 ? t("status.foundIssues", { count: totalIssues }) : t("status.noIssues"));
}

function render() {
  const withIssues = getFilteredResults();
  if (withIssues.length === 0) {
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    renderEmpty(totalIssues === 0 ? t("results.emptyNone") : t("results.emptyFiltered"));
    return;
  }

  listEl.innerHTML = withIssues
    .map((node, nodeIndex) => {
      const collapsed = collapsedNodes.has(node.id);
      const issuesHtml = node.issues
        .map((issue, issueIndex) => {
          const badgeClass = issue.source === "ai" ? "badge ai" : "badge";
          const label = typeLabel(issue.type);
          // A fixable text issue can legitimately suggest "" (delete `original`
          // entirely, e.g. trailing whitespace) — don't require a non-empty
          // string here, or the fix button silently never appears for those.
          const canFixText = issue.fixable !== false && issue.original.length > 0;
          // When there's more than one equally-valid fix (textFixOptions),
          // showing `suggestion` here would look like a single forced
          // answer — the real choices are the buttons below, so the preview
          // just shows what's flagged, not a specific verdict on it.
          const hasMultipleOptions = !!issue.textFixOptions && issue.textFixOptions.length > 0;
          const whitespaceDiff = renderWhitespaceDiff(node.text, issue);
          const diffHtml = whitespaceDiff
            ? whitespaceDiff
            : canFixText && !hasMultipleOptions
            ? `<div class="diff"><span class="old">${escapeHtml(issue.original)}</span> → <span class="new">${
                issue.suggestion ? escapeHtml(issue.suggestion) : escapeHtml(t("results.deleteLabel"))
              }</span></div>`
            : `<div class="diff"><span class="old">${escapeHtml(issue.original)}</span></div>`;

          const applyBtn =
            issue.textFixOptions && issue.textFixOptions.length > 0
              ? issue.textFixOptions
                  .map(
                    (opt, optIndex) =>
                      `<button class="ghost" data-action="apply-text-option" data-node="${nodeIndex}" data-issue="${issueIndex}" data-fix-option="${optIndex}">${escapeHtml(
                        t("results.fixArrow", { label: opt.label })
                      )}</button>`
                  )
                  .join("")
              : issue.fixOptions && issue.fixOptions.length > 0
              ? issue.fixOptions
                  .map(
                    (opt, optIndex) =>
                      `<button class="ghost" data-action="apply-design" data-node="${nodeIndex}" data-issue="${issueIndex}" data-fix-option="${optIndex}">${escapeHtml(
                        t("results.fixArrow", { label: opt.label })
                      )}</button>`
                  )
                  .join("")
              : issue.designFix
              ? `<button class="ghost" data-action="apply-design" data-node="${nodeIndex}" data-issue="${issueIndex}">${escapeHtml(
                  t("results.fixBtn")
                )}</button>`
              : canFixText
              ? `<button class="ghost" data-action="apply" data-node="${nodeIndex}" data-issue="${issueIndex}">${escapeHtml(
                  t("results.fixBtn")
                )}</button>`
              : "";

          const issueKey = `${node.id}::${issueIndex}`;
          const activeClass = issueKey === activeIssueKey ? " active-issue" : "";
          const issueMenu = !pendingIncludeDesign
            ? `<div class="issue-menu-wrap">
                <button class="issue-menu-trigger" type="button" data-action="toggle-issue-menu" data-node="${nodeIndex}" data-issue-key="${issueKey}" aria-label="${escapeHtml(
                  t("results.moreActions")
                )}" title="${escapeHtml(t("results.moreActions"))}">•••</button>
                <div class="issue-menu${openIssueMenuKey === issueKey ? " open" : ""}">
                  <button class="issue-menu-delete" type="button" data-action="delete-layer" data-node="${nodeIndex}">${escapeHtml(
                    t("results.deleteLayer")
                  )}</button>
                </div>
              </div>`
            : "";

          return `
            <div class="issue${activeClass}" data-action="select" data-node="${nodeIndex}" data-issue-key="${issueKey}">
              ${issueMenu}
              <span class="${badgeClass}">${escapeHtml(label)}</span>
              ${diffHtml}
              <div class="message">${escapeHtml(issue.message)}</div>
              <div class="issue-actions">
                ${applyBtn}
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="node-card">
          <div class="node-header" data-action="toggle-node" data-node="${nodeIndex}">
            <span class="node-name" data-action="select" data-node="${nodeIndex}">${escapeHtml(
              node.name
            )}</span>
            <span class="node-header-right">
              <span class="status">${escapeHtml(t("results.issuesCount", { count: node.issues.length }))}</span>
              <span class="collapse-icon${collapsed ? " collapsed" : ""}">▾</span>
            </span>
          </div>
          <div class="issue-list${collapsed ? " hidden" : ""}">
            ${issuesHtml}
          </div>
        </div>
      `;
    })
    .join("");
}

listEl.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const nodeIndex = Number(target.dataset.node);
  const withIssues = getFilteredResults();
  const node = withIssues[nodeIndex];
  if (!node) return;

  if (action === "select") {
    openIssueMenuKey = null;
    send({ type: "select-node", nodeId: node.id });
    const issueKey = target.dataset.issueKey;
    if (issueKey) {
      activeIssueKey = issueKey;
      render();
    }
  } else if (action === "toggle-node") {
    openIssueMenuKey = null;
    if (collapsedNodes.has(node.id)) {
      collapsedNodes.delete(node.id);
    } else {
      collapsedNodes.add(node.id);
    }
    render();
  } else if (action === "toggle-issue-menu") {
    const issueKey = target.dataset.issueKey;
    openIssueMenuKey = openIssueMenuKey === issueKey ? null : issueKey || null;
    render();
  } else if (action === "delete-layer") {
    openIssueMenuKey = null;
    render();
    send({ type: "delete-layer", nodeId: node.id });
  } else if (action === "apply") {
    const issueIndex = Number(target.dataset.issue);
    const issue = node.issues[issueIndex];
    if (!issue) return;
    send({
      type: "apply-fix",
      nodeId: node.id,
      original: issue.original,
      suggestion: issue.suggestion,
      matchFromEnd: issue.matchFromEnd,
    });
  } else if (action === "apply-text-option") {
    const issueIndex = Number(target.dataset.issue);
    const issue = node.issues[issueIndex];
    if (!issue) return;
    const fixOptionIndex = Number(target.dataset.fixOption);
    const opt = issue.textFixOptions?.[fixOptionIndex];
    if (!opt) return;
    send({
      type: "apply-fix",
      nodeId: node.id,
      original: issue.original,
      suggestion: opt.suggestion,
      matchFromEnd: issue.matchFromEnd,
    });
  } else if (action === "apply-design") {
    const issueIndex = Number(target.dataset.issue);
    const issue = node.issues[issueIndex];
    if (!issue) return;
    const fixOptionIndex = target.dataset.fixOption;
    const designFix =
      fixOptionIndex != null ? issue.fixOptions?.[Number(fixOptionIndex)]?.designFix : issue.designFix;
    if (!designFix) return;
    send({
      type: "apply-design-fix",
      nodeId: node.id,
      original: issue.original,
      designFix,
    });
  }
});

toggleAllBtn.addEventListener("click", () => {
  const withIssues = getFilteredResults();
  const anyExpanded = withIssues.some((n) => !collapsedNodes.has(n.id));
  if (anyExpanded) {
    withIssues.forEach((n) => collapsedNodes.add(n.id));
    toggleAllBtn.textContent = t("results.expandAll");
  } else {
    withIssues.forEach((n) => collapsedNodes.delete(n.id));
    toggleAllBtn.textContent = t("results.collapseAll");
  }
  render();
});

let pendingIncludeDesign = false;

async function runCheck(includeDesign: boolean) {
  if (busy) return;
  setBusy(true);
  pendingIncludeDesign = includeDesign;
  results = [];
  activeIssueKey = null;
  listEl.innerHTML = "";
  filterTabsEl.innerHTML = "";
  setStatus(t("status.scanning"));
  send({ type: "scan-selection", includeDesign, ignorePatterns: parseIgnorePatterns() });
}

async function processScannedNodes(nodes: ScannedNode[], includeDesign: boolean) {
  try {
    await processScannedNodesInner(nodes, includeDesign);
  } catch (err) {
    // A bug anywhere in this pipeline (a bad AI response, an unexpected node
    // shape...) must never leave the UI permanently stuck on "busy" with no
    // results shown — surface it and let the user try again instead.
    setStatus(err instanceof Error ? err.message : t("status.genericError"));
    setBusy(false);
  }
}

async function processScannedNodesInner(nodes: ScannedNode[], includeDesign: boolean) {
  // A layer fully covered by an opaque sibling on top of it (occluded) is
  // skipped from every text check — nothing to gain from spellchecking or
  // AI-reviewing content nobody can actually see, and it saves real AI cost.
  const textNodes = nodes.filter(
    (n): n is ScannedNode & { text: string } =>
      n.type === "TEXT" && n.text !== undefined && !n.occluded
  );

  mode = detectMode(textNodes.map((n) => n.text).join(" "));
  // Tracks whether an error/rate-limit status was already shown during this
  // run, so the final "found N issues" summary doesn't clobber it — can't
  // detect this by matching substrings of the displayed text anymore now
  // that the text is language-dependent.
  let statusHadError = false;

  setStatus(t("status.checking", { count: nodes.length }));

  const localResults = new Map<string, TextIssue[]>();
  for (const node of textNodes) {
    localResults.set(node.id, runLocalChecks(node.text, rulesConfig, ruleValues));
  }
  const caseResults = checkCaseConsistency(textNodes, rulesConfig);

  // Mode auto-detection already picks exactly one language's AI rules to
  // apply per run, so the per-language master switch that matters here is
  // whichever one matches the detected mode.
  const aiEnabled = isRuleEnabled(rulesConfig, mode === "vi" ? "ai-vi-master-enabled" : "ai-en-master-enabled");
  let aiResults = new Map<string, TextIssue[]>();
  if (aiEnabled && apiKey.trim() && textNodes.length > 0) {
    try {
      aiResults = await checkWithGemini(
        apiKey.trim(),
        mode,
        textNodes.map((n) => ({ id: n.id, text: n.text })),
        rulesConfig,
        customRules,
        (done, total) => setStatus(t("status.checkingAi", { done, total }))
      );
    } catch (err) {
      const msg = err instanceof GeminiError ? err.message : t("status.aiUnknownError");
      setStatus(msg);
      statusHadError = true;
    }
  } else if (!aiEnabled) {
    setStatus(t("status.aiOffLang", { lang: t(mode === "vi" ? "lang.vi" : "lang.en") }));
  } else if (!apiKey.trim()) {
    setStatus(t("status.noApiKey"));
  }

  results = nodes.map((node) => {
    const localIssues = localResults.get(node.id) || [];
    const aiIssues = aiResults.get(node.id) || [];
    // The local regex just collapses any run of spaces to one — dumb but
    // works for "extra space between words". When AI's spelling check finds
    // the same run is actually splitting a single word apart (e.g. "Textb
    // ox" → "Textbox"), its finding covers the whole span and knows the
    // right fix; drop the local one so only the correct suggestion shows.
    const nonRedundantLocal = localIssues.filter((issue) => {
      if (issue.type === "spacing" && aiIssues.some((ai) => ai.original.includes(issue.original))) {
        return false;
      }
      // Exact same (type, original) already found by AI — keep AI's copy only,
      // e.g. both the local split-term check and AI's spelling check can
      // independently catch "Textb      ox".
      if (aiIssues.some((ai) => ai.type === issue.type && ai.original === issue.original)) {
        return false;
      }
      return true;
    });
    const caseIssues = caseResults.get(node.id) || [];
    const textIssues = [...nonRedundantLocal, ...aiIssues, ...caseIssues];
    const designIssues = includeDesign ? runDesignChecks(node, rulesConfig, ruleValues) : [];
    return {
      id: node.id,
      name: node.name,
      text: node.text || "",
      issues: [...textIssues, ...designIssues],
    };
  });

  collapsedNodes = new Set();
  activeFilter = "all";
  toggleAllBtn.textContent = t("results.collapseAll");
  resultsModeBar.textContent = includeDesign ? t("results.modeWebapp") : t("results.modeWebsite");
  resultsModeBar.className = `results-mode-bar ${includeDesign ? "webapp" : "website"}`;
  renderFilterTabs();
  render();
  setBusy(false);
  showResultsView();
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  if (!statusHadError) {
    setStatus(totalIssues > 0 ? t("status.foundIssues", { count: totalIssues }) : t("status.noIssues"));
  }
}

// ---- View Comments tab ----
// Figma's Plugin API has no comment access at all — this calls the REST API
// (GET /v1/files/:key/comments) directly from the UI thread with a
// user-supplied Personal Access Token, which never leaves this device except
// to Figma itself (same trust model as the Gemini API key).
interface FigmaComment {
  id: string;
  parent_id: string;
  user: { handle: string };
  created_at: string;
  resolved_at: string | null;
  message: string;
  client_meta?: { node_id?: string };
}
interface CommentRow extends FigmaComment {
  effectiveResolved: boolean;
}

let figmaToken = "";
let commentRows: CommentRow[] = [];
let commentAuthorFilter = "all";
let commentStatusFilter: "all" | "resolved" | "unresolved" = "all";

function setCommentsStatus(text: string) {
  commentsStatusEl.textContent = text;
}

/**
 * `figma.fileKey` (the Plugin API property) only works for private/org
 * plugins with `enablePrivatePluginApi` — a regular plugin like this one
 * always gets `undefined`, so there's no way to auto-detect the current
 * file's key. The user pastes the file's URL (any of Figma's /file/, /design/,
 * /proto/ URL forms) or the bare key directly.
 */
function parseFigmaFileKey(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/figma\.com\/(?:file|design|proto)\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  return /^[a-zA-Z0-9]+$/.test(trimmed) ? trimmed : null;
}

/** A reply's own `resolved_at` is always null even inside a resolved thread — Figma only marks the top-level comment resolved — so a reply's effective status is inherited from its parent. */
function toCommentRows(raw: FigmaComment[]): CommentRow[] {
  const byId = new Map(raw.map((c) => [c.id, c]));
  return raw.map((c) => {
    const parent = c.parent_id ? byId.get(c.parent_id) : undefined;
    const effectiveResolved = !!(c.resolved_at || parent?.resolved_at);
    return { ...c, effectiveResolved };
  });
}

let lastFileKey: string | null = null;

/**
 * Figma doesn't publish a URL format that pops open a specific comment's
 * thread directly — only `client_meta.node_id` (the node the comment is
 * pinned to) is documented, so this jumps to that node/frame via the
 * standard `?node-id=` deep link instead of a true comment permalink. A
 * comment pinned loose on the canvas (not attached to any frame) has no
 * `node_id` at all, so there's nothing to link to in that case.
 */
function commentFigmaLink(comment: CommentRow, fileKey: string): string | null {
  const nodeId = comment.client_meta?.node_id;
  if (!nodeId) return null;
  return `https://www.figma.com/file/${fileKey}?node-id=${encodeURIComponent(nodeId.replace(/:/g, "-"))}`;
}

async function fetchComments() {
  if (!figmaToken.trim()) {
    setCommentsStatus(t("comments.statusNoToken"));
    return;
  }
  const fileKey = parseFigmaFileKey(figmaFileLinkInput.value);
  if (!fileKey) {
    setCommentsStatus(t("comments.statusNoFileKey"));
    return;
  }
  lastFileKey = fileKey;
  fetchCommentsBtn.disabled = true;
  commentsFilterRowEl.classList.add("hidden");
  commentsListEl.innerHTML = "";
  setCommentsStatus(t("comments.statusLoading"));
  try {
    const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
      headers: { "X-Figma-Token": figmaToken.trim() },
    });
    if (res.status === 401 || res.status === 403) throw new Error(t("comments.statusTokenInvalid"));
    if (!res.ok) throw new Error(t("comments.statusHttpError", { status: res.status }));
    const data = (await res.json()) as { comments?: FigmaComment[] };
    commentRows = toCommentRows(data.comments ?? []);
    if (commentRows.length === 0) {
      setCommentsStatus(t("comments.statusEmpty"));
    } else {
      setCommentsStatus(t("comments.statusLoaded", { count: commentRows.length }));
      commentsFilterRowEl.classList.remove("hidden");
    }
    renderCommentsAuthorFilter();
    renderCommentsList();
  } catch (err) {
    setCommentsStatus(err instanceof Error ? err.message : t("comments.statusNetworkError"));
  } finally {
    fetchCommentsBtn.disabled = false;
  }
}

function renderCommentsAuthorFilter() {
  const authors = Array.from(new Set(commentRows.map((c) => c.user.handle))).sort((a, b) =>
    a.localeCompare(b)
  );
  const options = [`<option value="all">${escapeHtml(t("comments.filterAuthorAll"))}</option>`].concat(
    authors.map(
      (name) => `<option value="${escapeHtml(name)}" ${name === commentAuthorFilter ? "selected" : ""}>${escapeHtml(name)}</option>`
    )
  );
  commentsAuthorFilterEl.innerHTML = options.join("");
  // Reset to "all" if the previously selected author isn't in the new result set.
  if (commentAuthorFilter !== "all" && !authors.includes(commentAuthorFilter)) {
    commentAuthorFilter = "all";
  }
  commentsAuthorFilterEl.value = commentAuthorFilter;
}

function filteredCommentRows(): CommentRow[] {
  return commentRows.filter((c) => {
    if (commentAuthorFilter !== "all" && c.user.handle !== commentAuthorFilter) return false;
    if (commentStatusFilter === "resolved" && !c.effectiveResolved) return false;
    if (commentStatusFilter === "unresolved" && c.effectiveResolved) return false;
    return true;
  });
}

function renderCommentsList() {
  const rows = filteredCommentRows();
  if (commentRows.length === 0) {
    commentsListEl.innerHTML = "";
    return;
  }
  if (rows.length === 0) {
    commentsListEl.innerHTML = `<div class="empty">${escapeHtml(t("comments.resultsEmpty"))}</div>`;
    return;
  }
  // The author name is only worth repeating on every row when the list still
  // mixes authors — once filtered down to one person, it's redundant noise.
  const showAuthor = commentAuthorFilter === "all";
  commentsListEl.innerHTML = rows
    .map((c) => {
      const badgeClass = c.effectiveResolved ? "comment-badge is-resolved" : "comment-badge";
      const badgeText = c.effectiveResolved ? t("comments.badgeResolved") : t("comments.badgeUnresolved");
      const authorHtml = showAuthor ? `<span class="comment-author">${escapeHtml(c.user.handle)}</span>` : "";
      const link = lastFileKey ? commentFigmaLink(c, lastFileKey) : null;
      // The whole card is the click target when a link is available, rather
      // than a small separate icon — a plain <div> (no link) otherwise, since
      // there's nowhere for it to navigate to.
      const tag = link ? "a" : "div";
      const linkAttrs = link
        ? ` href="${escapeHtml(link)}" target="_blank" rel="noopener" title="${escapeHtml(t("comments.openInFigma"))}"`
        : "";
      return `
        <${tag} class="comment-item${c.parent_id ? " is-reply" : ""}${link ? " is-linkable" : ""}"${linkAttrs}>
          <div class="comment-item-head">
            ${authorHtml}
            <span class="${badgeClass}">${escapeHtml(badgeText)}</span>
          </div>
          <div class="comment-message">${escapeHtml(c.message)}</div>
        </${tag}>
      `;
    })
    .join("");
}

figmaTokenHelpBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  figmaTokenTooltip.classList.toggle("show");
});
document.addEventListener("click", (e) => {
  if (!figmaTokenTooltip.contains(e.target as Node) && e.target !== figmaTokenHelpBtn) {
    figmaTokenTooltip.classList.remove("show");
  }
});

saveFigmaTokenBtn.addEventListener("click", () => {
  figmaToken = figmaTokenInput.value.trim();
  send({ type: "save-figma-token", token: figmaToken });
});

fetchCommentsBtn.addEventListener("click", () => void fetchComments());

commentsAuthorFilterEl.addEventListener("change", () => {
  commentAuthorFilter = commentsAuthorFilterEl.value;
  renderCommentsList();
});

commentsStatusFilterEl.addEventListener("change", () => {
  commentStatusFilter = commentsStatusFilterEl.value as "all" | "resolved" | "unresolved";
  renderCommentsList();
});

window.onmessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage as PluginToUiMessage;
  if (!msg) return;

  switch (msg.type) {
    case "api-key":
      apiKey = msg.key;
      apiKeyInput.value = msg.key;
      showApiKeyMode(apiKey.trim().length > 0);
      break;
    case "scanned-nodes":
      void processScannedNodes(msg.nodes, pendingIncludeDesign);
      break;
    case "scan-empty":
      setBusy(false);
      listEl.innerHTML = "";
      setStatus("");
      break;
    case "apply-fix-result":
    case "apply-design-fix-result":
      // Success/error feedback itself is a native Figma toast (figma.notify)
      // from the main thread — here we just drop the now-fixed issue from view.
      if (msg.success) dropFixedIssue(msg.nodeId, msg.original);
      if (pendingCompareFixes.has(msg.nodeId)) {
        const appliedText = pendingCompareFixes.get(msg.nodeId)!;
        pendingCompareFixes.delete(msg.nodeId);
        if (msg.success && lastCompareSideA && lastCompareSideB) {
          for (const side of [lastCompareSideA, lastCompareSideB]) {
            const entry = side.texts.find((t) => t.nodeId === msg.nodeId);
            if (entry) entry.text = appliedText;
          }
          renderCompareResults(lastCompareSideA, lastCompareSideB);
        }
      }
      break;
    case "delete-layer-result":
      if (msg.success) dropDeletedNode(msg.nodeId);
      break;
    case "rules-config":
      rulesConfig = { ...defaultRulesConfig(), ...msg.config };
      renderRulesPanel();
      break;
    case "rule-values":
      ruleValues = { ...defaultRuleValues(), ...msg.values };
      renderRulesPanel();
      break;
    case "custom-rules":
      customRules = msg.rules;
      customRulesInput.value = customRules;
      break;
    case "ignore-patterns":
      ignorePatterns = msg.patterns;
      ignorePatternsInput.value = ignorePatterns;
      break;
    case "selection-info":
      setSelectionInfo(msg.hasSelection, msg.label, msg.count, msg.names);
      break;
    case "compare-scanned":
      setBusy(false);
      showCompareResultsSection();
      renderCompareResults(msg.sideA, msg.sideB);
      break;
    case "compare-error":
      setBusy(false);
      showComparePicker();
      break;
    case "ui-locale":
      setLocale(msg.locale);
      applyStaticTranslations();
      break;
    case "color-libraries":
      colorLibraries = msg.libraries;
      selectedColorLibrary = msg.selectedLibrary;
      renderRulesPanel();
      break;
    case "color-library-status":
      colorLibraryStatus = { status: msg.status, error: msg.error, colorCount: msg.colorCount };
      renderRulesPanel();
      break;
    case "figma-token":
      figmaToken = msg.token;
      figmaTokenInput.value = msg.token;
      break;
  }
};

interface CompareDiffRow {
  path: string;
  textA: string | null;
  textB: string | null;
  nodeIdA: string | null;
  nodeIdB: string | null;
}

let lastCompareSideA: CompareSide | null = null;
let lastCompareSideB: CompareSide | null = null;
let lastCompareRows: CompareDiffRow[] = [];
// nodeId -> text about to land there, recorded right before sending apply-fix
// so the result handler can update the local compare snapshot once it lands
// (the apply-fix-result message doesn't echo back what was applied).
const pendingCompareFixes = new Map<string, string>();

function computeCompareRows(sideA: CompareSide, sideB: CompareSide): CompareDiffRow[] {
  const mapA = new Map(sideA.texts.map((t) => [t.path, t]));
  const mapB = new Map(sideB.texts.map((t) => [t.path, t]));
  const allPaths = new Set([...mapA.keys(), ...mapB.keys()]);
  const rows: CompareDiffRow[] = [];
  for (const path of allPaths) {
    const a = mapA.get(path);
    const b = mapB.get(path);
    if (a && b && a.text === b.text) continue; // identical on both sides — not interesting
    rows.push({
      path,
      textA: a ? a.text : null,
      textB: b ? b.text : null,
      nodeIdA: a ? a.nodeId : null,
      nodeIdB: b ? b.nodeId : null,
    });
  }
  return rows;
}

/** Length of the run of identical characters shared at the start/end of `a` and `b` — the part NOT worth highlighting, since it's the same on both sides. */
function commonAffixLengths(a: string, b: string): { prefixLen: number; suffixLen: number } {
  let prefixLen = 0;
  const maxPrefix = Math.min(a.length, b.length);
  while (prefixLen < maxPrefix && a[prefixLen] === b[prefixLen]) prefixLen++;
  let suffixLen = 0;
  const maxSuffix = Math.min(a.length, b.length) - prefixLen;
  while (suffixLen < maxSuffix && a[a.length - 1 - suffixLen] === b[b.length - 1 - suffixLen]) suffixLen++;
  return { prefixLen, suffixLen };
}

/** Wraps the part of `text` that differs from `otherText` in a highlight span, so the extra/changed characters jump out instead of having to read both full strings side by side. */
function highlightDiffText(text: string, otherText: string | null): string {
  if (otherText == null || text === otherText) return escapeHtml(text);
  const { prefixLen, suffixLen } = commonAffixLengths(text, otherText);
  const midEnd = Math.max(prefixLen, text.length - suffixLen);
  const prefix = text.slice(0, prefixLen);
  const mid = text.slice(prefixLen, midEnd);
  const suffix = text.slice(midEnd);
  if (!mid) return escapeHtml(text);
  return `${escapeHtml(prefix)}<mark class="diff-highlight">${escapeHtml(mid)}</mark>${escapeHtml(suffix)}`;
}

function renderCompareResults(sideA: CompareSide, sideB: CompareSide) {
  lastCompareSideA = sideA;
  lastCompareSideB = sideB;
  const rows = computeCompareRows(sideA, sideB);
  lastCompareRows = rows;

  compareStatusEl.textContent =
    rows.length === 0
      ? t("compare.noDiff", { a: sideA.name, b: sideB.name })
      : t("compare.foundDiff", { count: rows.length, a: sideA.name, b: sideB.name });

  // Only offer "use this text" when BOTH sides actually have a matched layer
  // — a "missing on one side" row has nothing on the other side to overwrite.
  const renderSide = (
    name: string,
    text: string | null,
    otherText: string | null,
    nodeId: string | null,
    rowIndex: number,
    side: "a" | "b",
    canApply: boolean
  ) => {
    if (nodeId == null) {
      return `<div class="compare-side compare-side-missing"><span class="compare-side-label">${escapeHtml(
        name
      )}</span><div class="compare-side-text">${escapeHtml(t("compare.missingLayer"))}</div></div>`;
    }
    const useBtn = canApply
      ? `<button class="ghost compare-use-btn" type="button" data-action="compare-use" data-row="${rowIndex}" data-side="${side}">${escapeHtml(
          t("compare.useThis")
        )}</button>`
      : "";
    const textHtml = text ? highlightDiffText(text, otherText) : escapeHtml(t("compare.emptyText"));
    return `
      <div class="compare-side">
        <span class="compare-side-label">${escapeHtml(name)}</span>
        <div class="compare-side-text" data-action="compare-select" data-node="${nodeId}">${textHtml}</div>
        ${useBtn}
      </div>
    `;
  };

  compareResultsEl.innerHTML = rows
    .map((row, rowIndex) => {
      const canApply = row.nodeIdA != null && row.nodeIdB != null;
      return `
        <div class="compare-row">
          <div class="compare-pair">
            ${renderSide(sideA.name, row.textA, row.textB, row.nodeIdA, rowIndex, "a", canApply)}
            ${renderSide(sideB.name, row.textB, row.textA, row.nodeIdB, rowIndex, "b", canApply)}
          </div>
        </div>
      `;
    })
    .join("");
}

compareResultsEl.addEventListener("click", (e) => {
  const selectTarget = (e.target as HTMLElement).closest<HTMLElement>('[data-action="compare-select"]');
  if (selectTarget) {
    const nodeId = selectTarget.dataset.node;
    if (nodeId) send({ type: "select-node", nodeId });
    return;
  }

  const useTarget = (e.target as HTMLElement).closest<HTMLElement>('[data-action="compare-use"]');
  if (!useTarget) return;
  const rowIndex = Number(useTarget.dataset.row);
  const chosenSide = useTarget.dataset.side;
  const row = lastCompareRows[rowIndex];
  if (!row || !row.nodeIdA || !row.nodeIdB) return;

  // The side that was NOT chosen is the one getting overwritten.
  const chosenText = chosenSide === "a" ? row.textA : row.textB;
  const targetNodeId = chosenSide === "a" ? row.nodeIdB : row.nodeIdA;
  const targetCurrentText = chosenSide === "a" ? row.textB : row.textA;
  if (chosenText == null || targetNodeId == null || targetCurrentText == null) return;

  pendingCompareFixes.set(targetNodeId, chosenText);
  send({
    type: "apply-fix",
    nodeId: targetNodeId,
    original: targetCurrentText,
    suggestion: chosenText,
  });
});

runCompareBtn.addEventListener("click", () => {
  if (busy || selectionCount !== 2) return;
  setBusy(true);
  compareResultsEl.innerHTML = "";
  compareStatusEl.textContent = t("compare.running");
  send({ type: "scan-compare" });
});

runReviewBtn.addEventListener("click", () => void runCheck(activeConfigTab === "webapp"));
backBtn.addEventListener("click", () => showConfigView());
saveKeyBtn.addEventListener("click", () => {
  apiKey = apiKeyInput.value;
  send({ type: "save-api-key", key: apiKey });
  showApiKeyMode(apiKey.trim().length > 0);
});

editApiKeyBtn.addEventListener("click", () => {
  showApiKeyMode(false);
  apiKeyInput.focus();
});

apiKeyHelpBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  apiKeyTooltip.classList.toggle("show");
});
document.addEventListener("click", (e) => {
  if (!apiKeyTooltip.contains(e.target as Node) && e.target !== apiKeyHelpBtn) {
    apiKeyTooltip.classList.remove("show");
  }
});

saveCustomRulesBtn.addEventListener("click", () => {
  customRules = customRulesInput.value;
  send({ type: "save-custom-rules", rules: customRules });
});

saveIgnorePatternsBtn.addEventListener("click", () => {
  ignorePatterns = ignorePatternsInput.value;
  send({ type: "save-ignore-patterns", patterns: ignorePatterns });
});

applyStaticTranslations();
send({ type: "get-ui-locale" });
send({ type: "get-api-key" });
send({ type: "get-rules-config" });
send({ type: "get-rule-values" });
send({ type: "get-custom-rules" });
send({ type: "get-ignore-patterns" });
send({ type: "get-selection-info" });
send({ type: "get-color-libraries" });
send({ type: "get-figma-token" });
