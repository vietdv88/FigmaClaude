# FigmaClaude monorepo — instructions for Claude

## `mds-ui` is the single source of truth for controls

`congviec-app` (and any other app in this repo) consumes the design system in
`mds-ui/src/style.css` via the `@mds` alias. **Never invent one-off CSS for a
button/input/icon-button.** Always reuse what already exists there.

### Rule: every control's size must come from the density tokens

- The canonical size tokens are `var(--btn-height)` and `var(--input-height)`,
  defined in `mds-ui/src/style.css` and overridden per `[data-density]`
  (Compact / Trung bình / Rộng — set via the header's display-density picker).
- **Never write a hardcoded pixel `height`/`width` on a button, input, or
  icon-button** (e.g. `height:28px`, `height:30px`, `width:24px`). If a
  control needs to be smaller/larger than the standard size, derive it from
  the token with the *same step mds-ui already uses elsewhere*:
  - small: `calc(var(--btn-height) - 4px)` (matches `.btn--sm`, `.btn-icon--sm`)
  - large: `calc(var(--btn-height) + 8px)` (matches `.btn--lg`)
  - Don't make up other offsets (`-12px`, `-16px`, etc.) unless you're
    matching an already-established, documented ratio in this file's history.
- Before styling a new control, grep `mds-ui/src/style.css` for an existing
  class that already does the job (`.btn`, `.btn--primary`, `.btn--outline`,
  `.btn-icon`, `.btn-icon--outline`, `.btn-icon--sm`, `.vctt-grp`, `.fb-search`,
  etc.) and reuse the class directly — only the text/icon/label should differ
  between usages. Only fall back to new custom CSS when no existing class is a
  semantic match, and even then, size it off the tokens above.
- This has been missed repeatedly (hardcoded heights on `.vctt-view`,
  `.vctt-filter-btn`, `.vctt-proj`, `.fb-search`, `.kcol-add`,
  `.cal-nav-btn`, `.cal-today-btn`, etc.) — always double-check new/edited
  control CSS against this rule before considering a UI task done. See the
  `control-audit` skill for a repeatable way to check the whole repo.

### Exception: the left sidebar is fixed pixel sizing, NOT density-linked

`congviec-app/src/components/CvSidebar.vue`, plus the shared
`.sidebar-item`/`.btn-collapse` rules in `mds-ui/src/style.css`, are the one
deliberate, explicit exception to the rule above — by direct user instruction,
**do not** convert the sidebar's own controls to `var(--btn-height)`. This was
tried and reverted twice in one session because it broke the sidebar's look.
Fixed values to keep: `.sidebar-item` 36px, `.cv-group__hd`/`.cv-proj`/
`.cv-add-group` 36px, `.cv-search-row` 32px, `.cv-tool-btn` 24px, `.cv-act`
20px, `.cv-inline-input` 22px, `.btn-collapse` 40px. The one control inside
the sidebar that legitimately DOES use `var(--btn-height)` is the quick-add
split button (`.btn-add-quick`/`.qab-split`) — that was already the case
before this rule existed, so leave it as-is rather than "fixing" it to match
its fixed-height neighbors.

### Density token reference (`mds-ui/src/style.css`)

- `:root` (default = "Trung bình"): `--btn-height: 32px`, `--input-height: 32px`
- `[data-density="compact"]`: `28px`
- `[data-density="comfortable"]` ("Rộng"): `36px`
