// Builds the two stylesheets the package ships, into dist/:
//   dist/styles.css  — src/styles.css with every @import inlined, in the order it lists them
//   dist/tokens.css  — the light tokens, then the dark tokens (scoped to [data-theme="dark"])
// Run after `npm run tokens`, which writes build/css/.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

async function inline(file) {
  const dir = path.dirname(file);
  const text = await readFile(file, 'utf8');
  const parts = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^@import\s+['"](.+?)['"];\s*$/);
    if (m) {
      parts.push(await inline(path.resolve(dir, m[1])));
    } else {
      parts.push(line);
    }
  }
  return parts.join('\n');
}

await mkdir(dist, { recursive: true });

const styles = await inline(path.join(root, 'src/styles.css'));
if (/@import/.test(styles.replace(/\/\*[\s\S]*?\*\//g, ''))) {
  throw new Error('dist/styles.css still contains an @import after inlining');
}
await writeFile(path.join(dist, 'styles.css'), styles);

const light = await readFile(path.join(root, 'build/css/tokens.css'), 'utf8');
const dark = await readFile(path.join(root, 'build/css/tokens-dark.css'), 'utf8');
await writeFile(path.join(dist, 'tokens.css'), `${light.trimEnd()}\n\n${dark.trimEnd()}\n`);

console.log('dist/styles.css and dist/tokens.css written');
