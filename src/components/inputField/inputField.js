/**
 * Horizon Input Field / Mobile
 * Figma: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=227-44
 *
 * Collects a single value. ONE axis in Figma — State — with six values:
 * Default, Hovered, Typed, Error, Warning, Disabled (227:2 · 227:9 · 227:16 ·
 * 227:23 · 227:30 · 227:37). There is no size axis and no focus variant.
 *
 * Three rows, top to bottom, exactly as the node is built:
 *   Label row  (inset spacing/12)
 *   Field      (fixed height, radius borderradius/medium)
 *   Helper row (inset spacing/12)
 *
 * COMPOSITION — this is the first MOLECULES row in the registry, and it composes
 * NOTHING. The node's children are plain frames and text layers; there is no
 * instance of Button, Check Box or Pin Code anywhere in the set. No existing
 * component is reused here because none appears in the design.
 *
 * Prop names follow the Figma component properties: State, Label, Show Label,
 * Helper text, Show Helper text.
 *
 * Notes the node's own documentation drives:
 *   - "Disabled is visual only. Disable the control in code too, and never rely on
 *     colour alone — the helper has to say what is wrong." So State=Disabled sets the
 *     real DOM disabled attribute, and Error/Warning are announced through
 *     aria-invalid and the helper's own wording, never colour alone.
 *   - "Keep the helper in every state so the field does not jump." The helper row is
 *     shown by default in every state; Show Helper text is the consumer's opt-out,
 *     not a per-state behaviour.
 *   - "Don't put Error or Warning on an empty field — both states show a value."
 *     Both states default to a sample value.
 *   - "Don't override the field height. It is fixed at 52 so inputs align in a row."
 *     Enforced in CSS, not left to the consumer.
 *   - "Use the placeholder as an example of the expected value, not as the field
 *     name." The label is a real <label> bound to the input; the placeholder is a
 *     real placeholder attribute. They are never the same string by default.
 *
 * Keyboard focus has NO variant in this set — the node's accessibility note says so
 * outright ("Hover is not a substitute for focus. Keyboard focus needs its own
 * treatment — not yet in this set"). No focus style is invented here; the browser's
 * own focus ring is deliberately left intact. See inputField.css.
 */

import './inputField.css';

export const INPUT_FIELD_STATES = [
  'Default',
  'Hovered',
  'Typed',
  'Error',
  'Warning',
  'Disabled',
];

/** The states that paint the value in full-strength text rather than placeholder grey. */
const STATES_SHOWING_VALUE = ['Typed', 'Error', 'Warning'];

let uid = 0;

/**
 * @param {object} props
 * @param {'Default'|'Hovered'|'Typed'|'Error'|'Warning'|'Disabled'} [props.state]
 *   Figma: State
 * @param {string} [props.label]            Figma: Label — text property
 * @param {boolean} [props.showLabel]       Figma: Show Label — boolean property
 * @param {string} [props.helperText]       Figma: Helper text — text property
 * @param {boolean} [props.showHelperText]  Figma: Show Helper text — boolean property
 * @param {string} [props.value]
 *   NOT a Figma property. The node's documentation is explicit: "The value inside the
 *   field is sample copy on the variant, not a property." It is a real prop here
 *   because a real input needs a real value; it defaults to the sample copy the
 *   matching variant renders.
 * @param {string} [props.placeholder]
 *   NOT a Figma property, for the same reason — the node renders it as sample copy.
 * @param {(value: string, event: Event) => void} [props.onChange]
 * @returns {HTMLDivElement}
 */
export function createInputField({
  state = 'Default',
  label = 'Email',
  showLabel = true,
  helperText = 'Helper text goes here',
  showHelperText = true,
  value,
  placeholder = 'you@email.com',
  onChange,
} = {}) {
  const id = `hz-input-field-${++uid}`;
  const helperId = `${id}-helper`;

  const root = document.createElement('div');
  root.className = 'hz-input-field';
  root.dataset.state = state;

  /* -------------------------------------------------- Label row (227:3 … 227:38) */
  let labelEl;
  if (showLabel) {
    const labelRow = document.createElement('div');
    labelRow.className = 'hz-input-field__label-row';

    labelEl = document.createElement('label');
    labelEl.className = 'hz-input-field__label';
    labelEl.htmlFor = id;
    labelEl.textContent = label;

    labelRow.append(labelEl);
    root.append(labelRow);
  }

  /* ------------------------------------------------- Field (227:5 … 227:40) */
  const field = document.createElement('div');
  field.className = 'hz-input-field__field';

  const input = document.createElement('input');
  input.className = 'hz-input-field__input';
  input.type = 'text';
  input.id = id;
  input.placeholder = placeholder;

  // "Don't put Error or Warning on an empty field — both states show a value."
  // Typed, Error and Warning default to the sample copy their variant renders;
  // Default, Hovered and Disabled render empty and show the placeholder.
  const defaultValue = STATES_SHOWING_VALUE.includes(state) ? 'mai7@email.com' : '';
  input.value = value ?? defaultValue;

  // Disabled is a real DOM state, per the node's accessibility note.
  input.disabled = state === 'Disabled';

  // Error is announced, not just coloured — "never rely on colour alone". Warning is
  // not aria-invalid: the node's docs say the value "can be submitted", so it is a
  // live-region-free advisory carried by the helper's wording, not a validity failure.
  if (state === 'Error') {
    input.setAttribute('aria-invalid', 'true');
  }

  // When there is no label row there is still a control that needs a name.
  if (!showLabel) {
    input.setAttribute('aria-label', label);
  }

  field.append(input);
  root.append(field);

  /* ------------------------------------------- Helper row (227:7 … 227:42) */
  if (showHelperText) {
    const helperRow = document.createElement('div');
    helperRow.className = 'hz-input-field__helper-row';

    const helperEl = document.createElement('p');
    helperEl.className = 'hz-input-field__helper';
    helperEl.id = helperId;
    helperEl.textContent = helperText;

    helperRow.append(helperEl);
    root.append(helperRow);

    // The helper carries the reason, so it must be announced with the control.
    input.setAttribute('aria-describedby', helperId);
  }

  /* ------------------------------------------------------------ behaviour */
  // Typed is live: entering a value paints the Typed border and swaps the value text
  // from placeholder grey to full strength; clearing it returns the field to rest.
  // Error and Warning keep their status border while the value is edited, because the
  // node's docs tie those states to validation of the value, not to the act of typing.
  const paintFilled = () => {
    root.dataset.filled = input.value.length > 0 ? 'true' : 'false';
  };

  input.addEventListener('input', (event) => {
    paintFilled();
    if (onChange) onChange(input.value, event);
  });

  paintFilled();

  return root;
}

export default createInputField;
