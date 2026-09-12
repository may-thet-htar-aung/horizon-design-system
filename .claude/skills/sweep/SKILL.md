---
name: sweep
description: The registry audit procedure — read every row, reconcile status against evidence, open every link, and hunt the three shapes of contradiction. Report in a fixed order — what changed, counts, what's owed, contradictions, dead links.
---

# Sweep the registry

## When to use this
Use this for a full registry audit — scheduled, or because a human asked where things stand. Every
sweep is total: there's no partial audit and no scoping down to "just the components that changed."
A hidden row is exactly the one most likely to be wrong.

## Steps

### 1 · Read every row, not a filtered view
Pull every row of every table — `components`, `stagingTesting`, `githubCommits`, `dsFeedback`,
`oneOffComponents` — directly, not through a saved view or a filter that hides blanks, archived
rows, or anything marked done. A view that hides a row hides exactly the disagreement you exist to
find.

**Check:** the row count you audited matches each table's actual row count, not a filtered subset.

### 2 · Reconcile each status against the evidence underneath it
`Development` is a formula — `.claude/skills/registry/SKILL.md` has the nine gates in precedence
order. For every row, don't just read what `Development` says: check that the evidence the ladder
is supposed to be reading actually says what the status claims.

- A row reading `To-do` — is `Figma` actually set, and `Design` actually `Done`? (D11: the
  formula's blank branch can render as `To-do` in some views. Confirm from `Design` itself.)
- A row reading `Ready for Testing` — does `Staging Storybook` actually hold a URL?
- A row reading `To be deployed` — does the testing summary actually show no `Failed` and no
  `re-test`? (D5: this gate fires on the absence of failure, not the presence of `Passed`. Count
  the rows.)
- A row reading `Completed` or `Released` — are `Production Storybook`, `Release Review`, and
  `Release Verdict` actually all present the way gates 4 and 5 require, not just one of them?

A status that matches its evidence isn't cleared with extra confidence — it's simply not yet a
finding. Move on to the next row.

**Check:** every status was traced back to the specific cell or cells the ladder reads, not taken
at face value.

### 3 · Open every link — don't count them
A cell holding a URL is a claim, not a fact, until someone opens it. Counting how many cells have
something in them tells you nothing about whether any of them work. For every link column —
`Figma`, `Staging Storybook`, `Production Storybook`, `Astro Link`, `Release Review`, `Commit`,
`Commit URL` — open it and confirm it resolves to something real and relevant: not a 404, not a
redirect to something unrelated, not a page for the wrong commit.

**Check:** every link was opened during this sweep. None were counted as good because a previous
sweep opened them.

### 4 · Hunt contradictions
Beyond the status-versus-evidence mismatches from step 2, look for three specific shapes:

1. **A row that contradicts itself.** Not status-vs-evidence — internal disagreement within the
   row's own cells. A `Release Verdict` of `Cleared` sitting beside a `Release Review` link that
   404s. A `Testing Results` of `Passed` on a row with no `Attachment`, when every row is supposed
   to carry a screenshot.
2. **A test row linked to nothing.** A `stagingTesting` row with no `Composed In` back to a
   component is orphaned — it isn't feeding any rollup, which means it's invisible to the exact
   system it's supposed to be evidence for.
3. **The repo and the registry disagreeing.** Every folder in `src/components/` should have a row
   in `components`; every row claiming `Staging Storybook` or `Production Storybook` should have
   code behind it in the repo. A row with no folder describes something that doesn't exist. A
   folder with no row is invisible to the entire pipeline.

Check known trouble spots against `.claude/skills/registry/SKILL.md`'s flagged discrepancies
(D1–D13) too — a sweep is exactly where a fourteenth would turn up, and where a fixed one would be
noticed as no longer reproducing.

**Check:** all three contradiction shapes were checked on every applicable row, not just the ones
that looked suspicious on first read.

## Report structure

Write the report in this order, every time — it doesn't get reordered by what happens to be most
interesting this sweep:

1. **What changed since last sweep** — first, before anything else. If nothing changed, say that
   plainly; it's a finding you checked for, not an assumption you carried forward.
2. **Counts** — one line per `Development` value, each with the actual row names behind it listed.
   A count with no rows listed is unverifiable by anyone reading the report.
3. **What each owner is waiting on** — grouped by owner (an agent, or Human), not by component.
   Someone reading the report for their own name finds their list without reading the whole thing.
4. **Contradictions** — every one found in step 4, named specifically: which row, which shape,
   which cells disagree.
5. **Dead links** — every link opened in step 3 that didn't resolve, with the column and row it
   came from.

## References
- Ownership, the formula, and the flagged discrepancies: `.claude/skills/registry/SKILL.md`
- The report file and its exact sections: `pm.md`'s Outputs table

## Self-check
- [ ] Every table was read in full, not through a filtered or saved view
- [ ] Every status was traced to its underlying evidence, not taken at face value
- [ ] Every link was opened this sweep, not assumed good from a previous one
- [ ] All three contradiction shapes were checked, not just the obvious ones
- [ ] The report follows the fixed order: changed, counts, waiting-on, contradictions, dead links
- [ ] Every count has the actual rows listed behind it
