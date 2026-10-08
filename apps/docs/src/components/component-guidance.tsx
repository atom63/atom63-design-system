import { mdxComponents } from '@atom63/mdx'

import { componentCatalogItems } from '../lib/component-catalog'
import {
  componentAxisGuidanceHeading,
  componentAxisGuidanceHeadingId,
  componentAxisGuidanceRows,
} from '../lib/component-docs'

const H2 = mdxComponents.h2
const P = mdxComponents.p
const Code = mdxComponents.code
const Table = mdxComponents.table
const Thead = mdxComponents.thead
const Tbody = mdxComponents.tbody
const Tr = mdxComponents.tr
const Th = mdxComponents.th
const Td = mdxComponents.td

/**
 * The "Variants, sizes and states" heading and one row per variant, size and state, read from the
 * component catalog's `axisGuidance`. Renders nothing when the component has no guidance.
 */
export function ComponentGuidanceSection({ slug }: { slug: string }) {
  const rows = componentAxisGuidanceRows(slug)
  if (rows.length === 0) {
    return null
  }

  return (
    <>
      <H2 id={componentAxisGuidanceHeadingId}>{componentAxisGuidanceHeading}</H2>
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
    </>
  )
}

/** The component catalog's `usage` line, for authored pages that describe when to use a component. */
export function ComponentUsage({ slug }: { slug: string }) {
  const usage = componentCatalogItems.find(item => item.slug === slug)?.usage
  return usage ? <P>{usage}</P> : null
}
