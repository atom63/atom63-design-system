import { loadMoreTriggerContract, loadMoreTriggerVariants, themes } from '@atom63/ui-foundation'
import { Button, LoadMoreTrigger, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/LoadMoreTrigger',
  component: LoadMoreTrigger,
  argTypes: {
    variant: { control: 'inline-radio', options: loadMoreTriggerVariants },
    state: {
      control: 'select',
      options: loadMoreTriggerContract.states.filter(state => state !== 'custom'),
    },
    hasMore: { control: 'boolean' },
    isLoading: { control: 'boolean' },
  },
  args: { hasMore: true, isLoading: false, variant: 'default' },
} satisfies Meta<typeof LoadMoreTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* Explicit state API uses the shared state-tone contract. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <LoadMoreTrigger state="idle" />
      <LoadMoreTrigger state="loading" />
      <LoadMoreTrigger onRetry={() => {}} state="failed" />
      <LoadMoreTrigger state="exhausted" />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {loadMoreTriggerVariants.map(variant => (
        <LoadMoreTrigger hasMore isLoading key={variant} variant={variant} />
      ))}
    </div>
  ),
}

export const Exhausted: Story = {
  args: { state: 'exhausted' },
}

export const Failed: Story = {
  args: { onRetry: () => {}, state: 'failed' },
}

/* Custom children take over the row entirely (e.g. a manual "Load more" button). */
export const CustomChildren: Story = {
  render: () => (
    <LoadMoreTrigger hasMore isLoading={false}>
      <Button type="button" variant="secondary">
        Load more
      </Button>
    </LoadMoreTrigger>
  ),
}

/* The loading row (spinner + message) across all 4 DS themes × light/dark. */
export const Themes: Story = {
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
              <LoadMoreTrigger hasMore isLoading />
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
        <EndpointTrigger label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointTrigger label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointTrigger label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(loadMoreTriggerContract, null, 2)}
    </pre>
  ),
}

function EndpointTrigger({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        paddingInline: 12,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>{label}</span>
      <LoadMoreTrigger hasMore isLoading variant="prominent" />
    </div>
  )
}
