---
name: tokens
description: How the design-token export and rebuild works — what's generated versus exported and must never be hand-edited, how to tell a real gap in the Figma export from a build-wiring or naming mistake, how many modes exist and which platforms actually consume them, and how to verify a rebuild instead of assuming it worked.
---

# Tokens: export and rebuild

## The two layers, and why neither is hand-edited

**`tokens/*.json` is the export.** The Figma plugin owns every file in `tokens/` — `core.value`,
`core.light`, `semantic-color.light/dark`, `semantic-space.web/mobile/back-office`,
`type.web/mobile/back-office`, `semantic.light/dark`, `layout.compact/medium/expanded`,
`typography.value/styles`, `effects.styles`. A hand edit here survives exactly until the next
export overwrites it, silently. If a value here is wrong, it's wrong in Figma — fix it there.

**`build/**` is generated.** `build-tokens.js` and `build-token-data.js` produce it fresh on every
run: `build/css/tokens.css`, `build/css/tokens-dark.css`, `build/ios/Tokens.swift`,
`build/android/colors.xml`, and `build/storybook/*.json` plus `build/storybook/index.json`. Never
hand-edit anything under `build/` for the same reason, one layer up — the next `npm run tokens`
erases it without asking.

Between the two sits `tokens-preprocessor.js` (`TYPOGRAPHY_FIX`), which is source code, not export
or output — it's the one file in this pipeline you can actually edit, because it's how the pipeline
itself is built, not a copy of Figma's state or a copy of the pipeline's output.

## How many modes exist, and who actually consumes them

Read `tokens/manifest.json` for the declared shape, but don't stop there — what's declared and
what `build-tokens.js` actually builds have already drifted once, so check both.

| Collection | Modes | Actually shipped to a platform today |
|---|---|---|
| `core` | `value` (`core.value.tokens.json`) | Yes — every platform's base source |
| `semantic-color` | `light`, `dark` | Both — `light` in `:root`, `dark` under `[data-theme="dark"]` |
| `semantic-space` | `web`, `mobile`, `back-office` | `web` → CSS `:root`. `mobile` → iOS/Android. **`back-office` is not wired to any platform yet.** |
| `type` | `web`, `mobile`, `back-office` | Same split as `semantic-space` — `back-office` unbuilt. |
| `typography`, `effects` | none — single `styles`/`value` file each | Yes, into every CSS build |

Two things the manifest doesn't tell you, because they aren't in it:

- **`core.light.tokens.json` isn't a declared mode of anything.** It's the newer Figma core that
  `semantic.*` and `layout.*` are authored against, but `core.value.tokens.json` — not
  `core.light` — is what every real build resolves aliases against. An alias that exists in
  `core.light` and not in `core.value` will fail to resolve in the actual build, and it will look
  exactly like a missing token.
- **`semantic.light/dark` (extended semantic) and `layout.compact/medium/expanded` exist as files
  and are not wired into `build-tokens.js` at all.** `build-token-data.js` builds Storybook views
  for them so they're visible, but says so explicitly in its own source: "Not wired into
  build-tokens.js yet." Nothing you change in those files will appear in `build/css/tokens.css`,
  ever, until someone adds them to a platform in `build-tokens.js`. That absence is not a gap in
  the export.

## Telling a real token gap from a naming or wiring mistake

A token missing from generated output has three different causes, and only one of them is
Figma's:

1. **It's a real gap.** The token doesn't exist in the relevant `tokens/*.json` file at all — not
   under a different name, not as an unresolved alias. Figma never defined it. This is the only
   case that goes back to the design tool.
2. **It's an alias resolving against the wrong core.** The token exists, but its `$value` is an
   alias like `{color-sky-500}` that's only defined in `core.light.tokens.json`, while the build
   resolves against `core.value.tokens.json`. Check both core files before concluding anything is
   missing — grep the alias name in each.
3. **It's a wiring gap, not an export gap.** The source file that defines the token isn't in the
   `source` array of the `css()` or `native()` call that builds the platform you're checking — the
   `back-office` mode and the extended `semantic`/`layout` collections are exactly this today. The
   token is fully exported and perfectly named; nothing in `build-tokens.js` asks for it yet.

Report case 1 to the design tool. Report cases 2 and 3 as a build-wiring problem — they're a
naming/config mismatch in this repo, not something a re-export fixes, and re-exporting from Figma
again will reproduce the identical "missing" token every time because the actual defect isn't
there.

## Verifying the rebuild, rather than assuming it worked

A `0` exit code from `npm run tokens` means the pipeline ran, not that your token made it into the
output. `build-token-data.js` already does the real check — read its own comment before
reinventing this:

> Coverage is measured, not asserted: read the actual build output and check which of a view's
> tokens made it in. Name AND value must match. Matching on name alone would report every space
> mode as shipped, since web/mobile/back-office use identical names.

Follow the same method by hand when checking a specific token:

1. Run `npm run tokens` (or `build:tokens` then `build:token-data`).
2. Open the generated file for the platform you care about — `build/css/tokens.css` for web, not
   the source JSON.
3. Search for the exact CSS custom property name **and confirm the value that follows it**, not
   just that the name is present. Two modes can share a name with different values; finding the
   name proves nothing on its own.
4. Cross-check against `build/storybook/index.json`, which `build-token-data.js` writes with a
   `coverage` count per view — a view whose coverage is lower than its token count is telling you
   something didn't make it into the CSS, before you go looking for why by hand.

A rebuild that produces a file is not a verified rebuild. A rebuild whose specific token you
searched for, by name and value, in the actual generated output, is.

## The rule

**A missing token is reported and fixed in the design tool. It is never added to the generated
file, and never added by hand to the export either.** The only sanctioned way a token enters this
pipeline is: someone fixes or adds it in Figma, the plugin re-exports `tokens/*.json`, and the
build regenerates `build/` from that. Writing it directly into `build/css/tokens.css` to unblock
yourself makes the file lie about where it came from, and the very next rebuild deletes your fix
without telling anyone — the gap will look "fixed" for exactly as long as nobody reruns the
pipeline.

## Self-check
- [ ] Nothing was hand-edited under `tokens/` or `build/`
- [ ] A missing token was checked against both core files (`core.value`, `core.light`) before
      being called a gap
- [ ] A missing token was checked against `build-tokens.js`'s actual `source` arrays before being
      called a gap — not every exported collection is wired to a platform
- [ ] The rebuild was verified by finding the token's name **and** value in the generated output,
      not just by a clean exit code
- [ ] Any real gap was reported toward Figma, not patched in `build/` or in `tokens/`
