import { ScrollStage } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/ScrollStage',
  tags: ['!autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Scrollytelling section. At `lg+` width with motion allowed, the reading column ' +
          'scrolls on the left while a sticky media pane on the right crossfades to the step ' +
          'centered in the viewport. Below `lg` — and under reduced-motion — it collapses to a ' +
          'static stacked layout (media inline above prose). Scroll the story to see the pin and ' +
          'crossfade; the decorator here is widened to 64rem so the two-column layout shows.',
      },
    },
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '64rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

function MediaPanel({ label, className }: { label: string; className: string }) {
  return (
    <div
      className={`border-border flex h-full min-h-80 items-center justify-center rounded-lg border text-4xl font-semibold ${className}`}
    >
      {label}
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <ScrollStage>
      <ScrollStage.Step media={<MediaPanel className="bg-card text-foreground" label="1" />}>
        <h3 className="text-foreground text-xl font-semibold">Primitive layer</h3>
        <p>
          Raw tokens land first: color ramps, the type scale, spacing, and radius. These are the
          irreducible values every other layer is built from, and product UI should almost never
          reach for them directly.
        </p>
        <p>
          Keeping primitives isolated means a palette change or a type-scale tweak flows outward
          through the system instead of forcing a hunt for hardcoded values scattered across
          components.
        </p>
      </ScrollStage.Step>
      <ScrollStage.Step media={<MediaPanel className="bg-primary/10 text-primary" label="2" />}>
        <h3 className="text-foreground text-xl font-semibold">Semantic layer</h3>
        <p>
          Semantic tokens map primitives to intent — `primary`, `destructive`, `muted-foreground`. A
          component asks for a role, not a value, so a single theme change restyles every consumer
          at once.
        </p>
        <p>
          This indirection is what unlocks multi-theme support: the same markup renders correctly
          across all four themes because it only ever references intent.
        </p>
      </ScrollStage.Step>
      <ScrollStage.Step
        media={<MediaPanel className="bg-accent/15 text-accent-foreground" label="3" />}
      >
        <h3 className="text-foreground text-xl font-semibold">Composite blocks</h3>
        <p>
          Blocks like Tabs, Steps, Timeline, and ScrollStage compose the lower layers into portable,
          author-friendly pieces. They are registered on `mdxComponents`, so MDX authors drop them
          in with no imports.
        </p>
        <p>
          The result is documentation and portfolio content that stays aligned with the design
          system automatically — the same tokens power the demos and the shipped product.
        </p>
      </ScrollStage.Step>
    </ScrollStage>
  ),
}
