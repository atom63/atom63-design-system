import { describe, expect, it } from 'vitest'
import { blockMdxComponents } from '../mdx-components'
import { portableBlockNames } from './index'

describe('block registry', () => {
  // Guards the published contract: any block auto-registered in the MDX
  // provider map MUST also be a recognized portable block name. (The reverse
  // is intentionally NOT required — a few blocks like Compare/KeyIdea/LayerStack
  // are portable-by-import but not auto-registered.)
  it('every auto-registered block is a known portable block name', () => {
    const portable = new Set<string>(portableBlockNames)
    const registered = Object.keys(blockMdxComponents)
    const missing = registered.filter(name => !portable.has(name))
    expect(missing).toEqual([])
  })
})
