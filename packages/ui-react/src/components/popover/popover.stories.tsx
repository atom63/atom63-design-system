import { popoverContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  Popover,
  PopoverAnchor,
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
import { type CSSProperties, type ComponentProps, type ReactNode, useState } from 'react'

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

/*
 * A labelled cell that holds one OPEN popover. The popup portals into the cell
 * and the cell reserves room below the trigger, so several open popovers share
 * one capture without covering each other. `side` and `children` let a cell show
 * another placement or content.
 */
function ReviewCell({
  children,
  height = 200,
  label,
  side = 'bottom',
  triggerLabel = 'Open',
}: {
  children?: ReactNode
  height?: number
  label: string
  side?: ComponentProps<typeof PopoverContent>['side']
  triggerLabel?: string
}) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  return (
    <div
      ref={setNode}
      style={{
        alignItems: 'flex-start',
        background: 'var(--a63-surface-panel)',
        borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        minBlockSize: height,
        padding: '0.75rem',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>{label}</span>
      {node ? (
        <PortalContainerProvider container={node}>
          <Popover defaultOpen modal={false}>
            <PopoverTrigger render={<Button variant="outline">{triggerLabel}</Button>} />
            <PopoverContent align="start" initialFocus={false} side={side}>
              {children ?? <ShareContent />}
            </PopoverContent>
          </Popover>
        </PortalContainerProvider>
      ) : null}
    </div>
  )
}

function ShareContent() {
  return (
    <>
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
    </>
  )
}

const reviewGrid: CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(24rem, 1fr))',
  inlineSize: '100%',
}

/* The open popover across all four themes x light/dark, each in its own cell. */
export const Themes: Story = {
  render: () => (
    <div style={reviewGrid}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <ReviewCell label={`${theme} / ${mode}`} />
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Keyboard focus on the popup's Done button, beside a popover at rest. */
export const FocusVisible: Story = {
  render: () => (
    <div style={reviewGrid}>
      <ReviewCell label="at rest" />
      <ReviewCell label="focused">
        <PopoverHeader>
          <PopoverTitle>Share link</PopoverTitle>
          <PopoverDescription>Anyone with the link can view.</PopoverDescription>
        </PopoverHeader>
        <PopoverClose
          render={
            <Button data-focus-target="" size="sm" variant="primary">
              Done
            </Button>
          }
        />
      </ReviewCell>
    </div>
  ),
  parameters: { visualState: { focusVisible: '[data-focus-target]' } },
}

/* A popup positioned against a PopoverAnchor (the field) instead of its trigger
   (the icon button beside it). */
export const CustomAnchor: Story = {
  render: () => {
    const [node, setNode] = useState<HTMLElement | null>(null)
    return (
      <div ref={setNode} style={{ minBlockSize: 220, position: 'relative' }}>
        {node ? (
          <PortalContainerProvider container={node}>
            <Popover defaultOpen modal={false}>
              <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                <PopoverAnchor
                  style={{
                    border: 'var(--a63-control-border-width) solid var(--a63-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--a63-text-secondary)',
                    inlineSize: 240,
                    padding: '0.5rem 0.75rem',
                  }}
                >
                  atom63.example/share/q3
                </PopoverAnchor>
                <PopoverTrigger render={<Button variant="outline">Share</Button>} />
              </div>
              <PopoverContent align="start" initialFocus={false}>
                <ShareContent />
              </PopoverContent>
            </Popover>
          </PortalContainerProvider>
        ) : null}
      </div>
    )
  },
}

/* Right-to-left on the inline-end side (the left edge here), with an unbroken
   URL that wraps inside the panel instead of running out of it. */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl" lang="ar" style={{ inlineSize: '100%' }}>
      <ReviewCell height={220} label="rtl / ar" side="inline-end" triggerLabel="مشاركة">
        <PopoverHeader>
          <PopoverTitle>مشاركة الرابط</PopoverTitle>
          <PopoverDescription>
            https://atom63.example/projects/quarterly-review/attachments/very-long-file-name.pdf
          </PopoverDescription>
        </PopoverHeader>
        <PopoverClose
          render={
            <Button size="sm" variant="primary">
              تم
            </Button>
          }
        />
      </ReviewCell>
    </UIProvider>
  ),
}

/* At phone width on touch, with the trigger at the inline end: the popup stays
   on screen. */
export const OpenPhone: Story = {
  render: () => {
    const [node, setNode] = useState<HTMLElement | null>(null)
    return (
      <UIProvider designLanguage="ios" input="touch" style={{ inlineSize: '100%' }}>
        <div
          ref={setNode}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            minBlockSize: 240,
            position: 'relative',
          }}
        >
          {node ? (
            <PortalContainerProvider container={node}>
              <Popover defaultOpen modal={false}>
                <PopoverTrigger render={<Button variant="outline">Share</Button>} />
                <PopoverContent align="end" collisionPadding={16} initialFocus={false}>
                  <ShareContent />
                </PopoverContent>
              </Popover>
            </PortalContainerProvider>
          ) : null}
        </div>
      </UIProvider>
    )
  },
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
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
  return <ReviewCell label={label} />
}
