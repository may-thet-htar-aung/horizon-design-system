/**
 * Horizon Button
 * Figma: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=65-22
 *
 * Triggers an action. Type sets emphasis, State covers interaction.
 * Prop names match the Figma component properties.
 */

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

/** Icon slots accept an SVG string or any React node. */
function Icon({ icon, fallback }) {
  const content = icon ?? fallback;

  if (typeof content === 'string') {
    return <span className="hz-button__icon" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <span className="hz-button__icon">{content}</span>;
}

/**
 * @param {object}  props
 * @param {'Primary'|'Outline'|'Ghost'} [props.type]   Figma: Type
 * @param {'Default'|'Hover'|'Disabled'} [props.state] Figma: State
 * @param {string}  [props.label]                      Figma: Label
 * @param {boolean} [props.showIconLeft]               Figma: Show Icon Left
 * @param {boolean} [props.showIconRight]              Figma: Show Icon Right
 * @param {string|import('react').ReactNode|null} [props.iconLeft]  Figma: Icon Left (swap slot)
 * @param {string|import('react').ReactNode|null} [props.iconRight] Figma: Icon Right (swap slot)
 * @param {'button'|'submit'|'reset'} [props.htmlType] DOM type attribute
 * @param {(event: import('react').MouseEvent<HTMLButtonElement>) => void} [props.onClick]
 */
export function Button({
  type = 'Primary',
  state = 'Default',
  label = 'Continue',
  showIconLeft = false,
  showIconRight = false,
  iconLeft = null,
  iconRight = null,
  htmlType = 'button',
  onClick,
  ...rest
}) {
  return (
    <button
      {...rest}
      type={htmlType}
      className={`hz-button ${TYPE_CLASS[type] ?? TYPE_CLASS.Primary}`}
      // Disabled is a real DOM state, not a colour swap — the component doc is
      // explicit that "Disabled is visual only" must not be the code behaviour.
      disabled={state === 'Disabled'}
      // Hover is a live :hover. data-state forces the painted state so every row
      // of the variant matrix can be rendered and compared side by side.
      data-state={state === 'Hover' ? 'Hover' : undefined}
      onClick={onClick}
    >
      {showIconLeft && <Icon icon={iconLeft} fallback={defaultIcons.left} />}
      <span className="hz-button__label">{label}</span>
      {showIconRight && <Icon icon={iconRight} fallback={defaultIcons.right} />}
    </button>
  );
}

export default Button;
