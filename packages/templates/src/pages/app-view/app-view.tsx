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
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'

export const template = {
  id: 'app-view',
  kind: 'page',
  title: 'App view',
  description:
    'A full-window product view with no site header or footer: a top bar across the window, a side panel and the main region below it, and an optional bar docked at the bottom, such as a media player or a status bar.',
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
  ],
  readiness: 'draft',
} as const

export interface AppViewProps {
  /** The main region; it scrolls on its own. */
  children: ReactNode
  /** A bar docked at the bottom of the window, such as a player or a status bar. */
  bottomBar?: ReactNode
  /** The accessible name of the bottom bar's region. */
  bottomBarLabel?: string
  /** A side panel next to the main region, hidden on phones. */
  panel?: ReactNode
  /** The accessible name of the side panel. */
  panelLabel?: string
  /** The bar across the top of the window. */
  topBar: ReactNode
}

/*
 * The window is a three-row grid: the top bar, the body (side panel and main,
 * each scrolling on its own) and the docked bar. Both bars span the full width,
 * which the app shell's sidebar layout cannot do.
 */
export function AppView({
  bottomBar,
  bottomBarLabel = 'Player',
  children,
  panel,
  panelLabel = 'Library',
  topBar,
}: AppViewProps) {
  return (
    <div className="bg-background text-foreground grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] gap-2 p-2">
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
