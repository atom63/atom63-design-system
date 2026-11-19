import { describe, expect, it } from 'vitest'
import { mdxToMarkdown } from './mdx-to-markdown'

describe('mdxToMarkdown', () => {
  it('strips top-level MDX imports, exports and JSX', () => {
    const source = [
      "import { Button } from '@atom63/ui-react'",
      'export const meta = { title: "Page" }',
      '',
      '# Page',
      '',
      '<Button>Live demo</Button>',
      '{/* a comment */}',
      '',
      'Prose stays.',
    ].join('\n')

    expect(mdxToMarkdown(source)).toBe('# Page\n\nProse stays.')
  })

  it('strips a top-level export that spans lines', () => {
    const source = [
      'export function Demo() {',
      '  const [open, setOpen] = useState(false)',
      '  return <Button onClick={() => setOpen(true)}>Open</Button>',
      '',
      '  return null',
      '}',
      '',
      'export const REPLY =',
      "  'A string on the next line.'",
      '',
      '# Page',
    ].join('\n')

    expect(mdxToMarkdown(source)).toBe('# Page')
  })

  it('keeps fenced code verbatim, including import, export and JSX lines', () => {
    const fence = [
      '```tsx',
      "import { WidgetGrid } from '@atom63/widgets'",
      '',
      'export const registry = defineRegistry([',
      '  { id: "one" },',
      '])',
      '',
      '<WidgetGrid>',
      '  {/* a JSX comment */}',
      '  <WidgetCard size="small" />',
      '</WidgetGrid>',
      '```',
    ].join('\n')
    const source = ["import { Demo } from './demo'", '', '# Widgets', '', fence, '', 'After.'].join(
      '\n'
    )

    expect(mdxToMarkdown(source)).toBe(`# Widgets\n\n${fence}\n\nAfter.`)
  })

  it('keeps tilde fences and fences indented inside JSX', () => {
    const source = ['<Example>', '  ~~~ts', "  import { a } from 'b'", '  ~~~', '</Example>'].join(
      '\n'
    )

    expect(mdxToMarkdown(source)).toBe("~~~ts\n  import { a } from 'b'\n  ~~~")
  })
})
