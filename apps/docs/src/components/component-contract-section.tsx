import { mdxComponents } from '@atom63/mdx'
import type { ReactNode } from 'react'

import {
  getComponentContractDoc,
  outcomeLabel,
  patternOptionsLabel,
} from '../lib/component-contract'

const A = mdxComponents.a
const H2 = mdxComponents.h2
const H3 = mdxComponents.h3
const P = mdxComponents.p
const Ul = mdxComponents.ul
const Li = mdxComponents.li
const Code = mdxComponents.code
const Strong = mdxComponents.strong
const Table = mdxComponents.table
const Thead = mdxComponents.thead
const Tbody = mdxComponents.tbody
const Tr = mdxComponents.tr
const Th = mdxComponents.th
const Td = mdxComponents.td

function CodeList({ values }: { values: readonly string[] }) {
  if (values.length === 0) {
    return '—'
  }
  return values.map((value, index) => (
    <span key={value}>
      {index > 0 ? ', ' : null}
      <Code>{value}</Code>
    </span>
  ))
}

function Row({ label, children }: { children: ReactNode; label: string }) {
  return (
    <P>
      <Strong>{label}:</Strong> {children}
    </P>
  )
}

/** The component's contract, read from @atom63/ui-foundation at build time. */
export function ComponentContractSection({ componentSlug }: { componentSlug: string }) {
  const doc = getComponentContractDoc(componentSlug)
  if (!doc) {
    return null
  }
  const shared = doc.crossRenderer
  const pattern = doc.accessibility

  return (
    <>
      <H2 id="contract">Contract</H2>
      <P>
        Read from <Code>{doc.exportName}</Code> in <Code>@atom63/ui-foundation</Code> (
        <Code>{doc.source}</Code>), the same source the components, recipes and the SwiftUI renderer
        follow.
      </P>
      {doc.axes.length > 0 ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Axis</Th>
              <Th>Values</Th>
              <Th>Default</Th>
            </Tr>
          </Thead>
          <Tbody>
            {doc.axes.map(axis => (
              <Tr key={axis.name}>
                <Td>
                  <Code>{axis.name}</Code>
                </Td>
                {/* Long value lists wrap so the Default column stays in view. */}
                <Td className="whitespace-normal">
                  <CodeList values={axis.values} />
                </Td>
                <Td>{axis.default ? <Code>{axis.default}</Code> : '—'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : null}
      {doc.slots.length > 0 ? (
        <Row label="Slots">
          <CodeList values={doc.slots} />
        </Row>
      ) : null}
      {doc.states.length > 0 ? (
        <Row label="States">
          <CodeList values={doc.states} />
        </Row>
      ) : null}
      {doc.tokenSlots.length > 0 ? (
        <Row label="Token slots">
          <CodeList values={doc.tokenSlots} />
        </Row>
      ) : null}
      {doc.archetypes.map(archetype => (
        <Row key={archetype.id} label="Visual archetype">
          {archetype.label} — {archetype.description}
        </Row>
      ))}
      {pattern ? (
        <>
          <Row label="Accessibility pattern">
            <A href={pattern.source}>{pattern.name}</A>
            {patternOptionsLabel(pattern)}, checked against the component&apos;s stories in
            Storybook&apos;s <Code>a11y</Code> tests.
          </Row>
          {pattern.knownGaps.length > 0 ? (
            <Ul>
              {pattern.knownGaps.map(gap => (
                <Li key={gap.check}>
                  Known gap (<Code>{gap.check}</Code>): {gap.reason}
                </Li>
              ))}
            </Ul>
          ) : null}
        </>
      ) : null}

      {shared ? (
        <>
          <H3 id="web-and-ios">Web and iOS</H3>
          <P>
            {shared.intent} Rendered by <Code>{shared.swiftUIRenderer}</Code> in SwiftUI, with{' '}
            <Code>{shared.parity}</Code> parity.
          </P>
          <Row label="Required states">
            <CodeList values={shared.requiredStates} />
          </Row>
          <P>
            <Strong>Shared outcomes:</Strong>
          </P>
          <Ul>
            {shared.sharedOutcomes.map(outcome => (
              <Li key={outcome}>{outcomeLabel(outcome)}</Li>
            ))}
          </Ul>
          <P>
            <Strong>Accessibility outcomes:</Strong>
          </P>
          <Ul>
            {shared.accessibilityOutcomes.map(outcome => (
              <Li key={outcome}>{outcomeLabel(outcome)}</Li>
            ))}
          </Ul>
          <P>
            <Strong>Platform adaptations:</Strong>
          </P>
          <Ul>
            {shared.platformAdaptations.react.map(item => (
              <Li key={`react-${item}`}>React: {item}</Li>
            ))}
            {shared.platformAdaptations.swiftUI.map(item => (
              <Li key={`swift-${item}`}>SwiftUI: {item}</Li>
            ))}
          </Ul>
        </>
      ) : null}
    </>
  )
}
