import { themes, toggleContract, toggleSizes, toggleTones } from '@atom63/ui-foundation'
import { Toggle, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Star } from 'lucide-react'
import type { ReactNode } from 'react'

const meta = {
  title: 'UI React/Toggle',
  component: Toggle,
  argTypes: {
    size: { control: 'inline-radio', options: toggleSizes },
    tone: { control: 'inline-radio', options: toggleTones },
    defaultPressed: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Grid', size: 'md', tone: 'neutral' },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {toggleSizes.map(size => (
        <Toggle key={size} defaultPressed size={size}>
          {size}
        </Toggle>
      ))}
    </div>
  ),
}

export const IconSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {toggleSizes.map(size => (
        <Toggle key={size} defaultPressed size={size}>
          <Star aria-hidden fill="currentColor" />
          {size}
        </Toggle>
      ))}
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle defaultPressed tone="neutral">
        Neutral
      </Toggle>
      <Toggle defaultPressed tone="accent">
        Accent
      </Toggle>
      <Toggle defaultPressed tone="subtle">
        Subtle
      </Toggle>
      {/* Subtle suits icon toggles in a toolbar: the pressed one only changes color. */}
      <Toggle aria-label="Favorite" defaultPressed tone="subtle">
        <Star aria-hidden />
      </Toggle>
      <Toggle aria-label="Favorite (off)" tone="subtle">
        <Star aria-hidden />
      </Toggle>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle>Rest</Toggle>
      <Toggle defaultPressed>Pressed</Toggle>
      <Toggle disabled>Disabled</Toggle>
      <Toggle defaultPressed disabled>
        Disabled on
      </Toggle>
    </div>
  ),
}

/* Captured with forced colors on (Windows High Contrast): a pressed toggle of
   every tone takes the system selection colours. */
export const ForcedColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle>Rest</Toggle>
      <Toggle defaultPressed>Neutral</Toggle>
      <Toggle defaultPressed tone="accent">
        Accent
      </Toggle>
      <Toggle defaultPressed tone="subtle">
        Subtle
      </Toggle>
    </div>
  ),
}

/* Gapped independent toggles — compose standalone Toggles, not ToggleGroup. */
export const GappedRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--a63-control-gap)', alignItems: 'center' }}>
      <Toggle defaultPressed>Bold</Toggle>
      <Toggle>Italic</Toggle>
      <Toggle>Underline</Toggle>
    </div>
  ),
}

function PreviewCard({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: '0.75rem',
        padding: '1rem',
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      {children}
    </div>
  )
}

/* The sRGB channels of a computed CSS colour, read back through a canvas so any
   colour syntax (oklch, color-mix) resolves the way the browser paints it. */
function paintedRgb(color: string): [number, number, number] {
  const context = document.createElement('canvas').getContext('2d')
  if (!context) throw new Error('Expected a 2D canvas context')
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

function contrast(a: string, b: string): number {
  const luminance = (color: string) => {
    const [r, g, b] = paintedRgb(color).map(channel => {
      const c = channel / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export const Themes: Story = {
  /* A pressed neutral toggle must stand apart from the surface it sits on (WCAG
     1.4.11 non-text contrast, 3:1) in every theme and mode. */
  play: ({ canvasElement }) => {
    for (const row of canvasElement.querySelectorAll<HTMLElement>('[data-toggle-row]')) {
      const pressed = row.querySelector<HTMLElement>(
        '.a63-Toggle[data-tone="neutral"][data-pressed]'
      )
      if (!pressed) throw new Error('Expected a pressed neutral toggle')
      const ratio = contrast(
        getComputedStyle(pressed).backgroundColor,
        getComputedStyle(row).backgroundColor
      )
      if (ratio < 3) {
        throw new Error(`${row.dataset.toggleRow}: pressed fill is ${ratio.toFixed(2)}:1`)
      }
    }
  },
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
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
              data-toggle-row={`${theme} / ${mode}`}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Toggle defaultPressed>On</Toggle>
              <Toggle defaultPressed tone="accent">
                Accent
              </Toggle>
              <Toggle>Off</Toggle>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer">
        <PreviewCard label="web / pointer">
          <Toggle defaultPressed>Toggle</Toggle>
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <PreviewCard label="ios / touch">
          <Toggle defaultPressed>Toggle</Toggle>
        </PreviewCard>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(toggleContract, null, 2)}
    </pre>
  ),
}
