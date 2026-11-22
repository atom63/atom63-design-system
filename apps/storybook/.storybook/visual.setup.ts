// Visual regression: after each story renders, compare the page against its
// committed baseline. Baselines are generated and compared only on CI's Linux
// runner; see apps/storybook/README.md.
import { afterEach, beforeEach, expect } from 'vitest'
import { commands, page, userEvent } from 'vitest/browser'

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

/* A story whose id ends in `--forced-colors` (a `ForcedColors` export) is
   captured with forced colors on, so the states a component must keep in
   Windows High Contrast get a baseline too. */
const isForcedColorsStory = (storyId: string | undefined) =>
  storyId?.endsWith('--forced-colors') ?? false

/*
 * `parameters.visualState` captures a story in an interaction state that only a
 * real pointer or keyboard produces. Each value is a CSS selector, resolved in
 * the story's document; the first visible match gets the state. See
 * apps/storybook/README.md, "Visual states".
 */
interface VisualStateParameters {
  /** Hover this element with the real pointer, so `:hover` matches. */
  hover?: string
  /** Tab to this element with the real keyboard, so `:focus-visible` matches. */
  focusVisible?: string
}

/* The most Tab presses spent reaching a `focusVisible` target. */
const MAX_TAB_STOPS = 50

const visualTarget = (selector: string) => {
  // The test page also holds hidden elements that are not the story's, so take
  // the first match that is rendered.
  const element = [...document.querySelectorAll<HTMLElement>(selector)].find(match =>
    match.checkVisibility()
  )
  if (!element) throw new Error(`parameters.visualState: no visible element matches "${selector}"`)
  return element
}

const applyVisualState = async (state: VisualStateParameters) => {
  if (state.hover) {
    const target = visualTarget(state.hover)
    await userEvent.hover(page.elementLocator(target))
    if (!target.matches(':hover'))
      throw new Error(`parameters.visualState: "${state.hover}" does not match :hover`)
  }
  if (!state.focusVisible) return
  // Programmatic focus does not always match :focus-visible after a pointer
  // event, so walk to the target with Tab from the top of the document.
  const target = visualTarget(state.focusVisible)
  ;(document.activeElement as HTMLElement | null)?.blur()
  for (let stop = 0; stop < MAX_TAB_STOPS && document.activeElement !== target; stop++) {
    await userEvent.tab()
  }
  if (document.activeElement !== target || !target.matches(':focus-visible')) {
    throw new Error(
      `parameters.visualState: Tab did not give "${state.focusVisible}" :focus-visible`
    )
  }
}

beforeEach(async ({ task }) => {
  const viewport = viewportForStory(task.meta.storyId)
  await page.viewport(viewport.width, viewport.height)
  await commands.emulateForcedColors(isForcedColorsStory(task.meta.storyId))
})

afterEach(async context => {
  const { task } = context
  const storyId = task.meta.storyId
  if (!storyId || task.result?.state === 'fail') return
  const story = (context as { story?: { parameters?: { visualState?: VisualStateParameters } } })
    .story
  const visualState = story?.parameters?.visualState
  // No story is captured in a hover state unless visualState asks for one; see
  // visual/commands.ts.
  await commands.movePointerAway()
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
  if (visualState) await applyVisualState(visualState)
  // The body, not the story root, so portalled overlays (dialogs, menus,
  // tooltips) are part of the image.
  await expect.element(page.elementLocator(document.body)).toMatchScreenshot(storyId, {
    // Full-size captures of tall stories take longer to settle than the 5 s default.
    timeout: 15_000,
  })
})

declare module 'vitest/browser' {
  interface BrowserCommands {
    emulateForcedColors: (active: boolean) => Promise<void>
    movePointerAway: () => Promise<void>
  }
}
