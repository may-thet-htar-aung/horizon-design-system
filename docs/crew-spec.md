# Mai Crew — Evidence Loop: plain-English spec

Source: FigJam board "Mai Crew" (`9g3bh4xMcMAUAoNjTl8dDU`), canvas `Crew Evidence Loop`.
Read on 2026-09-12. This document describes **only what the board says**, plus a separate list of
what it does not say. No agents have been minted from it yet.

---

## 0. The board's own global rule

The board carries one legend note, and it is the only law stated anywhere on it:

> Solid line = main path (actor → tool → output → Airtable record → Jira status).
> Dashed line = the Jira status provokes the next actor.
> **Nothing moves without a record in Airtable.**

So the pipeline is not a chain of messages between actors. It is a chain of **evidence**: an actor
does work, the work produces an artifact with a URL, the URL is written into Airtable, Airtable's
state flips a Jira status, and the Jira status is what causes the next actor to start. Actors never
hand off to each other directly.

The board is laid out as six columns, and every lane reads left to right across them:

| Column | Meaning |
|---|---|
| Actors | who does the work, and whether they are human or agent |
| Access / Driver | the tool or surface they work in |
| Output | the artifact the work produces |
| Registry (Airtable) | where the artifact gets recorded |
| Conditional | the rule that Airtable state must satisfy |
| Jira Status | the status the issue lands in as a result |

## 1. Tooling and budget (as drawn)

| Tool | Tier on the board |
|---|---|
| Figma | Edu |
| AI IDE (Claude AI) | Pro |
| Git (GitHub) | Free |
| Hosting and domain (Vercel) | Free |
| Jira | Free |
| Airtable | Free |

---

## 2. The actors

Six actors, in board order. Three are labelled Agent, three are labelled Human.

### 2.1 Client — **Human**

- **Works in:** Claude Cowork chat.
- **Reads:** nothing upstream. This lane starts the loop; no arrow enters the Client.
- **Writes:** a prompt plus acceptance criteria, recorded in Airtable under **Components / Brief**.
- **Refuses:** not stated on the board.
- **Moves work on when:** the board draws an arrow straight from the **Components / Brief** record to
  the Designer. There is **no conditional and no Jira status on this lane** — the Brief record itself
  is what provokes the Designer.

### 2.2 Designer — **Human**

- **Works in:** Figma / FigJam.
- **Reads:** the Components / Brief record written by the Client.
- **Writes:** a UI Kit — tokens plus components — and then writes the **Figma node link** into
  Airtable under **Components / Figma**.
- **Refuses:** not stated on the board.
- **Moves work on when:** *the Figma column has a link.* That flips the issue to Jira **To Do**, and
  **To Do** provokes the Developer.

### 2.3 Developer — **Agent**

The Developer has **two distinct lanes** on the board, entered from different statuses.

**Lane A — "New"** (entered from Jira **To Do**)

- **Works in:** AI IDE — Claude, then GitHub: **feature branch → PR → staging**.
- **Reads:** the Jira **To Do** status. (The board draws only the status arrow into the Developer —
  it does not draw the Developer reading the Figma link or the Brief, though both are in Airtable.)
- **Writes:** a Vercel Preview / Storybook staging URL, and then writes the **staging URL** into
  Airtable under **Components / Staging URL**.
- **Moves work on when:** *the Staging URL column has a link.* That flips the issue to Jira
  **Ready for QA**, and **Ready for QA** provokes QA.

**Lane B — "Fix in staging"** (entered from Jira **To be fixed** and from Jira **Fixing**)

- **Works in:** AI IDE — Claude (fix), then GitHub: **new commit → PR → staging**.
- **Reads:** the failed test rows in **Staging Testing / Testing Results**.
- **Writes:** a Vercel Preview redeploy, and then **updates the testing result** on the affected rows
  in **Staging Testing / Fixed (Re-test)**.
- **Moves work on when** one of two things is true of the test rows:
  - **All rows = "Fixed (Re-test)"** → Jira **Fixed**, which provokes QA to re-test.
  - **Only some rows = "Fixed (Re-test)"** → Jira **Fixing**, which loops straight back to the
    Developer to keep working.
- **Refuses:** not stated on the board.

### 2.4 QA — **Human** (as labelled on the board)

- **Works in:** the staging URL, tested against the Figma UI Kit.
- **Reads:** Jira **Ready for QA** (from a new build) or Jira **Fixed** (from a re-test); the staging
  URL from Airtable; the Figma UI Kit as the reference.
- **Writes:** test rows — **one record per variant / state / prop** — into **Staging Testing /
  Testing Results**.
- **Moves work on when** the test rows resolve one of two ways:
  - **One or more = "Failed"** → Jira **To be fixed**, which provokes the Developer's fix lane.
  - **All = "Passed"** → Jira **To be deployed**, which provokes DevOps.
- **Refuses:** not stated on the board.

### 2.5 DevOps — **Agent**

- **Works in:** GitHub: **staging → main**.
- **Reads:** Jira **To be deployed**.
- **Writes:** a Vercel Production deployment plus domain, and then writes the **production URL** into
  Airtable under **Components / Production URL**.
- **Moves work on when:** *the Production URL column has a link.* That flips the issue to Jira
  **Done**, and **Done** provokes the PM.
- **Refuses:** not stated on the board.

This lane is consistent with the repo rule in `CLAUDE.md`: a component branch never merges into main;
main accepts PRs from staging only. The Developer only ever reaches `staging`; DevOps owns
`staging → main`.

### 2.6 PM — **Agent**

- **Works in:** Claude Cowork, on a **scheduled audit** (not triggered by a single component's work —
  triggered by a schedule).
- **Reads:** **all columns + all records** in the registry. This is the only actor that reads the
  whole registry rather than one component's row.
- **Writes:** an **evidence audit report**.
- **Moves work on when:** *all evidence is present* across every column and every record → Jira
  **Closed**. This is the terminal state; nothing is provoked after it.
- **Refuses:** not stated on the board.

---

## 3. The Jira status map

Eight statuses appear on the board. Each one, what puts work there, and who it wakes:

| Status | Set when | Wakes |
|---|---|---|
| *(none)* | Client writes the Brief record | Designer (provoked by the Airtable record, not a status) |
| **To Do** | Figma column has a link | Developer (new lane) |
| **Ready for QA** | Staging URL column has a link | QA |
| **To be fixed** | one or more test rows = "Failed" | Developer (fix lane) |
| **Fixing** | only some rows = "Fixed (Re-test)" | Developer (fix lane, again) |
| **Fixed** | all rows = "Fixed (Re-test)" | QA (re-test) |
| **To be deployed** | all test rows = "Passed" | DevOps |
| **Done** | Production URL column has a link | PM |
| **Closed** | all evidence present across all columns and records | nobody — terminal |

---

## 4. The registry shape the board implies

The board names seven registry targets, which fall into two groups:

**Components /** — Brief, Figma, Staging URL, Production URL.
Reads as one record per component, with a column per stage of evidence.

**Staging Testing /** — Testing Results, Fixed (Re-test).
Reads as one record per **variant / state / prop** of a component, with a result value on each.

The values that appear on test rows are **Passed**, **Failed**, and **Fixed (Re-test)**.

---

## 5. What the board says each actor refuses to do

**Almost nothing.** This is the single largest gap, and I am not filling it.

The only refusal the board actually states is the global one in the legend: *nothing moves without a
record in Airtable* — which reads as "no actor may act on a verbal or chat handoff; the trigger must
be registry state."

Everything else you might expect a refusal for — a developer refusing to sign off its own work, QA
refusing to test a component with no Figma link, DevOps refusing to deploy with a failing row, the PM
refusing to close on incomplete evidence — is **drawn as a path that simply doesn't exist**, not as a
stated prohibition. A missing arrow is not a refusal: if I turn each missing arrow into a hard "must
refuse" rule, I will have invented four agents' worth of behaviour you never specified. See the
ambiguity list, items 20–26.

---

## 6. Two defects in the board itself

1. **Dangling connector in the PM lane.** The arrow leaving "Claude Cowork scheduled audit" does not
   terminate on the "Evidence audit report" output — it terminates on the canvas root. The PM's
   tool → output link is broken. The rest of that lane (report → all records → Closed) is intact.
2. **The Client lane breaks the legend's own pattern.** Every other lane goes
   actor → tool → output → Airtable → conditional → Jira status → next actor. The Client lane stops
   at the Airtable record and provokes the Designer directly, with no conditional and no status.

---

## 7. Ambiguities — resolve these before minting anything

### Actor identity and agent count

1. **QA is labelled Human on the board, but this repo already ships a `qa` subagent and a `test`
   skill.** Which is true? If QA is human, the `qa` agent is orphaned; if QA is an agent, the board's
   human/agent labelling is wrong in at least one place.
2. **You said "four agents." The board labels three** (Developer, DevOps, PM). Who is the fourth —
   QA, a second Developer for the fix lane, or a Designer-side agent the board draws as human?
3. **Developer has two lanes.** Is that one agent with a "new" mode and a "fix" mode, or two agents
   with different triggers and different read sets?
4. **Do Client and Designer get agent counterparts at all,** or are they purely human touchpoints
   with nothing minted for them?

### Registry schema

5. **Are "Components" and "Staging Testing" two Airtable tables, or one table with two groups of
   columns?** The board writes them as `Table / Column` but never names the base.
6. **What type is the Brief?** Long text in a cell, a link to a Cowork transcript, or an attachment?
7. **How are test rows linked to their component row?** The board shows two different grains
   (one row per component; one row per variant/state/prop) and no link field between them.
8. **Is "Fixed (Re-test)" a value in the same field as Passed/Failed, or its own column?** The board
   draws it as a separate registry node, but every condition phrased around it reads like a row value.
9. **Is there a fourth row state** — "Not run" / blank — for a test row that has been created but not
   yet executed? The conditions "all = Passed" and "all = Fixed (Re-test)" both need to know what
   counts as unset.
10. **On re-test, does QA overwrite the existing row or append a new one?** Determines whether history
    is preserved and whether "all rows = Passed" can ever be evaluated against stale rows.

### Statuses and transitions

11. **What creates the Jira issue, and in what status?** The Client lane has no status at all. If
    "To Do" only arrives when the Figma link lands, the issue is either non-existent or in an unnamed
    status for the whole brief-to-design stretch.
12. **Who actually writes the Jira status?** The conditionals are phrased like Airtable automations
    ("when the column has a link"), but no actor on the board owns the write. Is it an Airtable
    automation, a Jira automation, or the agent that produced the evidence?
13. **What is the grain of a Jira issue** — one per component, or one per variant? Statuses look
    per-component; test rows are per-variant.
14. **After QA re-tests a "Fixed" component successfully, does it go to "To be deployed"?** The board
    draws the QA → Testing Results path only once; the re-test loop's exit is implied, not drawn.
15. **What happens when the PM audit finds evidence missing?** Only the "all evidence present →
    Closed" edge exists. There is no failure edge and no actor is provoked by an incomplete audit.
16. **Does "Closed" apply per component, or to the whole registry?** The PM reads all records, which
    suggests a batch verdict, but "Closed" sits in a per-issue status column.

### Triggering mechanics

17. **Are the back-arrows polls or pushes?** Does each agent watch Airtable/Jira on an interval, or
    does something notify it? The board says a status "provokes" an actor and says nothing more.
18. **Does the Developer read the brief and acceptance criteria, or only the Figma link?** Only the
    status arrow is drawn into the Developer. Acceptance criteria exist in the registry but nothing
    on the board consumes them.
19. **Does QA read acceptance criteria too, or only the Figma UI Kit?** The board names only the UI
    Kit as the reference.

### Refusals (none of these are on the board — all need a decision)

20. **May an actor verify its own work?** The board never says no. The repo's existing agent
    descriptions do say no. Which governs?
21. **May the Developer agent edit tokens or Figma?** Is the UI Kit strictly read-only downstream?
22. **May DevOps deploy when any test row is not "Passed"?** The board routes to DevOps only from
    "all = Passed", but never forbids the other route.
23. **May the PM write anything besides the audit report?** It moves work to "Closed", which is a
    write — so it is not purely a reader.
24. **May any actor skip a stage** when the evidence is obviously already there?
25. **May an agent open *and* merge its own PR?** The board shows the Developer producing
    "PR → staging" but never says who merges it.
26. **What does an actor do when its input is present but broken** — a dead Figma link, a 404 staging
    URL, a failed Vercel build? There is no error or timeout path anywhere on the board.

### Git and environments

27. **Is the board's "feature branch" the same as this repo's "component branch"?** `CLAUDE.md` uses
    the latter term and forbids it merging to main.
28. **Is there a long-lived `staging` branch,** and is it the PR target for every component?
29. **Fix lane says "new commit → PR → staging" — a new PR, or a push to the existing open PR?**
30. **Is the staging URL a Storybook deploy or the app?** The board writes "Vercel Preview /
    Storybook staging URL" as one node; production is "Vercel Production + domain" with no Storybook
    named. Are these the same artifact at two tiers?

### Surfaces and budget

31. **Where does the crew actually run?** Client and PM are on "Claude Cowork"; the Developer is in
    "AI IDE — Claude" (this repo). If agents are minted as files in this repo, how do the Cowork-side
    actors invoke them, and do they share the same registry credentials?
32. **Do the free tiers support the automations the board assumes?** Every conditional in the
    pipeline is an automation on Jira Free or Airtable Free.

---

## 8. Recommendation before minting

Items **1, 2, 3, 5, 7, 8, 12, 20 and 25** are the ones that change agent boundaries or the shape of
the registry. Every other ambiguity can be patched in a later pass without re-minting. Those nine
cannot.
