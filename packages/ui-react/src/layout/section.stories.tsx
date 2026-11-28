import { Container, Section, SectionHeader } from '@atom63/ui-react/layout'
import type { Meta, StoryObj } from '@storybook/react-vite'

const spacings = ['tight', 'default', 'loose', 'generous', 'spacious'] as const

/*
 * Every spacing preset with top spacing kept, outlined so the padding shows.
 * `loose`, `generous` and `spacious` grow at 640 and 768px.
 */
function Presets() {
  return (
    <Container gap={4} maxWidth="wide" padding="x">
      {spacings.map(spacing => (
        <Section
          aria-labelledby={`section-${spacing}`}
          className="border border-dashed border-border px-4"
          key={spacing}
          removeTopSpacing={false}
          spacing={spacing}
        >
          <SectionHeader level={2} title={spacing} titleId={`section-${spacing}`} variant="muted" />
          <p className="text-sm text-muted-foreground">
            The gap above this line is the preset&apos;s gap between children.
          </p>
        </Section>
      ))}
    </Container>
  )
}

const meta = {
  title: 'UI React/Section',
  component: Presets,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Presets>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  /* Named with aria-labelledby, each section is a region landmark with its heading's name. */
  play: async ({ canvasElement }) => {
    const sections = canvasElement.querySelectorAll('section[aria-labelledby]')
    if (sections.length !== spacings.length) {
      throw new Error(`Expected ${spacings.length} named sections, got ${sections.length}`)
    }
    const first = sections[0] as HTMLElement
    const label = canvasElement.querySelector(`#${first.getAttribute('aria-labelledby')}`)
    if (label?.textContent !== 'tight') throw new Error('Expected the first section named "tight"')
    if (getComputedStyle(first).rowGap !== '16px') {
      throw new Error(`Expected a 16px gap for tight, got ${getComputedStyle(first).rowGap}`)
    }
  },
}

export const Phone: Story = { globals: { viewport: { value: 'a63-phone', isRotated: false } } }

export const Tablet: Story = { globals: { viewport: { value: 'a63-tablet', isRotated: false } } }

export const Wide: Story = { globals: { viewport: { value: 'a63-wide', isRotated: false } } }
