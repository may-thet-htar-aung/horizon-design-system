import StyleDictionary from 'style-dictionary';
import { TYPOGRAPHY_FIX } from './tokens-preprocessor.js';

const T = 'tokens/';
// Figma is canonical. core.light is the core the Figma variables are authored against;
// semantic.* (colour) and layout.* (space) resolve fully against it. core.value and the
// semantic-color.* / semantic-space.* files are the earlier export and are no longer built.
// Never load both cores: 31 names (color-neutral-*, color-blue-*) exist in each with
// different values, and the later source would silently override the earlier.
const CORE = T + 'core.light.tokens.json';
const TYPE_FIGMA = T + 'typography.value.tokens.json';
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

// :root — Figma core, light colours, medium layout, Figma type values, web weights + styles.
// type.web stays in because it carries the weight-* values and the names typography.styles
// composes from; it defines no core aliases and collides with nothing Figma exports.
await css('tokens.css',
  [CORE, T+'semantic.light.tokens.json', T+'layout.medium.tokens.json',
   TYPE_FIGMA, T+'type.web.tokens.json', ...STYLES],
  ':root').buildAllPlatforms();

// dark — only the colours that change
await css('tokens-dark.css',
  [CORE, T+'semantic.dark.tokens.json'],
  '[data-theme="dark"]',
  (t) => t.filePath.includes('semantic.dark')).buildAllPlatforms();

// iOS + Android — compact layout (the mobile breakpoint), mobile weights
await native([CORE, T+'semantic.light.tokens.json', T+'layout.compact.tokens.json',
  TYPE_FIGMA, T+'type.mobile.tokens.json', ...STYLES]).buildAllPlatforms();