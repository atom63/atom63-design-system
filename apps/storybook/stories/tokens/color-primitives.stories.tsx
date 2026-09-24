import type { Meta, StoryObj } from '@storybook/react-vite'

const BRAND_SCALES = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'] as const
const NEUTRAL_SCALES = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'] as const
const STATUS_SCALES = ['danger', 'success', 'warning', 'info'] as const
const BRAND_STEPS = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const
const NEUTRAL_STEPS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const
const OPACITY_STEPS = [
  '0',
  '5',
  '10',
  '20',
  '30',
  '40',
  '50',
  '60',
  '70',
  '80',
  '90',
  '100',
] as const

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="border-border size-10 rounded-md border" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground font-mono text-[10px]">{label}</span>
    </div>
  )
}

function ScaleRow({
  name,
  steps,
  prefix,
}: {
  name: string
  steps: readonly string[]
  prefix?: string
}) {
  const varPrefix = prefix ?? name
  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground font-mono text-xs font-medium">{name}</span>
      <div className="flex flex-wrap gap-1">
        {steps.map(step => (
          <Swatch color={`var(--color-${varPrefix}-${step})`} key={step} label={step} />
        ))}
      </div>
    </div>
  )
}

function NeutralScaleRow({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground font-mono text-xs font-medium">{name}</span>
      <div className="flex gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[10px]">light</span>
          <div className="flex flex-wrap gap-1">
            {NEUTRAL_STEPS.map(step => (
              <Swatch
                color={`var(--color-${name}-light-${step})`}
                key={`light-${step}`}
                label={step}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[10px]">dark</span>
          <div className="flex flex-wrap gap-1">
            {NEUTRAL_STEPS.map(step => (
              <Swatch
                color={`var(--color-${name}-dark-${step})`}
                key={`dark-${step}`}
                label={step}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandColors() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Brand scales</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Six brand palettes (b1–b6) with 11-step lightness ramps. b1 is the system primary (blue).
          Each theme picks one as --primary.
        </p>
      </div>
      {BRAND_SCALES.map(scale => (
        <ScaleRow key={scale} name={scale} prefix={scale} steps={BRAND_STEPS} />
      ))}
    </div>
  )
}

function NeutralColors() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Neutral families</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Six neutral families (n1–n6) each with light and dark 12-step scales. Themes select one
          family and bind it to --surface-light-* / --surface-dark-*. n1 = pure gray, n2 = warm
          sand, n3 = cool slate, n4 = blue-gray, n5 = sage, n6 = stone.
        </p>
      </div>
      {NEUTRAL_SCALES.map(scale => (
        <NeutralScaleRow key={scale} name={scale} />
      ))}
    </div>
  )
}

function StatusColors() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Status palettes</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Fixed palettes for feedback states. Semantics map the 500 step to --destructive,
          --success, --warning, --info.
        </p>
      </div>
      {STATUS_SCALES.map(scale => (
        <ScaleRow key={scale} name={scale} steps={BRAND_STEPS} />
      ))}
    </div>
  )
}

function OpacityColors() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Opacity ramps</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          White and black alpha ramps for glassmorphism overlays, backdrops, and scrim layers.
        </p>
      </div>
      <ScaleRow name="white" steps={OPACITY_STEPS} />
      <ScaleRow name="black" steps={OPACITY_STEPS} />
    </div>
  )
}

const meta = {
  title: 'Tokens/Color Primitives',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Brand: Story = { render: () => <BrandColors /> }
export const Neutrals: Story = { render: () => <NeutralColors /> }
export const Status: Story = { render: () => <StatusColors /> }
export const Opacity: Story = { render: () => <OpacityColors /> }
