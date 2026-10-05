// `npm test`. Checks that the built package is what package.json promises, and that every
// exported component renders. Run it against dist/ after `npm run build:package`.
//
//   node scripts/smoke-test.mjs               test ./dist
//   node scripts/smoke-test.mjs <package-dir> <install-root>
//                                             test an installed copy: react and react-dom are
//                                             resolved from <install-root>, so the component and the
//                                             renderer share ONE copy of React (used by release:publish)

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const target = path.resolve(process.argv[2] ?? '.');
const installRoot = path.resolve(process.argv[3] ?? target);
const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

const pkg = JSON.parse(await readFile(path.join(target, 'package.json'), 'utf8'));

// 1. every file the exports map points at exists
const files = new Set();
const walk = (v) => {
  if (typeof v === 'string') files.add(v);
  else if (v && typeof v === 'object') Object.values(v).forEach(walk);
};
walk(pkg.exports);
for (const rel of files) {
  try {
    await access(path.join(target, rel));
  } catch {
    failures.push(`exports points at ${rel}, which does not exist`);
  }
}

// 2. both module formats load, and export the same names
const esm = await import(pathToFileURL(path.join(target, pkg.exports['.'].import)).href);
const cjs = createRequire(import.meta.url)(path.join(target, pkg.exports['.'].require));
const names = Object.keys(esm).sort();
check(names.length > 0, 'the entry exports nothing');
check(
  JSON.stringify(names) === JSON.stringify(Object.keys(cjs).sort()),
  'the ESM and CJS builds export different names',
);

// 3. every export renders to markup with its default props
const fromRoot = createRequire(path.join(installRoot, 'noop.js'));
const { renderToString } = fromRoot('react-dom/server');
const { createElement } = fromRoot('react');
for (const name of names) {
  try {
    const html = renderToString(createElement(esm[name]));
    check(html.length > 0 && html.includes('hz-'), `${name} rendered no Horizon markup`);
  } catch (error) {
    failures.push(`${name} threw while rendering: ${error.message}`);
  }
}

// 4. react is a peer dependency, not a bundled one
check(pkg.peerDependencies?.react, 'react is not a peer dependency');
const bundle = await readFile(path.join(target, pkg.exports['.'].import), 'utf8');
check(!/react\.production|react-dom\.production/.test(bundle), 'react looks bundled into the build');

if (failures.length) {
  console.error(`smoke test FAILED (${failures.length}):\n - ${failures.join('\n - ')}`);
  process.exit(1);
}
console.log(`smoke test passed: ${names.join(', ')} render from ${path.relative(process.cwd(), target) || '.'}`);
