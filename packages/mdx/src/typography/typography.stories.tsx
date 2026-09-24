import { MDXContentProvider, mdxComponents, mdxStyles } from '@atom63/mdx'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
  blockquote: Blockquote,
  strong: Strong,
  em: Em,
  a: A,
  code: Code,
  pre: Pre,
  hr: Hr,
  kbd: Kbd,
  mark: Mark,
  del: Del,
  ins: Ins,
  sub: Sub,
  sup: Sup,
  abbr: Abbr,
  cite: Cite,
  dfn: Dfn,
  var: Var,
  samp: Samp,
  output: Output,
  details: Details,
  summary: Summary,
  table: MdxTable,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
} = mdxComponents

function HeadingsShowcase() {
  return (
    <>
      <H1>Heading 1 — System architecture</H1>
      <P>
        Body text at <Code>text-base</Code> (15px). The type scale is controlled by a single{' '}
        <Code>--typography-scale</Code> multiplier in <Code>typography.css</Code>.
      </P>
      <H2>Heading 2 — Foundations</H2>
      <P>
        Paragraphs use <Code>text-secondary-foreground</Code> for comfortable reading contrast.{' '}
        <Strong>Bold text</Strong> promotes to <Code>text-foreground</Code>. <Em>Italic text</Em>{' '}
        keeps the same color. Links look <A href="#">like this</A>.
      </P>
      <H3>Heading 3 — Components</H3>
      <P>
        h1/h2 get <Code>mt-10</Code>, h3 gets <Code>mt-8</Code>, h4–h6 get <Code>mt-6</Code>.
        Paragraphs use <Code>mt-4</Code>.
      </P>
      <H4>Heading 4 — Variants</H4>
      <P>Body text following an h4. Size steps down from lg to base.</P>
      <H5>Heading 5 — Details</H5>
      <P>Body text following an h5. Same size as body but semibold.</P>
      <H6>Heading 6 — Fine print</H6>
      <P>The heading is sm-sized and uses secondary color.</P>
    </>
  )
}

function ListShowcase() {
  return (
    <>
      <H3>Unordered list</H3>
      <Ul>
        <Li>
          List items match paragraph size at <Code>text-base</Code>
        </Li>
        <Li>
          Spacing between items uses <Code>space-y-2</Code>
        </Li>
        <Li>
          Links in lists are <A href="#">underlined automatically</A>
        </Li>
        <Li>
          Nested lists:
          <Ul>
            <Li>
              Indent with <Code>pl-4</Code>
            </Li>
            <Li>
              Tighter <Code>mt-2</Code> spacing
            </Li>
          </Ul>
        </Li>
      </Ul>
      <H3>Ordered list</H3>
      <Ol>
        <Li>First item in an ordered list</Li>
        <Li>Second item with consistent sizing</Li>
        <Li>
          Nested ordered:
          <Ol>
            <Li>Sub-item one</Li>
            <Li>Sub-item two</Li>
          </Ol>
        </Li>
      </Ol>
    </>
  )
}

function BlockquoteShowcase() {
  return (
    <>
      <P>A paragraph before the blockquote for spacing context.</P>
      <Blockquote>
        <P>
          Personal projects often collapse under their own one-off decisions. This system treats
          personal work like a real product.
        </P>
      </Blockquote>
      <P>A paragraph after the blockquote.</P>
      <Blockquote>
        <P>Multi-paragraph blockquotes are supported.</P>
        <P>
          The second paragraph gets <Code>mt-2</Code> inside the quote container.
        </P>
      </Blockquote>
    </>
  )
}

function CodeShowcase() {
  return (
    <>
      <H3>Inline code</H3>
      <P>
        Inline code like <Code>Button</Code>, <Code>--typography-scale</Code>, and{' '}
        <Code>@atom63/ui-react</Code> uses mono font at <Code>text-sm</Code> with a subtle
        background ring.
      </P>
      <H3>Code block</H3>
      <Pre>
        <Code>{`import { Button } from '@atom63/ui-react'

function App() {
  return <Button variant="default">Click me</Button>
}`}</Code>
      </Pre>
      <P>
        Code blocks include a copy button on hover, overflow scroll, and reset inner code styling.
      </P>
    </>
  )
}

function InlineSemantics() {
  return (
    <>
      <H3>Inline semantic elements</H3>
      <P>
        <Strong>Strong</Strong> — bold, promoted to foreground color
      </P>
      <P>
        <Em>Emphasis</Em> — italic, same color
      </P>
      <P>
        <Del>Deleted text</Del> — strikethrough in secondary color
      </P>
      <P>
        <Ins>Inserted text</Ins> — underline with green accent
      </P>
      <P>
        <Mark>Highlighted text</Mark> — yellow background, rounded-sm
      </P>
      <P>
        <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd> — keyboard shortcuts
      </P>
      <P>
        H<Sub>2</Sub>O and E=mc<Sup>2</Sup> — subscript and superscript
      </P>
      <P>
        The <Abbr title="Cascading Style Sheets">CSS</Abbr> specification — abbreviation with dotted
        underline
      </P>
      <P>
        As noted in <Cite>Design Systems by Alla Kholmatova</Cite> — citation
      </P>
      <P>
        A <Dfn>design token</Dfn> is an indivisible unit of style — definition term
      </P>
      <P>
        Published <time dateTime="2024-01-15">January 15, 2024</time> — semantic time
      </P>
      <P>
        The variable <Var>x</Var> represents the scale factor — variable name
      </P>
      <P>
        Terminal output: <Samp>Build completed in 1.2s</Samp> — sample output
      </P>
      <P>
        Result: <Output>42</Output> — computed output
      </P>
    </>
  )
}

function HorizontalRuleShowcase() {
  return (
    <>
      <P>Content before the divider.</P>
      <Hr />
      <P>
        Content after the divider. Horizontal rules use <Code>my-8</Code> (sm: <Code>my-10</Code>)
        for generous vertical breathing room.
      </P>
    </>
  )
}

function TableShowcase() {
  return (
    <>
      <H3>Table</H3>
      <P>Tables are wrapped in a scrollable container with a rounded border.</P>
      <MdxTable>
        <Thead>
          <Tr>
            <Th>Token</Th>
            <Th>Role</Th>
            <Th>Default</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <Code>--primary</Code>
            </Td>
            <Td>Primary actions and focus rings</Td>
            <Td>b1-500 (blue)</Td>
          </Tr>
          <Tr>
            <Td>
              <Code>--destructive</Code>
            </Td>
            <Td>Irreversible actions and error states</Td>
            <Td>danger-500 (red)</Td>
          </Tr>
          <Tr>
            <Td>
              <Code>--muted</Code>
            </Td>
            <Td>Subtle backgrounds and disabled states</Td>
            <Td>surface-light-3</Td>
          </Tr>
          <Tr>
            <Td>
              <Code>--border</Code>
            </Td>
            <Td>Dividers and input outlines</Td>
            <Td>surface-light-4</Td>
          </Tr>
        </Tbody>
      </MdxTable>
    </>
  )
}

function DetailsShowcase() {
  return (
    <>
      <H3>Details / Summary</H3>
      <P>Collapsible sections for supplementary content.</P>
      <Details>
        <Summary>Why not use Radix Accordion?</Summary>
        <P>
          The native details element is semantic, works without JavaScript, and is sufficient for
          simple disclosure patterns in documentation. We reserve the Accordion component for richer
          multi-panel interactions.
        </P>
      </Details>
      <Details>
        <Summary>Token layer architecture</Summary>
        <P>
          Primitives define raw values. Aliases bind a neutral family. Semantics map component
          roles. Themes override aliases and knobs.
        </P>
        <Ul>
          <Li>Primitives — ~400 raw color, spacing, timing values</Li>
          <Li>Aliases — surface family + duration names</Li>
          <Li>Semantics — component-facing roles</Li>
        </Ul>
      </Details>
    </>
  )
}

function KitchenSink() {
  return (
    <>
      <H1>Kitchen sink</H1>
      <P>
        This story renders every MDX element in a single flow to verify vertical rhythm, spacing
        consistency, and that no element breaks the reading cadence.
      </P>

      <H2>Typography</H2>
      <P>
        Body text with <Strong>strong emphasis</Strong>, <Em>italic style</Em>,{' '}
        <Code>inline code</Code>, and <A href="#">links</A>. The paragraph uses{' '}
        <Code>text-secondary-foreground</Code> for comfortable contrast while headings and bold text
        promote to <Code>text-foreground</Code>.
      </P>

      <H3>Lists</H3>
      <Ul>
        <Li>
          Unordered item with <A href="#">a link</A>
        </Li>
        <Li>
          Second item with <Code>inline code</Code>
        </Li>
      </Ul>
      <Ol>
        <Li>Ordered first</Li>
        <Li>Ordered second</Li>
      </Ol>

      <Blockquote>
        <P>A blockquote between sections to test vertical rhythm.</P>
      </Blockquote>

      <H3>Code</H3>
      <Pre>
        <Code>{`const tokens = { primary: 'var(--color-b1-500)' }`}</Code>
      </Pre>

      <H3>Inline semantics</H3>
      <P>
        <Mark>Highlighted</Mark> · <Del>deleted</Del> · <Ins>inserted</Ins> · <Kbd>Cmd</Kbd>+
        <Kbd>K</Kbd> · H<Sub>2</Sub>O · x<Sup>2</Sup> · <Abbr title="Design System">DS</Abbr> ·{' '}
        <Samp>output</Samp>
      </P>

      <Hr />

      <H3>Table</H3>
      <MdxTable>
        <Thead>
          <Tr>
            <Th>Element</Th>
            <Th>Spacing</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Heading 1–2</Td>
            <Td>
              <Code>mt-10</Code>
            </Td>
          </Tr>
          <Tr>
            <Td>Heading 3</Td>
            <Td>
              <Code>mt-8</Code>
            </Td>
          </Tr>
          <Tr>
            <Td>Paragraph</Td>
            <Td>
              <Code>mt-4</Code>
            </Td>
          </Tr>
        </Tbody>
      </MdxTable>

      <Details>
        <Summary>Collapsible detail</Summary>
        <P>Content inside a details element with proper inner spacing.</P>
      </Details>

      <H3>Final paragraph</H3>
      <P>
        Every element above should maintain consistent vertical rhythm without double-spacing or
        collapsed margins.
      </P>
    </>
  )
}

const meta = {
  title: 'MDX/Prose/Typography',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <MDXContentProvider>
        <div className={mdxStyles.root} style={{ maxWidth: '48rem' }}>
          <Story />
        </div>
      </MDXContentProvider>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Headings: Story = { render: () => <HeadingsShowcase /> }
export const Lists: Story = { render: () => <ListShowcase /> }
export const Blockquotes: Story = { render: () => <BlockquoteShowcase /> }
export const CodeBlocks: Story = {
  name: 'Code',
  render: () => <CodeShowcase />,
}
export const InlineElements: Story = { render: () => <InlineSemantics /> }
export const HorizontalRule: Story = { render: () => <HorizontalRuleShowcase /> }
export const Tables: Story = { render: () => <TableShowcase /> }
export const DetailsSummary: Story = { render: () => <DetailsShowcase /> }
export const FullPage: Story = {
  name: 'Kitchen Sink',
  render: () => <KitchenSink />,
}
