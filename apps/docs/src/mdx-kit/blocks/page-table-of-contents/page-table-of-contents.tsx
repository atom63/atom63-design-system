import {
  Button,
  ConnectedPanel,
  ConnectedPanelBody,
  ConnectedPanelContent,
  ConnectedPanelTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@atom63/ui-react'
import { clsx } from 'clsx'
import { ListTree } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type TableOfContentsVariant = 'embedded' | 'inline' | 'menu' | 'rail'

interface TocItem {
  depth: 2 | 3
  id: string
  title: string
}

export interface PageTableOfContentsProps {
  activeOffset?: number
  className?: string
  containerSelector?: string
  headingSelector?: string
  inlinePositionClassName?: string
  label?: string
  onActiveLabelChange?: (label: string) => void
  onNavigate?: () => void
  scrollOffset?: number
  showProgress?: boolean
  smoothScrollDuration?: number
  variant?: TableOfContentsVariant
}

const SLUG_CLEANUP_PATTERN = /[^a-z0-9]+/g
const EDGE_DASH_PATTERN = /(^-|-$)/g
const DEFAULT_ACTIVE_OFFSET = 120
const DEFAULT_CONTAINER_SELECTOR = '[data-mdx-scroll-root], #learn-main, main'
const DEFAULT_HEADING_SELECTOR =
  '[data-mdx-content] h2, [data-mdx-content] h3, article h2, article h3'
const DEFAULT_INLINE_POSITION_CLASS_NAME =
  'fixed top-[calc(--spacing(14)+--spacing(3))] right-4 z-30 xl:hidden'
const DEFAULT_SCROLL_OFFSET = 96
const DEFAULT_SMOOTH_SCROLL_DURATION = 420
const activeScrollAnimations = new WeakMap<HTMLElement, number>()

function slugify(value: string) {
  return (
    value.toLowerCase().trim().replace(SLUG_CLEANUP_PATTERN, '-').replace(EDGE_DASH_PATTERN, '') ||
    'section'
  )
}

function createUniqueId(baseId: string, usedIds: Set<string>) {
  let nextId = baseId
  let suffix = 2

  while (usedIds.has(nextId)) {
    nextId = `${baseId}-${suffix}`
    suffix += 1
  }

  usedIds.add(nextId)
  return nextId
}

export function buildTocItems(headings: Element[]): TocItem[] {
  const usedIds = new Set<string>()
  const nextItems: TocItem[] = []

  for (const heading of headings) {
    const title = heading.textContent?.trim()
    if (!title) {
      continue
    }

    const baseId = heading.id || slugify(title)
    const id = createUniqueId(baseId, usedIds)
    heading.id = id

    nextItems.push({
      depth: heading.tagName === 'H3' ? 3 : 2,
      id,
      title,
    })
  }

  return nextItems
}

function getLinkClass(item: TocItem, variant: TableOfContentsVariant) {
  const compactList = variant === 'embedded' || variant === 'inline'

  // Color/surface/border/radius live in the `.mdx-toc-link*` recipes
  // (mdx-blocks.css), keyed on data-active / data-depth. Only layout geometry
  // stays as inline utilities here.
  return clsx(
    'mdx-toc-link relative outline-none transition-colors duration-150',
    compactList && 'mdx-toc-link-inline flex min-h-8 items-center px-2 py-1.5 text-sm',
    variant === 'rail' && 'mdx-toc-link-rail block py-px pr-2 text-[0.8125rem] leading-[1.0625rem]',
    compactList && item.depth === 3 && 'pl-5',
    variant === 'rail' && item.depth === 3 && 'pl-3 text-xs leading-4'
  )
}

function getContentHeadings(contentRoot: Element, headingSelector: string) {
  return Array.from(contentRoot.querySelectorAll(headingSelector)).filter(
    heading => !heading.closest('[data-page-nav], [data-toc-exclude]')
  )
}

function areTocItemsEqual(currentItems: TocItem[], nextItems: TocItem[]) {
  if (currentItems.length !== nextItems.length) {
    return false
  }

  return currentItems.every((item, index) => {
    const nextItem = nextItems.at(index)
    return (
      item.depth === nextItem?.depth && item.id === nextItem.id && item.title === nextItem.title
    )
  })
}

function getPreferredElement(selector: string) {
  const selectors = selector
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

  for (const selectorPart of selectors) {
    const element = document.querySelector(selectorPart)
    if (element) {
      return element
    }
  }

  return null
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3
}

function setElementScrollTop(element: HTMLElement, top: number) {
  element.scrollTop = top
}

function scrollElementTo(element: HTMLElement, top: number, smooth: boolean, duration: number) {
  const targetTop = Math.max(0, Math.min(top, element.scrollHeight - element.clientHeight))
  const activeAnimation = activeScrollAnimations.get(element)

  if (activeAnimation) {
    window.cancelAnimationFrame(activeAnimation)
    activeScrollAnimations.delete(element)
  }

  if (!smooth) {
    setElementScrollTop(element, targetTop)
    return
  }

  const startTop = element.scrollTop
  const distance = targetTop - startTop

  if (Math.abs(distance) < 1) {
    return
  }

  const startTime = performance.now()

  const step = (time: number) => {
    const elapsed = time - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeOutCubic(progress)

    setElementScrollTop(element, startTop + distance * eased)

    if (progress < 1) {
      activeScrollAnimations.set(element, window.requestAnimationFrame(step))
    } else {
      activeScrollAnimations.delete(element)
    }
  }

  activeScrollAnimations.set(element, window.requestAnimationFrame(step))
}

/** Responsive article page navigation for MDX headings. */
export function PageTableOfContents({
  activeOffset = DEFAULT_ACTIVE_OFFSET,
  className,
  containerSelector = DEFAULT_CONTAINER_SELECTOR,
  headingSelector = DEFAULT_HEADING_SELECTOR,
  inlinePositionClassName = DEFAULT_INLINE_POSITION_CLASS_NAME,
  label = 'On this page',
  onActiveLabelChange,
  onNavigate,
  scrollOffset = DEFAULT_SCROLL_OFFSET,
  showProgress = true,
  smoothScrollDuration = DEFAULT_SMOOTH_SCROLL_DURATION,
  variant = 'rail',
}: PageTableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const activeIdRef = useRef<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const activeItem = items.find(item => item.id === activeId)
  const activeLabel = activeItem?.title ?? label
  const reducedMotion = useReducedMotion()
  const itemsRef = useRef<TocItem[]>([])
  const scrollProgressRef = useRef(0)

  useEffect(() => {
    onActiveLabelChange?.(activeLabel)
  }, [activeLabel, onActiveLabelChange])

  const handleItemClick = (event: MouseEvent<HTMLAnchorElement>, item: TocItem) => {
    const target = document.getElementById(item.id)
    if (!target) {
      return
    }

    event.preventDefault()
    activeIdRef.current = item.id
    setActiveId(item.id)
    setMenuOpen(false)
    onNavigate?.()

    const contentRoot = getPreferredElement(containerSelector)
    if (!(contentRoot instanceof HTMLElement)) {
      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      return
    }

    const targetTop = target.getBoundingClientRect().top
    const containerTop = contentRoot.getBoundingClientRect().top
    const scrollTop = targetTop - containerTop + contentRoot.scrollTop - scrollOffset

    scrollElementTo(contentRoot, scrollTop, !reducedMotion, smoothScrollDuration)
  }

  useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  useEffect(() => {
    const contentRoot = getPreferredElement(containerSelector)
    if (!contentRoot) {
      return
    }

    let headings: Element[] = []
    let nextItems: TocItem[] = []
    let updateFrame = 0

    const updateScrollState = () => {
      const totalScroll = contentRoot.scrollHeight - contentRoot.clientHeight
      const progress =
        totalScroll <= 0 ? 0 : Math.min((contentRoot.scrollTop / totalScroll) * 100, 100)
      if (Math.abs(scrollProgressRef.current - progress) > 0.1) {
        scrollProgressRef.current = progress
        setScrollProgress(progress)
      }

      if (nextItems.length === 0) {
        if (activeIdRef.current !== null) {
          activeIdRef.current = null
          setActiveId(null)
        }

        return
      }

      const activeLine = contentRoot.getBoundingClientRect().top + activeOffset
      let nextActiveId = nextItems.at(0)?.id ?? null

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > activeLine) {
          break
        }

        nextActiveId = heading.id
      }

      if (activeIdRef.current !== nextActiveId) {
        activeIdRef.current = nextActiveId
        setActiveId(nextActiveId)
      }
    }

    const scheduleScrollStateUpdate = () => {
      if (updateFrame) {
        return
      }

      updateFrame = window.requestAnimationFrame(() => {
        updateFrame = 0
        updateScrollState()
      })
    }

    const refreshItems = () => {
      headings = getContentHeadings(contentRoot, headingSelector)
      nextItems = buildTocItems(headings)

      if (!areTocItemsEqual(itemsRef.current, nextItems)) {
        itemsRef.current = nextItems
        setItems(nextItems)
      }

      scheduleScrollStateUpdate()
    }

    const observer = new MutationObserver(refreshItems)

    refreshItems()
    observer.observe(contentRoot, { childList: true, subtree: true })
    contentRoot.addEventListener('scroll', scheduleScrollStateUpdate, { passive: true })
    window.addEventListener('resize', scheduleScrollStateUpdate)
    window.addEventListener('hashchange', scheduleScrollStateUpdate)

    return () => {
      if (updateFrame) {
        window.cancelAnimationFrame(updateFrame)
      }

      observer.disconnect()
      contentRoot.removeEventListener('scroll', scheduleScrollStateUpdate)
      window.removeEventListener('resize', scheduleScrollStateUpdate)
      window.removeEventListener('hashchange', scheduleScrollStateUpdate)
    }
  }, [activeOffset, containerSelector, headingSelector])

  useEffect(() => {
    if (!menuOpen || variant !== 'inline') {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) {
        return
      }

      setMenuOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, variant])

  if (items.length === 0) {
    return null
  }

  if (variant === 'embedded') {
    return (
      <nav aria-label={label} className={clsx('flex flex-col gap-1', className)}>
        {items.map(item => (
          <a
            aria-current={item.id === activeId ? 'location' : undefined}
            className={getLinkClass(item, variant)}
            data-active={item.id === activeId}
            data-depth={item.depth}
            href={`#${item.id}`}
            key={item.id}
            onClick={event => handleItemClick(event, item)}
          >
            {item.title}
          </a>
        ))}
      </nav>
    )
  }

  if (variant === 'menu') {
    return (
      <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Open ${label.toLowerCase()}`}
              className={className}
              size="sm"
              type="button"
              variant="outline"
            />
          }
        >
          <ListTree aria-hidden className="size-4" />
          {label}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 min-w-56 overflow-y-auto">
          {items.map(item => (
            <DropdownMenuItem
              key={item.id}
              render={
                <a
                  aria-current={item.id === activeId ? 'location' : undefined}
                  data-depth={item.depth}
                  href={`#${item.id}`}
                  onClick={event => handleItemClick(event, item)}
                >
                  <span className={clsx(item.depth === 3 && 'pl-3')}>{item.title}</span>
                </a>
              }
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'inline') {
    if (!portalRoot) {
      return null
    }

    return createPortal(
      <div
        className={clsx('pointer-events-none', inlinePositionClassName, className)}
        data-page-nav=""
        ref={menuRef}
      >
        <ConnectedPanel
          className="pointer-events-auto"
          collapsedWidth={192}
          expandedWidth={256}
          onOpenChange={setMenuOpen}
          open={menuOpen}
        >
          <ConnectedPanelTrigger
            aria-label="Open page navigation"
            className="h-11 md:h-7"
            icon={<ListTree aria-hidden className="mdx-toc-icon size-4 shrink-0" />}
            summary={activeLabel}
          />
          {showProgress ? (
            <span className="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-transparent">
              <motion.span
                animate={{ scaleX: scrollProgress / 100 }}
                className="mdx-toc-progress block h-full origin-left"
                initial={false}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.18 }}
              />
            </span>
          ) : null}
          <ConnectedPanelContent>
            <ConnectedPanelBody className="p-2">
              <nav aria-label={label} className="flex flex-col gap-1">
                <div className="scrollbar-reveal max-h-64 overflow-y-auto overscroll-contain">
                  {items.map(item => (
                    <a
                      aria-current={item.id === activeId ? 'location' : undefined}
                      className={getLinkClass(item, variant)}
                      data-active={item.id === activeId}
                      data-depth={item.depth}
                      href={`#${item.id}`}
                      key={item.id}
                      onClick={event => handleItemClick(event, item)}
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              </nav>
            </ConnectedPanelBody>
          </ConnectedPanelContent>
        </ConnectedPanel>
      </div>,
      portalRoot
    )
  }

  return (
    <aside
      className={clsx(
        'not-mdx mdx-page-nav sticky top-8 hidden max-h-[calc(100dvh-4rem)] overflow-y-auto xl:block',
        className
      )}
    >
      <nav aria-label={label} className="flex flex-col gap-2" data-page-nav="">
        <p className="mdx-toc-title flex items-center gap-1.5 text-[0.8125rem] leading-[1.0625rem] font-medium">
          <ListTree aria-hidden className="mdx-toc-icon size-3" />
          {label}
        </p>
        <div className="flex flex-col gap-1">
          {items.map(item => (
            <a
              aria-current={item.id === activeId ? 'location' : undefined}
              className={getLinkClass(item, variant)}
              data-active={item.id === activeId}
              data-depth={item.depth}
              href={`#${item.id}`}
              key={item.id}
              onClick={event => handleItemClick(event, item)}
            >
              {item.title}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  )
}
