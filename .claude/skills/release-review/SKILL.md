---
name: release-review
description: The seven release gates (R1–R7) and the verdict rules for a component that has reached production — what to read, in what order, what each gate asks, who owns the fix when it fails, and the exact shape of the report and the Cleared / Blocked verdict. Read this before any release review. Never edits an intent file, never fixes what it finds, never publishes.
---

# Release review

A component can pass every test and still fail here. QA asked *does it work*. This review asks
*is this the thing we want to be stuck with* once its name is in a public version number.

The agent that runs this is `reviewer`. Its columns, its wake condition and its never-list are in
`.claude/agents/reviewer.md`; this file is the part that file said was missing: the seven gates.

**Numbering.** The gates here are **R1–R7**. The registry's `Development` formula has its own
numbered gates and `devops.md` uses "gate 1 / gate 2" for the two human merge gates. Three different
things share the word, so every reference in a report says `R3`, never "gate 3".

## What you need before you start

Stop and say what is missing rather than reviewing around it.

- The registry row reads `Development` = `Completed` and `Release Verdict` is **empty**. Anything in
  the verdict cell is finished business or a standing block — not yours.
- `Production Storybook` is set and opens.
- An intent file exists beside the component: `<Name>.intent.json`, written by the doc-generator
  (skill `component-intent`). **A missing intent file is not a fail of R6 — it is "cannot run".** Say
  so, leave the verdict empty, and name the doc-generator.
- You can read the built output (`build/css/tokens.css`) and the git history.

## Read in this order

1. **The published thing first.** Open the production Storybook page for the component. Then the
   documentation page, if the docs site has staged one — the docs site is built before the review
   and its link is recorded by devops *after* a `Cleared`, so a missing `Astro Link` is expected here
   and is **not** a finding.
2. **The intent file.**
3. **The source, last.** Once you have read the code you cannot un-know it and you will fill gaps the
   reader cannot.

**Pin one commit.** Write down the commit SHA of `main` at the moment you start. Every check runs
against it, and the report is committed and linked at it. A report for a branch describes whatever
the branch says today.

## The seven gates

Run **all seven** and report **every** failure in one pass. Stopping at the first failure hides the
rest and costs the next round-trip.

| # | Gate | The question | Fix owner when it fails |
|---|---|---|---|
| R1 | **Done** | Is it actually `Completed` on the board, and is production current? | devops (deploy), engineer (source) |
| R2 | **Tokens** | Does every value reference a token? Is any raw hex, `rgb()` or `px` left? | engineer |
| R3 | **Surface** | Is it exported from the package entry? Did you mean to? | engineer |
| R4 | **Names** | Do folder, exported symbol, CSS prefix, intent file and board row all use the same word? | engineer (code), a human (the board row) |
| R5 | **States** | Is every state the product uses covered, each with a story? | qa (coverage), engineer (story) |
| R6 | **Intent** | Is the intent file complete, specific and honest — and does it let you choose between components? | doc-generator |
| R7 | **Version** | Can you name what a version number would commit us to? | a human |

### R1 · Done

- Read the registry row live: `Development` reads `Completed`.
- `Completed` only means a production URL exists, not that it is current. Check freshness by
  **content**: fetch the deployed stylesheet and compare it with what the pinned commit builds, for
  example that the component's selectors and token references in production match
  `build/css/tokens.css` at the commit. A URL that returns 200 proves nothing about what it serves.
- Fails if: the row does not read `Completed`; the production URL does not open; or production's
  stylesheet differs from the pinned commit.

### R2 · Tokens

- Search the component's CSS (and any inline style in its source) for raw hex colours, `rgb()` /
  `hsl()`, and `px` lengths that are not inside `var(--…)`.
- **Zero is the pass.** A raw literal is a finding even when the CSS header explains it as a value
  the design leaves unbound — an explanation is not a ruling. If a human rules on a recurring case,
  the ruling is written in **Rulings** at the bottom of this file and only then stops being a finding.
- Report each finding as the file, the property, the literal, and the token it should be (never just
  "uses a raw value" — name the replacement).

### R3 · Surface

- Find the package entry (`src/index.*`). The component, and only what is meant to be public of it,
  must be exported from it, one line each.
- Compare with the intent file and with what the docs say is usable. An export nobody documented is a
  finding ("did you mean to?"); a documented component that is not exported is a finding.
- Internal helpers, private subcomponents and test fixtures must not be reachable from the entry.

### R4 · Names

The same word everywhere. Compare, character for character:

- the component folder and file name
- the exported symbol
- the CSS class prefix (`hz-…`)
- the intent file name
- the `Components` cell on the board row

A name that differs in case or spelling in any one of these is a finding. Names are public surface:
once published, a rename is a MAJOR bump (`VERSIONING.md`).

### R5 · States

- Take the Figma variant matrix as recorded in the registry's test rows (`Variants`, `State`, `Size`)
  and the stories file.
- Every state and variant the product uses must have a story. A state in the design with no story, or
  a story with no design cell, is a finding.
- Report coverage gaps against `qa` (rows missing) or the engineer (story missing). Never write a
  `stagingTesting` row yourself.

### R6 · Intent

Two parts: the file, then the choosing test.

**The file — six checks.** The intent file carries seven fields: `use_when`, `dont_use_when`,
`variant_intent`, `placement`, `pairs_with`, `required_tokens`, `a11y`.

1. **Fields present.** All seven exist and none is empty. An empty `use_when` or `dont_use_when` means
   the doc-generator found no usage region in Figma; that is a gap it should have listed, so it is a
   finding against the doc-generator, not something you fill in.
2. **Every `dont_use_when` names an alternative.** "Don't use this for X — use *Component* instead".
   One without an alternative is a **warning, never a blocker.**
3. **`a11y` is specific.** It states facts about this component (the role, the keyboard behaviour,
   what is announced). "Accessible", "follows WCAG" and similar are a finding.
4. **`required_tokens` resolve.** Every token listed exists in the built output
   (`build/css/tokens.css`, and `tokens-dark.css` where it has a dark value). One that does not
   resolve is a finding, named.
5. **All variants covered.** `variant_intent` says what each variant is for and covers every variant
   the component has — no variant missing, none described that does not exist.
6. **No two components claim the same job.** Compare the `use_when` of every component in the batch.
   Two that could be argued equally for the same job are a finding on **both**, naming the pair.

**The choosing test.** The file is only good if it lets someone choose. Run it **once per review
batch**, not once per component, and run it with **only the `*.intent.json` files in context** — no
source, no stories, no component names beyond what the files themselves contain, or it answers from
the code and proves nothing.

Ask for three jobs and have the reader pick one component for each, quote the `use_when` line that
decided it, and rate its confidence. Pick the three jobs from what this library actually contains;
write them in the report so the test can be repeated. **"No component fits" is a valid answer.** A job
the library does not cover that gets a confident wrong answer is the failure; a job it does not cover
that is answered "none" is the pass.

- Check mechanically that each quoted line appears **verbatim** in that component's file. A quote that
  is not there means the reader invented it.
- It fails when the reader hedges between two components, or picks one without a quotable line. Name
  the pair, or the job with no line.
- **The fix is in the intent files, never in the test.** Do not reword a job to make it pass.

### R7 · Version

- Read `VERSIONING.md`. State the bump this release needs — MAJOR, MINOR or PATCH — and **name the
  specific public-surface change that forces it**: a prop, a variant, a token, an export.
- If there is no earlier tag, say so: everything is new and the first version is `0.1.0`.
- If you cannot name the change, R7 fails. A version number is a promise made to people outside this
  repo; you do not choose it, you show that someone can.
- The owner is a human. **You never choose the number, edit `package.json`, or tag.**

## The verdict

- **`Cleared`** — R1–R7 all pass. Warnings do not stop it; they are listed in the report.
- **`Blocked`** — one or more fail. For **each** failing gate the report names the gate (`R3`), the
  finding, and **the agent who owns the fix**. A block that names no owner is a complaint.

**Expect to be Blocked on the first run.** A review that passes everything the first time is a review
that was not reading.

**Write `Release Review` and `Release Verdict` together or not at all.** The report is committed first
and linked at the pinned commit's SHA.

### The report

One file per component per review, committed under `reports/release-review/`:

`reports/release-review/<Name>-<short-sha>.md`

Keep it to evidence:

```
# Release review · <Name> · <short-sha>
Verdict: Cleared | Blocked
Pinned commit: <full sha> (main)
Read: production Storybook ✓  docs page ✓ | not staged  intent file ✓  source ✓ (last)

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | … | |
…
Warnings: <dont_use_when with no alternative: …>
Choosing test (batch): jobs, picks, quoted lines, hedges
Version: <bump> — forced by <named change>
```

## Never

- Never edit an intent file. Never fix what you find. Never edit `src/`, `tokens/`, `build/` or
  `package.json`.
- Never run a gate you cannot name an owner for the failure of.
- Never invent a gate, or relax one because the component "is nearly there".
- Never publish, tag, deploy, merge or write `Astro Link`. `Cleared` is a gate, not a green light.
- Never review a row whose `Release Verdict` is already filled, and never let a stale `Cleared`
  stand: if the row's `Last Modified` is later than the commit the report links to, say so.
- Never link a branch. Never read the source before the published page.

## Rulings

Findings that are not defects get ruled on here, with **what it means for an agent that hits it** and
**what is not ruled** — a narrow ruling with no boundary gets stretched to cover things nobody
decided.

### Ruling 1 · Documented-unbound px lengths pass R2 (ruled 2026-10-05 by the designer)

- **Rule.** A raw `px` length in a component's CSS is not an R2 finding when **all three** hold: the
  design leaves that value unbound (the Figma node has no variable on it), the CSS names it as such
  (an `--hz-<component>-…-unbound` custom property, with the reason in the file header), and the
  exported tokens have no token with that value that fits the property.
- **What it means for the agent.** Do not report those literals. Still report any `px` length that has
  a token available (at ruling time: 1px `--borderwidth-1`, 16px `--spacing-16`, 40px `--spacing-40`,
  56px `--spacing-56`) — that is a finding, owner engineer. List the unbound ones once in the report
  under "Ruled, not findings", so the exception stays visible.
- **Not ruled.** Raw hex, `rgb()` and `hsl()` colours are never covered. A px length that is not marked
  `-unbound` is not covered. An unbound value that later gains a Figma token is a finding again.

### Ruling 2 · The published name is the exported symbol (ruled 2026-10-05 by the designer)

- **Rule.** The exported symbol is the component's name. For Pin Code that is `PinCodeCell`; the
  package, the intent file and the class stay as they are. The board row is a human's to rename to
  match, and until it is renamed R4 reports it once, owner a human, not the engineer.
- **What it means for the agent.** Do not ask the engineer to rename `PinCodeCell`. Compare the other
  four places against the symbol, ignoring case style and separators ("Check Box" and `CheckBox` are
  the same word).
- **Not ruled.** A symbol that differs from its own folder or intent file by a different word is still a
  finding. Renaming a published symbol later is still a MAJOR bump.

### Ruling 3 · Input Field is one component with two board rows (ruled 2026-10-05 by the designer)

- **Rule.** `InputField` is one component with a `variant` prop. The board's `Input Field / Primary`
  and `Input Field / Mobile` rows are its two Figma variants, kept as two rows on purpose; the code is
  not split.
- **What it means for the agent.** Compare R4 for both rows against `InputField`. Do not report the two
  board rows, or the single `InputField` symbol, as a mismatch.
- **Not ruled.** Storybook titles that do not match the symbol are still an R4 finding for the
  engineer. A third Input Field row, or a variant with its own export, is not covered.
