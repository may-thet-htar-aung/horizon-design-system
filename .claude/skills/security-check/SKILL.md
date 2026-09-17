---
name: security-check
description: A pre-deploy gate that scans build output for known-shape credentials, private identifiers, and environment leakage, checks dependency advisories and working-tree cleanliness, and can verify a live URL's public/protected posture. States plainly what it does not catch.
---

# Security check

## What this is

A gate to run before anything ships — static, and live. It is pattern-matching against known
shapes, not a security audit. A clean run means "nothing recognizable was found." It does not mean
"this is secure." Say that out loud every time you're tempted to shorten it.

Run it: `node scripts/security-check.mjs`. No dependencies — Node built-ins only.

## What this covers

**1 · Credentials in build output — by provider-specific pattern, not entropy.**
Scans the built output for the fixed shapes real providers issue: AWS access keys, GitHub tokens,
Slack tokens and webhook URLs, Stripe secret/restricted keys, Google API keys, npm tokens, Figma
personal access tokens, Airtable personal access tokens and legacy keys, and PEM private-key
blocks. Deliberately not entropy-based — see "What this does not cover."

**2 · Private identifiers.**
Two ways, because one alone either misses or cries wolf:
- **Exact match on the real IDs.** The base and table IDs in `.claude/registry.local.json` — the
  ones `.claude/skills/registry/SKILL.md` says must never be hardcoded — are searched for verbatim,
  at `critical`. Nothing about their spelling can hide them. If the file is absent (it's gitignored,
  so a CI clone won't have it), the run prints a `[NOTE]` saying this part was skipped.
- **Shape match for any Airtable ID** — base, table, record, field, view (`app…`, `tbl…`, `rec…`,
  `fld…`, `viw…`) and legacy keys (`key…`). A shape match whose 14-character tail is letters only
  and reads as camelCase words is skipped: minified JavaScript is full of names like
  `applyRegistration`, `keySeparatorIndex` and `reconcilerVersion`, which are prefix + 14 letters and
  aren't IDs. A real ID's tail is random and almost always carries a digit.

Plus private IPv4 ranges (`10.x`, `172.16–31.x`, `192.168.x`), and `.internal` / `.corp` / `.lan`
hostnames **where a host can actually appear** — after a scheme's `//`, after `user@`, or at the
start of a quoted string — and ending at a port, path, quote, space or end of text. Property access
like `link.internal`, or a name like `` `storybook.internal.composedWith` ``, isn't a hostname.

**3 · Environment leakage into client JS.**
Two checks: any `.env` value whose key looks secret (`SECRET`, `TOKEN`, `KEY`, `PASSWORD`, `PWD`,
`CREDENTIAL`) found verbatim inside the build output, and any `import.meta.env.<NAME>` reference in
built files where `<NAME>` isn't `VITE_`-prefixed. Vite only exposes `VITE_`-prefixed variables to
client code on purpose; anything else surviving into the bundle is a bundler-config bug leaking a
server-side variable, not a false alarm.

The `import.meta.env` / `process.env` *reference* checks skip `sb-manager/` — Storybook's
precompiled manager UI, copied byte-for-byte from `node_modules/storybook/dist/manager/`. Nothing
in it is compiled from this repo, so a reference there can't be one of our variables. The verbatim
`.env` value check still scans every file, `sb-manager/` included, and so do the credential and
private-ID checks.

**4 · Dependency advisories.**
Shells out to `npm audit --json` — already part of the toolchain, nothing new installed — and fails
on any `high` or `critical` advisory.

**5 · A dirty working tree.**
`git status --porcelain` must come back empty. Deploying from an uncommitted tree means nobody can
later point at what's actually live.

**6 · Live mode — a public/protected check against a deployed URL.**
`--live <url> --expect public|protected`. Fetches the URL with no credentials and classifies the
response, then fails if that doesn't match what was declared — **in either direction**:
- Expected `public`, got a 401/403 → fails. Something meant to be visible is locked — usually a
  broken deploy, not a security win.
- Expected `protected`, got a 200 → fails. Something meant to require auth is wide open.
A 404, a 5xx, or a network error is reported as **inconclusive**, and inconclusive fails the gate
too — an unknown posture is not a pass.

## What this does not cover

Said plainly, because a gate that implies more than it checks is worse than no gate:

- **No entropy scanning.** A real secret that doesn't match one of the known shapes above — a
  bespoke internal token, a key from a provider not in this list — is not caught. This tool trades
  recall for zero false positives on formatting; it is not a substitute for an entropy-based
  secret-scanning service.
- **No git history scan.** Only the current working tree and the current build output are checked.
  A credential committed and later removed is still in history, and this will not find it.
- **No static application security testing.** It does not look for injection, XSS, insecure
  deserialization, auth-logic bugs, or any vulnerability class that isn't "a secret-shaped string
  sitting somewhere it shouldn't be."
- **No penetration testing.** Live mode makes exactly one unauthenticated GET and reads the status
  code. It says nothing about a crafted request, a different method, or a session that's
  improperly scoped.
- **Advisories are only as current as npm's registry.** An unreported or very fresh CVE will not
  show up in `npm audit`. Clean means "nothing known today," not "nothing wrong."
- **Pattern lists rot.** A provider that changes its token format, or one never added to this
  list, passes silently. Treat the pattern list as a living document, not a finished one.
- **The camelCase filter trades a sliver of recall for silence on minified code.** An Airtable ID
  from *another* base whose random tail happens to be letters-only camelCase would be skipped by
  the shape check. Our own base and table IDs are unaffected — they're matched exactly. Record,
  field and view IDs of our own base are not in `registry.local.json`, so they rely on the shape
  check alone.
- **A hostname outside a URL or quoted string isn't caught** — e.g. one assembled from parts at
  runtime, or written in a comment without quotes.
- **`process.env` references inside `sb-manager/` aren't reported.** If a future Storybook version
  compiled project code into that directory, this assumption would need revisiting.

A clean run means: no known-shape credential, no flagged private ID, no detected env leak, no
high/critical advisory, a clean tree, and — in live mode — the URL's posture matched what was
declared. Nothing more.

## Who runs it, and when

- **engineer** runs the static checks (1–5) against its own build output during the **register**
  stage, before deploying to staging — no reason to wait for qa to catch what a script catches in
  seconds. Add `--live <staging-url> --expect protected` when staging is meant to be non-public;
  skip live mode when it's intentionally open.
- **devops** runs the full set — static checks (1–5) against `main` before promoting, and live
  mode against both the production Storybook (`--expect public`, since it's meant to be seen) and
  the documentation site — before writing `Production Storybook` or `Astro Link`. A link isn't
  evidence until it's been opened; this is now part of what "opened" means.
- Nobody else runs it as a gate. **pm** may run it read-only, out of band, as one more thing to
  sweep — but a finding from pm's run is a report, not a block, since pm fixes nothing and owns
  nothing.

## Usage

```bash
node scripts/security-check.mjs                       # static checks against build/
node scripts/security-check.mjs --dir storybook-static
node scripts/security-check.mjs --only credentials,private-ids
node scripts/security-check.mjs --skip dirty-tree      # e.g. local dry runs
node scripts/security-check.mjs --live https://example.com --expect public
node scripts/security-check.mjs --json                 # machine-readable report
```

Exit code is `0` only if every check that ran found nothing, static or live. A real finding or an
inconclusive live result both exit non-zero — on purpose, so a calling script can't treat "I
couldn't tell" as a pass.

## Self-check
- [ ] The scan ran against the actual build output, not source alone
- [ ] Every finding names the specific pattern matched and the file it was found in
- [ ] Live mode was run against the real deployed URL, not localhost
- [ ] A clean result was reported as "nothing recognizable found," not as "secure"
- [ ] `npm audit` ran to completion, or its failure to run was reported, not silently skipped
- [ ] The working tree was actually checked, not assumed clean
