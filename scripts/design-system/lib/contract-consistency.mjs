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
 *   and `right`, so a contract reads the same in right-to-left layouts.
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
        if (value === 'left' || value === 'right') {
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
