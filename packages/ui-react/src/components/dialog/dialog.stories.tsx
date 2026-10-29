import { dialogContract, dialogSizes, themes } from '@atom63/ui-foundation'
import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ComponentProps, type RefObject, useRef } from 'react'

const meta = {
  title: 'UI React/Dialog',
  component: Dialog,
  decorators: [
    Story => (
      <div style={{ display: 'flex', gap: 24, padding: 48 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

function RenameDialog({
  portalContainerRef,
  size = 'default',
  triggerLabel = 'Rename project',
}: {
  portalContainerRef?: RefObject<HTMLDivElement | null>
  size?: (typeof dialogSizes)[number]
  triggerLabel?: string
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">{triggerLabel}</Button>} />
      <DialogPopup portalProps={{ container: portalContainerRef }} size={size}>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>Give this project a new, memorable name.</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <p style={{ margin: 0 }}>Any content can live in the scrollable panel.</p>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <DialogClose render={<Button variant="primary">Save</Button>} />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  const portalContainerRef = useRef<HTMLDivElement>(null)

  return (
    <UIProvider {...providerProps}>
      <div
        ref={portalContainerRef}
        style={{
          alignItems: 'center',
          background: 'var(--a63-surface-panel)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--a63-text-primary)',
          display: 'flex',
          gap: 12,
          padding: '0.75rem',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
          {label}
        </span>
        <RenameDialog portalContainerRef={portalContainerRef} />
      </div>
    </UIProvider>
  )
}

export const Playground: Story = {
  render: () => <RenameDialog triggerLabel="Open dialog" />,
}

async function openDialog(canvasElement: HTMLElement, triggerLabel: string) {
  const canvas = within(canvasElement)
  const body = within(canvasElement.ownerDocument.body)
  const user = userEvent.setup()

  await user.click(canvas.getByRole('button', { name: triggerLabel }))
  const dialog = await body.findByRole('dialog', { name: 'Rename project' })
  if (dialog.getClientRects().length === 0) throw new Error('Expected the dialog to be visible')

  return { body, canvas, user }
}

/** Opens, closes and reopens through real pointer interactions, then leaves the popup visible. */
export const Open: Story = {
  render: () => <RenameDialog triggerLabel="Open dialog" />,
  play: async ({ canvasElement }) => {
    const { body, canvas, user } = await openDialog(canvasElement, 'Open dialog')

    await user.click(body.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      if (body.queryByRole('dialog', { name: 'Rename project' })) {
        throw new Error('Expected the dialog to close before reopening')
      }
    })

    await user.click(canvas.getByRole('button', { name: 'Open dialog' }))
    const dialog = await body.findByRole('dialog', { name: 'Rename project' })
    if (dialog.getClientRects().length === 0) {
      throw new Error('Expected the reopened dialog to be visible')
    }
  },
}

/** A portalled popup that must keep the tokens from its scoped dark provider. */
export const OpenDark: Story = {
  render: () => (
    <ReviewCell label="modern / dark" providerProps={{ mode: 'dark', theme: 'modern' }} />
  ),
  play: async ({ canvasElement }) => {
    await openDialog(canvasElement, 'Rename project')
  },
}

/** The `Phone` suffix gives this opened story a 390px visual-regression viewport. */
export const OpenPhone: Story = {
  render: () => <RenameDialog triggerLabel="Open dialog" />,
  play: async ({ canvasElement }) => {
    await openDialog(canvasElement, 'Open dialog')
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {dialogSizes.map(size => (
        <RenameDialog key={size} size={size} triggerLabel={size} />
      ))}
    </div>
  ),
}

export const BareFooter: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Open</Button>} />
      <DialogPopup mobilePlacement="center">
        <DialogHeader>
          <DialogTitle>Centered on mobile</DialogTitle>
          <DialogDescription>This popup stays centered at every breakpoint.</DialogDescription>
        </DialogHeader>
        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="primary">Got it</Button>} />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ReviewCell
            key={`${theme}-${mode}`}
            label={`${theme} / ${mode}`}
            providerProps={{ mode, theme }}
          />
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ReviewCell
        label="Web"
        providerProps={{ density: 'comfortable', designLanguage: 'web', input: 'pointer' }}
      />
      <ReviewCell
        label="iOS touch"
        providerProps={{ density: 'comfortable', designLanguage: 'ios', input: 'touch' }}
      />
      <ReviewCell
        label="Compact extension"
        providerProps={{
          density: 'compact',
          designLanguage: 'web',
          input: 'pointer',
          surface: 'n2',
        }}
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(dialogContract, null, 2)}
    </pre>
  ),
}
