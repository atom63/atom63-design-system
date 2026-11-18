import type { BrowserCommand } from 'vitest/node'

/*
 * Moves the pointer to the bottom of the outer test page, below the story
 * iframe, so no story is captured in a hover state. Without it the pointer
 * rests at the page origin, which hovers whatever a story draws in its top-left
 * corner (widgets/Avatar Shuffle reveals its shuffle control there).
 */
const movePointerAway: BrowserCommand<[]> = async context => {
  if (context.provider.name !== 'playwright') return
  await context.page.mouse.move(1, 9999)
}

export const visualCommands = { movePointerAway }
