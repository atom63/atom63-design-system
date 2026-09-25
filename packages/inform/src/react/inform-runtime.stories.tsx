import { createMemoryDismissalStore, defineInformRegistry } from '@atom63/inform'
import { InformOutlet, InformProvider } from '@atom63/inform/react'
import type { InformFlyoutPlacement } from '@atom63/inform/surfaces'
import { Button } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const context = { pathname: '/', locale: 'en', now: new Date() }

const registry = defineInformRegistry([
  {
    id: 'standing-notice',
    surface: 'banner',
    severity: 'info',
    priority: 0,
    dismiss: 'none',
    content: { body: 'Design system work in progress — you may experience issues.' },
  },
  {
    id: 'low-priority-banner',
    surface: 'banner',
    severity: 'warning',
    priority: -1,
    dismiss: 'session',
    content: { body: 'This one loses the banner slot to the standing notice.' },
  },
  {
    id: 'blocking-dialog',
    surface: 'dialog',
    severity: 'info',
    priority: 10,
    dismiss: 'session',
    content: {
      title: 'Blocking message',
      body: 'While this is open the corner flyout stays suppressed. Dismiss it to watch the flyout take the slot.',
    },
  },
  {
    id: 'suppressed-flyout',
    surface: 'corner-flyout',
    severity: 'info',
    priority: 0,
    dismiss: 'session',
    content: { title: 'Now I can show', body: 'The dialog released the blocking slot.' },
  },
])

function Runtime() {
  return (
    <InformProvider context={context} dismissals={createMemoryDismissalStore()} registry={registry}>
      <div style={{ minHeight: '24rem', padding: '1.5rem' }}>
        <InformOutlet />
      </div>
    </InformProvider>
  )
}

/*
 * Five flyouts against a limit of three: the top three stack, the rest queue.
 * Dismiss a visible card and the next is promoted into its place.
 */
const stackRegistry = defineInformRegistry(
  Array.from({ length: 5 }, (_, index) => ({
    id: `stacked-${index}`,
    surface: 'corner-flyout' as const,
    severity: 'info' as const,
    priority: 10 - index,
    dismiss: 'session' as const,
    content: {
      // Half the messages carry media, so the stack has to cope with mixed
      // heights rather than a convenient uniform one.
      media:
        index % 2 === 0 ? undefined : (
          <img
            alt=""
            src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%234f7cff'/%3E%3C/svg%3E"
          />
        ),
      title: `Message ${index + 1}`,
      body:
        index < 3
          ? 'Visible — dismiss one and a queued message takes its place.'
          : 'Queued behind the visible three.',
    },
  }))
)

/*
 * Keyed remount is the reset: the provider builds its store from the registry
 * and dismissal store it is handed, so a fresh key replays the sequence.
 * Without it a stack can be dismissed once per page load, which is no way to
 * look at motion.
 */
function FlyoutStack({ placement }: { placement?: InformFlyoutPlacement }) {
  const [run, setRun] = useState(0)

  return (
    <div
      style={{
        alignItems: 'flex-start',
        color: 'var(--a63-text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 'var(--typography-sm-font-size)',
        gap: 'var(--a63-space-3)',
        minHeight: '100vh',
        padding: '1.5rem',
      }}
    >
      <p style={{ margin: 0, maxWidth: '65ch' }}>
        Five flyouts are registered and three may show at once. Hover the stack to expand it,
        dismiss a card to watch it leave, and a queued message is promoted into the gap.
      </p>
      <Button
        onClick={() => {
          setRun(value => value + 1)
        }}
        size="xs"
        variant="outline"
      >
        Replay
      </Button>

      <InformProvider
        context={context}
        dismissals={createMemoryDismissalStore()}
        key={run}
        registry={stackRegistry}
      >
        <InformOutlet flyoutPlacement={placement} surfaces={['corner-flyout']} />
      </InformProvider>
    </div>
  )
}

export const Stacking: StoryObj<typeof FlyoutStack> = {
  render: () => <FlyoutStack />,
  parameters: { layout: 'fullscreen' },
}

/*
 * Growth direction follows the anchor: bottom corners grow upward, top corners
 * downward, so a stack never pushes its own cards off screen.
 */
export const StackingTopRight: StoryObj<typeof FlyoutStack> = {
  render: () => <FlyoutStack placement="top-right" />,
  parameters: { layout: 'fullscreen' },
}

export const StackingBottomLeft: StoryObj<typeof FlyoutStack> = {
  render: () => <FlyoutStack placement="bottom-left" />,
  parameters: { layout: 'fullscreen' },
}

export const StackingTopLeft: StoryObj<typeof FlyoutStack> = {
  render: () => <FlyoutStack placement="top-left" />,
  parameters: { layout: 'fullscreen' },
}

const meta = {
  title: 'Inform/Runtime',
  component: Runtime,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Runtime>

export default meta
type Story = StoryObj<typeof meta>

export const Arbitration: Story = {}
