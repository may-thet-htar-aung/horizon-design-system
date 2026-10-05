# Release review · Button · 05c4093 · round 3
Verdict: Cleared
Pinned commit: 05c4093a90e5324aea8ad31021bf3f34a546c06d (main, merge of PR #60; `git log origin/main` re-checked at review time, nothing newer)
Board row(s): Button
Read: production Storybook ✓ (https://horizon-design-system-htar1.vercel.app, read before any source)  docs page not staged (Astro Link empty, expected, not a finding)  intent file ✓  source ✓ (last)
Gates 7/7 pass
Scope: round 2 (reports/release-review/Button-05c4093.md) blocked R5 only. This round re-checks R5 against the new QA rows and re-confirms the other six gates only as far as "nothing changed". The release-review skill on origin/main has no round-3 procedure; no gate was relaxed.

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed (formula, read live). Production URL returns 200. Production index.json serves all 14 Button stories (nine Type x State, focus, icon-left, icon-right, icon-both, all-variants). Main is still 05c4093 and the Button files are unchanged since round 2's byte-level stylesheet comparison against production, so that freshness result stands (no re-fetch of the stylesheet this round). | |
| R2 Tokens | pass | Unchanged: no source change since round 2 (zero raw hex/rgb()/hsl()/px outside var(--...)). | |
| R3 Surface | pass | `export { Button }` is one line in src/index.js; STATES/TYPES and defaultIcons are not reachable. Prop name `type`: see Ruling 4 note below, not a finding. | |
| R4 Names | pass | Unchanged: folder `button`, symbol `Button`, class `hz-button`, Button.intent.json, board `Button`, story title `Components/Button`. | |
| R5 States | pass | Round 2's four gaps are closed. Read live from stagingTesting: 26 rows linked to Button, all Passed (rollup reads Passed, 26/26). The 18 Type x State x Light/Dark rows are unchanged. The 8 new rows, all Passed, created 2026-10-05T09:05:54Z, each Context naming the production Storybook at main 05c4093: "Button — Icon Left / Default (Light)" and "(Dark)" (story components-button--icon-left); "Icon Right / Default" Light and Dark (components-button--icon-right); "Icon Both / Default" Light and Dark (components-button--icon-both); "Button — Focus (no Figma cell)" Light and Dark (components-button--focus). Every one of the 14 stories now has a recorded row, and every row has a story. Caveats recorded by QA, not gate failures: the Focus Tab test ran in a browser pane that scaled outline lengths by 0.8, so the 3px/2px lengths were read from the pinned story and the rule text, while rule, token and colour were confirmed by a real Tab press; and Show Icon x Disabled has no story and was checked by DOM state switch only. I did not write or edit any stagingTesting row. | |
| R6 Intent | pass | Unchanged: no intent file change since round 2 (seven fields, specific a11y, 25 required_tokens resolve, variant_intent covers Type, State and both Show Icon toggles). | |
| R7 Version | pass | No earlier tag exists (package.json reads 0.1.0, private), so everything is new and the first version is 0.1.0. Forced by the new export `Button` and its public props type, state, label, showIconLeft, showIconRight, iconLeft, iconRight, htmlType, onClick, plus the three Type variants. A human chooses and tags. | |

Ruled, not findings (Ruling 1): none
Ruling 4 note: Ruling 4 (prop names follow the Figma property name; Button `type` is correct) is NOT in the Rulings section of the skill on origin/main (Rulings 1 to 3 only) and is not yet on origin/staging either; it sits on origin/crew/release-review-ruling-4. Per the caller's instruction, Button's `type` prop is treated as the designer's explicit decision (ruled 2026-10-05) recorded here, not as an R3 finding. `htmlType` carries the DOM attribute and has no Figma property. Renaming either after publish is a MAJOR bump (VERSIONING.md).
Warnings (not blockers): all 6 dont_use_when entries have no alternative (the library has no destructive-action button to point to; a design gap, not an omission). Unchanged from round 2.
Staleness: the row's Last Modified (2026-10-05T09:06:18Z) is later than commit 05c4093 (2026-10-05T08:23:10Z). Main has no newer commit and the Button source is unchanged; the later timestamp comes from QA adding the 8 rows and the human clearing the review cells. Not a component change. Writing the two cells below will move Last Modified again.
Choosing test (batch): not re-run. Round 2's result (reports/release-review/Button-05c4093.md, six intent files, no hedges, one "none" answer) stands because no intent file changed between 05c4093 and 05c4093.
Limitation: this round was run by the reviewer who also saw the production Storybook index; the R5 evidence is QA's rows, read as written, not re-tested by me.
Version: first version 0.1.0 (no earlier tag) - forced by the new `Button` export and its public props and variants.
