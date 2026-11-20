import { marqueeContract, themes } from '@atom63/ui-foundation'
import { Badge, Marquee, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Marquee',
  component: Marquee,
} satisfies Meta<typeof Marquee>

export default meta
// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

const chips = ['Design', 'Engineering', 'Motion', 'Systems', 'Type', 'Color']

function Chip({ label }: { label: string }): React.ReactElement {
  return <Badge variant="secondary">{label}</Badge>
}

export const Playground: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, width: 'min(420px, 100%)' }}>
      <Marquee aria-label="Design disciplines">
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>
        Hover, focus or press the pause button to stop it
      </span>
    </div>
  ),
}

/*
 * WCAG 2.2.2: the strip pauses on hover and focus, and the built-in toggle at the
 * inline end pauses it until pressed again. This story presses it.
 */
export const PauseToggle: Story = {
  render: () => (
    <div style={{ width: 'min(420px, 100%)' }}>
      <Marquee aria-label="Design disciplines">
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Pause"]')
    if (!toggle) throw new Error('Expected the built-in pause toggle')
    toggle.click()
    await new Promise(resolve => setTimeout(resolve, 50))
    if (toggle.getAttribute('aria-pressed') !== 'true') {
      throw new Error('Expected the pause toggle to be pressed')
    }
    for (const track of canvasElement.querySelectorAll('.a63-Marquee-track')) {
      if (
        !track.hasAttribute('data-paused') ||
        getComputedStyle(track).animationPlayState !== 'paused'
      ) {
        throw new Error('Expected every track to be paused')
      }
    }
  },
}

export const Reverse: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Marquee reverse>
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
    </div>
  ),
}

/* Right-to-left: the duplicate tracks lay out to the left, so the strip scrolls
   right and loops without a gap. */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl" lang="ar" style={{ width: 420 }}>
      <Marquee>
        {['تصميم', 'هندسة', 'حركة', 'أنظمة', 'خط', 'لون'].map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
    </UIProvider>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 200, width: 200 }}>
      <Marquee vertical>
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
    </div>
  ),
}

/* Passing `paused` hands pausing to the caller, so the built-in toggle is not
   rendered: give users your own control. */
export const Paused: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Marquee paused>
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
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
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                overflow: 'hidden',
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Marquee pauseOnHover paused>
                  {chips.map(c => (
                    <Chip key={c} label={c} />
                  ))}
                </Marquee>
              </div>
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
        <EndpointMarquee label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointMarquee label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointMarquee label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(marqueeContract, null, 2)}
    </pre>
  ),
}

function EndpointMarquee({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        overflow: 'hidden',
        padding: 12,
      }}
    >
      <span style={{ flex: '0 0 112px', fontSize: 12, color: 'var(--a63-text-secondary)' }}>
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Marquee paused>
          {chips.map(chip => (
            <Chip key={chip} label={chip} />
          ))}
        </Marquee>
      </div>
    </div>
  )
}
