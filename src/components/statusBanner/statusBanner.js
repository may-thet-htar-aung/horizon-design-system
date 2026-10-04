/**
 * Horizon Status Banner
 * Figma: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=269-18
 *
 * ===========================================================================
 * WHY THIS IS ITS OWN MODULE
 * ===========================================================================
 * The codebase's test for putting two registry rows on one module is "identical element
 * set, identical property set, identical state machine". Input Field/Primary passed it
 * against Input Field/Mobile and shares `src/components/inputField/`; Input Field/Password
 * failed all three and got its own folder.
 *
 * Status Banner is not a close call, and it is worth saying WHY rather than asserting it,
 * because "it's obviously different" is how a shared module gets missed. Measured against
 * every existing module — button, checkBox, pinCode, inputField, inputFieldPassword:
 *
 *   ELEMENT SET      Root, one `Icon area` frame, one `Message` text. That is all three
 *                    variants, entire. There is no label row, no field, no helper row, no
 *                    <input>, no focusable child of any kind. inputField's element set is
 *                    label + field + input + helper; it shares not one node with this.
 *   PROPERTY SET     `State`, `Show icon`, `Icon`. inputField carries Label, Show Label,
 *                    Helper text, Show Helper text and a six-value State; Password carries
 *                    `Property 1`, `Show icon`, `Icon`. The overlap with Password is two
 *                    property NAMES on a component with a different axis and no shared
 *                    element — a coincidence of naming, not a shared component.
 *   STATE MACHINE    Three presentational values on an axis named `State`, and NO
 *                    interaction states at all: no hovered, no typed, no error-as-a-state,
 *                    no disabled. Nothing in this component responds to the user, because
 *                    nothing in it can be operated. Every other module in this repo has at
 *                    least hover and disabled.
 *
 * It fails all three tests against every existing module, so it is its own folder. The
 * shared-module question only genuinely arises between rows of one component family
 * anyway, and Status Banner is its own registry row for its own Figma component set.
 *
 * ===========================================================================
 * COMPOSITION
 * ===========================================================================
 * Status Banner composes NO registry component. Its two marks are
 * `Symbol/filled/exclamation` (270:5) and `Symbol/filled/info` (272:23) — symbols from
 * Horizon Icons, not rows in the registry. There is no Button, Check Box, Pin Code or
 * Input Field instance anywhere in the set.
 *
 * (`Composes` is owned by nobody as of 2026-09-12 — registry D12 — so this is recorded
 * here and written nowhere.)
 *
 * ===========================================================================
 * THE AXIS, AND ITS VALUE SPELLING
 * ===========================================================================
 * The axis is named `State` — NOT `Property 1`, which is what Input Field/Password uses.
 * It was read from the node rather than assumed.
 *
 * Its three values are spelled, in full and verbatim:
 *
 *     "Warning Status Banner"   269:6
 *     "Error Status Banner"     269:10
 *     "Info Status Banner"      269:14
 *
 * Every value repeats the component's own name. The component description, one line
 * above those values, says plainly "State sets warning, error, or info" — so the
 * description and the authored values already disagree about what the values are called.
 *
 * This module takes `state` as 'Warning' | 'Error' | 'Info' and exports
 * `STATUS_BANNER_STATE` below, mapping each exact Figma spelling to the prop value, so a
 * tester can go from a variant name in the node to this component's props without
 * guessing. That is the same shape Input Field/Password used for its nine `Property 1`
 * values. The PROPERTY name matches Figma exactly (`State` -> `state`); the redundant
 * suffix on the VALUES is reported as a design-side naming gap, not carried into the API.
 *
 * ===========================================================================
 * TWO PLACES THE SPEC PROSE AND THE BINDINGS DISAGREE
 * ===========================================================================
 * Where prose contradicts bindings, the bindings win — and both are reported.
 *
 * 1. THE `Icon` SWAP DOES NOT REACH THE INFO VARIANT.
 *    SPEC: "Show icon hides the mark. Icon swaps the mark and defaults to
 *    Symbol/filled/exclamation. Info shows Symbol/filled/info."
 *
 *    Read on the node, Warning (270:7) and Error (270:8) each hold ONE instance wired to
 *    the `Icon` swap property. Info (270:9) holds TWO: `Icon` (269:15), hidden, binding
 *    NO variables at all, and `Icon info` (272:25), visible, NOT wired to the swap. So on
 *    Info the swap property drives an invisible layer and the visible mark is fixed.
 *
 *    This module follows the bindings: `icon` swaps the mark on Warning and Error, and
 *    Info's mark is the info symbol, fixed, exactly as the node renders it. Passing
 *    `icon` with state 'Info' is a documented no-op — see the `icon` param below. The
 *    alternative, honouring `icon` on all three, would have been a nicer API and a
 *    silent divergence from the node, which QA would have to log as a code failure when
 *    it is a design gap.
 *
 * 2. THE NODE IS A FIXED 400px; THE SPEC SAYS WIDTH FOLLOWS THE CONTAINER.
 *    SPEC: "Width follows the container. Height hugs the message."
 *    DO:   "Let the banner fill the width of its container."
 *    DON'T:"Don't fix the height. A longer message has to grow the banner."
 *    All three symbols are authored at a fixed width of 400 and a height of 56.
 *
 *    No width or height VARIABLE is bound on any of them, so there is no binding for the
 *    prose to contradict — 400x56 is the authoring canvas, corroborated by the fact that
 *    the SPEC, the DO and the DON'T all agree against it. This module renders
 *    width:100% and lets height hug. QA comparing a story to the node at pixel width
 *    will see 400 there and container-width here; that is intended, and recorded.
 *
 * ===========================================================================
 * NO INTERACTION STATES, AND THAT IS CORRECT HERE
 * ===========================================================================
 * This library has no focus variant on any component, which has been reported on the
 * Input Fields where it mattered — Password contains a real focusable button that the
 * design gives no focus treatment. It does NOT matter here, and is not raised as a gap:
 * Status Banner contains no interactive element, so there is nothing to focus, hover or
 * disable. The absence is correct rather than missing.
 */

import './statusBanner.css';
import exclamation from './icons/exclamation.svg?raw';
import info from './icons/info.svg?raw';

/**
 * The three values of the Figma axis `State`, spelled exactly as the node spells them —
 * including the redundant " Status Banner" suffix on every one — mapped to the `state`
 * prop that reproduces each. This is the table QA builds its matrix from.
 */
export const STATUS_BANNER_STATE = {
  'Warning Status Banner': 'Warning',
  'Error Status Banner': 'Error',
  'Info Status Banner': 'Info',
};

/** The `state` values this component accepts, in node order. */
export const STATUS_BANNER_STATES = ['Warning', 'Error', 'Info'];

/** The two marks, per SPEC: "Icons are Symbol/filled/exclamation and Symbol/filled/info". */
export const defaultIconExclamation = exclamation;
export const defaultIconInfo = info;

/**
 * The mark each state shows by default. Warning and Error share the exclamation; Info
 * has its own, and on Info it is not swappable — see the header.
 */
const DEFAULT_ICON = {
  Warning: exclamation,
  Error: exclamation,
  Info: info,
};

/**
 * Sample copy, exactly as each variant renders it. NOT Figma properties — this set has
 * no text property at all; the message is fixed sample copy on each variant, the same
 * way Input Field/Password's label and helper are.
 */
const SAMPLE_MESSAGE = {
  Warning: 'Your session expired at 14:02. Anything you had not saved was not kept.',
  Error:
    'That password does not match mei.tanaka@gmail.com. 2 tries left before we lock the account for 15 minutes.',
  Info: 'Your booking is held for 12 more minutes. The price and the room are locked until then.',
};

/** The Icon slot accepts an SVG string or a live node, as checkBox's and Password's do. */
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
 * @param {'Warning'|'Error'|'Info'} [props.state]
 *   Figma: `State` — the component's only variant axis. Pass 'Warning', 'Error' or
 *   'Info'; `STATUS_BANNER_STATE` maps the node's verbose value spellings onto these.
 * @param {boolean} [props.showIcon]
 *   Figma: `Show icon` — boolean property. SPEC: "Show icon hides the mark." When false
 *   the Icon area is not rendered at all and the message takes the full width.
 * @param {string|Node} [props.icon]
 *   Figma: `Icon` — instance-swap property. SPEC: "Icon swaps the mark and defaults to
 *   Symbol/filled/exclamation."
 *
 *   ON state 'Info' THIS IS A NO-OP, deliberately. Info's visible mark (272:25) is not
 *   wired to the swap in the node — the property drives a hidden, unbound instance
 *   (269:15) instead. Following the bindings rather than the prose keeps this component
 *   and the node in agreement. See the header.
 * @param {string} [props.message]
 *   NOT a Figma property — the set has no text property; each variant carries fixed
 *   sample copy. Defaults to the copy that variant renders. SPEC ACCESSIBILITY: "Don't
 *   rely on colour alone. The message has to say what happened."
 * @param {'status'|'alert'|'none'} [props.role]
 *   NOT a Figma property. A code-side accessibility decision: a banner that appears to
 *   report something has to be announced, and the design cannot express that. Error
 *   defaults to 'alert' (assertive — the person has to act, per the USAGE line) and
 *   Warning and Info to 'status' (polite). Pass 'none' to opt out when the banner is
 *   rendered statically and announcing it would be noise.
 * @returns {HTMLDivElement}
 */
export function createStatusBanner({
  state = 'Warning',
  showIcon = true,
  icon,
  message,
  role,
} = {}) {
  const root = document.createElement('div');
  root.className = 'hz-status-banner';
  root.dataset.state = state;

  // SPEC ACCESSIBILITY: the message is what carries the meaning, so it is what gets
  // announced. 'none' renders no role at all.
  const resolvedRole = role ?? (state === 'Error' ? 'alert' : 'status');
  if (resolvedRole !== 'none') {
    root.setAttribute('role', resolvedRole);
  }

  /* ------------------------------- Icon area · 270:7 / 270:8 / 270:9 */
  if (showIcon) {
    const iconArea = document.createElement('div');
    iconArea.className = 'hz-status-banner__icon-area';

    // SPEC ACCESSIBILITY: "The icon is a visual mark, not the accessible name."
    iconArea.setAttribute('aria-hidden', 'true');

    // Info's mark is fixed in the node — the swap drives a hidden layer there.
    const resolved = state === 'Info' ? DEFAULT_ICON.Info : (icon ?? DEFAULT_ICON[state]);
    renderIcon(iconArea, resolved);

    root.append(iconArea);
  }

  /* ------------------------------- Message · 269:9 / 269:13 / 269:17 */
  const messageEl = document.createElement('p');
  messageEl.className = 'hz-status-banner__message';
  messageEl.textContent = message ?? SAMPLE_MESSAGE[state];

  root.append(messageEl);

  return root;
}

export default createStatusBanner;
