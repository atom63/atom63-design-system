/**
 * The documentation a component model carries, read from the generated agent
 * index (packages/cli/generated/agent-index.json) — never from docs source, so
 * the catalog stays the one place each string is written (S1, S3).
 * Pure: the generator passes the parsed index in.
 */
import type { ComponentDoc, ComponentModel } from './model'
import { readRecipe, type RecipeInput } from './recipe'

type Guidance = Partial<Record<string, string>>

/** The fields of an agent index component entry the model reads. */
export interface AgentIndexComponent {
  slug: string
  label: string
  group: { id: string; title: string } | null
  summary: string
  usage: string
  related: string[]
  route: string
  axisGuidance: { variant?: Guidance; size?: Guidance; state?: Guidance } | null
}

export interface AgentIndex {
  components: AgentIndexComponent[]
}

const AXES = [
  ['Variant', 'variant'],
  ['Size', 'size'],
  ['State', 'state'],
] as const

const regenerate = 'run pnpm --filter @atom63/cli generate:index'
const present = (text: unknown): text is string => typeof text === 'string' && text.trim() !== ''

/**
 * The doc block for `slug`, with one guidance line for every value on the
 * model's axes, in axis order. Throws, naming every missing key, if the index
 * has no entry, a blank field, or no line for a modelled value (S4).
 */
export function readComponentDoc(
  index: AgentIndex,
  slug: string,
  axes: ComponentModel['axes']
): ComponentDoc {
  const entries = new Map(index.components.map(entry => [entry.slug, entry]))
  const entry = entries.get(slug)
  if (!entry) throw new Error(`agent-index.json has no component "${slug}"; ${regenerate}`)

  const missing: string[] = []
  for (const field of ['label', 'summary', 'usage', 'route'] as const)
    if (!present(entry[field])) missing.push(field)
  if (!entry.group || !present(entry.group.id) || !present(entry.group.title)) missing.push('group')
  const related = entry.related.map(relatedSlug => {
    const label = entries.get(relatedSlug)?.label
    if (!present(label)) missing.push(`related.${relatedSlug}`)
    return { slug: relatedSlug, label: label ?? '' }
  })
  const axisGuidance: ComponentDoc['axisGuidance'] = { variant: {}, size: {}, state: {} }
  for (const [axis, key] of AXES)
    for (const value of axes[axis]) {
      const line = entry.axisGuidance?.[key]?.[value]
      if (!present(line)) missing.push(`axisGuidance.${key}.${value}`)
      else axisGuidance[key][value] = line
    }
  if (missing.length > 0)
    throw new Error(
      `agent-index.json component "${slug}" is missing ${missing.join(', ')}; ` +
        `add them to the component catalog and ${regenerate}`
    )

  return {
    slug: entry.slug,
    label: entry.label,
    group: { id: entry.group!.id, title: entry.group!.title },
    summary: entry.summary,
    usage: entry.usage,
    related,
    axisGuidance,
    docsPath: entry.route,
  }
}

/** The generated model: the recipe plus the doc block read from the agent index. */
export function buildComponentModel(
  input: RecipeInput & { index: AgentIndex; slug: string }
): ComponentModel {
  const model = readRecipe(input)
  return { ...model, doc: readComponentDoc(input.index, input.slug, model.axes) }
}
