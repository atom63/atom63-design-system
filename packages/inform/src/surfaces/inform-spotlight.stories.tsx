import { InformSpotlight } from '@atom63/inform/surfaces'
import { Button } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Inform/Spotlight',
  component: InformSpotlight,
  args: {
    anchor: '#spotlight-target',
    open: true,
    title: 'Command menu',
    body: 'Press ⌘K anywhere to jump between pages.',
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      // The spotlight resolves its anchor from the DOM, so the story must mount
      // a real target for it to highlight.
      <div
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '24rem',
          padding: '4rem',
        }}
      >
        <Button id="spotlight-target" variant="outline">
          Target control
        </Button>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InformSpotlight>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActions: Story = {
  args: {
    actions: [{ id: 'ok', label: 'Got it', onSelect: () => undefined, variant: 'primary' }],
  },
}

/**
 * A standing step with `dismissable={false}`: no dismiss button, and neither
 * Escape nor a press on the scrim closes it. Its actions are the only way out,
 * so a non-dismissable spotlight must carry at least one.
 */
export const NotDismissable: Story = {
  args: {
    actions: [{ id: 'ok', label: 'Got it', onSelect: () => undefined, variant: 'primary' }],
    dismissable: false,
  },
}

/**
 * On a phone there is no Escape key: the dismiss button and a press on the
 * scrim are the touch paths out, even for a message with no actions.
 */
export const Phone: Story = {
  globals: { viewport: { value: 'a63-phone', isRotated: false } },
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '1rem' }}>
        <Button id="spotlight-target-phone" variant="outline">
          Target control
        </Button>
        <Story />
      </div>
    ),
  ],
  args: { anchor: '#spotlight-target-phone' },
}

export const MissingAnchor: Story = {
  args: { anchor: '#does-not-exist' },
}

/** The bubble has no room below, so it must flip above the anchor. */
export const NearViewportBottom: Story = {
  args: { anchor: '#spotlight-target-bottom' },
  decorators: [
    Story => (
      <div
        style={{
          alignItems: 'flex-end',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '95vh',
          padding: '1rem',
        }}
      >
        <Button id="spotlight-target-bottom" variant="outline">
          Target near the bottom
        </Button>
        <Story />
      </div>
    ),
  ],
}

/** The bubble must clamp instead of overflowing past the right edge. */
export const NearRightEdge: Story = {
  args: { anchor: '#spotlight-target-right' },
  decorators: [
    Story => (
      <div
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          justifyContent: 'flex-end',
          minHeight: '20rem',
          padding: '1rem',
        }}
      >
        <Button id="spotlight-target-right" variant="outline">
          Target at the right edge
        </Button>
        <Story />
      </div>
    ),
  ],
}

export const Dark: Story = {
  args: WithActions.args,
  globals: { mode: 'dark' },
}
