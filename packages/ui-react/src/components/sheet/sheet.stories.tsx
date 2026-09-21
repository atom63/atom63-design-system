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
import { type ComponentProps, useRef } from 'react'

const sides = ['right', 'left', 'top', 'bottom'] as const
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
          color: 'var(--a63-text-primary)',
          display: 'flex',
          gap: 12,
          minHeight: 72,
          padding: 12,
        }}
      >
        <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>
          {label}
        </span>
        <Sheet>
          <SheetTrigger render={<Button variant="secondary">Open sheet</Button>} />
          <SheetContent
            portalProps={{ container: portalContainerRef }}
            side="right"
            variant="inset"
          >
            <SheetHeader>
              <SheetTitle>Appearance</SheetTitle>
              <SheetDescription>A raised overlay surface tinted by this context.</SheetDescription>
            </SheetHeader>
            <SheetPanel>
              <p style={{ color: 'var(--a63-text-secondary)' }}>
                Content scrolls inside the panel.
              </p>
            </SheetPanel>
            <SheetFooter>
              <SheetClose render={<Button variant="secondary">Cancel</Button>} />
              <SheetClose render={<Button variant="primary">Save</Button>} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
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

export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {sides.map(side => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="secondary">{side}</Button>} />
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Side: {side}</SheetTitle>
              <SheetDescription>The panel anchors to the {side} edge.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}

export const Inset: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="secondary">Open inset sheet</Button>} />
      <SheetContent side="right" variant="inset">
        <SheetHeader>
          <SheetTitle>Inset variant</SheetTitle>
          <SheetDescription>A floating rounded card, inset from the edges.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

export const BareFooter: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="secondary">Open with bare footer</Button>} />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Bare footer</SheetTitle>
          <SheetDescription>The footer variant="bare" drops its chrome.</SheetDescription>
        </SheetHeader>
        <SheetFooter variant="bare">
          <SheetClose render={<Button variant="primary">Done</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
