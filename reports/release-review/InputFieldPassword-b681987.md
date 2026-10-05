# Release review · InputFieldPassword · b681987
Verdict: Blocked
Pinned commit: b6819873c5fab35d9fd37cf58c3446625e5f1e28 (main)
Board row: Input Field/Password (recqc3LhoFeD7vquu)  Last Modified 2026-10-04T14:34:37Z  Development Completed  Release Verdict was empty
Read: production Storybook ✓ (components-input-field-password--figma-matrix)  docs page: not staged (the Storybook index has no docs entries and no Astro Link is recorded; expected, not a finding)  intent file ✓ (InputFieldPassword.intent.json)  source ✓ (last)
Gates 5/7 pass

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed (read live). Production Storybook opens and the story renders. Production stylesheet https://horizon-design-system-htar1.vercel.app/assets/iframe-FUp8CDpr.css compared with b681987: every declaration of every component stylesheet is present, and every token in build/css/tokens.css and tokens-dark.css is present with an equal value; the only differences are minifier rewrites (#ffffff to #fff, rgba to 8-digit hex, 0.5px to .5px, background:none, dropped -webkit-appearance). JS bundle not compared. Row Last Modified is earlier than the pinned commit, so not stale. | |
| R2 Tokens | FAIL | InputFieldPassword.css: line 124 --hz-input-field-password-width-unbound: 360px (no token); 125 height-unbound: 40px (should be var(--spacing-40)); 126 gap-unbound: 5px (no token); 127 stroke-unbound: 1px (should be var(--borderwidth-1)); 128 icon-size-unbound: 16px (should be var(--spacing-16)). R2 treats a declaration like `--hz-...-unbound: 16px` as a raw px literal even though the CSS header explains it; an explanation is not a ruling and the Rulings section of the skill is empty. | engineer (bind 40px, 1px, 16px now; 360px and 5px need tokens exported first) |
| R3 Surface | pass | src/index.js exports InputFieldPassword on one line; nothing else of this component's module (state lists, icon helpers, sample copy) is reachable from the entry; the Storybook and intent file document only that symbol. |  |
| R4 Names | pass | InputFieldPassword / InputFieldPassword.jsx / InputFieldPassword / hz-input-field-password / InputFieldPassword.intent.json / board "Input Field/Password" (word-normalised; see Notes). |  |
| R5 States | pass | The nine Figma cells (Default, Hovered, Typed hide/open, Error hide/open, Warning hide/open, Disabled) all have stories, plus Show icon = false and the revealed default (both named as having no Figma cell). |  |
| R6 Intent | FAIL | Check 5: variant_intent has empty strings for "State=Default", "State=Hovered" and "State=Typed". Checks 1, 2 (warning), 3 (a11y is specific: reveal button name, aria-pressed, aria-controls), 4, 6 and the choosing test pass. | doc-generator |
| R7 Version | pass | Nameable: see Version line. |  |

Warnings: dont_use_when with no alternative (all five), including "Do not use this field for email, names, or other text that should stay visible", which should say "use InputField".

Choosing test (batch, run once, intent files only, by a separate reader that was given no source, stories or component names beyond the six files):
- Job 1 "A guest has to type the 6-digit code that was emailed to them to verify their email address" -> PinCodeCell, high confidence. Quote: "Use it for one digit of a code, such as a sign-in or verification code." (verbatim in PinCodeCell.intent.json; confirmed by grep). No hedge.
- Job 2 "A guest signs in and has to enter their account password" -> InputFieldPassword, high confidence. Quote: "Use it for a password or any secret that should be hidden by default." (verbatim; confirmed). No hedge.
- Job 3 "A guest turns on a setting that takes effect the instant they flip it" -> no component fits. The reader named CheckBox as the closest and ruled it out on its own line "Do not use it when the choice takes effect immediately. Use a switch." (verbatim; confirmed). A job the library does not cover answered "none" is the pass.
Result: pass. No pair hedged, no pick without a quotable line.

Version: first release (no earlier tag exists: git tag is empty; package.json already reads 0.1.0), so everything is new and the first version is 0.1.0. Forced by the new public export `InputFieldPassword` and its props (state, revealed, label, helperText, showIcon). A human approves and tags; reviewer does neither. A name flagged under R4, if any, becomes a MAJOR bump to change once published.

Notes: R4 was read as "the same word": names compared after ignoring case style (PascalCase, camelCase, kebab) and word separators (space, hyphen, slash), because the board spells "Check Box" and code spells CheckBox. Read strictly character for character, every multi-word component fails R4 on the board row (owner: a human). The skill has no ruling on this; it is a candidate for the Rulings section.
