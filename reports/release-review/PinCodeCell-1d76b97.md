# Release review · PinCodeCell · 1d76b97
Verdict: Cleared
Pinned commit: 1d76b97cfcec60f3dd91bf7ab20d21a9a348a964 (main, merge of PR #63; confirmed with git log origin/main)
Read: production Storybook ✓ (index.json + story iframe 200)  docs page not staged (Astro Link empty, expected)  intent file ✓  source ✓
Process note: this round's source files were opened in the same batch as the registry row, before the Storybook index was fetched. The published-first order was not kept; R4 and R1 are mechanical comparisons so the verdict does not depend on it, but it is recorded.
Round: 4 (round 3 blocked on R4 only: Storybook title). Release Review and Release Verdict were empty at the start (cleared by the human).

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed. Live stylesheet assets/iframe-Cxgd67tk.css fetched: the four .hz-pincode-cell rule blocks equal PinCode.css at the pin (minified form of the same declarations and token references). All 12 required tokens plus --spacing-56 and --borderwidth-1 have identical values in production and in build/css/tokens.css at the pin (colour tokens also present in tokens-dark.css). Live index.json lists components-pin-code-cell--{default,hovered,typed,error-state,disabled,all-variants,interactive} and no old ids. | |
| R2 Tokens | pass | No raw hex/rgb/hsl. Only raw px: --hz-pincode-width-unbound 52px and --hz-pincode-radius-unbound 6px (Ruling 1). Height uses --spacing-56, stroke --borderwidth-1. | |
| R3 Surface | pass | src/index.js exports PinCodeCell, one line. PIN_CODE_CELL_STATES is not exported. Matches intent and docs. Prop names state/value/label follow Figma properties (Ruling 4). | |
| R4 Names | pass | Symbol PinCodeCell; intent PinCodeCell.intent.json; class hz-pincode-cell; Storybook title Components/Pin Code Cell (ids components-pin-code-cell--*); board Components cell "Pin Code Cell". Folder/file pinCode/PinCode kept as-is under Ruling 2. The board row now matches the symbol. | |
| R5 States | pass | Figma matrix State = Default, Hovered, Typed, Error, Disabled; 10 test rows (light and dark), rollup Passed. Stories: Default, Hovered, Typed, Error, Disabled, AllVariants, Interactive. Dark via the Storybook theme toggle, as for the other components. | |
| R6 Intent | pass | Seven fields present and non-empty. a11y specific (text input, aria-label, aria-invalid, disabled attribute, no focus variant). All 12 required_tokens resolve. variant_intent covers all 5 states and nothing extra. No overlap with another component's use_when (InputField is one piece of information; PinCodeCell is one digit of a code). | |
| R7 Version | pass | No tags exist; package.json reads 0.1.0. Everything is new, first version 0.1.0, forced by the new public export PinCodeCell (props state, value, label, onChange). A human chooses and tags. | |

Ruled, not findings: --hz-pincode-width-unbound 52px, --hz-pincode-radius-unbound 6px (Ruling 1).
Warnings: all five dont_use_when entries have instead: null (no named alternative). Warning only.
Staleness: row Last Modified 2026-10-05T09:16:09Z is 2 minutes after the commit (09:13:56Z). Production and source were compared directly and are unchanged; the edit is the human clearing the verdict cells. Not a component change.

Choosing test (batch: Button, CheckBox, InputField, InputFieldPassword, PinCodeCell, StatusBanner; blind reader given only the intent files)
- Job A, guest enters the six-digit emailed code: PinCodeCell, high. Quote "Use it for one digit of a code, such as a sign-in or verification code." Verbatim in PinCodeCell.intent.json.
- Job B, guest types an email into a booking form: InputField, high. Quote "Use it when a person must enter one piece of information, such as an email or a check-in date." Verbatim in InputField.intent.json.
- Job C, guest picks a room type from a list: none fits, high. Correct, the library has no select or radio.
- No hedges.

Version: 0.1.0 (first version, no earlier tag) — forced by the new export PinCodeCell.
