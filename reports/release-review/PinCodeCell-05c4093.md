# Release review · PinCodeCell · 05c4093
Verdict: Blocked
Pinned commit: 05c4093a90e5324aea8ad31021bf3f34a546c06d (main, merge of PR #60)
Board row(s): Pin Code
Read: production Storybook ✓ (https://horizon-design-system-htar1.vercel.app, read before any source)  docs page not staged (Astro Link empty, expected, not a finding)  intent file ✓  source ✓ (last)
Gates 6/7 pass

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed (formula, read live from the board). Production URL opens (200). Freshness by content: fetched production stylesheet assets/iframe-Cxgd67tk.css and compared it with the pinned commit. This component: 29 of 30 CSS declarations literal in production, the other is the -webkit-appearance prefix dropped by the minifier. Differences are minifier rewrites only (background:none -> background:0 0, -webkit-appearance prefix dropped, background:transparent -> #0000); the #58 changes are live (Button :focus-visible ring, --hz-pincode-height: var(--spacing-56), --hz-checkbox-border-width: var(--borderwidth-1)). tokens.css: 401 declarations, the 42 not literal in production differ only by colour/number minification (#ffffff -> #fff, rgba() -> hex8, -0.25px -> -.25px). |  |
| R2 Tokens | pass | zero raw hex, rgb() or hsl() in the CSS, the JSX inline styles or the SVG assets (the only `fill="white"` is the clipPath rect in the two eye icons, which paints nothing); every var(--...) in the CSS resolves in build/css/tokens.css; the 1px / 16px / 40px / 56px values that have tokens are bound (#58). Ruled, not findings (Ruling 1): --hz-pincode-width-unbound: 52px and --hz-pincode-radius-unbound: 6px (no 52px size/spacing token, no 6px radius token; borderradius-extra-small is 4px). The 56px height is bound to --spacing-56 (#58). |  |
| R3 Surface | pass | `export { PinCodeCell }` is one line in src/index.js (from PinCode.jsx); the intent file documents it; PIN_CODE_CELL_STATES is internal. |  |
| R4 Names | FAIL | Ruling 2: the exported symbol `PinCodeCell` is the name. The board `Components` cell still reads `Pin Code`. Reported once, as the ruling says. Folder `pinCode`, file PinCode.jsx, class `hz-pincode-cell` and PinCodeCell.intent.json stay as they are. | a human: rename the board row to `PinCodeCell` |
| R5 States | pass | 10 board rows (5 states x Light/Dark); stories Default, Hovered, Typed, Error, Disabled, All Variants, Interactive. No story without a row. |  |
| R6 Intent | pass | Seven fields present; a11y is specific (real text input, inputMode numeric, one-time-code, maxLength 1, aria-label per cell, aria-invalid on Error, real disabled); 12 required_tokens resolve; variant_intent covers the five states; no pair overlap (it is one digit; InputField is a whole value). |  |
| R7 Version | pass | Version: no earlier tag, first version 0.1.0. Forced by: the new export `PinCodeCell` and its public props state, value, label, onChange. Renaming this symbol later would be a MAJOR bump, which is why the board row should follow it now. |  |

Ruled, not findings (Ruling 1, listed once so the exception stays visible): `52px`, `6px`
Warnings (not blockers): All 5 dont_use_when entries have no alternative; "Do not use it for a name, email, or password" does not name InputField or InputFieldPassword.
Staleness: the row's Last Modified (2026-10-05T08:29:02Z) is later than commit 05c4093 (2026-10-05T08:23:10Z). Nothing landed on main after 05c4093; the later timestamp is the human clearing the Release Review and Release Verdict cells. This is not a component change. Writing the two cells below will move Last Modified again, so the check will always read later than the reviewed commit; see "No ruling".

Choosing test (batch, run once for all six intent files; jobs written so it can be repeated):

| # | Job | Pick | Line that decided it (verbatim, checked mechanically against the file) | Confidence |
|---|---|---|---|---|
| 1 | A guest has been emailed a six-digit code and must type it in to finish signing in. | PinCodeCell | PinCodeCell.use_when: "Use it for one digit of a code, such as a sign-in or verification code." and PinCodeCell.dont_use_when: "Do not use one cell for a whole code. A code is a row of cells." | high |
| 2 | After a card payment fails, tell the guest what went wrong, above the Retry button, outside any field. | StatusBanner | StatusBanner.use_when: "Use it for one status that sits outside a field, such as a failed sign-in or a booking hold." and "Use Error when something failed and they have to act. Use Info for neutral information." | high |
| 3 | Let a guest choose exactly one of three room types. | none | CheckBox.dont_use_when: "Do not use it for mutually exclusive options. Use a radio." (names a radio; no radio intent file exists in the batch) | high that nothing fits |

Hedges: none. Job 1 runner-up was InputField ("Use it when a person must enter one piece of information, such as an email or a check-in date."); rejected because that line names neither a code nor a verification step, while PinCodeCell's names both. Job 3 is a job the library does not cover and was answered "none", which is the pass.
Limitation: the reader was the reviewer, not a context-isolated reader. The three jobs were fixed and the intent files read before any source, but the reviewer had also seen the production Storybook. Treat the result as a first reading and repeat it with a clean reader if the verdict hangs on it.

Version: no earlier tag, first version 0.1.0. Forced by: the new export `PinCodeCell` and its public props state, value, label, onChange. Renaming this symbol later would be a MAJOR bump, which is why the board row should follow it now.

No ruling in the skill for:
- The Storybook sidebar title is `Components/Pin Code`, so a reader of the published page sees the old word beside an export called PinCodeCell. Ruling 2 says not to rename the symbol and does not say who owns the story title; left to the human who renames the row. Not counted as a separate failure.
- Last Modified is a lastModifiedTime over the whole row, so clearing or writing the two reviewer cells always makes it later than the reviewed commit; the staleness check cannot tell a component change from a cell edit.
- The skill says the report is linked "at the pinned commit's SHA", but the report cannot exist at the pinned commit. It is linked at the SHA of the commit that adds it, and names the pinned commit above.
