import { ProgressiveBlur } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/ProgressiveBlur',
  component: ProgressiveBlur,
} satisfies Meta<typeof ProgressiveBlur>
export default meta
type Story = StoryObj<typeof meta>

/** Busy backdrop, so the blur ramp is actually visible. */
const CHECKS =
  'repeating-conic-gradient(#e11d48 0% 25%, #0ea5e9 0% 50%) 50% / 24px 24px, linear-gradient(120deg, #f59e0b, #10b981)'

function Frame({ children, label }: { children?: React.ReactNode; label: string }) {
  return (
    <figure style={{ margin: 0, display: 'grid', gap: 8 }}>
      <div
        style={{
          position: 'relative',
          width: 240,
          aspectRatio: '3 / 4',
          background: CHECKS,
          clipPath: 'inset(0 round 16px)',
        }}
      >
        {children}
        <p
          style={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            zIndex: 30,
            margin: 0,
            padding: '14px',
            color: '#fff',
            font: '500 15px/1.35 system-ui, sans-serif',
          }}
        >
          Text over a busy image
        </p>
      </div>
      <figcaption style={{ font: '400 12px/1.4 system-ui, sans-serif', opacity: 0.7 }}>
        {label}
      </figcaption>
    </figure>
  )
}

/**
 * The ramp against the two things it replaces. A single blur or a heavy scrim
 * both draw an edge; the ramp does not.
 */
export const Playground: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Frame label="No treatment — unreadable" />
      <Frame label="Single blur — visible edge">
        <div
          style={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            height: '65%',
            zIndex: 10,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
      </Frame>
      <Frame label="ProgressiveBlur — no edge">
        <ProgressiveBlur blurLevels={[1, 4, 16, 64]} height="65%" position="bottom" />
      </Frame>
      <Frame label="ProgressiveBlur + scrim (recommended)">
        <ProgressiveBlur blurLevels={[1, 4, 16, 64]} height="65%" position="bottom" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            background:
              'linear-gradient(to top, rgb(0 0 0 / 0.42) 0%, rgb(0 0 0 / 0.12) 36%, rgb(0 0 0 / 0) 100%)',
          }}
        />
      </Frame>
    </div>
  ),
}

/** `position` controls which edge the ramp grows from. */
export const Positions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Frame label="bottom">
        <ProgressiveBlur blurLevels={[1, 4, 16, 64]} height="65%" position="bottom" />
      </Frame>
      <Frame label="top">
        <ProgressiveBlur blurLevels={[1, 4, 16, 64]} height="65%" position="top" />
      </Frame>
      <Frame label="both">
        <ProgressiveBlur blurLevels={[1, 4, 16, 64]} position="both" />
      </Frame>
    </div>
  ),
}

/** More levels = smoother ramp, more compositing work. Four is usually enough. */
export const Levels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Frame label="2 levels">
        <ProgressiveBlur blurLevels={[4, 32]} height="65%" />
      </Frame>
      <Frame label="4 levels">
        <ProgressiveBlur blurLevels={[1, 4, 16, 64]} height="65%" />
      </Frame>
      <Frame label="8 levels (default)">
        <ProgressiveBlur height="65%" />
      </Frame>
    </div>
  ),
}

/* Playground in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...Playground, globals: { mode: 'dark' } }
