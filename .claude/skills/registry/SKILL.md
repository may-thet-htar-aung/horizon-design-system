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
| `Semantic Tokens` | text | **token-runner** | The token layer the component consumes. |
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
| `[Production] Test Records` | text | **Nobody — quarantined** | See D8. Do not write it. |

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
| 4 | `Astro Link` set **and** `Release Review` set **and** `Release Verdict` = `Cleared` | **Released** |
| 5 | `Production Storybook` set | **Completed** |
| 6 | `Staging Testing Results Summary` is not empty | **To be deployed** |
| 7 | `Staging Storybook` set | **Ready for Testing** |
| 8 | `Figma` set **and** `Design` = `Done` | **To-do** |
| 9 | none of the above | blank |

Gates 1 and 3 do a case-sensitive substring match on `re-test`, which is why `Fixed (To re-test)`
matters spelled exactly that way — see D6.

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

## The one column two agents share

`Testing Results` belongs to qa — every value, on every row, is qa's to write, with a single
documented exception: **the engineer may set it to `Fixed (To re-test)`, and to no other value,
only on rows already marked `Failed`, and only on rows it has actually repaired.** It may never
write `Passed`. Only qa writes `Passed`.

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

**D4 — `Staging Passed Count` and `Total Staging Tests` look identical in the schema.**
Both are `count` fields over `[Staging] Test Records` with no distinguishing filter exposed by the
API. If `Staging Passed Count` carries no filter, `Synchronization %` is `count / count` and reads
**100% on every row, always** — including rows where everything failed. Don't trust it alone until
someone confirms the filter in the Airtable UI.

**D5 — Gate 6's description is looser than the formula.**
The description says "any staging test rows exist → To be deployed." The formula checks the
*results summary*, not row existence. A component with rows whose `Testing Results` are all blank
falls through to gate 7 and reads `Ready for Testing`, not `To be deployed`.

**D6 — The spelling `re-test` is load-bearing and undocumented as such.**
Gates 1 and 3 do a case-sensitive `FIND` for lowercase `re-test`. The choice is `Fixed (To re-test)`.
Spelling it `Fixed (Re-test)` — capital R, as the FigJam pipeline board does — silently breaks both
gates. No error; the component simply stops reaching `Fixing` or `Fixed`.

**D7 — Two rollup aggregations are unverifiable from the API.**
Neither `Staging Testing Results Summary` nor `Staging Passed Tests` exposes its aggregation
expression through the schema endpoint. Gates 1, 2, 3 and 6 all depend on the first one.

**D8 — `[Production] Test Records` is a text field pretending to be a link.**
`[Staging] Test Records` is a real link; `[Production] Test Records` is plain text, undescribed, and
there's no production testing table for it to point at. Quarantined: no agent writes it.

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
