/**
 * Horizon Button
 * Figma: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=65-22
 *
 * Triggers an action. Type sets emphasis, State covers interaction.
 * Prop names match the Figma component properties.
 */

import './button.css';
import arrowSmallLeft from './icons/arrow-small-left.svg?raw';
import arrowSmallRight from './icons/arrow-small-right.svg?raw';

export const BUTTON_TYPES = ['Primary', 'Outline', 'Ghost'];
export const BUTTON_STATES = ['Default', 'Hover', 'Disabled'];

const TYPE_CLASS = {
  Primary: 'hz-button--primary',
  Outline: 'hz-button--outline',
  Ghost: 'hz-button--ghost',
};

/** Default swap-slot contents, matching Symbol/outlined/arrow-small-*. */
export const defaultIcons = {
  left: arrowSmallLeft,
  right: arrowSmallRight,
};

/** Icon slots accept an SVG string or a live node. */
function renderIcon(icon, fallback) {
  const slot = document.createElement('span');
  slot.className = 'hz-button__icon';
  const content = icon ?? fallback;

  if (content instanceof Node) {
    slot.append(content.cloneNode(true));
  } else {
    slot.innerHTML = content;
  }

  return slot;
}

/**
 * @param {object}  props
 * @param {'Primary'|'Outline'|'Ghost'} [props.type]   Figma: Type
 * @param {'Default'|'Hover'|'Disabled'} [props.state] Figma: State
 * @param {string}  [props.label]                      Figma: Label
 * @param {boolean} [props.showIconLeft]               Figma: Show Icon Left
 * @param {boolean} [props.showIconRight]              Figma: Show Icon Right
 * @param {string|Node|null} [props.iconLeft]          Figma: Icon Left (swap slot)
 * @param {string|Node|null} [props.iconRight]         Figma: Icon Right (swap slot)
 * @param {'button'|'submit'|'reset'} [props.htmlType] DOM type attribute
 * @param {(event: MouseEvent) => void} [props.onClick]
 * @returns {HTMLButtonElement}
 */
export function createButton({
  type = 'Primary',
  state = 'Default',
  label = 'Continue',
  showIconLeft = false,
  showIconRight = false,
  iconLeft = null,
  iconRight = null,
  htmlType = 'button',
  onClick,
} = {}) {
  const el = document.createElement('button');
  el.type = htmlType;
  el.className = `hz-button ${TYPE_CLASS[type] ?? TYPE_CLASS.Primary}`;

  // Disabled is a real DOM state, not a colour swap — the component doc is
  // explicit that "Disabled is visual only" must not be the code behaviour.
  el.disabled = state === 'Disabled';

  // Hover is a live :hover. data-state forces the painted state so every row
  // of the variant matrix can be rendered and compared side by side.
  if (state === 'Hover') {
    el.dataset.state = 'Hover';
  }

  if (showIconLeft) {
    el.append(renderIcon(iconLeft, defaultIcons.left));
  }

  const text = document.createElement('span');
  text.className = 'hz-button__label';
  text.textContent = label;
  el.append(text);

  if (showIconRight) {
    el.append(renderIcon(iconRight, defaultIcons.right));
  }

  if (onClick) {
    el.addEventListener('click', onClick);
  }

  return el;
}

export default createButton;
