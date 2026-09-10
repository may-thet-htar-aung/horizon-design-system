import { index, allTokens, page, render, section, esc, tokenTable } from './_gallery.js';

export default { title: 'Overview' };

const views = index.views ?? [];
const total = views.reduce((a, v) => a + v.count, 0);
const shipped = views.reduce((a, v) => a + (v.coverage?.css ?? 0), 0);

export const Coverage = {
  name: 'Coverage',
  render: () => {
    const cards = `
      <div class="hz-cards">
        <div class="hz-card"><div class="n">${total}</div><div class="t">tokens</div>
          <div class="s">across ${views.length} collection modes</div></div>
        <div class="hz-card"><div class="n">${shipped}</div><div class="t">reach tokens.css</div>
          <div class="s">name and value both present in the built CSS</div></div>
        <div class="hz-card"><div class="n">${total - shipped}</div><div class="t">do not</div>
          <div class="s">authored but not compiled for web</div></div>
      </div>`;

    const rows = `<div class="hz-rows">${views.map((v) => {
      const css = v.coverage?.css ?? 0;
      const pct = v.count ? Math.round((css / v.count) * 100) : 0;
      return `<div class="hz-row" style="grid-template-columns:230px 120px 1fr">
        <div class="name">${esc(v.id)}</div>
        <div class="val">${css} / ${v.count}</div>
        <div>
          <div class="hz-bar" style="width:${pct}%;opacity:${pct === 0 ? 0.25 : 1}"></div>
          <div class="desc">${esc(v.note || `${v.group} · ${v.mode}`)}</div>
        </div>
      </div>`;
    }).join('')}</div>`;

    return render(page({
      title: 'Token coverage',
      description:
        'Every collection mode in tokens/manifest.json, and how much of each actually reaches build/css/tokens.css. Coverage is measured by matching name and value against the built output, so a mode only counts where its own values ship.',
      note: 'Three groups sit at zero: the Figma core export, the extended semantic layer, and the layout scale. They are authored and internally consistent, but build-tokens.js does not consume them yet.',
      body: cards + section('by collection mode', rows),
    }));
  },
};

export const AllTokens = {
  name: 'All tokens',
  render: () => {
    const el = render(page({
      title: 'All tokens',
      description: `Every token in the system — ${total} across ${views.length} collection modes. Filter by name, value, alias or description.`,
      body: '',
    }));
    el.append(tokenTable(allTokens(), { showView: true }));
    return el;
  },
};
