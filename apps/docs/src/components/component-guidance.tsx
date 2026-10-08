import { mdxComponents } from '@atom63/mdx'

import { componentCatalogItems } from '../lib/component-catalog'
import { componentAxisGuidanceRows } from '../lib/component-docs'

const P = mdxComponents.p
const Code = mdxComponents.code
const Table = mdxComponents.table
const Thead = mdxComponents.thead
const Tbody = mdxComponents.tbody
const Tr = mdxComponents.tr
const Th = mdxComponents.th
const Td = mdxComponents.td

/** One row per variant, size and state, read from the component catalog's `axisGuidance`. */
export function ComponentGuidanceTable({ slug }: { slug: string }) {
  const rows = componentAxisGuidanceRows(slug)
  if (rows.length === 0) {
    return null
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Axis</Th>
          <Th>Value</Th>
          <Th>Guidance</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map(row => (
          <Tr key={`${row.axis}-${row.value}`}>
            <Td>{row.label}</Td>
            <Td>
              <Code>{row.value}</Code>
            </Td>
            <Td className="whitespace-normal">{row.text}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}

/** The component catalog's `usage` line, for authored pages that describe when to use a component. */
export function ComponentUsage({ slug }: { slug: string }) {
  const usage = componentCatalogItems.find(item => item.slug === slug)?.usage
  return usage ? <P>{usage}</P> : null
}
