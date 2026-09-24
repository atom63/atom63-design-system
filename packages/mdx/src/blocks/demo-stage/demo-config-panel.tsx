import { SlidersHorizontal } from 'lucide-react'
import { clsx } from 'clsx'
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  Toggle,
} from '@atom63/ui-react'

const DEFAULT_MOBILE_QUERY = '(max-width: 767px)'
const DEFAULT_PANEL_INSET = 16
const DEFAULT_PANEL_WIDTH = 320

function useControllableOpen({
  defaultOpen = false,
  onOpenChange,
  open,
}: {
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const value = isControlled ? open : internalOpen

  const setValue = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  return [value, setValue] as const
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const updateMatches = () => setMatches(media.matches)

    updateMatches()
    media.addEventListener('change', updateMatches)

    return () => media.removeEventListener('change', updateMatches)
  }, [query])

  return matches
}

export type DemoConfigPanelProps = {
  children: ReactNode
  defaultOpen?: boolean
  label?: ReactNode
  mobileQuery?: string
  onOpenChange?: (open: boolean) => void
  open?: boolean
  panelClassName?: string
  panelInset?: number
  panelWidth?: number
  sheetClassName?: string
  sheetPanelClassName?: string
  stageRef: RefObject<HTMLElement | null>
  title?: string
}

export function DemoConfigPanel({
  children,
  defaultOpen,
  label = 'Tune',
  mobileQuery = DEFAULT_MOBILE_QUERY,
  onOpenChange,
  open,
  panelClassName,
  panelInset = DEFAULT_PANEL_INSET,
  panelWidth = DEFAULT_PANEL_WIDTH,
  sheetClassName,
  sheetPanelClassName,
  stageRef,
  title = 'Demo controls',
}: DemoConfigPanelProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>()
  const [isOpen, setIsOpen] = useControllableOpen({ defaultOpen, onOpenChange, open })
  const isMobile = useMediaQuery(mobileQuery)

  useLayoutEffect(() => {
    if (!isOpen || isMobile) {
      setPanelStyle(undefined)
      return
    }

    const updatePanelSize = () => {
      const stage = stageRef.current
      const trigger = triggerRef.current
      if (!stage || !trigger) {
        return
      }

      const stageRect = stage.getBoundingClientRect()
      const triggerRect = trigger.getBoundingClientRect()
      const height = Math.max(1, Math.floor(stageRect.bottom - triggerRect.bottom - panelInset * 2))
      const width = Math.max(1, Math.min(panelWidth, Math.floor(stageRect.width - panelInset * 2)))

      setPanelStyle({
        height,
        position: 'absolute',
        right: 0,
        top: `calc(100% + ${panelInset}px)`,
        width,
      })
    }

    updatePanelSize()
    const frame = window.requestAnimationFrame(updatePanelSize)
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updatePanelSize)

    if (observer) {
      if (stageRef.current) {
        observer.observe(stageRef.current)
      }
      if (triggerRef.current) {
        observer.observe(triggerRef.current)
      }
    }

    window.addEventListener('resize', updatePanelSize)

    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', updatePanelSize)
    }
  }, [isMobile, isOpen, panelInset, panelWidth, stageRef])

  return (
    <div className="relative" ref={triggerRef}>
      <Toggle
        aria-expanded={isOpen}
        aria-label={typeof label === 'string' ? `Toggle ${label.toLowerCase()} controls` : title}
        aria-haspopup="dialog"
        onPressedChange={setIsOpen}
        pressed={isOpen}
        size="sm"
      >
        <SlidersHorizontal aria-hidden="true" className="size-3.5" />
        {label}
      </Toggle>
      {isOpen && !isMobile ? (
        <div
          aria-label={title}
          className={clsx(
            'mdx-demo-config-panel mdx-demo-config-panel--desktop overflow-hidden',
            panelClassName
          )}
          role="dialog"
          style={panelStyle}
        >
          <ScrollArea
            className="mdx-demo-config-panel__scroll"
            showScrollbarOnHover
            viewportClassName="mdx-demo-config-panel__viewport overscroll-contain"
          >
            {children}
          </ScrollArea>
        </div>
      ) : null}
      <Sheet onOpenChange={setIsOpen} open={isOpen && isMobile}>
        <SheetContent
          className={clsx(
            'mdx-demo-config-panel mdx-demo-config-panel--sheet overflow-hidden',
            sheetClassName
          )}
          showCloseButton={false}
          side="bottom"
          style={{
            backgroundColor: 'var(--a63-surface-overlay)',
            backgroundImage: 'none',
            boxShadow: 'none',
          }}
          variant="default"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <SheetPanel
            className={clsx('mdx-demo-config-panel__sheet-panel', sheetPanelClassName)}
            scrollFade={false}
          >
            {children}
          </SheetPanel>
        </SheetContent>
      </Sheet>
    </div>
  )
}
