import { view, meta, page, render, section, elevations, tokenTable } from './_gallery.js';

export default { title: 'Elevation' };

export const Levels = {
  name: 'Levels',
  render: () =>
    render(page({
      title: 'Elevation',
      description:
        'The five shadow styles from effects.styles.tokens.json, each rendered as a live box-shadow. Every level is a two-layer shadow: a tight key light over a wider ambient one.',
      body: section('levels', elevations(view('effects'))),
    })),
};

export const FigmaParts = {
  name: 'Shadow parts — Figma export',
  render: () => {
    const el = render(page({
      title: 'Shadow parts — Figma export',
      description:
        'The Figma core ships elevation as separate offset/blur/spread/colour primitives per M3 level, alongside a deprecated legacy set. build-tokens.js composes shadows from effects.styles instead, so these are unused today.',
      note: meta('core-figma').note,
      body: '',
    }));
    el.append(tokenTable(view('core-figma').filter((t) => t.name.startsWith('elevation-'))));
    return el;
  },
};
