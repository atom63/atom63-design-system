import type { Meta, StoryObj } from '@storybook/react-vite'

const SURFACE_STEPS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="border-border size-10 rounded-md border" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground font-mono text-[10px]">{label}</span>
    </div>
  )
}

function SurfaceAliases() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Surface aliases</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          --surface-light-* and --surface-dark-* are aliases that point to whichever neutral family
          (n1–n6) the active theme selects. Components never reference n1/n2 directly — they
          reference surfaces, so swapping a theme file re-skins everything.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-[10px]">surface-light</span>
          <div className="flex flex-wrap gap-1">
            {SURFACE_STEPS.map(step => (
              <Swatch color={`var(--surface-light-${step})`} key={step} label={step} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-[10px]">surface-dark</span>
          <div className="flex flex-wrap gap-1">
            {SURFACE_STEPS.map(step => (
              <Swatch color={`var(--surface-dark-${step})`} key={step} label={step} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const DURATION_ALIASES = [
  { name: 'instant', value: '0ms', maps: '--duration-none' },
  { name: 'fast', value: '150ms', maps: '--duration-150' },
  { name: 'normal', value: '250ms', maps: '--duration-250' },
  { name: 'slow', value: '500ms', maps: '--duration-500' },
  { name: 'slower', value: '1000ms', maps: '--duration-1000' },
] as const

function DurationAliases() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Duration aliases</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Semantic names for motion timing. Components use --duration-fast, not --duration-150, so
          the motion feel can be tuned per-theme without touching component code.
        </p>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {DURATION_ALIASES.map(d => (
          <div className="flex flex-col gap-2" key={d.name}>
            <div className="flex h-12 items-end">
              <div
                className="bg-primary h-3 w-full rounded-sm"
                style={{
                  animation: `pulse var(--duration-${d.name}) ease-in-out infinite alternate`,
                }}
              />
            </div>
            <span className="text-foreground font-mono text-xs font-medium">{d.name}</span>
            <span className="text-muted-foreground font-mono text-[10px]">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Tokens/Aliases',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Surfaces: Story = { render: () => <SurfaceAliases /> }
export const Durations: Story = { render: () => <DurationAliases /> }
