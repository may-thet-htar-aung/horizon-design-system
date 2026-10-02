# Check Box — staging test report

| | |
|---|---|
| Component row | `recWY9nPqeCWEQCs1` · Check Box · ATOMS |
| Figma node | `251-19` in `EupMGlgXy06FSwOr2WLZWF` (component set, property `State`) |
| `Staging Storybook` (read off the row) | https://horizon-design-system-git-component-check-box-htar1.vercel.app |
| `Commit` (read off the row) | `ef508248b5d61e5ff29fa62ef217f2e1b0163e10` — matches `origin/component/check-box` HEAD |
| Pass | First test |
| Tested | 02/10/2026 |
| Result | 3 passed · 2 failed |

## Gate

`Staging Storybook` was read off the component row before anything else and is set, so the test ran.
No Vercel login was encountered; the preview served `/index.json` and every story iframe directly.

## How the matrix was built

From the Figma node, not the story file. `get_metadata` on `251:19` returns one property, `State`,
with five variants, every one 16×16:

| Variant | Node |
|---|---|
| State=Default | `251:4` |
| State=Hovered | `251:7` |
| State=Checked | `251:10` |
| State=Unchecked | `251:13` |
| State=Disabled | `251:16` |

There is no size axis, so `Size` is `null` on every row. Five Figma variants, five cases.

**Reconciliation with the deployed stories.** `/index.json` lists seven Check Box stories: the five
matrix states plus `all-variants` and `interactive`, which are demo/harness stories with no Figma
row. No Figma variant is missing a story, and no story claims a variant Figma does not have. The two
extra stories are not findings — they render the same five states.

## Validity checks run before any value was compared

**Colour mode, both sides, named before comparing.** `get_variable_defs` returned
`color/bg/base` `#ffffff`, `color/bg/surfacePrimary` `#ebecee`, `color/border/disabled` `#c0c4ca`,
`color/border/brand/bold` `#3b82f6`, `color/border/brand/Light` `#7cabf9`, `color/icon/brand`
`#3676e0`. All six match `build/css/tokens.css` `:root` (light) exactly; the dark values for the same
names are `#151b24`, `#151b24`, `rgba(51,65,85,0.2)`, `#629bf8`, `#3676e0`, `#7cabf9` and match none
of them. **The design side answered in light mode.** The rendered side carries
`data-theme="light"` on `<html>` with `prefers-color-scheme: dark` false. Both sides light — the
colour comparisons below are valid.

**Fonts, measured on canvas rather than asserted.** `--family-plain` / `--family-brand` (Roboto)
measured 351.63px against 319.21px for a deliberately bogus family — genuinely loaded, not a silent
fallback. (`--family-default` (Inter) measures identical to the bogus family and is *not* resolving,
but nothing in this component uses it.) The decisive point: **the Check Box renders no text node at
all** — the box is a fixed 16×16 and the mark is an inline SVG at a fixed 10×10. No dimension
reported here depends on a font.

**Border width is renderer snapping, not a defect.** The computed border read `0.8px` against a
declared `1px`. A control probe element with a declared `1px` border computed to `0.8px` on the same
page, and a declared `2px` to `1.6px`, at `devicePixelRatio` 1.25. The snapping applies to every
element equally. Declared width is `1px`, which is correct; this is not logged against any case.

## Results

| # | Variant | Size | State | Verdict | Reason |
|---|---|---|---|---|---|
| 1 | State=Default | null | idle | **Failed** | Resting stroke renders a local raw placeholder prop, not the `color/border/brand/Light` the node binds |
| 2 | State=Hovered | null | hovered | **Passed** | Stroke `--color-border-brand-bold`, fill `--color-bg-base`; pinned story and a real pointer hover agree |
| 3 | State=Checked | null | selected | **Passed** | Stroke brand/bold, fill base, mark visible 10×10 in `--color-icon-brand` |
| 4 | State=Unchecked | null | idle | **Failed** | Same defect as State=Default |
| 5 | State=Disabled | null | disabled | **Passed** | Fill `--color-bg-surfaceprimary`, stroke `--color-border-disabled`, genuinely inert |

Screenshots: `reports/CheckBox/default.jpg`, `hovered.jpg`, `checked.jpg`, `unchecked.jpg`,
`disabled.jpg`, with the Figma render at `reports/CheckBox/figma-node-251-19.png` and
`figma-default-251-4.png`. Each deployed capture is the live element magnified 12× for legibility;
every number quoted was read from computed style at 1:1 before magnifying.

### 1 · State=Default — Failed

```
Tested : 02/10/2026
Status : first test
Issue Type : Token binding
Expected : border-color: var(--color-border-brand-light) — node 251:4 binds its stroke to color/border/brand/Light, confirmed by get_variable_defs on 251:4 and by get_design_context on the set, light mode on both sides
Actual : border-color: var(--hz-checkbox-border-resting-unbound), a raw placeholder prop declared locally in checkBox.css and bound to no token
Fix : the node's SPEC prose claims the resting stroke is an untokenised grey, but the node's live binding disagrees; drop --hz-checkbox-border-resting-unbound and bind the resting stroke to --color-border-brand-light
```

**Whose defect: the component's.** This is not a gap in the token export —
`--color-border-brand-light` is exported, built, and resolving on the page at the moment it renders
the wrong colour. The component was written against the node's prose instead of its binding.

### 2 · State=Hovered — Passed

```
Tested : 02/10/2026
Status : This Variant passed.
```

Stroke resolved to `--color-border-brand-bold` and fill to `--color-bg-base`, matching `251:7`. Driven,
not just rendered: a real pointer hover on the Default story matched `:hover` and produced exactly
the same stroke as the pinned `data-state="Hovered"` story. The mark stays hidden, as the node has it.

### 3 · State=Checked — Passed

```
Tested : 02/10/2026
Status : This Variant passed.
```

Stroke `--color-border-brand-bold`, fill `--color-bg-base`, mark visible at 10×10 carrying
`--color-icon-brand` through `fill="currentColor"`, matching `251:10`. `aria-checked="true"` and the
mark is `aria-hidden`. A real click toggled the control on and off again, with the mark and stroke
following in both directions.

Worth recording: the node's SPEC prose says the mark is `color/icon/primary` drawn at 12. The node
itself binds `color/icon/brand` and draws at 10. The component followed the binding, which is
correct — see the design-gap section.

### 4 · State=Unchecked — Failed

```
Tested : 02/10/2026
Status : first test
Issue Type : Token binding
Expected : border-color: var(--color-border-brand-light) — node 251:13 binds its stroke to color/border/brand/Light, confirmed by get_variable_defs on 251:13 and by get_design_context on the set, light mode on both sides
Actual : border-color: var(--hz-checkbox-border-resting-unbound), a raw placeholder prop declared locally in checkBox.css and bound to no token
Fix : same single declaration as State=Default — both resting states read the one placeholder, so binding it to --color-border-brand-light fixes both
```

**Whose defect: the component's**, for the same reason as case 1.

### 5 · State=Disabled — Passed

```
Tested : 02/10/2026
Status : This Variant passed.
```

Fill resolved to `--color-bg-surfaceprimary` and stroke to `--color-border-disabled`, matching
`251:16`, with the mark hidden. Driven, not inferred: a real click fired the click handler zero
times and left `aria-checked` unchanged; the control did not take focus from the click; and under a
real pointer hover (`:hover` matched) the fill and stroke did not move to brand, so disabled
correctly wins over hover.

## Design gaps — reported as gaps, not logged against the engineer

These are properties the design leaves unbound. The component parks each in a named
`--hz-checkbox-*-unbound` placeholder rather than substituting a near-fitting token, which is the
right call; they are listed here so they reach the design side.

| Property | Status | Toward |
|---|---|---|
| Corner radius 3 | **Real token gap.** No radius token has the value 3px — nearest is `--borderradius-extra-small` at 4px. (`--borderwidth-3` is 3px but is a border *width*, not a radius.) | Figma |
| Mark size 10 | **Real token gap.** No size token resolves to 10px. | Figma |
| Box size 16 | Unbound on the node, though `--spacing-16` exists and is exactly 16px. | Figma — bind it |
| Stroke weight 1 | Unbound on the node, though `--borderwidth-1` exists, is exactly 1px, and is described "Default outline". | Figma — bind it |

## Documentation drift in the Figma node — for the designer

The node's own SPEC prose contradicts the node's live bindings in three places. The bindings were
treated as the truth throughout this test.

1. "The resting stroke stays #c8d2dd. That grey has no matching token." The node binds Default and
   Unchecked strokes to `color/border/brand/Light`. **This one caused both failures above** — the
   component was built from the prose.
2. "fill bound to color/icon/primary" for the mark. The node binds `color/icon/brand`.
3. "The check is ... drawn at 12." The node and its exported SVG are both 10.

## Keyboard focus

Not a matrix row — the component set has no Focus variant, and the node's own accessibility note
says keyboard focus "needs its own treatment — not yet in this set." Verified anyway: a real Tab
reaches the control and genuinely triggers `:focus-visible` with the user-agent ring left in place,
so the control is keyboard-visible while the design catches up. Nothing invented, nothing suppressed.

## Registry effect

Two rows `Failed` and three `Passed` on `stagingTesting`, all linked to `recWY9nPqeCWEQCs1` through
`Composed In`. `Staging Testing Results Summary` therefore contains `Failed` and no `re-test`, so
`Development` falls to gate 2 and reads **`To be fixed`**.
