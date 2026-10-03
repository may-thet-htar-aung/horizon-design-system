# Input Field/Mobile — staging test report

- **Component record:** `rectHwEG0v2LrAesa` · `Input Field/Mobile` · MOLECULES
- **Figma node:** `227-44`, file `EupMGlgXy06FSwOr2WLZWF`
- **Build under test:** `https://horizon-design-system-bud9lmnm2-htar1.vercel.app`
- **Previous pass measured:** `...-kpcgrab4z...` — superseded, re-read live off the row before testing
- **Tested:** 03/10/2026
- **Result:** 13 cases, **13 Passed, 0 Failed**

This is the second re-verdict of this component. It was **not** a registry wake: `Development`
read `To be deployed` and no row was marked `Fixed (To re-test)`. A human directed the run, on the
grounds that the 13 rows claimed `Passed` against a build none of them had measured.

---

## What changed in the design

The **value text layer only**, on Typed, Error and Warning, was rebound from `color/text/secondary`
to `color/text/secondary unique`. Verified layer by layer, not at variant level.

## Why computed colour cannot settle this, and what was used instead

`color/text/secondary` and `color/text/secondary unique` **both resolve to `#334155`** in the mode
the file is open in. A screenshot cannot tell them apart and neither can `getComputedStyle().color`.
Two independent methods were used, and they agree:

1. **Authored `var()` per layer, off the deployed stylesheet.** `document.styleSheets` is readable
   same-origin for `inputField-CWgsB0q5.css`; only the Google Fonts sheet is CORS-opaque. The
   bundler **preserved token names** — 24 distinct `var(--…)` names survive and there is **zero raw
   hex** in the component's authored CSS, so the authored declaration is a usable source of truth.
2. **A dark-mode read, where the two tokens diverge.** `color-text-secondary` → `#a1a8b1` in dark
   while `color-text-secondary-unique` → `#334155`. In that mode the browser's own computed colour
   names the binding, with no stylesheet parsing and no specificity reasoning at all.

The second method also corrected the first: a hand-rolled specificity helper double-counted `:not()`
and mis-picked the winner on Disabled, where `color/text/disabled` and `color/text/input text unique`
also collide at `#a1a8b1`. The dark-mode read settled it — all four Disabled layers bind
`color/text/disabled`, matching Figma.

---

## Per-layer Figma read (`get_metadata` for layer ids, then `get_variable_defs` per layer)

`get_variable_defs` on the parent variant `227:16` returns **both** `color/text/secondary` and
`color/text/secondary unique`, because it unions the layers. Reading at variant level cannot
attribute a token to a layer.

| Variant | Label | Field fill | Field border | Value / placeholder | Helper |
|---|---|---|---|---|---|
| `227:2` Default | `227:4` secondary | `227:5` neutral-25 | *no stroke bound* | `227:6` **input text unique** | `227:8` secondary |
| `227:9` Hovered | `227:11` secondary | `227:12` neutral-25 | border/brand/bold | `227:13` **input text unique** | `227:15` secondary |
| `227:16` Typed | `227:18` secondary | `227:19` neutral-25 | border/brand/bold | `227:20` **secondary unique** | `227:22` secondary |
| `227:23` Error | `227:25` secondary | `227:26` neutral-25 | border/negative/bold | `227:27` **secondary unique** | `227:29` text/negative |
| `227:30` Warning | `227:32` secondary | `227:33` neutral-25 | border/warning/bold | `227:34` **secondary unique** | `227:36` text/warning |
| `227:37` Disabled | `227:39` disabled | `227:40` bg/surfacePrimary | border/disabled | `227:41` disabled | `227:43` disabled |

Radius `borderradius/medium` on every field; label and helper rows inset `spacing/12`; set
background `color/bg/base`.

The caller's description was verified word by word and is **accurate**: value layer only, on those
three variants; label and helper still on plain `color/text/secondary`; placeholder, field fill and
Disabled untouched.

## What the deployed build authors, per layer

| Element | Authored declaration in the deployed CSS | Matches Figma |
|---|---|---|
| `.hz-input-field__label` | `color: var(--color-text-secondary)` | yes |
| `.hz-input-field__helper` | `color: var(--color-text-secondary)` | yes |
| `.hz-input-field[data-filled="true"] .hz-input-field__input` | `color: var(--color-text-secondary-unique)` | yes |
| `.hz-input-field:not([data-filled="true"]) .hz-input-field__input` | `color: var(--color-text-input-text-unique)` | yes |
| `.hz-input-field__input::placeholder` | `color: var(--color-text-input-text-unique)` | yes |
| `[data-state="Disabled"]` label/helper/input/placeholder | `color: var(--color-text-disabled)` | yes |
| field fill / radius | `var(--color-neutral-25)` · `var(--borderradius-medium)` | yes |
| borders | `brand-bold` · `negative-bold` · `warning-bold` · `disabled` | yes |

The `data-filled` switch is what maps the per-layer rebinding onto the implementation: empty →
placeholder token, filled → `secondary unique`. That is exactly the variant split in Figma.

## Fonts — measured, not assumed

`document.fonts.check()` returned true for both families, which proves nothing. Measured on canvas
against a deliberately bogus family: Roboto 400 792.25 vs fallback 743.91; Inter 400 849.91 vs
743.91; and the two real families differ from **each other** by 57.66. Both genuinely loaded, so
every width below is trustworthy.

Label renders Roboto 500 12/16 ls 0.5 (= `Label/Medium`), helper Roboto 400 11/12 ls 0.2
(= `Body/Extra Small`). Value renders Inter 400 15/18 — unbound in Figma, see gaps.

---

## The 13 cases

All geometry confirmed against the node: wrapper **342×90**, field **342×52**, padding-inline 14,
gap 5, label/helper width 318 (= 342 − 2×12).

| # | Case | Old | New | Meaning |
|---|---|---|---|---|
| 1 | State=Default (`227:2`) | Passed | **Passed** | unchanged |
| 2 | State=Hovered (`227:9`) | Passed | **Passed** | unchanged |
| 3 | State=Typed (`227:16`) | Passed | **Passed** | **changed** — value → `secondary unique` |
| 4 | State=Error (`227:23`) | Passed | **Passed** | **changed** — value → `secondary unique` |
| 5 | State=Warning (`227:30`) | Passed | **Passed** | **changed** — value → `secondary unique` |
| 6 | State=Disabled (`227:37`) | Passed | **Passed** | unchanged |
| 7 | showLabel = false | Passed | **Passed** | unchanged |
| 8 | showHelperText = false | Passed | **Passed** | unchanged |
| 9 | Error + Hovered | Passed | **Passed** | **changed** |
| 10 | Warning + Hovered | Passed | **Passed** | **changed** |
| 11 | Disabled + Hovered | Passed | **Passed** | unchanged |
| 12 | Resting field typed into, hovered + focused | Passed | **Passed** | **changed** |
| 13 | Error edited while filled, hovered + focused | Passed | **Passed** | **changed** |

Seven rows changed meaning; six assert what they asserted before. No verdict flipped — but seven of
them were, until this run, asserting a binding that no longer exists.

### Matrix reconciliation
Six Figma variants + two boolean properties = eight pinned cases, plus five driven overlaps that
Figma cannot express (the set carries state as one enum). **No case is missing a row, and no row
is orphaned.** `All Variants` and `Interactive` are harness stories, not cases — they have no Figma
row by design and are not findings.

### States driven, not merely rendered
- **Hover** — real pointer, `:hover` asserted true on the field element before any read. Pinned
  `Hovered` story and real pointer agree on `color/border/brand/bold`.
- **Error + hover**, **Warning + hover** — status border held; hover did **not** swap in the brand
  border. The deployed cascade also excludes Error/Warning/Disabled from the brand rule by
  selector, so status outranks pointer by construction as well as in the result.
- **Disabled + hover** — no hover affordance at all.
- **Disabled inertness** — real click left focus on `BODY`; typing three characters produced no
  input and left the value empty; `input.disabled` true; `cursor: not-allowed`; Tab skips it.
- **Typing transition** — real click into a resting field then real keystrokes: `data-filled`
  flipped to `true` and the value crossed from `input text unique` to `secondary unique` at that
  moment, matching the pinned Typed variant.
- **Error edited** — `:focus-visible` true, a real keystroke appended; Error held, `aria-invalid`
  stayed `"true"`.

---

## Gaps — reported, not charged to the engineer

1. **Placeholder contrast is below AA, in both modes.** `color/text/input text unique` on
   `color/neutral-25` measures **2.26:1** (AA wants 4.5:1). Identical in light and dark because
   neither token flips. The component binds what the node binds; this is a design decision to
   revisit.

2. **Dark mode: the field renders as a light box.** `color/neutral-25` is a **core palette** token
   with no dark value, and the field binds it directly rather than through a semantic surface token.
   Binding a core token bypasses mode switching entirely — that is the mechanism, and it is in the
   design, not the implementation. No dark expectation can be established from the node, so this is
   recorded as a gap rather than a failed row.

3. **A consequence of the rebinding, not a goal.** Because `secondary unique` is mode-stable
   (`#334155` in both modes) and the field fill never flips, value-on-fill contrast is **9.74:1** in
   both modes. Had the value stayed on plain `color/text/secondary` it would have fallen to
   **2.26:1** in dark. The rebinding therefore improved dark legibility by accident. Worth knowing;
   not something to rely on.

4. **Disabled text in dark is effectively invisible** — `color/text/disabled` `#334155` on
   `color/bg/surfacePrimary` `#151b24` is **1.67:1** (light: 2.03:1). Disabled controls are exempt
   from WCAG 1.4.3, so this is not a violation, but in dark it is unreadable.

5. **Keyboard focus has no design treatment.** There is no Focus variant in the set, and the node's
   own ACCESSIBILITY note says so: *"Keyboard focus needs its own treatment — not yet in this set."*
   The build falls back to the UA default ring. No expectation exists to test against.

6. **Value typography is unbound.** The value layer binds colour only — no family, size, weight or
   line-height token. The build names these honestly as `--hz-input-field-value-*-unbound`. The
   visible consequence is that the value renders **Inter** while label and helper render **Roboto**
   (`family/plain`), inside one component.

### SPEC prose that contradicts the bindings — bindings win

- **"helper stays Inter Regular 10"** — wrong on both counts. The helper binds `Body/Extra Small`,
  which is `family/plain` (**Roboto**) Regular **11**/12. The build renders Roboto 11/12, matching
  the binding.
- **"Placeholder stays a literal"** — it is not a literal. `227:6` and `227:13` bind
  `color/text/input text unique`, and the build binds the corresponding token.
- **"[the placeholder] is still visible once the field is Typed"** — it is not. Once filled, the
  value layer carries the text and the placeholder is genuinely hidden (`:placeholder-shown` false).
- Consistent and confirmed: field 52×342, radius bound, inset `spacing/12`, padding 14 untokenised,
  gap 5 untokenised, active fill `color/neutral-25`, disabled fill `color/bg/surfacePrimary`.

---

## Notes

- **`Attachment` could not be written.** The column takes attachments but the API path needs a
  publicly reachable URL and there is no upload route from here. Screenshots are saved beside this
  report in `reports/InputFieldMobile/` instead. Not pushed to the PR branch.
- `tokens/core.light.tokens.json` shows as modified in the working tree; the diff is **empty** —
  a CRLF normalisation artefact, no content change.
- Nothing in `src/components/` was touched. Nothing was written on the component row.

## Screenshots

`reports/InputFieldMobile/`

- `staging-all-variants.jpg` — all six variants on the build under test
- `gap-dark-mode-field-fill.jpg` — dark mode: light field boxes, legible mode-stable values,
  near-invisible Disabled text
- `state-warning.jpg`, `state-default.jpg`, `state-hovered.jpg`, `state-typed.jpg`,
  `state-error.jpg`, `state-disabled.jpg`
- `prop-showlabel-false.jpg`, `prop-showhelpertext-false.jpg`
- `staging-interactive-overlaps.jpg`, `overlap-error-hovered-focused.jpg`
- `figma-227-44-component-set.png`
