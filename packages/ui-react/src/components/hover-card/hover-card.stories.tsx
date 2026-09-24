import { hoverCardContract, themes } from '@atom63/ui-foundation'
import { HoverCard, HoverCardContent, HoverCardTrigger, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ComponentProps, useRef } from 'react'
import { pendingContrastReview } from '../story-probes'

/* Shared preview body — the popup surface that reskins per theme. */
function CardBody() {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <strong style={{ color: 'var(--a63-text-primary)' }}>You Zhang</strong>
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 13 }}>
        Design Engineer — builds the design system in code.
      </span>
    </div>
  )
}

const meta = {
  title: 'UI React/HoverCard',
  component: HoverCard,
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

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
          minHeight: 88,
          padding: 12,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
          {label}
        </span>
        <HoverCard>
          <HoverCardTrigger
            render={
              <a href="#a" style={{ color: 'var(--a63-action-primary)' }}>
                @atom63
              </a>
            }
          />
          <HoverCardContent portalContainer={portalContainerRef} side="right">
            <CardBody />
          </HoverCardContent>
        </HoverCard>
      </div>
    </UIProvider>
  )
}

/* Hover the trigger to reveal the overlay-archetype popover (elevation from the
   --a63-overlay-shadow lever — themes reskin it, like the Select popup). */
export const Playground: Story = {
  parameters: pendingContrastReview,
  render: () => (
    <div style={{ padding: 80 }}>
      <HoverCard>
        <HoverCardTrigger
          render={
            <a href="#a" style={{ color: 'var(--a63-action-primary)' }}>
              @atom63
            </a>
          }
        />
        <HoverCardContent>
          <CardBody />
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
}

/* Each popup stays inside its theme cell's portal container so the overlay
   inherits the same theme and endpoint context as its trigger. */
export const Themes: Story = {
  parameters: pendingContrastReview,
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
      {JSON.stringify(hoverCardContract, null, 2)}
    </pre>
  ),
}
