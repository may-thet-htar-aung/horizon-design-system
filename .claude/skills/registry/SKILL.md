---
name: registry
description: The Airtable registry contract for Horizon Stays — every table, every column, and the one agent allowed to write each. Read this before any agent reads or writes Airtable, and whenever you need the Development formula's precedence order or the ID of a base or table.
---

# Registry

The Airtable base is the spine of this design system. An agent doesn't move work forward by saying
so — it moves work forward by leaving evidence in a cell. This file is the contract for that base:
where it is, who may write each column, how the derived status is computed, and where the base's
real behavior has drifted from what it claims about itself.

## Where it is

**Never hardcode a base or table ID in an agent, a skill, or a script.** They live in
`.claude/registry.local.json`, which is gitignored:

```bash
cat .claude/registry.local.json
```

It holds `baseId` and a `tables` map keyed `components`, `stagingTesting`, `dsFeedback`,
`githubCommits`, and `oneOffComponents`. If the file is missing, copy
`.claude/registry.local.json.example`, use `list_bases` and `list_tables_for_base` to fill it in,
and ask a human rather than guessing an ID or working against a base you found by searching.

Column names are stable and written out in full below — pass those by name, always.

## Ownership

Exactly one agent owns each column. Owning it means you're the only one that writes it; everyone
else treats it as read-only. **Derived** columns are computed by Airtable itself — nobody writes
them, ever. **Human** columns are a person's — an agent may read one and must never nudge it along.
**Nobody** means the column exists and has no current writer; see the discrepancy attached to it.

### Table: `components`

| Column | Type | Owner | Notes |
|---|---|---|---|
| `Components` | text (primary) | **Human** | The component's name. Seeds the row. |
| `Category` | select | **Human** | ATOMS · MOLECULES · ORGANISMS · TEMPLATES · UI |
| `Figma` | url | **Human** (designer) | Feeds Development gate 8. |
| `Design` | select | **Human** (designer) | To-do · In progress · In testing · Done · To be fixed. Only `Done` is read by the formula. Blank means design isn't signed off. |
| `Staging Storybook` | url | **engineer** | The Vercel **preview** for the component's open PR into `staging` — not a merged-staging deploy. Written only after the deployed story has been opened and seen to render, and rewritten with a new preview on every repair pass. |
| `Commit` | url | **engineer** | The commit the staging build came from. |
| `Semantic Tokens` | — | **DOES NOT EXIST** | Documented here historically; a live schema read on 2026-10-04 does not return it. See D16. |
| `GitHub Commits` | link → `githubCommits` | **Nobody** | See D12. |
| `Composes` | link → `components` | **Nobody** | The components this one imports. See D12. |
| `Composed Into` | link → `components` | **Derived** | Reverse of `Composes`. See D9 — Airtable allows a write here; don't. |
| `[Staging] Test Records` | link → `stagingTesting` | **qa** | Populated as a side effect of qa linking `Composed In` from the other side. |
| `Production Storybook` | url | **devops** | Feeds Development gate 5. |
| `Astro Link` | url | **devops** | Deep-linked docs page. Feeds Development gate 4. |
| `Release Review` | url | **reviewer** | The committed report **at the commit it reviewed**, never a branch URL. Written with `Release Verdict` or not at all. |
| `Release Verdict` | select | **reviewer** | Cleared · Blocked. Empty means not reviewed. Feeds Development gate 4. |
| `Development` | formula | **Nobody** | See below. No agent may write it, by any tool, ever. |
| `Synchronization %` | formula | **Derived** | See D4 — do not trust it alone. |
| `Staging Testing Results Summary` | rollup | **Derived** | The only input to Development gates 1, 2, 3 and 6. |
| `Total Staging Tests` | count | **Derived** | |
| `Staging Passed Count` | count | **Derived** | |
| `Staging Passed Tests` | rollup | **Derived** | See D3 — feeds nothing, despite its description. |
| `Last Modified` | lastModifiedTime | **Derived** | |
| `[Production] Test Records` | — | **DOES NOT EXIST** | Removed from the base; see D8 and D16. |

### Table: `stagingTesting`

One record per variant / size / state / context. **qa owns this entire table** — the only agent
that creates rows here or sets a verdict, with one narrow exception below.

| Column | Type | Owner |
|---|---|---|
| `Component/Sub Component` | text (primary) | **qa** |
| `Testing Results` | select | **qa** — Passed · Failed · `Fixed (To re-test)`. See "The shared column" below. |
| `Composed In` | link → `components` | **qa** |
| `Variants` | long text | **qa** |
| `Size` | multi-select | **qa** — sm · md · lg · xl · xs · comfort · compact · null |
| `State` | multi-select | **qa** — draft · pending · upcoming · completed · rejected · cancelled · hovered · idle · focus · selected · isCurrent · error · disabled · loading · filled |
| `Context` | text | **qa** |
| `Attachment` | attachments | **qa** |
| `Expected Results` | long text | **qa** |
| `Suggestion for Improvement` | long text | **qa** |

### Table: `githubCommits`

**Currently unowned** — see D12. No agent writes any column here.

| Column | Type | Owner |
|---|---|---|
| `Commit Hash` | text (primary) | **Nobody** |
| `Message` | text | **Nobody** |
| `Author` | text | **Nobody** |
| `Date Committed` | dateTime (UTC, ISO) | **Nobody** |
| `Link to Components` | link → `components` | **Nobody** |
| `Files Changed` | long text | **Nobody** |
| `Commit URL` | url | **Nobody** |
| `Commit Type` | select | **Nobody** — Feature · Bugfix · Documentation · Chore · Refactor · Other |

### Table: `dsFeedback`

**Human owns this entire table.** Agents read it to find work; no agent writes any column,
including `Status` (Completed · In Progress · Not Started).

| Column | Type | Owner |
|---|---|---|
| `Feedback` | long text (primary) | **Human** |
| `Components` | text | **Human** |
| `Submitted By` | text | **Human** |
| `Step to Reproduce` | long text | **Human** |
| `Suggestion` | text | **Human** |
| `Urgency` | text | **Human** |
| `Attachment` | url | **Human** |
| `Status` | select | **Human** |

### Table: `oneOffComponents`

**Human owns this entire table.** It sits outside the evidence loop — nothing here feeds
`Development`.

| Column | Type | Owner |
|---|---|---|
| `Components` | text (primary) | **Human** |
| `Project` | text | **Human** |
| `Usage quantity` | number | **Human** |
| `Git Repo` | text | **Human** |
| `Figma` | url | **Human** |

## The `Development` formula

**No agent may write `Development`. Not by any tool, not by any automation, not ever.** It's a
formula field — Airtable rejects the write, and an agent that tries has misread the system. To
change what it says, change the evidence underneath it.

It's a first-match-wins ladder, evaluated in this order:

| # | Condition | Result |
|---|---|---|
| 1 | `Staging Testing Results Summary` contains **both** `Failed` and `re-test` | **Fixing** |
| 2 | `Staging Testing Results Summary` contains `Failed` | **To be fixed** |
| 3 | `Staging Testing Results Summary` contains `re-test` | **Fixed** |
| **3a** | `Design` = `To be fixed` | **To be fixed** |
| 4 | `Astro Link` set **and** `Release Review` set **and** `Release Verdict` = `Cleared` | **Released** |
| 5 | `Production Storybook` set | **Completed** |
| 6 | `Staging Testing Results Summary` is not empty | **To be deployed** |
| 7 | `Staging Storybook` set | **Ready for Testing** |
| 8 | `Figma` set **and** `Design` = `Done` | **To-do** |
| 9 | none of the above | blank |

Gates 1 and 3 do a case-sensitive substring match on `re-test`, which is why `Fixed (To re-test)`
matters spelled exactly that way — see D6.

**Why the designer gate is numbered 3a rather than 4.** It was inserted on 2026-10-04 between the
row-state gates and `Released`. Renumbering 4–9 would have invalidated roughly forty references
across this file and the agent files — and worse, `devops.md` uses "gate 1" and "gate 2" for the
two **human merge gates** (the component PR into `staging`, and `staging` into `main`), which
are a different thing entirely. The letter keeps every existing reference correct. Airtable does not
see these numbers; only the order of the nested `IF`s matters, and 3a sits fourth in the formula.

### Gate 4 is currently unreachable, and `Completed` is the working finish line

**As of 2026-09-12, the reviewer stage is deferred and no row can reach `Released`.** Gate 4
requires `Release Verdict` = `Cleared`; only reviewer writes that cell; and reviewer cannot run
until `.claude/skills/release-review/SKILL.md` exists, which it does not (D10). The gate is
therefore unsatisfiable, and **`Completed` is the terminal state of this pipeline in practice**.

This is a deliberate parking, not a defect. Treat `Completed` as finished work. Do not describe a
component as "not yet `Released`" as though something were pending on it — nothing is pending;
the stage that would move it has no definition yet. When the release-review skill is written, gate
4 becomes reachable again with no other change to this contract.

### Two consequences that will surprise someone

**A component can be published and broken at the same time, and the formula will say so.** Gates 1
through 3 sit above gate 4 in the ladder. A component that's live in production, with a cleared
review and a docs page, still reads `To be fixed` the instant one re-test fails — the ladder never
even reaches gate 4 to check whether it's `Released`. That's correct, not a bug: the fact that it's
also published is exactly what makes the failure urgent, and nothing downstream should read
`Released` on a component currently failing its own tests.

**`Released` cannot be reached by shipping alone — it needs three separate agents to have each left
their mark, all at once.** `Astro Link` says devops deployed the docs. `Release Review` and
`Release Verdict = Cleared` say reviewer checked it and approved. Gate 4 requires all three in the
same evaluation; a component sitting at `Completed` with a deploy done and a review still pending is
one cell short of `Released`, not "basically released."

## The Mai Crew board, and where it disagrees with this contract

The FigJam board **"Mai Crew — Evidence Loop"**
(`figma.com/board/9g3bh4xMcMAUAoNjTl8dDU/Mai-Crew`) is the intended operating model for this
project. Its governing rule — **"Nothing moves without a record in Airtable"** — is the same rule
this file enforces, and its lanes map onto the crew's agents.

Where the two disagree, **this contract wins and the board is stale**, for the reason the `Never`
list already gives: the formula and the observed behavior are what actually run. The board is a
picture of the system, not the system.

**The status vocabularies are not the same.**

| Board (Jira Status) | `Development` | |
|---|---|---|
| To Do | `To-do` | same stage |
| Ready for QA | `Ready for Testing` | **different name, same stage** |
| Fixed · Fixing · To be fixed · To be deployed | identical | same |
| Done | `Completed` | **different name, same stage** |
| Closed | — | no `Development` equivalent; it is the pm audit's conclusion |
| — | `Released` | not on the board at all |

Read a board name as its `Development` equivalent. **Never write a board name into a cell** — the
select options are the `Development` vocabulary, and `Ready for QA` and `Done` are not among them.

**The board ends at Done, and that corroborates the parking of gate 4.** It has no `Released` stage
and no reviewer lane. `Completed` being the working finish line is therefore not only a consequence
of D10 — it is what the intended model describes.

## The one column two agents share

`Testing Results` belongs to qa — every value, on every row, is qa's to write, with a single
documented exception: **the engineer may set it to `Fixed (To re-test)`, and to no other value,
only on rows it has actually repaired or re-examined, and only in one of two cases:**

1. **the row already reads `Failed`** — the ordinary repair loop; or
2. **the row reads `Passed` and `Design` reads `To be fixed`** — a designer changed the node under
   a component that had already passed, so the verdict is stale rather than wrong: it describes a
   node that no longer exists.

The second case exists because a rebinding leaves the token export byte-clean, so a passing row can
describe a design that is gone (D15). Without it the designer-drift path dead-ends: the engineer
repairs the code and has no way to tell qa to look again.

It may never write `Passed`. Only qa writes `Passed`. And it may not mark rows the design change
did not touch — a rebinding on one layer does not make every row stale.

That one exception is what lets the repair loop close. Without it, a fix would have no way to tell
qa "look again" except a message — and this contract runs on cells, not messages. It is also the
contract's only break in single ownership; see D6 for the spelling trap that silently strands
components if the value is written wrong.

## Never

These apply to every agent that touches the registry, on top of whatever its own agent file adds:

- Never write `Development`. It's a formula; change the evidence, not the result.
- Never hardcode a base or table ID. Resolve every one through `.claude/registry.local.json`.
- Never write a column you don't own, in any table — read the ownership tables above, not what
  "seems like it should be fine to touch."
- Never write `Composed Into` directly, even though Airtable's API allows it. Write `Composes`; the
  reverse link maintains itself. See D9.
- Never write a URL — any URL, in any column — before you've opened it and confirmed what's on the
  other end. A cell is evidence, not intention; a link nobody has looked at is a lie waiting to be
  believed by the next agent that reads it.
- Never write `Fixed (To re-test)` unless you're the engineer, the row is already `Failed`, and you
  actually repaired it. Never write `Passed` unless you're qa.
- Never treat a **Derived** column as writable because the API doesn't stop you. `Synchronization %`
  and the rollups are Airtable's to compute; a write that succeeds against the API is still a
  violation of this contract.
- Never nudge a **Human** column along, even when the next step seems obvious. A blank `Design` or
  an empty `Release Verdict` is a true blank, not a task for an agent to finish on someone's behalf.
- Never treat a status read from a cached or partial view as current. Read the live cell before you
  act on it.

## Flagged discrepancies

These are places where a column's description in Airtable and the base's actual behavior disagree.
They're recorded, not resolved — fixing them changes what the pipeline does, so a human decides.
Until then, **trust the formula and the observed behavior, not the description.**

**D1 — `Release Verdict` says it isn't wired into `Development`. It is.**
Its description reads "not wired into Development"; gate 4 tests `Release Verdict = "Cleared"`
directly. High impact — it decides whether `Released` is reachable at all.

**D2 — `Release Review` claims the same thing, and is also wired in.**
Same contradiction as D1, same field group: gate 4 requires it set.

**D3 — `Staging Passed Tests` says it feeds `Synchronization %`. It doesn't.**
The `Synchronization %` formula references only `Staging Passed Count` and `Total Staging Tests`.
`Staging Passed Tests` feeds nothing.

**D4 — RESOLVED 2026-10-04. `Staging Passed Count` is filtered; `Synchronization %` is a real signal.**
The two `count` fields look identical through the API because **the schema endpoint does not
expose a count field's filter at all** — not because no filter exists. Observed directly the first
time a component failed: Input Field/Password read `Total Staging Tests` **11**,
`Staging Passed Count` **0**, `Synchronization %` **0%**. A `count / count` field could not have
produced that.

**The reasoning that made this entry wrong is worth keeping, because it is easy to repeat:**
absent configuration in a schema response was read as absent behavior in the base. Every component
until that day had passed 100% of its rows, so the two readings were indistinguishable and the
wrong one went unchallenged through several agents.

Read the rows anyway — they remain the authoritative check, and a percentage can only ever
summarise them. But do not repeat the claim that this field carries no information.

**D5 — Gate 6's description is looser than the formula.**
The description says "any staging test rows exist → To be deployed." The formula checks the
*results summary*, not row existence. A component with rows whose `Testing Results` are all blank
falls through to gate 7 and reads `Ready for Testing`, not `To be deployed`.

**D6 — The spelling `re-test` is load-bearing and undocumented as such.**
Gates 1 and 3 do a case-sensitive `FIND` for lowercase `re-test`. The choice is `Fixed (To re-test)`.
Spelling it `Fixed (Re-test)` — capital R — silently breaks both gates. No error; the component
simply stops reaching `Fixing` or `Fixed`.

*Corrected 2026-10-02:* this entry used to say the Mai Crew board spells it with a capital R. It
does not — the board reads `Fixed (To re-test)` correctly, on both conditional connectors and its
registry node. The trap is real; the board is not an instance of it.

**D7 — Two rollup aggregations are unverifiable from the API.**
Neither `Staging Testing Results Summary` nor `Staging Passed Tests` exposes its aggregation
expression through the schema endpoint. Gates 1, 2, 3 and 6 all depend on the first one.

**D8 — NO LONGER REPRODUCES 2026-10-04. The field is gone from the base.**
This entry quarantined `[Production] Test Records` as a text field pretending to be a link. A live
schema read of `components` no longer returns it at all, so there is nothing left to quarantine.
Kept as a record that it was removed rather than deleted outright, so a future reader who finds the
field in an old view knows it was retired deliberately.

**D9 — `Composed Into` says "nobody writes this directly." Airtable disagrees.**
It's a symmetric link field; Airtable maintains it automatically and also accepts a direct write
from either side. The description states a policy the base doesn't enforce, so this file enforces
it instead: write `Composes`, never `Composed Into`.

**D10 — The base documents a cast that took a while to arrive, and one member still can't run.**
Field descriptions name a Release agent and a Reviewer agent, and cite
`.claude/skills/release-review/SKILL.md` for the seven release gates. That skill file still doesn't
exist. `reviewer` exists as an agent now, but cannot run its review until that skill is written —
see `reviewer.md`, which stops and says so rather than inventing the gates.

As of 2026-09-12 this was accepted rather than fixed: the reviewer stage is **deferred**, gate 4 is
unreachable, and `Completed` is the working finish line. See "Gate 4 is currently unreachable"
above. Writing the skill is what un-defers it; nothing else in this contract needs to change.

**D11 — `Development`'s blank branch and its default choice disagree.**
Gate 9 returns an empty string, but the field's own single-select option set carries `To-do` as its
default. A row with zero evidence may render as blank or as `To-do` depending on where you read it —
cosmetic, but it makes "has this even started" ambiguous in views and rollups.

**D12 — `Composes` and the entire `githubCommits` table are granted to nobody, on purpose.**
Engineer used to own both. As of 2026-09-12 its registry writes were narrowed to exactly three cells
— `components.Commit`, `components.Staging Storybook`, and the `Fixed (To re-test)` exception in
`stagingTesting` — and nothing picked up `Composes` or `githubCommits` in its place. Both columns
still exist and will sit empty until a human assigns them or removes them. Treat any value you find
in either as stale, not as evidence of who owns them now.

**D13 — qa wakes on `Fixing`, alongside the engineer.**
As of 2026-09-12, qa's wake list is `Ready for Testing`, `Fixed`, **and** `Fixing` — added on top of
the engineer's own `Fixing` wake, not instead of it. `Fixing` means some rows are still `Failed` and
the repair pass isn't finished. Both agents may be acting on the same component at once: the
engineer finishing the repair, qa re-testing whatever's already marked `Fixed (To re-test)`. This was
confirmed deliberately, twice — but it means qa can re-test a row before the engineer has reached it,
and a row still reading `Failed` under `Fixing` isn't qa's to touch.

**D16 — This file documented two columns the base does not have.**
A live schema read of `components` on 2026-10-04 returns neither `Semantic Tokens` nor
`[Production] Test Records`. Both are now marked **DOES NOT EXIST** in the ownership table above
rather than silently deleted, so that a reader who meets either name in an old view, an old report or
an archived row knows what became of it.

The ownership table is otherwise accurate against the live schema as of that date. The practical
lesson is the same one D4 taught: **this contract is a description of the base, and the base can move
underneath it.** A column documented here is not evidence the column exists — read the schema when it
matters.

**D14 — The board describes two mechanisms that don't exist, and omits two agents that do.**
Three gaps between the Mai Crew board and this base, none of them resolved:
- **Jira is wired to nothing.** The board makes a Jira status the thing that provokes the next actor
  ("Dashed line = the Jira status provokes the next actor"). Here the `Development` formula does
  that job and nothing touches Jira. Either wire it, or drop the column from the board.
- **There is no `Brief` column.** The board's Client lane writes `Components / Brief` from a prompt
  and acceptance criteria. `components` has no such column, so the Client lane is unimplemented and
  the loop in practice starts at the designer. This is the one place the board is ahead of this
  contract rather than behind it.
- **`reviewer` and `token-runner` are not on the board.** Both exist as agent files. The board's
  cast is Client, Designer, Developer, QA, DevOps, PM.

**D15 — RESOLVED 2026-10-04. A design change to a finished component now wakes the engineer.**
**The problem, as it stood.** The ladder read `Design` only at gate 8, and only for the value
`Done`. The column also offered `To be fixed`, which fed nothing at all: setting it changed no
status and woke no agent. A component sitting at `Completed` whose Figma node was then rebound
stayed at `Completed`, and the loop had no arrow back.

Observed 2026-10-02 on Button: the Outline fills were rebound in Figma — `64:53` gained
`color/bg/base`, `64:59` moved to `color/bg/primary/Light`. Both tokens already existed, so **no
token value changed and the export diff was byte-clean**; nine `Passed` rows stayed `Passed`; and a
component that was wrong in production sat at `Completed` until a human deleted its registry row by
hand to force a rebuild. A clean token diff never proves a component is still correct.

**The fix was applied as gate 3a** (see the ladder above): `Design` = `To be fixed` →
`To be fixed`. A designer now sends a finished component back with one cell. It sits below the
row-state gates and above `Released`.

**Two consequences that follow from where the gate sits, and both matter:**

**Gate 3 outranks gate 3a.** Once the engineer marks rows `Fixed (To re-test)`, the component reads
`Fixed` and qa re-tests, even though `Design` still says `To be fixed`. Row state beats the
design flag, which is what lets the cycle finish — had the design flag been placed higher, it would
have masked the re-test and the loop would dead-end.

**Only a designer clears the flag.** `Design` is a **Human** column. After qa passes, gate 3a fires
again and the engineer wakes a second time — correctly finding nothing to repair and stopping. To
avoid that wasted pass, **the designer should set `Design` back to `Done` once the engineer has
registered the new build**, not after qa finishes. The ladder then falls through gate 3 to `Fixed`,
qa runs, and the component lands on `Completed` cleanly.

The pm sweep's fourth contradiction shape still runs. It catches drift the designer has not yet
flagged — the gate only fires once someone sets the cell.
