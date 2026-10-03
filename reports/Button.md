# Button — staging test report

- **Run:** 02/10/2026 · first pass (component row had no linked test rows)
- **Component record:** `recBOsmQ7Sd2kqAHn` · Category `ATOMS`
- **Wake:** `Development` = `Ready for Testing` (gate 7), re-read live at dispatch
- **Build under test:** `https://horizon-design-system-bihx5cuzd-htar1.vercel.app`
  — read live from `Staging Storybook` at the start of this pass, not carried in from elsewhere.
  It is the Vercel preview for the open, unmerged PR into `staging`.
- **Design source:** Figma node `65-22`, file `EupMGlgXy06FSwOr2WLZWF`
- **Result: 9 of 9 cases passed.** Three design gaps reported separately; none is an engineering defect.

> This file replaces an earlier report written against a superseded design. Nothing from that
> run is preserved here.

---

## Preconditions established before any measurement

**Fonts genuinely loaded.** Not taken from a flag. `document.fonts.check('500 14px Roboto')`
returned `true`, which is not evidence. Measured instead on a canvas: the label string in
`Roboto` renders 151.16px wide, the same string in a deliberately bogus family renders 137.66px
(identical to `serif`). The two differ, so Roboto is really resolving and every width below is
attributable to the component rather than to a missing face.

**Mode named on both sides.** Design side: `get_variable_defs` was called per variant node and
answered in **Light** throughout. Rendered side: the stories render under
`html[data-theme="light"]` — and the host browser's `prefers-color-scheme` is **dark**, so the
story is explicitly pinned to light rather than merely defaulting there. Both sides are Light;
every colour comparison below is a like-for-like one.

**Fills read, not eyeballed.** Every `background-color` was read as a computed value. This was
load-bearing twice, in opposite directions — see Outline/Default and Ghost/Default below.

---

## The matrix, read from Figma

`get_metadata` on node `65:22` returns nine variants, each 105 × 40. The axes are
Type (Primary · Outline · Ghost) × State (Default · Hover · Disabled). **There is no size axis**,
so every row carries `Size = null`.

Bindings were read with `get_variable_defs` **per variant node**, never once on the set — a
set-level call returns the union of all nine variants' bindings and cannot say which state owns
which token.

| Figma node | Variant | Fill | Border | Label |
|---|---|---|---|---|
| `64:35` | Primary / Default | `color/bg/primary/idle` | *(none bound)* | `color/text/inverse` |
| `64:41` | Primary / Hover | `color/bg/primary/hovered` | *(none bound)* | `color/text/inverse` |
| `64:47` | Primary / Disabled | `color/bg/surfacePrimary` | *(none bound)* | `color/text/disabled on dark` |
| `64:53` | Outline / Default | `color/bg/base` | `color/border/brand/default` @ `borderwidth/1` | `color/text/brand` |
| `64:59` | Outline / Hover | `color/bg/primary/Light` | `color/border/brand/bold` @ `borderwidth/1` | `color/text/brand` |
| `64:65` | Outline / Disabled | `color/bg/surfacePrimary` | `color/border/disabled` @ `borderwidth/1` | `color/text/disabled on dark` |
| `65:4` | Ghost / Default | **no fill bound** | **no border bound** | `color/text/brand` |
| `65:10` | Ghost / Hover | `color/bg/primary/Light` | **no border bound** | `color/text/brand` |
| `65:16` | Ghost / Disabled | **no fill bound** | **no border bound** | `color/text/disabled on dark` |

Shared across all nine: height `spacing/40`, radius `borderradius/small`, inline padding
`padding/button-inline`, gap `gap/component`, label `Label/Large` (`family/plain` ·
`weight/medium` · `size/label-large` · `line-height/label-large` · `tracking/label-large`).

`get_design_context` on `65:4` and `64:53` was used as a cross-check and agreed with the
per-node variable reads: the Ghost node emits no background and no border rule at all, while the
Outline node emits both.

### Story reconciliation

The story file covers exactly these nine, one story each, plus `IconLeft` / `IconRight` /
`IconBoth` and an `AllVariants` grid. The icon stories exercise Figma's `Show Icon` **component
properties**, which are not variant axes — they are extra coverage, not an undocumented case and
not a missing one. **No row in Figma lacks a story, and no story lacks a row in Figma.**

---

## Results — one row per case

| # | Case | Verdict | Evidence |
|---|---|---|---|
| 1 | Primary / Default | **Passed** | `reports/Button/primary-default.jpg` |
| 2 | Primary / Hover | **Passed** | `reports/Button/primary-hover.jpg` |
| 3 | Primary / Disabled | **Passed** | `reports/Button/primary-disabled.jpg` |
| 4 | Outline / Default | **Passed** | `reports/Button/outline-default.jpg` |
| 5 | Outline / Hover | **Passed** | `reports/Button/outline-hover.jpg` |
| 6 | Outline / Disabled | **Passed** | `reports/Button/outline-disabled.jpg` |
| 7 | Ghost / Default | **Passed** | `reports/Button/ghost-default.jpg` |
| 8 | Ghost / Hover | **Passed** | `reports/Button/ghost-hover.jpg` |
| 9 | Ghost / Disabled | **Passed** | `reports/Button/ghost-disabled.jpg` |

Figma reference render: `reports/Button/figma-node-65-22.png`.

Geometry was identical on all nine and matched the node exactly: **105 × 40**, radius 8px,
inline padding 24px, gap 8px, label Roboto 500 at 14px / 20px with 0.1px tracking. No width
drift at all, sub-pixel or otherwise.

### Two cases where reading the computed value changed the verdict

**Outline / Default — the fill is a bound white, not an absent fill.** The computed
`background-color` is opaque white, which is `color/bg/base` resolving correctly. Against
Storybook's white canvas this is visually indistinguishable from no fill; judged by eye it would
have been recorded as a missing fill, which would have been wrong.

**Ghost / Default and Ghost / Disabled — the fill is genuinely absent.** The computed
`background-color` is fully transparent, and the design binds no fill on either node. Here the
absence is real. The same appearance, the opposite underlying state — which is precisely why the
value was read rather than looked at.

### The Outline border, and why it is not a finding

`border-width` computes to `0px` and `border-style` to `none` on all three Outline variants. Read
alone that looks like three missing borders. It is not: the stroke is implemented as a **1px inset
ring**, and the ring carries the correct token in every state —

| Case | Ring colour | Resolves to |
|---|---|---|
| Outline / Default | `rgb(98, 155, 248)` | `color/border/brand/default` |
| Outline / Hover | `rgb(59, 130, 246)` | `color/border/brand/bold` |
| Outline / Disabled | `rgb(192, 196, 202)` | `color/border/disabled` |

A Figma stroke set to inside does not grow the frame, and an inset ring in CSS is a faithful
translation of that, not a defect — the box stays 105 × 40 either way. The hover token swap from
`color/border/brand/default` to `color/border/brand/bold` happens as designed. Ghost and Primary
carry no ring, matching their nodes. **Filing these three as failures would have been three false
findings.**

### States were driven, not just rendered

- **Hover** — driven with a real pointer on the Default story, not only read off the pinned Hover
  story. Real hover resolves to `color/bg/primary/hovered`, the same value the pinned story shows.
  The two agree.
- **Disabled** — driven on all three disabled cases. The native `disabled` property is set, the
  control is not focusable, and the cursor is `not-allowed`. A **native activation fired the click
  handler zero times**. A synthetic `dispatchEvent` does fire, but that bypasses `disabled` by
  spec on any element and is not evidence of a defect; the two paths were counted separately
  precisely so that quirk would not be mistaken for one.

---

## Design gaps — not defects, and not logged against the engineer

**G1 · Focus has no design.** The Figma set contains no Focus variant, and the component
description says so outright: focus "needs its own treatment, and this set does not include it
yet." The staging build nevertheless renders a focus ring on a real Tab press (`:focus-visible`
matches; a 2.4px solid ring at 1.6px offset, in the same blue as `color/border/brand/bold`). So
the implementation is **ahead of** the design here rather than behind it. There is no design
expectation to measure against, so this is not a pass or a fail on any row — it is a gap the
designer owes: a Focus variant with bound tokens. Worth closing, since the accessibility note on
the node already flags that hover does not substitute for keyboard focus.

**G2 · Dark mode could not be established, so no dark expectation was invented.** The design side
answers in whichever mode the Figma file happens to be open in, and it answered Light for all nine
nodes; the MCP connection offers no way to ask the same node for another mode. On the build side,
`build/css/tokens.css` ships a single `:root` block with **no dark-theme block at all**, and the
stories pin `data-theme="light"`. Both sides are therefore Light-only. **I cannot say what the
design specifies for Button in dark mode, and I am not guessing.** This is a gap to resolve —
whether by publishing a dark mode in the token export or by confirming the system is
light-only — not a failure of this component.

**G3 · Icon size 20 is unbound by design.** The node's own spec says icons render at 20 and that
the size is deliberately not bound "because `icon/size-20` is unpublished." An unbound value is a
design gap by definition, not an engineering defect. The icon stories were not part of the
variant matrix, so no row turns on it.

---

## Tooling limitation — `Attachment` left empty, on purpose

The Airtable connector exposes no attachment upload, and the field requires a publicly reachable
URL; no row in this base has ever carried one. The nine screenshots are saved beside this report
instead and referenced by path in the table above. Images were **not** pushed to the PR branch to
manufacture a URL — doing so would rebuild the very preview under test and invalidate the link the
engineer recorded.

## Note on the directory

`reports/Button/` also contains `retest/` and `retest-2026-09-17b/` from earlier cycles, against a
design that has since changed. They were left untouched rather than deleted. Nothing in this
report draws on them.

## Scope

Nothing in `src/components/` was modified. Nothing was written on the component row — linking
`Composed In` from the nine new rows is what populates `[Staging] Test Records`. The nine
orphaned Button rows surviving from a deleted record were neither read as expectations, nor
relinked, nor deleted.
