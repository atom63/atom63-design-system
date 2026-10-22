import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '../button'
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
