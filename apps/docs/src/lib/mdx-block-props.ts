/**
 * The props of the @atom63/mdx blocks, read from their TypeScript types by
 * `vite-plugins/mdx-block-props.ts`. Shared by the props tables on the docs
 * page and the Markdown twin the agent index reads, so both say the same.
 */

export type MdxBlockPropRow = {
  defaultValue?: string
  description?: string
  name: string
  required: boolean
  type: string
}

/** `{ KeyIdea: rows, 'Steps.Step': rows }` */
export type MdxBlockPropsIndex = Record<string, MdxBlockPropRow[]>

export type MdxBlockPropsSections = {
  /** Parts with props of their own, such as `Steps.Step`. */
  parts: { name: string; rows: MdxBlockPropRow[] }[]
  rows: MdxBlockPropRow[]
  /** Parts that only take `children`, such as `Callout.Title`. */
  slots: string[]
}

const isSlot = (rows: MdxBlockPropRow[]) =>
  rows.length === 1 && rows[0]?.name === 'children' && !rows[0].required

export function mdxBlockPropsSections(
  index: MdxBlockPropsIndex,
  name: string
): MdxBlockPropsSections | null {
  if (!(name in index)) return null
  const parts = Object.entries(index)
    .filter(([key]) => key.startsWith(`${name}.`))
    .map(([part, rows]) => ({ name: part, rows }))
  return {
    // A part with no props of its own (the wrapped ui-react parts of `Tabs`
    // and `Accordion`) takes the props of what it wraps; the page links there.
    parts: parts.filter(part => part.rows.length > 0 && !isSlot(part.rows)),
    rows: index[name],
    slots: parts.filter(part => isSlot(part.rows)).map(part => part.name),
  }
}

function rowMarkdown(row: MdxBlockPropRow): string {
  const facts = [
    row.required ? 'required' : null,
    row.defaultValue ? `default \`${row.defaultValue}\`` : null,
  ].filter(Boolean)
  const head = `- \`${row.name}\`: \`${row.type}\`${facts.length > 0 ? ` (${facts.join(', ')})` : ''}`
  return row.description ? `${head}. ${row.description}` : head
}

/** The props of a block and its parts as Markdown lists, for the `.md` twin and the agent index. */
export function mdxBlockPropsMarkdown(index: MdxBlockPropsIndex, name: string): string {
  const sections = mdxBlockPropsSections(index, name)
  if (!sections) {
    throw new Error(`No props for ${name}: it is not a component @atom63/mdx/blocks exports.`)
  }
  const lines =
    sections.rows.length > 0
      ? [`Props of \`${name}\`:`, '', ...sections.rows.map(rowMarkdown)]
      : [`\`${name}\` adds no props of its own.`]
  for (const part of sections.parts) {
    lines.push('', `Props of \`${part.name}\`:`, '', ...part.rows.map(rowMarkdown))
  }
  if (sections.slots.length > 0) {
    lines.push(
      '',
      `Slots, each taking \`children\`: ${sections.slots.map(slot => `\`${slot}\``).join(', ')}.`
    )
  }
  return lines.join('\n')
}
