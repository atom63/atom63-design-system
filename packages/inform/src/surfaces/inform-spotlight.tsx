import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../lib/cn'
import { InformIconSlot } from './icon-slot'
import { resolveInformIcon } from './severity-icon'
import { InformActions } from './inform-actions'
import { placeBubble } from './place-bubble'
import type { BubbleSize } from './place-bubble'
import { SEVERITY_TEXT_CLASS } from './severity'
import type { InformSurfaceProps } from './types'
import { useAnchorRect, useViewportSize } from './use-anchor-rect'

export type InformSpotlightProps = InformSurfaceProps & {
  open: boolean
  /** CSS selector for the element to highlight. */
  anchor: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/*
 * Before the bubble has been measured we assume zero height, which places it
 * directly below the anchor — the same spot the old implementation always used.
 * The layout effect corrects it before paint, so the guess is never visible.
 */
const UNMEASURED: BubbleSize = { width: 0, height: 0 }

/**
 * Blocking guide step: a scrim with a cutout over the anchor plus a bubble.
 * There is no primitive underneath, so focus trapping, Escape, focus
 * restoration, and scroll locking are implemented here.
 */
/**
 * Takes the rest of the page out of the accessibility tree while the spotlight
 * is open, and puts back exactly what it changed.
 *
 * `aria-modal` alone is not enough — several assistive technologies still let a
 * virtual cursor walk background content — and elements that were already inert
 * must stay inert afterwards, so only the ones this call marked are restored.
 */
function inertBackground(except: HTMLElement | null): () => void {
  if (typeof document === 'undefined') return () => undefined

  const marked: HTMLElement[] = []
  for (const child of document.body.children) {
    if (!(child instanceof HTMLElement)) continue
    if (except !== null && child.contains(except)) continue
    if (child.hasAttribute('inert')) continue

    child.setAttribute('inert', '')
    marked.push(child)
  }

  return () => {
    for (const element of marked) element.removeAttribute('inert')
  }
}

export function InformSpotlight({
  actions,
  anchor,
  body,
  className,
  icon,
  onDismiss,
  open,
  severity = 'info',
  title,
}: InformSpotlightProps): ReactElement | null {
  const resolvedIcon = resolveInformIcon(icon, severity)
  const rect = useAnchorRect(anchor, open)
  const viewport = useViewportSize(open)
  const [bubbleSize, setBubbleSize] = useState<BubbleSize | null>(null)
  const bubbleRef = useRef<HTMLDivElement | null>(null)
  // A dialog needs an accessible name: the title, or the body when there is none.
  const titleId = useId()
  const bodyId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const visible = open && rect !== null

  /*
   * Measure before paint, then keep watching. A ResizeObserver catches the
   * changes a render-time measurement misses — a late font, async content, a
   * longer translation. The equality guard means a re-measure that finds the
   * same box does not re-render.
   */
  useLayoutEffect(() => {
    if (!visible) {
      setBubbleSize(null)
      return
    }

    const element = bubbleRef.current
    if (element === null) return

    const measure = (): void => {
      const measured = element.getBoundingClientRect()
      setBubbleSize(previous =>
        previous !== null &&
        previous.width === measured.width &&
        previous.height === measured.height
          ? previous
          : { width: measured.width, height: measured.height }
      )
    }
    measure()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [visible, rect])

  useEffect(() => {
    if (!visible) return

    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const restoreBackground = inertBackground(rootRef.current)
    bubbleRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onDismiss?.()
        return
      }
      if (event.key !== 'Tab') return

      const bubble = bubbleRef.current
      if (bubble === null) return

      const focusable = [...bubble.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = focusable[0] ?? bubble
      const last = focusable.at(-1) ?? bubble

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreBackground()
      restoreRef.current?.focus()
    }
  }, [onDismiss, visible])

  if (!visible || rect === null) return null

  const placement = placeBubble({
    anchor: rect,
    bubble: bubbleSize ?? UNMEASURED,
    viewport,
  })

  /*
   * Portalled to <body> for two reasons: `position: fixed` is relative to a
   * transformed ancestor rather than the viewport, and the inert walk below
   * can only isolate the page if the overlay is a sibling of it rather than
   * living inside it.
   */
  return createPortal(
    <div className="a63-InformSpotlight" ref={rootRef}>
      {/*
        The cutout is an empty box over the anchor carrying a huge shadow
        spread: visually identical to a clip-path hole, without the polygon
        math, and the hole keeps a token-driven radius.
      */}
      <div
        aria-hidden
        className="a63-InformSpotlight-cutout"
        data-testid="inform-spotlight-cutout"
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      />
      <div
        aria-describedby={title === undefined ? undefined : bodyId}
        aria-labelledby={title === undefined ? bodyId : titleId}
        aria-modal="true"
        className={cn('a63-InformSpotlight-bubble', className)}
        data-severity={severity}
        data-side={placement.side}
        ref={bubbleRef}
        role="dialog"
        style={{ top: placement.top, left: placement.left }}
        tabIndex={-1}
      >
        {/*
          Same row structure as the banner and the flyout: the icon is a sibling
          of the text block, not a child of the title. Nesting it inside the
          title indents only that line, so the body ends up aligned with the
          icon instead of with the words above it.
        */}
        <div className="a63-Inform-row">
          {resolvedIcon === null ? null : <InformIconSlot>{resolvedIcon}</InformIconSlot>}
          <div className="a63-Inform-content">
            {title === undefined ? null : (
              <p className={cn('a63-Inform-title', SEVERITY_TEXT_CLASS[severity])} id={titleId}>
                {title}
              </p>
            )}
            <p className="a63-Inform-body" id={bodyId}>
              {body}
            </p>
            {actions === undefined ? null : <InformActions actions={actions} />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
