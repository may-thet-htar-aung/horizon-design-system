/**
 * Horizon Input Field / Password
 * Figma: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=234-941
 *
 * ===========================================================================
 * WHY THIS IS ITS OWN MODULE AND NOT A THIRD `variant` ON inputField.js
 * ===========================================================================
 * `src/components/inputField/` already serves two registry rows — Input Field/Mobile
 * (227:44) and Input Field/Primary (220:50) — on one module, because those two really
 * are one component with different values. That file states the test it applied:
 *
 *     "identical element set … identical property set … identical state machine"
 *
 * Password fails all three, measured against the live node, not assumed:
 *
 *   ELEMENT SET      Password adds `Icon row` (234:932) wrapping the value, and inside
 *                    it `Icon area` (234:934) holding TWO icon instances — `Icon`
 *                    (234:935) and `Icon open` (234:936) — whose visibility swaps. No
 *                    such node exists anywhere in 227:44 or 220:50.
 *   PROPERTY SET     Password's Figma properties are `Property 1`, `Show icon` and
 *                    `Icon`. It has NO Label, Show Label, Helper text or Show Helper
 *                    text property — the label "Password" and the helper are fixed
 *                    sample copy on every variant. The siblings have exactly the four
 *                    properties Password lacks, and lack the two Password has.
 *   STATE MACHINE    Nine values on one axis named `Property 1`, not six on one named
 *                    `State`, and the ninth dimension is a toggle the user drives at
 *                    runtime rather than a state a consumer selects.
 *
 * On top of that, Password introduces a focusable <button> inside the field and an
 * input `type` that changes while the user is in the control. Neither sibling has any
 * interactive child at all.
 *
 * The alternative — an optional trailing slot on the shared module, inert for Mobile
 * and Primary — was weighed and rejected. Mobile and Primary are BOTH live in
 * production and neither has a registry event that would catch a regression (registry
 * D15: a design change to a finished component wakes nobody, and a clean token diff
 * never proves a component is still correct). Asserting a new code path is inert in a
 * file two shipped components execute is weaker evidence than not editing that file.
 * This module leaves `src/components/inputField/` byte-identical, so the proof of
 * inertness is the diff itself.
 *
 * The cost is honest and recorded: the label row, the helper row and the filled-value
 * painting are written a second time here, roughly thirty lines. That is the price of
 * not putting a third registry row on one production file.
 *
 * ===========================================================================
 * THE REVEAL AXIS — why `state` + `revealed`, not a flat nine-value enum
 * ===========================================================================
 * Figma folds two axes into one flat list of nine. Read per layer, the decomposition
 * is exact and total — suffix `Open` means `Icon open` is visible and the value renders
 * as plain text; `hide` or no suffix means `Icon` (the crossed eye) is visible:
 *
 *   Property 1       node      value layer        Icon      Icon open
 *   Default          234:940   "Type here"        shown     hidden
 *   Hovered          234:942   "Type here"        shown     hidden
 *   Typed hide       234:955   "••••••••••"       shown     hidden
 *   Typed Open       234:968   "mm245@"           hidden    shown
 *   Error hide       244:171   "••••••••••"       shown     hidden
 *   Error Open       244:183   "mm245@"           hidden    shown
 *   Warning hide     244:194   "••••••••••"       shown     hidden
 *   Warning Open     244:206   "mm245@"           hidden    shown
 *   Disabled         244:217   "Type here"        shown     hidden
 *
 * That is six states — the SAME six the siblings carry, by name and by meaning —
 * crossed with a `revealed` boolean, with the cross drawn only on the three states that
 * actually hold a value. Default, Hovered and Disabled render the PLACEHOLDER
 * ("Type here"), not a secret, so there is nothing for the mask to hide and the
 * designer had no visibly distinct second cell to draw.
 *
 * Modelled as `state` + `revealed` because:
 *
 *   1. It keeps Password's state axis identical to Mobile's and Primary's. A flat
 *      nine-value enum would make this the only Input Field whose states do not line
 *      up with the other two.
 *   2. Reveal is a runtime behaviour, not a design state. The user clicks the eye. With
 *      a boolean that click is `revealed = !revealed` and the validation state is
 *      untouched. With a flat enum the component would have to rewrite its own `state`
 *      prop, and would need to know that `Error hide` → `Error Open` but `Disabled` and
 *      `Default` map nowhere.
 *   3. The flat list cannot express combinations the runtime reaches but the design did
 *      not draw. Click the eye on an empty field and you are in Default-revealed: no
 *      Figma cell exists for it, the enum has no value to hold it, and the boolean
 *      renders it correctly — open eye, placeholder still plain.
 *   4. `revealed` maps 1:1 onto the real mechanism, `type="password"` vs `type="text"`,
 *      which is what assistive tech and password managers actually read.
 *
 * `INPUT_FIELD_PASSWORD_PROPERTY_1` below exports all nine Figma values with their
 * exact spelling and their (state, revealed) mapping, so a tester can go from a Figma
 * variant name to this component's props without guessing. Every one of the nine has
 * its own story.
 *
 * ===========================================================================
 * COMPOSITION
 * ===========================================================================
 * The two icon instances are instances of `Symbol/filled/eye-crossed` (239:176) and
 * `Symbol/filled/eye` (221:311) — symbols, not registry components. Like both siblings,
 * Password composes no registry component: there is no Button, Check Box or Pin Code
 * instance anywhere in the set. (`Composes` is owned by nobody as of 2026-09-12 —
 * registry D12 — so this is recorded here and written nowhere.)
 *
 * ===========================================================================
 * WHAT THE DESIGN LEAVES UNBOUND — reported, never invented
 * ===========================================================================
 * See the header of InputFieldPassword.css for the full list and the SPEC line beside
 * each.
 *
 * The one that changed behaviour is now CLOSED (2026-10-04): the three `hide` variants
 * used to bind no typography at all on their value layer, so the masked and revealed
 * text rendered in different faces at different line heights. The designer has bound
 * Body/Medium on 234:1001, 234:1004 and 234:1011, and the parked literal that carried
 * the gap has been deleted rather than re-pointed. Clicking the eye now changes the
 * masking and nothing else.
 *
 * Still open, and still the design's: no focus variant anywhere in the set — which
 * matters here because this module puts a real focusable <button> inside the field — and
 * the placeholder's contrast. Neither is invented in code.
 */

import { useEffect, useId, useState } from 'react';
import './InputFieldPassword.css';
import eyeCrossed from './icons/eye-crossed.svg?raw';
import eye from './icons/eye.svg?raw';

/**
 * The six states, by their Figma meaning. Same six as Input Field/Mobile and
 * Input Field/Primary — see the header.
 */
export const INPUT_FIELD_PASSWORD_STATES = [
  'Default',
  'Hovered',
  'Typed',
  'Error',
  'Warning',
  'Disabled',
];

/**
 * Every value of the Figma axis `Property 1`, spelled exactly as the node spells it
 * (including the lowercase `hide` and the capitalised `Open`), mapped to the props that
 * reproduce it. This is the table QA builds its matrix from.
 */
export const INPUT_FIELD_PASSWORD_PROPERTY_1 = {
  'Default': { state: 'Default', revealed: false },
  'Hovered': { state: 'Hovered', revealed: false },
  'Typed hide': { state: 'Typed', revealed: false },
  'Typed Open': { state: 'Typed', revealed: true },
  'Error hide': { state: 'Error', revealed: false },
  'Error Open': { state: 'Error', revealed: true },
  'Warning hide': { state: 'Warning', revealed: false },
  'Warning Open': { state: 'Warning', revealed: true },
  'Disabled': { state: 'Disabled', revealed: false },
};

/** The states whose value layer carries a secret rather than the placeholder. */
const STATES_SHOWING_VALUE = ['Typed', 'Error', 'Warning'];

/** Default contents of the `Icon` swap slot, per the SPEC's two symbols. */
export const defaultIconHidden = eyeCrossed;
export const defaultIconRevealed = eye;

/**
 * Sample copy, exactly as the node renders it. Not Figma properties — this set has no
 * text properties at all; the label and helper are fixed copy on every variant.
 */
const SAMPLE = {
  label: 'Password',
  placeholder: 'Type here',
  value: 'mm245@',
  helperText: 'Helper text goes here',
};

/** The Icon slot accepts an SVG string or any React node. */
function Glyph({ icon }) {
  return typeof icon === 'string' ? (
    <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: icon }} />
  ) : (
    icon
  );
}

/**
 * @param {object} props
 * @param {'Default'|'Hovered'|'Typed'|'Error'|'Warning'|'Disabled'} [props.state]
 *   The validation / interaction state. Half of Figma's `Property 1` — see the header.
 * @param {boolean} [props.revealed]
 *   Whether the secret is shown. The other half of `Property 1`: false renders the
 *   `hide` cell and the crossed eye, true renders the `Open` cell and the open eye.
 *   Starts from this value and follows it when it changes; the eye button toggles it.
 * @param {boolean} [props.showIcon]
 *   Figma: `Show icon` — boolean property. "Show icon hides the control." When false
 *   the reveal control is not rendered and the field cannot be unmasked by the user.
 * @param {string|import('react').ReactNode} [props.icon]
 *   Figma: `Icon` — instance-swap property. "Icon swaps the glyph." Replaces the glyph
 *   in both the hidden and revealed positions; pass `iconRevealed` to swap only the
 *   revealed one.
 * @param {string|import('react').ReactNode} [props.iconRevealed]
 *   NOT a Figma property. Exposed separately so a consumer can override one glyph
 *   without losing the other.
 * @param {string} [props.label]
 *   NOT a Figma property — "Password" is fixed copy on all nine variants.
 * @param {string} [props.helperText]
 *   NOT a Figma property, for the same reason. The node's helper is fixed copy.
 * @param {string} [props.value]
 *   NOT a Figma property — sample copy on the variant.
 * @param {string} [props.placeholder]
 *   NOT a Figma property — sample copy on the variant.
 * @param {(revealed: boolean) => void} [props.onRevealChange]
 * @param {(value: string, event: import('react').ChangeEvent<HTMLInputElement>) => void} [props.onChange]
 *   Any other prop (name, required, …) goes to the <input>.
 */
export function InputFieldPassword({
  state = 'Default',
  revealed: revealedProp = false,
  showIcon = true,
  icon,
  iconRevealed,
  label = SAMPLE.label,
  helperText = SAMPLE.helperText,
  value,
  placeholder = SAMPLE.placeholder,
  onRevealChange,
  onChange,
  ...inputProps
}) {
  const id = useId();
  const helperId = `${id}-helper`;
  const disabled = state === 'Disabled';

  // Default, Hovered and Disabled render the placeholder — the node shows "Type here"
  // on all three. Typed, Error and Warning carry the secret.
  const initial = value ?? (STATES_SHOWING_VALUE.includes(state) ? SAMPLE.value : '');
  const [text, setText] = useState(initial);
  useEffect(() => setText(initial), [initial]);

  const [revealed, setRevealed] = useState(revealedProp);
  useEffect(() => setRevealed(revealedProp), [revealedProp]);

  const toggle = () => {
    if (disabled) return;
    setRevealed(!revealed);
    if (onRevealChange) onRevealChange(!revealed);
  };

  const glyph = revealed ? (iconRevealed ?? icon ?? eye) : (icon ?? eyeCrossed);

  return (
    <div
      className="hz-input-field-password"
      data-state={state}
      data-revealed={revealed ? 'true' : 'false'}
      data-filled={text.length > 0 ? 'true' : 'false'}
    >
      {/* Label row (234:928 … 244:218) */}
      <div className="hz-input-field-password__label-row">
        <label className="hz-input-field-password__label" htmlFor={id}>
          {label}
        </label>
      </div>

      {/* Field group (234:930 … 244:220) */}
      <div className="hz-input-field-password__field-group">
        <div className="hz-input-field-password__field">
          <div className="hz-input-field-password__icon-row">
            <input
              autoComplete="current-password"
              {...inputProps}
              className="hz-input-field-password__input"
              id={id}
              placeholder={placeholder}
              // `revealed` IS the input type. This is the real mechanism the design's
              // two icon instances stand for, and what a password manager and a screen
              // reader read.
              type={revealed ? 'text' : 'password'}
              value={text}
              disabled={disabled}
              // Error is announced, not only coloured. Warning is advisory.
              aria-invalid={state === 'Error' ? 'true' : undefined}
              aria-describedby={helperId}
              onChange={(event) => {
                setText(event.target.value);
                if (onChange) onChange(event.target.value, event);
              }}
            />

            {/* Icon area (234:934 … 244:224) — ONE real <button> whose glyph swaps,
                because the design describes a control the user operates. */}
            {showIcon && (
              <button
                className="hz-input-field-password__icon-area"
                type="button"
                // The field is the labelled thing; this button needs its own name.
                aria-label={revealed ? 'Hide password' : 'Show password'}
                aria-pressed={revealed ? 'true' : 'false'}
                aria-controls={id}
                // "Disabled — the field cannot be edited." A disabled field's reveal
                // control is disabled with it.
                disabled={disabled}
                onClick={(event) => {
                  toggle();
                  // The point of the control is to read the field; keep the caret.
                  event.currentTarget.parentElement.querySelector('input')?.focus();
                }}
              >
                <Glyph icon={glyph} />
              </button>
            )}
          </div>
        </div>

        {/* Helper row (234:937 … 244:227) */}
        <div className="hz-input-field-password__helper-row">
          <p className="hz-input-field-password__helper" id={helperId}>
            {helperText}
          </p>
        </div>
      </div>
    </div>
  );
}

export default InputFieldPassword;
