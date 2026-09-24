import { CodeBlock } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const tsxCode = `import { Button } from '@atom63/ui-react'

export function Toolbar() {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline">Cancel</Button>
      <Button type="button">Publish</Button>
    </div>
  )
}`

const longCode = `const longTokenName = 'color-surface-interactive-selected-hovered-with-very-long-label'

export const tokens = {
  [longTokenName]: 'var(--color-primary)',
  description: 'This line is intentionally long to verify horizontal overflow remains scrollable instead of breaking the article layout.',
}`

const meta = {
  title: 'MDX/Blocks/CodeBlock',
  tags: ['!autodocs'],
  component: CodeBlock,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>

export default meta

type Story = StoryObj<typeof meta>

export const TypeScript: Story = {
  args: {
    code: tsxCode,
    lang: 'tsx',
  },
}

export const LongOverflow: Story = {
  args: {
    code: longCode,
    lang: 'ts',
  },
}

export const UnknownLanguageFallback: Story = {
  args: {
    code: `component Button\n  state pressed\n  output visual-contract`,
    lang: 'design-system-dsl',
  },
}
