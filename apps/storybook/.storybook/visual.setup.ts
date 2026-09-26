// Visual regression: after each story renders, compare the page against its
// committed baseline. Baselines are generated and compared only on CI's Linux
// runner; see apps/storybook/README.md.
import { afterEach, expect } from 'vitest'
import { page } from 'vitest/browser'

import { freezeMotion, pinRemoteImages, settleMedia } from './stable-media'

freezeMotion()
pinRemoteImages()

/* Matches the `visual` project's instance viewport in vitest.config.ts. */
const VIEWPORT = { width: 1280, height: 800 }
/* The outer page height in vitest.config.ts; taller stories are cut here. */
const MAX_HEIGHT = 10000

afterEach(async ({ task }) => {
  const storyId = task.meta.storyId
  if (!storyId || task.result?.state === 'fail') return
  await settleMedia()
  // Only the viewport is painted in the capture, so a story taller than the
  // viewport would come out blank below the fold. Grow the viewport to the page.
  const height = Math.min(
    MAX_HEIGHT,
    Math.max(VIEWPORT.height, Math.ceil(document.documentElement.scrollHeight))
  )
  if (height > VIEWPORT.height) {
    await page.viewport(VIEWPORT.width, height)
    // Let the page lay out at the new size before capturing.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  }
  // The body, not the story root, so portalled overlays (dialogs, menus,
  // tooltips) are part of the image.
  await expect.element(page.elementLocator(document.body)).toMatchScreenshot(storyId, {
    // Full-size captures of tall stories take longer to settle than the 5 s default.
    timeout: 15_000,
  })
})
