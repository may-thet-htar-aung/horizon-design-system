# Release review · InputFieldPassword · 05c4093
Verdict: Cleared
Pinned commit: 05c4093a90e5324aea8ad31021bf3f34a546c06d (main, merge of PR #60)
Board row(s): Input Field/Password
Read: production Storybook ✓ (https://horizon-design-system-htar1.vercel.app, read before any source)  docs page not staged (Astro Link empty, expected, not a finding)  intent file ✓  source ✓ (last)
Gates 7/7 pass

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed (formula, read live from the board). Production URL opens (200). Freshness by content: fetched production stylesheet assets/iframe-Cxgd67tk.css and compared it with the pinned commit. This component: 93 of 95 CSS declarations literal in production, the other 2 are `background: transparent` rewritten to `background:0 0`. Differences are minifier rewrites only (background:none -> background:0 0, -webkit-appearance prefix dropped, background:transparent -> #0000); the #58 changes are live (Button :focus-visible ring, --hz-pincode-height: var(--spacing-56), --hz-checkbox-border-width: var(--borderwidth-1)). tokens.css: 401 declarations, the 42 not literal in production differ only by colour/number minification (#ffffff -> #fff, rgba() -> hex8, -0.25px -> -.25px). |  |
| R2 Tokens | pass | zero raw hex, rgb() or hsl() in the CSS, the JSX inline styles or the SVG assets (the only `fill="white"` is the clipPath rect in the two eye icons, which paints nothing); every var(--...) in the CSS resolves in build/css/tokens.css; the 1px / 16px / 40px / 56px values that have tokens are bound (#58). Ruled, not findings (Ruling 1): --hz-input-field-password-width-unbound: 360px and --hz-input-field-password-gap-unbound: 5px (no 360px or 5px token). |  |
| R3 Surface | pass | `export { InputFieldPassword }` is one line in src/index.js; the states list, the Property 1 table and the two icons are internal. |  |
| R4 Names | pass | `Input Field/Password` on the board, folder `inputFieldPassword`, symbol `InputFieldPassword`, class `hz-input-field-password`, InputFieldPassword.intent.json, story `Components/Input Field Password` (same word, separator differs). |  |
| R5 States | pass | 11 board rows (9 Property 1 cells, Show icon = false, Default + revealed, both marked "no Figma cell"); stories cover every one (Default through Disabled, No icon, Default + revealed, and the nine-cell matrix). |  |
| R6 Intent | pass | Seven fields present; a11y is specific (real label, type password/text, aria-invalid on Error, aria-describedby, reveal <button> named Show/Hide password with aria-pressed and aria-controls, disables both on Disabled); 31 required_tokens resolve; variant_intent covers State, revealed and Show icon; no pair overlap. |  |
| R7 Version | pass | Version: no earlier tag, first version 0.1.0. Forced by: the new export `InputFieldPassword` and its public props state, revealed, showIcon, icon, iconRevealed, label, helperText, value, placeholder, onRevealChange, onChange. A human chooses and tags. |  |

Ruled, not findings (Ruling 1, listed once so the exception stays visible): `360px`, `5px`
Warnings (not blockers): All 5 dont_use_when entries have no alternative; "Do not use this field for email, names, or other text that should stay visible" does not name InputField, which is the obvious alternative.
Staleness: the row's Last Modified (2026-10-05T08:29:02Z) is later than commit 05c4093 (2026-10-05T08:23:10Z). Nothing landed on main after 05c4093; the later timestamp is the human clearing the Release Review and Release Verdict cells. This is not a component change. Writing the two cells below will move Last Modified again, so the check will always read later than the reviewed commit; see "No ruling".

Choosing test (batch, run once for all six intent files; jobs written so it can be repeated):

| # | Job | Pick | Line that decided it (verbatim, checked mechanically against the file) | Confidence |
|---|---|---|---|---|
| 1 | A guest has been emailed a six-digit code and must type it in to finish signing in. | PinCodeCell | PinCodeCell.use_when: "Use it for one digit of a code, such as a sign-in or verification code." and PinCodeCell.dont_use_when: "Do not use one cell for a whole code. A code is a row of cells." | high |
| 2 | After a card payment fails, tell the guest what went wrong, above the Retry button, outside any field. | StatusBanner | StatusBanner.use_when: "Use it for one status that sits outside a field, such as a failed sign-in or a booking hold." and "Use Error when something failed and they have to act. Use Info for neutral information." | high |
| 3 | Let a guest choose exactly one of three room types. | none | CheckBox.dont_use_when: "Do not use it for mutually exclusive options. Use a radio." (names a radio; no radio intent file exists in the batch) | high that nothing fits |

Hedges: none. Job 1 runner-up was InputField ("Use it when a person must enter one piece of information, such as an email or a check-in date."); rejected because that line names neither a code nor a verification step, while PinCodeCell's names both. Job 3 is a job the library does not cover and was answered "none", which is the pass.
Limitation: the reader was the reviewer, not a context-isolated reader. The three jobs were fixed and the intent files read before any source, but the reviewer had also seen the production Storybook. Treat the result as a first reading and repeat it with a clean reader if the verdict hangs on it.

Version: no earlier tag, first version 0.1.0. Forced by: the new export `InputFieldPassword` and its public props state, revealed, showIcon, icon, iconRevealed, label, helperText, value, placeholder, onRevealChange, onChange. A human chooses and tags.

No ruling in the skill for:
- Last Modified is a lastModifiedTime over the whole row, so clearing or writing the two reviewer cells always makes it later than the reviewed commit; the staleness check cannot tell a component change from a cell edit.
- The skill says the report is linked "at the pinned commit's SHA", but the report cannot exist at the pinned commit. It is linked at the SHA of the commit that adds it, and names the pinned commit above.
