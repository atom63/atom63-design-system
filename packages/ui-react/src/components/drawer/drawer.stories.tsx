import { drawerContract, drawerDirections, themes } from '@atom63/ui-foundation'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ComponentProps, useState } from 'react'

const meta = {
  title: 'UI React/Drawer',
  component: Drawer,
  argTypes: {
    direction: { control: 'inline-radio', options: drawerDirections },
  },
  args: { direction: 'bottom' },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

function DrawerDemo({ portalContainer }: { portalContainer?: HTMLElement | null }) {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="secondary">Open drawer</Button>} />
      <DrawerContent portalProps={{ container: portalContainer }}>
        <DrawerHeader>
          <DrawerTitle>Appearance</DrawerTitle>
          <DrawerDescription>Drag the handle down to dismiss.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          The drawer body owns scrolling and keeps the header and actions anchored.
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="primary">Done</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null)

  return (
    <UIProvider {...providerProps}>
      <div
        ref={setPortalContainer}
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
        <DrawerDemo portalContainer={portalContainer} />
      </div>
    </UIProvider>
  )
}

export const Playground: Story = {
  render: args => (
    <Drawer {...args}>
      <DrawerTrigger render={<Button variant="secondary">Open drawer</Button>} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Appearance</DrawerTitle>
          <DrawerDescription>Drag the handle down to dismiss.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody style={{ color: 'var(--a63-text-secondary)' }}>
          The sheet is a raised overlay surface. Content scrolls inside.
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="primary">Done</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

/* The four drawer directions. */
export const Directions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      {drawerDirections.map(direction => (
        <Drawer direction={direction} key={direction}>
          <DrawerTrigger render={<Button variant="secondary">{direction}</Button>} />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{direction} drawer</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>Direction: {direction}</DrawerBody>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
}

/*
 * The drawer content renders in a portal (raised overlay surface), so a matrix of
 * open sheets would stack over the whole page rather than read per-theme. The
 * always-visible, in-flow part is the trigger, so each theme cell renders a live
 * drawer whose trigger shows the token-driven chrome across all 4 DS themes.
 */
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
      {JSON.stringify(drawerContract, null, 2)}
    </pre>
  ),
}
