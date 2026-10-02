# Check Box — staging test report

| | |
|---|---|
| Component row | `recWY9nPqeCWEQCs1` · Check Box · ATOMS |
| Figma node | `251-19` in `EupMGlgXy06FSwOr2WLZWF` (component set, property `State`) |
| `Staging Storybook` (re-read off the row this run) | https://horizon-design-system-git-fix-check-box-resting-stroke-htar1.vercel.app |
| `Commit` (re-read off the row this run) | `6354701dd527c4a8e1146587cd75a6b682626d48` — "Bind the Check Box resting stroke to color/border/brand/Light", head of `origin/fix/check-box-resting-stroke` |
| Pass | **Re-test** (woken by `Development` = `Fixed`) |
| Tested | 02/10/2026 |
| Result | **5 passed · 0 failed** — both re-tested rows now pass, no regression in the three that already passed |

## Gate

`Staging Storybook` and `Commit` were **re-read off the component row at the start of this pass**,
not carried over from the first run. Both had moved: the engineer closed the
`component/check-box` PR and opened a new one for the repair.

| | First pass | This re-test |
|---|---|---|
| Preview | `…-git-component-check-box-htar1…` | `…-git-fix-check-box-resting-stroke-htar1…` |
| Commit | `ef50824` | `6354701` |

The previous preview is superseded; nothing in this report was measured against it. The recorded
commit was confirmed to be the head of the repair branch before testing.

## Scope of this pass

Woken on `Fixed`. Exactly two rows carried `Fixed (To re-test)` — **State=Default** and
**State=Unchecked**, the two this agent failed on the first pass. Those two were re-run and
overwritten. The other three already read `Passed`; they were re-measured on this build to check for
regression, and left on `Passed` because the measurements held.

## Matrix — rebuilt from Figma, not from the story file

`get_metadata` on `251:19` again returns one property, `State`, with five variants, every one 16×16.
Unchanged from the first pass:

| Variant | Node |
|---|---|
| State=Default | `251:4` |
| State=Hovered | `251:7` |
| State=Checked | `251:10` |
| State=Unchecked | `251:13` |
| State=Disabled | `251:16` |

No size axis, so `Size` is `null` on every row. `/index.json` on the new preview lists the same seven
stories — the five matrix states plus `all-variants` and `interactive`, which are demo harnesses with
no Figma row and are not findings.

## Validity checks run on this build before any value was compared

**Colour mode, both sides, named before comparing.** `get_variable_defs` on the five variant nodes
returned `color/bg/base` `#ffffff`, `color/bg/surfacePrimary` `#ebecee`, `color/border/disabled`
`#c0c4ca`, `color/border/brand/bold` `#3b82f6`, `color/border/brand/Light` `#7cabf9`,
`color/icon/brand` `#3676e0`. Every one matches `build/css/tokens.css` `:root` at the tested commit;
`build/css/tokens-dark.css` differs on all six. **The design side answered in light mode.** The
rendered side carries `data-theme="light"` with `prefers-color-scheme: dark` false. Both sides light.

This mattered more than usual this run. In dark, `--color-border-brand-light` is `#3676e0` — which is
the *light* value of `--color-icon-brand` — and dark `--color-icon-brand` is `#7cabf9`, the *light*
value of `border-brand-light`. The two tokens swap values across modes, so a cross-mode comparison
here would have produced a confident false **match**, not a false mismatch. Both sides were pinned to
light before any colour was read.

**Fonts measured on canvas, not asserted.** Roboto (`--family-plain` / `--family-brand`) measured
756.50px against 688.87px for a deliberately bogus family — genuinely loaded.
`document.fonts.check` also returned true, but it was not relied on. `--family-default` (Inter) still
measures identical to the bogus family and is not resolving; nothing in this component uses it. The
decisive point stands: the Check Box renders **no text node at all**, so no dimension reported here
is font-dependent.

**Border width is renderer snapping, excluded not logged.** `devicePixelRatio` was 1.25 for the
measurement run, and control probes with declared 1px / 2px / 3px borders computed 0.8px / 1.6px /
2.4px — a uniform 1/1.25 scaling applied to every element. The checkbox's computed 0.8px is that
artefact; its *declared* width is `1px`, confirmed in the authored rule. Not logged against any case.
(Earlier in the session the same page at `devicePixelRatio` 1 computed a clean 1px, which is the same
fact seen from the other side.)

## What the repair actually changed

The repair is genuine at source, not a coincidence of colour. On this build:

- `--hz-checkbox-border-resting-unbound` is **gone from the stylesheet entirely** — undefined on both
  the element and the root, and absent from every authored `.hz-checkbox` rule.
- The resting rule now reads `border: var(--hz-checkbox-border-width-unbound) solid
  var(--color-border-brand-light)`, resolving to the node's `color/border/brand/Light`.
- The remaining `--hz-checkbox-*-unbound` placeholders (size 16, radius 3, border-width 1, mark
  size 10) are untouched. Those are the **design gaps** listed below, correctly still parked rather
  than substituted with a near-fitting token.

## Results

| # | Variant | Size | State | Was | Now | Reason |
|---|---|---|---|---|---|---|
| 1 | State=Default | null | idle | `Fixed (To re-test)` | **Passed** | Resting stroke now resolves to `--color-border-brand-light`, per node `251:4` |
| 2 | State=Hovered | null | hovered | `Passed` | **Passed** (re-measured) | Stroke `--color-border-brand-bold`, fill `--color-bg-base`; pinned story and real pointer hover agree |
| 3 | State=Checked | null | selected | `Passed` | **Passed** (re-measured) | Stroke brand/bold, fill base, mark visible 10×10 in `--color-icon-brand` |
| 4 | State=Unchecked | null | idle | `Fixed (To re-test)` | **Passed** | Same single declaration as Default; one repair fixed both |
| 5 | State=Disabled | null | disabled | `Passed` | **Passed** (re-measured) | Fill `--color-bg-surfaceprimary`, stroke `--color-border-disabled`, genuinely inert |

Screenshots for this run: `reports/CheckBox/default.jpg`, `hovered.jpg`, `checked.jpg`,
`unchecked.jpg`, `disabled.jpg` — all recaptured from this preview and overwriting the first-pass
images. The Figma renders `figma-node-251-19.png` and `figma-default-251-4.png` are unchanged, as the
design did not move. Each deployed capture is the live element magnified 12× for legibility; every
number quoted was read from computed style at 1:1 before magnifying.

### 1 · State=Default — Failed → **Passed**

```
Tested : 02/10/2026
Status : This Variant passed.
```

Resting border computed `rgb(124, 171, 249)`, resolving through `var(--color-border-brand-light)`,
which is what node `251:4` binds. Box 16×16, radius 3px, fill `--color-bg-base`, mark hidden.

Driven, not just rendered: a real pointer hover swapped the stroke to `--color-border-brand-bold` and
`:hover` genuinely matched; moving the pointer away returned it to `--color-border-brand-light`, so
the repaired resting value is reached through real interaction and is not an artefact of the pinned
story. A real `Tab` reached the control and genuinely matched `:focus-visible`, with the resting
stroke undisturbed under focus.

### 2 · State=Hovered — **Passed** (re-measured, no regression)

```
Tested : 02/10/2026
Status : This Variant passed.
```

Stroke `--color-border-brand-bold`, fill `--color-bg-base`, mark hidden, matching `251:7`. The pinned
`data-state="Hovered"` story and the live `:hover` driven on the Default story produced identical
values. The repair did not leak into hover.

### 3 · State=Checked — **Passed** (re-measured, no regression)

```
Tested : 02/10/2026
Status : This Variant passed.
```

Stroke `--color-border-brand-bold`, fill `--color-bg-base`, mark visible at 10×10 carrying
`--color-icon-brand` through `fill="currentColor"`, matching `251:10`. `aria-checked="true"`, mark
`aria-hidden`. A real click toggled it off — border correctly returned to
`--color-border-brand-light` — and a second real click toggled it back on, with mark and stroke
following in both directions.

### 4 · State=Unchecked — Failed → **Passed**

```
Tested : 02/10/2026
Status : This Variant passed.
```

Resting border computed `rgb(124, 171, 249)` through `var(--color-border-brand-light)`, matching node
`251:13`. Both resting states read the one declaration, so the single repair resolved both failures,
exactly as the first pass's fix lead predicted. Geometry unchanged and still correct: 16×16, radius
3px, fill `--color-bg-base`, mark hidden at 10×10.

### 5 · State=Disabled — **Passed** (re-measured, no regression)

```
Tested : 02/10/2026
Status : This Variant passed.
```

Fill `--color-bg-surfaceprimary`, stroke `--color-border-disabled`, mark hidden, matching `251:16`.
Driven, not inferred: a real click fired the click handler **zero** times, left `aria-checked`
unchanged, and the control took no focus from the click. Under a real pointer hover (`:hover`
matched) fill and stroke did not move to brand — disabled still wins over hover, and the repair's new
resting token does not leak into disabled.

## Design gaps — reported as gaps, not logged against the engineer

Unchanged by the repair, and still correct behaviour by the component: each is parked in a named
`--hz-checkbox-*-unbound` placeholder rather than substituted with a near-fitting token.

| Property | Status | Toward |
|---|---|---|
| Corner radius 3 | **Real token gap.** No radius token has the value 3px — nearest is `--borderradius-extra-small` at 4px. (`--borderwidth-3` is 3px but is a border *width*, not a radius.) | Figma |
| Mark size 10 | **Real token gap.** No size token resolves to 10px. | Figma |
| Box size 16 | Unbound on the node, though `--spacing-16` exists and is exactly 16px. | Figma — bind it |
| Stroke weight 1 | Unbound on the node, though `--borderwidth-1` exists, is exactly 1px, and is described "Default outline". | Figma — bind it |

## Documentation drift in the Figma node — for the designer

Still open. The node's SPEC prose contradicts its live bindings in three places; the bindings were
treated as the truth throughout both passes.

1. "The resting stroke stays #c8d2dd. That grey has no matching token." The node binds Default and
   Unchecked strokes to `color/border/brand/Light`. **This prose caused both original failures** —
   the component was built from it instead of from the binding. Now repaired in code, but the prose
   is still there to mislead the next reader.
2. "fill bound to color/icon/primary" for the mark. The node binds `color/icon/brand`.
3. "The check is … drawn at 12." The node and its exported SVG are both 10.

## Keyboard focus

Not a matrix row — the component set has no Focus variant, and the node's own accessibility note says
keyboard focus "needs its own treatment — not yet in this set." Verified again anyway: a real `Tab`
reaches the control and genuinely triggers `:focus-visible`, with the user-agent ring left in place.
Nothing invented, nothing suppressed.

## Registry effect

All five `stagingTesting` rows now read `Passed`, linked to `recWY9nPqeCWEQCs1` through `Composed In`.
`Staging Testing Results Summary` contains neither `Failed` nor `re-test`, so gates 1, 2 and 3 do not
fire; `Production Storybook` is empty so gate 5 does not fire; the summary is non-empty, so
`Development` falls to **gate 6** and reads **`To be deployed`**. No row was left on
`Fixed (To re-test)`.

`Synchronization %` reads 100%, but per registry **D4** that field is `count / count` with no
confirmed filter and reads 100% on every row regardless — it is not cited here as evidence. The
5-of-5 figure above comes from the rows themselves.

## Two housekeeping notes

**Cell drift corrected on two passing rows.** On the first pass, `Expected Results` on the
**State=Hovered** and **State=Disabled** rows had been left holding a stale copy of the State=Default
*failure* block, while `Suggestion for Improvement` on those same rows correctly held the pass block.
The two cells disagreed, and the `Expected Results` copy described a defect that was never on those
rows. Both were overwritten with the pass block so the two cells match, exactly as
`finding-format` requires. **No verdict was changed** — both rows were `Passed` before and after, and
both were re-measured on this build first.

**`Attachment` is still empty on all five rows — outstanding.** The first pass left it empty, and this
pass could not fill it: Airtable attachments need a publicly reachable URL, and the only route to one
is pushing `reports/CheckBox/` to the `qa/check-box-evidence` branch, which was not requested this
run. The screenshots exist locally beside this report. This is a real miss against the qa self-check
and is flagged rather than quietly skipped.
