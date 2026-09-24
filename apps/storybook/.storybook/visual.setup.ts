// Visual regression: after each story renders, compare the page against its
// committed baseline. Baselines are generated and compared only on CI's Linux
// runner; see apps/storybook/README.md.
import { afterEach, expect } from 'vitest'
import { page } from 'vitest/browser'

// Freeze CSS motion so each story settles into one stable frame.
const freeze = document.createElement('style')
freeze.textContent = `*, *::before, *::after {
  animation-delay: 0s !important;
  animation-duration: 0s !important;
  animation-iteration-count: 1 !important;
  transition: none !important;
  caret-color: transparent !important;
}`
document.head.append(freeze)

// Remote images (picsum.photos, pravatar.cc in several stories) load at
// unpredictable times and can fail on CI. Rewrite every remote image URL to
// one fixed placeholder before the request is made, so an <img> rendered by
// React and a `new Image()` preload inside a component (Avatar waits for one
// before swapping out its fallback) both get the same pixels, immediately.
// Layout is still captured; only the pixels inside stay constant.
const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><rect width="16" height="9" fill="#8a94a6"/></svg>'
  )

function isRemote(value: unknown) {
  return typeof value === 'string' && /^(https?:)?\/\//.test(value)
}

const srcProperty = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!
Object.defineProperty(HTMLImageElement.prototype, 'src', {
  ...srcProperty,
  set(value: string) {
    srcProperty.set!.call(this, isRemote(value) ? PLACEHOLDER : value)
  },
})
const setAttribute = Element.prototype.setAttribute
Element.prototype.setAttribute = function (name: string, value: string) {
  if (this instanceof HTMLImageElement && name === 'srcset') return
  if (this instanceof HTMLImageElement && name === 'src' && isRemote(value)) value = PLACEHOLDER
  setAttribute.call(this, name, value)
}

async function settleImages() {
  // Some media components paint their image as a CSS background instead.
  for (const element of document.body.querySelectorAll<HTMLElement>('*')) {
    if (/url\(["']?https?:/.test(getComputedStyle(element).backgroundImage)) {
      element.style.setProperty('background-image', `url("${PLACEHOLDER}")`, 'important')
    }
  }
  await Promise.all([...document.images].map(image => image.decode().catch(() => {})))
}

/* Matches the `visual` project's instance viewport in vitest.config.ts. */
const VIEWPORT = { width: 1280, height: 800 }
/* The outer page height in vitest.config.ts; taller stories are cut here. */
const MAX_HEIGHT = 10000

afterEach(async ({ task }) => {
  const storyId = task.meta.storyId
  if (!storyId || task.result?.state === 'fail') return
  // `fonts.ready` only waits for fonts already requested, so load both
  // families explicitly before capturing.
  await Promise.all([
    document.fonts.load('400 16px Geist'),
    document.fonts.load('400 16px "Geist Mono"'),
  ])
  await document.fonts.ready
  await settleImages()
  // Only the viewport is painted in the capture, so a story taller than the
  // viewport would come out blank below the fold. Grow the viewport to the page.
  const height = Math.min(
    MAX_HEIGHT,
    Math.max(VIEWPORT.height, Math.ceil(document.documentElement.scrollHeight))
  )
  if (height > VIEWPORT.height) await page.viewport(VIEWPORT.width, height)
  // The body, not the story root, so portalled overlays (dialogs, menus,
  // tooltips) are part of the image.
  await expect.element(page.elementLocator(document.body)).toMatchScreenshot(storyId)
})
