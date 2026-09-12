# 🔍 QA — Horizon Button

**Component:** `src/components/button/` (`button.js`, `button.css`, `icons/`)
**Figma node:** [Horizon Button `65:22`](https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=65-22) · fileKey `EupMGlgXy06FSwOr2WLZWF`
**Storybook:** http://localhost:6006 (already running) · **Date:** 2026-09-10
**Tested by:** QA — independent check. Nothing under `src/components/` was changed.

The expected matrix below was built from the Figma node over the MCP connection
(`get_metadata`, `get_design_context` on all nine variant nodes, `get_variable_defs`,
`get_screenshot`), not from the story file.

---

## 0 · Preconditions

| Check | Result |
|---|---|
| Design system font actually loaded | **Confirmed.** Canvas-measured `"Continue"` at `500 14px`: **Inter 60.50px** vs **bogus family 51.33px** (identical to `serif`, i.e. the fallback). The two differ, so Inter is really rendering. `document.fonts.check()` also returned true, but it was not relied on. |
| Device pixel ratio | **1.25.** This matters: Chrome snaps `outline-width` to whole device pixels, so a declared `2px` ring reports as `1.6px` used. Verified against the declared custom property (`--border-width-focused` = `2px`) — **not** a defect. |
| Console errors on any story | None. |
| Token file | `build/css/tokens.css` (generated — read only, not edited). Note: the skill text points at `build/tokens/css/tokens.css`, which does not exist in this repo. |
| `tools.md` | Out of date. Claims React/Tailwind/TypeScript; the repo is Storybook HTML + Vite, vanilla JS, CSS custom properties. There is no `npm run lint` and no test script (`npm test` is the placeholder stub). Recorded as an observation only. |

---

## 1 · Coverage reconciliation — Figma vs stories

Figma exposes **9 variants** (Type × State), each **105 × 40**, plus non-variant properties
`Label` (text), `Show Icon Left` / `Show Icon Right` (boolean), `Icon Left` / `Icon Right` (swap).

| Figma row | Story | Status |
|---|---|---|
| Type=Primary, State=Default (`64:35`) | `primary-default` | matched |
| Type=Primary, State=Hover (`64:41`) | `primary-hover` | matched |
| Type=Primary, State=Disabled (`64:47`) | `primary-disabled` | matched |
| Type=Outline, State=Default (`64:53`) | `outline-default` | matched |
| Type=Outline, State=Hover (`64:59`) | `outline-hover` | matched |
| Type=Outline, State=Disabled (`64:65`) | `outline-disabled` | matched |
| Type=Ghost, State=Default (`65:4`) | `ghost-default` | matched |
| Type=Ghost, State=Hover (`65:10`) | `ghost-hover` | matched |
| Type=Ghost, State=Disabled (`65:16`) | `ghost-disabled` | matched |
| `Show Icon Left` / `Show Icon Right` / swap slots | `icon-left`, `icon-right`, `icon-both` | matched — props `showIconLeft`, `showIconRight`, `iconLeft`, `iconRight` all exposed |

**No missing case and no dead story.** The 3 × 3 matrix is one-to-one with the stories, and
`all-variants` is a composite view of the same nine, not a tenth case.

Two coverage notes, neither a defect:

- **Icons are only storied on Default rows** (`icon-left`/`icon-right` on Primary·Default,
  `icon-both` on Outline·Default). Nothing exercises an icon on a Hover or Disabled row, and
  Ghost has no icon story at all. The icon slots are type-independent in the CSS, so this is a
  story-coverage thinness, not a fault.
- **`:focus-visible` exists in code but has no story and no Figma variant.** See Gap G7.

---

## 2 · The matrix

Expected values are the Figma bindings. `Δw` compares the measured width against the
Figma width of **105**, then against the width predicted once the Roboto→Inter substitution
(Gap G3) is accounted for: `24 + label + 24`, where Inter renders `"Continue"` at 61.31px
(60.50 glyphs + 0.81 tracking) and `"Back"` at 33.45px.

Every number below is a measurement from `getComputedStyle` / `getBoundingClientRect` in the
running Storybook. Nothing here was judged by eye.

| # | Case | Size (measured) | Radius | Background | Border | Label colour | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Primary · Default | 109.31 × **40** ✓ | 12 | `--color-bg-primary` | none ✓ | `--color-text-inverse` ✓ | **PASS** |
| 2 | Primary · Hover | 109.31 × **40** ✓ | 12 | `--color-bg-primary-hovered` | none ✓ | `--color-text-inverse` ✓ | **PASS** |
| 3 | Primary · Disabled | 109.31 × **40** ✓ | 12 | `--color-bg-primary-disabled` | none ✓ | `--color-text-disabled` | **PASS** |
| 4 | Outline · Default | **111.31** × 40 | 12 | transparent ✓ | 1px `--color-border-bold` | `--color-text-link` | **FAIL** — F1 |
| 5 | Outline · Hover | **111.31** × 40 | 12 | `--color-bg-secondary` **exact match** ✓ | 1px `--color-border-focused` | `--color-text-link` | **FAIL** — F1 |
| 6 | Outline · Disabled | **111.31** × 40 | 12 | `--color-bg-primary-disabled` | 1px `--color-border-disabled` | `--color-text-disabled` | **FAIL** — F1 |
| 7 | Ghost · Default | 109.31 × **40** ✓ | 12 | transparent ✓ | none ✓ | `--color-text-link` | **PASS** |
| 8 | Ghost · Hover | 109.31 × **40** ✓ | 12 | `--color-bg-primary-subtle` | none ✓ | `--color-text-link` | **PASS** |
| 9 | Ghost · Disabled | 109.31 × **40** ✓ | 12 | transparent ✓ | none ✓ | `--color-text-disabled` | **PASS** |
| 10 | Icon left (Primary, "Back") | 109.45 × **40** ✓ | 12 | `--color-bg-primary` | none ✓ | `--color-text-inverse` ✓ | **PASS** |
| 11 | Icon right (Primary, "Continue") | 137.31 × **40** ✓ | 12 | `--color-bg-primary` | none ✓ | `--color-text-inverse` ✓ | **PASS** |
| 12 | Icon both (Outline, "Continue") | **167.31** × 40 | 12 | transparent ✓ | 1px `--color-border-bold` | `--color-text-link` | **FAIL** — F1 |

Shared geometry, measured identically on **all twelve** cases and matching Figma exactly:

| Property | Figma | Measured | |
|---|---|---|---|
| Height | `spacing/40` = 40 | `40.00` | ✓ |
| Inline padding | `padding/button-inline` = 24 | `24px` / `24px` | ✓ |
| Block padding | 0 (centred, fixed height) | `0px` / `0px` | ✓ |
| Gap | `gap/component` = 8 | `8px` | ✓ |
| Icon box | 20 × 20 | `20×20` on every icon | ✓ |
| Label metrics | `Label/Large` — 500 14/20 | `500 14px/20px` | ✓ |
| Tracking | `tracking/label-large` = 0.1 | `0.1px` | ✓ |
| Shadow / opacity | none / 1 | `none` / `1` | ✓ |
| Radius | `borderradius/small` = **8** | **`12px`** | Gap G2 |
| Font family | `family/plain` = **Roboto** | **Inter** | Gap G3 |

### Behaviour

| # | Case | Method | Result | Verdict |
|---|---|---|---|---|
| 13 | Disabled is genuinely inert | Real `left_click` on `primary-disabled` with a counting listener attached | Handler fired **0 times**. Real pointer hover did **not** paint the hover fill (stayed `--color-bg-primary-disabled`). `Tab` did **not** focus it. `cursor: not-allowed`. `disabled` is a real DOM attribute, not a class. | **PASS** |
| 14 | Click fires when enabled | Same listener on `primary-default`, real `left_click` by element ref | Handler fired. Control test confirms case 13 is inertness, not a dead listener. | **PASS** |
| 15 | Pinned `data-state="Hover"` agrees with a real `:hover` | Real pointer hover, then compared computed style against the pinned story | **All three agree exactly.** Primary → `--color-bg-primary-hovered`; Outline → bg `--color-bg-secondary` + border `--color-border-focused`; Ghost → `--color-bg-primary-subtle`. Both disabled rows correctly refuse the hover paint — the `:not(:disabled)` guard holds under a real pointer. | **PASS** |
| 16 | Keyboard focus ring | Pressed `Tab` (not a programmatic `.focus()`) | `:focus-visible` matched. Ring: solid, `--color-border-focused`, offset `--spacing-padding-2xs` (4px), declared width `--border-width-focused` (2px). Confirmed visually as well as by measurement. | **PASS** — but see Gap G7 |

**Totals — 16 cases · 12 passed · 4 failed.** All four failures are one root cause (F1).

---

## 3 · Findings — engineering

### F1 · Outline is 2px wider than Primary and Ghost

```
Button · Outline · Default, Hover, Disabled, and Icon-both
Expected  105 wide in Figma — the same width as Primary and Ghost, which are also 105.
          Adjusted for the Inter substitution (Gap G3): 109.31, i.e. 24 + 61.31 + 24.
Saw       111.31 — exactly +2.00 unaccounted for, on the Outline rows only.
Where     button.css line 90 — border: var(--border-width-default) solid var(--color-border-bold)
          (and the border-color overrides on lines 99 and 104)
```

The 1px border is added **outside** the hug width. `box-sizing: border-box` on line 19 does not
prevent this: it only constrains a box whose size is explicit. Height is explicit
(`height: var(--size-control-md)`) so it stays a correct **40** — but width is automatic, as the
Figma doc requires ("Let the button hug its label — width is automatic"), so the border grows it.

Two consequences, both visible:

- An Outline and a Primary carrying the same label **do not match width**. `all-variants.png`
  shows it directly: row 2 is 2px wider than rows 1 and 3, in a set the design draws as three
  equal columns of 105.
- The Outline label sits **25px** from the outer edge instead of the specified 24.

This is *not* the "border that does not change the box" exemption. That exemption covers an
inset ring faithfully translating a Figma inside-stroke. Here the CSS uses a real `border` that
does change the box, while all nine Figma frames — Outline included — measure 105.

The delta is +2.00 on four cases and 0.00 on the other eight, so it is not the systemic
renderer drift that the font substitution produces.

**Evidence:** `Button/outline-default.png`, `Button/outline-hover.png`,
`Button/outline-disabled.png`, `Button/icon-both.png`, `Button/all-variants.png`
vs `Button/figma-node-65-22.png`.

---

## 4 · Design gaps — not engineering defects

These divergences come from the Figma node being bound to a **different variable library** than
the one Horizon publishes. The component resolves the correct Horizon semantic in each case, so
the code is right for the system and the render still does not match the Figma pixels. Each needs
a **designer decision**, not a code fix. The engineer documented these in
`reports/button-token-gaps.md`; this run independently confirms that list.

| ID | Gap | Figma | Horizon | Effect |
|---|---|---|---|---|
| **G1** | Palette values differ | `color/bg/primary/idle` `#3676e0` | `--color-bg-primary` `#1d4ed8` | Every fill and every text colour except `color/text/inverse` (`#ffffff`, which matches exactly). Also `#3b82f6`→`#1840b1` hovered, `#ebecee`→`#d7dee7` disabled fill, `#c0c4ca`→`#b9c7d6` disabled label, `#c0c4ca`→`#eaeff4` disabled border, `#ebf3fe`→`#eef4ff` ghost hover. Correct semantic chosen in every case. |
| **G2** | Corner radius | `borderradius/small` = **8** | `--border-radius-control` = **12** | 4px rounder than the design on all 12 cases. Horizon publishes no 8px radius token — `--border-radius-control`, `--border-radius-surface` (both 12) and `--border-radius-full` (999) are the whole set, so there was nothing closer to choose. |
| **G3** | Label font family | `family/plain` = **Roboto** | `--family-default` = **Inter** | Inter renders `"Continue"` 4.31px wider than the Figma frame implies (61.31 vs 57), so every hug width is +4.31. Uniform across all cases → systemic substitution, not a component fault. Size, weight, line-height and tracking all match exactly. |
| **G4** | No brand-border token published | `color/border/brand/default` `#629bf8`, `color/border/brand/bold` `#3b82f6` | fell back to `--color-border-bold` `#d7dee7` and `--color-border-focused` `#1d4ed8` | **The most visible gap.** Figma draws Outline·Default with a *blue* border; the build renders a *neutral grey* one — a change of hue family, not just value. Compare row 2 of the two screenshots: the design's outline reads as a blue button, the build's reads as a nearly invisible grey box. `--color-border-bold` is documented "Outlined control at rest", so the meaning is right and the colour is wrong. Needs `--color-border-brand-default`. Borrowing `--color-border-focused` for the hover border also overloads the focus-ring token with a second meaning. |
| **G5** | Hover ladder runs opposite ways | Figma **lightens** on hover (`#3676e0` → `#3b82f6`) | Horizon **darkens** (`#1d4ed8` → `#1840b1`), and `--color-bg-primary-pressed` darkens again | Both cannot stand. Horizon's is the coherent ladder; the Figma set should follow it, or Horizon's is wrong. A designer must pick. |
| **G6** | `icon/size-20` unpublished in Figma | unbound — the component doc says so outright | `--size-icon-md` = 20px, bound in code | Gap on the **design** side. Value is correct; publish the Figma variable and bind it. |
| **G7** | Keyboard focus absent from the design set | no Focus variant; the doc says "Hover is not a substitute for focus… not yet in this set" | built as `:focus-visible` | Code ahead of design. The implementation is sound and the accessibility note demands it, but there is no Figma variant to check it against, so case 16 passes on behaviour and remains unverifiable against a design. **The design owes a Focus variant.** |
| **G8** | Pressed / active state | absent from the set | `--color-bg-primary-pressed` is published | Neither designed nor built, so nothing is out of sync today — but a published token with no design and no code is a loose end. |

One semantic worth a designer's second look, independent of the above: Figma paints the disabled
fill with `color/bg/surfacePrimary` — a *surface* token doing an *action-state* job — and the
disabled label with `color/text/disabled on dark` on a *light* grey fill. Horizon's
`--color-bg-primary-disabled` / `--color-text-disabled` are the better-shaped names.

### Token hygiene

Clean. No raw hex, px, rem or font family appears in `button.css` or `button.js` outside of
comments that document these gaps. Both icon SVGs use `fill="currentColor"`, so they inherit the
label colour and tint correctly across every variant and state — verified on `icon-left`, where
the icon computed to `--color-text-inverse` inside the Primary fill.

---

## 5 · Screenshots

All in `reports/Button/`, captured headless at 2× device scale against the running Storybook.

| File | Case |
|---|---|
| `primary-default.png` · `primary-hover.png` · `primary-disabled.png` | cases 1–3 |
| `outline-default.png` · `outline-hover.png` · `outline-disabled.png` | cases 4–6 |
| `ghost-default.png` · `ghost-hover.png` · `ghost-disabled.png` | cases 7–9 |
| `icon-left.png` · `icon-right.png` · `icon-both.png` | cases 10–12 |
| `all-variants.png` | the whole set — shows F1's width mismatch between rows |
| `figma-node-65-22.png` | the Figma render of `65:22`, for side-by-side comparison |

The Hover rows are the pinned `data-state="Hover"` paint, which case 15 proved identical to a
real pointer hover. **No file for case 16 (focus)** — headless capture cannot drive a `Tab`
press. That state was verified in the live browser instead, by measurement and by eye, as
recorded in case 16.

---

## 6 · Verdict

**4 of 16 cases fail**, all four on the single engineering defect **F1** — the Outline border
adds 2px to a hug width that Figma draws equal to Primary and Ghost. The fix is confined to the
box model on `button.css` line 90; no colour, state or behaviour work is implied.

Everything else the engineer controls is correct: all geometry matches the node exactly, the
disabled state is genuinely inert rather than merely repainted, the pinned hover stories agree
with a real pointer, the focus ring is real `:focus-visible`, and no raw values leaked into the
component.

**Eight design gaps (G1–G8) are logged against the design, not the engineer.** They are the
reason the build does not look like the Figma render, and no amount of component work will close
them — the Figma node is bound to a variable library Horizon does not publish. G4 is the one a
viewer notices first: the Outline button reads grey where the design reads blue.

**→ Back to the engineer for F1; G1–G8 to a designer.**

*Findings only. No status is set here, and no verdict is final until a human reads it.*
