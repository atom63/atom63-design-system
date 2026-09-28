import { Button } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { GettingStartedChecklist } from './getting-started-checklist'

const meta = {
  title: 'Templates/Blocks/Getting started checklist',
  component: GettingStartedChecklist,
  // The card sizes to its container, so the story gives it the canvas width.
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GettingStartedChecklist>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  description: 'Three steps to your first paid invoice.',
  steps: [
    {
      description: 'Your business name and address appear on every invoice.',
      done: true,
      id: 'profile',
      title: 'Add your business details',
    },
    {
      action: (
        <Button size="sm" variant="outline">
          Add a customer
        </Button>
      ),
      description: 'Save who you bill once, and pick them when you invoice.',
      done: false,
      id: 'customer',
      title: 'Add your first customer',
    },
    {
      description: 'Tally sends it and tells you when it is opened and paid.',
      done: false,
      id: 'invoice',
      title: 'Send your first invoice',
    },
  ],
  title: 'Get started',
}

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <GettingStartedChecklist {...props} />
    </ThemeMatrix>
  ),
}
