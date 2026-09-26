/**
 * The craft rubric: taste written as criteria that a design review and a model
 * judge (the E4 vibe runner) score the same way. The docs page
 * `apps/docs/src/pages/foundation-craft-rubric.mdx` renders its criteria and
 * its Markdown twin from this module, so the page, the review and the judge
 * share one source.
 *
 * Plain JavaScript with JSDoc types so a Node script can import it without a
 * build step; the docs app type-checks it through `allowJs`.
 */

/** @typedef {1 | 2 | 3} CraftScoreValue */

/**
 * One criterion.
 * @typedef {object} CraftCriterion
 * @property {string} id Stable id; the judge's `criterion` field uses it.
 * @property {string} name Display name; the docs page uses it as the heading.
 * @property {string} definition One sentence: what the criterion asks.
 * @property {Record<CraftScoreValue, string>} levels What a result at each
 *   score looks like, as features a reviewer can point at.
 * @property {string[]} automated Checks that already cover part of the
 *   criterion, and what each one catches.
 * @property {string} judged What is left for the person or the model to judge.
 */

/**
 * One scored criterion, as the judge outputs it: a JSON array of these, one
 * per criterion.
 * @typedef {object} CraftScore
 * @property {string} criterion A criterion id from `craftCriteria`.
 * @property {CraftScoreValue} score
 * @property {string} evidence One or two sentences that name what in the
 *   result earned the score (an element, a class, a state), not an opinion.
 */

/** @type {CraftCriterion[]} */
export const craftCriteria = [
  {
    id: 'spacing-rhythm',
    name: 'Spacing rhythm',
    definition:
      'Gaps come from a few steps of the space scale, and the gap grows with the level of grouping.',
    levels: {
      3: 'Gaps use two or three space steps in a consistent ratio, for example 2 inside a row, 4 between rows and 8 between sections. Items of the same kind have the same padding, and related items sit closer together than unrelated ones.',
      2: 'Gaps come from the space scale, but one level mixes four or more steps, or one group breaks the ratio (a section gap no larger than a row gap).',
      1: 'Gaps are one-off values (`mt-[13px]`, inline `style` margins) or margins set on individual children. Items of the same kind have different padding, and groups sit as close together as the items inside them.',
    },
    automated: [
      '`check:craft` `physical-properties` requires logical margins and padding (`ms-2`, `ps-4`), but not their values.',
      'The density axis scales the space tokens, so a result built on the scale stays proportional at every density.',
    ],
    judged:
      'Everything about rhythm: which steps are used, whether the ratio holds, and whether proximity matches grouping.',
  },
  {
    id: 'hierarchy',
    name: 'Hierarchy',
    definition:
      'The most important element in each region is seen first, and each region has at most one primary action.',
    levels: {
      3: 'Each region has one focal element and at most one `variant="primary"` action; other actions step down (default, outline, ghost). Headings are at least one type-scale step and one weight above body text, and secondary text uses `text-muted-foreground`.',
      2: 'The order can be read but is flat: two actions share primary emphasis, or headings differ from body text in size or weight only.',
      1: 'There is no focal point: several primary or destructive-styled actions compete, all text has the same size and weight, or decoration outweighs the content.',
    },
    automated: [
      'No check measures emphasis. Component contracts limit `variant` to the listed values, so the emphasis ladder is at least the shared one.',
    ],
    judged:
      'All of it: what the region is for, whether emphasis follows that purpose, and whether the eye lands in the right place.',
  },
  {
    id: 'alignment',
    name: 'Alignment',
    definition:
      'Elements share a small number of edges and baselines, and controls in one row share a height.',
    levels: {
      3: 'Text, icons and controls in a block start on one edge. Labels and values share a baseline. Controls side by side use the same `size`, so their heights match. Numbers in columns align to the end and use tabular figures.',
      2: 'One or two stray edges (an indented icon, one centered label among start-aligned ones), or one control of a different size in a row.',
      1: 'Several unrelated start edges; centered and start-aligned text mixed in one block; controls of different heights in one row; content that shifts when its state changes.',
    },
    automated: [
      '`check:control-alignment` renders the recipes in Chromium and fails when controls of the same size step differ in height.',
      '`check:craft` `physical-properties` keeps edges logical, so they mirror in right-to-left languages.',
    ],
    judged:
      'Which edges a layout uses, text alignment, baselines across components, and optical alignment of icons.',
  },
  {
    id: 'state-completeness',
    name: 'State completeness',
    definition:
      'Every state that data or a person can reach has a designed view: loading, empty, error, disabled, and the result of an action.',
    levels: {
      3: 'Loading shows a skeleton of the final layout or a `loading` button. Empty views say why the view is empty and offer the next step (`Empty`, `FeedbackState`). Errors say what went wrong and how to fix it, beside the field (`Field` error). Disabled controls use `disabled` and say why nearby. Nothing shifts between states.',
      2: 'The states exist but some are generic: one spinner for a whole page, "No data" with no next step, errors only in a toast, disabled controls with no reason.',
      1: 'A reachable state has no view: a blank area while loading, an empty list that renders nothing, errors swallowed or shown as raw messages, or a submit button that stays active while submitting.',
    },
    automated: [
      'The runtime craft check `disabled-hover` fails a disabled control whose background, color, border or shadow changes on hover.',
      '`Button` `loading` disables the action and sets `aria-busy`; `FieldError` announces its message with `role="alert"`.',
    ],
    judged:
      'Whether each reachable state has a view at all, and whether its copy explains the state and the next step.',
  },
  {
    id: 'motion-restraint',
    name: 'Motion restraint',
    definition:
      'Motion explains a change, such as where something came from or that an action worked; it is short, and nothing moves without a reason.',
    levels: {
      3: 'Only state changes move: open, close, press, reorder. Durations and easings come from the `--a63-motion-*` tokens, usually through the components. Only `transform` and `opacity` animate. Reduced motion removes movement, and nothing loops unless it shows progress.',
      2: 'Motion has a purpose but is heavy: long durations, an entrance on every list item, or durations and easings chosen outside the tokens.',
      1: 'Motion is decoration: looping or attention-seeking animation, page-load choreography, animated `height` or `top` that makes the layout jump, or motion that ignores reduced-motion settings.',
    },
    automated: [
      'The motion tokens (`--a63-motion-duration-*` and the feedback durations) set component timing, and recipes such as Tabs, Drawer and Tooltip stop moving under `prefers-reduced-motion`.',
      'No check catches motion a result adds itself.',
    ],
    judged:
      'Whether each animation explains a change, and whether its length and frequency suit how often people see it.',
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    definition:
      'People can perceive, reach and operate everything with a keyboard, a screen reader or zoom, and no meaning depends on color alone.',
    levels: {
      3: 'Native semantics stay (buttons, links, labels, headings in order). Every control has a visible label or an accessible name. Focus follows reading order and is visible. Status is carried by text or an icon as well as color. Targets are at least 24 × 24 px.',
      2: 'Nothing fails axe, but there are rough edges: a placeholder used as the only label, skipped heading levels, generic names such as "Button" on icon-only controls, or a status shown by color with a tooltip.',
      1: 'There are axe violations, or clickable `div`s, icon-only controls without names, focus that is lost or invisible, or color as the only signal.',
    },
    automated: [
      'axe runs on every story in Storybook and fails on violations: names, roles, contrast.',
      'The runtime craft checks `target-size` (24 × 24 px) and `focus-visible` (a ring on Tab, none on a pointer press) run on every story; `check:craft` `focus-visible` checks the same rule in source.',
      'The APG pattern contracts check the accessibility tree and keyboard map of every component that declares a pattern (dialogs, menus, tabs, select, switch, checkbox, radio group and accordion).',
    ],
    judged:
      'Name quality, reading and focus order in a composed view, heading structure, and whether color alone carries a meaning.',
  },
  {
    id: 'token-use',
    name: 'Token use',
    definition:
      'Every color, space, radius, shadow and duration comes from an `--a63-*` token or a component default, and each token does the job its name says.',
    levels: {
      3: 'No literal colors, lengths or durations. Spacing, radius and shadow come from their scales, color from role tokens that match their job (`text-muted-foreground` for secondary text, `bg-card` for a panel), and component props use only values the contract lists.',
      2: 'Colors are all tokens, but a few one-off lengths appear (`rounded-[5px]`, `w-[343px]`), or a role token is used for a different job (a status color as decoration).',
      1: 'Literal colors (hex, `rgb()`, Tailwind palette classes such as `bg-blue-500`) or components restyled with `className` so they no longer follow the theme.',
    },
    automated: [
      '`check:craft` `raw-color` flags literal colors and Tailwind palette classes in the design system packages.',
      'TypeScript rejects component props outside the values in the contract.',
      '`check:tokens` and `check:token-economy` keep the token sources sound, but do not look at how a result uses them.',
    ],
    judged:
      'One-off lengths, role tokens used for a different job, and `className` overrides that restyle a component with legal tokens.',
  },
]

/** The lowest score a criterion can have in a passing result. */
export const CRAFT_PASS_MIN_SCORE = 2

/**
 * Checks a judge's output against the rubric and totals it. A result passes
 * when no criterion scores 1; the total is for comparing results.
 * @param {unknown} scores The parsed JSON the judge returned.
 * @returns {{ total: number, max: number, passed: boolean, scores: CraftScore[] }}
 */
export function summarizeCraftScores(scores) {
  if (!Array.isArray(scores)) throw new TypeError('Craft scores must be an array.')
  const ids = new Set(craftCriteria.map(criterion => criterion.id))
  const seen = new Set()
  for (const entry of scores) {
    const { criterion, evidence, score } = entry ?? {}
    if (!ids.has(criterion)) throw new TypeError(`Unknown craft criterion: ${String(criterion)}`)
    if (seen.has(criterion)) throw new TypeError(`Duplicate craft criterion: ${criterion}`)
    if (![1, 2, 3].includes(score)) throw new TypeError(`Score for ${criterion} must be 1, 2 or 3.`)
    if (typeof evidence !== 'string' || !evidence.trim())
      throw new TypeError(`Score for ${criterion} needs evidence.`)
    seen.add(criterion)
  }
  const missing = [...ids].filter(id => !seen.has(id))
  if (missing.length) throw new TypeError(`Missing craft criteria: ${missing.join(', ')}`)

  /** @type {CraftScore[]} */
  const valid = scores
  return {
    max: craftCriteria.length * 3,
    passed: valid.every(entry => entry.score >= CRAFT_PASS_MIN_SCORE),
    scores: valid,
    total: valid.reduce((sum, entry) => sum + entry.score, 0),
  }
}

/**
 * One criterion as Markdown, without its heading: the docs page's Markdown
 * twin and the judge prompt both use it.
 * @param {CraftCriterion} criterion
 */
export function craftCriterionMarkdown(criterion) {
  return [
    criterion.definition,
    '',
    '| Score | What the result shows |',
    '| --- | --- |',
    ...[3, 2, 1].map(
      score => `| ${score} | ${criterion.levels[/** @type {CraftScoreValue} */ (score)]} |`
    ),
    '',
    '**Checked automatically:**',
    '',
    ...criterion.automated.map(line => `- ${line}`),
    '',
    `**Left to judgment:** ${criterion.judged}`,
  ].join('\n')
}

/** The whole rubric as Markdown, one `##` section per criterion. */
export function craftRubricMarkdown() {
  return craftCriteria
    .map(criterion => `## ${criterion.name}\n\n${craftCriterionMarkdown(criterion)}`)
    .join('\n\n')
}
