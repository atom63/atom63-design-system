// Visual regression: after each story renders, compare the page against its
// committed baseline. Baselines are generated and compared only on CI's Linux
// runner; see apps/storybook/README.md.
import { afterEach, beforeEach, expect } from 'vitest'
import { page } from 'vitest/browser'

import { freezeMotion, pinRemoteImages, settleMedia } from './stable-media'

freezeMotion()
pinRemoteImages()

/* Matches the `visual` project's instance viewport in vitest.config.ts. */
const VIEWPORT = { width: 1280, height: 800 }
/* The outer page height in vitest.config.ts; taller stories are cut here. */
const MAX_HEIGHT = 10000
/* A story whose id ends in `-phone` (a `Phone` export) renders and is captured
   at a phone width, so layouts that change below `sm` get a baseline too. */
const PHONE_VIEWPORT = { width: 390, height: 844 }
const isPhoneStory = (storyId: string | undefined) => storyId?.endsWith('-phone') ?? false

// Restore the desktop width only after a phone story, so every other story
// keeps the viewport it has always been captured with.
let phoneViewportSet = false

beforeEach(async ({ task }) => {
  if (isPhoneStory(task.meta.storyId)) {
    await page.viewport(PHONE_VIEWPORT.width, PHONE_VIEWPORT.height)
    phoneViewportSet = true
  } else if (phoneViewportSet) {
    await page.viewport(VIEWPORT.width, VIEWPORT.height)
    phoneViewportSet = false
  }
})

afterEach(async ({ task }) => {
  const storyId = task.meta.storyId
  if (!storyId || task.result?.state === 'fail') return
  await settleMedia()
  // Only the viewport is painted in the capture, so a story taller than the
  // viewport would come out blank below the fold. Grow the viewport to the page.
  const viewport = isPhoneStory(storyId) ? PHONE_VIEWPORT : VIEWPORT
  const height = Math.min(
    MAX_HEIGHT,
    Math.max(viewport.height, Math.ceil(document.documentElement.scrollHeight))
  )
  if (height > viewport.height) {
    await page.viewport(viewport.width, height)
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
