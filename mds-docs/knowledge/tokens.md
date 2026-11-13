<!-- source: Token CSS thật trong mds-ui/src/style.css -->
# Token CSS của mds-ui (giá trị thật trong code)

Mật độ hiển thị: **Trung bình** (mặc định, :root) · **Nhỏ** ([data-density="compact"]) · **Rộng** ([data-density="comfortable"]). Ô trống = giống Trung bình.

## Token đổi theo mật độ hiển thị

| Token | Trung bình | Nhỏ | Rộng |
|---|---|---|---|
| `--input-height` | 32px | 28px | 36px |
| `--btn-height` | 32px | 28px | 36px |
| `--dt-row-height` | 32px | 32px | 36px |
| `--dt-footer-h` | 36px | 32px | 40px |
| `--paging-px` | 16px | 12px |  |
| `--paging-h` | 48px | 40px | 56px |
| `--radius-default` | 8px | 6px |  |
| `--radius-inner` | 6px | 4px |  |
| `--radius-focus` | 12px | 8px |  |
| `--btn-px` | 12px |  | 14px |
| `--tab-px` | 12px |  | 20px |
| `--tab-h` | 36px |  | 40px |
| `--menu-item-h` | 32px |  | 36px |
| `--menu-item-h-2` | 48px |  | 52px |
| `--menu-item-px` | 12px |  | 16px |
| `--menu-sep-my` | 4px |  | 8px |
| `--menu-min-w` | 80px |  | 96px |

## Token nhóm "accent"

| Token | Giá trị |
|---|---|
| `--accent-50` | #fcfaff |
| `--accent-100` | #f9f5ff |
| `--accent-200` | #f4ebff |
| `--accent-300` | #e9d7fe |
| `--accent-400` | #d6bbfb |
| `--accent-500` | #b692f6 |
| `--accent-600` | #9e77ed |
| `--accent-700` | #7f56d9 |
| `--accent-800` | #6941c6 |
| `--accent-900` | #53389e |
| `--accent-950` | #42307d |

## Token nhóm "ai"

| Token | Giá trị |
|---|---|
| `--ai-begin-50` | #edf9ff |
| `--ai-begin-100` | #d7efff |
| `--ai-begin-200` | #b9e5ff |
| `--ai-begin-300` | #88d6ff |
| `--ai-begin-400` | #50beff |
| `--ai-begin-500` | #289eff |
| `--ai-begin-600` | #1482ff |
| `--ai-begin-700` | #0a68eb |
| `--ai-begin-800` | #0f53be |
| `--ai-begin-900` | #134995 |
| `--ai-begin-950` | #112d5a |
| `--ai-end-50` | #fef2ff |
| `--ai-end-100` | #fae3ff |
| `--ai-end-200` | #f6c6ff |
| `--ai-end-300` | #f499ff |
| `--ai-end-400` | #ee5dff |
| `--ai-end-500` | #e021ff |
| `--ai-end-600` | #cf11ff |
| `--ai-end-700` | #aa00cf |
| `--ai-end-800` | #8c00a9 |
| `--ai-end-900` | #760689 |
| `--ai-end-950` | #4f005e |
| `--ai-border-on-white` | linear-gradient(var(--bg-white), var(--bg-white)) padding-box, var(--stroke-ai) border-box |
| `--ai-border-on-ai-light` | linear-gradient(var(--bg-ai-light), var(--bg-ai-light)) padding-box, linear-gradient(var(--bg-white), var(--bg-white)) padding-box, var(--stroke-ai) border-box |
| `--ai-grad-50` | linear-gradient(110deg, var(--ai-begin-50) 0%, var(--ai-end-50) 100%) |
| `--ai-grad-100` | linear-gradient(110deg, var(--ai-begin-100) 0%, var(--ai-end-100) 100%) |
| `--ai-grad-300` | linear-gradient(110deg, var(--ai-begin-300) 0%, var(--ai-end-300) 100%) |
| `--ai-grad-600` | linear-gradient(110deg, var(--ai-begin-600) 0%, var(--ai-end-600) 100%) |
| `--ai-grad-700` | linear-gradient(110deg, var(--ai-begin-700) 0%, var(--ai-end-700) 100%) |
| `--ai-grad-800` | linear-gradient(110deg, var(--ai-begin-800) 0%, var(--ai-end-800) 100%) |

## Token nhóm "alpha"

| Token | Giá trị |
|---|---|
| `--alpha-white-0` | #ffffff00 |
| `--alpha-white-50` | #ffffff0d |
| `--alpha-white-100` | #ffffff1a |
| `--alpha-white-200` | #ffffff33 |
| `--alpha-white-300` | #ffffff4d |
| `--alpha-white-400` | #ffffff66 |
| `--alpha-white-500` | #ffffff80 |
| `--alpha-white-600` | #ffffff99 |
| `--alpha-white-700` | #ffffffb2 |
| `--alpha-white-800` | #ffffffcc |
| `--alpha-white-900` | #ffffffe5 |
| `--alpha-white-950` | #fffffff2 |
| `--alpha-black-0` | #00000000 |
| `--alpha-black-50` | #0000000d |
| `--alpha-black-100` | #0000001a |
| `--alpha-black-200` | #00000033 |
| `--alpha-black-300` | #0000004d |
| `--alpha-black-400` | #00000066 |
| `--alpha-black-500` | #00000080 |
| `--alpha-black-600` | #00000099 |
| `--alpha-black-700` | #000000b2 |
| `--alpha-black-800` | #000000cc |
| `--alpha-black-900` | #000000e5 |
| `--alpha-black-950` | #000000f2 |

## Token nhóm "bg"

| Token | Giá trị |
|---|---|
| `--bg-ai-light` | rgba(20, 130, 255, 0.06) |
| `--bg-overlay` | rgba(16, 24, 40, 0.4) |
| `--bg-ai-gradient` | linear-gradient(110deg, var(--ai-begin-600) 9%, var(--ai-end-600) 100%) |
| `--bg-ai-gradient-light` | linear-gradient(111deg, var(--ai-begin-50) 8.87%, #fee2ff 100%) |
| `--bg-page` | var(--neutral-150) |
| `--bg-white` | var(--white) |
| `--bg-black` | var(--black) |
| `--bg-brand` | var(--brand-600) |
| `--bg-brand-hover` | var(--brand-700) |
| `--bg-brand-pressed` | var(--brand-800) |
| `--bg-brand-light` | var(--brand-50) |
| `--bg-brand-light-hover` | var(--brand-100) |
| `--bg-brand-light-pressed` | var(--brand-200) |
| `--bg-brand-disable` | var(--brand-400) |
| `--bg-neutral` | var(--neutral-600) |
| `--bg-neutral-light` | var(--neutral-150) |
| `--bg-neutral-lighter` | var(--neutral-50) |
| `--bg-neutral-hover` | var(--neutral-200) |
| `--bg-neutral-pressed` | var(--neutral-250) |
| `--bg-neutral-disable` | var(--neutral-400) |
| `--bg-info` | var(--info-700) |
| `--bg-info-hover` | var(--info-800) |
| `--bg-info-pressed` | var(--info-900) |
| `--bg-info-light` | var(--info-100) |
| `--bg-info-light-hover` | var(--info-200) |
| `--bg-info-light-pressed` | var(--info-300) |
| `--bg-info-disable` | var(--info-400) |
| `--bg-warning` | var(--warning-600) |
| `--bg-warning-hover` | var(--warning-700) |
| `--bg-warning-pressed` | var(--warning-800) |
| `--bg-warning-light` | var(--warning-100) |
| `--bg-warning-light-hover` | var(--warning-200) |
| `--bg-warning-light-pressed` | var(--warning-300) |
| `--bg-warning-disable` | var(--warning-400) |
| `--bg-danger` | var(--danger-600) |
| `--bg-danger-hover` | var(--danger-700) |
| `--bg-danger-pressed` | var(--danger-800) |
| `--bg-danger-light` | var(--danger-100) |
| `--bg-danger-light-hover` | var(--danger-200) |
| `--bg-danger-light-pressed` | var(--danger-300) |
| `--bg-danger-disable` | var(--danger-400) |
| `--bg-success` | var(--success-600) |
| `--bg-success-hover` | var(--success-700) |
| `--bg-success-pressed` | var(--success-800) |
| `--bg-success-light` | var(--success-100) |
| `--bg-success-light-hover` | var(--success-200) |
| `--bg-success-light-pressed` | var(--success-300) |
| `--bg-success-disable` | var(--success-400) |
| `--bg-accent` | var(--accent-600) |
| `--bg-accent-hover` | var(--accent-600) |
| `--bg-accent-pressed` | var(--accent-700) |
| `--bg-accent-light` | var(--accent-100) |
| `--bg-accent-light-hover` | var(--accent-200) |
| `--bg-accent-light-pressed` | var(--accent-300) |
| `--bg-accent-disable` | var(--accent-400) |
| `--bg-form-footer` | var(--neutral-100) |

## Token nhóm "black"

| Token | Giá trị |
|---|---|
| `--black` | #000000 |

## Token nhóm "box"

| Token | Giá trị |
|---|---|
| `--box-padding` | 16px |

## Token nhóm "brand"

| Token | Giá trị |
|---|---|
| `--brand-50` | #f0f6fe |
| `--brand-100` | #ddeafc |
| `--brand-200` | #c2dbfb |
| `--brand-300` | #99c5f7 |
| `--brand-400` | #68a6f2 |
| `--brand-500` | #4584ec |
| `--brand-600` | #245fdf |
| `--brand-700` | #2753ce |
| `--brand-800` | #2644a7 |
| `--brand-900` | #243d84 |

## Token nhóm "btn"

| Token | Giá trị |
|---|---|
| `--btn-min-width` | 80px |
| `--btn-gap` | 8px |

## Token nhóm "card"

| Token | Giá trị |
|---|---|
| `--card-px` | 16px |
| `--card-py` | 16px |
| `--card-gap` | 12px |
| `--card-col-gap` | 16px |

## Token nhóm "chart"

| Token | Giá trị |
|---|---|
| `--chart-c1` | #245fdf |
| `--chart-c2` | #12b76a |
| `--chart-c3` | #f79009 |
| `--chart-c4` | #f04438 |
| `--chart-c5` | #0ba5ec |
| `--chart-c6` | #7a5af8 |
| `--chart-primary` | var(--bg-brand) |
| `--chart-target` | var(--chart-c3) |

## Token nhóm "danger"

| Token | Giá trị |
|---|---|
| `--danger-50` | #fffbfa |
| `--danger-100` | #fef3f2 |
| `--danger-200` | #fee4e2 |
| `--danger-300` | #fecdca |
| `--danger-400` | #fda29b |
| `--danger-500` | #f97066 |
| `--danger-600` | #f04438 |
| `--danger-700` | #d92d20 |
| `--danger-800` | #b42318 |
| `--danger-900` | #912018 |
| `--danger-950` | #7a271a |

## Token nhóm "dialog"

| Token | Giá trị |
|---|---|
| `--dialog-px` | 24px |
| `--dialog-py` | 16px |

## Token nhóm "dt"

| Token | Giá trị |
|---|---|
| `--dt-header-bg` | var(--neutral-150) |
| `--dt-footer-bg` | var(--neutral-150) |
| `--dt-row-height-2` | 56px |
| `--dt-row-height-3` | 72px |

## Token nhóm "font"

| Token | Giá trị |
|---|---|
| `--font-family` | InterVariable, 'Inter var', sans-serif |

## Token nhóm "footer"

| Token | Giá trị |
|---|---|
| `--footer-py` | 12px |

## Token nhóm "form"

| Token | Giá trị |
|---|---|
| `--form-label-w` | 200px |
| `--form-label-gap-h` | 8px |
| `--form-row-gap-h` | 12px |
| `--form-row-gap-v` | 16px |
| `--form-group-gap` | 32px |
| `--form-group-title-gap` | 12px |

## Token nhóm "fw"

| Token | Giá trị |
|---|---|
| `--fw-regular` | 400 |
| `--fw-medium` | 500 |
| `--fw-semibold` | 600 |
| `--fw-bold` | 700 |

## Token nhóm "gap"

| Token | Giá trị |
|---|---|
| `--gap-control` | 8px |

## Token nhóm "icon"

| Token | Giá trị |
|---|---|
| `--icon-ai` | var(--ai-grad-600) |
| `--icon-neutral` | var(--neutral-700) |
| `--icon-neutral-hover` | var(--brand-600) |
| `--icon-neutral-disabled` | var(--neutral-400) |
| `--icon-brand` | var(--brand-600) |
| `--icon-brand-hover` | var(--brand-500) |
| `--icon-brand-disabled` | var(--brand-400) |
| `--icon-link` | var(--brand-700) |
| `--icon-link-default` | var(--info-700) |
| `--icon-link-disabled` | var(--brand-400) |
| `--icon-white` | var(--white) |
| `--icon-white-hover` | var(--alpha-white-500) |
| `--icon-white-disabled` | var(--alpha-white-700) |
| `--icon-info` | var(--info-700) |
| `--icon-info-hover` | var(--info-500) |
| `--icon-info-disabled` | var(--info-400) |
| `--icon-warning` | var(--warning-700) |
| `--icon-warning-hover` | var(--warning-500) |
| `--icon-warning-disabled` | var(--warning-400) |
| `--icon-danger` | var(--danger-600) |
| `--icon-danger-hover` | var(--danger-500) |
| `--icon-danger-disabled` | var(--danger-400) |
| `--icon-success` | var(--success-700) |
| `--icon-success-hover` | var(--success-500) |
| `--icon-success-disabled` | var(--success-400) |
| `--icon-accent` | var(--accent-600) |
| `--icon-accent-hover` | var(--accent-500) |
| `--icon-accent-disabled` | var(--accent-400) |

## Token nhóm "info"

| Token | Giá trị |
|---|---|
| `--info-50` | #f5faff |
| `--info-100` | #eff8ff |
| `--info-200` | #d1e9ff |
| `--info-300` | #b2ddff |
| `--info-400` | #84caff |
| `--info-500` | #53b1fd |
| `--info-600` | #2e90fa |
| `--info-700` | #1570ef |
| `--info-800` | #175cd3 |
| `--info-900` | #1849a9 |
| `--info-950` | #194185 |

## Token nhóm "input"

| Token | Giá trị |
|---|---|
| `--input-px` | 12px |
| `--input-py` | 8px |
| `--input-label-gap` | 4px |

## Token nhóm "layout"

| Token | Giá trị |
|---|---|
| `--layout-header-h` | 48px |
| `--layout-sidebar-w` | 200px |
| `--layout-sidebar-sm-w` | 64px |
| `--layout-page-header-h` | 56px |

## Token nhóm "lh"

| Token | Giá trị |
|---|---|
| `--lh-btn-md` | 20px |
| `--lh-btn-sm` | 18px |
| `--lh-label` | 20px |

## Token nhóm "menu"

| Token | Giá trị |
|---|---|
| `--menu-pad` | 8px |
| `--menu-gap` | 0px |
| `--menu-item-gap` | 8px |
| `--menu-icon` | 20px |
| `--menu-radius` | var(--radius-default) |

## Token nhóm "neutral"

| Token | Giá trị |
|---|---|
| `--neutral-50` | #fbfbfc |
| `--neutral-100` | #f4f4f6 |
| `--neutral-150` | #f2f2f4 |
| `--neutral-200` | #ecedef |
| `--neutral-250` | #e6e7ea |
| `--neutral-300` | #e5e6e9 |
| `--neutral-350` | #d7dade |
| `--neutral-400` | #ced1d6 |
| `--neutral-450` | #b6bac1 |
| `--neutral-500` | #9da2ac |
| `--neutral-600` | #8f949d |
| `--neutral-700` | #6b707a |
| `--neutral-800` | #484e59 |
| `--neutral-900` | #303642 |
| `--neutral-950` | #10141b |

## Token nhóm "page"

| Token | Giá trị |
|---|---|
| `--page-gutter` | 16px |

## Token nhóm "radius"

| Token | Giá trị |
|---|---|
| `--radius-sm` | 4px |
| `--radius-dialog` | 12px |
| `--radius-pill` | 9999px |
| `--radius-card` | 8px |

## Token nhóm "shadow"

| Token | Giá trị |
|---|---|
| `--shadow-all-2` | 0 0 2px 0 var(--alpha-black-100) |
| `--shadow-all-4` | 0 0 4px 0 var(--alpha-black-100) |
| `--shadow-all-8` | 0 0 8px 0 var(--alpha-black-100) |
| `--shadow-all-12` | 0 0 12px 0 var(--alpha-black-100) |
| `--shadow-bottom-2` | 0 1px 2px 0 var(--alpha-black-100) |
| `--shadow-bottom-4` | 0 1px 4px 0 var(--alpha-black-100) |
| `--shadow-bottom-8` | 0 2px 8px 0 var(--alpha-black-100) |
| `--shadow-bottom-12` | 0 4px 12px 0 var(--alpha-black-100) |
| `--shadow-bottom-16` | 0 4px 16px 0 var(--alpha-black-100) |
| `--shadow-bottom-20` | 0 6px 20px 0 var(--alpha-black-100) |
| `--shadow-top-4` | 0 -1px 4px 0 var(--alpha-black-100) |
| `--shadow-top-8` | 0 -2px 8px 0 var(--alpha-black-100) |
| `--shadow-top-12` | 0 -4px 12px 0 var(--alpha-black-100) |
| `--shadow-right-4` | 1px 0 4px 0 var(--alpha-black-100) |
| `--shadow-right-8` | 2px 0 8px 0 var(--alpha-black-100) |
| `--shadow-right-12` | 4px 0 12px 0 var(--alpha-black-100) |
| `--shadow-left-4` | -1px 0 4px 0 var(--alpha-black-100) |
| `--shadow-left-8` | -2px 0 8px 0 var(--alpha-black-100) |
| `--shadow-left-12` | -4px 0 12px 0 var(--alpha-black-100) |
| `--shadow-card` | var(--shadow-all-2) |
| `--shadow-popover` | var(--shadow-bottom-12) |
| `--shadow-sm` | var(--shadow-bottom-2) |
| `--shadow-md` | var(--shadow-bottom-8) |
| `--shadow-lg` | var(--shadow-bottom-12) |
| `--shadow-dialog` | var(--shadow-bottom-12) |

## Token nhóm "stroke"

| Token | Giá trị |
|---|---|
| `--stroke-ai` | var(--ai-grad-600) |
| `--stroke-neutral` | var(--neutral-400) |
| `--stroke-neutral-light` | var(--neutral-300) |
| `--stroke-neutral-disable` | var(--neutral-200) |
| `--stroke-divider` | var(--neutral-300) |
| `--stroke-brand` | var(--brand-600) |
| `--stroke-brand-light` | var(--brand-300) |
| `--stroke-brand-disabled` | var(--brand-400) |
| `--stroke-white` | var(--white) |
| `--stroke-white-disabled` | var(--alpha-white-700) |
| `--stroke-info` | var(--info-700) |
| `--stroke-info-light` | var(--info-300) |
| `--stroke-info-disabled` | var(--info-400) |
| `--stroke-warning` | var(--warning-700) |
| `--stroke-warning-light` | var(--warning-300) |
| `--stroke-warning-disabled` | var(--warning-400) |
| `--stroke-danger` | var(--danger-600) |
| `--stroke-danger-light` | var(--danger-300) |
| `--stroke-danger-disabled` | var(--danger-400) |
| `--stroke-success` | var(--success-700) |
| `--stroke-success-light` | var(--success-300) |
| `--stroke-success-disabled` | var(--success-400) |
| `--stroke-accent` | var(--accent-600) |
| `--stroke-accent-light` | var(--accent-300) |
| `--stroke-accent-disabled` | var(--accent-400) |
| `--stroke-form-footer` | var(--stroke-neutral) |

## Token nhóm "success"

| Token | Giá trị |
|---|---|
| `--success-50` | #f6fef9 |
| `--success-100` | #ecfdf3 |
| `--success-200` | #d1fadf |
| `--success-300` | #a6f4c5 |
| `--success-400` | #6ce9a6 |
| `--success-500` | #32d583 |
| `--success-600` | #12b76a |
| `--success-700` | #039855 |
| `--success-800` | #027a48 |
| `--success-900` | #05603a |
| `--success-950` | #054f31 |

## Token nhóm "text"

| Token | Giá trị |
|---|---|
| `--text-primary` | var(--neutral-950) |
| `--text-secondary` | var(--neutral-700) |
| `--text-hint` | var(--neutral-500) |
| `--text-disabled` | var(--neutral-500) |
| `--text-brand` | var(--brand-600) |
| `--text-brand-disabled` | var(--brand-400) |
| `--text-link` | var(--brand-600) |
| `--text-link-default` | var(--info-700) |
| `--text-link-disabled` | var(--brand-400) |
| `--text-link-hover` | var(--brand-800) |
| `--text-link-default-hover` | var(--info-800) |
| `--text-white` | var(--white) |
| `--text-white-disabled` | var(--alpha-white-700) |
| `--text-info` | var(--info-700) |
| `--text-info-disabled` | var(--info-400) |
| `--text-warning` | var(--warning-700) |
| `--text-warning-disabled` | var(--warning-400) |
| `--text-danger` | var(--danger-600) |
| `--text-danger-disabled` | var(--danger-400) |
| `--text-success` | var(--success-700) |
| `--text-success-disabled` | var(--success-400) |
| `--text-accent` | var(--accent-600) |
| `--text-accent-disabled` | var(--accent-400) |
| `--text-ai` | var(--ai-grad-600) |
| `--text-h1` | 24px |
| `--text-h1-lh` | 32px |
| `--text-h2` | 20px |
| `--text-h2-lh` | 28px |
| `--text-h3` | 16px |
| `--text-h3-lh` | 22px |
| `--text-body` | 13px |
| `--text-body-lh` | 20px |
| `--text-body-sm` | 12px |
| `--text-body-sm-lh` | 18px |
| `--text-body-md` | 14px |
| `--text-body-md-lh` | 22px |
| `--text-body-lg` | 16px |
| `--text-body-lg-lh` | 24px |
| `--text-caption` | 10px |
| `--text-caption-lh` | 15px |
| `--text-overline` | 11px |
| `--text-overline-lh` | 16px |
| `--text-sm` | var(--text-body-sm) |
| `--text-sm-lh` | 16px |

## Token nhóm "warning"

| Token | Giá trị |
|---|---|
| `--warning-50` | #fffcf5 |
| `--warning-100` | #fffaeb |
| `--warning-200` | #fef0c7 |
| `--warning-300` | #fedf89 |
| `--warning-400` | #fec84b |
| `--warning-500` | #fdb022 |
| `--warning-600` | #f79009 |
| `--warning-700` | #dc6803 |
| `--warning-800` | #b54708 |
| `--warning-900` | #93370d |
| `--warning-950` | #7a2e0e |

## Token nhóm "white"

| Token | Giá trị |
|---|---|
| `--white` | #ffffff |

## Token nhóm "z"

| Token | Giá trị |
|---|---|
| `--z-drawer` | 900 |
| `--z-dialog` | 1000 |
| `--z-side-panel` | 1050 |
| `--z-header-pop` | 9600 |
