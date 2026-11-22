/**
 * Foreground occlusion check for LayeredScene: finds text and focusable
 * elements of the stage and of the plate's content region that sit under an
 * opaque pixel of a foreground cut-out.
 *
 * `findOccludedElements` runs in the browser and is self-contained (no imports,
 * no closures), so a Playwright script can pass it to `page.evaluate` as well
 * as a Vitest browser test calling it directly. The foreground picture must be
 * readable (same origin, a data: URL, or CORS-enabled); otherwise the result
 * lists it under `unreadable` instead of guessing.
 *
 * @param {Element} scene A `[data-slot="layered-scene"]` element.
 * @param {{ alpha?: number, step?: number }} [options] `alpha` is the opacity
 *   (0–1) from which a pixel counts as covering; `step` is the sampling grid in
 *   CSS px.
 * @returns {Promise<{ occluded: string[], unreadable: string[], checked: number }>}
 */
export async function findOccludedElements(scene, options = {}) {
  const alphaLimit = Math.round((options.alpha ?? 0.5) * 255)
  const step = options.step ?? 4
  const describe = element => {
    const label = element.getAttribute('aria-label') || element.textContent || ''
    return `${element.tagName.toLowerCase()} "${label.trim().replace(/\s+/g, ' ').slice(0, 40)}"`
  }

  const regions = scene.querySelectorAll(
    '[data-slot="layered-scene-content"], [data-slot="layered-scene-stage"], [data-slot="art-plate-content"]'
  )
  const targets = [...regions]
    .flatMap(region => [...region.querySelectorAll('*')])
    .filter(element => {
      const box = element.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) return false
      if (element.matches('a[href], button, input, select, textarea, [tabindex]')) return true
      return [...element.childNodes].some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
      )
    })

  const layers = []
  const unreadable = []
  for (const image of scene.querySelectorAll('[data-slot="layered-scene-foreground"] img')) {
    if (!image.complete) await image.decode().catch(() => {})
    const box = image.getBoundingClientRect()
    if (!image.naturalWidth || box.width === 0 || getComputedStyle(image).display === 'none') {
      continue
    }
    // Draw the picture the way object-fit: cover and object-position place it.
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(box.width)
    canvas.height = Math.ceil(box.height)
    const context = canvas.getContext('2d', { willReadFrequently: true })
    const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight)
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    const [x = '50%', y = '50%'] = getComputedStyle(image).objectPosition.split(' ')
    const offset = (value, free) =>
      value.endsWith('%') ? (free * Number.parseFloat(value)) / 100 : Number.parseFloat(value)
    context.drawImage(
      image,
      offset(x, box.width - width),
      offset(y, box.height - height),
      width,
      height
    )
    try {
      layers.push({ box, data: context.getImageData(0, 0, canvas.width, canvas.height) })
    } catch {
      unreadable.push(image.currentSrc || image.src)
    }
  }

  const occluded = []
  for (const element of targets) {
    const rect = element.getBoundingClientRect()
    const covered = layers.some(({ box, data }) => {
      for (let top = rect.top; top < rect.bottom; top += step) {
        for (let left = rect.left; left < rect.right; left += step) {
          const px = Math.floor(left - box.left)
          const py = Math.floor(top - box.top)
          if (px < 0 || py < 0 || px >= data.width || py >= data.height) continue
          if (data.data[(py * data.width + px) * 4 + 3] >= alphaLimit) return true
        }
      }
      return false
    })
    if (covered) occluded.push(describe(element))
  }
  return { occluded, unreadable, checked: targets.length }
}
