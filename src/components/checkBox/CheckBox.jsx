/**
 * Horizon Check Box
 * Figma: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=251-19
 *
 * Records one yes or no choice. One axis in Figma — State — covering rest, hover,
 * selection and disabled. There is no size axis; the box is fixed at 16.
 * Prop names match the Figma component properties.
 *
 * Two notes the node's own documentation drives:
 *   - "Disabled is visual only. Disable the control in code too." So State=Disabled
 *     sets the real DOM disabled attribute, not just a colour swap.
 *   - "Expose Checked and Unchecked to assistive technology." So the element carries
 *     role=checkbox and a live aria-checked, and the mark is decorative.
 *
 * Default and Unchecked are two separate Figma states that render identically — see
 * the note in CheckBox.stories.jsx. Both are accepted here so the prop can express
 * either, and both paint the same resting box.
 */

import { useEffect, useState } from 'react';
import checkMark from './icons/check.svg?raw';

export const CHECK_BOX_STATES = ['Default', 'Hovered', 'Checked', 'Unchecked', 'Disabled'];

/** Default swap-slot contents, matching Symbol/filled/check. */
export const defaultIcon = checkMark;

/** The Icon slot accepts an SVG string or any React node. */
function Mark({ icon }) {
  const content = icon ?? defaultIcon;

  // The box carries the accessible state; the mark is decoration.
  return typeof content === 'string' ? (
    <span className="hz-checkbox__mark" aria-hidden="true" dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <span className="hz-checkbox__mark" aria-hidden="true">
      {content}
    </span>
  );
}

/**
 * @param {object} props
 * @param {'Default'|'Hovered'|'Checked'|'Unchecked'|'Disabled'} [props.state] Figma: State
 * @param {string|import('react').ReactNode|null} [props.icon]   Figma: Icon (instance swap slot)
 * @param {string}  [props.label]           Accessible name. The node's docs require one.
 * @param {boolean} [props.checked]
 *   NOT a Figma property. Makes the box controlled: it shows exactly this value and
 *   changes only when you change it. Leave it out and the box keeps its own state,
 *   starting from `state`.
 * @param {(checked: boolean, event: import('react').MouseEvent<HTMLButtonElement>) => void} [props.onChange]
 */
export function CheckBox({
  state = 'Default',
  icon = null,
  label = 'Keep me signed in',
  checked,
  onChange,
  ...rest
}) {
  const [own, setOwn] = useState(state === 'Checked');
  useEffect(() => setOwn(state === 'Checked'), [state]);

  const isChecked = checked ?? own;
  const disabled = state === 'Disabled';

  return (
    <button
      {...rest}
      type="button"
      className="hz-checkbox"
      // role=checkbox + aria-checked is what exposes the choice to assistive tech.
      // A <button> gives real keyboard operation (Space and Enter) and real disabling
      // for free, which an unlabelled <div> would not.
      role="checkbox"
      aria-label={label}
      aria-checked={isChecked}
      // Disabled is a real DOM state, per the node's accessibility note.
      disabled={disabled}
      // Hover is a live :hover. data-state forces the painted state so every row of the
      // variant matrix can be rendered and compared side by side, as Button does.
      data-state={state === 'Hovered' ? 'Hovered' : undefined}
      onClick={(event) => {
        if (disabled) return;
        const next = !isChecked;
        if (checked === undefined) setOwn(next);
        if (onChange) onChange(next, event);
      }}
    >
      <Mark icon={icon} />
    </button>
  );
}

export default CheckBox;
