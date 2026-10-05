# Versioning

Horizon Stays follows [semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

| Bump | When | Examples |
|---|---|---|
| **MAJOR** | A consumer's existing markup breaks | A prop renamed or removed; a variant deleted; a semantic token's meaning changed |
| **MINOR** | Something is added, and nothing existing breaks | A new component; a new variant, size, or state; a new token |
| **PATCH** | A fix that changes no public surface | A wrong token binding corrected; a hover state that never fired; a docs page |

A token rename is a MAJOR bump. Tokens are public surface — anyone consuming
`build/css/tokens.css` is referencing those names directly, and a rename breaks them exactly the
way a renamed prop does.

## Why a human bumps the version

**No agent may edit `package.json` or create a tag.** Not the engineer, not devops, not reviewer.
This is deliberate, and it is the reason `reviewer.md` and `devops.md` both point here.

A version number is a promise made to people outside this repo. Everything the crew produces is
*evidence* — a link that was opened, a row that was measured, a report written at the commit it
reviewed. A version is different in kind: it is a claim about compatibility that nobody can verify
by opening a URL, and that cannot be withdrawn once someone has installed it.

`Release Verdict` reading `Cleared` is the strongest statement the pipeline can make, and it still
only means *the seven gates passed*. It is not permission to publish. It tells a human the
component is fit to carry a version number; choosing the number, and standing behind what it
promises, stays with the human.

**Who does what.** The human approves the version and is the only one who edits `package.json` and
tags. The `release` agent *performs the publish* once the human has approved the version, through
`npm run release:publish`, which refuses unless `package.json` already says that version. An agent
never picks the number, edits `package.json`, or tags.

Similarly, `Released` in the registry is a **record that a release happened**, not an instruction
to perform one. An agent reading `Released` should conclude the work is finished and published —
never that it should now go and publish something.

## Release order

1. `Development` reads `Completed` — the component is live in production
2. reviewer clears it — `Release Review` and `Release Verdict` written together
3. **A human approves the version.** The `release` agent proposes one and names the change that forces
   it; the human approves it by naming it in the instruction ("release and publish 0.1.0") and by
   putting it in `package.json` on `main`, through `staging`. No agent edits `package.json`.
4. The `release` agent publishes the package through `npm run release:publish`, for `Cleared`
   components only. It does not tag.
5. The doc-generator takes the docs site live, only after the publish
6. devops opens each docs page and records `Astro Link` — `Development` reads `Released`
7. **A human tags the release.**

Steps 3 and 4 are the change from the original order, where a human did all of them. Publishing is now
an agent's job, with the version approval and the tag still a human's. Each step waits on the one
before it: nothing is published on a `Blocked` or empty verdict, and no docs page is recorded before
the package it describes is on npm.
