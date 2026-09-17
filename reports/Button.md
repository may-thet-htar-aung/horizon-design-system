# Button — QA re-test (pass 3), 2026-09-17

| | |
|---|---|
| Woken by | `Development` = `Fixed` (all 9 rows `Fixed (To re-test)`) |
| Staging Storybook (read from the cell) | https://horizon-design-system-git-staging-htar1.vercel.app |
| Commit (read from the cell) | https://github.com/may-thet-htar-aung/horizon-design-system/commit/e2938cdac6c291158671403691cf7e6e0253dd0f |
| Build actually served | `git-staging` branch alias. GitHub deployments list e2938cd as the newest `staging` Preview (04:46:45Z); it is `origin/staging` HEAD. The served `button-CqmMvNwp.css` uses the rebound Figma token names. |
| Design source | Figma `EupMGlgXy06FSwOr2WLZWF`, component set `65:22` "Horizon Button", read live (`get_metadata`, plugin API `boundVariables` resolved per mode) |
| Mode, design side | `semantic` collection resolves to **Light** (its default; no explicit mode on the set or page) |
| Mode, rendered side | `data-theme="light"` (Storybook `theme` global, default `light`); `prefers-color-scheme: light` |
| Fonts | Measured on canvas: "Continue" at 500 14px is 56.18px in `Roboto` and 51.33px in a bogus family, so Roboto is really loaded. `document.fonts` shows Roboto 400 and 500 loaded. |
| Development afterwards | **To be deployed** (summary `Passed`, 9 of 9) |

## Matrix: 9 cases, 9 passed

The matrix is Type (Primary, Outline, Ghost) × State (Default, Hover, Disabled), from Figma. No size axis.
Every case measured 105 × 40 (Figma frame is 105 × 40). Radius `borderradius/small`, padding
`padding/button-inline`, gap `gap/component`, and all five Label/Large tokens resolve from the
tokens of the same name and equal the Figma values on every row.

| Case | Verdict | Colour bindings: Figma (Light) = rendered token | States driven |
|---|---|---|---|
| Primary · Default | Passed | fill `color/bg/primary/idle` = `--color-bg-primary-idle`; label `color/text/inverse` = `--color-text-inverse` | Tab gives `:focus-visible` ring |
| Primary · Hover | Passed | fill `color/bg/primary/hovered` = `--color-bg-primary-hovered` | real pointer hover matches the pinned story |
| Primary · Disabled | Passed | fill `color/bg/surfacePrimary` = `--color-bg-surfaceprimary`; label `color/text/disabled on dark` = `--color-text-disabled-on-dark` | real click fires no event; Tab skips it; hover changes nothing |
| Outline · Default | Passed | no fill (empty fills) = transparent; stroke `color/border/brand/default` = `--color-border-brand-default` (inset, so the box doesn't grow); label `color/text/brand` = `--color-text-brand` | Tab gives the ring |
| Outline · Hover | Passed | fill `color/bg/base` = `--color-bg-base`; stroke `color/border/brand/bold` = `--color-border-brand-bold` | real hover changes both, matching the pinned story |
| Outline · Disabled | Passed | fill `--color-bg-surfaceprimary`; stroke `color/border/disabled` = `--color-border-disabled`; label `--color-text-disabled-on-dark` | real click fires no event; Tab skips it |
| Ghost · Default | Passed | no fill or stroke; label `--color-text-brand` | Tab gives the ring; real click fires 1 event (positive control) |
| Ghost · Hover | Passed | fill `color/bg/primary/Light` = `--color-bg-primary-light`; label `--color-text-brand` | real hover matches the pinned story |
| Ghost · Disabled | Passed | label `--color-text-disabled-on-dark`; no fill | real click fires no event; Tab skips it; hover adds no fill |

Tokens: the served Button CSS contains no raw hex or px values. Every value is a `var(--…)` named after its Figma variable.

## What changed since pass 2 (preview `component-button-outline`, eb35bc3)

- **Colour findings on all 9 rows are gone.** The CSS token build now comes from the Figma export (`core.light` and `semantic`). Every semantic colour Button uses now matches Figma's Light value, and Button uses Figma's own token names.
- **Typeface.** `--family-plain` is now Roboto and Storybook loads it. The rendered width equals the 105 frame. Before, Inter was used and Roboto wasn't loaded.
- **Outline.** The fill at rest is gone (this undoes pass 1's mistaken suggestion). The stroke is now an inset ring, so Outline is the same width as Primary and Ghost. Hover now changes both the fill and the stroke step.
- The rows' `Expected Results`, `Suggestion for Improvement` and `Context` were rewritten for this build. No row still describes an old failure as current.

## Dark mode

**Figma defines dark mode for Button, but the matrix doesn't cover it.** Every colour on the set is
bound to the `semantic` collection, which has `Light` and `Dark` modes. The set pins no mode and has
no Theme variant, so dark mode is defined by the bindings, not by a variant axis. My procedure builds the
matrix from variant × size × state only, so I added no rows. **This is a coverage gap for a human to
decide on:** either add a mode dimension to the matrix (9 more rows) or state that dark mode is out of
scope for Button.

It's still worth recording, so I checked it once without adding rows. Storybook `globals=theme:dark`
sets `data-theme="dark"`. Against Figma's `Dark` mode, all 9 cases render exactly Figma's dark value
for every fill, stroke and label, including the remapped ones: `color/bg/primary/idle`,
`color/text/inverse`, `color/border/brand/default` and `/bold`, `color/border/disabled` (translucent), and
`color/bg/surfacePrimary`. Nothing is wrong in the component or the export.

Design notes, not engineering defects:

- In Dark, `color/text/disabled on dark` sits on `color/bg/surfacePrimary`, which is also the page background. The disabled label is nearly invisible (see `staging-*-disabled-dark.png`). This is what the design specifies.
- The design gives dark Primary · Hover a dark label on a mid blue. Contrast is low.

## Design gaps (unbound in Figma, not logged against the engineer)

- Keyboard focus: the set description says there is no focus treatment "yet in this set". The CSS uses `--borderwidth-3` and `--color-border-brand-bold`.
- Icon size 20 is unbound (`icon/size-20` is unpublished). The CSS uses `--spacing-20`.
- The stories `icon-left`, `icon-right`, `icon-both` and `all-variants` have no variant row in Figma. They exercise the `Show Icon` boolean properties, which aren't a matrix axis. I didn't test them as cases.

## Evidence

`reports/Button/retest-2026-09-17b/`:
- `figma-65-22-light.png`: Figma render of the set (Light)
- `staging-<type>-<state>-light.png`: deployed story, Light, one per row
- `staging-<type>-<state>-dark.png`: deployed story, Dark, one per case

**Not done: `Attachment` on the rows is still empty.** Airtable attachments need a publicly
fetchable URL. The screenshots exist only on disk here, and Figma's render URL is short-lived and
marked not to be shared. Someone needs to decide where QA evidence images are hosted before rows can
carry them.
