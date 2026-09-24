import { ResourceList } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/ResourceList',
  tags: ['!autodocs'],
  component: ResourceList,
  parameters: {
    layout: 'padded',
  },
  args: {
    items: [
      { name: 'Emil Kowalski', url: 'https://emilkowal.ski' },
      { name: 'Rauno Freiberg', url: 'https://rauno.me' },
      { name: 'Paco Coursey', url: 'https://paco.me' },
    ],
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResourceList>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithNotes: Story = {
  args: {
    items: [
      {
        name: 'Emil Kowalski',
        url: 'https://emilkowal.ski',
        note: 'Animation & interaction craft',
      },
      { name: 'Josh Comeau', url: 'https://www.joshwcomeau.com', note: 'CSS & React deep-dives' },
      {
        name: 'Refactoring UI',
        url: 'https://www.refactoringui.com',
        note: 'Visual design for engineers',
      },
    ],
  },
}
