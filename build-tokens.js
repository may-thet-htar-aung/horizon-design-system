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

// :root — Figma core, light colours, medium layout, web type scale, Figma type values, styles.
// type.web still ships the earlier type names (size-label-lg, tracking-label-lg, …). It shares
// exactly two names with typography.value — weight-regular and weight-medium — so TYPE_FIGMA
// loads after it and Figma's value wins. The preprocessor normalises both to numbers, so the
// collision warning Style Dictionary prints for them is between equal values.
await css('tokens.css',
  [CORE, T+'semantic.light.tokens.json', T+'layout.medium.tokens.json',
   T+'type.web.tokens.json', TYPE_FIGMA, ...STYLES],
  ':root').buildAllPlatforms();

// dark — only the colours that change
await css('tokens-dark.css',
  [CORE, T+'semantic.dark.tokens.json'],
  '[data-theme="dark"]',
  (t) => t.filePath.includes('semantic.dark')).buildAllPlatforms();

// iOS + Android — compact layout (the mobile breakpoint), mobile type scale, Figma type values
await native([CORE, T+'semantic.light.tokens.json', T+'layout.compact.tokens.json',
  T+'type.mobile.tokens.json', TYPE_FIGMA, ...STYLES]).buildAllPlatforms();