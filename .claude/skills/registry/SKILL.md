---
name: registry
description: The Airtable registry contract for Horizon Stays — every table, every column, and the one agent allowed to write each. Read this before any agent reads or writes Airtable, and whenever you need the Development formula's precedence order or the ID of a base or table.
---

# 📋 Registry

The Airtable base is the spine of this design system. Nothing moves because an agent said so;
work moves because evidence landed in a cell. This skill is the contract for that base: what
exists, who may write it, and what is derived and therefore off-limits to everyone.

## Resolving IDs

**Never hardcode a base or table ID in an agent, a skill, or a script.** They live in
`.claude/registry.local.json`, which is gitignored. Read that file first:

```bash
cat .claude/registry.local.json
```

It gives you `baseId` and a `tables` map with the keys `components`, `stagingTesting`,
`dsFeedback`, `githubCommits`, and `oneOffComponents`.

If the file is missing, copy `.claude/registry.local.json.example` to
`.claude/registry.local.json` and fill it in — `list_bases` gives the `baseId`,
`list_tables_for_base` gives the table IDs. Stop and ask the human rather than guessing an ID
or working against a base you found by searching.

Column names, unlike IDs, are stable and are written out in full below. Pass them by name.

## The one rule that outranks the rest

**A cell is evidence, not intention.** Write a URL only after you have opened it and seen it
work. An agent that writes a staging link it has not loaded has lied to every downstream actor,
because the formula that moves the work has no way to tell the difference.

---

## Ownership

Exactly one agent owns each column. Owning a column means: you are the only agent that writes
it, and every other agent treats it as read-only. Columns marked **Derived** are written by
Airtable itself — no agent, no human, no script. Columns marked **Human** are nobody's to
automate; an agent may read them and must never nudge them along.

### Table: `components`

| Column | Type | Owner | Notes |
|---|---|---|---|
| `Components` | text (primary) | **Human** | The component's name. Seeds the row. |
| `Category` | select | **Human** | ATOMS · MOLECULES · ORGANISMS · TEMPLATES · UI |
| `Figma` | url | **Human** (designer) | The Figma node link. Feeds Development gate 8. |
| `Design` | select | **Human** (designer) | To-do · In progress · In testing · Done · To be fixed. Only `Done` is read by the formula. A blank row means design is not signed off. |
| `Staging Storybook` | url | **engineer** | Written after the deployed story has been opened and seen to render. |
| `Commit` | url | **engineer** | The commit the staging build came from. |
| `Semantic Tokens` | text | **token-runner** | The token layer the component consumes. |
| `GitHub Commits` | link → `githubCommits` | **engineer** | |
| `Composes` | link → `components` | **engineer** | The components this one imports. Build up, never sideways. |
| `Composed Into` | link → `components` | **Derived** | Reverse of `Composes`. See discrepancy D9 — Airtable will let you write it; don't. |
| `[Staging] Test Records` | link → `stagingTesting` | **qa** | |
| `Production Storybook` | url | **devops** | Feeds Development gate 5. |
| `Astro Link` | url | **devops** | The deep-linked docs page on the Astro Starlight site. Feeds Development gate 4. |
| `Release Review` | url | **reviewer** | The committed release-review report **at the commit it reviewed**, never a branch URL. Written together with `Release Verdict` or not at all. |
| `Release Verdict` | select | **reviewer** | Cleared · Blocked. Empty means not reviewed. Feeds Development gate 4. |
| `Development` | formula | **Nobody** | See below. |
| `Synchronization %` | formula | **Derived** | |
| `Staging Testing Results Summary` | rollup | **Derived** | The only input to Development gates 1, 2, 3 and 6. |
| `Total Staging Tests` | count | **Derived** | |
| `Staging Passed Count` | count | **Derived** | |
| `Staging Passed Tests` | rollup | **Derived** | |
| `Last Modified` | lastModifiedTime | **Derived** | |
| `[Production] Test Records` | text | **Nobody — quarantined** | See discrepancy D8. Do not write it. |

### Table: `stagingTesting`

One record per variant / size / state / context. **qa owns this entire table** — it is the only
agent that creates rows here and the only one that sets a verdict.

| Column | Type | Owner |
|---|---|---|
| `Component/Sub Component` | text (primary) | **qa** |
| `Testing Results` | select | **qa** — Passed · Failed · `Fixed (To re-test)` |
| `Composed In` | link → `components` | **qa** |
| `Variants` | long text | **qa** |
| `Size` | multi-select | **qa** — sm · md · lg · xl · xs · comfort · compact · null |
| `State` | multi-select | **qa** — draft · pending · upcoming · completed · rejected · cancelled · hovered · idle · focus · selected · isCurrent · error · disabled · loading · filled |
| `Context` | text | **qa** |
| `Attachment` | attachments | **qa** |
| `Expected Results` | long text | **qa** |
| `Suggestion for Improvement` | long text | **qa** |

> **The single break in single ownership.** The re-test loop cannot close unless someone sets
> `Testing Results` to `Fixed (To re-test)` after a fix, and that someone is the engineer, not qa.
> That is a second writer on a qa-owned column. The narrow exception, and its limits:
> **the engineer may set `Testing Results` to `Fixed (To re-test)` and to no other value, only on
> rows already marked `Failed`, and never on a row it has not actually fixed.** It may not write
> `Passed`. Only qa writes `Passed`. This is the one place the contract is not clean, and it is
> load-bearing for gates 1 and 3 — see D6 before renaming anything.

### Table: `githubCommits`

**engineer owns this entire table.**

| Column | Type | Owner |
|---|---|---|
| `Commit Hash` | text (primary) | **engineer** |
| `Message` | text | **engineer** |
| `Author` | text | **engineer** |
| `Date Committed` | dateTime (UTC, ISO) | **engineer** |
| `Link to Components` | link → `components` | **engineer** |
| `Files Changed` | long text | **engineer** |
| `Commit URL` | url | **engineer** |
| `Commit Type` | select | **engineer** — Feature · Bugfix · Documentation · Chore · Refactor · Other |

### Table: `dsFeedback`

**Human owns this entire table.** Agents read it to find work; no agent writes any column,
including `Status`.

| Column | Type | Owner |
|---|---|---|
| `Feedback` | long text (primary) | **Human** |
| `Components` | text | **Human** |
| `Submitted By` | text | **Human** |
| `Step to Reproduce` | long text | **Human** |
| `Suggestion` | text | **Human** |
| `Urgency` | text | **Human** |
| `Attachment` | url | **Human** |
| `Status` | select | **Human** — Completed · In Progress · Not Started |

### Table: `oneOffComponents`

**Human owns this entire table.** It sits outside the evidence loop — nothing here feeds
`Development`, and no agent writes it.

| Column | Type | Owner |
|---|---|---|
| `Components` | text (primary) | **Human** |
| `Project` | text | **Human** |
| `Usage quantity` | number | **Human** |
| `Git Repo` | text | **Human** |
| `Figma` | url | **Human** |

---

## The `Development` formula

**No agent may write `Development`. Not by any tool, not by any automation, not ever.** It is a
formula field; Airtable will reject the write, and an agent that tries has misunderstood the
system. To change what it says, change the evidence underneath it.

It is a first-match-wins ladder. Evaluated in this order, the first true condition wins and
nothing below it is consulted:

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

The matching on `Failed` and `re-test` is a **case-sensitive substring search** over the rollup
of every linked test row's `Testing Results`. `re-test` matches because the choice is spelled
`Fixed (To re-test)`, lowercase.

Three consequences worth knowing before they surprise you:

- **A failure outranks everything below it.** A component that has been released and then fails a
  re-test reads `To be fixed`, not `Released`. That is correct: it is broken, and the fact that it
  is also published is what makes it urgent.
- **`Released` needs all three cells, not just the Astro link.** The link says it is documented;
  the review and the verdict say someone checked the name, the surface and the promise before it
  went public. Any one alone is not a release.
- **A cleared review does not publish anything.** A human bumps the version and tags the release.
  `Cleared` is a gate, not a green light.

### Reading a status, not writing one

An agent that wants to know where a component stands reads `Development`. An agent that wants to
*move* a component writes its own column and lets the ladder re-evaluate. If the status does not
change after you write, your evidence did not satisfy the gate — re-read the ladder above rather
than writing a second cell to force it.

---

## Flagged discrepancies

These are places where a field's description in Airtable and the base's actual behaviour disagree.
They are recorded, not resolved — fixing them changes what the pipeline does, so a human decides.
Until then, **trust the formula, not the description.**

**D1 — `Release Verdict` says it is not wired into Development. It is.**
The description reads "Deliberately not wired into Development. This gate sits after Completed, so
folding it into that formula would make a shipped component read unfinished." The formula tests
`Release Verdict = "Cleared"` in gate 4. The description is wrong, or the formula is. High impact:
it decides whether `Released` is reachable at all.

**D2 — `Release Review` says the same thing, and is also wired in.**
"It does not feed Development and is not part of the staging-to-production ladder" — but gate 4
requires it to be set. Same contradiction as D1, same field group.

**D3 — `Staging Passed Tests` says it feeds `Synchronization %`. It does not.**
Its description reads "Counts only test rows marked Passed. Feeds Synchronization %." The
`Synchronization %` formula references `Staging Passed Count` and `Total Staging Tests` only.
`Staging Passed Tests` feeds nothing.

**D4 — `Staging Passed Count` and `Total Staging Tests` look identical in the schema.**
Both are `count` fields over the same link field (`[Staging] Test Records`) with no distinguishing
configuration exposed by the API. If `Staging Passed Count` carries no filter condition, then
`Synchronization %` is `count / count` and reads **100% on every row, always** — including rows
where every test failed. Someone needs to open both fields in the Airtable UI and confirm the
filter. Do not trust `Synchronization %` until they have.

**D5 — Development's description of gate 6 is looser than the formula.**
The description says "Any staging test rows exist → To be deployed." The formula says the
*results summary* is non-empty. A component with test rows whose `Testing Results` are all blank
falls through to gate 7 and reads `Ready for Testing`, not `To be deployed`.

**D6 — The spelling `re-test` is load-bearing and undocumented as such.**
Gates 1 and 3 do a case-sensitive `FIND` for the literal string `re-test`. The choice is currently
`Fixed (To re-test)`. Renaming it to `Fixed (Re-test)` — which is how the FigJam pipeline board
spells it — silently breaks both gates, because capital `R` does not match. No warning, no error;
components simply stop reaching `Fixing` and `Fixed`. Treat that choice name as a schema contract.

**D7 — Two rollup aggregations are unverifiable from the API.**
Neither `Staging Testing Results Summary` nor `Staging Passed Tests` exposes its aggregation
expression through the schema endpoint. Their descriptions claim specific behaviour; the claims
cannot be checked without the UI. The whole ladder's gates 1, 2, 3 and 6 depend on the first one.

**D8 — `[Production] Test Records` is a text field pretending to be a link.**
`[Staging] Test Records` is a record link to a real table. `[Production] Test Records` is plain
text, has no description, and there is no production testing table for it to point at. It is
quarantined above: no agent writes it. Either build the table or delete the column.

**D9 — `Composed Into` says "nobody writes this directly." Airtable disagrees.**
It is a symmetric link field. Airtable maintains it automatically *and* allows writes from either
side. The description states a policy the base does not enforce, so the policy has to live here
and be obeyed: write `Composes`, never `Composed Into`.

**D10 — The base documents a cast that does not exist yet.**
Field descriptions name a **Release** agent ("📦 Release never writes this") and a **Reviewer**
agent, and twice cite `.claude/skills/release-review/SKILL.md` for the seven release gates. None
of those exist in this repo — `.claude/agents/` currently holds `engineer`, `qa` and
`token-runner`. The ownership table above assigns `devops` and `reviewer` as owners on that basis;
those agents still have to be written, and until they are, four columns have an owner with nobody
in the seat.

**D11 — `Development`'s blank branch and its default choice disagree.**
Gate 9 returns an empty string, but the formula's own single-select option set carries `To-do` as
its default choice. A row with no evidence at all may render as blank or as `To-do` depending on
where you read it. Cosmetic, but it makes "is this row started?" ambiguous in views and rollups.
