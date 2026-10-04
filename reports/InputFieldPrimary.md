# Input Field/Primary — staging test report

> The registry rows are authoritative; this file is the evidence behind them.

- **Component row:** `recQCdIFxek9CRmrP` · Category MOLECULES
- **Figma:** node `220:50`, file `EupMGlgXy06FSwOr2WLZWF`
- **Build under test:** `https://horizon-design-system-mfzf88hko-htar1.vercel.app`
  (`Staging Storybook`, re-read live off the component row at the start of this pass — not
  carried over from any earlier run)
- **Pass:** first pass. `[Staging] Test Records` was empty; every row below was created by this run.
- **Date:** 03/10/2026
- **Result:** 11 cases, 11 `Passed`, 0 `Failed`.

Screenshots are in `reports/InputFieldPrimary/` beside this file.

> `Attachment` could not be written on any row. The column is an Airtable attachments field and
> accepts only a publicly-fetchable URL; there is no upload path from here. The screenshots live
> beside this report instead. They were deliberately **not** pushed to the PR branch — that would
> rebuild the very preview under test and invalidate every measurement above.

---

## 1 · The design, read per layer

`get_metadata` on `220:50` gives **one axis — State — with six values, and no size axis**. Every
variant is 360×77 with a 360×40 field.

| State | Node | Label | Field fill | Field border | Value colour | Value type | Helper colour |
|---|---|---|---|---|---|---|---|
| Default | 220:14 | `color/text/secondary` | `color/bg/base` | `color/border/surfacePrimary` | `color/text/input text` | `Body/Medium` | `color/text/secondary` |
| Hovered | 220:20 | `color/text/secondary` | `color/bg/base` | `color/border/brand/bold` | `color/text/input text` | `Body/Medium` | `color/text/secondary` |
| Typed | 220:26 | `color/text/secondary` | `color/bg/base` | `color/border/brand/bold` | `color/text/primary` | `Body/Medium` | `color/text/secondary` |
| Error | 220:32 | `color/text/secondary` | `color/bg/base` | `color/border/negative/bold` | `color/text/primary` | **none bound** | `color/text/negative` |
| Warning | 220:38 | `color/text/secondary` | `color/bg/base` | `color/border/warning/bold` | `color/text/primary` | `Body/Medium` | `color/text/warning` |
| Disabled | 220:44 | **`color/text/disabled on dark`** | `color/bg/surfacePrimary` | `color/border/disabled` | `color/text/disabled` | `Body/Medium` | `color/text/disabled` |

Layer ids read individually: labels `220:15 · 21 · 27 · 33 · 39 · 45`; fields
`220:17 · 23 · 29 · 35 · 41 · 47`; values `220:18 · 24 · 30 · 36 · 42 · 48`; helpers
`220:19 · 25 · 31 · 37 · 43 · 49`.

Shared by all six: `borderradius/medium` (field radius), `spacing/12` (field inline padding and the
label/helper row insets), `gap/element` (field-to-helper gap inside the Field group).

**Two things only the per-layer read could show.** A variant-level `get_variable_defs` unions its
layers, so on this node it hides both of these:

1. **`220:36` (Error value) returns `color/text/primary` and nothing else.** At variant level
   `220:32` merely looks as though the `Body/Medium` entry went missing. Read on its own, the layer
   demonstrably carries no typography binding at all.
2. **`220:45` (Disabled label) binds `color/text/disabled on dark` while `220:48` and `220:49`
   beside it bind `color/text/disabled`.** The variant read returns both names with no way to tell
   which layer owns which — and they are genuinely different tokens.

## 2 · How the same-valued tokens were told apart

Several tokens in this set are identical in light mode, so computed colour and screenshots cannot
distinguish them:

- `color/text/disabled` and `color/text/input text` are both `#a1a8b1`
- `color/bg/surfacePrimary` and `color/border/surfacePrimary` are both `#ebecee`

The build also carries six further aliases that all resolve to `#a1a8b1`
(`--color-text-input-text-2/-3/-4/-5/-unique`), so a pixel read is worthless here. Two independent
methods were used, and **they agree on every binding**:

**Method 1 — the authored `var()` name per selector, on the deployed build.** `document.styleSheets`
was walked by `selectorText`. First the precondition was checked: **the bundler preserved every
token name and inlined none to hex**, so the authored name is readable and trustworthy. It gives
`var(--color-border-surfaceprimary)` on the resting field border, `var(--color-text-input-text)` on
the empty value, `var(--color-text-disabled)` on the disabled value and helper, and
`var(--color-text-disabled-on-dark)` on the disabled label.

**Method 2 — dark mode.** The build ships `build/css/tokens-dark.css` scoped to
`[data-theme="dark"]`, flipped on the root by the Storybook theme decorator. The same-valued pairs
diverge there, so the computed colour names the binding by itself:

| Token | Light | Dark | Measured in dark |
|---|---|---|---|
| `color/border/surfacePrimary` | `#ebecee` | `#a1a8b1` | `rgb(161,168,177)` on the Default border ✓ |
| `color/bg/surfacePrimary` | `#ebecee` | `#151b24` | not the border ✓ |
| `color/text/input text` | `#a1a8b1` | `#5c6777` | `rgb(92,103,119)` on the empty value ✓ |
| `color/text/disabled` | `#a1a8b1` | `#334155` | `rgb(51,65,85)` on the disabled value/helper ✓ |
| `color/text/disabled on dark` | `#c0c4ca` | `#1c242f` | `rgb(28,36,47)` on the disabled label ✓ |

Every binding in the table in §1 is confirmed twice over. **Had this been checked only by reading
light-mode pixels, four of these assignments would have been unverifiable and the verdicts would
have proved nothing.**

## 3 · Fonts — measured, not assumed

`document.fonts.check()` was not trusted. Each family was measured on a canvas against a
deliberately bogus family name:

- Roboto 400 @14px → **254.31** vs bogus **247.69** — distinct, loaded
- Roboto 500 @11px → **201.46** vs bogus **194.61** — distinct, loaded
- Inter 400 @13px → **253.50** vs serif **229.99**, sans **240.56**, Roboto **236.15** — distinct, loaded

**One trap worth recording:** on first paint Inter measured *identical to the serif fallback* and
`document.fonts.check('400 13px Inter')` returned `false`. Inter is loaded lazily and only resolves
once it is actually used in layout. Any width read for the Error state before that point would have
been wrong — and would have looked like a component defect. All widths reported here were taken
after both families were confirmed by measurement.

## 4 · The matrix — every case, with its verdict

All eleven rows are in `stagingTesting`, linked to `recQCdIFxek9CRmrP` via `Composed In`.

| # | Case | Verdict |
|---|---|---|
| 1 | State=Default (220:14) | **Passed** |
| 2 | State=Hovered (220:20) | **Passed** |
| 3 | State=Typed (220:26) | **Passed** |
| 4 | State=Error (220:32) | **Passed** |
| 5 | State=Warning (220:38) | **Passed** |
| 6 | State=Disabled (220:44) | **Passed** |
| 7 | Show Label = false | **Passed** |
| 8 | Show Helper text = false | **Passed** |
| 9 | Hovered while Error (overlap) | **Passed** |
| 10 | Filled while Error, value edited and cleared (overlap) | **Passed** |
| 11 | Disabled while hovered (overlap) | **Passed** |

Measured geometry, identical across all six states: root **360×77**, field **360×40**, radius
**12px**, field inline padding **12/12**, field-group gap **4px**, label-to-field gap **5px** —
matching `get_metadata` on every variant node exactly.

**Story/Figma reconciliation.** All six Figma states have a story; both Figma boolean properties
have a story. The three extra stories (`--all-variants`, `--primary-versus-mobile`,
`--interactive`) are presentation and interaction harnesses, not undocumented cases. **No missing
case and no orphan case.**

### States driven, not merely rendered

- **Hover** — a real pointer was moved over each field and `:hover` confirmed true on the element
  before reading. The real pointer and the pinned `data-state` story agree.
- **Typed** — reached by typing with a real keyboard, not by pinning: `data-filled` flips, the
  border moves to `color/border/brand/bold`, the value colour moves from `color/text/input text` to
  `color/text/primary`.
- **Disabled** — a real click did not focus it (`activeElement` stayed on `BODY`); 17 typed
  characters produced no value change and fired no input or click handler. Genuinely inert, not
  merely greyed.
- **Focus** — reached by real `Tab`; `:focus-visible` matches and the browser's native ring is
  intact. The disabled field is absent from the tab order.
- **Overlaps** — hovered-while-Error, filled-while-Error, emptied-while-Error, and
  disabled-while-hovered were each driven, with `:hover` verified on the intended element and the
  siblings verified *not* hovered in the same read.

### Not counted as defects

- **`border-width` computes as `0.8px`** on every state. The authored value is `1px`; the pane runs
  at `devicePixelRatio` 1.25, so one device pixel is 0.8 CSS px. Identical on all six states —
  a renderer artifact, not a component property.
- **The Figma stroke is inside-aligned** and the field still measures exactly 360×40 with
  `box-sizing: border-box`. A border that does not change the box is a faithful translation.

## 5 · Design gaps — reported, not failed

None of these is a defect in the build. The build is faithful to what the node binds; these are the
design's to close.

1. **`220:36` (Error value) carries no typography binding.** The other five value layers bind
   `Body/Medium`. The build renders Inter 400 13/16 and parks it in named `*-unbound` custom
   properties rather than reaching for a near-fitting token — the correct handling of an unbound
   property. The result is that one state's value text is visibly a different face and size from the
   other five, which reads as an oversight rather than an intention.
2. **`220:45` (Disabled label) binds `color/text/disabled on dark`** where its own siblings bind
   `color/text/disabled`. A token named "on dark" used on a light-mode label inverts in dark mode
   and all but vanishes: `#1c242f` on `#151b24` is roughly **1.11:1**. Visible in
   `staging-all-variants-dark.jpg` — the Disabled label is effectively unreadable. The likely fix is
   a designer's: rebind `220:45` to `color/text/disabled`.
3. **Four properties are unbound across the whole set** — field height (40), field width (360),
   label-to-field gap (5), stroke weight (1). The node's own SPEC concedes the gap of 5 ("off the
   4px grid and has no token"). `--borderwidth-1` exists and is exactly 1px but is not bound, so the
   build does not reach for it.
4. **No focus variant exists.** The node's accessibility note says so outright: "Hover is not a
   substitute for focus. Keyboard focus needs its own treatment — not yet in this set." No focus
   expectation could therefore be formed, and none was invented. The build leaves the native ring
   intact so the field stays keyboard-usable in the meantime.
5. **Placeholder contrast.** `color/text/input text` on `color/bg/base` is about **2.14:1** in light
   and about **3.02:1** in dark, both under the 4.5:1 AA asks of body text. Default and Hovered
   render empty, so this is what those two states actually show.
6. **No dark-mode expectation is establishable from the node.** `get_variable_defs` answers in
   whichever mode the Figma file is open in — it returned light values throughout, and the MCP
   connection offers no way to switch modes. **Dark mode was therefore used here only as a binding
   discriminator** (see §2), never as a source of expected values, and no row was passed or failed
   on a dark-mode colour. Someone with the file open in dark mode should confirm the dark values
   independently.
7. **No variant exists for overlapping states.** Rows 9–11 cover combinations the design does not
   model, so their precedence order is an engineering decision the design does not specify. They
   were judged only against each state's own binding surviving the overlap.

## 6 · Where the node's SPEC prose contradicts its own bindings

**The bindings win, and the contradiction is reported.** Three on this node:

1. **SPEC: "Value stays Inter Regular 13 … Those sizes are unpublished."**
   Five of the six value layers bind the `Body/Medium` composite — Roboto Regular 14/20, tracking
   0.25 — confirmed per layer on `220:18 · 24 · 30 · 42 · 48`. The prose is true of `220:36` (Error)
   **only**. So the prose describes one layer out of six and misdescribes the other five.
2. **SPEC: "helper stays Inter Regular 10."**
   All six helper layers bind `Body/Extra Small` — Roboto Regular 11/12, tracking 0.2 — confirmed on
   `220:19 · 25 · 31 · 37 · 43 · 49`. The prose is wrong for every helper in the set.
3. **SPEC: "Placeholder and the resting border stay literals."**
   Both are bound. The placeholder colour is `color/text/input text` on `220:18` and `220:24`; the
   resting border is `color/border/surfacePrimary` on `220:17`. Neither is a literal.

The build follows the bindings in all three cases, which is correct. The prose should be corrected
so the next reader is not misled into "fixing" the build to match it.

## 7 · Registry vocabulary gap

The `stagingTesting.State` multi-select offers no **`warning`** choice. `State` is therefore left
empty on the Warning row rather than mislabelled with a state it is not, and the case is named in
`Variants` and `Context` instead. Adding `warning` to the option set is a human's call.

## 8 · Observation outside the matrix — Input Field/Mobile

Not a test result, and no row was created for it. **No verdict was written against Mobile's registry
row and none of its 13 existing rows was touched.**

Primary and Mobile share one JavaScript module (`src/components/inputField/inputField.js`), and this
preview contains both. **Mobile's stories still render correctly on this build.** All six Mobile
states were measured on `components-input-field--all-variants`:

- field **342×52**, root **342×90**, inline padding **14px**, root fill white — Mobile's own values,
  unchanged
- label Roboto 12, value Inter 15 — Mobile's own typography, unchanged
- Default border transparent (Mobile binds no resting border), status borders and helper colours all
  correct
- **no `field-group` wrapper on any Mobile instance**, and `data-variant` reads `Mobile` throughout

The `[data-variant='Primary']` scoping held: no Primary rule reached a Mobile instance. Had it
leaked, Mobile would have shown a 12px inline padding, a transparent root, or a field-group
wrapper — none of which appear. Console is clean, no errors on either set.

See `staging-mobile-all-variants-light.jpg`.

## 9 · Files

| File | What it is |
|---|---|
| `InputFieldPrimary/figma-220-50-component-set.png` | the Figma render of `220:50`, all six states |
| `InputFieldPrimary/staging-all-variants-light.jpg` | the deployed build, all six states, light |
| `InputFieldPrimary/staging-all-variants-dark.jpg` | the deployed build, all six states, dark — shows gap 2 |
| `InputFieldPrimary/staging-interactive-light.jpg` | the three live fields the overlap cases were driven on |
| `InputFieldPrimary/staging-mobile-all-variants-light.jpg` | Mobile on this same build, for §8 |
