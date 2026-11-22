import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Progress,
  UIProvider,
} from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckCircle2, Upload } from 'lucide-react'
import { within } from 'storybook/test'

import {
  compactGlobals,
  landmarkParameters,
  responsivePhoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { ListPage } from './list-page'

const meta = {
  title: 'Templates/Pages/List page',
  component: ListPage,
  parameters: { layout: 'fullscreen', ...landmarkParameters },
} satisfies Meta<typeof ListPage>

export default meta

type Story = StoryObj<typeof meta>

function OperationStatus({
  description,
  progress,
  title,
  variant,
}: {
  description: string
  progress?: number
  title: string
  variant: 'info' | 'success'
}) {
  const Icon = variant === 'success' ? CheckCircle2 : Upload
  return (
    <Alert
      className="fixed end-4 bottom-[calc(--spacing(4)+var(--a63-safe-area-bottom))] z-[var(--z-layer-popover)] w-[min(24rem,calc(100vw-2rem))] bg-[var(--a63-surface-overlay)]"
      role="status"
      variant={variant}
    >
      <AlertIcon>
        <Icon aria-hidden />
      </AlertIcon>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{description}</p>
        {progress === undefined ? null : (
          <Progress aria-label={`${title}: ${progress}%`} className="mt-2" value={progress} />
        )}
      </AlertDescription>
    </Alert>
  )
}

export const Desktop: Story = {}

export const DefaultWide: Story = { globals: wideGlobals }

export const Compact: Story = { globals: compactGlobals }

export const Tablet: Story = { globals: tabletGlobals }

/* On touch, the phone row's two 32px icon buttons sit far enough apart that their 44px targets
   do not overlap. */
export const Phone: Story = {
  globals: responsivePhoneGlobals,
  play: async ({ canvas, canvasElement }) => {
    const viewButton = await canvas.findByRole('button', { name: 'View INV-1044' })
    const menuButton = canvas.getByRole('button', { name: 'Actions for INV-1044' })
    // Touch input sizes, as on a phone: 32px buttons with 44px targets.
    canvasElement.setAttribute('data-a63-input', 'touch')
    try {
      const view = viewButton.getBoundingClientRect()
      const menu = menuButton.getBoundingClientRect()
      if (Math.round(view.width) !== 32)
        throw new Error(`Expected a 32px button, got ${view.width}`)
      const apart = Math.abs(menu.left + menu.width / 2 - (view.left + view.width / 2))
      if (apart < 44) throw new Error(`Expected the button centres >= 44px apart, got ${apart}px`)
    } finally {
      canvasElement.removeAttribute('data-a63-input')
    }
  },
}

const selectedArgs = { defaultOpenId: 'INV-1044' }

export const SelectedWide: Story = { args: selectedArgs, globals: wideGlobals }

export const SelectedCompact: Story = { args: selectedArgs, globals: compactGlobals }

export const SelectedTablet: Story = { args: selectedArgs, globals: tabletGlobals }

export const SelectedPhone: Story = { args: selectedArgs, globals: responsivePhoneGlobals }

const emptyArgs = { defaultQuery: 'No matching invoice' }

export const EmptyWide: Story = { args: emptyArgs, globals: wideGlobals }

export const EmptyCompact: Story = { args: emptyArgs, globals: compactGlobals }

export const EmptyTablet: Story = { args: emptyArgs, globals: tabletGlobals }

export const EmptyPhone: Story = { args: emptyArgs, globals: responsivePhoneGlobals }

const progressArgs = {
  operationStatus: (
    <OperationStatus
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

/* The overlay clears the bottom safe-area inset as well as its 16px margin. */
export const ProgressPhone: Story = {
  args: progressArgs,
  globals: responsivePhoneGlobals,
  play: async ({ canvasElement }) => {
    const overlay = canvasElement.querySelector<HTMLElement>('[role="status"][data-slot="alert"]')
    if (!overlay) throw new Error('Expected the operation status')
    overlay.style.setProperty('--a63-safe-area-bottom', '31px')
    try {
      const bottom = getComputedStyle(overlay).bottom
      if (bottom !== '47px')
        throw new Error(`Expected bottom 47px with a 31px inset, got ${bottom}`)
    } finally {
      overlay.style.removeProperty('--a63-safe-area-bottom')
    }
  },
}

const successArgs = {
  operationStatus: (
    <OperationStatus
      description="The new invoices are ready to review."
      title="12 invoices imported"
      variant="success"
    />
  ),
}

export const SuccessWide: Story = { args: successArgs, globals: wideGlobals }

export const SuccessCompact: Story = { args: successArgs, globals: compactGlobals }

export const SuccessTablet: Story = { args: successArgs, globals: tabletGlobals }

export const SuccessPhone: Story = { args: successArgs, globals: responsivePhoneGlobals }

/* Nothing to list yet: the empty state repeats the header's action as an outline button, so the view keeps one primary. */
export const NoInvoices: Story = {
  args: { invoices: [] },
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByText('No invoices yet')
    const primaries = canvasElement.querySelectorAll('[data-slot="button"][data-variant="primary"]')
    if (primaries.length !== 1) {
      throw new Error(`Expected one primary Button in the view, found ${primaries.length}`)
    }
  },
}

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

const loadingArgs = { loading: true }

export const LoadingWide: Story = { args: loadingArgs, globals: wideGlobals }

export const LoadingCompact: Story = { args: loadingArgs, globals: compactGlobals }

export const LoadingTablet: Story = { args: loadingArgs, globals: tabletGlobals }

/* While loading, placeholder rows stand in for the table and are announced as a status. */
export const LoadingPhone: Story = {
  args: loadingArgs,
  globals: responsivePhoneGlobals,
  play: async ({ canvas }) => {
    await canvas.findByRole('status', { name: 'Loading' })
  },
}

const errorArgs = {
  error: {
    description: 'The invoices could not be loaded. Check your connection and try again.',
    onRetry: () => {},
    title: 'Invoices did not load',
  },
}

export const ErrorWide: Story = { args: errorArgs, globals: wideGlobals }

export const ErrorCompact: Story = { args: errorArgs, globals: compactGlobals }

export const ErrorTablet: Story = { args: errorArgs, globals: tabletGlobals }

/* A failed load replaces the rows with an alert and a retry. */
export const ErrorPhone: Story = {
  args: errorArgs,
  globals: responsivePhoneGlobals,
  play: async ({ canvas }) => {
    const alert = await canvas.findByRole('alert')
    within(alert).getByRole('button', { name: 'Try again' })
  },
}

/* The empty state's "Clear filters" leaves with the filters, so focus moves to the search field. */
export const ClearFromEmpty: Story = {
  args: emptyArgs,
  play: async ({ canvas, userEvent }) => {
    const empty = await canvas.findByText('No matching invoices')
    const clear = within(empty.closest('[data-slot="empty"]') as HTMLElement).getByRole('button', {
      name: 'Clear filters',
    })
    clear.focus()
    await userEvent.keyboard('{Enter}')
    const search = canvas.getByRole('searchbox', { name: 'Search invoices' })
    if (search.ownerDocument.activeElement !== search) {
      throw new Error('Expected focus on the search field after clearing')
    }
  },
}

/* Right to left on a phone, where the sidebar is a sheet: the row's view chevron points to the
   inline end, which is the left. */
export const RightToLeftPhone: Story = {
  globals: responsivePhoneGlobals,
  render: args => (
    <UIProvider dir="rtl" lang="ar">
      <ListPage {...args} />
    </UIProvider>
  ),
  play: async ({ canvas }) => {
    const view = await canvas.findByRole('button', { name: 'View INV-1044' })
    const icon = view.querySelector('svg')
    if (!icon) throw new Error('Expected the chevron')
    if (!getComputedStyle(icon).scale.startsWith('-1')) {
      throw new Error(`Expected the chevron mirrored, got scale ${getComputedStyle(icon).scale}`)
    }
  },
}
