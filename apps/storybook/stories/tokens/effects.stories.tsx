import type { Meta, StoryObj } from '@storybook/react-vite'

const SHADOW_STEPS = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
const BLUR_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const EASING_CURVES = [
  { name: 'linear', desc: 'Constant speed' },
  { name: 'fast', desc: 'Instant deceleration' },
  { name: 'pointtopoint', desc: 'Spatial transitions' },
  { name: 'spring', desc: 'Bouncy overshoot' },
  { name: 'soft', desc: 'Subtle acceleration' },
  { name: 'inout', desc: 'Smooth ramp in/out' },
] as const

function Shadows() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Shadow scale</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Seven elevation levels from 2xs (subtle edge) to 2xl (floating modal). Values are defined
          as --effect-shadow-* and aliased to Tailwind's shadow-* utilities.
        </p>
      </div>
      <div className="flex flex-wrap gap-5">
        {SHADOW_STEPS.map(step => (
          <div className="flex flex-col items-center gap-2" key={step}>
            <div
              className="flex size-24 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#f8fafc' }}
            >
              <div
                className="size-14 rounded-lg border border-black/10 bg-white"
                style={{ boxShadow: `var(--shadow-${step})` }}
              />
            </div>
            <span className="text-muted-foreground font-mono text-[10px]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Blurs() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Blur scale</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Seven backdrop-blur steps from xs (4px) to 3xl (64px) for glassmorphism surfaces.
        </p>
      </div>
      <div className="flex flex-wrap gap-6">
        {BLUR_STEPS.map(step => (
          <div className="relative flex flex-col items-center gap-2" key={step}>
            <div className="border-border relative size-16 overflow-hidden rounded-lg border">
              <div className="from-primary/40 to-destructive/40 absolute inset-0 bg-gradient-to-br" />
              <div
                className="absolute inset-0"
                style={{ backdropFilter: `blur(var(--blur-${step}))` }}
              />
            </div>
            <span className="text-muted-foreground font-mono text-[10px]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EasingCurves() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Easing curves</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Six named easings as CSS cubic-bezier values. Hover each row to preview the curve.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {EASING_CURVES.map(curve => (
          <div className="group flex items-center gap-4" key={curve.name}>
            <span className="text-foreground w-24 shrink-0 font-mono text-xs font-medium">
              {curve.name}
            </span>
            <div className="bg-muted relative h-6 flex-1 overflow-hidden rounded-sm">
              <div
                className="bg-primary absolute top-0 left-0 h-full w-8 rounded-sm transition-transform duration-1000 group-hover:translate-x-[calc(100cqw-2rem)]"
                style={{
                  transitionTimingFunction: `var(--ease-${curve.name})`,
                }}
              />
            </div>
            <span className="text-muted-foreground w-32 shrink-0 text-[10px]">{curve.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RadiusScale() {
  const steps = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full'] as const
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Radius scale</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Computed from --corner-radius (anchor, default 10px) and --radius-multiplier. The anchor
          maps to radius-lg; every other step is a fraction or multiple. Themes adjust both knobs —
          course uses 12px anchor.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {steps.map(step => (
          <div className="flex flex-col items-center gap-2" key={step}>
            <div
              className="border-primary bg-primary/10 size-14 border-2"
              style={{ borderRadius: `var(--radius-${step})` }}
            />
            <span className="text-muted-foreground font-mono text-[10px]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Tokens/Effects & Radius',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ShadowScale: Story = { render: () => <Shadows /> }
export const BlurScale: Story = { render: () => <Blurs /> }
export const Easing: Story = { render: () => <EasingCurves /> }
export const Radius: Story = { render: () => <RadiusScale /> }
