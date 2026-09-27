import { Badge, Button } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { DetailPanel } from './detail-panel'

const args = {
  actions: (
    <>
      <Button variant="outline">Download PDF</Button>
      <Button variant="primary">Mark as paid</Button>
    </>
  ),
  description: 'Harbor & Co.',
  fields: [
    { label: 'Status', value: <Badge variant="error">Overdue</Badge> },
    { label: 'Issued', value: 'Aug 12, 2026' },
    { label: 'Amount', value: '$3,200.00' },
  ],
  onOpenChange: () => undefined,
  open: true,
  title: 'INV-1044',
}

const meta = {
  title: 'Templates/Blocks/Detail panel',
  component: DetailPanel,
} satisfies Meta<typeof DetailPanel>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

/* A sheet is modal, so one open panel per theme and mode would stack; the
   matrix shows the closed state and the Desktop story covers the open one. */
export const Themes: Story = {
  args: { ...args, open: false },
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <DetailPanel {...props} />
    </ThemeMatrix>
  ),
}
