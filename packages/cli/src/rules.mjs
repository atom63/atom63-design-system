/**
 * The rules an agent follows when it builds UI with Atom63. `atom63 rules`
 * prints them, and the AGENTS.md snippet is generated from the same table.
 * `check` names the repo check that enforces a rule mechanically, when one
 * exists.
 */
export const rules = [
  {
    id: 'query-first',
    rule: 'Query the design system before writing UI: start a screen from the closest page template, then search for components, read their contracts, and start from story examples.',
    why: 'The templates, catalog, contracts and examples are the reviewed answers; guessing reinvents them with drift.',
  },
  {
    id: 'compose-before-create',
    rule: 'Compose existing components before writing new ones. Add a component to the system with `pnpm ds:new`, not by copying another.',
    why: 'A new component must be wired into contracts, recipes, docs and tests; the scaffold does that, a copy does not.',
  },
  {
    id: 'contract-values',
    rule: "Pass only the axis values a component's contract lists (sizes, variants, orientations), and rely on its defaults.",
    why: 'Recipes, the SwiftUI renderer and the Figma variables are built for exactly those values.',
  },
  {
    id: 'tokens-only',
    rule: 'Take every color, space, radius, shadow and duration from `--a63-*` tokens. No literal colors and no Tailwind palette utilities.',
    why: 'Tokens follow the theme, brand, mode and density; literals break all four.',
    check: 'raw-color',
  },
  {
    id: 'on-media-colors',
    rule: 'Controls drawn over photos or video use the `--a63-on-media-*` and `--a63-media-*` tokens.',
    why: 'Theme colors are meaningless on an unknown picture; these hold contrast on any image.',
  },
  {
    id: 'logical-directions',
    rule: 'Use logical properties and utilities (`margin-inline-start`, `ps-4`, `text-start`, `border-s`), not left and right.',
    why: 'Layouts must mirror in right-to-left languages.',
    check: 'physical-properties',
  },
  {
    id: 'focus-visible',
    rule: 'Draw focus rings on `:focus-visible` (`focus-visible:` in Tailwind), never on `:focus`.',
    why: 'A pointer press should not leave a keyboard focus ring behind.',
    check: 'focus-visible',
  },
  {
    id: 'focus-ring-outline',
    rule: 'Draw focus rings as an `outline` (`focus-visible:outline-*` in Tailwind), not a `box-shadow` or `ring-*`. Inset it with a negative `outline-offset` where a parent clips it.',
    why: "A component's own box-shadow replaces a shadow ring, and forced-colors mode drops shadows.",
    check: 'focus-ring-outline',
  },
  {
    id: 'theme-agnostic',
    rule: 'Never branch on light or dark mode in component code; let tokens and `UIProvider` resolve the mode.',
    why: 'Themes and brands change the palette too; a mode check covers one axis of four.',
  },
  {
    id: 'accessible-by-default',
    rule: 'Keep the native semantics components render (buttons, links, labels, dialogs) and give every icon-only control an accessible name.',
    why: 'Every story runs axe in CI; code that removes semantics fails it.',
  },
]
