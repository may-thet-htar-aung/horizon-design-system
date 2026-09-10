import { view, meta, page, render, section, scaleRows, groupBy } from './_gallery.js';

export default { title: 'Spacing' };

const num = (v) => parseFloat(v) || 0;
const dims = (id, re) =>
  view(id).filter((t) => t.type === 'dimension' && re.test(t.name)).sort((a, b) => num(a.value) - num(b.value));

export const CoreScale = {
  name: 'Core scale',
  render: () =>
    render(page({
      title: 'Core spacing scale',
      description: 'The raw steps in core.value.tokens.json. Bars are drawn to scale.',
      body:
        section('spacing', scaleRows(dims('core', /^spacing-/))) +
        section('size', scaleRows(dims('core', /^size-/))),
    })),
};

export const FigmaCoreScale = {
  name: 'Core scale — Figma export',
  render: () =>
    render(page({
      title: 'Core spacing scale — Figma export',
      description:
        'The Figma core names its steps by pixel value (spacing-4, spacing-8 …) rather than by index. The semantic space and layout layers alias these names.',
      note: meta('core-figma').note,
      body: section('spacing', scaleRows(dims('core-figma', /^spacing-/))),
    })),
};

// Semantic space splits into padding / gap / margin / control / icon roles.
const spaceSections = (id) => {
  const records = view(id).filter((t) => t.type === 'dimension' && !/^border-/.test(t.name));
  const groups = groupBy(records, (t) => t.name.split('-').slice(0, 2).join('-').replace(/^(spacing|size)-/, ''));
  return [...groups.entries()]
    .map(([role, items]) => section(role, scaleRows([...items].sort((a, b) => num(a.value) - num(b.value)))))
    .join('');
};

const semantic = (id, mode, description) => () =>
  render(page({ title: `Semantic space — ${mode}`, description, body: spaceSections(id) }));

export const SemanticWeb = {
  name: 'Semantic — web',
  render: semantic('space-web', 'web',
    'Role-named spacing for the web platform. This is the mode compiled into tokens.css.'),
};

export const SemanticMobile = {
  name: 'Semantic — mobile',
  render: semantic('space-mobile', 'mobile',
    'Mobile mode — the values compiled into Tokens.swift and colors.xml.'),
};

export const SemanticBackOffice = {
  name: 'Semantic — back office',
  render: semantic('space-back-office', 'back office',
    'The compact back-office mode. Authored but not currently compiled by build-tokens.js.'),
};

const layout = (id, mode) => () =>
  render(page({
    title: `Layout — ${mode}`,
    description: 'Page-level rhythm: margins, gutters, pane and section gaps, container padding.',
    note: meta(id).note,
    body: section(`${mode} window class`, scaleRows(dims(id, /./))),
  }));

export const LayoutCompact = { name: 'Layout — compact', render: layout('layout-compact', 'compact') };
export const LayoutMedium = { name: 'Layout — medium', render: layout('layout-medium', 'medium') };
export const LayoutExpanded = { name: 'Layout — expanded', render: layout('layout-expanded', 'expanded') };
