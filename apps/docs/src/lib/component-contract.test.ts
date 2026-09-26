import { buttonContract, buttonSizes, crossRendererContracts } from '@atom63/ui-foundation'
import { describe, expect, it } from 'vitest'

import { componentCatalogItems } from './component-catalog'
import {
  componentContractMarkdown,
  getComponentContractDoc,
  outcomeLabel,
} from './component-contract'

const contractSources = import.meta.glob<string>(
  '../../../../packages/ui-foundation/src/components/*/*-contract.ts',
  { query: '?raw', import: 'default' }
)
const slugsWithContracts = Object.keys(contractSources).map(
  path => /\/components\/([^/]+)\//.exec(path)?.[1] ?? ''
)

describe('component contract docs', () => {
  it('documents the contract of every catalog family that has one', () => {
    const catalogSlugs = componentCatalogItems.map(item => item.slug)
    const documented = catalogSlugs.filter(slug => getComponentContractDoc(slug) !== null)
    const expected = catalogSlugs.filter(slug => slugsWithContracts.includes(slug))

    expect(documented).toEqual(expected)
    expect(documented.length).toBeGreaterThan(60)
  })

  it('pairs each axis with its default, including values kept as a sibling export', () => {
    const doc = getComponentContractDoc('button')
    const sizes = doc?.axes.find(axis => axis.name === 'sizes')

    expect(sizes?.values).toEqual([...buttonSizes])
    expect(sizes?.default).toBe(buttonContract.defaultSize)
    expect(doc?.axes.map(axis => axis.name)).not.toContain('slots')
    expect(doc?.archetypes.map(archetype => archetype.id)).toEqual([
      ...buttonContract.visualArchetypes,
    ])
  })

  it('adds the shared web and iOS contract for every cross-renderer component', () => {
    for (const shared of crossRendererContracts) {
      const doc = getComponentContractDoc(shared.id)
      expect(doc?.crossRenderer?.swiftUIRenderer, shared.id).toBe(shared.swiftUIRenderer)
      expect(componentContractMarkdown(shared.id)).toContain('### Web and iOS')
    }
    expect(getComponentContractDoc('kbd')?.crossRenderer).toBeUndefined()
  })

  it('renders the contract as Markdown for agents and copy-out', () => {
    const markdown = componentContractMarkdown('button')

    expect(markdown).toContain('## Contract')
    expect(markdown).toMatch(/\| `sizes` \| .*`md`.* \| `md` \|/)
    expect(markdown).toContain('Rendered by `AtomButton` in SwiftUI')
  })

  it('shows the APG pattern a contract binds to, with its options and known gaps', () => {
    const tabs = getComponentContractDoc('tabs')

    expect(tabs?.accessibility).toEqual({
      knownGaps: [],
      name: 'Tabs',
      options: [['activation', 'manual']],
      source: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
    })
    expect(tabs?.axes.map(axis => axis.name)).not.toContain('accessibility')
    expect(componentContractMarkdown('tabs')).toContain(
      '**Accessibility pattern:** [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) (activation: manual)'
    )
    expect(componentContractMarkdown('dialog')).toContain('Known gap (`dialog-is-modal`)')
    expect(getComponentContractDoc('button')?.accessibility).toBeUndefined()
  })

  it('finds contracts whose export keeps an acronym (inputOTPContract)', () => {
    expect(getComponentContractDoc('input-otp')?.exportName).toBe('inputOTPContract')
  })

  it('reads outcome ids as sentences', () => {
    expect(outcomeLabel('focus-is-not-trapped')).toBe('Focus is not trapped')
  })
})
