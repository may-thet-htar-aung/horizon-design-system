---
name: finding-format
description: The exact template QA writes into both `Expected Results` and `Suggestion for Improvement` on every stagingTesting row — one shape for a failure, a shorter one for a pass — plus the rule against reporting a raw value instead of a token or prop.
---

# Finding format

## When to use this
Every `stagingTesting` row gets this written twice, identically — once in `Expected Results` and
once in `Suggestion for Improvement` — pass or fail, not just failures. Same text, both cells. It's
what an engineer reads to act without a follow-up question, and what a later sweep or re-test reads
to know what the state was before anything changed.

## The two shapes

**A failed row:**

```
Tested : (Date: dd/mm/yyyy)
Status : (previously passed)
Issue Type :
Expected :
Actual :
Fix :
```

**A passed row:**

```
Tested : (Date: dd/mm/yyyy)
Status : This Variant passed.
```

Write the exact same block into both `Expected Results` and `Suggestion for Improvement` — copy it,
don't paraphrase it a second time, or the two cells will quietly drift apart and someone will trust
whichever one they happened to open. Nothing else goes in either cell. The row's own `Variants` /
`Size` / `State` / `Context` columns already say which case this is — don't repeat that here.

## Filling in each line, on a failed row

- **Tested** — the date you ran this specific test, `dd/mm/yyyy`. Not the date the row was
  created; the date of *this* result. A re-test replaces this with the new date — the field
  describes the current result, not a log of every past attempt.
- **Status** — this row's testing history going into this result. Write `previously passed` when a
  component that had passed is now failing on a later check — a regression, exactly the case the
  registry contract flags: a released component can fail a re-test and read `To be fixed` again.
  Otherwise state plainly what the prior result was — `first test`, `previously failed — repair
  unverified`. Never leave this blank; a first test still has a status.
- **Issue Type** — one short label for the kind of defect: `Visual`, `Behavioral`, `Token binding`,
  `Accessibility`, `Layout`, or whatever the shortest accurate word is. Not a fixed list in
  Airtable — free text, but one real word, not a sentence.
- **Expected** — what Figma says it should be. Name the token or the prop — see the rule below.
- **Actual** — what's actually rendering. Name the token or the prop the same way — see the rule
  below.
- **Fix** — what you think would resolve it, in one line, if you have a real guess. It's a lead for
  the engineer, not a prescription — they may find a different cause. Leave it blank rather than
  guess wildly; a wrong lead sends someone down the wrong path faster than no lead at all.

On a passed row, **Status** is always exactly `This Variant passed.` — not "looks fine," not "no
issues," that exact line. Someone scanning many rows for the same words depends on it not drifting.

## The rule: name the token or the prop, never a raw value

"The colour looks off" is not a finding — it names no expectation, no token, and no source. It's an
impression, and it can't be acted on without the engineer redoing the comparison you already did.

The rule applies to both `Expected` and `Actual`. Reporting the expectation as "a darker blue" is as
unusable as reporting the observation that way. Each line gets a token name, a prop name, or — when
the design genuinely leaves it unbound — an explicit statement that it's unbound. A hex value is
never the answer on either line, even when you have it sitting right in front of you; if you find
yourself about to write one down, go find the token it should have resolved to, or the token it's
wrongly using instead.

Name where the expectation came from too — the tool call that confirmed it (`get_design_context`,
`get_variable_defs`, or the node's own property panel). "It should be blue" is not this.
"`--color-border-focus`, per `get_variable_defs` on the node" is.

## Example — good

```
Tested : 18/09/2026
Status : previously passed
Issue Type : Token binding
Expected : border-color: var(--color-border-focus), per get_variable_defs on the node
Actual : border-color: var(--color-border-default) — hover isn't swapping the token
Fix : hover handler looks like it's missing the focus-token swap entirely
```

This is actionable without a reply. The row it's on already says which variant, size, state, and
context this is — the block adds when it broke, what kind of break it is, exactly which token
should be there, exactly which token is there instead, and a lead on where to look.

## Example — bad, and why it fails

```
The hover border looks wrong on the primary button.
```

- **No date, no status.** Is this new, or has it been failing for three sweeps? Nobody can tell.
- **No token on either side.** "Looks wrong" names no expectation and no observation — the engineer
  has to re-run the same comparison qa already ran, from scratch, before they can even start
  fixing anything.
- **No issue type, no fix lead.** The engineer has nothing to triage against and nowhere to start
  looking.

This isn't a finding. It's a symptom, handed over undiagnosed.

## Self-check
- [ ] Every row's `Expected Results` follows one of the two shapes — nothing improvised
- [ ] `Tested` is the date of this specific result, in `dd/mm/yyyy`
- [ ] `Status` is filled on every row, including a plain `This Variant passed.` on a pass
- [ ] `Expected` and `Actual` each name a token or a prop — or say plainly that none applies —
      never a raw hex, pixel, or font value
- [ ] `Fix` is either a real lead or left blank — never a guess dressed up as one
- [ ] Read alone, with no other context, someone could tell what happened on this row and when
