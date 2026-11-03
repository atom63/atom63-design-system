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
import { AppView } from '@atom63/ui-react/layout'
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
import { useState } from 'react'

import { TabBar } from '../../blocks/tab-bar/tab-bar'

export const template = {
  id: 'app-view',
  kind: 'page',
  title: 'App view',
  description:
    'A full-window product view with no site header or footer, built on the AppView frame from @atom63/ui-react/layout: a top bar across the window, a side panel and the main region below it, and an optional bar docked at the bottom, such as a media player or a status bar. chrome="flush" runs the columns to the window edges, split by borders, instead of rounded cards. layout="phone" makes it a phone app screen: edge to edge, the top bar optional, safe-area aware, phone-sized type and controls (body 17px, 44px controls), and the tab-bar block docked at the bottom. overlay floats content over the main region, such as a scroll-to-bottom button. For a dense product view (a table, an inbox, an issue tracker, an admin dashboard, a file list), wrap it in <UIProvider density="compact">. Import AppView; copy only the sample pages to adapt them.',
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
