import type { Meta, StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import {
  compactGlobals,
  phoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { ListOperationStatus, ListPage } from './list-page'

const meta = {
  title: 'Templates/Pages/List page',
  component: ListPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const DefaultWide: Story = { globals: wideGlobals }

export const Compact: Story = { globals: compactGlobals }

export const Tablet: Story = { globals: tabletGlobals }

export const Phone: Story = { globals: phoneGlobals }

const selectedArgs = { defaultOpenId: 'INV-1044' }

export const SelectedWide: Story = { args: selectedArgs, globals: wideGlobals }

export const SelectedCompact: Story = { args: selectedArgs, globals: compactGlobals }

export const SelectedTablet: Story = { args: selectedArgs, globals: tabletGlobals }

export const SelectedPhone: Story = { args: selectedArgs, globals: phoneGlobals }

const emptyArgs = { defaultQuery: 'No matching invoice' }

export const EmptyWide: Story = { args: emptyArgs, globals: wideGlobals }

export const EmptyCompact: Story = { args: emptyArgs, globals: compactGlobals }

export const EmptyTablet: Story = { args: emptyArgs, globals: tabletGlobals }

export const EmptyPhone: Story = { args: emptyArgs, globals: phoneGlobals }

const progressArgs = {
  operationStatus: (
    <ListOperationStatus
      description="8 of 12 invoices processed"
      progress={67}
      title="Importing invoices"
      variant="info"
    />
  ),
}

export const ProgressWide: Story = { args: progressArgs, globals: wideGlobals }

export const ProgressCompact: Story = { args: progressArgs, globals: compactGlobals }

export const ProgressTablet: Story = { args: progressArgs, globals: tabletGlobals }

export const ProgressPhone: Story = { args: progressArgs, globals: phoneGlobals }

const successArgs = {
  operationStatus: (
    <ListOperationStatus
      description="The new invoices are ready to review."
      title="12 invoices imported"
      variant="success"
    />
  ),
}

export const SuccessWide: Story = { args: successArgs, globals: wideGlobals }

export const SuccessCompact: Story = { args: successArgs, globals: compactGlobals }

export const SuccessTablet: Story = { args: successArgs, globals: tabletGlobals }

export const SuccessPhone: Story = { args: successArgs, globals: phoneGlobals }

/* Nothing to list yet: the empty state offers the page's primary action. */
export const NoInvoices: Story = { args: { invoices: [] } }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix frame>
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
