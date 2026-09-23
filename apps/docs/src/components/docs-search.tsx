import {
  Button,
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
  Kbd,
  KbdGroup,
} from '@atom63/ui-react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CornerDownLeftIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { DOC_AREA_IDS, DOC_AREAS, type DocAreaId, type NavItem } from '../lib/doc-pages'
import { DEFAULT_DOC_AREA, DEFAULT_DOC_SLUG, pathForDoc } from '../lib/doc-routing'
import { type DocSearchRecord, loadDocSearchIndex, searchDocs } from '../lib/doc-search'
import { useTheme } from '../theme'

type DocsCommandItem = DocsSearchAction | DocsSearchPage

type DocsSearchAction = {
  icon: 'moon' | 'sun'
  id: string
  keywords: string[]
  run: () => void
  section: string
  shortcut?: string
  title: string
  type: 'action'
}

type DocsSearchPage = {
  area: DocAreaId
  areaLabel: string
  id: string
  keywords: string[]
  path: string
  section: string
  shortcut?: string
  snippet?: string
  title: string
  type: 'page'
}

type DocsSearchGroup = {
  id: DocAreaId | 'actions' | 'results'
  items: DocsCommandItem[]
  label: string
}

const OPEN_DOCS_SEARCH_EVENT = 'atom63:open-docs-search'

function resultGroup(records: DocSearchRecord[], query: string): DocsSearchGroup[] {
  const hits = searchDocs(records, query)
  if (hits.length === 0) {
    return []
  }

  return [
    {
      id: 'results',
      items: hits.map(hit => ({
        area: hit.area,
        areaLabel: hit.areaLabel,
        id: hit.path,
        keywords: [],
        path: hit.path,
        section: hit.heading ?? hit.sectionTitle,
        snippet: hit.snippet,
        title: hit.heading ? `${hit.pageTitle} — ${hit.heading}` : hit.pageTitle,
        type: 'page' as const,
      })),
      label: 'Results',
    },
  ]
}

function buildActionGroup(toggleTheme: () => void, theme: string): DocsSearchGroup {
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return {
    id: 'actions',
    items: [
      {
        icon: nextTheme === 'dark' ? 'moon' : 'sun',
        id: 'theme-toggle',
        keywords: ['appearance', 'color', 'dark', 'light', 'theme', nextTheme],
        run: toggleTheme,
        section: 'Appearance',
        title: `Switch to ${nextTheme} mode`,
        type: 'action',
      },
    ],
    label: 'Actions',
  }
}

function buildPageGroups(): DocsSearchGroup[] {
  return DOC_AREA_IDS.map(areaId => {
    const area = DOC_AREAS[areaId]
    const siteHomeItem: DocsSearchPage = {
      area: DEFAULT_DOC_AREA,
      areaLabel: area.label,
      id: 'site-home',
      keywords: ['ATOM63', 'design system', 'home', 'overview'],
      path: pathForDoc(DEFAULT_DOC_AREA, DEFAULT_DOC_SLUG),
      section: 'Start here',
      title: 'Design system home',
      type: 'page',
    }
    const startItem: DocsSearchPage = {
      area: areaId,
      areaLabel: area.label,
      id: `${areaId}:start`,
      keywords: [area.label, area.startLabel, area.defaultSlug],
      path: pathForDoc(areaId),
      section: 'Start here',
      title: area.startLabel,
      type: 'page',
    }

    const sectionItems = area.sections.flatMap(section =>
      section.items.map(item => searchItemFromNavItem(item, area.label, section.title))
    )

    return {
      id: areaId,
      items: [...(areaId === DEFAULT_DOC_AREA ? [siteHomeItem] : []), startItem, ...sectionItems],
      label: area.label,
    }
  })
}

function searchItemFromNavItem(item: NavItem, areaLabel: string, section: string): DocsSearchPage {
  return {
    area: item.area,
    areaLabel,
    id: item.slug,
    keywords: [areaLabel, section, item.label, item.slug],
    path: pathForDoc(item.area, item.slug),
    section,
    title: item.label,
    type: 'page',
  }
}

function shortcutLabel() {
  if (navigator.platform.toLowerCase().includes('mac')) {
    return '⌘K'
  }

  return 'Ctrl K'
}

export function DocsSearch() {
  const [open, setOpen] = useState(false)
  const [dialogVersion, setDialogVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<DocSearchRecord[]>([])
  const ignoreOpenUntilRef = useRef(0)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const trimmedQuery = query.trim()

  const groups = useMemo(() => {
    if (trimmedQuery.length >= 2) {
      return resultGroup(records, trimmedQuery)
    }

    return [buildActionGroup(toggle, theme), ...buildPageGroups()]
  }, [records, theme, toggle, trimmedQuery])

  const shortcut = shortcutLabel()

  // The raw MDX index is only worth downloading once the palette is actually used.
  useEffect(() => {
    if (!open || records.length > 0) {
      return
    }

    let cancelled = false
    void loadDocSearchIndex().then(loaded => {
      if (!cancelled) {
        setRecords(loaded)
      }
    })

    return () => {
      cancelled = true
    }
  }, [open, records.length])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcut = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
      if (!isShortcut) {
        return
      }

      event.preventDefault()
      setOpen(true)
    }
    const handleOpenRequest = () => setOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener(OPEN_DOCS_SEARCH_EVENT, handleOpenRequest)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener(OPEN_DOCS_SEARCH_EVENT, handleOpenRequest)
    }
  }, [])

  const setDialogOpen = (nextOpen: boolean) => {
    if (nextOpen && Date.now() < ignoreOpenUntilRef.current) {
      return
    }

    if (!nextOpen) {
      setQuery('')
    }

    setOpen(nextOpen)
  }

  const openSearch = () => setOpen(true)

  const selectItem = (item: DocsCommandItem) => {
    if (item.type === 'action') {
      ignoreOpenUntilRef.current = Date.now() + 500
      setOpen(false)
      item.run()
      window.setTimeout(() => setOpen(false), 0)
      window.setTimeout(() => setDialogVersion(version => version + 1), 250)
      return
    }

    setOpen(false)
    setQuery('')

    const [to, hash] = item.path.split('#')
    void navigate({ hash, to: to || '/' })
  }

  return (
    <>
      <Button
        aria-label="Search docs"
        className="hidden h-9 w-auto text-muted-foreground hover:text-foreground lg:flex"
        onClick={openSearch}
        size="md"
        type="button"
        variant="outline"
      >
        <SearchIcon aria-hidden />
        <Kbd size="sm">{shortcut}</Kbd>
      </Button>
      <Button
        aria-label="Search docs"
        className="size-11 lg:hidden"
        onClick={openSearch}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <SearchIcon aria-hidden />
      </Button>

      <CommandDialog key={dialogVersion} onOpenChange={setDialogOpen} open={open}>
        <CommandDialogPopup>
          <Command
            items={groups}
            itemToStringValue={item => {
              const commandItem = item as DocsCommandItem
              if (commandItem.type === 'action') {
                return [commandItem.title, commandItem.section, ...commandItem.keywords].join(' ')
              }

              return [
                commandItem.title,
                commandItem.areaLabel,
                commandItem.section,
                ...commandItem.keywords,
              ].join(' ')
            }}
            mode={trimmedQuery.length >= 2 ? 'none' : 'list'}
            onValueChange={value => setQuery(typeof value === 'string' ? value : '')}
            value={query}
          >
            <CommandInput placeholder="Search documentation..." />

            <CommandPanel>
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center gap-2 py-6">
                  <SearchIcon aria-hidden className="size-6 text-muted-foreground/72" />
                  <p className="text-sm text-muted-foreground">No docs found</p>
                </div>
              </CommandEmpty>
              <CommandList>
                {(group: DocsSearchGroup) => (
                  <Fragment key={group.id}>
                    <CommandGroup items={group.items}>
                      <CommandGroupLabel>{group.label}</CommandGroupLabel>
                      <CommandCollection>
                        {(item: DocsCommandItem) => (
                          <CommandItem key={item.id} onClick={() => selectItem(item)} value={item}>
                            {item.type === 'action' ? <ActionIcon icon={item.icon} /> : null}
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="truncate font-medium">{item.title}</span>
                              {item.type === 'page' && item.snippet ? (
                                <span className="line-clamp-1 text-xs text-muted-foreground">
                                  {item.snippet}
                                </span>
                              ) : null}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {item.section}
                            </span>
                            {item.shortcut ? (
                              <CommandShortcut>{item.shortcut}</CommandShortcut>
                            ) : null}
                          </CommandItem>
                        )}
                      </CommandCollection>
                    </CommandGroup>
                    <CommandSeparator />
                  </Fragment>
                )}
              </CommandList>
            </CommandPanel>

            <CommandFooter>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <KbdGroup>
                    <Kbd>
                      <ArrowUpIcon />
                    </Kbd>
                    <Kbd>
                      <ArrowDownIcon />
                    </Kbd>
                  </KbdGroup>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Kbd>
                    <CornerDownLeftIcon />
                  </Kbd>
                  <span>Open</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>Esc</Kbd>
                <span>Close</span>
              </div>
            </CommandFooter>
          </Command>
        </CommandDialogPopup>
      </CommandDialog>
    </>
  )
}

export function DocsSearchLauncher() {
  const shortcut = shortcutLabel()
  const openSearch = () => window.dispatchEvent(new Event(OPEN_DOCS_SEARCH_EVENT))

  return (
    <Button
      aria-label="Search documentation"
      className="not-prose my-8 flex h-12 w-full max-w-xl justify-between px-3.5 text-sm text-muted-foreground hover:text-foreground"
      onClick={openSearch}
      size="lg"
      type="button"
      variant="outline"
    >
      <span className="flex min-w-0 items-center gap-3">
        <SearchIcon aria-hidden className="size-4 shrink-0" />
        <span className="truncate">Search components, patterns, and guidance</span>
      </span>
      <span className="shrink-0">
        <Kbd size="sm">{shortcut}</Kbd>
      </span>
    </Button>
  )
}

function ActionIcon({ icon }: { icon: DocsSearchAction['icon'] }) {
  const Icon = icon === 'moon' ? MoonIcon : SunIcon

  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Icon aria-hidden className="size-3.5" />
    </span>
  )
}
