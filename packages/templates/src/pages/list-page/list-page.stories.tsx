import type { Meta, StoryObj } from '@storybook/react-vite'

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
