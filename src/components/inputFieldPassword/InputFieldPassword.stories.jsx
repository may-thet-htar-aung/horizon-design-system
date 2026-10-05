/**
 * Horizon Input Field / Password — stories.
 *
 * FIGMA NODE: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=234-941
 *
 * One story per row of the variant matrix. The set has ONE axis in Figma — `Property 1`,
 * NOT `State` — with NINE values, plus two non-text properties:
 *
 *   Property 1  | Default · Hovered · Typed hide · Typed Open · Error hide ·
 *               | Error Open · Warning hide · Warning Open · Disabled
 *               | 234:940 · 234:942 · 234:955 · 234:968 · 244:171 ·
 *               | 244:183 · 244:194 · 244:206 · 244:217
 *   Show icon   | boolean property — "Show icon hides the control."
 *   Icon        | instance-swap property — "Icon swaps the glyph."
 *
 * There is NO size axis and NO focus variant in this component set. There is also no
 * Label, Show Label, Helper text or Show Helper text property — unlike Input
 * Field/Mobile and Input Field/Primary, this set's label ("Password") and helper are
 * fixed sample copy on all nine variants.
 *
 * `Property 1` folds two axes into one flat list. This component models it as `state`
 * (the same six states the two sibling Input Fields carry) plus a `revealed` boolean —
 * the reasoning is in the header of inputFieldPassword.js. The first nine stories below
 * are named for the nine Figma values and map to them exactly, so this file can be read
 * against the node one row at a time:
 *
 *   Figma value    ->  props
 *   Default            state: 'Default',  revealed: false
 *   Hovered            state: 'Hovered',  revealed: false
 *   Typed hide         state: 'Typed',    revealed: false
 *   Typed Open         state: 'Typed',    revealed: true
 *   Error hide         state: 'Error',    revealed: false
 *   Error Open         state: 'Error',    revealed: true
 *   Warning hide       state: 'Warning',  revealed: false
 *   Warning Open       state: 'Warning',  revealed: true
 *   Disabled           state: 'Disabled', revealed: false
 *
 * WHAT TO LOOK AT — and what has CHANGED since the last test pass. Clicking the eye on
 * the three Typed / Error / Warning stories used to change the FACE AND LINE HEIGHT of
 * the value as well as the masking, because the three `hide` variants bound no
 * typography at all on their value layer while their `Open` twins bound Body/Medium in
 * full. The designer bound Body/Medium on all three (234:1001, 234:1004, 234:1011) on
 * 2026-10-04, every Icon row in the node now measures 20px, and the parked literal that
 * carried the gap has been deleted. Masked and revealed should now be the same type and
 * the same line box; only the masking and the glyph change.
 *
 * Two gaps remain the design's to close, not this component's:
 *   - no focus variant anywhere in the set, which matters more here than on the
 *     siblings because this component contains a real focusable control (the reveal
 *     button) that the design gives no focus treatment at all. Re-read per variant on
 *     2026-10-04: the `Property 1` axis still has exactly nine values and none of them
 *     is a focus cell;
 *   - the placeholder is color/text/input text #a1a8b1 on color/bg/base #ffffff —
 *     about 2.4:1, under AA for body text.
 *
 * Disabled text is about 2.0:1 on the disabled fill — exempt from AA 1.4.3, noted
 * rather than filed.
 *
 * Unlike Input Field/Primary, the DISABLED LABEL here binds `color/text/disabled`, the
 * same token as the value and helper beside it — Primary's `color/text/disabled on dark`
 * mis-binding did NOT inherit. Checked per layer on 244:219 precisely because it was
 * expected to.
 */

import {
  InputFieldPassword,
  INPUT_FIELD_PASSWORD_STATES,
  INPUT_FIELD_PASSWORD_PROPERTY_1,
} from './InputFieldPassword.jsx';

const FIGMA_NODE =
  'https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=234-941';

const SECRET = 'mm245@';

export default {
  title: 'Components/Input Field Password',
  tags: ['autodocs'],
  component: InputFieldPassword,
  render: (args) => <InputFieldPassword {...args} />,
  argTypes: {
    state: { control: { type: 'inline-radio' }, options: INPUT_FIELD_PASSWORD_STATES },
    revealed: { control: 'boolean' },
    showIcon: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    state: 'Default',
    revealed: false,
    showIcon: true,
    label: 'Password',
    helperText: 'Helper text goes here',
    placeholder: 'Type here',
  },
  parameters: {
    controls: { disable: false },
    design: { type: 'figma', url: FIGMA_NODE },
  },
};

/* ====================== the nine rows of the Figma matrix ====================== */

/** 234:940 `Default` — empty, so the placeholder shows in color/text/input text.
 *  Resting border color/border/surfacePrimary. The crossed eye sits at the end of the
 *  field, as the node's USAGE note says. */
export const Default = {
  args: { state: 'Default', revealed: false },
};

/** 234:942 `Hovered` — pointer over the field. Border moves to
 *  color/border/brand/bold. Still empty: 234:948 binds color/text/input text, the same
 *  as Default. */
export const Hovered = {
  args: { state: 'Hovered', revealed: false },
};

/** 234:955 `Typed hide` — the field holds a secret and it is masked. Border
 *  color/border/brand/bold, value color/text/primary.
 *
 *  234:1001 now binds Body/Medium (rebound 2026-10-04). Compare it with `Typed Open`
 *  below: the type and the line box should be identical, and only the masking and the
 *  glyph differ. */
export const TypedHide = {
  name: 'Typed hide',
  args: { state: 'Typed', revealed: false, value: SECRET },
};

/** 234:968 `Typed Open` — the same secret, revealed. The open eye replaces the crossed
 *  one and the value renders Body/Medium (234:974). */
export const TypedOpen = {
  name: 'Typed Open',
  args: { state: 'Typed', revealed: true, value: SECRET },
};

/** 244:171 `Error hide` — validation failed, value masked. Border
 *  color/border/negative/bold, helper color/text/negative. The helper says what is
 *  wrong — never colour alone. Value layer 234:1004 binds Body/Medium (rebound). */
export const ErrorHide = {
  name: 'Error hide',
  args: {
    state: 'Error',
    revealed: false,
    value: SECRET,
    helperText: 'Use at least 8 characters, including a number.',
  },
};

/** 244:183 `Error Open` — the same failure, revealed, so the user can see what they
 *  typed. Value 244:189 binds Body/Medium. */
export const ErrorOpen = {
  name: 'Error Open',
  args: {
    state: 'Error',
    revealed: true,
    value: SECRET,
    helperText: 'Use at least 8 characters, including a number.',
  },
};

/** 244:194 `Warning hide` — the value can be submitted, but the helper flags the risk.
 *  Border color/border/warning/bold, helper color/text/warning. Value layer 234:1011
 *  binds Body/Medium (rebound). */
export const WarningHide = {
  name: 'Warning hide',
  args: {
    state: 'Warning',
    revealed: false,
    value: SECRET,
    helperText: 'This password is weak. You can still continue.',
  },
};

/** 244:206 `Warning Open` — the same warning, revealed. Value 244:212 binds
 *  Body/Medium. */
export const WarningOpen = {
  name: 'Warning Open',
  args: {
    state: 'Warning',
    revealed: true,
    value: SECRET,
    helperText: 'This password is weak. You can still continue.',
  },
};

/** 244:217 `Disabled` — the field cannot be edited. Fill color/bg/surfacePrimary,
 *  border color/border/disabled, icon color/icon/disabled, and the label, value and
 *  helper ALL on color/text/disabled. The reveal control is disabled with the field,
 *  which is why the node shows the crossed eye here. */
export const Disabled = {
  args: { state: 'Disabled', revealed: false },
};

/* ============================ the `Show icon` property ============================ */

/** `Show icon` = false. "Show icon hides the control." With no control the field cannot
 *  be unmasked by the user, so the secret stays masked. */
export const NoIcon = {
  name: 'Show icon = false',
  args: { state: 'Typed', revealed: false, showIcon: false, value: SECRET },
};

/* ================= combinations the runtime reaches, Figma does not ================= */

/** NOT a Figma cell — and the reason `revealed` is a boolean rather than part of a flat
 *  nine-value enum. Click the eye on an EMPTY field and this is where you land: open
 *  eye, placeholder still plain, nothing revealed because there is nothing to reveal.
 *  The design did not draw it; the runtime reaches it the moment anyone clicks. */
export const DefaultRevealed = {
  name: 'Default + revealed (no Figma cell)',
  args: { state: 'Default', revealed: true },
};

/* ================================ the matrix, in one ================================ */

/** All nine Figma values at once, each labelled with its `Property 1` value and node id,
 *  for reading side by side against the node. Every row should now stand the same height:
 *  the `hide`-versus-`Open` difference that used to show here was the unbound-typography
 *  gap, and the designer closed it on 2026-10-04. */
export const FigmaMatrix = {
  name: 'The matrix — all nine',
  parameters: { controls: { disable: true } },
  render: () => <Matrix />,
};

const NODE_ID = {
  'Default': '234:940',
  'Hovered': '234:942',
  'Typed hide': '234:955',
  'Typed Open': '234:968',
  'Error hide': '244:171',
  'Error Open': '244:183',
  'Warning hide': '244:194',
  'Warning Open': '244:206',
  'Disabled': '244:217',
};
const HELPER = {
  Error: 'Use at least 8 characters, including a number.',
  Warning: 'This password is weak. You can still continue.',
};

function Matrix() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
      {Object.entries(INPUT_FIELD_PASSWORD_PROPERTY_1).map(([property1, { state, revealed }]) => (
        <div key={property1} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <code style={{ fontSize: 11, opacity: 0.6 }}>
            {`Property 1 = ${property1}   ·   ${NODE_ID[property1]}`}
          </code>
          <InputFieldPassword
            state={state}
            revealed={revealed}
            value={['Typed', 'Error', 'Warning'].includes(state) ? SECRET : undefined}
            helperText={HELPER[state]}
          />
        </div>
      ))}
    </div>
  );
}
