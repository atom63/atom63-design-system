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
const STORY_VIEWPORTS = {
  wide: { width: 1440, height: 960 },
  compact: { width: 1024, height: 800 },
  tablet: { width: 768, height: 1024 },
  phone: { width: 390, height: 844 },
} as const

const viewportForStory = (storyId: string | undefined) => {
  if (storyId?.endsWith('-phone')) return STORY_VIEWPORTS.phone
  if (!storyId?.startsWith('templates-pages-list-page--')) return VIEWPORT

  const entry = Object.entries(STORY_VIEWPORTS)
    .filter(([suffix]) => suffix !== 'phone')
    .find(([suffix]) => storyId.endsWith(`-${suffix}`))
  return entry?.[1] ?? VIEWPORT
}

beforeEach(async ({ task }) => {
  const viewport = viewportForStory(task.meta.storyId)
  await page.viewport(viewport.width, viewport.height)
})

afterEach(async ({ task }) => {
  const storyId = task.meta.storyId
  if (!storyId || task.result?.state === 'fail') return
  await settleMedia()
  // Only the viewport is painted in the capture, so a story taller than the
  // viewport would come out blank below the fold. Grow the viewport to the page.
  const viewport = viewportForStory(storyId)
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
