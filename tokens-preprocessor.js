import StyleDictionary from 'style-dictionary';

// Figma writes font weight as a style NAME. CSS needs a number.
// Figma is inconsistent about spacing in those names ("SemiBold" vs "Semi Bold"),
// so the lookup key is normalised: lowercased, spaces/underscores/hyphens stripped.
const WEIGHTS = {
  thin: 100, extralight: 200, ultralight: 200, light: 300, regular: 400, normal: 400,
  medium: 500, semibold: 600, demibold: 600, bold: 700, extrabold: 800, ultrabold: 800,
  black: 900, heavy: 900,
};

export const weightToNumber = (w) =>
  typeof w === 'string' ? WEIGHTS[w.replace(/[\s_-]/g, '').toLowerCase()] ?? w : w;

export const TYPOGRAPHY_FIX = 'typography/fix';

// Runs BEFORE any transform, so the shorthand sees the fixed values.
const walk = (node) => {
  for (const key of Object.keys(node)) {
    const t = node[key];
    if (!t || typeof t !== 'object') continue;
    if (t.$type === 'fontWeight') {
      // Standalone weight tokens too: Figma exports weight-regular as "regular", which is
      // not a valid CSS font-weight. Normalising here makes it 400 in every platform output,
      // whichever source file happens to load last.
      t.$value = weightToNumber(t.$value);
    } else if (t.$type === 'typography' && t.$value) {
      const v = t.$value;
      t.$value = {
        ...v,
        fontWeight: weightToNumber(v.fontWeight),
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

StyleDictionary.registerPreprocessor({ name: TYPOGRAPHY_FIX, preprocessor: walk });
