# Registry audit — Horizon Stays Design System

Swept 2026-10-02 by pm. Base `Horizon DS - Htar`, all five tables read in full, unfiltered.
Row counts audited: `components` 7/7 · `stagingTesting` 19/19 · `githubCommits` 0/0 ·
`dsFeedback` 1/1 · `oneOffComponents` 0/0.

This file is overwritten every sweep. pm writes nothing to the registry and nothing to
`.claude/skills/registry/SKILL.md`; every finding below is addressed to the owner the contract
names, and none of it has been fixed.

---

## 1 · What changed since last sweep

**There was no last sweep.** `reports/registry-audit.md` did not exist before this run, so there is
no diff to report and nothing was carried forward as still-true. Every row, link, status and
binding below was established from scratch in this sweep.

This is also the first sweep to run the fourth contradiction shape (a finished component drifted
from its design) and the first to check D14 and D15. What that check found is in section 4.

---

## 2 · Counts, with the rows behind each

`Development` across all 7 `components` rows:

| `Development` | Count | Rows |
|---|---|---|
| `To be deployed` | 3 | Button · Pin Code · Check Box |
| `To-do` | 4 | Input Field/Primary · Input Field/Password · Input Field/Mobile · Status Banner |
| `Ready for Testing` | 0 | — |
| `Fixed` | 0 | — |
| `Fixing` | 0 | — |
| `To be fixed` | 0 | — |
| `Completed` | 0 | — |
| `Released` | 0 | — |
| blank | 0 | — |

`stagingTesting`, 19 rows, by `Testing Results`:

| `Testing Results` | Count | Rows |
|---|---|---|
| `Passed` | 19 | Button — Primary/Default, Primary/Hover, Primary/Disabled, Outline/Default, Outline/Hover, Outline/Disabled, Ghost/Default, Ghost/Hover, Ghost/Disabled · Check Box — Default, Hovered, Checked, Unchecked, Disabled · Pin Code — Default, Hovered, Typed, Error, Disabled |
| `Failed` | 0 | — |
| `Fixed (To re-test)` | 0 | — |

Link cells holding a value, all opened this sweep (section 5):

| Column | Cells with a value | Rows |
|---|---|---|
| `Figma` | 7 | all 7 component rows |
| `Staging Storybook` | 3 | Button · Pin Code · Check Box |
| `Commit` | 3 | Button · Pin Code · Check Box |
| `Production Storybook` | 0 | — |
| `Astro Link` | 0 | — |
| `Release Review` | 0 | — |
| `Commit URL` (`githubCommits`) | 0 | table is empty |
| `Attachment` (`dsFeedback`) | 0 | its one row is blank |
| `Figma` (`oneOffComponents`) | 0 | table is empty |

Status traced to the cells the ladder actually reads — the live formula was pulled from the schema
and matches the contract's nine gates exactly, in order:

- **Button, Pin Code, Check Box → `To be deployed`.** Gate 6 (`Staging Testing Results Summary`
  not empty). Checked per D5 against the summary rather than row existence: each summary reads
  `["Passed"]`, containing neither `Failed` nor `re-test`, so gates 1–3 correctly do not fire.
  `Production Storybook` is empty on all three, so gate 5 does not fire. Correct.
- **The four `To-do` rows.** Gate 8. Confirmed from `Design` itself, not from the rendered value
  (D11): all four carry `Design` = `Done` and a populated `Figma`, so these are genuine gate-8
  `To-do`s, not the blank branch rendering as the formula's default option.

---

## 3 · What each owner is waiting on

### devops
- **Button, Pin Code, Check Box.** All three sit at `To be deployed` with 19/19 test rows `Passed`,
  no `Failed` and no `re-test`. Each has a resolving `Staging Storybook` and a real `Commit`.
  `Production Storybook` is the next cell (gate 5 → `Completed`), then `Astro Link`.
  All three commits are already merged into both `origin/staging` and `origin/main`.
- Per the contract, `Completed` is the working finish line; `Astro Link` alone cannot reach
  `Released` while gate 4 is parked (D10).

### engineer
- **Input Field/Primary, Input Field/Password, Input Field/Mobile, Status Banner.** Four rows at
  `To-do` — `Figma` set, `Design` = `Done`, nothing built. No folder in `src/components/`, no
  `Staging Storybook`, no `Commit`. These are the whole open build queue.
- **Three stale `Staging Storybook` cells** — see Contradiction C6.

### qa
- **Nothing is owed.** No row reads `Ready for Testing`, `Fixed` or `Fixing`, so qa's wake list
  (D13) is not triggered by anything currently in the base.
- Two findings on evidence qa already wrote: C4 (no attachments on any row) and C5 (Check Box
  rows citing a different build than the row's `Commit`).

### reviewer
- **Nothing, and nothing is pending on it.** Gate 4 is unreachable: `.claude/skills/release-review/SKILL.md`
  still does not exist (verified this sweep). `Release Review` and `Release Verdict` are empty on all
  7 rows, which is the correct reading, not a backlog. Zero rows can reach `Released`.

### token-runner
- **Nothing it can act on.** The contract grants it `Semantic Tokens` "on paper only". That column
  does not exist in the base at all — see C7.

### Human
- **C1** — `Synchronization %` is structurally meaningless; confirmed from the formula, not inferred.
- **C2** — `Staging Passed Tests` returns 0 on every row and its description is false in both halves.
- **C3** — a wholly blank `dsFeedback` row.
- **C7** — the contract documents two columns the base does not have (and D8 no longer reproduces).
- **C8** — PR #20 merged a non-staging branch straight into `main`, against `CLAUDE.md`.
- **D15's structural hole** — the formula gate that would let a designer send a finished component
  back. It changes precedence, so only a human may add it in the Airtable UI.

---

## 4 · Contradictions

### Shape 4 — a finished component drifted from its design

**Applicable rows: Button, Pin Code, Check Box** (`To be deployed`). No row reads `Completed` or
`Released`, so those three are the full set.

**Result: no live drift. Every variant matches.** Bindings were read **per variant node**, never on
the component set, over the Figma connection — 19 variant nodes in total — and compared against each
component's CSS. **Mode compared: Light on both sides.** `get_variable_defs` answered in Light on
every call (`color/bg/base` → `#ffffff`, `color/bg/primary/Light` → `#ebf3fe`), and
`build/css/tokens.css` defines only `:root` with the matching light values; no value is called wrong
on a single call.

| Node | Variant | Figma binding | Code | Verdict |
|---|---|---|---|---|
| 64:35 | Button Primary/Default | `bg/primary/idle`, `text/inverse` | same | match |
| 64:41 | Button Primary/Hover | `bg/primary/hovered`, `text/inverse` | same | match |
| 64:47 | Button Primary/Disabled | `bg/surfacePrimary`, `text/disabled on dark` | same | match |
| 64:53 | Button Outline/Default | `bg/base`, `border/brand/default`, `text/brand` | same | match |
| 64:59 | Button Outline/Hover | `bg/primary/Light`, `border/brand/bold` | same | match |
| 64:65 | Button Outline/Disabled | `bg/surfacePrimary`, `border/disabled` | same | match |
| 65:4 | Button Ghost/Default | no fill, no border, `text/brand` | same | match |
| 65:10 | Button Ghost/Hover | `bg/primary/Light`, `text/brand` | same | match |
| 65:16 | Button Ghost/Disabled | no fill, `text/disabled on dark` | same | match |
| 251:4 | Check Box Default | `bg/base`, `border/brand/Light` | same | match |
| 251:7 | Check Box Hovered | `bg/base`, `border/brand/bold` | same | match |
| 251:10 | Check Box Checked | `bg/base`, `border/brand/bold`, `icon/brand` | same | match |
| 251:13 | Check Box Unchecked | `bg/base`, `border/brand/Light` | same | match |
| 251:16 | Check Box Disabled | `bg/surfacePrimary`, `border/disabled` | same | match |
| 260:6559 | Pin Code Default | `bg/base`, `border/surfacePrimary` | same | match |
| 260:6561 | Pin Code Hovered | `bg/base`, `border/brand/bold` | same | match |
| 260:6563 | Pin Code Typed | `bg/base`, `border/brand/bold`, `text/primary`, Title/Large | same | match |
| 260:6565 | Pin Code Error | `bg/base`, `border/negative/bold`, `text/primary` | same | match |
| 260:6567 | Pin Code Disabled | `bg/surfacePrimary`, `border/disabled` | same | match |

**D15's recorded instance is closed, and the closure was verified rather than assumed.** The
contract records that Button's Outline fills were rebound in Figma — 64:53 gaining `color/bg/base`,
64:59 moving to `color/bg/primary/Light` — with a byte-clean export diff. Both rebindings are still
live in Figma. Commit `42907fd` ("Correct the Outline fill bindings to match nodes 64:53 and 64:59"),
which is exactly the commit Button's `Commit` cell names, carries the correction, and it is merged
into `origin/staging` and `origin/main`.

Because a clean token diff and 9 `Passed` rows are both worthless as proof here, the registered
build was opened and measured directly rather than trusted:

- `components-button--outline-default` renders `background-color: rgb(255,255,255)` =
  `color/bg/base`, inset ring `rgb(98,155,248)` = `color/border/brand/default`, under
  `data-theme="light"`.
- `components-button--outline-hover` renders `background-color: rgb(235,243,254)` =
  `color/bg/primary/Light`, inset ring `rgb(59,130,246)` = `color/border/brand/bold`.

Both read as computed values from the live `Staging Storybook` the Button row points at. They match
the current node bindings.

**One thing that will mislead the next reader of `src/`, and is not a defect.** The working tree is
on `component/pin-code` at `c574347`, which predates `42907fd`. The Button CSS in
`src/components/button/button.css` as checked out therefore still reads `/* No fill at rest — 64:53
binds none. */` and puts `color/bg/base` on hover — the pre-fix state, which does *not* match Figma.
Checked before reporting it as a regression: `c574347` is an ancestor of `origin/staging`, and this
branch has made no change to `button.css` relative to that merge base, so the branch is simply
behind and merging it could not revert the fix. Flagged so nobody reads the stale file and reopens a
closed finding. No owner, no action.

### Shape 1 — rows that contradict themselves

**C1 · `Synchronization %` is meaningless, and this is now confirmed from the formula, not suspected
(D4 upgraded).** Owner: **Human**.
`Staging Passed Count` (`fld88iBKmSezw6rzk`) and `Total Staging Tests` (`fldyYyEn5KfFGEuUu`) are both
`count` fields over `[Staging] Test Records` with **byte-identical config and no filter on either**.
`Synchronization %` is `ROUND((Staging Passed Count / Total Staging Tests) * 100, 2)`, i.e.
`count / count`. It reads **100% on every row with at least one test row, whatever those rows say** —
including a row where everything failed. Rows: Button 9/9 → `100%`, Pin Code 5/5 → `100%`,
Check Box 5/5 → `100%`. The three happen to be genuinely all-passing, so the number is accidentally
true today and would be identically `100%` if every row read `Failed`. The four `To-do` rows read
`0%` only because the formula special-cases a zero denominator. D4 is no longer unverifiable: the
filter is absent, not merely unexposed.

**C2 · `Staging Passed Tests` returns 0 on rows with 9 and 5 `Passed` records, and its description is
false twice over (D3).** Owner: **Human**.
Values found: Button 0 (9 `Passed`), Pin Code 0 (5 `Passed`), Check Box 0 (5 `Passed`) — 0 on all
seven rows. It is a rollup over the `Testing Results` single-select declared with a **number** result
type, so the aggregation yields 0 rather than a count. Its Airtable description reads "Counts only
test rows marked Passed. Feeds Synchronization %." Both halves are untrue: it counts nothing, and
`Synchronization %` references only `Staging Passed Count` and `Total Staging Tests`. Each of Button,
Pin Code and Check Box therefore carries two derived cells disagreeing about the same underlying
column — `Staging Passed Count` = 9/5/5 beside `Staging Passed Tests` = 0.

**C3 · A `dsFeedback` row with every cell empty.** Owner: **Human** (the contract gives Human the
entire table, including `Status`).
Record `recb2pPak23SYdDto`, created 2026-09-13. All eight columns blank — `Feedback` (the primary
field), `Components`, `Submitted By`, `Step to Reproduce`, `Suggestion`, `Urgency`, `Attachment`,
`Status`. It is the only row in the table, so the table's entire content is one blank record. No
agent may touch it; it needs filling or deleting by a person.

**C4 · All 19 `stagingTesting` rows read `Passed` with no `Attachment`, while the screenshots exist
on disk.** Owner: **qa**.
The `Attachment` column is empty on every one of the 19 rows. Meanwhile `reports/Button/`,
`reports/CheckBox/` and `reports/PinCode/` hold per-state image files (for Button:
`primary-default.jpg`, `primary-hover.jpg`, `primary-disabled.jpg`, `outline-default.jpg`,
`outline-hover.jpg`, `outline-disabled.jpg`, `ghost-default.jpg`, `ghost-hover.jpg`,
`ghost-disabled.jpg`, plus `figma-node-65-22.png`). So the evidence was captured and then not
attached to the rows it belongs to. This is the exact pairing the sweep procedure names — a `Passed`
verdict on a row carrying no screenshot. 19 rows, no exceptions.

**C5 · Three Check Box `Passed` rows name a different build than the row's `Commit` cell.**
Owner: **qa**.
Check Box's `Commit` is `6354701` and its `Staging Storybook` is the
`fix/check-box-resting-stroke` preview. Its five test rows split across two builds:

- `Check Box — State=Default` and `State=Unchecked` cite commit `6354701` — matching the cell.
- `Check Box — State=Hovered`, `State=Checked` and `State=Disabled` cite **commit `ef50824`**
  ("Add the Check Box atom from Figma node 251-19"), the build *before* the resting-stroke repair.

Both commits are real and `ef50824` is an ancestor of `6354701`, so nothing is fabricated and the
repair touched only the resting stroke — but three of the five `Passed` verdicts were formed against
a build the row no longer points at, and a reader taking the row at face value would believe all
five were tested on `6354701`. Worth re-stating or re-testing so the row's evidence names one build.

**C6 · All three `Staging Storybook` cells point at previews whose PRs are closed.**
Owner: **engineer**.
The contract defines the column as "the Vercel **preview** for the component's open PR into
`staging` — not a merged-staging deploy." `gh pr list --state open` returns **zero open PRs**. PRs
#19 (Check Box), #21 (Pin Code) and #22 (Button) are all merged, and #23 merged staging into main.
All three URLs still resolve 200 and still serve the right stories, so they are not dead — but by
the column's own definition they are now historical artifacts rather than the thing the column is
for. Not urgent; flagged so the staleness is a recorded decision rather than an oversight, since
devops is about to read these cells.

**C7 · The contract documents two `components` columns that do not exist in the base — and D8 no
longer reproduces.** Owner: **Human** (it is `registry/SKILL.md` that needs the decision, and pm
may not edit it).
The live schema for `components` has 22 fields. Two columns the contract's ownership table lists are
absent from it entirely:

- **`Semantic Tokens`** (text, owned by "token-runner — on paper only"). Not in the schema. The
  contract says "Reassign it or drop it — a human decides"; it appears to have been dropped from the
  base without the contract following.
- **`[Production] Test Records`** (the quarantined text field of **D8**). Not in the schema either.
  **D8 therefore no longer reproduces** — the field it quarantines is gone. Worth noticing as a
  discrepancy that has been fixed, rather than leaving a standing warning about a column nobody can
  reach.

**C8 · PR #20 merged a non-staging branch directly into `main`, against the project's git rule.**
Owner: **Human**.
`CLAUDE.md` states: "A component branch never merges into main. Main accepts PRs from staging only."
PR #20, "QA evidence: Check Box first staging test pass", has `headRefName` `qa/check-box-evidence`
and `baseRefName` **`main`**. It is already merged, so this is a record for a person to rule on, not
something to undo. By contrast PRs #18, #19, #21 and #22 all correctly target `staging`, and #23 is
the sanctioned `staging` → `main` PR. Noted without assigning it to an agent: pm did not establish
who opened it, and the rule it crosses is a human-owned project rule.

### Shape 2 — a test row linked to nothing

**None.** All 19 `stagingTesting` rows carry a `Composed In` link, and the three components'
`[Staging] Test Records` account for all 19 with none left over: Button 9 + Check Box 5 + Pin Code 5
= 19 = the table's full row count. No orphans, nothing invisible to the rollups.

### Shape 3 — the repo and the registry disagreeing

**No contradiction, but one asymmetry worth stating precisely.**

- Every folder in `src/components/` has a `components` row: `button` → Button, `checkBox` → Check Box,
  `pinCode` → Pin Code. No folder is invisible to the pipeline.
- Every row claiming a `Staging Storybook` has code behind it — the same three.
- Four rows have no folder: Input Field/Primary, Input Field/Password, Input Field/Mobile,
  Status Banner. All four are at `To-do` with no `Staging Storybook` and no `Commit`, so they
  describe work not yet started rather than something that does not exist. Not a contradiction —
  it is engineer's queue, already listed in section 3.

### D1–D15: what reproduced and what did not

| # | Reproduced? | Evidence from this sweep |
|---|---|---|
| D1 | **Yes** | `Release Verdict`'s description still reads "Deliberately not wired into Development"; the live formula tests `{fld2T74aO1z1bZJIJ} = "Cleared"` at gate 4. |
| D2 | **Yes** | `Release Review`'s description still reads "It does not feed Development"; gate 4 requires `{fldH6pgPqvGWVE4pU}` set. |
| D3 | **Yes** | `Synchronization %` references only `Staging Passed Count` and `Total Staging Tests`. `Staging Passed Tests` feeds nothing. See C2 — worse than recorded; it also returns 0. |
| D4 | **Yes, and upgraded from unverifiable to confirmed** | Both `count` configs are identical with no filter. See C1 — the "don't trust it alone" caveat can be stated as fact. |
| D5 | **Yes** | The `Development` description says "Any staging test rows exist → To be deployed"; the formula tests `{summary} != ""`. Checked on all three `To be deployed` rows. |
| D6 | **Yes, trap live; no row stranded** | Gates 1 and 3 use `FIND` (case-sensitive) for lowercase `re-test`. The `Testing Results` options are exactly `Passed` · `Failed` · `Fixed (To re-test)` — correctly spelled. No row currently carries that value, so nothing is stranded today. |
| D7 | **Partly** | Both rollups expose `recordLinkFieldId` and `fieldIdInLinkedTable` but **no aggregation expression** — confirmed unverifiable from the API for `Staging Testing Results Summary`. For `Staging Passed Tests` the declared number result type is enough to explain the 0 (C2). |
| D8 | **No — no longer reproduces** | `[Production] Test Records` is absent from the schema. See C7. |
| D9 | **Structurally yes; not tested** | `Composed Into` is a `multipleRecordLinks` (symmetric) field. pm did not attempt a write, by design. |
| D10 | **Yes** | `.claude/skills/release-review/SKILL.md` does not exist. `Astro Link`'s description still cites it and names Release and Reviewer agents. Gate 4 unreachable; 0 rows `Released`. |
| D11 | **Mechanism yes; no affected row** | Gate 9 returns `""` and the formula result's first option is literally `selFORMULADEFAULT` named `To-do`. But all 7 rows have `Figma` set and `Design` = `Done`, so every `To-do` here is a real gate-8 result. Could not exhibit an ambiguous row. |
| D12 | **Yes** | `Composes` empty on all 7 rows; `GitHub Commits` empty on all 7; `githubCommits` holds **0 records**. Both still unowned and still empty. |
| D13 | **Not reproducible this sweep** | No row reads `Fixing`, `Fixed` or `Ready for Testing`, so the overlapping wake could not be observed. Nothing to report; the hazard stands as recorded. |
| D14 | **Yes, on the two parts checkable from the base** | `components` has **no `Brief` column** (22 fields, none named Brief) → Client lane unimplemented, confirmed. **No Jira field anywhere** in any of the five tables → "Jira is wired to nothing", confirmed. The third part (reviewer and token-runner missing from the board) is a FigJam-board claim, not checkable against the base; not verified here. |
| D15 | **Rebind yes; drift closed; hole open** | 64:53 still binds `color/bg/base` and 64:59 still binds `color/bg/primary/Light` — both read live, per variant node. The code matches on `staging`/`main` and in the deployed build (measured). **But the registry recorded none of it:** Button's `Design` still reads `Done`, never `To be fixed`, and `Design` is read only at gate 8. The loop still has no arrow back, and the formula gate that would create one remains a human-only change. |

---

## 5 · Dead links

**None. Every link cell in the base was opened during this sweep, and all of them resolved.**

| Column | Row | Target | Result |
|---|---|---|---|
| `Figma` | Button | node 65-22 → variants 64:35, 64:41, 64:47, 64:53, 64:59, 64:65, 65:4, 65:10, 65:16 | all 9 resolved, bindings returned |
| `Figma` | Check Box | node 251-19 → variants 251:4, 251:7, 251:10, 251:13, 251:16 | all 5 resolved |
| `Figma` | Pin Code | node 260-6558 → variants 260:6559, 6561, 6563, 6565, 6567 | all 5 resolved |
| `Figma` | Input Field/Primary | node 220-50 | resolved, bindings returned |
| `Figma` | Input Field/Password | node 234-941 | resolved, bindings returned |
| `Figma` | Input Field/Mobile | node 227-44 | resolved, bindings returned |
| `Figma` | Status Banner | node 269-18 | resolved, bindings returned |
| `Staging Storybook` | Button | `horizon-design-system-bihx5cuzd-htar1.vercel.app` | HTTP 200; 13 Button stories present; Outline stories opened and measured |
| `Staging Storybook` | Pin Code | `horizon-design-system-git-component-pin-code-htar1.vercel.app` | HTTP 200; all 7 pin-code stories present |
| `Staging Storybook` | Check Box | `horizon-design-system-git-fix-check-box-resting-stroke-htar1.vercel.app` | HTTP 200; all 7 check-box stories present |
| `Commit` | Button | GitHub `42907fd1…` | HTTP 200; exists locally; "Correct the Outline fill bindings to match nodes 64:53 and 64:59" |
| `Commit` | Pin Code | GitHub `c574347b…` | HTTP 200; exists locally; "Add the Pin Code Cell atom from Figma node 260-6558" |
| `Commit` | Check Box | GitHub `6354701d…` | HTTP 200; exists locally; "Bind the Check Box resting stroke to color/border/brand/Light" |

Columns with nothing to open, stated so the absence is a checked fact and not a gap in this sweep:
`Production Storybook` (0 of 7), `Astro Link` (0 of 7), `Release Review` (0 of 7),
`githubCommits.Commit URL` (table empty), `dsFeedback.Attachment` (its one row blank),
`oneOffComponents.Figma` (table empty).

No link was carried over as good from a previous sweep — there was no previous sweep.

---

## Aside, outside the registry

`reports/Button$s.png` is an untracked file with an apparently mangled name sitting beside the
`reports/Button/` directory. Not registry evidence and not referenced by any cell; noted only
because a person may want to remove it. pm touched nothing in the working tree except this report.
