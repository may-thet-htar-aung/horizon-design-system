# Release review · PinCode · b681987
Verdict: Blocked
Pinned commit: b6819873c5fab35d9fd37cf58c3446625e5f1e28 (main)
Board row: Pin Code (recRl3u6J8uVXq1Tv)  Last Modified 2026-10-05T07:04:29Z  Development Completed  Release Verdict was empty
Read: production Storybook ✓ (components-pin-code--all-variants)  docs page: not staged (the Storybook index has no docs entries and no Astro Link is recorded; expected, not a finding)  intent file ✓ (PinCodeCell.intent.json)  source ✓ (last)
Gates 5/7 pass

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed (read live). Production Storybook opens and the story renders. Production stylesheet https://horizon-design-system-htar1.vercel.app/assets/iframe-FUp8CDpr.css compared with b681987: every declaration of every component stylesheet is present, and every token in build/css/tokens.css and tokens-dark.css is present with an equal value; the only differences are minifier rewrites (#ffffff to #fff, rgba to 8-digit hex, 0.5px to .5px, background:none, dropped -webkit-appearance). JS bundle not compared. Row Last Modified is earlier than the pinned commit, so not stale. | |
| R2 Tokens | FAIL | PinCode.css: line 71 --hz-pincode-width-unbound: 52px (no token); 72 height-unbound: 56px (should be var(--spacing-56)); 73 radius-unbound: 6px (no 6px radius token; borderradius tokens are 4 and 8); 74 stroke-unbound: 1px (should be var(--borderwidth-1)). R2 treats a declaration like `--hz-...-unbound: 16px` as a raw px literal even though the CSS header explains it; an explanation is not a ruling and the Rulings section of the skill is empty. | engineer (bind 56px and 1px now; 52px and 6px need tokens exported first) |
| R3 Surface | pass | src/index.js exports PinCodeCell on one line; nothing else of this component's module (state lists, icon helpers, sample copy) is reachable from the entry; the Storybook and intent file document only that symbol. |  |
| R4 Names | FAIL | Board row and Storybook title say "Pin Code"; folder pinCode and files PinCode.jsx / PinCode.css / PinCode.stories.jsx say PinCode; but the exported symbol is PinCodeCell, the intent file is PinCodeCell.intent.json (beside a PinCode.jsx, not a PinCodeCell.jsx) and the class is hz-pincode-cell. The component is one cell; the board and folder name a row. Once published, `PinCodeCell` is public surface and a rename is a MAJOR bump. | engineer (code: align folder, file, symbol, intent and class); human (board row) |
| R5 States | pass | Five Figma states (Default, Hovered, Typed, Error, Disabled) match the five stories; All Variants and Interactive are extra. |  |
| R6 Intent | pass | Seven fields present and non-empty; every required_token resolves in build/css/tokens.css (and tokens-dark.css for colours); a11y states facts about this component; variant_intent covers every variant; no pair claims the same job; choosing test passed. The file is named for PinCodeCell (see R4). |  |
| R7 Version | pass | Nameable: see Version line. |  |

Warnings: dont_use_when with no alternative (all five): one cell for a whole code; use for a name, email or password; detaching to recolor; overriding the 52 by 56 size; more than one digit in Value.

Choosing test (batch, run once, intent files only, by a separate reader that was given no source, stories or component names beyond the six files):
- Job 1 "A guest has to type the 6-digit code that was emailed to them to verify their email address" -> PinCodeCell, high confidence. Quote: "Use it for one digit of a code, such as a sign-in or verification code." (verbatim in PinCodeCell.intent.json; confirmed by grep). No hedge.
- Job 2 "A guest signs in and has to enter their account password" -> InputFieldPassword, high confidence. Quote: "Use it for a password or any secret that should be hidden by default." (verbatim; confirmed). No hedge.
- Job 3 "A guest turns on a setting that takes effect the instant they flip it" -> no component fits. The reader named CheckBox as the closest and ruled it out on its own line "Do not use it when the choice takes effect immediately. Use a switch." (verbatim; confirmed). A job the library does not cover answered "none" is the pass.
Result: pass. No pair hedged, no pick without a quotable line.

Version: first release (no earlier tag exists: git tag is empty; package.json already reads 0.1.0), so everything is new and the first version is 0.1.0. Forced by the new public export `PinCodeCell` and its props (state, value, label). A human approves and tags; reviewer does neither. A name flagged under R4, if any, becomes a MAJOR bump to change once published.

Notes: The Pin Code default value change (9bfbde7, value 1 to match Figma) is in the pinned commit; R1 compared the stylesheet only, not the JS bundle. R4 was read as "the same word": names compared after ignoring case style (PascalCase, camelCase, kebab) and word separators (space, hyphen, slash), because the board spells "Check Box" and code spells CheckBox. Read strictly character for character, every multi-word component fails R4 on the board row (owner: a human). The skill has no ruling on this; it is a candidate for the Rulings section.
