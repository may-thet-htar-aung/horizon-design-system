/**
 * Horizon Input Field
 * Figma (Mobile):  https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=227-44
 * Figma (Primary): https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=220-50
 *
 * TWO Figma component sets, ONE component here. `Input Field/Mobile` (227:44) and
 * `Input Field/Primary` (220:50) are the same component with different values, not two
 * components:
 *
 *   - identical element set — label, field, value, helper, and nothing else
 *   - identical property set — State, Label, Show Label, Helper text, Show Helper text
 *   - identical state machine — Default · Hovered · Typed · Error · Warning · Disabled,
 *     with the same meaning on every one, and no focus variant on either
 *
 * What differs is bindings and one grouping level. Primary rebinds nearly every visual
 * property (see inputFieldPrimary.css for the per-layer table) and nests the field and
 * the helper inside a `Field group` frame so the field-to-helper gap is its own,
 * tighter step. That is a layout grouping, not new anatomy — no element is added,
 * removed or given a new job.
 *
 * So Primary is the `variant` prop, NOT a second folder. The behaviour below — the real
 * DOM disabled, aria-invalid on Error, the live filled/typed painting, the label and
 * helper wiring — is written once and shared, which is the whole point: two near-
 * identical components that drift apart is the outcome this avoids.
 *
 * The Mobile path is untouched by the Primary work. `variant` defaults to 'Mobile', the
 * Field group wrapper is rendered for Primary only, and every Primary style lives in
 * its own file scoped to `[data-variant='Primary']`. No Mobile rule was edited and no
 * Mobile DOM node moved.
 *
 * ---------------------------------------------------------------------------
 * Input Field / Mobile — 227:44
 * ---------------------------------------------------------------------------
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
 *
 * ---------------------------------------------------------------------------
 * Input Field / Primary — 220:50
 * ---------------------------------------------------------------------------
 * The same six States, on the same single axis (220:14 · 220:20 · 220:26 · 220:32 ·
 * 220:38 · 220:44), and the same five properties. Also no size axis and no focus
 * variant — the Primary node repeats the Mobile accessibility note word for word.
 *
 * Structure, read off get_metadata on each variant node:
 *
 *   Label row     (inset spacing/12)
 *   Field group   (gap bound to gap/element)
 *     Field       (height 40, radius borderradius/medium, inline padding spacing/12)
 *     Helper row  (inset spacing/12)
 *
 * The Field group is the one structural difference from Mobile, and it is the reason
 * `variant` reaches the DOM rather than only the stylesheet: Mobile stacks three rows
 * with one gap, Primary stacks two with a tighter gap inside the second.
 *
 * COMPOSITION — like Mobile, Primary composes nothing. Every child is a plain frame or
 * text layer; there is no instance of Button, Check Box or Pin Code anywhere in the set.
 * (The registry's `Composes` column is owned by nobody as of 2026-09-12 — registry D12 —
 * so this is recorded here and written nowhere.)
 *
 * The node's documentation drives the same behaviours as Mobile, with one number
 * changed: "Don't override the field height. It is fixed at 40 so inputs align in a
 * row." Enforced in CSS.
 */

import { useEffect, useId, useState } from 'react';

export const INPUT_FIELD_STATES = [
  'Default',
  'Hovered',
  'Typed',
  'Error',
  'Warning',
  'Disabled',
];

/**
 * The two Figma component sets this one component covers.
 * NOT a Figma property — Figma models them as two sets, and this is the axis that
 * names which set a given instance is. See the header.
 */
export const INPUT_FIELD_VARIANTS = ['Mobile', 'Primary'];

/** The states that paint the value in full-strength text rather than placeholder grey. */
const STATES_SHOWING_VALUE = ['Typed', 'Error', 'Warning'];

/**
 * Sample copy, per variant, exactly as the nodes render it. Not Figma properties —
 * both sets put the value and the placeholder on the variant as sample copy, which the
 * Mobile docs say outright and the Primary docs repeat: "The value inside the field is
 * sample copy on the variant, not a property."
 */
const SAMPLE = {
  Mobile: { label: 'Email', placeholder: 'you@email.com', value: 'mai7@email.com' },
  Primary: { label: 'Label', placeholder: 'Type here', value: 'Horizon Stays' },
};

/**
 * @param {object} props
 * @param {'Mobile'|'Primary'} [props.variant]
 *   Which Figma component set this instance is. 'Mobile' = 227:44, 'Primary' = 220:50.
 *   NOT a Figma property — Figma models the two as separate sets; see the header for
 *   why they are one component here. Defaults to 'Mobile'.
 * @param {'Default'|'Hovered'|'Typed'|'Error'|'Warning'|'Disabled'} [props.state]
 *   Figma: State
 * @param {string} [props.label]            Figma: Label — text property
 * @param {boolean} [props.showLabel]       Figma: Show Label — boolean property
 * @param {string} [props.helperText]       Figma: Helper text — text property
 * @param {boolean} [props.showHelperText]  Figma: Show Helper text — boolean property
 * @param {string} [props.value]
 *   NOT a Figma property. The field starts from this value (or the sample copy the
 *   matching state renders) and follows it when it changes; typing updates it live.
 * @param {string} [props.placeholder]
 *   NOT a Figma property, for the same reason — the node renders it as sample copy.
 * @param {(value: string, event: import('react').ChangeEvent<HTMLInputElement>) => void} [props.onChange]
 *   Any other prop (name, autoComplete, required, …) goes to the <input>.
 */
export function InputField({
  variant = 'Mobile',
  state = 'Default',
  label,
  showLabel = true,
  helperText = 'Helper text goes here',
  showHelperText = true,
  value,
  placeholder,
  onChange,
  ...inputProps
}) {
  const id = useId();
  const helperId = `${id}-helper`;
  const sample = SAMPLE[variant] ?? SAMPLE.Mobile;

  // "Don't put Error or Warning on an empty field — both states show a value."
  // Typed, Error and Warning default to the sample copy their variant renders;
  // Default, Hovered and Disabled render empty and show the placeholder.
  const initial = value ?? (STATES_SHOWING_VALUE.includes(state) ? sample.value : '');
  const [text, setText] = useState(initial);
  useEffect(() => setText(initial), [initial]);

  const labelText = label ?? sample.label;

  const field = (
    <div className="hz-input-field__field">
      <input
        {...inputProps}
        className="hz-input-field__input"
        type="text"
        id={id}
        placeholder={placeholder ?? sample.placeholder}
        value={text}
        // Disabled is a real DOM state, per the node's accessibility note.
        disabled={state === 'Disabled'}
        // Error is announced, not just coloured — "never rely on colour alone". Warning
        // is not aria-invalid: the node's docs say the value "can be submitted".
        aria-invalid={state === 'Error' ? 'true' : undefined}
        // When there is no label row there is still a control that needs a name.
        aria-label={showLabel ? undefined : labelText}
        // The helper carries the reason, so it must be announced with the control.
        aria-describedby={showHelperText ? helperId : undefined}
        onChange={(event) => {
          setText(event.target.value);
          if (onChange) onChange(event.target.value, event);
        }}
      />
    </div>
  );

  const helper = showHelperText && (
    <div className="hz-input-field__helper-row">
      <p className="hz-input-field__helper" id={helperId}>
        {helperText}
      </p>
    </div>
  );

  return (
    <div
      className="hz-input-field"
      data-variant={variant}
      data-state={state}
      // Typed is live: entering a value paints the Typed border and swaps the value text
      // from placeholder grey to full strength; clearing it returns the field to rest.
      // Error and Warning keep their status border while the value is edited.
      data-filled={text.length > 0 ? 'true' : 'false'}
    >
      {showLabel && (
        <div className="hz-input-field__label-row">
          <label className="hz-input-field__label" htmlFor={id}>
            {labelText}
          </label>
        </div>
      )}
      {variant === 'Primary' ? (
        // Field group — Primary only (220:16 … 220:46). Mobile stacks label / field /
        // helper flat; Primary nests the field and the helper inside it.
        <div className="hz-input-field__field-group">
          {field}
          {helper}
        </div>
      ) : (
        <>
          {field}
          {helper}
        </>
      )}
    </div>
  );
}

export default InputField;
