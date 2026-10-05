# Release review · Button · 05c4093
Verdict: Blocked
Pinned commit: 05c4093a90e5324aea8ad31021bf3f34a546c06d (main, merge of PR #60)
Board row(s): Button
Read: production Storybook ✓ (https://horizon-design-system-htar1.vercel.app, read before any source)  docs page not staged (Astro Link empty, expected, not a finding)  intent file ✓  source ✓ (last)
Gates 6/7 pass

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed (formula, read live from the board). Production URL opens (200). Freshness by content: fetched production stylesheet assets/iframe-Cxgd67tk.css and compared it with the pinned commit. This component: 45 of 47 CSS declarations literal in production, the 2 others are the minifier rewrites. Differences are minifier rewrites only (background:none -> background:0 0, -webkit-appearance prefix dropped, background:transparent -> #0000); the #58 changes are live (Button :focus-visible ring, --hz-pincode-height: var(--spacing-56), --hz-checkbox-border-width: var(--borderwidth-1)). tokens.css: 401 declarations, the 42 not literal in production differ only by colour/number minification (#ffffff -> #fff, rgba() -> hex8, -0.25px -> -.25px). |  |
| R2 Tokens | pass | zero raw hex, rgb() or hsl() in the CSS, the JSX inline styles or the SVG assets (the only `fill="white"` is the clipPath rect in the two eye icons, which paints nothing); every var(--...) in the CSS resolves in build/css/tokens.css; the 1px / 16px / 40px / 56px values that have tokens are bound (#58). No px literal remains and no unbound value exists. |  |
| R3 Surface | pass | `export { Button }` is one line in src/index.js; the intent file and the story both document it; the STATES/TYPES lists and `defaultIcons` are not reachable from the entry. |  |
| R4 Names | pass | Button = folder `button`, file Button.jsx, symbol `Button`, class `hz-button`, Button.intent.json, board `Button`, story title `Components/Button`. |  |
| R5 States | FAIL | The board has 18 rows (Type x State x Light/Dark) and all 18 have a story. Three stories have no recorded row: IconLeft, IconRight, IconBoth (the Show Icon Left / Show Icon Right properties are in Figma per the intent file, and QA never tested them) and Focus (a code-only state, kept by designer decision; the board already records such cases as "(no Figma cell)" rows on Input Field/Password and Status Banner). Coverage gap, not a story gap. | qa: add rows for Show Icon Left, Show Icon Right, both, and Focus (as "no Figma cell") |
| R6 Intent | pass | Seven fields present and non-empty; a11y is specific (native <button>, real disabled attribute, :focus-visible ring with its tokens); 25 required_tokens all resolve in tokens.css; variant_intent covers Type (3), State (3) and both Show Icon toggles and nothing that does not exist; no pair overlap. |  |
| R7 Version | pass | Version: no earlier tag exists (git tag is empty; package.json reads 0.1.0 and is private), so everything is new and the first version is 0.1.0. Forced by: the new export `Button` and its public props type, state, label, showIconLeft, showIconRight, iconLeft, iconRight, htmlType, onClick, plus the three Type variants. A human chooses and tags. |  |

Ruled, not findings (Ruling 1, listed once so the exception stays visible): none
Warnings (not blockers): All 6 dont_use_when entries have no alternative ("Do not place two Primary buttons side by side", "Do not use Ghost for a destructive or irreversible action", ...). The library has no destructive-action button to point to, so this is a design gap rather than an omission.
Staleness: the row's Last Modified (2026-10-05T08:29:02Z) is later than commit 05c4093 (2026-10-05T08:23:10Z). Nothing landed on main after 05c4093; the later timestamp is the human clearing the Release Review and Release Verdict cells. This is not a component change. Writing the two cells below will move Last Modified again, so the check will always read later than the reviewed commit; see "No ruling".

Choosing test (batch, run once for all six intent files; jobs written so it can be repeated):

| # | Job | Pick | Line that decided it (verbatim, checked mechanically against the file) | Confidence |
|---|---|---|---|---|
| 1 | A guest has been emailed a six-digit code and must type it in to finish signing in. | PinCodeCell | PinCodeCell.use_when: "Use it for one digit of a code, such as a sign-in or verification code." and PinCodeCell.dont_use_when: "Do not use one cell for a whole code. A code is a row of cells." | high |
| 2 | After a card payment fails, tell the guest what went wrong, above the Retry button, outside any field. | StatusBanner | StatusBanner.use_when: "Use it for one status that sits outside a field, such as a failed sign-in or a booking hold." and "Use Error when something failed and they have to act. Use Info for neutral information." | high |
| 3 | Let a guest choose exactly one of three room types. | none | CheckBox.dont_use_when: "Do not use it for mutually exclusive options. Use a radio." (names a radio; no radio intent file exists in the batch) | high that nothing fits |

Hedges: none. Job 1 runner-up was InputField ("Use it when a person must enter one piece of information, such as an email or a check-in date."); rejected because that line names neither a code nor a verification step, while PinCodeCell's names both. Job 3 is a job the library does not cover and was answered "none", which is the pass.
Limitation: the reader was the reviewer, not a context-isolated reader. The three jobs were fixed and the intent files read before any source, but the reviewer had also seen the production Storybook. Treat the result as a first reading and repeat it with a clean reader if the verdict hangs on it.

Version: no earlier tag exists (git tag is empty; package.json reads 0.1.0 and is private), so everything is new and the first version is 0.1.0. Forced by: the new export `Button` and its public props type, state, label, showIconLeft, showIconRight, iconLeft, iconRight, htmlType, onClick, plus the three Type variants. A human chooses and tags.

No ruling in the skill for:
- Button's variant prop is called `type` (with `htmlType` carrying the DOM attribute) while InputField calls the same idea `variant`. R3 as written asks about exports, not prop names, so this is not counted as a failure. It is public surface and renaming it after publish is a MAJOR bump (VERSIONING.md), so the human should decide before 0.1.0. The reviewer agent file's own sample output treats exactly this as a surface block; the skill does not.
- Last Modified is a lastModifiedTime over the whole row, so clearing or writing the two reviewer cells always makes it later than the reviewed commit; the staleness check cannot tell a component change from a cell edit.
- The skill says the report is linked "at the pinned commit's SHA", but the report cannot exist at the pinned commit. It is linked at the SHA of the commit that adds it, and names the pinned commit above.
