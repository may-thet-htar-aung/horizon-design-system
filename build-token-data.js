import StyleDictionary from 'style-dictionary';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { TYPOGRAPHY_FIX } from './tokens-preprocessor.js';

// Emits one resolved JSON record set per "view" (a collection + mode from
// tokens/manifest.json) for Storybook to render. Storybook reads these rather
// than the raw token files so the gallery always shows post-transform values —
// the same hex/px/shorthand strings the platforms actually ship.

const T = 'tokens/';
const OUT = 'build/storybook/';
const CORE = T + 'core.value.tokens.json';
// The newer Figma core. semantic.* and layout.* are authored against THIS one —
// their aliases (spacing-16, color-sky-500, …) don't exist in core.value.
const CORE_FIGMA = T + 'core.light.tokens.json';
const TYPE_WEB = T + 'type.web.tokens.json';

// `own` filters output to the view's own file(s); the other sources are only
// present so aliases like {color-blue-600} can resolve.
const VIEWS = [
  { id: 'core', group: 'Core', title: 'Core', mode: 'value',
    sources: [CORE], own: ['core.value'],
    note: 'Earlier export. No longer built — superseded by the Figma core.' },

  { id: 'core-figma', group: 'Core', title: 'Core — Figma export', mode: 'light',
    sources: [T + 'core.light.tokens.json'], own: ['core.light'],
    note: 'Figma export. The core every platform build resolves against.' },

  { id: 'semantic-color-light', group: 'Semantic colour', title: 'Semantic colour', mode: 'light',
    sources: [CORE, T + 'semantic-color.light.tokens.json'], own: ['semantic-color.light'],
    note: 'Earlier export. No longer built — superseded by extended semantic.' },
  { id: 'semantic-color-dark', group: 'Semantic colour', title: 'Semantic colour', mode: 'dark',
    sources: [CORE, T + 'semantic-color.dark.tokens.json'], own: ['semantic-color.dark'],
    note: 'Earlier export. No longer built — superseded by extended semantic.' },

  { id: 'semantic-full-light', group: 'Semantic colour (extended)', title: 'Extended semantic', mode: 'light',
    sources: [CORE_FIGMA, T + 'semantic.light.tokens.json'], own: ['semantic.light'],
    note: 'Figma export. Built into tokens.css (:root).' },
  { id: 'semantic-full-dark', group: 'Semantic colour (extended)', title: 'Extended semantic', mode: 'dark',
    sources: [CORE_FIGMA, T + 'semantic.dark.tokens.json'], own: ['semantic.dark'],
    note: 'Figma export. Built into tokens-dark.css.' },

  { id: 'space-web', group: 'Semantic space', title: 'Semantic space', mode: 'web',
    sources: [CORE, T + 'semantic-space.web.tokens.json'], own: ['semantic-space.web'],
    note: 'Earlier export. No longer built — superseded by layout.' },
  { id: 'space-mobile', group: 'Semantic space', title: 'Semantic space', mode: 'mobile',
    sources: [CORE, T + 'semantic-space.mobile.tokens.json'], own: ['semantic-space.mobile'],
    note: 'Earlier export. No longer built — superseded by layout.' },
  { id: 'space-back-office', group: 'Semantic space', title: 'Semantic space', mode: 'back-office',
    sources: [CORE, T + 'semantic-space.back-office.tokens.json'], own: ['semantic-space.back-office'],
    note: 'Earlier export. No longer built — superseded by layout.' },

  { id: 'type-web', group: 'Type scale', title: 'Type scale', mode: 'web',
    sources: [CORE, TYPE_WEB], own: ['type.web'] },
  { id: 'type-mobile', group: 'Type scale', title: 'Type scale', mode: 'mobile',
    sources: [CORE, T + 'type.mobile.tokens.json'], own: ['type.mobile'] },
  { id: 'type-back-office', group: 'Type scale', title: 'Type scale', mode: 'back-office',
    sources: [CORE, T + 'type.back-office.tokens.json'], own: ['type.back-office'] },

  // Figma's styles alias typography.value ({size-label-large}, {family-plain}, …), not type.web.
  { id: 'typography-styles', group: 'Typography', title: 'Typography styles', mode: 'web',
    sources: [T + 'typography.value.tokens.json', T + 'typography.styles.tokens.json'],
    own: ['typography.styles'] },
  { id: 'typography-value', group: 'Typography', title: 'Typography primitives', mode: 'value',
    sources: [T + 'typography.value.tokens.json'], own: ['typography.value'] },

  // Elevation is composed from shadow parts in the Figma core ({elevation-shadow-color-key}, …).
  { id: 'effects', group: 'Effects', title: 'Elevation', mode: 'styles',
    sources: [CORE_FIGMA, T + 'effects.styles.tokens.json'], own: ['effects.styles'] },

  { id: 'layout-compact', group: 'Layout', title: 'Layout', mode: 'compact',
    sources: [CORE_FIGMA, T + 'layout.compact.tokens.json'], own: ['layout.compact'],
    note: 'Figma export. Built into iOS and Android (mobile).' },
  { id: 'layout-medium', group: 'Layout', title: 'Layout', mode: 'medium',
    sources: [CORE_FIGMA, T + 'layout.medium.tokens.json'], own: ['layout.medium'],
    note: 'Figma export. Built into tokens.css (web).' },
  { id: 'layout-expanded', group: 'Layout', title: 'Layout', mode: 'expanded',
    sources: [CORE_FIGMA, T + 'layout.expanded.tokens.json'], own: ['layout.expanded'],
    note: 'Figma export. Not wired into any platform yet.' },
];

const val = (t) => t.$value ?? t.value;
const desc = (t) => t.$description ?? t.description ?? '';
const type = (t) => t.$type ?? t.type ?? '';

StyleDictionary.registerFormat({
  name: 'json/records',
  format: ({ dictionary }) =>
    JSON.stringify(
      dictionary.allTokens.map((t) => ({
        name: t.name,
        cssVar: `--${t.name}`,
        path: t.path,
        type: type(t),
        value: val(t),
        // The alias as authored, e.g. "{color-blue-600}", or null when literal.
        alias: typeof t.original?.$value === 'string' && t.original.$value.startsWith('{')
          ? t.original.$value
          : null,
        description: desc(t),
        file: t.filePath.split(/[\\/]/).pop(),
      })),
      null,
      2,
    ) + '\n',
});

const buildView = async (view) => {
  const sd = new StyleDictionary({
    source: view.sources,
    preprocessors: [TYPOGRAPHY_FIX],
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: {
      json: {
        transformGroup: 'css',
        buildPath: OUT,
        files: [{
          destination: `${view.id}.json`,
          format: 'json/records',
          filter: (t) => view.own.some((o) => t.filePath.includes(o)),
        }],
      },
    },
  });
  await sd.buildAllPlatforms();
};

await mkdir(OUT, { recursive: true });

// Coverage is measured, not asserted: read the actual build output and check
// which of a view's tokens made it in. That way the gallery can't drift from
// what build-tokens.js really ships.
const readOr = async (p) => {
  try {
    return await readFile(p, 'utf8');
  } catch {
    return null;
  }
};
const cssOut = [await readOr('build/css/tokens.css'), await readOr('build/css/tokens-dark.css')]
  .filter(Boolean).join('\n');

// Name AND value must match. Matching on name alone would report every space
// mode as shipped, since web/mobile/back-office use identical names.
const coverage = (records) => ({
  css: cssOut === '' ? null : records.filter((t) => cssOut.includes(`--${t.name}: ${t.value};`)).length,
});

const index = [];
const failed = [];

for (const view of VIEWS) {
  try {
    await buildView(view);
    const { default: records } = await import(
      `./${OUT}${view.id}.json`,
      { with: { type: 'json' } }
    );
    index.push({
      id: view.id, group: view.group, title: view.title, mode: view.mode,
      note: view.note ?? '', count: records.length,
      types: [...new Set(records.map((r) => r.type))].sort(),
      coverage: coverage(records),
    });
    console.log(`✔︎ ${view.id} — ${records.length} tokens`);
  } catch (err) {
    failed.push({ id: view.id, error: err.message });
    console.error(`✖ ${view.id} — ${err.message}`);
  }
}

await writeFile(
  `${OUT}index.json`,
  JSON.stringify({ views: index, failed, generated: new Date().toISOString() }, null, 2) + '\n',
);

console.log(`\n${index.length} views → ${OUT}index.json` + (failed.length ? `  (${failed.length} failed)` : ''));
if (failed.length) process.exitCode = 1;
