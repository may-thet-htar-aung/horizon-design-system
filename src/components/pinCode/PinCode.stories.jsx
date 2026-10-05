/**
 * Horizon Pin Code Cell — stories.
 *
 * FIGMA NODE: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=260-6558
 *
 * One story per row of the variant matrix. The set has ONE axis — State — with five
 * values, and one text property, Value:
 *
 *   State   | Default · Hovered · Typed · Error · Disabled   (260:6559 … 260:6567)
 *   Value   | text property. Shown on Typed and Error only.
 *
 * There is no size axis and no focus variant in this component set.
 */

import { PinCodeCell, PIN_CODE_CELL_STATES } from './PinCode.jsx';

export default {
  title: 'Components/Pin Code Cell',
  tags: ['autodocs'],
  component: PinCodeCell,
  render: (args) => <PinCodeCell {...args} />,
  argTypes: {
    state: { control: { type: 'inline-radio' }, options: PIN_CODE_CELL_STATES },
    value: { control: 'text' },
    label: { control: 'text' },
  },
  args: {
    state: 'Default',
    value: '1',
    label: 'Digit of verification code',
  },
  parameters: {
    controls: { disable: false },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=260-6558',
    },
  },
};

/* ------------------------------------------------ the 5 rows of the matrix */

/** 260:6559 — empty cell at rest. Stroke color/border/surfacePrimary. */
export const Default = { args: { state: 'Default' } };

/** 260:6561 — pointer is over the cell. Stroke shifts to color/border/brand/bold. */
export const Hovered = { args: { state: 'Hovered' } };

/** 260:6563 — the cell holds a digit. Value is shown, stroke brand/bold. */
export const Typed = { args: { state: 'Typed', value: '1' } };

/** 260:6565 — the code is wrong. Stroke color/border/negative/bold, digit stays visible. */
export const ErrorState = { name: 'Error', args: { state: 'Error', value: '1' } };

/** 260:6567 — the cell cannot be edited. Fill bg/surfacePrimary, stroke border/disabled. */
export const Disabled = { args: { state: 'Disabled' } };

/* ------------------------------------------------------- the matrix, in one */

function Column() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        gap: 'var(--gap-component) var(--gap-gutter)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      {PIN_CODE_CELL_STATES.flatMap((state) => [
        <PinCodeCell key={state} state={state} value="1" label={state} />,
        <span
          key={state + '-name'}
          style={{
            fontFamily: 'var(--family-plain)',
            fontSize: 'var(--size-label-large)',
            color: 'var(--color-text-primary)',
          }}
        >
          {state}
        </span>,
      ])}
    </div>
  );
}

export const AllVariants = {
  render: () => <Column />,
  parameters: { controls: { disable: true } },
};

/* ------------------------------------------------------------- interaction */
/* The cell is a real input, not a painted state. Typing a character paints Typed and
   clearing it returns the cell to rest; the Error cell keeps its negative stroke while
   it is edited, because the node's docs say Error means the CODE is wrong, not the
   cell; the Disabled cell refuses focus and typing outright. */

export const Interactive = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-component)', alignItems: 'center' }}>
      <PinCodeCell state="Default" label="Digit 1 of 4" />
      <PinCodeCell state="Typed" value="4" label="Digit 2 of 4" />
      <PinCodeCell state="Error" value="7" label="Digit 3 of 4" />
      <PinCodeCell state="Disabled" label="Digit 4 of 4" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
