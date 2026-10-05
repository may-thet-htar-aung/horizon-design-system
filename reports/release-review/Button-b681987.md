# Release review · Button · b681987
Verdict: Blocked
Pinned commit: b6819873c5fab35d9fd37cf58c3446625e5f1e28 (main)
Board row: Button (recBOsmQ7Sd2kqAHn)  Last Modified 2026-10-05T04:54:59Z  Development Completed  Release Verdict was empty
Read: production Storybook ✓ (components-button--all-variants)  docs page: not staged (the Storybook index has no docs entries and no Astro Link is recorded; expected, not a finding)  intent file ✓ (Button.intent.json)  source ✓ (last)
Gates 5/7 pass

| Gate | Result | Finding | Fix owner |
|---|---|---|---|
| R1 Done | pass | Row reads Completed (read live). Production Storybook opens and the story renders. Production stylesheet https://horizon-design-system-htar1.vercel.app/assets/iframe-FUp8CDpr.css compared with b681987: every declaration of every component stylesheet is present, and every token in build/css/tokens.css and tokens-dark.css is present with an equal value; the only differences are minifier rewrites (#ffffff to #fff, rgba to 8-digit hex, 0.5px to .5px, background:none, dropped -webkit-appearance). JS bundle not compared. Row Last Modified is earlier than the pinned commit, so not stale. | |
| R2 Tokens | pass | No raw hex, rgb(), hsl() or px in Button.css or Button.jsx outside comments (the focus ring uses --borderwidth-3, --color-border-brand-bold, --spacing-2). |  |
| R3 Surface | pass | src/index.js exports Button on one line; nothing else of this component's module (state lists, icon helpers, sample copy) is reachable from the entry; the Storybook and intent file document only that symbol. |  |
| R4 Names | pass | Button / Button.jsx / Button / hz-button / Button.intent.json / board "Button". |  |
| R5 States | FAIL | Button.css:49 `.hz-button:focus-visible` authors a keyboard-focus state (outline var(--borderwidth-3) solid var(--color-border-brand-bold), offset var(--spacing-2)) that has no Figma cell (the CSS header says so) and no story in Button.stories.jsx (a search for focus finds nothing). The 9 Type x State cells and the three icon cases do have stories. | engineer (add a focus story); the designer must also decide whether the ring is design |
| R6 Intent | FAIL | Check 5: variant_intent has empty strings for "State=Default" and "State=Hover", so two variants have no stated purpose (a gap for the doc-generator to list, not for the reviewer to fill). Check 3: a11y says "Keyboard focus is not in this set yet" while the shipped code has a focus ring (Button.css:49); the file never tells a reader the ring exists. Checks 1, 2 (warning only), 4, 6 and the choosing test pass. | doc-generator |
| R7 Version | pass | Nameable: see Version line. |  |

Warnings: dont_use_when with no alternative (all six): two Primary side by side; detaching to recolor; changing the height of 40; icons on both sides; Ghost for a destructive action; labels in capitals or ending in punctuation.

Choosing test (batch, run once, intent files only, by a separate reader that was given no source, stories or component names beyond the six files):
- Job 1 "A guest has to type the 6-digit code that was emailed to them to verify their email address" -> PinCodeCell, high confidence. Quote: "Use it for one digit of a code, such as a sign-in or verification code." (verbatim in PinCodeCell.intent.json; confirmed by grep). No hedge.
- Job 2 "A guest signs in and has to enter their account password" -> InputFieldPassword, high confidence. Quote: "Use it for a password or any secret that should be hidden by default." (verbatim; confirmed). No hedge.
- Job 3 "A guest turns on a setting that takes effect the instant they flip it" -> no component fits. The reader named CheckBox as the closest and ruled it out on its own line "Do not use it when the choice takes effect immediately. Use a switch." (verbatim; confirmed). A job the library does not cover answered "none" is the pass.
Result: pass. No pair hedged, no pick without a quotable line.

Version: first release (no earlier tag exists: git tag is empty; package.json already reads 0.1.0), so everything is new and the first version is 0.1.0. Forced by the new public export `Button` and its props (type, state, icons, htmlType) plus the tokens it consumes. A human approves and tags; reviewer does neither. A name flagged under R4, if any, becomes a MAJOR bump to change once published.

Notes: R4 was read as "the same word": names compared after ignoring case style (PascalCase, camelCase, kebab) and word separators (space, hyphen, slash), because the board spells "Check Box" and code spells CheckBox. Read strictly character for character, every multi-word component fails R4 on the board row (owner: a human). The skill has no ruling on this; it is a candidate for the Rulings section.
