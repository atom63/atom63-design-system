import {
  badgeContract,
  badgePaletteVariants,
  badgeSizes,
  badgeVariants,
  themes,
} from '@atom63/ui-foundation'
import { Badge, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Badge',
  component: Badge,
  tags: ['!autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: badgeVariants },
    size: { control: 'inline-radio', options: badgeSizes },
  },
  args: { children: 'Badge', variant: 'default', size: 'md' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const SOLID = ['default', 'primary', 'secondary', 'destructive', 'outline', 'glass'] as const
const SURFACE = ['muted', 'accent'] as const
const SEMANTIC = ['error', 'info', 'success', 'warning'] as const

function Row({
  label,
  items,
}: {
  label: string
  items: readonly (typeof badgeVariants)[number][]
}) {
  return (
    <div>
      <p style={{ color: 'var(--a63-text-secondary)', fontSize: 12, marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {items.map(variant => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>
    </div>
  )
}

/* All 12 variants, grouped as the app's badges-section does (solid/surface + semantic). */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Row items={SOLID} label="Solid & surface" />
      <Row items={SURFACE} label="Surface" />
      <Row items={SEMANTIC} label="Semantic" />
    </div>
  ),
}

/* The full Tailwind palette, backed by foundation --color-* tokens (works without
   Tailwind). These back category/tag colors (e.g. the card's resource tags). */
export const Palette: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {badgePaletteVariants.map(variant => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {badgeSizes.map(size => (
        <Badge key={size} size={size} variant="primary">
          {size}
        </Badge>
      ))}
    </div>
  ),
}

export const Interactive: Story = {
  render: () => (
    <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Badge render={<button type="button" />} variant="primary">
        Filter
      </Badge>
      <Badge render={<a aria-label="Link badge" href="#badge-link" />} variant="outline">
        Link badge
      </Badge>
      <Badge aria-disabled="true" render={<button type="button" />} variant="muted">
        Disabled
      </Badge>
    </div>
  ),
}

/* Marker theming: the keycap bevel (`--a63-marker-shadow`) varies per theme —
   retro Win98 bevel, aqua glass, modern/terminal flat — while variant fills
   recolor per brand + theme. */
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
                display: 'flex',
                gap: 8,
                padding: '0.75rem',
              }}
            >
              <span
                style={{
                  color: 'var(--a63-text-secondary)',
                  fontSize: 12,
                  opacity: 0.7,
                  width: 96,
                }}
              >
                {theme} / {mode}
              </span>
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same marker reviewed against target host contexts. */
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
              gap: 8,
              padding: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>
              {endpoint.label}
            </span>
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge render={<button type="button" />} variant="outline">
              Interactive
            </Badge>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(badgeContract, null, 2)}
    </pre>
  ),
}
