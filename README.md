# Horizon Design System — tokens

Design tokens exported from Figma, compiled to CSS, Swift and Android XML by
[Style Dictionary](https://styledictionary.com), and documented in Storybook.

## Commands

```bash
npm run tokens            # build platform output + the Storybook token data
npm run build:tokens      # platform output only  → build/css, build/ios, build/android
npm run build:token-data  # Storybook data only   → build/storybook/*.json
npm run storybook         # dev server on :6006 (rebuilds tokens first)
npm run build:storybook   # static site → storybook-static/
```

## Layout

| Path | What it is |
| --- | --- |
| `tokens/` | Figma-owned token files. Never hand-edit — re-export instead. |
| `tokens/manifest.json` | Which collections exist and what modes each has. |
| `build-tokens.js` | Compiles the platform output. |
| `build-token-data.js` | Resolves every collection mode to JSON for Storybook. |
| `tokens-preprocessor.js` | Shared preprocessor — normalises Figma's font-weight names. |
| `stories/` | The token gallery. Data-driven; no token value is hardcoded. |

## Storybook

The gallery reads `build/storybook/*.json`, which is generated from the same
Style Dictionary pipeline as the platform output — so what you see is the
post-transform value each platform actually ships, not the raw Figma JSON.

**Overview → Coverage** is the one to check after a re-export. It measures, per
collection mode, how many tokens reach `build/css/tokens.css` by matching name
*and* value against the built file. A mode at zero is authored but not compiled.

## Known state: two cores

The repo currently carries two core ramps, and the build only consumes one.

- `core.value.tokens.json` — 65 tokens. **This is what `build-tokens.js` compiles.**
- `core.light.tokens.json` — 165 tokens, the newer Figma export. Wider palette
  (cyan, sky, indigo, violet, alpha neutrals), M3 radius ladder, M3 elevation parts.

The `semantic.*` and `layout.*` files are authored against the *Figma* core —
their aliases (`{spacing-16}`, `{color-sky-500}`) don't exist in `core.value`.
So roughly 468 of 837 tokens are internally consistent but not compiled for web.

Resolving this means either pointing `build-tokens.js` at the Figma core, or
re-exporting into `core.value`. Until then, edits to `core.light.tokens.json`
do not change any platform output.
