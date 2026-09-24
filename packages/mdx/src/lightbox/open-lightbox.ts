import type { PhotoSwipeImageData } from './types'

function normalizeDimension(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  return parsed > 0 ? parsed : fallback
}

function readTriggerImage(trigger: HTMLElement): PhotoSwipeImageData {
  return {
    src: trigger.getAttribute('data-pswp-src') ?? '',
    width: normalizeDimension(trigger.getAttribute('data-pswp-width') ?? undefined, 1200),
    height: normalizeDimension(trigger.getAttribute('data-pswp-height') ?? undefined, 800),
    alt: trigger.getAttribute('data-pswp-alt') ?? '',
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
  const imageTriggers: HTMLElement[] = []
  let clickedIndex = 0

  for (const trigger of triggers) {
    if (trigger === clickedTrigger) {
      clickedIndex = images.length
    }
    const image = readTriggerImage(trigger)
    if (image.src) {
      images.push(image)
      imageTriggers.push(trigger)
    }
  }

  return { images, index: clickedIndex, triggers: imageTriggers }
}

let openLightboxCount = 0
/** Grace window so Escape that closes the lightbox does not also dismiss a parent modal. */
let lightboxClosedAt = 0

/** Called by FigureLightboxHost when its lightbox opens or closes. */
export function markFigureLightboxOpen(open: boolean) {
  if (open) {
    openLightboxCount += 1
    return
  }
  openLightboxCount = Math.max(0, openLightboxCount - 1)
  lightboxClosedAt = Date.now()
}

/** True while a figure lightbox is open (or just closed on this Escape tick). */
export function isFigureLightboxOpen() {
  if (openLightboxCount > 0) return true
  return Date.now() - lightboxClosedAt < 50
}
