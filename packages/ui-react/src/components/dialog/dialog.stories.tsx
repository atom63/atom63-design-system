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
import {
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useRef,
} from 'react'

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

/*
 * `open` renders the dialog open on load so the visual and axe runs capture the
 * popup, not the trigger. `modal` is the dialog as an app shows it, over the
 * whole page (one per story). `inline` is non-modal and belongs inside an
 * OverlayStage, so several open dialogs can share one capture: two open modal
 * dialogs would each hide the other from assistive tech.
 */
type OpenMode = 'modal' | 'inline'

function RenameDialog({
  open,
  portalContainerRef,
  size = 'md',
  triggerLabel = 'Rename project',
}: {
  open?: OpenMode
  portalContainerRef?: RefObject<HTMLDivElement | null>
  size?: (typeof dialogSizes)[number]
  triggerLabel?: string
}) {
  return (
    <Dialog defaultOpen={open !== undefined} modal={open === 'inline' ? false : undefined}>
      {open ? null : <DialogTrigger render={<Button variant="outline">{triggerLabel}</Button>} />}
      <DialogPopup
        initialFocus={open === 'inline' ? false : undefined}
        portalProps={{ container: portalContainerRef }}
        size={size}
      >
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

/* A labelled stage cell. It paints its own panel surface so the label reads
   against the cell's theme and mode, not the light page behind the story. */
const cellStyle: CSSProperties = {
  background: 'var(--a63-surface-panel)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--a63-text-primary)',
  display: 'grid',
  gap: 6,
  padding: 12,
}

/*
 * A fixed-height box that holds one open overlay. The transform makes the box
 * the containing block of the popup's fixed-position backdrop and viewport, and
 * --a63-viewport-height sizes them to the box, so the overlay lays out as it
 * would over a short window.
 */
function OverlayStage({
  children,
  height = 340,
}: {
  children: (container: RefObject<HTMLDivElement | null>) => ReactNode
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={containerRef}
      style={
        {
          '--a63-viewport-height': `${height}px`,
          background: 'var(--a63-surface-page)',
          blockSize: height,
          borderRadius: 'var(--radius-lg)',
          color: 'var(--a63-text-primary)',
          overflow: 'hidden',
          position: 'relative',
          transform: 'translateZ(0)',
        } as CSSProperties
      }
    >
      {children(containerRef)}
    </div>
  )
}

type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  return (
    <UIProvider {...providerProps}>
      <div style={cellStyle}>
        <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>{label}</span>
        <OverlayStage>
          {container => <RenameDialog open="inline" portalContainerRef={container} />}
        </OverlayStage>
      </div>
    </UIProvider>
  )
}

export const Playground: Story = {
  render: () => <RenameDialog triggerLabel="Open dialog" />,
}

/** The dialog open as an app shows it: modal, centred over the page. */
export const Open: Story = {
  render: () => <RenameDialog open="modal" />,
}

/** Below `sm` the default popup sticks to the bottom edge. */
export const OpenPhone: Story = {
  render: () => <RenameDialog open="modal" />,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      {dialogSizes.map(size => (
        <div key={size} style={cellStyle}>
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>{size}</span>
          <OverlayStage>
            {container => <RenameDialog open="inline" portalContainerRef={container} size={size} />}
          </OverlayStage>
        </div>
      ))}
    </div>
  ),
}

export const BareFooter: Story = {
  render: () => (
    <Dialog defaultOpen>
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
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
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
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
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
