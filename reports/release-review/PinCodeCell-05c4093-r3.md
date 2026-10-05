# Release review · PinCodeCell · 05c4093 (round 3)
Verdict: Blocked
Pinned commit: 05c4093a90e5324aea8ad31021bf3f34a546c06d (origin/main, unchanged since round 2: `git log 05c4093..origin/main` is empty)
Board row: Pin Code Cell (record recRl3u6J8uVXq1Tv). Development = Completed; Release Verdict and Release Review were empty when I started.
Read: production Storybook ✓ (https://horizon-design-system-htar1.vercel.app/index.json, read before any source)  docs page not staged (Astro Link empty, expected, not a finding)  intent file ✓ (unchanged)  source ✓ (last)
Gates 6/7 pass. This round re-checks R4 and re-confirms R1-R3 and R5-R7 only as far as nothing changed on main.

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass (carried from round 2) | Row reads Completed. Main has no commit after 05c4093, so the content comparison of the production stylesheet done in round 2 still describes the pinned commit. Not re-fetched. | |
| R2 Tokens | pass (carried) | No change on main. Ruled, not findings (Ruling 1): `--hz-pincode-width-unbound: 52px`, `--hz-pincode-radius-unbound: 6px`. | |
| R3 Surface | pass (carried) | `export { PinCodeCell } from './components/pinCode/PinCode.jsx';` is one line in src/index.js at origin/main. | |
| R4 Names | FAIL | Board `Components` cell now reads `Pin Code Cell`, which equals the symbol `PinCodeCell` under Ruling 2 (case style and separators ignored): the board part of the round 2 finding is resolved. Folder `pinCode`, class `hz-pincode-cell`, PinCodeCell.intent.json unchanged and not a different word. Still failing: the published Storybook title is `Components/Pin Code` (src/components/pinCode/PinCode.stories.jsx line 18; every story id in production is `components-pin-code--*`). It is the name a reader sees in the sidebar, and `Pin Code` is a different word from `PinCodeCell` (it drops `Cell`), not a case or separator variant. See "Decision on the story title". | engineer: change the story `title` to `Components/Pin Code Cell` |
| R5 States | pass (carried) | 10 board rows (5 states x Light/Dark); stories Default, Hovered, Typed, Error, Disabled, All Variants, Interactive. Production index confirms all seven under `components-pin-code`. | |
| R6 Intent | pass (carried) | Intent file untouched on main. | |
| R7 Version | pass (carried) | No earlier tag, first version 0.1.0. Forced by the new export `PinCodeCell` and its public props state, value, label, onChange. | |

Decision on the story title (what I decided and why):
- Ruling 2 rules on the exported symbol and the board row. It does not mention story titles, and the skill's R4 list of five names does not list the Storybook title either. So there is no ruling that clears it.
- Ruling 3 is the only text that touches titles, and it says "Storybook titles that do not match the symbol are still an R4 finding for the engineer". That is the nearest authority, so I applied it. R4's purpose is that the public name is one word everywhere, and the title is the first name a reader of the published page meets.
- This does not ask the engineer to rename `PinCodeCell` (Ruling 2 forbids that); only the title string, one line. Changing it changes the story ids and the production URLs `components-pin-code--*`, so devops redeploys afterwards and links on the board row that point at `components-pin-code--all-variants` (Production Storybook, staging link) need updating by their owners.
- If the designer rules that story titles are outside R4, this row is Cleared on the evidence above with no other change. That ruling would be a one-line addition to Rulings.

Ruled, not findings (Ruling 1, listed once so the exception stays visible): `52px`, `6px`
Warnings (not blockers): all 5 dont_use_when entries have no alternative; "Do not use it for a name, email, or password" does not name InputField or InputFieldPassword (doc-generator, unchanged).
Staleness: row Last Modified is 2026-10-05T09:00:19Z, later than 05c4093 (2026-10-05T08:23:10Z). Nothing landed on main after 05c4093. The later time is the human renaming the board cell and clearing the two reviewer cells, and writing the two cells below will move it again. Not a component change.
Choosing test (batch): not re-run. The six intent files and the jobs are unchanged from round 2 (PinCodeCell picked for the six-digit sign-in code, high confidence; StatusBanner for the failed-payment message; none for one-of-three room types), and the result stands as recorded in PinCodeCell-05c4093.md.
Version: no earlier tag, first version 0.1.0. Forced by: the new export `PinCodeCell`. Renaming it later is a MAJOR bump.
