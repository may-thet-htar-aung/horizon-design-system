/**
 * Horizon Input Field / Primary — stories.
 *
 * FIGMA NODE: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=220-50
 *
 * One story per row of the variant matrix. The set has ONE axis — State — with six
 * values, plus two text properties each with a Show toggle:
 *
 *   State            | Default · Hovered · Typed · Error · Warning · Disabled
 *                    | 220:14 · 220:20 · 220:26 · 220:32 · 220:38 · 220:44
 *   Label            | text property
 *   Show Label       | boolean property
 *   Helper text      | text property
 *   Show Helper text | boolean property
 *
 * There is no size axis and no focus variant in this component set.
 *
 * `variant` is NOT a Figma property. Figma models Mobile (227:44) and Primary (220:50)
 * as two component sets; they are one component here because the elements, the
 * properties and the state machine are identical and only the bindings differ. Every
 * story below pins variant: 'Primary'. The Mobile stories are in inputField.stories.js
 * and are untouched by this file.
 *
 * The value inside the field is sample copy on each variant, not a Figma property —
 * the node's own docs say so. `value` and `placeholder` are implementation props,
 * documented as such in inputField.js, because a real input needs both.
 *
 * WHAT TO LOOK AT IN DARK MODE (the Theme toolbar): the whole set is mode-aware, unlike
 * the Mobile set — the field surface darkens properly. TWO contrast gaps are carried
 * deliberately and are the design's to close, not this component's: the placeholder
 * fails AA in both modes, and the disabled value, helper and label are ~1.67:1 in dark.
 * See inputFieldPrimary.css.
 *
 * REBOUND 2026-10-04, and worth checking in dark specifically: the disabled LABEL used
 * to read ~1.11:1 in dark because 220:45 bound `color/text/disabled on dark` where its
 * siblings bound `color/text/disabled`. The designer rebound it, so the label should now
 * be INDISTINGUISHABLE from the disabled value and helper beside it, in both modes. The
 * two tokens are identical-looking in light (#a1a8b1 vs #c0c4ca is subtle) and obviously
 * different in dark (#334155 vs #1c242f), so dark mode is where this one is verifiable
 * by eye at all.
 */

import { InputField, INPUT_FIELD_STATES } from './InputField.jsx';

const FIGMA_NODE =
  'https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=220-50';

export default {
  title: 'Components/Input Field Primary',
  tags: ['autodocs'],
  component: InputField,
  render: (args) => <InputField {...args} variant="Primary" />,
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
    label: 'Label',
    showLabel: true,
    helperText: 'Helper text goes here',
    showHelperText: true,
    placeholder: 'Type here',
  },
  parameters: {
    controls: { disable: false },
    design: { type: 'figma', url: FIGMA_NODE },
  },
};

/* ------------------------------------------------ the 6 rows of the matrix */

/** 220:14 — empty. Shows the placeholder. Resting border color/border/surfacePrimary. */
export const Default = { args: { state: 'Default' } };

/** 220:20 — pointer is over the field. Border shifts to color/border/brand/bold. The
 *  value is still placeholder-coloured: 220:24 binds color/text/input text, same as
 *  Default. */
export const Hovered = { args: { state: 'Hovered' } };

/** 220:26 — the field holds a value. Value moves to color/text/primary, border to
 *  color/border/brand/bold. */
export const Typed = { args: { state: 'Typed', value: 'Horizon Stays' } };

/** 220:32 — the value failed validation. Border color/border/negative/bold, helper
 *  color/text/negative. The helper says why — never colour alone.
 *
 *  REBOUND 2026-10-04: this used to be the one state whose VALUE text carried no
 *  typography binding, so it rendered Inter 13/16 against every other state's Roboto
 *  14/20 — a difference carried deliberately rather than papered over. 220:36 now binds
 *  Body/Medium, so the Error value should render Roboto 14/20 like the rest. The visible
 *  check is that Error's value text is now the SAME SIZE as Typed's and Warning's; it
 *  was conspicuously smaller before. */
export const ErrorState = {
  name: 'Error',
  args: {
    state: 'Error',
    value: 'Horizon Stays',
    helperText: 'Enter a name of at least 3 characters.',
  },
};

/** 220:38 — the value can be submitted, but the helper flags the risk. Border
 *  color/border/warning/bold, helper color/text/warning. */
export const Warning = {
  args: {
    state: 'Warning',
    value: 'Horizon Stays',
    helperText: 'This name is already in use. You can still continue.',
  },
};

/** 220:44 — the field cannot be edited. Fill color/bg/surfacePrimary, border
 *  color/border/disabled, and label, value and helper ALL on color/text/disabled.
 *  The label used to bind color/text/disabled ON DARK; 220:45 was rebound 2026-10-04. */
export const Disabled = { args: { state: 'Disabled' } };

/* ------------------------------ the two Show toggles, on the Default state */

/** Show Label = false. The control keeps an accessible name via aria-label. */
export const NoLabel = {
  name: 'Show Label = false',
  args: { state: 'Default', showLabel: false },
};

/** Show Helper text = false. The node's docs warn against using this to hide the helper
 *  on Default and reveal it only on Error — the field would jump. */
export const NoHelperText = {
  name: 'Show Helper text = false',
  args: { state: 'Default', showHelperText: false },
};

/* ------------------------------------------------------ the matrix, in one */

const SAMPLE_VALUE = {
  Default: '',
  Hovered: '',
  Typed: 'Horizon Stays',
  Error: 'Horizon Stays',
  Warning: 'Horizon Stays',
  Disabled: '',
};

const stateName = {
  display: 'block',
  fontFamily: 'var(--family-plain)',
  fontSize: 'var(--size-label-large)',
  color: 'var(--color-text-primary)',
};

function Column() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)', alignItems: 'flex-start' }}>
      {INPUT_FIELD_STATES.map((state) => (
        <div key={state}>
          <span style={stateName}>{state}</span>
          <InputField variant="Primary" state={state} value={SAMPLE_VALUE[state]} />
        </div>
      ))}
    </div>
  );
}

export const AllVariants = {
  render: () => <Column />,
  parameters: { controls: { disable: true } },
};

/* --------------------------------------------- Primary beside Mobile, once */
/* Not a matrix row. One place to see that the two sets really are one component with
   different values — same elements, same states, different bindings and one extra
   grouping level. Useful when deciding whether a change belongs to one or to both. */

export const PrimaryVersusMobile = {
  name: 'Primary vs Mobile',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-24)', alignItems: 'flex-start' }}>
      {['Primary', 'Mobile'].map((variant) => (
        <div key={variant} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
          <span style={{ ...stateName, display: 'inline' }}>{variant}</span>
          {['Default', 'Typed', 'Error', 'Disabled'].map((state) => (
            <InputField
              key={state}
              variant={variant}
              state={state}
              value={state === 'Default' || state === 'Disabled' ? '' : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/* ------------------------------------------------------------ interaction */
/* The field is a real input, not a painted state. Typing a value paints Typed and swaps
   the value from placeholder grey to full strength; clearing it returns the field to
   rest. The Error and Warning fields keep their status border while they are edited,
   because the node ties those states to validation of the value rather than to the act
   of typing. The Disabled field refuses focus and typing outright. */

export const Interactive = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
      <InputField
        variant="Primary"
        state="Default"
        helperText="Type here — the border and the value colour both follow."
      />
      <InputField
        variant="Primary"
        state="Error"
        value="Horizon Stays"
        helperText="Stays negative while you edit it."
      />
      <InputField variant="Primary" state="Disabled" helperText="Cannot be focused or typed into." />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
