import { AlertTriangle, Inbox } from 'lucide-react'
import { emptyContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyErrorDetail,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toaster } from 'sonner'

const meta = {
  title: 'UI React/Empty',
  component: Empty,
  decorators: [
    Story => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

/* The canonical empty state: an icon chip, title, description + a primary CTA. */
export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>Create your first project to see it listed here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="primary">
            New project
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  ),
}

/* EmptyMedia default (no chip) vs. icon (a rounded muted chip). */
export const MediaVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Inbox aria-hidden style={{ height: 32, width: 32 }} />
          </EmptyMedia>
          <EmptyTitle>default</EmptyTitle>
        </EmptyHeader>
      </Empty>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox aria-hidden />
          </EmptyMedia>
          <EmptyTitle>icon</EmptyTitle>
        </EmptyHeader>
      </Empty>
    </div>
  ),
}

/* Error state: the collapsible EmptyErrorDetail with an embedded CopyButton. */
export const ErrorState: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>We couldn't load your data. Please try again.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="outline">
            Retry
          </Button>
          <EmptyErrorDetail
            error={'TypeError: Cannot read properties of undefined\n    at load (app.tsx:42)'}
          />
        </EmptyContent>
      </Empty>
    </div>
  ),
}

/* The empty state rendered across all 4 DS themes × light/dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={theme + mode} mode={mode} theme={theme}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.75rem',
                background: 'var(--a63-surface-panel)',
                color: 'var(--a63-text-primary)',
                borderRadius: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox aria-hidden />
                  </EmptyMedia>
                  <EmptyTitle>No projects yet</EmptyTitle>
                  <EmptyDescription>Create your first project to see it here.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm" variant="primary">
                    New project
                  </Button>
                </EmptyContent>
              </Empty>
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
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: { density: 'compact', designLanguage: 'web', input: 'pointer' } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'center',
              background: 'var(--a63-surface-page)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              padding: '0.75rem',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
              {endpoint.label}
            </span>
            <div style={{ flex: 1, maxWidth: 420 }}>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox aria-hidden />
                  </EmptyMedia>
                  <EmptyTitle>No projects yet</EmptyTitle>
                  <EmptyDescription>Create your first project to see it here.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm" variant="primary">
                    New project
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(emptyContract, null, 2)}
    </pre>
  ),
}
