import { Button, Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@atom63/ui-react'
import { AppView } from '@atom63/ui-react/layout'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowDown, Bell, House, Library, Play, Search, SkipForward } from 'lucide-react'

const meta = {
  title: 'UI React/AppView',
  component: AppView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppView>

export default meta
type Story = StoryObj<typeof meta>

const tracks = Array.from({ length: 24 }, (_, index) => ({
  length: `${2 + (index % 3)}:${String(10 + ((index * 7) % 50)).padStart(2, '0')}`,
  title: `Track ${index + 1}`,
}))

function TrackList() {
  return (
    <ItemGroup>
      {tracks.map(track => (
        <Item key={track.title} size="sm">
          <ItemContent>
            <ItemTitle>{track.title}</ItemTitle>
            <ItemDescription>{track.length}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}

function TopBar() {
  return (
    <>
      <Button aria-label="Home" size="icon" tone="muted" variant="ghost">
        <House aria-hidden />
      </Button>
      <span className="font-semibold">Library</span>
      <Button
        aria-label="Notifications"
        className="ms-auto"
        size="icon"
        tone="muted"
        variant="ghost"
      >
        <Bell aria-hidden />
      </Button>
    </>
  )
}

function Player() {
  return (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">First light</p>
        <p className="truncate text-xs text-muted-foreground">Mara Vale</p>
      </div>
      <Button aria-label="Play" size="icon" variant="primary">
        <Play aria-hidden />
      </Button>
      <Button aria-label="Next track" size="icon" tone="muted" variant="ghost">
        <SkipForward aria-hidden />
      </Button>
    </>
  )
}

function TabBar() {
  const tabs = [
    { icon: <House aria-hidden />, label: 'Home' },
    { icon: <Search aria-hidden />, label: 'Search' },
    { icon: <Library aria-hidden />, label: 'Library' },
  ]
  return (
    <nav aria-label="Main" className="border-t border-border">
      <ul className="flex">
        {tabs.map(tab => (
          <li className="flex-1" key={tab.label}>
            <a
              aria-current={tab.label === 'Library' ? 'page' : undefined}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              href={`#${tab.label.toLowerCase()}`}
            >
              {tab.icon}
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const panel = (
  <ItemGroup>
    {['Morning rotation', 'Quiet hours', 'Late drive'].map(title => (
      <Item key={title} size="xs">
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
        </ItemContent>
      </Item>
    ))}
  </ItemGroup>
)

/*
 * The frame's two promises, checked with emulated safe-area insets: the main
 * region scrolls and the frame around it does not, and each inset lands on
 * exactly one owner.
 */
function checkFrame(
  canvasElement: HTMLElement,
  expected: { bottom: 'tab-bar' | 'bottom-bar' | 'main'; top: 'top-bar' | null }
) {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot="app-view"]')
  if (!root) throw new Error('Expected the AppView root')
  const part = (slot: string) => root.querySelector<HTMLElement>(`[data-slot="app-view-${slot}"]`)
  const insets = { bottom: '31px', inline: '13px', top: '29px' }
  root.style.setProperty('--a63-safe-area-top', insets.top)
  root.style.setProperty('--a63-safe-area-bottom', insets.bottom)
  root.style.setProperty('--a63-safe-area-left', insets.inline)
  root.style.setProperty('--a63-safe-area-right', insets.inline)
  try {
    const main = part('main')
    if (!main || main.scrollHeight <= main.clientHeight) {
      throw new Error('Expected the main region to overflow and scroll')
    }
    const scrollers = [root, ...root.querySelectorAll<HTMLElement>('*')].filter(element =>
      ['auto', 'scroll'].includes(getComputedStyle(element).overflowY)
    )
    const allowed = new Set([main, part('panel')])
    if (scrollers.some(element => !allowed.has(element)) || !scrollers.includes(main)) {
      throw new Error(`Expected only the main region (and the panel) to scroll`)
    }
    if (root.scrollHeight > root.clientHeight) throw new Error('Expected the frame not to scroll')

    const edges = ['top-bar', 'main', 'bottom-bar', 'tab-bar'] as const
    const owners = (property: 'paddingTop' | 'paddingBottom', value: string) =>
      edges.filter(slot => {
        const element = part(slot)
        return element ? getComputedStyle(element)[property] === value : false
      })
    const top = owners('paddingTop', insets.top)
    if (top.join() !== (expected.top ?? '')) {
      throw new Error(`Expected the top inset on ${expected.top ?? 'nothing'}, got ${top.join()}`)
    }
    const bottom = owners('paddingBottom', insets.bottom)
    if (bottom.join() !== expected.bottom) {
      throw new Error(`Expected the bottom inset on ${expected.bottom}, got ${bottom.join()}`)
    }
    const style = getComputedStyle(root)
    if (style.paddingInlineStart !== insets.inline || style.paddingInlineEnd !== insets.inline) {
      throw new Error('Expected the root to take the inline insets')
    }
  } finally {
    for (const edge of ['top', 'bottom', 'left', 'right']) {
      root.style.removeProperty(`--a63-safe-area-${edge}`)
    }
  }
}

/* A desktop window: a top bar, a side panel and the main region on rounded cards, and a docked player. */
export const Playground: Story = {
  args: {
    bottomBar: <Player />,
    children: <TrackList />,
    panel,
    topBar: <TopBar />,
  },
  play: ({ canvasElement }) => checkFrame(canvasElement, { bottom: 'bottom-bar', top: 'top-bar' }),
}

/* chrome="flush": the columns run to the window edges, split by borders. */
export const Flush: Story = {
  args: { ...Playground.args, chrome: 'flush' },
  play: ({ canvasElement }) => checkFrame(canvasElement, { bottom: 'bottom-bar', top: 'top-bar' }),
}

/* A phone screen with a top bar and the tab bar: the tab bar takes the bottom inset. */
export const PhoneWithTabBar: Story = {
  args: {
    children: <TrackList />,
    layout: 'phone',
    tabBar: <TabBar />,
    topBar: <TopBar />,
  },
  play: ({ canvasElement }) => checkFrame(canvasElement, { bottom: 'tab-bar', top: 'top-bar' }),
}

/*
 * A phone screen with no top bar and a docked bar: the content reaches the top
 * edge (its first block pads itself), and the docked bar takes the bottom inset.
 */
export const PhoneWithDockedBar: Story = {
  args: {
    bottomBar: <Player />,
    children: <TrackList />,
    layout: 'phone',
  },
  play: ({ canvasElement }) => checkFrame(canvasElement, { bottom: 'bottom-bar', top: null }),
}

/*
 * A phone screen with a docked bar, the tab bar and an overlay: the overlay
 * floats over the end of the main region, above the docked bar, and does not scroll.
 */
export const PhoneWithOverlay: Story = {
  args: {
    bottomBar: <Player />,
    children: <TrackList />,
    layout: 'phone',
    overlay: (
      <Button aria-label="Scroll to the bottom" shape="round" size="icon" variant="raised">
        <ArrowDown aria-hidden />
      </Button>
    ),
    tabBar: <TabBar />,
    topBar: <TopBar />,
  },
  play: ({ canvasElement }) => checkFrame(canvasElement, { bottom: 'tab-bar', top: 'top-bar' }),
}
