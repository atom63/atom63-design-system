/**
 * The runtime craft baseline: known violations per story, rule and element,
 * stored in docs/design-system/audits/runtime-craft-baseline.json. It works
 * like the `check:craft` baseline: a violation it does not list fails, and so
 * does an entry that no longer occurs, so a fix must shrink it.
 *
 * Plain data in and out, so the story hook (in the browser) and the Vitest
 * config (in Node) share it.
 */

/** `{ [element description]: count }` */
export type ElementCounts = Record<string, number>
/** `{ [rule]: ElementCounts }` */
export type StoryEntry = Record<string, ElementCounts>
/** `{ [story id]: StoryEntry }` */
export type CraftBaseline = Record<string, StoryEntry>

export function countViolations(
  violations: readonly { rule: string; element: string }[]
): StoryEntry {
  const entry: StoryEntry = {}
  for (const { rule, element } of violations) {
    const counts = (entry[rule] ??= {})
    counts[element] = (counts[element] ?? 0) + 1
  }
  return sortEntry(entry)
}

export interface BaselineDiff {
  /** Violations beyond the baseline, as `rule | element` with the extra count. */
  added: { key: string; count: number }[]
  /** Baseline entries that no longer occur. */
  resolved: { key: string; count: number }[]
}

function flatten(entry: StoryEntry = {}): Map<string, number> {
  const flat = new Map<string, number>()
  for (const [rule, counts] of Object.entries(entry)) {
    for (const [element, count] of Object.entries(counts)) flat.set(`${rule} | ${element}`, count)
  }
  return flat
}

export function compareToBaseline(current: StoryEntry, baseline: StoryEntry = {}): BaselineDiff {
  const now = flatten(current)
  const allowed = flatten(baseline)
  const added: BaselineDiff['added'] = []
  const resolved: BaselineDiff['resolved'] = []
  for (const [key, count] of now) {
    const extra = count - (allowed.get(key) ?? 0)
    if (extra > 0) added.push({ key, count: extra })
  }
  for (const [key, count] of allowed) {
    const missing = count - (now.get(key) ?? 0)
    if (missing > 0) resolved.push({ key, count: missing })
  }
  return { added, resolved }
}

function sortKeys<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
}

function sortEntry(entry: StoryEntry): StoryEntry {
  return sortKeys(Object.fromEntries(Object.entries(entry).map(([rule, c]) => [rule, sortKeys(c)])))
}

/**
 * The baseline after a run: every story that ran takes its current entry
 * (dropped when empty). Stories that did not run keep theirs, unless the run
 * covered every story, in which case they no longer exist.
 */
export function mergeBaseline(
  baseline: CraftBaseline,
  results: ReadonlyMap<string, StoryEntry>,
  { complete }: { complete: boolean }
): CraftBaseline {
  const merged: CraftBaseline = complete ? {} : { ...baseline }
  for (const [storyId, entry] of results) {
    if (Object.keys(entry).length > 0) merged[storyId] = sortEntry(entry)
    else delete merged[storyId]
  }
  return sortKeys(merged)
}

export function totals(baseline: CraftBaseline): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const entry of Object.values(baseline)) {
    for (const [rule, elements] of Object.entries(entry)) {
      counts[rule] = (counts[rule] ?? 0) + Object.values(elements).reduce((a, b) => a + b, 0)
    }
  }
  return counts
}
