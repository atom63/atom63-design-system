'use client'

import {
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../components/button'
import { Frame, FrameFooter, FramePanel } from '../../components/frame'
import { ScrollArea } from '../../components/scroll-area'
import { ATOM63_FLYOUT_TRANSITION_CSS } from '../../lib/motion'
import { AppearancePanel } from './appearance-panel'
import type { AppearanceSectionId } from './appearance-panel'
import type { PersonalizationController } from '../core/types'

const DEFAULT_SHORTCUT_LABEL = 'Cmd+,'
const FLYOUT_CLOSED_TRANSFORM = 'translate3d(0, calc(100% + 0.75rem), 0)'

export interface AppearanceMenuProps {
  className?: string
  closeLabel?: string
  controller: PersonalizationController
  defaultOpen?: boolean
  description?: string
  enableShortcut?: boolean
  ignoreOutsideSelector?: string
  onOpenChange?: (open: boolean) => void
  open?: boolean
  panelClassName?: string
  resetLabel?: string
  /** Allow-list of appearance sections to render in the panel body. */
  sections?: readonly AppearanceSectionId[]
  shortcutLabel?: string
  showTrigger?: boolean
  title?: string
  triggerLabel?: string
}

export interface AppearanceMenuTriggerProps extends Omit<
  ComponentProps<typeof Button>,
  'aria-expanded' | 'aria-haspopup' | 'onClick'
> {
  label?: string
  onOpenChange: (open: boolean) => void
  open: boolean
  shortcutLabel?: string
}

function getMenuMotionStyle(open: boolean, reduceMotion: boolean): CSSProperties {
  if (reduceMotion) {
    return { opacity: open ? 1 : 0, transform: 'translate3d(0, 0, 0)' }
  }
  return {
    opacity: open ? 1 : 0,
    transform: open ? 'translate3d(0, 0, 0)' : FLYOUT_CLOSED_TRANSFORM,
    transition: [
      `transform ${ATOM63_FLYOUT_TRANSITION_CSS.duration} ${ATOM63_FLYOUT_TRANSITION_CSS.easing}`,
      `opacity ${ATOM63_FLYOUT_TRANSITION_CSS.duration} ${ATOM63_FLYOUT_TRANSITION_CSS.easing}`,
      `filter ${ATOM63_FLYOUT_TRANSITION_CSS.duration} ${ATOM63_FLYOUT_TRANSITION_CSS.easing}`,
    ].join(', '),
    willChange: 'transform, opacity, filter',
  }
}

/**
 * Floating appearance flyout — the menu wrapper around {@link AppearancePanel}.
 * Opens bottom-right (portal), toggled by a trigger button and/or the `Cmd+,`
 * shortcut. Web apps typically render it with `showTrigger={false}` and rely on
 * the shortcut; OS shells embed the bare `AppearancePanel` in a settings surface
 * instead.
 */
export function AppearanceMenu({
  className,
  closeLabel = 'Close preferences',
  controller,
  defaultOpen = false,
  description = 'Tune the interface without leaving the page.',
  enableShortcut = true,
  ignoreOutsideSelector,
  onOpenChange,
  open,
  panelClassName,
  resetLabel = 'Reset all',
  sections,
  shortcutLabel = DEFAULT_SHORTCUT_LABEL,
  showTrigger = true,
  title = 'Preferences',
  triggerLabel = 'Preferences',
}: AppearanceMenuProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [renderOpen, setRenderOpen] = useState(defaultOpen)
  const [visible, setVisible] = useState(defaultOpen)
  const [reduceMotion, setReduceMotion] = useState(false)
  const isControlled = open !== undefined
  const isOpen = open ?? internalOpen

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setReduceMotion(query.matches)
    handleChange()
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setRenderOpen(true)
      const frame = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(frame)
    }
    setVisible(false)
    if (reduceMotion) {
      setRenderOpen(false)
      return
    }
    const timeout = window.setTimeout(
      () => setRenderOpen(false),
      ATOM63_FLYOUT_TRANSITION_CSS.durationMs
    )
    return () => window.clearTimeout(timeout)
  }, [isOpen, reduceMotion])

  useEffect(() => {
    if (!(enableShortcut && typeof window !== 'undefined')) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault()
        setOpen(!isOpen)
        return
      }
      if (event.key === 'Escape' && isOpen) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableShortcut, isOpen, setOpen])

  useEffect(() => {
    if (!(isOpen && typeof document !== 'undefined')) {
      return
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target) ||
        (ignoreOutsideSelector &&
          target instanceof Element &&
          target.closest(ignoreOutsideSelector))
      ) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [ignoreOutsideSelector, isOpen, setOpen])

  const menu =
    (isOpen || renderOpen) && typeof document !== 'undefined'
      ? createPortal(
          <div
            aria-labelledby={titleId}
            className="fixed inset-x-3 bottom-3 z-200 w-auto rounded-2xl backdrop-blur-2xl sm:right-4 sm:bottom-4 sm:left-auto sm:w-[24rem]"
            data-slot="appearance-menu-popover"
            data-state={visible ? 'open' : 'closed'}
            ref={panelRef}
            role="dialog"
            style={getMenuMotionStyle(visible, reduceMotion)}
          >
            <Frame
              className={`bg-muted/78 shadow-xl backdrop-blur-2xl ${panelClassName ?? ''}`}
              style={{ maxHeight: 'min(86svh, 42rem)' }}
            >
              <FramePanel className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background/84 p-0 backdrop-blur-xl">
                <header className="flex items-start justify-between gap-3 border-b border-border/80 px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold" id={titleId}>
                      {title}
                    </h2>
                    {description ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    ) : null}
                  </div>
                  <Button
                    aria-label={closeLabel}
                    className="-me-1 -mt-1 shrink-0"
                    onClick={() => setOpen(false)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <svg
                      aria-hidden
                      fill="none"
                      height="16"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="16"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </Button>
                </header>

                <ScrollArea
                  className="overflow-hidden"
                  scrollFade
                  showScrollbarOnHover
                  style={{ height: 'min(60svh, 32rem)' }}
                >
                  <div className="p-4">
                    <AppearancePanel controller={controller} sections={sections} />
                  </div>
                </ScrollArea>
              </FramePanel>

              <FrameFooter className="flex items-center justify-between gap-3 px-4 py-3">
                <kbd className="rounded border border-border/70 bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {shortcutLabel}
                </kbd>
                <Button onClick={controller.reset} size="sm" type="button" variant="secondary">
                  {resetLabel}
                </Button>
              </FrameFooter>
            </Frame>
          </div>,
          document.body
        )
      : null

  return (
    <>
      {showTrigger ? (
        <AppearanceMenuTrigger
          className={className}
          label={triggerLabel}
          onOpenChange={setOpen}
          open={isOpen}
          ref={triggerRef}
          shortcutLabel={shortcutLabel}
        />
      ) : null}
      {menu}
    </>
  )
}

export function AppearanceMenuTrigger({
  label = 'Preferences',
  onKeyDown,
  onOpenChange,
  open,
  shortcutLabel = DEFAULT_SHORTCUT_LABEL,
  ...props
}: AppearanceMenuTriggerProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) {
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      onOpenChange(true)
    }
  }

  return (
    <Button
      aria-expanded={open}
      aria-haspopup="dialog"
      data-slot="appearance-menu-trigger"
      onClick={() => onOpenChange(!open)}
      onKeyDown={handleKeyDown}
      size="sm"
      type="button"
      variant="ghost"
      {...props}
    >
      <span>{label}</span>
      <kbd className="hidden rounded border border-border/70 bg-background/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
        {shortcutLabel}
      </kbd>
    </Button>
  )
}
