import StyleDictionary from 'style-dictionary';

const T = 'tokens/';
const CORE = T + 'core.value.tokens.json';
const STYLES = [T + 'typography.styles.tokens.json', T + 'effects.styles.tokens.json'];

// Figma writes font weight as a style NAME. CSS needs a number.
const WEIGHTS = { Thin:100, ExtraLight:200, Light:300, Regular:400, Medium:500,
                  SemiBold:600, Bold:700, ExtraBold:800, Black:900 };

// Runs BEFORE any transform, so the shorthand sees the fixed values.
StyleDictionary.registerPreprocessor({
  name: 'typography/fix',
  preprocessor: (dict) => {
    const walk = (node) => {
      for (const key of Object.keys(node)) {
        const t = node[key];
        if (!t || typeof t !== 'object') continue;
        if (t.$type === 'typography' && t.$value) {
          const v = t.$value;
          t.$value = {
            ...v,
            fontWeight: WEIGHTS[v.fontWeight] ?? v.fontWeight,
            lineHeight: typeof v.lineHeight === 'number'
              ? { value: v.lineHeight, unit: 'px' }
              : v.lineHeight,
          };
        } else {
          walk(t);
        }
      }
      return node;
    };
    return walk(dict);
  },
});

const css = (name, sources, selector, filter) =>
  new StyleDictionary({
    source: sources,
    preprocessors: ['typography/fix'],
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
    preprocessors: ['typography/fix'],
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