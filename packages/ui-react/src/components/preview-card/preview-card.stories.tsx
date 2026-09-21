import { previewCardContract, themes } from '@atom63/ui-foundation'
import { PreviewCard, PreviewCardPopup, PreviewCardTrigger, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ComponentProps, useRef } from 'react'

const meta = {
  title: 'UI React/PreviewCard',
  component: PreviewCard,
  decorators: [
    Story => (
      <div style={{ padding: 96, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PreviewCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <p style={{ color: 'var(--a63-text-primary)' }}>
      Follow{' '}
      <PreviewCard>
        <PreviewCardTrigger
          render={
            <a href="https://atom63.io" style={{ color: 'var(--a63-action-primary)' }}>
              @atom63
            </a>
          }
        />
        <PreviewCardPopup>
          <strong>ATOM63</strong>
          <span style={{ color: 'var(--a63-text-secondary)' }}>
            Design engineering, tokens, and a React-first design system.
          </span>
        </PreviewCardPopup>
      </PreviewCard>{' '}
      for more.
    </p>
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
            mode={mode}
            theme={theme}
          />
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ReviewCell designLanguage="web" input="pointer" label="Web" />
      <ReviewCell designLanguage="ios" input="touch" label="iOS touch" />
      <ReviewCell
        density="compact"
        designLanguage="web"
        input="pointer"
        label="Compact extension"
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(previewCardContract, null, 2)}
    </pre>
  ),
}

type ReviewCellProps = Omit<ComponentProps<typeof UIProvider>, 'children'> & { label: string }

function ReviewCell({ label, ...providerProps }: ReviewCellProps) {
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
          padding: 12,
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{label}</span>
        <PreviewCard defaultOpen>
          <PreviewCardTrigger
            render={
              <a href="https://atom63.io" style={{ color: 'var(--a63-action-primary)' }}>
                @atom63
              </a>
            }
          />
          <PreviewCardPopup portalContainer={portalContainerRef}>
            <strong>ATOM63</strong>
            <span style={{ color: 'var(--a63-text-secondary)' }}>
              Design engineering, tokens, and a React-first design system.
            </span>
          </PreviewCardPopup>
        </PreviewCard>
      </div>
    </UIProvider>
  )
}
