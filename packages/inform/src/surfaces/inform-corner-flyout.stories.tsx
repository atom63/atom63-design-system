import { InformCornerFlyout, InformFlyoutStack } from '@atom63/inform/surfaces'
import type { Meta, StoryObj } from '@storybook/react-vite'

/* Inline so the stories need no network and no fixture file. */
const SAMPLE_MEDIA = (
  <img
    alt=""
    src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%234f7cff'/%3E%3Cstop offset='1' stop-color='%2300d4b8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='180' fill='url(%23g)'/%3E%3C/svg%3E"
  />
)

const meta = {
  title: 'Inform/Corner flyout',
  component: InformCornerFlyout,
  args: {
    open: true,
    title: 'New case study',
    body: 'A walkthrough of the OS63 windowing model is up.',
  },
  decorators: [
    /*
     * The card takes its width from whatever holds it — in production that is
     * InformFlyoutStack. A story has to supply the same width, or the card
     * simply fills the canvas.
     */
    Story => (
      <div style={{ width: 'min(22rem, calc(100vw - 2rem))' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InformCornerFlyout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActions: Story = {
  args: {
    actions: [
      { id: 'read', label: 'Read it', onSelect: () => undefined, variant: 'primary' },
      { id: 'later', label: 'Later', onSelect: () => undefined, variant: 'secondary' },
    ],
  },
}

export const Warning: Story = {
  args: { severity: 'warning', title: 'Heads up' },
}

export const NotDismissable: Story = {
  args: { dismissable: false },
}

/** Placement belongs to the stack, so a lone card renders inside one. */
export const InAStack: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div style={{ minHeight: '24rem' }}>
        <InformFlyoutStack offset="6rem">
          <Story />
        </InformFlyoutStack>
      </div>
    ),
  ],
}

/** Media replaces the severity glyph and stays a fixed square, so a stacked card's height stays predictable. */
export const WithMedia: Story = {
  args: { media: SAMPLE_MEDIA },
}

export const WithMediaAndActions: Story = {
  args: {
    media: SAMPLE_MEDIA,
    actions: [{ id: 'read', label: 'Read it', onSelect: () => undefined, variant: 'primary' }],
  },
}

export const Dark: Story = {
  args: {
    actions: [{ id: 'read', label: 'Read it', onSelect: () => undefined, variant: 'primary' }],
  },
  globals: { mode: 'dark' },
}
