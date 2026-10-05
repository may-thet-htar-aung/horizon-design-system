// npm run release:publish -- <version> [--dry-run]
//
// The only way this package is published. It re-runs every gate, refuses a version that is already
// on the registry, takes `"private": true` out of package.json for the publish command and nothing
// else, puts it straight back, publishes, then installs what it published into an empty folder and
// renders every exported component from it.
//
// It does NOT edit the version and does NOT tag. A human puts the approved version in package.json
// (through staging) and tags the release — see VERSIONING.md. This script only checks the two agree.
//
// `"private": true` stays in package.json so a stray `npm publish` is refused. The restore is
// registered on `exit`, on SIGINT, on SIGTERM and on uncaught errors — never a `finally` alone,
// because `finally` does not run when something calls process.exit().

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkgPath = path.join(root, 'package.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const version = args.find((a) => !a.startsWith('--'));

const run = (cmd, cmdArgs, options = {}) =>
  spawnSync(cmd, cmdArgs, { cwd: root, encoding: 'utf8', shell: true, ...options });
const out = (cmd, cmdArgs, options) => run(cmd, cmdArgs, options).stdout?.trim() ?? '';

function fail(message) {
  console.error(`\nrelease:publish refused: ${message}`);
  process.exit(1);
}
const pass = (message) => console.log(`  ✓ ${message}`);

// ------------------------------------------------------------------ the guard's restore
const original = readFileSync(pkgPath, 'utf8');
let restored = true;
function restore() {
  if (restored) return;
  writeFileSync(pkgPath, original);
  restored = true;
}
process.on('exit', restore);
process.on('SIGINT', () => { restore(); process.exit(130); });
process.on('SIGTERM', () => { restore(); process.exit(143); });
process.on('uncaughtException', (error) => { restore(); console.error(error); process.exit(1); });

function unlock() {
  const pkg = JSON.parse(original);
  delete pkg.private;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  restored = false;
}

// -------------------------------------------------------------------------- the gates
const pkg = JSON.parse(original);
console.log(`release:publish ${version ?? '(no version)'}${dryRun ? ' --dry-run' : ''}`);

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) fail('give one version, as MAJOR.MINOR.PATCH, e.g. 0.1.0');
pass(`version ${version}`);

if (pkg.version !== version) {
  fail(`package.json says ${pkg.version}, not ${version}. A human puts the approved version in package.json through staging; this script never writes it.`);
}
pass('package.json carries that version');

if (!/^@[^/]+\/[^/]+$/.test(pkg.name ?? '')) fail(`the name ${pkg.name} is not scoped`);
pass(`scoped name ${pkg.name}`);

if (pkg.private !== true) fail('"private": true is missing from package.json — the guard must be in place before this runs');
pass('"private": true guard is in place');

const dirty = out('git', ['status', '--porcelain', '--', '.', ':!node_modules']);
const branch = out('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
run('git', ['fetch', 'origin', 'main', '--quiet']);
const behind = out('git', ['rev-list', '--count', 'HEAD..origin/main']);
const ahead = out('git', ['rev-list', '--count', 'origin/main..HEAD']);
const gitProblems = [
  dirty && 'the working tree is not clean',
  branch !== 'main' && `you are on ${branch}, not main`,
  (behind !== '0' || ahead !== '0') && 'main is not level with origin/main',
].filter(Boolean);
if (gitProblems.length) {
  if (dryRun) console.log(`  ! dry run only, would refuse a real publish: ${gitProblems.join('; ')}`);
  else fail(gitProblems.join('; '));
} else {
  pass('clean tree, on main, level with origin/main');
}

const who = out('npm', ['whoami']);
if (!who) fail('npm whoami returns nothing: not signed in. Do not run `npm login` — it replaces the granular token. Set it with `npm config set //registry.npmjs.org/:_authToken <token>`.');
pass(`npm user ${who}`);

const existing = out('npm', ['view', `${pkg.name}@${version}`, 'version']);
if (existing === version) fail(`${pkg.name}@${version} is already on the registry. Never publish the same version twice.`);
pass(`${version} is not on the registry`);

for (const script of ['build:package', 'test']) {
  console.log(`  … npm run ${script}`);
  const result = run('npm', ['run', script], { stdio: 'inherit' });
  if (result.status !== 0) fail(`npm run ${script} failed`);
  pass(`npm run ${script}`);
}

// ------------------------------------------------------------------------- the publish
console.log(`\n  publishing${dryRun ? ' (dry run — nothing leaves this machine)' : ''}`);
unlock();
let publish;
try {
  publish = run('npm', ['publish', '--access', 'public', ...(dryRun ? ['--dry-run'] : [])], { stdio: 'inherit' });
} finally {
  restore();
}
if (publish.status !== 0) fail('npm publish failed');
pass('"private": true is back in package.json');

// ------------------------------------------------------- install it and render from it
const sandbox = mkdtempSync(path.join(tmpdir(), 'horizon-smoke-'));
run('npm', ['init', '-y'], { cwd: sandbox });
let spec;
if (dryRun) {
  const packed = out('npm', ['pack', '--pack-destination', sandbox, '--silent']).split(/\r?\n/).pop();
  spec = path.join(sandbox, packed);
} else {
  // npm may not list the version for a moment after publishing. If it never appears, do NOT publish again.
  let listed = false;
  for (let i = 0; i < 24 && !listed; i += 1) {
    listed = out('npm', ['view', `${pkg.name}@${version}`, 'version']) === version;
    if (!listed) spawnSync('node', ['-e', 'setTimeout(()=>{},5000)']);
  }
  if (!listed) {
    console.error(`\nPublished, but ${pkg.name}@${version} is not on the registry yet. Never publish it again. Wait, then run:\n  node scripts/smoke-test.mjs <installed package dir> <install root>`);
    process.exit(2);
  }
  spec = `${pkg.name}@${version}`;
}
console.log(`  … installing ${dryRun ? 'the packed tarball' : spec} into an empty folder`);
const install = run('npm', ['install', `"${spec}"`, 'react@^19', 'react-dom@^19', '--no-audit', '--no-fund'], { cwd: sandbox, stdio: 'inherit' });
if (install.status !== 0) fail(`npm install failed in ${sandbox}`);
const installed = path.join(sandbox, 'node_modules', ...pkg.name.split('/'));
const smoke = run('node', [path.join(root, 'scripts/smoke-test.mjs'), `"${installed}"`, `"${sandbox}"`], { stdio: 'inherit' });
if (smoke.status !== 0) fail('the installed package failed its smoke test');

console.log(`\n${dryRun ? 'dry run complete' : `published ${pkg.name}@${version}`}. Tag the release yourself (a human tags; see VERSIONING.md).`);
