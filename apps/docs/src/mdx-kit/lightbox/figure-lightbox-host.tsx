import { useEffect, useRef } from 'react'
import { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from './constants'
import { collectFigureLightboxImages, openFigureLightbox } from './open-lightbox'

export type FigureLightboxHostProps = {
  children: React.ReactNode
  /**
   * Optional gallery filter. When omitted (default), every `button[data-pswp-src]`
   * in the subtree is handled — including ImageBlock / ImageGrid custom gallery ids.
   */
  galleryId?: string
}

/** Resolve a lightbox trigger from a click target (any gallery). */
export function resolveLightboxTrigger(target: Element): HTMLElement | null {
  return target.closest<HTMLElement>('button[data-pswp-src]')
}

/**
 * Single delegated click handler for all figure lightbox triggers in MDX content.
 * Mount once per MDX root (via MDXContentProvider).
 */
export function FigureLightboxHost({ children, galleryId }: FigureLightboxHostProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const trigger = resolveLightboxTrigger(target)
      if (!trigger || !root.contains(trigger)) {
        return
      }

      const triggerGalleryId =
        trigger.getAttribute('data-gallery-id') || MDX_FIGURE_LIGHTBOX_GALLERY_ID

      if (galleryId && triggerGalleryId !== galleryId) {
        return
      }

      event.preventDefault()
      const { images, index } = collectFigureLightboxImages(triggerGalleryId, trigger)
      void openFigureLightbox(images, index)
    }

    // Bubble from subtree (works with `display: contents` host).
    root.addEventListener('click', handleClick)
    return () => {
      root.removeEventListener('click', handleClick)
    }
  }, [galleryId])

  return (
    <div className="contents" data-figure-lightbox-host="" ref={rootRef}>
      {children}
    </div>
  )
}
