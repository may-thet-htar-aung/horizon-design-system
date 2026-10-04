# Status Banner — staging test report

> The registry rows are authoritative; this file is the evidence behind them.

- **Component record:** `reczPLTUZvisEM1pm` · Category MOLECULES
- **Figma:** file `EupMGlgXy06FSwOr2WLZWF`, node `269-18`
- **Build under test:** `https://horizon-design-system-bapc0vqig-htar1.vercel.app` (re-read live off `Staging Storybook` at the start of this pass, and again mid-pass after a browser-tab drift)
- **Tested:** 04/10/2026 · first pass, no prior test records
- **Result:** 12 cases, 12 `Passed`, 0 `Failed`. Six design gaps and two prose/registry contradictions recorded below — none of them logged against the engineer.

## 1 · The design, read per layer

`get_metadata` on `269-18` returns a set of three variants. The axis is named **`State`**, and its values
verbatim — confirmed against the generated prop union from `get_design_context` — are:

- `Warning Status Banner` (`269:6`)
- `Error Status Banner` (`269:10`)
- `Info Status Banner` (`269:14`)

There is **no size axis**. Two further component properties exist: `Show icon` (boolean) and `Icon`
(instance swap).

Each variant was read **per layer**, never as a parent union:

| Variant | Layer | Node | Authored token |
|---|---|---|---|
| Warning | Icon area / Icon | `270:7`, `269:7` | `color/icon/warning` |
| Warning | Message | `269:9` | `color/text/warning` |
| Warning | fill / stroke | `269:6` | `color/bg/warning/Light`, `color/border/warning/Light` |
| Error | Icon area / Icon | `270:8`, `269:11` | `color/icon/negative` |
| Error | Message | `269:13` | `color/text/negative` |
| Error | fill / stroke | `269:10` | `color/bg/negative/Light`, `color/border/negative/Light` |
| Info | Icon area | `270:9` | `color/icon/info` |
| Info | **Icon info** (visible) | `272:25` | `color/icon/info` |
| Info | **Icon** (hidden) | `269:15` | **bound to nothing** |
| Info | Message | `269:17` | `color/text/info` |
| Info | fill / stroke | `269:14` | `color/bg/info/Light`, `color/border/info/Light` |

Shared across all three: `gap/component` (gap), `spacing/12` (padding-inline).

A parent-variant read returns these unioned and cannot say which layer owns which. Every token above
came from a read of that individual layer.

## 2 · The same-valued pair, and how it was separated

On the **Warning** variant, `color/icon/warning` and `color/text/warning` both resolve to the same
value in light mode. A variant-level union returns the two side by side with no attribution, and the
computed colour on the rendered side cannot separate them either, because both layers paint the same
colour. Two independent routes were used.

**Route 1 — authored `var()` name per selector on the deployed build.** Confirmed first that the
bundler preserved token names rather than inlining them: the stylesheet carries `var(--color-...)`
references and `:root` defines every one of them, so the names survived the build. The winning rules
are separate per layer:

```
.hz-status-banner[data-state="Warning"] .hz-status-banner__icon-area { color: var(--color-icon-warning); }
.hz-status-banner[data-state="Warning"] .hz-status-banner__message   { color: var(--color-text-warning); }
```

**Route 2 — dark mode, where the pair diverges.** The root carries `data-theme`. Switched to
`data-theme="dark"` and re-measured: the icon and the message take **different** computed colours, and
each matches its own token's dark resolution. The computed colour then names the binding by itself,
with no reliance on the stylesheet.

Both routes agree: the icon layer carries `color/icon/warning`, the message layer carries
`color/text/warning`. Error and Info do not need this treatment — their icon and text tokens differ in
light mode already.

A note on the `/Light` in `color/bg/warning/Light`: that is a **ramp step** in the token's name, not a
mode. Those tokens do resolve to different values under `data-theme="dark"`, so the name must not be
read as pinning the component to light mode.

## 3 · What each property actually drives, per variant

| Property | Warning | Error | Info |
|---|---|---|---|
| `State` | selects variant | selects variant | selects variant |
| `Show icon` | gates Icon area `270:7` — **works** | gates Icon area `270:8` — **works** | gates Icon area `270:9` — **works** |
| `Icon` (swap) | wired to visible `269:7` — **works** | wired to visible `269:11` — **works** | wired to **hidden** `269:15` — **drives nothing visible** |

The Info variant holds two icon instances in one frame: `269:15` (`Icon`, `hidden="true"`, bound to no
variable) and `272:25` (`Icon info`, visible, bound to `color/icon/info`). The `Icon` swap property is
attached to the hidden one; the mark a viewer actually sees is the other one, which the property is not
connected to.

The build reproduces this exactly — passing a custom icon to Info leaves the rendered mark unchanged.
**That is what the node specifies, so the row passes.** The wiring itself is a design gap (§5), not a
defect in the build. This is precisely the case where a behaviour that looks "missing" is the design's
own construction, and failing the row would have been a false finding.

## 4 · Geometry — the canvas is not a size spec

Node `269-18` draws each variant at a fixed 400×56, but **no width or height variable is bound
anywhere on the node**, and the SPEC states "Width follows the container. Height hugs the message."
The bindings win: 400×56 is an authoring canvas, and a pixel-for-pixel comparison against it is not a
finding.

The build sets `width: 100%` and lets height follow content. Measured filling its container exactly at
640 / 400 / 240 px, with height tracking the wrapped line count, and no overflow at 240 px.

Where it is informative rather than binding: at a container of exactly the canvas width, the build
reproduces the canvas geometry precisely — banner 400 wide, icon area 16×16 at x13/y20, message 350×32
at x37/y12, height 56. Every offset follows from `spacing/12` + border + `gap/component`, and matches.

**The 0.8px border.** `border-width` computed as `0.8px` in one browser tab and `1px` in another
against an authored `1px`. Control probe: `devicePixelRatio` was 1.25 in the first and 1.0 in the
second. It tracks DPR, not the component. Discounted, as instructed.

**Fonts.** Inter was confirmed loaded by measurement, not by a flag: the same string measured 358.93px
in `Inter` against 307.04px in a deliberately bogus family (and 307.04px in `serif`). `document.fonts
.check()` returned true, but that alone was not trusted. Distinct widths mean Inter genuinely painted,
so the width numbers above are the component's, not a fallback's.

## 5 · Design gaps — report, do not fail

Everything here is unbound in Figma. None is logged against the engineer, and no row was failed for any
of them. The build encodes each one honestly as a custom property with an explicit `-unbound` suffix,
which makes them greppable rather than silently hardcoded.

1. **Radius** — `6px`, unbound. The SPEC says so outright: "Radius 6. That step has no token.
   borderradius/small is 8." Build: `--hz-status-banner-radius-unbound`.
2. **Padding block** — top/bottom `11px`, unbound ("Top and bottom stay 11"). Padding inline *is*
   bound, to `spacing/12`. Build: `--hz-status-banner-padding-block-unbound`.
3. **Border width** — `1px`, no variable on the node. Build: `--hz-status-banner-stroke-unbound`.
4. **Icon size** — `16×16`, no variable. Build: `--hz-status-banner-icon-size-unbound`.
5. **Message type** — Inter Regular 13 / line-height normal, unbound. The SPEC concedes it: "Message is
   Inter Regular 13. That size is unpublished." Build: four `--hz-status-banner-message-*-unbound`
   properties.
6. **The `Icon` property is wired to a hidden, unbound layer in the Info variant** (§3). A designer
   should either connect the property to `272:25`, or remove `269:15`, or document the swap as
   unsupported for Info. As it stands the property is live in the panel and inert on the canvas.

## 6 · Contradictions worth a human's attention

**Prose vs. bindings — the icon tokens.** The component descriptions for `Symbol/filled/exclamation`
(`270:5`) and `Symbol/filled/info` (`272:23`) both say "Fill bound to `color/icon/primary`." The banner
does not use `color/icon/primary` anywhere — each variant's icon area binds `color/icon/warning`,
`color/icon/negative` or `color/icon/info`, and the SPEC block on the parent node says exactly that.
The icon-symbol descriptions describe the symbol's own default in the icon library, not its binding
once placed in this component. Harmless here, but it reads as a contradiction to anyone who takes the
symbol description as the banner's spec. The bindings win.

**Registry vocabulary does not cover this component's axis.** `stagingTesting.State` offers
`draft · pending · upcoming · completed · rejected · cancelled · hovered · idle · focus · selected ·
isCurrent · error · disabled · loading · filled`. This component's `State` axis is
`Warning Status Banner` / `Error Status Banner` / `Info Status Banner`. Only `error` has a true match.
I set `State = error` on the four Error rows and left it empty on the rest rather than invent options,
and recorded the verbatim axis value in `Variants` on every row. A human may want `warning` and `info`
added to that field.

**Variant value naming.** Figma's values embed the component name (`Warning Status Banner`); the build
shortens them to `data-state="Warning"`. Recorded as an observation, not a finding — `data-state` is an
internal attribute and the redundant suffix is a Figma authoring artifact.

**`Synchronization %` reads 100%.** Registry D4 warns this may read 100% unconditionally. This run
cannot distinguish: 12 of 12 genuinely passed, so 100% is also the correct answer. No evidence either
way.

## 7 · Accessibility and contrast

Contrast measured for the text and the icon against **the banner's own surface** — the fill each
actually sits on, not the page background.

| Variant | Mode | Surface token | Text ratio | Icon ratio |
|---|---|---|---|---|
| Warning | light | `color/bg/warning/Light` | 5.72 | 5.72 |
| Error | light | `color/bg/negative/Light` | 8.15 | 3.90 |
| Info | light | `color/bg/info/Light` | 6.74 | 4.63 |
| Warning | dark | `color/bg/warning/Light` (dark resolution) | 7.02 | 5.31 |
| Error | dark | `color/bg/negative/Light` (dark resolution) | 6.48 | 4.82 |
| Info | dark | `color/bg/info/Light` (dark resolution) | 7.51 | 5.18 |

Every text ratio clears 4.5:1 and every icon ratio clears 3:1, in both modes. Warning's two ratios are
identical in light because the two tokens resolve to the same value there — the same coincidence that
made §2 necessary.

The build also satisfies the node's accessibility notes: the icon area carries `aria-hidden="true"` (the
icon is a visual mark, not the accessible name), and the message is the accessible text. The banner
takes `role="alert"` for Error and `role="status"` for Warning and Info. Figma specifies no roles, so
this is an implementation addition with no Figma cell — a sound one, recorded as an observation.

## 8 · The matrix

All twelve rows are linked to `reczPLTUZvisEM1pm` via `Composed In`. Mode is named on both sides for
every row.

| # | Case | Figma cell | Verdict |
|---|---|---|---|
| 1 | `State` = Warning Status Banner · default icon | `269:6` | Passed |
| 2 | `State` = Error Status Banner · default icon | `269:10` | Passed |
| 3 | `State` = Info Status Banner · default icon | `269:14` | Passed |
| 4 | Warning · `Show icon` = false | property on `269:6` | Passed |
| 5 | Error · `Show icon` = false | property on `269:10` | Passed |
| 6 | Info · `Show icon` = false | property on `269:14` | Passed |
| 7 | Warning · `Icon` swapped | property → `269:7` | Passed |
| 8 | Error · `Icon` swapped | property → `269:11` | Passed |
| 9 | Info · `Icon` swapped — no-op | property → hidden `269:15` | Passed (matches node) |
| 10 | Height hugs a long message | SPEC, unbound | Passed |
| 11 | Width follows the container | SPEC, unbound | Passed |
| 12 | Narrow container, 240px | **no Figma cell** | Passed |

The `All states` story is a gallery of cases 1–6 and is not counted as a case of its own.

## 9 · Screenshots

Saved beside this file in `reports/StatusBanner/`. They are **not** pushed to the PR branch.

- `figma-node-269-18.png` — the Figma render of the component set
- `deployed-all-states-light.jpg` — deployed build, `data-theme="light"`
- `deployed-all-states-dark.jpg` — deployed build, `data-theme="dark"`; shows the Warning icon and
  message taking visibly different colours, the visual form of the §2 disambiguation
- `deployed-icon-swap-and-narrow.jpg` — Warning and Error swapping to the triangle mark, Info keeping
  the info mark despite the same swap, and the 240px container wrapping without overflow

**`Attachment` was not written.** The column takes uploads and the API path requires a publicly
reachable URL, which this run has no way to produce. The screenshots live beside this report instead.
Noted once here rather than repeated on all twelve rows.
