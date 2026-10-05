---
name: component-intent
description: Write the intent file for a component — {Name}.intent.json beside its source, with use_when, dont_use_when, variant_intent, placement, pairs_with, required_tokens and a11y — transposed from the component's documentation page in Figma and read off its code and stories. Never invents a product rule; a field it cannot source stays empty and is reported as a gap.
---

# Component intent

Props say **how** to call a component. They never say **when** to reach for it, or when to reach for a
different one — which is the only question a consumer actually has. The intent file says that.

`<Name>.intent.json` is the **only copy**. The Storybook docs page, the Component Intent gallery and the
docs site all read it. Write the JSON and every surface follows; never write the same sentence into a
second place.

The agent that runs this is the `doc-generator` (Job A). It writes this file and nothing else.

## When to use this

Use it for a component whose `Development` reads `Completed` and that has no intent file yet, or whose
file is older than its last change. Do not use it for a component that is not `Completed`: there is no
finished design to transpose and no shipped code to read.

## The file

Beside the component's source, named after the exported component, in the same case:
`src/components/<folder>/<Name>.intent.json`, for example `Button.intent.json`. The name must match the
exported symbol, the folder, the CSS prefix and the board row exactly — release-review gate R4 checks it.

```json
{
  "component": "<Name>",
  "figma": "<the registry Figma URL for this component>",
  "use_when": ["<line from the Figma usage region, verbatim>"],
  "dont_use_when": [
    { "when": "<line from the Figma usage region, verbatim>", "instead": "<Component name>" }
  ],
  "variant_intent": { "<variant value>": "<what that variant is for>" },
  "placement": ["<where it goes>"],
  "pairs_with": ["<Component name>"],
  "required_tokens": ["<token name>"],
  "a11y": [{ "fact": "<specific fact>", "source": "<file:line or Figma note>" }]
}
```

- `figma` is one URL, or an array of URLs when the one coded component covers several Figma component
  sets (for example Input Field/Primary and Input Field/Mobile). `use_when` and `dont_use_when` then merge
  the lines of every page, in page order, with identical lines kept once.
- `instead` is the component to use in its place. If the usage region gives none, write `null` — do not
  guess one. (release-review treats a `null` as a warning, never a blocker.) If the page names an
  alternative that **is not in the library yet** (for example "Use a switch"), write the name as the page
  gives it and list it in the gap report as "alternative not in the library".
- Every list may be empty. **An empty field is honest; a plausible sentence is not.**

## Where each field comes from

Read the sources **in this order** and stop filling a field the moment its source is exhausted.

### 1 · The component's documentation page in Figma

Open the registry row's `Figma` link through the Figma connection and read the component's own
documentation frame beside the component set. Its **usage region** already carries *when to use*,
*when not to*, and *best practice*, and its accessibility note sits with it.

- `use_when` ← the "when to use" / "Do" lines.
- `dont_use_when` ← the "when not to" / "Don't" lines, each with the alternative the page names.
- `a11y` ← the accessibility note, one fact per entry, `source` naming the Figma node.

**Transpose faithfully.** Copy the page's wording; split into entries only where the page itself
breaks lines. Do not paraphrase it into something vaguer, do not merge two lines into one, do not add a
"typically". If you would have to reword to make a line fit, the line stays as written.

### 2 · The component's code

For the two fields the design cannot answer:

- `required_tokens` ← every `var(--…)` the component's CSS references, extracted mechanically (a search,
  not a read-through), deduplicated and sorted, **keeping only names that exist in the built tokens**
  (`build/css/tokens.css` and `tokens-dark.css`). A `var(--…)` that is not a token — a custom property the
  component's own CSS defines, such as the `--hz-*-unbound` values parked for what the design leaves
  unbound — is **not** a required token. Leave it out of the list and report each one in the gap report as
  an "unbound literal"; release-review R2 will find the raw value behind it.
- `variant_intent` ← one key per variant value the code actually has (each value of every variant prop
  and state), with what it is for **as the Figma page or the story describes it**. A variant with no
  source gets an empty string and goes in the gap report; it is never left out of the object.
- `a11y` ← facts the code itself establishes (the role, `aria-*` it sets, the keyboard behaviour, what
  is real DOM `disabled`), each with `source` as `file:line`. State what the code does, not what it
  ought to do.

### 3 · The stories

- `placement` ← where the stories and the Figma page show it sitting (inside a form, beside a label, at
  the end of a row). Only what they show.
- `pairs_with` ← other **library components** that appear together with it in a story or in the Figma
  page. Each name must be a real component in this library. Anything else is not a pairing.

## When there is no usage region in Figma

Leave `use_when` and `dont_use_when` **empty** and list the component as a gap. Do not write them from
the code, from the story names, or from what the component "obviously" is for. A product rule you made up
is worse than an empty field, because nothing downstream can tell it is wrong — release-review reads a
sentence in these fields as fact.

## Before you save

Check each of these, and fix the file rather than the check:

- [ ] The JSON parses.
- [ ] `component` equals the exported symbol, the folder name and the registry row's name.
- [ ] Every `use_when` and `dont_use_when.when` line appears **verbatim** on the Figma page.
- [ ] Every `required_tokens` entry exists in `build/css/tokens.css`.
- [ ] Every variant value in the code has a key in `variant_intent`.
- [ ] Every `pairs_with` names a component that exists in the library. Every non-null `instead` does too,
      or is an alternative the Figma page names that is not built yet, listed as such in the gap report.
- [ ] Every `a11y` entry names a source you can open.

## Report

When the run ends, report, and keep it to this:

```
📝 doc-generator · intents
Written:  Button, Check Box
Gaps:     Pin Code — no usage region (use_when, dont_use_when empty)
          Check Box — variant_intent "Unchecked": no source
Not run:  Tooltip (not Completed)
```

Never "looks good". A gap you did not list is a gap the reviewer will find and block on.

## Where it lands

Commit the intent files on a branch from `staging` and open the PR into `staging` for a human to merge.
Never push to `main`, never open a PR into `main`: `main` accepts PRs from `staging` only.

## Never

- Never invent a product rule, a "typical" use, an alternative, or a pairing.
- Never paraphrase the Figma usage region.
- Never fill an empty field from the code to make it look complete.
- Never edit `src/components/*` source, the stories, `tokens/` or `build/`. You read them.
- Never write Airtable, in any table. The board's `Figma` link is read-only to you.
- Never write the same intent sentence into a second file. This one file is the copy.
- Never write an intent file for a component that is not `Completed`.
