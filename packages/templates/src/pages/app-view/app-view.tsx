import {
  Avatar,
  AvatarFallback,
  Button,
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
  SearchField,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Toggle,
} from '@atom63/ui-react'
import {
  Bell,
  House,
  Library,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { TabBar } from '../../blocks/tab-bar/tab-bar'

export const template = {
  id: 'app-view',
  kind: 'page',
  title: 'App view',
  description:
    'A full-window product view with no site header or footer: a top bar across the window, a side panel and the main region below it, and an optional bar docked at the bottom, such as a media player or a status bar. layout="phone" makes it a phone app screen: edge to edge with no card or inset, the top bar optional, safe-area aware, phone-sized type and controls (body 17px, 44px controls), and the tab-bar block docked at the bottom. For a dense product view (a table, an inbox, an issue tracker, an admin dashboard, a file list), wrap it in <UIProvider density="compact">: spacing and control heights scale once by 0.875 (32px controls become 28px) and text keeps its size. Copy-only: paste the files `atom63 template app-view` prints.',
  category: 'layout',
  tags: [
    'app',
    'full window',
    'workspace',
    'library',
    'player',
    'media',
    'docked bar',
    'side panel',
    'top bar',
    'layout',
    'phone',
    'mobile',
    'phone app',
    'edge to edge',
    'tab bar',
    'bottom navigation',
    'safe area',
  ],
  readiness: 'draft',
} as const

export interface AppViewProps {
  /** The main region; it scrolls on its own. */
  children: ReactNode
  /**
   * `window` (the default): a padded window with the main region on a rounded
   * card, the side panel from `md` up and the tab bar on phones only.
   * `phone`: a phone app screen. The main region runs edge to edge with no
   * card or inset, the side panel is not drawn, and the tab bar always shows.
   * It stamps `data-a63-form-factor="phone"`, which sets phone-sized type and
   * controls inside it (the iOS text sizes: body 17px, subhead 15px, footnote
   * 13px, and 44px controls), so text-* utilities, text roles and components
   * all follow without extra classes.
   * The top bar is optional and takes the top safe-area inset; without one the
   * content reaches the top edge (under the status bar with
   * `viewport-fit=cover`), so give its first block `pt-[env(safe-area-inset-top)]`.
   */
  layout?: 'phone' | 'window'
  /** A bar docked at the bottom of the window, such as a player or a status bar. */
  bottomBar?: ReactNode
  /** The accessible name of the bottom bar's region. */
  bottomBarLabel?: string
  /** A side panel next to the main region, hidden on phones. */
  panel?: ReactNode
  /** The accessible name of the side panel. */
  panelLabel?: string
  /** Bottom navigation shown on phones only, under the docked bar, such as the tab-bar block. */
  tabBar?: ReactNode
  /** The bar across the top of the window. Optional with `layout="phone"`. */
  topBar?: ReactNode
}

/*
 * The window is a three-row grid: the top bar, the body (side panel and main,
 * each scrolling on its own) and the docked bar. Both bars span the full width,
 * which the app shell's sidebar layout cannot do.
 * For a dense product view (a table, an inbox, an issue tracker, an admin
 * dashboard, a file list), wrap it in <UIProvider density="compact"> from
 * @atom63/ui-react: the space steps, gaps, paddings and control heights scale
 * once by 0.875 and text keeps its size.
 */
export function AppView({
  bottomBar,
  bottomBarLabel = 'Player',
  children,
  layout = 'window',
  panel,
  panelLabel = 'Library',
  tabBar,
  topBar,
}: AppViewProps) {
  if (layout === 'phone') {
    /*
     * A column, no gaps or radius: the top bar, the main region (the only part
     * that scrolls), the docked bar, then the tab bar, which pads itself for
     * the home indicator. Without a tab bar the docked bar takes that inset.
     * data-a63-form-factor="phone" sets the phone type steps and control sizes
     * for everything inside; text-base sets the body size the screen inherits.
     */
    return (
      <div
        className="bg-background text-foreground flex h-dvh flex-col text-base"
        data-a63-form-factor="phone"
      >
        {topBar ? (
          <header className="border-border flex min-h-14 shrink-0 items-center gap-2 border-b px-4 pt-[env(safe-area-inset-top)]">
            {topBar}
          </header>
        ) : null}
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        {bottomBar ? (
          <section
            aria-label={bottomBarLabel}
            className={`border-border flex shrink-0 items-center gap-3 border-t px-4 py-2 ${tabBar ? '' : 'pb-[max(env(safe-area-inset-bottom),--spacing(2))]'}`}
          >
            {bottomBar}
          </section>
        ) : null}
        {tabBar ? <div className="shrink-0">{tabBar}</div> : null}
      </div>
    )
  }
  return (
    <div className="bg-background text-foreground grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-2 p-2">
      <header className="flex items-center gap-2">{topBar}</header>
      <div className="flex min-h-0 gap-2">
        {panel ? (
          <aside
            aria-label={panelLabel}
            className="bg-card hidden w-72 shrink-0 flex-col overflow-y-auto rounded-xl p-2 md:flex"
          >
            {panel}
          </aside>
        ) : null}
        <main className="bg-card min-w-0 flex-1 overflow-y-auto rounded-xl">{children}</main>
      </div>
      {bottomBar ? (
        <section aria-label={bottomBarLabel} className="flex items-center gap-4 px-2">
          {bottomBar}
        </section>
      ) : null}
      {tabBar ? <div className="-mx-2 -mb-2 md:hidden">{tabBar}</div> : null}
    </div>
  )
}

const library = [
  { current: false, kind: 'Playlist', title: 'Morning rotation' },
  { current: true, kind: 'Album', title: 'Quiet hours' },
  { current: false, kind: 'Playlist', title: 'Late drive' },
  { current: false, kind: 'Artist', title: 'Mara Vale' },
  { current: false, kind: 'Album', title: 'Paper lanterns' },
]

const tracks = [
  { length: '3:12', title: 'First light' },
  { length: '2:48', title: 'Low tide' },
  { length: '4:05', title: 'Window seat' },
  { length: '3:31', title: 'Long way home' },
  { length: '2:57', title: 'Afterglow' },
]

/* A sample app view: a music library with a docked player. */
export function AppViewPage() {
  const [query, setQuery] = useState('')
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(35)
  const [volume, setVolume] = useState(70)

  return (
    <AppView
      bottomBar={
        <>
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-sm font-medium">First light</p>
            <p className="text-muted-foreground truncate text-xs">Mara Vale</p>
          </div>
          <div className="flex flex-[2] flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Toggle aria-label="Shuffle" size="sm">
                <Shuffle aria-hidden />
              </Toggle>
              <Button aria-label="Previous track" size="icon-sm" variant="ghost">
                <SkipBack aria-hidden />
              </Button>
              <Button
                aria-label={playing ? 'Pause' : 'Play'}
                onClick={() => setPlaying(!playing)}
                size="icon"
                variant="primary"
              >
                {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
              </Button>
              <Button aria-label="Next track" size="icon-sm" variant="ghost">
                <SkipForward aria-hidden />
              </Button>
              <Toggle aria-label="Repeat" size="sm">
                <Repeat aria-hidden />
              </Toggle>
            </div>
            <Slider
              aria-label="Position"
              className="w-full max-w-md"
              max={100}
              min={0}
              onValueChange={value => setPosition(Number(value))}
              value={position}
            />
          </div>
          <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
            <Volume2 aria-hidden className="text-muted-foreground size-4" />
            <Slider
              aria-label="Volume"
              className="w-28"
              max={100}
              min={0}
              onValueChange={value => setVolume(Number(value))}
              value={volume}
            />
          </div>
        </>
      }
      panel={
        <>
          <h2 className="flex items-center gap-2 px-2 py-1 text-sm font-semibold">
            <ListMusic aria-hidden className="size-4" />
            Your library
          </h2>
          <ItemGroup>
            {library.map(entry => (
              <Item
                key={entry.title}
                render={
                  <a aria-current={entry.current ? 'page' : undefined} href={`#${entry.title}`}>
                    <ItemContent>
                      <ItemTitle>{entry.title}</ItemTitle>
                      <ItemDescription>{entry.kind}</ItemDescription>
                    </ItemContent>
                  </a>
                }
                size="xs"
              />
            ))}
          </ItemGroup>
        </>
      }
      tabBar={
        <TabBar
          items={[
            { href: '#home', icon: <House aria-hidden />, label: 'Home' },
            { href: '#search', icon: <Search aria-hidden />, label: 'Search' },
            { current: true, href: '#library', icon: <Library aria-hidden />, label: 'Library' },
          ]}
        />
      }
      topBar={
        <>
          <Button aria-label="Home" size="icon" variant="ghost">
            <House aria-hidden />
          </Button>
          <form
            className="max-w-md flex-1"
            onSubmit={event => event.preventDefault()}
            role="search"
          >
            <SearchField
              aria-label="Search the library"
              onValueChange={setQuery}
              placeholder="What do you want to play?"
              value={query}
            />
          </form>
          <div className="ms-auto flex items-center gap-2">
            <Button aria-label="Notifications" size="icon" variant="ghost">
              <Bell aria-hidden />
            </Button>
            <Avatar>
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div>
          <p className="text-muted-foreground text-sm">Album · 2024 · 5 songs</p>
          <h1 className="font-heading text-3xl font-semibold">Quiet hours</h1>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-end">Length</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track, index) => (
              <TableRow key={track.title}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>{track.title}</TableCell>
                <TableCell className="text-muted-foreground text-end tabular-nums">
                  {track.length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppView>
  )
}

/*
 * The same app as a phone screen: layout="phone" with no top bar, so the album
 * header reaches the top edge and pads itself for the status bar; a mini
 * player and the tab bar dock at the bottom.
 */
export function AppViewPhonePage() {
  const [playing, setPlaying] = useState(false)

  return (
    <AppView
      bottomBar={
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">First light</p>
            <p className="text-muted-foreground truncate text-xs">Mara Vale</p>
          </div>
          <Button
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={() => setPlaying(!playing)}
            size="icon"
            variant="primary"
          >
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
          </Button>
          <Button aria-label="Next track" size="icon" variant="ghost">
            <SkipForward aria-hidden />
          </Button>
        </>
      }
      layout="phone"
      tabBar={
        <TabBar
          items={[
            { href: '#home', icon: <House aria-hidden />, label: 'Home' },
            { href: '#search', icon: <Search aria-hidden />, label: 'Search' },
            { current: true, href: '#library', icon: <Library aria-hidden />, label: 'Library' },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-2 pt-[env(safe-area-inset-top)]">
        <div className="px-4 pt-6">
          <p className="text-muted-foreground text-sm">Album · 2024 · 5 songs</p>
          <h1 className="font-heading text-3xl font-semibold">Quiet hours</h1>
        </div>
        <ItemGroup>
          {tracks.map((track, index) => (
            <Item
              key={track.title}
              render={
                <a href={`#${track.title}`}>
                  <ItemContent>
                    <ItemTitle>{track.title}</ItemTitle>
                    <ItemDescription>
                      {index + 1} · {track.length}
                    </ItemDescription>
                  </ItemContent>
                </a>
              }
              size="sm"
            />
          ))}
        </ItemGroup>
      </div>
    </AppView>
  )
}
