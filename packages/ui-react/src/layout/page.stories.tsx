import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import type { Meta, StoryObj } from '@storybook/react-vite'

/*
 * Page's padding is tinted so each capture shows the inset Page owns: `pt-8`,
 * the bottom padding plus the bottom safe-area inset, and the wider side inset
 * inline (0 outside a notched screen).
 */
function PageDemo({ noPadding = false }: { noPadding?: boolean }) {
  return (
    <Page className="bg-muted" noPadding={noPadding}>
      <Container className="bg-background" maxWidth="wide" padding="x">
        <Section removeTopSpacing={false} spacing="tight">
          <SectionHeader
            description="Track what customers owe and what has been paid."
            title="Invoices"
          />
          <p className="max-w-prose text-muted-foreground">
            The tinted band around this column is the page padding. The frame inside it is the
            Container, and the region is a Section.
          </p>
        </Section>
      </Container>
    </Page>
  )
}

const meta = {
  title: 'UI React/Page',
  component: PageDemo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageDemo>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = {
  globals: { viewport: { value: 'a63-phone', isRotated: false } },
  /* With emulated insets (as on a phone in landscape), Page adds the bottom inset to its
     bottom padding and takes the wider side inset inline. */
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector<HTMLElement>('[data-slot="page"]')
    if (!page) throw new Error('Expected the page')
    const insets = { bottom: '31px', left: '47px', right: '12px', top: '29px' }
    for (const [edge, value] of Object.entries(insets)) {
      page.style.setProperty(`--a63-safe-area-${edge}`, value)
    }
    try {
      const style = getComputedStyle(page)
      const expected = {
        paddingBottom: '111px',
        paddingInlineEnd: '47px',
        paddingInlineStart: '47px',
        paddingTop: '32px',
      }
      for (const [property, value] of Object.entries(expected)) {
        const actual = style[property as keyof typeof expected]
        if (actual !== value) throw new Error(`Expected ${property} ${value}, got ${actual}`)
      }
    } finally {
      for (const edge of Object.keys(insets)) page.style.removeProperty(`--a63-safe-area-${edge}`)
    }
  },
}

export const Tablet: Story = { globals: { viewport: { value: 'a63-tablet', isRotated: false } } }

export const Wide: Story = { globals: { viewport: { value: 'a63-wide', isRotated: false } } }

/* For a shell that owns the landmark's inset: no block padding and no safe-area insets. */
export const NoPadding: Story = {
  args: { noPadding: true },
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector<HTMLElement>('[data-slot="page"]')
    if (!page) throw new Error('Expected the page')
    page.style.setProperty('--a63-safe-area-bottom', '31px')
    try {
      if (getComputedStyle(page).paddingBottom !== '0px') {
        throw new Error('Expected no bottom padding with noPadding')
      }
    } finally {
      page.style.removeProperty('--a63-safe-area-bottom')
    }
  },
}
