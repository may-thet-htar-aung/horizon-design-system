import { view, meta, page, render, colourSections, colourFamily } from './_gallery.js';

export default { title: 'Colour' };

const colours = (id) => view(id).filter((t) => t.type === 'color');

const gallery = (id, { title, description, familyFn }) => () =>
  render(page({
    title,
    description,
    note: meta(id).note,
    body: colourSections(colours(id), familyFn),
  }));

export const CorePalette = {
  name: 'Core palette',
  render: gallery('core', {
    title: 'Core palette',
    description:
      'The raw ramps in core.value.tokens.json — the set build-tokens.js compiles into CSS, Swift and XML. Semantic tokens alias these; product code should not.',
  }),
};

export const FigmaCorePalette = {
  name: 'Core palette — Figma export',
  render: gallery('core-figma', {
    title: 'Core palette — Figma export',
    description:
      'The newer ramp exported from Figma (core.light.tokens.json). Wider than the build core: it adds cyan, sky, indigo and violet plus alpha neutrals.',
  }),
};

// Semantic names read color-<role>-<variant>, so the role is the family.
const semanticFamily = (t) => t.name.split('-')[1] ?? 'other';

export const SemanticLight = {
  name: 'Semantic — light',
  render: gallery('semantic-color-light', {
    title: 'Semantic colour — light',
    description:
      'Role-named tokens grouped by what they paint. Each shows the core token it aliases. These are the ones to use in product code.',
    familyFn: semanticFamily,
  }),
};

export const SemanticDark = {
  name: 'Semantic — dark',
  render: gallery('semantic-color-dark', {
    title: 'Semantic colour — dark',
    description:
      'The same role names remapped for dark mode. Swatches show resolved values, so they read correctly whichever theme the toolbar is set to.',
    familyFn: semanticFamily,
  }),
};

export const ExtendedLight = {
  name: 'Extended semantic — light',
  render: gallery('semantic-full-light', {
    title: 'Extended semantic — light',
    description:
      'The 90-token semantic layer (semantic.light.tokens.json), twice the size of the shipping set — it adds status, accent and interaction roles.',
    familyFn: semanticFamily,
  }),
};

export const ExtendedDark = {
  name: 'Extended semantic — dark',
  render: gallery('semantic-full-dark', {
    title: 'Extended semantic — dark',
    description: 'Dark counterpart of the extended semantic layer.',
    familyFn: semanticFamily,
  }),
};
