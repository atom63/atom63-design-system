import { MediaLightbox, type MediaLightboxItem } from '@atom63/ui-react/media'
import { useEffect, useRef, useState } from 'react'
import { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from './constants'
import { collectFigureLightboxImages, markFigureLightboxOpen } from './open-lightbox'

export type FigureLightboxHostProps = {
  children: React.ReactNode
  /**
   * Optional gallery filter. When omitted (default), every `button[data-pswp-src]`
   * in the subtree is handled — including ImageBlock / ImageGrid custom gallery ids.
   */
  galleryId?: string
}

type Gallery = {
  items: MediaLightboxItem[]
  triggers: HTMLElement[]
}

/** Resolve a lightbox trigger from a click target (any gallery). */
export function resolveLightboxTrigger(target: Element): HTMLElement | null {
  return target.closest<HTMLElement>('button[data-pswp-src]')
}

/** The morph grows out of the picture inside the trigger, not the button around it. */
function originFor(trigger: HTMLElement | undefined) {
  return trigger?.querySelector<HTMLElement>('img, video') ?? trigger ?? null
}

/**
 * Single delegated click handler for all figure lightbox triggers in MDX content.
 * Mount once per MDX root (via MDXContentProvider). The gallery opens in the
 * design system's `MediaLightbox`.
 */
export function FigureLightboxHost({ children, galleryId }: FigureLightboxHostProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [gallery, setGallery] = useState<Gallery>({ items: [], triggers: [] })
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [origin, setOrigin] = useState<HTMLElement | null>(null)

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
      const {
        images,
        index: clickedIndex,
        triggers,
      } = collectFigureLightboxImages(triggerGalleryId, trigger)
      if (images.length === 0) {
        return
      }

      setGallery({
        items: images.map((image, imageIndex) => ({
          id: `${triggerGalleryId}-${imageIndex}-${image.src}`,
          src: image.src,
          alt: image.alt ?? '',
          title: image.alt || image.caption || 'Image',
          caption: image.caption,
        })),
        triggers,
      })
      setIndex(clickedIndex)
      setOrigin(originFor(triggers[clickedIndex]))
      setOpen(true)
    }

    // Bubble from subtree (works with `display: contents` host).
    root.addEventListener('click', handleClick)
    return () => {
      root.removeEventListener('click', handleClick)
    }
  }, [galleryId])

  useEffect(() => {
    if (!open) {
      return
    }
    markFigureLightboxOpen(true)
    return () => markFigureLightboxOpen(false)
  }, [open])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Morph back to the picture now on screen, which a swipe may have changed.
      setOrigin(originFor(gallery.triggers[index]))
    }
    setOpen(next)
  }

  return (
    <div className="contents" data-figure-lightbox-host="" ref={rootRef}>
      {children}
      {gallery.items.length > 0 ? (
        <MediaLightbox
          index={index}
          items={gallery.items}
          onIndexChange={setIndex}
          onOpenChange={handleOpenChange}
          open={open}
          origin={origin}
        />
      ) : null}
    </div>
  )
}
