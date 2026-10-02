/**
 * Horizon Input Field / Mobile — stories.
 *
 * FIGMA NODE: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=227-44
 *
 * One story per row of the variant matrix. The set has ONE axis — State — with six
 * values, plus two text properties each with a Show toggle:
 *
 *   State            | Default · Hovered · Typed · Error · Warning · Disabled
 *                    | 227:2 · 227:9 · 227:16 · 227:23 · 227:30 · 227:37
 *   Label            | text property
 *   Show Label       | boolean property
 *   Helper text      | text property
 *   Show Helper text | boolean property
 *
 * There is no size axis and no focus variant in this component set.
 *
 * The value inside the field is sample copy on each variant, not a Figma property —
 * `value` and `placeholder` are implementation props, documented as such in
 * inputField.js, because a real input needs a real value and a real placeholder.
 */

import { createInputField, INPUT_FIELD_STATES } from './inputField.js';

export default {
  title: 'Components/Input Field',
  tags: ['autodocs'],
  render: (args) => createInputField(args),
  argTypes: {
    state: { control: { type: 'inline-radio' }, options: INPUT_FIELD_STATES },
    label: { control: 'text' },
    showLabel: { control: 'boolean' },
    helperText: { control: 'text' },
    showHelperText: { control: 'boolean' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    state: 'Default',
    label: 'Email',
    showLabel: true,
    helperText: 'Helper text goes here',
    showHelperText: true,
    placeholder: 'you@email.com',
  },
  parameters: {
    controls: { disable: false },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=227-44',
    },
  },
};

/* ------------------------------------------------ the 6 rows of the matrix */

/** 227:2 — empty. Shows the placeholder. No stroke bound on this state at all. */
export const Default = { args: { state: 'Default' } };

/** 227:9 — pointer is over the field. Border shifts to color/border/brand/bold. */
export const Hovered = { args: { state: 'Hovered' } };

/** 227:16 — the field holds a value. Placeholder colour is replaced by
 *  color/text/secondary, border color/border/brand/bold. */
export const Typed = { args: { state: 'Typed', value: 'mai7@email.com' } };

/** 227:23 — the value failed validation. Border color/border/negative/bold, helper
 *  color/text/negative. The helper says why — never colour alone. */
export const ErrorState = {
  name: 'Error',
  args: {
    state: 'Error',
    value: 'maii7@email.com',
    helperText: 'Enter a valid email address, like you@email.com.',
  },
};

/** 227:30 — the value can be submitted, but the helper flags the risk. Border
 *  color/border/warning/bold, helper color/text/warning. */
export const Warning = {
  args: {
    state: 'Warning',
    value: 'mai7@email.co',
    helperText: 'Check this address — .co is uncommon. You can still continue.',
  },
};

/** 227:37 — the field cannot be edited. Fill color/bg/surfacePrimary, border
 *  color/border/disabled, and label, value and helper all on color/text/disabled. */
export const Disabled = { args: { state: 'Disabled' } };

/* ------------------------------- the two Show toggles, on the Default state */

/** Show Label = false. The control keeps an accessible name via aria-label. */
export const NoLabel = {
  name: 'Show Label = false',
  args: { state: 'Default', showLabel: false },
};

/** Show Helper text = false. The node's docs warn against using this to hide the
 *  helper on Default and reveal it only on Error — the field would jump. */
export const NoHelperText = {
  name: 'Show Helper text = false',
  args: { state: 'Default', showHelperText: false },
};

/* ------------------------------------------------------- the matrix, in one */

function column() {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.gap = 'var(--spacing-24)';
  wrap.style.alignItems = 'flex-start';

  const sample = {
    Default: '',
    Hovered: '',
    Typed: 'mai7@email.com',
    Error: 'maii7@email.com',
    Warning: 'mai7@email.co',
    Disabled: '',
  };

  for (const state of INPUT_FIELD_STATES) {
    const row = document.createElement('div');

    const name = document.createElement('span');
    name.textContent = state;
    name.style.display = 'block';
    name.style.fontFamily = 'var(--family-plain)';
    name.style.fontSize = 'var(--size-label-large)';
    name.style.color = 'var(--color-text-primary)';

    row.append(
      name,
      createInputField({ state, label: 'Email', value: sample[state] }),
    );
    wrap.append(row);
  }

  return wrap;
}

export const AllVariants = {
  render: () => column(),
  parameters: { controls: { disable: true } },
};

/* ------------------------------------------------------------- interaction */
/* The field is a real input, not a painted state. Typing a value paints Typed and
   swaps the value from placeholder grey to full strength; clearing it returns the
   field to rest. The Error and Warning fields keep their status border while they
   are edited, because the node ties those states to validation of the value rather
   than to the act of typing. The Disabled field refuses focus and typing outright. */

export const Interactive = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = 'var(--spacing-24)';
    wrap.append(
      createInputField({
        state: 'Default',
        label: 'Email',
        helperText: 'Type here — the border and the value colour both follow.',
      }),
      createInputField({
        state: 'Error',
        label: 'Email',
        value: 'maii7@email.com',
        helperText: 'Stays negative while you edit it.',
      }),
      createInputField({
        state: 'Disabled',
        label: 'Email',
        helperText: 'Cannot be focused or typed into.',
      }),
    );
    return wrap;
  },
  parameters: { controls: { disable: true } },
};
