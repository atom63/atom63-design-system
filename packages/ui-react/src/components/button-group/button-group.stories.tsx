import { buttonGroupContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  Input,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="secondary">Left</Button>
      <Button variant="secondary">Middle</Button>
      <Button variant="secondary">Right</Button>
    </ButtonGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="secondary">Top</Button>
      <Button variant="secondary">Middle</Button>
      <Button variant="secondary">Bottom</Button>
    </ButtonGroup>
  ),
}

/* A non-interactive text prefix welded to an action. */
export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>https://</ButtonGroupText>
      <Button variant="secondary">Copy</Button>
    </ButtonGroup>
  ),
}

/* A separator dividing two runs of actions. */
export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="secondary">Cut</Button>
      <Button variant="secondary">Copy</Button>
      <ButtonGroupSeparator />
      <Button variant="secondary">Paste</Button>
    </ButtonGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: 'flex-start', display: 'grid', gap: 12 }}>
      {(['xs', 'sm', 'default', 'lg', 'xl'] as const).map(size => (
        <ButtonGroup key={size} size={size}>
          <Button variant="secondary">One</Button>
          <Button variant="secondary">Two</Button>
          <Button variant="secondary">Three</Button>
        </ButtonGroup>
      ))}
    </div>
  ),
}

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
              <ButtonGroup>
                <Button type="button" variant="secondary">
                  Cut
                </Button>
                <Button type="button" variant="secondary">
                  Copy
                </Button>
                <Button type="button" variant="secondary">
                  Paste
                </Button>
              </ButtonGroup>
              <ButtonGroup size="icon-sm">
                <Button aria-pressed type="button" variant="ghost">
                  On
                </Button>
                <Button type="button" variant="ghost">
                  Off
                </Button>
                <Button type="button" variant="ghost">
                  Off
                </Button>
              </ButtonGroup>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Height parity — a group sits next to an Input at the same size; both resolve
   the same --a63-control-height ramp x density, so their heights line up. */
export const WithInput: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['default', 'sm', 'lg'] as const).map(size => (
        <div key={size} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 56 }}>
            {size}
          </span>
          <Input
            aria-label="Example text field"
            placeholder="Search…"
            size={size === 'default' ? 'md' : size}
            style={{ width: 180 }}
          />
          <ButtonGroup size={size}>
            <Button variant="secondary">Cut</Button>
            <Button variant="secondary">Copy</Button>
            <Button variant="secondary">Paste</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
}

/* The same welded action run reviewed against target host contexts. */
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
              {endpoint.label}
            </span>
            <ButtonGroup size={endpoint.label === 'Compact extension' ? 'sm' : 'default'}>
              <Button variant="secondary">Cut</Button>
              <Button variant="secondary">Copy</Button>
              <Button variant="secondary">Paste</Button>
            </ButtonGroup>
            <ButtonGroup size={endpoint.label === 'Compact extension' ? 'sm' : 'default'}>
              <Button variant="ghost">Bold</Button>
              <Button variant="ghost">Italic</Button>
              <Button variant="ghost">Under</Button>
            </ButtonGroup>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(buttonGroupContract, null, 2)}
    </pre>
  ),
}
