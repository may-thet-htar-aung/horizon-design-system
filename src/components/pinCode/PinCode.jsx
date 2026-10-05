/**
 * Horizon Pin Code Cell
 * Figma: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=260-6558
 *
 * Holds one digit of a code. One axis in Figma — State — covering rest, hover,
 * entry, error and disabled. There is no size axis; the cell is fixed at 52 x 56.
 * Prop names match the Figma component properties.
 *
 * The node is a CELL, not a whole code. Its own documentation is explicit:
 * "Don't use one cell for a whole code" and "Use one cell per digit, in a row".
 * There is no row or group node in this component set, so none is built here —
 * a composed Pin Code row would be a second component from a second node.
 *
 * Three notes the node's own documentation drives:
 *   - "Disabled is visual only. Disable the control in code too, and never rely on
 *     colour alone." So State=Disabled sets the real DOM disabled attribute.
 *   - "Expose each cell as one character of the code. The digit is the value, not a
 *     separate label." So the cell is a real <input>, the digit is its value, and the
 *     naming of the code belongs to the group label the consumer supplies.
 *   - "Keep Value to a single character" / "Don't put more than one digit in Value."
 *     Enforced by maxlength and by truncating the prop.
 *
 * Keyboard focus has NO variant in this set — the node's accessibility note says so
 * outright ("Hover is not a substitute for focus. Keyboard focus needs its own
 * treatment — not yet in this set"). No focus style is invented here; the browser's
 * own focus ring is deliberately left intact. See PinCode.css.
 */

import { useEffect, useState } from 'react';

export const PIN_CODE_CELL_STATES = ['Default', 'Hovered', 'Typed', 'Error', 'Disabled'];

/** The states that paint the digit. Default, Hovered and Disabled render empty. */
const STATES_SHOWING_VALUE = ['Typed', 'Error'];

/**
 * One cell of a verification code. The design draws the single cell only; a row of
 * cells is the consumer's layout.
 *
 * @param {object} props
 * @param {'Default'|'Hovered'|'Typed'|'Error'|'Disabled'} [props.state] Figma: State
 * @param {string} [props.value]  Figma: Value — one character, shown on Typed and Error
 * @param {string} [props.label]  Accessible name for this one cell, e.g. "Digit 1 of 6"
 * @param {(value: string, event: import('react').ChangeEvent<HTMLInputElement>) => void} [props.onChange]
 *   Any other prop (name, ref, onKeyDown, …) goes to the <input>.
 */
export function PinCodeCell({
  state = 'Default',
  value = '4',
  label = 'Digit of verification code',
  onChange,
  ...rest
}) {
  // "Keep Value to a single character." The design's own constraint, enforced.
  const initial = STATES_SHOWING_VALUE.includes(state) ? String(value ?? '').slice(0, 1) : '';
  const [digit, setDigit] = useState(initial);
  useEffect(() => setDigit(initial), [initial]);

  return (
    <input
      {...rest}
      className="hz-pincode-cell"
      // A real text input: the digit IS the value, per the node's accessibility note.
      // inputmode=numeric brings up the number pad without rejecting non-digit codes.
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={1}
      aria-label={label}
      value={digit}
      // Disabled is a real DOM state, per the node's accessibility note.
      disabled={state === 'Disabled'}
      // Error is announced, not just coloured — "never rely on colour alone".
      aria-invalid={state === 'Error' ? 'true' : undefined}
      // Hover is a live :hover. data-state forces the painted state so every row of the
      // variant matrix can be rendered and compared side by side.
      data-state={state === 'Hovered' ? 'Hovered' : undefined}
      // Typed is also live: entering a character paints the Typed border, clearing it
      // returns the cell to rest. An Error cell stays Error until the consumer clears
      // it, because the node's docs say Error means "the code is wrong".
      data-filled={state !== 'Error' ? (digit.length > 0 ? 'true' : 'false') : undefined}
      onChange={(event) => {
        const next = event.target.value.slice(0, 1);
        setDigit(next);
        if (onChange) onChange(next, event);
      }}
    />
  );
}

export default PinCodeCell;
