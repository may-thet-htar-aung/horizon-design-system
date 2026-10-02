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
 * the note in checkBox.stories.js. Both are accepted here so the prop can express
 * either, and both paint the same resting box.
 */

import './checkBox.css';
import checkMark from './icons/check.svg?raw';

export const CHECK_BOX_STATES = ['Default', 'Hovered', 'Checked', 'Unchecked', 'Disabled'];

/** Default swap-slot contents, matching Symbol/filled/check. */
export const defaultIcon = checkMark;

/** The Icon slot accepts an SVG string or a live node. */
function renderMark(icon) {
  const slot = document.createElement('span');
  slot.className = 'hz-checkbox__mark';
  // The box carries the accessible state; the mark is decoration.
  slot.setAttribute('aria-hidden', 'true');

  const content = icon ?? defaultIcon;

  if (content instanceof Node) {
    slot.append(content.cloneNode(true));
  } else {
    slot.innerHTML = content;
  }

  return slot;
}

/**
 * @param {object} props
 * @param {'Default'|'Hovered'|'Checked'|'Unchecked'|'Disabled'} [props.state] Figma: State
 * @param {string|Node|null} [props.icon]   Figma: Icon (instance swap slot)
 * @param {string}  [props.label]           Accessible name. The node's docs require one.
 * @param {(checked: boolean, event: MouseEvent) => void} [props.onChange]
 * @returns {HTMLButtonElement}
 */
export function createCheckBox({
  state = 'Default',
  icon = null,
  label = 'Keep me signed in',
  onChange,
} = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'hz-checkbox';

  // role=checkbox + aria-checked is what exposes the choice to assistive tech.
  // A <button> gives real keyboard operation (Space and Enter) and real disabling
  // for free, which an unlabelled <div> would not.
  el.setAttribute('role', 'checkbox');
  el.setAttribute('aria-label', label);
  el.setAttribute('aria-checked', String(state === 'Checked'));

  // Disabled is a real DOM state, per the node's accessibility note.
  el.disabled = state === 'Disabled';

  // Hover is a live :hover. data-state forces the painted state so every row of the
  // variant matrix can be rendered and compared side by side, as Button does.
  if (state === 'Hovered') {
    el.dataset.state = 'Hovered';
  }

  el.append(renderMark(icon));

  el.addEventListener('click', (event) => {
    if (el.disabled) return;
    const next = el.getAttribute('aria-checked') !== 'true';
    el.setAttribute('aria-checked', String(next));
    if (onChange) onChange(next, event);
  });

  return el;
}

export default createCheckBox;
