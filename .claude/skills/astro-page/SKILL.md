---
name: astro-page
description: Build the whole Horizon Stays docs site on Astro Starlight in docs-site/, every run — the fixed sidebar, the splash home, one five-tab page per Cleared component, the generated Tokens, Changelog, Roadmap and News — from the repo at a pinned commit, the board's statuses, the live Figma reads and the intent files. Verifies every built and deployed page, and never invents a missing source.
---

# Astro page

This skill builds the **whole site every run**, never one page at a time. A component page built alone
leaves the home, the lists, the changelog and the badges describing a site that no longer exists.

The format to match is the reference site: https://horizon-docs-alpha.vercel.app

The agent that runs it is the `doc-generator` (Job B). It builds and verifies; it does **not** write
Airtable. `devops` opens each verified page and writes `Astro Link`.

## Where it lives

Astro Starlight in `docs-site/`, on the `astro` branch, with its own `package.json` and lockfile. A
Vercel project deploys that branch. `tools.md` records the folder, the project and the production URL.
Install with `npm install`, not `npm ci`: a lockfile written on macOS can leave out packages Linux needs.

## What gets a page

A component gets a page only if the board row reads `Development` = `Completed` or `Released` **and**
`Release Verdict` = `Cleared`. Anything else is not in the site. If asked to build a page for one, say
so and do not comply.

## The sidebar

Written out in full in `astro.config.mjs`, in exactly this order, so a missing page **fails the build**
instead of silently vanishing from the navigation:

| Section | Pages |
|---|---|
| Get Started | Changelog, Roadmap, News, Versioning, Upgrading |
| Designing | Introduction |
| Developing | Introduction, React, React Router |
| Skills | Knowledge skill |
| Core | Components (All components, then one page per component), Tokens |
| Styling | Theming |
| Help | FAQ, Report a bug, Request a feature, Contributing, Embedding |

## The home page

A splash page.

- **Hero line:** the README's first paragraph.
- **Buttons:** Start designing, Start coding, Open Storybook.
- **Then:** the latest release with its install command, and link cards to Designing, Developing,
  Components and Tokens.

## A component page

A **header strip**: its status and the version it shipped in, then links to Storybook, the Figma node
and the source. Then **five tabs, in this order**:

| Tab | What it holds |
|---|---|
| **Usage** | From the intent file: when to use, where it goes, when not to (with each alternative), best practice, what each variant is for, the accessibility facts linked to their source lines, composition, and what this version promises. |
| **Examples** | The README usage example, then every story that is not a variant-matrix row, embedded live from Storybook in light and dark. |
| **Code** | The import; props with defaults and doc comments; union types; the tokens it needs with light and dark values; and Storybook's own props table embedded. |
| **Design** | The Figma node embedded; the variant matrix with every matrix story linked, in both themes; every value Figma never bound; and the design gaps recorded against the component. |
| **Changelog** | `git log` for the component and its subcomponents, each commit marked with the version it shipped in. |

## Generated, and written

**Generated, never edited by hand:** Home, All components, every component page, Tokens, Changelog,
Roadmap, News. One script builds them: `docs-site/scripts/generate.mjs`. Its inputs are:

- the repo at a **pinned commit**;
- two source files you write on each run: the board's statuses (**no record IDs**) and the live Figma
  reads;
- the deployed Storybook's `index.json`.

A generated page that is wrong is fixed in the **source or the script**, then regenerated. Never edit
the page.

**Written from the repo:** every guide. Each run **re-reads each guide against the code** and corrects
any sentence that has stopped being true.

**Roadmap and News state no date, owner or priority that a source does not state.**

## The site wears the system's own tokens

One stylesheet maps Starlight's variables onto the system's **semantic tokens**, with **no hex of its
own**. Fonts are self-hosted.

## A missing source

Keep the section in place with a notice naming exactly what is missing. Never invent it. A tab that
vanishes when its source is missing looks like a decision; a visible notice looks like a gap, which is
what it is.

## Before pushing

1. Build with **zero broken internal links**.
2. Open the **home page**, **one component page (every tab)** and **Tokens**, in **light and dark**.

Do not push on a build you did not open. Push to the `astro` branch only; Vercel deploys it. Never
deploy by hand, and wait until that commit's deployment reads success.

## After deploying

1. Fetch **every live page**. Each returns **200**.
2. Each component page has **all five tabs, each with content** (or the missing-source notice).
3. Every header link returns **200**, except a Figma link to a team-only file, which may answer
   **403**. That exception is for `figma.com` links only, and for nothing else.
4. Report the list of verified component pages, each as a deep link.

If verification fails, report every page that failed and hand over **no links for them**. A page that
failed is not "nearly there"; it is not recorded.

## Hand-off

You do **not** write `Astro Link`. `devops` owns it, and writes it only after opening the page and
seeing it render, because a link written by the agent that built the page is a claim rather than a
record. Your report is the list `devops` opens.

## Never

- Never build one page at a time.
- Never edit a generated page by hand — fix the source or the script.
- Never generate a component page for a row that is not `Completed` or `Released` with a `Cleared`
  verdict.
- Never invent intent, a date, an owner, a priority or a missing source.
- Never put a record ID, a base ID or a table ID in the site or its source files.
- Never push a site you did not build and open, or deploy by hand.
- Never write a link, or any cell, in Airtable.
- Never write `Release Review`, `Release Verdict` or `Development`.
- Never use a hex colour of the site's own: the stylesheet maps onto the semantic tokens or it does not
  ship.
