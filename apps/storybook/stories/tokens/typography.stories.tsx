import type { Meta, StoryObj } from '@storybook/react-vite'

const TYPE_STEPS = [
  { name: 'xs', base: '12px / 18px' },
  { name: 'sm', base: '13px / 20px' },
  { name: 'base', base: '15px / 23px' },
  { name: 'lg', base: '16px / 24px' },
  { name: 'xl', base: '18px / 23px' },
  { name: '2xl', base: '19px / 24px' },
  { name: '3xl', base: '21px / 26px' },
  { name: '4xl', base: '23px / 29px' },
  { name: '5xl', base: '26px / 33px' },
  { name: '6xl', base: '28px / 35px' },
  { name: '7xl', base: '31px / 39px' },
  { name: '8xl', base: '35px / 44px' },
  { name: '9xl', base: '39px / 49px' },
] as const

function TypeScale() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Type scale</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          13-step scale from xs (12px) to 9xl (39px) at --typography-scale: 1. Every step is
          computed as calc(Npx * var(--typography-scale)), so setting --typography-scale on any
          subtree proportionally scales all text. Steps lg+ are responsive — they grow at sm (640px)
          and md (768px) breakpoints.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {TYPE_STEPS.map(step => (
          <div className="flex items-baseline gap-4" key={step.name}>
            <span className="text-muted-foreground w-10 shrink-0 text-right font-mono text-[10px]">
              {step.name}
            </span>
            <span
              className="text-foreground"
              style={{
                fontSize: `var(--typography-${step.name}-font-size)`,
                lineHeight: `var(--typography-${step.name}-line-height)`,
              }}
            >
              The quick brown fox
            </span>
            <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
              {step.base}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FontFamilies() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Font families</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Three families: Geist (sans, body/UI), Brawler (serif, display accents), Geist Mono (code,
          tokens). Families are set as CSS custom properties and mapped to Tailwind's font-sans,
          font-serif, font-mono utilities.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs">font-sans (Geist)</span>
          <span className="text-foreground font-sans text-2xl">ABCDEFGabcdefg 0123456789</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs">font-serif (Brawler)</span>
          <span className="text-foreground font-serif text-2xl">ABCDEFGabcdefg 0123456789</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs">font-mono (Geist Mono)</span>
          <span className="text-foreground font-mono text-2xl">ABCDEFGabcdefg 0123456789</span>
        </div>
      </div>
    </div>
  )
}

function ScaleMultiplier() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Scale multiplier</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          --typography-scale controls all type sizes via a single CSS custom property. Themes or
          containers can override it to proportionally adjust an entire subtree.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[0.8, 1, 1.2, 1.4].map(scale => (
          <div
            className="border-border flex flex-col gap-2 rounded-lg border p-4"
            key={scale}
            style={{ '--typography-scale': scale } as React.CSSProperties}
          >
            <span className="text-muted-foreground font-mono text-[10px]">scale: {scale}</span>
            <span
              className="text-foreground"
              style={{
                fontSize: 'var(--typography-base-font-size)',
                lineHeight: 'var(--typography-base-line-height)',
              }}
            >
              Body text
            </span>
            <span
              className="text-foreground font-semibold"
              style={{
                fontSize: 'var(--typography-lg-font-size)',
                lineHeight: 'var(--typography-lg-line-height)',
              }}
            >
              Heading
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Tokens/Typography',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TypeScaleStory: Story = {
  name: 'Type Scale',
  render: () => <TypeScale />,
}
export const Families: Story = { render: () => <FontFamilies /> }
export const ScaleMultiplierStory: Story = {
  name: 'Scale Multiplier',
  render: () => <ScaleMultiplier />,
}
