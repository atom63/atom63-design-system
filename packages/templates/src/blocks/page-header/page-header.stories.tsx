import { Button } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Download, Plus } from 'lucide-react'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { PageHeader } from './page-header'

const meta = {
  title: 'Templates/Blocks/Page header',
  component: PageHeader,
} satisfies Meta<typeof PageHeader>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  actions: (
    <>
      <Button variant="outline">
        <Download aria-hidden />
        Export
      </Button>
      <Button variant="primary">
        <Plus aria-hidden />
        New invoice
      </Button>
    </>
  ),
  description: 'Track what customers owe and what has been paid.',
  title: 'Invoices',
}

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <PageHeader {...props} />
    </ThemeMatrix>
  ),
}
