/**
 * Contract consistency: one concept, one name, across every component
 * contract. Each rule reports `{ rule, component, list, match }`;
 * check-contract-consistency.mjs compares the results against a committed
 * baseline, as check-craft.mjs does, so existing drift can be paid down
 * without letting new drift in.
 *
 * - `value-case`: state and axis values are kebab-case (`focus-visible`, not
 *   `focusVisible`). The recipes match them as `data-*` attribute values.
 * - `synonym`: a value has a canonical name. The middle size is `md`, not
 *   `default` (Button, Input and most sized controls use `md`, and a group's
 *   sizes must match the control it groups); the resting state is `rest`
 *   (not `resting`, `default` or `idle`). Among states, the keyboard focus
 *   ring is `focus-visible` (rule 11 draws rings on :focus-visible, never
 *   :focus), the pointer state is `hover` (not `hovering`), and the current
 *   or selected item is `current` (not `active`, which reads as pressed:
 *   Button and Toggle call that state `pressed`).
 * - `status-set`: a list that holds the statuses `info`, `success` and
 *   `warning` names its danger member the way most such lists do.
 * - `physical-value`: values name logical sides (`start`, `end`), not `left`
 *   and `right`, so a contract reads the same in right-to-left layouts. A list
 *   in PHYSICAL_SIDES names physical screen edges on purpose, with the reason.
 * - `slot-not-rendered` (checkSlots): every name in a contract's `slots` list
 *   is a `data-slot` value in the web renderer's source, so a consumer or an
 *   agent targeting `[data-slot="…"]` from the contract matches an element.
 */

/** Lists whose values are names, not slot or token paths. */
const SKIP_LISTS = new Set(['slots', 'tokenSlots', 'visualArchetypes', 'dotColors', 'sizePairs'])

/** Canonical names, per list (`*` for every list). */
const SYNONYMS = {
  sizes: { default: 'md' },
  states: {
    active: 'current',
    default: 'rest',
    focus: 'focus-visible',
    hovering: 'hover',
    idle: 'rest',
  },
  '*': { resting: 'rest' },
}

/**
 * Lists whose `left` and `right` are physical screen edges, not reading-order
 * sides, keyed `component.list`, with the reason they stay physical.
 */
export const PHYSICAL_SIDES = {
  'drawer.directions':
    'The edge of the screen the drawer slides from, and the direction it is swiped to dismiss; a swipe direction does not mirror in right-to-left layouts.',
  'sheet.sides':
    'The edge of the viewport the sheet is anchored to. Base UI Dialog has no logical side; a caller wanting the reading-order edge picks it from the document direction.',
  'sidebar.sides':
    'The viewport edge the fixed sidebar container is pinned to; it is passed on to the mobile Sheet `side`. Making it follow the reading direction is a behaviour change for right-to-left layouts, tracked separately.',
  'tooltip.sides':
    "Base UI Positioner's `side`, which takes physical `left` and `right`; the logical `inline-start` and `inline-end` are not in the contract yet.",
}

const STATUS = ['info', 'success', 'warning']
const DANGER = ['error', 'destructive', 'danger']
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * @param {{ component: string, lists: Record<string, unknown> }[]} contracts
 * @returns {{ rule: string, component: string, list: string, match: string }[]}
 */
export function checkContracts(contracts) {
  const found = []
  const statusLists = []
  for (const { component, lists } of contracts) {
    for (const [list, entry] of Object.entries(lists ?? {})) {
      // A list is an array of values or `{ values, description, … }`.
      const values = Array.isArray(entry) ? entry : entry?.values
      if (SKIP_LISTS.has(list) || !Array.isArray(values)) continue
      for (const value of values) {
        if (typeof value !== 'string') continue
        if (!KEBAB.test(value)) found.push({ rule: 'value-case', component, list, match: value })
        const canonical = SYNONYMS[list]?.[value] ?? SYNONYMS['*'][value]
        if (canonical)
          found.push({ rule: 'synonym', component, list, match: `${value} -> ${canonical}` })
        if ((value === 'left' || value === 'right') && !PHYSICAL_SIDES[`${component}.${list}`]) {
          found.push({ rule: 'physical-value', component, list, match: value })
        }
      }
      if (STATUS.every(status => values.includes(status))) {
        const danger = DANGER.find(name => values.includes(name))
        if (danger) statusLists.push({ component, list, danger })
      }
    }
  }
  const counts = {}
  for (const { danger } of statusLists) counts[danger] = (counts[danger] ?? 0) + 1
  const usual = Object.entries(counts).sort(([a, x], [b, y]) => y - x || a.localeCompare(b))[0]?.[0]
  for (const { component, list, danger } of statusLists) {
    if (danger !== usual)
      found.push({ rule: 'status-set', component, list, match: `${danger} -> ${usual}` })
  }
  return found
}

/**
 * Count findings per `rule | component.list | match`, sorted.
 * @param {{ rule: string, component: string, list: string, match: string }[]} found
 * @returns {Record<string, number>}
 */
export function countFindings(found) {
  const counts = {}
  for (const { rule, component, list, match } of found) {
    const key = `${rule} | ${component}.${list} | ${match}`
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)))
}

/** A list is an array of values or `{ values, … }`. */
const listValues = entry => (Array.isArray(entry) ? entry : entry?.values)

const DATA_SLOT =
  /data-slot['"]?\s*[:=]\s*\{?\s*(?:(['"`])([^'"`]+)\1|([A-Za-z0-9]+)Contract\.slots\[(\d+)\])/g

/**
 * The `data-slot` values a renderer's source sets: string literals, and
 * `fooBarContract.slots[n]` read from the foo-bar contract's slots.
 * @param {string} source
 * @param {Record<string, string[]>} slotsByComponent
 * @returns {Set<string>}
 */
export function renderedSlots(source, slotsByComponent) {
  const found = new Set()
  for (const [, , literal, contract, index] of source.matchAll(DATA_SLOT)) {
    if (literal) found.add(literal)
    else {
      const component = contract.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)
      const value = slotsByComponent[component]?.[Number(index)]
      if (value) found.add(value)
    }
  }
  return found
}

/**
 * Report contract slots that the web renderer's source never sets as a
 * `data-slot` value.
 * @param {{ component: string, lists: Record<string, unknown> }[]} contracts
 * @param {(component: string) => string | null} sourceFor the renderer source
 *   for a component (its own files and the components it imports), or null
 *   when it has no web renderer
 * @returns {{ rule: string, component: string, list: string, match: string }[]}
 */
export function checkSlots(contracts, sourceFor) {
  const slotsByComponent = {}
  for (const { component, lists } of contracts) {
    const slots = listValues(lists?.slots)
    if (Array.isArray(slots)) slotsByComponent[component] = slots
  }
  const found = []
  for (const [component, slots] of Object.entries(slotsByComponent)) {
    const source = sourceFor(component)
    const rendered = source === null ? new Set() : renderedSlots(source, slotsByComponent)
    for (const slot of slots) {
      if (!rendered.has(slot))
        found.push({ rule: 'slot-not-rendered', component, list: 'slots', match: slot })
    }
  }
  return found
}
