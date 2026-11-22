import { describe, expect, it } from 'vitest'
import { createMdxComponents } from '../article/create-mdx-components'
import { blockMdxComponents } from '../mdx-components'
import { portableBlockNames } from './index'

describe('block registry', () => {
  // Guards the published contract: the default MDX map registers exactly the
  // portable block names, so every portable block works in MDX without an
  // import and nothing unlisted is registered.
  it('every auto-registered block is a known portable block name', () => {
    const portable = new Set<string>(portableBlockNames)
    const registered = Object.keys(blockMdxComponents)
    const missing = registered.filter(name => !portable.has(name))
    expect(missing).toEqual([])
  })

  it('every portable block name resolves on the default maps', () => {
    const unresolved = portableBlockNames.filter(
      name =>
        blockMdxComponents[name as keyof typeof blockMdxComponents] == null ||
        createMdxComponents()[name as keyof ReturnType<typeof createMdxComponents>] == null
    )
    expect(unresolved).toEqual([])
  })
})
