import { popoverContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  PortalContainerProvider,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { pendingContrastReview } from '../story-probes'

const meta = {
  title: 'UI React/Popover',
  component: Popover,
  decorators: [
    Story => (
      <div style={{ display: 'flex', gap: 24, padding: 64 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>Share link</PopoverTitle>
          <PopoverDescription>Anyone with the link can view.</PopoverDescription>
        </PopoverHeader>
        <PopoverClose
          render={
            <Button size="sm" variant="primary">
              Done
            </Button>
          }
        />
      </PopoverContent>
    </Popover>
  ),
}

const SIDES = ['top', 'right', 'bottom', 'left'] as const

export const Sides: Story = {
  render: () => (
    <>
      {SIDES.map(side => (
        <Popover key={side}>
          <PopoverTrigger render={<Button variant="outline">{side}</Button>} />
          <PopoverContent side={side}>
            <PopoverTitle>Popover on {side}</PopoverTitle>
          </PopoverContent>
        </Popover>
      ))}
    </>
  ),
}

// Keeps the open popup inside its themed cell (Base UI Popover portals by
// default) so every theme renders its own overlay surface inline.
function ThemeCell() {
  const [node, setNode] = useState<HTMLElement | null>(null)
  return (
    <div ref={setNode} style={{ position: 'relative' }}>
      <PortalContainerProvider container={node}>
        <Popover defaultOpen>
          <PopoverTrigger render={<Button variant="outline">Open</Button>} />
          <PopoverContent align="start" side="bottom">
            <PopoverHeader>
              <PopoverTitle>Share link</PopoverTitle>
              <PopoverDescription>Anyone with the link can view.</PopoverDescription>
            </PopoverHeader>
            <PopoverClose
              render={
                <Button size="sm" variant="primary">
                  Done
                </Button>
              }
            />
          </PopoverContent>
        </Popover>
      </PortalContainerProvider>
    </div>
  )
}

export const Themes: Story = {
  parameters: pendingContrastReview,
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <ThemeCell />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointPopover label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointPopover label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointPopover label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(popoverContract, null, 2)}
    </pre>
  ),
}

function EndpointPopover({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        padding: 12,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>{label}</span>
      <ThemeCell />
    </div>
  )
}
