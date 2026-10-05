/**
 * Horizon Status Banner — stories.
 *
 * FIGMA NODE: https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=269-18
 *
 * One story per row of the variant matrix. The set has ONE axis in Figma — `State`,
 * NOT `Property 1` — with THREE values, plus two non-text properties:
 *
 *   State      | "Warning Status Banner" · "Error Status Banner" · "Info Status Banner"
 *              | 269:6                   · 269:10                · 269:14
 *   Show icon  | boolean property — SPEC: "Show icon hides the mark."
 *   Icon       | instance-swap property — SPEC: "Icon swaps the mark."
 *              | DOES NOT REACH THE INFO VARIANT — see InfoIconSwapIsANoOp below.
 *
 * Every value of `State` repeats the component's own name. The `state` prop drops that
 * suffix; `STATUS_BANNER_STATE` maps the exact Figma spellings onto the prop values, so
 * this file can be read against the node one row at a time:
 *
 *   Figma value                ->  props
 *   "Warning Status Banner"        state: 'Warning'
 *   "Error Status Banner"          state: 'Error'
 *   "Info Status Banner"           state: 'Info'
 *
 * There is NO size axis, NO focus variant and NO interaction state of any kind in this
 * component set. Unlike the Input Fields, that is correct rather than missing — the
 * banner contains no interactive element, so there is nothing to focus or disable.
 *
 * WHAT TO LOOK AT.
 *
 *  1. SWITCH THE THEME. Warning's Message and its mark are BOTH #875706 in light mode —
 *     two different tokens, `color/text/warning` and `color/icon/warning`, that collide
 *     in that one mode. In dark they separate (#fce1b3 text, #f8be5c mark) and the two
 *     bindings become visible as two. Error never collides and shows the same structure
 *     in both modes.
 *
 *  2. THE THREE Message LAYERS BIND COLOUR AND NO TYPOGRAPHY. Inter Regular 13 is the
 *     node's own literal, carried as an unbound custom property rather than snapped to
 *     the nearest token — 13px is not on the scale at all, and the matching family and
 *     weight tokens exist but are not bound. Uniform across all three, so no variant
 *     renders a different face from its neighbour.
 *
 *  3. WIDTH FOLLOWS THE CONTAINER. The node is authored at a fixed 400px but the SPEC,
 *     the DO and the DON'T all say the banner fills its container and the height hugs
 *     the message. `LongMessageGrowsTheBanner` and `NarrowContainer` below exercise
 *     that; a pixel-width comparison against the node will differ, intentionally.
 */

import { Fragment } from 'react';
import { StatusBanner, STATUS_BANNER_STATES, STATUS_BANNER_STATE } from './StatusBanner.jsx';

const FIGMA_NODE =
  'https://www.figma.com/design/EupMGlgXy06FSwOr2WLZWF/Horizon-Component-Library---Htar?node-id=269-18';

/** A deliberately unrelated glyph, to make an Icon swap unmistakable when it happens. */
const SWAPPED_MARK = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block">
  <path d="M12 2 2 22h20L12 2Zm0 6 6.5 12h-13L12 8Z" fill="currentColor"/>
</svg>`;

/** Renders a story inside a fixed-width box, to show width following its container. */
function InBox({ width, children }) {
  return <div style={{ width, maxWidth: '100%' }}>{children}</div>;
}

export default {
  title: 'Components/Status Banner',
  tags: ['autodocs'],
  component: StatusBanner,
  render: (args) => <StatusBanner {...args} />,
  argTypes: {
    state: { control: { type: 'inline-radio' }, options: STATUS_BANNER_STATES },
    showIcon: { control: 'boolean' },
    message: { control: 'text' },
    role: { control: { type: 'inline-radio' }, options: ['status', 'alert', 'none'] },
  },
  args: {
    state: 'Warning',
    showIcon: true,
  },
  parameters: {
    controls: { disable: false },
    design: { type: 'figma', url: FIGMA_NODE },
  },
};

/* ===================== the three rows of the Figma matrix ===================== */

/** 269:6 `State=Warning Status Banner` — bg color/bg/warning/Light, border
 *  color/border/warning/Light, mark 270:7 color/icon/warning, Message 269:9
 *  color/text/warning. USAGE: "something needs attention and can still continue." */
export const Warning = {
  args: { state: 'Warning' },
};

/** 269:10 `State=Error Status Banner` — bg color/bg/negative/Light, border
 *  color/border/negative/Light, mark 270:8 color/icon/negative #d93e3e, Message 269:13
 *  color/text/negative #832525. Note the mark and the text are visibly DIFFERENT reds
 *  here; on Warning the equivalent pair collides in light mode.
 *  USAGE: "something failed and the person has to act." Announced role="alert".
 *
 *  Exported as `ErrorBanner` rather than `Error` so the module does not shadow the
 *  global `Error` binding; the story still reads as "Error" in the sidebar. */
export const ErrorBanner = {
  name: 'Error',
  args: { state: 'Error' },
};

/** 269:14 `State=Info Status Banner` — bg color/bg/info/Light, border
 *  color/border/info/Light, mark 270:9 color/icon/info, Message 269:17 color/text/info.
 *  The mark is Symbol/filled/info, not the exclamation the other two share.
 *  USAGE: "neutral information, such as a hold on a booking." */
export const Info = {
  args: { state: 'Info' },
};

/* ===================== `Show icon` — the boolean property ===================== */

/** `Show icon` = false on Warning. SPEC: "Show icon hides the mark." The Icon area is
 *  not rendered at all, so the gap/component gap goes with it and the Message takes the
 *  full width inside the same spacing/12 padding. */
export const WarningNoIcon = {
  name: 'Warning · Show icon = false',
  args: { state: 'Warning', showIcon: false },
};

/** `Show icon` = false on Error. */
export const ErrorNoIcon = {
  name: 'Error · Show icon = false',
  args: { state: 'Error', showIcon: false },
};

/** `Show icon` = false on Info. Worth its own row: Info is the variant whose Icon area
 *  holds two instances in the node, and `Show icon` governs the whole area, so it hides
 *  both. Unlike the `Icon` swap, this property DOES reach Info. */
export const InfoNoIcon = {
  name: 'Info · Show icon = false',
  args: { state: 'Info', showIcon: false },
};

/* ===================== `Icon` — the instance-swap property ===================== */

/** `Icon` swapped on Warning. SPEC: "Icon swaps the mark and defaults to
 *  Symbol/filled/exclamation." The triangle below is not a Horizon symbol — it is here
 *  only to make the swap unmistakable. */
export const WarningIconSwapped = {
  name: 'Warning · Icon swapped',
  args: { state: 'Warning', icon: SWAPPED_MARK },
};

/** `Icon` swapped on Error. The swapped glyph inherits color/icon/negative, because the
 *  colour is bound on the Icon AREA (270:8) and not on the instance inside it. */
export const ErrorIconSwapped = {
  name: 'Error · Icon swapped',
  args: { state: 'Error', icon: SWAPPED_MARK },
};

/** `Icon` passed on Info — AND DELIBERATELY IGNORED. This story documents a design gap,
 *  so it is expected to look identical to `Info` above.
 *
 *  In the node, Warning (270:7) and Error (270:8) each hold one instance wired to the
 *  `Icon` swap. Info (270:9) holds TWO: `Icon` (269:15), hidden and binding no variables
 *  at all, plus `Icon info` (272:25), visible and NOT wired to the swap. The swap
 *  property therefore drives an invisible layer on this variant and the visible mark is
 *  fixed. The SPEC's "Icon swaps the mark" is true of two variants out of three.
 *
 *  This component follows the bindings, not the prose, so that it and the node agree.
 *  A tester should read a swapped mark here as a FAILURE and an unswapped one as
 *  correct. */
export const InfoIconSwapIsANoOp = {
  name: 'Info · Icon swap is a no-op (design gap)',
  args: { state: 'Info', icon: SWAPPED_MARK },
};

/* ===================== width and height behaviour ===================== */

/** SPEC: "Height hugs the message." DON'T: "Don't fix the height. A longer message has
 *  to grow the banner." The mark stays centred against the grown block. */
export const LongMessageGrowsTheBanner = {
  name: 'Long message grows the banner',
  args: {
    state: 'Info',
    message:
      'Your booking is held for 12 more minutes. The price and the room are locked until then. If the hold expires the room returns to general availability and the rate you were quoted is not guaranteed on a later booking.',
  },
};

/** SPEC: "Width follows the container." DO: "Let the banner fill the width of its
 *  container." Three widths, same component, no width prop — the node's own 400px is the
 *  authoring canvas, not a binding. */
export const WidthFollowsTheContainer = {
  name: 'Width follows the container',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {['640px', '400px', '240px'].map((width) => (
        <InBox key={width} width={width}>
          <StatusBanner state="Warning" />
        </InBox>
      ))}
    </div>
  ),
};

/** The narrow end of the same behaviour, on its own, so wrapping is easy to inspect. */
export const NarrowContainer = {
  name: 'Narrow container',
  render: () => (
    <InBox width="240px">
      <StatusBanner state="Error" />
    </InBox>
  ),
};

/* ===================== the whole matrix, side by side ===================== */

/** Every `State` value against both `Show icon` values, in node order. The quickest way
 *  to compare the three bg / border / text / icon token sets against 269:18, and the
 *  fastest place to see the Warning collision separate when the theme is switched. */
export const AllStates = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400, maxWidth: '100%' }}>
      {Object.entries(STATUS_BANNER_STATE).map(([figmaValue, state]) => (
        <Fragment key={state}>
          <p style={{ font: '500 11px/16px Inter, sans-serif', opacity: 0.6, margin: 0 }}>{figmaValue}</p>
          <StatusBanner state={state} />
          <StatusBanner state={state} showIcon={false} />
        </Fragment>
      ))}
    </div>
  ),
};
