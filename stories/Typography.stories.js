import { view, page, render, section, specimens, tokenTable, groupBy } from './_gallery.js';

export default { title: 'Typography' };

const ORDER = ['display', 'headline', 'title', 'body', 'label'];
const tier = (name) => ORDER.findIndex((t) => name.startsWith(t));

export const Styles = {
  name: 'Type styles',
  render: () => {
    const records = view('typography-styles');
    const groups = groupBy(records, (t) => t.name.split('-')[0]);
    const body = [...groups.entries()]
      .sort((a, b) => tier(a[0]) - tier(b[0]))
      .map(([name, items]) => section(name, specimens(items)))
      .join('');
    return render(page({
      title: 'Type styles',
      description:
        'The composite styles from typography.styles.tokens.json, rendered live via the CSS font shorthand each token compiles to.',
      body,
    }));
  },
};

const scale = (id, mode) => () => {
  const el = render(page({
    title: `Type scale — ${mode}`,
    description:
      'The size, line-height, tracking, weight and family primitives that the composite styles are built from.',
    body: '',
  }));
  el.append(tokenTable(view(id)));
  return el;
};

export const ScaleWeb = { name: 'Scale — web', render: scale('type-web', 'web') };
export const ScaleMobile = { name: 'Scale — mobile', render: scale('type-mobile', 'mobile') };
export const ScaleBackOffice = { name: 'Scale — back office', render: scale('type-back-office', 'back office') };

export const Primitives = {
  name: 'Primitives',
  render: () => {
    const el = render(page({
      title: 'Typography primitives',
      description:
        'typography.value.tokens.json — the raw M3 ramp, including the brand and plain family split. Not compiled by build-tokens.js.',
      body: '',
    }));
    el.append(tokenTable(view('typography-value')));
    return el;
  },
};
