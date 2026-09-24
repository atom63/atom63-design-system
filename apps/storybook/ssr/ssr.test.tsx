/**
 * Server-rendering smoke test: every story renders to a string in Node, where
 * `window` and `document` do not exist. A component that touches browser
 * globals during import or render breaks server-rendered apps (Next.js, Remix)
 * and fails here. Effects do not run on the server, so browser access inside
 * `useEffect` is fine. The Storybook preview is not applied: its only
 * decorator sets personalization attributes in an effect.
 */
import { composeStories } from '@storybook/react-vite'
import type { ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

type StoryModule = Parameters<typeof composeStories>[0]

const modules = import.meta.glob<StoryModule>('../../../packages/ui-react/src/**/*.stories.tsx', {
  eager: true,
})

it('finds the story files', () => {
  expect(Object.keys(modules).length).toBeGreaterThan(0)
})

for (const [file, module] of Object.entries(modules)) {
  describe(file.replace('../../../packages/ui-react/src/', ''), () => {
    // The glob loses each file's story types; a composed story is a component.
    const stories = composeStories(module) as Record<string, ComponentType>
    for (const [name, Story] of Object.entries(stories)) {
      it(name, () => {
        expect(renderToString(<Story />)).toEqual(expect.any(String))
      })
    }
  })
}
