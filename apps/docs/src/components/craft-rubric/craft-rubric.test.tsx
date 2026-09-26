import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { craftCriteria } from '../../../../../scripts/design-system/lib/craft-rubric.mjs'
import pageSource from '../../pages/foundation-craft-rubric.mdx?raw'
import { CraftCriterion } from './craft-criterion'
import { craftExamples } from './craft-examples'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

describe('craft rubric page', () => {
  it('has one heading and one criterion block per criterion, in rubric order', () => {
    const blocks = [...pageSource.matchAll(/^## (.+)\n\n<CraftCriterion id="([^"]+)" \/>$/gm)]
    expect(blocks.map(([, name, id]) => ({ id, name }))).toEqual(
      craftCriteria.map(({ id, name }) => ({ id, name }))
    )
  })

  it('has a good and a bad example for every criterion and no others', () => {
    expect(Object.keys(craftExamples).sort()).toEqual(craftCriteria.map(({ id }) => id).sort())
  })

  it('renders every criterion with its scale and both examples', () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    for (const criterion of craftCriteria) {
      act(() => root.render(<CraftCriterion id={criterion.id} />))
      expect(container.textContent).toContain(criterion.definition.replaceAll('`', ''))
      expect(container.querySelectorAll('dt')).toHaveLength(3)
      expect(container.querySelectorAll('[data-craft-example]')).toHaveLength(2)
    }
    act(() => root.unmount())
  })
})
