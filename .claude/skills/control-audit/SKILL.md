---
name: control-audit
description: Audit every button/input/icon-button/dropdown-trigger/search-box-like control across the FigmaClaude monorepo (mds-ui + congviec-app + any other app) for hardcoded pixel height/width instead of the shared mds-ui density tokens (var(--btn-height), var(--input-height)). Use this whenever the user asks to check, audit, review, or "rà soát" control sizing/height consistency, whenever a new control's CSS has just been written or edited and needs a sanity check, or whenever the user reports that two controls in the same row/toolbar look mismatched in height even though "they should be using the same rule." Also use it proactively after any UI edit that adds or resizes a button/input/toolbar row in this repo, before calling the task done.
---

# Control sizing audit (mds-ui density tokens)

## The broader principle, not just the token rule

The token rule below (always derive from `var(--btn-height)`) is *how* you
achieve the real goal: **any two elements sitting next to each other in the
same row/toolbar must visually match in height and border-radius**, whether
or not either one is a "control" in the strict button/input sense. A plain
label or title that happens to sit in a flex row next to real buttons/tabs
is just as visible a mismatch if it's given its own fixed `height` (or
`align-self` that pulls it out of the row's stretch behavior) while its
neighbors stretch to fill the row. Concretely: if the row's siblings rely on
`align-items:stretch` to fill the row height (e.g. tab buttons that don't set
their own height and just center their text with `align-items:center`),
don't give ONE sibling in that same row an explicit fixed height + a hover/
chip background — that makes it look like a control with the wrong size
rather than a label, and it'll visibly sit shorter than its neighbors. Prefer
letting it stretch too. This is a distinct failure mode from the
hardcoded-pixel-height issue documented below — check for both.

## Why this exists

`mds-ui/src/style.css` is the single source of truth for control sizing in this
monorepo. It defines `--btn-height` and `--input-height`, which change value
under `[data-density="compact"]` / default ("Trung bình") / `[data-density="comfortable"]`
("Rộng") — the density picker in the app header. Every interactive control
(button, input, icon-button, dropdown trigger, filter chip, search box, tab,
toggle) is supposed to derive its height from these tokens so that:

- switching density resizes every control together, and
- controls sitting in the same row always line up, even if their CSS lives in
  different files or was written at different times.

The recurring bug: someone (often Claude, mid-session) hand-types a literal
pixel height like `height:28px` or `height:30px` on a new control instead of
referencing the token. It looks fine in isolation, but the moment it sits next
to a sibling that correctly uses `calc(var(--btn-height) - 4px)`, the two are
off by a couple of px — visually "one control is shorter than the others" —
and it's invisible to text search because the literal offending number (e.g.
`30`) isn't the number the person expects to be hunting for (they're looking
for `28`, the token's *computed* value, not the token itself).

## The rule (condensed — the full version lives in `/Users/dvviet/Github/FigmaClaude/CLAUDE.md`, keep both in sync if this changes)

- Never write a literal pixel `height`/`width` on a control. Always use:
  - `var(--btn-height)` / `var(--input-height)` — standard size, or
  - `calc(var(--btn-height) - 4px)` — the established "small" step (matches
    `.btn--sm`, `.btn-icon--sm`, and most secondary toolbar controls like
    `.vctt-grp`, `.fb-search`, `.vctt-view`, `.vctt-filter-btn`), or
  - `calc(var(--btn-height) + 8px)` — the established "large" step (`.btn--lg`).
  - Don't invent other offsets (`-12px`, `-16px`, etc.) unless matching a
    ratio that's already documented as intentional somewhere nearby.
- Two documented, deliberate exceptions — these are correct as fixed pixel
  values and are NOT bugs, don't "fix" them:
  1. **The entire left sidebar** (`congviec-app/src/components/CvSidebar.vue`,
     plus the shared `.sidebar-item`/`.btn-collapse` rules in
     `mds-ui/src/style.css`) is fixed pixel sizing throughout, by explicit
     user instruction — it must NOT follow density at all. This covers the
     top nav (`.sidebar-item`, 36px), the tree rows (`.cv-group__hd`,
     `.cv-proj`, `.cv-add-group`, all 36px), `.cv-search-row` (32px),
     `.cv-tool-btn` (24px), `.cv-act` (20px), `.cv-inline-input` (22px), and
     `.btn-collapse` (40px). Do not convert any of these to
     `var(--btn-height)`/`calc(...)` even if they "should" per the general
     rule — this was tried and explicitly reverted twice in one session.
     (The quick-add split button, `.btn-add-quick`/`.qab-split`, is the one
     exception *within* the sidebar that legitimately uses
     `var(--btn-height)` — that was already the case before anyone touched
     this file, so leave it alone rather than "fixing" it to match its
     neighbors.)
  2. **Dropdown/menu item rows** — things like `.grp-dd__item`, `.qa-dd__item`,
     `.kcol-dd__item`, `.proj-item` (rows *inside* an open dropdown panel,
     not the trigger control itself) are conventionally fixed at ~34–40px
     across this codebase and are not meant to scale with density.
  - Also not bugs: avatars, color dots/swatches, count badges, modal/dialog
    chrome, and anything else that isn't actually an interactive
    button/input-like control a user clicks to act on the density-sensitive
    row it lives in.

## How to run the audit

1. **Find candidates.** Search every `.vue` file's `<style>` block (scoped or
   not) across the whole monorepo — not just `congviec-app` — plus
   `mds-ui/src/style.css` itself, for a CSS rule that:
   - targets a selector that looks like an interactive control (name contains
     `btn`, `input`, `search`, `filter`, `grp`, `tab`, `view`, `toolbar`,
     `dd` *only when it's the trigger, not the `__item` inside it*, `sel`,
     `chip`, `pill`, `switch`, `toggle` — or visually behaves like one:
     `cursor:pointer` + `border` + `background` that reads as a clickable
     chip/box), **and**
   - sets `height:` and/or `width:` to a literal number+`px` (not `var(...)`,
     not `calc(var(...))`).

   A good first pass:
   ```bash
   grep -rnE "height:\s*[0-9]+px|width:\s*[0-9]+px" --include=*.vue --include=style.css .
   ```
   then filter by eye/selector-name against the control-like heuristics above
   — this will over-match (avatars, dots, badges, dialog chrome), so judgment
   is required on every hit, not just a mechanical find-replace.

2. **Classify each hit.**
   - **(a) Should use the token** — a real button/input/icon-button/dropdown
     trigger/search box/tab/filter-chip. Fix it.
   - **(b) Deliberate fixed size** — one of the two documented exceptions
     above, or a genuinely non-control element (avatar, dot, badge, dialog
     chrome, menu-item row). Leave it, and don't flag it as a finding.

3. **Fix each (a) finding.** Pick the token/step by looking at what its
   siblings *in the same row/toolbar* already use — if the row's other
   controls are at `calc(var(--btn-height) - 4px)`, match that step; if this
   is the row's primary action control (e.g. a `.btn--primary`), it's
   probably meant to be the full `var(--btn-height)`. When in doubt, prefer
   the plain token over inventing a new step.

4. **Report.** Finish with a short table:

   | Control class | File:line | Before | Fixed to | Note |
   |---|---|---|---|---|

   List every (a) finding you fixed, in a compact form — file:line, the old
   literal value, and the token expression it's now using. If everything was
   already consistent, say so plainly instead of padding the report.

## After fixing

Confirm the dev server (if running — check for an `npm run dev` /
`vite` process, e.g. via its log file) picked up the changes with no compile
errors before reporting done. Don't just assume the edits are safe because
they're CSS-only — a stray unmatched brace in a `<style>` block still breaks
the build.
