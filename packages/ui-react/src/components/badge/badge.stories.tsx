import {
  badgeContract,
  badgeDotColors,
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

/* A leading dot carries a category color on any variant: outline labels with
   colored dots, as in an issue list. `dot` alone follows the text color. */
export const Dot: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {badgeDotColors.map(color => (
          <Badge dot={color} key={color} variant="outline">
            {color}
          </Badge>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Badge dot variant="success">
          Live
        </Badge>
        <Badge dot="violet" size="sm" variant="muted">
          Feature
        </Badge>
        <Badge dot="amber" size="lg" variant="outline">
          Research
        </Badge>
      </div>
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
/* An interactive badge beside one at rest. The visual project puts the first
   one in the story's state (parameters.visualState, see apps/storybook/README.md). */
function InteractivePair() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <Badge render={<button type="button" />} variant="outline">
        Target
      </Badge>
      <Badge render={<button type="button" />} variant="outline">
        At rest
      </Badge>
    </div>
  )
}

/* The visual project hovers the first interactive badge with the real pointer. */
export const InteractiveHover: Story = {
  render: () => <InteractivePair />,
  parameters: { visualState: { hover: 'button.a63-Badge' } },
}

/* The visual project tabs to the first interactive badge: the focus-visible ring. */
export const InteractiveFocusVisible: Story = {
  render: () => <InteractivePair />,
  parameters: { visualState: { focusVisible: 'button.a63-Badge' } },
}

/* Long, CJK and right-to-left labels in a narrow column: each badge stops at the
   column edge and truncates with an ellipsis; the full text stays readable to AT. */
export const LongLabels: Story = {
  render: () => (
    <div
      data-testid="long-badges"
      style={{ display: 'grid', gap: 8, justifyItems: 'start', width: 160 }}
    >
      <Badge>Short</Badge>
      <Badge variant="info">Benachrichtigungseinstellungen aktualisiert</Badge>
      <Badge dot="green" variant="outline">
        通知设置已同步到所有设备
      </Badge>
      <div dir="rtl" style={{ display: 'grid', justifyItems: 'start', width: '100%' }}>
        <Badge variant="success">تمت مزامنة الإعدادات مع جميع الأجهزة</Badge>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const column = canvasElement.querySelector<HTMLElement>('[data-testid="long-badges"]')
    if (!column) throw new Error('Missing the long-badges column')
    const edge = column.getBoundingClientRect()
    const labels = column.querySelectorAll<HTMLElement>('[data-slot="badge-label"]')
    if (labels.length !== 4) throw new Error(`Expected 4 badge labels, found ${labels.length}`)
    for (const label of [...labels].slice(1)) {
      const badge = label.closest<HTMLElement>('[data-slot="badge"]')
      const box = badge?.getBoundingClientRect()
      if (!box || box.left < edge.left - 1 || box.right > edge.right + 1)
        throw new Error(`A long badge overflows its column: "${label.textContent}"`)
      if (label.scrollWidth <= label.clientWidth)
        throw new Error(`A long badge label does not truncate: "${label.textContent}"`)
    }
  },
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
                display: 'flex',
                gap: 8,
                padding: '0.75rem',
              }}
            >
              <span
                style={{
                  color: 'var(--a63-text-secondary)',
                  fontSize: 12,
                  width: 96,
                }}
              >
                {theme} / {mode}
              </span>
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
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
