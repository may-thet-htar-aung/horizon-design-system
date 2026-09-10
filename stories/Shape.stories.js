import { view, meta, page, render, section, scaleRows } from './_gallery.js';

export default { title: 'Shape' };

const num = (v) => parseFloat(v) || 0;
const pick = (id, re) =>
  view(id).filter((t) => t.type === 'dimension' && re.test(t.name)).sort((a, b) => num(a.value) - num(b.value));

export const Core = {
  name: 'Radius & border — core',
  render: () =>
    render(page({
      title: 'Shape — core',
      description: 'Corner radius and stroke weight from the build core. Each row draws the value.',
      body:
        section('border radius', scaleRows(pick('core', /^border-radius/), 'radius')) +
        section('border size', scaleRows(pick('core', /^border-size/), 'width')),
    })),
};

export const FigmaCore = {
  name: 'Radius & border — Figma export',
  render: () =>
    render(page({
      title: 'Shape — Figma export',
      description:
        'The Figma core carries the full M3 Expressive radius ladder (none through extra-extra-large plus a pill) and a wider border set including a 3px focus ring.',
      note: meta('core-figma').note,
      body:
        section('border radius', scaleRows(pick('core-figma', /^borderradius/), 'radius')) +
        section('border width', scaleRows(pick('core-figma', /^borderwidth/), 'width')),
    })),
};

export const Semantic = {
  name: 'Radius & border — semantic',
  render: () =>
    render(page({
      title: 'Shape — semantic (web)',
      description: 'Role-named shape tokens that alias the core ladder.',
      body:
        section('border radius', scaleRows(pick('space-web', /^border-radius/), 'radius')) +
        section('border width', scaleRows(pick('space-web', /^border-width/), 'width')),
    })),
};
