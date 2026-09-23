import type { PhotoSwipeImageData } from './types'

type ActivePhotoSwipe = {
  destroy(): void
  element?: HTMLElement
  init(): void
  on(event: 'beforeOpen' | 'destroy', callback: () => void): void
  options?: {
    padding?: ReturnType<typeof getResponsivePadding>
  }
}

const DEFAULT_OPTIONS = {
  showHideAnimationType: 'zoom' as const,
  bgOpacity: 0.9,
  closeOnVerticalDrag: true,
  pinchToClose: true,
  allowPanToNext: true,
  wheelToZoom: true,
  zoom: true,
  initialZoomLevel: 'fit' as const,
  secondaryZoomLevel: 2,
  maxZoomLevel: 4,
}

function getResponsivePadding() {
  const isMobile = window.innerWidth < 768
  return isMobile
    ? { top: 20, bottom: 40, left: 10, right: 10 }
    : { top: 20, bottom: 40, left: 100, right: 100 }
}

function normalizeDimension(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  return parsed > 0 ? parsed : fallback
}

function readTriggerImage(trigger: HTMLElement): PhotoSwipeImageData {
  return {
    src: trigger.getAttribute('data-pswp-src') ?? '',
    width: normalizeDimension(trigger.getAttribute('data-pswp-width') ?? undefined, 1200),
    height: normalizeDimension(trigger.getAttribute('data-pswp-height') ?? undefined, 800),
    alt: trigger.getAttribute('aria-label') ?? '',
    caption: trigger.getAttribute('data-pswp-caption') ?? undefined,
  }
}

/** Collect all lightbox triggers for a gallery id in DOM order. */
export function collectFigureLightboxImages(galleryId: string, clickedTrigger: HTMLElement) {
  const selector = [
    `button[data-pswp-src][data-gallery-id="${galleryId}"]`,
    `[data-gallery-id="${galleryId}"] button[data-pswp-src]`,
  ].join(', ')

  const triggers = document.querySelectorAll<HTMLElement>(selector)
  const images: PhotoSwipeImageData[] = []
  let clickedIndex = 0

  for (const trigger of triggers) {
    if (trigger === clickedTrigger) {
      clickedIndex = images.length
    }
    const image = readTriggerImage(trigger)
    if (image.src) {
      images.push(image)
    }
  }

  return { images, index: clickedIndex }
}

let activeLightbox: ActivePhotoSwipe | null = null
let photoSwipeStylesPromise: Promise<unknown> | null = null
/** Grace window so Escape that closes PhotoSwipe does not also dismiss a parent modal. */
let lightboxClosedAt = 0

function loadPhotoSwipeStyles() {
  photoSwipeStylesPromise ??= import('photoswipe/style.css')
  return photoSwipeStylesPromise
}

/** True while a figure lightbox is open (or just closed on this Escape tick). */
export function isFigureLightboxOpen() {
  if (activeLightbox) return true
  return Date.now() - lightboxClosedAt < 50
}

export async function openFigureLightbox(
  images: PhotoSwipeImageData[],
  index: number,
  options: Record<string, unknown> = {}
) {
  if (images.length === 0) {
    return
  }

  if (activeLightbox) {
    activeLightbox.destroy()
    activeLightbox = null
  }

  const [{ default: PhotoSwipe }] = await Promise.all([
    import('photoswipe'),
    loadPhotoSwipeStyles(),
  ])

  const safeIndex = Math.min(Math.max(index, 0), images.length - 1)

  const dataSource = images.map(image => ({
    src: image.src,
    width: image.width,
    height: image.height,
    alt: image.alt ?? '',
  }))

  const pswp = new PhotoSwipe({
    dataSource,
    index: safeIndex,
    padding: getResponsivePadding(),
    ...DEFAULT_OPTIONS,
    ...options,
  }) as ActivePhotoSwipe

  activeLightbox = pswp

  const handleResize = () => {
    if (pswp.options) {
      pswp.options.padding = getResponsivePadding()
    }
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleResize)

  pswp.on('beforeOpen', () => {
    document.documentElement.dataset.figureLightbox = 'open'
  })

  pswp.on('destroy', () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
    lightboxClosedAt = Date.now()
    delete document.documentElement.dataset.figureLightbox
    if (activeLightbox === pswp) {
      activeLightbox = null
    }
  })

  pswp.init()

  // Parent modals mark outside nodes aria-hidden/inert; clear that on the lightbox.
  const root = pswp.element
  if (root) {
    root.removeAttribute('aria-hidden')
    root.removeAttribute('inert')
    root.dataset.mediaOverlay = 'lightbox'
  }
}
