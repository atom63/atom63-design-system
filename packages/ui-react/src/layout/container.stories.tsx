import { Container, type ContainerMaxWidth } from '@atom63/ui-react/layout'
import type { Meta, StoryObj } from '@storybook/react-vite'

function Block({ label }: { label: string }) {
  return <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{label}</div>
}

/* Each frame is outlined so its measure and padding show; the blocks inside show the gap. */
function Presets() {
  return (
    <div className="flex flex-col gap-6 py-6">
      {(['all', 'x', 'none'] as const).map(padding => (
        <Container
          className="border border-dashed border-border"
          gap={4}
          key={padding}
          maxWidth="narrow"
          padding={padding}
        >
          <Block label={`padding="${padding}"`} />
          <Block label="gap={4}" />
        </Container>
      ))}
      {(['narrowest', 'narrower', 'default', 'wide', 'widest'] as ContainerMaxWidth[]).map(
        maxWidth => (
          <Container
            className="border border-dashed border-border"
            key={maxWidth}
            maxWidth={maxWidth}
            padding="x"
          >
            <Block label={`maxWidth="${maxWidth}"`} />
          </Container>
        )
      )}
    </div>
  )
}

const meta = {
  title: 'UI React/Container',
  component: Presets,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Presets>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: { viewport: { value: 'a63-phone', isRotated: false } } }

export const Tablet: Story = { globals: { viewport: { value: 'a63-tablet', isRotated: false } } }

export const Wide: Story = { globals: { viewport: { value: 'a63-wide', isRotated: false } } }

/* The gap between direct children is a spacing-scale step; 8 is the default. */
export const Gaps: Story = {
  render: () => (
    <div className="flex flex-col gap-6 py-6">
      {([2, 6, 8, 12] as const).map(gap => (
        <Container
          className="border border-dashed border-border"
          gap={gap}
          key={gap}
          maxWidth="narrow"
        >
          <Block label={`gap={${gap}}`} />
          <Block label="Next child" />
        </Container>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const gaps = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="container"]')].map(
      element => getComputedStyle(element).rowGap
    )
    if (gaps.join() !== '8px,24px,32px,48px') {
      throw new Error(`Expected gaps 8px,24px,32px,48px, got ${gaps.join()}`)
    }
  },
}
