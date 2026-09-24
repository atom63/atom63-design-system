import { DocExampleCode } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const TSX_SNIPPET = `import { Button } from '@atom63/ui-react'

export function Save() {
  return <Button variant="primary">Save changes</Button>
}`

const CSS_SNIPPET = `.card {
  border-radius: var(--radius);
  background: var(--background);
  color: var(--foreground);
}`

const meta = {
  title: 'MDX/Blocks/DocExampleCode',
  tags: ['!autodocs'],
  component: DocExampleCode,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    code: { control: 'text' },
    lang: { control: 'text' },
  },
  args: {
    code: TSX_SNIPPET,
    lang: 'tsx',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DocExampleCode>

export default meta

type Story = StoryObj<typeof meta>

export const Tsx: Story = {}

export const Css: Story = {
  args: {
    code: CSS_SNIPPET,
    lang: 'css',
  },
}
