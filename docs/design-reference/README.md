# Design references

The finalised ClaimLens design. It is the visual spec for every frontend phase (see
`docs/FRONTEND_BUILD_PROMPT.md`, §3).

## Files

`ClaimLens — App Design.html` is a single self-unpacking bundle that holds all six artboards,
each 1440px wide. Open it in a browser to view them (it needs JavaScript and an internet
connection for some font subsets). The build prompt refers to these artboards by their original
`*.dc.html` names:

| Artboard | PNG | Prompt name | Route |
| --- | --- | --- | --- |
| 00 · Sign in | `00 · Sign in.png` | `Login.dc.html` | `/login` |
| 01 · Claim check (hero) | `01 · Claim check (hero).png` | `Main.dc.html` | `/` (Check) |
| 02 · Library | `02 · Library.png` | `Library.dc.html` | `/library` |
| 03 · Ask + Evidence viewer | `03 · Ask + Evidence viewer.png` | `Ask.dc.html` | `/ask` |
| 04 · Compare | `04 · Compare.png` | `Compare.dc.html` | `/compare` |
| 05 · Contradictions | `05 · Contradictions.png` | `Contradictions.dc.html` | `/conflicts` |

The PNGs are 2× screenshots of the same artboards.

## Reading the markup

Inside the bundle, each artboard is mockup markup in a template format (`{{holes}}`, `<sc-for>`,
`<sc-if>`, `<x-dc>`) with inline styles. Treat it as a visual spec: copy values, never the
template syntax. Two things to know when copying measurements:

- The artboards have no CSS reset. Line-height is the browser's `normal`, links are underlined,
  and boxes are `content-box`. The app uses Tailwind (`border-box`), so a `max-width` or
  `flex-basis` with padding must add the padding (e.g. `<main>` is 1320px + 2 × 32px).
- A few colours are used that are not in the build prompt's token table. They are tokens in
  `frontend/src/styles/tokens.css`: `on-ink` `#E9ECE4`, `rule-on-ink` `#2E332D`,
  `on-status` `#FFFFFF`, `chip-neutral` `#E6E8E2`, `pdf-line` `#D5D8D0`.
