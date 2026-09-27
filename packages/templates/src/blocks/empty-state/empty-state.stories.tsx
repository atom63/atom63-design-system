import { Button } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FolderPlus } from 'lucide-react'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { EmptyState } from './empty-state'

const meta = {
  title: 'Templates/Blocks/Empty state',
  component: EmptyState,
} satisfies Meta<typeof EmptyState>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  action: <Button variant="primary">New project</Button>,
  description: 'Projects group your invoices by client work. Create one to get started.',
  headingLevel: 2 as const,
  icon: <FolderPlus aria-hidden />,
  secondaryAction: <Button variant="outline">Import projects</Button>,
  title: 'No projects yet',
}

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <EmptyState {...props} />
    </ThemeMatrix>
  ),
}
