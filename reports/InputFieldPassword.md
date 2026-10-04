# Input Field/Password — staging test report

> The registry rows are authoritative; this file is the evidence behind them.

- **Component record:** `recqc3LhoFeD7vquu` · `Input Field/Password` · MOLECULES
- **Figma node:** `234-941` (file `EupMGlgXy06FSwOr2WLZWF`), axis named **`Property 1`** (not `State`)
- **Build under test:** `https://horizon-design-system-covjek9rz-htar1.vercel.app`
  — the Vercel PR preview recorded in `Staging Storybook`, re-read live off the row at the start of
  this pass. This is **not** the build the first pass measured; the engineer rewrote the cell after
  its repair.
- **Pass type:** re-test (woken by `Development` = `Fixed`, gate 3; all 11 rows marked
  `Fixed (To re-test)`)
- **Run date:** 04/10/2026
- **Result: 11 of 11 Passed.** `Development` moved `Fixed` → `To be deployed`.

---

## Measurement conditions

| Condition | Value |
|---|---|
| Origin asserted on every read | `https://horizon-design-system-covjek9rz-htar1.vercel.app` |
| devicePixelRatio | 1.25 — computed `0.8px` against an authored `1px` border is discounted |
| Roboto genuinely loaded | **yes** — canvas width 225.20 vs bogus-family 213.49 |
| Inter genuinely loaded | **yes** — canvas width 235.08 vs bogus-family 213.49 |
| Modes measured | light (`:root`) and dark (`[data-theme="dark"]`) on every case |

### Correction to a carried-forward datum

The note that `document.fonts.check('14px Inter')` returns `false` on this build — implying the
masked value's parked `Inter` literal falls back rather than rendering Inter — **is not
reproducible once fonts have settled, and is wrong as a conclusion.**

On the first probe, before `document.fonts.ready` resolved, `check('14px Inter')` did return
`false` and Inter measured *identical* to a deliberately bogus family (213.486328125 both) — the
exact false reading the method warns about. After awaiting `document.fonts.ready`:

```
bogus family : 213.486328125
Roboto       : 225.203125     → distinct, loaded
Inter        : 235.0810546875 → distinct, loaded
```

Inter loads lazily and is genuinely present. The masked value renders Inter, not a serif fallback.
The *design gap* underneath it is unchanged — the masked layer still binds a raw local style rather
than a typography token — but it is not a font-loading failure, and no width in this report is
affected by one.

---

## What was repaired, and whether it holds

**First-pass root cause (all eleven rows):** `__label-row` and `__helper-row` combined
`padding-inline: var(--spacing-12)` with `width: 100%` while inheriting `box-sizing: content-box`,
so each row's border box exceeded the component width by two `spacing/12` — 384px against a 360px
node, text layers 360 where Figma draws 336, label row overhanging and helper row clipped by the
field group's `overflow: clip`.

**The engineer added `box-sizing: border-box` to both rows. Verified directly:**

| Measured | Figma (`get_metadata` on `234:940`) | Deployed build | |
|---|---|---|---|
| `__label-row` box-sizing | — | `border-box` | ✅ |
| `__helper-row` box-sizing | — | `border-box` | ✅ |
| Label frame `234:928` width | 360 | 360 | ✅ |
| Label text `234:929` | x=12, w=336 | x=+12, w=336 | ✅ |
| Helper frame `234:937` width | 360 | 360 | ✅ |
| Helper text `234:938` | x=12, w=336 | x=+12, w=336 | ✅ |
| Root | 360 × 77 | 360 × 77 | ✅ |
| `root.scrollWidth > clientWidth` | — | no overflow | ✅ |

Checked across **all nine Figma cells at once** on the `figma-matrix` story: 9/9 at 360 wide, both
rows `border-box` on every one, zero overflow on every one.

### The long-string case — the condition that exposed the original defect

Driven on Error hide with a 60-character label and a 129-character helper:

| | short (original) | long |
|---|---|---|
| Root | 360 × 77 | 360 × **117** |
| Label row / label text | 360 / 336 | 360 / 336 (wraps to 2 lines) |
| Helper row / helper text | 360 / 336 | 360 / 336 (wraps to 3 lines) |
| Field group | 56 tall | 80 tall, `scrollHeight == clientHeight` — **not clipped** |
| Horizontal overflow | none | none |
| Label/helper right edge vs root right edge | within | within |

The box grows vertically and wraps inside the inset. Nothing overhangs, nothing is clipped. This is
the case the first pass failed on, and it is clean.

---

## Beyond the geometry — what else was re-verified

A layout change can move things the original finding never touched, so every case was re-run in
full rather than spot-checked on the one property.

- **Token bindings, by authored `var()` name per selector**, read off the deployed stylesheet rather
  than inferred from computed values. `__field` fill is `var(--color-bg-base)`; Disabled fill is
  `var(--color-bg-surfaceprimary)` — distinct authored names even where the light values coincide.
  Border swaps are `--color-border-brand-bold` / `--color-border-negative-bold` /
  `--color-border-warning-bold` / `--color-border-disabled`, each on its own selector.
- **Same-valued tokens separated by dark mode** where the pairs diverge. In light,
  `--color-text-disabled` and `--color-text-input-text` both resolve to the same value; in dark they
  separate, and the dark reading confirms the right one is bound.
- **Typography per layer:** Label `Label/Small` (11/500/16/0.5), placeholder and revealed value
  `Body/Medium` (14/400/20/0.25), Helper `Body/Extra Small` (11/400/12/0.2) — all matched in both
  modes.
- **Glyphs:** `Symbol/filled/eye-crossed` on every hidden cell, `Symbol/filled/eye` on every
  revealed cell.
- **Spacing:** icon-row gap 8 (`gap/component`), field-group gap 4 (`gap/element`), field padding 12
  (`spacing/12`), radius 12 (`borderradius/medium`).
- **Hover driven for real**, not dispatched: a real pointer on the Default story swapped the border
  to `--color-border-brand-bold`, agreeing with the pinned Hovered cell. The hover rule correctly
  excludes Disabled, Error and Warning.
- **Overlapping states driven for real:**
  - *hovered-while-error* — real `:hover` confirmed true; border held `--color-border-negative-bold`
    and did **not** swap to brand.
  - *filled-while-error* — value present; border held negative/bold.
  - *disabled-while-hovered* — real `:hover` confirmed true; border held `--color-border-disabled`
    and the fill held `--color-bg-surfaceprimary`.
- **Reveal control driven with a real click** from Typed hide: `type` password→text, value
  preserved, glyph eye-crossed→eye, `aria-pressed` false→true, `aria-label` → "Hide password", and
  the masked font override correctly released back to `Body/Medium`.
- **Disabled inertness re-driven for both controls:** `input.disabled` and `button.disabled` true,
  click handler fired **0** times, `type` and `aria-pressed` unchanged after a click, neither
  element took focus, **0** tabbable nodes in the component.

---

## The matrix — one row per case

Figma draws 9 cells on `Property 1`, each 360 × 77. Two further cases exist in code with no drawn
cell; both are judged on their own terms and named as such.

| # | Case | Figma node | Old verdict | New verdict |
|---|---|---|---|---|
| 1 | `Property 1=Default` | `234:940` | Fixed (To re-test) | **Passed** |
| 2 | `Property 1=Hovered` | `234:942` | Fixed (To re-test) | **Passed** |
| 3 | `Property 1=Typed hide` | `234:955` | Fixed (To re-test) | **Passed** |
| 4 | `Property 1=Typed Open` | `234:968` | Fixed (To re-test) | **Passed** |
| 5 | `Property 1=Error hide` | `244:171` | Fixed (To re-test) | **Passed** |
| 6 | `Property 1=Error Open` | `244:183` | Fixed (To re-test) | **Passed** |
| 7 | `Property 1=Warning hide` | `244:194` | Fixed (To re-test) | **Passed** |
| 8 | `Property 1=Warning Open` | `244:206` | Fixed (To re-test) | **Passed** |
| 9 | `Property 1=Disabled` | `244:217` | Fixed (To re-test) | **Passed** |
| 10 | `Show icon = false` | *no Figma cell* | Fixed (To re-test) | **Passed** |
| 11 | `Default + revealed` | *no Figma cell* | Fixed (To re-test) | **Passed** |

Every row carries the pass block, identical text, in both `Expected Results` and
`Suggestion for Improvement`, and a `Context` naming this as a re-test against build `covjek9rz`.

---

## Design gaps — all six still open, none charged against a row

These were deliberately left unfixed. They are reported as gaps, not as engineering defects, and no
row was failed for any of them. Where SPEC prose contradicts the bindings, the bindings win.

1. **Masked value layers bind a raw local `Body` style.** The masked text layers (`234:1001`,
   `234:1004`, `234:1011`) carry a local style with a hardcoded family, `lineHeight 100` and
   `letterSpacing 0` rather than `Body/Medium`. The build reproduces it faithfully through
   `--hz-input-field-password-masked-family/weight/size/leading-unbound`, giving a 17-tall line box
   against the 20 of the revealed value. Still open. (The font itself loads — see the correction
   above.)
2. **No focus cell and no focus token.** `Property 1` draws no focus state and no `border/focus`
   variable exists. Confirmed on the deployed build: **zero** `:focus` or `:focus-visible` rules
   match the component, and `--color-border-focus` is unset. The field falls back to the UA ring.
   Still open.
3. **Width, height, stroke, icon size and label gap are unbound.** `--hz-input-field-password-
   width-unbound`, `-height-unbound`, `-stroke-unbound` and `-icon-size-unbound` carry no Figma
   variable, and the root's label gap is a raw `5px` (Figma draws label at y=0 h=16, field group at
   y=21) with no token behind it. Still open.
4. **`Show icon = false` leaves no way to reveal.** With the control removed and the value masked,
   the password cannot be revealed by any means. The input correctly expands to the full 334
   icon-row width; the gap is that the combination is reachable at all. Still open.
5. **Dark mode collapses `bg/base` and `bg/surfacePrimary`.** Default's field fill
   (`--color-bg-base`) and Disabled's field fill (`--color-bg-surfaceprimary`) resolve to the same
   dark value, so the two states are indistinguishable by fill in dark. The authored names are
   correctly distinct — the collapse is in the token values. Still open.
6. **No Figma cell for two shipped combinations.** `Show icon = false` and `Default + revealed`
   exist in code with no drawn reference on the `Property 1` axis. Still open.

---

## Screenshots

Saved beside this file in `reports/InputFieldPassword/`:

| File | What it shows |
|---|---|
| `retest-matrix-light.jpg` | All nine Figma cells on build `covjek9rz`, light — labels and helpers inset inside the field box |
| `retest-matrix-dark.jpg` | The same matrix in dark |
| `retest-long-strings-error-hide.jpg` | Long label (2 lines) and long helper (3 lines) wrapping inside the box, nothing clipped |
| `retest-disabled-light.jpg` | Disabled, light |
| `retest-hovered-light.jpg` | Hovered, light |
| `defect-label-helper-row-overflow.jpg` | *First pass* — the overhanging label row, kept for comparison |
| `staging-matrix-light.jpg` / `staging-matrix-dark.jpg` | *First pass*, superseded build |
| `figma-node-234-941-component-set.png` | The Figma component set |

`Attachment` on the `stagingTesting` rows could not be written — there is no upload path from here,
so the per-row screenshot requirement cannot be satisfied as written. The images above stand in.

---

## Notes for whoever reads this next

- The component is now at `To be deployed`; devops is the next actor.
- Nothing under `src/` was touched by this pass, nothing was committed, and no images were pushed to
  the PR branch (which would have rebuilt the build under test).
- `Staging Storybook` and `Commit` were not written — both are the engineer's.
