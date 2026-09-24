import { alertContract, alertVariants, themes } from '@atom63/ui-foundation'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import { Info } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <Alert style={{ maxWidth: 420 }}>
      <AlertIcon>
        <Info aria-hidden />
      </AlertIcon>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>This is a neutral, default alert callout.</AlertDescription>
    </Alert>
  ),
}

/* Every semantic tone. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
      {alertVariants.map(variant => (
        <Alert key={variant} variant={variant}>
          <AlertIcon>
            <Info aria-hidden />
          </AlertIcon>
          <AlertTitle style={{ textTransform: 'capitalize' }}>{variant}</AlertTitle>
          <AlertDescription>The {variant} tone recolors border, fill, and icon.</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
}

/* With a trailing action slot. */
export const WithAction: Story = {
  render: () => (
    <Alert style={{ maxWidth: 460 }} variant="warning">
      <AlertIcon>
        <Info aria-hidden />
      </AlertIcon>
      <AlertTitle>Unsaved changes</AlertTitle>
      <AlertDescription>Your edits will be lost if you leave.</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="ghost">
          Discard
        </Button>
      </AlertAction>
    </Alert>
  ),
}

/* Action treatment across every alert tone. */
export const ActionVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
      {alertVariants.map(variant => (
        <Alert key={variant} variant={variant}>
          <AlertIcon>
            <Info aria-hidden />
          </AlertIcon>
          <AlertTitle style={{ textTransform: 'capitalize' }}>{variant}</AlertTitle>
          <AlertDescription>
            The action button inherits the {variant} alert tone inside the action slot.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" variant="ghost">
              Review
            </Button>
          </AlertAction>
        </Alert>
      ))}
    </div>
  ),
}

/* Renders across all 4 DS themes × light/dark. */
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
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Alert style={{ flex: 1 }} variant="info">
                <AlertIcon>
                  <Info aria-hidden />
                </AlertIcon>
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>Status tones recolor per theme.</AlertDescription>
              </Alert>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same alert reviewed against target host contexts. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
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
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              background: 'var(--a63-surface-panel)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.68 }}>{endpoint.label}</div>
            <Alert variant="info">
              <AlertIcon>
                <Info aria-hidden />
              </AlertIcon>
              <AlertTitle>Endpoint fit</AlertTitle>
              <AlertDescription>
                The same Alert should keep its status-surface intent in this host context.
              </AlertDescription>
              <AlertAction>
                <Button size="sm" variant="ghost">
                  Review
                </Button>
              </AlertAction>
            </Alert>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(alertContract, null, 2)}
    </pre>
  ),
}
