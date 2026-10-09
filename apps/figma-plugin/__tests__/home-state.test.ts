import type { TokenTable } from '@atom63/figma'

import { fileStatus } from '../src/app/home-state'
import type { DesignSystemTable } from '../src/messages'

const empty: TokenTable = { collections: [], variables: 0, textStyles: 0, effectStyles: 0 }
const template: TokenTable = {
  collections: [
    { name: 'Base', modes: 1, variables: 300 },
    { name: 'Mode', modes: 2, variables: 87 },
  ],
  variables: 387,
  textStyles: 13,
  effectStyles: 1,
}
const atom63Table: TokenTable = {
  collections: [
    { name: 'Foundation', modes: 1, variables: 674 },
    { name: 'Mode', modes: 2, variables: 74 },
  ],
  variables: 748,
  textStyles: 20,
  effectStyles: 4,
}
const noAtom63: DesignSystemTable = {
  atom63: null,
  template: null,
  blocked: null,
  components: [{ name: 'Button', variants: 0, card: false, setOnPage: false }],
}
const blocked = (collections: string[], variables: number): DesignSystemTable => ({
  ...noAtom63,
  template: { variables, collections },
  blocked: 'This file already holds another token set.',
})
const atom63File: DesignSystemTable = {
  ...noAtom63,
  atom63: {
    variables: 748,
    collections: [
      { name: 'Foundation', variables: 674 },
      { name: 'Mode', variables: 74 },
    ],
  },
}

describe('fileStatus', () => {
  it('offers all three entries, none recommended, in an empty file', () => {
    expect(fileStatus(empty, noAtom63)).toEqual({
      kind: 'empty',
      line: 'This file has no tokens yet.',
      recommended: null,
      entries: ['create', 'import', 'atom63'],
    })
  })

  it('is empty also when the Atom63 scan could not run', () => {
    expect(fileStatus(empty, null).kind).toBe('empty')
  })

  it('recommends importing again for the site template table', () => {
    expect(fileStatus(template, blocked(['Base', 'Mode'], 387))).toEqual({
      kind: 'template',
      line: '387 variables in 2 collections, 13 text styles and 1 effect style.',
      recommended: 'import',
      entries: ['import', 'atom63'],
    })
  })

  it('reads a template table from the table alone when the Atom63 scan could not run', () => {
    expect(fileStatus(template, null).kind).toBe('template')
  })

  it('recommends updating, and offers nothing else, for the Atom63 design system', () => {
    expect(fileStatus(atom63Table, atom63File)).toEqual({
      kind: 'atom63',
      line:
        'This file holds the Atom63 design system: ' +
        '748 variables in 2 collections, 20 text styles and 4 effect styles.',
      recommended: 'atom63',
      entries: ['atom63'],
    })
  })

  it('does not call Atom63 beside another token set Atom63', () => {
    expect(
      fileStatus(
        { ...template, collections: [...template.collections, ...atom63Table.collections] },
        { ...atom63File, template: { variables: 387, collections: ['Base', 'Mode'] } }
      ).kind
    ).toBe('template')
  })

  it('recommends nothing for a token set the site template did not write', () => {
    expect(fileStatus(atom63Table, blocked(['Foundation', 'Mode'], 748))).toEqual({
      kind: 'other',
      line:
        "This file holds a token set the site template didn't write: " +
        '748 variables in 2 collections, 20 text styles and 4 effect styles.',
      recommended: null,
      entries: ['import', 'atom63'],
    })
  })
})
