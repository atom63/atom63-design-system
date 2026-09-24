import { textTickerContract, themes } from '@atom63/ui-foundation'
import { TextTicker, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/TextTicker',
  component: TextTicker,
  args: {
    children: 'Now playing — A very long track title that will overflow its container',
    animationType: 'marquee',
    autoPlay: false,
    marqueeSpeed: 24,
    marqueeDelay: 0,
  },
  argTypes: {
    animationType: { control: 'inline-radio', options: [undefined, 'marquee'] },
    autoPlay: { control: 'boolean' },
    marqueeSpeed: { control: { type: 'number', min: 4, max: 60 } },
    marqueeDelay: { control: { type: 'number', min: 0, max: 2000, step: 100 } },
  },
} satisfies Meta<typeof TextTicker>

export default meta
type Story = StoryObj<typeof meta>

const frame = (child: React.ReactNode) => (
  <div
    style={{
      width: 220,
      padding: '0.5rem 0.75rem',
      border: '1px solid var(--a63-border-control)',
      borderRadius: 'var(--a63-control-radius)',
      background: 'var(--a63-surface-panel)',
      color: 'var(--a63-text-primary)',
      fontFamily: 'var(--a63-control-font-family)',
      fontSize: 14,
    }}
  >
    {child}
  </div>
)

/* Hover (or focus) the constrained frame to reveal the scrolling marquee. */
export const Playground: Story = {
  render: args => (
    <div style={{ display: 'grid', gap: 8 }}>
      {frame(<TextTicker {...args} tabIndex={0} />)}
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>
        Hover or focus the title to reveal the full text
      </span>
    </div>
  ),
}

/* No overflow — the ticker simply renders the text (marquee never engages). */
export const FitsInContainer: Story = {
  args: { children: 'Short title' },
  render: args => frame(<TextTicker {...args} />),
}

/* autoPlay scrolls continuously once the content overflows, no hover needed. */
export const AutoPlay: Story = {
  args: { autoPlay: true },
  render: args => frame(<TextTicker {...args} />),
}

/* Without animationType the component is a plain truncating line. */
export const StaticTruncate: Story = {
  args: { animationType: undefined },
  render: args => frame(<TextTicker {...args} />),
}

/* The ticker across all 4 DS themes × light/dark. autoPlay so the marquee is
   visible without hover in the static grid. */
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
                borderRadius: 'var(--radius-lg)',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              {frame(
                <TextTicker animationType="marquee" autoPlay marqueeSpeed={24}>
                  Now playing — A very long track title that will overflow its container
                </TextTicker>
              )}
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Compare the same overflow behavior at the supported endpoint densities. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        {frame(
          <TextTicker animationType="marquee" autoPlay>
            Web — a long overflowing title for review
          </TextTicker>
        )}
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        {frame(
          <TextTicker animationType="marquee" autoPlay>
            iOS touch — a long overflowing title for review
          </TextTicker>
        )}
      </UIProvider>
      <UIProvider density="compact">
        {frame(
          <TextTicker animationType="marquee" autoPlay>
            Compact extension — a long overflowing title
          </TextTicker>
        )}
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(textTickerContract, null, 2)}
    </pre>
  ),
}
