import { MDXContentProvider } from '@atom63/mdx'
import { DocExample, DocExampleCode } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import { Button } from '@atom63/ui-react'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <MDXContentProvider variant="docs">
      <div className="ds-doc" style={{ maxWidth: '48rem' }}>
        {children}
      </div>
    </MDXContentProvider>
  )
}

const buttonCode = `import { Button } from '@atom63/ui-react'

export function App() {
  return (
    <div className="flex gap-3">
      <Button variant="primary" type="button">Save</Button>
      <Button variant="secondary" type="button">Cancel</Button>
    </div>
  )
}`

const cssCode = `.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}`

function DocExampleDefault() {
  return (
    <Wrap>
      <DocExample code={buttonCode} title="Button variants">
        <div className="flex gap-3">
          <Button variant="primary" type="button">
            Save
          </Button>
          <Button variant="secondary" type="button">
            Cancel
          </Button>
        </div>
      </DocExample>
    </Wrap>
  )
}

function DocExampleLeftAligned() {
  return (
    <Wrap>
      <DocExample code={buttonCode} title="Left-aligned" align="left">
        <Button variant="primary" type="button">
          Save
        </Button>
      </DocExample>
    </Wrap>
  )
}

function DocExampleWide() {
  return (
    <Wrap>
      <DocExample code={buttonCode} title="Wide layout" wide>
        <div className="flex w-full justify-between">
          <Button variant="secondary" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="button">
            Save
          </Button>
        </div>
      </DocExample>
    </Wrap>
  )
}

function DocExampleNoTitle() {
  return (
    <Wrap>
      <DocExample code={buttonCode}>
        <Button type="button">No title</Button>
      </DocExample>
    </Wrap>
  )
}

function CodePanelShowcase() {
  return (
    <Wrap>
      <div className="space-y-6">
        <div className="border-border overflow-hidden rounded-xl border">
          <DocExampleCode code={buttonCode} />
        </div>
        <div className="border-border overflow-hidden rounded-xl border">
          <DocExampleCode code={cssCode} lang="css" />
        </div>
      </div>
    </Wrap>
  )
}

const meta = {
  title: 'MDX/Blocks/DocExample',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <DocExampleDefault /> }
export const LeftAligned: Story = {
  name: 'Left Aligned',
  render: () => <DocExampleLeftAligned />,
}
export const Wide: Story = { render: () => <DocExampleWide /> }
export const NoTitle: Story = {
  name: 'No Title',
  render: () => <DocExampleNoTitle />,
}
export const CodePanel: Story = {
  name: 'Code Panel (Shiki)',
  render: () => <CodePanelShowcase />,
}
