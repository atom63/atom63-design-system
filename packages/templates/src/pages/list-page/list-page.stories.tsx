import type { Meta, StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { ListPage } from './list-page'

const meta = {
  title: 'Templates/Pages/List page',
  component: ListPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: phoneGlobals }

/* Nothing to list yet: the empty state offers the page's primary action. */
export const NoInvoices: Story = { args: { invoices: [] } }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix>
      <ListPage />
    </ThemeMatrix>
  ),
}

/* A row's "View invoice" opens the detail sheet. */
export const Detail: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The menu and the sheet render in a portal outside the story root.
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Actions for INV-1044' }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'View invoice' }))
    await body.findByRole('dialog', { name: 'INV-1044' })
  },
}
