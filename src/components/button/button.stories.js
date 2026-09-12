/**
 * Horizon Button — stories.
 *
 * FIGMA NODE: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=65-22
 *
 * One story per row of the variant matrix: Type (Primary | Outline | Ghost)
 * x State (Default | Hover | Disabled), plus the Show Icon toggles.
 */

import { createButton, BUTTON_TYPES, BUTTON_STATES } from './button.js';

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: (args) => createButton(args),
  argTypes: {
    type: { control: { type: 'inline-radio' }, options: BUTTON_TYPES },
    state: { control: { type: 'inline-radio' }, options: BUTTON_STATES },
    label: { control: 'text' },
    showIconLeft: { control: 'boolean' },
    showIconRight: { control: 'boolean' },
  },
  args: {
    type: 'Primary',
    state: 'Default',
    label: 'Continue',
    showIconLeft: false,
    showIconRight: false,
  },
  parameters: {
    controls: { disable: false },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=65-22',
    },
  },
};

/* ------------------------------------------------- the 3 x 3 variant matrix */

export const PrimaryDefault = { args: { type: 'Primary', state: 'Default' } };
export const PrimaryHover = { args: { type: 'Primary', state: 'Hover' } };
export const PrimaryDisabled = { args: { type: 'Primary', state: 'Disabled' } };

export const OutlineDefault = { args: { type: 'Outline', state: 'Default' } };
export const OutlineHover = { args: { type: 'Outline', state: 'Hover' } };
export const OutlineDisabled = { args: { type: 'Outline', state: 'Disabled' } };

export const GhostDefault = { args: { type: 'Ghost', state: 'Default' } };
export const GhostHover = { args: { type: 'Ghost', state: 'Hover' } };
export const GhostDisabled = { args: { type: 'Ghost', state: 'Disabled' } };

/* --------------------------------------------------------- the icon toggles */

export const IconLeft = {
  args: { type: 'Primary', label: 'Back', showIconLeft: true },
};

export const IconRight = {
  args: { type: 'Primary', label: 'Continue', showIconRight: true },
};

export const IconBoth = {
  args: { type: 'Outline', label: 'Continue', showIconLeft: true, showIconRight: true },
};

/* -------------------------------------------- the whole set, as Figma lays it out */

function grid() {
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.gridTemplateColumns = 'repeat(3, max-content)';
  wrap.style.gap = 'var(--spacing-gap-xl) var(--spacing-gap-lg)';
  wrap.style.alignItems = 'center';
  // Width is automatic — don't let the grid stretch buttons to the column.
  wrap.style.justifyItems = 'start';

  for (const type of BUTTON_TYPES) {
    for (const state of BUTTON_STATES) {
      wrap.append(createButton({ type, state, label: 'Continue' }));
    }
  }

  return wrap;
}

export const AllVariants = {
  render: () => grid(),
  parameters: { controls: { disable: true } },
};
