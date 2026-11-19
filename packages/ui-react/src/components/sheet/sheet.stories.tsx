import { sheetContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
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

const sides = ['right', 'left', 'top', 'bottom'] as const
type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

/*
 * A fixed-height box that holds one open overlay. The transform makes the box
 * the containing block of the sheet's fixed-position backdrop and viewport, and
 * --a63-viewport-height sizes them to the box, so the sheet lays out as it
 * would over a short window. Staged sheets are non-modal: two open modal sheets
 * would each hide the other from assistive tech.
 */
function OverlayStage({
  children,
  height = 360,
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

function StagedSheet({
  footer = 'default',
  label,
  side = 'right',
  variant = 'default',
}: {
  footer?: 'default' | 'bare'
  label: string
  side?: (typeof sides)[number]
  variant?: 'default' | 'inset'
}) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      <OverlayStage>
        {container => (
          <Sheet defaultOpen modal={false}>
            <SheetContent
              initialFocus={false}
              portalProps={{ container }}
              side={side}
              variant={variant}
            >
              <SheetHeader>
                <SheetTitle>Appearance</SheetTitle>
                <SheetDescription>
                  A raised overlay surface tinted by this context.
                </SheetDescription>
              </SheetHeader>
              <SheetPanel>
                <p style={{ color: 'var(--a63-text-secondary)' }}>
                  Content scrolls inside the panel.
                </p>
              </SheetPanel>
              <SheetFooter variant={footer}>
                <SheetClose render={<Button variant="secondary">Cancel</Button>} />
                <SheetClose render={<Button variant="primary">Save</Button>} />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </OverlayStage>
    </div>
  )
}

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  return (
    <UIProvider {...providerProps}>
      <StagedSheet label={label} variant="inset" />
    </UIProvider>
  )
}

const meta = {
  title: 'UI React/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="secondary">Open sheet</Button>} />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Appearance</SheetTitle>
          <SheetDescription>Slides in from the edge. Press Esc to dismiss.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <p style={{ color: 'var(--a63-text-secondary)' }}>
            The sheet is a raised overlay surface. Content scrolls inside the panel.
          </p>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="secondary">Cancel</Button>} />
          <SheetClose render={<Button variant="primary">Save</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

/** The sheet open as an app shows it: modal, over the whole page. */
export const Open: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Appearance</SheetTitle>
          <SheetDescription>Slides in from the edge. Press Esc to dismiss.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <p style={{ color: 'var(--a63-text-secondary)' }}>
            The sheet is a raised overlay surface. Content scrolls inside the panel.
          </p>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="secondary">Cancel</Button>} />
          <SheetClose render={<Button variant="primary">Save</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

/** Each side, open. */
export const Sides: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {sides.map(side => (
        <StagedSheet key={side} label={side} side={side} />
      ))}
    </div>
  ),
}

export const Inset: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {sides.map(side => (
        <StagedSheet key={side} label={`inset / ${side}`} side={side} variant="inset" />
      ))}
    </div>
  ),
}

export const BareFooter: Story = {
  render: () => <StagedSheet footer="bare" label="bare footer" />,
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
      <ReviewCell label="Web" providerProps={{ designLanguage: 'web', input: 'pointer' }} />
      <ReviewCell label="iOS touch" providerProps={{ designLanguage: 'ios', input: 'touch' }} />
      <ReviewCell
        label="Compact extension"
        providerProps={{ density: 'compact', designLanguage: 'web', input: 'pointer' }}
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(sheetContract, null, 2)}
    </pre>
  ),
}
