# Release review · InputField · 05c4093
Verdict: Cleared
Pinned commit: 05c4093a90e5324aea8ad31021bf3f34a546c06d (main, merge of PR #60)
Board row(s): Input Field/Primary and Input Field/Mobile (one component, two board rows, Ruling 3)
Read: production Storybook ✓ (https://horizon-design-system-htar1.vercel.app, read before any source)  docs page not staged (Astro Link empty, expected, not a finding)  intent file ✓  source ✓ (last)
Gates 7/7 pass

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed (formula, read live from the board). Production URL opens (200). Freshness by content: fetched production stylesheet assets/iframe-Cxgd67tk.css and compared it with the pinned commit. This component: Mobile CSS (InputField.css) 71 of 73 and Primary CSS (InputFieldPrimary.css) 79 of 82 declarations literal in production, the others are the same minifier rewrites. Differences are minifier rewrites only (background:none -> background:0 0, -webkit-appearance prefix dropped, background:transparent -> #0000); the #58 changes are live (Button :focus-visible ring, --hz-pincode-height: var(--spacing-56), --hz-checkbox-border-width: var(--borderwidth-1)). tokens.css: 401 declarations, the 42 not literal in production differ only by colour/number minification (#ffffff -> #fff, rgba() -> hex8, -0.25px -> -.25px). |  |
| R2 Tokens | pass | zero raw hex, rgb() or hsl() in the CSS, the JSX inline styles or the SVG assets (the only `fill="white"` is the clipPath rect in the two eye icons, which paints nothing); every var(--...) in the CSS resolves in build/css/tokens.css; the 1px / 16px / 40px / 56px values that have tokens are bound (#58). Ruled, not findings (Ruling 1): --hz-input-field-width-unbound: 342px, --hz-input-field-height-unbound: 52px, --hz-input-field-padding-unbound: 14px, --hz-input-field-gap-unbound: 5px (Mobile); --hz-input-field-primary-width-unbound: 360px, --hz-input-field-primary-gap-unbound: 5px (Primary). No spacing or size token carries 342, 52, 14, 5 or 360. |  |
| R3 Surface | pass | `export { InputField }` is one line in src/index.js and covers both variants through the `variant` prop; INPUT_FIELD_STATES and INPUT_FIELD_VARIANTS are internal. |  |
| R4 Names | pass | Ruling 3: both board rows (`Input Field/Primary`, `Input Field/Mobile`) are compared against `InputField`: folder `inputField`, symbol `InputField`, class `hz-input-field`, InputField.intent.json, story titles `Components/Input Field/Primary` and `Components/Input Field/Mobile` (fixed in #58). Not reported: the two rows. |  |
| R5 States | pass | Primary 11 rows, Mobile 13 rows. Both variants have stories for Default, Hovered, Typed, Error, Warning, Disabled, Show Label = false, Show Helper text = false, All Variants and Interactive; Primary adds Primary vs Mobile. The overlap rows (Error/Warning/Disabled while hovered, edited while filled) are live :hover and typing on the Error, Warning, Disabled and Interactive stories; no static story pins them, which is judged covered. |  |
| R6 Intent | pass | Seven fields present; a11y is specific (real label with htmlFor, aria-invalid on Error only, aria-label when the label is hidden, aria-describedby, real disabled); 34 required_tokens resolve (color-neutral-25 has no dark value and the CSS header says so); variant_intent covers variant Primary/Mobile, six states and both Show toggles; no pair overlap (the Password field names "a secret"; InputField names "an email or a check-in date"). |  |
| R7 Version | pass | Version: no earlier tag, first version 0.1.0. Forced by: the new export `InputField` and its public props variant, state, label, showLabel, helperText, showHelperText, value, placeholder, onChange. The default is variant="Mobile"; changing a default later alters consumers' markup, so the human may want to look at it before tagging. |  |

Ruled, not findings (Ruling 1, listed once so the exception stays visible): `342px`, `52px`, `14px`, `5px` (Mobile); `360px`, `5px` (Primary)
Warnings (not blockers): All 7 dont_use_when entries have no alternative. None redirects a secret to InputFieldPassword or a code to PinCodeCell, so InputField's broad "one piece of information" relies on those two files to exclude themselves.
Staleness: the row's Last Modified (2026-10-05T08:29:02Z) is later than commit 05c4093 (2026-10-05T08:23:10Z). Nothing landed on main after 05c4093; the later timestamp is the human clearing the Release Review and Release Verdict cells. This is not a component change. Writing the two cells below will move Last Modified again, so the check will always read later than the reviewed commit; see "No ruling".

Choosing test (batch, run once for all six intent files; jobs written so it can be repeated):

| # | Job | Pick | Line that decided it (verbatim, checked mechanically against the file) | Confidence |
|---|---|---|---|---|
| 1 | A guest has been emailed a six-digit code and must type it in to finish signing in. | PinCodeCell | PinCodeCell.use_when: "Use it for one digit of a code, such as a sign-in or verification code." and PinCodeCell.dont_use_when: "Do not use one cell for a whole code. A code is a row of cells." | high |
| 2 | After a card payment fails, tell the guest what went wrong, above the Retry button, outside any field. | StatusBanner | StatusBanner.use_when: "Use it for one status that sits outside a field, such as a failed sign-in or a booking hold." and "Use Error when something failed and they have to act. Use Info for neutral information." | high |
| 3 | Let a guest choose exactly one of three room types. | none | CheckBox.dont_use_when: "Do not use it for mutually exclusive options. Use a radio." (names a radio; no radio intent file exists in the batch) | high that nothing fits |

Hedges: none. Job 1 runner-up was InputField ("Use it when a person must enter one piece of information, such as an email or a check-in date."); rejected because that line names neither a code nor a verification step, while PinCodeCell's names both. Job 3 is a job the library does not cover and was answered "none", which is the pass.
Limitation: the reader was the reviewer, not a context-isolated reader. The three jobs were fixed and the intent files read before any source, but the reviewer had also seen the production Storybook. Treat the result as a first reading and repeat it with a clean reader if the verdict hangs on it.

Version: no earlier tag, first version 0.1.0. Forced by: the new export `InputField` and its public props variant, state, label, showLabel, helperText, showHelperText, value, placeholder, onChange. The default is variant="Mobile"; changing a default later alters consumers' markup, so the human may want to look at it before tagging.

No ruling in the skill for:
- Both rows read the same report and get the same verdict, as one component. Mobile's story file is still named InputField.stories.jsx (and its header refers to a file inputField.js); naming only, not part of R4 as written.
- Last Modified is a lastModifiedTime over the whole row, so clearing or writing the two reviewer cells always makes it later than the reviewed commit; the staleness check cannot tell a component change from a cell edit.
- The skill says the report is linked "at the pinned commit's SHA", but the report cannot exist at the pinned commit. It is linked at the SHA of the commit that adds it, and names the pinned commit above.
