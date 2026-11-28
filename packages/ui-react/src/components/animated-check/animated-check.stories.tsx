import { themes } from '@atom63/ui-foundation'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '../button'
import { UIProvider } from '../../provider'
import { AnimatedCheck } from './animated-check'

const meta = {
  title: 'UI React/AnimatedCheck',
  component: AnimatedCheck,
  args: {
    variant: 'animated',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['animated', 'static'] },
  },
} satisfies Meta<typeof AnimatedCheck>

export default meta
type Story = StoryObj<typeof meta>

function AnimatedCheckDemo({ variant }: { variant: 'animated' | 'static' }) {
  const [animationCycle, setAnimationCycle] = useState(0)

  return (
    <div className="grid justify-items-center gap-4">
      <div className="flex items-center gap-3">
        <AnimatedCheck
          key={animationCycle}
          style={{ color: 'var(--a63-status-success)', fontSize: 32 }}
          variant={variant}
        />
        <span>Changes saved</span>
      </div>
      <Button
        size="sm"
        type="button"
        variant="outline"
        onClick={() => setAnimationCycle(cycle => cycle + 1)}
      >
        Replay animation
      </Button>
    </div>
  )
}

export const Playground: Story = {
  render: args => <AnimatedCheckDemo variant={args.variant ?? 'animated'} />,
}

export const StaticSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AnimatedCheck variant="static" style={{ fontSize: 16 }} />
      <AnimatedCheck variant="static" style={{ fontSize: 24 }} />
      <AnimatedCheck variant="static" style={{ fontSize: 40 }} />
    </div>
  ),
}

/* Playground in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...Playground, globals: { mode: 'dark' } }

/* The static check in every theme and mode, on the panel surface, in the success
   colour it is drawn in after a save and in the inherited text colour. */
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
              <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 96 }}>
                {theme} / {mode}
              </span>
              <AnimatedCheck
                style={{ color: 'var(--a63-status-success)', fontSize: 24 }}
                variant="static"
              />
              <AnimatedCheck style={{ fontSize: 24 }} variant="static" />
              <span>Changes saved</span>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}
