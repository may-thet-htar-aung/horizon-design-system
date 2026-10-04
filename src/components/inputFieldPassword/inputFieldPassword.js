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
 * See the header of inputFieldPassword.css for the full list and the SPEC line beside
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

import './inputFieldPassword.css';
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

let uid = 0;

/** The Icon slot accepts an SVG string or a live node, as checkBox's does. */
function renderIcon(slot, icon) {
  slot.replaceChildren();
  if (typeof icon === 'string') {
    slot.innerHTML = icon;
  } else if (icon instanceof Node) {
    slot.append(icon);
  }
}

/**
 * @param {object} props
 * @param {'Default'|'Hovered'|'Typed'|'Error'|'Warning'|'Disabled'} [props.state]
 *   The validation / interaction state. Half of Figma's `Property 1` — see the header.
 * @param {boolean} [props.revealed]
 *   Whether the secret is shown. The other half of `Property 1`: false renders the
 *   `hide` cell and the crossed eye, true renders the `Open` cell and the open eye.
 *   Defaults to false, which is what every Figma cell without an `Open` suffix shows.
 * @param {boolean} [props.showIcon]
 *   Figma: `Show icon` — boolean property. "Show icon hides the control." When false
 *   the reveal control is not rendered and the field cannot be unmasked by the user.
 * @param {string|Node} [props.icon]
 *   Figma: `Icon` — instance-swap property. "Icon swaps the glyph." Replaces the glyph
 *   in both the hidden and revealed positions; pass `iconRevealed` to swap only the
 *   revealed one.
 * @param {string|Node} [props.iconRevealed]
 *   NOT a Figma property. Figma models the two glyphs as two instances whose visibility
 *   swaps; a single `Icon` property there would swap both. Exposed separately here so a
 *   consumer can override one without losing the other.
 * @param {string} [props.label]
 *   NOT a Figma property — the node has no Label property; "Password" is fixed copy on
 *   all nine variants. A real <label> needs real text, so it is a prop with that
 *   default.
 * @param {string} [props.helperText]
 *   NOT a Figma property, for the same reason. The node's helper is fixed copy.
 * @param {string} [props.value]
 *   NOT a Figma property — sample copy on the variant.
 * @param {string} [props.placeholder]
 *   NOT a Figma property — sample copy on the variant.
 * @param {(revealed: boolean) => void} [props.onRevealChange]
 * @param {(value: string, event: Event) => void} [props.onChange]
 * @returns {HTMLDivElement}
 */
export function createInputFieldPassword({
  state = 'Default',
  revealed = false,
  showIcon = true,
  icon,
  iconRevealed,
  label = SAMPLE.label,
  helperText = SAMPLE.helperText,
  value,
  placeholder = SAMPLE.placeholder,
  onRevealChange,
  onChange,
} = {}) {
  const id = `hz-input-field-password-${++uid}`;
  const helperId = `${id}-helper`;

  const root = document.createElement('div');
  root.className = 'hz-input-field-password';
  root.dataset.state = state;
  root.dataset.revealed = revealed ? 'true' : 'false';

  /* ------------------------------------------- Label row (234:928 … 244:218) */
  const labelRow = document.createElement('div');
  labelRow.className = 'hz-input-field-password__label-row';

  const labelEl = document.createElement('label');
  labelEl.className = 'hz-input-field-password__label';
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  labelRow.append(labelEl);
  root.append(labelRow);

  /* ----------------------------------------- Field group (234:930 … 244:220) */
  const fieldGroup = document.createElement('div');
  fieldGroup.className = 'hz-input-field-password__field-group';
  root.append(fieldGroup);

  /* ---------------------------------------------- Field (234:931 … 244:221) */
  const field = document.createElement('div');
  field.className = 'hz-input-field-password__field';

  /* ------------------------------------------- Icon row (234:932 … 244:222) */
  const iconRow = document.createElement('div');
  iconRow.className = 'hz-input-field-password__icon-row';

  const input = document.createElement('input');
  input.className = 'hz-input-field-password__input';
  input.id = id;
  input.placeholder = placeholder;
  // `revealed` IS the input type. This is the real mechanism the design's two icon
  // instances stand for, and what a password manager and a screen reader read.
  input.type = revealed ? 'text' : 'password';
  // Browser-managed reveal would sit on top of the design's own control.
  input.setAttribute('autocomplete', 'current-password');

  // Default, Hovered and Disabled render the placeholder — the node shows "Type here"
  // on all three. Typed, Error and Warning carry the secret.
  input.value = value ?? (STATES_SHOWING_VALUE.includes(state) ? SAMPLE.value : '');

  input.disabled = state === 'Disabled';

  // Error is announced, not only coloured. Warning is advisory — the helper carries it.
  if (state === 'Error') {
    input.setAttribute('aria-invalid', 'true');
  }

  iconRow.append(input);

  /* -------------------------------------- Icon area (234:934 … 244:224)
     The trailing reveal affordance. Figma draws two instances and swaps their
     visibility; here it is ONE real <button> whose glyph swaps, because the thing the
     design is describing is a control the user operates, and a control needs to be
     reachable, pressable and announced. */
  let toggle;
  if (showIcon) {
    toggle = document.createElement('button');
    toggle.className = 'hz-input-field-password__icon-area';
    toggle.type = 'button';
    // The field is the labelled thing; this button needs its own name.
    toggle.setAttribute('aria-label', revealed ? 'Hide password' : 'Show password');
    toggle.setAttribute('aria-pressed', revealed ? 'true' : 'false');
    toggle.setAttribute('aria-controls', id);
    // "Disabled — the field cannot be edited." A disabled field's reveal control is
    // disabled with it, which is also why the node shows the crossed eye on Disabled.
    toggle.disabled = state === 'Disabled';

    renderIcon(toggle, revealed ? (iconRevealed ?? icon ?? eye) : (icon ?? eyeCrossed));

    iconRow.append(toggle);
  }

  field.append(iconRow);
  fieldGroup.append(field);

  /* ------------------------------------------ Helper row (234:937 … 244:227) */
  const helperRow = document.createElement('div');
  helperRow.className = 'hz-input-field-password__helper-row';

  const helperEl = document.createElement('p');
  helperEl.className = 'hz-input-field-password__helper';
  helperEl.id = helperId;
  helperEl.textContent = helperText;

  helperRow.append(helperEl);
  fieldGroup.append(helperRow);

  input.setAttribute('aria-describedby', helperId);

  /* ------------------------------------------------------------- behaviour */
  const paintFilled = () => {
    root.dataset.filled = input.value.length > 0 ? 'true' : 'false';
  };

  const setRevealed = (next) => {
    if (input.disabled) return;
    revealed = next;
    root.dataset.revealed = revealed ? 'true' : 'false';
    input.type = revealed ? 'text' : 'password';
    if (toggle) {
      toggle.setAttribute('aria-label', revealed ? 'Hide password' : 'Show password');
      toggle.setAttribute('aria-pressed', revealed ? 'true' : 'false');
      renderIcon(toggle, revealed ? (iconRevealed ?? icon ?? eye) : (icon ?? eyeCrossed));
    }
    if (onRevealChange) onRevealChange(revealed);
  };

  if (toggle) {
    toggle.addEventListener('click', () => {
      setRevealed(!revealed);
      // The point of the control is to read the field; keep the caret where it was.
      input.focus();
    });
  }

  input.addEventListener('input', (event) => {
    paintFilled();
    if (onChange) onChange(input.value, event);
  });

  paintFilled();

  // Lets a story or a consumer drive the toggle without reaching into the DOM.
  root.setRevealed = setRevealed;

  return root;
}

export default createInputFieldPassword;
