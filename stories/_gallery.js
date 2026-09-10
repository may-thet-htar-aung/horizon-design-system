// Shared rendering helpers. Every story is driven by the JSON that
// build-token-data.js emits, so nothing here hardcodes a token value.

const data = import.meta.glob('../build/storybook/*.json', { eager: true, import: 'default' });

const byId = Object.fromEntries(
  Object.entries(data).map(([path, records]) => [path.split('/').pop().replace('.json', ''), records]),
);

export const index = byId.index ?? { views: [], failed: [] };

/** Records for one view id, e.g. view('core'). */
export const view = (id) => byId[id] ?? [];

/** Index metadata for one view id. */
export const meta = (id) => index.views?.find((v) => v.id === id) ?? {};

/** Every token across every view, tagged with its view id. */
export const allTokens = () =>
  (index.views ?? []).flatMap((v) => view(v.id).map((t) => ({ ...t, view: v.id, mode: v.mode, group: v.group })));

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Trailing number in a token name, for sorting ramps: color-blue-500 -> 500. */
const step = (name) => {
  const m = name.match(/(\d+)(a)?$/);
  return m ? Number(m[1]) + (m[2] ? 0.5 : 0) : Number.MAX_SAFE_INTEGER;
};

export const groupBy = (records, keyFn) => {
  const out = new Map();
  for (const r of records) {
    const k = keyFn(r);
    if (!out.has(k)) out.set(k, []);
    out.get(k).push(r);
  }
  return out;
};

/** Is this hex/rgb dark enough to need a light label? */
const isDark = (value) => {
  const m = String(value).match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const alpha = m[2] ? parseInt(m[2], 16) / 255 : 1;
  if (alpha < 0.5) return false;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.55;
};

export const page = ({ title, description, note, body }) => `
  <div class="hz-head">
    <h1>${esc(title)}</h1>
    ${description ? `<p>${esc(description)}</p>` : ''}
    ${note ? `<div class="hz-note">${esc(note)}</div>` : ''}
  </div>
  ${body}
`;

export const section = (title, inner) =>
  `<section class="hz-section"><h2>${esc(title)}</h2>${inner}</section>`;

/* ---------- colour ---------- */

export const swatches = (records) => `
  <div class="hz-swatches">
    ${records.map((t) => `
      <div class="hz-swatch">
        <div class="chip" style="--c:${esc(t.value)}">
          <span style="${isDark(t.value) ? 'background:rgba(0,0,0,.55);color:#fff' : ''}">${esc(t.value)}</span>
        </div>
        <div class="meta">
          <div class="name">${esc(t.name)}</div>
          ${t.alias ? `<div class="alias">→ ${esc(t.alias)}</div>` : ''}
          ${t.description ? `<div class="desc">${esc(t.description)}</div>` : ''}
        </div>
      </div>`).join('')}
  </div>`;

/** Family name for grouping: color-blue-500 -> "blue"; anything else -> "other". */
export const colourFamily = (t) =>
  t.name.startsWith('color-') ? t.name.split('-')[1] ?? 'other' : 'other';

/** Colour records grouped into sections by family. */
export const colourSections = (records, familyFn = colourFamily) => {
  const groups = groupBy(records, familyFn);
  return [...groups.entries()]
    .map(([family, items]) =>
      section(family, swatches([...items].sort((a, b) => step(a.name) - step(b.name)))))
    .join('');
};

/* ---------- dimension scales ---------- */

const px = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Rows with a visual. shape 'bar' scales width to the value (spacing),
 * 'box' draws a square with the value as border-radius or border-width.
 */
export const scaleRows = (records, shape = 'bar') => {
  const max = Math.max(...records.map((t) => Math.abs(px(t.value))), 1);
  return `<div class="hz-rows">${records.map((t) => {
    const n = px(t.value);
    let visual;
    if (shape === 'radius') {
      visual = `<div class="hz-box" style="border-radius:${esc(t.value)}"></div>`;
    } else if (shape === 'width') {
      visual = `<div class="hz-box" style="border-width:${esc(t.value)}"></div>`;
    } else {
      // Cap the bar so a 10000px pill radius doesn't blow out the layout.
      const pct = Math.min(100, (Math.abs(n) / max) * 100);
      visual = `<div class="hz-bar" style="width:${pct}%${n < 0 ? ';opacity:.45' : ''}"></div>`;
    }
    return `<div class="hz-row">
      <div class="name">${esc(t.name)}</div>
      <div class="val">${esc(t.value)}</div>
      <div>${visual}${t.description ? `<div class="desc">${esc(t.description)}</div>` : ''}</div>
    </div>`;
  }).join('')}</div>`;
};

/* ---------- typography ---------- */

export const specimens = (records, sample = 'The quick brown fox jumps over the lazy dog') => `
  <div>${records.map((t) => `
    <div class="hz-specimen">
      <div class="label">
        <span>${esc(t.name)}</span>
        <span>${esc(t.value)}</span>
        ${t.description ? `<span>${esc(t.description)}</span>` : ''}
      </div>
      <p class="sample" style="font:${esc(t.value)}">${esc(sample)}</p>
    </div>`).join('')}</div>`;

/* ---------- elevation ---------- */

export const elevations = (records) => `
  <div class="hz-elevations">
    ${records.map((t) => `
      <div class="hz-elevation" style="box-shadow:${esc(t.value)}">
        <div class="name">${esc(t.name)}</div>
        ${t.description ? `<div class="desc">${esc(t.description)}</div>` : ''}
      </div>`).join('')}
  </div>`;

/* ---------- searchable table (returns a DOM node) ---------- */

export const tokenTable = (records, { showView = false } = {}) => {
  const root = document.createElement('div');
  const types = [...new Set(records.map((t) => t.type))].sort();

  root.innerHTML = `
    <div class="hz-toolbar">
      <input type="search" placeholder="Filter by name, value or description…" aria-label="Filter tokens">
      <select aria-label="Filter by type">
        <option value="">All types (${types.length})</option>
        ${types.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}
      </select>
      <span class="hz-count"></span>
    </div>
    <table class="hz-table">
      <thead><tr>
        ${showView ? '<th>Collection</th>' : ''}
        <th>Token</th><th>Value</th><th>Alias</th><th>Type</th><th>Description</th>
      </tr></thead>
      <tbody></tbody>
    </table>`;

  const input = root.querySelector('input');
  const select = root.querySelector('select');
  const count = root.querySelector('.hz-count');
  const tbody = root.querySelector('tbody');

  const render = () => {
    const q = input.value.trim().toLowerCase();
    const ty = select.value;
    const rows = records.filter((t) =>
      (!ty || t.type === ty) &&
      (!q || `${t.name} ${t.value} ${t.alias ?? ''} ${t.description}`.toLowerCase().includes(q)));

    count.textContent = `${rows.length} of ${records.length} tokens`;
    tbody.innerHTML = rows.map((t) => `
      <tr>
        ${showView ? `<td><span class="hz-tag">${esc(t.group)}${t.mode ? ` · ${esc(t.mode)}` : ''}</span></td>` : ''}
        <td>${esc(t.name)}</td>
        <td>${t.type === 'color' ? `<span class="hz-dot" style="background:${esc(t.value)}"></span>` : ''}${esc(t.value)}</td>
        <td>${t.alias ? esc(t.alias) : '<span style="opacity:.4">—</span>'}</td>
        <td><span class="hz-tag">${esc(t.type)}</span></td>
        <td class="desc">${esc(t.description)}</td>
      </tr>`).join('');
  };

  input.addEventListener('input', render);
  select.addEventListener('change', render);
  render();
  return root;
};

/** Wrap a string body in the page shell and return a DOM node. */
export const render = (html) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
};
