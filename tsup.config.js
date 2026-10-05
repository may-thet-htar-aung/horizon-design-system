import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'tsup';

// The icons are imported as `./icons/x.svg?raw` (a Vite suffix). esbuild does not know it,
// so inline those files as plain strings.
const rawSvg = {
  name: 'raw-svg',
  setup(build) {
    build.onResolve({ filter: /\.svg\?raw$/ }, (args) => ({
      path: path.resolve(args.resolveDir, args.path.replace(/\?raw$/, '')),
      namespace: 'raw-svg',
    }));
    build.onLoad({ filter: /.*/, namespace: 'raw-svg' }, async (args) => ({
      contents: `export default ${JSON.stringify(await readFile(args.path, 'utf8'))};`,
      loader: 'js',
    }));
  },
};

export default defineConfig({
  entry: ['src/index.js'],
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  sourcemap: false,
  // react must be the consumer's copy, never bundled: two copies of React break hooks.
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  esbuildPlugins: [rawSvg],
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.loader = { ...options.loader, '.js': 'jsx' };
  },
});
