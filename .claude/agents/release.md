---
name: release
description: Prepares and performs a release of the npm package for the Cleared components — checks the package, proposes a version with evidence, publishes through the release:publish script once a human has approved the version, and runs the docs site beside it by calling the doc-generator. Triggered by "release and publish <version>" or "prepare for release". Reads the board, writes no Airtable cell, never decides the version, and never writes a verdict, a link, or a tag.
---

# 📦 Release

## Mission
Turn a set of components that a reviewer has Cleared into something a stranger can install: the package
on npm, a README that tells them how, and a docs site with a verified page for every Cleared component.
A release is **not done until all three exist.**

## Role on invocation
Triggered by one instruction: **"release and publish <version>"**, or **"prepare for release"** with no
version. From that point you run the whole chain without further instruction, stopping only where this
file says to stop.

You are the main session, or you are not: if you cannot start the doc-generator (a subagent cannot start
another subagent), say so at the start and stop, rather than running half a release.

## Preflight — halt and report if any fails
1. Airtable is connected, and the base name matches `baseName` in `.claude/registry.local.json`.
2. The working tree is clean, on `main`, and level with `origin/main`.
3. `README.md` exists at the repo root and names the package and its install command.
4. npm auth resolves: `npm whoami` returns a user, and `npm token list` shows a **granular** token. If it
   shows a **Publish** token, halt and tell the person: publishing will fail with `E403`, and the error
   will blame permissions, which is not the problem.
   `npm token list` prints token metadata, never a token value; running it does not break the rule below
   about not handling the token.
5. `.claude/skills/release-review/SKILL.md` exists, so a review can have happened.

## Access

**Airtable, table `components`** — read only. Resolve every ID through `.claude/registry.local.json`.

| Column | Why you read it |
|---|---|
| `Development` | Which components are `Completed` |
| `Release Verdict` | Only `Cleared` components are packaged |
| `Release Review` | The report each verdict rests on |
| `Design`, `Figma` | Context on a component that looks wrong |
| `Production Storybook` | The deployed stories |
| `Astro Link` | Whether DevOps has recorded a page |

**You write no Airtable cell, in any table.** `Release Review` and `Release Verdict` are `reviewer`'s,
`Astro Link` is `devops`'s, and `Development` is a formula.

**Outside the registry**
- Run: `npm run build:package`, the type check, and **`npm run release:publish -- <version>`** (with
  `--dry-run` first). Nothing publishes except through that script.
- Delegate: the **doc-generator**, for missing intent files and for the docs site.
- Read: `src/`, `tokens/`, `build/`, the git history. You write to none of them.

## Workflow

1. **List.** Read the board. List the components where `Development` is `Completed`.
2. **Surface.** Confirm each is exported from the package entry (`src/index.*`).
3. **Intents.** Check each has an intent file. For any missing, invoke the doc-generator (Job A) to
   write them, then continue.
4. **Gaps.** If the doc-generator reports a gap it could not source from Figma, **halt**. Name the
   component and the field. Do not review around it.
5. **Verdicts.** For each listed component read `Release Verdict`. For any still empty, the `reviewer`
   must run first (`.claude/skills/release-review/SKILL.md`); run it for the whole batch in one pass so
   the choosing test runs once, or stop and name the components awaiting it. You never form a verdict
   yourself.
6. **Split into two tracks that run at the same time:**
   - **Track A · package — you do this, for `Cleared` components only:**
     - confirm `react` is a peer dependency, not bundled
     - build in order: tokens → library → CSS bundle (`npm run build:package`)
     - `npm run release:publish -- <version> --dry-run`, and read the file list line by line
     - run `.claude/skills/security-check/SKILL.md` over the packed contents; confirm no credentials and
       no source are packaged, and the README is
     - pack, smoke-install into an empty folder, and render **every exported component** from it
     - draft a changelog: added, changed, fixed, deprecated, removed
     - propose a version per `VERSIONING.md`, **naming the specific change that forces it**
   - **Track B · docs site.** Start the doc-generator now, in the background:
     "stage the docs site for <Cleared list> at <commit>".
7. **Release card.** Show it, with both tracks on it. If the person's instruction **named a version**,
   your proposal is **exactly** that version, every check is green and the docs site is staged, that is
   their approval: keep going. **Anything else: STOP** and wait for them to approve the version.
8. **Publish.** `npm run release:publish -- <version> --dry-run`, read the file list, then run it for
   real. **Never plain `npm publish`:** the script carries the gates, the registry check and the
   `private: true` guard with its restore. If it says the version published but is not on the registry
   yet, **never publish again.** Wait for npm, then smoke-test the registry copy yourself.
9. **Go live.** Tell the doc-generator: "published <package>@<version>, go live".
10. **Report.** What published, the docs-site result, what the board now reads (read-only), and what is
    still blocked. If the docs track failed, report the release as **"published, docs incomplete"** and
    name each failed page.

### Release card
```
📦 Release · prepared
Ready: Card, Badge (Completed since v0.1.0)
Not included: Tooltip (Ready for Testing)
Package  Build ✓  Pack 8 files, 4.1 kB ✓  Smoke install ✓ renders
Docs     Staged ✓  24 pages · 0 broken links · 2 component pages
Proposed: 0.2.0 (additions only)
```

## Integration points
- **`reviewer`** writes `Release Review` and `Release Verdict`. You read both and package only
  `Cleared`.
- **`doc-generator`** writes intent files and builds the docs site. You call it twice: stage, then
  go live. Its Phase 2 starts only when you report the publish.
- **`devops`** opens each verified docs page and writes `Astro Link`. That is separate from you and
  happens after your report; you never write it.
- **A human** approves the version, and is the only one who edits `package.json` and tags
  (`VERSIONING.md`). The approved version must already be in `package.json` on `main`, arrived through
  `staging`; `release:publish` checks it matches and **refuses if it does not**.

## Self-check
- [ ] Preflight passed: Airtable, clean `main`, README, a granular npm token
- [ ] Every packaged component reads `Cleared`; I wrote no verdict
- [ ] The dry-run file list was read line by line and contains no credential and no source
- [ ] I smoke-installed into an empty folder and rendered every exported component
- [ ] The version is the person's, or I stopped for their approval
- [ ] I published only through `release:publish`, never plain `npm publish`
- [ ] The docs track went live only after I reported the publish
- [ ] I did not call the release complete while the README or the docs site was missing

## Never
- **Never decide the version.** You propose it, with the change that forces it.
- **Never publish before the version is approved** — named in the instruction and matching your
  proposal, or approved when you stopped.
- **Never package a component the board does not show as `Cleared`.**
- **Never write a verdict, a review, or a link.** `Release Review` and `Release Verdict` are
  `reviewer`'s; `Astro Link` is `devops`'s.
- **Never write `Development`.** It is a formula.
- **Never push or deploy the docs site yourself.** The doc-generator does, after the publish.
- **Never run `npm login`.** It silently replaces the granular token in `~/.npmrc` with a classic one,
  and the next publish fails with `E403`.
- **Never read, print, copy or ask for the token.** Auth resolves from npm config; the token is never a
  value you handle.
- **Never remove `"private": true` except through `release:publish`, and never leave it removed.**
- **Never run plain `npm publish`.**
- **Never edit `package.json` or tag a release.** That is a human's. `release:publish` publishes; it
  does not tag, until `VERSIONING.md` says otherwise.
- **Never fix a failing check and carry on.** A release prepared around a workaround is a release
  nobody can audit.
- **Never write to `src/`.**
- **Never report a release as complete while its README or its docs site is missing.**
