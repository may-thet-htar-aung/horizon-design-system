---
name: finding-format
description: The shape of a QA finding — the four parts required to make it actionable without a follow-up question, and the rule against reporting a raw value instead of a token or prop.
---

# Finding format

## When to use this
Use this whenever qa reports a failure. A finding is the unit of the repair loop — it's what turns
a failed test into work the engineer can pick up without opening a thread to ask what you meant. If
a finding needs a follow-up question, it isn't a finding yet — it's a to-do list to write.

## The four required parts

Every finding has these, in this order, and none of them are optional:

1. **The case.** Which row this is — variant, size, state, and context, the same identifiers as
   the `stagingTesting` row it lives on. Not "the button" — which one.
2. **What was expected, and where that expectation came from.** Not a description of the design —
   the actual token or property name the Figma node is bound to, and the tool call that confirmed
   it (`get_design_context`, `get_variable_defs`, or the node's own property panel). "It should be
   blue" is not this. "`--color-border-focus`, per `get_variable_defs` on the node" is.
3. **What was actually seen.** The token or property the rendered component is actually using —
   read from the computed style or the source, never guessed from how it looks on screen. If the
   component uses no token at all — a raw hex, a raw pixel value — say that plainly; a missing
   token is itself the finding.
4. **Where in the code it lives.** File and line. The engineer opens this and is already at the
   right place.

## The rule: name the token or the prop, never a raw value

"The colour looks off" is not a finding — it names no expectation, no token, and no source. It's an
impression, and it can't be acted on without the engineer redoing the comparison you already did.

The rule applies to both sides. Reporting the expectation as "a darker blue" is as unusable as
reporting the observation that way. Each side gets a token name, a prop name, or — when the design
genuinely leaves it unbound — an explicit statement that it's unbound. A hex value is never the
answer on either side, even when you have it sitting right in front of you; if you find yourself
about to write one down, go find the token it should have resolved to, or the token it's wrongly
using instead.

## Example — good

```
Case      Button · primary · md · hovered
Expected  border-color: var(--color-border-focus), per get_variable_defs on the node
Actual    border-color: var(--color-border-default) — hover isn't swapping the token
Where     src/components/Button/Button.css:31
```

This is actionable without a reply. The engineer knows which row, which token should be there,
which token is there instead, and the exact line to open.

## Example — bad, and why it fails

```
The hover border looks wrong on the primary button.
```

- **No case.** Which size, which context? "The primary button" could be four different rows in
  the matrix.
- **No token on either side.** "Looks wrong" names no expectation and no observation — the engineer
  has to re-run the same comparison qa already ran, from scratch, before they can even start
  fixing anything.
- **No location.** The engineer now has to go find the file themselves before they can start.

This isn't a finding. It's a symptom, handed over undiagnosed.

## Self-check
- [ ] The case names variant, size, state, and context — not just the component
- [ ] The expected value names a token or prop, plus the tool call or source that confirmed it
- [ ] The actual value names a token or prop — or states plainly that none is applied
- [ ] Neither side contains a raw hex, pixel, or font value
- [ ] A file and line are named
- [ ] Read alone, with no other context, the engineer could open the file and start fixing
