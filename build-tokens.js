import StyleDictionary from 'style-dictionary';
import { TYPOGRAPHY_FIX } from './tokens-preprocessor.js';

const T = 'tokens/';
const CORE = T + 'core.value.tokens.json';
const STYLES = [T + 'typography.styles.tokens.json', T + 'effects.styles.tokens.json'];

const css = (name, sources, selector, filter) =>
  new StyleDictionary({
    source: sources,
    preprocessors: [TYPOGRAPHY_FIX],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'build/css/',
        files: [{ destination: name, format: 'css/variables',
                  options: { selector, showFileHeader: false }, filter }],
      },
    },
  });

const native = (sources) =>
  new StyleDictionary({
    source: sources,
    preprocessors: [TYPOGRAPHY_FIX],
    platforms: {
      ios: { transformGroup: 'ios-swift', buildPath: 'build/ios/',
             files: [{ destination: 'Tokens.swift', format: 'ios-swift/class.swift',
                       options: { className: 'Tokens' } }] },
      android: { transformGroup: 'android', buildPath: 'build/android/',
                 files: [{ destination: 'colors.xml', format: 'android/resources',
                           resourceType: 'color', filter: { $type: 'color' } }] },
    },
  });

// :root — core, light colours, web space + type, styles
await css('tokens.css',
  [CORE, T+'semantic-color.light.tokens.json', T+'semantic-space.web.tokens.json',
   T+'type.web.tokens.json', ...STYLES],
  ':root').buildAllPlatforms();

// dark — only the colours that change
await css('tokens-dark.css',
  [CORE, T+'semantic-color.dark.tokens.json'],
  '[data-theme="dark"]',
  (t) => t.filePath.includes('semantic-color.dark')).buildAllPlatforms();

// iOS + Android — mobile mode
await native([CORE, T+'semantic-color.light.tokens.json',
  T+'semantic-space.mobile.tokens.json', T+'type.mobile.tokens.json',
  ...STYLES]).buildAllPlatforms();