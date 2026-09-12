# Horizon Button — design/token gaps

**Figma node:** https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=65-22
**Built:** `src/components/button/` · **Date:** 2026-09-10

The component doc in Figma states *"Every value is bound to Horizon Tokens."*
It isn't. The node is bound to a **different variable library** — names like
`color/bg/primary/idle`, `family/plain`, `borderradius/small`. None of those
exist in `build/css/tokens.css`, which publishes `--color-bg-primary`,
`--family-default`, `--border-radius-control`.

The component was built against **Horizon semantic tokens**, per the build rule
"resolve, don't choose". So the code is correct for the system and the render
does *not* match the Figma pixels. Every divergence is below. Each one needs a
designer decision: re-bind the Figma component to Horizon, or change the token.

## 1 · Value mismatches — same meaning, different value

| Property | Figma variable | Figma value | Horizon token | Horizon value |
|---|---|---|---|---|
| Corner radius | `borderradius/small` | `8px` | `--border-radius-control` | **`12px`** |
| Label font family | `family/plain` | **Roboto** | `--family-default` | **Inter** |
| Primary fill | `color/bg/primary/idle` | `#3676e0` | `--color-bg-primary` | `#1d4ed8` |
| Primary fill, hover | `color/bg/primary/hovered` | `#3b82f6` | `--color-bg-primary-hovered` | `#1840b1` |
| Disabled fill | `color/bg/surfacePrimary` | `#ebecee` | `--color-bg-primary-disabled` | `#d7dee7` |
| Disabled label | `color/text/disabled on dark` | `#c0c4ca` | `--color-text-disabled` | `#b9c7d6` |
| Disabled border | `color/border/disabled` | `#c0c4ca` | `--color-border-disabled` | `#eaeff4` |
| Ghost fill, hover | `color/bg/primary/Light` | `#ebf3fe` | `--color-bg-primary-subtle` | `#eef4ff` |

**Hover runs the wrong way.** In Figma, Primary *lightens* on hover
(`#3676e0` → `#3b82f6`). In Horizon it *darkens* (`#1d4ed8` → `#1840b1`), and
`--color-bg-primary-pressed` darkens again. Horizon's is the coherent ladder.
Figma should follow it, or Horizon's ladder is wrong — but they cannot both stand.

## 2 · Missing Horizon tokens — no semantic carries this meaning

| Need | Figma variable | Figma value | Built with | Why it's wrong |
|---|---|---|---|---|
| Brand border, at rest | `color/border/brand/default` | `#629bf8` | `--color-border-bold` (`#d7dee7`) | Horizon's is documented "Outlined control at rest" but is **neutral grey**, not brand. The Outline button reads grey, not blue. |
| Brand border, emphasised | `color/border/brand/bold` | `#3b82f6` | `--color-border-focused` (`#1d4ed8`) | That token means *focus ring*. Borrowing it for hover overloads one token with two meanings. |
| Brand text | `color/text/brand` | `#3676e0` | `--color-text-link` (`#1d4ed8`) | Horizon has no brand-text token; `--color-text-link` means *inline link*. |

**Recommended additions to Horizon:** `--color-border-brand-default`,
`--color-border-brand-bold`, `--color-text-brand`.

## 3 · Unbound in Figma — code binds it, Figma should too

| Property | Figma | Horizon token | Note |
|---|---|---|---|
| Icon size 20 | unbound — designer notes `icon/size-20` is unpublished | `--size-icon-md` (`20px`) | Publish the Figma variable and bind it. |

## 4 · States the design set does not cover

- **Keyboard focus** — absent from the set; the doc says so outright
  ("Hover is not a substitute for focus... not yet in this set"). Built anyway,
  as `:focus-visible` with `--color-border-focused` / `--border-width-focused`,
  offset by `--spacing-padding-2xs`. **Needs a Figma variant to match.**
- **Pressed / active** — absent from the set, though Horizon publishes
  `--color-bg-primary-pressed`. **Not built** — a state in code that isn't in
  the design is the same sync failure in the other direction. Add it in Figma.
- **Loading** — not in the design, not built.

## 5 · Semantics worth a second look

- Figma paints the **disabled fill** with `color/bg/surfacePrimary` — a *surface*
  token doing an *action-state* job. Horizon's `--color-bg-primary-disabled` is
  the right shape. Re-bind in Figma.
- Figma paints the **disabled label** with `color/text/disabled on dark`, on a
  light grey fill. Either the token is misnamed or it is the wrong token.

## What matched cleanly

Height `40` → `--size-control-md` · inline padding `24` → `--spacing-padding-lg` ·
gap `8` → `--spacing-gap-xs` · border width `1` → `--border-width-default` ·
label metrics `500 14/20`, tracking `0.1` → `--label-lg` + `--tracking-label-lg` ·
`color/text/inverse` `#ffffff` → `--color-text-inverse`.
