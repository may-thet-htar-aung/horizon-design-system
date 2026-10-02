/**
 * Horizon Check Box — stories.
 *
 * FIGMA NODE: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=251-19
 *
 * One story per row of the variant matrix. The component set has ONE axis — State —
 * with five values, and no size axis:
 *
 *   State = Default | Hovered | Checked | Unchecked | Disabled
 *
 * NOTE FOR TESTING — Default and Unchecked are the same picture.
 * The two states bind the identical single variable (color/bg/base), hold an identical
 * hidden Icon instance, and render byte-for-byte identically. The node's own docs call
 * this deliberate: "Unchecked — the choice is off. Same empty box as Default, kept as
 * its own state so selection can be set explicitly." Both are kept here so the matrix
 * is no narrower than the component set, but no test can ever tell them apart. Raised
 * with the designer rather than silently collapsed.
 */

import { createCheckBox, CHECK_BOX_STATES } from './checkBox.js';

const FIGMA_URL =
  'https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=251-19';

export default {
  title: 'Components/Check Box',
  tags: ['autodocs'],
  render: (args) => createCheckBox(args),
  argTypes: {
    state: { control: { type: 'inline-radio' }, options: CHECK_BOX_STATES },
    label: { control: 'text' },
  },
  args: {
    state: 'Default',
    label: 'Keep me signed in',
  },
  parameters: {
    controls: { disable: false },
    design: { type: 'figma', url: FIGMA_URL },
  },
};

/* ------------------------------------------------ the 5 rows of the matrix */

export const Default = { args: { state: 'Default' } };
export const Hovered = { args: { state: 'Hovered' } };
export const Checked = { args: { state: 'Checked' } };
export const Unchecked = { args: { state: 'Unchecked' } };
export const Disabled = { args: { state: 'Disabled' } };

/* ------------------------------------- the whole set, as Figma lays it out */

function column() {
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.gridTemplateColumns = 'max-content max-content';
  wrap.style.gap = 'var(--gap-component) var(--gap-gutter)';
  wrap.style.alignItems = 'center';
  wrap.style.justifyItems = 'start';

  for (const state of CHECK_BOX_STATES) {
    const name = document.createElement('span');
    name.textContent = state;
    name.style.fontFamily = 'var(--family-plain)';
    name.style.fontSize = 'var(--size-label-large)';
    name.style.color = 'var(--color-text-primary)';
    wrap.append(createCheckBox({ state, label: state }), name);
  }

  return wrap;
}

export const AllVariants = {
  render: () => column(),
  parameters: { controls: { disable: true } },
};

/* ------------------------------------------------------------- interaction */
/* The box is a real control, not a painted state: this one starts unchecked and
   toggles on click, Space and Enter. Disabled below it refuses all three. */

export const Interactive = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = 'var(--gap-gutter)';
    wrap.style.alignItems = 'center';
    wrap.append(
      createCheckBox({ state: 'Unchecked', label: 'Keep me signed in' }),
      createCheckBox({ state: 'Checked', label: 'Already on' }),
      createCheckBox({ state: 'Disabled', label: 'Cannot be changed' }),
    );
    return wrap;
  },
  parameters: { controls: { disable: true } },
};
